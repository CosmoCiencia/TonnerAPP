import base64
import binascii
import os
import re
from pathlib import Path
from typing import Any

import cv2
import numpy as np
import runpod
import torch
from segment_anything import SamAutomaticMaskGenerator, sam_model_registry

HEX_COLOR_RE = re.compile(r"^#?[0-9a-fA-F]{6}$")
DEFAULT_CHECKPOINT = "/runpod-volume/sam/sam_vit_b_01ec64.pth"

_MASK_GENERATOR: SamAutomaticMaskGenerator | None = None


def get_mask_generator() -> SamAutomaticMaskGenerator:
    global _MASK_GENERATOR
    if _MASK_GENERATOR is not None:
        return _MASK_GENERATOR

    checkpoint = Path(os.getenv("TONNER_PAINT_SAM_CHECKPOINT", DEFAULT_CHECKPOINT))
    model_type = os.getenv("TONNER_PAINT_SAM_MODEL_TYPE", "vit_b")
    device = "cuda" if torch.cuda.is_available() else "cpu"

    if not checkpoint.exists():
        raise FileNotFoundError(
            f"SAM checkpoint not found at {checkpoint}. "
            "Set TONNER_PAINT_SAM_CHECKPOINT or mount the model in /runpod-volume/sam/."
        )

    sam = sam_model_registry[model_type](checkpoint=str(checkpoint))
    sam.to(device=device)

    _MASK_GENERATOR = SamAutomaticMaskGenerator(
        sam,
        points_per_side=int(os.getenv("TONNER_PAINT_POINTS_PER_SIDE", "16")),
        pred_iou_thresh=float(os.getenv("TONNER_PAINT_PRED_IOU_THRESH", "0.9")),
        stability_score_thresh=float(os.getenv("TONNER_PAINT_STABILITY_SCORE_THRESH", "0.9")),
        min_mask_region_area=int(os.getenv("TONNER_PAINT_MIN_MASK_REGION_AREA", "5000")),
    )
    return _MASK_GENERATOR


def normalize_color(color: str) -> str:
    value = color.strip()
    if not HEX_COLOR_RE.match(value):
        raise ValueError("color must be a hex RGB value, for example #0057B8")
    return value.lstrip("#")


def hex_to_bgr(hex_color: str) -> np.ndarray:
    value = normalize_color(hex_color)
    r = int(value[0:2], 16)
    g = int(value[2:4], 16)
    b = int(value[4:6], 16)
    return np.array([b, g, r], dtype=np.uint8)


def decode_image(input_data: dict[str, Any]) -> np.ndarray:
    image_base64 = input_data.get("image_base64") or input_data.get("image")
    if not isinstance(image_base64, str) or not image_base64.strip():
        raise ValueError("input.image_base64 is required")

    value = image_base64.strip()
    if value.startswith("data:") and "," in value:
        value = value.split(",", 1)[1]

    try:
        image_bytes = base64.b64decode(value, validate=True)
    except binascii.Error as exc:
        raise ValueError("input.image_base64 is not valid base64") from exc

    image = cv2.imdecode(np.frombuffer(image_bytes, dtype=np.uint8), cv2.IMREAD_COLOR)
    if image is None:
        raise ValueError("input.image_base64 could not be decoded as an image")
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
    masks = get_mask_generator().generate(image_rgb)
    if not masks:
        raise RuntimeError("SAM did not generate masks")

    largest = max(masks, key=lambda item: item["area"])
    mask = largest["segmentation"]
    tonner_color = hex_to_bgr(color)
    opacity = max(0.0, min(1.0, float(opacity)))

    result = image.copy()
    for channel in range(3):
        result[:, :, channel] = np.where(
            mask,
            (image[:, :, channel] * (1 - opacity) + tonner_color[channel] * opacity).astype(np.uint8),
            image[:, :, channel],
        )
    return result


def encode_jpeg(image: np.ndarray) -> str:
    ok, encoded = cv2.imencode(".jpg", image, [int(cv2.IMWRITE_JPEG_QUALITY), 92])
    if not ok:
        raise RuntimeError("Could not encode result image")
    return base64.b64encode(encoded.tobytes()).decode("ascii")


def handler(job: dict[str, Any]) -> dict[str, str]:
    input_data = job.get("input") or {}
    image = decode_image(input_data)
    color = str(input_data.get("color", "#0057B8"))
    opacity = float(input_data.get("opacity", 0.6))
    result = paint_image(image, color, opacity)
    return {
        "image_base64": encode_jpeg(result),
        "image_mime_type": "image/jpeg",
    }


runpod.serverless.start({"handler": handler})
