---
name: pixel-crew-reel
description: Make a short vertical explainer reel (Instagram Reels / TikTok / Shorts, 9:16) in the "Pixel Crew" style — pixel-robot AI employees, chunky offset-shadow cards, word-synced captions, voiceover, chiptune bed and SFX — rendered locally to MP4. Use when the user asks for a reel, short, TikTok or viral video about AI agents, automations, a team/workflow, a list of tools or steps, or wants "a reel like the delivery-team one".
---

# Pixel Crew reel

The sample to copy from is `projects/ai-delivery-team` (read
`docs/REFERENCE-BREAKDOWN.md` for why it works). Read `CLAUDE.md` for the map
and the rules that bit us.

## 1 · Script first (script.json)

Shape that works: **hook (≤5 s) → N identical beats (~3.5 s each) → payoff → keyword CTA**.

- Hook: a surprising number + the whole system in one frame ("7 employees, none of them human").
- Each beat: "The *Role* does *a*, *b* and *c*." — three concrete nouns you can animate.
- Payoff: the human's one job (approve, decide, review).
- CTA: "Comment KEYWORD and I'll send you …" (keyword in `brand.keyword`).
- Write `lines` as 2–4-word caption phrases; each line becomes one caption.
- Aim for 30–45 s total; voice speed 1.3–1.4 keeps Kokoro near 3.5 words/s.
- Ask the user for brand handle / approver name / keyword if unknown; otherwise keep the `@yourhandle` placeholders and say so.

## 2 · Scaffold

```bash
node scripts/new.mjs reel <name>
python3 scripts/voice.py projects/<name>          # timings first, then design to them
```

## 3 · Scenes (index.html + style.css + scenes.js)

- One `<section class="scene">` per script scene, in the same order (`R.cuts()` maps them to `TIMING.scenes`).
- Each employee scene: `.head` with `.step[data-step][data-label]` + `.title` (size so it fits ≤ 980 px), then one or two `.card`s that act out the job.
- Give every scene its own accent (`--accent: var(--rN)`) and alternate backgrounds (`is-paper`, `is-peri`, `is-lav`, `is-cobalt`).
- Animate every spoken noun: `R.pop(el, R.word(scene, line, "noun"))`, `R.tick`, `R.type`, `R.grow`, `R.slam` for stamps.
- Use `data-icon`, `data-bot`, `data-burst`, `data-face`, `data-presenter` placeholders; `Sprites.hydrate()` fills them.
- End with `R.captions(...)` and `R.register()`; keep the inline `window.__timelines["main"]` line.

## 4 · Check, then render

```bash
node scripts/build.mjs projects/<name> --no-voice --no-render --snap <one time per scene>
# read projects/<name>/build/snaps/contact-sheet*.jpg, fix, repeat
node scripts/hf.mjs lint projects/<name>
node scripts/build.mjs projects/<name> --no-voice      # → renders/<name>.mp4
```

Verify the MP4 itself: `ffmpeg -i renders/<name>.mp4 -vf fps=1,scale=180:-1,tile=8x5 sheet.jpg`
and `-af ebur128` (target ≈ −14 LUFS). Look for: blank first frame, text
touching edges, elements under Instagram's UI, captions out of sync.

## Swaps

- Voice: `script.json → voice.voice` (`am_michael`, `am_puck`, `am_fenrir`, `af_heart`, `bf_emma`, …) or record your own to `build/voice.wav` and run `voice.py --from-wav`.
- Music: drop a track at `build/music-override.wav`.
- Host: the owner's cartoon (`kit/brand.js`, `kit/avatars/`) is used automatically by `[data-presenter]` and `[data-face]`; size image hosts by width (`.is-img`), it's waist-up. Don't draw a different character unless asked.
