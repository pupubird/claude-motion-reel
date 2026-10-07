# Playbook — how these films are made and judged

The working rules behind every reel in this repo, distilled from the owner's notes on reels 01–06 and from each reel's
`LEARNING.md` (which holds the reel-specific detail: versions, decisions, every bug with its root cause and
prevention). Each rule was learned from a cut that broke it; the reel that taught it is in brackets.

## The bar

- These are client-grade films the owner can publish and résumé-grade showreel pieces. "Go all out": build end to end,
  choose the tools, generate what is needed, and report the spend and every gate result with each cut. Outward-facing
  actions (push, publish, delete) still wait for the owner's go. [02]
- Every scene is designed, not assembled: "highest possible design taste… genuine AAA quality, not generic 3D AI
  slop". [05]
- Something worth watching every few seconds. A film may run past 60 s if every beat earns it. [06]

## Openings

- The first 2 seconds decide. Say the topic in the viewer's own words (reel 06: "How to make more friends") and land
  the payoff by 2.0 s. A clever statistic or an insider metaphor that needs decoding is not a hook. [06]
- Frame 0 is already moving, with a hit and words on it, and the music plays full from the first beat. [06]
- One striking subject on a quiet field, often revealed at a new scale, never a dense field of equal elements. A face
  that meets your eyes; at most two words in the first 0.3 s. [04, 06]
- Never a logo card first: a brand character opens and the name follows the payoff. [06]

## Clarity for a viewer with zero context

- The viewer scrolled in from somewhere else and knows nothing (the curse of knowledge). Say what the product is and
  what it is worth in plain words, then show each step as words with the real UI on screen at the same time. [06]
- Metaphors may decorate; they never carry the meaning. One idea per beat; no stacked posters. [06]
- The message is clear and direct before it is clever. [04]

## Type and reading

- Big, legible type. No HUD chrome: no timecodes, chapter captions, technique notes, micro-labels or corner brackets. [02, 03]
- Reading time: hold ≥ 0.5 s to find the text plus 0.375 s a word (160 wpm), measured on rendered frames, aiming at
  1.0–1.7× that while the motion keeps going. [04] The rule is a guide, not a gate: a known line, a short label or a
  phrase completing one on screen can be quicker, and a film is never slowed just to satisfy the number. [05]
