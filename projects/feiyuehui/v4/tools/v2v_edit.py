# Cut the realism version of the film from an edit list: each segment of the film's timeline comes from a source clip
# (a Seedance take, or the CG master), from a time range in that source; segments that carry type get the original
# glyphs composited back from the matte (v2v_comp.py). Then concatenate at 24 fps and lay the film's mix under it.
#   python3 projects/feiyuehui/v4/tools/v2v_edit.py projects/feiyuehui/v4/tools/real_edit.json OUT.mp4
# EDIT.json: [{"film": [t0, t1], "src": "path", "from": [s0, s1] | "map": [[f, s], …], "type": true|false}, …]
#   A relative "src" is relative to v4/out (the CG master and the Seedance takes live there), so it runs from anywhere.
#   The film ranges must tile 0…40 s. "from" defaults to [0, t1 − t0]; a source range of the same length is cut as is.
#   A source range of another length, or a "map" (segment time f from 0 → source time s, a speed ramp through the
#   points, monotone cubic), is retimed from a motion-interpolated copy of the source (ffmpeg minterpolate at 120 fps,
#   adjacent frames blended for the fraction) — never by dropping or repeating frames, which judders.
import os, sys, json, subprocess
import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
V4 = os.path.join(HERE, '..')
W, H, FPS, HI = 1920, 1080, 24, 120
ENC = ['-c:v', 'libx264', '-preset', 'slow', '-crf', '12', '-pix_fmt', 'yuv420p', '-color_primaries', 'bt709', '-color_trc', 'bt709', '-colorspace', 'bt709']

def run(cmd): subprocess.run(cmd, check=True)

def ramp(points):
    """Monotone cubic (Fritsch–Carlson) through [(f, s), …]: segment time → source time, no overshoot."""
    f, s = np.array(points, float).T
    d = np.diff(s) / np.diff(f)
    m = np.concatenate([[d[0]], (d[:-1] + d[1:]) / 2, [d[-1]]])
    for i in range(len(d)):
        if d[i] == 0: m[i] = m[i + 1] = 0; continue
        a, b = m[i] / d[i], m[i + 1] / d[i]
        if a * a + b * b > 9: t = 3 / np.hypot(a, b); m[i], m[i + 1] = t * a * d[i], t * b * d[i]
    def at(x):
        i = int(np.clip(np.searchsorted(f, x) - 1, 0, len(d) - 1)); h = f[i + 1] - f[i]; u = (x - f[i]) / h
        return (2*u**3 - 3*u**2 + 1) * s[i] + (u**3 - 2*u**2 + u) * h * m[i] + (-2*u**3 + 3*u**2) * s[i + 1] + (u**3 - u**2) * h * m[i + 1]
    return at

def retime(src, points, n, out):
    """n frames at 24 fps, frame j showing source time ramp(j / 24)."""
    at = ramp(points)
    want = [at(j / FPS) for j in range(n)]
    s0 = max(0.0, min(want) - 0.1)
    dec = subprocess.Popen(['ffmpeg', '-v', 'error', '-ss', f'{s0:.4f}', '-t', f'{max(want) - s0 + 0.2:.4f}', '-i', src, '-an', '-vf',
                            f'scale={W}:{H}:flags=lanczos,minterpolate=fps={HI}:mi_mode=mci:mc_mode=aobmc:me_mode=bidir:vsbmc=1',
                            '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-'], stdout=subprocess.PIPE)
    enc = subprocess.Popen(['ffmpeg', '-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{W}x{H}', '-r', str(FPS), '-i', '-',
                            '-frames:v', str(n), *ENC, out], stdin=subprocess.PIPE)
    size = W * H * 3
    buf, k = {}, -1                                   # interpolated frames by index (source time ≈ s0 + index / HI)
    def frame(i):
        nonlocal k
        while k < i:
            raw = dec.stdout.read(size)
            if len(raw) < size: break                 # past the end: hold the last frame
            k += 1; buf[k] = np.frombuffer(raw, np.uint8).reshape(H, W, 3)
            buf.pop(k - 3, None)
        return buf[min(i, k)]
    for s in want:
        x = (s - s0) * HI; i = int(np.floor(x)); a = x - i
        img = frame(i) if a < 1e-3 else (frame(i).astype(np.float32) * (1 - a) + frame(i + 1).astype(np.float32) * a + 0.5).astype(np.uint8)
        enc.stdin.write(img.tobytes())
    enc.stdin.close(); enc.wait(); dec.kill()

