# Friend app film — vibe research

Research for the 60 s vertical product film (9:16, 1080×1920, 60 fps, rendered in three.js / Canvas 2D / GLSL)
for the new friend-making app: AI onboarding chat about life priorities → AI match → three days of anonymous
chat → both tap Unlock → profiles revealed. Friends, not dating.

**Ground rules of this document.** Every number is either quoted from the linked source or computed from a sourced
value by the scripts in Appendix A. Anything we could not find is said to be missing, and our own starting values are
labelled **proposal**. Every reference URL was opened and checked; sources that could not be opened are listed under
"Known gaps" in Appendix A.

---

## 0. The short version

- **Recommendation: Direction A, "Outside Your Bubble"** — chat bubbles and soap bubbles as one object at two
  scales. "Your bubble" already means your social circle, and the product exists to get you out of it, so the brand
  idea, the UI (chat bubbles) and every act's signature move come from one physical thing: inflate → drift → kiss
  (a real double bubble) → the shared wall pops on Unlock → friends gather as foam. Borrow C's typographic
  discipline (huge type on flat light fields) and B's tactile squash. Details in §5.
- **Motion base: Material 3 Expressive springs** (unit mass): `pop` ζ 0.6 / k 800 (9.5 % overshoot, settles in
  19 frames), `settle` 0.8 / 380 (1.5 %), `glide` 0.8 / 200, effects 1.0 / 1600 (no overshoot); bubbles and clay on
  a looser `wobble` ζ 0.45 / k 160 (20.5 %). Camera never overshoots. §2.
