# almost friends — special edition: the storyboard

The cut is the released film's, frame for frame: the beat sheet, the words, the score and the mix are in
[`../almostfriends/STORYBOARD.md`](../almostfriends/STORYBOARD.md) and are not repeated here. This page lists what the
special edition changes: the material of every bubble that carries the story.

## The brief

1. **The first special edition (v5, now in [`v5/`](v5/)).** A 44 s showreel, built new: a new structure, a new score,
   a night opening and a raymarched liquid engine. The owner's verdict, verbatim: "ok yeah animation is cooler but the
   whole video through is actually worse than the previous version, in terms of tempo, taste, etc".
2. **The direction for v6, verbatim:** "can refer to prev … version, it got the tempo music and message etc right".

v5 was measured against the released film with the same tools:

| | released | v5 |
|---|---|---|
| seconds that were dark, without words, or only tiny words | 6 of 66 | 24 of 44 |
| low-energy stretches | one 5 s breath | 14 s across three stretches |
| a new picture every | 1.5 s | 2.0 s |
| colour worlds | one bright sky | five |

So v6 keeps everything that carries tempo and taste — the cut, the type, the layout, the phone, the score — and swaps
only the bubbles for v5's liquid.

## The liquid moments

| t (s) | moment | released | special edition |
|---|---|---|---|
| 2.0–2.4 | the pop becomes the mark | 2D droplets; a raster double bubble inflates | droplets thrown off the tear stream to the mark and merge into it, each into its own colour |
| 3.2–3.4 | the dive through the mark | a 2D gradient wipe | a sheet of real soap film passes the lens (the wipe at half strength under it) |
| 13.3–14.9 | your orb, the dive into it | a 2D orb that fades as the camera arrives | a clear bubble fills with your three inks; its film tears open from the middle as the camera goes through |
| 15.0–22.7 | Bub's search in the crowd | raster heroes | Bub, the two people he checks and the one are liquid, depth-tested in the crowd; a gold glass ring locks on the one; the rush ends inside their film, which fills the frame across the cut |
| 22.7–27.9 | the match | two 2D orbs and a drawn wall | two ink bubbles kiss and share a real wall; they ride the iOS push to the chat |
| 32.0–33.4 | SAME!! | a 2D squircle | the chat bubble bursts out as a glossy blue jelly slab, with bubbles splashing round it |
| 41.5–50.0 | the unlock | 2D slot orbs, 2D Bub | ink orbs in the slots; Bub peeks over the sheet as a soap bubble; their padlock over their orb |
| 50.0–50.9 | the reveal | 2D orbs fly up, kiss, spring apart | the orbs burst out of the phone and kiss; the wall tears open; they spring apart and each film bursts as the face pops out |
| 56–62 | the friends | photos under 2D bubble drawings | every friend inside a real soap film (clear over the face, colour at the rim); the two of you a real double bubble that floods blue and coral as everyone rushes in |
| 62–66 | the mark, Bub's wink | the 2D mark | a glossy liquid double bubble that sways a few degrees in the light; Bub a soap bubble with his face |

## The phone in 3D, the camera, the type (v6, second pass)

The owner on v6's first cut: "the UI screens etc needs to be more cool, camera zoom in, not static camera", "the phone
no need to be 2d mah, it can be 3d also", and "the text all doesn't feel like work well with the scene together, feel
like its typed and slap on top of it" — with two of the brief's references (the ChatGPT motion study: a camera that never
rests, frames the action tight and tracks it; the AVYREON film: UI as layers in 3D, lit, a camera that pushes and orbits).

