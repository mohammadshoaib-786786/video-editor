#!/usr/bin/env python3
"""Pronunciation check: transcribe a project's voice.wav scene by scene with
SenseVoice (local, zh/en/yue) and print the character error rate against the
script. Homophones (他/它, 事/试) and accented English names count as errors,
so read the "heard" lines, not just the number.

  python3 scripts/asr-check.py projects/geoneo-engines-zh [voice.wav]

One-time setup (optional; ~240 MB model, from the sherpa-onnx GitHub releases):
  pip install sherpa-onnx
  mkdir -p .cache/asr && cd .cache/asr && curl -L https://github.com/k2-fsa/sherpa-onnx/releases/download/asr-models/sherpa-onnx-sense-voice-zh-en-ja-ko-yue-2024-07-17.tar.bz2 | tar xj
"""
import json
import re
import sys
from pathlib import Path

import numpy as np
import sherpa_onnx
import soundfile as sf

ROOT = Path(__file__).resolve().parent.parent
M = ROOT / ".cache/asr/sherpa-onnx-sense-voice-zh-en-ja-ko-yue-2024-07-17"
proj = Path(sys.argv[1])
wav = Path(sys.argv[2]) if len(sys.argv) > 2 else proj / "build/voice.wav"
rec = sherpa_onnx.OfflineRecognizer.from_sense_voice(model=str(M / "model.int8.onnx"), tokens=str(M / "tokens.txt"), language="zh", use_itn=True, num_threads=4)
audio, sr = sf.read(str(wav), dtype="float32")
timing = json.loads((proj / "build/timing.json").read_text())


def norm(s):
    return re.sub(r"[^\w]", "", s).lower()


def cer(ref, hyp):
    r, h = list(ref), list(hyp)
    d = np.arange(len(h) + 1)
    for i, rc in enumerate(r, 1):
        prev, d[0] = d.copy(), i
        for j, hc in enumerate(h, 1):
            d[j] = min(prev[j] + 1, d[j - 1] + 1, prev[j - 1] + (rc != hc))
    return d[len(h)] / max(1, len(r))


total_e = total_n = 0
for sc in timing["scenes"]:
    a = int(max(0, sc["voiceStart"] - 0.1) * sr)
    b = int((sc["voiceEnd"] + 0.25) * sr)
    st = rec.create_stream()
    st.accept_waveform(sr, audio[a:b])
    rec.decode_stream(st)
    hyp = st.result.text
    ref = "".join(l["text"] for l in sc["lines"])
    e = cer(norm(ref), norm(hyp))
    total_e += e * len(norm(ref))
    total_n += len(norm(ref))
    print(f"{sc['id']:<10} CER {e:5.1%}\n  script: {ref}\n  heard : {hyp}")
print(f"overall CER {total_e / total_n:.1%}")
