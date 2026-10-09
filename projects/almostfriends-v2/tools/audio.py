# The crazy version's sound (CRAZY.md): the released mix (the owner-approved score and foley, ../almostfriends/audio/
# mix.wav) under a new layer of hits for the new picture — glass knocks, the pane cracking and shattering, the dives'
# whooshes, the SAME!! impact, the dial's ratchet slowing through the wait and its clicks, the wall popping at the
# reveal and the glass crowd rushing past (the Apple pass took the reveal's pane out of the picture, and its shatter with
# it), the final hit — then mastered for the web (two-pass loudnorm, −14 LUFS, −1.5 dBTP in the WAV so the AAC master
# lands under −1).
#   python3 projects/almostfriends-v2/tools/audio.py [--gen] [--dry] [--out mix.wav]
# Effects come from the special edition's ElevenLabs library (../almostfriends-special/v5/audio/sfx) and, for the few
# the glass needs, from ElevenLabs Sound Effects into audio/sfx (--gen; the key from ELEVENLABS_API_KEY or the repo
# .env, held in memory, never printed or written).
import os, sys, json, argparse, subprocess, wave, math, urllib.request, urllib.error, time
import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, '..', '..', '..'))
AUD = os.path.join(HERE, '..', 'audio')
OWN = os.path.join(AUD, 'sfx')
LIB = os.path.join(ROOT, 'projects', 'almostfriends-special', 'v5', 'audio', 'sfx')
BASE = os.path.join(ROOT, 'projects', 'almostfriends', 'audio', 'mix.wav')
SR = 48000

NEW = {   # name: (prompt, seconds, prompt_influence)
    'knock_glass': ('A firm knuckle knock on thick glass, one solid glassy thunk with a short ring, close-up, dry, no music', 0.6, 0.7),
    'crack': ('Thick glass slowly cracking under pressure, creaking splintering fractures spreading, tense, close-up, dry, no music', 1.0, 0.6),
    'shatter': ('A large pane of glass shattering explosively, bright crash with a shower of glass shards, cinematic, dry, no music', 2.0, 0.6),
}

def api_key():
    k = os.environ.get('ELEVENLABS_API_KEY')
    if k: return k.strip()
    for line in open(os.path.join(ROOT, '.env')):
        if line.startswith('ELEVENLABS_API_KEY='):
            return line.split('=', 1)[1].strip().strip('"').strip("'")
    sys.exit('ELEVENLABS_API_KEY not found')

def generate(dry):
    os.makedirs(OWN, exist_ok=True)
    total = 0
    for n, (prompt, dur, infl) in NEW.items():
        wav = os.path.join(OWN, f'{n}.wav')
        if os.path.exists(wav): continue
        if dry: print(f'would generate {n}: {dur} s'); continue
        body = {'text': prompt, 'duration_seconds': dur, 'prompt_influence': infl, 'model_id': 'eleven_text_to_sound_v2'}
        for attempt in range(4):
            req = urllib.request.Request('https://api.elevenlabs.io/v1/sound-generation?output_format=pcm_48000', data=json.dumps(body).encode(),
                                         headers={'xi-api-key': api_key(), 'Content-Type': 'application/json'}, method='POST')
            try:
                with urllib.request.urlopen(req, timeout=180) as r:
                    data, cost = r.read(), r.headers.get('character-cost')
                break
            except urllib.error.HTTPError as e:
                msg = e.read().decode('utf-8', 'replace')[:300]
                if e.code == 429 and attempt < 3: time.sleep(4 + attempt * 4); continue
                sys.exit(f'{n}: HTTP {e.code}: {msg}')
        nch = 2 if len(data) / 96000 > dur * 1.5 else 1
        with wave.open(wav, 'wb') as w:
            w.setnchannels(nch); w.setsampwidth(2); w.setframerate(SR); w.writeframes(data)
        json.dump({'name': n, 'prompt': prompt, 'seconds': dur, 'prompt_influence': infl, 'credits': cost}, open(os.path.join(OWN, f'{n}.json'), 'w'), indent=1)
        total += int(cost or 0)
        print(f'{n}: {len(data) / 96000 / nch:.2f} s × {nch} ch, {cost} credits')
    print(f'generated: {total} credits')

def read(path):
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', path, '-ac', '2', '-ar', str(SR), '-f', 'f32le', '-'], capture_output=True, check=True).stdout
    return np.frombuffer(raw, np.float32).reshape(-1, 2).astype(np.float64)

