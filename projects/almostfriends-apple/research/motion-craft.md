# Motion craft: how senior studios build a pure motion-graphics product film

**Purpose.** Research for a ~60 s, 1080×1920, 60 fps pure-motion-graphics film for "almost friends", made the Apple way. It covers how top studios work, what nine product and software films actually do (measured frame by frame), and a rulebook for our build. Apple HIG motion, WWDC springs and Apple's ad philosophy are in `apple-way.md` and are not repeated here.

**Legend.**
- **[M#]**: my own measurement of film #. Method is in §7, stills are in `frames-mg/`.
- **[key]**: a source; every key is listed with its URL in §8.
- **(calc)**: my arithmetic on a sourced or measured number.
- **UNVERIFIED**: I could not open or confirm it.
- About the sources: research agents opened them and checked the quotes against page text. I re-checked 12 of those quotes myself and all 12 matched.

---

## 0. Verdict

1. **The films that feel expensive barely cut.** Linear Agent has no hard cuts at threshold 0.3 across 45 s; shots run 5.6 s and all live in one UI world [M3]. Apple's control chain runs 15.3 s through 7 states with no cut detected at 0.3 [M1]. Vercel's teaser is a single 29 s shot [M7]. When a cut is needed, it is hidden in motion, in a flat field, or inside an object.
2. **Velocity crosses the cut.** Apple accelerates a move into the cut (the slider is at 42 px/frame when it cuts), shows 2 white frames, and the next shot enters already moving, then settles [M1]. School of Motion's rule: on a 12-frame move, cut on frame 6 and pick up the next shot on frame 7 [SoM-match].
3. **Every scene grows out of a leftover piece of the last one.** Apple's chain: glass title → slider → toggle → tab bar [M1]. Figma Config: one small element → neighbours → it fills the frame → it becomes the next ground [M6]. Vercel: the city → the logo triangle [M7]. Senior directors name this as the job: what matters is "how you're getting in between" the frames [OF-pod].
4. **Fewer words, bigger type, two tones.** Every card holds 1–4 words. Cap heights run 7–14% of frame height in 16:9 [M1–M3, M8]. Each card has one family in two weights or two colours: white plus a grey, or white plus one accent sampled from the picture [M3, M8]. Type enters by blur-to-sharp (0.33 s) or by a hard cut. No type in these films bounces in.
5. **Overshoot is small or absent.** Google's "expressive" button overshoots +5.1% and settles in 0.18 s [M2]. Apple's control knob stretches +8.5% while moving and snaps back in about 0.1 s [M1]. None of the nine films uses a 150%-style bounce.
6. **Colour is mostly neutral.** 64–100% of pixels are neutral in 8 of the 9 pieces; Config (38%) is the exception [M]. Apple's glass film uses two accent families, azure and cyan [M1]. The loud palettes (Config, Material 3) belong to design systems, not to Apple.
7. **No grain on flat fields.** Every flat card I sampled (6 films) measures σ = 0.00 [M]. Texture comes from the material (glass, satin, black chrome). Nothing is overlaid.
8. **Logos hold 3.5–5 s at the end**: Apple 3.8 s, Linear 5.0 s, Linear Releases 3.5 s [M1, M3, M4]. Apple's logo is reached by pushing through the product [M1].
9. **The process is gated.** The usual order is brief → one idea → style frames → animatic timed to the music → motion tests → blocking → polish → sound, with client sign-off at each step [SoM-guide, Bartlett-anim, OF-pod]. Design leads: "amazing animation will never save bad design" [Honig].
10. **Sound comes in early and stays sparse.** Studios start with the music [SonoS] and choose a few anchor hits [SonoS, BoxToys]. Whooshes are only for moves that are visibly real [Sonilo]. Silence counts: "the absence of sound is as important as adding sound" [WWDC17-803].

---

## 1. Films studied (11)

| # | Film | Why it's here | Case study / BTS | Measured |
|---|---|---|---|---|
| 1 | **Apple, "iOS 26: Introducing Liquid Glass"** (2025) | iOS UI, glass and light as a pure motion-graphics chain. Closest to our medium | Apple's newsroom description of the material [Apple-LG] | M1 |
| 2 | **Google Design, "Introducing: Material 3 Expressive"** (2025) | Spring physics, shape morphs, type riding motion paths | Google's expressive-design research [G-expr]; "Making Material You" BTS [MMY] | M2 |
| 3 | **Linear, "Introducing Linear Agent"** (2026) | Restraint: one world, slow camera, an end line built on screen | none found | M3 |
| 4 | **Linear, "Introducing Linear Releases"** (2026) | The product's data shape becomes the motif; terminal-style type | none found | M4 |
| 5 | **Raycast, "New Raycast. Coming 2026"** (2025) | Macro UI on a material ground; a feature list cut to the beat | blog post, which says little about the film [Raycast-blog] | M5 |
| 6 | **Figma × Relay, Config 2024 open film** | Pure shape "activation": every scene grows from the last | It's Nice That [INT-config] | M6 |
| 7 | **Basement Studio, Vercel Ship 2025 opener and teaser** | Mask-to-logo resolve; one continuous liquid shot | "Behind the Ship" [Basement] | M7 |
| 8 | **ManvsMachine for Apple, iMac Pro "Algorithmic Architecture"** (2018) | One camera arc for the whole film; content pulls back into the device; Apple's title cards | It's Nice That [INT-mvm]; Apple BTS, third-party re-upload [MvM-BTS] | M8 |
| 9 | **Family (crypto wallet), in-app motion system** | Continuity rules for UI morphs ("We fly instead of teleport") | essay on benji.org [Family] | n/a, no film |
| 10 | **Buck, Ray-Ban Stories launch system** | Scope of a go-all-out launch: graphics system, UI, 16×9 / 9×16 / centre cut | [Buck-RB] | n/a, scope only |
| 11 | **Apple, iPhone 14 Pro Dynamic Island reveal** | UI morph about 1 state per second | measured earlier in `apple-way.md` §4d-C | prior |

Downloaded and dropped because they are not pure motion graphics: Raycast "It's out" (talking head), Stripe Sessions 2024 (event recap), two Apple Shorts (screen tips, physical BTS), Raycast iOS short (talking heads). I found no official vertical pure-motion-graphics product film with a public case study (see §6).

---

## 2. Measured breakdowns [M]

How to read the numbers:
- "Cuts 0.3" is ffmpeg's scene score >0.3, which catches hard cuts. "0.08" also catches dark or soft cuts.
- Cap height is the pixel height of a capital letter on a 1280-wide frame.
- Colour is the share of neutral pixels (saturation <0.25) plus every 30° hue family holding ≥2% of all pixels, sampled at 2 fps.

**M1. Apple, Liquid Glass (273.8 s, 29.97 fps)** https://www.youtube.com/watch?v=jGztGfRujSE
A hybrid of Alan Dye on camera and pure CG/UI segments. I measured only the pure segments: 52–70.7, 104.3–119.6, 150.2–166.7, 212–232 and 259.8–268.8 s.
- *Cuts.* 65 at 0.3 over the whole film (ASL 4.2 s); 52–70.7 has an ASL of 3.1 s. 104.3–119.6 runs 15.3 s through 7 states with no cut detected at 0.3 (≈2.2 s per state; slider, toggle and tab bar 1.1–1.3 s each). 150.2–166.7 is one 16.5 s shot of a bezel-less UI slab tilting while its content scrolls.
- *Carries.* 57.0 **material match** (glass wave → glass "9"). 63.8–66.8 one **pull-back** (compass → Safari icon → Dock). 67.2 blur **whip**. 107.6–110.0 a liquid drop pinches into a lens. 110.1–111.1 **lens zoom-through**: the lens grows past the frame while the ground turns from dark to white in ≈0.5 s, so the title is first seen refracted. 112.6–115.6 **type → control**: the camera flies past the glass letters into the slider thumb, with no cut.
- *Velocity-matched cut, 115.6–118.1.* The slider fill first retracts 15% over 0.35 s (anticipation), then accelerates to 42 px/frame. At the cut there are 2 white frames. The toggle enters at speed, its knob stretches +8.5%, then snaps back in ≈0.1 s.
- *More carries.* 216.2–220.5 **exploded view** (icon layers lift and re-stack). 222.2 **in-place light→dark swap** while the camera keeps moving.
- *End, 259.8–268.8.* The device holds still for 2.5 s. An accelerating push (width ×1.6 over 1.5 s, then ×3.5 in 0.3 s) goes through the screen into the wallpaper shapes, which clear to white. The glass logo holds 3.8 s.
- *Type.* "Liquid Glass" set in glass-material SF: cap ≈14% H (16–17% with its shadow), line 62% W, 2 words, readable for ≈1.7 s before the camera turns it into an object.
- *Colour and finish.* 64% neutral; 49% of pixels have L>0.8; azure 14%, cyan 11%, warm accents ≤3% each. Motion blur on whips only; shallow depth of field on macros; σ = 0.00 on flat white.

**M2. Google, Material 3 Expressive (38.1 s, 60 fps)** https://www.youtube.com/watch?v=n17dnMChX14
- *Cuts.* 25 at 0.3, 9 of them a 0.35 s strobe (29.43–29.75); without the strobe, ASL ≈2.2 s.
- *Carries.* 0–1.5 the title drops out as a loader falls in. 2.2–3.2 a glow **bloom** fills the frame and the title appears inside it. 9.5–10.8 a graph fans into spring curves. 11.0–12.7 the letters of "motion" and "physics" **ride the curves**. 12.85 **cut on motion**: a button enters already moving, with 54% of its travel done in the first 24% of the time, which matches easeOutCubic's 55% (calc).
- *Overshoot.* The Play pill peaks at 696 px and settles at 662 px: **+5.1%**, peaking 83 ms after the cut and settled 100 ms later.
- *Type.* Google Sans-family Bold (Flex not confirmed), cap 14.3% H (8.0% W), line 50% W. A per-letter cascade of ≈0.06 s, each letter motion-blurred as it falls. A variable-font weight sweep on "Display" (30–31).
- *Colour and finish.* 7 hue families, the most varied of the set, on pastel grounds. No depth of field, no grain.

**M3. Linear, Agent (54.9 s, 60 fps, 2:1)** https://www.youtube.com/watch?v=mRql2VJ99gM
- *Cuts.* 0 at 0.3; 7 at 0.08 (3.05, 17.10, 21.95, 29.73, 35.07, 40.62, 45.10), so **8 shots averaging 5.6 s**. Every shot is the same tilted, dark UI plane under the same light, drifting slowly, so the cuts read as one continuous take.
- *Build.* Issue rows cascade top to bottom, each going from blurred to sharp, ≈0.15–0.2 s apart (12.4–14.0).
- *End line (60 fps).* 8 frames of pure black. "Linear" goes from blurred to sharp in **0.33 s** (edge contrast 9→135), then drifts ≈8–10% smaller over ≈1 s; a light sweep crosses it (46.6–46.9). "At your command." wipes on while the whole line slides 235 px to stay centred: **1.6 s, 0.55 s accelerating and 1.1 s decelerating**, with motion blur at peak speed. That matches the shape of (0.4,0,0.2,1), whose peak speed falls at t=0.30 (calc). Timing: brand word alone 1.5 s, line build 1.7 s, full line 1.3 s, logo 5 s.
- *Type.* An Inter-class grotesk in two tones: "Linear." white semibold, "At your command." grey regular. Cap 7.2% H (3.6% W), line 53% W, 4 words.
- *Colour and finish.* 99% neutral; 96% of pixels have L<0.15; colour only in status dots. Depth-of-field fall-off across the plane.

**M4. Linear, Releases (30.1 s, 60 fps)** https://www.youtube.com/watch?v=6dIwFoQ0eVg
- Cuts: 0 at 0.3; 4 at 0.08 (average shot 5.2 s).
- Motif: branch lines that merge, which is the product's own data shape.
- Card type: tracked mono caps, regular weight, cap 5.3% H. The card hard-cuts on with no build, holds 1.3 s, then dissolves over 0.6 s as the UI rises underneath.
- Terminal typing with a block cursor: 8 characters in ≈1.0 s, then 13 characters in ≈1.0 s.
- Logo holds 3.5 s. Colour: 100% neutral.

**M5. Raycast, teaser (38.6 s, 30 fps)** https://www.youtube.com/watch?v=Mi173xGb0ZA
- Cuts: 5 at 0.3; 10 at 0.15 (ASL ≈3.5 s).
- The only world is black satin. The UI sits at macro scale, cropped by the frame edge, with shallow depth of field and a lateral drift.
- Ten "NEW + feature" mono-caps cards change **every 0.40 s exactly** (12 frames). They read as rhythm, not text.
- Then the gap in "NEW … RAYCAST" closes over 1.3 s on an ease-in-out, and "COMING 2026" holds 2.2 s.
- Cap 2.9% H: fine on a desktop screen, too small for a phone. Colour: 99% neutral.

**M6. Figma × Relay, Config 2024 open (keynote 22.8–66.4 s, 30 fps)** https://www.youtube.com/watch?v=n5gJgkO2Dg0
- Cuts: 6 in 43.6 s, so sections of ≈6.2 s. Inside a section, the shapes change state on the beat every 0.25–1 s.
- Each section starts as one small element in the centre (22.8, 44.5). It spawns neighbours, then either grows into the next background (30.2–31.5) or the camera zooms into a nested shape (31.5–34.5).
- Cuts land on full-frame flat fields. A grid of discs flips in a travelling wave (50–53).
- Case study [INT-config]: the motif is "activation", shapes that touch and activate one another and fill the screen full height. Relay helped answer how to hold attention in a 9 am slot and how to build a narrative arc. Everything was designed in Figma, with six palettes set up as variables.
- Colour: 5 flat families (blue 23%, violet 14%, lime 10%, yellow 8%, red 3%). No motion blur, depth of field, grain or type.

**M7. Basement for Vercel, Ship 2025 opener (keynote 0:09–1:30) and teaser (29 s)** https://www.youtube.com/watch?v=lNmO7fDiyuE · https://www.youtube.com/watch?v=vbhNyRNNYjc
- Opener: 21 cuts in 9–63 s (ASL ≈2.5 s).
- Then **27 s with no cut**: black liquid swallows the world, landmarks turn to black chrome, and a top-down city is **masked into the Vercel triangle**, which shrinks to a point (76–81.5).
- Teaser: 0 cuts even at 0.08. One liquid macro whose ripples resolve into the triangle (16–21).
- Colour: the opener is 78% neutral with a warm grade; the teaser is 100% neutral.
- Process [Basement]: concept and moodboard → concept art → 3D blocking from the animatic → master keys by hand, characters on twos (12 fps poses, 24 fps camera) → prerender passes to tune timing → EXR passes and Cryptomatte → Resolve grade.

**M8. ManvsMachine for Apple, iMac Pro (48.3 s, 29.97 fps)** https://www.youtube.com/watch?v=nN827PXp_kI
- Cuts: 9 (ASL ≈4.8 s).
- One camera arc for the whole film: "We start in very close… we get wider and wider" [MvM-BTS]. Forms grow from a Houdini node system [MvM-BTS]; Adam Rowe calls the process "design by doing" [INT-mvm].
- Ends with the **content pulling back to become the iMac's screen** (38.0–38.8), an orbit to the profile, and a hard cut to the title.
- Apple's title cards (0–7 s): SF Pro Semibold, cap 8.6% H (4.8% W), 1–4 words, hard cuts ≈1 s apart (1.3, 0.8, 1.0, 1.5 s), white plus one accent (a peach sampled from the film's sandstone).
  - **One semantic micro-move per card**: in "Pushed to the limit" the P closes a gap and the l drops from above the cap line (≈0.7 s) as "limit" warms to the accent.

