# Sound design for the whole film, synthesised and placed on exact frames from the beat map, then
# mixed with the music edit to web loudness.
#
#   python3 projects/almostfriends-apple/film/tools/sfx_film.py
#
# UI sounds are transients and textures (clicks, air, glass, frost), never pitched dings; the
# music carries the melody. Output: audio/edits/film_sfx.wav, audio/edits/film_mix.wav.
import os, json, math
import numpy as np, soundfile as sf
from scipy.signal import butter, sosfilt

HERE = os.path.dirname(os.path.abspath(__file__))
FILM = os.path.abspath(os.path.join(HERE, '..'))
ROOT = os.path.abspath(os.path.join(FILM, '..'))
SR, FPS = 48000, 60
T = json.load(open(os.path.join(FILM, 'timing.json')))
BEATS = T['beats_s']
def beat(i):
    k = int(math.floor(i)); f = i - k
    return (BEATS[k] + (BEATS[k + 1] - BEATS[k]) * f) * FPS
def bar(n, b=0): return beat((n - 1) * 4 + b)

music, sr = sf.read(os.path.join(ROOT, 'audio/edits/film_music.wav'))
assert sr == SR
out = np.zeros_like(music)
rng = np.random.default_rng(5)

def at(frame): return int(round(frame / FPS * SR))
def band(x, lo, hi, order=4):
    return sosfilt(butter(order, [max(20, lo), min(SR / 2 - 100, hi)], btype='band', fs=SR, output='sos'), x)
def hp(x, f): return sosfilt(butter(2, f, btype='high', fs=SR, output='sos'), x)
def lp(x, f): return sosfilt(butter(2, f, btype='low', fs=SR, output='sos'), x)
def norm(x): m = np.abs(x).max(); return x / m if m > 0 else x
def place(sig, frame, gain, pan=0.0):
    i = at(frame)
    if i >= len(out): return
    st = np.stack([sig * math.sqrt(0.5 * (1 - pan)), sig * math.sqrt(0.5 * (1 + pan))], 1) * math.sqrt(2)
    j = min(len(out), i + len(st))
    if i < 0: st = st[-i:]; i = 0
    out[i:j] += st[:j - i] * gain

# ---------------------------------------------------------------- the sound palette
def wipe(k=0):
    n = int(0.24 * SR); t = np.linspace(0, 1, n)
    env = np.sin(np.pi * np.clip(t * 1.15, 0, 1)) ** 1.6
    return norm(band(rng.standard_normal(n), 2800 + 400 * k, 7200) * env)
def whoosh(dur, peak_at=0.7, lo=300, hi=2600, tail=0.35):
    n = int((dur + tail) * SR); t = np.arange(n) / SR
    env = np.where(t < dur * peak_at, (t / (dur * peak_at)) ** 2.0, np.exp(-(t - dur * peak_at) / max(0.05, tail * 0.5)))
    sig = np.zeros(n)
    for a in range(0, n, 2048):
        b = min(n, a + 2048); u = min(1.0, (a / SR) / (dur * peak_at))
        c = lo + (hi - lo) * u ** 2
        sig[a:b] = band(rng.standard_normal(b - a + 4096), c * 0.5, c * 2.4)[4096:4096 + b - a]
    return norm(sig * env)
def click(bright=1.0):
    n = int(0.03 * SR); t = np.arange(n) / SR
    burst = band(rng.standard_normal(n), 2000, 9000) * np.exp(-t / 0.004)
    tick = np.sin(2 * np.pi * 3400 * bright * t) * np.exp(-t / 0.006)
    body = np.sin(2 * np.pi * 180 * t) * np.exp(-t / 0.012) * 0.5
    return norm(burst + 0.6 * tick + body)
def chime(base=1318.5, decay=1.2):
    n = int(2.0 * SR); t = np.arange(n) / SR
    parts = [(1.0, 1.0, decay), (1.588, 0.55, decay * 0.7), (2.379, 0.3, decay * 0.5), (3.17, 0.16, decay * 0.35)]
    s = sum(a * np.sin(2 * np.pi * base * r * t + rng.uniform(0, 6.28)) * np.exp(-t / d) for r, a, d in parts)
    return norm(s * (1 - np.exp(-t / 0.002)))
