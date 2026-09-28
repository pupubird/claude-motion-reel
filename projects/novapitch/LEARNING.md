# LEARNING — Nova Pitch product film (reel 04)

A 42 s, 1080p60 product film rendered from code, built on the reel 01–03 engine (see `../claude-reel/LEARNING.md`,
`../adswinning/LEARNING.md` and `../zemyth/LEARNING.md`). This file records what was new: a produced score locked
to a code-rendered picture, the one-line concept, the decisions, every bug with its root cause, and the gates.

The brief after reels 02 and 03 was that Zemyth felt *too normal, slow and not enticing* (though its logo idea
was liked), and that Adswinning's text elements *looked AI-sloppy*. That shaped every rule below.

---

## 1. Workflow that worked (in order)

| # | Phase | Exit criterion |
|---|---|---|
| 1 | Read the product from its code: palette fence, marketing and recipient-room CSS, the landing copy, the onboarding film's lines, and the Storybook showroom (captured headless as references) | Tokens, type, components and copy written down; demo data is the product's own fictional scenario |
| 2 | Concept before scenes: **one line** runs through every act; `STORYBOARD.md` on a 120 BPM grid (1 beat = 30 frames) | Every hand-off has a reason; every word traces to a source |
| 3 | Score first: ElevenLabs Music with a chunk per act; generate takes, measure each with `tools/beats.py` (tempo, grid phase, section contour, structure checks) | Take t6: 120.00 BPM, phase +8 ms, drop ×109 at 6.02 s, breakdown 11 dB under the peak |
| 4 | Voice early: three takes, Scribe timings, pick by timing fit | "slide five" lands where the citation pops |
| 5 | Hero asset first: the orb shader, matched against sampled pixels of the product's `orb-video.mp4` | Same phases, meniscus and saturation |
| 6 | Act by act with stills after every change; contact sheet of the whole film every pass | No act started while the previous one was dirty |
| 7 | Full 2-sample preview → sheet every 0.5 s → strips at every hand-off → numeric diff of the 3D→2D cut | Cut differs by 1.6 levels on average without lens FX |
| 8 | Audio audit by stems: per-bar balance, per-event transient vs local score level, Scribe on the mix and on the score | Voice verbatim, 6.4 dB over the ducked score; no vocals in the score |
| 9 | 8-sample final → frame gate, audio gate, ffprobe | All green |

---

## 2. New techniques (copy these)

| Technique | Where | How |
|---|---|---|
| **Score to picture, then picture to score** | `tools/music.py`, `tools/beats.py` | music_v2 takes a *chunk* plan (`[Section]` text, `{inline directions}`, per-chunk styles, `context_adherence`); chunk 1 sets the genre, so it must describe only the intro. Measure every take: autocorrelation tempo, best grid phase, per-bar RMS, strongest onset at each planned hit, and pass/fail structure checks |
| **Measured hits, not assumed** | `score-kicks.json`, `hitPulse` | Low-band (40–130 Hz) flux sampled on the 8th-note grid, normalised by its median; the score turned out syncopated (beat 1 and the 2-and), so a four-on-the-floor assumption would have been wrong |
| **Analytic glass orb** | `gl/orb.js` | Ray–sphere per pixel on a billboard; phase fraction by marching the chord; the interface is a plane plus travelling waves; the meniscus is where the chord crosses it at grazing angles plus the contact lines on both shells; true depth via `gl_FragDepth` with the camera's projection passed *by reference* so the TAA jitter matches |
| **Colour-sampled look-dev** | orb | Crop the reference video, sample the pale core, rim, violet and meniscus pixels, and drive the colour model from those hex values |
| **Darkness fog for a deck field** | `gl/decks.js` | Cards are only visible within a few thousand units of the camera, specks beyond; lit decks ignore the fog. A void that fills as the camera travels, instead of wallpaper |
| **Sub-pixel specks** | decks | Below 2.2 px a card grows to 2.2 px and becomes a soft point with area-scaled alpha: no shimmer from far instances |
| **Scheduled chain ignition** | decks | Per instance, `aIgnite` = time the payoff line passes nearest (plus distance spread); the shader lights on `smoothstep(aIgnite, aIgnite+0.35, t)` |
| **Galaxy morph and collapse** | decks | Every instance has a spiral position; `uGalaxy` morphs, `uGalSpin` rotates differentially, `uCollapse` pulls everything to the centre. One uniform per story beat |
| **Pixel-exact landing on a UI screen** | world → room | The room is drawn by the same function into the screen's texture; the camera lands at D = (H/2)/tan(fov/2); the tone curve is off and the camera wobble faded for the last beat; verified by diffing the two frames |
| **Glyph revealed along a pen path** | `scenes/finale.js` | Measure the N's stems from its rasterised pixels, build the centreline path, stroke the drawn part into an offscreen alpha mask (`destination-in`) over the real glyph. Every frame is the exact brand glyph |
| **Kerning-safe word swaps** | `type.js`, "It reads. → It remembers. → It's your Digital Twin." | Each line drawn at its own measured glyph positions; only the anchor word is shared; the line re-centres by lerping start x |
| **Light-wave type reveal** | hero pair | Each glyph's alpha is the distance the nova's wave front has travelled past it; the front edge flashes white before settling into the gradient |
| **Film-scale product UI** | `ui/room.js` | The product's components at 1.9× on a film layout (deck left, rail right), nothing the product lacks, then the camera works on it |
| **Stems for a mix you cannot hear** | `--stem=music|sfx|vo` | Per-bar RMS per stem, transient peak of each foley event vs the score's local RMS, Scribe on the mix window |

