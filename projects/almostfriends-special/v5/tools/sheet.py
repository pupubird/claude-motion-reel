# Tile review stills into one contact sheet, each labelled with its film time.
#   python3 projects/almostfriends-special/tools/sheet.py out/hook out/hook-sheet.jpg [--cols 7] [--w 300]
import sys, os, argparse
from PIL import Image, ImageDraw
ap = argparse.ArgumentParser()
ap.add_argument('dir'); ap.add_argument('out'); ap.add_argument('--cols', type=int, default=7); ap.add_argument('--w', type=int, default=300)
a = ap.parse_args()
files = sorted(f for f in os.listdir(a.dir) if f.endswith('.png'))
w = a.w; h = int(w * 16 / 9)
rows = (len(files) + a.cols - 1) // a.cols
sheet = Image.new('RGB', (a.cols * (w + 8) + 8, rows * (h + 30) + 8), (20, 20, 24))
d = ImageDraw.Draw(sheet)
for i, f in enumerate(files):
    im = Image.open(os.path.join(a.dir, f)).convert('RGB').resize((w, h), Image.LANCZOS)
    x = 8 + (i % a.cols) * (w + 8); y = 8 + (i // a.cols) * (h + 30)
    sheet.paste(im, (x, y + 22))
    fr = int(f[1:5]); d.text((x, y + 4), f'{fr / 60:.2f}s  (f{fr})', fill=(255, 220, 120))
sheet.save(a.out, quality=88)
print(a.out, sheet.size)
