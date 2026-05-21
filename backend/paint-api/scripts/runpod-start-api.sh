#!/usr/bin/env bash
set -Eeuo pipefail

API_DIR="${TONNER_PAINT_API_DIR:-/workspace/backend/paint-api}"
VENV_DIR="$API_DIR/.venv"
REQUIREMENTS_FILE="$API_DIR/requirements.txt"
CHECKPOINT="${TONNER_PAINT_SAM_CHECKPOINT:-/workspace/sam_vit_b_01ec64.pth}"
MODEL_TYPE="${TONNER_PAINT_SAM_MODEL_TYPE:-vit_b}"
HOST="${TONNER_PAINT_HOST:-0.0.0.0}"
PORT="${TONNER_PAINT_PORT:-8000}"

log() {
  printf '[tonner-paint] %s\n' "$*"
}

fail() {
  printf '[tonner-paint] ERROR: %s\n' "$*" >&2
  exit 1
}

hash_file() {
  if command -v sha256sum >/dev/null 2>&1; then
    sha256sum "$1" | awk '{print $1}'
  else
    python3 - "$1" <<'PY'
import hashlib
import pathlib
import sys

print(hashlib.sha256(pathlib.Path(sys.argv[1]).read_bytes()).hexdigest())
PY
  fi
}

cd "$API_DIR" || fail "No existe $API_DIR. Monta/copía el backend en /workspace/backend/paint-api."

[[ -f "$REQUIREMENTS_FILE" ]] || fail "No existe $REQUIREMENTS_FILE."
[[ -f "$CHECKPOINT" ]] || fail "No existe el checkpoint SAM en $CHECKPOINT."
command -v python3 >/dev/null 2>&1 || fail "python3 no está instalado."

if [[ ! -d "$VENV_DIR" ]]; then
  log "Creando entorno virtual en $VENV_DIR"
  python3 -m venv --system-site-packages "$VENV_DIR"
fi

# shellcheck disable=SC1091
source "$VENV_DIR/bin/activate"

REQ_HASH="$(hash_file "$REQUIREMENTS_FILE")"
REQ_MARKER="$VENV_DIR/.tonner_requirements.sha256"
NEEDS_INSTALL=0

if [[ ! -f "$REQ_MARKER" ]] || [[ "$(cat "$REQ_MARKER")" != "$REQ_HASH" ]]; then
  NEEDS_INSTALL=1
fi

if ! python - <<'PY' >/dev/null 2>&1
import cv2
import fastapi
import numpy
import torch
import uvicorn
from dotenv import load_dotenv
from multipart import MultipartParser
from segment_anything import SamAutomaticMaskGenerator, sam_model_registry

assert SamAutomaticMaskGenerator
assert sam_model_registry
assert load_dotenv
assert MultipartParser
assert torch.cuda.is_available()
PY
then
  NEEDS_INSTALL=1
fi

if [[ "$NEEDS_INSTALL" == "1" ]]; then
  log "Instalando/verificando dependencias"
  python -m pip install --upgrade pip setuptools wheel
  python -m pip install -r "$REQUIREMENTS_FILE"
  printf '%s\n' "$REQ_HASH" > "$REQ_MARKER"
else
  log "Dependencias listas; no se reinstala"
fi

export TONNER_PAINT_SAM_CHECKPOINT="$CHECKPOINT"
export TONNER_PAINT_SAM_MODEL_TYPE="$MODEL_TYPE"
export TONNER_PAINT_HOST="$HOST"
export TONNER_PAINT_PORT="$PORT"

python - <<'PY'
import os
import torch
from segment_anything import SamAutomaticMaskGenerator, sam_model_registry

checkpoint = os.environ["TONNER_PAINT_SAM_CHECKPOINT"]
if not os.path.exists(checkpoint):
    raise SystemExit(f"Checkpoint no encontrado: {checkpoint}")
if not torch.cuda.is_available():
    raise SystemExit("CUDA no está disponible; no se arranca TonnerPaint en CPU.")
print(f"[tonner-paint] GPU: {torch.cuda.get_device_name(0)}")
print(f"[tonner-paint] SAM listo: {SamAutomaticMaskGenerator.__name__}, registry={bool(sam_model_registry)}")
PY

log "Checkpoint: $TONNER_PAINT_SAM_CHECKPOINT"
log "Modelo: $TONNER_PAINT_SAM_MODEL_TYPE"
log "Arrancando FastAPI en $HOST:$PORT"

exec python -m uvicorn server.api:app --host "$HOST" --port "$PORT"
