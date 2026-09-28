# Measure a score take against the 120 BPM storyboard grid.
#   python3 projects/novapitch/tools/beats.py assets/music/take1.mp3 [--png out.png]
# Reports: tempo (autocorrelation of spectral flux), grid phase, per-beat drift from the ideal grid,
# per-bar loudness (the section contour), and the strongest transient near each planned hit.
import sys, subprocess, argparse, json
import numpy as np

ap = argparse.ArgumentParser()
ap.add_argument('path')
ap.add_argument('--png')
ap.add_argument('--bpm', type=float, default=120.0)
ap.add_argument('--json')
a = ap.parse_args()

SR, HOP, N = 48000, 480, 2048
raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', a.path, '-ac', '1', '-ar', str(SR), '-f', 'f32le', '-'], capture_output=True).stdout
x = np.frombuffer(raw, np.float32).astype(np.float64)
dur = len(x) / SR

# spectral flux on log-magnitude, 10 ms hop
win = np.hanning(N)
frames = 1 + (len(x) - N) // HOP
spec = np.empty((frames, N // 2 + 1))
for i in range(frames):
    spec[i] = np.abs(np.fft.rfft(x[i * HOP:i * HOP + N] * win))
logs = np.log1p(1000 * spec)
flux = np.maximum(0, np.diff(logs, axis=0)).sum(axis=1)
flux = np.concatenate([[0], flux])
# low band flux (kick) separately: < 150 Hz
lb = int(150 / (SR / N))
kick = np.concatenate([[0], np.maximum(0, np.diff(logs[:, 1:lb], axis=0)).sum(axis=1)])
t = (np.arange(frames) * HOP + N / 2) / SR
env = flux - np.convolve(flux, np.ones(50) / 50, mode='same')
env = np.maximum(env, 0)

# tempo via autocorrelation between 70 and 180 BPM
fps = SR / HOP
ac = np.correlate(env - env.mean(), env - env.mean(), mode='full')[len(env) - 1:]
lags = np.arange(len(ac))
bpm_of = lambda lag: 60 * fps / lag
lo, hi = int(60 * fps / 180), int(60 * fps / 70)
lag = lo + np.argmax(ac[lo:hi])
# parabolic refinement
if 1 <= lag < len(ac) - 1:
    y0, y1, y2 = ac[lag - 1], ac[lag], ac[lag + 1]
    lag = lag + 0.5 * (y0 - y2) / (y0 - 2 * y1 + y2 + 1e-12)
bpm = bpm_of(lag)

# phase of the ideal grid (a.bpm) that maximises onset energy
P = 60 / a.bpm
phases = np.linspace(0, P, 200, endpoint=False)
def score(ph):
    bt = np.arange(ph, dur, P)
    idx = np.clip(np.round((bt - N / 2 / SR) * fps).astype(int), 0, len(env) - 1)
    return env[idx].sum()
ph = phases[np.argmax([score(p) for p in phases])]

# per-beat drift: local max of env within ±60 ms of each grid beat (only where there is an onset)
drift = []
for k in range(int(dur / P)):
    g = k * P + ph
    m = (t > g - 0.06) & (t < g + 0.06)
    if not m.any():
        continue
    j = np.argmax(np.where(m, env, -1))
    if env[j] > np.percentile(env, 80):
        drift.append((k, t[j] - g))
d = np.array([v for _, v in drift]) if drift else np.zeros(1)

print(f'{a.path}: {dur:.2f}s · autocorr tempo {bpm:.2f} BPM · best phase of the {a.bpm:g} BPM grid {ph * 1000:+.0f} ms')
print(f'beat drift vs grid (strong onsets, n={len(drift)}): median {np.median(d) * 1000:+.1f} ms · |p90| {np.percentile(np.abs(d), 90) * 1000:.1f} ms')

# per-bar loudness (RMS dBFS)
BAR = P * 4
bars = int(np.ceil(dur / BAR))
print('bar  t     rms dB  kick-flux')
rows = []
for b in range(bars):
    s0, s1 = int(b * BAR * SR), int(min(dur, (b + 1) * BAR) * SR)
    seg = x[s0:s1]
    rms = 20 * np.log10(np.sqrt(np.mean(seg ** 2)) + 1e-9)
    m = (t >= b * BAR) & (t < (b + 1) * BAR)
    kf = kick[m].mean() if m.any() else 0
    rows.append((b + 1, rms, kf))
    print(f'{b + 1:>3} {b * BAR:5.1f}  {rms:6.1f}  {kf:7.1f} ' + '#' * int(max(0, rms + 45)))

# strongest transient near planned hits
HITS = [6.0, 10.0, 16.0, 20.0, 26.0, 32.0, 36.0]
print('planned hit → strongest onset within ±150 ms (flux, rel. to median)')
med = np.median(env[env > 0]) + 1e-9
for h in HITS:
    m = (t > h - 0.15) & (t < h + 0.15)
    j = np.argmax(np.where(m, env, -1))
    print(f'  {h:5.2f}s → {t[j]:6.3f}s ({(t[j] - h) * 1000:+4.0f} ms) strength ×{env[j] / med:5.1f}')

# structure check against the storyboard: quiet intro, drop at bar 4, breakdown bars 17-18, hit at bar 19
R = {b: r for b, r, _ in rows}
avg = lambda bs: 10 * np.log10(np.mean([10 ** (R[b] / 10) for b in bs if b in R]))
checks = {
    'intro (1-3) >= 6 dB under drop (4-5)': avg([4, 5]) - avg([1, 2, 3]),
    'breakdown (17-18) >= 5 dB under peak (14-16)': avg([14, 15, 16]) - avg([17, 18]),
    'finale (19) >= 5 dB over breakdown (17-18)': avg([19]) - avg([17, 18]),
    'conversation (11-13) <= peak (14-16)': avg([14, 15, 16]) - avg([11, 12, 13]),
}
need = [6, 5, 5, 0]
for (k, v), n in zip(checks.items(), need):
    print(f'  {"PASS" if v >= n else "fail"}  {k}: {v:+.1f} dB')
print('STRUCTURE', sum(v >= n for (k, v), n in zip(checks.items(), need)), '/', len(need))

if a.json:
    json.dump({'bpm': bpm, 'phase': ph, 'bars': [{'bar': b, 'rms': r, 'kick': k} for b, r, k in rows]}, open(a.json, 'w'), indent=1)

if a.png:
    from PIL import Image, ImageDraw
    Wd, Hd = 2300, 520
    im = Image.new('RGB', (Wd, Hd), (8, 10, 18))
    dr = ImageDraw.Draw(im)
    sx = lambda tt: int(tt / dur * (Wd - 20)) + 10
    # waveform envelope
    blk = int(SR * dur / (Wd - 20))
    for i in range(Wd - 20):
        seg = x[i * blk:(i + 1) * blk]
        if len(seg) == 0: break
        pk = np.abs(seg).max()
        dr.line([(i + 10, 150 - pk * 120), (i + 10, 150 + pk * 120)], fill=(70, 120, 230))
    en = env / (env.max() + 1e-9)
    for i in range(len(t) - 1):
        dr.line([(sx(t[i]), 480 - en[i] * 190), (sx(t[i + 1]), 480 - en[i + 1] * 190)], fill=(52, 211, 235))
    for k in range(int(dur / P) + 1):
        xx = sx(k * P)
        dr.line([(xx, 280), (xx, 500)], fill=(60, 60, 80) if k % 4 else (200, 200, 220))
        if k % 4 == 0:
            dr.text((xx + 2, 282), str(k // 4 + 1), fill=(200, 200, 220))
    for h in HITS:
        dr.line([(sx(h), 10), (sx(h), 272)], fill=(195, 255, 31))
    im.save(a.png)
    print('png →', a.png)
