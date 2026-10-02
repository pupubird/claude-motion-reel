# Contact sheet of PNG stills: python3 tools/sheet.py <dir> [out.jpg] [--cols 3] [--w 640]
import sys, os, glob, argparse
from PIL import Image, ImageDraw, ImageFont
ap = argparse.ArgumentParser()
ap.add_argument('dir'); ap.add_argument('out', nargs='?'); ap.add_argument('--cols', type=int, default=3); ap.add_argument('--w', type=int, default=640)
a = ap.parse_args()
fs = sorted(glob.glob(os.path.join(a.dir, '*.png')))
if not fs: sys.exit('no stills')
ims = [Image.open(f).convert('RGB') for f in fs]
w = a.w; h = round(ims[0].height * w / ims[0].width)
rows = (len(ims) + a.cols - 1) // a.cols
sheet = Image.new('RGB', (a.cols * (w + 6) + 6, rows * (h + 26) + 6), (24, 24, 24))
d = ImageDraw.Draw(sheet)
try: font = ImageFont.truetype('/System/Library/Fonts/Menlo.ttc', 14)
except Exception: font = None
for i, (f, im) in enumerate(zip(fs, ims)):
    x = 6 + (i % a.cols) * (w + 6); y = 6 + (i // a.cols) * (h + 26)
    sheet.paste(im.resize((w, h), Image.LANCZOS), (x, y))
    name = os.path.basename(f)
    try:
        fr = int(name[1:5]); label = f'{name}  t={fr/60:.2f}s'
    except Exception: label = name
    d.text((x + 2, y + h + 4), label, fill=(220, 220, 220), font=font)
out = a.out or os.path.join(a.dir, 'sheet.jpg')
sheet.save(out, quality=88)
print(out, sheet.size)
