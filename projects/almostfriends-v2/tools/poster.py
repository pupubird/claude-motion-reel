# The poster: key frames of the master in a row on the film's own daylight, for the README and a review.
#   python3 projects/almostfriends-special/tools/poster.py <master.mp4> <out.jpg> [t,t,…]
import subprocess, sys, io
from PIL import Image, ImageDraw, ImageFilter
src, out = sys.argv[1], sys.argv[2]
times = [float(x) for x in (sys.argv[3] if len(sys.argv) > 3 else '1.0,2.25,14.88,20.4,23.9,32.3,50.45,59.6,64.5').split(',')]
w, h, pad, gap = 360, 640, 44, 22
W = len(times) * w + (len(times) - 1) * gap + 2 * pad
H = h + 2 * pad
bg = Image.new('RGB', (W, H))
d = ImageDraw.Draw(bg)
stops = [(220, 239, 255), (238, 236, 250), (255, 232, 218)]                     # the brand's sky → peach
for x in range(W):
    k = x / (W - 1) * (len(stops) - 1)
    i = min(int(k), len(stops) - 2); f = k - i
    c = tuple(round(a + (b - a) * f) for a, b in zip(stops[i], stops[i + 1]))
    d.line([(x, 0), (x, H)], fill=c)
for i, t in enumerate(times):
    png = subprocess.run(['ffmpeg', '-v', 'error', '-ss', str(t), '-i', src, '-frames:v', '1', '-f', 'image2pipe', '-vcodec', 'png', '-'], capture_output=True).stdout
    fr = Image.open(io.BytesIO(png)).convert('RGB').resize((w, h), Image.LANCZOS)
    m = Image.new('L', (w, h), 0); ImageDraw.Draw(m).rounded_rectangle((0, 0, w - 1, h - 1), radius=26, fill=255)
    x = pad + i * (w + gap)
    s = Image.new('L', (w + 60, h + 60), 0); ImageDraw.Draw(s).rounded_rectangle((30, 40, w + 29, h + 39), radius=26, fill=46)
    bg.paste((11, 27, 63), (x - 30, pad - 30), s.filter(ImageFilter.GaussianBlur(16)))
    bg.paste(fr, (x, pad), m)
bg.save(out, quality=90, optimize=True)
print(out, bg.size)
