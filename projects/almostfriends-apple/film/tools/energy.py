# The film's energy, measured from the picture, for comparing cuts against each other.
#
#   python3 projects/almostfriends-apple/film/tools/energy.py a.mp4 [b.mp4 ...]
#
# Per video:
#   energy curve      mean absolute frame-to-frame change per second, drawn as a bar line
#   contrast (cv)     spread of that curve (a flat, "linear" film scores low)
#   max/median        how far the biggest second rises above a typical one
#   big moments       seconds above 2.5x the median
#   new pictures/10s  peaks in change against the picture 0.5 s earlier (at least 0.4 s apart)
#   still %           half-seconds with almost no change
#   longest gap       the longest stretch with no new picture: the "WOW every 2 s" check
import subprocess, sys
import numpy as np

FPS, W, H = 30, 108, 192

def frames(path):
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', path, '-vf', f'fps={FPS},scale={W}:{H},format=gray',
                          '-f', 'rawvideo', '-'], capture_output=True, check=True).stdout
    return np.frombuffer(raw, np.uint8).reshape(-1, H, W).astype(np.float32)

def measure(path):
    f = frames(path)
    d = np.abs(np.diff(f, axis=0)).mean(axis=(1, 2))
    per_s = d[: len(d) // FPS * FPS].reshape(-1, FPS).mean(axis=1)
    lag = FPS // 2
    nov = np.array([np.abs(f[i] - f[i - lag]).mean() for i in range(lag, len(f))])
    peaks = []
    for i in range(1, len(nov) - 1):
        if nov[i] > 10 and nov[i] >= nov[i - 1] and nov[i] >= nov[i + 1] and (not peaks or i - peaks[-1] >= 12):
            peaks.append(i)
    dur = len(f) / FPS
    times = [(p + lag) / FPS for p in peaks]
    gaps = np.diff([0.0] + times + [dur])
    worst = int(np.argmax(gaps))
    halfs = d[: len(d) // lag * lag].reshape(-1, lag).mean(axis=1)
    med = np.median(per_s)
    return dict(name=path.split('/')[-1], dur=dur, curve=per_s, cv=per_s.std() / per_s.mean(),
                peak=per_s.max() / med, big=int((per_s > 2.5 * med).sum()), new10=10 * len(peaks) / dur,
                still=100 * (halfs < 0.8).mean(), gap=gaps.max(), gap_at=([0.0] + times)[worst], motion=d.mean())

if __name__ == '__main__':
    for path in sys.argv[1:]:
        m = measure(path)
        bars = ''.join(' ▁▂▃▄▅▆▇█'[min(8, int(x))] for x in m['curve'])
        print(f"{m['name'][:40]:40s} {m['dur']:5.1f}s  cv {m['cv']:.2f}  max/median {m['peak']:4.1f}  big {m['big']:2d}  "
              f"new/10s {m['new10']:4.1f}  still {m['still']:4.1f}%  longest gap {m['gap']:.1f}s (from {m['gap_at']:.1f}s)  "
              f"motion {m['motion']:.2f}")
        print('   ' + bars)
