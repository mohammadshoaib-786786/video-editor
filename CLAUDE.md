# Video editor — agent guide

Agent-first studio for short-form explainer videos (Reels / TikTok / Shorts)
and Instagram carousels. Compositions are HTML + GSAP rendered to MP4 by
[HyperFrames](https://github.com/heygen-com/hyperframes); voice, music and SFX
are generated locally.

## Accounts (who each video is for)

Two accounts. If a request doesn't say which one, ask. The host (the owner's
cartoon, `kit/brand.js`) appears on both.

| Account | Handle | Look | Sample |
| --- | --- | --- | --- |
| Praxcia | `@sho.praxcia` | Pixel Crew (`kit/pixel-crew.css`, pixel robots, chiptune, keyword CTA) | `projects/ai-delivery-team` |
| Geoneo | `geoneo.ai` | Geoneo brand layer (`kit/brands/geoneo/`), calm, no sales pitch, LinkedIn 4:5 | `projects/geoneo-engines`, `projects/geoneo-hk-mortgage` |

Keep them apart: no Pixel Crew colours, fonts or handle in Geoneo work, and no
Geoneo branding in Praxcia work. `projects/ai-meta-ads-team` is a capability
sample from the original references and doesn't belong to either account.

## Map

- `kit/` — shared design system, symlinked into every project as `kit/`.
  - `pixel-crew.css` tokens + atoms (cards, titles, step header, captions); `carousel.css` the editorial slide variant.
  - `brand.js` brand defaults; **the host is the owner's cartoon** (`kit/avatars/host.png` waist-up, `host-face.png` for avatar circles) with blink lids. Load it after `sprites.js` in every composition and build after `window.AVATAR_READY` resolves.
  - `sprites.js` pixel robots, pixel props, line icons, glyphs, presenter (image host from `window.AVATAR`, or drawn looks `tee` / `suit` via `presenter({ look })`), doodles, speed lines; `Sprites.hydrate()` fills `data-icon`, `data-bot`, `data-burst`, `data-face`, `data-presenter`, `data-barcode`.
  - `motion.js` `Reel.create()` → one paused GSAP timeline plus helpers (`pop`, `rise`, `slide`, `slam`, `swap`, `flip`, `grow`, `type`, `count`, `tick`, `bob`, `wobble`, `blink`, `pulse`, `cuts`, `captions`, `cue`) and `R.at(scene, line)` / `R.word(scene, line, word)` voice timing.
  - `brands/<client>/` client brand layers loaded on top of the kit. `brands/geoneo/`: `brand.css` (tokens + `.geo-*` atoms: cards, kickers, headlines, chips, captions), `logo.svg` / `logo.js` (`window.GEONEO_LOGO`, `fill: currentColor`). Inter Tight stands in for Neue Haas Grotesk; drop licensed files into `kit/fonts.css` to swap.
  - `vendor/` (generated) fonts + GSAP copied by `scripts/setup.mjs` (incl. Noto Sans SC 500 for Chinese: link `kit/vendor/fonts/noto-sans-sc-500.css`).
- `projects/<name>/` — one composition each.
  - Reel: `script.json` (lines per scene, voice, brand), `index.html` (markup), `style.css` (placement), `scenes.js` (choreography), `build/` (generated voice, timing, cues, mix, `captions.srt`).
    - `voice`: `speed` (1.35 is the owner's usual), `sentencePause` / `clausePause` (seconds after `.?!` / `,;:`), `say` (respellings, e.g. `{ "Qwen": "Kwen" }`).
    - `music.style`: `"chiptune"` (default) or `"ambient"` (calm B2B); `sfx.level` scales every effect.
  - Carousel: `slides.js` (content), `slide.js` (layouts + motion), `index.html` (template with a `slide` variable).
- `scripts/` — `build.mjs` (pipeline), `voice.py`, `cues.mjs`, `soundtrack.py`, `carousel.mjs`, `new.mjs`, `hf.mjs` (HyperFrames CLI with the local browser), `setup.mjs`, `get-models.sh`.
- `docs/` — `STYLES.md` (what the seven reference repos + three.js offer), `REFERENCE-BREAKDOWN.md` (why the sample reel works).

## Commands

```bash
npm install && bash scripts/get-models.sh          # once
node scripts/build.mjs projects/<reel>             # voice → cues → mix → renders/<reel>.mp4
node scripts/build.mjs projects/<reel> --no-voice --no-render --snap 1,6,12   # quick visual check
node scripts/carousel.mjs projects/<carousel>      # renders/<carousel>/slide-NN.png + .mp4
node scripts/carousel.mjs projects/<carousel> --png --pdf   # PNGs + vector <carousel>.pdf (LinkedIn document post)
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
- Captions: 2–4 words per line in `script.json`, punctuation is dropped on screen (`R.captions(el, { clean: "light" })` keeps commas, quotes and `?`).
- LinkedIn 4:5 (1080×1350) has no Instagram overlay; keep a 64 px margin and captions above the progress bar.
- Client facts: use only the numbers and names the brief allows; never invent per-item values to fill a chart (show a band instead).
- Always use the owner's cartoon host (`kit/brand.js`); don't draw a new character unless asked. The image host has no separate arm, so arm wobble is skipped automatically; bob, blink and slide it in instead.
