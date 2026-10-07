# The mix: the score (take s3, its one-bar pickup trimmed, nudged onto the picture's beat grid) + every cue from the
# cue sheet (audio/cues.json, built from the picture's own timeline) placed by its transient, peak or end, panned,
# sent to one room, the score ducked under the big hits; then mastered with a two-pass loudnorm.
#   python3 projects/almostfriends-special/tools/mix.py [--score s3] [--offset 0.03] [--tp -2] [--out mix.wav]
import os, sys, json, argparse, subprocess, wave
import numpy as np
from scipy.signal import butter, sosfilt, fftconvolve

HERE = os.path.dirname(os.path.abspath(__file__))
AUD = os.path.join(HERE, '..', 'audio')
SR, DUR = 48000, 44.0
N = int(DUR * SR)
ap = argparse.ArgumentParser()
ap.add_argument('--score', default='s3')
ap.add_argument('--offset', type=float, default=0.03, help='s: the take sits this much later than its plan (beats measured ~30 ms early)')
ap.add_argument('--score-db', type=float, default=-3.5)
ap.add_argument('--sfx-db', type=float, default=-2.0)
ap.add_argument('--tp', type=float, default=-2.0)
ap.add_argument('--intro-db', type=float, default=7.0, help='the score before the 6.0 drop')
ap.add_argument('--lufs', type=float, default=-14.0)
ap.add_argument('--out', default='mix.wav')
ap.add_argument('--stems', action='store_true', help='also write score-only and sfx-only stems')
a = ap.parse_args()

def read(path):
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', path, '-ac', '2', '-ar', str(SR), '-f', 'f32le', '-'], capture_output=True).stdout
    return np.frombuffer(raw, np.float32).reshape(-1, 2).astype(np.float64)
def lp(x, f, o=2): return sosfilt(butter(o, f, 'lowpass', fs=SR, output='sos'), x, axis=0)
def hp(x, f, o=2): return sosfilt(butter(o, f, 'highpass', fs=SR, output='sos'), x, axis=0)

# ── the score ──
# the takes are WAV locally; the repo keeps only the chosen one, lossless (FLAC)
src = os.path.join(AUD, 'music', f'{a.score}.wav')
if not os.path.exists(src): src = os.path.join(AUD, 'music', f'{a.score}.flac')
score = read(src)
start = int((2.0 - a.offset) * SR)
score = score[max(0, start):][:N]
if start < 0: score = np.pad(score, ((-start, 0), (0, 0)))
score = np.pad(score, ((0, max(0, N - len(score))), (0, 0)))[:N]

# ── synthesised sounds ──
def synth(name):
    if name == '@sub':
        n = int(0.9 * SR); t = np.arange(n) / SR
        f = 38 + 62 * np.exp(-t / 0.06)
        ph = 2 * np.pi * np.cumsum(f) / SR
        x = np.sin(ph) * np.exp(-t / 0.32) * np.minimum(1, t / 0.003)
        x = np.tanh(2.2 * x) / np.tanh(2.2)
        x += 0.25 * np.random.default_rng(1).standard_normal(n) * np.exp(-t / 0.004)     # the felt transient
        x = lp(x, 900)
        return np.stack([x, x], 1)
    if name == '@heart':
        n = int(0.6 * SR); t = np.arange(n) / SR
        def thump(t0, amp):
            tt = np.clip(t - t0, 0, None)
            f = 42 + 30 * np.exp(-tt / 0.03)
            return amp * np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tt / 0.07) * (t >= t0) * np.minimum(1, tt / 0.004)
        x = thump(0.0, 1.0) + thump(0.16, 0.6)
        x = lp(np.tanh(1.8 * x), 400)
        return np.stack([x, x], 1)
    raise ValueError(name)

CACHE = {}
def sound(name):
    if name not in CACHE:
        if name.startswith('@'): x = synth(name)
        else: x = read(os.path.join(AUD, 'sfx', f'{name}.wav'))
        x = x / (np.abs(x).max() + 1e-9)
        CACHE[name] = x
    return CACHE[name]

def points(x):
    m = np.abs(x).max(1); hop = SR // 1000
    env = np.array([m[i:i + hop].max() for i in range(0, len(m), hop)]); pk = env.max() + 1e-12
    db = 20 * np.log10(env / pk + 1e-9)
    return int(np.argmax(db > -30)) / 1000, int(np.argmax(env)) / 1000, (len(db) - int(np.argmax(db[::-1] > -50))) / 1000

