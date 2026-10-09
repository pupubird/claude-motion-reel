# 04 — BeFake app opening (glass-bubble onboarding)

| | |
|---|---|
| Title | 这么酷的App开场会有人想学么｜BeFake ("Would anyone want to learn such a cool app opening?"), caption "手搓72个小时" (hand-built in 72 hours), made with Codex |
| Author | Relph |
| Link | http://xhslink.com/o/LmFuBPDfZn |
| Duration | 19.0 s |
| Format | 1114×720 H.264, 30 fps. A macOS screen recording: iOS Simulator ("BeFake iPhone 17 Pro, iOS 26.2") on the left, a browser at localhost:5173 on the right showing the Chinese web build, Dock and menu bar visible |
| Cuts | **0**. One continuous take; the scene detector found no cuts. All motion is live, driven by a mouse cursor |
| Loudness | −13.1 LUFS integrated; the RMS envelope stays flat between −11 and −19 dB for the full 19 s (a continuous, compressed music bed, no edit-driven hits) |

**What it is.** A working, interactive onboarding screen recorded live. A single glass bubble rises from a dome at the bottom of a black screen. It acts as a real refractive lens over the "BeFake." wordmark, stretches like soft liquid when dragged, and when parked it fountains out a stream of small glass bubbles, each holding an icon or photo.

---

## 2. Why it reads high-end

Everything rests on one physically convincing material: a thin dark glass bubble with a single soft specular highlight, a thin-film rainbow rim concentrated on its lower edge, and true refraction. Type seen through it is magnified, flipped, and split into red, green and blue fringes. The bubble *does* something to the content: it lenses the brand name, dims everything it isn't touching, and births the content (icons, faces) out of itself, so the material is the interface rather than decoration. It deforms like a liquid under the pointer (a teardrop neck toward the drag point), which sells mass and surface tension. Pure black around it gives the iridescence maximum contrast. Because it is real-time and interactive, every motion is continuous. There are no cuts to hide behind, so the material has to hold up at every frame, and it does.

---

## 3. Beat sheet

Timings come from 5 fps phone-crop sheets (0.2 s per tile) plus the 0.5 s contact sheets.

| Time | What we see | Camera | Transition into next | Sound sync |
|---|---|---|---|---|
| 0.0–0.5 | iOS home screen; cursor clicks the black "BeFake." app icon | Static (screen recording) | App launches, an instant cut to black | Music starts at 0.25 s |
| 0.6–3.5 | Black screen with "There is more / to every one of us." in white regular at mid-height. **Dome:** a glass hemisphere occupies the bottom 20 % of the screen like a meniscus, with "↑ Swipe up to enter / Skip to sign in ↗" inside it. The dome's rim shows a soft grey edge and a specular at upper-left | Static | User grabs the dome | Bed only |
| 3.6–4.0 | **Detach:** the dome swells upward, closes into a full egg-shaped bubble (about 75 % screen width at 3.8 s), and leaves the bottom edge. A rainbow fringe appears on its lower-left and lower-right rims. The intro line fades to about 15 % | Static | Bubble rises | — |
| 4.0–4.8 | The bubble shrinks as it rises (about 75 % → 35 % width). "Meet BeFake." fades in at about 4.2 s. At 4.4 s the bubble's top edge touches the wordmark, and at 4.6 s it **lenses** it: "BeFa" magnified about 1.5× with an RGB split, while letters outside stay normal | Static | Bubble settles | — |
| 4.8–6.8 | The bubble parks as a small sphere (about 20 % screen width) just above the wordmark. The subtitle "Your real moments. / Every side of you." fades in, and the buttons "Continue with phone" (white pill) / "Continue with WeChat" (dark pill) ramp in from transparent through grey to white. The user drags the bubble back and forth over the wordmark, inverting and magnifying it (5.4 s: "BeFake" seen upside-down inside the lens) | Static | Release | — |
| 7.0–10.0 | **Fountain:** the parked bubble (about 20 % width) starts emitting small glass bubbles upward. Each holds an icon or photo: music note (green), flower (pink), chat (purple), camera (orange), globe (blue), sparkle, heart, lightning, calendar, selfie thumbnails, a mini "BeFake" chip. First emission at about 7.2–7.4 s; by 9.6 s about 30 mini-bubbles spread in a cone about 50° wide up to the status bar | Static | User grabs the bubble again | — |
| 10.0–11.4 | Fountain at full flow; bubbles drift up and off the top edge, slight sideways sway | Static | Grab | — |
| 11.6–12.4 | **Stretch:** the user pulls the bubble upward and sideways. It elongates into a **teardrop** with a narrow neck pointing at the cursor. The body lenses "BeFake" with strong chromatic split; the subtitle and buttons drop to about 20 % opacity. Emitted bubbles keep floating off | Static | Drag down | — |
| 12.6–14.2 | The bubble is dragged down below the wordmark and swells (about 50 % width, rim rainbow strongest at the bottom). The buttons and subtitle hide ("Drag the glass down to return to the intro"), then the bubble snaps back up to the parked position at 13.4 s, and the UI fades back in | Static | Park | — |
| 14.4–19.0 | Parked again; at about 15.0 s the fountain restarts (purple chat and lightning first) and rebuilds to full flow by 17–18 s. Ends mid-loop | Static | End (no outro) | Bed continues to the end |

