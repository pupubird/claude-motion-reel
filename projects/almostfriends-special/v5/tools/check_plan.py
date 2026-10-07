# Validate a music_v2 / music_v2_5 composition plan against the documented limits before spending credits.
#   python3 -I tools/check_plan.py plan.json [--offset-ms -2000] [--bar-ms 2000] [--film-ms 60000]
# Limits (ElevenLabs API reference + OpenAPI, read 2026-10-07): <=30 chunks; text <=6132 chars, <=30 lines of
# <=200 chars, section name 1-100 chars; duration 3000-120000 ms; <=50 positive / <=50 negative styles.
# House rules (reels 04-05): chunk boundaries on the bar grid; first chunk carries >=7 styles; no artist names.
import json, re, sys, argparse

ap = argparse.ArgumentParser()
ap.add_argument('plan')
ap.add_argument('--offset-ms', type=int, default=-2000, help='film time of the plan start (pre-roll is negative)')
ap.add_argument('--bar-ms', type=int, default=2000)
ap.add_argument('--film-ms', type=int, default=60000)
a = ap.parse_args()

BANNED = ['jungle', 'kaytranada', 'daft punk', 'purple disco', 'nile rodgers', 'chic', 'phoenix', 'apple', 'duolingo']
plan = json.load(open(a.plan))
chunks = plan['chunks']
errors = []
if not 1 <= len(chunks) <= 30:
    errors.append(f'{len(chunks)} chunks (1-30 allowed)')
t = a.offset_ms
print(f'{"#":>2} {"film start":>10} {"film end":>8} {"ms":>6} {"bars":>4}  section')
for i, c in enumerate(chunks, 1):
    if 'song_id' in c:            # an audio reference chunk (inpainting)
        dur = c['range']['end_ms'] - c['range']['start_ms']
        name = f'(audio ref {c["song_id"]})'
    else:
        dur = c['duration_ms']
        text = c['text']
        lines = text.split('\n')
        m = re.match(r'\[([^\]]*)\]', text)
        name = m.group(1) if m else '(no section name)'
        if m and not 1 <= len(m.group(1)) <= 100:
            errors.append(f'chunk {i}: section name length {len(m.group(1))}')
        if len(text) > 6132:
            errors.append(f'chunk {i}: text {len(text)} chars > 6132')
        if len(lines) > 30:
            errors.append(f'chunk {i}: {len(lines)} lines > 30')
        for ln in lines:
            if len(ln) > 200:
                errors.append(f'chunk {i}: a line of {len(ln)} chars > 200')
        if not 3000 <= dur <= 120000:
            errors.append(f'chunk {i}: duration {dur} ms outside 3000-120000')
        for key in ('positive_styles', 'negative_styles'):
            if len(c.get(key, [])) > 50:
                errors.append(f'chunk {i}: {len(c[key])} {key} > 50')
        if c.get('context_adherence', 'high') not in ('low', 'medium', 'high'):
            errors.append(f'chunk {i}: bad context_adherence')
        blob = (text + ' ' + ' '.join(c.get('positive_styles', []) + c.get('negative_styles', []))).lower()
        for b in BANNED:
            if re.search(r'\b' + re.escape(b) + r'\b', blob):
                errors.append(f'chunk {i}: names "{b}" (artist/brand names are rejected as copyrighted)')
        if i == 1 and len(c['positive_styles']) < 7:
            errors.append('chunk 1: fewer than 7 positive styles (the docs: first chunk sets the genre)')
    if (t - a.offset_ms) % a.bar_ms or dur % a.bar_ms:
        errors.append(f'chunk {i}: boundary off the {a.bar_ms} ms bar grid')
    print(f'{i:>2} {t / 1000:>9.1f}s {(t + dur) / 1000:>7.1f}s {dur:>6} {dur / a.bar_ms:>4.0f}  {name}')
    t += dur
total = t - a.offset_ms
print(f'total {total / 1000:.1f} s generated; film {a.film_ms / 1000:.0f} s from film 0 to {(t) / 1000:.1f} s')
if not 3000 <= total <= 600000:
    errors.append(f'total {total} ms outside 3000-600000')
if t < a.film_ms:
    errors.append(f'plan ends at {t} ms, before the film ends ({a.film_ms} ms)')
print('PASS' if not errors else 'FAIL\n  ' + '\n  '.join(errors))
sys.exit(1 if errors else 0)