cues = json.load(open(os.path.join(AUD, 'cues.json')))
dry = np.zeros((N, 2)); send = np.zeros((N, 2))
duck = np.ones(N)
for c in cues:
    x = sound(c['s'])
    if c.get('trim'):
        a0, a1 = c['trim']; x = x[int(a0 * SR):int(a1 * SR)].copy()
        fade = min(len(x) // 4, int(0.012 * SR)); x[-fade:] *= np.linspace(1, 0, fade)[:, None]
    r = c.get('rate', 1)
    if abs(r - 1) > 1e-3:
        idx = np.arange(0, len(x) - 1, r)
        x = np.stack([np.interp(idx, np.arange(len(x)), x[:, k]) for k in (0, 1)], 1)
    on, pk, end = points(x)
    ref = {'onset': on, 'peak': pk, 'end': end}[c.get('align', 'onset')]
    i0 = int(round((c['t'] - ref) * SR))
    g = 10 ** (c['db'] / 20)
    p = np.clip(c.get('pan', 0), -1, 1)
    gl, gr = np.cos((p + 1) * np.pi / 4) * np.sqrt(2), np.sin((p + 1) * np.pi / 4) * np.sqrt(2)
    y = x * g * np.array([gl, gr])
    lo, hi = max(0, i0), min(N, i0 + len(y))
    if hi <= lo: continue
    seg = y[lo - i0:hi - i0]
    dry[lo:hi] += seg
    send[lo:hi] += seg * c.get('room', 0.18)
    # the score steps back under the big hits (−3.5 dB, 30 ms down, 280 ms back)
    if c['db'] >= -6:
        tt = np.arange(N) / SR - c['t']
        env = np.where(tt < -0.03, 0, np.where(tt < 0, (tt + 0.03) / 0.03, np.exp(-np.clip(tt, 0, None) / 0.28)))
        duck = np.minimum(duck, 1 - (1 - 10 ** (-3.5 / 20)) * env)

# ── one room for everything: a synthetic stereo IR (pre-delay 12 ms, T60 ≈ 1.1 s, darkened) ──
rng = np.random.default_rng(7)
L = int(1.3 * SR); t = np.arange(L) / SR
ir = rng.standard_normal((L, 2)) * np.exp(-6.9 * t / 1.1)[:, None]
ir = lp(ir, 5200); ir = hp(ir, 180)
ir[:int(0.012 * SR)] = 0
for d, gg in ((0.019, 0.5), (0.027, 0.38), (0.041, 0.3)):
    k = int(d * SR); ir[k, 0] += gg; ir[k + 37, 1] += gg * 0.9
ir /= np.sqrt((ir ** 2).sum(0)).max()
wet = np.stack([fftconvolve(send[:, k], ir[:, k])[:N] for k in (0, 1)], 1) * 0.55

# the take's intro (the night and the day before the drop) is a quiet pulse: lift it, so the hook has a floor, and drop
# the lift on the downbeat so the 6.0 groove still lands as a jump
lift = np.ones(N)
ti = np.arange(N) / SR
lift = np.where(ti < 5.92, 10 ** (a.intro_db / 20), np.where(ti < 6.0, 10 ** (a.intro_db / 20 * (1 - (ti - 5.92) / 0.08)), 1.0))
sfx = (dry + wet) * 10 ** (a.sfx_db / 20)
mus = score * 10 ** (a.score_db / 20) * duck[:, None] * lift[:, None]
mix = mus + sfx
# the last frames: the score's own ring-out, with a guard fade on the final 0.3 s
fade = int(0.3 * SR); mix[-fade:] *= np.linspace(1, 0, fade)[:, None]

def write(path, x):
    with wave.open(path, 'wb') as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes((np.clip(x, -1, 1) * 32767).astype('<i2').tobytes())
tmp = os.path.join(AUD, a.out.replace('.wav', '-raw.wav'))
peak = np.abs(mix).max()
write(tmp, mix / max(1, peak / 0.98))
if a.stems:
    write(os.path.join(AUD, 'stem-score.wav'), mus / max(1, peak / 0.98)); write(os.path.join(AUD, 'stem-sfx.wav'), sfx / max(1, peak / 0.98))
LN = f'loudnorm=I={a.lufs}:TP={a.tp}:LRA=11'
p1 = subprocess.run(['ffmpeg', '-hide_banner', '-nostats', '-i', tmp, '-af', f'{LN}:print_format=json', '-f', 'null', '-'], capture_output=True, text=True)
m = json.loads(p1.stderr[p1.stderr.rfind('{'):p1.stderr.rfind('}') + 1])
out = os.path.join(AUD, a.out)
subprocess.run(['ffmpeg', '-y', '-v', 'error', '-i', tmp, '-af',
                f"{LN}:measured_I={m['input_i']}:measured_TP={m['input_tp']}:measured_LRA={m['input_lra']}:measured_thresh={m['input_thresh']}:offset={m['target_offset']}:linear=true",
                '-ar', str(SR), '-c:a', 'pcm_s16le', out], check=True)
os.remove(tmp)
# balance report: in each big cue's window, the effects against the score (K-unweighted RMS, dB)
def rms(x): return 20 * np.log10(np.sqrt(np.mean(x ** 2)) + 1e-9)
rep = []
for c in cues:
    if c['db'] < -9: continue
    i0, i1 = int(c['t'] * SR), int((c['t'] + 0.25) * SR)
    rep.append(f"{c['t']:.2f} {c['s']} {rms(sfx[i0:i1]) - rms(mus[i0:i1]):+.0f}")
print(f"mix: {a.score} (+{a.offset * 1000:.0f} ms) + {len(cues)} cues → audio/{a.out} (raw {m['input_i']} LUFS, {m['input_tp']} dBTP → {a.lufs} LUFS)")
print('effects over score in their windows (dB):', ' · '.join(rep))
