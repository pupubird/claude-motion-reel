# Audio gate: integrated loudness (−14 LUFS ± 0.5), true peak (≤ −1 dBTP), and every bar present (no accidental
# silence: each 2 s bar's RMS within 30 dB of the loudest). Run it on the delivered mp4 as well as the WAV — the AAC
# encode raises the true peak (v4's final failed at −0.9 dBTP from a −1.0 WAV; the mix now masters to −1.5).
#   python3 projects/feiyuehui/v4/tools/check_audio.py projects/feiyuehui/v4/out/feiyuehui-v4.mp4
import sys, subprocess, json, re
import numpy as np
path = sys.argv[1]
out = subprocess.run(['ffmpeg', '-hide_banner', '-nostats', '-i', path, '-af', 'ebur128=peak=true', '-f', 'null', '-'], capture_output=True, text=True).stderr
I = float(re.findall(r'I:\s+(-?[\d.]+) LUFS', out)[-1])
TP = float(re.findall(r'Peak:\s+(-?[\d.]+) dBFS', out)[-1])
raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', path, '-ac', '1', '-ar', '48000', '-f', 'f32le', '-'], capture_output=True).stdout
x = np.frombuffer(raw, np.float32).astype(np.float64)
bars = [20 * np.log10(np.sqrt(np.mean(x[int(b * 2 * 48000):int((b + 1) * 2 * 48000)] ** 2)) + 1e-9) for b in range(int(len(x) / 96000))]
top = max(bars)
quiet = [i + 1 for i, b in enumerate(bars) if b < top - 30]
ok = abs(I + 14) <= 0.5 and TP <= -1.0 + 0.05 and not quiet
print(f'{path}: {len(x) / 48000:.2f} s · {I:.1f} LUFS · true peak {TP:.1f} dBTP · bars ' + ' '.join(f'{b - top:.0f}' for b in bars))
print(f'bars more than 30 dB under the loudest: {quiet or "none"}')
print('AUDIO GATE', 'PASS' if ok else 'FAIL')
sys.exit(0 if ok else 1)
