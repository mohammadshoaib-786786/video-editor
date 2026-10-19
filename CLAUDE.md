# Video editor — agent guide

Agent-first studio for short-form explainer videos (Reels / TikTok / Shorts)
and Instagram carousels. Compositions are HTML + GSAP rendered to MP4 by
[HyperFrames](https://github.com/heygen-com/hyperframes); voice, music and SFX
are generated locally.

## Map

- `kit/` — shared design system, symlinked into every project as `kit/`.
  - `pixel-crew.css` tokens + atoms (cards, titles, step header, captions); `carousel.css` the editorial slide variant.
  - `sprites.js` pixel robots, pixel props, line icons, glyphs, presenter avatar (`look: "tee"` generic, `look: "suit"` the owner's cartoon; set `window.AVATAR = { look: "suit" }` before `Sprites.hydrate()`), doodles, speed lines; `Sprites.hydrate()` fills `data-icon`, `data-bot`, `data-burst`, `data-face`, `data-presenter`, `data-barcode`.
  - `motion.js` `Reel.create()` → one paused GSAP timeline plus helpers (`pop`, `rise`, `slide`, `slam`, `swap`, `flip`, `grow`, `type`, `count`, `tick`, `bob`, `wobble`, `blink`, `pulse`, `cuts`, `captions`, `cue`) and `R.at(scene, line)` / `R.word(scene, line, word)` voice timing.
  - `vendor/` (generated) fonts + GSAP copied by `scripts/setup.mjs`.
- `projects/<name>/` — one composition each.
  - Reel: `script.json` (lines per scene, voice, brand), `index.html` (markup), `style.css` (placement), `scenes.js` (choreography), `build/` (generated voice, timing, cues, mix).
  - Carousel: `slides.js` (content), `slide.js` (layouts + motion), `index.html` (template with a `slide` variable).
- `scripts/` — `build.mjs` (pipeline), `voice.py`, `cues.mjs`, `soundtrack.py`, `carousel.mjs`, `new.mjs`, `hf.mjs` (HyperFrames CLI with the local browser), `setup.mjs`, `get-models.sh`.
- `docs/` — `STYLES.md` (what the seven reference repos + three.js offer), `REFERENCE-BREAKDOWN.md` (why the sample reel works).

## Commands

```bash
npm install && bash scripts/get-models.sh          # once
node scripts/build.mjs projects/<reel>             # voice → cues → mix → renders/<reel>.mp4
node scripts/build.mjs projects/<reel> --no-voice --no-render --snap 1,6,12   # quick visual check
node scripts/carousel.mjs projects/<carousel>      # renders/<carousel>/slide-NN.png + .mp4
node scripts/hf.mjs lint projects/<name>           # HyperFrames lint
node scripts/new.mjs reel <name>                   # start from the sample reel
```

Snapshots land in `projects/<name>/build/snaps/` (`contact-sheet*.jpg`); look
at them before rendering.

## Rules that bit us (keep them)

- Pin every beat to the voice with `R.at()` / `R.word()`, never to hard-coded seconds; re-voicing then re-flows the video.
- The first scene must not get a hide-then-show `set` pair at t=0; the HyperFrames runtime resolves it to hidden. `R.cuts()` handles this.
- Keep the inline `window.__timelines["main"] = …` registration in `index.html`; `hyperframes lint` only checks inline scripts.
- Don't animate an element whose CSS already has a `transform`; give GSAP the rotation/offset instead.
- GSAP 3 can't tween `className`; `R.tick()` sets colours directly.
- Measure text (title fitting) only after `document.fonts.load(...)` resolves.
- Never return GSAP objects from `page.evaluate` (puppeteer hangs serialising them).
- Root `data-duration` is read from static HTML: `voice.py` stamps it; don't hand-edit it in reels.
- Keep content out of Instagram's UI: top ~150 px, bottom ~330 px, right ~110 px below y=1050.
- Captions: 2–4 words per line in `script.json`, punctuation is dropped on screen.
