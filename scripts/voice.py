#!/usr/bin/env python3
"""Voiceover + word timings for a project.

Reads projects/<name>/script.json, speaks every scene with Kokoro (local ONNX
TTS), and writes:

  build/voice.wav     the narration, 24 kHz mono
  build/timing.json   scene / line / word timestamps in seconds
  build/timing.js     the same data as `window.TIMING` for the composition

It also stamps the total length into index.html (root and soundtrack
`data-duration`), because HyperFrames reads the render length from static HTML.

  python3 scripts/voice.py projects/ai-delivery-team [--voice am_puck] [--speed 1.1]

Bring your own recording instead: put it at build/voice.wav and run with
--from-wav; scenes are then laid out from the script with estimated timings.
"""

from __future__ import annotations

import argparse
import json
import re
import sys
from pathlib import Path

import numpy as np
import soundfile as sf

ROOT = Path(__file__).resolve().parent.parent
MODELS = ROOT / ".cache" / "models"
SR = 24000


def load_kokoro():
    try:
        from kokoro_onnx import Kokoro
    except ImportError:
        sys.exit("kokoro-onnx is not installed: pip install kokoro-onnx soundfile")
    model = MODELS / "kokoro.onnx"
    voices = MODELS / "voices-v1.0.bin"
    if not model.exists() or not voices.exists():
        sys.exit(
            "Kokoro model files are missing. Run: bash scripts/get-models.sh\n"
            f"(expected {model} and {voices})"
        )
    return Kokoro(str(model), str(voices))


STRESS = set("ˈˌːˑ↓↗→↘")  # stress and length marks, plus Mandarin tone arrows
PUNCT = set(",.!?;:—…\"'")


def words_from_timings(timings, text_words, phonemize=None):
    """Pair phoneme timings with the script's words.

    espeak sometimes fuses words ("from the" → fɹʌmðə), so instead of trusting
    spaces we phonemize every word on its own and align that sequence to the
    timed one; each word then spans the timed phonemes matched to it."""
    if phonemize:
        aligned = align_words(timings, text_words, phonemize)
        if aligned:
            return aligned
    groups = []
    cur = None
    for t in timings:
        if t.phoneme == " ":
            if cur:
                groups.append(cur)
            cur = None
            continue
        is_punct = t.phoneme in ",.!?;:—…\"'"
        if cur is None:
            if is_punct:
                continue
            cur = {"s": t.start, "e": t.end}
        elif not is_punct:
            cur["e"] = t.end
    if cur:
        groups.append(cur)

    if len(groups) == len(text_words):
        return [{"w": w, "s": g["s"], "e": g["e"]} for w, g in zip(text_words, groups)]

    # proportional fallback over the spoken span
    start = groups[0]["s"] if groups else 0.0
    end = groups[-1]["e"] if groups else 0.0
    weights = [max(1, len(re.sub(r"\W", "", w))) for w in text_words]
    total = sum(weights)
    out, t = [], start
    for w, wt in zip(text_words, weights):
        d = (end - start) * wt / total
        out.append({"w": w, "s": t, "e": t + d})
        t += d
    print(f"  ! word count mismatch ({len(groups)} spoken vs {len(text_words)} written), used proportional timing")
    return out


def align_words(timings, text_words, phonemize):
    from difflib import SequenceMatcher

    spoken = [t for t in timings if t.phoneme not in STRESS and t.phoneme not in PUNCT and t.phoneme != " "]
    expected, owner = [], []
    for wi, w in enumerate(text_words):
        clean = re.sub(r"[^\w'’-]", "", w)
        ph = phonemize(clean) if clean else ""
        for ch in ph:
            if ch in STRESS or ch in PUNCT or ch == " ":
                continue
            expected.append(ch)
            owner.append(wi)
    if not spoken or not expected:
        return None
    sm = SequenceMatcher(None, [t.phoneme for t in spoken], expected, autojunk=False)
    span = [None] * len(text_words)
    for a, b, n in sm.get_matching_blocks():
        for k in range(n):
            t = spoken[a + k]
            wi = owner[b + k]
            s, e = span[wi] or (t.start, t.end)
            span[wi] = (min(s, t.start), max(e, t.end))
    if sum(1 for s in span if s) < len(text_words) * 0.6:
        return None
    # words with no matched phonemes borrow the gap between their neighbours
    for i, s in enumerate(span):
        if s:
            continue
        prev_e = next((span[j][1] for j in range(i - 1, -1, -1) if span[j]), spoken[0].start)
        next_s = next((span[j][0] for j in range(i + 1, len(span)) if span[j]), spoken[-1].end)
        span[i] = (prev_e, max(prev_e + 0.05, next_s))
    # keep words monotonic
    out, last = [], 0.0
    for w, (s, e) in zip(text_words, span):
        s = max(s, last)
        e = max(e, s + 0.04)
        out.append({"w": w, "s": s, "e": e})
        last = s
    return out