**Cross-film summary [M]**

| Film | Shots / avg | Per state | Cap (16:9) | Neutral | Motion blur | Depth of field | Grain |
|---|---|---|---|---|---|---|---|
| Apple Liquid Glass | 3.1 s; chain with 0 cuts in 15 s | 1.1–3 s | ≈14% H | 64% | whips | macros | none |
| Material 3 Expressive | 2.2 s | 0.5–2 s | 14.3% H | 73% | type | none | none |
| Linear Agent | 5.6 s | 5.6 s | 7.2% H | 99% | type | yes | none |
| Linear Releases | 5.2 s | 1.3 s cards | 5.3% H | 100% | none | slight | none |
| Raycast | 3.5 s | 0.40 s cards | 2.9% H | 99% | n/a | yes | none |
| Config 2024 | 6.2 s sections | 0.25–1 s | none | 38% | none | none | none |
| Vercel opener / teaser | 2.5 s → 27 s / 29 s single shot | n/a | ≈3% H | 78% / 100% | CG | yes | none |
| iMac Pro | 4.8 s | ≈1 s cards | 8.6% H | 86% | n/a | n/a | none |

---

## 3. The senior process

**3.1 Pipeline and gates (sourced)**

| Stage | What comes out | Sign-off and evidence |
|---|---|---|
| Brief | What should people know, feel and do next | Giant Ant: "what do we want people to know? … how do we want them to feel … what do we want them to do next?" [Grandin]. Oddfellows writes a strategy "before we make the first brushstroke" [Oddfellows] |
| Core idea | One concept that distils the product | "distil a product's soul or DNA to its core basic principle" [CG-luxury]. Explore 3, present 1 [Ho]. ManvsMachine filters "into one or two focussed ideas" [MvM-1.4] |
| Moodboard and style frames | 2–3 variations per key frame. Light and material tests for product films. A colour script across the whole film | "Pick a few frames… two or three variations" [SoM-guide]. "creating styleframes to apply textures and lighting… is crucial" [CG-luxury]. Ordinary Folk kept every designer on "the same colour palette" through "colour scripts" [OF-manifesto]. Design boards are "design for motion, which doesn't actually entail any motion" [Sarofsky] |
| Storyboard | Key scenes **and the transitions between them** | "Start with your first scene, fast forward to your final, and then fill in all the transitions" [SoM-guide] |
| Animatic | Frames timed to music or voice-over, with a fixed runtime | the animatic "opens the door to client feedback and revisions before you've actually animated anything" [Bartlett-anim]. Ordinary Folk got "client approval on like here's the timing" [GStewart] |
| Motion tests | The riskiest moves, tested before the full build | Perception: "simple motion tests to explore a vocabulary" [Perception]. Holmedal: R&D once "I have enough of a foundation" [Holmedal] |
| Production | Shots assigned and tracked; big moves and camera blocked first | "block in your big movements first"; "first a mock up the camera movement" [OF-pod]. A shot tracker for 90+ shots [HueCry] |
| Compositing and polish | Fidelity to the style frames; seamless transitions | "Ensure… your animated scene transitions are seamless" [SoM-guide]. Buck rebuilt shapes "to achieve fidelity to the styleframes" [Buck-Antfood] |
| Sound | Music first, then a demo of the sound-design style on a short section | "start with the music first" and demo "like 15 seconds of animation" [SonoS]. Bring the composer in "as soon as the script was done" [OF-manifesto] |
| Final feedback | Honest review before delivery | "ask them for their honesty, no matter how brutal" [SoM-guide] |

