# LEARNING — Adswinning showreel (reel 02)

A 30 s, 1080p60 product showreel rendered from code, built on the reel-01 engine (`../claude-reel/LEARNING.md`).
This file records what was **new**: techniques, decisions, bugs and gates. Read reel 01's playbook first.

---

## 1. Workflow that worked (in order)

| # | Phase | Exit criterion |
|---|---|---|
| 1 | Read the client's design system *from its code*: `DESIGN.md`, `index.css` tokens, `mark.svg`, landing copy, the React components that render the product | Palette, type, motion spec, voice and UI anatomy written down before any scene code |
| 2 | Grid: 128 BPM × 16 bars = 30.000 s; 8 chapters × 2 bars | Math closes; one HUD chapter per 2 bars |
| 3 | Generate creative in parallel with engine work (Higgsfield batches of ≤ 12) | 16 hero ads (2k) + 36 wall ads (1k) ≈ 70 credits |
| 4 | Build scene by scene, rendering stills after **every** scene | Contact sheet clean before the next scene starts |
| 5 | Move every timing anchor into `score.js` before writing audio | No `*_T` constants left in scene files |
| 6 | Soundtrack from the score, then `--audio` + `check_audio.py` | Per-bar RMS, −12.3 LUFS, true peak ≤ −1 dBFS |
| 7 | Full 2-sample preview on 2 workers → sheet (0.5 s) + transition strips + `check_frames.py` | Every hand-off continuous, photosensitivity ≤ 3 flips/s |
| 8 | 8-sample final on 3 workers → ffprobe, gates, sync frames at each drop | All green, bt709 tags present |

---

## 2. New techniques (copy these)

| Technique | Where | How |
|---|---|---|
| **Pixel-exact 2D ↔ 3D hand-off** | query → grid, grid → detail | Perspective camera at `D = (H/2) / tan(fov/2)` makes 1 world unit = 1 px at z = 0. Draw the same card with the same function into the 2D layer and into the GPU texture, and the cut is invisible |
| **Anamorphic logo lock** | aperture | Place each layer of the mark at its SVG x/y but a different z, and look through an **orthographic** camera. Any off-axis view reveals depth; the exact front view *is* the flat logo, with zero parallax error |
| **Isometric cuboid from SVG** | aperture | Top rhombus 8 × 4.6 and edge 5.1 in the SVG give a box of 5.657 × 6.246 × 5.657, rotated `Euler(atan(1/√2), π/4, 0, 'XYZ')` |
| **Per-fragment DOF for instanced cards** | table, grid | CoC = `A·|depth − focus| / focus` in object units drives SDF edge softness *and* a texture LOD bias. No depth pass, no BokehPass halos, cost ≈ 0 |
| **Loupe refraction in the composite** | table | Magnify the 3D layer inside a circle, fall off toward the rim (barrel), split RGB at the edge, add a bevelled rim lit from the upper-left and a soft offset shadow outside. The 2D layer is *not* refracted, so UI stays crisp |
| **Lens portal** | table → query | The next scene draws itself clipped to the lens circle, scaled with the lens radius. The radius grows `inExpo` to cover the frame on the drop |
| **Shader-revealed evidence** | grid | Two textures per card (base and full). The shader wipes the signal-bar rect left→right and fades the chip rect in, so there are no per-frame texture uploads |
| **Sub-pixel TAA jitter** | engine | Halton(2,3) offsets added to `projectionMatrix[8,9]` (perspective) or `[12,13]` (ortho) per motion-blur sample, then undone after render |
| **Per-scene tone curve** | engine | `tonemap: 0` exact (UI, logo), `1` ACES, `2` knee (identity to 0.8, soft shoulder) for ad creative with bloom |
| **Continuous width axis on canvas** | signals | Canvas `fontStretch` only takes keywords, so `fontTools.varLib.instancer` pins `wdth` at 75…100 into six faces (wght stays variable) |
| **Constant-speed pen** | signals, board | `setLineDash([L, L])` with `lineDashOffset = L·(1 − p)`, the same L for every path, so strokes draw at one pen speed whatever their length |
| **Parallel render** | render.mjs | N Chrome pages each render a contiguous slice to FFV1 (`bgr0`), then concat + one final x264 encode with the WAV |

---

## 3. Decisions

