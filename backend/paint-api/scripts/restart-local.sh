#!/usr/bin/env bash
set -Eeuo pipefail

APP_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../../.." && pwd)"
API_DIR="$APP_DIR/backend/paint-api"
STATE_DIR="${XDG_STATE_HOME:-$HOME/.local/state}/tonner-paint"
PORT="${TONNER_PAINT_PORT:-8000}"

mkdir -p "$STATE_DIR"

log() {
  printf '[tonner-paint] %s\n' "$*"
}

log "Cerrando backend TonnerPaint anterior..."
mapfile -t BACKEND_PIDS < <(pgrep -f '[u]vicorn server\.api:app.*--port 8000' || true)
if ((${#BACKEND_PIDS[@]})); then
  kill "${BACKEND_PIDS[@]}" 2>/dev/null || true
fi

log "Cerrando ngrok anterior del puerto $PORT..."
mapfile -t NGROK_PIDS < <(pgrep -f '[n]grok.*http 8000' || true)
if ((${#NGROK_PIDS[@]})); then
  kill "${NGROK_PIDS[@]}" 2>/dev/null || true
fi

for _ in {1..20}; do
  if ! ss -ltn "sport = :$PORT" 2>/dev/null | grep -q LISTEN; then
    break
  fi
  sleep 1
done

if ss -ltn "sport = :$PORT" 2>/dev/null | grep -q LISTEN; then
  log "ERROR: el puerto $PORT sigue ocupado. Revisa: ss -ltnp 'sport = :$PORT'"
  exit 1
fi

[[ -x "$API_DIR/.venv/bin/python" ]] || {
  log "ERROR: no existe el entorno Python en $API_DIR/.venv"
  exit 1
}

log "Encendiendo backend con GPU..."
cd "$API_DIR"
setsid -f "$API_DIR/.venv/bin/python" -m uvicorn server.api:app \
  --host 127.0.0.1 \
  --port "$PORT" \
  >"$STATE_DIR/backend.log" 2>&1 < /dev/null

for _ in {1..60}; do
  if curl -fsS --max-time 2 "http://127.0.0.1:$PORT/health" >/dev/null 2>&1; then
    break
  fi
  sleep 1
done

curl -fsS --max-time 5 "http://127.0.0.1:$PORT/health" >/dev/null || {
  log "ERROR: el backend no respondió. Revisa $STATE_DIR/backend.log"
  exit 1
}

NGROK_BIN="$(command -v ngrok || true)"
[[ -n "$NGROK_BIN" ]] || NGROK_BIN=/snap/bin/ngrok
[[ -x "$NGROK_BIN" ]] || {
  log "ERROR: no se encontró ngrok"
  exit 1
}

log "Encendiendo ngrok..."
setsid -f "$NGROK_BIN" http "$PORT" >"$STATE_DIR/ngrok.log" 2>&1 < /dev/null

PUBLIC_URL=""
for _ in {1..30}; do
  PUBLIC_URL="$(curl -fsS --max-time 2 http://127.0.0.1:4040/api/tunnels 2>/dev/null \
    | sed -n 's/.*"public_url":"\([^"]*\)".*/\1/p' | head -n 1 || true)"
  [[ -n "$PUBLIC_URL" ]] && break
  sleep 1
done

[[ -n "$PUBLIC_URL" ]] || {
  log "ERROR: ngrok no respondió. Revisa $STATE_DIR/ngrok.log"
  exit 1
}

log "Backend listo: http://127.0.0.1:$PORT"
log "URL pública: $PUBLIC_URL"
log "Logs: $STATE_DIR/backend.log y $STATE_DIR/ngrok.log"
