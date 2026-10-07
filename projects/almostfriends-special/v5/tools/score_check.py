# Measure a score take against the film's grid: tempo and phase (does the take's beat sit on film beats?), the
# strength of the onset at each hit the picture needs, loudness per section, and a labelled spectrogram to look at.
#   python3 projects/almostfriends-special/tools/score_check.py s1 [s2 …] [--png out.png]
# Film 0 = take 2.0 s (the plan starts with a one-bar pickup at −2 s).
import os, sys, json, argparse, subprocess
import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
MUS = os.path.join(HERE, '..', 'audio', 'music')
SR = 48000
PRE = 2.0
HITS = [0.0, 2.0, 10.0, 16.0, 22.0, 28.0, 38.0]
SECTIONS = [('night', 0, 2), ('drop', 2, 10), ('flight', 10, 16), ('chat', 16, 22), ('breath', 22, 28), ('climax', 28, 38), ('outro', 38, 44)]

ap = argparse.ArgumentParser()
ap.add_argument('takes', nargs='+')
ap.add_argument('--png', default=None)
a = ap.parse_args()

def read(name):
    p = os.path.join(MUS, f'{name}.wav')
    if not os.path.exists(p): p = os.path.join(MUS, f'{name}.mp3')
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', p, '-ac', '2', '-ar', str(SR), '-f', 'f32le', '-'], capture_output=True).stdout
    x = np.frombuffer(raw, np.float32).reshape(-1, 2).astype(np.float64)
    return x[int(PRE * SR):]

def onset_env(m, hop=480):          # spectral flux at 100 Hz
    win = 2048; hann = np.hanning(win); prev = None; out = []
    for i in range(0, len(m) - win, hop):
        s = np.log1p(np.abs(np.fft.rfft(m[i:i + win] * hann)) * 20)
        out.append(0 if prev is None else np.maximum(s - prev, 0).sum()); prev = s
    e = np.array(out); e -= np.convolve(e, np.ones(50) / 50, 'same'); e[e < 0] = 0
    return e / (e.max() + 1e-9)

rows = []
specs = []
for name in a.takes:
    x = read(name); m = x.mean(1)
    env = onset_env(m)
    fps = SR / 480
    # tempo by autocorrelation, 90–150 BPM
    ac = np.correlate(env, env, 'full')[len(env) - 1:]
    lag = np.arange(len(ac)) / fps
    ok = (lag > 60 / 150) & (lag < 60 / 90)
    bpm = 60 / lag[ok][np.argmax(ac[ok])]
    # phase: mean onset strength on the film's 0.5 s grid at offsets −100…+100 ms
    best = max(((np.mean([env[int(round((b * 0.5 + off) * fps))] for b in range(1, 86) if int(round((b * 0.5 + off) * fps)) < len(env)]), off)
                for off in np.arange(-0.1, 0.101, 0.005)), key=lambda z: z[0])
    hits = []
    for h in HITS:
        i0, i1 = int((h - 0.06) * fps), int((h + 0.08) * fps)
        seg = env[max(0, i0):i1]
        hits.append(f'{h:g}:{(seg.max() if len(seg) else 0):.2f}')
    loud = []
    for nm, s0, s1 in SECTIONS:
        seg = m[int(s0 * SR):int(s1 * SR)]
        loud.append(f'{nm} {20 * np.log10(np.sqrt(np.mean(seg ** 2)) + 1e-9):.1f}')
    peak = 20 * np.log10(np.abs(x).max() + 1e-9)
    print(f'{name}: tempo {bpm:.1f} BPM · grid phase {best[1] * 1000:+.0f} ms (mean onset {best[0]:.2f}) · peak {peak:.1f} dBFS')
    print(f'   hits  {"  ".join(hits)}')
    print(f'   rms   {" · ".join(loud)}')
    if a.png:
        from scipy.signal import stft
        f, t, Z = stft(m, fs=SR, nperseg=2048, noverlap=2048 - 480)
        S = 20 * np.log10(np.abs(Z) + 1e-6)
        specs.append((name, f, t, S))

if a.png and specs:
    import matplotlib; matplotlib.use('Agg')
    import matplotlib.pyplot as plt
    fig, axs = plt.subplots(len(specs), 1, figsize=(18, 3.2 * len(specs)), squeeze=False)
    for ax, (name, f, t, S) in zip(axs[:, 0], specs):
        keep = f < 12000
        ax.pcolormesh(t, f[keep], S[keep], shading='auto', vmin=-90, vmax=-10, cmap='magma')
        ax.set_yscale('symlog', linthresh=200); ax.set_ylim(30, 12000)
        for nm, s0, s1 in SECTIONS:
            ax.axvline(s0, color='cyan', lw=1); ax.text(s0 + 0.1, 9000, nm, color='cyan', fontsize=9)
        ax.set_title(name); ax.set_xlim(0, 44)
    fig.tight_layout(); fig.savefig(a.png, dpi=70)
    print('spectrogram →', a.png)
