# The Apple way: research for the "almost friends" film

Target: about 60 s, vertical 1080×1920, 60 fps. The app works like this: you set your priorities by chatting with an AI, the AI matches you with people who share them, you get 3 days of anonymous chat, and profiles are revealed only if both sides unlock.

**How sources are marked.** Every claim names its source. `[HIG-local]` = a local mirror of Apple's Human Interface Guidelines (developer.apple.com/design/human-interface-guidelines). `[FA]` = my own frame and audio analysis of downloaded films: 1 fps contact sheets, ffmpeg scene cuts at a threshold of 0.3, and silencedetect at −40 dB. The downloaded films are not kept (they are third-party uploads); the method is in §8. **unverified** = not confirmed by a source I read in this pass.

---

## 1. Apple's own motion doctrine (HIG + WWDC)

### HIG › Motion
Source: `[HIG-local] motion.md` = https://developer.apple.com/design/human-interface-guidelines/motion (last changed 2025-09-09)
- "**Add motion purposefully**, supporting the experience without overshadowing it. Don't add motion for the sake of adding motion."
- "**Strive for realistic feedback motion** that follows people's gestures and expectations… feedback motion that doesn't make sense can make them feel disoriented." Example from the page: if a view slides down to reveal, it should not slide sideways to dismiss.
- "**Aim for brevity and precision** in feedback animations… brief and precise… conveys information more effectively than prominent animation."
- "Make motion optional": don't rely on motion alone. Back it up with haptics and audio.
- For games, the page gives 30–60 fps as a smooth baseline. We run at 60.

### HIG › Design principles (reintroduced 2026-06-08)
Source: `[HIG-local] design-principles.md` = https://developer.apple.com/design/human-interface-guidelines/design-principles
- The eight headers: **Purpose** ("Make something meaningful"), Agency, Responsibility ("Act in people's best interest"), Familiarity, Flexibility, **Simplicity** ("Be clear and direct… every element earning its place"), **Craft** ("Care about every detail"), **Delight** ("Make it human").
- "Simplicity isn't minimalism… keeps the important things close by and lets the others fall away."
- "**Identify the emotion you want to inspire**… Know the feeling you want to evoke, and let it shape your design."
- "**Create defining moments.**" Also: "**Don't mistake delight for decoration.**"
- Responsibility: "Be fully transparent about what your product does and why." This matters for an app that does AI matching.

### HIG › Live Activities (closest system pattern to "content changes in place")
Source: `[HIG-local] live-activities.md` = https://developer.apple.com/design/human-interface-guidelines/live-activities
- Animations have a "**maximum duration of two seconds**."
- "**Animate layout changes**… preserve as much of the existing layout as possible by animating existing elements to their new positions rather than removing and animating them back in." This is the object-carried transition rule.
- "Avoid overlapping elements… only animate the element that moves… fade the other items."
- Use numeric content transitions for changing numbers. The page's example is sports scores. We can use the same for the 3-day countdown.

### WWDC18 "Designing Fluid Interfaces" (session 803)
Source: https://developer.apple.com/videos/play/wwdc2018/803/ (transcript)
- "When the tool feels like **an extension of your mind**." "It's not just about framerate. It's what's in the frames."
- **Spatial consistency**: "It should have a consistent offscreen path as it enters and leaves." If something enters from the right, it leaves to the right.
- **Hinting**: "transition smoothly between these two states in a way that it grows from the initial state to the final state." Control Center modules "grow up and out towards your finger."
- "Take **a small input and make a big output**."
- Springs are tuned with **damping + response**, not duration. "Start with **100% damping** (no overshoot)." "If the gesture driving the motion has momentum, reward that momentum with a little overshoot." The Music app uses 100% damping for a tap-to-open and **80% damping** for a swipe-to-dismiss.
- 30 fps strobes on fast movement, while "at 60 fps we can do faster movement without strobing." Motion blur and motion stretching are tools for this.
- Hysteresis is "usually 10 points in iOS." Touch tracking is one-to-one.

