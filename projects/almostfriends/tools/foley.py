# Foley, synthesised from the cue sheet (tools/cues.mjs → audio/cues.json). v3 (owner's note on v2: "no more ding
# ding dong dong, need one that clicks"): every UI sound is a transient — tap, click, tick, pop, swoosh, thump,
# impact, riser — and nothing is pitched; the music carries the melody. Each instance is seeded from its own kind,
# time and index, so repeats differ a little in level, filter and timing, yet every render is identical.
#   python3 projects/<film>/tools/foley.py               → audio/foley.wav (48 kHz stereo, film time 0–66 s)
#   python3 projects/<film>/tools/foley.py --demo [--spec out.png]   → audio/sfx-demo.wav: every sound, 1 s apart
# --transpose is still accepted (old command lines) and changes nothing: there are no notes left to transpose.
# Two gates run on every render and stop it on failure:
#   tonal — no cue may hold a spectral peak that stands > 12 dB above the bins 3 away on both sides for longer than
#           80 ms (70 Hz–16 kHz, STFT 2048/128, run = frames × hop, calibrated on sines of known length in --demo).
#           A pitch you could hum is a note.
#   quiet — no cue's tail (to −60 dB of its own peak) may reach into a 'quiet' window of the cue sheet (the breath).
import os, json, argparse, wave, zlib
import numpy as np
from scipy.signal import butter, sosfilt, fftconvolve, stft, istft

HERE = os.path.dirname(os.path.abspath(__file__))
AUD = os.path.join(HERE, '..', 'audio')
SR, DUR = 48000, 66.0
TONAL_MAX = 0.080                                  # s: the longest a steady spectral peak may last
ap = argparse.ArgumentParser()
ap.add_argument('--transpose', type=int, default=0, help='ignored: nothing is pitched')
ap.add_argument('--cues', default=os.path.join(AUD, 'cues.json'))
ap.add_argument('--out', default=os.path.join(AUD, 'foley.wav'))
ap.add_argument('--demo', action='store_true', help='write audio/sfx-demo.wav (every sound, 1 s apart) instead')
ap.add_argument('--spec', default=None, help='with --demo: also write a labelled spectrogram PNG here')
a = ap.parse_args()

# ── building blocks ───────────────────────────────────────────────────────────────────────────────────────────────
def sec(s): return int(round(s * SR))
def tax(n): return np.arange(n) / SR
def norm(x): m = np.max(np.abs(x)); return x / m if m > 0 else x
def dec(n, tau, att=0.0):                          # exponential decay, optional linear attack (s)
    e = np.exp(-tax(n) / tau); k = sec(att)
    if k > 0: e[:k] *= np.linspace(0, 1, k, endpoint=False)
    return e
def _sos(kind, f, order): return butter(order, f, btype=kind, fs=SR, output='sos')
def bp(x, lo, hi, order=2): return sosfilt(_sos('bandpass', [lo, hi], order), x)
def hp(x, f, order=2): return sosfilt(_sos('highpass', f, order), x)
def lp(x, f, order=2): return sosfilt(_sos('lowpass', f, order), x)
def smooth(u): u = np.clip(u, 0, 1); return u * u * (3 - 2 * u)
def stereo(l, r=None): return np.stack([l, l if r is None else r], 1)
def rise_fall(u, pk, fall):                        # 0 → 1 at pk, then back down by `fall` at the end
    u = np.clip(u, 0, 1); return np.where(u < pk, u / pk, 1 - (u - pk) / (1 - pk) * fall)

