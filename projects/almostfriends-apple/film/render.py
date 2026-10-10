# Render chosen frames of film.blend.
#   blender -b projects/almostfriends-apple/film/film.blend -P projects/almostfriends-apple/film/render.py -- \
#       --frames 0-3215 --pct 100 --samples 32 --depth 8 --out projects/almostfriends-apple/film/out/master --skip-existing
# --frames takes a list and ranges with a step: 40,100,0-400 or 0-3215:2. Prints seconds per frame.
# --depth 8 writes dithered 8-bit PNGs (the master: half the disk of 16-bit, and h.264 is 8-bit anyway).
import bpy, sys, os, time, argparse

argv = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
ap = argparse.ArgumentParser()
ap.add_argument('--frames', required=True)
ap.add_argument('--pct', type=int, default=100)
ap.add_argument('--samples', type=int, default=128)
ap.add_argument('--threshold', type=float, default=0.02)
ap.add_argument('--out', required=True)
ap.add_argument('--skip-existing', action='store_true')
ap.add_argument('--depth', choices=('8', '16'), default='16')
a = ap.parse_args(argv)

frames = []
for part in a.frames.split(','):
    if '-' in part:
        step = 1
        if ':' in part: part, step = part.split(':'); step = int(step)
        lo, hi = part.split('-'); frames.extend(range(int(lo), int(hi) + 1, step))
    else:
        frames.append(int(part))

sc = bpy.context.scene
sc.render.resolution_percentage = a.pct
sc.cycles.samples = a.samples
sc.cycles.adaptive_threshold = a.threshold
sc.render.image_settings.color_depth = a.depth; sc.render.dither_intensity = 1.0
try:
    prefs = bpy.context.preferences.addons['cycles'].preferences
    prefs.compute_device_type = 'METAL'
    try: prefs.refresh_devices()
    except Exception: prefs.get_devices()
    for d in prefs.devices: d.use = True
    sc.cycles.device = 'GPU'
except Exception as e:
    print('GPU setup failed:', e)
os.makedirs(a.out, exist_ok=True)
for f in frames:
    path = os.path.join(a.out, f'f{f:04d}.png')
    if a.skip_existing and os.path.exists(path):
        continue
    t = time.time()
    sc.frame_set(f)
    sc.render.filepath = path
    bpy.ops.render.render(write_still=True)
    print(f'RENDERED {f} {time.time() - t:.1f}s', flush=True)