| | before | now |
|---|---|---|
| the phone | a 2D drawing, scaled and moved | a real 3D iPhone (`src/gl/phone3d.js`): a titanium band mirroring a studio, black glass, the side buttons; the released screens drawn live onto its glass, under a glass skin that catches the light; a soft shadow on the sky. Third pass: an iPhone 16 Pro's screen, 402 × 874 pt (owner: "the phone can make proper iphone size? look odds to me" — the released screens had the frame's 9 : 16) |
| the camera on it | holds of 2–4 s between pushes | always moving (`src/ui/phonecam.js`): it lands close on each event (Bub's question, each message, the kiss, Say hi, Unlock), rides the finger tag to tag on the three taps, and every hold is a slow orbit; every key is a framing plus an angle, so pushes are orbits and the three days are a turntable |
| the bubbles on the phone | screen-space | domes on the glass (half under it, as a bubble rests on a wet surface), seen through the phone's lens and hidden by its body |
| their padlock | drawn over everything | a layer floating above the glass, over their orb |
| the captions and the days | flat on top | (replaced by the third pass, below) |

## Type in the scene (v6, third pass)

The owner on the second pass, verbatim: "same issue: you check each scene, the text feel like slap on top of it, this
is not a good motion design practice, check how others references, we cannot just put text on top area with
background color and dropshadow etc, it *must* merge and design well seamlessly into the scene"; and, of the steps,
"you see the Pick what matters to you etc etc, feel like text on top only".

**What the references do** (frame by frame, at 4 fps): AVYREON sets "You Need" alone in the light of the scene, prints
"Primary Colors" on the card it names and tilts it with the card, puts "Strategy" inside a ring the camera then flies
through, and raises a rocket in front of "Strategy Creative Execution"; the music-tool film sets "Stop" and "Original
tracks" beside their card and album in the same purple light, hangs "Talking", "Reacting" and "Flowing" on the
ribbons that carry them, and drops an orb between "Your" and "vibe"; the ChatGPT study has no captions at all — its
words are the UI's, framed tight. None of them puts words in a band, on a plate or under a drop shadow. Three rules
follow, and every line in the film now keeps them:

1. **Placed by its subject, not by the frame:** beside, behind, under or inside the thing it is about.
2. **In the shot's space and light:** the same lens (perspective, parallax, focus, motion blur), the same objects in
   front of it and behind it, the same light. No band, plate, badge, drop shadow or fog behind it; the phone is never
   faded to make room for it.
3. **Moved by the scene:** it arrives and leaves through the scene's own events.

| moment | second pass (on top) | third pass (in the scene) |
|---|---|---|
| How to / make more / friends | a layer at the wall's distance | written on the wall itself (`src/gl/membrane.js` reads them): they ride its ripples and bulge in 3D, come at you as Bub pushes, the film's colours swirl over the dark letters, and they tear with it; "friends" survives |
| almost / friends.ai | a camera-held layer | a sign (`src/gl/sign.js`) standing in the world under the mark: the lens drifts past it and dives through the mark beside it |
| New friends who share your values. · the tags | over the world; three coloured pills | a sign over the people, in front of the crowd and drifting with the lens; soap bubbles rise through the words; the tags are beads of ink that float up out of the crowd, each word hanging under its bead, popping as the icon arrives |
| 1 Pick what matters to you | a badge and two lines in a band above the phone | the phone turns to its caption, which stands in the sky at its left (the lens racks focus from the words to the phone); a bubble drifts through the words; each tag you tap lets go a bead of its colour that floats to the words and sits after "…to you"; when Bub goes looking, the beads fly into your orb and fill it |
| 2 AI finds people who share them | in front of the crowd, the crowd veiled behind it | a sign in the universe's clear core, carried with the flight a beat behind its turns: Bub flies in front of it, the crowd streams behind it, bubbles pass across it |
| Wealth first · Health first · Family first | white pills | labels hanging under each person's bubble, at their depth |
| 3 Chat anonymously for 3 days | the band | beside the turned phone, as in step 1 |
| No names. No photos. Just talk anonymously. · Day 1 · 2 · 3 | the band, and Day N with dots | beside the phone, which turns on a turntable; "Day 1" heads the words and rolls to 2 and 3 at each dawn; each day's sun crosses behind them, the letters dark against it with a rim of its light |
| 4 It takes two yeses. | the band | beside the turned phone |
| You're both in! | in the ground, lit and shadowed | a sign in the bursting universe (people stream past in front of it and behind it), its feet behind the faces' crowns |
| Hana, 26 · Sofia, 28 · what they share | names with shadows; a white chip | names hanging under the faces; what they share as two beads of ink with their words |
| almost → friends | lit and shadowed | "almost" is a soap film: its colours run as it swells and drains, it goes black, it pops; "friends" is left |
| Same values. New friends. · Friendship is the whole point. | top band, the sky fogged behind it | inside the crowd: the friends gather above, beside and below the words (a pocket only as big as the words need), born from the middle of the group outward; the words stand deeper than the friends (they shrink less as the lens eases back) and clear bubbles rise through them |
| almost / friends.ai · Make friends outside your bubble. | lit and shadowed | under the mark, plain; no shadow |

**The Chinese cut** uses the same placements. Chinese captions keep the writer's breaks and break only at their phrase
marks (copy.js z()), are led at 1.14 and aligned on their ink, and may take a little more of the column (Han lines are
short and dense); when a line is too long for your picks' beads to follow it, they sit in a row under it.

## Rules kept from the release

- **Not dating, by construction:** at the reveal the two bubbles' wall tears and they spring apart, two people. They
  never merge into one bubble (v5 merged them; that reads as a couple).
- **The brand's colours exactly:** every ink is the brand's hex decoded to linear light once (`tools/check_liquid.mjs`).
- **Faces read first:** a friend's film clears toward its middle; its colour lives at the rim.
- **One bright world:** no night, no dusk, nothing dark (the released film's frame gate passes unchanged).