def band_noise(n, fc, bw, r, nper=1024):
    # white noise shaped frame by frame by a band that may move: fc(t) Hz, bw(t) octaves (FWHM), t in s
    x = r.standard_normal(n + nper)
    f, tt, Z = stft(x, fs=SR, nperseg=nper, noverlap=nper - nper // 4)
    lf = np.log2(np.maximum(f, 1.0))[:, None]
    c = np.log2(np.maximum(fc(tt), 20.0))[None, :]
    s = (np.broadcast_to(bw(tt), tt.shape) / 2.355)[None, :]
    Z *= np.exp(-0.5 * ((lf - c) / s) ** 2)
    _, y = istft(Z, fs=SR, nperseg=nper, noverlap=nper - nper // 4)
    return norm(y[:n])

def click_burst(n, r, lo, hi, tau, att=0.0002):   # a broadband snap: band-limited noise with a very fast decay
    return norm(bp(r.standard_normal(n), lo, hi)) * dec(n, tau, att)

def room(dry, r, tau=0.09, length=0.35, cutoff=4500, wet=0.18):   # a small, dark room: decorrelated L/R tails
    m = sec(length)
    irl = lp(r.standard_normal(m), cutoff) * dec(m, tau); irr = lp(r.standard_normal(m), cutoff) * dec(m, tau)
    wl = fftconvolve(dry, irl)[: len(dry)]; wr = fftconvolve(dry, irr)[: len(dry)]
    k = wet * np.max(np.abs(dry)) / max(np.max(np.abs(wl)), np.max(np.abs(wr)), 1e-9)
    return stereo(dry + wl * k, dry + wr * k)

# ── the palette ───────────────────────────────────────────────────────────────────────────────────────────────────
def tap(r, o):        # a finger on glass: a 3–6 ms snap + a soft haptic body (a ~25 ms thump, falling, not a note)
    n = sec(0.05); t = tax(n)
    snap = click_burst(n, r, r.uniform(1800, 2400), r.uniform(4600, 5600), r.uniform(0.0014, 0.0021)) + \
        0.35 * click_burst(n, r, 900, 2000, 0.003, 0.0003)                   # a little glass 'tock' under the snap
    f0 = r.uniform(125, 170); f = f0 * (1 + 0.4 * np.exp(-t / 0.005))
    body = np.sin(2 * np.pi * np.cumsum(f) / SR) * dec(n, 0.0075, 0.0006)
    return 0.95 * snap + 0.5 * body

def click(r, o):      # a sharper UI click (chips, buttons, the latch): a high snap over a plastic tock, < 40 ms
    n = sec(0.045)
    def one(lvl):
        hi = click_burst(n, r, 4200, 11000, r.uniform(0.0005, 0.0009))
        tock = click_burst(n, r, r.uniform(800, 1100), r.uniform(2000, 2600), r.uniform(0.0045, 0.0065), 0.0004)
        return lvl * (0.85 * hi + 0.7 * tock)
    y = one(1.0)
    if o.get('double'):                            # a latch: the press, then the catch 18–24 ms later
        k = sec(r.uniform(0.018, 0.024)); y = np.pad(y, (0, k)); y[k:] += one(0.7)
    return y

def send(r, o):       # an airy swoosh up (120–180 ms) that lands in a soft click
    d = r.uniform(0.12, 0.17); n = sec(d + 0.03)
    w = band_noise(n, lambda tt: 650 * 7.0 ** np.clip(tt / d, 0, 1), lambda tt: 1.1, r)
    u = np.clip(tax(n) / d, 0, 1); env = u ** 1.7 * (1 - smooth((tax(n) - d) / 0.025 + 1))
    end = np.zeros(n); k = sec(d) - sec(0.004)
    c = click_burst(n - k, r, 2000, 4200, 0.0012); end[k:] = c
    return 0.75 * norm(w * env) + 0.45 * end

def recv(r, o):       # a soft, muted tock (< 60 ms), quieter than a send
    n = sec(0.055); t = tax(n)
    f = r.uniform(230, 290) * (1 + 0.6 * np.exp(-t / 0.003))
    body = np.sin(2 * np.pi * np.cumsum(f) / SR) * dec(n, 0.0065, 0.0004)
    knock = click_burst(n, r, 500, 1500, 0.0045, 0.0004)
    return lp(0.7 * body + 0.6 * knock, 3500)

def pop(r, o):        # a bubble pop: a falling blip gone within ~25 ms (a pop, not a note) + crackle + a puff
    big = o.get('size') == 'big'
    n = sec(0.14 if big else 0.06); t = tax(n)
    f_hi, f_lo = (r.uniform(950, 1150), r.uniform(230, 290)) if big else (r.uniform(1400, 1800), r.uniform(450, 560))
    f = f_lo + (f_hi - f_lo) * np.exp(-t / (0.007 if big else 0.005))
    blip = np.sin(2 * np.pi * np.cumsum(f) / SR) * dec(n, 0.009 if big else 0.0055, 0.0003)
    crackle = np.zeros(n)
    for _ in range(r.integers(5, 10) if big else r.integers(3, 6)):
        k = sec(r.uniform(0, 0.018 if big else 0.008)); m = min(sec(0.003), n - k)
        crackle[k:k + m] += norm(hp(r.standard_normal(m), 3000)) * dec(m, 0.0004) * r.uniform(0.3, 1.0)
    puff = click_burst(n, r, 900, 3600, 0.012 if big else 0.006, 0.0005)
    y = 0.8 * blip + 0.55 * norm(crackle) + 0.45 * puff
    if big: y += 0.75 * norm(lp(r.standard_normal(n), 190)) * dec(n, 0.03, 0.001)   # the whump of a big film
    return y

def spray(r, o):      # droplets: 15–30 tiny clicks over ~300 ms, denser at the start, scattered across the field
    n = sec(0.36); L = np.zeros(n); R = np.zeros(n)
    for _ in range(r.integers(15, 31)):
        k = sec((r.random() ** 1.7) * 0.31); m = sec(0.004)
        s = norm(hp(r.standard_normal(m), r.uniform(2500, 6000))) * dec(m, r.uniform(0.0005, 0.0011)) * r.uniform(0.25, 1.0)
        p = r.uniform(-0.9, 0.9); L[k:k + m] += s * np.cos((p + 1) * np.pi / 4); R[k:k + m] += s * np.sin((p + 1) * np.pi / 4)
    return stereo(L, R)

def whoosh(r, o):     # filtered noise through a band that rises to its peak and falls away (a camera move, a push)
    d = float(o.get('dur', 0.5)); n = sec(d); u = np.clip(tax(n) / d, 0, 1)
    pk = r.uniform(0.5, 0.66); lo, top = r.uniform(260, 360), r.uniform(2800, 4200)
    fc = lambda tt: lo * (top / lo) ** rise_fall(tt / d, pk, 0.6)
    env = np.where(u < pk, (u / pk) ** 2, ((1 - u) / (1 - pk)) ** 1.5)
    side = r.choice([-1, 1]); pan = side * (u - 0.5) * 0.7
    l = band_noise(n, fc, lambda tt: 1.5, r) * env; rr = band_noise(n, fc, lambda tt: 1.5, r) * env
    return stereo(l * np.cos((pan + 1) * np.pi / 4) * 1.41, rr * np.sin((pan + 1) * np.pi / 4) * 1.41)

def swish(r, o):      # a fast whip (0.15–0.25 s), brighter than a whoosh
    d = float(o.get('dur', r.uniform(0.15, 0.25))); n = sec(d); u = np.clip(tax(n) / d, 0, 1)
    pk = r.uniform(0.35, 0.45)
    fc = lambda tt: 1400 * 5.0 ** rise_fall(tt / d, pk, 0.5)
    env = np.where(u < pk, (u / pk) ** 2.5, ((1 - u) / (1 - pk)) ** 2)
    side = r.choice([-1, 1]); pan = side * (u - 0.5) * 1.0
    l = band_noise(n, fc, lambda tt: 1.0, r, 512) * env; rr = band_noise(n, fc, lambda tt: 1.0, r, 512) * env
    return stereo(l * np.cos((pan + 1) * np.pi / 4) * 1.41, rr * np.sin((pan + 1) * np.pi / 4) * 1.41)

def impact(r, o):     # a hit: a noise sub-thump (40–60 Hz), a short falling kick, a mid punch, a crack, a small room
    small = o.get('size') == 'small'
    n = sec(0.45 if small else 0.9); t = tax(n)
    sub = norm(lp(r.standard_normal(n), 95 if small else 80, 4)) * dec(n, 0.06 if small else 0.13, 0.002)
    f = (55 if small else 46) + (90 if small else 80) * np.exp(-t / 0.022)
    kick = np.sin(2 * np.pi * np.cumsum(f) / SR) * dec(n, 0.03 if small else 0.042, 0.0008)
    punch = click_burst(n, r, 140, 700, 0.018 if small else 0.03, 0.0008)
    crack = click_burst(n, r, 2200, 12000, 0.004 if small else 0.006)
    dry = 1.0 * sub + 0.8 * kick + 0.7 * punch + (0.4 if small else 0.55) * crack
    return room(dry, r, tau=0.06 if small else 0.1, length=0.25 if small else 0.45, wet=0.14 if small else 0.2)

def riser(r, o):      # noise through an opening, narrowing band, 1–3 s, cut dead on the hit it leads into
    d = float(o.get('dur', 1.5)); n = sec(d); u = np.clip(tax(n) / d, 0, 1)
    fc = lambda tt: 260 * 38.0 ** (np.clip(tt / d, 0, 1) ** 1.35)
    bw = lambda tt: 2.2 - 1.2 * np.clip(tt / d, 0, 1)
    env = u ** 2.2; env[-sec(0.004):] *= np.linspace(1, 0, sec(0.004))
    l = band_noise(n, fc, bw, r) * env; rr = band_noise(n, fc, bw, r) * env
    return stereo(l, rr)

def tick(r, o):       # a dry tick: counters, day dots, letters
    n = sec(0.02)
    return 0.9 * click_burst(n, r, r.uniform(2500, 3500), r.uniform(6500, 8500), r.uniform(0.0007, 0.0012)) + \
        0.3 * click_burst(n, r, 1000, 2000, 0.002)

def typing(r, o):     # soft keyboard clicks, 3–5 of them over `dur`
    d = float(o.get('dur', 0.6)); n = sec(d + 0.03); y = np.zeros(n)
    for tt in np.sort(r.uniform(0, d, r.integers(3, 6))):
        k = sec(tt); m = min(sec(0.025), n - k)
        key = click_burst(m, r, 1300, 3400, r.uniform(0.0018, 0.003)) + 0.4 * norm(lp(r.standard_normal(m), 420)) * dec(m, 0.004)
        y[k:k + m] += key * r.uniform(0.55, 1.0)
    return y

def air(r, o):        # a soft wind bed: a slowly wandering band with gusts, decorrelated L/R, faded in and out
    d = float(o.get('dur', 2.0)); n = sec(d); t = tax(n)
    ph1, ph2 = r.uniform(0, 2 * np.pi, 2)
    fc = lambda tt: 520 * 2.0 ** (0.8 * np.sin(2 * np.pi * tt / 2.3 + ph1) + 0.4 * np.sin(2 * np.pi * tt / 0.9 + ph2))
    gust = lp(r.standard_normal(n), 1.5, 1); gust = 0.72 + 0.28 * norm(gust)
    f = min(0.4, d * 0.2); env = smooth(t / f) * smooth((d - t) / f) * gust
    return stereo(band_noise(n, fc, lambda tt: 2.0, r) * env, band_noise(n, fc, lambda tt: 2.0, r) * env)

def unlock(r, o):     # their padlock opening (owner: "an apple unlock sound"): a mechanical click-clack, not a chime —
    # the release (a bright snap with a narrow, fast-dying metallic band), the clack of the shackle 30 ms later (a fuller,
    # lower snap over a short falling thump), and the spring settling 75 ms after; a tight small room. ~0.16 s, unpitched.
    n = sec(0.17); y = np.zeros(n); t = tax(n)
    rel = click_burst(n, r, 3800, 10000, 0.0006) + 0.45 * norm(bp(r.standard_normal(n), 2900, 3500, 2)) * dec(n, 0.006, 0.0002)
    y += 0.9 * rel
    k = sec(r.uniform(0.028, 0.033))
    m = n - k
    clack = click_burst(m, r, 700, 2400, 0.0042, 0.0004) + 0.5 * click_burst(m, r, 2400, 6000, 0.0012)
    f = 135 * (1 + 0.5 * np.exp(-tax(m) / 0.006)); thump = np.sin(2 * np.pi * np.cumsum(f) / SR) * dec(m, 0.009, 0.0005)
    y[k:] += 1.0 * clack + 0.55 * thump
    k2 = sec(0.075 + r.uniform(0, 0.008)); m2 = n - k2
    y[k2:] += 0.3 * click_burst(m2, r, 3000, 8000, 0.0008)
    return room(y, r, tau=0.05, length=0.2, wet=0.12)

def thwup(r, o):      # Bub smacking into the wall of your bubble: a soft, rubbery slap — a low falling body (no note),
    # a muffled, low-passed burst, and a short squeak of air under it; ~90 ms
    n = sec(0.12); t = tax(n)
    f = 95 * (1 + 1.4 * np.exp(-t / 0.01)); body = np.sin(2 * np.pi * np.cumsum(f) / SR) * dec(n, 0.016, 0.002)
    body += 0.6 * norm(lp(r.standard_normal(n), 160, 2)) * dec(n, 0.03, 0.002)          # the thump, as noise (no note)
    slap = norm(lp(r.standard_normal(n), 900, 2)) * dec(n, 0.012, 0.0008)
    air = norm(bp(r.standard_normal(n), 1800, 4200)) * dec(n, 0.02, 0.004) * 0.25
    return room(0.8 * body + 0.9 * slap + air, r, tau=0.05, length=0.2, wet=0.1)

def creak(r, o):      # rubber film stretching: a train of tiny clicks whose rate wanders 35–80 per second, band-passed
    d = float(o.get('dur', 0.5)); n = sec(d); y = np.zeros(n); tt = 0.0
    while tt < d:
        rate = 35 + 45 * (0.5 + 0.5 * np.sin(2 * np.pi * tt / max(0.12, d) * 1.3 + r.uniform(0, 0.5)))
        k = sec(tt); m = min(sec(0.006), n - k)
        if m > 0: y[k:k + m] += click_burst(m, r, 700, 2600, 0.0012) * r.uniform(0.5, 1.0)
        tt += 1 / rate
    env = np.clip(tax(n) / 0.05, 0, 1) * np.clip((d - tax(n)) / 0.06, 0, 1)
    return y * env

KINDS = {'tap': tap, 'unlock': unlock, 'thwup': thwup, 'creak': creak, 'click': click, 'send': send, 'recv': recv, 'pop': pop, 'spray': spray, 'whoosh': whoosh,
         'swish': swish, 'impact': impact, 'riser': riser, 'tick': tick, 'typing': typing, 'air': air}
BASE = {'unlock': 0.9, 'thwup': 0.9, 'creak': 0.5, 'tap': 0.8, 'click': 0.8, 'send': 0.75, 'recv': 0.6, 'pop': 0.85, 'spray': 0.7, 'whoosh': 0.8, 'swish': 0.8,
        'impact': 1.0, 'riser': 0.75, 'tick': 0.55, 'typing': 0.6, 'air': 0.6}

def render(c, i):     # one cue → stereo array at unit-ish level × its base level × its gain
    seed = zlib.crc32(f"{c['kind']}:{c['t']:.4f}:{i}".encode())
    r = np.random.default_rng(seed)
    y = KINDS[c['kind']](r, c)
    y = y if y.ndim == 2 else stereo(y)
    y = y / (np.max(np.abs(y)) or 1) * BASE[c['kind']] * 10 ** ((c.get('gain', 0) + r.uniform(-1.0, 1.0)) / 20)
    jitter = r.uniform(-0.004, 0.004) if c['kind'] in ('tick', 'tap', 'click', 'pop', 'recv', 'send') else 0.0   # 'unlock' sits exactly on its frame
    return y, max(0.0, c['t'] + jitter)

# ── the gates ─────────────────────────────────────────────────────────────────────────────────────────────────────
NPER, HOP = 2048, 128
def tonal_run(y):     # the longest steady spectral peak (s): > 12 dB above the bins 3 away on both sides
    x = y.mean(1) if y.ndim == 2 else y
    x = np.pad(x, (NPER, NPER))
    f, _, Z = stft(x, fs=SR, nperseg=NPER, noverlap=NPER - HOP, boundary=None, padded=False)
    A = 20 * np.log10(np.abs(Z) + 1e-12)
    floor = A.max() - 50
    k0, k1 = max(3, np.searchsorted(f, 70)), min(len(f) - 3, np.searchsorted(f, 16000))
    best, best_f, tracks = 0, 0.0, {}
    for j in range(A.shape[1]):
        col = A[:, j]; mid = col[k0:k1]
        loc = (mid >= col[k0 - 1:k1 - 1]) & (mid >= col[k0 + 1:k1 + 1]) & (mid >= col[k0 - 2:k1 - 2]) & (mid >= col[k0 + 2:k1 + 2])
        prom = mid - np.maximum(col[k0 - 3:k1 - 3], col[k0 + 3:k1 + 3])
        bins = np.nonzero(loc & (prom > 12) & (mid > floor))[0] + k0
        nt = {}
        for b in bins:
            nt[b] = max(tracks.get(b - 1, 0), tracks.get(b, 0), tracks.get(b + 1, 0)) + 1
            if nt[b] > best: best, best_f = nt[b], f[b]
        tracks = nt
    return best * HOP / SR, best_f            # calibrated: frames × hop reads a tone's true length (see --demo)

def tail_end(y, start):   # when this cue falls below −60 dB of its own peak, in film time
    x = np.max(np.abs(y), 1) if y.ndim == 2 else np.abs(y)
    idx = np.nonzero(x > 1e-3 * x.max())[0]
    return start + (idx[-1] + 1) / SR if len(idx) else start

def calibrate():      # the detector on tones of known length (a 1 kHz sine, flat, 10 ms ramps)
    out = []
    for D in (0.04, 0.08, 0.16):
        n = sec(D); y = np.sin(2 * np.pi * 1000 * tax(n)); k = sec(0.01)
        y[:k] *= np.linspace(0, 1, k); y[-k:] *= np.linspace(1, 0, k)
        out.append((D, tonal_run(y)[0]))
    return out

# ── demo: every sound, 1 s apart ──────────────────────────────────────────────────────────────────────────────────
if a.demo:
    DEMO = [('tap', {}), ('click', {}), ('click', {'double': 1}), ('unlock', {}), ('thwup', {}), ('creak', {'dur': 0.5}), ('send', {}), ('recv', {}), ('pop', {}),
            ('pop', {'size': 'big'}), ('spray', {}), ('whoosh', {'dur': 0.7}), ('swish', {}), ('impact', {'size': 'small'}),
            ('impact', {}), ('riser', {'dur': 0.9}), ('tick', {}), ('typing', {'dur': 0.6}), ('air', {'dur': 0.9})]
    n = sec(len(DEMO) + 1); L = np.zeros(n); R = np.zeros(n); labels = []
    for i, (k, opt) in enumerate(DEMO):
        y, _ = render({'t': float(i + 0.5), 'kind': k, **opt}, i)
        o = sec(i + 0.5); e = min(n, o + len(y)); L[o:e] += y[: e - o, 0]; R[o:e] += y[: e - o, 1]
        lab = k + ('' if not opt else ' ' + ','.join(f'{kk}={vv}' for kk, vv in opt.items()))
        labels.append((i + 0.5, lab, *tonal_run(y)))
    mix = np.stack([L, R], 1); mix = mix / (np.max(np.abs(mix)) or 1) * 0.89
    out = os.path.join(AUD, 'sfx-demo.wav')
    with wave.open(out, 'wb') as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((mix * 32767).astype('<i2').tobytes())
    print(f'demo: {len(DEMO)} sounds → {os.path.relpath(out)}')
    for at, lab, run, fr in labels: print(f'  {at:5.1f}s  {lab:22s}  steady peak {run * 1000:5.1f} ms' + (f' @ {fr:.0f} Hz' if run > 0 else ''))
    print('detector calibration (1 kHz sine, true → measured):', ', '.join(f'{D * 1000:.0f}→{m * 1000:.0f} ms' for D, m in calibrate()))
    if a.spec:
        import matplotlib; matplotlib.use('Agg'); import matplotlib.pyplot as plt
        x = mix.mean(1) + 1e-7 * np.random.default_rng(0).standard_normal(len(mix))   # a −140 dB floor: silence plots black
        fig, axs = plt.subplots(2, 1, figsize=(18, 8), gridspec_kw={'height_ratios': [3, 1.3]}, sharex=True)
        for ax, (fmax, nfft) in zip(axs, ((16000, 1024), (1500, 4096))):
            ax.specgram(x, NFFT=nfft, Fs=SR, noverlap=nfft - nfft // 8, cmap='magma', vmin=-130, vmax=-30)
            ax.set_ylim(0, fmax); ax.set_ylabel('Hz')
        axs[1].set_xticks([at for at, *_ in labels]); axs[1].set_xticklabels([lab.replace(' ', '\n') for _, lab, *__ in labels], fontsize=8)
        for at, lab, run, fr in labels: axs[0].axvline(at - 0.5, color='white', lw=0.4, alpha=0.4)
        axs[0].set_title('almost friends — v3 SFX palette (every sound 1 s apart; nothing pitched)')
        axs[1].set_title('0–1.5 kHz (the thumps and bodies)', fontsize=9)
        fig.tight_layout(); fig.savefig(a.spec, dpi=110); print(f'spectrogram → {a.spec}')
    raise SystemExit(0)

# ── the film's foley ──────────────────────────────────────────────────────────────────────────────────────────────
cues = json.load(open(a.cues))
quiet = [(c['t'], c['t'] + c['dur']) for c in cues if c['kind'] == 'quiet']
L = np.zeros(sec(DUR + 3)); R = np.zeros_like(L)
runs, problems = {}, []
for i, c in enumerate(cues):
    if c['kind'] == 'quiet': continue
    y, t0 = render(c, i)
    run, fr = tonal_run(y)
    if run > runs.get(c['kind'], (0, 0))[0]: runs[c['kind']] = (run, fr)
    if run > TONAL_MAX: problems.append(f"tonal: {c['kind']} at {c['t']:.2f}s holds a {fr:.0f} Hz peak for {run * 1000:.0f} ms")
    end = tail_end(y, t0)
    for q0, q1 in quiet:
        if t0 < q1 and end > q0: problems.append(f"quiet: {c['kind']} at {c['t']:.2f}s rings to {end:.2f}s, into {q0:.2f}–{q1:.2f}s")
    pan = float(c.get('pan', 0.0))
    gl, gr = min(1.0, 1 - pan), min(1.0, 1 + pan)          # balance on an already-stereo sound
    o = sec(t0); e = min(len(L), o + len(y))
    L[o:e] += y[: e - o, 0] * gl; R[o:e] += y[: e - o, 1] * gr
if problems: raise SystemExit('foley gate FAILED:\n  ' + '\n  '.join(problems))
mix = np.stack([L, R], 1)[: sec(DUR)]
# the bus limiter: a 2 ms look-ahead peak limiter (60 ms release) set 6 dB under the loudest peak, so the impacts stop
# setting the level of everything else; then the stem is normalised. Clicks rise ~6 dB against the hits.
def limit(x, under_db=6.0, look=0.002, rel=0.06):
    pk = np.max(np.abs(x), 1); thr = pk.max() * 10 ** (-under_db / 20)
    need = np.minimum(1.0, thr / np.maximum(pk, 1e-12))                 # the gain each sample needs
    k = sec(look); need = np.minimum.reduce([np.roll(need, -j) for j in range(k + 1)])   # act before the peak
    g = np.empty_like(need); s_ = 1.0; a_r = np.exp(-1 / (rel * SR))
    for i_, v in enumerate(need): s_ = v if v < s_ else v + (s_ - v) * a_r; g[i_] = s_
    return x * g[:, None], 20 * np.log10(g.min())
mix, gr = limit(mix)
peak = np.max(np.abs(mix)) or 1
mix = mix / peak * 0.89
with wave.open(a.out, 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((mix * 32767).astype('<i2').tobytes())
n_cues = sum(1 for c in cues if c['kind'] != 'quiet')
qpk = max((np.max(np.abs(mix[sec(q0):sec(q1)])) for q0, q1 in quiet), default=0)
print(f'foley: {n_cues} cues → {os.path.relpath(a.out)} (bus limiter: up to {-gr:.1f} dB on the hits)')
print('tonal gate PASS — longest steady peak per kind: ' + ', '.join(f'{k} {v[0] * 1000:.0f} ms' for k, v in sorted(runs.items())))
print(f"quiet gate PASS — {', '.join(f'{q0:.2f}–{q1:.2f}s' for q0, q1 in quiet)} peak " + (f'{20 * np.log10(qpk):.1f} dBFS' if qpk > 0 else '−inf dBFS (digital silence)'))
