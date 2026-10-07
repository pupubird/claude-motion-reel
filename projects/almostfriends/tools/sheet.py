# Tile PNG stills into a labelled contact sheet (vertical frames):
#   python3 tools/sheet.py out.jpg cols f1.png f2.png ...   [--w=360] [--label=fps]
import sys
from PIL import Image, ImageDraw
args = [a for a in sys.argv[1:] if not a.startswith('--')]
opts = dict(a[2:].split('=', 1) for a in sys.argv[1:] if a.startswith('--') and '=' in a)
out, cols, files = args[0], int(args[1]), args[2:]
w = int(opts.get('w', 360)); h = round(w * 16 / 9)
fps = float(opts.get('fps', 60))
rows = (len(files) + cols - 1) // cols
pad = 6
sheet = Image.new('RGB', (cols * (w + pad) + pad, rows * (h + pad + 24) + pad), (24, 24, 28))
d = ImageDraw.Draw(sheet)
for i, f in enumerate(files):
    im = Image.open(f).convert('RGB').resize((w, h), Image.LANCZOS)
    x, y = pad + (i % cols) * (w + pad), pad + (i // cols) * (h + pad + 24)
    sheet.paste(im, (x, y + 24))
    label = f.split('/')[-1].rsplit('.', 1)[0]
    if label.startswith('f') and label[1:].isdigit():
        n = int(label[1:]); label = f'{label}  {n / fps:.2f}s  b{n / (fps / 2):.1f}'
    d.text((x + 4, y + 5), label, fill=(255, 220, 80))
sheet.save(out, quality=90)
print(f'{out}: {len(files)} frames, {sheet.size[0]}x{sheet.size[1]}')
