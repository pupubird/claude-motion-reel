# The mix: score + sound design placed on the picture (tools/cues.py), the breath before the drop carved into the
# score, then two-pass loudness normalisation to −14 LUFS / −1.5 dBTP → audio/mix.wav (48 kHz, 16-bit) plus stems.
#   python3 projects/feiyuehui/v4/tools/mix.py [--score t1]
# Prints, per cue, the event's short-term peak against the score's local level (what a listener hears as "too loud /
# buried" — the novapitch rule: accents within about ±6 dB of the local score).
import os, sys, json, argparse, subprocess
import numpy as np
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
from cues import CUES, T

SR = 48000
DUR = 40.0
A = os.path.join(HERE, '..', 'audio')

def load(path):
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', path, '-ac', '2', '-ar', str(SR), '-f', 'f32le', '-'], capture_output=True).stdout
    return np.frombuffer(raw, np.float32).reshape(-1, 2).astype(np.float64)

def db(x): return 20 * np.log10(max(x, 1e-9))
def rms(x): return float(np.sqrt(np.mean(x ** 2))) if len(x) else 0.0

ap = argparse.ArgumentParser()
ap.add_argument('--score', default='c6')
ap.add_argument('--breath', type=float, default=-16, help='dB the score dips in the half beat before the drop')
a = ap.parse_args()

n = int(DUR * SR)
music = load(os.path.join(A, 'music', f'{a.score}.mp3'))[:n]
music = np.pad(music, ((0, n - len(music)), (0, 0)))
# the breath: the score falls away for the last 0.4 s before the drop, the riser fills it, the drop lands on silence
g = np.ones(n)
b0, b1 = int((T['drop'] - 0.45) * SR), int((T['drop'] - 0.02) * SR)
fade = int(0.06 * SR)
lo = 10 ** (a.breath / 20)
g[b0:b1] = lo
g[b0 - fade:b0] = np.linspace(1, lo, fade)
g[b1:b1 + int(0.01 * SR)] = np.linspace(lo, 1, int(0.01 * SR))
music = music * g[:, None]

sfx = np.zeros((n, 2))
report = []
for name, start, gain, fin, fout, off in CUES:
    x = load(os.path.join(A, 'sfx', f'{name}.mp3'))
    x = x[int(off * SR):]
    L = len(x)
    env = np.ones(L)
    if fin > 0: env[:int(fin * SR)] = np.linspace(0, 1, min(L, int(fin * SR)))
    if fout > 0: k = min(L, int(fout * SR)); env[L - k:] *= np.linspace(1, 0, k)
    x = x * env[:, None] * 10 ** (gain / 20)
    s = int(start * SR)
    e = min(n, s + L)
    if s >= n: continue
    sfx[s:e] += x[:e - s]
    # loudness check: the event's loudest 100 ms vs the score's level over the same second
    w = int(0.1 * SR)
    seg = x[:e - s]
    peak = max(rms(seg[i:i + w]) for i in range(0, max(1, len(seg) - w), w // 2)) if len(seg) > w else rms(seg)
    m0, m1 = max(0, s - SR // 2), min(n, s + SR // 2)
    report.append((name, start, db(peak) - db(rms(music[m0:m1]))))

mix = music + sfx
peak = np.max(np.abs(mix))
os.makedirs(A, exist_ok=True)
def wav(path, x):
    y = np.clip(x, -1, 1)
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-f', 'f64le', '-ar', str(SR), '-ac', '2', '-i', '-', '-c:a', 'pcm_s24le', path],
                   input=y.astype(np.float64).tobytes(), check=True)
raw = os.path.join(A, 'mix-raw.wav')
wav(raw, mix / max(peak, 1e-9) * 0.9)
wav(os.path.join(A, 'stem-music.wav'), music / max(peak, 1e-9) * 0.9)
wav(os.path.join(A, 'stem-sfx.wav'), sfx / max(peak, 1e-9) * 0.9)
# −1.5 dBTP, not −1.0: the AAC encode in render.mjs overshoots the WAV's true peak by ~0.1–0.3 dB, and the gate
# (tools/check_audio.py) measures the delivered mp4
LN = 'loudnorm=I=-14:TP=-1.5:LRA=11'
p1 = subprocess.run(['ffmpeg', '-hide_banner', '-nostats', '-i', raw, '-af', f'{LN}:print_format=json', '-f', 'null', '-'], capture_output=True, text=True).stderr
m = json.loads(p1[p1.rindex('{'):p1.rindex('}') + 1])
out = os.path.join(A, 'mix.wav')
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', raw, '-af',
                f"{LN}:measured_I={m['input_i']}:measured_TP={m['input_tp']}:measured_LRA={m['input_lra']}:measured_thresh={m['input_thresh']}:offset={m['target_offset']}:linear=true",
                '-ar', str(SR), '-c:a', 'pcm_s16le', out], check=True)
print(f"mix → {os.path.relpath(out)} (raw {m['input_i']} LUFS, {m['input_tp']} dBTP → −14 LUFS, −1.5 dBTP)")
print('cue          at      peak vs local score')
for name, start, d in report:
    flag = '  LOUD' if d > 6 else '  buried' if d < -12 else ''
    print(f'  {name:10s} {start:5.2f}s  {d:+5.1f} dB{flag}')
