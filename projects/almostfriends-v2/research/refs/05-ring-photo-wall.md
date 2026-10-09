# 05: Ring photo wall (AE template)

| | |
|---|---|
| Title / author | AE模板-环形照片墙展示动画 (ring photo wall) / 拂风 |
| Link | http://xhslink.com/o/212A2TiVRm3 |
| Origin | An Envato After Effects template preview. The end card reads "envato.com" with Envato's green logo. The "logo" in the centre throughout is the Envato mark, used as a stand-in for the buyer's logo. |
| Duration | 22.04 s, about 20.3 s of picture, then black and silence from 20.7 s |
| Resolution / fps | 1280×720, 29.97 fps, 16:9 |
| Cuts | 3 scene-score hits, all between 0.33 and 0.40 s (the full-frame green logo slam). There are no edits: it is **one continuous camera move**. |
| Loudness | −10.1 LUFS integrated. A dense, compressed music bed runs from 0.5 to 19.5 s at −10 to −12 dBFS RMS per 0.25 s. Small accents land at 7.75, 10.25, 12.75 and 15.5 s (−8/−9 dB), about every 2.5 s, which is one bar at about 96 BPM. It fades from 19.5 to 20.6 s. |

**What it is:** a logo reveal. The logo slams in, then hundreds of rounded-square portrait tiles assemble into **concentric rings around the logo**, seen top-down down the axis of a tube or funnel. Individual rings spin in quick "clicks". The camera pulls back to reveal more and more rings until the frame is a dense mandala. Then the whole thing implodes back to the logo and the end card.

---

## 2. Why it reads high-end

Three things lift it above a "photo collage". First, **real 3D perspective**: tile size grows with ring radius, so the inner rings read as deep and the outer ones as close. The result is a tunnel, not a flat pattern. Second, **per-ring mechanical motion with heavy motion blur**: rings rotate one at a time in short, fast clicks while their neighbours stay still and sharp. That sharp-next-to-blurred contrast makes it feel like a precise machine, a combination lock or iris. Third, **a strict system**: every tile has the same squircle shape, a saturated solid studio backdrop, and a radial orientation (head pointing away from the centre). So 300 different photos read as one designed object. Everything resolves to one focal point, the logo.

## 3. Beat sheet