### WWDC23 "Animate with springs" (session 10158)
Source: https://developer.apple.com/videos/play/wwdc2023/10158/
- Springs keep **position and velocity continuous**. A spring "very slowly and gradually comes to rest… there's no single point when the object is abruptly done."
- Bounce values: **0** is the default and "most versatile." **0.15** "doesn't feel very bouncy yet… a little more brisk." **0.3** gives "noticeable bounciness." **>0.4** "may feel too exaggerated for a UI element."
- Example values: `.spring(duration: 0.5, bounce: 0.15)`, `.spring(duration: 0.6, bounce: 0.2)`, `.snappy(duration: 0.4)`.
- Physics conversion: mass = 1, stiffness = (2π/duration)², damping = 1 − 4π·bounce/duration for bounce ≥ 0. Use this to drive springs in After Effects or our renderer.
- "Stay consistent with the app's character: serious or playful? relaxed or fast-paced?"

### Typography (system)
Source: `[HIG-local] typography.md` = https://developer.apple.com/design/human-interface-guidelines/typography
- SF is a variable font with **dynamic optical sizes** (Text and Display merge). "**Avoid light font weights**": prefer Regular, Medium, Semibold or Bold, and avoid Ultralight, Thin and Light.
- iOS default scale: Large Title 34/41, Title1 28/34, Headline 17 Semibold, Body 17/22.
- SF Pro tracking (1/1000 em) by point size: 17pt −26 · 20pt −23 · 28pt +14 · 34pt +12 · 48pt +8 · 60pt +4 · 72pt +2 · **80pt+ = 0**. Film headlines at 1080 px wide sit well above 80 pt, so use tracking 0 and no letter-spacing tricks.

### HIG › Writing
Source: `[HIG-local] writing.md` = https://developer.apple.com/design/human-interface-guidelines/writing
- "Check each word to be sure it needs to be there. If you can use fewer words, do so. **Read your writing out loud.**"
- "If you're trying to convey more than one idea, consider **breaking up the text onto multiple screens**." This means one line per card.
- "Be action oriented… active voice." "Avoid using *we*." Use possessives sparingly.

---

## 2. Apple's philosophy for films and ads (people and writing)

