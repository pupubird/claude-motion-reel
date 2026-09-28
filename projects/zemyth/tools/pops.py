# Pop detector: per-frame mean absolute luma difference; lists spikes relative to their neighbourhood.
#   python3 tools/pops.py video.mp4 [top=20]
import sys, subprocess
import numpy as np
path = sys.argv[1]; top = int(sys.argv[2]) if len(sys.argv) > 2 else 20
W, H = 240, 135
raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', path, '-vf', f'scale={W}:{H}', '-f', 'rawvideo', '-pix_fmt', 'gray', '-'], capture_output=True).stdout
f = np.frombuffer(raw, np.uint8).reshape(-1, H, W).astype(np.float32) / 255
d = np.abs(np.diff(f, axis=0)).mean(axis=(1, 2))
# spike score: difference relative to the median of the surrounding 12 frames
score = []
for i in range(len(d)):
    nb = np.concatenate([d[max(0, i - 6):i], d[i + 1:i + 7]])
    score.append(d[i] / (np.median(nb) + 0.002))
score = np.array(score)
idx = np.argsort(-score)[:top]
print('frame  beat    diff   ×local')
for i in sorted(idx):
    print(f'{i + 1:5d}  {(i + 1) / 28.125:6.2f}  {d[i]:.4f}  {score[i]:5.1f}')
