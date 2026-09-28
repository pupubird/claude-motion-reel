# LEARNING — Zemyth reel (reel 03)

A 30 s, 1080p60 brand film for Zemyth, built on the reel-01/02 engine (`../claude-reel/LEARNING.md`,
`../adswinning/LEARNING.md`). This file records what was **new**: the character, the continuity chain,
the decisions, every bug with its root cause, and the gates. Read the earlier playbooks first.

---

## 1. Workflow that worked (in order)

| # | Phase | Exit criterion |
|---|---|---|
| 1 | Read the brand from the client's files: `BRAND.md`, moodboard PNGs, logo SVGs, `ZEMITH_Font_Family`, site copy | Palette, type, pill/card/sticker rules and voice written down; only real facts on screen |
| 2 | Story first: one continuity chain where every chapter is born from the last (eyes → line → rails → grid → wall → cards → stamps → coins → chart → mark → visor → eyes) | Each hand-off has a *reason* a viewer would feel without explanation |
| 3 | Voice early (ElevenLabs), then Scribe word timings on the real audio | Score slots and kinetic type locked to measured syllables, not guesses |
| 4 | The riskiest asset first: the 3D Zembit, compared side-by-side with `mascot-hero.png` until it matched | Front and 3/4 views read as the same character |
| 5 | Scene by scene, stills after every scene, contact sheet every time | No scene started until the previous one was clean |
| 6 | Full 2-sample preview → gates → strips at every hand-off → pop detector → full-res poster frames | Every jump either scored or fixed |
| 7 | Final 8-sample render → gates → ffprobe → mix transcription | All green |

---

## 2. New techniques (copy these)

| Technique | Where | How |
|---|---|---|
| **Procedural mascot** | `zembit/` | Superquadric head `(|x/a|^p+|y/b|^p)^(q/p)+|z/c|^q = 1` with a vertical taper; visor = concentric rings of a rounded rect projected onto the head surface with numeric normals; lathe headphone rings; two-bone arms; mitten hands |
| **Speckled clay** | `zembit/materials.js` | One jittered dot per object-space cell (kept inside the cell, so no neighbour search), `fwidth` anti-aliasing; speckles lighten the albedo, drop roughness, add a tiny glint |
| **SDF face** | visor shader | Eyes are rounded-box SDFs morphing (`mix`) into arcs for happy/wink; blink scales height, saccades squash-and-stretch along the move; the Z-peak can replace the eyes. Resolution-independent from a 367 px close-up to a 60 px wide shot |
| **Eyes as a portal** | hello → fourdays, mark3d → signature | Project the eye (or mark) rectangles through the live camera; the 2D layer takes over on exactly those pixels |
| **Exact glow hand-off** | `fourdays.js` | The shader halo is linear light `0.3·e^(−d/77px)`; canvas blur is sRGB and can't match, so a per-pixel sprite with the same SDF distance and falloff is encoded to sRGB |
| **Video in type** | `fourdays.js` | Draw all words once as the mask, `source-in` the footage, an ink base under it so dark footage still reads as letters, a hairline keyline on top |
| **Syllable-locked type** | `headline.js` | Each word enters at `line start + Scribe word start − 2 frames` |
| **The pill as an actor** | `headline.js` | One lime pill glides keyword → keyword; it moves while the old line exits and waits in the new slot, so no word ever passes over it; the old keyword lifts out before the pill departs |
| **Card-flip video wall** | `builders.js` | 2D flip = `scaleX = |cos πp|`, back face after p = 0.5, shading by `sin πp`; the back maps one footage frame across the whole grid, so ten cards become one shot |
| **Analytic coin physics** | `coins.js` | Per coin: landing beat, constant-gravity fall, tumble damped by `1−u³` to flat at contact, a 40 ms rebound; stacks settle bottom-up. Pure function of time |
| **Dolly zoom to orthographic** | `coins.js` | fov 28° → 1.2° interpolated in log-tan space while distance keeps the view height: perspective flattens until stacks read as bars |
| **Exact silhouettes into 2D** | coins → mark | The coin material fades to black albedo + lime emission (flat brand lime), and the 2D columns start from the same per-coin rest positions |
| **Chart → negative space** | `mark.js` | Stack heights follow the mark's base edge; the trend line runs down the channel; the roof piece drops on and the line is left as the gap |
| **Pixel-locked 3D logo** | `mark3d.js` | Orthographic camera with 1 unit = 1 px; `ExtrudeGeometry` with `bevelOffset = −bevelSize` so the silhouette never grows |
| **Frame-blended timelapse** | `footage.js` | 29.97 fps source in a 60 fps film: neighbouring source frames are cross-blended by sub-frame position |

---

## 3. Decisions

| Decision | Chosen | Rejected | Why |
|---|---|---|---|
| Brand system | `BRAND.md` + moodboard (black/lime, wide caps, pills, rounded lime-stroke cards) | The site's older "broadcast scoreboard" CSS | The brand file calls itself the target; the user asked to strictly follow Zemyth's style |
| Display type | Refinery 95 Bold from the client's `ZEMITH_Font_Family` | A web substitute for MOLTHER | It *is* the wide, techy face the brand book describes, supplied by the client |
| Mascot | Built in code | The client's renders as cut-outs; AI video | Needed blinks, saccades, a wave, a wink, and a screen that can show the mark |
| Voice | The Zembit hosts, ElevenLabs v3 "Jessica", site copy only | A human narrator; saying "Zemyth" aloud | The brand is character-led; the brand name's pronunciation is unconfirmed |
| Colour output | Clamp (no tone curve) on character/coins/mark | ACES / knee | Brand lime must land exactly: eyes measured at (238,254,94) vs #EEFE5E |
| Impact flash | None | Full-frame lime flash | On black, a translucent lime wash reads as olive mud |
| HUD frame | No corner brackets | Viewfinder brackets | Client request |

