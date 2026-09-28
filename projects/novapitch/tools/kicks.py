# The score's real hits, for the picture: low-band (< 150 Hz) onset strength at every eighth note of the 120 BPM
# grid, kept where it stands out from the groove around it. The 3D shots breathe on these (score.js hitPulse).
#   python3 projects/novapitch/tools/kicks.py assets/music/score.mp3 [--json assets/music/score-kicks.json]
import argparse, json, subprocess
import numpy as np

ap = argparse.ArgumentParser()
ap.add_argument('path')
ap.add_argument('--json')
ap.add_argument('--phase', type=float, default=0.008, help='grid phase of the take, s (tools/beats.py)')
# defaults calibrated on take t6: they recover 20 of the 21 hits picked by hand for the first cut
ap.add_argument('--k', type=float, default=1.8, help='keep hits this many times stronger than the local median')
ap.add_argument('--floor', type=float, default=0.30, help='…and at least this fraction of the strongest hit')
a = ap.parse_args()

SR, N, HOP = 48000, 2048, 240
raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', a.path, '-ac', '1', '-ar', str(SR), '-f', 'f32le', '-'], capture_output=True, check=True).stdout
x = np.frombuffer(raw, np.float32).astype(np.float64)
win = np.hanning(N)
lb = int(150 / (SR / N))
fr = 1 + (len(x) - N) // HOP
low = np.array([np.abs(np.fft.rfft(x[i * HOP:i * HOP + N] * win))[1:lb].sum() for i in range(fr)])
flux = np.r_[0, np.maximum(0, np.diff(np.log1p(100 * low)))]
t = (np.arange(fr) * HOP + N / 2) / SR

E = 0.25                                       # an eighth note at 120 BPM
grid = np.arange(a.phase, t[-1], E)
strength = np.array([flux[(t > g - 0.02) & (t < g + 0.045)].max(initial=0) for g in grid])
hits = []
for i, g in enumerate(grid):
    loc = strength[max(0, i - 16):i + 17]      # the two bars around it
    if strength[i] >= a.k * np.median(loc) and strength[i] >= a.floor * strength.max():
        hits.append(round(float(g - a.phase) * 4) / 4)   # on the grid, in film seconds
print(f'{len(hits)} hits: {hits}')
if a.json:
    json.dump({'kicks': hits}, open(a.json, 'w'))
