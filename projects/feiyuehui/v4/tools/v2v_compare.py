# Compare an AI video-to-video pass (e.g. Seedance 2.5 video_edit) against its source: did anything move?
#   python3 projects/feiyuehui/v4/tools/v2v_compare.py SRC.mp4 OUT.mp4 OUTDIR [--times 0.5,2,4]
# Writes OUTDIR/sbs_<t>.png (source | AI, full resolution) and prints, per sampled frame:
#   ssim   structural similarity of the blurred luminance (1 = same structure; a realism pass that keeps every
#          element should stay high — lighting/texture change lowers it a little, moved or redrawn shapes a lot)
#   edges  share of the source's strong edges that still have an edge within 2 px in the AI frame (geometry kept)
#   shift  best global offset (px) between the two — a reframed or drifting camera shows up here
import sys, os, argparse, subprocess
import numpy as np
from PIL import Image, ImageFilter

ap = argparse.ArgumentParser()
ap.add_argument('src'); ap.add_argument('out'); ap.add_argument('outdir')
ap.add_argument('--times', default='')
a = ap.parse_args()
os.makedirs(a.outdir, exist_ok=True)

def probe(p):
    r = subprocess.run(['ffprobe', '-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=width,height,r_frame_rate:format=duration',
                        '-of', 'default=nw=1', p], capture_output=True, text=True).stdout
    d = dict(l.split('=', 1) for l in r.strip().splitlines())
    n, m = d['r_frame_rate'].split('/')
    return int(d['width']), int(d['height']), float(n) / float(m), float(d['duration'])

def frame(p, t, w, h):
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-ss', f'{t:.4f}', '-i', p, '-frames:v', '1', '-vf', f'scale={w}:{h}:flags=lanczos',
                          '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-'], capture_output=True).stdout
    return np.frombuffer(raw, np.uint8).reshape(h, w, 3)

def lum(x): return (0.2126 * x[..., 0] + 0.7152 * x[..., 1] + 0.0722 * x[..., 2]).astype(np.float64) / 255

def boxblur(x, r):
    k = 2 * r + 1
    c = np.cumsum(np.cumsum(np.pad(x, ((r + 1, r), (r + 1, r)), mode='edge'), 0), 1)
    return (c[k:, k:] - c[:-k, k:] - c[k:, :-k] + c[:-k, :-k]) / (k * k)

def ssim(x, y, r=4):
    C1, C2 = 0.01 ** 2, 0.03 ** 2
    mx, my = boxblur(x, r), boxblur(y, r)
    vx, vy = boxblur(x * x, r) - mx * mx, boxblur(y * y, r) - my * my
    cxy = boxblur(x * y, r) - mx * my
    return float(np.mean(((2 * mx * my + C1) * (2 * cxy + C2)) / ((mx * mx + my * my + C1) * (vx + vy + C2))))

def edges(x):
    gx = np.zeros_like(x); gy = np.zeros_like(x)
    gx[:, 1:-1] = x[:, 2:] - x[:, :-2]; gy[1:-1, :] = x[2:, :] - x[:-2, :]
    g = np.hypot(gx, gy)
    return g > max(0.08, np.percentile(g, 92))

def dilate(m, r):
    out = m.copy()
    for dy in range(-r, r + 1):
        for dx in range(-r, r + 1):
            out |= np.roll(np.roll(m, dy, 0), dx, 1)
    return out

def shift(x, y):
    # phase correlation on the downscaled luminance
    F = np.fft.fft2(x - x.mean()); G = np.fft.fft2(y - y.mean())
    R = F * np.conj(G); R /= np.abs(R) + 1e-9
    c = np.fft.ifft2(R).real
    iy, ix = np.unravel_index(np.argmax(c), c.shape)
    if iy > c.shape[0] // 2: iy -= c.shape[0]
    if ix > c.shape[1] // 2: ix -= c.shape[1]
    return ix, iy

sw, sh, sfps, sdur = probe(a.src)
ow, oh, ofps, odur = probe(a.out)
print(f'source {sw}x{sh} @ {sfps:.2f} fps, {sdur:.2f} s  ·  AI {ow}x{oh} @ {ofps:.2f} fps, {odur:.2f} s')
times = [float(t) for t in a.times.split(',')] if a.times else list(np.round(np.linspace(0.25, min(sdur, odur) - 0.25, 9), 2))
W, H = 480, 270
rows = []
for t in times:
    s = frame(a.src, t, sw, sh); o = frame(a.out, t, sw, sh)
    Image.fromarray(np.concatenate([s, o], 1)).save(os.path.join(a.outdir, f'sbs_{t:05.2f}.png'))
    ls = lum(np.asarray(Image.fromarray(s).resize((W, H), Image.LANCZOS)))
    lo = lum(np.asarray(Image.fromarray(o).resize((W, H), Image.LANCZOS)))
    bs = np.asarray(Image.fromarray((ls * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(1.5)), np.float64) / 255
    bo = np.asarray(Image.fromarray((lo * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(1.5)), np.float64) / 255
    es, eo = edges(bs), edges(bo)
    kept = (es & dilate(eo, 2)).sum() / max(1, es.sum())
    dx, dy = shift(bs, bo)
    rows.append((t, ssim(bs, bo), kept, dx * sw / W, dy * sh / H))
    print(f'  t={t:5.2f}s  ssim {rows[-1][1]:.3f}  edges kept {kept * 100:5.1f} %  shift ({rows[-1][3]:+.0f}, {rows[-1][4]:+.0f}) px')
m = np.array([r[1:3] for r in rows])
print(f'mean ssim {m[:, 0].mean():.3f} · mean edges kept {m[:, 1].mean() * 100:.1f} % · side-by-sides in {a.outdir}')