---

## 4. Bugs found → root cause → prevention

| Symptom | Root cause | Fix | Prevention |
|---|---|---|---|
| "DAYS." erased "FOUR" | Each `destination-in` pass intersects with the previous mask | Draw all words, then `source-in` the footage | Build a mask in one pass |
| Whole rail gap showed raw footage before the words | `destination-in` with nothing drawn leaves the destination | Same fix | — |
| Lime haze over the character | Lime albedo × light budget ≈ 3× white; bloom smeared it | Charcoal clay albedo, lime < 1 under the lights, no bloom; halo in the visor shader | Budget lights per albedo; measure the brightest lime pixel |
| Eyes 3.6 % dim | Clearcoat Fresnel attenuates emission | Gain = 1 / (1 − clearcoat · 0.04) | Measure emissive colours against the brand hex |
| Brand colours dim off-centre | Vignette on by default | Vignette opt-in | — |
| Words passed under the travelling pill | Pill moved on the new keyword's onset | Pill moves during the old line's exit | Choreograph shared actors against every other element's timing |
| Card photos under the text | Cover-fit of a 16:9 photo in a narrow column overflows | Clip to the column | Clip every cover-fit draw to its box |
| Rail struck through the HUD caption | Layout ignored the HUD band | Content ends at y 928 | Keep a HUD safe band in the layout module |
| Stamps covered the tags | Stamp placed on the tag | Stamp overhangs the corner, tag fades on contact | — |
| Funded cards crossed paths | Slots assigned by list order | Slots by current x | FLIP targets must preserve order |
| Floor reflection looked like grey coins | Mirrored (negative-scale) instances lit from below | Unlit, depth-faded lime reflection | — |
| 2D glow ≠ 3D glow at the cut | sRGB blur vs linear-light exponential | Per-pixel halo sprite | Measure both profiles across the cut |
| White smudge on the visor in close-ups | The room's ceiling panel reflected at short range | Reflections fade with camera distance | Watch speculars at the extremes of a camera move |
| Power-on flicker too harsh | Two hard off-states on large bright shapes | One soft dip | Photosensitivity: soft steps for large areas |
| Timelapse judder | 30 fps source frames with large jumps | Cross-blend neighbours | — |
| Coin clinks off their coins | Audio re-derived landings without the visual jitter | Audio reads the exact schedule | One schedule, shared |
| Scan tone far too loud | An `AudioParam` modulator *adds* to the automation | Depth sized to the level | Size modulation depth in the param's units |
| Oscillators above Nyquist | High partials of pitched-up clinks | Skip partials > 19 kHz | — |
| Frame gate failed on a black-by-brand film | "Dark" = low mean luma | "Empty" = 99.5th percentile luma < 0.06 | Gates must match the art direction |

---

## 5. Measurements (final render)

| Gate | Result |
|---|---|
| Container | 1920×1080 · 60 fps · 1800 frames · 30.000 s · H.264 High · yuv420p · bt709 (matrix, primaries, trc) · AAC 48 kHz stereo |
| Size | 23.2 MB master (CRF 16; mostly black frames compress well) · 10.0 MB web (CRF 22) |
| Loudness | −13.7 LUFS integrated · −1.9 dBFS true peak · every bar present (breakdown −22 dB RMS by design) |
| Frames | No empty or blown frames · 1 luminance flip in 30 s (the eyes powering on) · worst 1 s window = 1 |
| Brand colour | Eyes (238.0, 253.8, 94.0) vs #EEFE5E (238, 254, 94); 2D lime (237, 253, 95) |
| Hand-offs | Eye halo 3D vs 2D profile within ±6 levels; visor mark vs locked mark centred within 3 px; coins → 2D columns and 2D → 3D mark visually identical at the cut |
| Sync | Audio onsets at the drops +7.5 / +7.5 / +7.8 ms (kick attack); first visual change at the next frame (trailing shutter); the b32 stamp starts one frame early by design |
| Voice | Scribe on the final mix: "Hello, world. Four days. Ten builders. One house. You ship something real. We back the best. Funding builders." — all seven lines verbatim |
| Throughput | 2-sample preview, 3 workers: 24 fps (107 s) · 8-sample final, 3 workers: 19.8 fps (123 s) |
| Spend | ElevenLabs TTS 126 characters (v3); Scribe ≈ 50 s of audio; Higgsfield 0 credits |

---

## 6. Next time

- Render the Zembit with a small AO/contact-shadow pass: the black-on-black silhouette would gain weight.
- A mouth-free lip-sync worked (eye squash from the voice envelope); add a subtle head bob per stressed syllable.
- Precompute the halo sprite from the shader's own constants at build time (today the 77 px is measured).
- Vertical 1080×1920 cut: the layout module and camera keys are the main work.

---

## 7. Pre-flight checklist (reel 03 additions)

- [ ] Only the client's facts on screen (products, founders, "2 funded" as published)
- [ ] Brand lime measured on every 3D emissive (eyes, flat coins, flat mark)
- [ ] Every 3D ↔ 2D hand-off diffed at the cut frame
- [ ] Pop detector: every spike is a scored event or source footage
- [ ] Mix transcription returns every voice line verbatim
- [ ] `check_frames.py` PASS · `check_audio.py` PASS · ffprobe bt709 tags
