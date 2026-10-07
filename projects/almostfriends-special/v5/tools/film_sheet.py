# A contact sheet of a rendered film: one frame every --step s, labelled, in sheets of --per.
#   python3 projects/almostfriends-special/tools/film_sheet.py out/film.mp4 out/sheet [--step 0.5] [--per 44]
import sys, os, argparse, subprocess, io
from PIL import Image, ImageDraw
ap = argparse.ArgumentParser(); ap.add_argument('video'); ap.add_argument('out'); ap.add_argument('--step', type=float, default=0.5)
ap.add_argument('--per', type=int, default=44); ap.add_argument('--cols', type=int, default=11); ap.add_argument('--w', type=int, default=180); ap.add_argument('--t0', type=float, default=0); ap.add_argument('--t1', type=float, default=44)
a = ap.parse_args()
w = a.w; h = int(w * 16 / 9)
ts = []
t = a.t0
while t < a.t1 - 1e-6: ts.append(round(t, 3)); t += a.step
raw = subprocess.run(['ffmpeg', '-v', 'error', '-ss', str(a.t0), '-i', a.video, '-t', str(a.t1 - a.t0), '-vf', f'fps=1/{a.step},scale={w}:{h}', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-'], capture_output=True).stdout
frames = [Image.frombytes('RGB', (w, h), raw[i:i + w * h * 3]) for i in range(0, len(raw) - w * h * 3 + 1, w * h * 3)]
for s in range(0, len(frames), a.per):
    chunk = frames[s:s + a.per]
    rows = (len(chunk) + a.cols - 1) // a.cols
    sheet = Image.new('RGB', (a.cols * (w + 6) + 6, rows * (h + 22) + 6), (20, 20, 24))
    d = ImageDraw.Draw(sheet)
    for i, im in enumerate(chunk):
        x = 6 + (i % a.cols) * (w + 6); y = 6 + (i // a.cols) * (h + 22)
        sheet.paste(im, (x, y + 16)); d.text((x, y + 2), f'{a.t0 + (s + i) * a.step:.1f}s', fill=(255, 220, 120))
    p = f'{a.out}-{s // a.per + 1}.jpg'; sheet.save(p, quality=86); print(p, sheet.size)
