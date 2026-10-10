# Jump gate: finds single-frame jumps (a hard cut, a pop-in, a frame that snaps) that the luminance gate misses
# because both sides of the cut are equally bright. A jump is a frame that changes far more than its neighbours:
# mean |Δ| over the frame > 12 (0–255) and > 4× the median of the 13 frames around it. A fast but continuous move
# raises its neighbours too, so it doesn't count.
#   python3 projects/<film>/tools/check_jumps.py video.mp4 [--allow=4.0,50.0]
# --allow lists designed hits (s): a jump within 0.1 s of one is reported but doesn't fail the gate.
# Near misses (mean |Δ| > 9 and > 3× the local median) are reported too, without failing: the chat's one-frame scroll
# snap measured 9.7 on the English master and passed unseen, then 12.2 on the Chinese one.
# Validated on reel 06: it finds v1's four cuts (29.62, 32.02, 34.02, 35.92 s) and, on v2, only the designed pop.
import subprocess, sys
import numpy as np

# options are --name=value; a bare "--allow 4.0" used to be read as a second video path and the allow list as empty,
# which failed designed hits silently (v4) — so anything else is refused
bad = [a for a in sys.argv[1:] if a.startswith('--') and '=' not in a]
if bad: sys.exit(f'check_jumps: write options as --name=value (got {bad})')
args = [a for a in sys.argv[1:] if not a.startswith('--')]
if len(args) != 1: sys.exit(f'check_jumps: one video, got {args}')
opts = dict(a[2:].split('=', 1) for a in sys.argv[1:] if a.startswith('--') and '=' in a)
allow = [float(x) for x in opts.get('allow', '').split(',') if x]
video = args[0]
w, h = 108, 192
fps = float(eval(subprocess.run(['ffprobe', '-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=r_frame_rate',
                                 '-of', 'csv=p=0', video], capture_output=True, text=True, check=True).stdout.strip()))
raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', video, '-vf', f'scale={w}:{h},format=gray', '-f', 'rawvideo', '-'],
                     capture_output=True, check=True).stdout
f = np.frombuffer(raw, np.uint8).reshape(-1, h, w).astype(np.float32)
d = np.abs(np.diff(f, axis=0)).mean(axis=(1, 2))
loc = np.array([np.median(d[max(0, i - 6):i + 7]) for i in range(len(d))])
jumps = [((i + 1) / fps, d[i]) for i in range(len(d)) if d[i] > 12 and d[i] > 4 * max(loc[i], 1)]
bad = [(t, v) for t, v in jumps if not any(abs(t - a) <= 0.1 for a in allow)]
near = [((i + 1) / fps, d[i]) for i in range(len(d)) if 9 < d[i] <= 12 and d[i] > 3 * max(loc[i], 1)
        and not any(abs((i + 1) / fps - a) <= 0.1 for a in allow)]
print(f'{len(f)} frames · median change {np.median(d):.2f} · jumps {len(jumps)}: ' +
      (', '.join(f'{t:.2f}s ({v:.0f}){"" if (t, v) in bad else " designed"}' for t, v in jumps) or 'none'))
if near: print('near misses (look at them): ' + ', '.join(f'{t:.2f}s ({v:.1f})' for t, v in near))
print('JUMP GATE ' + ('PASS' if not bad else f'FAIL ({len(bad)} unplanned)'))
sys.exit(1 if bad else 0)
