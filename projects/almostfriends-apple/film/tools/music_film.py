# The film's music: Sunny Groove from source bar 8 to the end, with the break (film bar 17,
# the wait before the reveal) stripped to strings and the wordless vocal, and every stem back
# on the reveal downbeat (film bar 18).
#
#   python3 projects/almostfriends-apple/film/tools/music_film.py
#
# Writes film/timing.json (film beats/bars in seconds and frames) and audio/edits/film_music.wav.
import os, json, glob, subprocess
import numpy as np, soundfile as sf
import mido
import mido.midifiles.meta as _meta
class _D(dict):
    def __missing__(self, k): return 'C'
_meta._key_signature_decode = _D(_meta._key_signature_decode)   # Suno writes a malformed key signature

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, '..', '..'))
SRC = os.path.join(ROOT, 'audio/suno/sunny-groove')
SR, FPS = 48000, 60
SRC_BAR0 = 8            # film bar 1 = source bar 8 (the build into the first drop)
WAIT_FILM_BAR = 17      # the held breath before the reveal
TAIL_SILENCE = 1.6      # seconds of silence after the track's last ring, under the end card

# beat grid from the MIDI tempo map (Suno writes one tempo event per beat)
m = mido.MidiFile(os.path.join(SRC, 'Sunny Groove (Drums).mid'))
tpb = m.ticks_per_beat
tmap = sorted((t, msg.tempo) for tr in m.tracks for t, msg in
              zip(np.cumsum([x.time for x in tr]), tr) if msg.type == 'set_tempo')
def tick2s(T):
    s, lt, lp = 0.0, 0, 500000
    for t, p in tmap:
        if t >= T: break
        s += (t - lt) * lp / tpb / 1e6; lt, lp = t, p
    return s + (T - lt) * lp / tpb / 1e6
nbeats = int(max(t for t, _ in tmap) / tpb) + 2
src_beats = [tick2s(i * tpb) for i in range(nbeats)]
b0 = (SRC_BAR0 - 1) * 4
t0 = src_beats[b0]

# stems
stems = {}
for f in sorted(glob.glob(os.path.join(SRC, '*.mp3'))):
    name = os.path.basename(f).replace('Sunny Groove (', '').replace(').mp3', '')
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', f, '-ac', '2', '-ar', str(SR), '-f', 'f32le', '-'],
                         capture_output=True, check=True).stdout
    stems[name] = np.frombuffer(raw, np.float32).reshape(-1, 2).astype(np.float64)
n_src = min(len(x) for x in stems.values())
end_src = n_src / SR

# film time = source time - t0
film_beats = [b - t0 for b in src_beats[b0:]]
def film_bar_start(bar): return film_beats[(bar - 1) * 4]   # bar is 1-based
wait0, wait1 = film_bar_start(WAIT_FILM_BAR), film_bar_start(WAIT_FILM_BAR + 1)

KEEP_IN_WAIT = {'Strings': 1.0, 'Vocals': 0.55}
n_film = int((end_src - t0) * SR)
mix = np.zeros((n_film + int(TAIL_SILENCE * SR), 2))
i0, i1 = int(wait0 * SR), int(wait1 * SR)
fade_out = int(0.035 * SR)     # the band leaves quickly at the end of bar 16
for name, x in stems.items():
    seg = x[int(t0 * SR): int(t0 * SR) + n_film].copy()
    g = np.ones(len(seg))
    keep = KEEP_IN_WAIT.get(name, 0.0)
    g[i0:i1] = keep
    if keep < 1.0:
        g[i0 - fade_out:i0] = np.linspace(1.0, keep, fade_out)   # out just before the wait
        # back exactly on the reveal downbeat (i1): no fade-in, the hit is the point
    mix[:len(seg)] += seg * g[:, None]
# frame 0 starts clean on the bar line; the last ring is the track's own tail
fi = int(0.006 * SR); mix[:fi] *= np.linspace(0, 1, fi)[:, None]
peak = np.abs(mix).max(); mix *= 0.89 / peak
os.makedirs(os.path.join(ROOT, 'audio/edits'), exist_ok=True)
sf.write(os.path.join(ROOT, 'audio/edits/film_music.wav'), mix, SR, subtype='PCM_24')

dur = len(mix) / SR
timing = {
    'source': f'Sunny Groove stems, from source bar {SRC_BAR0}; film t = source t - {t0:.4f}',
    'fps': FPS,
    'duration_s': dur,
    'frames': int(round(dur * FPS)),
    'beats_s': film_beats,
    'beats_f': [b * FPS for b in film_beats],
    'bars_s': {str(k + 1): film_beats[k * 4] for k in range(len(film_beats) // 4)},
    'wait_bar': WAIT_FILM_BAR, 'wait_s': [wait0, wait1],
    'reveal_s': wait1,
    'music_end_s': end_src - t0,
}
json.dump(timing, open(os.path.join(ROOT, 'film/timing.json'), 'w'), indent=1)
print(f'film music {dur:.3f} s ({timing["frames"]} frames) | wait {wait0:.3f}-{wait1:.3f} s | reveal {wait1:.3f} s | music ends {end_src - t0:.3f} s')
for k in range(1, 27):
    if str(k) in timing['bars_s']:
        print(f'bar {k:2d} {timing["bars_s"][str(k)]:7.3f} s  f{timing["bars_s"][str(k)] * FPS:7.1f}')
