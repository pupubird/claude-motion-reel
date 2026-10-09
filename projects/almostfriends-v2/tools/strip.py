# Frame strips around hand-offs (vertical): python3 tools/strip.py video.mp4 out.jpg f1,f2,... [n=8] [step=2]
# Each row: n frames (every `step`) starting 3·step before the given frame; labels in frames, seconds and beats.
import sys, subprocess, json
from PIL import Image, ImageDraw
import numpy as np
vid, out, frames = sys.argv[1], sys.argv[2], [int(x) for x in sys.argv[3].split(',')]
n = int(sys.argv[4]) if len(sys.argv) > 4 else 8
step = int(sys.argv[5]) if len(sys.argv) > 5 else 2
probe = json.loads(subprocess.run(['ffprobe', '-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=r_frame_rate', '-of', 'json', vid], capture_output=True, text=True).stdout)
num, den = map(int, probe['streams'][0]['r_frame_rate'].split('/')); fps = num / den
W, H = 216, 384
rows = []
for f0 in frames:
    idx = [max(0, f0 - 3 * step + i * step) for i in range(n)]
    sel = '+'.join(f'eq(n\\,{i})' for i in idx)
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', vid, '-vf', f"select='{sel}',scale={W}:{H}", '-vsync', '0', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-'], capture_output=True).stdout
    arr = np.frombuffer(raw, np.uint8).reshape(-1, H, W, 3)
    row = Image.new('RGB', (W * n, H + 16))
    d = ImageDraw.Draw(row)
    for k in range(min(n, len(arr))):
        row.paste(Image.fromarray(arr[k]), (k * W, 16))
        d.text((k * W + 4, 2), f'f{idx[k]} {idx[k] / fps:.2f}s', fill=(255, 230, 80))
    rows.append(row)
sheet = Image.new('RGB', (W * n, len(rows) * (H + 16)))
for i, r in enumerate(rows): sheet.paste(r, (0, i * (H + 16)))
sheet.save(out, quality=85)