How studios split the schedule, as shares (my arithmetic on the numbers they state):
- One title sequence spent ≈56% of its schedule in design and ≈44% in animation [Kashiwagi].
- Psyop's concepting took ≈1/8 of the job [Psyop].
- Playful calls a storyboard stage of ≈1/10 of the schedule "too little" [CG-luxury].

Two practices worth copying:
- ManvsMachine overbuilds, then strips back: "do a few too many CG / comp extras then strip it back to the minimum" [MvM-1.4].
- Chromosphere scored first on a grid of "4-second intervals" so that key actions land every 1–2 s [Chromo].

**3.2 What a motion-language doc contains**

Its structure, from published systems:
- Goals and hierarchy, then the journey and its key moments, then which mode each moment uses (productive or expressive), then a prototype [Carbon].
- Every motion event is defined by duration, easing and property [Atlassian].
- Choreography: stagger, focal path, order of entry [Carbon-chor, MDC-chor].
- Transition patterns: container transform, shared axis, fade through, fade [MDC-motion].
- Studio-level languages are adjectives paired with rules. Tendril: "no more than three shapes, tone on tone… light and shadow… less is more" [Tendril]. Animade for Meta AI: "moves outwards when it's responding, inwards when it's listening" [Animade-Meta].

Published tokens to start from (verified in source code):
- **Carbon**: durations 70, 110, 150, 240, 400, 700 ms.
  - Productive curves: (0.2,0,0.38,0.9) standard, (0,0,0.38,0.9) entrance, (0.2,0,1,0.9) exit.
  - Expressive curves: (0.4,0.14,0.3,1), (0,0,0.3,1), (0.4,0.14,1,1).
  - "Reserve expressive motion for occasional, important moments" [Carbon].