- **Safe area for TikTok + Reels + Shorts at 1080×1920:** y 288–1248; x 120–888 above y 840, x 120–780 below it
  (TikTok's icon rail). Strict rectangle: **x 120–780, y 288–1248 (660×960)**. Measured from the platforms' own
  overlays. §3.1.
- **Hook:** platforms ask for the proposition in 3 s (TikTok) and the brand in 5 s (Google ABCD), so put the name on
  screen by ~4–5 s — inside the owner's ~9 s cap. §3.2.
- **Type:** UI text ≥ 47 px (iOS's 17 pt body on a 393 pt phone) and never below 32 px; captions ~67 px (BBC's
  9:16 size); titles 112–240 px. §3.3.
- **Decisions needed:** direction (A recommended); whether to also cut a 30 s version (platform data favours 21–34 s);
  voice-over or not. §6.

---

## 1. References

Every row below was opened and checked. For studio films the technique was read off real frames or page stills
(contact sheets made during the research, several re-viewed for this report); where only stills or poster frames were
available, the row says so.

### 1.1 Studios

| # | Reference (year) | Borrow exactly this | URL |
|---|---|---|---|
| S1 | **BUCK — Google Vids** (2024) | A sentence that becomes UI: "Meet your [+ New] ___" in grey on white; the last word, in brand blue, swaps every 0.3–0.6 s (designer → writer → producer → editor → storyteller); the other words fade, the chip alone scales up ~2× into a real button, a cursor presses it, the real menu drops in. "a motion system designed to delight and inform in equal parts". 16:9 only | [buck.co/work/google-vids](https://buck.co/work/google-vids) |
| S2 | **BUCK — Notion AI assistant** (2025) | A three-stroke line face in a white disc, built as a Rive state machine "allowing expressions to mix and match organically between states"; "eyebrows that wave while thinking, a face that momentarily falls" on errors; animated "in cel, to give the performances an innately handmade feel" | [buck.co/work/notion-ai](https://buck.co/work/notion-ai) |
| S3 | **Animade — Walmart "Sparky" AI assistant** (2025) | A face inside the chat input that is "reacting with facial expressions as you type": over 60 Lottie animations, 12 emotions, each with "additional states to allow for interstitial transitionary paths" — every state is a transition clip then a loop (Idle → Ready → Listening → Thinking → Nod/Quizzical) | [archive.animade.tv](https://archive.animade.tv/work/walmart-sparky-ai) |
| S4 | **Animade — Tools for Humanity explainers** (page gives no year) | "6 x 1'-2' videos in 16:9 and 9:16" (vertical masters exist), "a system of stripped-back symbols and icons, with blue shading to indicate humanness": one hairline network on warm grey, a single colour reserved for "human" — the language for anonymous matching that blooms into colour at Unlock | [archive.animade.tv](https://archive.animade.tv/work/tools-for-humanity) |
| S5 | **Ordinary Folk — Google Gemini launch** (2024) | "an exercise in animating text in a meaningful way": letters of "Solve problems" scatter, orbit, then drop into a rounded card that tilts in 3D and settles; "Write Emails" slices into bars that re-form as "Solve Problems"; echo stacks. Big, light, type-led AI storytelling on white and lavender | [ordinaryfolk.co/project/gemini](https://ordinaryfolk.co/project/gemini) |
| S6 | **Giant Ant — Microsoft 365 Copilot** (2024) | The light, pastel, premium 3D look: a white satin plane ripples and a thick rounded prompt slab with a rainbow underglow rises through it, types itself, and a file chip drops in; iridescent glass shards, gradient ribbons; "fast, fun edits full of plussed up product flow". Square loops on the page | [giantant.ca](https://www.giantant.ca/microsoft-365-copilot) |
| S7 | **Oddfellows — Spotify Premium** (2024) | "an ASMR-inspired journey that combines abstracted product UI with tactile 3D design and animation" (30 s): UI controls rebuilt as soft-touch objects with the copy printed on their faces — a "Turn up" dial, a heart pill "Play your favorites", an embossed "Get Premium" pill. Mostly on dark bases — invert for a light film | [oddfellows.tv](https://oddfellows.tv/work/spotify-premium) |
| S8 | **ManvsMachine — OpenAI ChatGPT Images 2.0** (2026) | On pure white, one centred card changes content every ~0.2 s (per the page GIF), same hero in a new scene each time; the end lockup puts the card inline between words ("ChatGPT [card] Images 2.0") — "Meet [card] your people" | [mvsm.com/project/images-2](https://mvsm.com/project/images-2) |
| S9 | **Gunner — "Sync"** (2022, studio short) | "Three strangers share an unexpected moment in the sky": three cups held side by side release their drinks into floating liquid spheres at the same instant; lavender-to-peach painterly light; the title drawn as a contrail. Strangers, spheres and a shared instant — the Unlock in one image | [legacy.gunner.work/sync](https://legacy.gunner.work/sync/) |
| S10 | **Hornet — Meta "It's Your World"** (2023; poster frames only) | Chat UI inside a crafted world: a group-chat bubble ("let's gooo!") and an Instagram sticker floating in a knitted-plush 3D bedroom, anchored to objects; the case board lists containers, portraits, UI elements, avatars, emojis | [vimeo.com/854707838](https://vimeo.com/854707838) |

Notes from the studio check: ManvsMachine's site is now mvsm.com; Animade's portfolio lives at archive.animade.tv;
Gunner was bought by Duolingo in late 2022 ([Creative Review](https://www.creativereview.co.uk/duolingo-gunner-animation/));
Hornet's own site would not open, so its Vimeo account was used
(poster frames only; Vimeo pages were confirmed through Vimeo's public metadata because the pages show a CAPTCHA).

### 1.2 Brand motion systems

| # | Reference (year) | Borrow exactly this | URL |
|---|---|---|---|
| B1 | **Figma Config 2025** identity (2025, in-house Brand Studio) | Glyphs built from an inner and an outer element that react to each other — "Each glyph includes both an inner and an outer element, and they respond to one another." Hero type stepped at 15 fps: "reduced the frame rate from 60 to 15 frames per second to make the opening film feel 'a little more tactile and handmade'". Two tiers: "The expressive type takes a bit more time to animate on and has more personality, while the functional type is quicker" | [figma.com/blog](https://www.figma.com/blog/how-we-shaped-the-visual-identity-for-config-2025/) |
| B2 | **Figma Config 2024** identity (2024) | Four named motion verbs — Shift ("Rotating positions and perspective shifts"), Transform ("Morphing shapes"), Amplify ("Cascading patterns"), Activate ("Neighboring shapes sparking and transforming each other"). A ready vocabulary for per-act signature moves | [figma.com/blog](https://www.figma.com/blog/config-2024-branding/) |
| B3 | **Spotify Wrapped 2024** (in-house; typeface Spotify Mix by Dinamo) | "using our typeface as our main graphic element this year, looping and transforming it in unexpected ways across the canvas"; numerals blown up and cloned while readable copy stays on flat colour. Model for "3 days" as type in the scene | [It's Nice That](https://www.itsnicethat.com/features/spotify-wrapped-2024-graphic-design-041224), [Spotify newsroom](https://newsroom.spotify.com/2024-12-04/10-years-spotify-wrapped/) |
| B4 | **Spotify Wrapped 2025** (motion built in Rive) | Build motion with dummy data first, then bind real strings: "used dummy data to prototype and nail the motion… engineering could drive it with real user data" — it survived text length and localisation changes. For us: lay out every UI card against worst-case strings before styling | [rive.app/blog](https://rive.app/blog/spotify-used-rive-for-spotify-wrapped-2025) |
| B5 | **Airbnb 2025 Summer Release** (in-house app, UI, 3D and illustration) | "a softer feel across the board – more curved edges, and a smooth animated interface with subtle intensities"; soft 3D pictograms that each play one small story when tapped; pill tabs that squash down on press | [It's Nice That](https://www.itsnicethat.com/articles/airbnb-app-redesign-140525), [60fps.design tab press](https://60fps.design/shots/airbnb-tactile-tab-button-interaction) |
| B6 | **Duolingo × Rive** — Lily video-call character (2025) | Layered idle rig: "eight different head animations and eight body animations that dynamically combine, generating over 64 variations"; mouth shapes keyed to speech (Duolingo's viseme post). Recipe for any character that must feel alive for a whole film without repeating | [rive.app/blog](https://rive.app/blog/duolingo-s-ai-powered-video-call-brings-lily-to-life), [Duolingo blog](https://blog.duolingo.com/world-character-visemes) |
| B7 | **Headspace** refresh (2023–24, in-house with Italic Studio) | One simple round face with a defined emotional range "beyond a smile… stress, sadness, contentment" — a single parametric face (mouth curve + eyes) is enough to act | [It's Nice That](https://www.itsnicethat.com/articles/italic-studio-headspace-graphic-design-project-250424) |
| B8 | **Arc** browser onboarding (2022) | Onboarding staged like a film opening ("We wanted to play with the feeling you get as a movie opens"); a "radiating blast of colors becomes a through-line"; setup "finishes with a personalized Arc 'membership card'". Shape of our Unlock payoff: two cards land at once | [Inverse](https://www.inverse.com/input/design/the-browser-company-arc-design-interview) |
| B9 | **Partiful** invites (2024–25) | An invite is three swappable layers — Theme background, Poster, Effect particles (confettiExplosion, sakura, fireflies, sunbeams…). Use the same stack for "matched" and "unlocked" celebration beats | [partiful.com](https://partiful.com/free-online-party-invitations) |
| B10 | **Timeleft**, "The Friendship App" (2023–) | Same category, the copy tone to beat: "No bios. No swiping. No planning."; onboarding as one binary question per card ("Logic and facts" / "Emotions and feelings") | [timeleft.com](https://timeleft.com/) |
| B11 | **BeReal** two-camera frame | Two people at once: the front-camera inset (234×314) overlaps the back camera (768×1024, 3:4). Grammar for the mutual reveal | [bereal.com/ads/guidelines](https://bereal.com/ads/guidelines) |

Also checked, lower fit: **Locket Widget** ("Best friends first"; "You and your best friends will see new pictures
from each other every time you unlock your phone" — a payoff could land as a photo dropping into a home-screen widget
tile; [App Store](https://apps.apple.com/us/app/locket-widget/id1600525061)).

Anti-references (dating codes to avoid, since this is *not* dating): Bumble's 2024 black-and-yellow rebrand
([Creative Boom](https://www.creativeboom.com/news/female-first-dating-app-bumble-unveils-bold-new-look-and-useful-new-feature/))
and Hinge's "designed to be deleted" world
([Ads of the World](https://www.adsoftheworld.com/campaigns/the-moment-i-knew)). Avoid hearts as the payoff, swipe
stacks, couples framing and romantic red/pink dominance; show groups.

### 1.3 OS and chat-UI motion

| # | Reference (year) | Borrow exactly this | URL |
|---|---|---|---|
| O1 | **Apple Liquid Glass**, WWDC25 "Meet Liquid Glass" (2025) | (a) "Instead of fading, Liquid Glass objects materialize in and out by gradually modulating the light bending and lensing" — animate refraction + blur 0 → 1, not opacity. (b) Touch: "the material illuminates from within… Starting right under your fingertips, the glow spreads throughout the element and onto any Liquid Glass elements nearby". (c) Bigger = thicker: larger glass "casts deeper, richer shadows, has more pronounced lensing" | [WWDC25 session 219](https://developer.apple.com/videos/play/wwdc2025/219/), [HIG Materials](https://developer.apple.com/design/human-interface-guidelines/materials) |
| O2 | **SwiftUI `GlassEffectContainer` / `glassEffectID`** (iOS 26) | Apple's merge rule, codeable as an SDF smooth-union whose blend radius = the container spacing: "As shapes near one another, their paths start to blend into one another. The higher the spacing, the sooner blending begins" | [GlassEffectContainer](https://developer.apple.com/documentation/swiftui/glasseffectcontainer), [glassEffectID](https://developer.apple.com/documentation/swiftui/view/glasseffectid%28_:in:%29) |
| O3 | **iMessage effects** | Bubble effects "Slam or Loud make it pop out, Gentle makes it arrive softly, and Invisible Ink blurs the bubble until your recipient swipes to reveal it"; iOS 18 per-letter text effects "big, small, shake, nod, explode, ripple, bloom, or jitter". Invisible Ink is the right metaphor for an anonymous profile that clears on Unlock | [Apple Support](https://support.apple.com/guide/iphone/format-text-and-animate-messages-iphe5c5af4d4/ios) |
| O4 | **Telegram** send animation, backgrounds and sticker spec (2021–) | "Your input text smoothly transforms into the message bubble as it flies into the chat"; gradient wallpapers that "move beautifully every time you send a message"; interactive emoji play "simultaneously on your devices" — split-screen both phones for the mutual moment. Sticker budget: "The canvas size must be 512х512 pixels", "Animation length must not exceed 3 seconds", "smooth 60 FPS", TGS = "a gzipped bodymovin JSON file" | [animated backgrounds](https://telegram.org/blog/animated-backgrounds), [interactive emoji](https://telegram.org/blog/chat-themes-interactive-emoji-read-receipts), [sticker spec](https://core.telegram.org/stickers) |
| O5 | **Noto Emoji Animation** (Google) | Real animated emoji we can put in the mock chat: "Animated Noto Emoji is licensed under CC BY 4.0" (credit required); ".json and 512x512 .avif, .webp, and .gif are available". 881 emoji are animated, including 🫧 (bubbles), 💬, 👋, 🤝 and 🎉; the 👋 Lottie runs at 60 fps on a 1024×1024 canvas with `rest` markers — enter and exit on `rest` for clean holds. 🔓 and 🔑 are not animated (custom art needed) | [googlefonts.github.io/noto-emoji-animation](https://googlefonts.github.io/noto-emoji-animation/) |
| O6 | **Material 3 Expressive** (Google, May 2025) | Springs instead of easing/duration ("The physics system is replacing the previous system based on easing and duration"), 35 shapes with built-in morphing, used for "Actions in progress, like a friend typing". Research: "46 separate research studies… more than 18,000 participants", preference "up to 87%" among 18–24-year-olds | [Google Design](https://design.google/library/expressive-material-design-google-research), [M3 blog](https://m3.material.io/blog/building-with-m3-expressive), [shape morph](https://m3.material.io/styles/shape/shape-morph) |
| O7 | **Google Messages** screen and reaction effects (2023) | Keyword-triggered screen effects, "an animated trio of hands dances around the message bubble" — particles orbiting a bubble's outline for the "matched" message | [blog.google](https://blog.google/products/android/7-new-messages-features/) |

### 1.4 Code resources (tools, not style references)

| # | Reference | Borrow exactly this | URL |
|---|---|---|---|
| T1 | **KHR_materials_iridescence** / three.js `MeshPhysicalMaterial.iridescence` | Thin-film interference "observable on soap bubbles, oil films", Belcour & Barla (2017) model; defaults IOR 1.3, thickness 100–400 nm | [Khronos spec](https://github.com/KhronosGroup/glTF/blob/main/extensions/2.0/Khronos/KHR_materials_iridescence/README.md) |
| T2 | **Liquid Glass Studio** (iyinchao, MIT) | Web recreation of Liquid Glass "powered by WebGL2 & WebGPU" with refraction, dispersion and SDF shape merging — read its shaders before writing ours | [github.com/iyinchao/liquid-glass-studio](https://github.com/iyinchao/liquid-glass-studio) |
| T3 | **Inigo Quilez, smooth minimum** | Normalised `smin` where `k` is "the thickness of the blended area, in actual distance units" — merges bubbles, pills and blobs | [iquilezles.org/articles/smin](https://iquilezles.org/articles/smin/) |
| T4 | **Plateau's laws / double bubble** | Two bubbles share a wall that is flat for equal sizes and bulges into the larger one; films meet at 120°; `1/r1 = 1/r2 + 1/r3` | [Soap bubble](https://en.wikipedia.org/wiki/Soap_bubble), [Double bubble theorem](https://en.wikipedia.org/wiki/Double_bubble_theorem) |
| T5 | **Microsoft Fluent Emoji** (MIT, includes a 3D style) | Material and lighting reference for soft 3D emoji; licence allows reuse | [github.com/microsoft/fluentui-emoji](https://github.com/microsoft/fluentui-emoji) |
| T6 | **three-gpu-pathtracer** (MIT) | Path-traced three.js for clay/3D shots that must not "look very 3D" | [github.com/gkjohnson/three-gpu-pathtracer](https://github.com/gkjohnson/three-gpu-pathtracer) |

### 1.5 The ten that matter most for this film

1. **S1 BUCK, Google Vids** — the onboarding chat opens as a sentence that becomes the interface.
2. **S9 Gunner, Sync** — strangers, floating spheres, one shared instant: the Unlock.
3. **S6 Giant Ant, Copilot** — the light, pastel, iridescent 3D look for the hero chat shot.
4. **O1/O2 Apple Liquid Glass** — materialize, the spreading glow, and the merge rule.
5. **S5 Ordinary Folk, Gemini** — big, light type that snaps into cards.
6. **S3 Animade, Sparky** — the AI's face as transition-plus-loop states, easy to code.
7. **O4 Telegram** — the input text flying into a bubble; both phones playing the same moment.
8. **B1 Figma Config 2025** — paired glyphs that react to each other; 15 fps hero steps.
9. **B3 Spotify Wrapped 2024** — oversized type as the scene for "three days".
10. **O6 Material 3 Expressive** — springs, 35 shapes and morphing, with values in §2.

---

## 2. Friendly motion, as numbers

Everything below is quoted from a source (linked) or computed from a sourced value with the scripts in Appendix A.
Where no source gives a value, the section says so and labels our starting point **proposal**.

### 2.1 One spring model under every library

All four systems drive the same unit-mass damped spring, `x'' = −k·(x − target) − c·x'`, with damping ratio
`ζ = c / (2·√k)`:

| System | Parameters | Mapping to k, c (mass 1) | Source |
|---|---|---|---|
| Jetpack Compose / Material 3 | `spring(dampingRatio, stiffness)` | `k = stiffness`, `ζ = dampingRatio` (`naturalFreq = sqrt(stiffness)`, `c = 2·naturalFreq·dampingRatio`) | [SpringSimulation.kt](https://github.com/androidx/androidx/blob/androidx-main/compose/animation/animation-core/src/commonMain/kotlin/androidx/compose/animation/core/SpringSimulation.kt) |
| SwiftUI | `Spring(duration, bounce)` | `k = (2π / duration)²`; `c = 4π·(1 − bounce) / duration` for bounce ≥ 0 (so `ζ = 1 − bounce`), for bounce < 0, `ζ = 1/(1 + bounce)` (the mapping Motion's port also uses). Apple's example: `Spring(duration: 0.5, bounce: 0.3)` → "(1.0, 157.9, 17.6)" | [Spring](https://developer.apple.com/documentation/swiftui/spring), [WWDC23 "Animate with springs"](https://developer.apple.com/videos/play/wwdc2023/10158/) ¹ |
| Motion (Framer Motion) | physics default `stiffness 100, damping 10, mass 1`; or `duration 800 ms, bounce 0.3`; or `visualDuration` | bounce → ζ "as SwiftUI does"; `visualDuration`: `ω = 2π / (1.2·visualDuration)`, `k = ω²`, `c = 2ζ√k` | [spring.ts](https://github.com/motiondivision/motion/blob/main/packages/motion-dom/src/animation/generators/spring.ts) |
| react-spring | default `{ mass: 1, tension: 170, friction: 26 }` | `k = tension`, `c = friction` | [react-spring config](https://www.react-spring.dev/docs/advanced/config) |

¹ The WWDC23 page's code panel prints the damping line as "damping = 1 - 4π × bounce ÷ duration" (parentheses
lost). Apple's numeric example (0.5 s, bounce 0.3 → damping 17.6) only matches `c = 4π·(1 − bounce)/duration`.
Keep that example as a unit test so nobody "fixes" the code from the slide.

SwiftUI's presets are not stated in the prose docs, but the SDK's public interface defines them (read from
`MacOSX26.2.sdk/…/SwiftUICore.swiftinterface` on this machine): `.smooth` = `Spring(duration: 0.5, bounce: 0)`,
`.snappy` = bounce **0.15**, `.bouncy` = bounce **0.3**, `.interactiveSpring` = duration 0.15, bounce 0.15, blend
0.25. `Animation.default` is "response equal to 0.55, dampingFraction equal to 1.0"
([docs](https://developer.apple.com/documentation/swiftui/animation/default)).

For a code-rendered film, evaluate springs in **closed form per frame**, never by integrating, so every frame is
deterministic however the render is sharded:

```js
// Step response of a unit-mass spring from 0 to 1, zero start velocity. t in seconds.
export function spring01(t, zeta, k) {
  const wn = Math.sqrt(k);
  if (t <= 0) return 0;
  if (zeta < 1) {
    const wd = wn * Math.sqrt(1 - zeta * zeta);
    return 1 - Math.exp(-zeta * wn * t) * (Math.cos(wd * t) + (zeta / Math.sqrt(1 - zeta * zeta)) * Math.sin(wd * t));
  }
  if (zeta === 1) return 1 - Math.exp(-wn * t) * (1 + wn * t);
  const s = Math.sqrt(zeta * zeta - 1), r1 = -wn * (zeta - s), r2 = -wn * (zeta + s);
  return 1 + (r2 * Math.exp(r1 * t) - r1 * Math.exp(r2 * t)) / (r1 - r2);
}
```

Two endpoint rules carried over from reel 04's bug list: return exactly 0 before the start, and **snap to exactly 1**
once the remaining error is under a quarter pixel of the move (`(1 − x)·distancePx < 0.25`). A check of `spring01`
against a 100 kHz numerical integration agrees to 1.3e-4, and it reproduces the values the OS-research agent read from a
compiled SwiftUI test (`.snappy` at 0.2 s: 0.78637 vs SwiftUI's 0.7864; `.bouncy` at 0.3 s: 1.03393 vs 1.0339).

### 2.2 Material 3 Expressive spring tokens (actual values)

From the generated token files in AndroidX (`// VERSION: v0_14_0`), identical in Material Components for Android
([tokens.xml](https://github.com/material-components/material-components-android/blob/master/lib/java/com/google/android/material/motion/res/values/tokens.xml)):
[ExpressiveMotionTokens.kt](https://github.com/androidx/androidx/blob/androidx-main/compose/material3/material3/src/commonMain/kotlin/androidx/compose/material3/tokens/ExpressiveMotionTokens.kt),
[StandardMotionTokens.kt](https://github.com/androidx/androidx/blob/androidx-main/compose/material3/material3/src/commonMain/kotlin/androidx/compose/material3/tokens/StandardMotionTokens.kt).
Overshoot, peak and settle columns are **computed** (0 → 1 step, no start velocity); f = frames at 60 fps.

| Scheme · token | Damping ratio ζ | Stiffness k | Overshoot | Peak at | 90 % at | Settled to 0.5 % |
|---|---|---|---|---|---|---|
| Expressive · fast spatial | **0.6** | **800** | 9.5 % | 138 ms (8 f) | 83 ms (5 f) | 320 ms (19 f) |
| Expressive · default spatial | **0.8** | **380** | 1.5 % | 268 ms (16 f) | 153 ms (9 f) | 370 ms (22 f) |
| Expressive · slow spatial | **0.8** | **200** | 1.5 % | 370 ms (22 f) | 212 ms (13 f) | 510 ms (31 f) |
| Both · fast effects | **1.0** | **3800** | 0 | — | 63 ms (4 f) | 120 ms (7 f) |
| Both · default effects | **1.0** | **1600** | 0 | — | 98 ms (6 f) | 185 ms (11 f) |
| Both · slow effects | **1.0** | **800** | 0 | — | 138 ms (8 f) | 262 ms (16 f) |
| Standard · fast spatial | **0.9** | **1400** | 0.15 % | 193 ms | 92 ms (6 f) | 145 ms (9 f) |
| Standard · default spatial | **0.9** | **700** | 0.15 % | 272 ms | 130 ms (8 f) | 207 ms (12 f) |
| Standard · slow spatial | **0.9** | **300** | 0.15 % | 417 ms | 197 ms (12 f) | 315 ms (19 f) |

What the source says each is for
([MotionScheme.kt](https://github.com/androidx/androidx/blob/androidx-main/compose/material3/material3/src/commonMain/kotlin/androidx/compose/material3/MotionScheme.kt)):
spatial specs are "for animations that may change the shape or bounds of the component"; effects specs "do not
change the shape or bounds of the component. For example, color animation." The expressive scheme "is Material's
recommended motion scheme for prominent UI elements and hero interactions"; the standard one is "for utilitarian UI
elements and recurring interactions".

**Google's own cubic-bezier stand-ins** for when a spring cannot run ("Use springs when possible, otherwise use curves
that mimic the springs for animations without interruptions or gestures"), from the M3 motion specs page
([m3.material.io specs](https://m3.material.io/styles/motion/overview/specs); read from the page's content JSON,
[endpoint](https://m3.material.io/_dsm/content/m3/2026-09-23_06-10-05/ccf2c3e9-82b5-4c4a-9570-b0d08d95c0c1.json)):

| Spring | Curve (verbatim) | Duration | Curve's overshoot (computed) |
|---|---|---|---|
| Expressive fast spatial | `0.42, 1.67, 0.21, 0.90` | 350 ms | 9.2 % at 135 ms |
| Expressive default spatial | `0.38, 1.21, 0.22, 1.00` | 500 ms | 1.4 % at 279 ms |
| Expressive slow spatial | `0.39, 1.29, 0.35, 0.98` | 650 ms | 1.9 % at 366 ms |
| Fast / default / slow effects (both schemes) | `0.31, 0.94, 0.34, 1.00` / `0.34, 0.80, 0.34, 1.00` / `0.34, 0.88, 0.34, 1.00` | 150 / 200 / 300 ms | 0 |
| Standard spatial (fast / default / slow) | `0.27, 1.06, 0.18, 1.00` | 350 / 500 / 750 ms | 0.06 % |

Google's curves peak within 3–11 ms of our computed springs (fast spatial: 9.2 % at 135 ms vs 9.5 % at 138 ms),
which cross-checks both.

Three M3 Expressive component recipes, read from the Compose source (codeable as-is):

| Recipe | Values | Source |
|---|---|---|
| **Loading indicator** (the shape-morphing "thinking" state) | Cycles 7 shapes: SoftBurst → Cookie9Sided → Pentagon → Pill → Sunny → Cookie4Sided → Oval. A new morph every **650 ms**, each on `spring(dampingRatio = 0.6, stiffness = 200, visibilityThreshold = 0.1)`; each morph adds **+90°**, on top of a **4666 ms** linear full turn | [LoadingIndicator.kt](https://github.com/androidx/androidx/blob/androidx-main/compose/material3/material3/src/commonMain/kotlin/androidx/compose/material3/LoadingIndicator.kt) |
| **Button-group squish** | The pressed button widens by **15 %** of its width (`ExpandedRatio = 0.15f`) and its neighbours compress; fast-spatial spring | [ButtonGroup.kt](https://github.com/androidx/androidx/blob/androidx-main/compose/material3/material3/src/commonMain/kotlin/androidx/compose/material3/ButtonGroup.kt) |
| **Press shape-morph** | Small button: fully round (`CornerFull`) at rest → `CornerSmall` = **8 dp** corners while pressed (medium = 12 dp) | [ButtonSmallTokens.kt](https://github.com/androidx/androidx/blob/androidx-main/compose/material3/material3/src/commonMain/kotlin/androidx/compose/material3/tokens/ButtonSmallTokens.kt), [ShapeTokens.kt](https://github.com/androidx/androidx/blob/androidx-main/compose/material3/material3/src/commonMain/kotlin/androidx/compose/material3/tokens/ShapeTokens.kt) |

### 2.3 Typical overshoot

Peak overshoot of this spring is `PO = 100·exp(−ζπ / √(1 − ζ²))`
([Wikipedia, Overshoot](https://en.wikipedia.org/wiki/Overshoot_%28signal%29)). Computed for the published presets:

| Preset | ζ | k | Overshoot | Settled to 0.5 % |
|---|---|---|---|---|
| SwiftUI `.smooth` (0.5 s, bounce 0) | 1.0 | 157.9 | 0 | 590 ms |
| SwiftUI `.spring(response: 0.5, dampingFraction: 0.825)` (older default) | 0.825 | 157.9 | 1.0 % | 565 ms |
| SwiftUI `.snappy` (bounce 0.15) — WWDC23: "doesn't feel very bouncy yet, but the long tail feels a little more brisk" | 0.85 | 157.9 | 0.6 % | 538 ms |
| SwiftUI `.bouncy` (bounce 0.3) — "you do start to feel some noticeable bounciness" | 0.7 | 157.9 | 4.6 % | 555 ms |
| SwiftUI bounce 0.4 — "be cautious about using values higher than around 0.4, since they may feel too exaggerated for a UI element" | 0.6 | 157.9 | 9.5 % | 723 ms |
| Motion `visualDuration 0.3 s, bounce 0.3` | 0.7 | 304.6 | 4.6 % | 400 ms |
| react-spring `stiff` (210 / 20) | 0.69 | 210 | 5.0 % | 478 ms |
| react-spring `gentle` (120 / 14) | 0.64 | 120 | 7.4 % | 783 ms |
| Motion physics default (k 100, c 10) | 0.5 | 100 | 16.3 % | 917 ms |
| react-spring `wobbly` (180 / 12) | 0.45 | 180 | 20.8 % | 872 ms |

**Reading it:** friendly UI in the sourced systems lives at **1.5–10 % overshoot** (M3 default 1.5 %, `.bouncy`
4.6 %, M3 fast spatial 9.5 %, Apple's 0.4 ceiling 9.5 %). Character-like jelly lives at **16–21 %** (Motion's
default, react-spring `wobbly`). Easing curves with built-in overshoot: Penner's back (`c1 = 1.70158`) peaks at
**10.0 %**; easings.net `easeOutBack` `cubic-bezier(0.34, 1.56, 0.64, 1)` at **9.8 %**; `easeInOutBack`
`cubic-bezier(0.68, -0.6, 0.32, 1.6)` at **10.5 %** (computed from
[easings.yml](https://github.com/ai/easings.net/blob/master/src/easings.yml),
[easingsFunctions.ts](https://github.com/ai/easings.net/blob/master/src/easings/easingsFunctions.ts)).

**Film spring set — proposal** (names are ours, values sourced):

| Name | ζ / k | Overshoot · settle | Use |
|---|---|---|---|
| `pop` | 0.6 / 800 (M3 expressive fast spatial) | 9.5 % · 19 f | chat bubbles, chips, stickers entering |
| `settle` | 0.8 / 380 (M3 expressive default spatial) | 1.5 % · 22 f | cards, the phone screen, panels |
| `glide` | 0.8 / 200 (M3 expressive slow spatial) | 1.5 % · 31 f | large UI travels, screen to screen |
| `fade` | 1.0 / 1600 (M3 default effects) | 0 · 11 f | opacity, colour, blur, refraction strength |
| `morph` | 0.6 / 200 (M3 loading indicator) | 9.5 % · 38 f | shape morphs, + 90° per morph |
| `wobble` | 0.45 / 160 (between Motion's default and react-spring `wobbly`) | 20.5 % · 55 f | soap bubbles, clay, characters — never on UI text |
| `camera` | ζ 1.0, or the M3 emphasized path below | 0 | camera moves: no overshoot on the lens |

Sampled at 60 fps the visible peak is slightly lower than the continuous one (fast spatial 9.36 % vs 9.48 %),
because the frame grid misses the exact apex.

### 2.4 Squash and stretch

What is sourced:

- **Conserve volume.** Pixar's squash-and-stretch patent defines **"squamount"**: "approximately the percentage of
  volume that is persevered [sic], such that 0 is no volume preservation, or a scale while 1 is complete
  preservation", with `L′*D′*H′ = ((L−L′)*Vp+L′)*D*H`
  ([US7221379B2](https://patents.google.com/patent/US7221379B2/en)). Full preservation gives `sx = 1/sy` in 2D and
  `sx = sz = 1/√sy` in 3D.
- **A published impact pose:** GSAP's CustomBounce docs pair a bounce with `scaleX: 1.4, scaleY: 0.6` at the squash
  ([gsap.com](https://gsap.com/docs/v3/Eases/CustomBounce)) — a 40 % squash that is not area-preserving
  (1.4 × 0.6 = 0.84).
- **A UI squish:** M3 Expressive's button group widens the pressed button by 15 % (§2.2).

**Not found:** any canonical published squash ratio for UI elements. Starting points — **proposal**, area-preserving
unless noted, applied for 2–4 frames at contact and released on the `wobble` spring:

| Element | Squash at contact | Stretch at peak speed |
|---|---|---|
| Chat bubble / chip landing | sy 0.92, sx 1.087 | none (text stays crisp) |
| Button press | M3's +15 % width, height unchanged (the neighbours give the space back — not area-preserving) | none |
| Soap bubble / clay body impact | sy 0.80, sx 1.25 (2D) or sx = sz = 1.118 (3D) | ≤ 1.15 along velocity |
| The Unlock pop | sy 0.75, sx 1.333 for 2 f before the burst | 1.2 |

Keep glyphs out of the squash: scale the container and counter-scale the text layer, or the type wobbles.

### 2.5 Stagger

- IBM Carbon: "staggering the entrance of table content by 20 ms significantly reduces the cognitive load", and "the
  delay should be adjusted to ensure that total time is still within 500 ms"
  ([Carbon, Choreography](https://carbondesignsystem.com/elements/motion/choreography/)).
- 20 ms is 1.2 frames at 60 fps, which reads as simultaneous on video. **Proposal:** glyphs 1–2 f (17–33 ms) apart;
  chips and rows 3–5 f (50–83 ms); a group's total ≤ 500 ms (Carbon's cap) except the one hero reveal. Order by
  reading direction, or outward from the tap point.

### 2.6 Cubic-bezier easings (camera, wipes, anything not on a spring)

| Token | Value | Source |
|---|---|---|
| M3 standard | `cubic-bezier(0.2, 0, 0, 1)` | Compose [MotionTokens.kt](https://github.com/androidx/androidx/blob/androidx-main/compose/material3/material3/src/commonMain/kotlin/androidx/compose/material3/tokens/MotionTokens.kt), material-web [_md-sys-motion.scss](https://github.com/material-components/material-web/blob/main/tokens/versions/latest/sass/_md-sys-motion.scss) |
| M3 standard decelerate / accelerate | `(0, 0, 0, 1)` / `(0.3, 0, 1, 1)` | same |
| M3 emphasized | path `M 0,0 C 0.05, 0, 0.133333, 0.06, 0.166666, 0.4 C 0.208333, 0.82, 0.25, 1, 1, 1` (two cubic segments) | MDC-Android [tokens.xml](https://github.com/material-components/material-components-android/blob/master/lib/java/com/google/android/material/motion/res/values/tokens.xml); material-web approximates it as `cubic-bezier(.3,0,0,1)` "with unknown accuracy" ([animation.ts](https://github.com/material-components/material-web/blob/main/internal/motion/animation.ts)) |
| M3 emphasized decelerate | `(0.05, 0.7, 0.1, 1)` — MDC-Android has `(0.1, 0.7, 0.1, 1)` | Compose / material-web vs MDC-Android |
| M3 emphasized accelerate | `(0.3, 0, 0.8, 0.15)` — MDC-Android has `(0.3, 0, 0.8, 0.2)` | same |
| M3 durations | short 50/100/150/200 ms · medium 250/300/350/400 · long 450/500/550/600 · extra-long 700/800/900/1000 | MotionTokens.kt |
| Carbon expressive standard / entrance / exit | `(0.4, 0.14, 0.3, 1)` / `(0, 0, 0.3, 1)` / `(0.4, 0.14, 1, 1)`; durations 70, 110, 150, 240, 400, 700 ms | [Carbon motion](https://carbondesignsystem.com/elements/motion/overview/) |
| easeOutBack / easeInOutBack | `(0.34, 1.56, 0.64, 1)` / `(0.68, -0.6, 0.32, 1.6)` | easings.net |
| easeOutExpo / easeOutQuint / easeInOutCubic | `(0.16, 1, 0.3, 1)` / `(0.22, 1, 0.36, 1)` / `(0.65, 0, 0.35, 1)` | easings.net |

Google's two code bases disagree slightly on the emphasized decelerate/accelerate controls; use the Compose values
(same as material-web).

### 2.7 Shape morphing (M3 Expressive)

**The library.** `MaterialShapes` has 35 shapes: Circle, Square, Slanted, Arch, Fan, Arrow, SemiCircle, Oval, Pill,
Triangle, Diamond, ClamShell, Pentagon, Gem, Sunny, VerySunny, Cookie4Sided, Cookie6Sided, Cookie7Sided,
Cookie9Sided, Cookie12Sided, Ghostish, Clover4Leaf, Clover8Leaf, Burst, SoftBurst, Boom, SoftBoom, Flower, Puffy,
PuffyDiamond, PixelCircle, PixelTriangle, Bun, Heart
([MaterialShapes.kt](https://github.com/androidx/androidx/blob/androidx-main/compose/material3/material3/src/commonMain/kotlin/androidx/compose/material3/MaterialShapes.kt)).
Exact construction (unit square, centre 0.5, 0.5; `rN` = corner rounding radius):

| Shape | Construction |
|---|---|
| Cookie9Sided | `RoundedPolygon.star(numVerticesPerRadius = 9, innerRadius = 0.8, rounding = 0.5)`, rotated −90° |
| Cookie12Sided | `star(12, innerRadius 0.8, rounding 0.5)`, −90° |
| Cookie7Sided | `star(7, innerRadius 0.75, rounding 0.5)`, −90° |
| Cookie4Sided | points (1.237, 1.236) r 0.258 and (0.5, 0.918) r 0.233, repeated 4× |
| Sunny | `star(8, innerRadius 0.8, rounding 0.15)` |
| Clover4Leaf | (0.5, 0.074) unrounded and (0.725, −0.099) r 0.476; 4 reps, mirrored |
| Clover8Leaf | (0.5, 0.036) and (0.758, −0.101) r 0.209; 8 reps |
| Flower | (0.370, 0.187), (0.416, 0.049) r 0.381, (0.479, 0.001) r 0.095; 8 reps, mirrored |
| Heart | (0.5, 0.268) r 0.016, (0.792, −0.066) r 0.958, (1.064, 0.276) r 1.0, (0.501, 0.946) r 0.129; mirrored |
| Pill | (0.961, 0.039) r 0.426, (1.001, 0.428), (1.0, 0.609) r 1.0; 2 reps, mirrored |
| Square / Triangle | `rectangle(1, 1, rounding = 0.3)` / `RoundedPolygon(3, rounding = 0.2)` |

"Smoothing is a factor which determines how long it takes to get from the circular rounding portion of the corner
to the edge"; 0 gives pure circular corners
([Shapes in Compose](https://developer.android.com/develop/ui/compose/graphics/draw/shapes)).

**How the morph works.** `Morph(start, end)` only morphs `RoundedPolygon`s, whose outlines are one contiguous run of
cubics; it "works by determining how to map the curves of the two shapes together (based on proximity and other
information, such as distance to polygon vertices and concavity), and splitting curves when the shapes do not have
the same number of curves"
([Morph.kt](https://github.com/androidx/androidx/blob/androidx-main/graphics/graphics-shapes/src/commonMain/kotlin/androidx/graphics/shapes/Morph.kt)).
The feature mapper sorts every pair of corners by distance and accepts the closest pairs that do not cross
([FeatureMapping.kt](https://github.com/androidx/androidx/blob/androidx-main/graphics/graphics-shapes/src/commonMain/kotlin/androidx/graphics/shapes/FeatureMapping.kt));
progress 0–1 then lerps the matched cubic control points. Google's caveat: it is "not for morphing between arbitrary
paths (for example, a play icon to a pause icon)". M3 itself says shape morphing on the web "is not currently
available".

**On the web:** `@wearables-ui-toolkit/androidx-shapes` (Apache-2.0, a TypeScript port of RoundedPolygon from
Meta's [meta-ray-ban-display-ui-toolkit-web](https://github.com/facebook/meta-ray-ban-display-ui-toolkit-web));
`material-shapes-ts` (Apache-2.0, "all 35 shapes, plus morphing/transitions",
[repo](https://github.com/ruanspies/material-shapes-ts) — new and unstarred, test before relying on it); `flubber`
(MIT, [repo](https://github.com/veltman/flubber), arbitrary SVG paths). The Kotlin shape files are plain geometry,
so a direct port is bounded work. For merges rather than morphs (two blobs becoming one), use a signed-distance
smooth minimum — Inigo Quilez's normalised quadratic `smin`:

```glsl
float smin(float a, float b, float k) {   // k = width of the blend, in distance units
  k *= 4.0;
  float h = max(k - abs(a - b), 0.0) / k;
  return min(a, b) - h * h * k * (1.0 / 4.0);
}
```

---

## 3. Vertical social conventions

### 3.1 Safe zones at 1080×1920

| Platform | Top | Bottom | Left | Right | How we know |
|---|---|---|---|---|---|
| **TikTok** In-Feed ads, standard overlay | 240 | 660 | 120 | 120 above y 840; **300** from y 840 down (the icon rail, x 780–960) | Measured by us from TikTok's official overlay PNG (2880×5120, scaled ×0.375), linked from [Video ads specifications](https://ads.tiktok.com/help/article/video-ads-specifications?lang=en). The page itself gives no numbers in text |
| TikTok with an anchor / 1–4 caption lines | 252 | 812 (1 line) to 1014 (4 lines) | 120 | 120; 240 from y 360 | Measured by the research agent from TikTok's anchor overlay (same page); not re-measured |
| **Instagram Reels** ads | 269 (14 %) | 672 (35 %) | 65 (6 %) | 65 (6 %) | "Consider leaving at least 14% of the top, 35% of the bottom, and 6% on each side of your asset free from text, logos, or other important creative elements" — [Meta Ads Guide](https://www.facebook.com/business/ads-guide/update/video/instagram-reels?locale=en_US) |
| **YouTube incl. Shorts** (Google "Universal Video Ad Safe Zones", vertical) | 288 | 672 | 48 | 192 | Measured by us from Google's official 1080×1920 vertical overlay PNG, linked from the [PDF](https://services.google.com/fh/files/misc/universalsafezones-youtube.pdf); "Approved for use across all screens, formats & campaign types" |

**Not found:** official *organic* (non-ad) safe zones for any of the three. The ad overlays are the conservative proxy.

**Intersection (computed):** safe band y **288–1248**; within it x **120–888** above y 840 (768 wide) and x
**120–780** below y 840 (660 wide). One strict rectangle for all three: **x 120–780, y 288–1248 = 660×960 px**
(30.6 % of the frame; its centre is x 450, not 540). Titles centred on x 540 may be **≤ 696 px wide above y 840**
and **≤ 480 px wide from y 840 to 1248**. With TikTok anchors or 4-line captions, keep critical content above
y ≈ 906.

What it means for the layout: the upper-middle band (y 288–840) is the title zone — it is also where the eye lands
first. Hero subjects and UI may bleed into the margins, but no word, face or key UI state may sit in the bottom
672 px or in the right rail below y 840.

### 3.2 Hook and pacing

| Source | What it says |
|---|---|
| TikTok, [Creative best practices](https://ads.tiktok.com/help/article/creative-best-practices?lang=en) | "Prioritize your hook in the first 6 seconds to boost engagement and increase watch time." "Introduce your content proposition in the first 3 seconds for better recall and awareness." "We recommend displaying 5-10 words per second when using text." |
| TikTok, [9 Creative Tips](https://ads.tiktok.com/business/library/Auction_Ads_Creative_Tips.pdf) (2020) | "over 63% of all videos with the highest click-through rate (CTR) highlight their key message or product within the first 3 seconds"; "Try to include fast-paced tracks above 120 BPM" |
| TikTok, [blog](https://ads.tiktok.com/business/en-US/blog/creative-that-drives-conversions) (Dec 2021) | Ads "between 21 and 34 seconds in length received a 280% lift in conversion"; (gaming) "five or more scenes showed an incredible 171% lift"; "onscreen text in the first 7 seconds saw a 43% lift" |
| Meta, [video ads](https://www.facebook.com/business/news/updated-features-for-video-ads?locale=en_US) (2016) | "65% of people who watch the first three seconds of a video will watch for at least ten seconds"; citing Nielsen, "up to 47% of the value in a video campaign was delivered in the first three seconds" |
| Meta, [The Science of the Hook](https://www.facebook.com/business/news/the-science-of-the-hook-how-to-supercharge-your-reels-performance?locale=en_US) (Dec 2025) | Great Reels "nail the hook" within the first few seconds (no exact number) |
| Google, [ABCD reference guide](https://services.google.com/fh/files/misc/youtube_google_abcd_reference_guide_en.pdf) (2019) | "Introduce your product or brand in the first five seconds." "Have more than two frames in the first five seconds to hook your audience early on." |
| Google, [ABCDs](https://support.google.com/google-ads/answer/14783551) / [Shorts ads](https://support.google.com/google-ads/answer/16041697) | "Jump in: Get to the heart of the story faster, and use engaging pacing and tight framing"; Shorts: "only the first 60 seconds will play on the Shorts feed"; "For action-oriented ads, use 10-30 second vertical videos" |

**Not found:** any official average shot length or cut rate for top short-form ads.

For this film:

1. Frame 0 already shows the hook subject in motion (no fade from black): one subject, centred in the safe band.
2. Name on screen by **~4–5 s** (TikTok's 3 s proposition, Google's 5 s brand) — inside the owner's ~9 s cap.
3. At least three shots in the first 5 s, 1–2 s shots after, one deliberate breath (the Unlock).
4. Score at ≥ 120 BPM; reel 04's 120 BPM grid (1 beat = 30 frames) fits.
5. 60 s is long by every platform's data. Keep the master ≤ 60.0 s (the Shorts feed limit) and plan a ~30 s cut-down.

### 3.3 Minimum text sizes

- **Platforms:** none of TikTok, Meta or YouTube publishes a minimum text size that we could find.
- **WCAG 2.2** sets no minimum size; "large scale" (at least 18 pt, or 14 pt bold) only changes the contrast
  threshold ([WCAG 2.2](https://www.w3.org/TR/WCAG22/#dfn-large-scale)).
- **Apple HIG:** iOS default text size **17 pt**, minimum **11 pt**
  ([Typography](https://developer.apple.com/design/human-interface-guidelines/typography)); the HIG widget table lists
  a 393×852 pt iPhone screen ([Widgets](https://developer.apple.com/design/human-interface-guidelines/widgets)).
  A full-width 1080 px video on a 393 pt screen gives 2.75 video px per pt (computed): 17 pt = **47 px**,
  11 pt = **30 px** (375 pt screen: 49 / 32 px).
- **BBC subtitles, 9:16:** "Font size should be set to fit within a line height in the range 3.9% to 4.5% of the
  active video height for 9:16" and "set the font size to be approximately 3.5% of the height" — at 1920 that is a
  **67 px** font on a 75–86 px line ([BBC Subtitle Guidelines](https://www.bbc.co.uk/accessibility/forproducts/guides/subtitles/)).

**Type scale — proposal:** hero words 160–240 px (1–3 words); headlines 112–144 px; secondary lines 72–96 px;
captions 64–72 px; UI text inside the mock phone ≥ 47 px at rest and never < 32 px (push the camera in instead of
shrinking UI). At an average advance of about 0.5 em (estimate — measure with the real face), the 660 px strict width
holds ~27 characters at 49 px and ~11 at 120 px.

### 3.4 Captions

- **BBC:** subtitles at 160–180 wpm, "a minimum period of around 0.3 seconds per word (e.g. 1.2 seconds for a 4-word
  subtitle)"; for vertical video "a maximum subtitle length of three lines", width up to "90% of the width of a
  vertical 9:16 video", about "25 characters in a 90% width region of a 9:16 (vertical) video"; "In vertical (9:16)
  videos, it is common to position subtitles a little higher up, though still generally in the lower third"
  ([BBC](https://www.bbc.co.uk/accessibility/forproducts/guides/subtitles/)). Note the clash: the lower third of a
  9:16 frame is inside Reels/Shorts' unsafe bottom 672 px, so captions here go **between y 960 and 1248**.
- **Netflix:** "42 characters per line", adults "Up to 20 characters per second", "Maximum two lines"
  ([Timed Text Style Guide](https://partnerhelp.netflixstudios.com/hc/en-us/articles/217350977-English-USA-Timed-Text-Style-Guide)); "Minimum duration:
  5/6 (five-sixths) of a second", "Maximum duration: 7 seconds" ([General Requirements](https://partnerhelp.netflixstudios.com/hc/en-us/articles/215758617-Timed-Text-Style-Guide-General-Requirements)).
- **TikTok's "5-10 words per second"** is far faster than the owner's reading rule (0.5 s + 0.375 s per word, i.e. at
  most ~2.7 words/s for a fresh line). Use the owner's rule for any line that carries meaning; TikTok's rate only for text that
  repeats the voice or a line already read.
- **Sound off vs on:** Meta (2016) found "41% of videos were basically meaningless without sound" and captioned
  ads "increase video view time by an average of 12%"
  ([Meta](https://www.facebook.com/business/news/updated-features-for-video-ads?locale=en_US)); Meta (Dec 2025): music or
  voice-over in Reels "up to 13% higher incremental conversions"
  ([Meta](https://www.facebook.com/business/news/the-science-of-the-hook-how-to-supercharge-your-reels-performance?locale=en_US));
  TikTok: "The second you open TikTok, it's a sound-on experience"
  ([TikTok PDF](https://ads.tiktok.com/business/library/Auction_Ads_Creative_Tips.pdf)); Google: sound in Shorts ads
  "has been shown to increase conversions by over 20%" ([Google Ads Help](https://support.google.com/google-ads/answer/16041697?hl=en)).
  The widely quoted "As much as 85 percent of video views happen with the sound off" is publisher-reported
  ([Digiday, 2016](https://digiday.com/media/silent-world-facebook-video/)), not platform data. No current official
  sound-off percentage was found.
- **For this film:** every beat must read from picture + on-screen words alone (sound off), and the score carries it
  sound on. If there is voice-over, it runs through the whole film (owner's rule) and is captioned in-world: in
  Direction A the captions *are* incoming chat bubbles, max 2 lines, ≤ 25 characters a line, 64–72 px.

---

## 4. Three visual directions

All three are light and bright, put the product UI at film scale, keep type ≥ 64 px (except UI text, §3.3) inside
the safe band (§3.1), and give every act its own signature move. The spine is the same for each: **hook → name
(by ~4–5 s) → 1 priorities chat → 2 AI match → 3 three days anonymous → 4 both unlock → 5 friends, not dates → end
card.**

Contrast ratios are WCAG 2.x, computed by `contrast.py` (Appendix A) from the
[relative-luminance definition](https://www.w3.org/TR/WCAG22/#dfn-relative-luminance). AA is 4.5:1 for normal text
and 3:1 for large text; AAA is 7:1, or 4.5:1 for large text
([1.4.3](https://www.w3.org/TR/WCAG22/#contrast-minimum), [1.4.6](https://www.w3.org/TR/WCAG22/#contrast-enhanced)).
Every listed pair is at least 4.5:1, so it passes AA even for the small UI text inside the mock phone (47 px is about
17 pt on a phone, below WCAG's 18 pt "large scale") and AAA for titles and captions, which are large-scale. Only the
listed pairs may carry text.

All fonts are on npm as Fontsource packages under OFL-1.1 (licence and axes read from the
[Fontsource API](https://api.fontsource.org/v1/fonts), packages `@fontsource-variable/*` 5.3.x). Appendix B lists
every face checked.

---

### Direction A — "Outside Your Bubble" (chat bubbles × soap bubbles) · recommended

**Mood:** buoyant · iridescent · curious · airy · playful

**The idea.** "Your bubble" already means your social circle, and the app's job is to get you out of it. So the film
has one object at two scales: the flat chat bubble of the UI and a physical soap bubble. A chip inflates into a soap
bubble; two people's bubbles meet and share a wall (a real double bubble); unlocking pops the wall and the two become
one bubble; friends gather into foam.

**Palette**

| Role | Hex |
|---|---|
| Sky (background, top) | `#DCEFFF` |
| Peach haze (background, bottom) | `#FFE8DA` |
| Ink (all type on light) | `#0B1B3F` |
| Brand blue (sent bubbles, CTA) | `#1D4FF0` |
| White (received bubbles, highlights) | `#FFFFFF` |
| Film magenta (chips, accents) | `#FF6FAE` |
| Film teal (chips, accents) | `#3EE0C5` |
| Sun gold (the Unlock button) | `#FFC93C` |

| Text on background | Ratio | Grade |
|---|---|---|
| Ink on sky | 14.35:1 | AAA |
| Ink on peach | 14.33:1 | AAA |
| Ink on white bubble | 16.90:1 | AAA |
| White on brand blue | 6.12:1 | AA (AAA-large) |
| Brand blue on sky (one accent word) | 5.20:1 | AA (AAA-large) |
| Ink on sun gold | 11.00:1 | AAA |
| Ink on film magenta | 6.55:1 | AA (AAA-large) |
| Ink on film teal | 10.20:1 | AAA |
| White on ink (end card) | 16.90:1 | AAA |

Never set type on a bubble's film: it is transparent and its colours move, so its contrast cannot be controlled.
Type sits on sky or peach, inside UI bubbles, or is *made of* film at hero size only (below).

**Type**

- Display: **Bricolage Grotesque** — `@fontsource-variable/bricolage-grotesque` (`standard.css`), axes
  `opsz 12–96`, `wdth 75–100`, `wght 200–800`. Heroes at `opsz 96, wght 750–800, wdth 90–100`: friendly
  large-size quirks without looking childish.
- UI (stands in for the system font in the mock app): **Figtree** — `@fontsource-variable/figtree`, `wght 300–900`.
- Emoji in the chat: **Noto Color Emoji** (`@fontsource/noto-color-emoji`, OFL-1.1), and Noto's animated Lottie emoji
  (CC BY 4.0, credit required) for reactions (O5).

**Shape language.** Circles and capsules only. Chat bubbles are capsules with a soft tail; soap bubbles are spheres.
Where two bubbles meet, three films meet at 120°; the shared wall is flat for equal sizes and bulges into the larger
bubble otherwise ([Soap bubble](https://en.wikipedia.org/wiki/Soap_bubble)). In 2D, the double bubble is three arcs
meeting at 120° with `1/r1 = 1/r2 + 1/r3` ([Double bubble theorem](https://en.wikipedia.org/wiki/Double_bubble_theorem));
the centre spacing that gives 120° is `d² = r1² + r2² − r1·r2` (law of cosines; our derivation). A mark falls out of
it: two circles with a flat wall between them — two people, one conversation — which loses the wall when unlocked.

**Texture and lighting.** Two materials, kept physically honest:

- *Soap film (the world):* thin-film interference plus Fresnel reflection, and almost no refraction — a soap film
  is a very thin shell with parallel faces, so light passing through is barely displaced; unlike a glass ball, a
  bubble does not magnify what is behind it. three.js ships the Belcour–Barla
  thin-film model as `MeshPhysicalMaterial.iridescence` (IOR 1.3, thickness 100–400 nm by default, T1). For the hero
  bubble, port it into an analytic ray–sphere shader like reel 04's `gl/orb.js` and drive thickness with slow,
  downward-draining noise. What makes it premium is the **designed reflection**: two soft-box windows and a horizon
  gradient reflected in every bubble.
- *Glass (the UI's hero control):* the Unlock button only, in Liquid-Glass style — refraction, a rim light, a glow that
  spreads from the thumb (O1).
- Light: high-key daylight, warm key from top-left, cool sky fill. No dark scenes.

**Motion signature: inflate → drift → kiss → pop.** Chips inflate on `pop` (flat pill → sphere, iridescence blooming
from the tap point); bubbles drift on low-frequency flow noise with a buoyant rise, never linear; contact excites
surface wobble (radial modes 2–3 on `wobble`); the Unlock pops a wall in 2–3 frames with a droplet ring, and the
merged bubble settles on `wobble`.

**Signature move per act**

| Act | Move |
|---|---|
| Hook (0–2 s) | A soap film fills the frame in macro, its bands swirling — then the bands draw the first word (film thickness driven by the word's SDF). One continuous pull-back reveals a single bubble rising out of a chat field. The name is drawn the same way by ~4–5 s, with "Make friends outside your bubble" |
| 1 · Priorities | The AI asks in a chat bubble; each tapped chip (Family, Health, Career, Wealth…) inflates into a tinted soap bubble and floats into your cluster |
| 2 · Match | The camera rises over a sky of drifting clusters; the AI's "thinking" state is the M3 loading-indicator morph at hero size (§2.2); two clusters drift together and **kiss into a double bubble** |
| 3 · Three days anonymous | The chat at film scale. Avatars are frosted iridescent spheres with no faces. Day 1 → 2 → 3 is told by the sun's reflection travelling across those spheres (dawn → noon → golden). M3 lists "time of day" among the changes shape morph should communicate ([shape morph](https://m3.material.io/styles/shape/shape-morph)), so the avatars' outline also steps one morph per day |
| 4 · Both unlock | Two thumbs, two Unlock buttons (M3 press morph + 15 % squish); only when both are in does the **shared wall drain to clear and pop** — one bubble, two profiles. The film's one deliberate breath |
| 5 · Friends, not dates | More bubbles join into a light foam (groups, not couples); the foam settles into the end mark |

**Type in the scene.** Letters made of film (thickness = text SDF) for the hook and the name; words as lit signs seen
curved in a bubble's reflection; letters glimpsed through a passing bubble, tinted by the film (tinted, not
magnified); every other word lives in a chat bubble at film scale. Captions, if any, are incoming chat bubbles.

**References**

1. Giant Ant, Microsoft 365 Copilot (S6) — the look: white satin, a rounded slab with an iridescent underglow, pastel
   light. Our hero chat shot.
2. Gunner, "Sync" (S9) — the moment: strangers, floating liquid spheres, one shared instant. Our Unlock.
3. Apple Liquid Glass and `GlassEffectContainer` (O1, O2) — the material: materialize by ramping refraction, a glow
   that spreads from the fingertip, shapes that blend when closer than the container spacing (made physically exact
   for soap by Plateau's laws, T4). Our match "kiss" and the Unlock button.
4. Telegram send flight (O4) — "Your input text smoothly transforms into the message bubble as it flies into the
   chat": the hand-off from UI bubble to soap bubble.

**Risks.** Transparent film kills contrast (rule above). A macro film can read as a screensaver: leave it by 2 s and
make the UI the hero by 3 s. Real-time 3D "looks very 3D" (reel 05 note): keep bubbles analytic, lit by designed
reflections, and judge them at full resolution.

---

### Direction B — "Clay Day" (soft clay and 3D-emoji friends)

**Mood:** tactile · warm · cheeky · cosy · handmade

**The idea.** Friendships are *made*: everything is squeezable, candy-coloured clay. Until you unlock you are a
faceless clay pebble; unlocking presses a face into it.

**Palette**

| Role | Hex |
|---|---|
| Cream sweep (background, infinity cove) | `#FFF3E6` |
| Aubergine ink (type) | `#2A1B3D` |
| Butter | `#FFD45E` |
| Mint | `#86E3C6` |
| Pink | `#FF9EBB` |
| Sky | `#9CCBFF` |
| Tangerine | `#FF8A4C` |
| Violet (UI, buttons) | `#5B3DF5` |

| Text on background | Ratio | Grade |
|---|---|---|
| Ink on cream | 14.53:1 | AAA |
| Ink on butter | 11.21:1 | AAA |
| Ink on mint | 10.45:1 | AAA |
| Ink on sky | 9.38:1 | AAA |
| Ink on pink | 8.21:1 | AAA |
| Ink on tangerine | 6.80:1 | AA (AAA-large) |
| White on violet | 6.12:1 | AA (AAA-large) |
| Cream on ink (end card) | 14.53:1 | AAA |

No browns and no dark lumps anywhere (reel 05: a brown boulder read as "poop").

**Type**

- Display: **Fraunces** — `@fontsource-variable/fraunces` (`full.css` carries every axis): `opsz 9–144`,
  `wght 100–900`, `SOFT 0–100`, `WONK 0–1`. Heroes at `opsz 144, wght 850, SOFT 100, WONK 1` — a gooey, rounded serif
  that already looks rolled from clay. SOFT: "Adjust letterforms to become more and more soft and rounded"; WONK:
  "Toggle the substitution of wonky forms", e.g. "leaning stems in roman, or flagged ascenders in italic"
  ([Google axis registry](https://github.com/googlefonts/axisregistry/tree/main/Lib/axisregistry/data)).
- UI: **Nunito** — `@fontsource-variable/nunito`, `wght 200–1000` (rounded terminals match the clay).

**Shape language.** Pebbles, blobs, pills and puffy tokens with visible thickness; slight asymmetry and fingerprint
dents; no perfect spheres. M3's Puffy, Bun and Cookie shapes, extruded, become the priority tokens.

**Texture and lighting.** Soft 3D clay: matte (roughness ~0.6–0.8, proposal), a little sheen, thin parts slightly
translucent, fingerprint micro-normals; one large overhead soft-box, a warm bounce card, soft contact shadows on a
pastel cove. To clear "real-time 3D looks very 3D", path-trace it (three.js + three-gpu-pathtracer, T6) rather than
raster.

**Motion signature: squish and stamp.** The clay world animates on twos (30 fps steps — Figma Config 2025 stepped its
hero type at 15 fps for a "tactile and handmade" feel, B1) while the UI stays at 60 fps; landings squash hard
(`wobble`, sy 0.80); one blob reshapes into the next object instead of cutting.

**Signature move per act**

| Act | Move |
|---|---|
| Hook | One giant clay speech bubble, squashed flat by a thumb into a full-frame slab; the name is pressed into it |
| 1 · Priorities | Clay tokens (house, coin, briefcase, sneaker) plop into the chat and squash on landing |
| 2 · Match | A toy marble run sorts pebbles by colour into pairs — the AI is a machine, not a mascot host |
| 3 · Three days | A clay sun and moon flip over a little stage while the chat runs; avatars are blank pebbles |
| 4 · Both unlock | Two thumbs press two pebbles; the thumbprints become faces; the profiles slide out |
| 5 · Friends, not dates | A ring of pebble friends squishes together; a clay heart is re-rolled into a flower |

**Type in the scene.** Extruded clay letters that squash on landing; words debossed into slabs; captions lit by the
same soft-box as the clay.

**References**

1. Oddfellows, Spotify Premium (S7) — UI controls rebuilt as soft-touch objects with the copy printed on them; take
   it onto a light cove.
2. Airbnb 2025 (B5) — soft, rounded 3D pictograms that each play one small story when tapped.
3. Animade, Walmart Sparky (S3) — faces as transition-plus-loop states: what the pebbles do once unlocked.
4. Duolingo × Rive (B6) — a layered idle rig (8 head × 8 body loops) so the pebbles feel alive without repeating.

**Risks.** Character appeal is a Pixar-bar craft problem; path-traced frames are heavy to render; clay can tip into
"for kids".

---

### Direction C — "Big Hello" (flat colour, kinetic type, shape morphs)

**Mood:** loud · witty · punchy · confident · social

**The idea.** Type is the stage: full-bleed colour fields, words set at the size of the frame and cut on the beat,
and M3 Expressive shapes as everyone's anonymous avatar.

**Palette**

| Role | Hex |
|---|---|
| Cream | `#FFF6E9` |
| Ink | `#111111` |
| Cobalt | `#1E3BFF` |
| Tomato | `#FF5A36` |
| Lime | `#C8F53C` |
| Bubblegum | `#FF9BDB` |
| Sunflower | `#FFD23F` |

| Text on background | Ratio | Grade |
|---|---|---|
| Ink on cream | 17.63:1 | AAA |
| Ink on lime | 14.91:1 | AAA |
| Ink on sunflower | 13.08:1 | AAA |
| Ink on bubblegum | 9.86:1 | AAA |
| Cream on cobalt | 6.28:1 | AA (AAA-large) |
| Ink on tomato | 6.09:1 | AA (AAA-large) |
| Lime on cobalt | 5.31:1 | AA (AAA-large) |
| ~~Cream on tomato~~ | 2.90:1 | **fails — never use** |

**Type**

- Display: **Bricolage Grotesque**, condensed — `wdth 75, wght 800, opsz 96` for walls of type.
- The friend's voice (chat lines, the AI): **Shantell Sans** — `@fontsource-variable/shantell-sans` (`full.css`),
  axes `wght 300–800`, `BNCE −100–100` ("Shift glyphs up and down in the Y dimension, resulting in an uneven, bouncy
  baseline"), `INFM 0–100` (informality), `SPAC 0–100`. Animate `BNCE` on the beat: kinetic type from a real font
  axis.
- UI: **Figtree**, `wght 300–900`.

**Shape language.** The M3 Expressive library (Cookie, Clover, Sunny, Flower, Puffy, Pill, Heart) as stickers and
anonymous avatars; hard-edged flat fields; rounded-rectangle UI.

**Texture and lighting.** Flat colour, no lighting; a fine print grain (~2–4 % luminance noise, proposal) and a
1–2 px misregistration on stickers for warmth.

**Motion signature: snap and morph.** Full-bleed colour wipes through shape masks that morph (cookie → clover →
circle); words slam in at frame size and shrink into UI chips; cuts on the 120 BPM grid (30 frames a beat).

**Signature move per act**

| Act | Move |
|---|---|
| Hook | One word, "hi", so large that the dot of the i fills the frame; pull back to read it, then dive into the dot, which becomes the typing indicator of a chat |
| 1 · Priorities | FAMILY / HEALTH / CAREER / WEALTH slam in as full-frame walls; each collapses into a chip in the AI chat |
| 2 · Match | Your shape (a cookie) and theirs (a clover) morph into the *same* shape — like-minded, made visible (M3 `Morph`) |
| 3 · Three days | Giant numerals 1 → 2 → 3 flip with the colour fields; the chat scrolls *inside* the numeral's counters |
| 4 · Both unlock | Two half-shapes slide in from opposite edges and snap into one; sticker burst; profiles |
| 5 · Friends, not dates | A heart sticker morphs into a four-leaf clover: not dating — making friends |

**Type in the scene.** UI seen through the counters of huge letters (type as window); letters occlude the UI; words
become chips.

**References**

1. Spotify Wrapped 2024 (B3) — the typeface as the main graphic element, oversized and cloned; copy on flat colour.
2. Ordinary Folk, Gemini (S5) — letters that scatter, orbit and drop into a card; phrase-to-phrase slicing.
3. Partiful (B9) — theme + poster + effect-particle layers for the celebration beats.
4. Figma Config 2024 and 2025 (B2, B1) — one motion verb per act (Shift / Transform / Amplify / Activate); paired
   glyphs that react to each other.

**Risks.** Can read as a Wrapped clone or a template if the craft slips; flat has no depth to carry a "Pixar" bar,
so the motion must; a loud palette tires over 60 s — rest on cream between slams.

---

## 5. Recommendation: A, with C's type discipline and B's squash

**Why A.**

1. **One idea explains the product.** "Bubble" is the everyday word for a social circle, and the app exists to get you
   out of yours; chat bubbles are its UI. Metaphor, interface and payoff are one object — the "one line through every
   act" that made reel 04 work.
2. **It answers the owner's notes point by point.** Light and bright (daylight sky, white UI, iridescent accents).
   A WOW that is one subject at a new scale (a soap film filling the frame, then one bubble). Type in the scene
   (letters drawn by film thickness, reflected in bubbles, chat bubbles at film scale). A signature move per act that
   comes from real physics (inflate, double-bubble kiss, wall pop, foam). Designed reflections, which the owner named
   as what reads as luxury.
3. **It is buildable on what exists.** Reel 04's analytic sphere shader (`gl/orb.js`: per-pixel ray–sphere on a
   camera-facing quad, true depth) is the skeleton of a soap bubble; thin-film colour is closed-form (T1); the double
   bubble is closed-form (T4); the UI is Canvas 2D; springs are closed-form (§2.1).
4. **Not dating, by construction.** Bubbles join into groups and foam; no hearts, no couples.

**What to take from the others.** From C: few words, huge, ink on flat light fields, cut on the beat; the M3 shape
morph for the AI's "thinking". From B: the tactile squash on every UI landing (§2.4) and soft contact shadows under
UI cards.

**How to retire the risks early.** Before any act is built, render two look-dev stills at 1080×1920 with the safe
zone overlaid: (1) the hook at ~2 s, the film drawing the first word; (2) Act 3, the anonymous chat with bubble
avatars and their reflections. Judge them at full resolution against the reel 05 bar, then build.

---

## 6. Decisions and next actions

| # | Decision | Options | Recommendation |
|---|---|---|---|
| 1 | Direction | A · B · C | **A**, with C's type discipline and B's squash |
| 2 | Motion base | M3 Expressive springs · Apple presets (0.5 s, bounce 0 / 0.15 / 0.3) | **M3 Expressive** (§2.3 film spring set) |
| 3 | Cut-downs | 60 s master only · + ~30 s · + 15 s | 60 s master **and** a ~30 s cut (TikTok's 21–34 s finding; Google's 10–30 s advice) |
| 4 | Voice | Music + sound design only · voice-over throughout | Owner's call; if voice, it runs the whole film and its captions are chat bubbles |
| 5 | Name and mark | — | Next research step; Direction A suggests a double-bubble mark |

**Next action once #1 is chosen:** the two look-dev stills in §5.

---

## Appendix A — Method and verification

| Claim | How it was verified |
|---|---|
| M3 spring tokens, shapes, loading indicator, button group, press shape | Read from the AndroidX source files linked in §2 and MDC-Android `tokens.xml` |
| M3 spring-to-curve table, "web is not currently available", "time of day" | Re-fetched from the M3 site's content JSON (the page itself is a JavaScript app) |
| SwiftUI presets and defaults | `SwiftUICore.swiftinterface` in this Mac's `MacOSX26.2.sdk`; Apple's documentation JSON (`Spring`, `Animation.default`) |
| Spring overshoot and settle times | `springs.py` (closed form, 1/600 s steps) and `spring01.mjs` (vs numerical integration, max error 1.3e-4); Google's own curve table agrees within ~3 ms on the peak |
| Safe zones | TikTok's and Google's official overlay PNGs measured pixel by pixel with `pngprobe.py` (a stdlib PNG decoder); Meta's quote re-fetched |
| Text sizes, captions | Apple HIG JSON (typography, widgets, images); BBC guidelines page fetched directly; Netflix and TikTok pages re-fetched |
| Contrast | `contrast.py`, WCAG 2.2 formula (sRGB threshold 0.04045, as in the spec text) |
| Fonts | Fontsource API (`/v1/fonts/<id>`, `/v1/variable/<id>`), npm registry, jsDelivr file listings for the `full.css` entry points |
| References | Every URL opened by me or a research agent. Agent quotes re-fetched and confirmed by me: Figma Config 2024 and 2025, Wrapped 2024 and 2025, Airbnb (It's Nice That), Duolingo × Rive, Headspace, Arc (Inverse), Partiful, Timeleft, BeReal, Google Design M3 research, WWDC25 219, `GlassEffectContainer`, iMessage effects (Apple Support), Telegram backgrounds, Google Messages, Noto licence and animated-emoji index, Netflix, TikTok best practices, TikTok 9 Creative Tips PDF, TikTok conversion blog, Google ABCD PDF, Meta Reels safe zone, both Meta news posts, Netflix duration limits, Gunner acquisition (Creative Review), Locket |

The scripts lived in this session's scratchpad (temporary). The two that matter are short enough to keep here:
`spring01` is in §2.1, and the contrast function is:

```js
// WCAG 2.x contrast ratio between two #rrggbb colours
const lin = c => (c /= 255) <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
const lum = h => { const n = parseInt(h.slice(1), 16); return 0.2126 * lin(n >> 16) + 0.7152 * lin((n >> 8) & 255) + 0.0722 * lin(n & 255); };
export const contrast = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };
```

**Known gaps (searched, not found):** a canonical squash ratio for UI; official organic safe zones for any platform;
any platform's minimum text size; official shot-length data; published hex codes for Bumble, Spotify and Airbnb;
Partiful's brand typeface. Not checked: Slack's reactions. TikTok's anchor-overlay numbers were measured by a research
agent and not re-measured. Duolingo's palette comes from a third-party breakdown. Could not be opened: Hornet's own site, the BBC page through the
fetch tool (fetched directly instead), Meta's Help Center article on Stories/Reels text overlays, Discord's support
article on super reactions.

## Appendix B — Fonts checked on Fontsource (all OFL-1.1 unless noted)

| Family | Package | Variable axes |
|---|---|---|
| Fraunces | `@fontsource-variable/fraunces` | `opsz 9–144`, `wght 100–900`, `SOFT 0–100`, `WONK 0–1`, ital |
| Bricolage Grotesque | `@fontsource-variable/bricolage-grotesque` | `opsz 12–96`, `wdth 75–100`, `wght 200–800` |
| Shantell Sans | `@fontsource-variable/shantell-sans` | `wght 300–800`, `BNCE −100–100`, `INFM 0–100`, `SPAC 0–100`, ital |
| Recursive | `@fontsource-variable/recursive` | `wght 300–1000`, `slnt −15–0`, `CASL 0–1`, `CRSV 0–1`, `MONO 0–1` |
| Nunito | `@fontsource-variable/nunito` | `wght 200–1000`, ital |
| DM Sans | `@fontsource-variable/dm-sans` | `opsz 9–40`, `wght 100–1000`, ital |
| Instrument Sans | `@fontsource-variable/instrument-sans` | `wdth 75–100`, `wght 400–700`, ital |
| Fredoka | `@fontsource-variable/fredoka` | `wdth 75–125`, `wght 300–700` |
| Mona Sans / Hubot Sans | `@fontsource-variable/mona-sans` / `hubot-sans` | `wdth 75–125`, `wght 200–900`, ital |
| Sour Gummy | `@fontsource-variable/sour-gummy` | `wdth 100–125`, `wght 100–900`, ital |
| DynaPuff | `@fontsource-variable/dynapuff` | `wdth 75–100`, `wght 400–700` |
| Figtree · Rubik · Outfit · Gabarito · Onest · Manrope | `@fontsource-variable/<id>` | `wght` only: 300–900 · 300–900 · 100–900 · 400–900 · 100–900 · 200–800 |
| Noto Color Emoji | `@fontsource/noto-color-emoji` | static |

