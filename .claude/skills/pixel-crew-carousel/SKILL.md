---
name: pixel-crew-carousel
description: Make an Instagram carousel (4:5, 1080×1350, up to 10 slides) in the editorial Pixel Crew style — cover, one slide per AI employee/step (skills, toolkit, deliverables, flow, stepper), a "how it loops" slide and a comment-keyword CTA — exported as PNG stills plus animated MP4 slides. Use when the user asks for a carousel, slides for Instagram/LinkedIn, or "a post like the Meta Ads team one".
---

# Pixel Crew carousel

Sample: `projects/ai-meta-ads-team`. Content lives in `slides.js`
(`window.DECK`); layouts and motion in `slide.js`; styles in `kit/carousel.css`.

## Steps

1. `node scripts/new.mjs carousel <name>`
2. Rewrite `slides.js`:
   - `brand` (name, tagline, handle, keyword) and `series` (shown in every header).
   - `steps`: one short label per employee (shown in the cover and the bottom stepper).
   - Slide types: `cover`, `employee` (×N), `loop`, `cta`. Keep ≤ 10 slides.
   - Employee fields: `color` (`r1`…`r7`), `name`, `dept`, `line` (one sentence), `prop` (`magnifier`, `pencil`, `wrench`, `rocket`, `sliders`, `chart`, `chat`), `status` (≤ 24 chars), `skills` (4 × `[icon, title, description]`, description ≤ 34 chars), `tools` (4 × `["glyph:infinity" | "icon:<name>", label, colour]`), `delivers` (4 short items), `flow` (3 × `[title, description]`).
   - Icons: see the names in `kit/sprites.js` (`P` map) and glyphs `infinity`, `camera`, `note`, `alien`.
3. `node scripts/carousel.mjs projects/<name> --png` and read the PNGs (two side by side is quickest). Fix overflow by shortening copy, not by shrinking type.
4. `node scripts/carousel.mjs projects/<name>` for PNG + MP4 into `renders/<name>/`.

Posting: upload the PNGs (or MP4s for motion) in order; add music
in the Instagram app.