- **Material 3**:
  - Standard (0.2,0,0,1); emphasized-decelerate (0.05,0.7,0.1,1); emphasized-accelerate (0.3,0,0.8,0.15).
  - Durations 50–1000 ms in 50 ms steps.
  - Expressive springs: damping 0.6, 0.8, 0.8 at stiffness 800, 380, 200 (fast, default, slow).
  - Effects springs (colour, opacity) use damping 1.0, so they never overshoot [MDC-motion, M3-tokens].
- **Atlassian**: "Exits should be shorter… reduce the duration by 50ms or 100ms"; "aim for one or two properties per transition" [Atlassian-apply].
- **Fluent**: "Give larger elements more time to animate than smaller elements" [Fluent]. Material says the same: "duration should increase as the area/traversal… increases" [MDC-motion].

---

## 4. Craft rules with numbers (sourced and measured)

**Easing**
- easings.net curves:
  - easeOutExpo (0.16,1,0.3,1); easeOutQuint (0.22,1,0.36,1); easeOutQuart (0.25,1,0.5,1); easeOutCubic (0.33,1,0.68,1).
  - easeInOutCubic (0.65,0,0.35,1); easeOutBack (0.34,1.56,0.64,1), which overshoots ≈10%.
  - Sources: [Easings, Penner].
