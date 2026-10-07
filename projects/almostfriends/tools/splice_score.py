# Three edits on kept takes, both in take time (2 s pre-roll: take 2.0 s = film 0; the output keeps that, so
# tools/mix.py reads it). Each makes one seam: a short equal-power crossfade that ends 2 ms before the first transient
# at the seam (the downbeat hides it).
#   intro:  python3 tools/splice_score.py --intro v3a --keep v2a --seam 4.0 --out v3a-s [--xfade-ms 12]
#           A new intro up to the seam, the kept take from it. ElevenLabs' audio-reference chunk re-renders the kept
#           section (similar, not identical: best-lag correlation 0.26–0.80 against v2a, lag drifting −4…+8 ms), so the
#           section the owner approved is taken from the original file instead.
#   insert: python3 tools/splice_score.py --keep v3d-s --insert 22 --out v4a-s
#           Repeats the bar that ends at film second B (one bar = 2 s), so everything after B plays one bar later (v4:
#           one more bar for Bub's search). The seam is the jump from the end of that bar back to its start; B = 22 was
#           picked by measurement (the 0.25 s after 22 and after 20 correlate 0.84, the best of 18 / 20 / 22).
#   cut:    python3 tools/splice_score.py --keep v4a-s --cut 2 --out v6a-s
#           Drops the bar that starts at film second B, so everything after B + 2 plays one bar earlier (v6: the hook in
#           one bar, the drop at 2.0 s). The seam is the jump from B to B + 2; B = 2 because the intro's two bars match
#           (−15.4 / −15.3 dB, last beats correlating 0.80), so bar 1 leads into the drop as bar 2 did.
import argparse, os, wave
import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
MUS = os.path.join(HERE, '..', 'audio', 'music')
PRE = 2.0
BAR = 2.0

ap = argparse.ArgumentParser()
ap.add_argument('--intro')
ap.add_argument('--keep', required=True)
ap.add_argument('--seam', type=float, default=4.0, help='film seconds where the kept take takes over (intro mode)')
ap.add_argument('--insert', type=float, default=None, help='film second B: play the bar [B-2, B] twice (insert mode)')
ap.add_argument('--cut', type=float, default=None, help='film second B: drop the bar [B, B+2] (cut mode)')
ap.add_argument('--out', required=True)
ap.add_argument('--xfade-ms', type=float, default=12.0)
a = ap.parse_args()

def read(name):
    w = wave.open(os.path.join(MUS, f'{name}.wav'))
    sr, ch = w.getframerate(), w.getnchannels()
    x = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(np.float32).reshape(-1, ch) / 32768
    return x, sr

def onset(x, at, sr):
    # the first 1 ms frame within ±40 ms of `at` whose energy jumps 4× over the preceding 10 ms (a downbeat)
    mono = x.mean(1)
    f = int(0.001 * sr)
    e = np.array([np.sum(mono[i:i + f] ** 2) for i in range(at - 40 * f, at + 40 * f, f)])
    for k in range(10, len(e)):
        if e[k] > 4 * e[k - 10:k].mean() + 1e-9:
            return at - 40 * f + k * f
    return None

def join(A, B, seam_a, seam_b, sr):
    # A up to its seam, then B from its seam; the crossfade ends 2 ms before B's transient at its seam
    f = int(0.001 * sr)
    on = onset(B, seam_b, sr)
    shift = ((on if on is not None else seam_b) - 2 * f) - seam_b       # where the fade ends, relative to the seam
    L = int(a.xfade_ms / 1000 * sr)
    ea, eb = seam_a + shift, seam_b + shift
    u = np.linspace(0, 1, L)[:, None]
    mid = A[ea - L:ea] * np.cos(u * np.pi / 2) + B[eb - L:eb] * np.sin(u * np.pi / 2)
    return np.concatenate([A[:ea - L], mid, B[eb:]]), on, ea

K, sr = read(a.keep)
if a.cut is not None:
    i0 = int(round((a.cut + PRE) * sr)); i1 = i0 + int(round(BAR * sr))
    # the take up to B, then the take again from B + 2: A = take, B = take, seams i0 / i1
    out, on, ea = join(K, K, i0, i1, sr)
    what = f'{a.keep} without the bar film {a.cut:.1f}–{a.cut + BAR:.1f} s (seam at film {(ea / sr) - PRE:.4f} s)'
elif a.insert is not None:
    i1 = int(round((a.insert + PRE) * sr)); i0 = i1 - int(round(BAR * sr))
    # first pass of the bar runs to i1, then the take again from i0 (the bar's start): A = take, B = take, seams i1 / i0
    out, on, ea = join(K, K, i1, i0, sr)
    what = f'{a.keep} with the bar film {a.insert - BAR:.1f}–{a.insert:.1f} s played twice (seam at film {(ea / sr) - PRE:.4f} s)'
else:
    A, sr2 = read(a.intro)
    assert sr == sr2 and A.shape[1] == K.shape[1], 'sample rate / channels differ'
    n = min(len(A), len(K))
    seam = int(round((a.seam + PRE) * sr))
    out, on, ea = join(A[:n], K[:n], seam, seam, sr)
    what = f'{a.intro} up to film {(ea / sr) - PRE:.4f} s, then {a.keep} (its transient at {((on or seam) / sr) - PRE:+.4f} s)'
peak = np.abs(out).max()
if peak > 1.0: out /= peak
path = os.path.join(MUS, f'{a.out}.wav')
with wave.open(path, 'wb') as w:
    w.setnchannels(out.shape[1]); w.setsampwidth(2); w.setframerate(sr)
    w.writeframes((np.clip(out, -1, 1) * 32767).astype(np.int16).tobytes())
print(f'{a.out}: {what}, {a.xfade_ms:.0f} ms crossfade → {os.path.relpath(path)} ({len(out) / sr:.2f} s, peak {20 * np.log10(peak + 1e-9):.1f} dBFS)')
