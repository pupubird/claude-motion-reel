# 09 — 苹果风动效 (Apple-style single-element morph)

| | |
|---|---|
| Title / author | 苹果风动效 / 像素分身-诺塔 |
| Link | http://xhslink.com/o/3bbfJnIC1H8 |
| Duration | 14.03 s, loops (ends on the same "Generate" button it starts on) |
| Format | 720×720 square, 30 fps (H.264) |
| Cuts | **0 hard cuts.** One continuous shot, one element, 12 state changes, so a new state every ~1.1 s on average |
| Loudness | −14.1 LUFS integrated (threshold −24.1). Transients every 1.0 s at x.1 s, e.g. 1.1, 2.1, 3.1… 13.1 (−13/−14 dBFS peaks over a −17 dB bed) |
| What it is | One black UI object, made in HTML/code by Claude, that keeps changing shape: button → loader → check → Dynamic Island → music player → volume slider → toggle → segmented control → analytics card → ⌘K palette → toast → button. A cursor drives every change. |

## Why it reads high-end

You never see a cut, a fade or a new object, only one thing changing shape, so the eye never has to find its place again. Every change follows the same physics: a small squash, a fast stretch with real directional motion blur, a soft overshoot, then the content fades up from a blur in a staggered order. That consistency makes it feel engineered and not keyframed. A real cursor triggers every change, so each morph has a cause. Restraint does the rest: one warm off-white ground, one black material, one soft shadow, and one gradient album thumbnail as the only colour.

## Beat sheet

All times were measured on 10 fps and 30 fps strips (scratch sheets m09_0…12, m09_f12, m09_f62).

| Time | What we see | Camera | Transition into next | Sound sync |
|---|---|---|---|---|
| 0.0–0.55 | Black pill "Generate", white Inter-style semibold label. Cursor glides in from the lower right and stops on the button. | Locked, centred | Click → label blurs out, pill shrinks to a circle (0.6) | Click on the 0.6 beat |
| 0.6–1.05 | Circle with a spinning white arc loader (~1 rev per 0.4 s). The arc retracts to a dot at 0.9. | Locked | Dot grows into a ✓ with a pop (1.1) | ✓ lands on the 1.1 transient |
| 1.1–1.27 | Black circle with a white ✓ | Locked | Squash to ~95 % for 1 frame, then stretch horizontally into a pill over 3 frames with heavy horizontal motion blur (1.30–1.37) | Off-beat (8th note) |
| 1.37–1.8 | **Dynamic Island**: pill with a gradient album square on the left and an animated 5-bar waveform on the right. Cursor moves to the waveform. | Locked | Click → island grows into a card over 5 frames (1.83–1.97) with ~5 % overshoot | 8th note |
| 1.97–3.75 | **Music player card**: "motion study 02 / made in code", progress bar, ⏮ ⏸ ⏭. Title, subtitle, bar and controls fade up from blur ~1 frame apart. Play→pause (2.5). Cursor drags the scrubber from 0:48 to 2:28 (3.0–3.7) while the time labels count. | Locked | The card blurs and collapses to a slim bar (3.8–3.9). The progress bar survives and becomes the volume track. | 8th note |
| 3.9–4.9 | **Volume slider**: speaker icon plus a thick track. Cursor drags left to near zero, then right to full (4.2–4.9). The speaker icon shows 1→3 waves. | Locked | Blur, then the pill shrinks to a toggle (4.95) | 5.1 beat |
| 5.0–6.3 | **Toggle**: white knob on black (ON). Click → knob slides left, track turns grey then light (5.2–5.5) | Locked | **The knob becomes the selected segment**: it goes dark grey and the track extends right into a white bar (6.33–6.5) | 8th note |
| 6.4–7.15 | **Segmented control** Day / Week / Month. Labels fade up left to right from blur. The cursor clicks Week, then Month. The black indicator travels with a trailing-edge stretch (6.83–6.97 spans Day+Week at ~1.6× width). | Locked | The control drops down into a white card (7.2), and the selected "Month" pill stays as the card's tab | 7.1 beat |
| 7.2–8.9 | **Analytics card**: number rolls 48,278 → 66,963 → 77,8xx → 84,320 (7.3–7.8, decelerating, each digit vertically motion-blurred). The line chart draws on left to right with a grey gradient fill. The cursor scrubs the line (7.9–8.9) and a black tooltip tracks the value (22,250 … 80,364). | Locked | Click Week (9.1) | 8.0 / 9.1 beats |
| 9.1–9.7 | Number rolls down to 19,204 and the line re-shapes into a wavier week curve (one continuous path tween) | Locked | The card blurs and shrinks to a small white pill (9.8–9.9), then grows into a search field | 8th note |
| 9.9–11.75 | **⌘K palette**: "Type a command" plus 5 rows (New project, Export video, Frame rate · 60fps, Motion blur, Every frame is code). Rows stagger in top to bottom with blur. Typing "f-r-a-m-e" one character every ~0.1 s filters the list to 2 rows. The highlight moves down and the selected row inverts to black (11.4–11.6). | Locked | Selected row → whole palette blurs and collapses into a black toast (11.8–11.9) | 11.1 beat for typing; collapse on the 8th |
| 11.9–12.55 | **Toast**: ✓ "Every frame is code" | Locked | The label blur-crossfades to "Generate" and the pill narrows to the original width (12.6–12.9) | 12.1 / 13.1 |
| 12.9–14.0 | "Generate" pill holds, identical to frame 0, so the loop is seamless | Locked | Loop | Track tails off at 13.9 |

