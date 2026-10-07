# almost friends — special edition: what was decided, what went wrong, what prevents it

## Decisions

| decision | why |
|---|---|
| A new project folder, nothing shared but the cast photos and fonts | the owner: "can do a almostfriends-special/ with new music, new sound effects everything"; the released film and its uncommitted Chinese cut stay byte-for-byte as they are |
| The brand's look, the references' bar | the owner: "the reference video set the bar, the vibe and design you can keep the original version". The references are dark; the brand is daylight. The film opens at night *inside your bubble* (the brand's ink taken toward black) and lives in the day — the brand line played as light, and the night allowed only as the thing the day breaks out of (reel 05's lesson: dark looks were rejected twice; night → day is the accepted form) |
| One material for everything: soap film and Liquid Glass in one raymarched SDF scene | the references' best idea (ref 2: one element becomes every next thing) needs shapes that can merge, split and morph; a smooth union of signed distances does exactly that, and it is the physics of bubbles. Rasterised meshes cannot merge |
| Bub is the interface | the brand's character carried through every UI step: the question pulls out of him, the answers drip out of him, the picks go home into him and colour his film |
| The unlock forms the brand's mark | two equal bubbles that touch share a flat wall (Plateau); the brand's mark is a blue bubble and a coral one sharing a wall. Making yours blue and theirs coral turns the story's peak into the logo, and the end's gather makes it again from everyone |
| onetake as method only | github.com/feitangyuan/onetake is PolyForm Noncommercial. Its documentation (rhythm, carry, an operated camera, measured references, one sound room) shaped the work; none of its code is in this project. The reference analysis, the camera and the mixer are written here |
| Score: take s3 of three | measured, not guessed (tools/score_check.py): 120 BPM, the grid 30 ms early (the mix delays it 30 ms), hits at 2, 10, 16, 38, the breath at −36 dB, the climax from 28. Its groove drops at 6.0 rather than 2.0, so the picture moved: the pop at 2.0 is carried by effects over the quiet night pulse and Bub's eyes open on the 6.0 drop |
| Effects generated, not synthesised (mostly) | 32 sounds from ElevenLabs Sound Effects for 354 credits; the sub and the heartbeat are synthesised because they have to land on a frame. Every sound is placed by its own measured transient, peak or end |
| Adaptive shutter | film.samplesAt: twice the sub-frames on the pops, whip, dive and gather (no stepping in the streaks), half on the dead-still holds |

## Bugs and their prevention

| bug | cause | prevention |
|---|---|---|
| dashed rings across Bub, a line through an eye | `fwidth()` inside the raymarch loop: screen derivatives are undefined where neighbouring pixels are on different loop iterations, so the face's anti-aliasing width was garbage on the contours of step count | no screen derivatives inside non-uniform control flow; the face's AA width is computed from the hit distance (uPixAng). A debug view (`?ldebug=1`, hits per pixel) separates marching faults from shading faults |
| a shader that did not compile drew nothing, and the render carried on | GLSL ES does not allow a ternary on structs; three.js logged the error and kept going | `renderer.debug.onShaderError` throws: a failed program now stops the render at boot |
| the frame went white for a quarter second after the pop | the night's bloom threshold (0.55) was still in force when the daylight arrived, and the day's sky is brighter than that | bloom thresholds sit at ≥ 1.0 everywhere: only light brighter than paper (the rim light, film glints) blooms, never words or sky |
| the words blurred into glowing blobs at night | white type under a low bloom threshold | same rule; night type is set at 93 % white |
| colour mixes threw `not a hex colour` | `mixHex` returns `rgb()`, and the dusk mixes chain | `hexRgb` reads its own output |
| Bub peeked at the bottom of the chat 8 s early | `easeOutBack(0)` is ~1e-16, which passed a `> 0` test | test the eased parameter (the linear segment), never the eased value, for "has it started" |
| the glass pill vanished on the sky | clear glass on a pale ground refracts a pale ground | glass carries a frosted body (haze), a darker silhouette line and a design shadow on light |
| the chips dripping from Bub read as melting | thick slow necks on six drops at once | quick ejections: a 0.13 s neck, then an arc |
| the counter's line was 19 px tall | type sized from the camera's distance with the wrong constant | every on-glass label is sized from k (pixels per world unit at its depth) and checked in stills at full size |
| the crowd popped into existence on the whip | the crowd mesh switched on at 10.0 | the crowd fades in over the whip's first 0.2 s, hidden in its blur |
| a one-frame jump of 171 (of 255) at 28.02 s in v1 | the dusk was switched off at the pop (`1 − seg(t, pop, pop + 0.01)`) while the ring of daylight was meant to sweep it away | light changes are carried by something that moves across the frame (the flood ring), never by a parameter that snaps; the jump gate measures every frame (`tools/check_jumps.py`) |
| a dark dot beside Hana's photo as the reveal began | Sofia's photo drawn at a spring value of ~0, a few pixels wide | a photo is drawn only once its scale passes 6 % |
| the dive into the one was a flat 2D wash | a gradient pretending to be film | a sheet of real film raymarched just in front of the lens (`lensFilm`), the 2D wash under it at 45 % |
| at 15.55 s Bub lost his face and both bubbles their colour for a frame (jump 25) | fill and face were painted only on the *first* front surface a ray met; the lens film became that surface | fill and face are painted on every front face; the gate's per-frame difference found it, a frame pair showed it |
| the dive's cut still jumped 41 at 15.87 s | the lens film was a thin solid box, and the camera was inside the one's bubble: inside a solid union, another solid is no surface, so the film vanished on the crowd side of the cut | a film that must be seen from inside a bubble is a sheet (type wall), not a solid; the cut now measures 2.1 |
| "Ready to meet?", "Just talk.", the last messages and "98% match" left before they could be read | holds set by the beat, not by reading time | `tools/check_reading.mjs` (advisory, the released film's guide): five messages instead of six, the drain moved to 21.8, longer holds |

## Numbers

- ms per sub-frame (GPU-synced, `tools/bench.mjs`): 45 on the look-dev frame (8 primitives, Bub large).
- The first full render (1080p, base 10 sub-frames, adaptive): 803 s for 2,640 frames on 3 workers (3.6 fps at the end;
  10.0 sub-frames a frame on average).
- v1 gates: frame gate PASS (two designed luminance flips, 2.02 and 28.02; the chat's night reported as a dip, by
  design); jump gate PASS with one designed hit (28.02, 171) — which was a snap, fixed in v2.
- The master (v5): frame gate PASS (one designed flip, the pop at 2.02; the chat's night reported as a dip by
  design); jump gate PASS with no jumps at all; 1080×1920, 60 fps, 2,640 frames, BT.709, 34.6 MB; −14.2 LUFS,
  LRA 7.4, −1.5 dBFS peak. Web cut (6 Mb/s two-pass, master's audio): 32.7 MB.
- Reading (advisory): 32 strings, 5 under 80 % of the guide — "your bubble." (read again as the full line in the
  day), "Family" (a chip label, tapped first), "98% match" (a label), "Just talk." (the last of three hits),
  "she wants to meet you lol" (1.7 s of 2.75).
- Renders: 738–803 s for the 1080p master on 3 workers (10 sub-frames a frame on average).
- Loudness arc (K-weighted momentary, LUFS): night −16 · pop −10 · day hold −22 · drop −13 · whip −12 · hits −12 ·
  wait −18 · second pop −9 · mark −10 · ring-out −51. Master −14.0 LUFS integrated, −2 dBTP ceiling.