def sonar():
    n = int(1.1 * SR); t = np.arange(n) / SR
    f = 130 * np.exp(-t / 0.5) + 55
    ph = 2 * np.pi * np.cumsum(f) / SR
    s = np.sin(ph) * np.exp(-t / 0.45) * (1 - np.exp(-t / 0.01))
    air = band(rng.standard_normal(n), 300, 1500) * np.exp(-t / 0.25) * 0.25
    return norm(s + air)
def zing(dur=0.16):
    n = int((dur + 0.2) * SR); t = np.arange(n) / SR
    f = 1800 + 5200 * np.clip(t / dur, 0, 1) ** 1.5
    s = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.where(t < dur, (t / dur) ** 0.5, np.exp(-(t - dur) / 0.05)) * 0.4
    s += band(rng.standard_normal(n), 3000, 11000) * np.where(t < dur, t / dur, np.exp(-(t - dur) / 0.04))
    return norm(s)
def thump():
    n = int(0.5 * SR); t = np.arange(n) / SR
    s = np.sin(2 * np.pi * (70 + 40 * np.exp(-t / 0.03)) * t) * np.exp(-t / 0.18) * (1 - np.exp(-t / 0.003))
    s += band(rng.standard_normal(n), 200, 1200) * np.exp(-t / 0.05) * 0.4
    return norm(s)
def shimmer(dur=0.5, density=180):
    n = int((dur + 0.3) * SR); s = np.zeros(n)
    for _ in range(int(density * dur)):
        i = int(rng.uniform(0, dur) * SR); L = int(0.02 * SR); t = np.arange(L) / SR
        g = np.sin(2 * np.pi * rng.uniform(5000, 9500) * t) * np.exp(-t / 0.006)
        s[i:i + L] += g[:max(0, min(L, n - i))]
    env = np.minimum(1, np.arange(n) / (0.08 * SR)) * np.exp(-np.maximum(0, np.arange(n) / SR - dur) / 0.12)
    return norm(s * env)
def crackle(dur=0.8):
    n = int((dur + 0.2) * SR); s = band(rng.standard_normal(n), 3000, 9000) * 0.15
    for _ in range(int(160 * dur)):
        i = int(rng.uniform(0, dur) * SR); L = int(0.004 * SR)
        s[i:i + L] += rng.uniform(-1, 1) * np.exp(-np.arange(L) / (0.0008 * SR))[:max(0, min(L, n - i))]
    env = np.minimum(1, np.arange(n) / (0.03 * SR)) * np.exp(-np.maximum(0, np.arange(n) / SR - dur * 0.6) / (dur * 0.35))
    return norm(hp(s, 1500) * env)
def drip():
    n = int(0.06 * SR); t = np.arange(n) / SR
    f = 900 + 1200 * np.exp(-t / 0.008)
    return norm(np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.012) * (1 - np.exp(-t / 0.0008)))
def crumble(dur=0.6):
    n = int((dur + 0.2) * SR); s = np.zeros(n)
    for _ in range(int(220 * dur)):
        i = int(rng.uniform(0, dur) * SR); L = int(rng.uniform(0.004, 0.015) * SR)
        g = band(rng.standard_normal(L + 512), 800, 5000)[512:512 + L] * np.hanning(L)
        s[i:i + L] += g[:max(0, min(L, n - i))]
    return norm(s)
def shatter(dur=0.7):
    n = int((dur + 0.3) * SR); t = np.arange(n) / SR; s = np.zeros(n)
    s += band(rng.standard_normal(n), 2500, 12000) * np.exp(-t / (dur * 0.25)) * 0.6
    for _ in range(int(260 * dur)):
        i = int(abs(rng.normal(0, dur * 0.25)) * SR); L = int(rng.uniform(0.002, 0.008) * SR)
        if i + L >= n: continue
        s[i:i + L] += rng.uniform(-1, 1) * np.exp(-np.arange(L) / (0.0012 * SR)) * np.exp(-i / (dur * 0.4 * SR))
    for f0 in rng.uniform(2500, 7000, 6):
        s += 0.08 * np.sin(2 * np.pi * f0 * t + rng.uniform(0, 6)) * np.exp(-t / rng.uniform(0.15, 0.45))
    return norm(hp(s, 900))
