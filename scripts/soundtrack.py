#!/usr/bin/env python3
"""Music bed + sound effects + final mix for a project, all synthesized locally.

  python3 scripts/soundtrack.py projects/ai-delivery-team

Inputs (from projects/<name>/build/):
  voice.wav     narration (scripts/voice.py)
  timing.json   scene windows, used to shape the music
  cues.json     sound-effect cues exported by the composition (scripts/cues.mjs)

Outputs:
  music.wav     the chiptune bed alone
  mix.wav       voice + ducked music + SFX, loudness-normalised (-14 LUFS)

Swap the bed: drop your own track at build/music-override.wav (any rate);
it is trimmed/faded to length and ducked under the voice the same way.
"""

from __future__ import annotations

import argparse
import json
import subprocess
from pathlib import Path

import numpy as np
import soundfile as sf

SR = 48000


# ---------------------------------------------------------------- helpers
def t_axis(dur):
    return np.arange(int(dur * SR)) / SR


def env_adsr(n, a=0.005, d=0.05, s=0.6, r=0.05):
    a, d, r = int(a * SR), int(d * SR), int(r * SR)
    s_len = max(0, n - a - d - r)
    e = np.concatenate([
        np.linspace(0, 1, max(a, 1), endpoint=False),
        np.linspace(1, s, max(d, 1), endpoint=False),
        np.full(s_len, s),
        np.linspace(s, 0, max(r, 1)),
    ])
    return e[:n] if len(e) >= n else np.pad(e, (0, n - len(e)))


def fft_filter(x, lo=None, hi=None):
    """Brick-ish band filter with soft edges, via FFT (no scipy needed)."""
    n = len(x)
    X = np.fft.rfft(x)
    f = np.fft.rfftfreq(n, 1 / SR)
    m = np.ones_like(f)
    if lo:
        m *= 1 / (1 + (lo / np.maximum(f, 1)) ** 4)
    if hi:
        m *= 1 / (1 + (f / hi) ** 4)
    return np.fft.irfft(X * m, n)


