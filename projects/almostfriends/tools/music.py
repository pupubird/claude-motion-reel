# The score: ElevenLabs Music (music_v2_5) from a 9-chunk composition plan on the film's 30-bar grid, generated from
# −2 s (a one-bar pre-roll that is trimmed) so every hit the picture needs falls on a chunk boundary:
#   4.0 the pop (the drop) · 44.0 the reveal (the second drop) · 50.0 the foam · 56.0 the mark (final hit).
# Plan and wording: research/research-sound.md §4 (sunlit disco-funk with a marimba/vibraphone hook, 120 BPM, A minor,
# the reveal leaning on C major), re-timed to this cut's anchors (src/score.js).
#   python3 projects/<film>/tools/music.py --name t1 --seed 101 [--model music_v2_5] [--dry]
# Writes audio/music/<name>.(wav|mp3) and <name>.json (plan, seed, song id). The key is read from ELEVENLABS_API_KEY or
# the repo-root .env, held in memory, never printed or written anywhere.
import os, sys, json, argparse, subprocess, urllib.request, urllib.error

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, '..', '..', '..'))
OUT = os.path.join(HERE, '..', 'audio', 'music')

def api_key():
    k = os.environ.get('ELEVENLABS_API_KEY')
    if k: return k.strip()
    env = os.path.join(ROOT, '.env')
    if os.path.exists(env):
        for line in open(env):
            if line.startswith('ELEVENLABS_API_KEY='):
                return line.split('=', 1)[1].strip().strip('"').strip("'")
    sys.exit('ELEVENLABS_API_KEY not found (env or repo-root .env)')

NEG1 = ['vocals', 'singing', 'lyrics', 'spoken word', 'choir', 'vocal chops', 'ukulele', 'whistling', 'glockenspiel',
        'corporate stock music', 'cheesy', "children's cartoon", 'romantic ballad', 'sultry saxophone', 'EDM supersaw drop',
        'dubstep', 'trap hi-hats', 'lo-fi hiss', 'key change']
POS1 = ['instrumental', 'sunlit disco-funk', 'modern nu-disco production', '120 BPM', '4/4', 'A minor',
        'tight four-on-the-floor kick', 'crisp off-beat open hi-hats and tambourine sixteenths', 'fingered electric bass with octave runs',
        'Rhodes electric piano', 'clean muted funk guitar chops', 'bright marimba and vibraphone hook', 'lush disco strings',
        'warm analog tape saturation', 'playful, confident, warm', 'low-pass filtered intro', 'great production quality']

# (section, film start s, film end s, text, positive, negative, context adherence)
PLAN = [
    ('Intro', -2, 4,
     '{a filtered, muffled groove, as if heard through a phone speaker in the next room}\n'
     '{a single marimba note repeats on the beat, the same note every time}\n{the filter stays closed; the full band is held back}',
     POS1, NEG1, 'high'),
    ('Hook', 4, 8,
     '{the full band drops in on beat one with a big downbeat hit}\n{a catchy, bouncy marimba and vibraphone hook over the groove}',
     ['instrumental', '120 BPM', 'sunlit disco-funk', 'filter fully open', 'big downbeat on beat one', 'punchy and bright', 'catchy mallet hook', 'driving four-on-the-floor groove'],
     ['vocals', 'lyrics', 'fade in', 'quiet start', 'muffled'], 'low'),
    ('Verse', 8, 16,
     '{the groove thins out: kick, bass, soft Rhodes chords and muted guitar}\n{leave space in the upper mids}',
     ['instrumental', '120 BPM', 'sunlit disco-funk', 'lighter groove', 'sparse and bouncy', 'room for sound effects', 'curious and friendly'],
     ['vocals', 'lyrics', 'busy lead melody', 'loud strings'], 'high'),
    ('Verse 2', 16, 24,
     '{snappy claps join on two and four, string stabs answer the hook}',
     ['instrumental', '120 BPM', 'sunlit disco-funk', 'building energy', 'disco string stabs', 'snare and clap backbeat', 'optimistic'],
     ['vocals', 'lyrics', 'breakdown', 'silence'], 'medium'),
    ('Call and Response', 24, 36,
     '{two lead instruments trade one-bar phrases: muted funk guitar asks, marimba answers}\n'
     '{playful conversation between the two, steady groove underneath, the strings lift for the last bars}',
     ['instrumental', '120 BPM', 'sunlit disco-funk', 'call and response', 'muted funk guitar phrases', 'marimba answers', 'playful and cheeky', 'steady groove'],
     ['vocals', 'lyrics', 'loud strings', 'breakdown'], 'medium'),
    ('Build', 36, 44,
     '{guitar and marimba come together in unison, a snare roll and filter sweep climb for three bars}\n'
     '{then for the final bar the whole band stops: just a soft reversed swell, no drums, no bass}',
     ['instrumental', '120 BPM', 'sunlit disco-funk', 'rising build', 'accelerating snare roll', 'filter sweep opening', 'tension and anticipation', 'sudden stop before the drop'],
     ['vocals', 'lyrics', 'EDM supersaw', 'dubstep'], 'high'),
    ('Drop', 44, 50,
     '{massive hit on beat one: the full band returns, brighter and bigger than before}\n{octave bass, soaring disco strings, mallet hook in octaves}',
     ['instrumental', '120 BPM', 'sunlit disco-funk', 'massive downbeat hit', 'euphoric', 'C major lift', 'soaring disco strings', 'full band at maximum energy', 'joyful'],
     ['vocals', 'lyrics', 'fade in', 'quiet start', 'build', 'key change'], 'low'),
    ('Chorus', 50, 56,
     '{the band hits on beat one and stops for two beats, then the groove kicks straight back in}',
     ['instrumental', '120 BPM', 'sunlit disco-funk', 'stop-time break', 'full groove', 'confident', 'warm and joyful'],
     ['vocals', 'lyrics', 'breakdown', 'key change'], 'medium'),
    ('Outro', 56, 60,
     '{one final full-band hit on beat one, then a ringing major chord with a mallet sparkle that decays to silence}',
     ['instrumental', '120 BPM', 'sunlit disco-funk', 'final hit on beat one', 'ringing chord', 'mallet sparkle', 'decays to silence by the end'],
     ['vocals', 'lyrics', 'new groove', 'drum loop', 'fade in', 'abrupt cut'], 'medium'),
]

