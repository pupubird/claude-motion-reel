# Side-by-side: a rendered still (centre crop) next to a reference image, for model matching.
#   python3 tools/compare.py out/stills/f0120.png ref.png out.jpg [cropW]
import sys
from PIL import Image
a = Image.open(sys.argv[1]).convert('RGB')
cw = int(sys.argv[4]) if len(sys.argv) > 4 else 1080
w, h = a.size
crop = a.crop((w // 2 - cw // 2, 0, w // 2 + cw // 2, 1080)).resize((1080, int(1080 * 1080 / cw)))
ref = Image.open(sys.argv[2]).convert('RGBA')
bg = Image.new('RGBA', ref.size, (0, 0, 0, 255)); bg.alpha_composite(ref); ref = bg.convert('RGB').resize((1080, 1080))
sheet = Image.new('RGB', (2160, 1080)); sheet.paste(crop, (0, 0)); sheet.paste(ref, (1080, 0))
sheet.resize((1600, 800)).save(sys.argv[3], quality=88)