## Signature moves (特效)

### 1. Squash → blurred stretch → overshoot morph (the core move)
- **Timestamps:** every state change. Cleanest at 1.27–1.50 (✓ → island) and 1.83–2.10 (island → card).
- **Frame by frame at 30 fps (✓ → island):** f0 (1.27) the ✓ glyph fades and the circle shrinks ~5 % (anticipation). f1–f3 (1.30–1.37) the shape stretches horizontally to full pill width, and the whole body shows **directional ghosting along the motion axis** (see frame 1.33: 4–6 visible sub-copies at the edges, not a Gaussian blur). f4–f6 (1.40–1.47) the shape is settled. The album thumbnail fades up from ~8 px blur, then the waveform 1 frame later. Total ≈ 0.23 s, and the content is sharp by 0.3 s.
- **Island → card:** geometry runs over 5 frames, the corner radius goes from full pill to ~16 px, and the size overshoots ~4–5 % at 1.97 before settling by ~2.07. Content staggers in 4 rows ~1 frame apart (33 ms): title, subtitle, progress, transport.
- **How it's built:** an SDF rounded rect where width, height and radius are driven by a damped spring (high stiffness, damping ratio ≈ 0.7–0.75, which gives ~5 % overshoot and settles in ~200 ms). Motion blur comes from **temporal supersampling**: render N≈6–8 sub-frames inside each output frame and average them, which is why the cursor and text show discrete ghost copies (frame 7.4). Content layers use `opacity 0→1` plus `blur 8→0 px` over ~100 ms with a 1-frame stagger.
- **Our build:** the bubble SDF already exists in the raymarcher, so drive its radii and squash with the same spring. Render 8 sub-frames per 60 fps output frame by accumulating into a float buffer (at 60 fps, 4–6 sub-samples is enough). Apply the blur-in/opacity stagger to the UI layers in Canvas.
- **Why it reads cool:** the squash gives weight, the motion blur makes speed visible, and the overshoot makes the material read as elastic. With all three on every change, it feels like one physical object.