def resample(x, sr_in):
    if sr_in == SR:
        return x
    n_out = int(round(len(x) * SR / sr_in))
    X = np.fft.rfft(x)
    Y = np.zeros(n_out // 2 + 1, dtype=complex)
    k = min(len(X), len(Y))
    Y[:k] = X[:k]
    return np.fft.irfft(Y, n_out) * (n_out / len(x))


def place(buf, clip, at, gain=1.0):
    i = int(at * SR)
    if i >= len(buf) or i + len(clip) <= 0:
        return
    if i < 0:
        clip, i = clip[-i:], 0
    j = min(len(buf), i + len(clip))
    buf[i:j] += clip[: j - i] * gain


def note_hz(midi):
    return 440.0 * 2 ** ((midi - 69) / 12)


def pulse(freq, dur, duty=0.25):
    t = t_axis(dur)
    return np.where((t * freq) % 1.0 < duty, 1.0, -1.0)


def tri(freq, dur):
    t = t_axis(dur)
    return 2 * np.abs(2 * ((t * freq) % 1.0) - 1) - 1


def noise(dur, seed):
    return np.random.default_rng(seed).uniform(-1, 1, int(dur * SR))


# ---------------------------------------------------------------- music
CHORDS = {  # midi roots + triad, C major I–V–vi–IV
    "C": [60, 64, 67],
    "G": [55, 59, 62],
    "Am": [57, 60, 64],
    "F": [53, 57, 60],
}
PROG = ["C", "G", "Am", "F"]


def chiptune(total, bpm=120, seed=4, calm=()):
    """Upbeat 8-bit loop: pulse arpeggio, triangle bass, noise drums.
    `calm` is a list of (start, end) windows where the arp drops out."""
    beat = 60 / bpm
    bar = beat * 4
    out = np.zeros(int((total + 2) * SR))
    rng = np.random.default_rng(seed)
    kick = np.sin(2 * np.pi * np.cumsum(np.linspace(150, 45, int(0.16 * SR))) / SR) * np.exp(-np.linspace(0, 6, int(0.16 * SR)))
    snare_n = fft_filter(noise(0.14, seed + 1), lo=1200, hi=7000) * np.exp(-np.linspace(0, 7, int(0.14 * SR)))
    snare_t = np.sin(2 * np.pi * 185 * t_axis(0.14)) * np.exp(-np.linspace(0, 10, int(0.14 * SR)))
    snare = snare_n * 0.8 + snare_t * 0.5
    hat = fft_filter(noise(0.035, seed + 2), lo=7000) * np.exp(-np.linspace(0, 8, int(0.035 * SR)))

    def in_calm(t):
        return any(a <= t < b for a, b in calm)

    n_bars = int(np.ceil(total / bar)) + 1
    for b in range(n_bars):
        t0 = b * bar
        chord = CHORDS[PROG[b % 4]]
        # bass: root on 8ths, octave bounce
        for i in range(8):
            t = t0 + i * beat / 2
            m = chord[0] - 24 + (12 if i % 2 else 0)
            place(out, tri(note_hz(m), beat / 2 * 0.9) * env_adsr(int(beat / 2 * 0.9 * SR), 0.003, 0.04, 0.7, 0.03), t, 0.32)
        # arp: 16ths, up pattern over two octaves
        seq = chord + [c + 12 for c in chord] + [chord[1] + 12, chord[2]]
        for i in range(16):
            t = t0 + i * beat / 4
            if in_calm(t):
                continue
            m = seq[i % len(seq)] + 12
            d = beat / 4 * 0.8
            place(out, pulse(note_hz(m), d, 0.25) * env_adsr(int(d * SR), 0.002, 0.03, 0.4, 0.02), t, 0.075)
        # drums
        for i in range(4):
            t = t0 + i * beat
            if i in (0, 2):
                place(out, kick, t, 0.9)
            else:
                place(out, snare, t, 0.38 if not in_calm(t) else 0.18)
        for i in range(8):
            place(out, hat, t0 + i * beat / 2, 0.22 if i % 2 else 0.12)
        # every 4th bar, a little lead hook
        if b % 4 == 3 and not in_calm(t0):
            hook = [chord[2] + 12, chord[1] + 12, chord[0] + 12, chord[1] + 12]
            for i, m in enumerate(hook):
                d = beat * 0.45
                place(out, pulse(note_hz(m + 12), d, 0.5) * env_adsr(int(d * SR), 0.005, 0.06, 0.5, 0.06), t0 + 2 * beat + i * beat / 2, 0.06)
    out = out[: int(total * SR)]
    # gentle tone shaping: take the fizz off the pulses
    out = fft_filter(out, lo=35, hi=9000)
    fade = int(1.2 * SR)
    out[-fade:] *= np.linspace(1, 0, fade) ** 2
    return out / (np.max(np.abs(out)) or 1)


# ---------------------------------------------------------------- SFX
def sfx(kind, seed=0):
    if kind == "whoosh":
        d = 0.42
        n = noise(d, seed)
        t = t_axis(d)
        # crude moving band: mix low and high passes with a time-varying blend
        lo = fft_filter(n, lo=300, hi=1800)
        hi = fft_filter(n, lo=1800, hi=8000)
        blend = np.sin(np.pi * t / d)
        sweep = lo * (1 - blend) + hi * blend
        return sweep * np.sin(np.pi * t / d) ** 1.5 * 0.9
    if kind == "pop":
        d = 0.09
        t = t_axis(d)
        f = np.linspace(520, 980, len(t))
        return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 38) * 0.8
    if kind == "blip":
        d = 0.07
        return pulse(1046, d, 0.5) * np.exp(-t_axis(d) * 30) * 0.35
    if kind == "tick":
        d = 0.03
        return fft_filter(noise(d, seed + 5), lo=2500) * np.exp(-t_axis(d) * 160) * 0.7
    if kind == "type":
        d = 0.05
        click = fft_filter(noise(d, seed + 9), lo=1800, hi=6000) * np.exp(-t_axis(d) * 120)
        return click * 0.45
    if kind == "check":
        d = 0.16
        t = t_axis(d)
        a = np.sin(2 * np.pi * 880 * t) * (t < 0.07)
        b = np.sin(2 * np.pi * 1320 * t) * (t >= 0.06)
        return (a + b) * np.exp(-t * 18) * 0.45
    if kind == "stamp":
        d = 0.32
        t = t_axis(d)
        thump = np.sin(2 * np.pi * np.cumsum(np.linspace(120, 50, len(t))) / SR) * np.exp(-t * 14)
        crack = fft_filter(noise(d, seed + 3), lo=800, hi=5000) * np.exp(-t * 40)
        return thump * 0.9 + crack * 0.5
    if kind == "ding":
        d = 0.9
        t = t_axis(d)
        return (np.sin(2 * np.pi * 1318.5 * t) + 0.5 * np.sin(2 * np.pi * 1975.5 * t) + 0.25 * np.sin(2 * np.pi * 2637 * t)) * np.exp(-t * 5) * 0.32
    if kind == "success":
        out = np.zeros(int(0.5 * SR))
        for i, m in enumerate([72, 76, 79, 84]):
            d = 0.11
            place(out, pulse(note_hz(m), d, 0.5) * env_adsr(int(d * SR), 0.002, 0.03, 0.6, 0.04), i * 0.07, 0.22)
        return out
    if kind == "rise":
        d = 0.6
        t = t_axis(d)
        f = np.linspace(300, 1400, len(t))
        return np.sin(2 * np.pi * np.cumsum(f) / SR) * (t / d) ** 2 * 0.25 + fft_filter(noise(d, seed), lo=3000) * (t / d) ** 2 * 0.25
    if kind == "slide":
        d = 0.25
        t = t_axis(d)
        return fft_filter(noise(d, seed + 7), lo=600, hi=3000) * np.sin(np.pi * t / d) * 0.5
    if kind == "heart":
        return sfx("pop", seed) + np.pad(sfx("blip", seed), (0, int(0.09 * SR) - int(0.07 * SR)))[: int(0.09 * SR)] * 0.6
    return np.zeros(1)


