# almost friends v2 — the crazy all-out version

The released 66 s film (reel 06), rebuilt from the client's verdict on the special edition — "still too low quality, not
特效 enough, not cool enough" — and the owner's direction: "要高级感，不一定要同一个design", "对标苹果", then on the Apple
style frames, "too simple, i want a crazy all out version". The cut's clock, words and score are the release's (the
owner approved its tempo and message); everything you see is new. The treatment is [`CRAZY.md`](CRAZY.md); the twelve
references it learnt from are studied one per doc in [`research/refs/`](research/refs/README.md).

**The look.** Premium (Apple's language: neutral grounds, colour only in light, big tight type, real glass and metal lit
by a studio) pushed to spectacle, and one light ramp across the whole film: a night through the app's first steps, a
sunrise across the three days, a dusk for the wait, daylight from the reveal (`src/v2look.js`, `src/world/sky.js`).

**The set pieces** (each beat's signature move; anchors from `src/score.js`):

| t (s) | | Where |
|---|---|---|
| 0–2 | Bub, a glass orb with light inside, knocks on a pane of glass; each knock a ring of light and a chrome word slamming in; cracks of light run out of him; the pane shatters past the lens | `scenes/x_hook.js`, `gl/shards.js`, `gl/text3d.js` |
| 2–3.4 | two lights streak in and collide into the mark; friends falls into almost / friends.ai; a prismatic dive through its wall | `scenes/x_hook.js` |
| 3.4–7.5 | a helix of faces in glass orbs; the value word by word; the app icon slams in; Bub dives in | `scenes/x_hook.js`, `gl/faceorb.js` |
| 7.5–14.9 | the phone on the night; light on each pick; the screen's edge alight while Bub looks | `scenes/howto.js` |
| 14.9–22.8 | a universe of people as light; Bub's search | `gl/universe.js` (uGlow) |
| 32 | the white drain, the hit, SAME!! in light-filled 3D glass behind the phone, glass droplets | `scenes/howto.js` (sameWord, sameFx) |
| 34–41 | three days as a sunrise, the sun flaring in the lens | `world/sky.js`, `scenes/lab_fx.js` flare |
| 44–50 | a gold padlock in two crystal dial rings: yours clicks home, theirs spins through the wait and clicks; the shackle springs open | `scenes/unlock.js` (lockRig) |
| 50–56 | the phone drops out of frame; the wall between the two lights pops and a crowd of clear glass people bursts past the lens; the lights clear into glass lenses over the faces; You're both in! in 3D | `scenes/unlock.js` |
| 56–66 | friends under glass lenses; everyone lands in the mark; almost friends.ai in 3D | `scenes/foam.js` |

**The Apple pass** (owner on the crazy cut: "need to improve the aesthetics … what apple would say yes with highest
possible standard on every scene, especially on the fonts"). Type set the way apple.com sets its own headlines (read
from its stylesheet, 2026-10-09: SF Pro Display at weight 600; 80 px at line-height 1.05 and −0.015 em; tracking tightens
as type grows): every word in Inter Display SemiBold (`assets/fonts`, rsms/inter 4.1, OFL — the open face closest to SF
Pro Display; SF Pro itself is licensed for UI mock-ups only, so it sets the app's UI on the phone and nothing else),
tracked by size (`src/v2type.js`). 3D type in two finishes (`gl/text3d.js`): satin titanium (no glare) and light-filled
glass whose gradient runs continuously across a word or line (never one colour per letter); graphite for "almost"; white
and #A1A1A6 on the night, #1D1D1F and #6E6E73 on the day; the gradient (blue → violet → pink → coral) only on a
highlighted word, a step's numeral or the name. The universe's people are cool white light; your people turn warm. The
step caption in the universe is composited over the frame (Bub's lit orb hid it).

Light and composition, scene by scene: on the day (white) frames no hit adds light — the lock's open and the wall's pop
are a punch, a shake and a ring of air (`shock.disp: 0` bends the frame without the colour split, which fringed every
edge with a rainbow); the SAME!! hit on the night stays the film's biggest light, without a white-out. The dial rings
hug the lock, clear of the sheet's words. The phone leaves at the drop by falling out of frame, not by fading to a
ghost; SAME!! leaves upward. The reveal's people are clear glass (`uGlass`: pale bodies at 60 % had piled up into a
milky veil), the pane that shattered at the lens there is gone (on white it read as haze; the hook's pane opens the
film), and so are the drawn rings, the coloured glints and most of the droplets: the white stays clean round the faces.
A gradient across a line now survives a glyph's pop (`type.js` lays it again in the glyph's own space; it had fallen
back to its first stop, so "New friends." read flat blue). "almost" is Apple's secondary grey on the night, graphite
on the day.

**The engine's new parts** (all in this folder): 3D type from Inter Display's outlines (`gl/text3d.js`), a night/day
studio to mirror (`studioEnv`), shards (`gl/shards.js`), faces in glass (`gl/faceorb.js`), and in the liquid layer
(`gl/liquid.js`) slab and shackle shapes, polished metal, a ball lens, an orb with light inside (it glows on the night
and filters as coloured glass on the day), a product studio's black cards; in the composite (`post.js`) god rays, a
shockwave, the colour split, a pane bowing, a dive tunnel, a whip, light beams.

**Sound.** `tools/audio.py`: the released mix under a layer of 95 new cues (glass knocks, cracks, the hook's shatter,
dives, the SAME!! impact, the dial's ratchet — 62 ticks slowing through the wait — its clicks, the reveal's pop and the
glass crowd's rush of air, the final hit), mastered to −14 LUFS / −1.5 dBTP. The glass is synthesised: ElevenLabs
refused new effects (the account's payment had failed). `render.mjs` encodes the master's sound with Apple's
AudioToolbox AAC encoder where ffmpeg has it (macOS): ffmpeg's own encoder rang up to 2.6 dB over the mix's sharpest
pops (a −1.3 dBTP mix came out at +0.15, clipping on playback); AudioToolbox holds −1.3.

## Run (from the repo root)

```bash
node projects/almostfriends-v2/render.mjs --stills=2.0s,32.2s,49.6s,64.8s --dir=stills --samples=8
python3 projects/almostfriends-v2/tools/audio.py      # → audio/mix.wav
node projects/almostfriends-v2/render.mjs --samples=16 --workers=3 --crf=14 --wav=projects/almostfriends-v2/audio/mix.wav --out=projects/almostfriends-v2/out/almostfriends-v2-apple.mp4
python3 projects/almostfriends-v2/tools/check_frames.py projects/almostfriends-v2/out/almostfriends-v2-apple.mp4
python3 projects/almostfriends-v2/tools/check_jumps.py projects/almostfriends-v2/out/almostfriends-v2-apple.mp4 --allow=0.25,0.5,2.0,3.4,6.75,31.5,32.0,49.5,50.5
```

The labs (`--scenes=lab_pick`, `lab_same`, `lab_apple`, `lab_type`) are the look-dev that led here; `scenes/index.js`
lists the film's own scenes.
