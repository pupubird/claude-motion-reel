# The score's composition plan, shared by music.py (sends it) and beats.py (checks a take against it).
# 120 BPM, so one bar = 2 s. This is the plan take t6 was composed from (seed 303), for the film's first, 21-bar
# cut; tools/recut.py maps its bars onto the 30-bar cut (assets/music/score-map.json).
BPM = 120
BAR_S = 60 / BPM * 4
# (name, bars, text, positive, negative, adherence)
SECTIONS = [
    ('Void', 3, '[Intro]', ['dark ambient intro', 'deep sub-bass drone only', 'a soft clock-like tick on every beat',
                             'one lonely distant synth pluck', 'vast empty space', 'quiet tension', 'nearly silent by the last beat'],
     ['drums', 'kick drum', 'snare', 'hi-hats', 'percussion groove', 'bass line', 'loud'], 'high'),
    ('Ignition', 2, '[Drop]\n{massive impact hit exactly on the first beat}',
     ['huge cinematic impact on beat one', 'punchy drums enter on beat one', 'pulsing sixteenth-note synth bass',
      'bright shimmering synth swell', 'uplifting burst of energy'], ['fade in', 'quiet start', 'ambient'], 'low'),
    ('It reads', 3, '[Groove]', ['driving four-on-the-floor groove', 'crisp closed hi-hats', 'sparkling synth arpeggio',
                                  'forward momentum', 'clever and precise'], [], 'high'),
    ('One link', 2, '[Build]\n{snare roll accelerating into the next downbeat}',
     ['rising build', 'accelerating snare roll', 'white-noise riser', 'filter sweep opening'], ['breakdown', 'silence'], 'high'),
    ('Conversation', 3, '[Verse]', ['lighter bouncy groove', 'muted plucked synths', 'filtered drums',
                                     'space in the midrange for a speaking voice', 'warm, human, playful'],
     ['loud lead synth', 'busy melody'], 'medium'),
    ('Signal', 3, '[Peak]', ['peak energy', 'full drums with claps', 'big sub bass', 'euphoric wide synth chords',
                              'driving and triumphant'], ['quiet', 'breakdown'], 'medium'),
    ('Breath', 2, '[Breakdown]\n{reverse swell sucking into the next downbeat}',
     ['breakdown', 'all drums drop out', 'warm evolving pads', 'soft reversed swells', 'emotional and hopeful'],
     ['kick drum', 'drums', 'hi-hats', 'snare'], 'low'),
    ('Finale', 4, '[Finale]\n{massive final hit on the first beat, then a long ringing tail}',
     ['massive final impact on beat one', 'triumphant sustained major chord', 'sparkling shimmer', 'gentle pulsing outro',
      'decays to silence by the end'], ['abrupt cut', 'new groove'], 'medium'),
]

def section_bars(bar_map=None):
    """{name: [bars]} (1-indexed). With bar_map (film bar → take bar, from score-map.json) the bars are the film's."""
    take, b = {}, 1
    for name, bars, *_ in SECTIONS:
        take[name] = list(range(b, b + bars))
        b += bars
    if not bar_map:
        return take
    of = {tb: name for name, bs in take.items() for tb in bs}
    film = {name: [] for name in take}
    for fb, tb in enumerate(bar_map, 1):
        film[of[tb]].append(fb)
    return film
