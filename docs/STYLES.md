# Styles you can get from the seven repos (and three.js)

I cloned and read all seven repositories. They are not seven versions of one
tool: two are **render engines**, three are **style libraries**, one is a
**footage editor**, and one is an **AI-video generator**. Here is what each
gives you, what it costs to run, and where it fits in this editor.

| Repo | What it really is | Styles you get | Needs | Fit for AI-agent reels |
| --- | --- | --- | --- | --- |
| [heygen-com/hyperframes](https://github.com/heygen-com/hyperframes) | HTML/CSS/GSAP → MP4 engine built for agents, plus 21 skills and a catalog of 210 blocks and 237 components | 13 "frame" design systems, captions, social overlays, UI mockups, transitions, shaders, 3D blocks | Node 22, Chrome, ffmpeg (all local, free) | **The engine this repo is built on.** Everything you saw in the sample reel renders through it. |
| [hypit-ai/hypit](https://github.com/hypit-ai/hypit) | "Clone any viral video": an agent language (SVML) that rebuilds a reference video as a reusable, word-anchored workflow | UGC talking heads, podcast split-screens, street interviews, ranking/tier boards, karaoke captions, B-roll montages | Node 22 + pnpm; generation models (Seedance, GPT Image, WhisperX…) through paid APIs, roughly $1 per video in their examples | Best for **faceless UGC and talking-head formats** and for mass variants (swap hook, host, language). Overkill for code-drawn explainers. |
| [lemomo-ai/lemo-opuscar](https://github.com/lemomo-ai/lemo-opuscar) | 51 film styles, each with a director guide and a demo film made entirely in code (canvas/WebGL + TTS + sampled music) | See the full list below: hand-drawn, print, East-Asian, Swiss type, keynote, cartoon, pixel games, 3D materials | Claude Code + Node/Python, all local | Best **style library for longer story pieces**. Its "Game Show Flat", "Pixel RPG", "Swiss Motion", "Iso Infographic" and "Dark Keynote" styles port well to reels. |
| [JohnHeibel/ClaudeAnimationBase](https://github.com/JohnHeibel/ClaudeAnimationBase) | Character animation starter: p5.js + p5.brush, a mascot (Clawd) with emotions, views, hats, dances | Hand-made 2D: brush strokes, watercolour fills, boiling line work, painted paper | Node + Chrome; GPU strongly recommended (watercolour fills are seconds per frame on CPU) | Best for **mascot / character moments** (an animated host instead of a static avatar). |
| [arjun988/blender-skills](https://github.com/arjun988/blender-skills) | 94 Claude skills that turn the agent into a 3D art team, executed through Blender MCP | 3D looks: low-poly, voxel, chibi, stylized, realistic PBR, cel/anime, pixel-art 3D, HD-2D, PSX, Frutiger Aero, isometric, noir, neon retrofuturism, horror packs… | Blender + the Blender MCP server on your machine | Best for **3D hero assets**: render voxel robots, an isometric "AI office" or a product turntable to PNG/MP4, then drop them into a HyperFrames scene. Not installed in this cloud container. |
| [pyang5166/gbro-collage-broll](https://github.com/pyang5166/gbro-collage-broll) | One skill: a ~5 s line of script → an editorial **halftone paper-collage** B-roll | Halftone paper collage (cut-out photos, torn paper, flat colour fields) | Gemini API key (Omni Flash video, paid) + an image generator | A **B-roll insert** style: cut to a collage shot behind a voiceover line. Uses three approval gates (metaphor → still → video). |
| [leejersey/OneTake](https://github.com/leejersey/OneTake) | Text-based editor for recorded footage: transcribe with faster-whisper, delete words to cut video, remove fillers/silences, burn subtitles | No visual style; it cleans **your own talking-head takes** | Python, FFmpeg, faster-whisper models | Use it **before** this editor when you film yourself: clean the take, then add graphics around it. |

## 1 · HyperFrames — what you can build with it

Everything is HTML, so any web look works. What ships ready-made:

- **Frame design systems (13):** `blockframe` (4px black borders + hard shadows + candy pastels, the closest to this reel's look), `creative-mode` (cream + ink borders + Archivo Black), `cobalt-grid` (cream graph paper + cobalt ink, the closest to the carousel), `blue-professional`, `bold-poster`, `broadside`, `capsule`, `cartesian`, `code-editorial`, `coral`, `daisy-days`, `editorial-forest`, `biennale-yellow`.
- **Captions:** pill karaoke, kinetic slam, emoji pop, neon glow, highlight, gradient fill, matrix decode, glitch RGB, editorial emphasis and more.
- **Social and UI mockups:** Instagram/TikTok/X follow cards, YouTube comment card, X post, Reddit post, Slack and macOS notifications, chat threads, iOS-style liquid glass, terminals, typed prompts, code typing/diff.
- **Data:** bar-chart race, animated charts, count-ups, maps (world, US, hex, flight paths).
- **Transitions:** whip-pan, blur, push, grid, shatter, light leaks, shader dissolves, zoom-through.
- **Backgrounds and shaders:** mesh gradients, aurora, plasma, halftone, noise fields, liquid glass.
- **3D blocks:** product turntable, cuboid carousel, 3D code extrude, gallery tunnel, camera dolly-zoom.

Browse them with `node scripts/hf.mjs catalog` and add one with `node scripts/hf.mjs add <name>`.

## 2 · Lemo-Opuscar — the 51 styles

- **Evidence films:** Satellite Briefing, Engineering Briefing Board, LiDAR Survey, Projection on White Model, Data Physicalization, Exploded Teardown, Microscope Story, Archive Light Table.
- **Hand-drawn & painting:** Crayon Picture Book, Watercolor Brush, Chinese Ink Wash, Impasto Oil, One-line Drawing, Whiteboard Explainer, Urban Sketch (pen & wash).
- **East-Asian traditions:** Shadow Puppetry, Ukiyo-e, Red Paper-cut, Paper-cut Lightbox.
- **Print:** Risograph, Halftone Dossier, Woodcut, Copperplate Engraving, Silkscreen Travel Poster.
- **Graphic & type:** Swiss Motion Graphics, 60s Spy Titles, Art Deco, Blueprint, Stained Glass, Pictogram Motion, ASCII / CRT Terminal.
- **Information & keynote:** Data Storytelling, Isometric Infographic, Dark Tech Keynote, Living Screencast, Sci-fi Hologram HUD.
- **Cartoon & anime:** 1930s Rubber Hose, 80s Cel Anime, Sci-fi Sitcom Toon, Mid-century Cartoon.
- **Games:** 16-bit Pixel RPG, HD-2D, Microgame Frenzy (WarioWare-style), Game Show Flat.
- **Cinema & eras:** 1920s Silent Film, Liminal Found Footage (backrooms).
- **Materials & 3D:** Brick Toy, Paper Pop-up Book, Tilt-Shift Miniature, Low-poly Isometric Island.

Each style folder has a `STYLE.md` (palette, type, motion rules, shot list). To
reuse one here, have the agent read that file and restyle a project's
`style.css` and `scenes.js` with it; the pipeline (voice, captions, render)
stays the same.

## 3 · Hypit — viral formats

Hypit's examples show the formats it clones: **UGC tier lists** (sound-synced
ranking board + karaoke captions), **podcast clips** (split-screen, speaker-aware
captions), **street interviews** (head-tracked captions, emoji reveal board),
and **TikTok Shop / affiliate** videos. Everything is anchored to words, not
seconds, which is the same idea this editor uses (`R.at(scene, line)`).

## 4 · Blender skills — 3D looks

Style specialists: realistic, stylized, low-poly, voxel, chibi, cartoon,
anime, manga, comic book, painterly, hand-painted, pixel-art, HD-2D, retro
8/16-bit, PSX horror, Frutiger Aero, isometric, minimalist, vector, noir,
neon retrofuturism, stop-motion craft, dream-weirdcore, liminal space, plus
horror packs, world themes (fantasy, sci-fi punk, apocalypse, biomes) and
moods (cozy, brutalist, dark-gritty, dream-surreal).

## 5 · Does three.js help?

Yes, for specific shots. HyperFrames has a first-class `three` adapter: your
scene renders from HyperFrames time on every `hf-seek` event, so 3D stays
frame-accurate and deterministic. Good uses for this kind of reel:

- **3D pixel/voxel robots** that turn and wave (extrude the same sprite maps
  this kit uses into voxel meshes).
- An **isometric "AI office"** where each employee sits at a desk, with a
  camera that flies from desk to desk as the voice names them.
- **Extruded 3D titles** or a logo sting for the hook.
- **Particle bursts** when work ships, confetti on the "comment" CTA.

Limits: render time. This cloud container renders WebGL in software
(SwiftShader), so heavy scenes are slow; on a Mac or a GPU machine it is fine.
Keep 3D to one or two hero shots per reel, and keep the cards, captions and UI
in HTML, where text stays sharp.

## Recommended stack for your reels

1. **This editor (HyperFrames + the Pixel Crew kit)** for the main look:
   cards, pixel employees, captions, voice, music, render. Free and local.
2. **Opuscar style guides** when you want a different look for a series.
3. **three.js** for one 3D hero shot per reel, if the topic earns it.
4. **OneTake** to clean any talking-head footage you film yourself.
5. **Hypit** if you move into faceless UGC / avatar formats and want 50
   variants of one hook (needs paid generation APIs).
6. **gbro collage** and **Blender** are optional: B-roll inserts and 3D assets.