The right-hand browser window mirrors the same scene (Chinese copy "认识 BeFake. 分享真实的此刻, 也坦诚展示另一面。") at larger scale, permanently in fountain state.

---

## 4. Signature moves (特效)

### 4.1 Glass bubble as a refractive lens over type (4.4–6.8, 11.6–13.4 s)
- **Frame by frame:** as the bubble edge reaches the wordmark (4.4 s), letters behind the rim warp outward. At full overlap (4.6 s) the section inside the bubble is magnified about 1.4–1.6×, and the glyph edges split into cyan/blue on one side and red/yellow on the other (2–4 px fringe at 720p). Letters *outside* the bubble are untouched; letters *under* it are brighter white than the rest. At 5.4 s the inner image flips vertically (true lens inversion: "BeFake" reads upside-down in the lower half).
- **How it's built:** a fragment shader samples the UI texture (the wordmark layer) with an offset. Take the sphere normal from `(uv − centre)/r`, refract with an IOR of about 1.33–1.5, and sample R, G and B with slightly different IORs (for example 1.40 / 1.45 / 1.50) for dispersion. Apply fresnel for the rim brightness. The background is black, so the lens needs content under it; the type *is* the subject.
- **For us:** we already raymarch Bub as a liquid bubble. Give it a screen-space refraction pass that samples the **type layer**, so Bub actually magnifies and splits "friends" or "values" when it passes over the words. At present, type and Bub are separate layers that never optically interact (current sheet, 0.0–1.5 s: Bub sits under "friends" with no lensing).
- **Why it's cool:** it proves the material is physical, which turns a logo into an effect.

### 4.2 Thin-film iridescent rim with a dark body
- Rim colour is concentrated in the **lower 40 %** of the circumference (bottom-left magenta → green → yellow → blue around the bottom). The top rim is a thin neutral grey line. One soft, slightly elongated specular sits at about 10–11 o'clock, about 8 % of the diameter. The interior is near-transparent (shows black). There is no fill and no glow outside the silhouette.
- **Build:** thin-film interference, a hue that varies with `cos θ` (view angle) plus a thickness gradient that is thicker at the bottom (gravity drainage, as on real soap bubbles), multiplied by fresnel. Rim width is about 2–3 % of the radius.
- **Why it's cool:** the bottom-heavy rainbow is the physically right cue (film drains downward). It reads as "real soap bubble" more than any uniform rainbow outline would.

### 4.3 Soft-body drag: the teardrop neck (11.6–12.4 s)
- When pulled, the bubble does not translate rigidly. The side nearest the cursor extrudes into a narrow neck (about 25 % of body width) that bends toward the pointer, while the body lags behind and stays round. A specular streak runs along the neck. On release it snaps back to a sphere in about 0.3–0.4 s with a small wobble (about 1 overshoot).
- **Build:** a 2D or 3D SDF of a sphere smooth-unioned (`smin`, k about 0.3·r) with a capsule from the body centre toward the drag point, with capsule radius tapering. Or a mass-spring ring (24–32 nodes) with surface tension. Drive it with a spring (stiffness about 180–220, damping about 14–18 for one visible overshoot).
- **For us:** Bub being *pulled* toward the match during the search (current 19.5–21.5 s, where Bub just slides). Or the unlock: the padlock shackle pulled as a liquid neck before it pops.

### 4.4 Dome at the bottom edge, then detach (0.6–4.0 s)
- At rest, the bubble is half-submerged below the screen edge as a hemisphere carrying the "Swipe up to enter" prompt inside it. On grab it rises, closes underneath into a full egg (about 3.6–3.8 s, about 0.2 s), and pinches off. Note the egg shape: slightly taller than wide while rising (vertical stretch about 1.1×), round when parked.
- **For us:** Bub's entrance. Rise Bub out of the bottom frame edge as a meniscus and pinch it off on a beat, instead of fading or scaling in. Also a great **hook-to-values** transition: the bubble pinches off and carries the next line up with it.

