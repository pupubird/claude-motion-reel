# The Digital Twin's voice (ElevenLabs TTS with character timestamps). One line, spoken as Maya Chen's twin.
# Key: ELEVENLABS_API_KEY or the repo-root .env, held in memory only.
#   python3 projects/novapitch/tools/vo.py [--voice <id>] [--model eleven_v3] [--seed 2026] [--name answer]
# Writes assets/vo/<name>.mp3 and assets/vo/<name>.json ({text, chars, start, end}).
import os, sys, json, base64, argparse, urllib.request

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, '..', '..', '..'))

def api_key():
    k = os.environ.get('ELEVENLABS_API_KEY')
    if k:
        return k.strip()
    env = os.path.join(ROOT, '.env')
    for line in open(env) if os.path.exists(env) else []:
        if line.startswith('ELEVENLABS_API_KEY='):
            return line.split('=', 1)[1].strip().strip('"').strip("'")
    sys.exit('ELEVENLABS_API_KEY not found')

LINES = {
    # the answer to "How fast does it pay back?" (Luminex demo deck, slide 5); the pill pops on "slide five"
    'answer': 'Median payback is seven point two months. It’s on slide five.',
}

ap = argparse.ArgumentParser()
ap.add_argument('--voice', default='EXAVITQu4vr4xnSDxMaL')   # "Sarah": warm, confident, American
ap.add_argument('--model', default='eleven_v3')
ap.add_argument('--seed', type=int, default=2026)
ap.add_argument('--name', default='answer')
ap.add_argument('--line', default='answer')
ap.add_argument('--out', default=os.path.join(HERE, '..', 'assets', 'vo'))
a = ap.parse_args()
text = LINES[a.line]
body = {'text': text, 'model_id': a.model, 'seed': a.seed,
        'voice_settings': {'stability': 0.5, 'similarity_boost': 0.8}}
req = urllib.request.Request(
    f'https://api.elevenlabs.io/v1/text-to-speech/{a.voice}/with-timestamps?output_format=mp3_44100_192',
    data=json.dumps(body).encode(), headers={'xi-api-key': api_key(), 'Content-Type': 'application/json'})
try:
    r = json.load(urllib.request.urlopen(req, timeout=120))
except urllib.error.HTTPError as e:
    sys.exit(f'HTTP {e.code} {e.read()[:300]}')
al = r.get('normalized_alignment') or r.get('alignment')
os.makedirs(a.out, exist_ok=True)
with open(os.path.join(a.out, f'{a.name}.mp3'), 'wb') as f:
    f.write(base64.b64decode(r['audio_base64']))
json.dump({'text': text, 'model': a.model, 'voice': a.voice, 'seed': a.seed, 'chars': al['characters'],
           'start': al['character_start_times_seconds'], 'end': al['character_end_times_seconds']},
          open(os.path.join(a.out, f'{a.name}.json'), 'w'))
print(f'{a.name}: {al["character_end_times_seconds"][-1]:.2f}s · {len(text)} chars · voice {a.voice}')
