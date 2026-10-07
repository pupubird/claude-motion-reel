# LEARNING — almost friends (reel 06)

A 66 s **vertical** (1080×1920, 60 fps, 120 BPM, 33 bars) product film for a friend-making app, rendered in code on a
vertical engine adapted from reels 04–05, with an ElevenLabs score and an AI-generated cast. **Status: v6 locked and
released** ([`almostfriends-v1.0`](https://github.com/pupubird/claude-motion-reel/releases/tag/almostfriends-v1.0)):
a 1080p master, a 4K master and a web encode, plus a Chinese cut (中文版) rendered from the same code. This file records
how it was made: the owner's notes and what each cut changed, the rules a cut is judged by, the workflow, the decisions,
the measured quality, the spend, and every bug with its root cause and prevention.

## Versions: the owner's notes and what each cut changed

| Cut | The owner's notes on the cut before | What changed |
|---|---|---|
| v1 (60 s) | — (the brief: "go all out, impress me"; friends, not dating) | Concept "Outside your bubble", the name, a soap-film engine, the back half (the unlock, the faces, the foam, the mark) |
| v2 (66 s) | Opening weak; the front half didn't explain the app; frames cut; text too fast; "curse of knowledge" | A plain question hook, the name and value by 5.4 s, steps 1–3 inside one phone with a caption the whole time |
| v3 (66 s) | 12 notes: no hook in 3 s; the phone didn't look like a phone; UI sounds "ding dong"; easing not energetic; a wasted chance to flex; taps faster | Energy from frame 0, a real iPhone with a scripted camera, a 3D flight for step 2, transient-only UI sound, one motion system |
| v4 (68 s) | 7 notes: research the hook and remake it; remake the name scene; Bub must live in the universe; more growing friends; a visible unlock; no ".ai" at the punchline; no "not dates" | "Knock knock" from research, a 3D mark, a 3D Bub that searches (two nos and a yes), a padlock unlock with a click-clack in the silence, a foam of 240 friends |
| v5 (68 s) | 2 notes: lead with "how to make more friends" and show the product; the growing foam felt "有点密集恐惧" | The owner's words, one line per knock, "friends" carried into the name; 26 separate bubbles with air instead of a packed foam |
| v6 (66 s), released | 3 notes: the hook in 2 s at most; recast young, middle- to high-income and international, with new leads | The hook in one bar (the pop on the drop at 2.0 s), the score cut by one bar, 32 new portraits |
| v6 中文 (66 s) | After the lock: "做个中文版的, font must be great" | A Chinese cut from one copy table: the words adapted, Noto Sans SC set by its ink, 朋友 flipping into the name, its own cue sheet and mix; the English cut proven unchanged |

## The owner's preferences (the rules a cut is judged by)

Collected from every round of notes on this film and on reels 02–05; each one was learned from a cut that broke it.

**Opening**
- The first 2 seconds decide. Say the topic in the viewer's own words ("How to make more friends") and land the
  payoff by 2.0 s. A clever statistic or an insider metaphor that needs decoding is not a hook.
- Frame 0 is already moving, with a hit and words on it, and the music plays full from the first beat.
- One subject on a quiet field, a face that meets your eyes, at most two words in the first 0.3 s
  (`research/research-hooks.md`). Never a logo card first: the brand character opens, the name follows the payoff.

**Clarity for a viewer with zero context**
- They scrolled in from somewhere else and know nothing (the curse of knowledge). Say what the product is and what
  it's worth in plain words, then show each step as words with the real UI on screen at the same time.
- Metaphors may decorate, never carry the meaning. One idea per beat; no stacked posters.

**Type and reading**
- Big, legible type; no HUD chrome, timecodes, chapter captions or micro-labels.
- Reading time guide: 0.5 s + 0.375 s per word, measured on rendered frames. It is flexible for known or short lines,
  and a film is never slowed just to satisfy it. Effects on type must settle before the read; type is tinted with a
  solid colour, never alpha.

**Pace and motion**
- Something every ~2 s ("every few seconds a wow"); the length may pass 60 s if it earns it.
- Energetic easing: leave fast, land soft, bouncy springs, hits with a flash and a shake.
- Transitions carry something across. No hard cuts, and never a dip to black between lit shots.
- One deliberate breath: a slow push onto what everyone is waiting for, in near-silence. The owner singled it out.

**Sound**
- UI sounds are clicks, taps and pops, never pitched chimes; the score carries the melody.
- A state change the story hinges on (their lock opening) gets its own visible beat and its own sound before the payoff.
- −14 LUFS for phones, with the true peak at or under −1 dBTP after AAC encoding.

**Devices and characters**
- A real phone, whole, then the camera pushes in on what matters; never a cropped or oddly sized device.
- Characters live in the world (depth, light, contact, reactions), never stickers on top of it.

**People**
- Ordinary-looking people in casual iPhone snapshots, never model-pretty (the owner's rule since v1).
- This film's casting brief (v6): young (24–32), comfortable middle- to high-income lives, an international cast.
- Show abundance without crowding: a few dozen big faces with air between them, never a packed cluster of small ones
  (trypophobia: Cole & Wilkins, *Psychological Science*, 2013).

**The Chinese cut**
- A Chinese cut is part of the work for this audience, and its type is judged as hard as the English: "font must be
  great". A real Chinese face with real weights, set by its own metrics, never a fallback font or a synthesised bold.

**Copy and brand**
- Say friendship positively. No "not dating" disclaimers, and none of the category's worn words ("find your people",
  "like-minded").
- The brand is written as the domain on the name and end cards (almost / friends.ai), not at the punchline.

**Process**
- Research before designing (the hook above all), measure every cut with the gates before anyone sees it, and report
  spend and gate results with every version.

## Workflow that worked

| # | Phase | Exit criterion |
|---|---|---|
| 1 | Five research agents in parallel (market, UI via Mobbin, vibe, sound, naming) writing reports to `research/` | Every claim sourced; reports name their gaps |
| 2 | Direction-agnostic engine work while research ran: vertical renderer, kinetic type, iOS UI kit, gates | Pipeline renders a test frame on Metal |
| 3 | Look-dev of the riskiest pieces before any act: soap film (thin-film interference), the pop, the double bubble, the crowd, film letters | Each judged at full resolution |
| 4 | Concept and storyboard on the bar grid (`STORYBOARD.md`, `src/score.js`) | Every hand-off carries something |
| 5 | One scene module per act, stills after every change, a contact sheet per act | No act started while the previous was dirty |
| 6 | Cast generated once the shots that need faces were fixed (Higgsfield GPT Image 2) | Ordinary people, casual phone shots |
| 7 | Score: a 9-chunk ElevenLabs plan validated by `tools/check_plan.py`, two takes, measured (tempo, key, per-bar level, hits) | t1: 120.00 BPM, drops of +16 dB and +14 dB where planned |
| 8 | Foley from a cue sheet built from the picture's anchors (`tools/cues.mjs` → `tools/foley.py`), mixed (`tools/mix.py`) | −14 LUFS; tonal and quiet gates |
| 9 | Animatic (half resolution, 2–4 samples, 3 workers) → contact sheet one frame a second → critique → camera passes | Frame gate pass, no dips or drops |
| 10 | Styleframes at 8 samples and a review page (a private artifact) per version | Page checked at desktop and phone width |
| 11 | v2 from the owner's notes: re-anchor `score.js`, a new score front half by inpainting (`music.py --plan v2`), the front scenes rewritten, the back half kept | Frame, jump and reading gates; strips of every hand-off at 5-frame steps; stills with safe-band guide lines |
| 12 | v3 from 12 notes: freeze the new anchors first, then three tracks in parallel — a sound fork (non-pitched palette, cue sheet, gates), a music fork (new intro, takes measured, spliced) and the picture | Frame, jump and reading gates; strips at 0.1 s through every hand-off |
| 13 | v4 from 7 notes: a hook-research agent (platform guidance, attention science, 67 competitor ads) in parallel with the picture; 40 portraits generated in the background; the chosen concept built only after the report ranked it | Frame, jump, reading, tonal and quiet gates; strips through every new hand-off |
| 14 | v5 from 2 notes: the owner's own hook copy on v4's staging, "friends" carried into the name; the foam re-laid as a spaced circle with its anti-crowding rules checked at load | Stills through the pop and the carry at 0.05 s; foam stills every 0.6 s; all gates |
| 15 | v6 from 3 notes: the hook re-timed into one bar and the score's second intro bar cut (`splice_score.py --cut 2`, sample-exact), every later anchor −2 s; the cast regenerated in the background while the re-time was built | The cut verified sample-exact against v5's score + 2 s; stills through the new hook; all gates |
| 16 | Lock and release: the lead portrait that was 1k upscaled for 4K, the master mix at −2 dBTP, 16-sample 1080p and 4K masters, gates on the masters, a web encode, the release | Frame and jump gates on both masters; −14 LUFS and ≤ −1 dBTP on the MP4 |
| 17 | The Chinese cut: every string moved into `src/copy.js` (one table per cut, the same shape enforced at load), the English cut proven unchanged before anything Chinese was judged, Han metrics measured in the font, stills of every beat, its own cue sheet and mix, gates on its master | English: 29 of 32 stills pixel-identical, the other 3 within the renderer's own run-to-run noise; its cue sheet byte-identical; its reading check the same 77 strings and 5 flags. Chinese: all gates. The one deliberate change to both cuts, the eased chat scroll, touches only frames within 0.3 s of a message arriving (2 of the 32 stills) |

## Decisions

| Decision | Chosen | Why |
|---|---|---|
| Idea | Outside your bubble: chat bubbles and soap bubbles as one object | The everyday word for a social circle is "bubble"; chat bubbles are the UI. Vibe research reached it independently |
| Name | almost friends, almostfriends.ai (owner confirmed) | It is the mechanic; "almost" pops at the reveal. 18 of 20 obvious names were taken (`research/research-naming.md`) |
| Length | 66 s (owner: may pass 60 s if every few seconds carries a wow) | The front half needed room to show the app; 49 beats, longest gap 3.25 s (the held breath before the unlock) |
| Phone (v3) | A real iPhone, whole at rest (560 px screen), and a scripted camera (`ui/phonecam.js`) that pushes in on what matters; screens and camera share one `LAYOUT` | Owner: "doesn't look like a phone"; push-ins keep the UI legible and inside y 620–1248 |
| 3D universe (v3) | One shared field of 3,800 people-bubbles (`gl/universe.js`) behind the hook, for Bub's search and at the reveal | Owner: "we wasted an opportunity to flex"; one place, three shots |
| Motion (v3) | `SPRING` stiffer and bouncier, `MOVE` = Material 3 emphasized curves for every timed move | Owner: "not energetic enough… rework the easing for the whole video" |
| Sound (v3) | UI foley is transients only (gated: no steady tone > 80 ms); a new hard intro spliced onto v2a | Owner: "no more ding ding dong dong, need one that clicks"; "first 3 seconds… no hook" |
| Hook (v4) | Research-led: "Knock knock" (Bub pressed on the wall of your bubble, eyes on you; "8 billion people. / Same 5 friends."; the film thins to a black spot and tears on the drop) | Owner rejected the opening 3×; `research/research-hooks.md` ranks it first: an abrupt onset, a loom that stops, a face with eye contact, one subject on a quiet field, ≤2 words in 0.3 s |
| Bub (v4) | A 3D character (`gl/bub3d.js`): the hero film + haze/rim/edge, eyes on a head that turns, squash along any axis | Owner: "the bubble is also part of the universe… now just feel like detached" |
| Search (v4) | Two nos and a yes, plus a scan; one bar inserted in the score (`splice_score.py --insert 22`) | Acting beats need ~1 s each; the bar was chosen by measuring which repeats cleanly (0.84 correlation) |
| Foam (v4) | A Vogel-spiral power-diagram foam, 240 cells on a doubling clock (`score.js GROW`), 48 faces | Owner: "more and more and more growing bubble… need more profile pics" |
| Hook copy (v5) | "How to" / "make more" / "friends", one line per knock (0, 0.25, 0.5 s); "friends" glides into the name on the drop | Owner: "8 billion people, that's not really a nice hook… start with 'how to make more friends'"; the viewer knows the topic by 0.5 s and gets the answer on the drop |
| Hook length (v6) | One bar: knocks at 0 / 0.25 / 0.5 s, a glance, one push into a black spot, a tremble, the pop on the drop at 2.0 s; the second smack is gone | Owner: "maximum 2 seconds … attention span is like 2 seconds". The intro's two bars measured alike (−15.4 / −15.3 dB, last beats correlating 0.80), so bar 1 leads into the drop |
| Cast (v6) | Hana (26, Korean) and Sofia (28, Spanish) as the leads; 30 friends aged 24–32 from 28 countries in comfortable-life settings, still unposed and average-looking | The owner's casting brief on v5: young, middle- to high-income, international, for the audience the ads target |
| Circle of friends (v5) | 26 separate soap bubbles round the two of you, ≥ 28 px of air between any two, none under 56 px radius on screen, edge ones running off-frame; no shared walls | Owner on v4's foam: "有点密集恐惧". Packed small cells are the high-contrast, mid-spatial-frequency clusters that trypophobic images share (Cole & Wilkins 2013) |
| Priorities (v4) | Learning replaces Faith | Malaysia's Content Code §8.7 (religion in ads); the violet read as "AI purple" |
| How it works | One phone for steps 1–4, a plain caption above it, the badge rolling 1 → 4 | The owner's note: show the value and the UI flow; a stranger has zero context |
| Mark | Two circles sharing one flat wall (a double bubble) | Two people, one conversation; Plateau-exact |
| Format | Vertical; caption text in y 288–520, everything used in the app in y 620–1248 | Owner asked for phone vertical; the overlays of TikTok/Reels/Shorts, measured |
| Voice | None; words are chat bubbles and big type | Reads sound-off; the chat is the voice |
| Dating codes | None: no hearts, no blurred photos, no clock, no "match" | Tinder's 2022 Blind Date shares the mechanic; show friendship positively |
| People | Ordinary, casual iPhone snapshots (owner's rule) | Real users, not models |
| Copy | Site-free, research-led; "find your people" and "like-minded" kept off screen | The category's worn words |
| Score | Sunlit disco-funk, marimba/vibraphone hook, measured key (t1 came back A major; foley transposed −3) | "The conversation is the song" |
| Chinese face | Noto Sans SC (the Source Han Sans design, SIL OFL), variable 100–900, from Fontsource's 101 unicode-range slices; only the slices holding the cut's characters load, before the first frame | Owner: "font must be great". A great Chinese sans that may ship in a public repo; every weight the film asks for (UI 500–750, display 790–820) is a real cut. A character no slice covers throws instead of falling back to a system font |
| Chinese setting | Latin and digits keep Bricolage Grotesque / Figtree; Han follows in the stack, after the emoji face (Noto Sans SC carries monochrome emoji of its own); lines centred on their ink; Han display leading 1.14; full-width punctuation, "!!" and "??" half-width in casual chat | Han ink rises 0.81–0.87 em against 0.70 for a capital (measured with fontTools at wght 800), and its ！ ？ 。 ， sit at the left of a whole em (blank half-ems): Latin metrics would collide and mis-centre |
| Chinese copy | Adapted, not translated: 三观一致 (shares your values), 志同道合 (like-minded, an idiom), 聊得来 (we click), 纯友谊 (friendship, said positively), 圈子 (the social sense of "bubble"), TA (the gender-neutral pronoun) | The viewer's own idiom, as the English uses the viewer's own words; the full table is in `STORYBOARD.md` § The Chinese cut |
| The brand in Chinese | Latin: almost / friends.ai, Bub, the AI tag and the "almost → friends" punchline; the hero word 朋友 glides into the name and flips into "friends" (a split-flap, 0.16 s, its own click) | The brand is one wordmark in every market; the flip keeps v5's carry (the word you came for becomes the name) and shows the name's meaning |
| Designed hits (v6 中文) | The jump gate lists the knocks (0.25, 0.5 s) and the day flips (36.25, 38.25 s: the sky turns to the next dawn on a tick, with an air swell into it) in `--allow`, and prints near misses | They had passed unlisted by a hair (11.8–11.9 against 12); the Chinese cut's denser 第 N 天 label tipped them to 12.1–12.3 |
| Chinese reading guide | 0.23 s a Han character (260 a minute) on top of the 0.5 s to find the line; Latin words inside count as words | Native readers' maximum reading speed for Chinese, 259.5 ± 38.2 characters/min (Wang, Lin, Guo et al. 2019, PMC6456801), as conservative as the English 160 wpm |

## Measured quality (the released masters)

| Check | Result |
|---|---|
| Format | 3,960 frames, 1080×1920, 60 fps, bt709; 16 sub-samples per frame; H.264 CRF 14, AAC 320 kb/s (58 MB). Web: two-pass 6 Mb/s, AAC 192 kb/s (49 MB) |
| Frame gate (flips, dips, drops, blown whites) | Pass |
| Jump gate (unplanned cuts) | Pass: the only jump is the designed hit of the third knock (0.52 s) |
| Reading (advisory) | 77 strings timed. The hook's lines hold still for 1.4 s (guide 1.25 s); "Hana, 26" and "Sofia, 28" hold for 4.3 s. 5 flags, all the Pick 3 counter and the step badge's digit during the fast taps (designed) |
| Loudness | Master MP4: −14.0 LUFS, −1.0 dBTP, LRA 4.1 LU. Web: −14.1 LUFS, −1.3 dBTP |
| Foley gates | Tonal: no steady tone over 43 ms across 193 cues. Quiet: 48.00–49.45 s is digital silence (the breath before their lock opens) |
| Hits | The pop at 2.0 s lands +12.9 dB over the 0.4 s before it; the drop after the unlock (50.0 s) +32.7 dB over the silence |
| 4K master | 3,960 frames, 2160×3840, 60 fps, bt709; 16 sub-samples; H.264 CRF 16, AAC 320 kb/s (110 MB). Frame gate pass; jump gate pass (the designed knock); −14.0 LUFS, −1.0 dBTP, LRA 4.1 LU; the release's copy matches the local file (SHA-256) |
| Chinese master (中文) | 3,960 frames, 1080×1920, 60 fps, bt709; 16 sub-samples; H.264 CRF 14, AAC 320 kb/s (58 MB). Web: two-pass 6 Mb/s, AAC 192 kb/s (49 MB) |
| Chinese gates | Frame gate pass. Jump gate pass with only the designed hits (the knocks, the two day flips) and no near misses. Reading (advisory): 76 strings, 8 flags: the English cut's 5 (the Pick 3 counter and the badge), the two candidate labels 财富第一 and 健康第一 (held 1.1 s for 4 characters), and the 我也是!! burst, which echoes the chat line on screen |
| Chinese loudness | Master −14.0 LUFS, −1.0 dBTP, LRA 4.2 LU; web −14.1 LUFS, −1.1 dBTP. Foley: tonal gate pass over 191 cues; the breath (48.00–49.45 s) digital silence |

## Spend

| Service | What | Measured |
|---|---|---|
| Higgsfield (GPT Image 2) | 8 portraits (v1), 40 (v4), 34 (v6, 32 used), one 2k upscale (v6) | 52 + 140 + 128.5 + 2 = 322.5 credits (balance 2,140.41 after) |
| ElevenLabs (music) | 8 takes: t1, t2, v2a, v2b, v3a–d; v4–v6 re-used them (one bar inserted, one cut) | v3's four takes: 7,212 credits; the others were not metered one by one |
| The Chinese cut | Copy, type and sound made in code; Noto Sans SC is open source | No spend |

## Bugs → root cause → prevention
| Symptom | Root cause | Fix | Prevention |
|---|---|---|---|
| Render hung 300 s on a scene error | A scene's `init` threw before `__ready`; the renderer only waited | `render.mjs` races `__ready` against the first `pageerror` | Kept (fails at boot, prints the error) |
| Black sky behind the hook's 3D bubble | The 3D scene never added `makeBackdrop()`, so the UNDER layer (sky, chat) was covered | Add the backdrop | Every 3D scene that should show UNDER adds `env.makeBackdrop()` (comment in `engine.js`) |
| Emoji blank, then Apple emoji | Fontsource's Noto Color Emoji is OpenType-SVG, which Chrome does not draw; the fallback was the licensed system font | The COLRv1 build Google Fonts serves to Chrome, in `assets/fonts/` | `fonts.js` registers it from its CSS; the reason is commented |
| Boot error: "Cannot create property 'font' on string" | `chat.js` imported `measure` from `kit.js` (ctx, s, opt) but called it as type.js's (s, opt) | Renamed type.js's to `measureStr` | Two helpers never share a name |
| A muddy grey frost over the 3-day chat | `rgba()` was given an `rgb()` string; `hexRgb` returned NaN silently | That frost was redesigned away | `hexRgb` now throws on anything not hex |
| Your orb read as an eye | Concentric colour blobs, and the arriving chip-bubble sat dead centre | Sector gradient; bubbles fly to their colour's side and dissolve | Judge a frame mid-transition, not only at rest |
| Generations "lost" | `( … & )` subshells died with the launching shell; Higgsfield jobs ran on, music calls never left | Recovered the jobs by ID (`higgsfield generate get`); reran music as a tracked background task | Long jobs run under the tool's `run_in_background`, never a bare `&` |
| The repo `.env` key echoed into the session | `grep -c` on `.env` printed the matching line through the harness | — | Use `grep -q` (or Python) to test for keys; never grep secrets files |
| A dead 7 s on the unlock sheet | The suspense was a held frame | A slow dolly onto their slot, the title leaving, a nervous Bub | Contact sheet one frame a second: identical neighbours flag static stretches |
| Big type cropped at the frame edge during the dolly | The camera zoom pushed the title out slowly | The title leaves as the dolly starts | Check camera moves for text at the frame edge |
| v2 render died at frame ~3000 and left 1.2 GB of lossless slices | `foam.js` called `about()` without importing it; scene code only runs inside its time window, so the boot guard can't see it | Import it | `render.mjs` deletes its slices on any failure; before a full render, take stills across every act |
| A cleanup + fix command did nothing | zsh aborts the whole line when a glob matches nothing (`rm out/slices-*.txt`) | Re-ran with `find … -delete` | Clean up with `find -name … -delete`, never a bare glob |
| The match screen drew over steps 1–2 | A `const` inserted mid-chain turned `else if` into a second `if` in `screen()` | Restored the chain, `const` above it | After editing a dispatcher, stills across every branch it serves |
| "Day 3" never checked for reading time | The gate dropped any string that prefixes another ("Day 3 of 3 · anonymous") | Drop a prefix only when the longer string replaced it | Kept in `check_reading.mjs` (82 → 89 lines timed) |
| v1's four hard cuts passed the frame gate | The luminance gate can't see a cut between equally bright frames | `tools/check_jumps.py`: a frame that changes > 4× its neighbours | Validated: finds v1's cuts at 29.62/32.02/34.02/35.92 s; v2 passes with the designed pop only |
| The app's chips, cards and match line under the platforms' overlays | A phone resting at y 600 puts its lower half below y 1248 | The phone rises per screen (`LIFT`) and fades into the sky above y 610 | Stills with guide lines at y 288 / 620 / 1248 whenever a layout moves |
| New step badge popped over the fading caption; the old caption slid up through the badge | Captions overlapped by 0.05 s and exited 140 px upward | One badge whose digit rolls; words fade with a 34 px lift, gone `CAP_GAP` (0.35 s) before the next | Strip every caption change at 4–5 frame steps |
| The icon-to-phone open looked washed and cluttered | A uniform scale from a square icon to a tall phone, while the name was still leaving and Bub flew behind the phone | `drawLaunch`: a squircle window grows from the icon (iOS), the name leaves first, Bub's dive is the tap | Hand-offs between scenes get their own stills at 0.05–0.1 s steps |
| Frame 0 was a small Bub on an empty sky | The question started at 0.12 s | `HOOK.q0 = −0.1`: the bubble and first word are on frame 0; cues clamp to ≥ 0 and throw before −0.5 s | Judge frame 0 as the scroll-stopper |
| "almost" failed the reading gate and looked muddy over motion | Drawn as ink at 50 % alpha | A solid `C.inkSoft` | Tint type with a solid colour, never alpha |
| Bub vanished in the 3D flight (only its eyes floated) | A clear 3D soap film has almost no contrast on the pale sky | Bub keeps its 2D look, drawn at its projected 3D spot | Judge a 3D character against the real background at film scale before building a sequence on it |
| The universe washed out after the scan | Non-matches faded to 42 % and grey: five of six people disappeared | They stay (72 %, softer, smaller); matches swell and glow | A filter shows who matches, it never deletes the others |
| The cut back from the one jumped (twice) | The 2D orb didn't fill the frame, and the phone's caption fade hid its top | Overfill the orb at the cut (14×), release the fade at deep zoom, a 0.16 s bloom to near white | The jump gate caught both; run it on every animatic |
| The audio-reference chunk didn't keep v2a | ElevenLabs re-renders a reference chunk (correlation 0.26–0.80) | Splice the original after the seam (`tools/splice_score.py`, bit-identical after 4.0 s) | Measure a take against what it should preserve before using it |
| OpenCV's Haar cascades missing (`AttributeError: CascadeClassifier`) | OpenCV 5 dropped the legacy cascades | YuNet (`cv2.FaceDetectorYN`) with opencv_zoo's model kept out of the repo | `tools/face_crops.py` names the model it needs and flags any face it can't find on its check sheet |
| A colourful option passed to the universe was ignored | `universe()` is a singleton: the first scene to call it wins, with its own options | One shared cast (`UNIVERSE_CAST` in `ui/convo.js`) for every caller | Shared GPU state gets one source of truth; `hideHeroes()` resets the crowd's interaction uniforms each frame |
| 3D Bub: one eye at the silhouette, unreadable | Its head turned fully toward what it looked at | A `faceMin` clamp keeps the face at least partly toward the lens | Judge a character's face from the camera, not from its gaze direction |
| A huge blurry Bub swept past the lens between two checks | The camera flew on while Bub still hovered at the first candidate | Bub is kept ≥ 2.3 units ahead of the lens, and leaves earlier | Strips at 0.05 s through every move between beats |
| A four-pane reflection read as a certain OS logo | The studio's key window had a cross of mullions | A softbox highlight | Look at specular shapes at hero size for accidental brand marks |
| Bub's rim invisible on the white sky | The rim's colour was added light: added light on white stays white | The rim is laid over the sky as coverage (saturated film colour, alpha) | Test glass and film looks on the brightest background they meet |
| The dive's colour wipe failed the frame gate (a dip) and a jump | A full-frame blue then coral fill; the camera then sat inside the coral bubble | A bright film shimmer only; the mark hides at the wall | Full-frame colour changes go through the frame and jump gates before anyone sees them |
| The hook's words failed the reading gate while legible | They bowed with the wall: any offset > 2 px counts as motion | They ride the ripples only, then settle | Effects on type must settle; check with the reading gate |
| A designed hit failed the jump gate | `--allow 2.52` (space, not =) was silently ignored | The gate now refuses options without `=` | Tools fail loudly on arguments they don't understand |
| The v4 foam read as trypophobic (owner: "有点密集恐惧") | "More and more" was solved by count alone: 240 cells packed into a power diagram, ending ~30 px faces with white walls — a dense cluster of small, high-contrast, repeating shapes | 26 separate bubbles with air between them, big faces, no walls (`foam.js`) | `foam.js` throws at load if the layout places fewer than `GROW.n` friends, or any face under `MIN_R` (56 px) on screen at the widest, or any two closer than `MIN_AIR`; judge density on the last frame of a growth, not the first |
| `config.js` lost its BARS line (it read `X`) | A `sed` meant only to clear the way for a Python edit replaced the line with a placeholder; its `.` also matched the apostrophes | Restored the line | Edit source with Python replacements that assert their match count; no `sed -i` on code |
| One portrait failed (HTTP 503) and the retry ran at the wrong resolution | `gen_people.py` skips nothing on failure, and the second batch (1k) picked up the lead the first batch (2k) had failed | Kept the 1k take (it reads well); the 4K master upscales it | Retry failed keys in their own batch with their own `--res` |
| 10 of 32 portraits refused (`rate_limit_reached`) | Two batches ran side by side (8 + 3 jobs); the creator plan runs 8 at once and refuses the rest | Re-ran the 10 at 6 at a time | `gen_people.py` retries rate limits and 503s with a backoff; `--par` documents the plan's limit across all batches |
| Hana's face crop centred on her mother behind her | YuNet on the full 2k image missed the big face in front and found the small one behind | Detect on a ≤ 1024 px copy and scale the box back (`face_crops.py`) | The crop sheet is checked after every run; a lead's crop is judged before any render |
| The step badge sat on top of every Chinese caption | Captions were placed by a baseline tuned for Latin capitals (0.70 em); Han ink rises 0.81–0.87 em | Chinese captions hang from the badge by their ink, led at 1.14 | `Line` measures Han lines by their ink (ascent, centre, width); judge a new script's lines against what sits above and below them |
| 朋友 (300 px) ran into Bub; 聊 3 天 ran over the phone's island | The English sizes and baselines were reused for a script that fills the em box | The hook re-spaced from measured metrics (128 / 128 / 248 px, baselines 330 / 478 / 733); captions at 100 px | Per-cut sizes and baselines live in the copy table beside the words that need them |
| A chat bubble broke the idiom 雷打不动 in two | Greedy wrapping broke where the width ran out, between 雷打 and 不动 | A break the writer chose (`\n`) after the comma | Chinese wraps between ICU words with kinsoku; a writer's break overrides; read every wrapped bubble |
| The chat thread jumped a bubble's height in one frame whenever a message arrived | `conversation()` added a new message's whole height to the scroll at once. On the English master it measured 9.7 at 40.0 s, under the gate's 12, so it passed unseen; the Chinese master measured 12.2 and failed | The scroll eases over 0.3 s (`MOVE.go`), as iMessage does | `check_jumps.py` prints near misses (> 9 and 3× the neighbours) without failing; the released English masters predate the fix and show the old snap |
| Two renders of the same code differed in 3 of 32 frames | Canvas text anti-aliasing: ≤ 1 level in ≤ 60 pixels, run to run | — (not a bug) | An "unchanged" check compares against a second render of the same code, not against zero |

## Next (after the release)

- The Chinese cut's ≤ 60 s and ~30 s versions with the English ones; the copy table already carries every line.
- A ≤ 60 s cut for TikTok ads (TikTok caps ads at 60 s) and a ~30 s cut for paid social: the hook, the search, SAME!!,
  the unlock, the circle of friends.
- An A/B hook cell: the research's runner-up, "Snow globe" (five friends trapped in one bubble that Bub pops).
- A true musical hit for the mark at 62 s (inpaint the score's outro; today the foley carries it), and generated SFX for
  the latch, the pop body and the time-lapse air (`research/research-sound.md` §4.5).
- Before launch, not the film: TikTok's AI-generated-content label for the portraits; expect the platforms to class the
  app as dating; a trademark search for "almost friends".
