# The sound design: what to generate (SOUNDS) and where each sound sits on the picture (CUES). Times mirror T in
# src/config.js (mix.py asserts they still match). Every cue is tied to something the picture does at that instant.
import re, os

HERE = os.path.dirname(os.path.abspath(__file__))
_cfg = open(os.path.join(HERE, '..', 'src', 'config.js')).read()
def _t(name):
    m = re.search(rf'\b{name}: bar\((\d+)(?:, (\d+(?:\.\d+)?))?\)', _cfg)
    if not m:
        raise SystemExit(f'cues.py: T.{name} not found in src/config.js')
    return (int(m.group(1)) - 1) * 2.0 + (float(m.group(2)) if m.group(2) else 0.0) * 0.5
T = {k: _t(k) for k in ['part', 'moon', 'reveal', 'dive', 'select', 'fall', 'one', 'design', 'carve', 'set', 'drop', 'gather', 'burst', 'word', 'tag']}

SOUNDS = {
    'air':      {'dur': 6.0, 'text': 'Soft airy wind high above the clouds at dawn, gentle and ethereal, very calm, no birds.', 'influence': 0.5},
    'part':     {'dur': 2.2, 'text': 'A magical shimmering reveal swell, airy whoosh opening with rising glass harmonics.', 'influence': 0.6},
    'chime':    {'dur': 3.0, 'text': 'A single pure crystal chime, like a jade bell struck once, clear tone with a long gentle tail.', 'influence': 0.7},
    'twinkle':  {'dur': 1.6, 'text': 'Delicate diamond sparkle twinkles, tiny high crystalline glints in a quick cascade.', 'influence': 0.7},
    'dive':     {'dur': 1.4, 'text': 'Fast smooth whoosh of a camera rushing forward through a ring, rising airy swoosh.', 'influence': 0.6},
    'swirl':    {'dur': 2.0, 'text': 'Many small polished stones swirling around in the air, soft whooshing vortex with light glassy clinks.', 'influence': 0.55},
    'fall':     {'dur': 1.4, 'text': 'A cascade of small smooth stones falling away and receding downward, soft tinkling.', 'influence': 0.55},
    'hit':      {'dur': 2.2, 'text': 'Deep warm cinematic impact with a bright metallic golden shimmer tail, elegant luxury logo hit.', 'influence': 0.65},
    'brush':    {'dur': 1.6, 'text': 'Calligraphy brush strokes on rice paper, three quick confident swishes.', 'influence': 0.65},
    'carve':    {'dur': 1.6, 'text': 'Fine chisel carving into hard jade stone, crisp scraping strokes with tiny chips falling.', 'influence': 0.65},
    'rain':     {'dur': 1.6, 'text': 'Tiny diamonds raining onto a polished gold plate, a cascade of delicate crystalline clicks settling.', 'influence': 0.65},
    'gild':     {'dur': 1.4, 'text': 'Molten gold flowing into fine grooves, a soft warm liquid metallic shimmer gliding downward, luxurious and smooth.', 'influence': 0.6},
    'riser':    {'dur': 1.0, 'text': 'Short fast cinematic riser whoosh building tension, cutting off sharply at the end.', 'influence': 0.6},
    'boom':     {'dur': 3.0, 'text': 'Huge cinematic boom impact with a warm brass-like swell and bright shimmer, a sunrise moment.', 'influence': 0.6},
    'swipe':    {'dur': 0.7, 'text': 'A short clean whoosh swipe for a fast camera cut, smooth and airy.', 'influence': 0.6},
    'bangle':   {'dur': 1.6, 'text': 'A jade bangle spinning and gently ringing, clear resonant musical stone ring.', 'influence': 0.7},
    'reveal':   {'dur': 1.8, 'text': 'A wide airy whoosh revealing a vast view, soft and majestic.', 'influence': 0.55},
    'flare':    {'dur': 1.0, 'text': 'A bright rising shimmer swell into white light, airy and luminous.', 'influence': 0.6},
    'gather':   {'dur': 1.8, 'text': 'Magical golden particles swirling and gathering together, soft sparkling shimmer converging.', 'influence': 0.6},
    'gleam':    {'dur': 1.2, 'text': 'A soft metallic gleam sweeping across gold foil, subtle shimmering glint.', 'influence': 0.6},
    'seal':     {'dur': 1.2, 'text': 'A heavy stone seal stamped firmly onto paper on a wooden desk, one solid deep thud.', 'influence': 0.7},
    'orbit':    {'dur': 3.2, 'text': 'An accelerating swirling whoosh, objects circling faster and faster, rising in pitch, building tension.', 'influence': 0.6},
    'burst':    {'dur': 4.0, 'text': 'A colossal cinematic impact and bright explosion of light, deep sub boom with a long golden shimmering tail.', 'influence': 0.6},
    'forge':    {'dur': 1.8, 'text': 'Magical molten gold forming and cooling, a rich metallic shimmer with a soft resonant ring.', 'influence': 0.6},
    'letters':  {'dur': 1.4, 'text': 'Three soft quick metallic whooshes, each ending in a gentle gold click, letters landing.', 'influence': 0.6},
    'tagshine': {'dur': 1.4, 'text': 'A delicate cascade of tiny crystal chimes, rising softly, elegant and light.', 'influence': 0.65},
    'assemble': {'dur': 1.2, 'text': 'Precise tiny metallic clicks and snaps of jewellery parts fitting together, quick sequence, crisp.', 'influence': 0.65},
}

