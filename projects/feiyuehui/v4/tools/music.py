# Score via ElevenLabs Music: one chunk per act of the cut (src/config.js T), durations enforced by the model.
# The key is read from ELEVENLABS_API_KEY or the repo-root .env, held in memory, never written anywhere.
#   python3 projects/feiyuehui/v4/tools/music.py --name t1 [--seed 7] [--model music_v2_5]
# Writes audio/music/<name>.mp3 and audio/music/<name>.json (plan, seed, song id).
import os, sys, json, argparse, urllib.request, urllib.error

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, '..', '..', '..', '..'))
OUT = os.path.join(HERE, '..', 'audio', 'music')

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

# (name, ms, text, positive, negative, context adherence). Bars of 2 s at 120 BPM; picture anchors in src/config.js.
SECTIONS = [
    ('mist', 4000,
     'Ethereal opening in drifting cloud: airy string harmonics, a breathy bamboo flute note.\n'
     'A single guzheng harmonic rings out over soft bell overtones, slowly swelling. No drums. Hushed wonder.',
     ['ethereal', 'airy string harmonics', 'guzheng harmonic', 'soft bells', 'slow swell', 'no drums', 'very quiet'],
     ['drums', 'percussion', 'bass', 'beat'], 'high'),
    ('moon', 4000,
     'The moon appears: a warm, wide string chord blooms, a bianzhong bronze bell melody answers, and a soft low pulse '
     'begins on the downbeat of each bar. Luminous, noble, awe.',
     ['warm string swell', 'bianzhong bells', 'soft low pulse', 'luminous', 'noble'],
     ['heavy drums', 'distorted'], 'medium'),
    ('select', 4000,
     'Momentum: a plucked guzheng ostinato in sixteenth notes, light frame drum and taiko pattern, low strings rising. '
     'Precise, elegant, focused.',
     ['guzheng ostinato', 'sixteenth notes', 'light taiko', 'rising low strings', 'precise'],
     ['vocals'], 'medium'),
    ('craft', 6000,
     'Craft and build: a bamboo flute melody over staccato strings, taiko accents on beats two and four, pipa tremolo.\n'
     'Tension builds steadily to a crescendo, then everything cuts to silence on the final beat.',
     ['dizi flute melody', 'staccato strings', 'taiko accents', 'pipa tremolo', 'building crescendo', 'riser'],
     ['vocals'], 'medium'),
    ('collection', 6000,
     'The grand climax lands on the first beat: huge taiko hits, soaring full strings, guzheng glissandi.\n'
     'Powerful brass-like swells, majestic and driving. Luxurious, triumphant, cinematic.',
     ['big taiko hits', 'soaring strings', 'guzheng glissando', 'majestic', 'driving', 'cinematic climax'],
     ['vocals', 'EDM drop', 'dubstep'], 'medium'),
    ('finale', 6000,
     'Resolution: the drums stop; a sustained warm chord with bianzhong bells and a last graceful guzheng phrase.\n'
     'One deep final impact on the fifth beat, then a long shimmering ring-out into silence.',
     ['sustained warm chord', 'bianzhong bells', 'guzheng phrase', 'one final deep impact', 'ring out'],
     ['drums loop', 'vocals'], 'medium'),
]
GENRE = ['instrumental', 'cinematic luxury brand film score', 'modern Chinese orchestral hybrid', 'guzheng', 'dizi bamboo flute',
         'bianzhong bronze bells', 'Chinese taiko drums', 'strings', 'deep sub pulses', '120 BPM', '4/4', 'D minor pentatonic',
         'polished modern production', 'wide stereo']
NEG_ALL = ['vocals', 'singing', 'choir', 'spoken word', 'lyrics', 'electric guitar', 'dubstep', 'trap hi-hats', 'EDM',
           'lo-fi', 'chiptune', 'cheesy', 'kitsch', 'corporate ukulele']

ap = argparse.ArgumentParser()
ap.add_argument('--seed', type=int, default=None)
ap.add_argument('--name', default='t1')
ap.add_argument('--model', default='music_v2_5')
ap.add_argument('--variant', default='a', help='a: the first plan; b: sharper hits (breath before the drop, one final impact)')
a = ap.parse_args()