edit = json.load(open(sys.argv[1]))
out = sys.argv[2]
work = os.path.join(V4, 'out', 'seedance', 'edit')
os.makedirs(work, exist_ok=True)

parts, t = [], 0.0
for i, s in enumerate(edit):
    f0, f1 = s['film']
    assert abs(f0 - t) < 1e-6, f'segment {i} starts at {f0}, expected {t}'
    t = f1
    n = round((f1 - f0) * FPS)
    src = s['src'] if os.path.isabs(s['src']) else os.path.join(V4, 'out', s['src'])
    seg = os.path.join(work, f'seg{i:02d}.mp4')
    points = s.get('map')
    if not points:
        s0, s1 = s.get('from', [0, f1 - f0])
        if abs((s1 - s0) - (f1 - f0)) > 1e-6: points = [[0, s0], [f1 - f0, s1]]
    if points:
        retime(src, points, n, seg)
        how = 'ramp ' + ' '.join(f'{a:g}→{b:g}' for a, b in points)
    else:
        run(['ffmpeg', '-v', 'error', '-y', '-ss', f'{s0:.4f}', '-t', f'{s1 - s0 + 0.2:.4f}', '-i', src, '-an',
             '-vf', f'setpts=PTS-STARTPTS,fps={FPS},scale={W}:{H}:flags=lanczos', '-frames:v', str(n), *ENC, seg])
        how = f'[{s0:.2f}–{s1:.2f}]'
    if s.get('type'):
        typed = os.path.join(work, f'seg{i:02d}_typed.mp4')
        run([sys.executable, os.path.join(HERE, 'v2v_comp.py'), '--ai', seg, '--start', str(f0), '--out', typed, '--grow', '0', '--soft', '0.8'])
        seg = typed
    got = int(subprocess.run(['ffprobe', '-v', 'error', '-count_frames', '-select_streams', 'v:0', '-show_entries', 'stream=nb_read_frames',
                              '-of', 'csv=p=0', seg], capture_output=True, text=True).stdout.strip())
    assert got == n, f'segment {i}: {got} frames, expected {n}'
    print(f'{f0:5.2f}–{f1:5.2f} s  ← {os.path.basename(src)} {how}  {got} frames{"  + type" if s.get("type") else ""}', flush=True)
    parts.append(seg)
assert abs(t - 40.0) < 1e-6, f'edit ends at {t}, not 40 s'

lst = os.path.join(work, 'concat.txt')
with open(lst, 'w') as fh:
    fh.writelines(f"file '{p}'\n" for p in parts)
silent = os.path.join(work, 'film_24.mp4')
run(['ffmpeg', '-v', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', lst, '-c:v', 'libx264', '-preset', 'slow', '-crf', '14',
     '-pix_fmt', 'yuv420p', '-color_primaries', 'bt709', '-color_trc', 'bt709', '-colorspace', 'bt709', '-r', str(FPS), silent])
run(['ffmpeg', '-v', 'error', '-y', '-i', silent, '-i', os.path.join(V4, 'audio', 'mix.wav'), '-map', '0:v', '-map', '1:a', '-c:v', 'copy',
     '-c:a', 'aac', '-b:a', '320k', '-shortest', '-movflags', '+faststart', out])
print(f'→ {out}')
