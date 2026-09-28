# Score via ElevenLabs Music (music_v2 enforces section durations), one section per act of STORYBOARD.md.
# The key is read from ELEVENLABS_API_KEY or the repo-root .env, held in memory, never written anywhere.
#   python3 projects/novapitch/tools/music.py [--seed 7] [--name take1]
# Writes assets/music/<name>.mp3 and assets/music/<name>.json (plan, seed, song id).
import os, sys, json, argparse, urllib.request

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, '..', '..', '..'))
OUT = os.path.join(HERE, '..', 'assets', 'music')

def api_key():
    k = os.environ.get('ELEVENLABS_API_KEY')
    if k:
        return k.strip()
    env = os.path.join(ROOT, '.env')
    if os.path.exists(env):
        for line in open(env):
            if line.startswith('ELEVENLABS_API_KEY='):
                return line.split('=', 1)[1].strip().strip('"').strip("'")
    sys.exit('ELEVENLABS_API_KEY not found (env or repo-root .env)')

BAR = 2000  # ms at 120 BPM
# Genre anchors that every chunk repeats. The first chunk must NOT mention drums or bass: it is the silent intro,
# and chunk-1 styles set the whole song (takes 1–2 of the first plan ignored "near silence" for that reason).
GENRE = ['instrumental', 'modern cinematic electronic score', 'premium tech product launch film', '120 BPM', '4/4',
         'glossy analog synths', 'wide stereo', 'polished modern production']
NEG_ALL = ['vocals', 'singing', 'choir', 'spoken word', 'lyrics', 'guitar', 'orchestral trailer braams', 'dubstep wobble',
           'festival EDM supersaw drop', 'lo-fi', 'corporate ukulele', 'cheesy', 'chiptune']
# (name, bars, text, positive, negative, adherence)
SECTIONS = [
    ('Void', 3, '[Intro]', ['dark ambient intro', 'deep sub-bass drone only', 'a soft clock-like tick on every beat',
                             'one lonely distant synth pluck', 'vast empty space', 'quiet tension', 'nearly silent by the last beat'],
     ['drums', 'kick drum', 'snare', 'hi-hats', 'percussion groove', 'bass line', 'loud'], 'high'),
    ('Ignition', 2, '[Drop]\n{massive impact hit exactly on the first beat}',
     ['huge cinematic impact on beat one', 'punchy drums enter on beat one', 'pulsing sixteenth-note synth bass',
      'bright shimmering synth swell', 'uplifting burst of energy'], ['fade in', 'quiet start', 'ambient'], 'low'),
    ('It reads', 3, '[Groove]', ['driving four-on-the-floor groove', 'crisp closed hi-hats', 'sparkling synth arpeggio',
                                  'forward momentum', 'clever and precise'], [], 'high'),
    ('One link', 2, '[Build]\n{snare roll accelerating into the next downbeat}',
     ['rising build', 'accelerating snare roll', 'white-noise riser', 'filter sweep opening'], ['breakdown', 'silence'], 'high'),
    ('Conversation', 3, '[Verse]', ['lighter bouncy groove', 'muted plucked synths', 'filtered drums',
                                     'space in the midrange for a speaking voice', 'warm, human, playful'],
     ['loud lead synth', 'busy melody'], 'medium'),
    ('Signal', 3, '[Peak]', ['peak energy', 'full drums with claps', 'big sub bass', 'euphoric wide synth chords',
                              'driving and triumphant'], ['quiet', 'breakdown'], 'medium'),
    ('Breath', 2, '[Breakdown]\n{reverse swell sucking into the next downbeat}',
     ['breakdown', 'all drums drop out', 'warm evolving pads', 'soft reversed swells', 'emotional and hopeful'],
     ['kick drum', 'drums', 'hi-hats', 'snare'], 'low'),
    ('Finale', 4, '[Finale]\n{massive final hit on the first beat, then a long ringing tail}',
     ['massive final impact on beat one', 'triumphant sustained major chord', 'sparkling shimmer', 'gentle pulsing outro',
      'decays to silence by the end'], ['abrupt cut', 'new groove'], 'medium'),
]

ap = argparse.ArgumentParser()
ap.add_argument('--seed', type=int, default=None)
ap.add_argument('--name', default='take1')
ap.add_argument('--model', default='music_v2')
a = ap.parse_args()

chunks = []
for i, (n, bars, text, p, q, adh) in enumerate(SECTIONS):
    pos = GENRE + p if i == 0 else ['instrumental', '120 BPM'] + p
    chunks.append({'text': text, 'duration_ms': bars * BAR, 'positive_styles': pos,
                   'negative_styles': (NEG_ALL if i == 0 else ['vocals', 'singing', 'lyrics']) + q,
                   'context_adherence': adh})
plan = {'chunks': chunks}
body = {'composition_plan': plan, 'model_id': a.model}
if a.seed is not None:
    body['seed'] = a.seed
req = urllib.request.Request('https://api.elevenlabs.io/v1/music?output_format=mp3_48000_320',
                             data=json.dumps(body).encode(), headers={'xi-api-key': api_key(), 'Content-Type': 'application/json'})
try:
    r = urllib.request.urlopen(req, timeout=600)
except urllib.error.HTTPError as e:
    sys.exit(f'HTTP {e.code} {e.read()[:400]}')
os.makedirs(OUT, exist_ok=True)
audio = r.read()
with open(os.path.join(OUT, f'{a.name}.mp3'), 'wb') as f:
    f.write(audio)
meta = {'name': a.name, 'model': a.model, 'seed': a.seed, 'song_id': r.headers.get('song-id'),
        'total_ms': sum(c['duration_ms'] for c in plan['chunks']), 'plan': plan}
with open(os.path.join(OUT, f'{a.name}.json'), 'w') as f:
    json.dump(meta, f, indent=1)
print(f'{a.name}: {len(audio) / 1e6:.2f} MB · song {meta["song_id"]} · planned {meta["total_ms"] / 1000:.1f}s')