# ── glass, synthesised (ElevenLabs was unavailable: the account's payment had failed) ──────────────────────────
from scipy.signal import butter, sosfilt
def _bp(x, lo, hi): return sosfilt(butter(2, [lo, hi], 'bandpass', fs=SR, output='sos'), x)
def _hp(x, f): return sosfilt(butter(2, f, 'highpass', fs=SR, output='sos'), x)
def synth(name):
    R = np.random.default_rng({'knock_glass': 3, 'crack': 5, 'shatter': 7}[name])
    if name == 'knock_glass':
        # a knuckle on thick glass: a dull thunk and the pane's short ring (a few inharmonic partials)
        n = int(0.6 * SR); t = np.arange(n) / SR
        x = 0.9 * np.sin(2 * np.pi * 160 * t) * np.exp(-t / 0.035)
        for f, a, d in [(612, 0.35, 0.09), (1430, 0.22, 0.07), (2870, 0.12, 0.05), (4310, 0.07, 0.03)]:
            x += a * np.sin(2 * np.pi * f * t + R.uniform(0, 6)) * np.exp(-t / d)
        x += 0.5 * _bp(R.standard_normal(n), 800, 5000) * np.exp(-t / 0.004)
        x *= np.minimum(1, t / 0.0015)
        return np.stack([x, x], 1) * 0.8
    if name == 'crack':
        # fractures running: sharp clicks, denser and louder as it goes, each a tiny bright tick with a ring
        n = int(1.0 * SR); x = np.zeros(n)
        times = np.sort(R.uniform(0, 0.95, 70) ** 0.6 * 0.95)
        for tt in times:
            i = int(tt * SR); L = int(0.03 * SR)
            if i + L >= n: continue
            tk = np.arange(L) / SR
            x[i:i + L] += (0.3 + 0.7 * tt) * (R.standard_normal(L) * np.exp(-tk / 0.002) + 0.4 * np.sin(2 * np.pi * R.uniform(2500, 7000) * tk) * np.exp(-tk / 0.012))
        x = _hp(x, 900)
        return np.stack([x, np.roll(x, 37)], 1) * 0.6
    # the shatter: a bright crash (noise), a low body, and a shower of tinkles (short high pings, scattered and panned)
    n = int(2.0 * SR); t = np.arange(n) / SR
    crash = _hp(R.standard_normal(n), 1800) * np.exp(-t / 0.12) * np.minimum(1, t / 0.002)
    body = _bp(R.standard_normal(n), 300, 1500) * np.exp(-t / 0.05) * 0.6
    L, Rr = crash + body, crash + body
    L, Rr = L.copy(), Rr.copy()
    for k in range(180):
        tt = (R.uniform(0, 1) ** 1.8) * 1.2
        i = int(tt * SR); m = int(0.08 * SR)
        if i + m >= n: continue
        tk = np.arange(m) / SR
        ping = np.sin(2 * np.pi * R.uniform(2800, 11000) * tk) * np.exp(-tk / R.uniform(0.008, 0.04)) * (0.35 * (1 - tt / 1.8))
        pan = R.uniform(-1, 1)
        L[i:i + m] += ping * (1 - pan) * 0.5; Rr[i:i + m] += ping * (1 + pan) * 0.5
    x = np.stack([L, Rr], 1)
    return x / np.max(np.abs(x)) * 0.9

def sfx(name):
    for d in (OWN, LIB):
        p = os.path.join(d, f'{name}.wav')
        if os.path.exists(p): return read(p)
    if name in NEW: return synth(name)
    sys.exit(f'sfx {name}: not found (run --gen)')

# the dial (scenes/unlock.js ringAngle): their bead turns top − (2.8x + 0.9x²), x = 49.5 − t; a tick each 30° it turns
def dial_ticks():
    ts, k = [], 1
    while True:
        x = (-2.8 + math.sqrt(2.8 ** 2 + 4 * 0.9 * k * math.pi / 6)) / (2 * 0.9)
        t = 49.5 - x
        if t < 44.85: break
        ts.append(t); k += 1
    return sorted(ts)