| Who | What they said or did | Source |
|---|---|---|
| Apple, "Designed by Apple in California" (WWDC 2013 spot "Our Signature") | Narration: "This is it, this is what matters… We spend a lot of time on a few great things, until every idea we touch enhances each life it touches… You may rarely look at it, but you'll always feel it." Spoken over "simple harmonic chords." | https://forums.appleinsider.com/discussion/158268 ; https://www.engadget.com/2013-06-25-apple-brings-designed-by-apple-in-california-ad-campaign-to-pr.html |
| Tor Myhren (Apple VP Marketing Communications), Cannes Lions 2025 | "It's not enough for marketing to make you simply understand something. **It has to make you feel something.**" "Logic isn't always the path to human connection." "The small details… that make a story come alive… resist automation." On the AirPods hearing-aid film: data "certainly wouldn't suggest starting a commercial with **40 seconds of muffled sound**. But that's what made it work." | https://aws2.campaignasia.com/article/ai-wont-kill-advertising-it-wont-save-it-either-apples-top-marketing-exec-at/503067 |
| Myhren's background | Former journalist and documentary filmmaker. Under him Apple won back-to-back Emmys for Outstanding Commercial (2023, 2024). | https://www.manifest-media.in/marketing/160625/cannes-lions-2025-apples-tor-myhren-has-a-piece-of-good-and-bad-ne.html ; https://www.apple.com/leadership/tor-myhren/ |
| Ken Segall (Apple agency creative director, *Insanely Simple*) | Concentrate on **one message**. "The essence of simplicity is communicating your meaning with a minimum of words, or preferably, with **no words at all**." | https://oleb.net/blog/2012/08/insanely-simple/ ; https://www.penguinrandomhouse.com/books/310710/insanely-simple-by-ken-segall/ |
| Steve Jobs, 1997 Think Different town hall | "To me, marketing is about values… It's a very noisy world… we have to be really clear on what we want them to know about us." Wording varies between transcriptions. | https://speakola.com/corp/tag/APPLE ; https://www.crowdspring.com/blog/?p=8572 |
| Jony Ive | "True simplicity is derived from so much more than just the absence of clutter and ornamentation; it's about bringing order to complexity." Exact origin is disputed (Telegraph interview vs. iOS 7). | https://www.techradar.com/news/computing/apple/ive-on-apple-s-quest-for-simplicity-1081643 ; https://pxlnv.com/linklog/a-rare-interview-with-jonathan-ive |
| Ive-era house film style | "Beauty shots and engineering animations, accompanied by Jony's intelligently philosophical voice." Music pairing began around iPhone 4 and 5 (soft piano). Ive's narration stopped around 2018. | https://kensegall.com/2018/11/05/what-happened-to-jonys-voice/ ; https://mobilesyrup.com/2019/06/28/jony-ive-best-apple-videos/ |
| Hiroki Asai (head of Apple Marcom creative, 2000–2016) | Grew in-house design from 35 to 1,500+ people. "Champion of details and aesthetic integrity": "if he wanted a coffee stain on a poster, he really used coffee." Championed simplicity, form, typography and storytelling. | https://www.iculture.nl/nieuws/voorpublicatie-van-nieuwe-boek-apple-met-korting-voor-iphoneclub-lezers ; https://suzy.com/blog/hiroki-asai-global-head-marketing-airbnb ; https://en.wikipedia.org/wiki/Hiroki_Asai |
| Alan Dye on Dynamic Island | "The whole is a dynamic software **like a fluid**." The breakthrough was realising the animation "didn't have to be limited to the status bar… it gets a little bigger and lets you know what you're doing." Federighi called it "a very delicate animation effect" that gave iPhone "a new personality." Dye spent about 3 of 22 minutes of the iPhone 14 Pro keynote on it. | https://9to5mac.com/2022/10/03/dynamic-island-ui/ ; https://appleinsider.com/articles/22/10/02/craig-federighi-alan-dye-talk-about-dynamic-islands-creation ; https://www.yankodesign.com/2022/09/08/apple-spent-3-full-minutes-talking-about-this-feature-on-the-iphone-14-pro/amp/ |
| "Relax, it's iPhone" platform | One simple, reusable insight ("you can trust it") that "enables Apple to talk about pretty much any feature." It is comedy about everyday anxiety, and the feature resolves it. Directed by Andreas Nilsson (Biscuit) with TBWA\Media Arts Lab, plus in-house work. | https://www.thedrum.com/news/2023/07/11/ad-the-day-apple-spot-shows-farmer-transporting-huge-pumpkin-down-lonely-road ; https://mobilemarketingmagazine.com/apple-ads-campaign/ ; https://develop.adweek.com/?p=1582586 |
| Check In "New Driver" (Jan 2024) | Dad watches his teen back out, hitting a skateboard and a bin → he waits, anxious → notification "Megan. Check In: Arrived at school." → he relaxes. End line: "**Check in automatically.** Relax, it's iPhone." | https://www.phonearena.com/news/new-iphone-15-ad-spotlights-ios-17-feature-check-in_id154535 ; https://appleosophy.com/2024/01/21/apples-latest-iphone-ad-highlights-check-in/ |
| "Data Auction" privacy ad (2022) | Data brokers are personified as a live auction of one woman's data. She taps App Tracking Transparency, then Mail Privacy Protection, and the room empties. End line: "It's your data. iPhone helps keep it that way." | https://9to5mac.com/2022/05/18/apple-privacy-on-iphone-new-ad/ ; https://www.fastcompany.com/90753303/apple-privacy-ad-may-2022 |
| Apple Intelligence "Hello" spots (2024) | 30–45 s comedies (Bella Ramsey; director David Shane). Each is a social embarrassment solved by one feature, ending on a song. Critics said some framed AI as a shortcut for lazy people, a tone risk to avoid. | https://www.campaignasia.com/article/bella-ramsey-uses-apples-new-ai-features-to-escape-awkward-situations/498417 ; https://news.designrush.com/apple-touts-writing-tools-and-memory-movies-in-two-new-apple-intelligence-spots |
| Studios | Buck made art films for Apple on the real product ("Power to the Pro," iMac Pro) plus Cannes Gold for Film Craft/Animation ("Share Your Gifts"). Antfood (music and SFX, iMac) "focused on tightly scored music and sound design to complement the… animation" and won ADC Bronze for Sound Design. | https://buck.co/work/apple-power-to-the-pro ; https://en.wikipedia.org/wiki/Buck_(design_company) ; https://antfood.com/work/apple-imac |
| NameDrop UI facts | Bring the tops of two iPhones together. A **wavy glow** comes from the top of both screens, there is a **haptic tap**, and Contact Posters appear in about 1–2 s. | https://www.macrumors.com/2023/06/05/namedrop-apple-ios-17/ ; https://www.nfcw.com/?p=85782 ; https://www.iculture.nl/tips/namedrop-iphone-telefoonnummer-delen/ |

