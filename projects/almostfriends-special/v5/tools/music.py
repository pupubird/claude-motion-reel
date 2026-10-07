# The special edition's score: ElevenLabs Music (music_v2_5) from a 7-chunk composition plan on the film's 22-bar
# grid (120 BPM, 2 s bars), generated from −2 s (a one-bar pickup that is trimmed) so every hit the picture needs sits
# on a chunk boundary:
#   0.0 the first hit (night) · 2.0 the pop (the drop into daylight) · 10.0 the whip into the crowd · 16.0 the chat ·
#   22.0 the breath (near silence while the other one decides) · 28.0 the wall pops (the climax) · 38.0 the mark
#   python3 projects/almostfriends-special/tools/music.py --name s1 --seed 11 [--dry]
# Writes audio/music/<name>.(wav|mp3) and <name>.json (plan, seed, song id). The key is read from ELEVENLABS_API_KEY or
# the repo-root .env, held in memory, never printed or written anywhere.
import os, sys, json, argparse, subprocess, urllib.request, urllib.error

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, '..', '..', '..'))
OUT = os.path.join(HERE, '..', 'audio', 'music')
FILM_MS = 44000

def api_key():
    k = os.environ.get('ELEVENLABS_API_KEY')
    if k: return k.strip()
    env = os.path.join(ROOT, '.env')
    if os.path.exists(env):
        for line in open(env):
            if line.startswith('ELEVENLABS_API_KEY='):
                return line.split('=', 1)[1].strip().strip('"').strip("'")
    sys.exit('ELEVENLABS_API_KEY not found (env or repo-root .env)')

NEG = ['vocals', 'singing', 'lyrics', 'spoken word', 'choir', 'vocal chops', 'cheesy', 'corporate stock music',
       "children's cartoon", 'EDM supersaw drop', 'dubstep', 'trap hi-hats', 'lo-fi hiss', 'key change', 'ukulele',
       'whistling', 'glockenspiel', 'romantic ballad', 'saxophone', 'acoustic guitar strumming']
CORE = ['instrumental', '120 BPM', '4/4', 'D major', 'modern indie electronic', 'premium product launch film score',
        'punchy tight drums', 'deep warm sub bass', 'bubbly glassy synth plucks', 'catchy synth hook',
        'crisp claps and finger snaps', 'big stops and drops', 'great production quality']

# (section, film start s, film end s, text, positive, negative, context adherence)
PLAN = [
    ('Night', -2, 2,
     '{bar one: a soft reversed swell pickup, no drums}\n'
     '{bar two, beat one: one heavy sub-bass hit with a glassy crack on top, then a dark ticking pulse}\n'
     '{mysterious and tense, sparse glassy plucks echoing in a big dark room, a riser climbing into the next downbeat}',
     CORE + ['dark tense intro', 'heavy sub hit on the downbeat', 'ticking pulse', 'rising tension'],
     NEG + ['full groove', 'bright chords', 'fade in'], 'high'),
    ('Drop', 2, 10,
     '{massive bright drop on beat one: the full band at once, euphoric and bouncy}\n'
     '{a catchy bubbly synth hook over punchy drums and a warm bouncing sub bass, claps on two and four}',
     CORE + ['massive downbeat drop', 'euphoric and bouncy', 'bright and warm', 'driving groove'],
     NEG + ['fade in', 'quiet start', 'breakdown'], 'medium'),
    ('Flight', 10, 16,
     '{energy lifts: a fast hypnotic synth arpeggio and filtered sweeps, a sense of flight and speed}\n'
     '{last bar: three staccato full-band stabs on beats one, two and three, then a short silence}',
     CORE + ['driving arpeggio', 'sense of speed', 'filter sweeps', 'staccato stabs at the end'],
     NEG + ['breakdown', 'fade out'], 'medium'),
    ('Chat', 16, 22,
     '{a playful, lighter groove: finger snaps, claps and short plucky phrases answering each other}\n'
     '{leave space in the upper mids for sound effects}',
     CORE + ['playful call and response', 'lighter groove', 'room for sound effects', 'cheeky and warm'],
     NEG + ['loud lead melody', 'breakdown'], 'medium'),
    ('Breath', 22, 28,
     '{the band drops out completely: only a soft heartbeat-like kick and a warm airy pad, near silence}\n'
     '{held breath, suspense; in the last bar a reversed swell rises into the next downbeat}',
     ['instrumental', '120 BPM', 'D major', 'near silence', 'soft heartbeat kick', 'warm airy pad', 'suspense',
      'reversed swell at the end', 'great production quality'],
     NEG + ['drums groove', 'bass line', 'melody', 'loud'], 'high'),
    ('Climax', 28, 38,
     '{the biggest moment of the record: a huge euphoric drop on beat one, full band, hook in octaves}\n'
     '{joyful and celebratory, soaring, punchy drums and a big warm sub bass, glittering plucks on top}',
     CORE + ['huge euphoric drop', 'maximum energy', 'joyful and celebratory', 'soaring hook in octaves'],
     NEG + ['fade in', 'quiet start', 'build', 'breakdown'], 'low'),
    ('Outro', 38, 44,
     '{one final full-band hit on beat one, then a warm ringing major chord with a glassy sparkle that decays to silence}',
     ['instrumental', '120 BPM', 'D major', 'final hit on beat one', 'ringing chord', 'glassy sparkle',
      'decays to silence by the end', 'great production quality'],
     NEG + ['new groove', 'drum loop', 'fade in', 'abrupt cut'], 'medium'),
]

