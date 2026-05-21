#!/usr/bin/env bash
set -Eeuo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
SOURCE="$SCRIPT_DIR/runpod-start-api.sh"
TARGET="/workspace/start-api.sh"

[[ -f "$SOURCE" ]] || {
  echo "No existe $SOURCE" >&2
  exit 1
}

cp "$SOURCE" "$TARGET"
chmod +x "$TARGET"

echo "Instalado $TARGET"
