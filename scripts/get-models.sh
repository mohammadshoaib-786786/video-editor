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
# Mandarin voices (voice.lang "zh"): misaki's Chinese G2P + jieba. jieba ships only
# as an old setup.py sdist (build it isolated), and misaki caps Python below 3.13
# for its English extras, which the Chinese part doesn't use.
python3 -m pip install -q --use-pep517 jieba==0.42.1
python3 -m pip install -q --ignore-requires-python "misaki[zh]==0.9.4"
echo "models ready in .cache/models"
