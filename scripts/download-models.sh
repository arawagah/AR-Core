#!/usr/bin/env bash
# Downloads MediaPipe model and WASM files for self-hosting.
# Run this script once during project setup.
# Self-hosting avoids Safari CDN CORS issues.

set -e

MODELS_DIR="$(dirname "$0")/../public/models"
MEDIAPIPE_DIR="$MODELS_DIR/mediapipe"

mkdir -p "$MODELS_DIR"
mkdir -p "$MEDIAPIPE_DIR"

echo "📦 Downloading MediaPipe Pose Landmarker lite model..."
curl -L -o "$MODELS_DIR/pose_landmarker_lite.task" \
  "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/latest/pose_landmarker_lite.task"

echo "✅ Model downloaded: $(du -sh "$MODELS_DIR/pose_landmarker_lite.task" | cut -f1)"

echo "📦 Copying MediaPipe WASM files from node_modules..."
WASM_SRC="node_modules/@mediapipe/tasks-vision/wasm"

if [ -d "$WASM_SRC" ]; then
  cp "$WASM_SRC"/* "$MEDIAPIPE_DIR/"
  echo "✅ WASM files copied: $(ls "$MEDIAPIPE_DIR" | wc -l) files"
else
  echo "⚠️  WASM source not found at $WASM_SRC"
  echo "   Run 'npm install' first, then re-run this script."
  exit 1
fi

echo ""
echo "✅ MediaPipe files ready in public/models/"
echo "   Files: $(ls public/models/ && ls public/models/mediapipe/)"
