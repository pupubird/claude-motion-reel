# Glyph outlines for the film's 3D type, from Noto Serif SC (SIL OFL, the @fontsource package in node_modules).
# fontsource splits the CJK font into unicode-range subsets; this finds the subset holding each character, reads its
# outline with fontTools, and writes em-normalised contours (y up, advance, baseline at 0) for THREE.ShapePath.
#   python3 projects/feiyuehui/v4/tools/glyphs.py --weight 600 --chars 严选拨开云雾见明月你的翡翠管家传世
import os, sys, json, glob, argparse
from fontTools.ttLib import TTFont
from fontTools.pens.recordingPen import RecordingPen

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, '..', '..', '..', '..'))
FILES = os.path.join(ROOT, 'node_modules', '@fontsource', 'noto-serif-sc', 'files')

ap = argparse.ArgumentParser()
ap.add_argument('--weight', default='600')
ap.add_argument('--chars', required=True)
ap.add_argument('--out', default=os.path.join(HERE, '..', 'data', 'glyphs.json'))
a = ap.parse_args()

subsets = sorted(glob.glob(os.path.join(FILES, f'noto-serif-sc-*-{a.weight}-normal.woff2')))
if not subsets:
    sys.exit(f'no Noto Serif SC {a.weight} subsets in {FILES}')
fonts = {}
def font(path):
    if path not in fonts:
        fonts[path] = TTFont(path)
    return fonts[path]

out = json.load(open(a.out)) if os.path.exists(a.out) else {}
out.setdefault('meta', {'font': 'Noto Serif SC (SIL OFL 1.1) via @fontsource/noto-serif-sc', 'units': 'em, y up, baseline 0'})
key = f'serif{a.weight}'
out.setdefault(key, {})
for ch in a.chars:
    cp = ord(ch)
    hit = None
    for p in subsets:
        f = font(p)
        cmap = f.getBestCmap()
        if cp in cmap:
            hit = (p, f, cmap[cp]); break
    if not hit:
        print(f'{ch}: not found'); continue
    p, f, gname = hit
    upem = f['head'].unitsPerEm
    gs = f.getGlyphSet()
    pen = RecordingPen()
    gs[gname].draw(pen)
    # commands → [[op, x, y, ...], ...] in em; quadratic qCurveTo runs expanded into explicit Q segments
    cmds = []
    s = 1.0 / upem
    for op, pts in pen.value:
        if op == 'moveTo':
            cmds.append(['M', pts[0][0] * s, pts[0][1] * s])
        elif op == 'lineTo':
            cmds.append(['L', pts[0][0] * s, pts[0][1] * s])
        elif op == 'qCurveTo':
            q = list(pts)
            if q[-1] is None:
                q = q[:-1]
            # implied on-curve points between consecutive off-curve points
            for i in range(len(q) - 1):
                c = q[i]
                if i < len(q) - 2:
                    e = ((q[i][0] + q[i + 1][0]) / 2, (q[i][1] + q[i + 1][1]) / 2)
                else:
                    e = q[i + 1]
                cmds.append(['Q', c[0] * s, c[1] * s, e[0] * s, e[1] * s])
        elif op == 'curveTo':
            c1, c2, e = pts
            cmds.append(['C', c1[0] * s, c1[1] * s, c2[0] * s, c2[1] * s, e[0] * s, e[1] * s])
        elif op in ('closePath', 'endPath'):
            cmds.append(['Z'])
    adv = f['hmtx'][gname][0] * s
    out[key][ch] = {'adv': round(adv, 5), 'cmds': [[c[0]] + [round(v, 5) for v in c[1:]] for c in cmds]}
    print(f'{ch}: {gname} in {os.path.basename(p)} · {len(cmds)} cmds · adv {adv:.3f}')
os.makedirs(os.path.dirname(a.out), exist_ok=True)
json.dump(out, open(a.out, 'w'), ensure_ascii=False, separators=(',', ':'))
print(f'→ {os.path.relpath(a.out, ROOT)}')
