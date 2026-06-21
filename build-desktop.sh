#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")" && pwd)"

echo "==> Compiling backend…"
cd "$ROOT/backend"
source venv/bin/activate
rm -rf dist build
pyinstaller --onedir --name kodo-backend \
  --add-data "routes:routes" \
  --hidden-import flask --hidden-import requests \
  --hidden-import _socket --hidden-import array \
  --hidden-import _ssl --hidden-import multiprocessing \
  server.py 2>&1 | tail -3

echo "==> Building frontend…"
cd "$ROOT/frontend"
npm run build

echo "==> Building desktop executable…"
case "$(uname -s)" in
  Linux*)  npm run electron:build:linux ;;
  CYGWIN*|MINGW*|MSYS*) npm run electron:build:win ;;
esac

echo ""
echo "Output in: frontend/dist-electron/"
