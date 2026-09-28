# LEARNING — Nova Pitch product film (reel 04)

A 60 s, 1080p60 product film rendered from code, built on the reel 01–03 engine (see `../claude-reel/LEARNING.md`,
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
| 3 | Score first: ElevenLabs Music with a chunk per act; generate takes, measure each with `tools/beats.py` (tempo, grid phase, section contour, structure checks). When the cut changes length, re-cut the chosen take on its bar grid (`tools/recut.py`) instead of rolling new takes | Take t6: 120.00 BPM, drop ×109 at 6.02 s, breakdown 11 dB under the peak; the 60 s re-cut scores the same |
| 4 | Voice early: three takes, Scribe timings, pick by timing fit | "slide five" lands where the citation pops |
| 5 | Hero asset first: the orb shader, matched against sampled pixels of the product's `orb-video.mp4` | Same phases, meniscus and saturation |
| 6 | Act by act with stills after every change; contact sheet of the whole film every pass | No act started while the previous one was dirty |
| 7 | Full 2-sample preview → sheet every 0.5 s → strips at every hand-off → numeric diff of the 3D→2D cut | Cut differs by 1.6 levels on average without lens FX |
| 8 | Audio audit by stems: per-bar balance, per-event transient vs local score level, Scribe on the mix and on the score | Voice verbatim, 6.4 dB over the ducked score; no vocals in the score |
| 9 | Reading gate from the renderer (`check_reading.mjs`) and the transition report (`check_frames.py` dips and drops) on a preview | Every string ≥ 0.5 s + 0.375 s/word; no dip to black at an act boundary |
| 10 | 8-sample final → frame gate, audio gate, ffprobe | All green |

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
| **Re-cut a score on its bar grid** | `tools/recut.py` | For every candidate jump a→b, cost = spectral distance between bar b's head and bar a+1's head (where the music would have gone) + between bar a's tail and bar b−1's tail. t6's groove is a 4-bar loop, so two splices at cost 4.6 and 5.0 (vs ~35 near the breakdown) stretch 21 bars to 30; each splice is one 30 ms equal-power window that ends on the downbeat, so the new bar's attack masks it |
| **Kick map, measured and reproducible** | `tools/kicks.py` | Low-band onset strength on the eighth-note grid, kept where it beats the local two-bar median ×1.8; calibrated on t6, it recovers 20 of the 21 hits picked by hand |
| **Reading time, measured from the renderer** | `drawLine`/`text` log → `tools/check_reading.mjs` | With `?textlog`, every drawn string logs its opacity and motion per frame; a string is readable while ≥ 90 % opaque and within 2 px of rest. Needs 0.5 s to find it (a saccade ≈ 0.2 s + a first fixation ≈ 0.25 s) + 0.375 s a word (160 wpm, the slow end of the BBC's 160–180 wpm for subtitles). Typing prefixes and count-up frames are filtered out |
| **Transition breaks, measured** | `tools/check_frames.py` | *Dips*: mean luma under 40 % of the dimmer of the shots ±0.1–0.75 s either side; *drops*: > 70 % of the light lost within 0.1 s. On the 42 s cut it found exactly the breaks a viewer named (orb → link, room → signal, interest → payoff, collapse → N) |
| **Light that concentrates** | `world.js` Act IV | An implosion that only shrinks the orb reads as a cut. Instead the orb swells 15 %, then an ease-in-out collapse lets the white-hot ball dwindle while a flare core grows under it (core radius 16 → 66 px) and then contracts into the star over half a beat |
| **Carry an element across every act boundary** | `type.js`, `signal.js`, `finale.js` | One title bar for steps 1–3 (the badge rolls, the title swaps in place while the orb implodes); the 3D shot starts under the folding interest card and the point glides onto the payoff line's origin; the collapsed galaxy's star travels to the N's first stroke and becomes the pen |
| **Strict anchors** | `score.js` | Every anchor object is a frozen Proxy that throws on an unknown key, so a stale name fails the render instead of turning every `seg()` on it into NaN |

---

## 2b. Review rounds (what the owner's notes changed)

| Note | What it exposed | Change |
|---|---|---|
| "The opening isn't grand or hooking enough; we need a WOW." | v1 opened on one slide in near-silence; v2's deluge of 4,800 lit decks read as texture (every card equal, moving *with* the camera, no focal point) | **Powers of ten**: frame one is our slide filling the screen, then a log-space pull-back through a lit arm to a whole galaxy of decks; lights go out along the arms onto the last light; the nova is literally a new star in that galaxy; the dive lands on the orb. It bookends the finale's igniting galaxy |
| "The message isn't clear and direct enough." | Poetic lines ("It reads. It remembers.", "As you.") and the product named only at 37 s | **Meet Nova Pitch.** at 8 s; the site's four steps as numbered titles with its gradient step badge; *Your Digital Twin answers. In your voice.*; *See what people actually care about.*; the OG card's *One link. Your whole pitch — that answers back.* on the end card |
| "Super cool and fancy." | Titles landed and sat still | A single specular glint across each key title after it lands; the step badges rhyme with the final tile (1, 2, 3, 4 … N) |

Rule of thumb from this round: **judge a wow shot by its focal hierarchy, not its density**. Thousands of equal
elements read as noise; one subject revealed at a new scale reads as awe.

A second review (a colleague of the owner's) after "lgtm":

| Note | What it exposed | Change |
|---|---|---|
| "Can't read it; by the time I want to read, it's gone." | Titles were fully legible for 1.0–1.7 s, some under the BBC subtitle minimum; UI cards stacked two reads into one beat | A reading rule from the literature (0.5 s to find + 0.375 s a word), measured on every drawn string from the renderer. The cut grew from 21 to 30 bars; the file-request card was cut so the interest card could hold. Titles now sit at 1.05–1.7× the rule (median 1.58×), not 3×: "readable, not slow" |
| "The transitions still feel like they break in between." | Four dips to near-black between acts and two snaps: the orb vanished in 6 frames, the room flashed for 0.3 s and dimmed, slide 5 smeared into the chart, the lime point sat alone on black before a hard cut | Measured dips/drops; each boundary now carries something across (see *Carry an element across*), the room is seen undimmed for 0.75 s, slide 5 flies home in 1 s, and the screen powers on without a flash |

Rule of thumb from this round: **a title's clock starts when it is fully readable and stops when anything starts
taking it away** — and the requirement is per word, not per title.

---

## 3. Decisions

| Decision | Chosen | Rejected | Why |
|---|---|---|---|
| Concept | One line: dead send → live link → signal → the N | Feature tour; mascot host | The product's promise is literally one link; the Zemyth feedback asked for more than a host and cards |
| Pacing | 120 BPM, 60 s, motion never stops but every title holds for its reading time | The first 42 s cut; a slower tempo | Frame-exact beats (30 f); a longer cut keeps the energy in the picture while the words get read — a slower tempo would have slowed the motion too |
| HUD | None | Reel chrome | Reel-02 feedback: HUD, captions and micro-labels read as generated |
| Type | Few words, 112 px Plus Jakarta Sans 700, one motion language (rise from mask) with three story-driven exceptions (dim, light reveal, word swap) | Many sizes and effects | Consistency reads as designed |
| Copy | Only site, brand-bible and onboarding-film lines | New slogans | Client voice, already approved |
| Demo data | The product's fictional showroom (Luminex Labs, Maya Chen, Jordan Lee) | Invented companies | Real to the product, no real company attached to invented numbers |
| Score | ElevenLabs Music, 8-chunk plan, 7 takes, measured; for the 60 s cut, take t6 re-cut on its bar grid | Web Audio synthesis only; two new 62 s takes (t7: a 2-bar silent hole mid-groove and a weak drop; t8: a loud intro and no hit on the nova) | A produced track is the biggest lever against "slow, not enticing"; the re-cut keeps the sound the owner approved and puts every hit where the picture needs it |
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
| A zing and a pop with nothing on screen at 13.6 s | `KB.rows` had four anchors; the panel drew three rows, the foley played all four | One list drives both (three rows) | Strict anchors; audit sound cues against the picture |
| Dead flight system shipped in the deck shader | The deluge opening was replaced, its `aFly`/`uFlyOn` path stayed (always 0) | Removed; two RNG draws kept so the seeded layout is bit-identical | Diff stills before/after a cleanup (19 frames: max difference 0) |
| `beats.py` said the re-cut's grid was +268 ms off | Grid phase from full-band onsets: the longer groove's off-beat hats outweighed the kicks | Phase from the low band | Phase-lock on the kick, check the planned hits' offsets too |
| The re-cut's first draft would have doubled every spliced downbeat | The outgoing run's crossfade tail extended past the downbeat, carrying the next bar's attack | One window, ending on the downbeat | Draw the overlap before writing it (caught in review, before the first run) |
| The reading checker hung for 180 s | Its copy of the static server had no `.mjs` MIME type, so Lucide icons failed to import | One shared `tools/chrome.mjs` for the renderer and every check | Never copy a server; import it |
| A windowed render failed at the mux | zsh does not word-split `$var`, so `--from` got `"1260 1440 t3"` → NaN → zero frames | `render.mjs` rejects a bad frame range up front | Fail at the input, not three stages later |

---

## 5. Measurements (final render)

| Gate | Result |
|---|---|
| Container | 1920×1080 · 60 fps · 3,600 frames · 60.000 s · H.264 High · yuv420p · bt709 (matrix, primaries, trc) · AAC 48 kHz stereo |
| Size | 66.0 MB master (CRF 16) · 29.7 MB web (CRF 22) |
| Loudness | −14.0 LUFS integrated · −1.4 dBTP · every bar present (`check_audio.py` PASS) |
| Frames | No empty or blown frames; 1 luminance flip (the nova), worst 1 s window = 1 (`check_frames.py` PASS) |
| Transitions | The 42 s cut's dips and drops at act boundaries (16.0, 19.8, 26.3, 31.5–32.0, 35.1–36.0 s) are gone. What the report still lists is the designed collapse → pen → N (50.9–51.9 s, in sync with the score dropping out) and a 2-frame dip inside the interest → payoff handover (45.50 s) |
| Reading | 52 strings measured from the renderer, all ≥ 0.5 s + 0.375 s a word (`check_reading.mjs` PASS); key titles hold 1.05–1.7× the rule, median 1.58× |
| Score | Re-cut t6: 119.98 BPM autocorrelation, every section downbeat at +21 ms, structure checks identical to the source take (3/4; the finale is a soft chord and the tile's hit is foley) |
| Sync | Scribe on the final mix: "slide" at 34.019 s; the citation pops 1.9 frames later |
| Hand-off | The 3D screen → 2D room cut differs by 1.54 levels on average (p99 5/255) with lens FX off |
| Voice | Scribe on the final mix: "Median payback is 7.2 months. It's on slide five" (verbatim) |
| Throughput | 8-sample final on 3 Chrome workers: 457 s (≈ 7.9 fps); the reading gate: ≈ 3 min |
| Spend | ElevenLabs 11,910 credits in total: 8,622 for the first cut (7 music takes, 3 voice takes, probes) and 3,288 for two 62 s takes that failed the structure check; Scribe on the Keychain key; Higgsfield 0; Blender not used |

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
- [ ] `check_frames.py` PASS, and no dips or drops at an act boundary · `check_audio.py` PASS · ffprobe bt709
- [ ] `check_reading.mjs` PASS: every string ≥ 0.5 s + 0.375 s a word, and no title held far past it (motion keeps going; words do not wait)
