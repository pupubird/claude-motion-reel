# Tile PNG stills into a labelled contact sheet: python3 tools/sheet.py out.jpg cols f1.png f2.png ...
import sys
from PIL import Image, ImageDraw
out, cols, files = sys.argv[1], int(sys.argv[2]), sys.argv[3:]
w, h = 960, 540
rows = (len(files) + cols - 1) // cols
sheet = Image.new('RGB', (cols * w, rows * h), (0, 0, 0))
d = ImageDraw.Draw(sheet)
for i, f in enumerate(files):
    im = Image.open(f).convert('RGB').resize((w, h), Image.LANCZOS)
    x, y = (i % cols) * w, (i // cols) * h
    sheet.paste(im, (x, y))
    label = f.split('/')[-1].replace('.png', '')
    d.rectangle([x, y, x + 120, y + 26], fill=(0, 0, 0))
    d.text((x + 6, y + 6), label, fill=(255, 220, 80))
sheet.save(out, quality=88)
