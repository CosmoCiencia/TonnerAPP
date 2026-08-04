#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

if [[ -x ".venv/bin/python" ]]; then
  exec .venv/bin/python -m uvicorn server.api:app \
    --host "${TONNER_PAINT_HOST:-127.0.0.1}" \
    --port "${TONNER_PAINT_PORT:-8000}"
fi

exec uvicorn server.api:app \
  --host "${TONNER_PAINT_HOST:-127.0.0.1}" \
  --port "${TONNER_PAINT_PORT:-8000}"
