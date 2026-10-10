# Act E (film bars 16–17, frames 1815–2056): it takes two yeses.
# Rings of light draw themselves around you both: "It takes two yeses." Your ring clicks open on
# the beat and your light warms. Then the wait: the music drops to a held note, the evening goes
# blue, and the camera creeps toward her closed ring while her light breathes.
import bpy, math
from mathutils import Vector
from afx import *

F0 = round(bar(16)); F1 = round(bar(18))
R = range(F0 - 2, F1 + 2)
F_TEXT = round(beat(61)); F_RINGS = round(beat(61)) + 4
F_YOU_OPEN = round(beat(62))
F_WAIT = round(bar(17))
RING_GAP = 0.035          # the closed ring's small gap at the top (fraction of the circle)

def ring(name, centre, radius):
    """A ring of light around an avatar, drawn as an open curve whose gap sits at the top."""
    n = 48; pts = []
    for i in range(n + 1):
        a = math.pi / 2 + 2 * math.pi * (RING_GAP / 2 + (1 - RING_GAP) * i / n)
        pts.append((centre.x + radius * math.cos(a), centre.y - 0.02, centre.z + radius * math.sin(a)))
    return light_curve(name, pts, 0.005, '#ffb83d', 5.0)

def build(ctx):
    you, yv, them, tv = ctx['you'], ctx['you_v'], ctx['them'], ctx['them_v']
    P = ctx['meet']; YE, HE = ctx['you_end_c'], ctx['her_end_c']
    # the sky: holding the blue evening that act D ended on
    ev = {'golden': 1.0, 'strength': 1.15, 'light': 1.05, 'rot': rot_for_sun(320.0)}
    deep = {'shade': 1.0, 'strength': 1.0, 'light': 0.85, 'rot': rot_for_sun(340.0)}
    key_sky(ctx['sky'], range(F0, F1), lambda f: blend(ev, deep, ease_in_out_sine((f - F0) / 100)))
    set_visible(ctx['day_sun'], F0 + 2, False)
    # you both hold still now; her light breathes in the wait
    for f in R:
        t = f / FPS
        you.location = (YE.x, YE.y, YE.z + 0.010 * math.sin(1.1 * t)); you.keyframe_insert('location', frame=f)
        them.location = (HE.x, HE.y, HE.z + 0.006 * math.sin(1.1 * t + 2.1)); them.keyframe_insert('location', frame=f)
    keyed_value(yv['glow'], lambda f: 1.4 + 1.6 * pulse(f, F_YOU_OPEN, 3, 24) + 0.35 * ease_out_cubic((f - F_YOU_OPEN) / 30), R)
    keyed_value(tv['glow'], lambda f: 1.3 + (0.35 * (0.5 - 0.5 * math.cos(2 * math.pi * (f - F_WAIT) / 64)) if f >= F_WAIT else 0.0), R)

    # 4 · It takes two yeses.
    four = numeral('Num4', '4', tuple(P + Vector((0.0, -0.05, 1.0))), size=0.40)
    slam_numeral(four, F0 + 6, F_WAIT + 4, tuple(P + Vector((0.0, -0.05, 1.0))), kick_dir=-1)
    ty = kinetic('TwoYes', 'twoyes', P + Vector((0.0, -0.05, 0.60)), scale=0.85)
    animate_kinetic(ty, F_TEXT - 18, F_WAIT + 26, style='slam', stagger=6, exit='whip', seed=14, by='word')
    ctx.setdefault('titles', []).append(dict(name='Four', objs=[four, ty['root']], point=P + Vector((0.0, -0.05, 1.0)),
        f_ref=F0 + 40, ndc=(0.5, 0.80), follow=0.7, f_in=F0 - 14, f_out=F_WAIT + 46))

    # the rings
    rad = 0.16 * 1.22 + 0.045
    rings = {}
    for who, centre in (('you', YE), ('her', HE)):
        r = ring(f'Lock_{who}', centre, rad)
        rings[who] = r
        f_open = F_YOU_OPEN if who == 'you' else F1     # hers opens on act F's downbeat
        for f in range(F0 - 2, F1 + 40):
            draw = ease_out_cubic((f - F_RINGS) / 22)
            if f < f_open:
                st, en = 0.0, draw
            else:
                o = ease_out_expo((f - f_open) / 12)
                st, en = 0.0 + 0.10 * o, 1.0 - 0.10 * o
            r.data.bevel_factor_start = clamp01(st); r.data.bevel_factor_end = clamp01(max(st + 0.001, en))
            r.data.keyframe_insert('bevel_factor_start', frame=f); r.data.keyframe_insert('bevel_factor_end', frame=f)
        em = emission_node(r.data.materials[0])
        keyed(em.inputs['Strength'], 'default_value',
              lambda f, f_open=f_open: 4.0 + 18.0 * pulse(f, f_open, 2, 18) - (2.5 * ease_out_cubic((f - f_open - 20) / 30) if f > f_open + 20 else 0.0),
              range(F0 - 2, F1 + 60))
        em.inputs['Color'].default_value = rgba('#ffb83d')
        set_visible(r, 0, False); set_visible(r, F_RINGS, True)
    ctx['rings'] = rings

def cam(f, ctx, prev):
    """Hold, then creep toward her during the wait (the slow push the owner loved on v1)."""
    (px, py, pz), (prx, pry, prz), pfoc, pfs = prev
    HE = ctx['her_end_c']; P = ctx['meet']
    start = Vector((px, py, pz))
    end = HE + Vector((0.02, -0.62, 0.02))
    u = ease_in_out_sine((f - (F_WAIT - 30)) / (F1 - F_WAIT + 30)) if f >= F_WAIT - 30 else 0.0
    pos = start.lerp(end, u * 0.85)
    tgt = (P + Vector((0, 0, 0.30))).lerp(HE, ease_in_out_sine((f - F_WAIT + 30) / 80))
    look = (tgt - pos).normalized()
    yaw = math.degrees(math.atan2(-look.x, look.y)); pitch = 90 + math.degrees(math.asin(max(-1, min(1, look.z))))
    return tuple(pos), (math.radians(pitch), 0.0, math.radians(yaw)), (tgt - pos).length, 2.4
