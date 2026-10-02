# 翡月荟 v4 — 拨云见月

![Poster frame](docs/poster.jpg)

A 40 s brand film for 翡月荟 (a jadeite house, 你的翡翠管家), released photoreal — [watch the release](https://github.com/pupubird/claude-motion-reel/releases/tag/feiyuehui-v1.0).
One film, two cuts:

- **The code render** (1920×1080, 60 fps): every frame rendered in code with three.js (headless Chrome, ANGLE/Metal),
  accumulated over 16 sub-samples → `out/feiyuehui-v4.mp4`.
- **The release** (1920×1080, 24 fps): the same film rendered again as grey clay, re-rendered shot by shot by
  Seedance 2.5 against the client's own product photographs (each piece checked against its photograph), with every
  title and the logo composited back from the code render → `out/feiyuehui-v4-real.mp4`.

No voice: an ElevenLabs score and sound design. Shot list and concept: [`STORYBOARD.md`](STORYBOARD.md). How it was
made, every bug and its prevention: [`LEARNING.md`](LEARNING.md).

**What you're watching.** The founder's line 拨开云雾见明月 staged literally — a flight over a dawn sea of cloud
until the imperial-jade ring rises out of it like the moon — then the craft in three acts (设计 · 雕刻 描金 · 镶嵌),
a sunrise drop, the collection orbiting the sun, and a burst that leaves the phoenix and the name in gold.

## Run (from the repo root)

```bash
node projects/feiyuehui/v4/render.mjs                                   # 16 samples → v4/out/feiyuehui-v4.mp4 (≈ 25 min, M2 Pro)
node projects/feiyuehui/v4/render.mjs --scale=0.5 --samples=2 --out=…   # preview
node projects/feiyuehui/v4/render.mjs --shots=craft --stills=1225 --dir=lookdev/x   # stills of one shot
python3 projects/feiyuehui/v4/tools/check_frames.py projects/feiyuehui/v4/out/feiyuehui-v4.mp4   # frame gate
python3 projects/feiyuehui/v4/tools/check_audio.py projects/feiyuehui/v4/audio/mix.wav            # audio gate
```

The photoreal cut needs the Seedance takes, which stay local (they are made from the client's photographs):

```bash
python3 projects/feiyuehui/v4/tools/v2v_comp.py --selftest     # the type-composite guard
python3 projects/feiyuehui/v4/tools/v2v_edit.py projects/feiyuehui/v4/tools/real_edit.json projects/feiyuehui/v4/out/feiyuehui-v4-real.mp4
```

`npm run fy:real` runs both, then the gates. How each shot was made — the clay blockout, the prompts and reference
photos, the retimes, the one Kling edit — is in `tools/seedance_plan.json` (§ `release`).

Audio: `tools/music.py` (score, ElevenLabs music) → `tools/sfx.py` (sound design, generates what is missing) →
`tools/mix.py --score c6` (placement from `tools/cues.py`, −14 LUFS / −1 dBTP → `audio/mix.wav`). The key is read
from `ELEVENLABS_API_KEY` or the repo-root `.env` (git-ignored); it is never written anywhere else.

## Needs (local only)

The three.js asset package `shared/assets/3d/`, the logo traces `shared/assets/derived/`, and the Seedance takes with
their reference photos (`out/seedance/`) are built from the client's media and stay local (git-ignored, client consent
2026-09-30). Nothing committed in `v4/` is a client asset.

## Layout

| Path | What |
|---|---|
| `src/config.js` | the 120 BPM grid: every anchor time (`T`) the picture, cues and score share |
| `src/engine.js`, `src/gl/post.js` | accumulation renderer: jitter, motion blur, area-light jitter, DOF, bloom, glints, god rays, tonemap |
| `src/shots/` | `heavens` (0–14 s), `craft` (设计 · 雕刻 · 镶嵌, 14–24 s), `collection` (24–40 s); `lab`, `logotest` are look-dev |
| `src/worlds/` | the sky (clouds, sun), the atelier (paper, bamboo), the beam room (moon window, shaft, dust) |
| `src/lib/` | jade glow, 描金 gilding, assembly, 3D type, the 3D lockup, cookie, fill |
| `src/env.js` | reflection studios: per-look PMREMs, plus per-material ones (gem, gold plate, jade) |
| `tools/` | audio pipeline, gates, contact sheets, glyph extraction; the photoreal pass (`v2v_edit.py`, `v2v_comp.py`, `design_check.py`, `seedance_plan.json`, `real_edit.json`) |
