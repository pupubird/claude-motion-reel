# The world's land as a mask for the hook's planet of people (gl/planet.js paints land and sea from it).
#   python3 tools/land_mask.py <world-atlas land-50m.json> → assets/world/land.png (720 × 360, equirectangular, white land)
# Source: world-atlas 2.0.2 (Natural Earth 1:50m land, public domain), a TopoJSON: delta-encoded, quantised arcs.
import sys, json, os
from PIL import Image, ImageDraw, ImageFilter

src = sys.argv[1]
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'assets', 'world', 'land.png')
d = json.load(open(src))
sx, sy = d['transform']['scale']; tx, ty = d['transform']['translate']
arcs = []
for a in d['arcs']:
    x = y = 0; pts = []
    for dx, dy in a:
        x += dx; y += dy; pts.append((x * sx + tx, y * sy + ty))
    arcs.append(pts)
def ring(idx):
    pts = []
    for i in idx:
        a = arcs[i] if i >= 0 else arcs[~i][::-1]
        pts.extend(a if not pts else a[1:])
    return pts
W, H = 720, 360
S = 4                                   # draw at 4× and downsample: soft coasts
im = Image.new('L', (W * S, H * S), 0); g = ImageDraw.Draw(im)
def px(lon, lat): return ((lon + 180) / 360 * W * S, (90 - lat) / 180 * H * S)
n = 0
for geom in d['objects']['land']['geometries']:
    polys = geom['arcs'] if geom['type'] == 'MultiPolygon' else [geom['arcs']]
    for poly in polys:
        for k, r in enumerate(poly):
            # unwrap longitudes so a ring crossing the antimeridian stays continuous, then draw it at −360, 0 and +360:
            # the frame keeps whatever falls inside (no streaks across the map)
            ll = ring(r); un = [ll[0]]
            for lon, lat in ll[1:]:
                p0 = un[-1][0]
                while lon - p0 > 180: lon -= 360
                while lon - p0 < -180: lon += 360
                un.append((lon, lat))
            for off in (-360, 0, 360):
                pts = [px(lon + off, lat) for lon, lat in un]
                if len(pts) > 2: g.polygon(pts, fill=255 if k == 0 else 0)
            n += 1
im = im.resize((W, H), Image.LANCZOS)
im.save(OUT)
print(f'{n} rings → {os.path.relpath(OUT)} ({W}×{H}), land {sum(1 for v in im.getdata() if v > 127) / (W * H) * 100:.1f} % of pixels')
