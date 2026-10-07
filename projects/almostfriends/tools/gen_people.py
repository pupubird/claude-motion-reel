# Portraits on Higgsfield (GPT Image 2, 1:1, high): one job per TSV line (key<TAB>prompt), N at a time; skips keys whose
# PNG exists, saves each job's JSON next to it. Needs `higgsfield` logged in.
#   python3 tools/gen_people.py assets/people/raw assets/people/raw/prompts-v6.tsv [--only k1,k2] [--par 6] [--res 1k|2k]
import sys, os, json, subprocess, urllib.request, argparse, time
from concurrent.futures import ThreadPoolExecutor
ap = argparse.ArgumentParser(); ap.add_argument('raw'); ap.add_argument('tsv'); ap.add_argument('--only', default=''); ap.add_argument('--par', type=int, default=6, help='≤ 8: the plan\'s concurrent-job limit, across all batches'); ap.add_argument('--res', default='1k')
a = ap.parse_args()
rows = [l.rstrip('\n').split('\t', 1) for l in open(a.tsv) if l.strip()]
if a.only: rows = [r for r in rows if r[0] in a.only.split(',')]
def gen(row):
    key, prompt = row
    png = os.path.join(a.raw, f'{key}.png')
    if os.path.exists(png) and os.path.getsize(png) > 0: return f'skip {key}'
    # the creator plan runs 8 jobs at once and refuses the rest (rate_limit_reached), and the API sometimes answers 503:
    # both are retried with a backoff (v6 lost 10 portraits to two batches running side by side)
    for attempt in range(5):
        p = subprocess.run(['higgsfield', 'generate', 'create', 'gpt_image_2', '--prompt', prompt, '--aspect_ratio', '1:1',
                            '--resolution', a.res, '--quality', 'high', '--wait', '--wait-timeout', '15m', '--json'], capture_output=True, text=True)
        if p.returncode == 0 or not any(e in p.stdout + p.stderr for e in ('rate_limit_reached', 'HTTP 503')): break
        time.sleep(20 * (attempt + 1))
    open(os.path.join(a.raw, f'{key}.json'), 'w').write(p.stdout)
    if p.returncode != 0: return f'FAIL {key}: {p.stderr.strip()[:200]}'
    try:
        d = json.loads(p.stdout); d = d[0] if isinstance(d, list) else d
        urllib.request.urlretrieve(d['result_url'], png)
        return f'ok {key}'
    except Exception as e:
        return f'FAIL {key}: {e}'
with ThreadPoolExecutor(a.par) as ex:
    for r in ex.map(gen, rows): print(r, flush=True)
print('done')