### 4.5 Fountain of encapsulated content (7.2–11.4, 15.0–19.0 s)
- **Emitter:** the top of the parked bubble. Rate is about 6–8 mini-bubbles per second. Initial velocity is upward with ±25° spread, decelerating as they rise (drag), with gentle sideways sinusoidal drift. Sizes vary about 0.35–1.2× (about 6–14 % of screen width). Each mini-bubble has the same glass rim and contains a flat, saturated icon or a photo thumbnail, with a slight random tilt per icon (±15°).
- **Density:** about 30 on screen at peak, spread over the top 40 % of the screen, with clear black between them. Overlap is allowed (bubbles pass in front of each other) but never packs into a solid field.
- **Build:** a CPU particle system with instanced sprites, or a raymarched set of up to 40 spheres, with an icon texture atlas sampled through each sphere's refraction. Spawn is staggered; early particles start tiny (scale 0 → 1 over 0.25 s, easeOutBack about 1.3).
- **For us:** the values beat and the friends beat. Bub emits **value bubbles** (Family, Career, Adventure icons in mini-bubbles) after the pick. At "friends gather", the merged pair emits **face bubbles** (the people from the current 56–61 s) in a fountain, instead of faces simply fading in on a flat field.
- **Why it's cool:** content is *born from* the hero object. That is a causal chain, not a layout.

### 4.6 Focus dimming: everything else steps back
- While the bubble is held, all non-lensed UI drops to about 15–25 % opacity (intro line at 3.8 s; subtitle and buttons at 11.6–12.4 s). Buttons ramp back through grey (about 50 %) to full white over about 0.4 s when it's parked.
- **For us:** when Bub or the bubble is "acting", drop competing type and UI to about 20 %. The current release keeps all labels at full opacity while the bubbles perform.

---

## 5. Type