# [name, time (s), gain dB, align: 'peak' (its loudest sample on the time) | 'start' | 'end' (its end on the time), pan −1..1]
def cues():
    c = [
        ['knock_glass', 0.0, -1, 'peak', 0], ['knock_glass', 0.25, -1, 'peak', 0.05], ['knock_glass', 0.5, 0, 'peak', -0.05],
        ['riser', 2.0, -7, 'end', 0], ['crack', 1.25, -3, 'start', 0], ['crack', 1.62, -5, 'start', 0.2],
        ['shatter', 2.0, 1, 'peak', 0], ['sub', 2.0, -1, 'peak', 0],
        ['impact', 2.3, -6, 'peak', 0], ['shimmer', 2.32, -9, 'start', 0],
        ['whip', 3.18, -4, 'peak', 0],
        ['thud', 6.75, -4, 'peak', 0], ['whip', 7.15, -7, 'peak', 0],
        ['whip', 14.85, -4, 'peak', 0], ['air', 21.9, -6, 'start', 0], ['impact', 23.75, -8, 'peak', 0],
        ['riser', 32.0, -6, 'end', 0], ['impact', 32.0, 0, 'peak', 0], ['sub', 32.0, -1, 'peak', 0],
        ['shimmer', 34.25, -11, 'start', -0.3], ['shimmer', 36.25, -11, 'start', 0.3], ['shimmer', 38.25, -11, 'start', 0],
        ['lock', 44.95, -3, 'peak', -0.15],
        ['lock', 49.5, -1, 'peak', 0.1], ['padlock', 49.53, -3, 'peak', 0], ['impact', 49.56, -5, 'peak', 0],
        # the wall between them pops, and the crowd of clear glass people rushes past the lens
        ['pop_b1', 50.5, -2, 'peak', 0], ['impact', 50.5, -1, 'peak', 0], ['air', 50.45, -6, 'start', 0],
        ['sub', 50.5, -1, 'peak', 0], ['shimmer', 50.85, -6, 'start', 0],
        ['impact', 62.0, -3, 'peak', 0], ['sub', 62.0, -3, 'peak', 0],
    ]
    for i, t in enumerate(dial_ticks()):
        # the ratchet: soft, and softer while it races; it comes up as it slows toward their yes
        c.append(['tick', t, -20 + 8 * min(1, (t - 44.85) / 4.6), 'peak', 0.1 * math.sin(i)])
    return c

def place(bus, x, t, gain_db, align, pan):
    mono = x.mean(1)
    i0 = {'peak': int(np.argmax(np.abs(mono))), 'start': 0, 'end': len(x)}[align]
    at = int(round(t * SR)) - i0
    g = 10 ** (gain_db / 20)
    l, r = g * math.cos((pan + 1) * math.pi / 4) * math.sqrt(2), g * math.sin((pan + 1) * math.pi / 4) * math.sqrt(2)
    a, b = max(0, at), min(len(bus), at + len(x))
    if b <= a: return
    seg_ = x[a - at:b - at]
    bus[a:b, 0] += seg_[:, 0] * l
    bus[a:b, 1] += seg_[:, 1] * r

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--gen', action='store_true')
    ap.add_argument('--dry', action='store_true')
    ap.add_argument('--sfx-db', type=float, default=-4.0, help='the new layer under the released mix')
    ap.add_argument('--out', default='mix.wav')
    a = ap.parse_args()
    if a.gen or a.dry: generate(a.dry)
    if a.dry: return
    base = read(BASE)
    bus = np.zeros_like(base)
    cs = cues()
    for name, t, g, al, pan in cs: place(bus, sfx(name), t, g + a.sfx_db, al, pan)
    mix = base + bus
    tmp = os.path.join(AUD, '_premaster.wav')
    os.makedirs(AUD, exist_ok=True)
    with wave.open(tmp, 'wb') as w:
        w.setnchannels(2); w.setsampwidth(3); w.setframerate(SR)
        pcm = np.clip(mix, -1, 1)
        q = (pcm * 8388607).astype('<i4').reshape(-1)
        w.writeframes(q.view(np.uint8).reshape(-1, 4)[:, :3].tobytes())
    # two-pass loudnorm: measure, then apply linear gain to −14 LUFS with −1.5 dBTP — headroom for the AAC encode (the
    # master's is Apple's AudioToolbox encoder, render.mjs, which holds the mix's peak; ffmpeg's own rang up to 2.6 dB
    # over the sharpest pops)
    m = subprocess.run(['ffmpeg', '-hide_banner', '-i', tmp, '-af', 'loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json', '-f', 'null', '-'], capture_output=True, text=True).stderr
    js = json.loads(m[m.rindex('{'):m.rindex('}') + 1])
    out = os.path.join(AUD, a.out)
    f = (f"loudnorm=I=-14:TP=-1.5:LRA=11:measured_I={js['input_i']}:measured_TP={js['input_tp']}:measured_LRA={js['input_lra']}:"
         f"measured_thresh={js['input_thresh']}:offset={js['target_offset']}:linear=true:print_format=summary")
    subprocess.run(['ffmpeg', '-hide_banner', '-v', 'error', '-y', '-i', tmp, '-af', f, '-ar', str(SR), '-c:a', 'pcm_s24le', out], check=True)
    os.remove(tmp)
    print(f'{len(cs)} cues ({len(dial_ticks())} dial ticks) → {os.path.relpath(out, ROOT)}')

main()
