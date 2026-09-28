# Motion reels — rendered entirely from code

Motion-design films where every frame is rendered by code (three.js, Canvas 2D, hand-written GLSL) and
every score and sound effect is synthesised by code (Web Audio), captured frame-exactly with headless
Chrome. Designed and built by Claude (Anthropic's model) in [Claude Code](https://claude.com/claude-code) sessions.

https://github.com/user-attachments/assets/b7a81968-4e57-4007-8f57-6759430e55c2

| Reel | Length | What it shows | |
|---|---|---|---|
| [01 · Claude motion reel](projects/claude-reel/) | 15 s | Type, a torus knot, 80k GPU particles, a liquid shader, a graph editor — one idea per bar | [![](projects/claude-reel/docs/poster.jpg)](projects/claude-reel/) |
| [02 · Adswinning](projects/adswinning/) | 30 s | Product film: 4,032 instanced ad frames, a refracting loupe, rebuilt product UI, an anamorphic 3D logo lock | [![](projects/adswinning/docs/poster.jpg)](projects/adswinning/) |
| [03 · Zemyth](projects/zemyth/) | 30 s | Brand film hosted by a procedural 3D mascot: video-in-type, a card-flip video wall, 357 coins that become the logo, a VO-synced headline system | [![](projects/zemyth/docs/poster.jpg)](projects/zemyth/) |

Each reel has a `README.md` (what you're watching, how to run it) and a `LEARNING.md` (workflow,
decisions, every bug with root cause and prevention, measured quality gates).

## Run

Node 22+, Google Chrome and ffmpeg (Python 3 with Pillow + numpy for the gates). Everything runs from the repo root:

```bash
npm install
npm run preview                  # http://localhost:5173/projects/<reel>/ — click to play
npm run stills && npm run render # reel 01
npm run aw:stills && npm run aw:render && npm run aw:check   # reel 02
npm run zm:assets && npm run zm:render && npm run zm:check   # reel 03 (needs a local Zemyth site checkout, see its README)
```

Renders are deterministic: seeded randomness, and each frame is a pure function of time.

## License

Code: [MIT](LICENSE). Open-source fonts come from npm (SIL OFL); three.js and Lucide are MIT/ISC.
Reel 03's footage, photos and two display fonts belong to Zemyth or their foundries and are **not**
included — the prep script copies them from a licensed local checkout.

*Not an official Anthropic project.*
