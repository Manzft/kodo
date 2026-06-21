#!/usr/bin/env bash
set -euo pipefail

export ANDROID_HOME="${ANDROID_HOME:-$HOME/Android/Sdk}"

ROOT="$(cd "$(dirname "$0")" && pwd)"
FRONTEND="$ROOT/frontend"
BACKEND="$ROOT/backend"
PYTHON_DIR="$FRONTEND/android/app/src/main/python"

echo "==> Building frontend…"
cd "$FRONTEND"
npm run build

echo "==> Copying frontend dist → android python/static/"
rm -rf "$PYTHON_DIR/static"
cp -r "$FRONTEND/dist" "$PYTHON_DIR/static"

echo "==> Copying backend → android python/backend/"
rm -rf "$PYTHON_DIR/backend"
mkdir -p "$PYTHON_DIR/backend/routes"
cp "$BACKEND/server.py" "$PYTHON_DIR/backend/server.py"
cp "$BACKEND/storage.py" "$PYTHON_DIR/backend/storage.py"
for f in "$BACKEND"/routes/*.py; do
    cp "$f" "$PYTHON_DIR/backend/routes/"
done
# Ensure __init__.py files exist
touch "$PYTHON_DIR/backend/__init__.py"
touch "$PYTHON_DIR/backend/routes/__init__.py"

echo "==> Building APK…"
cd "$FRONTEND/android"
./gradlew assembleDebug

echo ""
echo "APK generated at:"
echo "  $FRONTEND/android/app/build/outputs/apk/debug/app-debug.apk"
