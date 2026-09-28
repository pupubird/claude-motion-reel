# Audio gate: per-bar RMS (catches silent or crushed sections numerically) + integrated loudness.
#   python3 tools/check_audio.py out/soundtrack.wav
import sys, wave, subprocess, re
import numpy as np
BPM, BARS = 128, 16
path = sys.argv[1] if len(sys.argv) > 1 else 'out/soundtrack.wav'
w = wave.open(path)
sr, n, ch = w.getframerate(), w.getnframes(), w.getnchannels()
x = np.frombuffer(w.readframes(n), dtype=np.int16).reshape(-1, ch).astype(np.float64) / 32768
mono = x.mean(axis=1)
bar = 60 / BPM * 4
fails = []
print('bar   t(s)   rms dBFS  peak dBFS')
for b in range(BARS):
    seg = mono[int(b * bar * sr):int((b + 1) * bar * sr)]
    rms = 20 * np.log10(np.sqrt(np.mean(seg ** 2)) + 1e-12)
    pk = 20 * np.log10(np.max(np.abs(seg)) + 1e-12)
    flag = '  <-- quiet' if rms < -32 else ''
    if flag: fails.append(b + 1)
    print(f'{b + 1:>3}  {b * bar:5.2f}   {rms:7.1f}   {pk:7.1f}{flag}')
r = subprocess.run(['ffmpeg', '-hide_banner', '-nostats', '-i', path, '-af', 'ebur128=peak=true', '-f', 'null', '-'], capture_output=True, text=True).stderr
I = re.findall(r'I:\s+(-?[\d.]+) LUFS', r)[-1]
P = re.findall(r'Peak:\s+(-?[\d.]+) dBFS', r)[-1]
print(f'integrated {I} LUFS · true peak {P} dBFS')
ok = -15.5 <= float(I) <= -11.5 and float(P) <= -0.5 and not fails
print('AUDIO GATE', 'PASS' if ok else f'FAIL (quiet bars {fails})')
sys.exit(0 if ok else 1)