Not found in this pass: a primary interview with Apple's in-house film team about lighting, camera or orbit rules, or a ManvsMachine or Psyop Apple case study. Statements about Apple's "slow orbit / macro / light-on-material" hardware language below are backed only by my frame analysis of the Dynamic Island reveal (§4d-C). Anything beyond that is **unverified**.

---

## 3. Copywriting for on-screen words

No official Apple copy rulebook is public. The **HIG Writing** page (§1) is the only primary source. The analyses below are third-party readings of apple.com.

| Device | Apple example (as quoted by the source) | Source |
|---|---|---|
| Benefit first, then fact | "Our longest battery life ever." → "Up to 2.5x better low-light photos" | https://www.enchantingmarketing.com/write-like-apple/ |
| Feature → effect on *you* | "…adjusts… nine LEDs… **so your subject always appears in the best light**." | same |
| Two-beat soundbite with parallel structure | "Love the power. Love the price." | same |
| Rule of three, with the word repeated | "More detailed details. More colourful colours. More epic pics." | same |
| Coined, human words | "Oops resistant." | same |
| Rhyme | "Sails through spills." | https://brandzine.beehiiv.com/p/5-copywriting-tricks-apple-uses-to-make-you-want-their-products |
| "You" outnumbers the product name | One count found you/your 41× vs "iPhone" 20× | https://marketingshots.beehiiv.com/p/shot-49-learn-copywriting-from-apple |
| One idea per headline | "The more ideas you try to sell, the more a consumer doesn't know what's important." | https://www.widewail.com/blog/local-marketing-insider-043 |
| End lines (observed in [FA] and press) | "Check in automatically." · "Keep data trackers off your back." · "Safari. A browser that's actually private." · "Privacy. That's iPhone." · "It's your data. iPhone helps keep it that way." · "This is a FaceTime between two people who don't speak the same language." | §4d + sources in §2 |

The pattern in the end lines: **verb + benefit** in 2–6 words, then **noun. That's iPhone.** as a payoff, often built up on screen in two steps ("Privacy." → "Privacy. That's iPhone.") [FA Safari ad, 55–56 s].

---

## 4. Distillation

### (a) Core principles

| # | Principle | How it shows on screen | Source |
|---|---|---|---|
| 1 | **Make them feel, not just understand.** | Open on a human emotion (anxiety, a crush, embarrassment), not on the UI. The feature arrives as the release. | Myhren (Campaign Asia); HIG "Identify the emotion"; New Driver, Fallen Deep [FA] |
| 2 | **One idea per film, one idea per shot.** | Each shot shows one state change. Each card holds one line. No split screens of features. | Segall (oleb.net); HIG Writing "multiple screens" |
| 3 | **What it does for you, not what it is.** | Lines are verb + benefit ("Check in automatically"). Specs and the mechanism stay off screen. | enchantingmarketing; HIG Writing "action oriented" |
| 4 | **Demonstrate, don't tell.** | Real UI, with real content in it, doing the thing. Narration is optional and often absent. | Segall "no words at all"; Dynamic Island reveal (no VO) [FA] |
| 5 | **Personify the invisible.** | Abstract forces become people or places: trackers become silver-suited "Sam," data becomes an auction, awkwardness becomes literally sinking into a hole. | Safari ad, Data Auction, Fallen Deep [FA]; 9to5mac |
| 6 | **The product resolves the tension. It never *is* the story.** | Pattern: problem in the world → one tap or one gesture → the world changes. The product appears in about the last third. | New Driver, Fallen Deep, Safari [FA] |
| 7 | **Restraint is the luxury.** | Black or white fields, one type family, no gradients or shadows on type, motion that never competes with the message. | HIG Simplicity; https://www.moonb.io/blog/kinetic-typography (secondary) |
| 8 | **Motion obeys physics and space.** | Things enter and leave on the same path, grow out of their source, settle on springs without abrupt stops, and never cut where a carry would work. | WWDC18 803; WWDC23 10158; HIG Live Activities |
| 9 | **Craft in the details people won't consciously see.** | Real coffee for a coffee stain. Pixel-true UI. Haptic-feeling sound on every tap. | Asai (iCulture); "you'll always feel it" (Our Signature); HIG Craft |
| 10 | **Silence and space carry weight.** | A held quiet beat at the emotional low point, then the music lifts on the resolution. | Myhren "40 s of muffled sound"; Fallen Deep has ~8 s of near-silence at 27–35 s [FA] |
| 11 | **Be honest about what the product does.** | Real flows only, no fake capability. Show the privacy mechanics as part of the benefit. | HIG Responsibility; Apple Intelligence privacy film (§4d, Siri film) |
| 12 | **Delight is not decoration.** | One defining moment (the island morphing, the phones touching) gets the spectacle. Everything else stays quiet. | HIG Delight; Dye/Federighi on Dynamic Island |

