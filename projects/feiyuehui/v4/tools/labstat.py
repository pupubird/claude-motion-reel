# Jade calibration: median / p10 / p90 of the green pixels in a still vs the client's photograph.
#   python3 tools/labstat.py out/lookdev/<dir>/f0000.png [photo.png crop x0,y0,x1,y1]
import sys, numpy as np
from PIL import Image
def stats(path, crop=None):
    im = Image.open(path).convert('RGB')
    if crop: im = im.crop(crop)
    a = np.asarray(im).reshape(-1, 3).astype(int)
    m = (a[:, 1] > a[:, 0] + 25) & (a[:, 1] > a[:, 2] + 25)
    g = a[m]
    return np.median(g, axis=0).astype(int).tolist(), np.percentile(g[:, 1], [10, 50, 90]).astype(int).tolist(), round(float(m.mean()), 3)
for p in sys.argv[1:]:
    print(p.split('/')[-2] if '/' in p else p, *stats(p))
