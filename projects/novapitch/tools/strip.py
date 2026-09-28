# Frame strips around hand-offs: python3 tools/strip.py video.mp4 out.jpg f1,f2,... [n=6] [step=1]
# Each row: n frames (every `step`) starting 2·step before the given frame; labels in frames and beats (30 f/beat).
import sys, subprocess
from PIL import Image, ImageDraw
import numpy as np
vid, out, frames = sys.argv[1], sys.argv[2], [int(x) for x in sys.argv[3].split(',')]
n = int(sys.argv[4]) if len(sys.argv) > 4 else 6
step = int(sys.argv[5]) if len(sys.argv) > 5 else 1
W, H = 480, 270
rows = []
for f0 in frames:
    idx = [f0 - 2 * step + i * step for i in range(n)]
    sel = '+'.join(f'eq(n\\,{i})' for i in idx)
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', vid, '-vf', f"select='{sel}',scale={W}:{H}", '-vsync', '0', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-'], capture_output=True).stdout
    arr = np.frombuffer(raw, np.uint8).reshape(-1, H, W, 3)
    row = Image.new('RGB', (W * n, H + 16))
    d = ImageDraw.Draw(row)
    for k in range(min(n, len(arr))):
        row.paste(Image.fromarray(arr[k]), (k * W, 16))
        d.text((k * W + 4, 2), f'f{idx[k]}  b{idx[k] / 30:.2f}', fill=(255, 230, 80))
    rows.append(row)
sheet = Image.new('RGB', (W * n, len(rows) * (H + 16)))
for i, r in enumerate(rows): sheet.paste(r, (0, i * (H + 16)))
sheet.save(out, quality=85)