### (b) Craft rules (numbers come from sources where given; otherwise they are measured [FA] or marked)

**Timing and edit rhythm**
- Story ads have an average shot length of about **1.8 s** (Safari, 65 s, 36 cuts) and about **3.7 s** (Fallen Deep, 66 s, 17 cuts). Feature or UI reveals hold much longer: the Dynamic Island reveal is 26.7 s with only **3 hard cuts**, carried by continuous camera moves and morphs [FA].
- Structure, measured: problem/world takes about the **first 60–65%**, the feature in use takes **15–25%**, and the end line + logo takes the **last 10–15%**. Safari: end text 44 s → logo 58 s of 65. Fallen Deep: NameDrop at 43–51 s, line 62 s, logo 64 s of 66 [FA].
- The end card is held over near-silence: Safari has silence 60.0–65.1 s, Siri film 91.1–96.0, New Driver 11.9–15.0, Live Translation 13.5–14.4 [FA silencedetect].
- An on-screen end line holds about **2 s** ("Keep data trackers off your back." about 44–46 s; "Safari. A browser that's actually private." about 53–55 s) [FA]. Kinetic word-chunks in the Siri trailer run about **1 per second** ("COMING / TO A POCKET / NEAR YOU", 0–3 s) [FA].
- UI animation segments are **≤2 s** each, per the Live Activities cap [HIG-local].

**Motion and springs**
- Default spring: bounce **0**. For "brisk" use **0.15**. Use **0.3** only for playful, momentum-driven moments. Never go **>0.4** [WWDC23].
- Durations from Apple's examples are **0.4–0.6 s** [WWDC23]. Where nothing has momentum (taps), use 100% damping. When a swipe or throw drives the move, use about 80% damping [WWDC18].
- Keep velocity continuous across cuts and morphs. No ease-in-out "halts" at the end of a gesture-driven move [WWDC23].
- Grow from the source: a sheet or card scales out of the thing that triggered it [WWDC18 hinting]. Morph existing elements instead of fading out and in [HIG Live Activities].
- At 60 fps you can move faster without strobing [WWDC18]. That is our advantage, but don't spend it on gratuitous speed [HIG Motion].

**Type**
- Use SF Pro Display or the closest licensed equivalent. Weights are **Semibold or Bold** for headlines and never Light or Thin [HIG Typography]. Tracking is **0 at ≥80 pt** [HIG tracking table].
- Lines run **2–6 words**, sentence case, period at the end ("Privacy. That's iPhone.") [FA + §3]. One line on screen at a time [HIG Writing].
- Colour is plain white on dark or black on light: "no gradients or drop shadows," and entrances serve information (fade, scale or slide) [moonb.io / yansmedia, secondary, low weight]. Exception: the 2025 Siri trailer uses chrome condensed caps as a deliberate *movie-trailer pastiche* [FA]. That is a genre joke, not a default.
- On-screen captions inside the UI type word by word (Live Translation captions build "Listen my / darling, / add a pinch of…") [FA].