- **Wordmark:** "Meet" in a light grey regular plus "BeFake." in a white heavy grotesk, about 4 % of screen height, centred at about 44 % of screen height. **Subtitle:** two lines in white regular, about 2.3 % height, line spacing about 1.4.
- **Intro line:** "There is more / to every one of us." in white regular, centred at about 37 %.
- **Entry and exit:** soft opacity fades only (about 0.3–0.5 s), no movement. The wordmark appears at about 4.2 s as the bubble arrives; the subtitle at about 5.0 s; the buttons ramp in at about 5.0–5.6 s. Holds are indefinite (it's a live screen).
- **The type is the lens target.** Its job is to sit still so the bubble can distort it. This is the opposite of "slapped-on" type: it is the surface the effect acts on.

---

## 6. Colour, light, material

- **Palette:** pure black (#000 to about #0B0B0B with a faint radial lift behind centre), white type, and saturated icon colours (green #3CD27A-ish, pink, purple #8B6CFF-ish, orange, blue globe). The rainbow exists only in the bubble rims.
- **Light:** an implied single soft key from the upper-left (specular at 10–11 o'clock on every bubble, consistent across all mini-bubbles). No ambient fill, no shadows, no glow halos.
- **Material:** thin glass or soap film: transparent body, fresnel rim, thin-film iridescence on the lower rim, refraction with dispersion. Mini-bubbles use the same material, so the whole scene is one material language.

---

## 7. Tempo & sound

- No edit rhythm: a single 19 s take, paced by the user's hand. The music bed is continuous and loud (−13 LUFS) with no ducking and no sync points; the RMS stays within an 8 dB window throughout.
- **Interaction rhythm:** detach (3.6 s) → lens play (4.4–6.8) → fountain build (7.2–10) → stretch (11.6) → reset (13.4) → fountain again (15–19). Roughly a 7–8 s loop of *tension* (grab or stretch) then *release* (fountain).
- **Lesson for us:** this is a material study, not a timing study. Take its effects and put them on our own beat grid (one interaction per bar).

---

## 8. Steal for almost friends

1. **Hook (current 0–2 s): Bub lenses the headline.** Currently Bub sits flat under "How to make more friends" and the type never interacts with it. Instead, Bub drifts across "friends" at about 0.8–1.4 s, the word magnifies about 1.5× inside Bub with an RGB split (dispersion IORs about 1.40 / 1.45 / 1.50), and the rest of the line dims to about 25 % while Bub passes. One gesture says "bubble" and "friends" at once.
2. **Bub's entrance: dome then pinch-off (4.4).** Currently the bubbles drop in and splash at 2.0 s. Instead, Bub rises as a meniscus from the bottom edge and pinches off on a beat (about 0.2 s close), egg-stretched 1.1× while rising, round on arrival.
3. **Bubble material upgrade (4.2): bottom-weighted thin-film rim, one specular, dark interior.** The current bubbles (sheets 1–2) are uniformly milky or pastel-filled, with the rim colour spread evenly around them, so they look like plastic beads. Change to near-transparent bodies, rainbow concentrated in the lower 40 % of the rim, a single 10 o'clock specular, and no fill. Reserve **saturated fill** only for Bub's matched partner and the brand blue/coral pair.
4. **Values pick: a fountain of value bubbles (4.5).** After the 3 values are chosen (current about 10–11 s), Bub emits Family / Career / Adventure as icon-in-bubble particles (6–8 per second, ±25° cone, scale-in with easeOutBack) that rise and seed the search world. This replaces the flat chip list.
5. **Bub search: soft-body pull toward the match (4.3).** Currently, at 19.5–21.5 s, Bub slides beside the gold-ringed match bubble. Instead, as Bub detects the match, its skin extrudes a teardrop neck toward it (smooth-union capsule, k about 0.3·r), the body lags, then it snaps across with a spring (one overshoot), so the "find" feels like an attraction.
6. **SAME!! and the unlock: lens over the payoff word (4.1).** Pass a bubble over "SAME!!" (or the padlock) so the word blooms through refraction at the moment it lands. On the unlock, the padlock seen through Bub's lens inverts and flips upright as Bub moves off: a reveal by optics, not a scale pop.
7. **Friends: faces fountain out of the merged pair (4.5).** Currently (56–61 s) face circles fade and slide in on a flat field, and by 60 s they crowd into a dense cluster. Instead, the blue+coral merged bubble emits face-bubbles upward in a sparse cone (about 20–25 max on screen, never packed), each face seen through a thin glass rim with a consistent upper-left specular.
8. **Focus dimming everywhere (4.6).** Whenever Bub or the pair performs, drop all other type and UI to about 20 % and ramp it back over about 0.4 s. This kills the "everything at full volume" flatness of the current release.

---

## 9. Don't copy

- **The all-black world.** It's why the iridescence pops, but dark ink worlds are a known rejection for us. Get the contrast another way: put a deeper, saturated backdrop (soft blue or coral gradient at about 60 % value) behind lensing moments, or darken locally behind the hero bubble (a soft vignette under Bub only).
- **The screen-recording frame**: simulator chrome, Dock, menu bar, cursor arrow, and the small UI scale. Our film is a designed shot; the pointer-driven drags must be re-authored as choreographed springs on the beat grid.
- **The fountain at full density, or anything heading toward a packed field of tiny round icons.** Keep emissions sparse (trypophobia risk, and our current release already flirts with this at 15–21 s).
- **Small grey subtitle type (about 2.3 % height).** Our type must stay big.
- **No edit and no sound design.** A continuous, unsynced take works for an interactive demo but would feel slow for a 66 s film.

---

## 10. Key frames

Phone crops below are upscaled 2× from the 720p screen recording (the source is low-res; judge shape and colour, not micro-detail).

![Glass dome at the bottom edge holding "Swipe up to enter", intro line above](frames/04-befake-opening-1.5s.jpg)
*1.5 s — Dome at rest: a half-submerged glass meniscus at the bottom edge, the prompt inside it, a single upper-left specular.*

![Bubble's top edge touching "Meet BeFake.", wordmark beginning to warp](frames/04-befake-opening-4.4s.jpg)
*4.4 s — Lens contact: letters bend at the rim; rainbow concentrated on the lower rim.*

![Bubble over the wordmark, "BeFa" magnified with RGB split](frames/04-befake-opening-4.6s.jpg)
*4.6 s — Refraction plus dispersion: about 1.5× magnification, cyan/red fringes, outside letters untouched.*

![Fountain of icon and photo bubbles rising from the parked bubble in the browser build](frames/04-befake-opening-9.0s.jpg)
*9.0 s (browser build) — Fountain: each icon or selfie sits in its own glass sphere, sparse cone, consistent key light.*

![Phone view of the fountain at full flow above the wordmark and buttons](frames/04-befake-opening-9.6s.jpg)
*9.6 s — Fountain in context: content is born from the hero bubble; the UI below stays calm.*

![Bubble stretched into a teardrop toward the cursor, lensing BeFake with chromatic split](frames/04-befake-opening-12.0s.jpg)
*12.0 s — Soft-body drag: a teardrop neck toward the pull point, strong chromatic split, surrounding UI dimmed to about 20 %.*

![Large bubble dragged below the wordmark with a strong bottom rainbow rim](frames/04-befake-opening-13.0s.jpg)
*13.0 s — Full-size bubble: bottom-weighted thin-film rainbow, dark transparent body, wordmark dimmed.*