| Decision | Chosen | Rejected | Why |
|---|---|---|---|
| Ad creative | AI stills for **fictional** brands | The real ads used in the product demo | The film attaches spend/reach/days figures to ads; inventing metrics for a real advertiser would be fabrication |
| Demo query | Keyword `cold brew coffee` | A brand URL | Exercises keyword expansion, two libraries and the relevance filter, with no fake domain |
| Palette use | Sulphur only for signal (glow, bars, highlighter) | Sulphur backgrounds | The brand rule: *sulphur is the only saturated colour and marks one thing* |
| UI | Rebuilt from the React sources at film scale | Screen recordings | Frame-exact, resolution-independent, and every element animatable |
| Signal card backgrounds | Light / dark alternation capped by the frame gate | Alternating every card | Measured 5 flips in 1 s; restyled to ≤ 3 |
| Detail readout | Meta RANKED = *Not applicable*; SPEND = *Not disclosed* | Filling every slot | Mirrors the product's `ABSENT_COPY`; the honesty beat depends on it |

---

## 4. Bugs found → root cause → prevention

| Symptom | Root cause | Fix | Prevention |
|---|---|---|---|
| Sulphur backlight never showed | three's `AdditiveBlending` is `(SRC_ALPHA, ONE)`, and the shader wrote alpha 0 | Output alpha 1 | Additive materials: alpha 1, or `CustomBlending` One/One |
| Backlight flooded every gap orange | Linear strength; overlapping halos sum; bloom on top | `strength⁴`, tighter falloff, bloom 0.38 | Check glow on the *weakest* card, not the strongest |
| "Unlit" frames read at ~20 % | 4.5 % in linear light becomes ~21 % after sRGB encoding | Floor 0.8 % linear; the table powers on with the wave | Set floors in linear, then verify **sampled pixel values** (thumbnails exaggerate) |
| Grey frame at 15.0 s | The impact flash fired over an unbuilt scene | Build the scene | A frame gate flags empty and flat frames |
| MP4 colour primaries/trc `unknown` | ffmpeg 8 takes colour tags from frame metadata; `-color_primaries` alone is ignored | `setparams=...` at the end of `-vf`; lossless retag via `h264_metadata` bsf | `ffprobe` colour fields in the pre-flight |
| Photosensitivity: 5 luminance flips in 1 s | Signal cards alternated ground/petrol/well every 0.75 beat | Keep REACH light (mirrored layout instead) | `check_frames.py`: ≤ 3 flips per 60-frame window, merging motion-blurred pairs |
| Loupe hopped off-screen | Guessed target frames | Projected candidate frames with the same camera function in Node | Pick screen targets numerically |
| Higgsfield 429s on batches of 12 | Provider rate limit | Resubmit the failed indices | Keep indices stable; expect ~10/12 to be accepted |
| `sed` edits silently not applied | BSD sed treats `\|` literally | Exact-string Python edits with `assert old in s` | Assert every scripted edit |

---

## 5. Measurements

| Gate | Result |
|---|---|
| Container | 1920×1080 · 60 fps · 1800 frames · 30.000 s · H.264 High · yuv420p · bt709 (matrix, primaries, trc) · AAC 48 kHz stereo |
| Loudness | −12.3 LUFS integrated · −1.9 dBFS true peak · every bar present (quietest: the aperture breakdown, −22 dB RMS, by design) |
| Frames | No near-black mid-reel, no blown frames, luminance flips 5 in total, worst 1 s window = 3 |
| Sync | Drops at frames 450 / 900 / 1575; audio onsets within one frame (+8 to +14 ms attack) |
| Throughput | 2-sample preview, 2 workers: 13.7 fps · 8-sample final, 3 workers: 13.0 fps (capture-bound) → **205 s** |
| Size | 51 MB master (CRF 16) · 14 MB web (CRF 22) |

---

## 6. Next time

- Record a 3-second screen capture of the real app as a *reference* before rebuilding its UI, to compare motion timing 1:1.
- Render the card textures at 3× for any card the camera pushes into (the hero already is).
- Consider WebCodecs in-page encoding: capture, not GPU, is the bottleneck.
- Vertical 1080×1920 cut: the scenes use `layout.js` constants, so a portrait layout module is the main work.

---

## 7. Pre-flight checklist (reel 02 additions)

- [ ] Client's own tokens/type/mark read from code; nothing invented that the brand forbids
- [ ] Every timing anchor lives in `score.js`
- [ ] Hand-offs verified with transition strips (2D↔3D, portal, cuts)
- [ ] `check_frames.py` PASS (dark, blown, ≤ 3 flips/s)
- [ ] `check_audio.py` PASS (per-bar RMS, −15.5…−11.5 LUFS, true peak ≤ −0.5 dBFS)
- [ ] `ffprobe`: colour primaries/trc/matrix = bt709
- [ ] No real advertiser shown with invented metrics