**Camera**
- Hardware or product hero: start in **near-black with a rim light** (lens macro → glowing pill outline), then **slow push or orbit** into a frontal lock-off, then **locked frontal crop of the top of the phone** while the UI changes state about once per second, then end on a slow reveal of the back of the phone [FA Dynamic Island 0–26 s].
- Software in vertical: show the **phone floating centred on a soft pastel gradient**, then **punch in until the screen fills the frame**, then let real content play, then pull back to the device and the logo [FA Live Translation 0–14 s].
- Story: shoot real places with naturalistic light. Hands with phones are **tight inserts** (New Driver notification close-up at 7–9 s; Safari phone inserts at 2, 11, 33 s) [FA].
- **unverified**: claims that Apple films always use macro "light raking across materials." This holds for the hardware reveal I measured, but I have no primary source.

**Transitions**
- Object-carried and morph transitions replace cuts in UI films. The island grows into Maps directions, Face ID, ride status, Voice Memos and music without a cut [FA; HIG Live Activities "animate existing elements to their new positions"].
- Match on physical metaphor: in Fallen Deep, a **phone drops into the hole** (40–44 s), then the two phones meet, then the NameDrop glow fills the frame [FA].
- The end-card build turns the payoff word into the full line in place ("Privacy." → "Privacy. That's iPhone.") [FA].

**Sound**
- Music is tightly scored to the cut. Antfood's iMac film was "tightly scored music and sound design to complement the fast paced… animation" [antfood.com].
- Earn the drop: hold near-silence at the low point (Fallen Deep, ~8 s), then the song returns as the feature fires [FA; Myhren on the 40 s of muffled sound].
- Every UI interaction gets a sound or haptic analogue [HIG Motion "supplement with haptics and audio"]. NameDrop's real behaviour is a haptic tap plus a glow [iCulture/NFCW].
- The last 3–5 s are quiet under the logo [FA silencedetect, 4 of 7 films].

**Colour and light**
- The device colour sets the film palette. The Dynamic Island reveal is deep purple throughout, matching the launch colour (frames 0–26 s) [FA].
- UI-centred verticals use soft pastel gradients (Live Translation) or a single bright brand field (Journal on Mac: lime/yellow) [FA].
- Story films are graded naturally, with warm practical light. In Fallen Deep the low point is **dark earth tones**, and it lifts to bright cool light when she appears above [FA].

### (c) What Apple would never do
1. Lead with a feature list or a spec dump. The one list in the Siri trailer is a **legal-style scroll for 3 s at the end**, not the pitch [FA 79–81 s; Segall one message].
2. Put more than one idea in a line or a shot [HIG Writing; Segall].
3. Use fake or mock UI that the product can't do, or exaggerate AI capability [HIG Responsibility; motion.so lists "fake UI" as a thing to avoid].
4. Use Light or Thin weights, add letter-spacing to big type, or put gradients or drop shadows on type [HIG Typography; moonb.io].
5. Animate for decoration, with spins, glitches or particle sprays that carry no meaning [HIG Motion "for the sake of adding motion"; HIG Delight "not decoration"].
6. Ease-in-out halts, or elements leaving by a different path than they entered [WWDC23; WWDC18 spatial consistency].
7. Bounce above 0.4 on interface elements [WWDC23].
8. Use "we" in copy, or cute button language like "Let's do it!" [HIG Writing].
9. Wall-to-wall music with no breath, or a louder track to fake energy [Myhren; FA silence patterns].
10. Use HUD frames, technical micro-labels or "data overlay" chrome around the product. **unverified** as a sourced Apple rule. Consistent with the HIG "every element earning its place" and with the user's prior reel feedback in `~/.claude/projects/...memory/reel-craft-feedback.md`.
11. Portray the user as lazy or deceptive. The Apple Intelligence Writing Tools ad drew this criticism (designrush), so the tone risk is real.
12. Show surveillance-y or creepy data handling without showing the protection. Apple films about AI end on the privacy promise (§4d, Siri film).

### (d) Beat sheets (measured; timecodes from 1 fps sheets plus scene-cut list)

