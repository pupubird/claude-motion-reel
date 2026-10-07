# Frame gate over a rendered video (every frame, downscaled), frame rate read from the file:
#   - empty frames (nothing on screen: p99.5 luma under 0.06 on a dark frame, or a flat frame with no detail)
#   - blown frames (> 25 % of pixels clipped to pure white that the design does not own — reported, light theme)
#   - photosensitivity: large full-frame luminance flips (|Δ mean| > 0.2), at most 3 in any 1 s window (gated)
#   - dips and drops at transitions (reported): the picture falls dark between two lit shots, or loses most of its
#     light within 0.1 s — reads as a break, not a transition
#   python3 tools/check_frames.py out/film.mp4
import sys, subprocess, json
import numpy as np
path = sys.argv[1] if len(sys.argv) > 1 else 'out/film.mp4'
probe = json.loads(subprocess.run(['ffprobe', '-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=r_frame_rate,width,height', '-of', 'json', path], capture_output=True, text=True).stdout)
st = probe['streams'][0]; num, den = map(int, st['r_frame_rate'].split('/')); fps = num / den
W, H = 90, 160
raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', path, '-vf', f'scale={W}:{H}', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-'], capture_output=True).stdout
f = np.frombuffer(raw, np.uint8).reshape(-1, H, W, 3).astype(np.float32) / 255
luma = (0.2126 * f[..., 0] + 0.7152 * f[..., 1] + 0.0722 * f[..., 2])
mean = luma.mean(axis=(1, 2))
std = luma.reshape(len(mean), -1).std(axis=1)
clip = (f.min(axis=3) > 0.985).mean(axis=(1, 2))
n = len(mean)
sec = lambda i: i / fps
p99 = np.percentile(luma.reshape(n, -1), 99.5, axis=1)
edge = int(0.5 * fps)
dark = [i for i in range(n) if p99[i] < 0.06 and edge < i < n - edge]
flat = [i for i in range(n) if std[i] < 0.004 and edge < i < n - edge]
blown = [i for i in range(n) if clip[i] > 0.25]
raw_flips = [i for i in range(1, n) if abs(mean[i] - mean[i - 1]) > 0.2]
flips = [i for k, i in enumerate(raw_flips) if k == 0 or i - raw_flips[k - 1] > 3]
win = int(round(fps))
worst = max((sum(1 for j in flips if i <= j < i + win) for i in range(n)), default=0)
fmtf = lambda xs: ', '.join(f'{sec(i):.2f}s' for i in xs[:10]) + (' …' if len(xs) > 10 else '') or 'none'
print(f'{st["width"]}x{st["height"]} @ {fps:g} fps · frames {n} · mean luma {mean.min():.3f}–{mean.max():.3f}')
print(f'empty (dark): {fmtf(dark)}')
print(f'empty (flat): {fmtf(flat)}')
print(f'blown (>25 % pure white, reported): {fmtf(blown)}')
print(f'luminance flips > 0.2: {len(flips)} at {fmtf(flips)} · worst 1 s window: {worst}')
def runs(idx):
    out = []
    gap = max(1, int(0.05 * fps))
    for i in idx:
        if out and i - out[-1][1] <= gap: out[-1][1] = i
        else: out.append([i, i])
    return out
a, b = int(0.75 * fps), max(1, int(0.08 * fps))
dips = runs([i for i in range(a, n - a) if (lo := min(mean[i - a:i - b].max(), mean[i + b:i + a].max())) > 0.02 and mean[i] < 0.4 * lo])
d6 = max(1, int(0.1 * fps))
drops = runs([i for i in range(n - d6) if mean[i] > 0.03 and mean[i + d6] < 0.3 * mean[i]])
fmt = lambda rs: ', '.join(f'{sec(x):.2f}–{sec(y):.2f}s' for x, y in rs) or 'none'
print(f'dips (dark between two lit shots): {fmt(dips)}')
print(f'drops (light lost in 0.1 s): {fmt(drops)}')
ok = not dark and not flat and worst <= 3
print('FRAME GATE', 'PASS' if ok else 'FAIL')
print('per-second luma:', ' '.join(f'{mean[i]:.2f}' for i in range(0, n, win)))
sys.exit(0 if ok else 1)