if a.variant == 'c':   # the 40 s cut (src/config.js): 7 sections, the logo's impact at 33 s
    SECTIONS = [
        ('mist', 4000,
         'Near silence in drifting cloud: soft wind, airy string harmonics far away.\n'
         'A single guzheng harmonic rings out and fades. No drums, no bass. Very quiet, hushed, suspended.',
         ['ethereal', 'airy string harmonics', 'guzheng harmonic', 'no drums', 'very quiet'], ['drums', 'percussion', 'bass', 'beat'], 'high'),
        ('moon', 4000,
         'The moon appears: a deep soft boom and a bright bianzhong bell, then a warm wide string chord blooms.\n'
         'A gentle low pulse starts on each downbeat. Luminous, noble, full of wonder.',
         ['warm string swell', 'bianzhong bells', 'soft low pulse', 'luminous', 'noble'], ['heavy drums', 'distorted'], 'medium'),
        ('vortex', 6000,
         'Momentum: a plucked guzheng ostinato in sixteenth notes, light taiko and frame drum, low strings rising.\n'
         'Halfway through, a bright bell accent, then elegant and focused, precise and luxurious.',
         ['guzheng ostinato', 'sixteenth notes', 'light taiko', 'rising strings', 'precise'], ['vocals'], 'medium'),
        ('craft', 10000,
         'The atelier: a refined, steady groove of soft taiko and shakers, a bamboo flute melody, pipa and plucked strings.\n'
         'Elegant, luxurious, crafted; slowly intensifying, a riser at the end, then silence on the final half beat.',
         ['steady elegant groove', 'dizi flute melody', 'pipa', 'soft taiko', 'slowly intensifying', 'riser'], ['vocals'], 'medium'),
        ('sunrise', 6000,
         'A massive impact on the first beat: the sun rises. Huge taiko and full orchestra, soaring strings and brass.\n'
         'Guzheng glissandi over a driving taiko groove, majestic and triumphant, cinematic and grand.',
         ['massive impact', 'big taiko', 'soaring strings', 'guzheng glissando', 'majestic', 'triumphant'], ['vocals', 'EDM drop', 'dubstep'], 'medium'),
        ('ascent', 3000,
         'Everything gathers: a rising orchestral crescendo, accelerating taiko roll and swelling strings, tension climbing.',
         ['orchestral crescendo', 'taiko roll', 'swelling strings', 'rising tension'], ['vocals', 'silence'], 'medium'),
        ('finale', 7000,
         'The biggest hit of the film on the first beat: a colossal cinematic impact, full orchestra and taiko together.\n'
         'Then a majestic, sustained resolution: warm brass and strings, bianzhong bells, a final shimmering ring-out.',
         ['colossal impact', 'majestic resolution', 'warm brass and strings', 'bianzhong bells', 'shimmering ring out'], ['vocals', 'drum loop'], 'medium'),
    ]

if a.variant == 'b':
    SECTIONS = [list(x) for x in SECTIONS]
    SECTIONS[0][2] = ('Near silence in drifting cloud: soft wind, airy string harmonics far away.\n'
                      'A single guzheng harmonic rings out and fades. No drums, no bass. Very quiet, hushed, suspended.')
    SECTIONS[1][2] = ('On the first beat a deep soft boom and a bright bell: the moon appears.\n'
                      'A warm wide string chord blooms; a gentle low pulse starts on each downbeat. Luminous, noble.')
    SECTIONS[3][2] = ('Craft and build: bamboo flute melody, staccato strings, taiko accents, pipa tremolo, rising tension.\n'
                      'A riser climbs to a peak, then the whole orchestra cuts to complete silence for the final half beat.')
    SECTIONS[4][2] = ('A massive impact on the very first beat: huge taiko and full orchestra hit together, then soaring strings.\n'
                      'Guzheng glissandi, driving taiko groove, majestic and triumphant. Luxurious, cinematic, powerful.')
    SECTIONS[5][2] = ('Resolution: the drums stop, a sustained warm chord with bianzhong bells and a graceful guzheng phrase.\n'
                      'At the start of the final bar, one single deep cinematic impact, then a long shimmering ring-out.')
    SECTIONS = [tuple(x) for x in SECTIONS]

chunks = []
for n, ms, text, *_ in SECTIONS:
    for line in text.split('\n'):
        assert len(line) <= 200, f'{n}: a line of {len(line)} chars (the API allows 200)'
for i, (n, ms, text, p, q, adh) in enumerate(SECTIONS):
    # chunk 1 sets the genre for the whole song, so it must also say "no drums" for its own bars
    pos = GENRE + p if i == 0 else ['instrumental', '120 BPM', 'modern Chinese orchestral hybrid'] + p
    chunks.append({'text': text, 'duration_ms': ms, 'positive_styles': pos,
                   'negative_styles': (NEG_ALL if i == 0 else ['vocals', 'singing', 'lyrics', 'choir']) + q,
                   'context_adherence': adh})
plan = {'chunks': chunks}
body = {'composition_plan': plan, 'model_id': a.model}
if a.seed is not None:
    body['seed'] = a.seed
req = urllib.request.Request('https://api.elevenlabs.io/v1/music?output_format=mp3_48000_192',
                             data=json.dumps(body).encode(), headers={'xi-api-key': api_key(), 'Content-Type': 'application/json'})
try:
    r = urllib.request.urlopen(req, timeout=900)
except urllib.error.HTTPError as e:
    sys.exit(f'HTTP {e.code} {e.read()[:600]}')
os.makedirs(OUT, exist_ok=True)
audio = r.read()
with open(os.path.join(OUT, f'{a.name}.mp3'), 'wb') as f:
    f.write(audio)
meta = {'name': a.name, 'model': a.model, 'seed': a.seed, 'song_id': r.headers.get('song-id'),
        'total_ms': sum(c['duration_ms'] for c in plan['chunks']), 'plan': plan}
with open(os.path.join(OUT, f'{a.name}.json'), 'w') as f:
    json.dump(meta, f, indent=1, ensure_ascii=False)
print(f'{a.name}: {len(audio) / 1e6:.2f} MB · song {meta["song_id"]} · planned {meta["total_ms"] / 1000:.1f}s · {a.model}')
