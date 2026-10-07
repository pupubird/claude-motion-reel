# Fine tempo: autocorrelation of the onset envelope (hop 64) with parabolic peak interpolation, searched 100-140 BPM.
import sys, numpy as np, librosa
for path in sys.argv[1:]:
    y, sr = librosa.load(path, sr=22050, mono=True)
    hop = 64
    env = librosa.onset.onset_strength(y=y, sr=sr, hop_length=hop)
    env = env - env.mean()
    ac = np.correlate(env, env, mode='full')[len(env) - 1:]
    fps = sr / hop
    lo, hi = int(fps * 60 / 140), int(fps * 60 / 100)
    k = lo + int(np.argmax(ac[lo:hi]))
    a, b, c = ac[k - 1], ac[k], ac[k + 1]
    kk = k + 0.5 * (a - c) / (a - 2 * b + c)
    print(f'{path.split("/")[-1]}: {60 * fps / kk:.2f} BPM (lag {kk:.2f} frames at {fps:.1f} fps)')
