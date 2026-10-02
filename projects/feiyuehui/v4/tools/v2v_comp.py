# Composite the film's original type and logo back over a generative video-to-video pass, so no glyph is ever
# redrawn by the model. The matte comes from the engine's matte pass (render.mjs --q=matte=1 → out/matte.mp4):
# white where type/logo is, with the same motion and lens blur as the picture.
#   python3 projects/feiyuehui/v4/tools/v2v_comp.py --ai AI.mp4 --start 17.5 --out OUT.mp4 [--grow 2 --soft 1.5]
#   python3 projects/feiyuehui/v4/tools/v2v_comp.py --selftest
# AI.mp4 is a clip of the film starting at --start (s) at 24 fps; the master and matte are 60 fps and are sampled at
# the same instants (fps=24 from the clip start), then: out = AI + (master − AI) × matte, per RGB channel.
# The merge runs in planar RGB with the matte in all three planes. (It once ran in YUV with a grey matte converted to
# YUV: the mask's chroma planes sat at 128 and its black at limited-range 16, so every pixel took ~50 % of the master's
# colour and ~7 % of its luma — CG ghosts beside the model's objects, type turned grey. --selftest guards it.)
import os, sys, argparse, subprocess, tempfile
import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, '..', 'out')
ap = argparse.ArgumentParser()
ap.add_argument('--ai')
ap.add_argument('--start', type=float)
ap.add_argument('--out')
ap.add_argument('--master', default=os.path.join(OUT, 'feiyuehui-v4.mp4'))
ap.add_argument('--matte', default=os.path.join(OUT, 'matte.mp4'))
ap.add_argument('--grow', type=int, default=2, help='dilate the matte by this many px (covers any halo the model drew)')
ap.add_argument('--soft', type=float, default=1.5, help='feather (gaussian sigma, px)')
ap.add_argument('--selftest', action='store_true', help='composite synthetic clips and check the merge is exact')
a = ap.parse_args()

def comp(ai, start, out, master, matte, grow, soft, size=(1920, 1080)):
    dur = float(subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'default=nw=1:nk=1', ai],
                               capture_output=True, text=True).stdout)
    w, h = size
    g = ','.join(['dilation'] * grow) if grow > 0 else 'null'
    rgb = 'in_color_matrix=bt709:in_range=tv,format=gbrp16le'
    fc = (f'[0:v]scale={w}:{h}:flags=lanczos:{rgb},fps=24[ai];'
          f'[1:v]scale={w}:{h}:{rgb},fps=24[or];'
          f'[2:v]fps=24,scale={w}:{h},format=gray,{g},gblur=sigma={soft},format=gbrp16le[m];'   # grey → R = G = B
          f'[ai][or][m]maskedmerge=planes=7,scale=out_color_matrix=bt709:out_range=tv,format=yuv420p[v]')
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', ai, '-ss', f'{start:.4f}', '-t', f'{dur:.4f}', '-i', master,
                    '-ss', f'{start:.4f}', '-t', f'{dur:.4f}', '-i', matte, '-filter_complex', fc, '-map', '[v]', '-an',
                    '-c:v', 'libx264', '-preset', 'slow', '-crf', '14', '-color_primaries', 'bt709', '-color_trc', 'bt709',
                    '-colorspace', 'bt709', '-movflags', '+faststart', out], check=True)
    return dur

def selftest():
    """AI = orange, master = blue, matte = left half white: the left half must come out blue, the right orange."""
    tmp = tempfile.mkdtemp()
    enc = ['-c:v', 'libx264', '-crf', '4', '-pix_fmt', 'yuv420p', '-color_primaries', 'bt709', '-color_trc', 'bt709', '-colorspace', 'bt709']
    mk = lambda name, src, fps: subprocess.run(['ffmpeg', '-v', 'error', '-y', '-f', 'lavfi', '-i', f'{src}:s=320x180:r={fps}:d=1', '-vf',
                                                'scale=out_color_matrix=bt709:out_range=tv', *enc, os.path.join(tmp, name)], check=True)
    mk('ai.mp4', 'color=c=0xE0802A', 24); mk('master.mp4', 'color=c=0x2A50D0', 60)
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-f', 'lavfi', '-i', 'color=c=black:s=320x180:r=60:d=1', '-vf',
                    'drawbox=x=0:y=0:w=160:h=180:c=white:t=fill,scale=out_color_matrix=bt709:out_range=tv', *enc, os.path.join(tmp, 'matte.mp4')], check=True)
    out = os.path.join(tmp, 'out.mp4')
    comp(os.path.join(tmp, 'ai.mp4'), 0.0, out, os.path.join(tmp, 'master.mp4'), os.path.join(tmp, 'matte.mp4'), 0, 0.5, (320, 180))
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', out, '-frames:v', '1', '-vf', 'scale=in_color_matrix=bt709:in_range=tv,format=rgb24',
                          '-f', 'rawvideo', '-'], capture_output=True).stdout
    img = np.frombuffer(raw, np.uint8).reshape(180, 320, 3).astype(int)
    left, right = img[60:120, 20:140].mean(axis=(0, 1)), img[60:120, 180:300].mean(axis=(0, 1))
    want_l, want_r = np.array([0x2A, 0x50, 0xD0]), np.array([0xE0, 0x80, 0x2A])
    el, er = np.abs(left - want_l).max(), np.abs(right - want_r).max()
    print(f'selftest: matte white → {left.round()} (want {want_l}), matte black → {right.round()} (want {want_r})')
    assert el <= 4 and er <= 4, f'merge leaks: off by {el:.1f} / {er:.1f} levels'
    print('selftest: ok')

if a.selftest:
    selftest(); sys.exit()
if not (a.ai and a.out and a.start is not None): ap.error('--ai, --start and --out are required')
dur = comp(a.ai, a.start, a.out, a.master, a.matte, a.grow, a.soft)
print(f'{a.out}: {dur:.2f} s from {a.start:.2f} s, type and logo from the master (matte grown {a.grow} px, soft {a.soft})')