# v2 (66 s): the front was re-cut for a zero-context viewer; the back half (build, breath, drop, chorus, outro) the owner
# liked is kept verbatim from take t1 by an audio reference chunk. Chunk 1 is conditioned on t1's hook and verses so the
# new front sounds like the same record. Key: t1 measured A major, so the new chunks ask for A major.
POS1_V2 = [p if p != 'A minor' else 'A major' for p in POS1]
PLAN_V2 = [
    ('Intro', -2, 4,
     '{a filtered, muffled groove, as if heard through a phone speaker in the next room}\n'
     '{light curious plucks on each beat}\n{the filter stays closed; the full band is held back}',
     POS1_V2, NEG1, 'high'),
    ('Hook', 4, 10,
     '{the full band drops in on beat one with a big downbeat hit}\n{a catchy, bouncy marimba and vibraphone hook over the groove}',
     ['instrumental', '120 BPM', 'A major', 'sunlit disco-funk', 'filter fully open', 'big downbeat on beat one', 'punchy and bright', 'catchy mallet hook'],
     ['vocals', 'lyrics', 'fade in', 'quiet start', 'muffled'], 'low'),
    ('Verse', 10, 18,
     '{the groove thins out: kick, bass, soft Rhodes chords and muted guitar}\n{leave space in the upper mids}',
     ['instrumental', '120 BPM', 'A major', 'sunlit disco-funk', 'lighter groove', 'sparse and bouncy', 'room for sound effects', 'curious and friendly'],
     ['vocals', 'lyrics', 'busy lead melody', 'loud strings'], 'high'),
    ('Verse 2', 18, 28,
     '{snappy claps join on two and four, a rising string swell, string stabs answer the hook}',
     ['instrumental', '120 BPM', 'A major', 'sunlit disco-funk', 'building energy', 'disco string stabs', 'snare and clap backbeat', 'optimistic'],
     ['vocals', 'lyrics', 'breakdown', 'silence'], 'medium'),
    ('Call and Response', 28, 42,
     '{two lead instruments trade one-bar phrases: muted funk guitar asks, marimba answers}\n'
     '{playful conversation between the two, steady groove underneath, the strings lift for the last bars}',
     ['instrumental', '120 BPM', 'A major', 'sunlit disco-funk', 'call and response', 'muted funk guitar phrases', 'marimba answers', 'playful and cheeky'],
     ['vocals', 'lyrics', 'loud strings', 'breakdown'], 'high'),
]
T1_SONG = 'BkWoAzuLDmwMkKmVuff6'          # take t1 (stored for inpainting)

def plan_v2():
    chunks = []
    for name, a, b, text, pos, neg, adh in PLAN_V2:
        for line in text.split('\n'):
            assert len(line) <= 200, f'{name}: line over 200 chars'
        chunks.append({'text': f'[{name}]\n{text}', 'duration_ms': int(round((b - a) * 1000)), 'positive_styles': pos,
                       'negative_styles': neg, 'context_adherence': adh})
    chunks[0]['conditioning_ref'] = {'song_id': T1_SONG, 'range': {'start_ms': 6000, 'end_ms': 36000}}
    chunks[0]['condition_strength'] = 'high'
    chunks.append({'song_id': T1_SONG, 'range': {'start_ms': 38000, 'end_ms': 62000}})
    return {'chunks': chunks}

