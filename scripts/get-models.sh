#!/usr/bin/env bash
# Downloads the Kokoro TTS model (with duration output, needed for word timings)
# and its voice pack into .cache/models, and installs the Python deps.
set -euo pipefail
cd "$(dirname "$0")/.."
mkdir -p .cache/models
base=https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.1
[ -f .cache/models/kokoro.onnx ] || curl -fL -o .cache/models/kokoro.onnx "$base/kokoro-v1.0.onnx"
[ -f .cache/models/voices-v1.0.bin ] || curl -fL -o .cache/models/voices-v1.0.bin \
  https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0/voices-v1.0.bin
python3 -m pip install -q -r requirements.txt
echo "models ready in .cache/models"