#### A. "Fallen Deep" (Relax, it's iPhone, Thailand, NameDrop) is the closest analogue: strangers, a crush, a contact exchange
66.1 s, 25 fps, 17 cuts, ASL ≈3.7 s. Third-party upload of the Apple TH spot: https://www.youtube.com/watch?v=hvn0pshePUE (end card shows the Apple logo and "สบายใจได้ นี่ iPhone"). [FA]
| Time | Beat | Notes |
|---|---|---|
| 0:00–0:16 | **World + desire.** Airport check-in. He notices her and freezes, phone in hand. | Wide lock-offs, natural light, no UI, no text. |
| 0:16–0:21 | **Metaphor made literal.** He sinks into the floor: embarrassment as a hole. | One VFX idea, played straight. |
| 0:21–0:38 | **Low point.** Alone in the dark hole, looking up. | Dark earth palette. Audio is near-silent 27–35 s. |
| 0:37–0:40 | **Turn.** She appears at the rim, looking down. | POV up through the circular hole: geometric framing. |
| 0:40–0:46 | **Feature in action.** Phones drop and meet: pink and blue iPhones touch tops. | Object-carried transition. Real lock-screen UI. |
| 0:46–0:51 | **Payoff UI.** Memoji Contact Posters swap. Caption "แลกด้วย NameDrop" ("Swap with NameDrop"). | One 3-word line, in-frame, about 2 s. |
| 0:52–1:02 | **Resolution.** She smiles down. He rises out of the hole. | Light floods back. |
| 1:02–1:06 | **Platform line + logo.** "Relax, it's iPhone." Then the Apple logo over the hole. | Ends on the metaphor's image, not on a product shot. |
Lesson for us: our "3 days anonymous → mutual unlock" maps onto the same arc of distance → one shared gesture → reveal. The **unlock should be the NameDrop moment**: two halves meet, then a glow, then faces revealed.

#### B. "Safari: data trackers" (Privacy on iPhone) shows how to personify an invisible system
65.1 s, 24 fps, 36 cuts, ASL ≈1.8 s. Official: https://www.youtube.com/watch?v=Spb-ka7xrR8 [FA]
| Time | Beat | Notes |
|---|---|---|
| 0:00–0:04 | **Hook question.** In a library, a man is browsing his phone with a silver-suited figure clinging to him. "Excuse me. Who's Sam?" → "Online data tracker. Follows me everywhere I browse." | The premise is stated in 2 lines of dialogue. That is the only explanation in the film. |
| 0:04–0:40 | **Escalating montage of the problem.** Trackers pile onto people at a park, a museum, a restaurant, a tent, a gym, a hair salon and a waiting room. Song starts. | One gag per shot, cut about every 1–2 s. Phone inserts at 2, 11, 33 s. |
| 0:40–0:46 | **Turn.** A woman walks across campus being chased by a tracker. Text: "**Keep data trackers off your back.**" | First on-screen line, held about 2 s. |
| 0:46–0:50 | **Feature action.** She taps Safari on the home screen (macro insert). | One tap. |
| 0:50–0:55 | **Visual payoff.** Trackers burst into splashes of water against the wall. "**Safari. A browser that's actually private.**" | Product name + one benefit. |
| 0:55–0:57 | **Brand line build.** Phone held up to camera: "Privacy." → "Privacy. That's iPhone." | Two-step reveal of the line. |
| 0:57–1:05 | Carrier tag, Apple logo over the fountain. | 5 s of silence under the logo. |
Lesson: our invisible system is "the algorithm" and "matching." We can personify it, but Apple shows the *problem* this way, not the feature. The feature is shown as one plain tap.

#### C. iPhone 14 Pro "Dynamic Island" reveal (keynote film) is the model for pure UI/hardware craft with no words
26.7 s, 30 fps, **3 hard cuts** (everything else is camera moves and morphs), no VO, music only. Third-party clip of the Sept 7 2022 event: https://www.youtube.com/watch?v=rMBopDh_Vsw ; full event https://www.youtube.com/watch?v=ux6zXguiqxM [FA]
| Time | Beat | Notes |
|---|---|---|
| 0:00–0:01 | Near-black. Macro of the camera lens with a rim light. | Frame 0 is already moving. |
| 0:01–0:02 | **The shape alone**: a glowing pill outline on black. | The idea is introduced as a pure form before any context. |
| 0:02–0:05 | Device frontal, purple wallpaper. The pill sits in it. | Slow push. |
| 0:05–0:10 | Extreme low angle: audio waveform in the island, then music player on the home screen, then the device tilts in a slow orbit. | Light glides across glass. |
| 0:10–0:20 | **States, about 1 per second**, on a locked frontal crop of the top third: timer → call → directions "90 ft North" → Face ID → ride map → Voice Memos → music art. | Morphs, not cuts. This is the "fluid" idea made visible. |
| 0:20–0:22 | Fade to black. | Breath. |
| 0:22–0:26 | Back of the phone rises into frame from below, then the end. | Hardware close. |
Lesson: when we show our UI, lock the frame and let the *element* morph through states about once per second. Don't cut between screens.

