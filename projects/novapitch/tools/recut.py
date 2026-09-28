# Re-cut the score to the film's bar map, on the bar grid.
# Take t6 was composed for the first, 21-bar (42 s) cut. Its groove (bars 5–16) is a steady 4-bar loop, so the
# 30-bar (60 s) cut repeats groove bars at two splices where the music comes back round to itself. Each splice was
# chosen by a spectral cost: how far the bar it lands on differs from the bar the music would have played next, and
# how far the bar it leaves differs from the bar that normally precedes the landing. Everything after the groove
# (the breakdown and the finale) plays exactly as composed.
#   python3 projects/novapitch/tools/recut.py            → assets/music/score.mp3 (+ splice report)
import os, subprocess, json
import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
MUSIC = os.path.join(HERE, '..', 'assets', 'music')
SOURCE = os.path.join(MUSIC, 'score-t6.mp3')
OUT = os.path.join(MUSIC, 'score.mp3')
SR, BAR = 48000, 2.0
PHASE = 0.008            # measured grid phase of t6 (tools/beats.py); kept, so bars 1–4 (and the drop) do not move
XF = 0.03                # equal-power splice crossfade, ending on the downbeat so the new bar's attack masks it
# film bar → t6 bar (1-indexed). Splices: after film bar 10 (t6 10 → 7) and after film bar 16 (t6 12 → 9).
MAP = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10,      # void · the drop · It reads
       7, 8, 9, 10, 11, 12,                # It reads · One link (t6 9–10: the build into the room, as composed)
       9, 10, 11, 12, 13, 14, 15, 16,      # Conversation · Signal · the last groove bar before the breakdown
       17, 18, 19, 20, 21, 22]             # breakdown · finale, as composed

def decode(path):
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', path, '-ac', '2', '-ar', str(SR), '-f', 'f32le', '-'],
                         capture_output=True, check=True).stdout
    return np.frombuffer(raw, np.float32).reshape(-1, 2).astype(np.float64)

def at(b):               # first sample of (1-indexed) bar b
    return int(round((PHASE + (b - 1) * BAR) * SR))

src = decode(SOURCE)
src = np.vstack([src, np.zeros((at(MAP[-1] + 2) - len(src) + SR, 2))]) if len(src) < at(MAP[-1] + 2) else src
n_out = at(len(MAP) + 1)
out = np.zeros((n_out, 2))
xf = int(XF * SR)
fade_in = np.sin(np.linspace(0, np.pi / 2, xf))[:, None]
fade_out = np.cos(np.linspace(0, np.pi / 2, xf))[:, None]

# runs of consecutive source bars play as one contiguous piece; a splice joins two runs
runs, i = [], 0
while i < len(MAP):
    j = i
    while j + 1 < len(MAP) and MAP[j + 1] == MAP[j] + 1:
        j += 1
    runs.append((i + 1, MAP[i], MAP[j]))     # (first film bar, first source bar, last source bar)
    i = j + 1
# Each splice is one window [downbeat − XF, downbeat): the outgoing run's last XF of its bar fades out while the
# incoming run's own lead-in (the XF before its downbeat) fades in; from the downbeat on, only the incoming run plays.
for k, (fb, s0, s1) in enumerate(runs):
    o0, a0, a1 = at(fb), at(s0), at(s1 + 1)
    lead = 0 if k == 0 else xf               # the first run starts at sample 0 (its pre-roll is the grid phase)
    seg = src[(0 if k == 0 else a0 - lead):a1].copy()
    if k > 0:
        seg[:xf] *= fade_in
    if k < len(runs) - 1:
        seg[-xf:] *= fade_out
    lo = 0 if k == 0 else o0 - lead
    end = min(n_out, lo + len(seg))
    out[lo:end] += seg[:end - lo]

# splice report: onset strength at every film downbeat (a splice must not stand out against natural bar lines)
N, HOP = 2048, 480
mono = out.mean(axis=1)
win = np.hanning(N)
fr = 1 + (len(mono) - N) // HOP
spec = np.array([np.abs(np.fft.rfft(mono[f * HOP:f * HOP + N] * win)) for f in range(fr)])
flux = np.r_[0, np.maximum(0, np.diff(np.log1p(1000 * spec), axis=0)).sum(1)]
t = (np.arange(fr) * HOP + N / 2) / SR
med = np.median(flux[flux > 0])
splices = {r[0] for r in runs[1:]}
print('film bar  source  downbeat onset (×median)')
for b in range(5, len(MAP) - 5):
    t0 = PHASE + (b - 1) * BAR
    m = (t > t0 - 0.06) & (t < t0 + 0.06)
    print(f'{b:>6}    {MAP[b - 1]:>4}    ×{flux[m].max() / med:5.1f}{"   ← splice" if b in splices else ""}')

pcm = (np.clip(out, -1, 1) * 32767).astype('<i2').tobytes()
subprocess.run(['ffmpeg', '-y', '-v', 'error', '-f', 's16le', '-ar', str(SR), '-ac', '2', '-i', '-',
                '-c:a', 'libmp3lame', '-b:a', '320k', OUT], input=pcm, check=True)
json.dump({'source': 't6', 'phase': PHASE, 'map': MAP, 'crossfade_s': XF}, open(os.path.join(MUSIC, 'score-map.json'), 'w'), indent=1)
print(f'score → {os.path.relpath(OUT)} ({len(out) / SR:.2f} s, {len(runs) - 1} splices)')
