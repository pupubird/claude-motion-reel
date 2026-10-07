# Measure what a generated score actually delivered: tuning offset from A=440, key, and tempo.
#   venv/bin/python -I tools/measure_key.py <audio> [<audio> ...]
# Key: Krumhansl-Kessler profiles correlated against the mean CQT chroma (tuning-corrected).
import sys
import numpy as np
import librosa

NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
MAJOR = np.array([6.35, 2.23, 3.48, 2.33, 4.38, 4.09, 2.52, 5.19, 2.39, 3.66, 2.29, 2.88])
MINOR = np.array([6.33, 2.68, 3.52, 5.38, 2.60, 3.53, 2.54, 4.75, 3.98, 2.69, 3.34, 3.17])


def key_of(chroma_mean):
    scores = []
    for tonic in range(12):
        for mode, prof in (('major', MAJOR), ('minor', MINOR)):
            r = np.corrcoef(chroma_mean, np.roll(prof, tonic))[0, 1]
            scores.append((r, f'{NAMES[tonic]} {mode}'))
    scores.sort(reverse=True)
    return scores[:3]


for path in sys.argv[1:]:
    y, sr = librosa.load(path, sr=22050, mono=True)
    tuning = librosa.estimate_tuning(y=y, sr=sr)            # fraction of a semitone (bins_per_octave=12)
    y_h = librosa.effects.harmonic(y)
    chroma = librosa.feature.chroma_cqt(y=y_h, sr=sr, tuning=tuning)
    top = key_of(chroma.mean(axis=1))
    onset = librosa.onset.onset_strength(y=y, sr=sr)
    tempo = librosa.feature.tempo(onset_envelope=onset, sr=sr)[0]
    print(f'{path.split("/")[-1]}: {len(y) / sr:.1f}s | tuning {tuning * 100:+.0f} cents vs A=440 '
          f'(A4 = {440 * 2 ** (tuning / 12):.1f} Hz) | tempo {tempo:.1f} BPM | key '
          + ', '.join(f'{k} r={r:.2f}' for r, k in top))
