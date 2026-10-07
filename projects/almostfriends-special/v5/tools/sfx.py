# The sound library: every effect the film uses, generated once with ElevenLabs Sound Effects
# (POST /v1/sound-generation, eleven_text_to_sound_v2), 48 kHz PCM, into audio/sfx/<name>.wav (+ <name>.json: prompt,
# duration, credits). One room for all of them is added in the mix, so prompts ask for dry, close sounds.
#   python3 projects/almostfriends-special/tools/sfx.py [name …] [--force] [--dry]
# The key is read from ELEVENLABS_API_KEY or the repo-root .env, held in memory, never printed or written anywhere.
import os, sys, json, argparse, wave, urllib.request, urllib.error, time

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, '..', '..', '..'))
OUT = os.path.join(HERE, '..', 'audio', 'sfx')

# name: (prompt, seconds, prompt_influence)
LIB = {
    'rim': ('Cinematic airy whoosh of light sweeping around in a fast circle, shimmering glassy tail, dry, no music', 1.5, 0.6),
    'sub': ('Deep clean sub bass boom hit, short punchy low impact, cinematic, dry, no reverb tail, no music', 1.2, 0.6),
    'pop_s1': ('Single small soap bubble popping, tiny crisp wet pop, close-up, dry, silent background', 0.5, 0.7),
    'pop_s2': ('One tiny soap bubble bursting, delicate crisp pop, close microphone, dry, silent background', 0.5, 0.7),
    'pop_b1': ('Large soap bubble bursting with a satisfying wet pop and a burst of air spray, close-up, crisp, dry', 1.5, 0.6),
    'pop_b2': ('Big bubble popping loudly, juicy wet burst and a short airy spray, close-up, dry, no music', 1.5, 0.6),
    'stretch': ('Soap bubble film stretching, soft wet glassy tension creak, subtle, close-up, dry', 1.2, 0.5),
    'riser': ('Short airy reverse swell riser building tension, cinematic, ends abruptly with no impact, no music', 2.0, 0.6),
    'shimmer': ('Bright magical glassy shimmer sparkle, airy and soft, short tail, no melody, no music', 1.5, 0.5),
    'bloop1': ('Soft round liquid bloop, a droplet merging into water, playful, close-up, dry', 0.6, 0.7),
    'bloop2': ('Gentle water droplet plop, round and soft, close-up, dry, silent background', 0.6, 0.7),
    'boing': ('Cute squishy jelly bounce, soft rubbery boing, playful cartoon, short, dry', 0.7, 0.6),
    'tap1': ('Fingertip tap on a glass smartphone screen, crisp short click, close-up, dry', 0.5, 0.7),
    'tap2': ('Single crisp tap on glass, short clean click, close microphone, dry, silent background', 0.5, 0.7),
    'uipop': ('Soft rounded user interface pop, modern app, short and clean, no melody, dry', 0.5, 0.6),
    'typing': ('Fast light typing on a smartphone touchscreen keyboard, soft taps, close-up, dry', 1.0, 0.6),
    'whip': ('Fast cinematic whip pan whoosh, big airy swoosh, punchy, dry, no music', 1.0, 0.6),
    'air': ('Flying fast through air, rushing wind passing by, smooth and airy, no music', 2.0, 0.5),
    'scan': ('Soft airy sonar sweep pulse expanding outward, warm and futuristic, whooshy, no beep, no melody', 1.5, 0.5),
    'lock': ('Satisfying glass click lock-on snap, crisp, short, dry', 0.6, 0.6),
    'send': ('Soft short upward swoosh, light and airy, a message being sent, dry', 0.6, 0.6),
    'recv': ('Soft gentle bubble pop notification, rounded and warm, no melody, no ding, dry', 0.5, 0.6),
    'padlock': ('Small metal padlock unlocking, crisp mechanical click clack, close-up, dry, silent background', 0.8, 0.7),
    'heart': ('Single soft deep heartbeat, warm and close, cinematic, dry, no music', 0.8, 0.6),
    'squish': ('Two soap bubbles gently touching and merging, soft wet squelch, subtle, close-up, dry', 1.0, 0.5),
    'fizz': ('Many soft bubbles rising and gently popping, light bubbly texture, airy, no music', 3.0, 0.5),
    'gather': ('Building airy whoosh pulling inward, suction rising, cinematic, ends abruptly with no impact', 2.2, 0.6),
    'impact': ('Big warm cinematic impact with a soft glassy shimmer tail, uplifting, no music', 2.0, 0.5),
    'squeak': ('Tiny cute rubbery squeak, playful character peeking, short, dry', 0.5, 0.6),
    'thud': ('Punchy soft thud of a heavy word landing, deep and short, cinematic, dry', 0.6, 0.6),
    'tick': ('Soft tiny mechanical tick, a single click of a counter, dry, silent background', 0.5, 0.7),
    'flip': ('Soft quick card flip, short papery flick, close-up, dry', 0.5, 0.6),
}

def api_key():
    k = os.environ.get('ELEVENLABS_API_KEY')
    if k: return k.strip()
    for line in open(os.path.join(ROOT, '.env')):
        if line.startswith('ELEVENLABS_API_KEY='):
            return line.split('=', 1)[1].strip().strip('"').strip("'")
    sys.exit('ELEVENLABS_API_KEY not found')

ap = argparse.ArgumentParser()
ap.add_argument('names', nargs='*')
ap.add_argument('--force', action='store_true')
ap.add_argument('--dry', action='store_true')
a = ap.parse_args()
os.makedirs(OUT, exist_ok=True)
names = a.names or list(LIB)
total = 0
for n in names:
    prompt, dur, infl = LIB[n]
    wav = os.path.join(OUT, f'{n}.wav')
    if os.path.exists(wav) and not a.force:
        continue
    if a.dry:
        print(f'would generate {n}: {dur} s'); continue
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
            if e.code == 429 and attempt < 3:
                time.sleep(4 + attempt * 4); continue
            sys.exit(f'{n}: HTTP {e.code}: {msg}')
    nch = 2 if len(data) / 96000 > dur * 1.5 else 1          # the API returns interleaved stereo PCM
    with wave.open(wav, 'wb') as w:
        w.setnchannels(nch); w.setsampwidth(2); w.setframerate(48000); w.writeframes(data)
    json.dump({'name': n, 'prompt': prompt, 'seconds': dur, 'prompt_influence': infl, 'credits': cost}, open(os.path.join(OUT, f'{n}.json'), 'w'), indent=1)
    total += int(cost or 0)
    print(f'{n}: {len(data) / 96000 / nch:.2f} s × {nch} ch, {cost} credits')
print(f'total {total} credits')