def slam():
    return norm(thump() * 1.0 + np.pad(click(0.9), (0, int(0.5 * SR) - int(0.03 * SR))) * 0.5)
def riser(dur):
    return whoosh(dur, peak_at=0.98, lo=200, hi=5000, tail=0.15)

# ---------------------------------------------------------------- cues (the WOW map)
cues = []
def cue(fn, frame, gain, pan=0.0): cues.append((frame, gain, pan, fn))
# act A: the hook, the dive, the meeting, the name
for k, f in enumerate((0, beat(1), beat(2))): cue(lambda k=k: wipe(k), f, 0.10, -0.25 + 0.25 * k)
cue(lambda: whoosh((beat(4) - beat(3)) / FPS, 0.98, 300, 2800, 0.5), beat(3), 0.16)
cue(lambda: whoosh(0.5, 0.3, 500, 4000, 0.3), beat(5), 0.06)
cue(lambda: thump(), beat(8), 0.12); cue(lambda: chime(1318.5, 1.3), beat(8), 0.07); cue(lambda: shimmer(0.5, 160), beat(8), 0.035)
cue(lambda: shimmer(0.6, 140), beat(9) - 6, 0.04)
cue(lambda: whoosh(0.9, 0.5, 300, 2200, 0.4), beat(10), 0.05)
# act B: 1 · what matters
cue(lambda: whoosh(0.4, 0.9, 400, 3500, 0.2), bar(4) - 18, 0.09); cue(lambda: slam(), bar(4) + 6, 0.14)
cue(lambda: shimmer(0.6, 140), bar(4) + 14, 0.035)
cue(lambda: whoosh(0.8, 0.4, 200, 1600, 0.4), beat(13), 0.06)
cue(lambda: whoosh(0.3, 0.3, 600, 5000, 0.3), bar(5), 0.09); cue(lambda: shimmer(0.4, 200), bar(5), 0.04)
for k, ft in enumerate((beat(18), beat(20), beat(22))):       # the dial turns, a tag is chosen and fills its third
    cue(lambda: whoosh(0.32, 0.5, 500, 3200, 0.2), ft - 30, 0.05); cue(lambda: click(0.6), ft - 7, 0.08)
    cue(lambda: click(1.0), ft, 0.11); cue(lambda: zing(0.34), ft + 4, 0.04)
    cue(lambda: click(0.7), ft + 24, 0.07); cue(lambda: chime(1046.5 * (1.0, 1.122, 1.26)[k], 0.9), ft + 24, 0.05)
cue(lambda: whoosh(0.8, 0.4, 300, 2400, 0.45), bar(7), 0.06)     # the rest drift away
cue(lambda: thump(), beat(26) + 4, 0.10); cue(lambda: whoosh(0.9, 0.95, 250, 4200, 0.12), beat(26) + 4, 0.15)
# act C: 2 · the search, the match, the landing
cue(lambda: slam(), bar(8) + 10, 0.13); cue(lambda: shimmer(0.7, 120), bar(8) + 18, 0.035)
cue(lambda: sonar(), beat(32), 0.16); cue(lambda: sonar(), beat(34), 0.12)
cue(lambda: zing(0.14), bar(10), 0.10); cue(lambda: chime(1568.0, 1.4), bar(10), 0.07); cue(lambda: shimmer(0.6, 160), bar(10), 0.04)
cue(lambda: whoosh((bar(11) - bar(10) - 16) / FPS, 0.75, 250, 3500, 0.5), bar(10) + 16, 0.14)
cue(lambda: thump(), bar(11), 0.12); cue(lambda: shimmer(0.5, 160), bar(11), 0.035)
for w in range(5): cue(lambda: thump(), bar(11) + 2 + 5 * w, 0.04)
# act D: 3 · three days
cue(lambda: slam(), bar(12) + 8, 0.13)
for w in range(5): cue(lambda: thump(), bar(12) + 14 + 7 * w, 0.045)
for f in (bar(13) + 14, bar(14) + 14, bar(15) + 14):
    cue(lambda: click(0.8), f, 0.07); cue(lambda: whoosh(0.3, 0.4, 400, 2500, 0.25), f, 0.04)