- apple.com interface CSS uses (0.4,0,0.6,1): 44 times in the local nav, with 320 ms its most common duration [Apple-CSS], and 190 times in the film-player CSS, next to 95 uses of (0,0,0.2,1) and an 8 px rise-with-fade entrance [Apple-films-CSS]. Core Animation's default is (0.25,0.1,0.25,1) [CA-default]. Curves used in Apple's films: **UNVERIFIED**.
- Converting a curve (x1,0,x2,1) to After Effects: out-influence = x1×100%, in-influence = (1−x2)×100% (calc from Material's published pairs, e.g. (0.4,0,0.2,1) = 40% out / 80% in [MD-speed]). The After Effects default Easy Ease is 33.33% [AE-easy].
- Shape rules:
  - "more time to deceleration than acceleration" [MD-speed].
  - Don't ease out of the first position when entering from off screen [SoM-flow].
  - "steepness… equals speed" [SoM-flow].
- Measured: entrances behave like easeOutCubic [M2]; repositioning moves like (0.4,0,0.2,1) with peak speed at about a third of the move [M3]; Apple accelerates into cuts [M1].

**Springs and overshoot**
- Apple bounce: about 0.15 for brisk, 0.3 for noticeable, be cautious above 0.4 [WWDC23-spring].
- Material 3 damping 0.6 → ≈9.5% overshoot; 0.8 → ≈1.5% (calc via [Overshoot]).
- Measured: +5.1% settling in 0.18 s [M2]; +8.5% stretch while moving, snapping back in 0.1 s [M1].
- Never overshoot opacity or colour [MDC-motion].
- Follow-through: "That overshoot should be delayed by a couple of frames" [SoM-morph].

**Stagger, overlap and focus**
- UI lists: "no more than 20ms apart" and "do not wait" for each item to finish [MDC-chor]. Keep the total within 500 ms and end on the most important item [Carbon-chor].
- Film offsets: "offset them two frames" at 24 fps, ≈83 ms or 5 frames at 60 fps (calc) [SoM-textanim].
- GSAP's line-mask demo: 0.6 s, yPercent 100, stagger 0.1, expo.out. Per character: stagger 0.05 [GSAP-split].
- Measured: letters ≈0.06 s apart [M2]; list rows ≈0.15–0.2 s apart [M3].
- Focus:
  - "Minimize the number of elements that move independently" [MD-chor19].
  - "Lead with one clear focal point" [Atlassian].
  - A single shared element "should be the focal point of the transition" [MDC-chor].

**Holds and reading time**
- BBC: 160–180 words per minute = 0.33–0.375 s per word, minimum ≈0.3 s per word [BBC-sub].
- Netflix: at most 20 characters per second; nothing shorter than 20 frames [Netflix-tt, Netflix-timing].
- "read the information twice before pulling it off screen" [SoM-lower].
- TikTok recommends 5–10 words per second [TikTok-bp]. That conflicts with the BBC rate; use it only for rhythm lists like Raycast's [M5].
- Measured holds: title cards ≈1 s for 1–4 words [M8]; title 1.7 s [M1]; Linear's end: brand word alone 1.5 s, line build 1.7 s, full line 1.3 s [M3]; logo 3.5–5 s [M1, M3, M4].

**Camera, motion blur and depth of field**
- 180° shutter is the cinema norm: 1/48 s at 24 fps [RED-shutter]; at 60 fps that is 1/120 s (calc).
- Blender's shutter default is 0.5 frames, which is 180°, and motion blur is **off** by default [Blender-RS, Blender-MB].
- In After Effects, centre the blur with phase = −½ × angle [PVC-AE].
- Pan no faster than one image width per 7 s at 24 fps / 180° [RED-pan].
- Parallax: farther layers move slower [Multiplane].
- Dolly rather than zoom, because a dolly changes spatial relations [NFS-dolly].
- Heavy blur makes objects read as miniatures [PMC-blur]. Keep depth of field so the phone does not look like a toy.

**Finishing**
- Fight banding with dither: Blender's default is 1.0 [Blender-RS]. Raise noise until the banding goes away [DVinfo-noise].
- Work at 16 or 32 bit and add subtle grain only as the final step [Adobe-comm]. Measured: no visible grain on the flat fields of the 6 films I sampled [M].
- Chromatic aberration "subtle, strongest at the frame edges", never on text [CA-gloss]. Pixel amounts: **UNVERIFIED**.
- Vignette: "barely noticeable", about −0.05 on Resolve's gamma wheel [Colorculture].
- Bloom is threshold-gated [Blender-glare].
- Palette: a 60-30-10 split [Lottie-colour]. Apple: "Apply color sparingly to the Liquid Glass material" [HIG-color].
- Upload at 1080p, high frame rate, 12 Mbps, BT.709 [YT-upload].

**Sound**
- Hits: "visual hits should be 2 – 4 frames earlier than the actual beat, but never one frame later" [AnimIsland]. The source gives no frame rate; at 24 fps that is 83–167 ms (calc).
- Put the loudest point of a sound on the fastest frame of the move, then nudge one frame at a time [Sonilo, Krotos].
- Whooshes follow speed, mass, direction and stop. They are "not a generic sweep pasted over every cut". Use impacts only when an object visibly stops [Sonilo].
- Repeated motions get related sounds, not the identical sound [LinkedIn-SD].
- Apple UI sound is "used sparingly", "much lower volume" [WWDC17-803]. Sound and haptics should match in feel: "things should feel the way they look, the way they sound" [WWDC19-810].
- Don't over-sync: "not every cut is predictably going to land on a downbeat" [SOS].
- Silence before a hit [Krotos-silence].
- Loudness:
  - Spotify normalises to −14 LUFS; keep true peak ≤ −1 dBTP [Spotify].
  - YouTube −14 LUFS: practitioner-measured, **UNVERIFIED** officially [Meterplugs].
  - EBU R128 broadcast: −23 LUFS [EBU-R128].
- Design for sound-off, delight with sound-on [Meta-sound].

**Vertical specifics**
- Instagram Reels: keep text and logos out of the top 14%, bottom 35% and 6% on each side [Meta-reels]. On 1080×1920 (calc) that is 269 / 672 / 65 px.
- Shorts: 15% top, 35% bottom, measured by a third party [Shorts-safe]. TikTok: **UNVERIFIED**.
- BBC 9:16 subtitles: line height 3.9–4.5% of frame height [BBC-sub], which is 75–86 px at 1920 (calc).
- App Store previews: 15–30 s, 30 fps max [ASC-preview]. A 60 s, 60 fps film needs its own cut-down.

---

## 5. Distillation

### (a) Senior vs junior: 15 tells

| # | Junior | Senior | Evidence |
|---|---|---|---|
| 1 | Starts from an effect or a tool | Starts from one idea that distils the product | "that's a set of tools. It's not a concept" [Grandin]; [CG-luxury] |
| 2 | Animates weak frames | Designs boards first; motion serves design | "amazing animation will never save bad design" [Honig]; [Marriott-MDS] |
| 3 | Style frame, transition, style frame | Designs the in-between; transitions are in the storyboard | [OF-pod]; "no thought or consideration put into how you get from one a, to B, to C to D" [Donaldson] |
| 4 | Things pop on from nowhere | Every move has a cause and a source | "I didn't want any piece to just turn on from nowhere" [Griffin] |
| 5 | Many movers at once | One focal point and one mover; the rest is still | [Atlassian], [MD-chor19]; Apple changes one state at a time [M1] |
| 6 | Constant motion | Holds: the device sits still 2.5 s before the push | [AnimSchool]; [M1] |
| 7 | Default Easy Ease (33%) or linear | Designed, asymmetric curves: entrances ease out hard, exits are shorter | [SoM-autofollow], [Atlassian-apply]; [M2, M3] |
| 8 | Big bounces | Overshoot of 0–10%, and never on opacity or colour | [WWDC23-spring], [MDC-motion]; +5.1% [M2] |
| 9 | Many words, sizes and effects | 1–4 words, one family, two weights or tones, big | "make one thing bigger… skip a few of the weights" [Frederick]; [M3, M8] |
| 10 | Rainbow palettes and gradients | 64–100% neutral, one or two accents sampled from the picture | [M]; [HIG-color], [Lottie-colour] |
| 11 | Glow, chromatic aberration and grain overlays | Texture from material and light; effects kept subtle or omitted | σ 0.00 [M]; [CA-gloss] |
| 12 | Cuts on every beat | Cuts hidden in motion; velocity carried across | [SoM-match]; [M1] |
| 13 | A whoosh on every cut, music wall to wall | A few anchors, silence, real-motion whooshes | [SonoS], [Sonilo], [WWDC17-803] |
| 14 | Goes straight to final | Gates: frames, animatic, motion tests, blocking | [SoM-guide], [Bartlett-anim], [Perception] |
| 15 | Adds until it feels busy | Overbuilds, then strips back to the minimum | [MvM-1.4]; "what's enough and when is it too much?" [Holmedal] |

### (b) Transitions catalogue

| Transition | How it's built (code / Blender) | Use when | Seen in |
|---|---|---|---|
| **Hero carry** (shared element) | The same object exists across both scenes. Animate x, y, w, h, radius and z with one spring; swap its content inside. Match similar "colour, shape and volume" first [MDS-morph] | A UI element becomes the next screen; avatar → profile; card → chat | Apple title → slider [M1]; Config element → background [M6] |
| **Container transform** | Grow the card's rect and radius. Old content fades over the first 25%, the shape mask runs over 75% [MDC-motion]; use longer than the 300 ms UI default for film | Tap → detail; match card → conversation | Material 3 Play pill [M2] |
| **Match cut** (shape, colour or position) | Align centroid and size at the cut frame; cut mid-move (12-frame move: cut on 6, pick up on 7) [SoM-match] | Two worlds share a form (bubble ↔ glass orb) | Glass wave → glass "9" [M1] |
| **Velocity-matched cut** | Ease in to peak speed, cut (0–2 blank frames allowed), enter at the same speed and direction, then ease out | Hard state change without a visible cut | Slider → toggle [M1]; Play enters moving [M2] |
| **Zoom-through** | Push into a framed element (screen, lens, O) on an accelerating curve until its interior fills the frame; decelerate on the other side [SoM-6trans] | Going deeper: phone → inside the app; end → logo | Lens and end push [M1]; nested shapes [M6] |
| **Pull-back reveal** | Start on a macro detail, pull back to show what it belongs to; content can become a screen | Openers; "this was on the phone all along" | Compass → Dock [M1]; content → iMac screen [M8] |
| **Morph** (path, shape, liquid) | Interpolate point for point, or swap "at speed", where motion "will do 80 percent of the work" [MDS-morph]; add follow-through | Bubble → pill → card; the logo build | Drop → lens [M1] |
| **Wipe by object** | Something crosses the lens (glass slab, card) and the next scene is behind it [Adobe-wipe, IdeaRocket] | Covering a hard cut inside a single camera move | Wallpaper shapes clear to white [M1] |
| **Mask to logo** | The world is seen through a shape (track matte) that scales down to logo size [Adobe-matte] | The final resolve | City → triangle [M7] |
| **Light bloom** | A glow swells to fill the frame and hides the swap. For a flash, keep it 5–7 frames (forum opinion [DVinfo-dip]) | One emotional peak only | Bloom into title [M2] |
| **Exploded view** | Separate an object's layers along z, then re-stack them into the next state | Explaining what something is made of (icon, card, profile) | Photos icon [M1] |
| **In-place swap** | Change theme, palette or material while the camera keeps moving | Day → night; anonymous → revealed | Light → dark [M1]; palette flip [M6] |
| **One-world hard cut** | One plane, one light, one drift direction; cut between regions | Calm UI walkthroughs | 8 shots that read as one [M3] |
| **Whip with motion blur** | Same direction on both sides; match brightness; hide the cut in the blur [NFS-whip] | Rare, for energy | 67.2 s [M1] |
| **Type rebuild** | The line re-flows: the gap closes, the line re-centres, a word swaps in place | End lines; "Continue → Confirm" label morphs that keep shared letters [Family] | [M3, M5] |

Choosing a carrier by how the two scenes relate: a shared container → container transform; a spatial link → shared axis; unrelated → fade through [MD-codelab]. Default to the hard cut inside fast action [SoM-6trans].

### (c) Type-animation rulebook for this film (1080×1920, 60 fps)

Rules 1–3 convert measured sizes to our frame, using SF cap height = 0.705 em (read from `/System/Library/Fonts/SFNS.ttf`, calc).

1. **One family**: SF Pro Display. **Two weights**: Semibold for the hero line, Regular for support. **Two tones**: white plus about 60% grey, or white plus one accent sampled from the shot [M3, M8; Frederick].
2. **Hero line**: font 96–128 px, which is a cap height of 6.3–8.4% of frame width. That is the top of the measured 4.8–8% of width [M1, M2, M8], because a phone frame is narrow (calc). At most 4 words per line and 2 lines.
3. **Support line**: font at least 60 px, so that at 1.25 leading the line height is ≥75 px, the BBC floor for 9:16 [BBC-sub] (calc).
4. **Safe area**: no type in the top 14% or bottom 35% of the frame, and none within 6% (65 px) of either side [Meta-reels].
5. **Words**: 1–4 per card; cards hard-cut ≈1 s apart on the beat [M8]; 3–4 lines in the whole film (`apple-way.md` §5).
6. **Hold**: at least max(1.0 s, 0.35 s × words + 0.5 s) (my rule, built on [BBC-sub, SoM-lower]). End line ≥2 s. Logo 3.5–5 s [M].
7. **Enter, choosing one**:
   - (a) Blur-to-sharp, 20 frames (0.33 s), then a slow drift from ≈1.08 to 1.0 scale over ≈1 s [M3].
   - (b) Hard cut on the beat [M4, M8].
   - (c) Line mask: lines rise 100% from behind a mask, 36 frames, expo-out, 6 frames between lines [GSAP-split] (calc to 60 fps).
8. **Per-word or per-letter cascades**: 3–4 frames per letter or 5–6 frames per word, eased out. Use them only where the motion means something [M2; SoM-textanim].
9. **Scale**: never start below 0.92 (Material's 92→100%) [MD-system]. Never overshoot opacity [MDC-motion].
10. **Re-flow, don't re-cut**: when a line grows, slide the existing words on (0.4,0,0.2,1) over ≈1.6 s with motion blur [M3]. Keep shared letters in place [Family].
11. **One semantic micro-move per card, at most**: let the word act out its meaning, e.g. "limit" [M8]. Never wiggle, bounce or glitch.
12. **Tracking**: 0 at display sizes (80 pt and up) [HIG-type]. Animated tracking only from slightly positive to 0, never the "1980" explode effect [AEJuice].
13. **Exits**: shorter than the entrance by 50–100 ms equivalent (3–6 frames) [Atlassian-apply]; fade or carry, never fly off.
14. **Type is material**: let the title become an object of the world (glass letters → control) rather than a sticker on top of it [M1].
15. **No HUD micro-labels, no mono-caps feature lists** at ≤3% H. They are fine on desktop [M5] and illegible on a phone, and the owner already rejected them (project memory: `reel-craft-feedback.md`).

### (d) Production checklist with owner gates

- [ ] **G0 Brief (owner signs).** One sentence each for: what people should know, what they should feel, what they should do [Grandin]. Plus the end line and the specs: 60.0 s, 1080×1920, 60 fps, safe zones.
- [ ] Concept: explore 3, write a 1-page treatment for 1, with motion references [Ho].
- [ ] **G1 Treatment and transition map (owner signs).** Every scene boundary gets a named carrier from (b). The camera arc for the whole film is set (close → wide, or the reverse) [M8].
- [ ] Motion-language doc v1: 3–5 principles, spring and curve tokens in frames, stagger, a focal-path rule, type recipes, a sound map [§3.2].
- [ ] Style frames at full 1080×1920: 3–5 key frames × 2–3 variations, including one type card, one UI state, one glass/light shot, and a colour script [SoM-guide, OF-manifesto].
- [ ] **G2 Look (owner signs).** Type, palette and material, judged at full resolution on a phone.
- [ ] Scratch music locked to tempo. Storyboard first and last frames, then fill in the transitions [SoM-guide, SonoS].
- [ ] **G3 Animatic (owner signs).** Frames timed to the music, 60.0 s, every transition drawn. This is the cheapest change point [Bartlett-anim, GStewart].
- [ ] Motion tests: the hero morph, the end-line build, the glass/light push-through, at final quality [Perception].
- [ ] **G4 Feel (owner signs).** Springs, eases and holds, viewed at 60 fps on a device.
- [ ] Blocking pass: camera and big moves first; shot tracker [OF-pod, HueCry].
- [ ] **G5 Full blocking with a sound rough (owner notes).**
- [ ] Polish: secondary motion, follow-through, motion blur (Blender motion blur on, shutter 0.5), dither, comp. Then strip back [MvM-1.4].
- [ ] Sound pass: anchors, real-motion whooshes, silence before the reveal, a mix at −14 LUFS and ≤ −1 dBTP [Spotify].
- [ ] QC: frame-by-frame scrub; safe zones; reading time per card; no grain or banding on flat fields; a sound-off check [Meta-sound].
- [ ] **G6 Final (owner signs)**, then delivery and the App Store cut-down (≤30 s, 30 fps) [ASC-preview].

### (e) The 3 best models for our film

1. **Apple, "iOS 26: Introducing Liquid Glass" (pure segments 104–120 s and 259–269 s).** It is our exact medium: iOS UI, glass and light, white ground, two cool accents. It also answers the owner's main complaint. Each element becomes the next: title → slider → toggle → tab bar. Cuts are velocity-matched or hidden in white. The film ends by pushing through the product into the logo [M1]. Copy the chain grammar, the holds and the push-through. Don't copy the presenter format.
2. **Linear, "Introducing Linear Agent".** The model for restraint and type. It is one world with a slow camera and 5.6 s shots. The end line is built on screen: blur-in in 0.33 s, a two-tone line, a re-centre slide of 1.6 s, then a 5 s logo [M3]. Copy the type build and the calm. Don't copy the all-dark monochrome: a friend app needs warmth.
3. **Figma × Relay, Config 2024 open film.** The purest demonstration of "activation": one small element → neighbours → fills the frame → becomes the next ground, with cuts hidden in flat fields [M6]. A public case study backs it [INT-config]. Copy the scene-to-scene logic for the match and unlock beats. Don't copy the palette or the toy shapes: that is the "primary-school" risk the owner named.

Supplement for type: Apple's iMac Pro title cards [M8]. Big SF, 1–4 words, cut on the beat, one accent drawn from the picture, one meaningful micro-move.

---

## 6. Gaps and UNVERIFIED
- Curves and springs inside Apple's films are not published. Only the apple.com CSS and Core Animation defaults are verified [Apple-CSS, CA-default]. My Apple numbers are measured from 720p YouTube encodes and are accurate to ±1 frame.
- No official vertical pure-motion-graphics product film with a case study was found. The vertical type sizes are therefore conversions (calc), not measurements.
- TikTok's safe margins, YouTube's official −14 LUFS, Adobe's own After Effects defaults (forum-sourced), pixel amounts for chromatic aberration, and Mt. Mograph's preset values: **UNVERIFIED**.
- Not found: case studies for Linear's or Raycast's films, and the studios "Sonic Sense", "Spacedog" and "Mutant".
- Transcripts of Ben Marriott's and Jake Bartlett's videos: **UNVERIFIED** (the transcript service needed payment). I relied on their written pages instead [Bartlett-anim, Marriott-MDS, JakeTJ].
- Grain checks run on 720p H.264, and YouTube compression can remove grain finer than about 1 code value. "No grain" means none visible at delivery.

## 7. Method [M]
- Files: `scratchpad/mgvids/<slug>/` (yt-dlp, ≤720p, each in its own directory, client `web_embedded`). Analysis is in `scratchpad/mganalysis/`.
- Cuts: `ffmpeg -vf "select='gt(scene,0.3)',showinfo"`, then again at 0.15 and 0.08 for dark films.
- Contact sheets: `fps=1,scale=256:-2`, tiled 10×6 with time labels. Fine strips at 4–60 fps.
- Measurements, in Python with numpy and Pillow:
  - Type: threshold, bounding box and row bands.
  - Easing and overshoot: per-frame bounding boxes of a coloured or bright object.
  - Colour: hue histogram at 2 fps.
  - Grain: σ of a 5×5 high-pass over 8 frames on flat patches.
- Stills (21) are in `frames-mg/`, named `mg<film>-<slug>-<t>s.jpg`. Times for Config and the Vercel opener are keynote-video times.

## 8. Sources (key → URL)

**Films and studio case studies**
- Apple-LG https://www.apple.com/newsroom/2025/06/apple-introduces-a-delightful-and-elegant-new-software-design/ · G-expr https://design.google/library/expressive-material-design-google-research · MMY https://www.youtube.com/watch?v=vSGtGbXpMIg
- Raycast-blog https://www.raycast.com/blog/the-new-raycast · INT-config https://www.itsnicethat.com/features/figma-config-2024-identity-graphic-design-spotlight-090724 · Basement https://basement.studio/post/behind-the-ship
- INT-mvm https://www.itsnicethat.com/news/manvsmachine-algorithmic-architecture-imac-pro-film-210318 · MvM-BTS https://www.youtube.com/watch?v=6GxykKkxYJM · Family https://benji.org/family-values
- Buck-RB https://www.buck.co/work/ray-ban-stories

**Process**
- SoM-guide https://schoolofmotion.com/blog/guide-completing-motion-design-project · Bartlett-anim https://schoolofmotion.com/blog/what-are-animatics-and-why-are-they-important · OF-pod https://schoolofmotion.com/blog/ordinary-folk-podcast
- GStewart https://schoolofmotion.com/blog/behind-the-keyframes-greg-stewart · OF-manifesto https://motionographer.com/2019/09/16/join-the-movement/ · Grandin https://schoolofmotion.com/blog/jay-grandin-podcast-podcast
- Oddfellows https://oddfellows.tv/about/ · Ho https://schoolofmotion.com/blog/concepting-and-pitching-ideas-to-clients · MvM-1.4 https://www.onepointfour.co/2013/02/22/manvsmachine/
- CG-luxury https://motionographer.com/2023/06/01/crafting-stunning-cg-films-for-beauty-luxury-products/ · Sarofsky https://schoolofmotion.com/blog/sarofsky-interview · Perception https://motionographer.com/2022/07/07/project-breakdown-with-perception/
- Holmedal https://motionographer.com/2016/05/02/interview-man-vs-machines-simon-holmedal/ · HueCry https://motionographer.com/2019/11/04/hue-and-cry-bring-us-into-the-flame/ · Buck-Antfood https://motionographer.com/2016/11/18/buck-and-antfood-join-forces-yet-again-to-create-spectacle-of-the-real/
- Kashiwagi https://motionographer.com/2022/05/05/project-breakdown-with-arisu-kashiwagi/ · Psyop https://motionographer.com/2006/07/25/interview-kylie-matulick-and-todd-mueller-of-psyop/ · Chromo https://motionographer.com/2016/03/01/forms-in-nature-in-depth-process-with-chromosphere-and-david-kamp/
- Honig https://www.schoolofmotion.com/blog/so-you-want-to-animate-part-3-and-4-adobe-max-2020 · Griffin https://schoolofmotion.com/blog/dreaming-of-apple-a-directors-journey · Donaldson and Me Tran https://schoolofmotion.com/blog/design-tips-from-designers
- Frederick https://schoolofmotion.com/blog/4-simple-tips-to-design-with-contrast-and-type · Marriott-MDS https://motiondesign.school/courses/motion-practice-with-ben-marriott · AnimSchool https://blog.animschool.edu/?p=858
- SoM-autofollow https://schoolofmotion.com/blog/automatic-follow-through-after-effects · Tendril https://www.stashmedia.tv/tendril-brand-refresh/ · Animade-Meta https://archive.animade.tv/work/meta-ai-ring

**Motion systems**
- Carbon https://carbondesignsystem.com/elements/motion/overview/ · Carbon-chor https://carbondesignsystem.com/elements/motion/choreography/ · MDC-motion https://github.com/material-components/material-components-android/blob/master/docs/theming/Motion.md
- M3-tokens https://github.com/androidx/androidx/blob/androidx-main/compose/material3/material3/src/commonMain/kotlin/androidx/compose/material3/tokens/ExpressiveMotionTokens.kt · MDC-chor https://web.archive.org/web/2017id_/https://material.io/guidelines/motion/choreography.html · MD-chor19 https://web.archive.org/web/2019id_/https://material.io/design/motion/choreography.html
- MD-speed https://web.archive.org/web/2019id_/https://material.io/design/motion/speed.html · MD-system https://web.archive.org/web/20200331110322id_/https://material.io/design/motion/the-motion-system.html · MD-codelab https://developer.android.com/codelabs/material-motion-android
- Atlassian https://atlassian.design/foundations/motion · Atlassian-apply https://atlassian.design/foundations/motion/applying-motion · Fluent https://fluent2.microsoft.design/motion
- WWDC23-spring https://developer.apple.com/videos/play/wwdc2023/10158/ · HIG-color https://developer.apple.com/design/human-interface-guidelines/color · HIG-type https://developer.apple.com/design/human-interface-guidelines/typography

**Easing and type**
- Easings https://raw.githubusercontent.com/ai/easings.net/master/src/easings.yml · Penner https://kehilalinks.jewishgen.org/vamospercs/res/easing_equations.js · Apple-CSS https://www.apple.com/ac/localnav/9/styles/ac-localnav.built.css · Apple-films-CSS https://www.apple.com/ac/ac-films/7.5.1/styles/modal.css
- CA-default https://developer.apple.com/documentation/quartzcore/camediatimingfunctionname/default · AE-easy https://creativecow.net/?p=2412183 · SoM-flow https://www.schoolofmotion.com/blog/flow-after-effects
- SoM-morph https://schoolofmotion.com/blog/morphing-letters-after-effects · SoM-textanim https://schoolofmotion.com/blog/text-animators-after-effects · GSAP-split https://gsap.com/docs/v3/Plugins/SplitText/
- JakeTJ https://www.jakeinmotion.com/type-jazz · AEJuice https://aejuice.com/blog/how-to-do-a-horizontal-reveal-of-a-title-in-after-effects · Overshoot https://en.wikipedia.org/wiki/Overshoot_(signal)

**Transitions**
- SoM-match https://www.schoolofmotion.com/blog/match-cuts · SoM-6trans https://www.schoolofmotion.com/blog/six-essential-motion-design-transitions-tutorial · MDS-morph https://motiondesign.school/blog/morphing-study-how-to-create-animated-transition/
- Adobe-wipe https://www.adobe.com/creativecloud/video/hub/ideas/what-is-natural-wipe-in-video-editing.html · Adobe-matte https://www.adobe.com/learn/after-effects/web/create-custom-transitions · IdeaRocket https://idearocketanimation.com/17950-video-transitions/
- NFS-whip https://nofilmschool.com/2017/09/5-steps-create-perfect-whip-pan-transition · DVinfo-dip https://www.dvinfo.net/forum/adobe-creative-suite/128731-dip-white.html

**Reading and vertical**
- BBC-sub https://www.bbc.co.uk/accessibility/forproducts/guides/subtitles/ · Netflix-tt https://partnerhelp.netflixstudios.com/hc/en-us/articles/217350977-English-USA-Timed-Text-Style-Guide · Netflix-timing https://partnerhelp.netflixstudios.com/hc/en-us/articles/360051554394-Timed-Text-Style-Guide-Subtitle-Timing-Guidelines
- SoM-lower https://schoolofmotion.com/blog/sports-lower-thirds · TikTok-bp https://ads.tiktok.com/resources/help/article/creative-best-practices · Meta-reels https://www.facebook.com/business/ads-guide/update/video/instagram-reels?locale=en_US
- Shorts-safe https://adkit.so/tools/safe-zones/youtube · ASC-preview https://developer.apple.com/help/app-store-connect/reference/app-preview-specifications · YT-upload https://support.google.com/youtube/answer/1722171

**Camera and finishing**
- RED-shutter https://www.reddigitalcinema.com/red-101/shutter-angle-tutorial · RED-pan https://www.reddigitalcinema.com/red-101/camera-panning-speed · Blender-RS https://docs.blender.org/api/current/bpy.types.RenderSettings.html
- Blender-MB https://docs.blender.org/manual/en/latest/render/cycles/render_settings/motion_blur.html · PVC-AE https://www.provideocoalition.com/cmg_hidden_gems_chapter_8_motion_blur_and_more/ · Multiplane https://en.wikipedia.org/wiki/Multiplane_camera
- NFS-dolly https://nofilmschool.com/2018/05/watch-zoom-dolly-shot · PMC-blur https://pmc.ncbi.nlm.nih.gov/articles/PMC3088122 · DVinfo-noise https://www.dvinfo.net/forum/archive/index.php/t-504310.html
- Adobe-comm https://community.adobe.com/t5/after-effects-discussions/why-am-i-getting-this-artifacting-how-do-i-render-to-avoid/m-p/14346971/highlight/true · CA-gloss https://3d.irpr.agency/glossary/chromatic-aberration/ · Colorculture https://colorculture.org/?p=1226
- Blender-glare https://docs.blender.org/manual/en/latest/compositing/types/filter/glare.html · Lottie-colour https://lottiefiles.com/blog/tips-and-tutorials/color-theory-for-motion-design.md

**Sound**
- SonoS https://www.schoolofmotion.com/blog/sono-sanctus-podcast-podcast · BoxToys https://motionographer.com/2025/03/24/unsung-heroes-box-of-toys/ · Sonilo https://sonilo.com/ai-music/whoosh-sound-effect-guide
- Krotos https://krotos.studio/blog/sound-to-picture · Krotos-silence https://krotos.studio/blog/the-power-of-silence-times-when-less-was-more-in-sound-design · AnimIsland https://www.animatorisland.com/?p=174
- LinkedIn-SD https://www.linkedin.com/learning/sound-design-for-motion-graphics/reversing-and-editing-clips-for-effect · WWDC17-803 https://developer.apple.com/videos/play/wwdc2017/803/ · WWDC19-810 https://developer.apple.com/videos/play/wwdc2019/810/
- SOS https://www.soundonsound.com/techniques/logic-working-picture · Spotify https://support.spotify.com/us/artists/article/loudness-normalization/ · Meterplugs https://www.meterplugs.com/blog/2019/09/18/youtube-changes-loudness-reference-to-14-lufs.html
- EBU-R128 https://tech.ebu.ch/docs/r/r128.pdf · Meta-sound https://web.archive.org/web/20200510015822/https://www.facebook.com/business/inspiration
