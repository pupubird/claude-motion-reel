# Measure every sound in audio/sfx: onset (first sample within 30 dB of the peak envelope), peak time, tail end (−50 dB),
# loudness (RMS dBFS over the body), spectral centroid; write audio/sfx/meta.json and a labelled spectrogram sheet.
#   python3 projects/almostfriends-special/tools/sfx_meta.py [--png sheet.png]
import os, sys, json, wave, argparse
import numpy as np
HERE = os.path.dirname(os.path.abspath(__file__))
SFX = os.path.join(HERE, '..', 'audio', 'sfx')
ap = argparse.ArgumentParser(); ap.add_argument('--png', default=None); a = ap.parse_args()
def read(p):
    with wave.open(p) as w:
        n, ch, sr = w.getnframes(), w.getnchannels(), w.getframerate()
        x = np.frombuffer(w.readframes(n), '<i2').astype(np.float64).reshape(-1, ch) / 32768
    return x, sr
meta = {}
names = sorted(f[:-4] for f in os.listdir(SFX) if f.endswith('.wav'))
for n in names:
    x, sr = read(os.path.join(SFX, n + '.wav'))
    m = np.abs(x).max(1)
    hop = sr // 1000
    env = np.array([m[i:i + hop].max() for i in range(0, len(m), hop)])
    pk = env.max() + 1e-12
    db = 20 * np.log10(env / pk + 1e-9)
    onset = int(np.argmax(db > -30)) / 1000
    peak = int(np.argmax(env)) / 1000
    end = (len(db) - int(np.argmax(db[::-1] > -50))) / 1000
    body = x[int(onset * sr):int(end * sr)].mean(1)
    rms = 20 * np.log10(np.sqrt(np.mean(body ** 2)) + 1e-9)
    sp = np.abs(np.fft.rfft(body * np.hanning(len(body)))) if len(body) > 64 else np.zeros(2)
    f = np.fft.rfftfreq(len(body), 1 / sr) if len(body) > 64 else np.zeros(2)
    cen = float((sp * f).sum() / (sp.sum() + 1e-9))
    meta[n] = dict(onset=onset, peak=peak, end=end, len=len(x) / sr, peak_db=round(20 * np.log10(pk), 1), rms_db=round(rms, 1), centroid=round(cen))
    print(f'{n:8s} onset {onset:5.3f} peak {peak:5.3f} end {end:5.3f} / {len(x) / sr:4.2f} s  peak {20 * np.log10(pk):6.1f} dB  rms {rms:6.1f}  centroid {cen:6.0f} Hz')
json.dump(meta, open(os.path.join(SFX, 'meta.json'), 'w'), indent=1)
if a.png:
    import matplotlib; matplotlib.use('Agg'); import matplotlib.pyplot as plt
    from scipy.signal import stft
    cols = 6; rows = (len(names) + cols - 1) // cols
    fig, axs = plt.subplots(rows, cols, figsize=(cols * 3.2, rows * 2.2))
    for ax, n in zip(axs.flat, names):
        x, sr = read(os.path.join(SFX, n + '.wav'))
        ff, tt, Z = stft(x.mean(1), fs=sr, nperseg=1024, noverlap=768)
        ax.pcolormesh(tt, ff, 20 * np.log10(np.abs(Z) + 1e-7), shading='auto', vmin=-100, vmax=-20, cmap='magma')
        ax.set_yscale('symlog', linthresh=300); ax.set_ylim(40, 20000); ax.set_title(n, fontsize=9); ax.tick_params(labelsize=6)
    for ax in list(axs.flat)[len(names):]: ax.axis('off')
    fig.tight_layout(); fig.savefig(a.png, dpi=60); print('sheet →', a.png)
