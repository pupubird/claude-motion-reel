# almost friends — special edition: what was decided, what went wrong, what prevents it

## Decisions

| decision | why |
|---|---|
| v6 is the released cut with liquid bubbles, not a new film | v5 (a new 44 s film, `v5/`) had "cooler" animation but lost on "tempo, taste"; the owner: "can refer to prev … version, it got the tempo music and message etc right". Measured, v5 had 24 of 44 seconds dark, wordless or only tiny words (released: 6 of 66), three low-energy stretches (released: one breath) and five colour worlds (released: one) |
| Fork the released code at `almostfriends-v1.0`, never edit it | the released film and its Chinese cut stay byte-for-byte; the fork rendered pixel-identical to the release before any change (8 stills, max difference 0) — the proof that every later difference is a deliberate one |
| The liquid layer is a pass between UNDER and OVER, opt-in per scene | a scene returns `liquid(t) → { prims, cam, face, … }`; frames without primitives take the released path unchanged, so a liquid moment cannot disturb the shots around it |
| 2D-laid-out shots place liquid through one fixed lens (`src/liquid2d.js`) | the released UI shots are laid out in frame pixels; a narrow lens (30°, 10 units) puts a sphere exactly where the 2D circle was (≤ 1 % stretch at the edge), so the liquid inherits the released choreography untouched |
| The phone is drawn in UNDER | the liquid sits between UNDER and OVER; bubbles that live on the phone's screen must render over it. Captions and overlays stay in OVER (measured: the move changed the phone shots by ≤ 2 levels of 255) |
| Ink orbs wear a "coat" | a person's orb is inks under a clean glossy skin (achromatic Fresnel, the softbox mirrored as a window, the film's colour at the rim only) with the app's own colour layout (first ink fills, second floods from the right, third from the lower left). The soap film's full reflection over an opaque ink read as dirty |
| The two never merge into one | the wall tears and they spring apart: friends, not a couple (the release's own rule) |
| The score and mix are the released film's | the owner said it "got the tempo music … right"; the cut is unchanged, so the mix (`../almostfriends/audio/mix.wav`) fits to the frame |

| The phone is a real 3D object, its screen a live texture | the owner asked for a phone that is "3d also" and a camera that zooms and never rests; drawing the released screens into a canvas each frame and mapping it onto a device keeps every UI animation and its timing, while the lens can orbit it |
| A phone pose is a 2D framing plus an angle | the released framings (where the screen sits, how big) stay exact when facing; the lens orbits the framed point (yaw, pitch, roll), and a view offset keeps that point where the framing put it |
| Type stands in the shot, held in its band | type placed by a lagged lens trails beautifully with a wide lens but leaves its band with a narrow one (a 5° turn of lag is 360 px at 26°); the layer is held in the band and leans by the lens's turn instead |
| Type renders before what stands in front of it, without depth | (second pass; replaced by the third) a faded phone and a veiled crowd still write depth; ordering by render order lets the type show through them while the liquid, drawn after, bends it |
| Type is a thing in its shot, never a layer on it (third pass) | the owner twice: the text felt "slap on top", "text on top only"; the references (AVYREON, the music-tool film, the ChatGPT study) never put words in a band, on a plate or under a shadow — they set a word beside, on, inside or behind its object, in its light, and move it with the scene. Every line is now a sign pinned in its shot's world (`src/gl/sign.js`) or written on its object (the wall), placed by its subject |
| The step captions stand beside the phone, which turns to them | in 9:16 a phone big enough to read leaves room above it (the band the owner rejected) or beside it; a two-shot with the phone turned toward its words reads as one composition, and the lens can leave it for the UI and come back (the phone and the frame edge cover the words naturally) |
| The lens racks focus to a caption as it lands, then to the phone | the words are the shot's subject for their first second; in a close-up the caption behind is soft, as anything off the focal plane is |
| Values are beads of ink everywhere | the value's tags, your picks (which fly from the tags to the words and fill your orb) and what the two of you share are the same object, so the words and the story's objects are one system |
| Labels hang under their bubble | the search's "Wealth first", the value's tags, the names under the faces: one rule, at the bubble's depth, so a label moves with what it names |
| The phone's screen is an iPhone 16 Pro's, 402 × 874 pt | the owner: "the phone can make proper iphone size? look odds to me". The released screens were laid out 1080 × 1920 — the frame's own 9 : 16, not a phone's 19.5 : 9 — so the device came out squat, which the 3D turns made plain. `SH` (config.js) is the screen's height; content keeps its place from the top, and what belongs to the bottom (composer, home indicator, the unlock sheet) moves down with it |
| The friends gather round the words | the words sit in a pocket inside the crowd (above, beside and below them), not in a cleared band; the crowd is born from the middle of the group (the two of you and the words) outward, so the words are among friends from the first |

## Bugs and their prevention

| bug | cause | prevention |
|---|---|---|
| gold #FFB224 rendered salmon, every liquid ink darker and more saturated than the brand (v5 shipped with it: part of why its scenes looked dark) | the liquid layer decoded each hex twice: three's `new Color(hex)` already returns linear values in r152+, and `.convertSRGBToLinear()` decoded them again (gold's green 0.445 → 0.167) | decode once; `tools/check_liquid.mjs` checks every brand colour against the sRGB formula (it fails 9 of 9 on the old code) |
| the wall two touching bubbles share did not show | seen edge-on, a wall sheet "captures" every ray marching beside it (its distance stays below the hit threshold), so those rays never reached the bubbles' surfaces, and the Plateau-border line drawn from that distance never appeared | walls seen within 6° of edge-on are skipped by the march (no area to draw); the border line is measured from the wall's rim circle analytically |
| bubbles floated over the next screen during an iOS push | the liquid draws over the whole of UNDER, the phone included | every primitive carries its own clip rect (field 12); a scene's clip applies to its primitives |
| one clip rect could not hold Bub (above the sheet's edge) and the orbs (below it) at once | the clip was per frame | per-primitive clip (same fix) |
| their padlock hid behind the liquid orbs, then hid the orbs as they burst out | the padlock was in UNDER with the phone; liquid is drawn over UNDER | the padlock is drawn in OVER until the drop and goes back to UNDER with the phone at the drop |
| the orbs stretched into lozenges as they sprang apart | a velocity stretch at 4.5 × 10⁻⁴ per px/s, clamped at 30 % | 6 × 10⁻⁵, clamped at 5 %: the motion blur carries the speed |
| the faces in the friends' bubbles wore rainbow patches | a soap film reflects colour across its whole face | soap's `frost` field clears the film toward its middle; colour stays at the rim |
| the liquid mark looked pastel and soft-edged next to the brand's | the sky mirrored at the silhouette (Fresnel) lightened the edge into the pale background | the mark's skin damps the grazing reflection (`tintAmt` on soap), no haze, a thin rim |
| liquid placed against the lens lagged a sub-frame | the liquid was gathered before the 3D shot set its camera | the engine runs the 3D shot's update first |
| at the drop the 3D phone vanished at 50.05 s | the reveal's universe (a later scene) took the 3D pass from the lift, and the engine shows one 3D shot at a time | the universe starts at 50.37 s, when the phone has faded (its alpha ends at 50.36) |
| captions jumped ~360 px off their band on fast turns, the step badge left the frame | the type was placed by the lens 0.09 s earlier; with a 26° lens, the rotation lag is a large shift | the type is placed by the live lens in its band and leans by the turn (capped at 12°) |
| the bubbles on the phone floated over the caption band | the liquid ignored the phone's fade under the caption | (third pass: there is no caption band, no fade; `fadeY` removed) |
| a white haze over the sky above the phone; the Dynamic Island grey (owner: "some scenes top part is blurred out") | the phone shots kept the release's bloom (0.25); the titanium band's top edge reflects the studio's ceiling well past 1.0 and bloomed into the sky | no bloom on the phone shots: a product shot stays crisp (the bubbles' highlights read without it) |
| whole-phone shots felt off-centre ("doesn't feel like center aligned") | the iPhone-shaped screen is 22 % taller, and the framings placed it from a design row near its top, so it hung low with empty sky above | one resting row (`PHONE_CY` 950): a whole phone's screen is centred on it; a two-shot keeps the phone's band as far from the right edge as the caption's ink is from the left (`MARGIN`), and the caption block is centred on the same row; its column is measured from the phone's edge at its key shot |
| every step caption vanished | the caption's pin position was stored as `at`, the field that already held its arrival time, so no caption was ever "live" | the position is `spot`; build() throws if a caption's `at`/`out` are not numbers or were overwritten |
| the 3D phone looked squat ("look odds") | the screen took the frame's 9 : 16 for its own shape | one screen height for every screen (`SH`, an iPhone 16 Pro); bottom-anchored UI reads `SH`, never the frame's `H` |
| the hook's words came out mirrored on the wall | a canvas texture is flipped (v up); the wall's shader mapped frame y downward | the wall maps v = 0.5 + y·k (commented at the line) |
| a caption slid off the frame's edge while it was being read | the lens's creep in a hold turned and pushed in; the caption stands deeper than the phone, so it moved most (parallax) | holds that compose a caption creep 2–3 % and 1–2°; a caption mostly out of frame is let go (`framed()`), so no sliver of a word is stranded |
| the universe's caption was buried in the crowd | pinned where the frame's upper left lies, 15 units ahead — inside the tunnel's crowd | it floats in the clear core 4.6 units ahead, carried with the flight a beat behind its turns |
| the crowd hid the value's tags and labels | the value stood 7.5 units ahead, behind the nearest people | 4.5 units ahead, in front of them, drifting with the lens (it gains on the words gently) |
| a drifting bubble could fill the lens on a deep push (shot 10–14) | air placed in the world does not know where the lens goes | each air bubble fades as it nears the lens |
| the 1-sample preview flagged jumps at 3.33 s and 22.75 s | a single instant at a cut (the mark gone, the cut out of their film); the master's 16 sub-frames blend it, and v6.1's master shows the same frames | gates run on the 16-sample master only; previews are for looking |

## Numbers

- **The fork:** 8 stills rendered from the forked code matched the released code's pixel for pixel (max difference 0)
  before any change; moving the phone into UNDER changed the phone shots by at most 2 levels of 255.
- **The master (v6):** 1080×1920, 60 fps, 3,960 frames, BT.709, CRF 14, 59.4 MB; rendered in 864 s on 3 workers at
  16 samples a frame (4.6 fps). A 23.6 MB preview (two-pass, 2.85 Mb/s) for review.
- **Gates:** frame gate PASS (mean luma 0.74–0.93; no flips, dips or drops); jump gate PASS with the release's designed
  hits only (the knocks at 0.52/0.53 s, the day turning at 38.27 s); liquid colour check PASS.
- **Reading (advisory):** 77 strings, 5 under 80 % of the guide — the "Pick 3 · n/3" counter as it ticks and a rank
  badge, as in the release (the words are the release's).
- **v6.1 (the 3D phone, the moving camera, type in the scene):** 1080×1920, 60 fps, 3,960 frames, 71.0 MB; rendered in
  967 s on 3 workers at 16 samples. Frame gate PASS (mean luma 0.76–0.93); jump gate PASS with the release's designed
  knocks only (near misses at 23.65 s, 9–12 of the threshold's 12: the push onto the kiss starting fast); colour check
  PASS; reading 77 strings, 5 under 80 % (the same counter). Motion: in the phone shots (7.5–50 s) the picture is still
  in 10 of 85 half-seconds (the release: 38); 8.94 new pictures per 10 s (6.52); mean motion 2.19 (1.47); timing,
  light and sound unchanged (loudness identical every second).
- **v6.2, released (type in the scene, an iPhone-shaped phone, centred compositions):** English and Chinese 1080p
  masters, 1080×1920 60 fps, 3,960 frames each, 72.2 MB and 71.5 MB (16 samples, 3 workers: 1,035 s and 1,011 s); web
  cuts 48.6 MB and 48.7 MB (two-pass 6 Mb/s); 4K masters at 2160×3840, 140.4 MB and 140.8 MB (3,455 s and 3,427 s), the
  same gates passing on them (frame gate; jump gate with the designed knocks only), −14.0 LUFS, −1.0 dBTP. Frame gate
  PASS on both (mean luma 0.755–0.933; no flat, blown, dark or flipped frames); jump gate PASS on both with the release's
  designed knocks only (the Chinese cut's near miss at 9.88 s is the lens riding the finger to the second tag); colour
  check PASS. Reading: English 86 strings, 4 under 80 % of the guide (the "Pick 3" counter, as released); Chinese 83, 5
  under (the 选 3 个 counter and 我也是!! in its 1 s burst). Loudness −14.0 LUFS integrated, −1.0 dBTP true peak (the
  released mixes, identical every second). Against the release: mean motion 2.25 (1.44), novelty 14.8 (10.2), still
  frames 8.3 % (18.9 %), 8.0 new pictures per 10 s (6.5), the longest gap 5.1 s (5.5 s), no dark frames.
- **Tempo, measured against the release** (`measure.py`: novelty peaks, holds, light, loudness): 43 picture changes in
  66 s for both (6.52 per 10 s); longest gap 5.47 s (release 5.45 s); still 19.7 % (18.9 %); dark 0 %; mean luma
  0.869 (0.869); loudness identical every second (the same mix). v5 for contrast: 5.0 changes per 10 s, 9.5 % dark,
  three low-energy stretches.
