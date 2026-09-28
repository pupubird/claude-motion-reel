# Build assets/vo/meta.json from the generated voice lines:
#   words: word timings measured on the actual audio by ElevenLabs Scribe (key from the macOS Keychain,
#          service hypit.elevenlabs) — used to lock kinetic type to the syllable;
#   env:   60 Hz RMS envelope (0–1) — drives the Zembit's eyes while it talks;
#   lufs:  integrated loudness — the mix normalises every line to the same level.
#   python3 tools/vo_meta.py
import os, json, subprocess, re, numpy as np
HERE = os.path.dirname(os.path.abspath(__file__))
VO = os.path.join(HERE, '..', 'assets', 'vo')
NAMES = ['hello', 'fourdays', 'tenbuilders', 'onehouse', 'ship', 'best', 'funding']
key = subprocess.run(['security', 'find-generic-password', '-s', 'hypit.elevenlabs', '-w'], capture_output=True, text=True).stdout.strip()
meta = {}
for n in NAMES:
    mp3 = os.path.join(VO, f'{n}.mp3')
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', mp3, '-ac', '1', '-ar', '48000', '-f', 'f32le', '-'], capture_output=True).stdout
    x = np.frombuffer(raw, np.float32)
    hop = 800  # 48000 / 60
    rms = np.array([np.sqrt(np.mean(x[i:i + hop] ** 2)) for i in range(0, len(x), hop)])
    env = np.clip(rms / (rms.max() + 1e-9), 0, 1)
    r = subprocess.run(['ffmpeg', '-hide_banner', '-nostats', '-i', mp3, '-af', 'ebur128', '-f', 'null', '-'], capture_output=True, text=True).stderr
    lufs = float(re.findall(r'I:\s+(-?[\d.]+) LUFS', r)[-1])
    out = subprocess.run(['curl', '-s', '-X', 'POST', 'https://api.elevenlabs.io/v1/speech-to-text', '-H', f'xi-api-key: {key}',
                          '-F', 'model_id=scribe_v1', '-F', f'file=@{mp3}', '-F', 'timestamps_granularity=word'], capture_output=True, text=True).stdout
    d = json.loads(out)
    words = [{'w': w['text'], 's': round(w['start'], 3), 'e': round(w['end'], 3)} for w in d['words'] if w.get('type') == 'word']
    meta[n] = {'dur': round(len(x) / 48000, 3), 'lufs': lufs, 'words': words, 'env': [round(float(v), 3) for v in env]}
    print(n, meta[n]['dur'], lufs, [(w['w'], w['s']) for w in words])
json.dump(meta, open(os.path.join(VO, 'meta.json'), 'w'))
