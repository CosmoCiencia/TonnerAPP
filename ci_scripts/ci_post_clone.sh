#!/bin/bash
set -euo pipefail

APP_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$APP_DIR"

command -v node >/dev/null 2>&1 || {
  echo "Node.js no está disponible en Xcode Cloud. Instálalo en la configuración del workflow."
  exit 1
}

command -v npm >/dev/null 2>&1 || {
  echo "npm no está disponible en Xcode Cloud. Instala Node.js en la configuración del workflow."
  exit 1
}

npm ci
npm run cap:sync:ios
