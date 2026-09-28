# Measure voice takes: Scribe word timings on the real audio (key from the macOS Keychain, service
# hypit.elevenlabs, character timestamps on), a 60 Hz RMS envelope for the orb, and integrated loudness.
#   python3 projects/novapitch/tools/vo_meta.py answer_a answer_b ...   → assets/vo/meta.json (merged)
import os, sys, json, subprocess, re
import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
VO = os.path.join(HERE, '..', 'assets', 'vo')
names = sys.argv[1:] or ['answer']
key = subprocess.run(['security', 'find-generic-password', '-s', 'hypit.elevenlabs', '-w'], capture_output=True, text=True).stdout.strip()
if not key:
    sys.exit('no Keychain entry hypit.elevenlabs')
path = os.path.join(VO, 'meta.json')
meta = json.load(open(path)) if os.path.exists(path) else {}
for n in names:
    mp3 = os.path.join(VO, f'{n}.mp3')
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', mp3, '-ac', '1', '-ar', '48000', '-f', 'f32le', '-'], capture_output=True).stdout
    x = np.frombuffer(raw, np.float32)
    hop = 800  # 48000 / 60 → one value per video frame
    rms = np.array([np.sqrt(np.mean(x[i:i + hop] ** 2)) for i in range(0, len(x), hop)])
    env = np.clip(rms / (rms.max() + 1e-9), 0, 1)
    r = subprocess.run(['ffmpeg', '-hide_banner', '-nostats', '-i', mp3, '-af', 'ebur128', '-f', 'null', '-'], capture_output=True, text=True).stderr
    lufs = float(re.findall(r'I:\s+(-?[\d.]+) LUFS', r)[-1])
    out = subprocess.run(['curl', '-s', '-X', 'POST', 'https://api.elevenlabs.io/v1/speech-to-text', '-H', f'xi-api-key: {key}',
                          '-F', 'model_id=scribe_v1', '-F', f'file=@{mp3}', '-F', 'timestamps_granularity=character'],
                         capture_output=True, text=True).stdout
    d = json.loads(out)
    words = [{'w': w['text'], 's': round(w['start'], 3), 'e': round(w['end'], 3)} for w in d['words'] if w.get('type') == 'word']
    # speech onset / offset from the envelope (first/last frame above 8 % of peak)
    on = int(np.argmax(env > 0.08)); off = len(env) - int(np.argmax(env[::-1] > 0.08))
    meta[n] = {'dur': round(len(x) / 48000, 3), 'lufs': lufs, 'text': d.get('text'), 'words': words,
               'speech': [round(on / 60, 3), round(off / 60, 3)], 'env': [round(float(v), 3) for v in env]}
    rate = len(words) / max(0.1, words[-1]['e'] - words[0]['s']) * 60 if words else 0
    print(f'{n}: {meta[n]["dur"]}s · {lufs} LUFS · speech {meta[n]["speech"]} · {rate:.0f} wpm')
    print('   ', ' '.join(f'{w["w"]}@{w["s"]:.2f}' for w in words))
json.dump(meta, open(path, 'w'))
