# A motion strip of a whole clip: frames every 1/fps s, tiled `cols` across, labelled in seconds.
#   python3 tools/vstrip.py video.mp4 out.jpg [fps=10] [cols=10] [w=216] [t0=0] [t1=end]
import sys, subprocess, tempfile, glob, os
from PIL import Image, ImageDraw

vid, out = sys.argv[1], sys.argv[2]
fps = float(sys.argv[3]) if len(sys.argv) > 3 else 10
cols = int(sys.argv[4]) if len(sys.argv) > 4 else 10
w = int(sys.argv[5]) if len(sys.argv) > 5 else 216
t0 = float(sys.argv[6]) if len(sys.argv) > 6 else 0
t1 = sys.argv[7] if len(sys.argv) > 7 else None
with tempfile.TemporaryDirectory() as d:
    cmd = ['ffmpeg', '-loglevel', 'error', '-ss', str(t0)] + (['-to', t1] if t1 else []) + ['-i', vid, '-vf', f'fps={fps},scale={w}:-2', os.path.join(d, 'f_%04d.png')]
    subprocess.run(cmd, check=True)
    fs = sorted(glob.glob(os.path.join(d, 'f_*.png')))
    fw, fh = Image.open(fs[0]).size
    rows = (len(fs) + cols - 1) // cols
    sheet = Image.new('RGB', (cols * fw, rows * (fh + 18)), (20, 20, 24))
    dr = ImageDraw.Draw(sheet)
    for i, f in enumerate(fs):
        x, y = (i % cols) * fw, (i // cols) * (fh + 18)
        sheet.paste(Image.open(f), (x, y + 18))
        dr.text((x + 3, y + 3), f'{t0 + i / fps:.2f}s', fill=(255, 220, 80))
    sheet.save(out, quality=88)
    print(f'{out}: {len(fs)} frames, {sheet.size[0]}x{sheet.size[1]}')
