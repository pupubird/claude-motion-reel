# Measure a score take against the 120 BPM cut (src/config.js): tempo, grid phase, per-bar loudness, and the strongest
# onset near each planned hit.   python3 projects/feiyuehui/v4/tools/beats.py audio/music/t1.mp3 [more takes…]
import sys, subprocess
import numpy as np

HITS = {  # seconds → what the picture does there (src/config.js T, the 40 s cut)
    2.5: 'clouds part', 3.5: 'the moon', 6.0: 'reveal', 8.0: 'swing to the shank', 9.5: 'through the hoop',
    11.0: 'the fall', 11.5: 'the one', 14.0: '设计', 17.5: '雕刻', 20.5: '镶嵌', 24.0: 'DROP · sunrise',
    30.0: 'gather', 33.0: 'BURST · phoenix', 34.0: '翡月荟', 35.5: 'tagline',
}
SR, HOP, N = 48000, 480, 2048

def load(path):
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', path, '-ac', '1', '-ar', str(SR), '-f', 'f32le', '-'], capture_output=True).stdout
    return np.frombuffer(raw, np.float32).astype(np.float64)

for path in sys.argv[1:]:
    x = load(path)
    dur = len(x) / SR
    win = np.hanning(N)
    frames = 1 + (len(x) - N) // HOP
    spec = np.empty((frames, N // 2 + 1))
    for i in range(frames):
        spec[i] = np.abs(np.fft.rfft(x[i * HOP:i * HOP + N] * win))
    logs = np.log1p(1000 * spec)
    flux = np.concatenate([[0], np.maximum(0, np.diff(logs, axis=0)).sum(axis=1)])
    lb = int(150 / (SR / N))
    kick = np.concatenate([[0], np.maximum(0, np.diff(logs[:, 1:lb], axis=0)).sum(axis=1)])
    t = (np.arange(frames) * HOP + N / 2) / SR
    env = np.maximum(flux - np.convolve(flux, np.ones(50) / 50, mode='same'), 0)
    fps = SR / HOP
    ac = np.correlate(env - env.mean(), env - env.mean(), mode='full')[len(env) - 1:]
    lo, hi = int(60 * fps / 180), int(60 * fps / 70)
    lag = lo + np.argmax(ac[lo:hi])
    bpm = 60 * fps / lag
    P = 0.5
    kenv = np.maximum(kick - np.convolve(kick, np.ones(50) / 50, mode='same'), 0)
    def score(ph):
        bt = np.arange(ph, dur, P)
        idx = np.clip(np.round((bt - N / 2 / SR) * fps).astype(int), 0, len(kenv) - 1)
        return kenv[idx].sum()
    phases = np.linspace(0, P, 100, endpoint=False)
    ph = phases[np.argmax([score(p) for p in phases])]
    print(f'\n{path}: {dur:.2f}s · autocorr {bpm:.1f} BPM · best 120-grid phase {ph * 1000:+.0f} ms')
    # per-bar loudness
    rms = []
    for b in range(int(dur // 2)):
        seg = x[int(b * 2 * SR):int((b + 1) * 2 * SR)]
        rms.append(20 * np.log10(np.sqrt(np.mean(seg ** 2)) + 1e-9))
    peak = max(rms)
    print('bar dB  ' + ' '.join(f'{b + 1:>3}' for b in range(len(rms))))
    print('        ' + ' '.join(f'{r - peak:>3.0f}' for r in rms))
    # onsets near the hits
    med = np.median(env[env > 0]) if np.any(env > 0) else 1
    for h, what in HITS.items():
        m = (t > h - 0.12) & (t < h + 0.12)
        if not m.any(): continue
        j = np.argmax(np.where(m, env, -1))
        print(f'  {h:5.1f}s {what:22s} onset ×{env[j] / med:5.1f} at {(t[j] - h) * 1000:+4.0f} ms · low ×{kenv[j] / (np.median(kenv[kenv > 0]) + 1e-9):5.1f}')
    # silence before the drop?
    q = x[int(23.55 * SR):int(23.95 * SR)]
    print(f'  23.55–23.95 s (the breath before the drop) {20 * np.log10(np.sqrt(np.mean(q ** 2)) + 1e-9) - peak:+.1f} dB vs the loudest bar')
