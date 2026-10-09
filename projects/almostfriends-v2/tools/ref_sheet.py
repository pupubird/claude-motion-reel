"""Tile 2 fps frames into labelled contact sheets (6x5 = 15 s per sheet). usage: ref_sheet.py <framesdir> <outprefix>"""
import sys, glob
from PIL import Image, ImageDraw, ImageFont
frames = sorted(glob.glob(f"{sys.argv[1]}/h_*.jpg"))
font = ImageFont.truetype("/System/Library/Fonts/Menlo.ttc", 22)
cols, rows, per = 6, 5, 30
for s in range(0, len(frames), per):
    ims = [Image.open(f) for f in frames[s:s + per]]
    w, h = ims[0].size
    sheet = Image.new("RGB", (cols * w, rows * h), "black")
    for i, im in enumerate(ims):
        x, y = (i % cols) * w, (i // cols) * h
        sheet.paste(im, (x, y))
        t = (s + i) * 0.5
        d = ImageDraw.Draw(sheet)
        d.rectangle([x, y, x + 92, y + 28], fill="black")
        d.text((x + 6, y + 3), f"{int(t//60)}:{t%60:04.1f}", font=font, fill="yellow")
    sheet.save(f"{sys.argv[2]}_{s // per + 1:02d}.jpg", quality=85)
