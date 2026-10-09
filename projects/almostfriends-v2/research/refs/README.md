# almost friends v2: reference studies

The client's verdict on the released special edition: **"still too low quality, not 特效 enough, not cool enough yet."**
The owner sent twelve Xiaohongshu references. Each one is studied in its own doc below. Every doc has:
- a header
- why the reference reads as high-end
- a timed beat sheet
- its signature moves and how to build them
- type, light and sound
- what to steal for each beat of our film
- what not to copy
- key frames

The current release's contact sheets are in [`../current-special/`](../current-special/) for comparison.

| # | Doc | What it is | Its lesson for us |
|---|---|---|---|
| 01 | [iPhone 15 (Chinese promo)](01-iphone15-cn.md) | Apple 42 s promo | The phone stays fixed and the world changes around it. Transitions are 4–6-frame whips or something passing the lens |
| 02 | [iPhone 15/16/17 promos](02-iphone-promos-3.md) | three Apple promos, 96 s | Open inside the material at macro scale. Light sweeps along edges. Transitions hide in a bloom or a passing object |
| 03 | [Apple's best animation](03-apple-best-animation.md) | Apple motion graphic, 102 s | One 99 s morph with no cuts. Each object grows from a leftover of the last. A Siri-style orb "thinking" state |
| 04 | [BeFake opening](04-befake-opening.md) | app opening built with code | A soap bubble that works as a real lens: it magnifies, flips and colour-splits. True soap material. Liquid stretch |
| 05 | [Ring photo wall](05-ring-photo-wall.md) | After Effects template | A ring that snaps round like a combination lock. Real motion blur on everything that flies |
| 06 | [Migma SaaS promo](06-migma-saas.md) | AE + C4D SaaS film | The click opens the next scene. A spinning carousel of candidates that bursts behind the winner. Cuts on a 0.53 s beat grid |
| 07 | [Opus 5.5 showreel](07-opus-video.md) | code-made showreel, 128 BPM | Type as architecture, with the subject inside the giant word. Strip everything away before the drop. Glitches under 0.4 s |
| 08 | [OpenShaders backgrounds](08-shader-bgs.md) | openshaders.com demo | Pastel silk fields on light theme, faint grain, and one shader accent per beat. Licence: each creator sets their own, so write our own |
| 09 | [Apple-style morph](09-apple-morph.md) | one element morphing, 14 s | One continuous element. The squash, stretch, overshoot and settle recipe. Morphs locked to a 120 BPM grid |
| 10 | [3D UI app promo](10-3d-ui-app.md) | 3D fintech app film | A glass bubble rolls over 3D UI, magnifies it and changes what it touches; that is Bub. UI made of thick slabs that cast shadows |
| 11 | [TXT gem (HYBE)](11-txt-gem.md) | crystal CG, 24 s | A thin rainbow split on every edge, sparkles lasting 2–4 frames, the mark born inside the material, a burst into white |
| 12 | [Remotion promo](12-remotion-promo.md) | promo built in React | Light beams firing on the music. Real motion blur from blended sub-frames. Type that decodes from scrambled letters. Objects carried across cuts |

## Where they agree (ranked by how many references show it)

1. **Real motion blur on every fast move** (01, 02, 05, 06, 09, 10, 12). Each frame blends several sub-frames rendered at different times; it is not a blur filter. The current cut renders every frame razor sharp, and that is the single biggest "cheap CG" signal. Fixing it is a change to the render loop and every shot gains from it.
2. **Bub becomes a real lens** (04, 10, 11, plus the Siri orb in 03). The bubble refracts, magnifies and colour-splits the UI and type it passes over, and it changes them: values fill in, hidden numbers appear, the padlock opens. Everything outside the bubble dims. Today Bub is a separate layer and does not act on the world.
3. **One continuous object instead of scenes** (03, 09, 02, 12). Each beat is built from what is left of the one before. Bub's bubble becomes the value chips, the search ring, the match, SAME!!, the padlock and the end mark. Transitions happen in a bloom, a whip, a passing object, or the camera diving into what was just clicked (06). No dissolves and no whiteouts.
4. **Light as the effect** (02, 11, 12, 06). Edge sweeps with a white core and coloured fringe, crossed beams firing on the hit, sparkles of 2–4 frames, bursts behind the winner. Glow appears only on fast moments and the frame rests clean between them.
5. **True materials** (04, 10, 11, 08):
   - **Soap film:** nearly clear, one highlight at the upper left, the rainbow only in the lower part of the rim.
   - **Glass edges:** a thin rainbow split.
   - **UI:** thick slabs with contact shadows.
   - **Background:** a pastel silk field with faint grain, never a flat gradient.
   Our bubbles are milky with an even rainbow rim, and the UI is a flat texture.
6. **Silence before the hit, and edits on a beat grid** (07, 10, 12, 06, 09). The music drops for 0.3–0.75 s before SAME!!, the match and the unlock. State changes land on eighth notes.
7. **Type as architecture** (07, 12, 06). Giant words with the subject inside or in front of them, decoding from scrambled letters or condensing out of the background colour. This also answers the earlier note that our type looks "slapped on top".

## What every doc rules out

- dark or black worlds (07, 11, 06, 12 are dark; we keep them light, or night turning to day)
- dense fields of small faces or dots (05's mandala, 03's dot field)
- HUD micro-labels and Apple's tiny captions
- glitches or held shader textures that last longer than an accent

## Prototypes to run first (each proves one idea in about one render)

1. **Sub-frame motion blur** in the renderer. Re-render one phone shot and compare it with the release.
2. **New bubble material plus Bub as a lens.** Rebuild Bub's soap film, then roll him over the 3D phone's screen texture with refraction, colour split and dimming outside.
3. **Light layer.** A pastel silk field with grain, an edge light sweep, and crossed beams on one hit (SAME!!).
4. **Ring-click unlock** (05 + 06). Rings of value chips click into line, the camera dives into the button, and the padlock opens in light.

If these four frames clear the bar, the beat sheet follows: the released tempo and message, rebuilt as one continuous Bub.
