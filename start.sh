#!/usr/bin/env bash
set -e

ROOT="$(cd "$(dirname "$0")" && pwd)"

cleanup() {
  echo ""
  echo "==> Deteniendo Kodo..."
  [ -n "$BACKEND_PID" ] && kill "$BACKEND_PID" 2>/dev/null
  [ -n "$FRONTEND_PID" ] && kill "$FRONTEND_PID" 2>/dev/null
  exit 0
}
trap cleanup INT TERM

echo "==> Iniciando backend..."
cd "$ROOT/backend"
source venv/bin/activate
python server.py &
BACKEND_PID=$!

echo "==> Iniciando frontend..."
cd "$ROOT/frontend"
npx vite --host 127.0.0.1 &
FRONTEND_PID=$!

sleep 2
xdg-open http://localhost:5173 2>/dev/null || true

echo ""
echo "  Kodo corriendo en http://localhost:5173"
echo "  Presiona Ctrl+C para detener."

wait