#### D. Supporting references (shorter, also measured)
- **Live Translation (Apple Intelligence) vertical short**, 14.4 s: https://www.youtube.com/watch?v=yEsgrQmeT68. 0–2 s "Coming soon on iPhone" title over a floating phone on a pastel gradient. 3–5 s phone settles. 5–10 s **punch-in until the screen fills the frame**, captions build word by word over a real FaceTime. 10–13 s pull back. 13–14 s white logo + legal. VO (2 sentences): "This is a FaceTime between two people who don't speak the same language. And that's live translation by Apple Intelligence." This is the best template for a vertical UI explainer beat [FA].
- **Check In "New Driver"** 15 s cutdown: https://www.youtube.com/watch?v=6Sf7YCBu2rg. 0–4 s worry. 4–7 s waiting (static wide, dad at the table). 7–9 s notification insert "Arrived at school." 9–10 s "Check in automatically." 10–12 s relief + logo [FA].
- **"Apple's next big step for Siri and iPhone"** 96 s: https://www.youtube.com/watch?v=2PW5y3zAvPE. A movie-trailer pastiche with chrome kinetic caps and a VO in announcer parody. UI shown as a floating iPhone on black, punch-ins on real Siri responses, then a closing pillar "YOUR DATA / PROTECTED" before the logo [FA]. It shows Apple will **break its own type rules for a genre joke**, but it still ends on privacy.
- **Journal on Mac creator-style short** 30 s: https://www.youtube.com/watch?v=dAqo0pib06M. Casual first-person VO, a typed caption "btw journal on Mac," a toy mascot as the "user," and full-screen real UI with the cursor [FA]. This is the social-native register, not the hero-film register.

---

## 5. Applying it to "almost friends" (implications, not sourced rules)
- **Emotion**: the ache of being *almost* friends with people, then real recognition. The arc is world/loneliness, then a held quiet low, then one gesture, then reveal (Model A).
- **One idea**: "Matched on what matters, not how you look." Everything else (AI chat, 3 days, mutual unlock) is shown, not written. Three to four on-screen lines in total.
- **UI shots**: phone locked frontal or screen filling the frame, real-looking chat content, element morphs about once per second (Model C). Springs at bounce 0–0.15, 0.4–0.6 s.
- **Unlock moment**: two anonymous avatars slide together along a consistent path, a glow, a haptic-style tick, then faces resolve. This is the film's one defining spectacle (HIG Delight).
- **End**: a verb + benefit line, then the name, over silence, about 2 s each.
- **Honesty**: show the AI chat as it really works. Hint at privacy (anonymity *is* the privacy feature).

---

## 6. Gaps / unverified
- No primary source found for Apple in-house film crew rules (lens choices, orbit speeds, lighting). The camera notes come from [FA] only.
- No ManvsMachine, Psyop or "Apple Media Arts" production write-ups were found in this pass.
- Ad copy-rule sources in §3 are third-party analyses, not Apple.
- Fallen Deep and the Dynamic Island clip are third-party uploads of Apple content. Timecodes may differ by a few frames from the masters.
- No official Apple films for Journal (iOS), Contact Posters, NameDrop (US) or Live Activities were located on Apple's YouTube channel via search. The NameDrop analogue is the Thai spot.

## 7. Method ([FA])
Films were downloaded at 480p or less with yt-dlp for analysis and are not kept.
- Cuts: `ffmpeg -i X.mp4 -vf "select='gt(scene,0.3)',showinfo" -f null -`
- Silence: `-af silencedetect=n=-40dB:d=0.4`
- Contact sheets: `fps=1,scale=256:-2,tile=10xN` (`contact_*.jpg`), so each cell is 1 s.
- Captions are YouTube auto-subs (`*.en.vtt`).
