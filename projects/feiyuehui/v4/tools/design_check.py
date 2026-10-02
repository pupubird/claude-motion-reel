# Design check for a generative re-render: at the moments each client piece is on screen, put the clay blockout, the
# take and the client's real product photo side by side, so a changed design (stone count, shape, carving, bail) is
# caught before a take is used.   python3 projects/feiyuehui/v4/tools/design_check.py CHUNK TAKE.mp4 OUT.jpg
import os, sys, subprocess
from PIL import Image, ImageDraw, ImageFont

HERE = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(HERE, '..', 'out', 'seedance', 'src')
# chunk → [(time in the chunk, the piece on screen, its reference photo or None)]
MOMENTS = {
    'c1': [(1.2, 'glow under the cloud', None), (4.5, 'ring', 'ref_ring.png'), (10.2, 'cabochon vortex', None), (12.8, 'the one cabochon', 'ref_ring.png')],
    'c2': [(1.0, '设计 exploded ring', 'ref_ring.png'), (3.2, '设计 assembled ring', 'ref_ring.png'), (4.2, '雕刻 macro', None), (6.2, '雕刻 plaque', None)],
    'c3': [(1.2, '镶嵌 macro', None), (3.2, '镶嵌 plate', None), (4.6, 'Buddha', 'ref_buddha.png')],
    'c4': [(0.5, 'Guanyin', 'ref_guanyin.png'), (1.25, 'pea pod', 'ref_pod.png'), (1.75, 'tulip brooch', 'ref_tulip.png'), (2.6, 'bangle', 'ref_bangle.png'), (5.5, 'the orbit', None)],
    'c5': [(0.6, 'burst', None), (4.0, 'sky', None)],
}

def frame(path, t, w=640, h=360):
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-ss', f'{t:.3f}', '-i', path, '-frames:v', '1', '-vf', f'scale={w}:{h}', '-f', 'rawvideo',
                          '-pix_fmt', 'rgb24', '-'], capture_output=True).stdout
    return Image.frombytes('RGB', (w, h), raw) if len(raw) == w * h * 3 else Image.new('RGB', (w, h), (40, 0, 0))

chunk, take, out = sys.argv[1], sys.argv[2], sys.argv[3]
clay = os.path.join(SRC, f'clay_{chunk}.mp4')
rows = MOMENTS[chunk]
font = ImageFont.truetype('/System/Library/Fonts/PingFang.ttc', 22) if os.path.exists('/System/Library/Fonts/PingFang.ttc') else None
S = Image.new('RGB', (640 * 3 + 16, len(rows) * 392 + 8), (18, 18, 18))
d = ImageDraw.Draw(S)
for i, (t, what, ref) in enumerate(rows):
    y = 8 + i * 392
    S.paste(frame(clay, t), (4, y + 28)); S.paste(frame(take, t), (648, y + 28))
    if ref:
        r = Image.open(os.path.join(SRC, ref)).convert('RGB'); r.thumbnail((640, 360))
        S.paste(r, (1292 + (640 - r.width) // 2, y + 28 + (360 - r.height) // 2))
    d.text((8, y + 2), f'{chunk} {t:.2f}s — {what}  (clay · take · real piece)', fill=(230, 230, 230), font=font)
S.save(out, quality=88)
print(out)