### 2. Element correspondence across morphs (nothing new is ever spawned)
- **Timestamps:** 3.8 (player's progress bar becomes the volume track), 6.33 (toggle knob becomes the selected segment indicator), 7.2 (the selected "Month" pill survives into the card header), 11.6–11.9 (the selected black row becomes the toast).
- **What happens:** at every change one sub-element carries over and the rest dissolve around it. The eye follows the survivor.
- **Build:** tag a "hero sub-shape" in each state and tween its rect between states. The other layers do the blur-out/blur-in described above.
- **Why it reads cool:** you get continuity of attention. This is the difference between a morph and a crossfade.

### 3. Elastic travelling indicator
- **Timestamps:** 6.83–6.97 (Day → Week), 7.03–7.13 (Week → Month), 9.1–9.3 (Month → Week in the card).
- **Frame by frame:** the leading edge jumps to the target in ~2 frames while the trailing edge lags ~2 frames, so mid-move the pill is ~1.6× its width. Then the trailing edge catches up with a slight overshoot. Labels under the indicator swap black/white as it passes, and the edges carry motion blur.
- **Build:** two springs, one per edge, with the leading spring stiffer (≈1.5× the stiffness of the trailing one). In our raymarcher this is literally a **smooth-min metaball between two spheres** that slides.
- **Why:** it reads as liquid, not as a slide, so the selection feels physical.

### 4. Rolling counter + draw-on chart
- **Timestamps:** 7.3–7.8 (up to 84,320), 9.2–9.6 (down to 19,204).
- **Frame by frame:** each digit rolls vertically with motion blur. The value follows an ease-out (most of the change happens in the first 40 %). The line path draws on (stroke reveal) at the same time with a gradient area fill, and when the range changes the whole path tweens to the new curve with no redraw.
- **Build:** monospaced (tabular) digit columns translated in y. Accumulation blur gives the streak. Interpolate the path point by point.

### 5. Real cursor with motion blur
- **Timestamps:** throughout. The cursor ghosts visibly at 7.4 and at 8.4.
- The cursor moves on eased curves (accelerate, decelerate, small settle). Each click lands just before the morph starts (~1–2 frames lead). The cursor's own motion blur proves the accumulation buffer covers every layer, not only the hero shape.

### 6. Typing filter list
- **Timestamps:** 10.6–11.2. Characters arrive ~0.1 s apart, a caret blinks, and rows that don't match blur out while the survivors slide up into place.

## Type

- The only type is UI type, set in an Inter / SF-like grotesk: semibold for the button label (~22 px at 720 px, ~3 % of frame), regular/medium for list rows (~13 px) and big bold numerals (~32 px) for the stat.
- Placement is always inside the object. No type ever floats on the ground.
- Every entrance and exit is a blur-fade: 8 px→0 and 0→1 opacity over 3 frames, staggered 1 frame per line. Labels change by blur crossfade (12.6: "Every frame is code" blurring into "Generate").
- Holds: a label holds 0.5–1.8 s. The longest hold is the 84,320 card (≈1.6 s) because the cursor keeps interacting with it.

## Colour, light, material

- **Ground:** warm off-white (~#ECEBE6) with a very soft radial vignette, lighter at the centre.
- **Object:** pure black (#000) with white content. Shadows are soft drop shadows, ~20–30 px blur at ~15 % opacity, offset down ~6 px. The shadow scales with the morph, so the object always looks lifted.
- **Light-mode states** (segmented control, card, ⌘K) switch the object to white with the same shadow. That is the only "material" change.
- **Accent:** the gradient album square, orange → pink → violet. It is the only colour in the piece, which is why it pops.

## Tempo & sound

- The music has a transient every 1.0 s (x.1 s), 120 BPM with an accent every 2 beats. **State changes land on the 8th-note grid (0.25 s)**: on-beat changes at 0.6, 1.1, 5.0, 7.1, 9.1, 12.6, and off-8th changes at 1.3, 1.85, 3.8, 6.35, 9.8, 11.8. A morph every 1–2 beats.
- The energy is flat by design: it is a loop with no build. The interest comes from the interaction density, which goes from 1 click to drags, scrubs and typing in the middle third (3–11 s).
- Each morph is short (≈0.2–0.3 s) inside a ~1 s state, so ≈75 % of the time the viewer reads and ≈25 % they watch the transformation.

## Steal for almost friends

1. **Make Bub the one continuous element (hook → end mark).** The current release changes subject by dissolves and whiteouts: blur dissolve at 0:06.5, pink whiteout at 0:22.5, blur smear at 0:43.5, and a cut to the faces at 0:50.5. Instead, Bub's bubble physically becomes each beat: bubble → 3 value chips (splits into 3 droplets) → search ring → match pill → "SAME!!" chat bubble → padlock body → face frame → end-mark pair. Use a hero sub-shape tween between every state (move 2), and never spawn the next scene from nothing.
2. **Use one morph recipe everywhere.** At 60 fps: 2-frame anticipation squash of 3–5 % → 6–10-frame transit with 6-sub-frame accumulation motion blur → spring overshoot of 4–6 % → settle by 0.25 s → content blur-in (8 px→0) staggered 2 frames per row. The current release's bubble moves (0:02–0:03 merge, 0:23 two bubbles) have no motion blur and no squash, which is part of why they read cheap.
3. **Values pick: elastic metaball selector.** At 0:09.5–0:10.5 the picks appear as numbered badges on static chips. Instead, a liquid selection blob jumps chip to chip (Family → Career → Adventure) with move 3's leading/trailing-edge stretch, built as an smin metaball in our raymarcher. Each chip lights its emoji as the blob arrives. Land each pick on a beat.
4. **Bub search: rolling counter.** 0:14–0:15 says "Bub is looking around…" with a static ring. Instead, a big rolling number with digit motion blur counts people scanned or matched, e.g. "12,480 → 312 → 3 → 1". It decelerates over ~0.6 s and lands on the moment Bub's eyes lock (the current 0:20 ring flash).
5. **"SAME!!": let the chat bubble morph out of the message, don't stamp it on top.** At 0:32 the current version slaps a separate "SAME!!" sticker over the phone. Instead, the "WAIT. Same!!" message bubble itself squashes, stretches with motion blur, and overshoots up to full-frame width, with the text blur-crossfading to giant "SAME!!", like move 1 at the 1.83 scale.
6. **Unlock: the toggle → segment trick.** The padlock shackle (0:49.5) should become the selected state of the next UI, e.g. the shackle arc becomes the ring around the revealed face circle, the way the toggle knob becomes the Day indicator at 6.33. That removes the current cut to the faces at 0:50.5.
7. **A real finger/touch indicator with accumulation motion blur** drives every interaction: value taps, Say hi, Unlock. Currently taps are mostly implied, with a grey dot at 0:10.
8. **Grid the whole film to 120 BPM 8ths (15 frames at 60 fps)** and place every state change on that grid, as this reference does.

## Don't copy

- Black-on-off-white monochrome: our brand is blue + coral on a light airy field. Take the physics, not the palette.
- Desktop UI content (⌘K, analytics, "made in code" labels): these are tiny micro-labels, a known rejection. Our UI text must stay big and legible at phone size.
- The locked camera and square, centred composition: fine for a 14 s loop, but too static for a 66 s vertical film that has to feel 特效. Pair this morph language with camera moves and light from reference 02.
- The flat energy curve: we need builds and peaks (search → match → unlock).

## Key frames

![Check → island mid-morph](frames/09-apple-morph-1.33s.jpg)
1.33 s: the check→island morph mid-stretch. Look at the horizontal ghosting at the pill's ends: the motion blur comes from sub-frame accumulation, not a Gaussian.

![Card overshoot](frames/09-apple-morph-1.97s.jpg)
1.97 s: island → player card at peak overshoot, with title and controls still blurred, waiting their staggered turn.

![Segmented control forming](frames/09-apple-morph-6.6s.jpg)
6.6 s: the toggle knob has become the black "Day" indicator. "Week" and "Month" fade up from blur left to right.

![Chart card forming with multi-sample blur](frames/09-apple-morph-7.4s.jpg)
7.4 s: the segmented control has dropped down into the card. The selected "Month" pill survives, and the ghosted cursor and labels show the accumulation blur.

![Scrubbing chart with tooltip](frames/09-apple-morph-8.6s.jpg)
8.6 s: the settled analytics card, cursor-scrubbed line, tracking tooltip and soft lifted shadow.

![Palette selection](frames/09-apple-morph-11.5s.jpg)
11.5 s: the ⌘K palette with the typed filter. The selected row inverts to black and is about to become the toast.

![Toast to button crossfade](frames/09-apple-morph-12.6s.jpg)
12.6 s: the toast label blur-crossfades to "Generate" as the pill narrows back to frame 0. This is the seamless loop point.
