import os
import re
from pathlib import Path

import cv2
import numpy as np
import torch
from fastapi import FastAPI, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, Response
from segment_anything import SamAutomaticMaskGenerator, sam_model_registry

try:
    from dotenv import load_dotenv
except ImportError:  # pragma: no cover - useful before npm run setup:api
    load_dotenv = None

BASE_DIR = Path(__file__).resolve().parents[1]
APP_DIR = Path(__file__).resolve().parents[3]
HEX_COLOR_RE = re.compile(r"^#?[0-9a-fA-F]{6}$")
CHECKPOINT_FALLBACKS = (
    "/workspace/sam_vit_b_01ec64.pth",
    "/workspace/sam/sam_vit_b_01ec64.pth",
    "/runpod-volume/sam/sam_vit_b_01ec64.pth",
    str(BASE_DIR / "core" / "sam" / "sam_vit_b_01ec64.pth"),
)
DEFAULT_CORS_ORIGINS = (
    "http://localhost:5173",
    "http://localhost:5192",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:5192",
    "https://tonner-app.vercel.app",
)

if load_dotenv:
    load_dotenv(APP_DIR / ".env")
    load_dotenv(BASE_DIR / ".env", override=True)


def resolve_checkpoint() -> Path:
    configured_checkpoint = os.getenv("TONNER_PAINT_SAM_CHECKPOINT", "").strip()
    candidates = (configured_checkpoint, *CHECKPOINT_FALLBACKS) if configured_checkpoint else CHECKPOINT_FALLBACKS

    for candidate in candidates:
        checkpoint = Path(candidate)
        if checkpoint.exists():
            return checkpoint

    raise FileNotFoundError(
        "SAM checkpoint not found. Tried: "
        f"{', '.join(str(Path(candidate)) for candidate in candidates)}. "
        "Set TONNER_PAINT_SAM_CHECKPOINT to sam_vit_b_01ec64.pth."
    )


def load_mask_generator() -> tuple[SamAutomaticMaskGenerator, str, Path, str]:
    checkpoint = resolve_checkpoint()
    model_type = os.getenv("TONNER_PAINT_SAM_MODEL_TYPE", "vit_b")
    device = "cuda" if torch.cuda.is_available() else "cpu"

    sam = sam_model_registry[model_type](checkpoint=str(checkpoint))
    sam.to(device=device)

    generator = SamAutomaticMaskGenerator(
        sam,
        points_per_side=int(os.getenv("TONNER_PAINT_POINTS_PER_SIDE", "16")),
        pred_iou_thresh=float(os.getenv("TONNER_PAINT_PRED_IOU_THRESH", "0.9")),
        stability_score_thresh=float(os.getenv("TONNER_PAINT_STABILITY_SCORE_THRESH", "0.9")),
        min_mask_region_area=int(os.getenv("TONNER_PAINT_MIN_MASK_REGION_AREA", "5000")),
    )

    return generator, model_type, checkpoint, device


MASK_GENERATOR, SAM_MODEL_TYPE, SAM_CHECKPOINT, DEVICE = load_mask_generator()

app = FastAPI(title="Tonner Paint API")

cors_origins = [
    origin.strip()
    for origin in os.getenv("TONNER_PAINT_CORS_ORIGINS", ",".join(DEFAULT_CORS_ORIGINS)).split(",")
    if origin.strip()
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def normalize_color(color: str) -> str:
    value = color.strip()
    if not HEX_COLOR_RE.match(value):
        raise HTTPException(status_code=400, detail="color debe ser hexadecimal RGB, por ejemplo #0057B8")
    return value.lstrip("#")


def hex_to_bgr(hex_color: str) -> np.ndarray:
    value = normalize_color(hex_color)
    r = int(value[0:2], 16)
    g = int(value[2:4], 16)
    b = int(value[4:6], 16)
    return np.array([b, g, r], dtype=np.uint8)


def normalize_opacity(opacity: float) -> float:
    try:
        return max(0.0, min(1.0, float(opacity)))
    except (TypeError, ValueError) as exc:
        raise HTTPException(status_code=400, detail="opacity debe ser un numero entre 0 y 1") from exc


def decode_image(image_bytes: bytes) -> np.ndarray:
    image = cv2.imdecode(np.frombuffer(image_bytes, dtype=np.uint8), cv2.IMREAD_COLOR)
    if image is None:
        raise HTTPException(status_code=400, detail="No se pudo decodificar la imagen")
    return image


def resize_image_if_needed(image: np.ndarray) -> np.ndarray:
    max_side = int(os.getenv("TONNER_PAINT_MAX_SIDE", "1024"))
    h, w = image.shape[:2]
    if max(h, w) <= max_side:
        return image

    scale = max_side / float(max(h, w))
    return cv2.resize(image, (int(w * scale), int(h * scale)), interpolation=cv2.INTER_AREA)


def paint_image(image: np.ndarray, color: str, opacity: float) -> np.ndarray:
    image = resize_image_if_needed(image)
    image_rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)

    with torch.no_grad():
        masks = MASK_GENERATOR.generate(image_rgb)

    if not masks:
        raise RuntimeError("SAM no genero mascaras")

    largest = max(masks, key=lambda item: item["area"])
    mask = largest["segmentation"]
    tonner_color = hex_to_bgr(color)
    opacity = normalize_opacity(opacity)

    result = image.copy()
    for channel in range(3):
        result[:, :, channel] = np.where(
            mask,
            (image[:, :, channel] * (1 - opacity) + tonner_color[channel] * opacity).astype(np.uint8),
            image[:, :, channel],
        )

    return result


def encode_jpeg(image: np.ndarray) -> bytes:
    ok, encoded = cv2.imencode(".jpg", image, [int(cv2.IMWRITE_JPEG_QUALITY), 92])
    if not ok:
        raise RuntimeError("No se pudo codificar la imagen final")
    return encoded.tobytes()


@app.get("/health")
def health():
    return {
        "ok": True,
        "mode": "local_sam",
        "sam_loaded": True,
        "model_type": SAM_MODEL_TYPE,
        "checkpoint": str(SAM_CHECKPOINT),
        "device": DEVICE,
        "cuda_available": torch.cuda.is_available(),
        "gpu": torch.cuda.get_device_name(0) if torch.cuda.is_available() else None,
    }


@app.post("/paint")
async def paint(
    image: UploadFile,
    color: str = Form(...),
    opacity: float = Form(0.6),
):
    try:
        image_bytes = await image.read()
        if not image_bytes:
            raise HTTPException(status_code=400, detail="La imagen esta vacia")

        decoded_image = decode_image(image_bytes)
        result = paint_image(decoded_image, color, opacity)
        output_bytes = encode_jpeg(result)

        return Response(
            content=output_bytes,
            media_type="image/jpeg",
            headers={"Content-Disposition": 'inline; filename="resultado.jpg"'},
        )
    except HTTPException:
        raise
    except Exception as exc:
        print("Tonner Paint error:", exc)
        return JSONResponse(status_code=500, content={"error": str(exc)})