---

## 2b. Review rounds (what the owner's notes changed)

| Note | What it exposed | Change |
|---|---|---|
| "The opening isn't grand or hooking enough; we need a WOW." | v1 opened on one slide in near-silence; v2's deluge of 4,800 lit decks read as texture (every card equal, moving *with* the camera, no focal point) | **Powers of ten**: frame one is our slide filling the screen, then a log-space pull-back through a lit arm to a whole galaxy of decks; lights go out along the arms onto the last light; the nova is literally a new star in that galaxy; the dive lands on the orb. It bookends the finale's igniting galaxy |
| "The message isn't clear and direct enough." | Poetic lines ("It reads. It remembers.", "As you.") and the product named only at 37 s | **Meet Nova Pitch.** at 8 s; the site's four steps as numbered titles with its gradient step badge; *Your Digital Twin answers. In your voice.*; *See what people actually care about.*; the OG card's *One link. Your whole pitch — that answers back.* on the end card |
| "Super cool and fancy." | Titles landed and sat still | A single specular glint across each key title after it lands; the step badges rhyme with the final tile (1, 2, 3, 4 … N) |

Rule of thumb from this round: **judge a wow shot by its focal hierarchy, not its density**. Thousands of equal
elements read as noise; one subject revealed at a new scale reads as awe.

---

## 3. Decisions

| Decision | Chosen | Rejected | Why |
|---|---|---|---|
| Concept | One line: dead send → live link → signal → the N | Feature tour; mascot host | The product's promise is literally one link; the Zemyth feedback asked for more than a host and cards |
| Pacing | 120 BPM, 42 s, a new event every 0.5–1 s, one breath | 30 s; 128 BPM | Frame-exact beats (30 f); enough time to show the real product without dead air |
| HUD | None | Reel chrome | Reel-02 feedback: HUD, captions and micro-labels read as generated |
| Type | Few words, 112 px Plus Jakarta Sans 700, one motion language (rise from mask) with three story-driven exceptions (dim, light reveal, word swap) | Many sizes and effects | Consistency reads as designed |
| Copy | Only site, brand-bible and onboarding-film lines | New slogans | Client voice, already approved |
| Demo data | The product's fictional showroom (Luminex Labs, Maya Chen, Jordan Lee) | Invented companies | Real to the product, no real company attached to invented numbers |
| Score | ElevenLabs Music, 8-chunk plan, 7 takes, measured | Web Audio synthesis only | A produced track is the biggest lever against "slow, not enticing"; the grid is measured, not trusted |
| Voice | One diegetic line, the Twin answering | A narrator | Shows the voice feature; the Zemyth host read as slow |
| UI legibility | Rebuilt at film scale (1.9×) | Screen recordings | Crisp at any zoom, animatable per element, faithful styles |
| The orb | Analytic shader | Blender/Cycles render, the product's video | Timeline-driven (voice, heat, gulps, collapse), exact depth, deterministic; the video is 1280×720 on white |

---

## 4. Bugs found → root cause → prevention

