# Why the reference reel works (and how this editor reproduces it)

Reference: a 36.7 s, 9:16 Instagram reel, "My AI client delivery team". Our
rebuild: `projects/ai-delivery-team` (38.6 s).

## Structure: hook → 7 identical beats → payoff → CTA

| Beat | Time (ref) | Voice | On screen |
| --- | --- | --- | --- |
| Hook | 0.0–4.8 s | "This is my AI client delivery team. Seven employees, and none of them are human." | Org chart: `claude-code` → 7 pixel robots with numbered badges. Title swaps to **7 EMPLOYEES**, badges flip to AI, red **0 HUMANS** stamp slams. Cartoon host points at it. |
| Employee 1–7 | ~3.5 s each | "The *Role* does *job*, *job* and *job*." | Step header `n/7 ▬▬○○ LABEL`, role title in the robot's colour, one UI card that **acts out the job** as each noun is spoken. |
| Payoff | 30.2–33 s | "Nothing goes out until I approve it. My only job is saying yes." | Barrier gate, deliverables stacked behind it, approver card with a YES button; gate lifts, work ships to the client. |
| CTA | 33–36.7 s | "Comment DELIVER and I'll send you the whole team and every prompt." | Profile card, giant **COMMENT**, the keyword typed and posted, "In your DMs" card, full-body host pointing. |

Why it holds attention:

- **The hook states a surprising number in the first second** ("7 employees", "0 humans") and shows the whole system at once, so the viewer knows what the next 30 s will be.
- **Every beat has the same shape**, so viewers predict the rhythm and stay for "what does the next one do?". The progress bar (`3/7`) promises an end.
- **Something visibly happens on every spoken noun** ("kickoff questions" → checkboxes tick, "logins" → keys go green, "project folder" → folder pops). Nothing on screen is static for more than ~0.6 s.
- **Colour = identity**: each employee owns one of seven colours across robot, badge, title shadow and card shadow.
- **Background rhythm**: grey → periwinkle → grey → cobalt → lavender…, so every cut reads as a new chapter even with the sound off.
- **Keyword CTA** ("comment DELIVER") feeds an auto-DM funnel and boosts comments, which the algorithm rewards.

## Visual system (what `kit/pixel-crew.css` encodes)

- Canvas 1080×1920; content kept clear of Instagram's UI (top ~150 px, bottom ~330 px, right ~110 px).
- **Cards:** white, 5 px ink border, 22 px radius, 12 px hard offset shadow in the employee colour.
- **Titles:** Inter 900, uppercase, −0.045em tracking, 7 px offset shadow in the accent colour.
- **Chrome:** JetBrains Mono, uppercase, wide tracking (step labels, tags, file names).
- **Captions:** Nunito 900, white, thick dark stroke, 2–4 words per phrase, punctuation dropped, at ~65% of the height.
- **Robots:** 16×13 pixel sprites with outline, highlight and shade, blinking eyes.
- **Seven colours:** blue `#2350f0`, orange `#d2612b`, gold `#dba12c`, purple `#6948d6`, green `#24785a`, terracotta `#bf5a4a`, teal `#2b6a86`.
- **Backgrounds:** graph-paper grid on `#eceef4`, `#c2cdf6`, `#e2e6f7` or cobalt `#1e4ff2`, with faint seeded doodles (triangles, rings, crosses, squiggles).
- **Cuts:** zoom-whip: outgoing scene scales up and blurs out, incoming scales in from 0.86 with blur, radial speed lines flash, a whoosh plays.

## Audio

- Voice: fast and even (~3.5 words/s). Ours: Kokoro `am_michael` at 1.35×.
- Music: low, upbeat bed ducked under the voice (ours: procedural chiptune, 120 BPM).
- SFX on every visual event: pops, blips, ticks, typing, stamps, a ding on YES, whooshes on cuts. The composition emits them as cues, so sound and picture can't drift apart.
- Loudness: −14 LUFS integrated (Instagram/TikTok normalise to about this).

## The carousel (`projects/ai-meta-ads-team`)

Same characters, calmer "editorial" variant (`kit/carousel.css`): graph-paper
ground, soft white cards, wide-tracked mono labels, flat pixel robots,
sticky notes with tape, handwritten notes with drawn arrows, and a 7-step
stepper on every slide. Ten slides: cover → seven employees (one job each:
4 skills, toolkit, deliverables, 3-step flow) → how they loop → comment CTA.
Each slide exports as a PNG and as a 6 s MP4 that builds itself in (Instagram
carousels accept both).