def plan():
    chunks = []
    for name, a, b, text, pos, neg, adh in PLAN:
        for line in text.split('\n'):
            assert len(line) <= 200, f'{name}: line over 200 chars'
        chunks.append({'text': f'[{name}]\n{text}', 'duration_ms': int(round((b - a) * 1000)), 'positive_styles': pos,
                       'negative_styles': neg, 'context_adherence': adh})
    return {'chunks': chunks}

ap = argparse.ArgumentParser()
ap.add_argument('--name', default='s1')
ap.add_argument('--seed', type=int, default=None)
ap.add_argument('--model', default='music_v2_5')
ap.add_argument('--dry', action='store_true', help='write the plan and run the checker; no API call')
a = ap.parse_args()

os.makedirs(OUT, exist_ok=True)
P = plan()
pj = os.path.join(OUT, f'{a.name}.plan.json')
json.dump(P, open(pj, 'w'), indent=1)
chk = subprocess.run([sys.executable, '-I', os.path.join(HERE, 'check_plan.py'), pj, '--offset-ms', '-2000', '--film-ms', str(FILM_MS)],
                     capture_output=True, text=True)
print(chk.stdout.strip())
if chk.returncode != 0: sys.exit('plan check failed: ' + chk.stderr.strip())
if a.dry: sys.exit(0)

body = {'composition_plan': P, 'model_id': a.model, 'store_for_inpainting': True}
if a.seed is not None: body['seed'] = a.seed
for fmt, ext in (('pcm_48000', 'wav'), ('mp3_48000_192', 'mp3')):
    req = urllib.request.Request(f'https://api.elevenlabs.io/v1/music?output_format={fmt}', data=json.dumps(body).encode(),
                                 headers={'xi-api-key': api_key(), 'Content-Type': 'application/json'}, method='POST')
    try:
        with urllib.request.urlopen(req, timeout=600) as r:
            data, song = r.read(), r.headers.get('song-id')
        break
    except urllib.error.HTTPError as e:
        msg = e.read().decode('utf-8', 'replace')[:400]
        if fmt == 'pcm_48000' and e.code in (400, 403, 422):
            print(f'{fmt} refused ({e.code}): {msg[:160]} — falling back to mp3'); continue
        sys.exit(f'HTTP {e.code}: {msg}')
path = os.path.join(OUT, f'{a.name}.{ext}')
if ext == 'wav':
    # raw 16-bit little-endian PCM at 48 kHz, no header: mono or stereo from the length (the plan is 46 s)
    import wave
    secs_mono = len(data) / (2 * 48000)
    nch = 2 if secs_mono > 1.5 * (FILM_MS / 1000 + 2) else 1
    with wave.open(path, 'wb') as w:
        w.setnchannels(nch); w.setsampwidth(2); w.setframerate(48000); w.writeframes(data)
    print(f'pcm: {secs_mono / nch:.2f} s, {nch} channel(s)')
else:
    open(path, 'wb').write(data)
json.dump({'name': a.name, 'model': a.model, 'seed': a.seed, 'song_id': song, 'format': fmt, 'plan': P},
          open(os.path.join(OUT, f'{a.name}.json'), 'w'), indent=1)
print(f'{a.name}: {len(data) / 1e6:.1f} MB {fmt} → {os.path.relpath(path, ROOT)} (song {song})')