# v3 (owner's note on v2: "the first 3 seconds too low energy, no hook"): the film now opens on a hit on frame 0, so
# the muffled intro goes. Chunk 1 (take 0–6 s = film −2..4) is a one-bar fill into a full-band hit exactly on film 0, a
# bright groove, and a two-beat break (snare roll + riser) into the drop at 4.0. Everything from film 4 s on is take
# v2a itself, kept by an audio reference chunk; chunk 1 is conditioned on v2a's hook and verses so it is the same record.
V2A_SONG = 'HriMgOtUVR0RxCuWUau2'          # take v2a (stored for inpainting)
PLAN_V3 = [
    ('Intro', -2, 4,
     '{bar one: a quick snare and tom fill as a pickup}\n'
     '{bar two, beat one: a huge full-band hit and the groove kicks in at full volume, no stop after the hit}\n'
     '{dense and driving: four-on-the-floor kick, claps on two and four, octave bass, disco string stabs, a plucky marimba hook}\n'
     '{keep the full band playing through the last beat, with a snare roll building into the next downbeat}',
     ['instrumental', 'sunlit disco-funk', 'modern nu-disco production', '120 BPM', '4/4', 'A major',
      'drum fill pickup into a huge downbeat hit', 'loud and dense from the first downbeat', 'maximum energy',
      'continuous groove with no breaks', 'tight four-on-the-floor kick', 'claps on two and four',
      'fingered electric bass with octave runs', 'disco string stabs', 'bright marimba and vibraphone hook',
      'great production quality'],
     NEG1 + ['filtered intro', 'muffled', 'low-pass filter', 'quiet start', 'fade in', 'slow build', 'ambient pad intro',
             'sparse arrangement', 'stop-time break', 'pause after the hit', 'breakdown', 'drop-out'],
     'high'),
]
# takes v3a/v3b used a first wording (a two-beat break before the drop, which neither take played; v3b stopped dead for
# half a second after its first hit); v3c/v3d use the wording above: dense, continuous, no break.

def plan_v3():
    chunks = []
    for name, a, b, text, pos, neg, adh in PLAN_V3:
        for line in text.split('\n'):
            assert len(line) <= 200, f'{name}: line over 200 chars'
        chunks.append({'text': f'[{name}]\n{text}', 'duration_ms': int(round((b - a) * 1000)), 'positive_styles': pos,
                       'negative_styles': neg, 'context_adherence': adh})
    chunks[0]['conditioning_ref'] = {'song_id': V2A_SONG, 'range': {'start_ms': 6000, 'end_ms': 36000}}
    chunks[0]['condition_strength'] = 'high'
    chunks.append({'song_id': V2A_SONG, 'range': {'start_ms': 6000, 'end_ms': 68000}})
    return {'chunks': chunks}

def plan():
    chunks = []
    for name, a, b, text, pos, neg, adh in PLAN:
        for line in text.split('\n'):
            assert len(line) <= 200, f'{name}: line over 200 chars'
        chunks.append({'text': f'[{name}]\n{text}', 'duration_ms': int(round((b - a) * 1000)), 'positive_styles': pos,
                       'negative_styles': neg, 'context_adherence': adh})
    return {'chunks': chunks}

ap = argparse.ArgumentParser()
ap.add_argument('--name', default='t1')
ap.add_argument('--seed', type=int, default=None)
ap.add_argument('--model', default='music_v2_5')
ap.add_argument('--dry', action='store_true', help='write the plan and run the checker; no API call')
ap.add_argument('--plan', default='v3', choices=['v1', 'v2', 'v3'],
                help='v1: the 60 s film; v2: the 66 s re-cut (new front + t1 back half); v3: a new hard-hitting intro + v2a from 4 s')
a = ap.parse_args()

os.makedirs(OUT, exist_ok=True)
P = {'v1': plan, 'v2': plan_v2, 'v3': plan_v3}[a.plan]()
FILM_MS = 60000 if a.plan == 'v1' else 66000
pj = os.path.join(OUT, f'{a.name}.plan.json')
json.dump(P, open(pj, 'w'), indent=1)
chk = subprocess.run([sys.executable, '-I', os.path.join(HERE, 'check_plan.py'), pj, '--offset-ms', '-2000', '--film-ms', str(FILM_MS)], capture_output=True, text=True)
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
    # raw 16-bit little-endian PCM at 48 kHz, no header: decide mono or stereo from the length (the plan is 62 s)
    import wave
    secs_mono = len(data) / (2 * 48000)
    nch = 2 if secs_mono > 1.5 * (FILM_MS / 1000 + 2) else 1
    with wave.open(path, 'wb') as w:
        w.setnchannels(nch); w.setsampwidth(2); w.setframerate(48000); w.writeframes(data)
    print(f'pcm: {secs_mono / nch:.2f} s, {nch} channel(s)')
else:
    open(path, 'wb').write(data)
json.dump({'name': a.name, 'model': a.model, 'seed': a.seed, 'song_id': song, 'format': fmt, 'plan': P}, open(os.path.join(OUT, f'{a.name}.json'), 'w'), indent=1)
print(f'{a.name}: {len(data) / 1e6:.1f} MB {fmt} → {os.path.relpath(path, ROOT)} (song {song})')
