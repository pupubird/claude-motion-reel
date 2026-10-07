# The animatic mix: score take (trimmed by its 2 s pre-roll, so take 2.0 s = film 0) + foley, the breath forced
# near-silent (one bar from --breath: the score falls 24 dB in 30 ms and returns on the reveal's downbeat), two-pass
# loudnorm to −14 LUFS / −1.5 dBTP (--tp: −2 for the master).
#   python3 projects/<film>/tools/mix.py --score t1 [--foley-db -6]   → audio/mix.wav
import os, sys, json, argparse, subprocess, wave
import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
AUD = os.path.join(HERE, '..', 'audio')
SR, DUR = 48000, 66.0
ap = argparse.ArgumentParser()
ap.add_argument('--score', default='t1')
ap.add_argument('--foley-db', type=float, default=-6.0)
ap.add_argument('--score-db', type=float, default=-3.0)
ap.add_argument('--swell', type=str, default='2.9,4.0', help='film times a,b: the score sinks under the swell and returns on the pop at b')
ap.add_argument('--breath', type=float, default=48.0, help='film time of the breath bar (UNLOCK.breath)')
ap.add_argument('--tp', type=float, default=-1.5, help='true-peak ceiling (dBTP); the master uses −2 so its AAC stays under −1')
a = ap.parse_args()

def read(path):
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', path, '-ac', '2', '-ar', str(SR), '-f', 'f32le', '-'], capture_output=True).stdout
    return np.frombuffer(raw, np.float32).reshape(-1, 2).astype(np.float64)

# the takes are WAV locally; the repo keeps only the released score, as a gapless MP3 (sample-aligned: lag 0 measured)
src = os.path.join(AUD, 'music', f'{a.score}.wav')
if not os.path.exists(src): src = os.path.join(AUD, 'music', f'{a.score}.mp3')
score = read(src)[int(2.0 * SR):][: int(DUR * SR)]
foley = read(os.path.join(AUD, 'foley.wav'))[: int(DUR * SR)]
n = int(DUR * SR)
score = np.pad(score, ((0, max(0, n - len(score))), (0, 0)))
foley = np.pad(foley, ((0, max(0, n - len(foley))), (0, 0)))
# the breath: a gain automation on the score bus
g = np.ones(n)
def ramp(t0, t1, v0, v1):
    i0, i1 = int(t0 * SR), int(t1 * SR); g[i0:i1] = np.linspace(v0, v1, i1 - i0)
duck = 10 ** (-24 / 20)
B0, B1 = a.breath, a.breath + 2.0            # the one breath: one bar, near silence, back on the reveal's downbeat
ramp(B0, B0 + 0.03, 1, duck); g[int((B0 + 0.03) * SR):int((B1 - 0.005) * SR)] = duck; ramp(B1 - 0.005, B1, duck, 1)
# the swell: the score sinks 9 dB under the bubbles' swell and comes back full on the pop, so the drop lands even
# though the v3 intro is as loud as the hook (music.py v3: the intro hits from frame 0)
S0, S1 = (float(x) for x in a.swell.split(','))
sink = 10 ** (-9 / 20)
ramp(S0, S1 - 0.04, 1, sink); g[int((S1 - 0.04) * SR):int((S1 - 0.002) * SR)] = sink; ramp(S1 - 0.002, S1, sink, 1)
# a final fade on the ring-out
ramp(DUR - 0.5, DUR, 1, 0)
mix = score * (10 ** (a.score_db / 20)) * g[:, None] + foley * (10 ** (a.foley_db / 20))
tmp = os.path.join(AUD, 'mix-raw.wav')
with wave.open(tmp, 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((np.clip(mix, -1, 1) * 32767).astype('<i2').tobytes())
LN = f'loudnorm=I=-14:TP={a.tp}:LRA=11'
p1 = subprocess.run(['ffmpeg', '-hide_banner', '-nostats', '-i', tmp, '-af', f'{LN}:print_format=json', '-f', 'null', '-'], capture_output=True, text=True)
m = json.loads(p1.stderr[p1.stderr.rfind('{'):p1.stderr.rfind('}') + 1])
out = os.path.join(AUD, 'mix.wav')
subprocess.run(['ffmpeg', '-y', '-v', 'error', '-i', tmp, '-af',
                f"{LN}:measured_I={m['input_i']}:measured_TP={m['input_tp']}:measured_LRA={m['input_lra']}:measured_thresh={m['input_thresh']}:offset={m['target_offset']}:linear=true",
                '-ar', str(SR), '-c:a', 'pcm_s16le', out], check=True)
os.remove(tmp)
print(f"mix: {a.score} + foley ({a.foley_db:+.0f} dB) → audio/mix.wav (raw {m['input_i']} LUFS, {m['input_tp']} dBTP → −14 LUFS)")
