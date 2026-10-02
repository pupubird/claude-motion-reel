# 翡月荟 v4 — what was learned

## Workflow

1. **One grid.** `src/config.js` holds every anchor (`T`) on a 120 BPM grid. The picture, the cue sheet
   (`tools/cues.py` parses `T` out of config.js) and the score plan read the same numbers. Re-timing the film is
   one edit, and the sound follows.
2. **Look-dev by stills.** `render.mjs --shots=X --stills=…` renders single frames at full resolution in seconds.
   Every look decision was made on 1080p stills, never on contact-sheet thumbnails: the craft scenes looked fine
   small and cheap at full size.
3. **Measure, then judge.**
   - `tools/labstat.py` calibrated the jade against the client's photographs.
   - `tools/beats.py` picked the score take: onset at the drop, phase to the grid.
   - `tools/mix.py` prints every cue's level against the local score.
4. **Gates before "done".** `tools/check_frames.py` checks for black or blown frames and luminance flips.
   `tools/check_audio.py` checks −14 LUFS, true peak and empty bars.

## Decisions

- **Concept.** The founder's 拨开云雾见明月 staged literally, then 聚日月精华: the moon opens the film, the sun
  closes it.
- **40 s, not 30.** Feedback on the 30 s cut: text passed before it could be read, and scenes ended before the eye
  recovered. The same structure got 20 bars. Every word now holds at least 1.5 s after it is fully formed.
