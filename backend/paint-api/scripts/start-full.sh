#!/usr/bin/env bash
set -euo pipefail

APP_DIR="$(cd "$(dirname "$0")/../../.." && pwd)"
API_DIR="$APP_DIR/backend/paint-api"

cleanup() {
  if [[ -n "${API_PID:-}" ]]; then
    kill "$API_PID" 2>/dev/null || true
  fi
  if [[ -n "${WEB_PID:-}" ]]; then
    kill "$WEB_PID" 2>/dev/null || true
  fi
}

trap cleanup EXIT INT TERM

cd "$API_DIR"

if [[ -d ".venv" ]]; then
  # shellcheck disable=SC1091
  source .venv/bin/activate
fi

uvicorn server.api:app --host "${TONNER_PAINT_HOST:-127.0.0.1}" --port "${TONNER_PAINT_PORT:-8000}" &
API_PID=$!

cd "$APP_DIR"
npm run dev &
WEB_PID=$!

wait "$API_PID" "$WEB_PID"