- A word that has fully formed holds long enough to land (~1.5 s at a scene's key line). [05]
- Type lives in the scene (occluded, lit, refracted, carved, revealed by light), never slapped on top. Effects on type
  settle before the read; type is tinted with a solid colour, never alpha. [05, 06]
- Light and shadow do not integrate type that still sits in a band: place each line by its subject, not by the frame —
  beside it (the phone turned toward its words), on it (written on the wall), under it (a label hanging from its
  bubble), inside it (words among the crowd) or behind it (the faces' crowns over the words' feet) — in the shot's own
  space and lens, moved by the scene's events. No caption band, plate, badge, drop shadow or fog behind type, and the
  product is never faded to make room for words. Check a contact sheet of every text moment: a frame that reads
  "headline over picture" is not done. [06]

## Pace, motion and transitions

- Energetic motion: leave fast, land soft, bouncy springs, hits with a flash and a shake; slow-in/slow-out reads
  floaty. [06]
- Short shots with one deliberate breath. The breath that worked: a slow push onto what everyone is waiting for, in
  near-silence, a character holding its breath. [02, 06]
- Something carries across every act boundary (a point of light, a title bar, a line, an object). No hard cuts; never
  a dip to black between two lit shots. Every 3D↔2D hand-off is checked at full resolution. [03, 04, 06]
- Endings are an event (a burst, light, the mark born in solid material), not a fade-in. [05]

## Sound

- Score: produced (ElevenLabs Music) and measured on the film's bar grid (tempo, key, per-bar level, hits). Change its
  length by inserting or cutting whole bars sample-exactly, not by regenerating. [04, 06]
- Every effect comes from a cue sheet built from the picture's own anchors, so sound and picture cannot drift. [06]
- Interface sounds are clicks, taps and pops, never pitched chimes; the score carries the melody. [06]
- If a film has a voice, the voice carries the whole film. [05]
- A state change the story hinges on (a lock opening) gets its own visible beat and its own sound before the payoff. [06]
- −14 LUFS for web and phones, true peak ≤ −1 dBTP after encoding. "TV" in a brief means production value, not a
  broadcast spec. [05, 06]

## Product, brand and devices

- Product UI is shown large, rebuilt at film scale, with camera push-ins on what matters. [02, 04]
- A real device, whole, then the camera pushes in; never a cropped or oddly sized phone. A phone has a phone's
  proportions (an iPhone 16 Pro's screen is 402 × 874 pt, 19.5 : 9), never the video frame's 9 : 16. [06]
- A client's brand is followed exactly from its brand files (palette, type, shapes); the devil is in the details. [03]
- A conceptual logo payoff beats a logo card (reel 03's chart → negative space → mark). [03]

## Look

- Agree the look on one look-dev frame before building acts. Light themes (or night → day) over dark ones. [05]
- Design what polished surfaces reflect (soft-box studios, gradients); check specular shapes at hero size for
  accidental brand marks (a four-pane window read as an OS logo). [05, 06]
- Luxury product goes hyper-real (path-traced), metals stay saturated, no flat uniform slabs; never a dark, lumpy stone
  as the hero. [05]
- Characters live in the world (depth, light, contact, reactions), never stickers on top of it. [06]

## People

- Ordinary-looking people in casual phone snapshots, never model-pretty. [06]
- Cast to the brief's audience (reel 06: young, comfortable lives, an international cast). [06]
- Anything that carries invented data (spend, reach, results) uses fictional brands and people. [02]
- Show abundance without crowding: a few dozen big faces with air between them, never a packed cluster of small ones
  (trypophobia). [06]
- Client media, real people's photos and licensed fonts stay local, and so does everything built from them; the
  public repo holds only what may be published. [03, 05]

## Copy

- Plain, human, in the viewer's own words; none of the category's worn phrases. [06]
- Say the positive ("Friendship is the whole point."), not the disclaimer ("not dating"). [06]

## Other languages

- A second language is the same film: the same picture, timing and score. Only the words change, and they are
  adapted into the viewer's own idiom, not translated word for word (三观一致 for "share your values"; 圈子 for the
  social "bubble"). [06]
- The brand keeps its own script in every cut. A hero word can hand over to it on screen: 朋友 flips into
  "friends". [06]
- "Font must be great": a real face for the script, with real weights (Noto Sans SC, variable 100–900). Latin and
  digits stay in the film's Latin faces. Never a system fallback or a synthesised bold, and licensed so the repo can
  ship it. [06]
- Set each script by its own metrics, measured in the font: Han ink rises 0.81–0.87 em against 0.70 for a capital.
  Centre lines on their ink, lead Han display lines at about 1.14, and re-space anything stacked (badges, hero
  words). [06]
- Punctuation and line breaks are typography: full-width in Chinese, half-width where a full-width form leaves a gap,
  breaks between words (ICU) with kinsoku, and the writer's own break where an idiom would split. [06]
- Reading time per script: 0.23 s a Chinese character (260 a minute) against 0.375 s an English word. [06]

## Process

1. Research first, in parallel, into sourced reports (market, UI, vibe, sound, naming; hooks for openings).
2. Look-dev the riskiest pieces at full resolution before any act.
3. Freeze every anchor in one timing file; reading an anchor that does not exist throws.
4. One module per act. Stills after every change, a contact sheet per act, frame strips through every hand-off.
5. Gate every cut before anyone sees it: frames (flips, dips, drops), jumps (unplanned cuts), reading time, audio
   (loudness, true peak, tonal and silence gates).
6. Present each version on one review page: the notes answered, the measurements, the spend.
7. Long jobs run as tracked background tasks, generation stays inside the plan's limits, and spend is measured.
8. Release: 16-sample masters (1080p, and 4K where it helps), gates on the masters, a web encode, a GitHub release.

## Engineering rules learned the hard way

- Fail loudly: tools refuse arguments they don't understand, scenes throw on missing anchors or assets, layouts throw
  when they break their own rules (reel 06's anti-crowding check).
- Renders are deterministic: seeded randomness, every frame a pure function of time.
- Edit source with exact replacements that assert their match count; never `sed -i` on code.
- A failed render must not leave gigabytes of intermediates behind; clean up with `find … -delete`, not a bare glob.
- Secrets live in git-ignored `.env` files and are never printed; test for a key with `grep -q`, never `grep -c`.
- Shared GPU state has one source of truth.
- Words live in one table per cut, with the same shape checked at load. Before a new cut is judged, prove the
  original unchanged: a pixel diff against a second render of the same code (run-to-run noise is real), and its cue
  sheet byte-identical. [06]
