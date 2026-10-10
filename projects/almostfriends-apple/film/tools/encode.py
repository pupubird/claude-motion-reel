# Encode the film from rendered frames + the mix.
#   python3 projects/almostfriends-apple/film/tools/encode.py preview [out/prev50]   # every 2nd frame -> 30 fps, 540x960
#   python3 projects/almostfriends-apple/film/tools/encode.py master    # out/master, 60 fps, 1080x1920, CRF 14 + web 8 Mb/s
import os, sys, glob, shutil, subprocess, tempfile
HERE = os.path.dirname(os.path.abspath(__file__))
FILM = os.path.abspath(os.path.join(HERE, '..'))
ROOT = os.path.abspath(os.path.join(FILM, '..'))
MIX = os.path.join(ROOT, 'audio/edits/film_mix.wav')
mode = sys.argv[1] if len(sys.argv) > 1 else 'preview'

def run(cmd): print(' '.join(cmd[:6]), '…'); subprocess.run(cmd, check=True)

if mode == 'preview':
    src = os.path.join(FILM, sys.argv[2] if len(sys.argv) > 2 else 'out/prev25')
    frames = sorted(f for f in glob.glob(os.path.join(src, 'f*.png')) if int(os.path.basename(f)[1:5]) % 2 == 0)
    tmp = tempfile.mkdtemp(dir=os.path.join(FILM, 'out'))
    for i, f in enumerate(frames): os.symlink(f, os.path.join(tmp, f'{i:05d}.png'))
    out = os.path.join(FILM, 'out/almostfriends-preview.mp4')
    run(['ffmpeg', '-v', 'error', '-y', '-framerate', '30', '-i', os.path.join(tmp, '%05d.png'), '-i', MIX,
         '-vf', 'scale=540:960:flags=lanczos', '-c:v', 'libx264', '-preset', 'medium', '-crf', '17', '-pix_fmt', 'yuv420p',
         '-c:a', 'aac', '-b:a', '256k', '-shortest', '-movflags', '+faststart', out])
    shutil.rmtree(tmp)
    print('PREVIEW', out, len(frames), 'frames')
else:
    src = os.path.join(FILM, 'out/master')
    out = os.path.join(FILM, 'out/almostfriends-2026.mp4')
    grain = 'noise=c0s=3:c0f=t'          # a whisper of film grain on luma only
    run(['ffmpeg', '-v', 'error', '-y', '-framerate', '60', '-i', os.path.join(src, 'f%04d.png'), '-i', MIX,
         '-vf', f'format=yuv420p,{grain}', '-c:v', 'libx264', '-preset', 'slow', '-crf', '14', '-pix_fmt', 'yuv420p',
         '-c:a', 'aac', '-b:a', '320k', '-shortest', '-movflags', '+faststart', out])
    web = os.path.join(FILM, 'out/almostfriends-2026-web.mp4')
    for p in (1, 2):
        run(['ffmpeg', '-v', 'error', '-y', '-i', out, '-c:v', 'libx264', '-preset', 'slow', '-b:v', '8M', '-maxrate', '10M', '-bufsize', '16M',
             '-pass', str(p), '-passlogfile', os.path.join(FILM, 'out/x264pass'), '-pix_fmt', 'yuv420p'] +
            (['-an', '-f', 'mp4', '/dev/null'] if p == 1 else ['-c:a', 'aac', '-b:a', '192k', '-movflags', '+faststart', web]))
    print('MASTER', out, 'WEB', web)
