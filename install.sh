#!/usr/bin/env bash
set -e

echo "==> Instalando backend..."
cd "$(dirname "$0")/backend"
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

echo ""
echo "==> Instalando frontend..."
cd ../frontend
npm install

echo ""
echo "==> Todo listo. Ejecuta ./start.sh para iniciar Kodo."