def respell(word, say):
    """Swap a word for its spoken spelling, keeping surrounding punctuation."""
    m = re.match(r"^(\W*)(.*?)(\W*)$", word)
    core = m.group(2)
    return m.group(1) + say.get(core, core) + m.group(3) if core in say else word


CJK = r"\u4E00-\u9FFF"


def zh_words(line):
    """Split a Chinese caption line into words (jieba), punctuation attached:
    opening marks to the next word, everything else to the previous one."""
    import jieba

    out, lead = [], ""
    for tok in jieba.lcut(line):
        if not tok.strip():
            continue
        if re.fullmatch(r"[^\w]+", tok):
            if re.fullmatch(r"[“‘《（(]+", tok) or not out:
                lead += tok
            else:
                out[-1] += tok
            continue
        out.append(lead + tok)
        lead = ""
    if lead and out:
        out[-1] += lead
    return out


def zh_phonemizer(k, say):
    """Mandarin phonemes for Kokoro's z voices (misaki's pinyin IPA with tone
    arrows). misaki leaves Latin words untouched, so engine names and other
    English words go through the English phonemizer, after voice.say respells."""
    import cn2an
    import jieba
    from misaki.zh import ZHG2P

    def en(m):
        return " " + k.tokenizer.phonemize(say.get(m.group(0), m.group(0)), "en-us") + " "

    def phonemize(text):
        text = ZHG2P.map_punctuation(cn2an.transform(text, "an2cn"))
        out = []
        for seg in re.findall(f"[{CJK}]+|[^{CJK}]+", text):
            if re.match(f"[{CJK}]", seg):
                out.append(" " + " ".join(ZHG2P.word2ipa(w) for w in jieba.lcut(seg)) + " ")
            else:
                out.append(re.sub(r"[A-Za-z][A-Za-z0-9'’-]*", en, seg))
        text = re.sub(r"\s+", " ", "".join(out)).replace(chr(815), "")
        return re.sub(r"\s+([,.!?;:])", r"\1", text).strip()

    return phonemize


def write_srt(path: Path, scenes, total):
    """Caption file for platforms that take uploaded subtitles (LinkedIn, YouTube)."""
    lines = [l for sc in scenes for l in sc["lines"]]

    def ts(sec):
        ms = int(round(sec * 1000))
        return f"{ms // 3600000:02d}:{ms // 60000 % 60:02d}:{ms // 1000 % 60:02d},{ms % 1000:03d}"

    out = []
    for i, l in enumerate(lines):
        end = lines[i + 1]["start"] - 0.05 if i + 1 < len(lines) else min(total, l["end"] + 1.0)
        out.append(f"{i + 1}\n{ts(l['start'])} --> {ts(max(end, l['end']))}\n{l['text']}\n")
    path.write_text("\n".join(out))


