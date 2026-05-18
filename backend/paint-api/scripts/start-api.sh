#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

if [[ -d ".venv" ]]; then
  # shellcheck disable=SC1091
  source .venv/bin/activate
fi

uvicorn server.api:app --host "${TONNER_PAINT_HOST:-127.0.0.1}" --port "${TONNER_PAINT_PORT:-8000}"
