#!/usr/bin/env bash
set -euo pipefail

echo "==> Building frontend…"
cd "$(dirname "$0")/frontend"
npm run build

echo "==> Building desktop executable…"
case "$(uname -s)" in
  Linux*)  npm run electron:build:linux ;;
  CYGWIN*|MINGW*|MSYS*) npm run electron:build:win ;;
esac

echo ""
echo "Output in: frontend/dist-electron/"