def stamp_duration(index_html: Path, total: float):
    if not index_html.exists():
        return
    html = index_html.read_text()

    def fix(tag_id, src):
        pattern = re.compile(r'(<[^>]*\bid="%s"[^>]*?\bdata-duration=")[\d.]+(")' % tag_id, re.S)
        return pattern.sub(lambda m: f"{m.group(1)}{total:.2f}{m.group(2)}", src)

    html = fix("root", html)
    html = fix("soundtrack", html)
    index_html.write_text(html)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("project")
    ap.add_argument("--voice")
    ap.add_argument("--speed", type=float)
    ap.add_argument("--from-wav", action="store_true", help="keep build/voice.wav, estimate timings")
    args = ap.parse_args()

    proj = Path(args.project).resolve()
    spec = json.loads((proj / "script.json").read_text())
    vcfg = spec.get("voice", {})
    voice = args.voice or vcfg.get("voice", "am_michael")
    speed = args.speed or vcfg.get("speed", 1.1)
    gap = vcfg.get("sceneGap", 0.15)
    say = vcfg.get("say", {})
    zh = vcfg.get("lang", "en-us").startswith("zh")  # "zh": Mandarin z voices, Chinese script
    sent_pause = vcfg.get("sentencePause", 0.25)
    clause_pause = vcfg.get("clausePause", 0.1)
    lead = vcfg.get("leadIn", 0.12)
    tail = vcfg.get("tail", 1.0)
    build = proj / "build"
    build.mkdir(exist_ok=True)

    k = None if args.from_wav else load_kokoro()
    zh_phon = zh_phonemizer(k, say) if zh and k else None
    pieces = []
    scenes = []
    cursor = 0.0
    for i, sc in enumerate(spec["scenes"]):
        lines = sc["lines"]
        line_words = [zh_words(l) if zh else l.split() for l in lines]
        text = ("" if zh else " ").join(lines)
        text_words = [w for ws in line_words for w in ws]
        # a leading pause mark gives each scene's first syllable a run-up; without
        # it the voice softens the opening consonant (引擎 heard as 阴晴, "Brand"
        # as "Rand"). The run-up's silence is cut again below.
        if zh_phon:
            audio, sr, timings = k.create_timed("… " + zh_phon(text), voice=voice, speed=speed, is_phonemes=True, sentence_pause=sent_pause, clause_pause=clause_pause)
            assert sr == SR
            words = words_from_timings(timings, text_words, zh_phon)
        elif k:
            # voice.say respells words for the TTS only ({"Qwen": "Kwen"}); captions
            # keep the written form and timings still map word for word
            spoken = " ".join(respell(w, say) for w in text_words)
            audio, sr, timings = k.create_timed("… " + spoken, voice=voice, speed=speed, sentence_pause=sent_pause, clause_pause=clause_pause)
            assert sr == SR
            words = words_from_timings(timings, text_words, lambda w: k.tokenizer.phonemize(respell(w, say), "en-us"))
        if k:
            # keep 60 ms before the first sound
            off = max(0.0, min(w["s"] for w in words) - 0.06)
            audio = audio[int(off * SR) :]
            for w in words:
                w["s"] -= off
                w["e"] -= off
        else:
            # rough reading-speed layout for an external recording
            dur = 0.36 * len(text_words) / speed
            audio = np.zeros(int(dur * SR), dtype=np.float32)
            words, t = [], 0.08
            for w in text_words:
                d = 0.36 / speed
                words.append({"w": w, "s": t, "e": t + d * 0.9})
                t += d
        for w in words:
            w["s"] = round(w["s"] + cursor, 3)
            w["e"] = round(w["e"] + cursor, 3)
        line_objs, wi = [], 0
        for line, lw in zip(lines, line_words):
            n = len(lw)
            ws = words[wi : wi + n]
            wi += n
            line_objs.append({"text": line, "start": ws[0]["s"], "end": ws[-1]["e"], "words": ws})
        scenes.append({"id": sc["id"], "voiceStart": words[0]["s"], "voiceEnd": words[-1]["e"], "lines": line_objs})
        pieces.append(np.asarray(audio, dtype=np.float32))
        cursor += len(audio) / SR
        if i < len(spec["scenes"]) - 1:
            pieces.append(np.zeros(int(gap * SR), dtype=np.float32))
            cursor += gap
        print(f"  {sc['id']:<10} {scenes[-1]['voiceStart']:6.2f}s → {scenes[-1]['voiceEnd']:6.2f}s")

    total = round(scenes[-1]["voiceEnd"] + tail, 2)
    # visual scene windows: each cut lands just before its first word
    for i, sc in enumerate(scenes):
        sc["start"] = 0.0 if i == 0 else round(sc["voiceStart"] - lead, 3)
    for i, sc in enumerate(scenes):
        sc["end"] = scenes[i + 1]["start"] if i + 1 < len(scenes) else total

    if not args.from_wav:
        voice_audio = np.concatenate(pieces)
        peak = float(np.max(np.abs(voice_audio))) or 1.0
        voice_audio = voice_audio * (0.89 / peak)
        sf.write(build / "voice.wav", voice_audio, SR)

    timing = {"total": total, "fps": spec.get("format", {}).get("fps", 30), "voice": voice, "brand": spec.get("brand", {}), "scenes": scenes}
    (build / "timing.json").write_text(json.dumps(timing, indent=1))
    (build / "timing.js").write_text("window.TIMING = " + json.dumps(timing) + ";\n")
    write_srt(build / "captions.srt", scenes, total)
    stamp_duration(proj / "index.html", total)
    print(f"voice: {voice} @ {speed}x · total {total:.2f}s → {build / 'timing.json'}")


if __name__ == "__main__":
    main()