# (sound, start s, gain dB, fade-in s, fade-out s, offset into the file s)
CUES = [
    ('air', 0.0, -15, 0.2, 1.6, 0.0),
    ('reveal', 0.0, -12, 0.05, 0.6, 0.0),                     # the flight over the cloud sea: a wide airy rush
    ('part', T['part'] - 0.7, -17, 0.2, 0.6, 0.0),
    ('chime', T['moon'], -9, 0.0, 1.0, 0.0),
    ('twinkle', T['reveal'] + 0.1, -10, 0.0, 0.4, 0.0),
    ('dive', T['select'] - 1.1, -17, 0.2, 0.3, 0.0),
    ('swirl', T['select'] - 0.1, -15, 0.15, 0.5, 0.0),
    ('fall', T['fall'], -11, 0.05, 0.4, 0.0),
    ('hit', T['one'] + 0.3, -15, 0.0, 0.8, 0.0),
    ('assemble', T['design'] + 1.0, -3, 0.0, 0.3, 0.0),     # the ring's parts seat
    ('brush', T['design'] + 1.55, -15, 0.0, 0.3, 0.0),       # 设计's strokes land on the wall
    ('carve', T['carve'] + 0.1, -6, 0.0, 0.5, 0.0),
    ('gild', T['carve'] + 1.4, -15, 0.05, 0.5, 0.0),         # 描金: the gold runs down the strokes
    ('rain', T['set'] + 0.15, -5, 0.0, 0.3, 0.0),
    ('riser', T['drop'] - 1.0, -12, 0.3, 0.0, 0.0),
    ('boom', T['drop'], -12, 0.0, 1.2, 0.0),
    ('swipe', 25.5 - 0.18, -13, 0.0, 0.15, 0.0),
    ('swipe', 26.5 - 0.18, -13, 0.0, 0.15, 0.0),
    ('swipe', 27.0 - 0.18, -12, 0.0, 0.15, 0.0),
    ('bangle', 27.5, -8, 0.0, 0.5, 0.0),
    ('reveal', 28.4, -14, 0.1, 0.5, 0.0),
    ('orbit', T['gather'], -12, 0.4, 0.1, 0.0),              # the ring turns faster and gathers
    ('burst', T['burst'] - 0.02, -6, 0.0, 1.5, 0.0),          # the light bursts: the biggest hit
    ('forge', T['burst'] + 0.1, -8, 0.0, 0.6, 0.0),          # the phoenix in molten gold, cooling
    ('letters', T['word'], -13, 0.0, 0.4, 0.0),
    ('tagshine', T['tag'], -2, 0.0, 0.5, 0.0),
    ('gleam', T['tag'] + 1.4, -6, 0.0, 0.4, 0.0),            # the last light across the gold
    ('chime', 38.2, -7, 0.0, 1.0, 0.0),                       # the jade bell rings the film out, as the score falls away
]
