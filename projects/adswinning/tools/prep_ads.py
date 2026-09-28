# raw/*.png (Higgsfield output) → assets/ads/*.jpg sized for use: hero creative 1800 px long side, wall ads 900 px.
import glob, os
from PIL import Image
here = os.path.dirname(os.path.abspath(__file__))
raw, out = os.path.join(here, '../assets/raw'), os.path.join(here, '../assets/ads')
os.makedirs(out, exist_ok=True)
for f in sorted(glob.glob(f'{raw}/*.png')):
    name = os.path.basename(f)[:-4]
    dst = f'{out}/{name}.jpg'
    if os.path.exists(dst) and os.path.getmtime(dst) > os.path.getmtime(f):
        continue
    im = Image.open(f).convert('RGB')
    cap = 900 if name.startswith('wall-') else 1800
    s = min(1.0, cap / max(im.size))
    im = im.resize((round(im.size[0] * s), round(im.size[1] * s)), Image.LANCZOS)
    im.save(dst, quality=88 if name.startswith('wall-') else 90, optimize=True)
    print(f'{name}.jpg {im.size}')