# ---------------------------------------------------------------- mix
def duck_curve(voice, depth=0.6):
    win = int(0.03 * SR)
    power = np.convolve(voice ** 2, np.ones(win) / win, mode="same")
    env = np.sqrt(power)
    env = env / (np.max(env) or 1)
    # attack fast, release slow
    out = np.empty_like(env)
    a = np.exp(-1 / (0.01 * SR))
    r = np.exp(-1 / (0.25 * SR))
    prev = 0.0
    # vectorised-enough: process in 1 ms blocks
    blk = SR // 1000
    for i in range(0, len(env), blk):
        target = env[i : i + blk].max()
        coef = a if target > prev else r
        prev = target + (prev - target) * coef ** blk
        out[i : i + blk] = prev
    gate = np.clip(out * 3, 0, 1)
    return 1 - depth * gate


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("project")
    ap.add_argument("--no-music", action="store_true")
    args = ap.parse_args()
    proj = Path(args.project).resolve()
    build = proj / "build"
    spec = json.loads((proj / "script.json").read_text())
    timing = json.loads((build / "timing.json").read_text())
    total = timing["total"]
    n = int(total * SR)

    voice = np.zeros(n)
    vpath = build / "voice.wav"
    if vpath.exists():
        v, vsr = sf.read(vpath, dtype="float64")
        if v.ndim > 1:
            v = v.mean(axis=1)
        v = resample(v, vsr)
        voice[: min(n, len(v))] = v[:n]

    mcfg = spec.get("music", {})
    music = np.zeros(n)
    override = build / "music-override.wav"
    if not args.no_music and override.exists():
        m, msr = sf.read(override, dtype="float64")
        m = resample(m.mean(axis=1) if m.ndim > 1 else m, msr)
        music[: min(n, len(m))] = m[:n]
        fade = int(1.2 * SR)
        music[-fade:] *= np.linspace(1, 0, fade)
        music /= np.max(np.abs(music)) or 1
    elif not args.no_music:
        calm = [(s["start"], s["end"]) for s in timing["scenes"] if s["id"] in mcfg.get("calmScenes", [])]
        music = chiptune(total, mcfg.get("bpm", 120), mcfg.get("seed", 4), calm)
    sf.write(build / "music.wav", (music * 0.8).astype(np.float32), SR)

    fx = np.zeros(n)
    cues_path = build / "cues.json"
    cues = json.loads(cues_path.read_text()) if cues_path.exists() else []
    for i, c in enumerate(cues):
        clip = sfx(c["type"], seed=i)
        place(fx, clip, c["t"], c.get("gain", 1.0) * 0.55)

    level = mcfg.get("level", 0.16)
    mix = voice * 1.0 + music * level * duck_curve(voice) + fx
    stereo = np.stack([mix, mix], axis=1)
    raw = build / "mix.raw.wav"
    sf.write(raw, (stereo / (np.max(np.abs(stereo)) or 1) * 0.9).astype(np.float32), SR)
    out = build / "mix.wav"
    subprocess.run(
        ["ffmpeg", "-v", "error", "-y", "-i", str(raw), "-af", "loudnorm=I=-14:TP=-1.2:LRA=11", "-ar", str(SR), "-c:a", "pcm_s16le", str(out)],
        check=True,
    )
    raw.unlink()
    print(f"mix: {len(cues)} sfx cues · {total:.2f}s → {out}")


if __name__ == "__main__":
    main()