- **The ending.** It is a monument, not a fade:
  - the six pieces orbit the sun on light trails and contract into it;
  - a burst brings god rays, a shock ring and sparks;
  - the phoenix is born in solid gold (extruded from the client's own vector traces);
  - the name flies in and the tagline rises.
- **Luxury is designed reflection.** A polished surface looks like what it mirrors. Both craft rebuilds came down to
  giving each material its own studio (`src/env.js`):
  - **Gold plate:** a rolled soft band, so the plate holds one diagonal sweep of light into black-gold.
  - **Diamonds:** black with small hard sources, so they scintillate.
  - **Jade:** a soft panel in front, so the polish holds a sheen while gold leaf glows.
- **雕刻 → 玉册 描金.** Gold-filled carving on deep emerald, after the Qing court's jade albums.
  - Frosted-white cuts on pale jade read as plaster.
  - Gold running down the strokes gives the scene its second beat and ties it to 镶嵌.
- **The moonrise.** A green blob of "cloud bank" read as flat whatever was done to it. Flying over a real cloud sea
  toward a glow, with the ring rising out of the cloud, turned the same idea into an event.

## Bugs — root cause → fix → prevention

| Symptom | Root cause | Fix | Prevention |
|---|---|---|---|
| Render hung to the 600 s timeout | `main.js` imported shots that did not exist yet; the page never set `__ready` | Shot imports `.catch` and log | Kept; the render times out loudly |
| ElevenLabs music HTTP 422 | A composition-plan line over 200 chars | Split lines | `music.py` asserts ≤ 200 chars per line |
| Whole frames black, then everything after | `Vector3.copy(Color)` produced NaN in a uniform; bloom spread it | `.set(r, g, b)` | NaN/Inf guard in `ACCUM_FRAG`; frame gate flags near-black frames |
| 雕刻 frames black below a line | `pow(x, 2.0)` with negative `x` is NaN on Metal (ANGLE) | `d * d` | Never `pow()` a signed value in GLSL; same guard and gate |
| Jade in front of the moon window didn't glow | three.js leaves **transparent** objects out of the pass transmissive materials refract | Window glass `alphaTest` instead of `transparent` | Comment at the glass in `worlds/beamroom.js` |
| Stair-stepped hard edge in the gold plate's reflection | Soft boxes drew opaque black margins and occluded each other in the PMREM; the 256 px cube made the edge stairs | Soft boxes additive (no depth); gold studio at 512 px | `buildEnv` soft boxes are additive by construction |
| Plate's sun highlight a blown double disc | The jittered area light's specular on a 0.055-roughness mirror | Per-material `directSpecular` × 0.18 | — (look decision) |
| 镶嵌 macro blurred edge to edge | Thin-lens CoC with focus ≈ focal length (75 mm at 7.6 cm): `zf − f` → 0 | Pull back to ~10 cm; scale DOF per shot | `engine.js` warns once per lens when focus < 1.3 f |
| Gold leaf read khaki | The carve texture's frost is well under 1 on a groove floor; the mix left half jade | Threshold frost into a mask | Comment in `lib/gild.js` |
| Gold leaf read cream | Khronos Neutral bleaches channels past ~0.8; the leaf's red ran to 1.6 | Lower its reflection boost (1.9, not 4.4) | Judge metals at full res after tonemap, not by intent |
| Opening camera flew into the cloud | Its target followed the sunken ring | Aim at the moon's final position; follow the glow with a floor at the local cloud tops | — |
| A cue silent in the mix | The generated "drone" came back −61 dB RMS | Cue dropped | `sfx.py` prints each take's RMS and flags < −45 dB |
| Diamonds grey, then starbursts | The room's env (dark) / glint pass on every facet | Gem studio per material; glint threshold per shot | — |
| Jade candy, then blown in daylight | Calibrated only against a black-background photo | Calibrate on cream as well | Lab shot (`?lab=`) with both backgrounds |

## Quality gates (final render, `out/feiyuehui-v4.mp4`)

The render: 2400 frames at 16 samples, 1920×1080, 60 fps, 40.000 s, H.264 CRF 14 plus AAC 320k.
- 1983 s on an M2 Pro.
- An 82 MB master, and a 26 MB two-pass phone copy (`-phone.mp4`).

**Frame gate: PASS.**
- No near-black or blown frames.
- 3 luminance flips, all designed cuts: 9.5 s the hoop, 17.5 s 设计 → 雕刻, 24.0 s the drop. At most 1 in any second.

**Audio gate: PASS on the delivered mp4.**
- −13.6 LUFS, true peak −1.4 dBTP, no bar more than 30 dB under the loudest.
- The first mux failed at −0.9 dBTP: the AAC encode overshoots the WAV's peak. The mix now masters to −1.5 dBTP,
  and the gate runs on the mp4.

**Reading time** (each word from fully formed to gone):

| Word | Formed | Gone | Hold |
|---|---|---|---|
| 拨开云雾 · 见明月 | ≈ 4.8 s | 8 s | ≈ 3 s |
| 严选 1% | ≈ 11.6 s | 14 s | ≈ 2.4 s |
| 设计 | ≈ 16 s | 17.5 s | ≈ 1.5 s |
| 雕刻, gilded | ≈ 19.75 s | 20.5 s | ≈ 0.75 s, legible carved from ≈ 19 s |
| 镶嵌 | ≈ 22.5 s | 24 s | ≈ 1.5 s |
| 翡月荟 · tagline | ≈ 36.5 s | 40 s | ≈ 3.5 s |

**Spend.** ElevenLabs used 6,956 credits for all of v4: 64,682 of 300,000 used now, against 57,726 at the start.
That covers music takes t1–t4 (30 s) and c5–c7 (40 s), and 28 sound effects. No image or video generation was used.

## Generative realism pass (2026-10-01): what was tried

Goal: make the film hyper-realistic without disrupting any element. Test clips: moonrise 1–6 s, craft 17.5–24 s,
orbit 28.5–32.5 s; all 24 fps cuts of the master.

| Model (Higgsfield) | Result |
|---|---|
| Seedance 2.5 `video_edit` | **8 / 8 jobs failed**, all refunded, no error text. Tried 480p, 720p and 1080p; structured and plain prompts; with and without Chinese text; uploaded files and a Higgsfield job output as input |
| Seedance 2.5 `omni_reference` (fine-blockout re-render) | Failed too, refunded |
| Genjutsu motion transfer (`hf_mult_motion_control`) | Failed after ~30 min, refunded. The web UI's Restyle is not exposed through the API |
| Kling 3.0 Omni Edit (`kling_video_edit`, pro) | Works: 10–12 credits per clip. Framing, objects and calligraphy kept exactly, 0 px shift |

Kling's realism and preservation trade off against each other:
- Unconstrained, it regrades the pale dawn into a dark sunset.
- With the palette locked, it barely changes anything (SSIM 0.99).
- The middle prompt gave real photographed cloud but kept the CG ring, and dropped the green glow under the cloud.
- On the craft clip it gilded the strokes before the carve finished.

None reached hyper-real. Seedance 2.5 is the candidate, and it is blocked on this account's API path.

**Tools built for this pass**
- `?matte=1` render mode (`Engine.matteSwap`) gives type and logo coverage with the picture's own motion and lens blur
  → `out/matte.mp4`.
- `tools/v2v_comp.py` composites the original type back over an AI pass.
- `tools/v2v_compare.py` measures drift (SSIM, edges kept, shift).

**Lesson:** a grown matte brings the original background back around each glyph. Over an AI pass that changed the sky
it shows as a halo, so use the exact matte (`--grow 0`) unless the model also moved the glyphs.

### Update (2026-10-02): Seedance 2.5 works, with a clay blockout

On 2026-10-02 Seedance 2.5 was back; the previous day's 8/8 failures were their outage, not our footage.

| Input | Mode | Result |
|---|---|---|
| Our finished CG | `video_edit` | Changes almost nothing (SSIM ≈ 0.99). It swapped the two calligraphy columns, dropped the green glow and returned 4.71 s for 5 s |
| Our finished CG | `omni_reference`, with or without the ring photo | Same CG back. A finished-looking input reads as "keep this look" |
| **Clay blockout + the client's real ring photo** | `omni_reference` | **The ring comes back as real product photography**: true jade translucency, real pear and round diamonds, real platinum, no filter glints. Clouds, framing and timing are kept |

The clay blockout is `render.mjs --q="clay=1&notext=1"`. Every lit object is one neutral grey, glints are off and the
type is hidden.

**The recipe**
1. Render the shot as clay without type: `--q="clay=1&notext=1"`.
2. Run Seedance 2.5 `omni_reference`, duration = the clip, with the client's product photo as `@Image 1`. Use the fine-
   blockout prompt: preserve structure, action, camera and timing; do not use the clay materials; re-render as the
   real product.
3. Composite the original type back: `tools/v2v_comp.py --grow 0`.

Cost: 12 credits per second at 1080p.


### Delivered (2026-10-02): `out/feiyuehui-v4-real.mp4`

Cut by `tools/v2v_edit.py` from the edit list `tools/real_edit.json` (`npm run fy:real`). 40 s, 1080p24, 960 frames.

| Film | Source | What was checked |
|---|---|---|
| 0–14 s | c1 take 1; claws removed from 11–14 s by Kling Omni Edit; 0.25 s crossfade at 11.0 s | The real ring (pear and round halo, rose-cut band); a loose stone at 严选 1% |
| 14–17.5 s | c2 take 1, source 0–3.04 s ramped to 3.5 s | 设计 type from the matte |
| 17.5–20.5 s | 雕刻 single shot from the gold clay, with the client's bangle photo as the colour reference (take 4) | 描金 kept; settles at 2.75 s, as the clay does |
| 20.5–24 s | 镶嵌 single shot, take 2, speed-ramped | Title held 1.5 s |
| 24–25.5 s | c3 take 2, 3.5–5.0 s | The Buddha matches the real piece |
| 25.5–33 s | c4 take 1 | All six pieces match their photos; cuts on the beats |
| 33–40 s | CG master | Seedance returned it unchanged |

Gates: frame PASS; audio −13.6 LUFS, −1.4 dBTP, PASS (master and phone copy). The realism pass cost about 1,380
credits in all (4,033 → 2,653).

**Lessons**
1. Regenerate a failing shot on its own. In a chunk with several cuts, Seedance drifted: c2's 雕刻 got a needle tool
   and lost its plaque. Run the shot alone, freeze-padded to whole seconds, and trim it after.
2. Seedance follows the prompt's timing labels over the clay. Under "pull back 1.2–3 s" on a clay that pulls back at
   1.25–2.0 s, one take lagged by a second. Write the labels from the clay's measured timing.
3. Whatever the clay drops, the take drops. The clay swap removed the 描金 gold, so the first 雕刻 takes had no gold.
   Paint the effect back onto the clay: `?matte=1&gildmatte=1` renders where the leaf is laid. With it, every take
   kept the gold run.
4. An image reference pins a material. The client's bangle photo turned a mottled moss-on-white plaque into even
   imperial green.
5. A product photo leaks its setting. The ring photo put claws on the loose cabochon. Kling Omni Edit removed them
   surgically: 0.2 px shift, about 11 credits.
6. When a take settles late, ramp it rather than repeating frames. `v2v_edit.py` takes a `"map"`: a monotone cubic
   through (film, source) points, motion-interpolated at 120 fps and blended.
7. Seedance can emit near-duplicate frame pairs in a very fast whip (c1 at 11.5 s). Kling reproduces them faithfully,
   so check the source before blaming an edit.

**Bugs found and fixed**

| Bug | Symptom | Fix and guard |
|---|---|---|
| `v2v_comp.py` merged in YUV, with a grey matte converted to YUV | Every pixel took about 50 % of the CG's chroma and 7 % of its luma. A green ghost sat beside the AI stone and the gold type turned grey. This was also in the moonrise demo sent on 10-02 | Merge in planar RGB (`gbrp16le`) with the matte in all three planes. `--selftest` checks it; the old graph fails the test (orange → [157, 130, 152]) |
| `check_frames.py` assumed 60 fps | On the 24 fps cut it mislabelled times (a "3.78 s" dip was really 9.46 s) and stretched its windows ×2.5 | It now reads the frame rate, and every window is in seconds |
| ffmpeg `-t` placed after `tpad` | The output option cut the freeze pad off | Put `-t` on the input |
