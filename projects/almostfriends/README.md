# almost friends — reel 06

![Poster frames](docs/poster.jpg)

A 66-second vertical product film for **almost friends** (almostfriends.ai), a friend-making app. You tell an AI what
matters most in your life; it finds people who put the same things first; you chat anonymously for three days; only if
you both tap Unlock do you see each other. Not dating: friends, outside your bubble.
[Watch the release](https://github.com/pupubird/claude-motion-reel/releases/tag/almostfriends-v1.0).

- **Format:** 1080×1920 (9:16), 60 fps, 120 BPM, 33 bars. Masters at 1080p and 4K (2160×3840), every frame rendered in
  code (three.js, Canvas 2D, GLSL) in headless Chrome, accumulated over 16 sub-samples.
- **Sound:** no voice. A score composed with ElevenLabs Music, spliced to the picture's bar grid. Every sound effect is
  synthesised by code from a cue sheet built from the picture's own timing.
- **Cast:** 32 fictional people, generated as casual iPhone snapshots with GPT Image 2 (Higgsfield).
- **Two cuts:** English (the original) and Chinese (中文版, Simplified), rendered from the same code. The Chinese cut has
  adapted words, its type set in Noto Sans SC (the Source Han Sans design), and its own cue sheet and mix over the same
  score. Every word on screen lives in `src/copy.js`.

Shot list and concept: [`STORYBOARD.md`](STORYBOARD.md). How it was made, the owner's notes on every cut, the rules a
cut is judged by, and every bug with its prevention: [`LEARNING.md`](LEARNING.md).

## What you're watching

The idea is **outside your bubble**: "your bubble" is the everyday word for your circle, and chat bubbles are the app's
interface, so the film is made of one object at two scales, a flat chat bubble and a real soap bubble (thin-film
interference, rendered).

1. **Hook, 0–2 s.** The screen is the wall of your bubble. Bub, the AI host, knocks on it from outside, three times,
   and each knock lands a line: *How to / make more / friends*. One push, the film thins to a black spot, and it pops
   on the music's drop. "friends" survives and becomes the name.
2. **The app, 2–8 s.** The 3D mark (two soap bubbles sharing one wall), the value ("New friends who share your
   values."), the app icon, Bub's dive into it, the launch.
3. **Four steps in one phone, 8–56 s.** Pick what matters to you; AI finds people who share it (a 3D flight in which
   Bub searches a universe of people: no, not this one… no… yes); chat anonymously for three days ("WAIT. Same!!");
   it takes two yeses (a slow push onto their slot in silence, their padlock springs open, the wall pops, two real
   faces).
4. **Friends, 56–66 s.** "almost" pops off the name; 26 friends pop in round the two of them, faster and faster; the
   two of them become the mark.

## Run (from the repo root)

```bash
npm run preview          # http://localhost:5173/projects/almostfriends/ — click to play, arrows to step
npm run af:stills        # 8-sample stills across the film → projects/almostfriends/out/stills/
npm run af:audio         # cue sheet → synthesised foley → mix with the score (−14 LUFS, −2 dBTP) → audio/mix.wav
npm run af:render        # 1080p master, 16 samples → out/almostfriends-reel-2026.mp4
npm run af:render4k      # 4K master (--scale=2) → out/almostfriends-reel-2026-4k.mp4
npm run af:check         # frame gate and jump gate on the 1080p master
npm run af:read          # reading-time check of every string on screen (advisory)

# the Chinese cut: the same steps with ?lang=zh (its own cue sheet, foley and mix; the score is shared)
npm run af:audio:zh      # → audio/mix-zh.wav
npm run af:render:zh     # → out/almostfriends-reel-2026-zh.mp4
npm run af:check:zh      # frame and jump gates on it
npm run af:read:zh       # reading time, Chinese counted per character (0.23 s each)
```

Quick previews: `node projects/almostfriends/render.mjs --scale=0.5 --samples=2 --workers=3 --out=…` (an animatic),
`--from` / `--to` for a range, `--stills=12.5s,…` for frames, `--lang=zh` for the Chinese cut. Renders are deterministic: seeded randomness, and every
frame is a pure function of time.

## Pipeline

| Stage | Tools | Notes |
|---|---|---|
| Timing | `src/score.js` | Every shot, hit and choreography anchor in seconds on the 120 BPM grid; reading an anchor that does not exist throws |
| Words | `src/copy.js` | One table per cut (English, Chinese) with the same shape, checked at load; per-cut type sizes where a script needs them |
| Picture | `src/scenes/` (`hook`, `howto`, `unlock`, `foam`), `src/engine.js` | Each scene declares 2D layers under and over one 3D scene; the engine accumulates sub-samples for motion blur |
| Score | `tools/music.py`, `tools/check_plan.py`, `tools/splice_score.py` | ElevenLabs composition plans, measured takes; the released score is `audio/music/v6a-s.mp3` (bars inserted and cut sample-exactly) |
| Foley | `tools/cues.mjs` → `tools/foley.py` | The cue sheet is built from the anchors (and each cut's words, `--lang`), so sound and picture cannot drift; transients only (a tonal gate) and a silence gate on the breath before the unlock |
| Mix | `tools/mix.py` | The score ducked for the breath and sunk under the hook's swell, two-pass loudnorm to −14 LUFS |
| Cast | `tools/gen_people.py`, `tools/face_crops.py` | Prompts in `assets/people/prompts-v6.tsv`; faces found with OpenCV's YuNet, crops in `assets/people/crops.json` |
| Gates | `tools/check_frames.py`, `tools/check_jumps.py`, `tools/check_reading.mjs` | Luminance flips, dips and drops; unplanned jumps between frames; time on screen for every string |

## Layout

| Path | What |
|---|---|
| `src/score.js`, `src/config.js` | The anchors and the format (1080×1920, 60 fps, 33 bars, the social safe band) |
| `src/scenes/` | `hook` (I–II: the knock, the pop, the name, the value), `howto` (III–VI: the phone, the universe flight, the chat, the unlock sheet), `unlock` (the reveal), `foam` (VII–VIII: the circle of friends, the mark) |
| `src/gl/` | The thin-film soap shader (`bubble.js`, `filmglsl.js`), Bub in 3D (`bub3d.js`), the universe of people (`universe.js`), the wall of your bubble (`membrane.js`), the planet of people (`planet.js`), the 3D mark (`mark3d.js`) |
| `src/ui/` | The mock iOS app: the phone, the camera that pushes in on it, chat bubbles, chips, the conversation script |
| `src/world/` | The sky, 2D bubbles and Bub's face, the mark and the app icon |
| `src/type.js` | Kinetic type: per-glyph springs, kerning-safe layout, Chinese set by its ink and wrapped between words, the reading-time log |
| `src/copy.js` | Every word on screen, per cut (`?lang=zh`) |
| `research/` | Six research reports (market, UI, vibe, sound, naming, hooks), every claim sourced |
| `assets/` | The cast (32 portraits and their crops), Noto Color Emoji (COLRv1), the land mask for the planet of people (Noto Sans SC comes from npm) |
| `audio/` | The cue sheet, the released score and its take metadata |

## Needs (local only)

- **ElevenLabs** (`tools/music.py`): only to compose new takes. The key is read from `ELEVENLABS_API_KEY` or the
  repo-root `.env` (git-ignored) and is never written anywhere else.
- **Higgsfield CLI**, logged in (`tools/gen_people.py`): only to generate new portraits. Its plan runs 8 jobs at once;
  the script retries rate limits.
- **YuNet** face model (`tools/face_crops.py --model …`): opencv_zoo's `face_detection_yunet_2023mar.onnx`, not
  included.

Kept out of the repo: the full-size portrait downloads and look-dev tests, the earlier casts, the third-party UI
reference screenshots used in research, the score takes and stems (the released score is committed), and the review
pages and animatics of each iteration. The release holds the finished film.
