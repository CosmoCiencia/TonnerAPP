import base64
import binascii
import os
import re
from pathlib import Path
from typing import Any

import requests
from fastapi import FastAPI, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, Response

try:
    from dotenv import load_dotenv
except ImportError:  # pragma: no cover - useful before npm run setup:api
    load_dotenv = None

BASE_DIR = Path(__file__).resolve().parents[1]
APP_DIR = Path(__file__).resolve().parents[3]

if load_dotenv:
    load_dotenv(APP_DIR / ".env")
    load_dotenv(BASE_DIR / ".env", override=True)

app = FastAPI(title="Tonner Paint API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

HEX_COLOR_RE = re.compile(r"^#?[0-9a-fA-F]{6}$")
DEFAULT_RUNPOD_BASE_URL = "https://api.runpod.ai/v2"
IMAGE_KEYS = (
    "image",
    "image_base64",
    "result",
    "result_image",
    "output",
    "file",
    "url",
    "image_url",
    "output_url",
)


def runpod_config() -> dict[str, str | int | float | bool]:
    api_key = os.getenv("RUNPOD_API_KEY", "").strip()
    endpoint_id = os.getenv("RUNPOD_ENDPOINT_ID", "").strip()
    endpoint_url = os.getenv("RUNPOD_ENDPOINT_URL", "").strip()
    operation = os.getenv("RUNPOD_OPERATION", "runsync").strip().strip("/")
    timeout = float(os.getenv("RUNPOD_TIMEOUT_SECONDS", "180"))
    wait_ms = int(os.getenv("RUNPOD_WAIT_MS", "120000"))

    configured = bool(api_key and (endpoint_id or endpoint_url))
    return {
        "api_key": api_key,
        "endpoint_id": endpoint_id,
        "endpoint_url": endpoint_url,
        "operation": operation,
        "timeout": timeout,
        "wait_ms": wait_ms,
        "configured": configured,
    }


def build_runpod_url(config: dict[str, str | int | float | bool]) -> str:
    endpoint_url = str(config["endpoint_url"])
    if endpoint_url:
        return endpoint_url

    endpoint_id = str(config["endpoint_id"])
    operation = str(config["operation"])
    base_url = os.getenv("RUNPOD_BASE_URL", DEFAULT_RUNPOD_BASE_URL).rstrip("/")
    return f"{base_url}/{endpoint_id}/{operation}"


def authorization_header(api_key: str) -> str:
    if api_key.lower().startswith("bearer "):
        return api_key
    return f"Bearer {api_key}"


def normalize_color(color: str) -> str:
    value = color.strip()
    if not HEX_COLOR_RE.match(value):
        raise HTTPException(status_code=400, detail="color debe ser hexadecimal RGB, por ejemplo #0057B8")
    return value if value.startswith("#") else f"#{value}"


def normalize_opacity(opacity: float) -> float:
    try:
        return max(0.0, min(1.0, float(opacity)))
    except (TypeError, ValueError) as exc:
        raise HTTPException(status_code=400, detail="opacity debe ser un numero entre 0 y 1") from exc


def decode_data_uri(value: str) -> tuple[bytes, str] | None:
    if not value.startswith("data:") or "," not in value:
        return None

    header, encoded = value.split(",", 1)
    media_type = header[5:].split(";")[0] or "image/jpeg"
    try:
        return base64.b64decode(encoded, validate=True), media_type
    except binascii.Error as exc:
        raise RuntimeError("RunPod devolvio un data URI invalido") from exc


def decode_base64_image(value: str) -> bytes | None:
    try:
        return base64.b64decode(value, validate=True)
    except binascii.Error:
        return None


def fetch_image_url(url: str, timeout: float) -> tuple[bytes, str]:
    try:
        response = requests.get(url, timeout=timeout)
        response.raise_for_status()
    except requests.RequestException as exc:
        raise RuntimeError(f"No se pudo descargar la imagen devuelta por RunPod: {exc}") from exc

    media_type = response.headers.get("content-type", "image/jpeg").split(";")[0]
    return response.content, media_type


def extract_image(output: Any, timeout: float) -> tuple[bytes, str]:
    if isinstance(output, dict):
        for key in IMAGE_KEYS:
            if key in output and output[key]:
                return extract_image(output[key], timeout)
        raise RuntimeError("RunPod no devolvio imagen en output")

    if isinstance(output, list) and output:
        return extract_image(output[0], timeout)

    if not isinstance(output, str):
        raise RuntimeError("RunPod devolvio un formato de imagen no soportado")

    value = output.strip()
    data_uri = decode_data_uri(value)
    if data_uri:
        return data_uri

    if value.startswith(("http://", "https://")):
        return fetch_image_url(value, timeout)

    decoded = decode_base64_image(value)
    if decoded:
        return decoded, "image/jpeg"

    raise RuntimeError("RunPod devolvio una cadena que no es base64 ni URL")


@app.get("/health")
def health():
    config = runpod_config()
    return {
        "ok": True,
        "mode": "runpod_proxy",
        "runpod_configured": config["configured"],
        "operation": config["operation"],
        "endpoint_id": bool(config["endpoint_id"]),
        "endpoint_url": bool(config["endpoint_url"]),
    }


@app.post("/paint")
async def paint(
    image: UploadFile,
    color: str = Form(...),
    opacity: float = Form(0.6),
):
    config = runpod_config()
    if not config["configured"]:
        raise HTTPException(
            status_code=503,
            detail="Configura RUNPOD_API_KEY y RUNPOD_ENDPOINT_ID, o RUNPOD_ENDPOINT_URL.",
        )

    image_bytes = await image.read()
    if not image_bytes:
        raise HTTPException(status_code=400, detail="La imagen esta vacia")

    payload = {
        "input": {
            "image_base64": base64.b64encode(image_bytes).decode("ascii"),
            "image_mime_type": image.content_type or "image/jpeg",
            "filename": image.filename or "input.jpg",
            "color": normalize_color(color),
            "opacity": normalize_opacity(opacity),
        }
    }

    try:
        response = requests.post(
            build_runpod_url(config),
            headers={
                "Authorization": authorization_header(str(config["api_key"])),
                "Content-Type": "application/json",
                "Accept": "application/json",
            },
            params={"wait": int(config["wait_ms"])},
            json=payload,
            timeout=float(config["timeout"]),
        )
        response.raise_for_status()
        result = response.json()
    except requests.RequestException as exc:
        return JSONResponse(status_code=502, content={"error": f"RunPod no respondio correctamente: {exc}"})
    except ValueError as exc:
        return JSONResponse(status_code=502, content={"error": f"RunPod no devolvio JSON valido: {exc}"})

    status = result.get("status") if isinstance(result, dict) else None
    if status in {"FAILED", "CANCELLED", "TIMED_OUT"}:
        return JSONResponse(status_code=502, content={"error": "RunPod fallo el job", "runpod": result})
    if status and status != "COMPLETED":
        return JSONResponse(status_code=202, content={"error": "RunPod aun no completo el job", "runpod": result})

    output = result.get("output", result) if isinstance(result, dict) else result
    try:
        output_bytes, media_type = extract_image(output, float(config["timeout"]))
    except RuntimeError as exc:
        return JSONResponse(status_code=502, content={"error": str(exc), "runpod": result})

    return Response(
        content=output_bytes,
        media_type=media_type,
        headers={"Content-Disposition": 'inline; filename="resultado.jpg"'},
    )