| Time | What we see | Camera | Transition into next | Sound |
|---|---|---|---|---|
| 0.00–0.30 | Charcoal (#1e1e1e) empty frame | — | Logo slam | Silence, then a riser starting at −26 dB |
| 0.30–0.40 | **The green logo fills the frame** (0.33–0.37 s: the glyph about 3× frame size with a strong radial zoom-blur smear). It scales down from roughly 30× to 2× in about 3 frames, with strong motion blur on the scale-down. | Logo at the lens | Continuous | The bed hits (−14 → −12 dB) |
| 0.40–1.20 | Logo settles at about 15 % of frame height, then keeps shrinking slowly to about 8 % (ease-out tail, about 0.8 s) | Slow pull-back | Tiles enter | Bed |
| 1.20–1.60 | Tiles **swing in from outside the frame** on curved paths with big motion blur (one blue tile at the top edge first, 1.2 s). Ring 1 (6 tiles) locks around the logo by 1.5 s. Ring 2 tiles are still flying in, huge and blurred at the frame edges. | Pull-back continues | Continuous | Bed |
| 1.60–5.00 | Rings 1–2 (6 + about 12 tiles), with ring 3 partly in frame. Rings rotate step-wise; the positions change between 2.0, 2.5 and 3.0 s. Tile size is about 22 % of frame height on ring 2. | Near-static, slow drift | Pull-back | Bed |
| 5.00–6.50 | **Pull-back reveal**: the whole structure shrinks toward the centre (by about 40 % over 0.5 s, 5.0–5.5 s). New outer rings sweep in from the left/right edges with long arc motion blur (5.5–6.3 s) and lock into ring 3 and ring 4 | Fast dolly-out, ease-in-out | Continuous | Bed |
| 6.50–15.50 | Mandala of about 6–9 rings filling the frame. **Ring-by-ring click rotations**: at any moment one ring (sometimes two) is spinning with tangential blur while the others are sharp (9.0→9.25→9.5 s: the middle ring blurs, then the outer ring). The camera keeps creeping out, so the inner rings become tiny and dense (11–15.5 s). | Very slow continuous pull-back | Implode | Accents every about 2.5 s (7.75, 10.25, 12.75, 15.5) |
| 15.50–16.90 | **Exit**: the outer rings blur and fly outward and off frame (tangential plus radial blur). The inner rings stay sharp and recede into the centre (16.2–16.6 s). By 16.7 s only a 6-tile ring remains around a tiny logo; by 16.9 s it is gone. | Fast push/pull with rings exploding outward | Continuous | Bed |
| 16.90–17.50 | Tiny logo alone on charcoal. "envato.com" fades in under it. | — | Logo scales up | Bed |
| 17.50–20.30 | Logo plus wordmark scale up to about 2× (ease-out), then hold for about 2 s | Static | Fade to black (20.3–20.7 s) | Bed fades 19.5–20.6 s |
| 20.70–22.04 | Charcoal/black | — | End | Silence (−114 dB) |

## 4. Signature moves (特效)

### 4.1 Logo slam from the lens (0.30–1.20 s)
- **Frame by frame:** 0.33–0.37 s: the glyph is about 3× frame size, filling most of the frame, with a radial zoom blur smearing every edge outward (key frame below). 0.40 s: the full logo is visible at about 45 % of frame height with directional blur. 0.5–0.8 s: settles to about 15 %. 0.8–1.2 s: drifts on down to about 8 %.
- **Curve:** an exponential scale-down (expo-out). Over 90 % of the scale change happens in about 3 frames, then a 0.8 s tail. No overshoot.
- **Build:** in our renderer, the camera starts *inside* the end mark (the two bubbles). On frame 0 the frame is filled by the blue bubble's surface, then `scale = mix(30, 1, 1-pow(2,-10*t))` with velocity-based motion blur (accumulate 8–16 sub-frames per output frame, or a radial blur scaled by `|dScale/dt|`).
- **Why it reads cool:** frame 0 is already a full-frame impact. There is no "fade from black", and the motion blur proves the speed.

### 4.2 Tiles spiral in from outside the frame (1.2–1.6 s and 5.5–6.3 s)
- Tiles do not fade or pop. Each arrives on a **curved path from beyond the frame edge**, rotating as it travels (the ring rotates while its radius shrinks to the target), with heavy motion blur. Large and blurred at the edge, sharp once locked. Stagger: about 1 frame per tile, about 0.3–0.4 s per ring.
- **Build:** polar coordinates per tile: `r(t) = r_target * mix(3.0, 1.0, easeOutCubic(t))` and `θ(t) = θ_target + mix(+1.2 rad, 0, easeOutCubic(t))`. Render with sub-frame accumulation for true arc blur. Per-tile delay is `ring*0.15 + index*0.016` s.

### 4.3 Concentric rings in perspective: the "tunnel mandala" (whole video)
- **Structure (measured on frames):** ring 1 has 6 tiles, ring 2 about 12, ring 3 about 18. The count grows by about 6 per ring, so tile spacing stays even. Tile size scales about linearly with ring radius (5.6 s and 13.8 s). That is consistent with **tiles placed on a cylinder or cone and viewed straight down its axis**, or a flat layout with `scale ∝ r`. Tiles are rotated **radially** (head pointing outward): top tiles are upright, bottom tiles upside down (2.5 s, 5.6 s).
- **Tile design:** squircle with corner radius about 25 % of the side, solid saturated backdrop per photo (yellow, teal, pink, red, sky blue, cream), a waist-up studio portrait, no border, no visible drop shadow, on flat charcoal #1e1e1e.
- **Build:** a Three.js instanced plane mesh, one texture atlas, positions on rings, camera on the axis with FOV about 50°. Or a 2D canvas with `scale = k*r`. The perspective look comes from the `scale ∝ r` rule plus the inner rings being smaller *and* denser.

### 4.4 Ring-by-ring "combination-lock" clicks (6.5–15.5 s): the strongest move
- At 9.0 s all rings are sharp. At 9.25 s the 3rd/4th ring is spinning with heavy tangential blur while the inner and outer rings stay crisp. At 9.5 s the outermost ring spins instead. At 9.75 s all are sharp again in new positions. At 13.8 s the 4th–5th rings blur with the centre and the outer rings sharp.
- **Timing:** each click is about 0.2–0.3 s and turns about one tile pitch (360°/n). The curve is ease-in-out with a hard stop and no overshoot. Neighbouring rings alternate direction. A new click starts about every 0.25–0.5 s and walks across the rings, not always in order.
- **Build:** per ring `θ_ring(t) = Σ steps * pitch * easeInOutCubic(clamp((t - t_k)/0.25))`. Tangential motion blur comes from sub-frame accumulation, or a polar blur in a post shader: convert to (r, θ), blur along θ by `ω(r)*shutter`, convert back. The ω(r) lookup comes from the ring index.
- **Why it reads cool:** contrast. Blurred motion next to perfect stillness reads as mechanical precision, like a safe dial or a camera iris. It also keeps a static composition alive for 9 s without moving the camera much.

### 4.5 Pull-back reveal (5.0–6.5 s) and slow creep (6.5–15.5 s)
- A hard dolly-out of about 40 % scale in 0.5 s (ease-in-out) reveals that the first rings were only the centre of something huge. Then the camera keeps a slow continuous creep for 9 s, so rings keep accumulating at the centre. The "more and more people" scale story is told purely by camera.

### 4.6 Implode exit (15.5–16.9 s)
- The outer rings accelerate outward and off frame with tangential and radial blur (16.2–16.5 s). Simultaneously the inner rings recede into the centre and vanish. The frame empties to the tiny logo in about 1.2 s. It is the reverse of 4.2, with expo-in acceleration.

### 4.7 End card (16.9–20.7 s)
- The tiny logo grows to about 2× with an ease-out over about 1 s. The wordmark fades in under it. It holds for 2 s, then fades to black over 0.4 s. This is plain and template-standard.

## 5. Type

- There is effectively none in the animation: no headlines, only the logo and the "envato.com" wordmark (white, bold geometric sans, about 3 % of frame height, centred under the logo, fade-in about 0.3 s, holding about 3 s).
- The template has no slots for words, because the people are the content. **For us**, any word must be a large, single line living *in the centre hole of the rings*, where the logo is. That is the one clean, high-contrast spot in the composition.

## 6. Colour, light, material

- **Background:** flat charcoal #1e1e1e with no gradient, vignette or grain.
- **Tiles:** saturated, flat studio colours. Each backdrop is a single solid hue, which makes the mandala read as colourful confetti from afar.
- **Light:** none. The tiles are unlit flat planes with no shading, specular, shadow or DOF. Motion blur is the only "optical" effect, and it carries all of the sense of speed and depth.
- **Logo:** a lime green #8cf060-ish, the single brand accent against the multi-colour tiles.

## 7. Tempo & sound

- **One shot**, choreographed in four phases: slam (0.3 s) → assemble (about 1.2 s) → pull-back (about 1.5 s) → mechanical clicks (about 9 s) → implode (about 1.4 s) → end card (about 3.5 s).
- The energy curve runs: peak at the slam → steady high with micro-hits (the clicks) → second peak at the implode → calm card.
- The music is a constant, compressed loop, and the motion is not tightly synced to the beat: clicks happen faster than the accents. Bar accents fall about every 2.5 s. For us, **sync the click rotations to our music's 8th notes** and the big moves to the downbeats. The reference leaves sync on the table.

## 8. Steal for almost friends

The owner rejected dense small-face fields as trypophobic: a few dozen at most, big, with air around each. The reference at 11–15 s (300+ tiny faces) is exactly what **not** to reach. The parts worth borrowing are the **opening rings (1.6–5.0 s, 6–18 tiles, big, air between them)**, the camera grammar and the click mechanics.

1. **Friends gather (56–62 s): a 2-ring "friend ring" around the matched pair, not a scatter.** Now (sheet_04/05, 56–61.5 s), about 25 small face circles scatter randomly around Hana and Sofia. They are small, dense and unstructured, so they read as noise. Change: Hana and Sofia sit in the centre hole (like the logo). **Ring 1 = 6 faces, ring 2 = 12 faces, 18 total**, each face circle about 11–14 % of frame width at 1080 px wide (about 120–150 px), with a gap of at least 40 % of the tile size between them. Faces spiral in from outside the frame (move 4.2) with arc motion blur, ring 1 then ring 2, staggered by 1 frame per face. Use our bubble material (circle portrait inside a glass bubble rim) instead of squircles, so the ring is made of *bubbles*. Brand fit: "make friends outside your bubble".
2. **Unlock (49–50 s): the padlock as a combination lock made of rings.** Now: a small padlock icon on a phone card turns yellow. Change: in a full-frame moment, two or three concentric rings of value icons or bubble chips (Family / Career / Adventure, plus the other values) **click-rotate one ring at a time** (move 4.4: 0.25 s per click, ease-in-out, tangential blur, neighbours sharp). The final click aligns the three shared values at 12 o'clock and the padlock shackle springs open in the centre. This literalises "it takes two yeses" as a mechanism. It is the most 特效 moment available to us, and it needs no faces.
3. **Bub search (15–22 s): rings instead of a uniform bubble soup.** Now: an even, dense pastel bubble field with Bub drifting through it (sheet_02). The client called it not 特效 enough. Change: the crowd organises into 3 rings of 6/12/18 *faceless* bubbles around Bub, seen down the axis with perspective (inner rings smaller and deeper). Bub's scan is a ring-click sweep. Rings spin one after another, each stopping with one bubble highlighted. On the last click the matching bubble sits at 12 o'clock, and the camera pushes in on it (reverse of the 5 s pull-back) to the match. Bubbles have no faces until the reveal, so there are no density or trypophobia issues.
4. **Hook / end-mark slam (0 s and about 62 s): start inside the logo.** Now: the hook opens on a static "How to" with Bub's eyes (0 s), and the end mark fades or scales calmly (62 s). Change: at the end-mark land, the frame is filled by the blue bubble's surface for 1–2 frames, then expo-out scales down to the final two-bubble mark in about 4 frames with radial motion blur, with a 0.8 s settle tail (move 4.1). Do the same for the hook if Bub's bubble can open from full-frame.
5. **Pull-back reveal for scale (after the reveal, about 55–56 s).** Now: a cut from the Hana/Sofia card to the gathering. Change: one continuous dolly-out. Hana + Sofia (big) → camera pulls back by about 40 % in 0.5 s (ease-in-out) → ring 1 friends arrive from outside the frame → ring 2. Stop pulling back after ring 2. The original keeps going to 9 rings, but we hold at 18 faces maximum.
6. **Implode to the end mark (about 61.5–62 s).** Now: the faces fade or gather, then the bubbles appear on a blank background. Change: the friend rings accelerate outward off frame with blur (expo-in, about 0.6 s) while the centre pair collapses into the two-bubble mark. The mark then grows with ease-out, and "almost / friends.ai" fades in under it (move 4.7).
7. **Global rule: motion blur proportional to velocity on every flying element.** Our current release has blur on some whip transitions (e.g. 11.5 s, 43.5 s) but none on element flights. Implement sub-frame accumulation (8 samples, 180° shutter) in the renderer. It is the single biggest reason this cheap template looks expensive.

## 9. Don't copy

- **The 300-tile dense mandala (8.5–16 s)** is trypophobic for this client. Cap at 2 rings, 18 faces, with air.
- **Charcoal background**: a dark world is a known rejection. Our rings sit on the light pastel field (see 08 doc), with soft shadow or refraction under the bubbles.
- **Stock-model studio portraits with saturated solid backdrops**: the owner wants ordinary faces in casual iPhone snapshots, not models. Keep our photo style and frame it in bubbles instead of colour-block squircles.
- **Radially rotated (upside-down) faces**: fine for a logo mandala, wrong for "friends". Our faces must stay upright. Counter-rotate each tile by its ring angle so faces stay level while the ring turns, like a Ferris wheel.
- **Unlit flat planes**: works on charcoal at 720p, looks cheap at 1080×1920 60 fps beside our raymarched glass. Our tiles get glass rims, specular and refraction.
- **Template end card** (logo + URL, 2 s hold, fade to black): too plain for our end mark beat.
- **Loose music sync**: lock our clicks and slams to the beat grid.

## 10. Key frames

![Logo slam](frames/05-ring-photo-wall-0.37s.jpg)
`frames/05-ring-photo-wall-0.37s.jpg`: one frame into the slam (0.37 s). The logo is about 3× frame size with a radial zoom-blur smear on every edge: the "start inside the mark" move.

![Ring 1 locking](frames/05-ring-photo-wall-1.6s.jpg)
`frames/05-ring-photo-wall-1.6s.jpg`: ring 1 (6 tiles) locked around the logo while ring 2 tiles are still flying in, huge, from beyond the frame edge with arc motion blur.

![Two rings, big with air](frames/05-ring-photo-wall-2.5s.jpg)
`frames/05-ring-photo-wall-2.5s.jpg`: the density to borrow: 2 rings, big tiles, radial orientation, room around each. This is the ceiling for our friends beat.

![Pull-back reveal](frames/05-ring-photo-wall-5.6s.jpg)
`frames/05-ring-photo-wall-5.6s.jpg`: pull-back. Three rings in perspective (tile size grows with radius) while a new outer ring sweeps in from the left, heavily blurred.

![Combination-lock click](frames/05-ring-photo-wall-9.3s.jpg)
`frames/05-ring-photo-wall-9.3s.jpg`: one ring spinning with tangential blur while its neighbours are sharp: the combination-lock move for our unlock.

![Dense mandala, too dense](frames/05-ring-photo-wall-13.8s.jpg)
`frames/05-ring-photo-wall-13.8s.jpg`: the dense end state (300+ faces). The trypophobic density the owner rejects. Shown as the limit **not** to reach.

![Implode exit](frames/05-ring-photo-wall-16.4s.jpg)
`frames/05-ring-photo-wall-16.4s.jpg`: implode. The outer rings fly off with radial/tangential blur while the inner rings recede sharp to the centre.

![End card](frames/05-ring-photo-wall-18.5s.jpg)
`frames/05-ring-photo-wall-18.5s.jpg`: template end card (logo plus wordmark on charcoal). Plain; don't copy.
