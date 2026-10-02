# Sound design via ElevenLabs Sound Effects: one generation per cue in CUES (the mix places them on the picture).
# The key is read from ELEVENLABS_API_KEY or the repo-root .env, held in memory, never written anywhere.
#   python3 projects/feiyuehui/v4/tools/sfx.py            generate what is missing → audio/sfx/<name>.mp3
#   python3 projects/feiyuehui/v4/tools/sfx.py --force air  regenerate one
import os, sys, json, argparse, subprocess, urllib.request, urllib.error
from concurrent.futures import ThreadPoolExecutor
import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, '..', '..', '..', '..'))
OUT = os.path.join(HERE, '..', 'audio', 'sfx')
sys.path.insert(0, HERE)
from cues import SOUNDS

def api_key():
    k = os.environ.get('ELEVENLABS_API_KEY')
    if k:
        return k.strip()
    for line in open(os.path.join(ROOT, '.env')):
        if line.startswith('ELEVENLABS_API_KEY='):
            return line.split('=', 1)[1].strip().strip('"').strip("'")
    sys.exit('ELEVENLABS_API_KEY not found')

def gen(name, spec):
    path = os.path.join(OUT, f'{name}.mp3')
    body = {'text': spec['text'], 'duration_seconds': spec['dur'], 'prompt_influence': spec.get('influence', 0.6),
            'model_id': 'eleven_text_to_sound_v2'}
    req = urllib.request.Request('https://api.elevenlabs.io/v1/sound-generation?output_format=mp3_44100_192',
                                 data=json.dumps(body).encode(), headers={'xi-api-key': KEY, 'Content-Type': 'application/json'})
    try:
        audio = urllib.request.urlopen(req, timeout=300).read()
    except urllib.error.HTTPError as e:
        return f'{name}: HTTP {e.code} {e.read()[:300]}'
    with open(path, 'wb') as f:
        f.write(audio)
    with open(path.replace('.mp3', '.json'), 'w') as f:
        json.dump({'name': name, **body}, f, indent=1, ensure_ascii=False)
    # a generation can come back near-silent (the v4 'drone' was −61 dB RMS): flag it here, not in the mix
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', path, '-ac', '1', '-f', 'f32le', '-'], capture_output=True).stdout
    x = np.frombuffer(raw, np.float32)
    level = 20 * np.log10(np.sqrt(np.mean(x.astype(np.float64) ** 2)) + 1e-12) if len(x) else -999
    warn = '  ⚠ NEAR-SILENT: regenerate (--force) or rewrite the prompt' if level < -45 else ''
    return f'{name}: {len(audio) / 1e3:.0f} kB · {spec["dur"]} s · {level:.0f} dB RMS{warn}'

ap = argparse.ArgumentParser()
ap.add_argument('--force', nargs='*', default=[])
a = ap.parse_args()
KEY = api_key()
os.makedirs(OUT, exist_ok=True)
todo = {n: s for n, s in SOUNDS.items() if n in a.force or not os.path.exists(os.path.join(OUT, f'{n}.mp3'))}
print(f'{len(todo)} to generate')
with ThreadPoolExecutor(2) as ex:   # the Creator tier allows two concurrent generations
    for r in ex.map(lambda kv: gen(*kv), todo.items()):
        print(r)
