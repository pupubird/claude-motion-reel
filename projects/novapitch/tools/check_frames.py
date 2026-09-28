# Frame gate over a rendered video (every frame, downscaled):
#   - near-black frames outside the intended open/close fades
#   - blown frames (> 25 % of pixels clipped to white)
#   - photosensitivity: large full-frame luminance flips (|Δ mean| > 0.2), at most 3 in any 1 s window
#   - dips (reported, not gated): the picture falls dark between two lit shots — reads as a break, not a transition
#   python3 tools/check_frames.py out/preview.mp4
import sys, subprocess
import numpy as np
path = sys.argv[1] if len(sys.argv) > 1 else 'out/preview.mp4'
W, H = 160, 90
raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', path, '-vf', f'scale={W}:{H}', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-'], capture_output=True).stdout
f = np.frombuffer(raw, np.uint8).reshape(-1, H, W, 3).astype(np.float32) / 255
luma = (0.2126 * f[..., 0] + 0.7152 * f[..., 1] + 0.0722 * f[..., 2])
mean = luma.mean(axis=(1, 2))
clip = (f.min(axis=3) > 0.985).mean(axis=(1, 2))
n = len(mean)
issues = []
p99 = np.percentile(luma.reshape(n, -1), 99.5, axis=1)
# empty = nothing on screen at all; the first beat (the slide lighting up) and the final fade are dark by design
dark = [i for i in range(n) if p99[i] < 0.06 and 30 < i < n - 60]
blown = [i for i in range(n) if clip[i] > 0.25]
raw_flips = [i for i in range(1, n) if abs(mean[i] - mean[i - 1]) > 0.2]
# one cut smeared over consecutive frames by motion blur is one transition
flips = [i for k, i in enumerate(raw_flips) if k == 0 or i - raw_flips[k - 1] > 3]
worst = max((sum(1 for j in flips if i <= j < i + 60) for i in range(n)), default=0)
print(f'frames {n} · mean luma {mean.min():.3f}–{mean.max():.3f}')
print(f'near-black (mid-reel): {dark[:12]}{" …" if len(dark) > 12 else ""}')
print(f'blown: {blown[:12]}{" …" if len(blown) > 12 else ""}')
print(f'luminance flips > 0.2: {len(flips)} at {flips} · worst 1 s window: {worst}')
# a dip: mean luma under 40 % of the dimmer of the shots either side (±0.1–0.75 s); a drop: the picture loses
# more than 70 % of its light within 0.1 s. Both read as a break, not a transition (the opening's and the
# signature's darkness are designed; judge those by eye).
def runs(idx):
    out = []
    for i in idx:
        if out and i - out[-1][1] <= 3: out[-1][1] = i
        else: out.append([i, i])
    return out
dips = runs([i for i in range(45, n - 45) if (lo := min(mean[i - 45:i - 5].max(), mean[i + 5:i + 45].max())) > 0.02 and mean[i] < 0.4 * lo])
drops = runs([i for i in range(n - 6) if mean[i] > 0.03 and mean[i + 6] < 0.3 * mean[i]])
fmt = lambda rs: ', '.join(f'{a / 60:.2f}–{b / 60:.2f}s' for a, b in rs) or 'none'
print(f'dips (dark between two lit shots): {fmt(dips)}')
print(f'drops (light lost in 0.1 s): {fmt(drops)}')
ok = not dark and not blown and worst <= 3
print('FRAME GATE', 'PASS' if ok else 'FAIL')
# per-second luma strip for eyeballing structure
print(' '.join(f'{mean[i]:.2f}' for i in range(0, n, 60)))
sys.exit(0 if ok else 1)