| Symptom | Root cause | Fix | Prevention |
|---|---|---|---|
| Music takes 1–2 loud from frame 0 | Chunk-1 styles set the whole song and included drums and sub bass | Chunk 1 describes only the intro; drums enter in chunk 2 with `context_adherence: low` | Structure checks in `beats.py` before picking a take |
| `422 Invalid type of composition_plan` | music_v2 takes `chunks`, not the v1 `sections` plan | Chunk plan | Read the model's schema, not the first example |
| `429 concurrent_limit_exceeded` | Creator tier allows 2 parallel generations | Two at a time | — |
| Glyph tops peeking under every title | `cubicBezier(0)` returned ~1e-8 after bisection, so "not started" words drew one line below the mask | Exact 0/1 endpoints | Easing functions must return exact endpoints |
| Slides too dark; the 3D screen darker than the 2D room at the cut | `SRGBColorSpace` textures are decoded by the GPU, and the shaders decoded them again with `pow(2.2)` | Sample directly | Diff hand-off frames numerically |
| 3D→2D cut misaligned by a few px | The camera's breathing wobble was still on for the landing frame | Fade the wobble for the last beat | Same diff |
| UI text split into RGB at the 20 s drop | Chromatic-aberration kick of 1.2 splits ~17 px at the corners | 0.35 on UI drops | No lens kicks on UI shots |
| A thin line inside the link field | The 3D point's streak showed through the translucent field | Gate the point's light by phase | Check glass UI over 3D for bleed |
| Field read as wallpaper from frame 0 | All decks visible at all distances; uniform size | Darkness fog, three shells, varied size, 3D tilt | Judge the first frame, not the busiest |
| A second white flash at the orb's birth | Heat colour 6–9× white for 2 s | Heat 2.5×, cooled in 0.6 s | Watch luma per second (the frame gate strip) |
| Titles ghosting over the next shot | Exit and entry windows overlapped | Every exit finishes before the next element enters | Strips at every hand-off |
| Near-empty frames at 31.5 s | The lime point started after the card had faded | Overlap them | Frame gate's p99.5 "empty" test |
| "Share one link." missing from a preview | The scene was not registered in `main.js` | Register it | The whole-film contact sheet catches missing shots |
| Foley inaudible under the groove | Synth foley 20–35 dB under a mastered score | Section-automated foley bus (+12 dB in the groove) | Per-event transient vs local score RMS |
| Kick map found 30 hits | Percentile threshold on raw low-band flux; syncopated score | Strength per 8th of the grid over the median | Print the grid map and look at it |

---

## 4b. More bugs (review rounds)

| Symptom | Root cause | Fix | Prevention |
|---|---|---|---|
| Camera whipped mid-travel (frame 1142 empty) | Moving the screen closer left a spline control point beyond the next one in depth: the path U-turned | Monotonic control points; Act IV got its own camera spline | Sanity-check path monotonicity; never derive a camera by chasing a curve's tangent |
| Two black frames before "flagged interest" | Sequencing exits strictly before entries left a gap | Overlap by a fifth of a beat while the outgoing layer is nearly transparent | The frame gate's p99.5 "empty" test caught it |
| `'dir' : redefinition` | A new local collided with an existing one further down the same shader | Rename | Prefix locals in shared GLSL chunks |
| Scripted edits silently missing | Patches written with `\u2019`/`\u2026` escapes did not match files that contain the literal characters | Match the literal character | `assert old in s` on every scripted edit (it caught both) |

---

## 5. Measurements (final render)

| Gate | Result |
|---|---|
| Container | 1920×1080 · 60 fps · 2,520 frames · 42.000 s · H.264 High · yuv420p · bt709 (matrix, primaries, trc) · AAC 48 kHz stereo |
| Size | 49.6 MB master (CRF 16) · 22.3 MB web (CRF 22) |
| Loudness | −14.0 LUFS integrated · −1.5 dBTP · every bar present (`check_audio.py` PASS) |
| Frames | No empty or blown frames; 2 luminance flips (the nova, the screen power-on), worst 1 s window = 1 (`check_frames.py` PASS) |
| Sync | Audio onsets at the 6 / 16 / 20 / 22 / 26 / 36 s hits land +0.3 to +1.8 frames after the grid (kick attack) |
| Hand-off | The 3D screen → 2D room cut differs by 1.6 levels on average (p99 5/255) with lens FX off |
| Voice | Scribe on the final mix: "Median payback is seven point two months. It's on slide five" (verbatim); Scribe on the score: no words |
| Stems | Voice 6.4 dB over the ducked score; foley transients within ±6 dB of the score's local level |
| Throughput | 8-sample final on 3 Chrome workers: 321 s (≈ 7.9 fps); 3-sample preview: 257 s |
| Spend | ElevenLabs 8,622 credits (7 music takes, 3 voice takes, probes) of a 300k plan; Scribe on the Keychain key; Higgsfield 0; Blender not used (the orb is analytic) |

---

## 6. Next time

- A 9:16 cut: layouts are constants in a few modules (`room.js`, `signal.js`, `kb.js`), and the 3D camera would
  need its own keys.
- Generate the score *after* a locked animatic, with section lengths from the edit, then inpaint only the sections
  that miss (music_v2 accepts audio-reference chunks).
- Put the stem audit in `render.mjs` so it runs on every mix.
- A 4K master is one flag (`--scale=2`); budget ~4× the render time.

---

## 7. Pre-flight checklist (reel 04 additions)

- [ ] No HUD, no decorative micro-labels; every word from a named source
- [ ] Every take measured: tempo, grid phase, section contour, hits at the planned bars
- [ ] Every 3D→2D cut diffed numerically without lens FX
- [ ] sRGB textures sampled once (no manual decode on `SRGBColorSpace`)
- [ ] Stems: voice ≥ 6 dB over the ducked score; foley transients within ±6 dB of the local score
- [ ] Scribe on the mix returns the voice line verbatim; Scribe on the score returns no words
- [ ] `check_frames.py` PASS · `check_audio.py` PASS · ffprobe bt709