cue(lambda: whoosh(0.25, 0.8, 600, 5000, 0.15), bar(14) - 4, 0.07); cue(lambda: whoosh(0.25, 0.8, 600, 5000, 0.15), bar(15) - 4, 0.07)
cue(lambda: slam(), bar(14) + 36, 0.18); cue(lambda: shatter(0.6), bar(14) + 38, 0.08)
# act E: 4 · two yeses, the wait
cue(lambda: slam(), bar(16) + 6, 0.13)
for w in range(4): cue(lambda: thump(), beat(61) - 18 + 6 * w, 0.045)
cue(lambda: shimmer(0.45), beat(61) + 4, 0.05)
cue(lambda: click(1.1), beat(62), 0.14); cue(lambda: chime(1318.5, 0.9), beat(62), 0.035)
cue(lambda: click(1.2), bar(18) - 1, 0.20)
# act F: the reveal
cue(lambda: shatter(1.0), bar(18), 0.16); cue(lambda: whoosh(0.15, 0.2, 400, 4000, 0.6), bar(18), 0.10)
for f_m in (bar(18), beat(70)):
    cue(lambda: crackle(0.8), f_m + 1, 0.08)
    for d in range(12): cue(lambda: drip(), f_m + 6 + d * 3.3 + rng.uniform(-1.5, 1.5), 0.03, rng.uniform(-0.6, 0.6))
cue(lambda: shatter(0.8), beat(70), 0.12)
for w in range(3): cue(lambda: slam() if w == 0 else thump(), beat(70) + 30 + 6 * w, 0.12 if w == 0 else 0.05)
cue(lambda: shimmer(1.2, 220), bar(19) - 4, 0.05)
cue(lambda: whoosh(0.6, 0.6, 300, 2500, 0.3), bar(20) - 50, 0.06)
cue(lambda: crumble(0.6), beat(78) + 2, 0.09)
for k in range(3): cue(lambda: shatter(0.5), beat(81 + k), 0.08, (-0.5, 0.5, 0.0)[k])
# act G: the end
cue(lambda: whoosh(0.4, 0.8, 500, 4000, 0.2), bar(23) - 30, 0.07)
cue(lambda: shimmer(0.6, 140), bar(23) - 16, 0.035)
cue(lambda: whoosh(0.5, 0.6, 300, 2200, 0.4), bar(24), 0.06)
cue(lambda: chime(1318.5, 1.8), bar(24) + 24, 0.08); cue(lambda: shimmer(0.7, 160), bar(24) + 24, 0.04)
cue(lambda: shimmer(0.8, 120), beat(93) - 4, 0.035)
cue(lambda: whoosh(0.5, 0.5, 400, 3000, 0.4), bar(25), 0.06); cue(lambda: chime(1046.5, 1.6), bar(25) + 30, 0.05)

for frame, gain, pan, fn in cues:
    place(fn(), frame, gain, pan)
sf.write(os.path.join(ROOT, 'audio/edits/film_sfx.wav'), out, SR, subtype='PCM_24')
mix = music + out
mix *= 0.89 / np.abs(mix).max()
sf.write(os.path.join(ROOT, 'audio/edits/film_mix_raw.wav'), mix, SR, subtype='PCM_24')
print('cues', len(cues), 'duration', round(len(mix) / SR, 3))
# the release mix the encoder reads: -14 LUFS integrated, true peak -1 dBFS
import subprocess
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', os.path.join(ROOT, 'audio/edits/film_mix_raw.wav'), '-af', 'loudnorm=I=-14:TP=-1.0:LRA=11',
                '-ar', '48000', os.path.join(ROOT, 'audio/edits/film_mix.wav')], check=True)
print('mix', os.path.join(ROOT, 'audio/edits/film_mix.wav'))
