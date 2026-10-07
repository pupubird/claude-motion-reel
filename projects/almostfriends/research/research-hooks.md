# Friend-app film: hook research (the first 4 seconds)

**Prepared:** 2026-10-07 · **For:** the opening (0–4.0 s) of reel 06, *almost friends* (almostfriends.ai): 66 s, 9:16,
1080×1920, 60 fps, 120 BPM, big drop at exactly 4.0 s, rendered in code (three.js + Canvas 2D + GLSL soap film, a 3D
bubble universe, Bub, still portraits, kinetic type). The owner rejected the current opening three times ("weak", "no
hook", "must be as fancy and attention hooking as possible"). This report goes deeper than `research-vibe.md` §3.2
and leads with ranked lines, three shot-listed hook concepts and an avoid list (§1).

**Ground rules.** Every claim carries a link. No label means a researcher opened the page or PDF and saw the wording.
*(snippet)* means search-result text only; *(secondary)* means a third party reports it; *(vendor)* means the source
sells creative, analytics or media. The numbers the recommendations rest on were re-checked against the primary page
or PDF by the report author on 2026-10-07: System1 × TikTok's asset table, Meta-Gallup's Malaysia rows, Meta's "Science
of the Hook", Meta's personal-attributes rule, TikTok's AIGC and fake-button rules, Google's dating-policy wording,
Vidmob × TikTok, TikTok × CreatorIQ, TikTok's "50% in 2 s", Nelson-Field's decay figures, Elsen et al. 2016, Abrams &
Christ 2003 and Franconeri & Simons 2003. Evidence grades where they help: **A** peer-reviewed; **B** platform or
research-firm study with a disclosed sample; **C** platform or vendor claim with no stated method; **D** anecdote,
opinion or a single case.

**Limits.**
- The session's shared web-search quota ran out midway. Not reached: It's Nice That, The Drum and Adweek trend pieces;
  most studios on the brief's list (ManvsMachine, Tendril, Oddfellows, Ordinary Folk, Gunner, ILLO, Hornet, Psyop);
  Meta's ad-quality help body; ASA Malaysia's code text. Each gap is named where it matters.
- AppKittie returned `HTTP 401 "Invalid or missing API key"` on the first call (no credits spent; the market research
  hit the same error), so competitor evidence comes from the public Meta Ad Library: 67 video ads whose first 3 s were
  pulled frame by frame (§8).
- TikTok Creative Center's Top Ads is login-gated; there is no TikTok-side competitor evidence.
- No source tests a code-rendered 3D mascot opening against a human one. That question stays open (§1.5).

---

## 0. The short version

**Why the current opening fails (evidence, not taste).**
1. **The decision is over before the drop.** Attention drops "from 80% of audience in second 1, to 50% by second 2 and
   20% by second 3" (Karen Nelson-Field, 2025); TikTok puts "50% of the impact" in the first 2 s; Instagram's skip rate
   counts skips "during those first 3 seconds". The drop at 4.0 s is the reward, not the hook (§4, §5).
2. **Frame 0 has no single subject.** A drift through hundreds of similar orbs is ongoing motion, and "motion per se
   does not automatically attract attention… the onset of motion does" (Abrams & Christ 2003). Bub is about 200 px
   across (`src/scenes/hook.js`: `r: 104`), smaller than the foreground orbs: a bubble hidden among bubbles, the
   worst case for visual search (§3, §9).
3. **The line opens no gap.** "When did you last make a new friend?" asks for an answer the viewer already holds, and
   curiosity needs a gap the viewer knows they have (Loewenstein 1994). The on-screen reply "uhh… school? 😅" closes
   the loop in the same beat. At 8 words it is also about three times the first second's reading budget (§6, §9).
4. **It wears the AI-brand look.** Glowing lilac and violet orbs on a soft gradient (the violet is the "Faith"
   priority, #8C5CF6) are what commentators now call "generic AI sauce" (anecdotal, §7).

**What the first 4 s must do.**
- **0.0 s:** one big local event that *starts* (an impact, a pop-in or an approach), near the centre, with a face
  whose eyes snap to the viewer, a sound hit, and at most 2 words.
- **By ~1 s:** one big line of 2–4 words, placed where the face looks.
- **By ~2 s:** the whole hook line read and the topic (friends) unmistakable.
- **2–4 s:** a new event every 0.5–1 s, and a visible anticipation (something about to burst) that pays off exactly
  on the 4.0 s drop.
- **Brand:** from frame 0 as a *character* (Bub), never as a logo card. In the first 2 s a bare logo cost −30% in
  brand-awareness lift and a brand font −33%; a brand character added +57% and a sonic asset +191% (System1 ×
  TikTok, 2025).
- **Background:** quiet and homogeneous; colour and contrast reserved for the hero.

**The line.** Keep **"8 billion people. Same 5 friends."** It ranks first of the five candidates (§1.1):
- a paradox with numbers, and no question to answer "no" to;
- no personal-attribute risk;
- a verified figure (8.2 billion in 2024, UN);
- a picture the film already owns: the bubble universe against your bubble.

It also opens a copy arc the film already closes: *same 5 friends* → "SAME!!" → "Same values. New friends."

**The concepts.**
- **C1 "Knock knock" (build this):** Bub smacks into the screen from outside your bubble on frame 0, eyes on you;
  "8 billion people." / "Same 5 friends."; Bub pushes until the film thins to black and bursts on the 4.0 drop.
- **C2 "Snow globe" (runner-up, and the natural A/B cell):** a casual group selfie of five Malaysian friends trapped
  in one bubble; Bub pops it on the drop. This is the human-faces version.
- **C3 "Before you see them":** the mechanic-first option, with the most category white space and the most risk.

Shot lists are in §1.3.

**The "planet of people" prototype: strong beats, weak device.** Keep the line, the big → small structure, the faces,
and Bub's poke into the pop on 4.0. Change the Earth-zoom dive: it is a one-tap CapCut template and the 2023
Midjourney AI-zoom look, and its frame 0 is a texture of equal orbs with no face until ~2 s. The fixes (§1.0):
- make the planet one object rushing at the lens on frame 0;
- replace the zoom with one hard snap by 1.0 s;
- land big on five faces looking into the lens;
- save the full colour planet for after the pop.

Fixed like this, it becomes the best version of C2 and C1's natural A/B partner.

**Decisions needed (owner).**
1. C1 as the build and C2 as the test cell?
2. For C2, a new casual group-selfie still (Higgsfield GPT Image 2, ≈6.5 credits).
3. Three flags outside the hook that affect the whole film (§10.2):
   - the "🙏 Faith" chip vs Malaysia's Content Code §8.7;
   - TikTok AIGC labelling for the AI portraits;
   - dating classification on Google, Meta and TikTok.

---

## 1. Recommendations

### 1.0 Your "planet of people" prototype: verdict and what to change

The prototype: frame 0 is a world made of thousands of iridescent bubbles, one per person; an Earth-zoom dives into
it under "8 billion people."; it snaps to a tiny bubble holding you and five friend faces ("Same 5 friends."); Bub
pokes it and it pops on the 4.0 drop.

**Verdict: a strong structure carried by a weak, template-coded device.** The beats are right. The Earth-zoom dive
and the orb-planet frame 0 are the weak parts.

**What the evidence supports (keep).**
- **The line.** "8 billion people. / Same 5 friends." is the best-evidenced of the candidates (§1.1).
- **Big → small, told in pictures.** Words and picture agree at every beat (the owner's zero-context rule; Elsen
  2016's "upfront" effect).
- **Diving *toward* the planet is a loom,** the kind of motion that does capture attention (Franconeri & Simons 2003;
  Lin et al. 2008).
- **Human faces.** The faces of you and five friends are the opening element with the most platform data: "+50%"
  hooking power (TikTok × CreatorIQ) and "1.7x" for everyday people (Vidmob).
- **Bub's poke and the pop on the drop.** The anticipation pays off exactly on 4.0, and Bub, the brand character, is
  the agent (System1: a character in the first 2 s rated +57%).

**What the evidence says is weak or cliché (change it).**
1. **The Earth-zoom is a template.** A continuous zoom between a planet and a person is now one-tap grammar.
   - CapCut's "earth zoom out" template shows "41.54K uses", and CapCut's own guide describes the move: it "starts
     with a close-up scene, often a person or everyday moment, then dramatically zooms out to reveal the Earth from
     space" ([CapCut](https://www.capcut.com/template-detail/earth-zoom-out/7526236384592465205)).
   - Midjourney's "Zoom Out" (June 2023) made the endless zoom an AI signature
     ([BGR](https://www.bgr.com/tech/midjourney-ai-photo-editor-adds-mind-boggling-zoom-out-feature-you-need-to-see-to-believe)).
   - Diving *in* rather than out is the same grammar played backwards. No brand ad using it with reported results was
     found.
2. **Frame 0 is a texture, not a subject.** A planet built from thousands of iridescent orbs is again a dense field of
   equal elements: high clutter ([Rosenholtz et al. 2007](https://doi.org/10.1167/7.2.17)), no face, no eyes and
   nothing that *starts*. The faces arrive only at the snap (~1.5–2 s), by which time half the audience has gone
   (Nelson-Field: 50% left by second 2).
3. **An iridescent-orb planet is the AI look.** "gradients + glowing orbs" is read as generic AI branding (anecdotal,
   §7). An orb planet plus a continuous zoom matches the silhouette of the 2023–26 AI zoom videos, which is the "generic
   3D AI slop" read the owner has already rejected on another reel.
4. **"Tiny" is the wrong size for the payoff.** Faces and text win attention in proportion to their size (Pieters &
   Wedel 2004), and small detail among clutter isn't recognised ("Crowding, the inability to recognize objects in
   clutter", [Whitney & Levi 2011](https://doi.org/10.1016/j.tics.2011.02.005)). Six small faces in a tiny bubble won't
   read on a phone.
5. **The hook lands late.** If the dive fills 0–2 s, "Same 5 friends." is read at about 2–2.5 s, after the point where
   only half the viewers are left.

**What I'd change (your beats kept; the device fixed).**
1. **Frame 0: the planet as *one* object, already coming at you.** A single small, crisp sphere of bubbles, centred on
   a clean daylight sky (a singleton, not a screen-filling field), rushing toward the lens on frame 0 (an onset plus a
   collision-course loom), with "8 billion" slammed in on frame 0. Desaturate the orbs to white, sky and peach, with
   no lilac; colour arrives after the pop.
2. **Replace the continuous zoom with one hard snap by 1.0 s.** One whip-dive (speed ramp plus motion blur, 0.5–1.0 s)
   punches through 2–3 bubble layers on hidden cuts and *lands* on your bubble on beat 3. It reads as an impossible
   camera move, not a template zoom.
3. **Land big, with eyes.**
   - Your bubble fills ~70% of the width.
   - Inside it, a casual group selfie whose faces are large (≥ ~150 px each) and look into the lens.
   - "Same 5 friends." slams in at 1.0–1.25 s.
   - Show five faces, not six: "you" are the one holding the phone, so the line and the picture count the same.
4. **Spend 2–4 s on Bub and the anticipation.** Bub zips in (2.0), makes eye contact (2.25), looks at the bubble with
   intent (2.5) and winds up (3.0). The film thins to a black spot (3.0–3.5), a 0.5× ramp runs into 3.5, and it pops
   on 4.0.
5. **Make the planet the payoff, too.** After the pop the camera blasts back out and the planet reappears *in colour*
   (everyone's values), with the five friend orbs flying beside you. The scale reveal is the reward, not the opener.

| Time | Picture and camera | Text | Sound |
|---|---|---|---|
| **0.00** | A small, crisp planet of pale bubbles rushes at the lens on a daylight sky; impact shake | "8 billion" | Downbeat; a hit on the impact |
| 0.25 | The planet fills a third of the frame and keeps coming | "people." | Tick |
| 0.50–1.00 | Whip-dive: punch through 2–3 bubble layers (speed ramp, motion blur) and land hard on one bubble | — | A short **tonal** rising sweep |
| **1.00** | Your bubble, big; a group selfie inside, five faces looking into the lens | "Same 5 friends." | Landing *thwup* |
| 1.50 | The wobble settles; light glints sweep the film | Hold | — |
| **2.00** | Bub zips out of the planet and skids to a stop beside the bubble | Hold | Zip; a stop *boing* |
| 2.50 | Bub looks at you, then at the bubble, with intent | Hold | Ticks on the eye darts |
| 3.00 | Wind-up; the film thins to a black spot | Hold | Tonal riser |
| 3.50 | 0.5× slow motion; contact | Text strains | A breath |
| **4.00** | **POP.** The five friend orbs fly out with you; the camera blasts back to the planet, now in colour; droplets → mark → name | → "almost / friends.ai" | The drop and a wet pop |

**How it compares.** Fixed this way, the planet version is the best form of C2 "Snow globe": it replaces the bubble
blown from a wand, and its frame 0 is far stronger than v3's (one object, an onset, a loom). It still has no face or
eye contact before 1.0 s, so C1 "Knock knock" stays my first choice for frame 0. The two make a clean A/B test: a
mascot's eyes at 0 s against human faces at 1 s plus a scale reveal.

### 1.1 The five candidate lines, ranked

| Rank | Line | Words | Verdict | Why |
|---|---|---|---|---|
| **1** | **"8 billion people. Same 5 friends."** | 6 | **Use: the hook line** | A paradox (huge number vs tiny number): moderate, relevant incongruity, Loewenstein's "violation of expectations". It implies "you" without saying it ("you" showed no click lift in 24,333 tests) and carries no personal-attribute risk. Its tone is wry and slightly sad, the profile that lifts clicks, and it turns to joy on the drop (Teixeira 2012). Two 3-word beats read in about 2 s, muted. "8 billion" is verified and conservative, and "5" is obvious hyperbole under §4.4(c)(iii). The picture is already built: the universe of orbs against one bubble. It opens the copy arc *same 5 friends* → "SAME!!" (32 s) → "Same values. New friends." (56 s). **Risks:** it can sting people who love their five, so the turn must *add* friends, not replace them. The "8 billion people…" construction is common in captions (untested). |
| **2** | "Same 5 friends since school?" | 5 | Use as a **statement**: "Same 5 friends since school." | "Since school" is the most specific, recognisable detail (47% met a close friend at school; friendship networks shrink through adulthood). As a yes/no question it lets every "no" leave, and question formats read more negatively (Scacco & Muddiman 2016). The C2 line. |
| **3** | "Your next best friend is a stranger." | 7 | Use with care, as a **second beat**, not the opener | A bold claim and a paradox that opens a loop ("which stranger?"), with a hopeful valence. But "stranger" next to an anonymous-chat app can read as unsafe, and "best friend" edges toward an outcome promise (TikTok: "must not promise or exaggerate results"). Better rewritten (10.2). |
| **4** | "When did you last make a new friend?" | 8 | **Retire as the hook**; keep for mid-film | Factually the safest line (no claim) and low policy risk, but a self-report question opens no gap. The on-screen reply closed the loop, 8 words exceed the first-second budget, and it has failed with the owner three times. |
| **5** | "Making friends as an adult is hard." | 7 | **Avoid** | The category's most used opener (12 of 57 competitor ads open on adult-friendship difficulty), a downbeat complaint at frame 0, no gap, and only 31% of US adults say it (YouGov 2019). |

### 1.2 Better lines (7 words or fewer, readable muted), ranked

| Rank | Line | Words | Mechanism | Use |
|---|---|---|---|---|
| 1 | **"8 billion people. Same group chat."** | 6 | Same paradox, funnier (joy, not sad), and set in the product's own world (chat). "Same" plants the "SAME!!" callback. | The A/B partner of the original line. It needs one more inference step ("group chat" = your friends), so test it rather than assume it. |
| 2 | **"Same 5 friends since school."** | 5 | Recognition as a statement, so there is no "no" exit | C2's opener |
| 3 | **"Your next best friend hasn't met you."** | 7 | Keeps the hope and the open loop of the "stranger" line without the safety word | A 2–4 s second beat, or the end card |
| 4 | **"Make a friend before you see them."** | 7 | Mechanic-first curiosity gap; values, anonymity and unlock are 0 of 57 in the category | C3's opener. Risks: catfish or dating-reveal reading. |
| 5 | "Friends first. Faces later." | 4 | The mechanic as a 4-word paradox, the fastest read on this list | Test only: "faces later" can read as a dating reveal (§10) |
| 6 | "8 billion people. Same geng since school." | 7 | The local twist: *geng* is everyday Malaysian for one's crew, and 0 of 19 competitor creatives in MY/SG were local | Needs a native-speaker check; untested |
| 7 | "8 billion people outside your bubble." | 6 | Plain idiom that ties straight to the end tagline | Weaker paradox; a safe fallback |

---
### 1.3 Three hook concepts for 0–4.0 s

All three keep what the owner asked for: frame 0 already moving, a hit and words on frame 0, the music full from the
first beat, and the drop at exactly 4.0 s as the payoff. They also follow the §9 rules: one singleton hero, eyes on
the viewer, ≤2 words in the first 0.3 s, a new event every 0.5–1 s, and a quiet background. Layout uses the strict safe
band (y 288–1248; titles ≤696 px wide above y 840; `research-vibe.md` §3.1). After 4.0 s each concept hands over to
the existing name beat (4.05 droplets → mark, 4.3 "almost / friends.ai", 5.1 the value line). That makes 0–6 s a
complete bumper for Snap and 6-second placements.

---

#### Concept 1 (rank 1): "Knock knock" — Bub at the wall of your bubble

**Line:** "8 billion people." / "Same 5 friends."

**Frame 0 as a still (the scroll-stopper).** The screen is the wall of *your* bubble, seen from inside. Bub has just
smacked into it from outside:
- Bub's face is squashed flat against the film, cheeks spread, about 560 px wide and centred just above the middle
  (y ≈ 1010).
- A ring of ripples races out from the contact patch, and the film flares with interference colour around it: sky
  blue, magenta and gold, no lilac.
- Bub's two huge eyes, with big pupils and baby-schema proportions, look straight into the lens.
- Behind Bub, outside, a pale sea of thousands of small bubbles runs to the horizon: soft-focused, desaturated (white,
  sky and peach only) and still.
- Above, in ink, the word **"8 billion"** has just slammed in, slightly bent by the film.

The image reads in one glance as a cute character pressed against your screen, with a big number.

**The open loop.**
- **The words:** a paradox. "8 billion people. Same 5 friends." asks, without a question mark: so how do I meet the
  others? The name, the value line and the steps answer it.
- **The picture:** a physical loop. Bub is trying to get *in*: will the wall break? The film visibly thins (colours
  slide, then a black spot forms, as real soap film does before it bursts) and it breaks exactly on the 4.0 drop.

| Time | Picture | Camera | Text | Sound |
|---|---|---|---|---|
| **0.00 (frame 0)** | Impact. Bub at maximum squash on the wall; the ripple ring starts; Bub's eyes snap open onto the viewer within 6 frames. Quiet, defocused bubble sea behind. | Locked off, close and slightly wide (cartoon squash); a 4-frame impact shake | **"8 billion"** slams in (2 words), ink #0B1B3F at hero size, y ≈ 300–450, refracted by the wall | Downbeat, music full; a soft rubbery *thwup* on the smack (punchy, not startling); a tiny crisp transient on the eye snap (pip-and-pop) |
| 0.25 | Bub rebounds 5% (stretch) and stays pressed; the ripple ring reaches the frame edge | — | "people." lands; line 1 is complete | 8th-note tick |
| 0.50 | Bub's pupils swing past the viewer out to the sea behind (a gaze cue toward the multitude); the nearest orbs ease into focus | A 2% push-in begins | Hold | Hi-hats |
| 0.75 | Bub's eyes flick to the empty space under line 1, cueing the next words | — | Hold | — |
| **1.00** | Bub's eyes come back to the viewer, lids half-lowered: a deadpan "mm-hm" | Push continues | **"Same 5 friends."** slams in *where Bub just looked* (y ≈ 600–740); the whole line is on screen | A dry *tock* on the slam |
| 1.50 | Bub starts to push. The wall bulges toward the lens around its face (a dome coming at you); as the film thins its colours slide blue → magenta → gold | Push-in speeds up (looming) | Both lines hold and bow slightly with the bulge (type in the scene) | A rubbery stretch creak; a **tonal** riser starts (tones, not white noise) |
| **2.00** (bar 2) | Bub backs off and winds up: anticipation, squashing down with eyes narrowed and determined. The wall springs back with a wobble. | A small pull-back as Bub retreats | Lines wobble with the wall | The pre-drop build |
| 2.50 | **Smack #2**, bigger. The bulge reaches for the lens and a dark "black film" spot blooms at the contact point (the film is about to burst). | A sharp push-in plus a 3-frame shake | Hold | A heavier *thwup*; the riser climbs |
| 3.00 | The black spot spreads; Bub's eyes go huge ("here we go"); a few far orbs drift toward the point, as if under pressure | Slow push | Letters begin to stretch toward the bulge | The riser nears its peak |
| 3.50 | Time slows to 0.5× (speed ramp): a micro-tremor in the film; Bub squeezes its eyes shut | Hold still | Text strains | A breath before the drop (the music agent's call) |
| **4.00 — DROP** | **POP.** The film tears open from the black spot (radial hole, thick rim, droplets sprayed toward the lens with motion blur). Bub bursts through toward camera and zips past. The sea snaps into focus and **floods with colour**: people's values, seen once you are outside your bubble. | Ramp back to 1.0×; the camera is blasted out into the universe; **one** flash (≤ 2 frames, not full-frame white) | The type bursts into droplets that slam into the mark (4.05), then "almost / friends.ai" (4.3) | The drop, with a wet *pop* transient on the tear |

**Why it should work.**
- **Frame 0 hits every lab trigger at once:** an abrupt onset, a loom on a collision course that stops short, centre
  placement, a face, direct gaze snapping on, and a singleton on a homogeneous field (§9).
- **The brand is a character from second zero**, satisfying Snap and Google without a logo card. In the first 2 s a
  character rated +57% and a logo −30% (System1).
- **The line has the best evidence** of the candidates (§1.1), and every element is true.
- **The anticipation is physical and honest.** Real soap film does thin, change colour and go black before it bursts
  ([Gigazine](https://gigazine.net/gsc_news/en/20220321-popping-bubble-50000-fps)). That is the "physical truth" which
  separates craft from slop (§7).
- **It is wholly ownable:** no friend app opens on a 3D character that breaks the frame (0 of 57).
- **The frame-break carries the idea:** the wall is literally your bubble.
- **Surprise, then joy:** the smack, then the release and the colour.

**Risks and mitigations.**
- **There is no human face in 0–4 s,** the opening element with the most platform data. This is why C2 exists as the
  test cell.
- **A 3D mascot can read as AI "brainrot" in SEA feeds.** It must be acted like feature animation: anticipation before
  each smack, squash and stretch, eye darts, overlapping action. Physics must be weighty, never floaty.
- **A bubble squashing against a film is cartoon physics,** since real films would merge. That is fine for a
  character, as long as the burst at 4.0 is physically correct.
- **Looming is natively threatening.** Keep the squash soft and the eyes friendly, and let the wall stop Bub.

**What is new in the engine vs v3 (components, not effort):**
1. A **membrane**: a full-frame subdivided plane using the existing thin-film shader (`gl/filmglsl.js`), displaced by
   a contact bulge and ripple rings, with a thickness field that thins near contact and shifts the interference
   colours to a black spot.
2. **Bub squash** against a plane (deform `gl/bub3d.js`), with the 2D eyes drawn on the squashed face and enlarged.
3. A **quiet background mode** for the universe in 0–4 s: desaturated, defocused or hazed, with no priority colours;
   colour floods in at the pop.
4. **Type refracted** through the membrane (render the type to a texture, offset it by the bulge normal).
5. A **radial-hole rupture** of the membrane, reusing the v3 droplet burst (`morph.js`).

Already built and reused: the universe blast-out, the droplets → mark, the name and the value line.

---
#### Concept 2 (rank 2): "Snow globe" — your five friends, trapped in one bubble

**Line:** "Same 5 friends since school." / "8 billion people."

**Frame 0 as a still.** One soap bubble has just been blown:
- It fills about 70% of the frame's width and is still wobbling.
- Trapped inside it like a snow globe is a casual iPhone group selfie of **five ordinary Malaysian friends in their late
  20s**, squeezed round a mamak table: teh tarik, plastic chairs, fluorescent light, a mixed group. All five look into
  the lens, grinning.
- Swirls of interference colour slide over their faces.
- Behind, the same pale, soft sea of bubbles.
- Above, **"Same 5"** has just slammed in.

Five direct gazes and a gesture everyone knows (the group selfie) make "friends" legible before a word is read. The
setting says "made here", which no competitor creative delivered in Malaysia does (§8).

**The open loop.** First recognition ("that's my group"), then the reveal of the 8 billion outside it, then Bub
arriving with intent. The anticipation runs until the pop on the drop.

| Time | Picture | Camera | Text | Sound |
|---|---|---|---|---|
| **0.00** | The bubble snaps free of an off-frame wand and wobbles (a big squash mode), drifting gently toward camera; the selfie glows inside | Locked off; the bubble's own drift is the loom | **"Same 5"** slams in (2 words) | Downbeat, music full; a soft tonal *blup* as the bubble releases |
| 0.25 | The wobble settles; light glints sweep the film | Slow push | "friends" lands | Tick |
| 0.50 | The selfie gains a subtle 2.5D parallax (faces nearer than the table) | Push | "since school." completes the line | — |
| 1.00 | A reflection of the sky slides across the film; the faces stay bright | Push | Hold | — |
| **1.50** | Rack focus: your bubble softens and the sea behind it sharpens into countless bubbles to the horizon | Rack focus plus a slow pull-back (reveal) | **"8 billion people."** slams in | A shimmer swell |
| **2.00** (bar 2) | One bubble streaks out of the sea toward camera (Bub) and skids to a stop beside yours (squash, wobble) | Follow, then settle | Hold | A tonal glide on the zip; a *boing* on the stop |
| 2.50 | Bub looks straight at the viewer (eye contact), then at your bubble, then back with a sly grin | — | Hold | A tiny *tick* on each eye dart |
| 3.00 | Bub winds up (squash, eyes narrowed); the selfie's faces are lit by Bub's reflection | Slow push toward the pair | Hold | Tonal riser |
| 3.50 | 0.5× slow motion: Bub lunges; contact at the bubble's edge | Hold | Text strains | A breath |
| **4.00 — DROP** | **POP.** Your bubble bursts from the contact point. The selfie splits into five portrait orbs, one per friend, that fly *out* with the camera and stay close while new orbs pour in, and the sea floods with colour. Your friends come with you. | Blast out into the universe; one flash | The type bursts into droplets → mark → name | The drop and the pop |

**Why it should work.**
- **Faces from frame 0.** Real-looking people in the first 2 s carry the strongest platform data: "+50%" hooking power
  (TikTok × CreatorIQ) and "1.7x" for everyday people (Vidmob).
- **The category is legible at once** (Elsen 2016).
- **The words and picture say the same thing at each beat,** which is the owner's zero-context rule.
- **It is visibly Malaysian,** which is 0 of 19 in the market.
- **The ending is additive.** The five fly out *with* you, which pays off in the foam at 56 s ("your circle grows").

**Risks and mitigations.**
- **The faces are AI-generated.** TikTok's AIGC label is needed, but it is needed for the whole film anyway (§10.2).
- **A photo in a bubble can look like stock "memories" imagery.** Keep the selfie casual and imperfect, per the owner's
  casting rule (ordinary people, phone snapshots).
- **Popping your friends' bubble could read as losing them.** The five must visibly stay near you after the pop.
- **Continuity.** These five must not reappear later as "new" friends.
- **Less spectacle than C1** in the first second: a bubble drift rather than an impact.

**What is new in the engine:**
1. **One new still:** a casual group selfie of five ordinary Malaysian adults. It would come from Higgsfield GPT Image
   2, the backend this production already uses for portraits, at about 6.5 credits; a real photo with releases also
   works.
2. **The selfie inside a bubble:** a textured plane in the existing bubble mesh, refracted.
3. **Optionally, 2.5D parallax** (needs a depth map).
4. **Five face crops** that become portrait orbs at the pop.

Bub's zip, the burst, the blast-out and the name all exist.

---

#### Concept 3 (rank 3): "Before you see them" — the veil

**Line:** "Make a friend" / "before you see them."

**Frame 0 as a still.** One huge soap bubble, very close. Inside it is a person you can't make out: a warm silhouette
behind thick, swirling bands of gold, teal and magenta. The film itself is the veil, with no blur (blur already means
dating reveals and paywalls in this category; `research-market.md` §0.7). A white chat bubble is punching out through
the film toward the lens, reading **"same!! 😭"**. Above it, **"Make a friend"**.

**The open loop.** Who is in there, and how do you befriend someone you can't see? Steps 1–4 answer the *how*. The
*who* is held until the film's reveal at 50 s, the longest loop of the three.

| Time | Picture | Camera | Text | Sound |
|---|---|---|---|---|
| **0.00** | The chat bubble bursts out through the veil toward camera (an onset plus a loom); the film rings | Locked off | **"Make a"** (2 words) | Downbeat; a crisp pop; a UI *click* |
| 0.25 | The chat bubble settles, hanging between the veil and the lens | — | "friend" | Tick |
| 0.50 | A second veiled bubble drifts in from frame left, at a friendly distance and not a romantic two-shot; Bub floats between them as host | Pull back to a three-shot | "before you see them." | — |
| 1.00 | A quick volley of short chat bubbles between the two: "family first?" / "always 🙌" | — | Hold | Two clicks |
| 1.50 | With each message the veils shimmer brighter, as if thinning | Slow push | Hold | Click |
| **2.00** (bar 2) | A gold key shape (the app's Unlock gold, #FFC93C) forms on each bubble's film | — | Hold | Build |
| 2.50 | One key turns; the other waits; Bub looks at the viewer, then at the waiting key | Slow push to the waiting bubble (the "breath" move the owner praised, in miniature) | Hold | Click, then near-silence |
| 3.00 | Still waiting; the veil trembles | — | Hold | A held riser |
| 3.50 | The second key turns | — | Text strains | Click |
| **4.00 — DROP** | Both bubbles drift together and fuse into a **double bubble** (the brand mark) on the downbeat. The veils burst into colour and the camera blasts back before any face resolves. The mark spins into the name. | Blast back; one flash | → "almost / friends.ai" | The drop |

**Why it could work.** It is the only concept that opens on the product's own mechanic, and anonymity followed by a
mutual unlock is 0 of 57 in the category. "Make a friend" makes the category upfront. The double bubble at 4.0 is a
*logo in context*, rated +182% in the first 2 s (System1), rather than a logo card.

**Why it ranks third.**
- **It reads closest to dating:** two hidden people, a reveal and an "unlock". Dating-policy vocabulary keys on
  exactly this (§10), and the market research warns that hidden-face reveals already mean dating in this category.
- **Spoiler risk.** It spends part of the film's peak (the shared wall, the reveal) in the first 4 s, and the owner
  wants the reveal to be the peak.
- **Its loop is long.** Loewenstein notes people avoid curiosity "in which there would be a long delay before the
  information is received".
- **Less frame-0 spectacle** than C1.

**What is new in the engine:** a thick-film "veil" setting on the bubble shader, two silhouettes, and a 3D key glyph.
Chat bubbles, Bub and the mark (`gl/mark3d.js`) exist.

---
### 1.4 Avoid

1. **Opening on the universe fly-through.** A dense field of equal orbs plus an ongoing camera drift makes no single
   subject, and the onset is lost (§3, §9).
2. **A self-report question as the hook,** and answering it on screen in the same beat.
3. **More than 2 words in the first 0.3 s, or more than about 3 in the first second;** any hook line over 7 words.
4. **A logo, wordmark, written brand name or brand-font card in the first 2 s.** System1 rates them −30%, −16% and −33%;
   centred brand marks invite skips (Teixeira 2010).
5. **The category's stock openers:** "Making friends as an adult is hard", "Just moved?", "I went to dinner with
   strangers…", "POV:", Tinder jokes, and "Not a dating app" as a hook (§8).
6. **Loneliness statistics in a Malaysian ad.** No US numbers (14% vs 15% on the same measure), no health-risk numbers,
   and no "Lonely?" or "No friends?" (a Meta personal-attributes risk).
7. **Fake system UI.** No notification banners or dialogs at ad level; no play, close or "swipe up" elements; nothing
   styled like iMessage, WhatsApp, Instagram or TikTok.
8. **AI-slop signals:**
   - lilac or purple glow and gradient mist;
   - generic gloss and floaty physics;
   - morphing;
   - a continuous infinite zoom;
   - a velocity-edit montage;
   - FOOH.
9. **More than 3 flashes in any second.** No full-frame white or saturated-red flashes, and no startle-loud hits.
10. **Romance cues in the opener:** romantic two-shots, hearts, "match", "date", "singles", or a face reveal framed as
    looks.
11. **Holding the hook for the drop.** The 4.0 s drop is where the hook pays off, not where it starts.
12. **Religion in the values copy** for Malaysian delivery (Content Code §8.7).

### 1.5 How to test, and what to measure

- **Cells.** Run C1 against C2 first. Their line facts match and the heroes differ (a mascot's eyes vs real faces):
  the one question no source settles. Add C3 as a third cell, and optionally swap the line in the winner ("Same 5
  friends" vs "Same group chat"). Meta's own advice is to test "different versions of your Reel, each with a unique
  hook".
- **Hook metrics:**
  - Meta hook rate (3-second plays ÷ impressions): about 25% is the vendor average and ≥30% the vendor "good" bar.
  - Instagram skip rate (first 3 s).
  - TikTok 2-second and 6-second view rates.
  - YouTube Shorts "viewed (vs. swiped away)".
- **Outcome metrics, always alongside:** hold rate (15 s ÷ 3 s), CTR, cost per install and day-7 retention. Hook rate
  alone can mislead: System1 found view-through *negatively* related to conversion lift (−51%, top vs bottom
  quartile). In social apps, the best-retaining hooks got the least spend (AppsFlyer).
- **Wear-out.** The same frame 0 habituates (Rankin et al. 2009). Plan frame-0 variants to rotate, which is cheap
  because the film is code-rendered.

---

## 2. Next actions and decisions

1. **Decide (owner):** C1 "Knock knock" as the build and C2 "Snow globe" as the A/B cell (recommended), or another
   order.
2. **Look-dev before building.** Render C1's frame 0 as a full-resolution still: the squashed Bub, the membrane colour,
   the quiet sea, "8 billion" in place. Show it to the owner before building the 4 s; reel 05's lesson was to agree the
   look on one frame. Do the same for C2 if it is approved.
3. **Brief music and sfx** on the hook's sound map once a concept is chosen:
   - a frame-0 hit;
   - an eye-snap transient;
   - a tonal riser from 1.5 to 3.5 s;
   - a breath at 3.5 s;
   - the pop on 4.0.

   The drop stays at 4.0. Optionally put the three-note Friend cell inside the first 2 s, the sonic-asset slot
   System1 rated +191% (it pays off only with repetition).
4. **Build list for C1:** the membrane shader, Bub's squash, the quiet-universe mode, type refraction and the rupture
   (§1.3). Then run the existing frame, jump and reading gates.
5. **Policy (owner, before launch):**
   - the "🙏 Faith" chip for Malaysia;
   - Google dating certification, Meta dating permission and a TikTok sales rep;
   - TikTok's AIGC label on every cut;
   - a ≤60 s TikTok cut.
6. **Update `STORYBOARD.md` and `src/score.js` `HOOK` anchors** after the decision. That is the team lead's call; this
   report edits nothing else.

---
## 3. Why the current opening reads as "no hook"

v3 as rendered (`out/sf3v`):
- **0.0 s:** a pale sky packed with hundreds of pastel orbs (lilac, coral, sage) at every size, and a white chat bubble
  slamming in with "When".
- **1.2 s:** Bub, about 200 px, perched on "When did you last make a new friend?".
- **2.6 s:** the blue reply "uhh… school? 😅".
- **4.1 s:** the letters scattering in the pop.

| What a stranger mid-scroll sees | What the evidence says |
|---|---|
| Frame 0: a field of hundreds of similar orbs, the camera already drifting | Ongoing motion does not capture attention; the *onset* of motion does ([Abrams & Christ 2003](https://doi.org/10.1111/1467-9280.01458), A). "Translating and looming stimuli… capture attention… receding stimuli do not" ([Franconeri & Simons 2003](https://doi.org/10.3758/BF03194829), A). Colour variability raises clutter, so any new item finds it harder to draw attention ([Rosenholtz et al. 2007](https://doi.org/10.1167/7.2.17), A). In 249 eye-tracked ads, "feature complexity hurts attention to the brand" ([Pieters, Wedel & Batra 2010](https://doi.org/10.1509/jmkg.74.5.048), A). The owner's own rule from reel 03: one striking subject revealed at a new scale, not a dense field of equal elements. |
| Bub at ~200 px among larger orbs | Search difficulty "increases with increased similarity of targets to nontargets" ([Duncan & Humphreys 1989](https://doi.org/10.1037/0033-295X.96.3.433), A). Faces win saccades in 100–110 ms ([Crouzet et al. 2010](https://doi.org/10.1167/10.4.16), A), but a small face among bright distractors has to be found first. |
| A self-report question, then its answer on screen | Curiosity needs "awareness of an information gap" ([Loewenstein 1994](https://www.cmu.edu/dietrich/sds/docs/loewenstein/PsychofCuriosity.pdf), A); the viewer already knows when they last made a friend. Question headlines "elicited more negative reactions and expectations" in a 2,057-adult study ([journalism.co.uk on Scacco & Muddiman 2016](https://www.journalism.co.uk/readers-perceive-question-based-headlines-more-negatively-study-shows/), secondary). The reply closes the loop in the same beat. |
| Eight words at once | Adults read about 238 words a minute, about 4 a second ([Brysbaert 2019](https://doi.org/10.1016/j.jml.2019.104047), A). The first fixation goes to a face ([Cerf et al. 2008](https://authors.library.caltech.edu/40642/)). Realistically 2–3 words land in the first second (§9). |
| The payoff waits for 4.0 s | 80% → 50% → 20% of the audience across seconds 1–3 ([Bizcommunity on Nelson-Field, 2025](https://www.bizcommunity.com/article/karen-nielsen-field-the-attention-deficit-how-to-overcome-it-510470a)); "50% of the impact from a TikTok ad is realized in the first 2 seconds" ([Social Media Today, 2023](https://www.socialmediatoday.com/news/tiktok-shares-new-notes-maximize-ad-effectiveness/694989/), secondary). |
| Lilac and violet glowing orbs | "gradients + glowing orbs + cosmic mist" reads as AI branding ([Indie Hackers, 2026](https://www.indiehackers.com/post/the-ai-purple-problem-why-every-ai-brand-looks-the-same-6cb0aa2a02), D). AI slop is "an excessively polished aesthetic, an overall cleanliness to the image" ([nss magazine, 2026](https://www.nssmag.com/en/lifestyle/47059/slop-ai-visual-design), D). |
| No product or app cue until the name at 4.3 s | "Mystery ads, which suspend conveying what they promote, are evaluated negatively after brief… exposure" ([Elsen, Pieters & Wedel 2016](https://research.tilburguniversity.edu/en/publications/thin-slice-impressions-how-advertising-evaluation-depends-on-expo/), A). The question does name the topic (friends) but not that this is an app. |

**What v3 got right, so keep it:** text on frame 0, motion from frame 0, the music at full energy from the first beat,
a hit on frame 0, Bub as a character, the pop on the drop, and the name by 4.3 s.

---
## 4. Platform guidance on the first 0–3 seconds

| Platform | Source (date) | What it says | Numbers and their quality |
|---|---|---|---|
| Meta | ["The Science of the Hook"](https://www.facebook.com/business/news/the-science-of-the-hook-how-to-supercharge-your-reels-performance?locale=en_US) (15 Dec 2025) | "A hook is the text, visual, and audio components that grab and hold attention in the first few seconds of your video." "Great Reels 'nail the hook' within the first few seconds, which is the moment when viewers instinctively decide whether the Reel is worth watching or not." Three hook types: **Value Promise** "puts the viewer's benefit front and center, making it instantly clear what they'll gain"; **Statement of Intent** is "all about being upfront and telling viewers exactly what they're about to see and learn"; **Question/Invitation** is "designed to spark curiosity and invite viewers to reflect on their own experiences or participate in the conversation". It advises A/B testing versions "each with a unique hook". | "younger audiences consume content at 3X the speed of older"; music or voice-over gives "up to 13% higher incremental conversions". The footnoted sources are not visible (C). The KiwiCo, Castlery and Mapfre results are single-advertiser cases, not a test of hook types (D). Blogs misreport them as Meta "testing every hook type" ([example](https://www.stackmatix.com/blog/meta-video-ads), snippet). |
| Meta (older; the only one with a stated method) | [Facebook IQ, "Capturing attention in feed"](https://www.facebook.com/business/news/insights/capturing-attention-feed-video-creative) (20 Apr 2016) | "it takes only 0.25 seconds of exposure for people to recall mobile feed content at a statistically significant rate"; people spend "1.7 seconds with a piece of content on mobile compared to 2.5 seconds on desktop" | 850+ ads matched to Nielsen Brand Effect studies (B, old). Facebook/Nielsen: "up to 47%" of a video campaign's value in the first 3 s and 74% in the first 10 s ([Facebook, Spanish newsroom, 2016](https://about.fb.com/es/news/2016/02/capta-la-atencion-con-nuevas-funcionalidades-para-anuncios-de-video/), C). |
| Meta Reels | [Meta for Developers](https://developers.facebook.com/blog/post/2024/11/07/unlock-the-power-of-reel-ads/) (7 Nov 2024) | "Over 75% of Reels views on Instagram are sound on." "Put your key messages within the Reels safe zone… this is where you can invite your audience in with a 'hook'". | Reels ads with music and voice-over: "+15-point higher positive response score" ([Meta, 10 Oct 2023](https://www.facebook.com/business/news/reels-ads-updates-performance-features-automated-creative-suitability-solutions), C). |
| Instagram (organic ranking) | Adam Mosseri via [Social Media Today, 22 Jan 2025](https://www.socialmediatoday.com/news/instagram-shares-algorithm-insights-2025/738034/) and [24 Aug 2025](https://www.socialmediatoday.com/news/instagram-adds-retention-insights-reels/758464/) (secondary) | The top signals are "watch time, likes and sends". Reels Insights: "Skip rate is the percentage of views from people who decided to skip your reel during those first 3 seconds." Watch time counts seconds as well as percentage, so long videos are "not penalized" ([25 Feb 2025](https://www.socialmediatoday.com/news/instagram-longer-video-watch-time-versus-completion-rate/740916/)). | The 3-second window is now a measured metric on Instagram. |
| TikTok | [Ads Help, Creative best practices](https://ads.tiktok.com/help/article/creative-best-practices) (updated June 2025) | "Introduce your content proposition in the first 3 seconds for better recall and awareness." "Prioritize your hook in the first 6 seconds to boost engagement and increase watch time." "We recommend displaying 5-10 words per second when using text." "Feature people such as creators, employees, or customers". Use "a DIY or not overly polished style". | — |
| TikTok | [Creative Codes PDF](https://ads.tiktok.com/business/library/Creative_Codes_ENG.pdf) (codes 2022; PDF May 2023) | "The Hook: The first six seconds are vital". "Branding in the first few seconds should be subtle and not compromise the hook". "Go lo-fi (avoid glossiness)". "Movement within an asset catches the user's eye". "Fast scene changes draw users in early". | "90% of ad recall impact is captured within 6 seconds" (2020, no method; C). From a Lumen study: suspense early gives "+16% increase in watch time", surprise "1.7x VTR", opening emotion "1.7x lift in awareness" (C). "73% of users would 'stop and look' at a sound-on TikTok ad" (Kantar 2021; C). |
| TikTok | [Social Media Today, 27 Sep 2023](https://www.socialmediatoday.com/news/tiktok-shares-new-notes-maximize-ad-effectiveness/694989/) (secondary) | "50% of the impact from a TikTok ad is realized in the first 2 seconds, and the first 6 seconds capture 90% cumulative impact on Ad Recall" | No method (C). |
| TikTok | ["9 creative tips"](https://ads.tiktok.com/business/library/Auction_Ads_Creative_Tips.pdf) (21 Oct 2020) | "over 63% of all videos with the highest click-through rate (CTR) highlight their key message or product within the first 3 seconds"; "33% auction ads with the highest VTR break the 4th wall"; "fast-paced tracks above 120 BPM… often drive higher view-through rate" | Shares of top performers with no base rate (C–D). |
| YouTube / Google | [ABCDs](https://business.google.com/en-all/think/future-of-marketing/youtube-video-ad-creative/) (Apr 2022) | "Hook the viewer… Start big!"; "Brand early, often, and richly"; "YouTube is almost entirely a sound-on experience" | ABCDs give "a 30% lift in short-term sales likelihood and a 17% lift in long-term brand contribution". These are Kantar Link AI *predictions* on 11,000 ads, not in-market sales ([Kantar](https://www.kantar.com/north-america/industries/technology-and-telecoms/validating-googles-abcd-framework-with-the-power-of-artificial-intelligence); B–C). |
| YouTube Shorts | [Shorts ABCDs one-sheet](https://services.google.com/fh/files/misc/formarketingshortsabcdsonesheeters.pdf) (undated) | "Announce yourself with audio", "Be unavoidable", "Use tight framing for ease of viewing", "Brand differently by being organic to the story", "Hook them with the benefits that matter most" | Metric: "Viewed (vs. swiped away)", with no official timing advice ([YouTube Help](https://support.google.com/youtube/answer/12942217?co=YOUTUBE._YTVideoType%3Dshorts&hl=en)). |
| Snap | [Snap for Business](https://forbusiness.snapchat.com/blog/video-format-functionality) (5 Jun 2025) | "The first 2 seconds of an ad are key, therefore the best practice that branding should be upfront from second zero to drive strong cut through still holds." | Magna Media Trials, 4,800+ Snapchatters (B). In 2020 Snap advised an offer "within the first 2 seconds", ads "around 5-6 seconds", and reported "64% of Snapchat Ads are viewed with [sound] on" ([2020](https://forbusiness.snapchat.com/blog/creative-best-practices-snapchat-for-business)). Amplified for Snap: "Attention is high and inelastic for up to 8 seconds" ([Snap](https://forbusiness.snapchat.com/blog/video-attention-impact), B). |

**Where the platforms agree.** The stay-or-scroll decision is made in about 2–3 s:
- Snap: 2 s.
- TikTok: proposition by 3 s.
- Instagram: skip rate measured over 3 s.
- Meta: recall after 0.25 s, within a 1.7 s glance.

**Where they disagree, and how this film resolves it.**
- **Brand timing.** Snap says "from second zero" and Google "early, often, and richly"; TikTok says "subtle and not
  compromise the hook". A brand *character* on frame 0 (Bub) satisfies all three; the wordmark lands at 4.3 s, inside
  the old ABCD five-second rule ([2019 guide](https://services.google.com/fh/files/misc/youtube_google_abcd_reference_guide_en.pdf)).
- **Polish.** TikTok wants "lo-fi" and Google Shorts a creator-made look, while this film is polished CG. No platform
  compares animation with live action. A CG film has to earn its slot with an idea and visible craft, not gloss.
- **People.** TikTok and Google both say to feature people. This film's people are stills, so Bub's face stands in. No
  platform data tests a cartoon face against a human one.
- **Sound.** Reels, TikTok and YouTube are now sound-on majorities; Meta's "design for sound off" is 2016 advice.
  Design for sound on, but make the hook read muted.

---

## 5. What the data says works, and how good that data is

### 5.1 Metrics and benchmarks

| Metric | Definition | Benchmark | Source and grade |
|---|---|---|---|
| Hook rate (Meta) | 3-second video plays ÷ impressions | Average **25.44%** across 88,329 "sales ads", H1 2026 | [Billo](https://billo.app/blog/hook-rate-to-hold-rate/) (vendor, C). "20-40% is generally solid" ([Motion glossary](https://motionapp.com/library/glossary/thumbstop-rate-hook-rate), vendor, D); its bands are under 25% "needs work", 25–35% "solid", over 35% strong ([Motion](https://motionapp.com/blog/key-creative-performance-metrics), D) |
| Hook rate (TikTok, practitioner) | 2-second views ÷ impressions | About **30.7%** across 11 agency accounts | [LatinaUGC citing Tuff](https://latinaugc.com/blog/hook-rate-benchmark-tiktok-meta-2026) (D) |
| TikTok billing unit | 6-second "focused view"; "Interactions within the first second of the video are not counted" | — | [TikTok Help](https://ads.tiktok.com/help/article/video-views-objective) |
| Hold rate | 15-second plays ÷ 3-second plays | "40-50%" average, "over 60%" strong | [Motion](https://motionapp.com/blog/key-creative-performance-metrics) (vendor, D) |
| Skip rate (Instagram) | Share of views that skip in the first 3 s | — | Instagram, via [SMT](https://www.socialmediatoday.com/news/instagram-adds-retention-insights-reels/758464/) |

No benchmark was found for apps, social or dating apps, or Southeast Asia. Every hook-rate benchmark is unaudited
vendor marketing, and the TikTok and YouTube thresholds differ (2 s, 6 s, and 10 s for a Shorts ad view), so the
percentages don't compare across platforms.

### 5.2 What wins, strongest evidence first

1. **The first 1–3 s carry outsized weight.** Many sources agree, though the magnitudes are old or platform-reported:
   Facebook/Nielsen 47% in 3 s, TikTok 50% in 2 s, Nelson-Field 80 → 50 → 20%. Amplified Intelligence finds "0.4 to
   1.6 seconds of active attention per view", with "the majority of that attention… captured within the first 2.5
   seconds" ([Amplified, Aug 2025](https://www.amplified.co/insight/blog-attention-science-paid-social-strategy), C).
2. **Ordinary people in the first 2 s.**
   - "Showing a person or creator in the first two seconds of an ad increases hooking power by 50% and improves ad
     recognition by 32%" ([TikTok × CreatorIQ, Dec 2023](https://www.creatoriq.com/press/releases/tiktok-creatoriq-release-special-report-with-data-backed-keys-to-success-for-advertisers), C).
   - [Vidmob × TikTok](https://vidmob.com/resource/tiktok-hook-analysis) (1,678 ads, 7.3 billion impressions, 2023; B):
     everyday people are "1.7x more likely to hook a user" than celebrities, who show "a 13% decrease in 6s view
     through rate", and direct-to-camera talking heads get "a 14% lift in 2sVTR".
3. **Integrated branding beats a logo card.**
   - [System1 × TikTok, "The Long and the Short (form) of It"](https://2235762.fs1.hubspotusercontent-na1.net/hubfs/2235762/The%20Long%20and%20the%20Short%20(form)%20of%20It.pdf)
     (June 2025; 84,788 TikTok users in eight markets, matched to TikTok Brand Lift studies; B) charts the "Change in
     Brand Awareness Lift if present in first 2 seconds":

     | Distinctive asset in the first 2 s | Change in brand-awareness lift |
     |---|---|
     | Sonic asset | **+191%** |
     | Logo in context | **+182%** |
     | Fluent character | **+57%** |
     | Jingle | +40% |
     | Slogan | +27% |
     | Product | +24% |
     | Spoken brand name | +14% |
     | Brand colours | +12% |
     | Celebrity | −7% |
     | Written brand name | **−16%** |
     | Logo | **−30%** |
     | Brand font | **−33%** |

     Quote: "After years of brands simply putting their logo in the first 2 seconds of digital ads, consumers have
     likely been conditioned to swipe past these". Four distinctive assets in the opening 2 s are "recognized… at 2x
     the rate" of one; beyond four, attention declines.
   - Vidmob: a brand logo alone up front "decreases 6sVTR by 14%".
   - Peer-reviewed: "central on-screen brand positions, but not brand size, further promote commercial avoidance",
     and brand *pulsing* reduces it ([Teixeira, Wedel & Pieters 2010](https://doi.org/10.1287/mksc.1100.0567), A).
   - Caveat: the character and sonic lifts belong to *established* ("fluent") assets. Bub and the three-note Friend
     cell (`research-sound.md` §1.4) become fluent only through repetition.
4. **Sound on, with a distinctive cue.**
   - TikTok/Kantar: 73% "stop and look".
   - Meta: up to +13% incremental conversions with music or voice-over.
   - System1: a sonic asset adds +191%.
   - Counterpoint: a 2015 YouTube study found generic music in the first 5 s hurt awareness
     ([Think with Google](https://business.google.com/aunz/think/marketing-strategies/creating-youtube-ads-that-break-through-in-a-skippable-world/), B).
     So favour a distinctive hit over an anonymous bed.
5. **Surprise, then joy.** "Advertisers should use a quick element of surprise at the beginning of an ad, followed by a
   longer period of joy" ([HBS on Teixeira, Wedel & Pieters 2012, JMR](https://www.library.hbs.edu/working-knowledge/creating-online-ads-we-want-to-watch);
   A, 58 adults, desktop).
6. **Make "what is this?" clear instantly.**
   - "Upfront ads, which instantly convey what they promote, are evaluated positively after brief but also after
     longer exposure durations"; mystery ads are evaluated negatively after brief exposure; false-front ads are liked
     briefly and disliked later ([Elsen, Pieters & Wedel 2016](https://research.tilburguniversity.edu/en/publications/thin-slice-impressions-how-advertising-evaluation-depends-on-expo/), A).
   - People know "whether something is an ad… after an exposure of less than 100 milliseconds"
     ([Pieters & Wedel 2012](https://doi.org/10.1287/mksc.1110.0673), A).
7. **Text overlays and opening titles.** Platform claims only, e.g. TikTok's "+48% brand recall with opening title",
   paraphrased by the fetch tool ([TikTok Creative Center](https://ads.tiktok.com/business/creativecenter/quicktok/online/Power_Creative_Elements/pc/en), C).
8. **Question vs statement: weak and contested.**
   - A vendor study of *organic* videos found question hooks averaged 10.08× typical views vs 7.04× for statements.
     These are outlier-driven means ([The Content Labs, Aug 2026](https://thecontentlabs.app/blog/question-hooks-data-study), D).
   - [Motion's 2026 benchmarks](https://motionapp.com/thumbstop-pulse/creative-benchmarks-2026/) (550,000+ Meta ads,
     mostly ecommerce, holiday season; C) give hit rates of "Curiosity" 7.77%, "Relatability" 6.85% and "Direct
     address" 6.65%, against "Newness" 11.37%.
9. **Animation vs UGC: weak and confounded.** Motion's 2026 set gives "Animation" a 4.57% hit rate vs UGC 7.56%
   (ecommerce, holiday season; C). Treat it as a warning to bring people and an idea, not as a verdict on CG.
10. **Hook rate does not predict conversions.** "there's actually a negative relationship between view through and the
    conversion lift an ad drives" (System1 × TikTok; top vs bottom quartile **−51%**; B). Judge openings on hook rate
    *and* hold rate, CPI and day-7 retention.

### 5.3 Social and dating apps specifically

[AppsFlyer 2025](https://www.appsflyer.com/company/newsroom/pr/ai-emotion-creative-trends/) (1.1M creatives; vendor,
AI-tagged; C) reports two findings:
- In Social, "Storytelling Hooks… account for just 6% of spend… yet deliver the highest Day 7 retention at 8.4%".
- In Dating, "'Serious Relationship' motivations outperform 'Casual' by 15%".

No friend-app hook data exists in any source found.

---
## 6. A taxonomy of hooks

"Fit" is this film's fit (no voice, code-rendered CG, a soap-bubble world, stills of people). In the sound-off column
✓ means the hook still reads muted and ✗ means it needs sound.

| Pattern | How it works | Evidence | A real example | Sound-off | Fit |
|---|---|---|---|---|---|
| **Question** | Poses a gap. It works only if the viewer *lacks* the answer and expects it soon ([Loewenstein 1994](https://www.cmu.edu/dietrich/sds/docs/loewenstein/PsychofCuriosity.pdf)). A salient rhetorical format shifts attention to the persuader ([Ahluwalia & Burnkrant 2004](https://doi.org/10.1086/383421)). | Mixed: +150–257% clicks in a small 2013 headline test ([BPS](https://www.bps.org.uk/research-digest/are-you-more-likely-click-headlines-are-phrased-question)) vs more negative reactions in 2016 (2,057 adults). No video-ad test. | Blendtec "Will it blend?" (2006–): a question the viewer *can't* answer ([Wikipedia](https://en.wikipedia.org/wiki/Will_It_Blend%3F)) | ✓ | Low as a self-report; medium if the film visibly answers it |
| **Bold claim** | Expectancy violation plus a strong claim; risks skepticism | No hook-specific data | Dollar Shave Club (2012): "12,000 orders in a two-day span" ([Wikipedia](https://en.wikipedia.org/wiki/Dollar_Shave_Club)) | ✓ | Medium |
| **Statistic / big number** | Sharp numbers read as research and round ones as estimates ([Schindler & Yalch 2006, via Abrahams](https://www.goodreads.com/author_blog_posts/13735423-round-numbers-sharp-numbers-and-their-perceived-credibility)). Text wins attention "in direct proportion to its surface size" ([Pieters & Wedel 2004](https://doi.org/10.1509/jmkg.68.2.36.27794)). | No platform data; no verified short-form example found | — | ✓ | High if the number is round, verified and common knowledge ("8 billion") |
| **Contrast / paradox** | Moderate, relevant incongruity beats both congruity and extreme incongruity ([Meyers-Levy & Tybout 1989](https://ideas.repec.org/a/oup/jconrs/v16y1989i1p39-54.html); [Heckler & Childers 1992](https://ideas.repec.org/a/oup/jconrs/v18y1992i4p475-92.html)). "The violation of expectations often triggers a search for an explanation" (Loewenstein). | Strong mechanism (A); no performance data | Hinge "Designed to be deleted" (2022), a mascot that dies when you succeed ([Advertising Week](https://advertisingweek.com/aw360/news/hinges-mascot-begs-gen-z-fall-in-love-and-delete-this-dating-app/3525/)) | ✓ | **High** |
| **POV** | Self-reference plus imagined first person | None found | — | ✓ (label) | Low: 10 of 57 friend-app ads already use "POV:" or meme captions (§8) |
| **Negative / contrarian** | Negativity bias: each extra negative word added 2.3% to headline click-through; sad words beat angry ones ([Robertson et al. 2023](https://doi.org/10.1038/s41562-023-01538-4)) | Headline clicks, not ads | Burger King "Moldy Whopper" (2020) ([adforum](https://andys.adforum.com/award-organization/6650193/showcase/2020/ad/34615569)) | ✓ | Medium (tone risk for a bright brand) |
| **Curiosity gap / open loop** | An information gap. The urge to *resume* holds up, but the Zeigarnik *memory* advantage failed a 2025 meta-analysis ([Ghibellini & Meier 2025](https://ideas.repec.org/a/pal/palcom/v12y2025i1d10.1057_s41599-025-05000-w.html)) | Mystery openers are penalised at brief exposure (Elsen 2016) | GEICO "Unskippable" (2015) ([Tubefilter](https://www.tubefilter.com/2015/03/03/geico-pre-roll-youtube-ads-unskippable-videos/)) | ✓ if visual | **High** when the loop is physical and closes on the drop |
| **In medias res / flash-forward** | "a sequence of events with an anticipated but unknown resolution will almost inevitably create curiosity" (Loewenstein) | ABCD: start "in the middle of the action" (bundle lift only). The "preview flash" is vendor advice ([ClipSpeed](https://www.clipspeed.ai/blog/hook-first-second-video-retention.html), D) | — | ✓ if legible | Medium; don't spend the 50 s reveal |
| **Pattern interrupt** | Orienting to novelty. Surprise "effectively concentrate[s] attention" ([Teixeira et al. 2012](https://doi.org/10.1509/jmr.10.0207)). With complex content, extra orienting cues hurt memory ([Lang 2000](https://doi.org/10.1111/j.1460-2466.2000.tb02833.x)). | TikTok/Lumen: surprise 1.7× VTR (C) | GEICO's freeze-frame | ✓ (visual) | High, used once |
| **Satisfying / ASMR** | ASMR lowered heart rate by 3.41 bpm, but only in people who experience it ([Poerio et al. 2018](https://journals.plos.org/plosone/article?id=10.1371/journal.pone.0196645)). "Crisp sounds" are a trigger ([Barratt & Davis 2015](https://doi.org/10.7717/peerj.851)). | Company claims only | Michelob ULTRA Pure Gold, Super Bowl 2019 ([ASMR University](https://asmruniversity.com/2019/02/05/asmr-commercial-super-bowl/)) | Visual ✓, audio ✗ | Support: bubble physics and crisp pops |
| **Macro** | An unfamiliar texture at an unknown scale, already moving | No ad data. Physics simulation is on 2025 "fresh" lists ([Motionographer](https://motionographer.com/2025/01/02/25-for-2025-the-motionographers-crystal-ball-motion-design-predictions-part-2/)) | The Slow Mo Guys' 50,000 fps bubble pop (2022): holes "spread radially" ([Gigazine](https://gigazine.net/gsc_news/en/20220321-popping-bubble-50000-fps)) | ✓ | **High**: it is the film's own material |
| **Scale reveal / infinite zoom** | Answers "what am I looking at?" by escalating scale | The *continuous* zoom is now AI- and template-coded: Midjourney "Zoom Out" (June 2023, [BGR](https://www.bgr.com/tech/midjourney-ai-photo-editor-adds-mind-boggling-zoom-out-feature-you-need-to-see-to-believe)); a CapCut "earth zoom out" template with "41.54K uses" ([CapCut](https://www.capcut.com/template-detail/earth-zoom-out/7526236384592465205)) | Eames, *Powers of Ten* ([Kottke](https://kottke.org/12/01/powers-of-ten-and-cosmic-zoom-which-came-first)) | ✓ | High as **one** physical reveal on the drop; avoid the morphing zoom |
| **Frame-break / 3D billboard** | Breaks a learned rule (frames contain things) | d'strict "Wave" (2020, [designboom](https://www.designboom.com/design/dstrict-wave-led-screen-south-korea-05-16-2020/)); Shinjuku 3D cat (2021, "over 142,000 likes", [Yahoo](https://www.yahoo.com/news/giant-3d-cat-draws-crowds-181447106.html)). "Pop out of phone" is now an editing template ([Picsart](https://picsart.com/blog/pop-out-of-phone-trend-tutorial/), snippet). | As listed | ✓ | **High only when the boundary carries the idea**: here, the wall of "your bubble" |
| **FOOH** | "Is it real?" doubt in a real place | Maybelline's New York version: "12+ million views on TikTok" ([Cosmetics Business, 2023](https://www.cosmeticsbusiness.com/news/article_page/ASOS_accused_of_copying_Maybellines_viral_London_advert_with_Kylie_Cosmetics_campaign/210689)). By 2025 a FOOH vendor was listing its own clichés ([fooh.com](https://fooh.com/blog/overused-cgi-elements)). | Jacquemus (Apr 2023), Maybelline (Jul 2023) ([fooh.com](https://fooh.com/library/137-maybelline-subway-bus-lashes-fooh-ad)) | ✓ | None: needs live plates of real places |
| **Velocity edit / speed ramp** | Rhythm and surprise | A CapCut preset workflow since at least 2022 ([Nerdschalk](https://nerdschalk.com/how-to-do-the-velocity-trend-using-capcut/)) | — | ✓ | Punctuation only (one ramp into the drop) |
| **Impact frames** | A one-frame luminance change is one of the few events shown to capture attention (Franconeri & Simons 2003) | Anime and fan-edit idiom ([Know Your Meme](https://knowyourmeme.com/memes/cultures/impact-frames)) | — | ✓ | Once, on the 4.0 pop; never more than 3 flashes a second (§10) |
| **Looming** | Expansion on a collision course captures attention; receding motion does not ([Franconeri & Simons 2003](https://doi.org/10.3758/BF03194829); [Lin, Franconeri & Enns 2008](https://doi.org/10.1111/j.1467-9280.2008.02143.x)). Its native valence is threat ([Ball & Tronick 1971](https://doi.org/10.1126/science.171.3973.818)). | Lab, A | FPV one-take "Right Up Our Alley" (2021): "1.6 million views on YouTube within days" ([CineD](https://www.cined.com/fpv-drone-flying-at-its-finest-right-up-our-alley-is-an-87sec-masterpiece/)) | ✓ | **High**: stop short with a cute squash, never crash into the viewer |
| **Face / eye contact** | Faces are fixated within the first two fixations ">80%" of the time ([Cerf et al. 2008](https://authors.library.caltech.edu/40642/)). Direct gaze speeds orienting. Gaze then *sends* attention where the eyes look (§9). | TikTok 2020: a third of top-VTR ads "break the 4th wall" (C) | Old Spice (2010): "constant eye-contact with the camera" ([Wikipedia](https://en.wikipedia.org/wiki/The_Man_Your_Man_Could_Smell_Like)) | ✓ | **High**: Bub's eyes; real faces in C2 |
| **Mascot that breaks the fourth wall** | A character turns an ad into a social exchange | System1's 2025 Super Bowl work found brand characters beat celebrities ([MediaPost](https://www.mediapost.com/publications/article/410416/brands-need-more-characters.html), secondary). Duolingo's owl has "16.8 million TikTok followers". | Duolingo, "death of Duo" (Feb 2025) ([NPR/WGCU](https://www.wgcu.org/2025-02-26/duolingos-owl-mascot-is-alive-after-all-what-did-it-gain-from-faking-his-death)) | ✓ | **High** if acted with craft; risk of an "AI brainrot" read in SEA (§7) |
| **Direct address ("you")** | The self-reference effect ([Rogers et al. 1977](https://doi.org/10.1037/0022-3514.35.9.677)) | "You" gave no significant click lift in 24,333 Upworthy headline tests ([Gligorić et al. 2023](https://journals.plos.org/plosone/article?id=10.1371/journal.pone.0281682)). It helps only less-collectivist consumers ([Cruz et al. 2017](https://ideas.repec.org/a/eee/joinma/v39y2017icp104-116.html)). A *spoken* "you" in the first 5 s gave "+128% uplift in purchase intent" (TikTok × CreatorIQ, C). | GEICO, Old Spice | ✓ | Medium: an implied "you" is enough |
| **Kinetic type** | Big type wins attention in proportion to size; "tactile" 3D type is on 2025 forecasts | Timeleft's most-scaled 2026 ad is motion type (39 ads; §8) | Timeleft "Free on weeknights?" | ✓ | **High** |
| **Audio hooks** | A sound synced to a visual change makes that object "pop out from its complex environment" ([Van der Burg et al. 2008](https://doi.org/10.1037/0096-1523.34.5.1053), replicated 2026). Rising tones read as approaching ([Neuhoff 2001](https://doi.org/10.1207/S15326969ECO1302_2)). | Over 75% of Reels views are sound-on | — | ✗ | Support only; the picture must hook muted |

**Worn-out templates, per practitioners (opinion only):** "Stop scrolling", "TikTok made me buy it", "[company] has
sent me" ([Willeboordse, 2023](https://dennis.beehiiv.com/p/avoid-tiktok-ads)), and "Besties, I don't know who needs to
hear this…" ([Jo, 2024](https://nowbam.com/exposing-the-hooks-you-should-never-use/)). No evidence was found either way
on "POV:", "Wait for it" or "Nobody talks about this".

---

## 7. Motion design and 3D/CGI: what still stops the thumb, what is tired

| Fresh or neutral (2025–26) | Tired or risky |
|---|---|
| Physics simulation: "liquid dance like silk and materials behave in impossible ways" ([Motionographer, Jan 2025](https://motionographer.com/2025/01/02/25-for-2025-the-motionographers-crystal-ball-motion-design-predictions-part-2/)) | The continuous AI-style infinite zoom (Midjourney 2023; CapCut templates) |
| Macro soap film, with correct burst physics | FOOH, which needs real plates; "About 90% of FOOH ads are filmed outdoors… the default FOOH formula" ([fooh.com, 2025](https://www.fooh.com/blog/fooh-trends-in-2025)) |
| Tactile type: "3D engines will make words more tactile, allowing text to float and interact with their surroundings" (Motionographer) | A velocity-edit montage as the hook (a CapCut preset since 2022) |
| Mascots with real acting. Characters are rising: "Mascots are truly back" ([Creative Moment, Feb 2025](https://www.creativemoment.co/mascots-are-truly-back-in-2025)) | The pop-out-of-phone template |
| Visible imperfection and a hand-made feel: "imperfection becomes the signal of authenticity" ([Tangence, 2026](https://www.tangence.com/blog/?p=1093), agency blog) | Purple-gradient glowing orbs and "smooth, overpolished aesthetics" ([Videobolt, Dec 2025](https://blog.videobolt.net/post/top-motion-graphics-trends-2026), vendor) |
| One physical scale reveal of one subject | Glass and refraction as a novelty, which Apple's Liquid Glass (June 2025) made ordinary ([Apple](https://www.apple.com/newsroom/2025/06/apple-introduces-a-delightful-and-elegant-new-software-design/)) |

**AI-slop tells, and how a code-rendered film avoids them.**
- **The backlash is real and recent.**
  - Toys"R"Us's Sora film (June 2024): "jfc this is an abomination", with problems "keeping a character's appearance
    consistent" ([Decrypt](https://decrypt.co/237017/ai-film-toys-r-us-sora-controversy)).
  - Coca-Cola's AI holiday ads: "the most soulless Christmas ad i have ever seen" (2024,
    [Gigazine](https://gigazine.net/gsc_news/en/20241120-coca-cola-ai-holiday-season-commercial)) and "Soulless"
    (2025, [Today](https://www.today.com/today/amp/rcna241799)).
  - McDonald's Netherlands pulled its AI ad after three days over "uncanny-looking characters and large number of
    stitched together clips" (Dec 2025, [The Star](https://www.the-star.co.ke/news/world/2025-12-10-mcdonalds-pulls-ai-christmas-ad-after-backlash)).
  - NIQ (2,000+ participants, about 150 with EEG): "AI-generated ads—even those perceived as 'high quality'—elicited
    weaker memory activation" ([NielsenIQ, Dec 2024](https://nielseniq.com/global/en/news-center/2024/niq-research-uncovers-hidden-consumer-attitudes-toward-ai-generated-ads/)).
- **What reads crafted:** characters that stay on model, correct physics, long continuous moves, a specific human idea,
  and visible imperfection. A deterministic render can't morph or drift off model; its risks are generic polish and the
  AI-orb palette.
- **SEA note.** 2025's most viral 3D characters were AI "brainrot" figures; Tung Tung Tung Sahur is Indonesian in
  origin ([Wikipedia](https://en.wikipedia.org/wiki/Italian_brainrot)). Bub must read as hand-animated through
  anticipation, squash and stretch, eye darts and timing, not through more shine.
- **Studios (thin coverage).**
  - Buck's Pinterest Trend Report (2024): mundane scenes invaded by trend worlds, "volcanoes spewing chrome lava"
    ([Buck](https://buck.co/work/pinterest-trend-report)).
  - Golden Wolf's TikTok Effect House (2022): "a cacophony of styles" ([Golden Wolf](https://goldenwolf.tv/work/tiktok-effect-house)).

  The shared pattern is a familiar scene interrupted by something impossible. Neither opens on an abstract field of
  equal shapes. Their first seconds were described from case-study text, not watched frame by frame.

---
## 8. What friend apps open with (67 Meta ads, frame by frame)

**Method.** Meta Ad Library (public, no login), keyword searches filtered to video, July 2025 – October 2026. For
each ad, frames at t = 0, 1, 2 and 3 s were pulled from the actual video file and the first 6 s of audio transcribed;
57 consumer ads were coded. Two frame strips were re-checked by the report author and matched the coding. Searches
covered 19 apps, and ads were found for 11 (Timeleft, Bumble For Friends, Meetup, 222, Peanut, Yubo, Wink, Boo, Clyx,
Kndrd, Meet5), plus Equals through Malaysia and Singapore discovery. There were no ads for Hey! VINA, Patook, Wizz,
Slowly or Introvrs. Pie, Les Amis and Friended couldn't be told apart from unrelated advertisers.

**The category's first 3 seconds (57 ads).**

| Pattern in 0–3 s | Count | Example (Meta Ad Library ID) |
|---|---|---|
| A real person, filmed creator-style (selfie, talking head, vlog, interview) | 40 (70%) | Timeleft [2377517522662641](https://www.facebook.com/ads/library/?id=2377517522662641) ("If you're tired of surface level connections…") |
| Burned-in text already on frame 0 | 56 (98%) | All but Timeleft [1842321339691714](https://www.facebook.com/ads/library/?id=1842321339691714) |
| A voice within ~3 s | ≈35 (61%) | — |
| Adult-friendship difficulty, age or loneliness line | 12 (21%) | BFF [1581455530396389](https://www.facebook.com/ads/library/?id=1581455530396389) ("Making new friends as an adult in a big city can sometimes feel like a full-time job") |
| Dating-app reference (contrast, analogy, "your ex") | 11 (19%) | Peanut [3538300979652546](https://www.facebook.com/ads/library/?id=3538300979652546) ("like Tinder but for mum friends"); Yubo [1421685349511077](https://www.facebook.com/ads/library/?id=1421685349511077) |
| "POV:" or a deadpan meme caption | 10 (18%) | Wink [3196299143872518](https://www.facebook.com/ads/library/?id=3196299143872518) ("POV: you installed Wink as a Joke 😳") |
| "I went to dinner / spent the day with strangers, here's what happened" | 7 (12%) | Timeleft [4314637995489125](https://www.facebook.com/ads/library/?id=4314637995489125) |
| Animated or type-led opening | 6 (11%) | Boo's 2D cartoons ([4093743960923835](https://www.facebook.com/ads/library/?id=4093743960923835)); Timeleft motion type; Clyx kinetic type |
| **Values ("what matters to you")** | **0** | — |
| **AI shown or named** | **0** | — |
| **Anonymity → mutual unlock or reveal** | **0** | — |
| **Malaysian or SEA faces, places or language** | **0** | — |

**Key facts.**
- **Timeleft dominates the category's paid social.** The Library showed about 16,000 results, about 580 delivered in
  Singapore and about 340 in Malaysia
  ([MY search](https://www.facebook.com/ads/library/?active_status=all&ad_type=all&country=MY&q=timeleft&search_type=keyword_unordered&media_type=video)).
  A creator-platform case study reports "50+ Creators hired", "100+ pieces of content" and "2x to 5x ROAS"
  ([Collabstr](https://collabstr.com/case-study/timeleft), vendor).
- **Its most-scaled live creative is motion typography**
  ([1072096575501400](https://www.facebook.com/ads/library/?id=1072096575501400): active since 7 Aug 2026, "39 ads use
  this creative", 13 s, music only, also delivered in SG and MY):
  - **Frame 0:** "Free on weeknights?" in big white serif italics over a dark street.
  - **1 s:** a cream blob wipes across the frame.
  - **3 s:** "We match you with 5 people / on the same rhythm", with a pink squiggle under "rhythm".

  It is the closest thing to our format in the category, and it says type over motion can carry a hook here (Library
  scale is only a proxy; no performance figures are public).
- **Nothing in Malaysia or Singapore was made locally.** All 19 friend-app creatives delivered there (Timeleft, Wink,
  Equals) were English, shot in the US, London, Paris or Barcelona. Malay ("cari kawan") and Chinese ("交朋友")
  searches in Malaysia found no friend-app advertisers.
- **"Anonymous" is already Timeleft's word** ("I went to an anonymous dinner with five complete strangers…",
  [1829720134351961](https://www.facebook.com/ads/library/?id=1829720134351961)), meaning strangers at a table. The
  *visual* of hidden identity, then a mutual unlock, is unclaimed.

**What this means for us.** A code-rendered film can't out-UGC 70% of the category, so it shouldn't try. It can own:
- a type-led motion idea with one big physical event;
- the product's own mechanic (values, then anonymity, then the mutual unlock);
- looking and sounding made for Malaysia.

It should avoid the category's stock first lines: adult loneliness, relocation, "dinner with strangers", "POV:" and
Tinder jokes.

---

## 9. The first ~300 ms: attention science

**What is possible, and when, after a new video lands in the feed** (lab results; real feeds are noisier).

| After onset | What happens | Source |
|---|---|---|
| 13 ms per picture | Above-chance detection of a named picture | [Potter et al. 2014](https://doi.org/10.3758/s13414-013-0605-z) |
| 50 ms | The visual-appeal verdict already matches the 500 ms verdict | [Lindgaard et al. 2006](https://doi.org/10.1080/01449290500330448) |
| < 100 ms | "whether something is an ad… and—if the ad is typical—which product is being advertised" | [Pieters & Wedel 2012](https://doi.org/10.1287/mksc.1110.0673) |
| 100–110 ms (mean ~140) | The fastest saccades go to faces, including faces above and below fixation | [Crouzet et al. 2010](https://doi.org/10.1167/10.4.16); replicated by [Grandjean et al. 2025](https://doi.org/10.1167/jov.25.14.16) |
| 105–300 ms | A face's gaze direction shifts the viewer's attention; the effect is gone by ~1,005 ms | Friesen & Kingstone 1998, via [Frischen et al. 2007](https://pmc.ncbi.nlm.nih.gov/articles/PMC1950440/) |
| ~250 ms | An *ambiguous* illusory face stops being coded as a face | [Wardle et al. 2020](https://doi.org/10.1038/s41467-020-18325-8) |
| 250 ms | Mobile feed content is recalled above chance | [Facebook IQ 2016](https://www.facebook.com/business/news/insights/capturing-attention-feed-video-creative) |
| 3–4 per second | New fixations; about 238 words a minute while reading ([Brysbaert 2019](https://doi.org/10.1016/j.jml.2019.104047)) | Potter et al. 2014 |
| ~1.7 s | Average time per mobile feed item (2016) | Facebook IQ |

**Findings that set the rules for frame 0.**
- **Starts, not motion.** Abrupt onsets capture attention even against the viewer's intent
  ([Yantis & Jonides 1984](https://doi.org/10.1037/0096-1523.10.5.601); [Remington et al. 1992](https://doi.org/10.3758/BF03212254)).
  "Motion per se does not automatically attract attention… the onset of motion does", and a target with motion onset
  is found regardless of how many distractors there are ([Abrams & Christ 2003](https://doi.org/10.1111/1467-9280.01458)).
- **Approach, not retreat.** Looming captures attention and receding doesn't; a collision course beats a near miss
  ([Franconeri & Simons 2003](https://doi.org/10.3758/BF03194829); [Lin et al. 2008](https://doi.org/10.1111/j.1467-9280.2008.02143.x)).
  Symmetric expansion means "coming at me" and triggers avoidance in infants
  ([Ball & Tronick 1971](https://doi.org/10.1126/science.171.3973.818)). For a cute brand, loom and then stop short.
- **Centre first.** "When the scene appeared, the initial response was to orient to the center of the screen"
  ([Tatler 2007](https://doi.org/10.1167/7.14.4)). The bias is strongest right after onset
  ([Rothkegel et al. 2017](https://doi.org/10.1167/17.13.3)).
- **Faces and text are the two gaze magnets.** Faces and text are looked at "16.6 and 11.1 times more" than matched
  regions ([Cerf, Frady & Koch 2009](https://doi.org/10.1167/9.12.10)). Faces hold attention and slow disengagement
  ([Bindemann et al. 2005](https://doi.org/10.3758/BF03206442)).
- **Eyes that snap to the viewer.** "The greatest response-time facilitation occurred at the location of the sudden
  onset of direct gaze" ([Böckler et al. 2014](https://doi.org/10.1177/0956797613516147)). Two schematic eyes work; one
  eye does not ([von Grünau & Anston 1995](https://doi.org/10.1068/p241297)).
- **Then the eyes hand off to the words.** Averted gaze toward the content "increased attention to the banner
  overall, as well as to the advertising text"; mutual gaze kept attention "on the face region rather than on the
  text" ([Sajjacholapunt & Ball 2014](https://doi.org/10.3389/fpsyg.2014.00166); [Hutton & Nolte 2011](https://doi.org/10.1002/acp.1763)).
- **Cartoon faces count if they are clearly faces.** Gaze cueing by face-like objects is "comparable" to a cartoon
  face, and "eliminated when the observer did not perceive the objects as faces"
  ([Takahashi & Watanabe 2013](https://doi.org/10.1068/i0617sas)). Baby-schema features ("large head, round face and
  big eyes") raise cuteness and caretaking motivation ([Glocker et al. 2009](https://doi.org/10.1111/j.1439-0310.2008.01603.x)),
  and the effect generalises to animal faces ([Borgi et al. 2014](https://doi.org/10.3389/fpsyg.2014.00411)).
- **One singleton on a quiet field.** "Salience of a target increases with difference from the distractors… and with
  the homogeneity of the distractors" ([Wolfe & Horowitz 2017](https://pmc.ncbi.nlm.nih.gov/articles/PMC9879335/)).
  Gaze goes to what is surprising: "72% of all gaze shifts" ([Itti & Baldi 2009](https://doi.org/10.1016/j.visres.2008.09.007)).
- **Sound helps when it is on.** A synchronous pip "makes the visual object pop out from its complex environment"
  ([Van der Burg et al. 2008](https://doi.org/10.1037/0096-1523.34.5.1053)). The looming-sound bias holds "for harmonic
  tones… but not for broadband noise" ([Ghazanfar et al. 2002](https://doi.org/10.1073/pnas.242469699)). Fast,
  loud rise times produce blinks and flinches, a startle response rather than orienting
  ([Turpin et al. 1999](https://doi.org/10.1111/1469-8986.3640453)).
- **Change keeps attention.** Repeating the same stimulus habituates fast, and "Presentation of a different stimulus"
  restores the response ([Rankin et al. 2009](https://pmc.ncbi.nlm.nih.gov/articles/PMC2754195/)).

**The frame-0 rules these add up to.**
1. One local event that *starts* on frame 0, at or just above the centre, and keeps going for 100–300 ms. The feed's
   own swipe can mask a single-frame onset.
2. One face with two big, unmistakable eyes snapping to the viewer by about 0.1–0.3 s.
3. Then the pupils turn to where the next words will land; the words arrive 0.1–0.6 s after the gaze shift.
4. Words: 0–2 in the first 0.3 s, and one big line of 2–4 words by about 1 s.
5. The hero is the only singleton: biggest, nearest, the only face, the only onset and the only saturated colour. The
   field behind is homogeneous and soft.
6. A novel look with a typical message: an unfamiliar world, but "friends" legible at a glance.
7. A new event every 0.5–1 s through 4 s, never the same move twice.
8. Sound: a crisp transient exactly on the frame-0 event, a tonal (not noise) riser for anything approaching, and no
   startle-level hits.

---
## 10. Policy: what gets a hook rejected

All pages checked on 2026-10-07.

### 10.1 Risks inside the first 4 s

| Risk | The rule, in its own words | Verdict for this film |
|---|---|---|
| A fake system notification or message as the opener | Google: "Designs that mimic system notifications or dialog boxes"; "Ads that look like messages, dialog boxes, menus, or request notifications" ([Misrepresentation](https://support.google.com/adspolicy/answer/6020955?hl=en); [Misleading ad design](https://support.google.com/adspolicy/answer/15937463?hl=en)). TikTok: "Fake call-to-action buttons or pop-ups designed to mislead viewers"; "Fake video play buttons" ([TikTok](https://ads.tiktok.com/help/article/tiktok-ads-policy-misleading-and-false-content?lang=en)). Meta: "Mimicking the features or functionality of our services, such as… play buttons, or the Like button" ([Spam standard](https://transparency.meta.com/policies/community-standards/spam/)). | **High risk** on Google and TikTok. Show app UI only *inside* the rendered phone, in the app's own design system. Nothing should look like iMessage, WhatsApp or Instagram. |
| Gesture or instruction text | TikTok bans text "that portray[s] unsupported functionality", e.g. "Swipe up to learn more." ([TikTok](https://ads.tiktok.com/help/article/tiktok-ads-policy-ad-format-and-functionality?lang=en)) | No "tap", "swipe" or "pop it" aimed at the viewer |
| Personal attributes | Meta: "Ads must not contain content that asserts or implies personal attributes… physical or mental health"; ❌ "Depression getting you down? Get help now."; ✅ "Use 'you/your' language without a personal attribute." ([Meta](https://transparency.meta.com/policies/ad-standards/objectionable-content/privacy-violations-personal-attributes/)) | "Lonely?" and "No friends?" are **medium risk**. "8 billion people. Same 5 friends." and "When did you last make a new friend?" are low risk. |
| Statistics and claims (Malaysia) | Content Code 2022, Part 3: claims "should be capable of substantiation" (§4.8); "Statistics should not be presented so as to imply that they have greater validity than is the case" (§4.8(d)); independent-research claims must show "the source and the date" (§4.8(e)); "Obvious Hyperbole, which is intended to attract attention or to amuse, is permissible" (§4.4(c)(iii)); ads may not "without justifiable reason, play on fear" (§4.5) ([PDF](https://contentforum.my/wp-content/uploads/2024/01/Content-Code-2022.pdf)) | "8 billion" is fine with the UN source on file. "Same 5 friends" is obvious hyperbole, but never caption the "5" as data. A loneliness statistic would need its source and date on screen. |
| Clickbait | Google bans "You won't believe what happened"-style lines and "negative life events… to induce fear" ([Clickbait](https://support.google.com/adspolicy/answer/15936667?hl=en)); TikTok bans "deceptive language to lure viewers" | No "wait for it" or "you won't believe…" |
| Flashing | Google bans "Strobing, flashing, or otherwise distracting images" ([Editorial](https://support.google.com/adspolicy/answer/6021546?hl=en)). WCAG 2.3.1: nothing that "flashes more than three times in any one second period" ([W3C](https://www.w3.org/TR/WCAG22/)). | **One** flash on the 4.0 pop; no strobes; no saturated-red or full-frame white flicker |
| Sudden loud sound | Snap asks advertisers to "avoid intense jump scares" ([Snap](https://snap.com/en-US/ad-policies)) | A confident hit, never a startle |
| Romance cues | Dating policies key on matchmaking and romance (§10.2) | No romantic two-shots, hearts, "match", "date" or "singles"; groups read as platonic |

### 10.2 Flags beyond the hook (the whole film; owner decisions)

- **Dating classification is likely, whatever the creative says.**
  - Google lists "Livestream or chat apps whose primary focus is meeting new people" under Dating and Companionship,
    and "Dating and companionship advertisers must be certified by Google in order to serve ads"
    ([Google](https://support.google.com/adspolicy/answer/15328393?hl=en)).
  - Meta exempts only "Social apps without matchmaking elements, such as meetup apps"
    ([Meta](https://transparency.meta.com/policies/ad-standards/restricted-goods-services/dating-ads/)). AI value
    matching may count as matchmaking, which needs prior written permission.
  - TikTok handles dating and live-chat apps through a Sales Representative, 18+ only
    ([TikTok](https://ads.tiktok.com/help/article/tiktok-ads-policy-adult-content?lang=en)).
  - None of the four bars these ads in Malaysia, Singapore, Indonesia, the Philippines, Thailand or Vietnam.
- **AI portraits need TikTok's label on the whole ad.** "If we identify AI-generated content that has not been
  disclosed, your ad will be rejected or restricted", and the rule covers "Content that contains images… that are
  completely AI-generated" ([TikTok](https://ads.tiktok.com/help/article/tiktok-ads-policy-misleading-and-false-content?lang=en)).
  The film's portraits (Aisha, Mei, the foam) trigger it whether or not any face appears in the hook. TikTok accepts
  its own **AIGC label toggle** as disclosure, so no on-screen micro-label is needed; the owner rejects those.
- **Religion.** Malaysia's Content Code §8.7: "As a general rule, the use of religion in any form of Advertisements
  shall be prohibited." Step 1 of the film shows a "🙏 Faith" chip (`src/scenes/howto.js:34`), and its violet
  (#8C5CF6) also tints the universe. Review it for Malaysian delivery; a neutral sixth value would remove the risk.
- **Length.** TikTok's ad-format policy page says "The duration of the ad must be a minimum of 5 seconds, and a maximum
  of 60 seconds". The 66 s master needs a ≤60 s TikTok cut; confirm in Ads Manager. This fits the open decision on a
  ~30 s cut.

---

## 11. Statistics: what is true, and what travels to Malaysia

### 11.1 Loneliness in Southeast Asia: the Meta-Gallup survey

Gallup World Poll probability samples, about 1,000 people aged 15+ per country, June 2022 – Feb 2023; commissioned by
Meta. Re-checked in the report PDF.

| Country | Very or fairly lonely | Very or fairly connected ("not at all" connected) |
|---|---|---|
| Global | 24% | 72% (6%) |
| **Malaysia** | **14%** | **64% (12%)** |
| Singapore | 14% | 73% (6%) |
| Thailand | 10% | 64% (6%) |
| Indonesia | 9% | 77% (11%) |
| Vietnam | 5% | 86% (2%) |
| Philippines | 57% | 80% (6%) |
| United States | 15% | 78% (5%) |

Source: [Gallup & Meta, *The Global State of Social Connections* (2023)](https://gallup.com/file/analytics/513347/Gallup-Meta-Global%20State%20of%20Social%20Connections%20Report-2023.pdf).
Only 10% of Malaysians interact with "strangers or people you don't know" daily, against 16% globally (same report).
WHO estimates the Western Pacific region at 11.0% lonely (UI 6.1–21.7%) and notes that "stigma associated with
loneliness" may affect reporting ([WHO 2025](https://www.who.int/publications/i/item/978240112360)).

**Verdict.** On the one measure that covers both countries, Malaysians report no more loneliness than Americans (14%
vs 15%). A US-style "half of adults are lonely" figure would mislead and feel imported. The local gap is
*connection*, not loneliness. **Do not open on a loneliness statistic in Malaysia.**

### 11.2 The facts behind the candidate lines

| Line element | Fact | Verdict |
|---|---|---|
| "8 billion people" | "On 15 November 2022, the world's population is projected to reach 8 billion people" ([UN](https://www.un.org/en/dayof8billion)); "8.2 billion people in 2024" ([UN DESA, WPP 2024](https://www.un.org/development/desa/pd/sites/www.un.org.development.desa.pd/files/wpp2024_wpp_launch_desa_asg-statement_10_07_24_.pdf)); about 8.30 billion by mid-2026 ([StatisticsTimes](https://www.statisticstimes.com/demographics/world-population.php), secondary) | **Safe**, and conservative |
| "Same 5 friends" | Dunbar's innermost "support clique… its mean size is typically 3–5 individuals" ([Zhou et al. 2005](https://pmc.ncbi.nlm.nih.gov/articles/PMC1634986/)). 53% of US adults report 1–4 close friends and 38% five or more ([Pew 2023](https://www.pewresearch.org/short-reads/2023/10/12/what-does-friendship-look-like-in-america/)). | **Rhetoric, not data.** Fair shorthand; never caption it as research. |
| "since school" | 54% of Americans with close friends met one at work and 47% at school ([Survey Center 2021](https://www.americansurveycenter.org/research/the-state-of-american-friendship-change-challenges-and-loss/)). Across "277 studies with 177,635 participants", "the friendship network decreased throughout adulthood" ([Wrzus et al. 2013](https://fis.leuphana.de/en/publications/social-network-changes-and-life-events-across-the-life-span-a-met/)). Phone contacts peak at about age 25 ([Aalto, 2016](https://aalto.fi/en/news/new-study-shows-how-age-and-sex-affect-the-social-activity)). | **Supported** (US and European data; no Malaysian equivalent found) |
| "make a new friend" | "nearly half (46 percent) of Americans report having made a new friend within the past 12 months" (Survey Center 2021) | Makes no claim on screen. Safe. |
| "as an adult is hard" | "About three in 10 (31%) Americans say that they find it difficult to make friends" ([YouGov 2019](https://yougov.com/en-us/articles/24577-loneliness-friendship-new-friends-poll-survey), online panel) | **Voice only**; never "most adults" |
| "a stranger" | Randomly assigned neighbours at a first meeting rated each other closer a year later ([Back et al. 2008, via ScienceDaily](https://www.sciencedaily.com/releases/2008/06/080602163842.htm)). "people systematically underestimated how much their conversation partners liked them" ([Boothby et al. 2018](https://repository.essex.ac.uk/23025/)). | True. The risk is tonal: "stranger" next to an anonymous chat app. |
| Do not use | Evite/OnePoll "hasn't made a new one in the last five years" (sponsored); Talker "39%" (sponsored, travellers only); Bumble "52%" (sponsored); YouGov "22% of millennials have no friends"; Malaysia's NHMS adolescent data (minors) | — |

---
## Sources

All accessed 2026-10-07. *(snippet)* = search text only; *(secondary)* = reported by a third party; *(vendor)* = commercial source. Ones marked † were re-checked by the report author against the primary page or PDF.

**Platforms**
- Meta, "The Science of the Hook: How to supercharge your Reels performance", 15 Dec 2025 † — https://www.facebook.com/business/news/the-science-of-the-hook-how-to-supercharge-your-reels-performance?locale=en_US
- Facebook IQ, "Capturing attention in feed: the science behind effective video creative", 20 Apr 2016 — https://www.facebook.com/business/news/insights/capturing-attention-feed-video-creative
- Facebook newsroom (Spanish), video ads and Nielsen 47%/74%, Feb 2016 — https://about.fb.com/es/news/2016/02/capta-la-atencion-con-nuevas-funcionalidades-para-anuncios-de-video/
- Meta for Developers, "Unlock the Power of Reels Ads", 7 Nov 2024 † — https://developers.facebook.com/blog/post/2024/11/07/unlock-the-power-of-reel-ads/
- Meta for Business, "Reels Ads updates", 10 Oct 2023 — https://www.facebook.com/business/news/reels-ads-updates-performance-features-automated-creative-suitability-solutions
- Social Media Today on Instagram ranking signals, 22 Jan 2025 *(secondary)* — https://www.socialmediatoday.com/news/instagram-shares-algorithm-insights-2025/738034/
- Social Media Today on watch time and longer videos, 25 Feb 2025 *(secondary)* — https://www.socialmediatoday.com/news/instagram-longer-video-watch-time-versus-completion-rate/740916/
- Social Media Today on Reels skip rate, 24 Aug 2025 *(secondary)* — https://www.socialmediatoday.com/news/instagram-adds-retention-insights-reels/758464/
- TikTok Ads Help, "Creative Best Practices", updated June 2025 — https://ads.tiktok.com/help/article/creative-best-practices
- TikTok, "Creative Codes" one-pagers (PDF, May 2023) — https://ads.tiktok.com/business/library/Creative_Codes_ENG.pdf
- TikTok, "9 creative tips to drive auction ad performance" (PDF, Oct 2020) — https://ads.tiktok.com/business/library/Auction_Ads_Creative_Tips.pdf
- Social Media Today on TikTok's "50% in the first 2 seconds", 27 Sep 2023 † *(secondary)* — https://www.socialmediatoday.com/news/tiktok-shares-new-notes-maximize-ad-effectiveness/694989/
- TikTok Ads Help, video play metrics and Video Views objective — https://ads.tiktok.com/help/article/video-play?lang=en · https://ads.tiktok.com/help/article/video-views-objective
- TikTok Creative Center, "Power of Creative Elements" (fetch-tool paraphrase) — https://ads.tiktok.com/business/creativecenter/quicktok/online/Power_Creative_Elements/pc/en
- Google, "YouTube ABCDs: Video ad best practices", Apr 2022 — https://business.google.com/en-all/think/future-of-marketing/youtube-video-ad-creative/
- Google, ABCD reference guide (2019) — https://services.google.com/fh/files/misc/youtube_google_abcd_reference_guide_en.pdf
- Kantar, "Validating Google's ABCD framework" — https://www.kantar.com/north-america/industries/technology-and-telecoms/validating-googles-abcd-framework-with-the-power-of-artificial-intelligence
- Google, "YouTube Shorts ABCDs Summary" one-sheet — https://services.google.com/fh/files/misc/formarketingshortsabcdsonesheeters.pdf
- YouTube Help, Shorts content analytics ("Viewed vs swiped away") — https://support.google.com/youtube/answer/12942217?co=YOUTUBE._YTVideoType%3Dshorts&hl=en
- Think with Google, "The first five seconds" (YouTube Insights), Jun 2015 — https://business.google.com/aunz/think/marketing-strategies/creating-youtube-ads-that-break-through-in-a-skippable-world/
- Snap for Business, "Format Functionality", 5 Jun 2025 — https://forbusiness.snapchat.com/blog/video-format-functionality
- Snap for Business, "Snapchat Ads Best Practices", 9 Jun 2020 — https://forbusiness.snapchat.com/blog/creative-best-practices-snapchat-for-business
- Snap for Business, "Attention – the Next Superpower" (Amplified Intelligence, 2022) — https://forbusiness.snapchat.com/blog/video-attention-impact

**Industry data and vendors**
- System1 × TikTok, "The Long and the Short (form) of It", June 2025 (PDF) † — https://2235762.fs1.hubspotusercontent-na1.net/hubfs/2235762/The%20Long%20and%20the%20Short%20(form)%20of%20It.pdf
- Vidmob × TikTok, "The Science of the Hook" (2024) † — https://vidmob.com/resource/tiktok-hook-analysis
- TikTok × CreatorIQ special report, 6 Dec 2023 † — https://www.creatoriq.com/press/releases/tiktok-creatoriq-release-special-report-with-data-backed-keys-to-success-for-advertisers
- Bizcommunity on Karen Nelson-Field, 15 Sep 2025 † *(secondary; press report of a talk)* — https://www.bizcommunity.com/article/karen-nielsen-field-the-attention-deficit-how-to-overcome-it-510470a
- Amplified Intelligence, "What attention science says about your paid social strategy", 19 Aug 2025 — https://www.amplified.co/insight/blog-attention-science-paid-social-strategy
- Billo, hook rate to hold rate (H1 2026) *(vendor)* — https://billo.app/blog/hook-rate-to-hold-rate/
- Motion, glossary and key creative metrics *(vendor)* — https://motionapp.com/library/glossary/thumbstop-rate-hook-rate · https://motionapp.com/blog/key-creative-performance-metrics
- Motion, Creative Benchmarks 2026 *(vendor)* — https://motionapp.com/thumbstop-pulse/creative-benchmarks-2026/
- LatinaUGC citing Tuff's TikTok benchmark *(vendor)* — https://latinaugc.com/blog/hook-rate-benchmark-tiktok-meta-2026
- The Content Labs, question-hooks study, Aug 2026 *(vendor)* — https://thecontentlabs.app/blog/question-hooks-data-study
- AppsFlyer, 2025 creative report press release *(vendor)* — https://www.appsflyer.com/company/newsroom/pr/ai-emotion-creative-trends/
- Stackmatix, an example misreport of Meta's hook article *(snippet)* — https://www.stackmatix.com/blog/meta-video-ads

**Academic: attention and perception**
- Yantis & Jonides 1984 — https://doi.org/10.1037/0096-1523.10.5.601 · Remington, Johnston & Yantis 1992 — https://doi.org/10.3758/BF03212254
- Abrams & Christ 2003 † — https://doi.org/10.1111/1467-9280.01458
- Franconeri & Simons 2003 † — https://doi.org/10.3758/BF03194829 · Lin, Franconeri & Enns 2008 — https://doi.org/10.1111/j.1467-9280.2008.02143.x
- Ball & Tronick 1971 — https://doi.org/10.1126/science.171.3973.818
- Crouzet, Kirchner & Thorpe 2010 — https://doi.org/10.1167/10.4.16 · Grandjean et al. 2025 — https://doi.org/10.1167/jov.25.14.16
- Cerf et al. 2008 — https://authors.library.caltech.edu/40642/ · Cerf, Frady & Koch 2009 — https://doi.org/10.1167/9.12.10
- Bindemann et al. 2005 — https://doi.org/10.3758/BF03206442 · von Grünau & Anston 1995 — https://doi.org/10.1068/p241297
- Böckler, van der Wel & Welsh 2014 — https://doi.org/10.1177/0956797613516147
- Frischen, Bayliss & Tipper 2007 (incl. Friesen & Kingstone 1998) — https://pmc.ncbi.nlm.nih.gov/articles/PMC1950440/
- Sajjacholapunt & Ball 2014 — https://doi.org/10.3389/fpsyg.2014.00166 · Hutton & Nolte 2011 — https://doi.org/10.1002/acp.1763
- Takahashi & Watanabe 2013 — https://doi.org/10.1068/i0617sas · Wardle et al. 2020 — https://doi.org/10.1038/s41467-020-18325-8
- Glocker et al. 2009 — https://doi.org/10.1111/j.1439-0310.2008.01603.x · Borgi et al. 2014 — https://doi.org/10.3389/fpsyg.2014.00411
- Duncan & Humphreys 1989 — https://doi.org/10.1037/0033-295X.96.3.433 · Wolfe & Horowitz 2017 — https://pmc.ncbi.nlm.nih.gov/articles/PMC9879335/
- Rosenholtz, Li & Nakano 2007 — https://doi.org/10.1167/7.2.17 · Itti & Baldi 2009 — https://doi.org/10.1016/j.visres.2008.09.007
- Tatler 2007 — https://doi.org/10.1167/7.14.4 · Rothkegel et al. 2017 — https://doi.org/10.1167/17.13.3
- Potter et al. 2014 — https://doi.org/10.3758/s13414-013-0605-z · Lindgaard et al. 2006 — https://doi.org/10.1080/01449290500330448
- Brysbaert 2019 — https://doi.org/10.1016/j.jml.2019.104047
- Van der Burg et al. 2008 — https://doi.org/10.1037/0096-1523.34.5.1053 · Neuhoff 2001 — https://doi.org/10.1207/S15326969ECO1302_2 · Ghazanfar, Neuhoff & Logothetis 2002 — https://doi.org/10.1073/pnas.242469699
- Turpin, Schaefer & Boucsein 1999 — https://doi.org/10.1111/1469-8986.3640453 · Rankin et al. 2009 — https://pmc.ncbi.nlm.nih.gov/articles/PMC2754195/

**Academic: advertising and persuasion**
- Teixeira, Wedel & Pieters 2010 — https://doi.org/10.1287/mksc.1100.0567 · 2012 — https://doi.org/10.1509/jmr.10.0207 (HBS summary: https://www.library.hbs.edu/working-knowledge/creating-online-ads-we-want-to-watch)
- Elsen, Pieters & Wedel 2016 † — https://research.tilburguniversity.edu/en/publications/thin-slice-impressions-how-advertising-evaluation-depends-on-expo/
- Pieters & Wedel 2004 — https://doi.org/10.1509/jmkg.68.2.36.27794 · 2012 — https://doi.org/10.1287/mksc.1110.0673 · Pieters, Wedel & Batra 2010 — https://doi.org/10.1509/jmkg.74.5.048
- Loewenstein 1994 — https://www.cmu.edu/dietrich/sds/docs/loewenstein/PsychofCuriosity.pdf · Ghibellini & Meier 2025 — https://ideas.repec.org/a/pal/palcom/v12y2025i1d10.1057_s41599-025-05000-w.html
- Rogers, Kuiper & Kirker 1977 — https://doi.org/10.1037/0022-3514.35.9.677 · Cruz, Leonhardt & Pezzuti 2017 — https://ideas.repec.org/a/eee/joinma/v39y2017icp104-116.html · Gligorić et al. 2023 — https://journals.plos.org/plosone/article?id=10.1371/journal.pone.0281682
- Ahluwalia & Burnkrant 2004 — https://doi.org/10.1086/383421 · Scacco & Muddiman 2016 *(secondary)* — https://www.journalism.co.uk/readers-perceive-question-based-headlines-more-negatively-study-shows/ · Lai & Farbrot *(secondary)* — https://www.bps.org.uk/research-digest/are-you-more-likely-click-headlines-are-phrased-question
- Meyers-Levy & Tybout 1989 — https://ideas.repec.org/a/oup/jconrs/v16y1989i1p39-54.html · Heckler & Childers 1992 — https://ideas.repec.org/a/oup/jconrs/v18y1992i4p475-92.html
- Robertson et al. 2023 — https://doi.org/10.1038/s41562-023-01538-4 · Schindler & Yalch 2006 *(secondary)* — https://www.goodreads.com/author_blog_posts/13735423-round-numbers-sharp-numbers-and-their-perceived-credibility
- Poerio et al. 2018 — https://journals.plos.org/plosone/article?id=10.1371/journal.pone.0196645 · Barratt & Davis 2015 — https://doi.org/10.7717/peerj.851 · Lang 2000 — https://doi.org/10.1111/j.1460-2466.2000.tb02833.x

**Motion design, CGI and culture**
- Motionographer, Crystal Ball 2025 Pt 2 — https://motionographer.com/2025/01/02/25-for-2025-the-motionographers-crystal-ball-motion-design-predictions-part-2/
- Gigazine, 50,000 fps bubble pop, 21 Mar 2022 — https://gigazine.net/gsc_news/en/20220321-popping-bubble-50000-fps
- BGR, Midjourney "Zoom Out", 26 Jun 2023 — https://www.bgr.com/tech/midjourney-ai-photo-editor-adds-mind-boggling-zoom-out-feature-you-need-to-see-to-believe · CapCut "earth zoom out" template — https://www.capcut.com/template-detail/earth-zoom-out/7526236384592465205 · Kottke on Powers of Ten — https://kottke.org/12/01/powers-of-ten-and-cosmic-zoom-which-came-first
- designboom, d'strict "Wave", 17 May 2020 — https://www.designboom.com/design/dstrict-wave-led-screen-south-korea-05-16-2020/ · Yahoo News, Shinjuku 3D cat — https://www.yahoo.com/news/giant-3d-cat-draws-crowds-181447106.html · Picsart pop-out trend *(snippet)* — https://picsart.com/blog/pop-out-of-phone-trend-tutorial/
- fooh.com, Maybelline entry — https://fooh.com/library/137-maybelline-subway-bus-lashes-fooh-ad · "Overused CGI elements" — https://fooh.com/blog/overused-cgi-elements · "FOOH trends in 2025" — https://www.fooh.com/blog/fooh-trends-in-2025 · Cosmetics Business, Aug 2023 — https://www.cosmeticsbusiness.com/news/article_page/ASOS_accused_of_copying_Maybellines_viral_London_advert_with_Kylie_Cosmetics_campaign/210689
- Nerdschalk, velocity edits — https://nerdschalk.com/how-to-do-the-velocity-trend-using-capcut/ · Know Your Meme, impact frames — https://knowyourmeme.com/memes/cultures/impact-frames · CineD, "Right Up Our Alley" — https://www.cined.com/fpv-drone-flying-at-its-finest-right-up-our-alley-is-an-87sec-masterpiece/
- MediaPost, "Brands need more characters", 4 Nov 2025 — https://www.mediapost.com/publications/article/410416/brands-need-more-characters.html · Creative Moment, Feb 2025 — https://www.creativemoment.co/mascots-are-truly-back-in-2025 · NPR/WGCU on Duolingo, 26 Feb 2025 — https://www.wgcu.org/2025-02-26/duolingos-owl-mascot-is-alive-after-all-what-did-it-gain-from-faking-his-death · Wikipedia, Italian brainrot — https://en.wikipedia.org/wiki/Italian_brainrot
- Apple, Liquid Glass, 9 Jun 2025 — https://www.apple.com/newsroom/2025/06/apple-introduces-a-delightful-and-elegant-new-software-design/ · Videobolt 2026 trends *(vendor)* — https://blog.videobolt.net/post/top-motion-graphics-trends-2026 · Tangence 2026 *(agency)* — https://www.tangence.com/blog/?p=1093
- Indie Hackers, "The AI purple problem", Jul 2026 — https://www.indiehackers.com/post/the-ai-purple-problem-why-every-ai-brand-looks-the-same-6cb0aa2a02 · nss magazine, Sep 2026 — https://www.nssmag.com/en/lifestyle/47059/slop-ai-visual-design
- Decrypt, Toys"R"Us Sora film — https://decrypt.co/237017/ai-film-toys-r-us-sora-controversy · Gigazine, Coca-Cola 2024 — https://gigazine.net/gsc_news/en/20241120-coca-cola-ai-holiday-season-commercial · Today, Coca-Cola 2025 — https://www.today.com/today/amp/rcna241799 · The Star, McDonald's NL — https://www.the-star.co.ke/news/world/2025-12-10-mcdonalds-pulls-ai-christmas-ad-after-backlash · NielsenIQ, Dec 2024 — https://nielseniq.com/global/en/news-center/2024/niq-research-uncovers-hidden-consumer-attitudes-toward-ai-generated-ads/
- Buck, Pinterest Trend Report — https://buck.co/work/pinterest-trend-report · Golden Wolf, TikTok Effect House — https://goldenwolf.tv/work/tiktok-effect-house
- Ad examples: Hinge — https://advertisingweek.com/aw360/news/hinges-mascot-begs-gen-z-fall-in-love-and-delete-this-dating-app/3525/ · Burger King Moldy Whopper — https://andys.adforum.com/award-organization/6650193/showcase/2020/ad/34615569 · GEICO "Unskippable" — https://www.tubefilter.com/2015/03/03/geico-pre-roll-youtube-ads-unskippable-videos/ · Old Spice — https://en.wikipedia.org/wiki/The_Man_Your_Man_Could_Smell_Like · Dollar Shave Club — https://en.wikipedia.org/wiki/Dollar_Shave_Club · Blendtec — https://en.wikipedia.org/wiki/Will_It_Blend%3F · Michelob ULTRA — https://asmruniversity.com/2019/02/05/asmr-commercial-super-bowl/
- Practitioner opinion: Willeboordse 2023 — https://dennis.beehiiv.com/p/avoid-tiktok-ads · Jo 2024 — https://nowbam.com/exposing-the-hooks-you-should-never-use/ · ClipSpeed *(vendor)* — https://www.clipspeed.ai/blog/hook-first-second-video-retention.html

**Competitor ads (Meta Ad Library, seen 2026-10-07; frames at 0/1/2/3 s)**
- Timeleft: 1072096575501400 †, 4314637995489125, 1829720134351961, 2377517522662641, 1842321339691714 — https://www.facebook.com/ads/library/?id=1072096575501400 (pattern: `?id=<ID>`) · MY search — https://www.facebook.com/ads/library/?active_status=all&ad_type=all&country=MY&q=timeleft&search_type=keyword_unordered&media_type=video
- Bumble For Friends 1581455530396389; Peanut 3538300979652546; Yubo 1421685349511077; Wink 3196299143872518; Boo 4093743960923835 † — same permalink pattern
- Collabstr, Timeleft case study *(vendor)* — https://collabstr.com/case-study/timeleft
- Full ad-by-ad log (67 ads, 113 frame strips) kept in the research scratchpad. It is not copied into the project, per the brief.

**Policy**
- Google Ads: Misrepresentation — https://support.google.com/adspolicy/answer/6020955?hl=en · Misleading ad design — https://support.google.com/adspolicy/answer/15937463?hl=en · Clickbait — https://support.google.com/adspolicy/answer/15936667?hl=en · Editorial — https://support.google.com/adspolicy/answer/6021546?hl=en · Dating and Companionship † — https://support.google.com/adspolicy/answer/15328393?hl=en
- TikTok: Misleading and false content (incl. AIGC) † — https://ads.tiktok.com/help/article/tiktok-ads-policy-misleading-and-false-content?lang=en · Ad format and functionality — https://ads.tiktok.com/help/article/tiktok-ads-policy-ad-format-and-functionality?lang=en · Adult content (dating, live chat) — https://ads.tiktok.com/help/article/tiktok-ads-policy-adult-content?lang=en
- Meta: Personal attributes † — https://transparency.meta.com/policies/ad-standards/objectionable-content/privacy-violations-personal-attributes/ · Dating ads — https://transparency.meta.com/policies/ad-standards/restricted-goods-services/dating-ads/ · Spam (Community Standard) — https://transparency.meta.com/policies/community-standards/spam/
- Snap Advertising Policies (effective 7 Apr 2025) — https://snap.com/en-US/ad-policies
- Malaysia, Communications and Multimedia Content Code 2022 (PDF) — https://contentforum.my/wp-content/uploads/2024/01/Content-Code-2022.pdf
- W3C, WCAG 2.2 (SC 2.3.1) — https://www.w3.org/TR/WCAG22/

**Statistics**
- Gallup & Meta, *The Global State of Social Connections* (2023) † — https://gallup.com/file/analytics/513347/Gallup-Meta-Global%20State%20of%20Social%20Connections%20Report-2023.pdf
- WHO Commission on Social Connection, *From loneliness to social connection* (2025) — https://www.who.int/publications/i/item/978240112360
- UN, Day of Eight Billion — https://www.un.org/en/dayof8billion · UN DESA, WPP 2024 launch statement — https://www.un.org/development/desa/pd/sites/www.un.org.development.desa.pd/files/wpp2024_wpp_launch_desa_asg-statement_10_07_24_.pdf · StatisticsTimes *(secondary)* — https://www.statisticstimes.com/demographics/world-population.php
- Zhou, Sornette, Hill & Dunbar 2005 — https://pmc.ncbi.nlm.nih.gov/articles/PMC1634986/ · Pew 2023 — https://www.pewresearch.org/short-reads/2023/10/12/what-does-friendship-look-like-in-america/
- Survey Center on American Life 2021 — https://www.americansurveycenter.org/research/the-state-of-american-friendship-change-challenges-and-loss/ · Wrzus et al. 2013 — https://fis.leuphana.de/en/publications/social-network-changes-and-life-events-across-the-life-span-a-met/ · Aalto University on Bhattacharya et al. 2016 — https://aalto.fi/en/news/new-study-shows-how-age-and-sex-affect-the-social-activity
- YouGov 2019 — https://yougov.com/en-us/articles/24577-loneliness-friendship-new-friends-poll-survey · Back, Schmukle & Egloff 2008 *(via ScienceDaily)* — https://www.sciencedaily.com/releases/2008/06/080602163842.htm · Boothby et al. 2018 — https://repository.essex.ac.uk/23025/

**Project files referenced**
- `research/research-vibe.md` §3 (safe zones, earlier hook notes), `research/research-market.md` §0–4 (competitors, S1–S18 statistics, clichés), `research/research-sound.md` §1.4 (Friend cell), `src/scenes/hook.js`, `src/scenes/howto.js`, `src/brand.js`, `src/score.js`, `out/sf3v/` (v3 frames).
