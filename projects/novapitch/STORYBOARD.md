# Nova Pitch — storyboard (reel 04, final cut)

**One line.** A deck that is sent is a line that goes out and never comes back. Nova Pitch brings it back to life:
it carries your deck, carries their question and your answer, returns home as signal, and finally signs the N.
The film opens on a galaxy of decks going dark and ends on the same galaxy igniting and collapsing into the mark.

**Grid:** 120 BPM, so 1 beat = 0.5 s = 30 frames and 1 bar = 2 s. Every cut and hit lands on a frame boundary.
30 bars = 60 s, 1920×1080, 60 fps.

**Rules:**

- **No chrome.** No HUD and no decorative micro-labels.
- **Say it plainly.** The product is named in the first 10 seconds, then walked through in four numbered steps. These are the site's own *How it works*, with its gradient step badge.
- **Sourced words.** Every word traces to the site, the brand bible, the OG card or the product's demo data.
- **Reading time.** Every string stays fully legible for at least **0.5 s + 0.375 s a word**. That is 0.5 s to find it (a saccade plus a first fixation) and a 160 wpm read, the slow end of the BBC's rate for text over moving pictures. `tools/check_reading.mjs` measures this from the rendered frames.
- **Transitions carry.** No act boundary drops to black. Something always carries across: the step bar, a point of light, a slide, or the line. `tools/check_frames.py` reports dips and drops.

| Bars | Time | Act | Picture | Words |
|---|---|---|---|---|
| 1–3 | 0–6 | I · Silence | Frame one: the Luminex slide in extreme close-up, lit by a sweep. Powers of ten: the camera tears out through a lit spiral arm to a whole galaxy of decks. The lights go out along the arms, closing in on ours, the last light; typing dots appear, stop; it goes dark. | **Most decks get ignored.** |
| 4 | 6–8 | II · Ignition | **Drop.** Our deck erupts into a nova, a new star in the galaxy; its wave relights the arms. | **See why yours won't.** |
| 5–6 | 8–12 | | The dive through the galaxy into the light, which cools into Nova, the glass orb; the galaxy unfolds around it. | **Meet Nova Pitch.** |
| 7–8 | 12–15 | III · Upload | The eight slides stream past the lens and are swallowed by the orb, scanned in flight. | **1 Upload your deck.** |
| 8–11 | 15–22 | | The title bar rolls to 2. The Knowledge Base builds beside the orb, each answer riding a line out of it, and holds to be read; the answers fold back in and the orb gathers itself. | **2 Build your Digital Twin.** |
| 12–13 | 22–26 | IV · Share | The title bar rolls to 3 as Nova swells and implodes: its glow gathers into a star instead of vanishing. The star opens into the line, the line draws the link field (a cobalt pool keeps it lit); the URL types in; copy → check. | **3 Share one link.** |
| 13–14 | 26–28 | | The line launches through the dead decks and powers on the recipient's screen. | — |
| 15–18 | 28–36 | V · Engage | The recipient's room, seen undimmed first. *How fast does it pay back?* The Digital Twin answers in its voice (the avatar becomes Nova while it speaks); Slide 5 pops on "slide five"; a click jumps the deck to 7.2 months, and the push holds on it. | **4 They ask. / Your Digital Twin / answers. / In your voice.** |
| 19–23 | 36–46 | VI · Signal | Slide 5 flies home, slowly enough to follow, into the owner's attention row; attention rises off every slide; the top questions; **Jordan Lee flagged interest.** folds into a lime point while the field fades up under it. | **See what people actually care about.** |
| 24–26 | 46–52 | VII · Payoff | The point whitens into the line's origin; the line races out of it through the dead decks and each one ignites; the groove drops to the breakdown as "silence." lands; the field swirls into the spiral galaxy and collapses to a star. | **Stop sending documents / that end in silence.** |
| 27–30 | 52–60 | VIII · Signature | The star becomes the pen: it travels to the N's first stroke and signs it; the gradient tile blooms on the final hit (the same tile as the step badges: 1, 2, 3, 4 … N). | **Nova Pitch \| Pitch Better.** / *One link. Your whole pitch — that answers back.* / Start free · novapitch.ai |

**Continuity chain:** slide → galaxy → last light → nova → orb → pages → knowledge → orb → star → line → link
field → line → screen → question → voice → slide 5 → attention row → interest → point → line → lit galaxy → star → pen → N.

**Data thread:** slide 5's *7.2 months* is uploaded (bar 7), remembered (bar 8), asked about and answered (bars
16–17) and comes back as the hottest slide (bar 19).
