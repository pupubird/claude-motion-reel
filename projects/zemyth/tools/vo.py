# Voice lines for the Zembit via ElevenLabs text-to-speech (with character timestamps).
# The API key is read from the ELEVEN_API_KEY environment variable and is never written to disk.
#   ELEVEN_API_KEY=... python3 tools/vo.py [--model eleven_v3] [--voice <id>] [--only name,name]
# Writes assets/vo/<name>.mp3 and assets/vo/<name>.json ({text, chars[], start[], end[]}).
import os, sys, json, base64, argparse, urllib.request

LINES = [
    ('hello', '[cheerfully] Hello, world!'),
    ('fourdays', 'Four days.'),
    ('tenbuilders', 'Ten builders.'),
    ('onehouse', 'One house.'),
    ('ship', 'You ship something real.'),
    ('best', 'We back the best.'),
    ('funding', '[warmly] Funding builders!'),
]

ap = argparse.ArgumentParser()
ap.add_argument('--model', default='eleven_v3')
ap.add_argument('--voice', default='cgSgspJ2msm6clMCkdW9')   # Jessica — playful, bright, warm
ap.add_argument('--only', default='')
ap.add_argument('--out', default=os.path.join(os.path.dirname(__file__), '..', 'assets', 'vo'))
ap.add_argument('--seed', type=int, default=2026)
a = ap.parse_args()
key = os.environ.get('ELEVEN_API_KEY')
if not key:
    sys.exit('ELEVEN_API_KEY is not set')
os.makedirs(a.out, exist_ok=True)
only = set(filter(None, a.only.split(',')))
total = 0
for name, text in LINES:
    if only and name not in only:
        continue
    body = {'text': text, 'model_id': a.model, 'seed': a.seed,
            'voice_settings': {'stability': 0.5, 'similarity_boost': 0.8, 'style': 0.35, 'use_speaker_boost': True}}
    if a.model == 'eleven_v3':
        body['voice_settings'] = {'stability': 0.5, 'similarity_boost': 0.8}
    req = urllib.request.Request(
        f'https://api.elevenlabs.io/v1/text-to-speech/{a.voice}/with-timestamps?output_format=mp3_44100_192',
        data=json.dumps(body).encode(), headers={'xi-api-key': key, 'Content-Type': 'application/json'})
    try:
        r = json.load(urllib.request.urlopen(req, timeout=120))
    except urllib.error.HTTPError as e:
        sys.exit(f'{name}: HTTP {e.code} {e.read()[:300]}')
    al = r.get('normalized_alignment') or r.get('alignment')
    with open(os.path.join(a.out, f'{name}.mp3'), 'wb') as f:
        f.write(base64.b64decode(r['audio_base64']))
    meta = {'text': text, 'model': a.model, 'voice': a.voice,
            'chars': al['characters'], 'start': al['character_start_times_seconds'], 'end': al['character_end_times_seconds']}
    with open(os.path.join(a.out, f'{name}.json'), 'w') as f:
        json.dump(meta, f)
    total += len(text)
    print(f'{name:12s} {al["character_end_times_seconds"][-1]:.2f}s  "{"".join(al["characters"])}"')
print(f'characters billed ≈ {total}')
