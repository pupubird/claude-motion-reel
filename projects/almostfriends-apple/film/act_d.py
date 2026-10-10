# Act D (film bars 12–15, frames 1331–1815): three days, anonymous.
# The frame locks on the two of you and the world turns around you: "No names. No photos.
# Just talk." Then three days pass in time-lapse, the sun arcing over and setting three times, light
# sweeping across the glass. Each day one message arcs out of its sender as a glass bubble and
# stacks into a thread above you: hers frosted white, yours warm amber. A counter marks the days.
import bpy, math
from mathutils import Vector
from afx import *

F0 = round(bar(12)); F1 = round(bar(16))
R = range(F0 - 2, F1 + 2)
DAYS = [round(bar(13)), round(bar(14)), round(bar(15))]
F_NONAMES = round(bar(12)) + 14
MSGS = [  # (key, from, day index, frame it is sent)
    ('msg1', 'her', 0, DAYS[0] + 14),
    ('msg2', 'you', 1, DAYS[1] + 14),
    ('msg3', 'her', 2, DAYS[2] + 14),
]
MSG_SCALE = 2.0

AZ_D0 = -100.0          # act C ends with the sun at this azimuth; the days turn on from here
def sky_for(f):
    """Three time-lapse days on the real skies. The sky keeps turning one way (clouds sweep through the
    frame) and each day hands to the next through a brief pink dawn: no snaps, no night."""
    seq = [('dawn', 0.0), ('sunrise', 0.08), ('morning', 0.20), ('sunny', 0.36), ('sunny2', 0.52), ('golden', 0.68), ('sunset', 0.84), ('dawn', 1.0)]
    span = DAYS[1] - DAYS[0]
    t_total = (f - DAYS[0]) / span                      # days elapsed since the first dawn
    base = {'strength': 1.15, 'light': 1.05, 'rot': rot_for_sun(AZ_D0 + 140.0 * max(0.0, t_total))}
    if f < DAYS[0]:                                     # act C's sunny sky easing toward the first dawn
        u = ease_in_out_sine((f - (DAYS[0] - 60)) / 60)
        d = dict(base); d['rot'] = rot_for_sun(AZ_D0); d['sunny'] = 1 - u; d['dawn'] = u
        return d
    k = min(len(DAYS) - 1, int(t_total)); u = t_total - k
    last = k == len(DAYS) - 1
    steps = seq if not last else seq[:-2] + [('golden', 1.0)]
    for (ka, ua), (kb, ub) in zip(steps, steps[1:]):
        if ua <= u <= ub:
            s_ = ease_in_out_sine((u - ua) / (ub - ua))
            d = dict(base); d[ka] = d.get(ka, 0.0) + 1 - s_; d[kb] = d.get(kb, 0.0) + s_
            return d
    d = dict(base); d['golden'] = 1.0
    return d

def build(ctx):
    you, yv, them, tv = ctx['you'], ctx['you_v'], ctx['them'], ctx['them_v']
    P = ctx['meet']; YE, HE = ctx['you_end_c'], ctx['her_end_c']
    key_sky(ctx['sky'], range(F0, F1), sky_for)
    ctx.setdefault('cuts', []).extend([DAYS[1] - 4, DAYS[2] - 4])
    # the sky of people from act C bows out: the story is the two of you now
    for ob in bpy.data.objects:
        if ob.name.startswith('Far') or (ob.name.startswith('N') and ob.name[1:3].isdigit() and not ob.name.endswith('Photo')):
            set_visible(ob, F0 + 30, False)
    # the sun lamp follows the sky's sun, so highlights sweep the glass through each day
    sun = sun_lamp('SunD', 0.0, '#ffd6a8', 3.0)
    set_visible(sun, 0, False); set_visible(sun, DAYS[0], True)
    for f in range(DAYS[0], F1 + 1):
        d = sky_for(f)
        el = d.get('sun_el', -0.3); az = d.get('sun_az', 0.0)
        aim_sun(sun, az, max(el, math.radians(2)), f)
        sun.data.energy = 3.4 * clamp01(math.sin(max(0.0, el)) * 3.0); sun.data.keyframe_insert('energy', frame=f)
    # the two of you hold the centre, breathing; the sender's light flashes as a message leaves
    for f in R:
        t = f / FPS
        you.location = (YE.x, YE.y, YE.z + 0.012 * math.sin(1.1 * t)); you.keyframe_insert('location', frame=f)
        them.location = (HE.x, HE.y, HE.z + 0.012 * math.sin(1.1 * t + 2.1)); them.keyframe_insert('location', frame=f)
    def glow_for(who):
        sends = [fs for key, w, _, fs in MSGS if w == who]
        return lambda f: 1.4 + sum(2.0 * pulse(f, fs - 4, 4, 18) for fs in sends)
    keyed_value(yv['glow'], glow_for('you'), R)
    keyed_value(tv['glow'], glow_for('her'), R)

    # "You both put Family first." leaves; "No names. No photos. Just talk." arrives
    # ("You both put Family first." scatters away in act C's own keys)
    three = numeral('Num3', '3', tuple(P + Vector((0.0, -0.05, 1.02))), size=0.40)
    slam_numeral(three, F0 + 8, DAYS[0] + 10, tuple(P + Vector((0.0, -0.05, 1.02))), kick_dir=1)
    nn = kinetic('NoNames', 'nonames', P + Vector((0.0, -0.05, 0.58)), scale=0.80)
    animate_kinetic(nn, F0 + 14, DAYS[0] + 14, style='slam', stagger=7, exit='whip', seed=12, by='word')
    # SAME!!  explodes between you as your reply lands on day 2
    F_SAME = MSGS[1][3] + 22
    SAME_AT = P + Vector((0.0, -0.30, 0.30))
    sm = kinetic('Same', 'same', SAME_AT, scale=0.78)
    animate_kinetic(sm, F_SAME, F_SAME + 52, style='slam', stagger=1.5, exit='scatter', seed=13)
    sp = shards('SameSpark', tuple(SAME_AT), 60, F_SAME + 4, speed=(0.6, 1.8), life=(20, 36), size=(0.006, 0.016), tint='#ff6a2b', toward=(0, -1, 0), seed=31, gravity=0.6)
    ctx.setdefault('titles', []).append(dict(name='Same', objs=[sm['root']] + sp, point=SAME_AT, f_ref=F_SAME,
        ndc=(0.5, 0.82), depth=1.25, fit=(KIN['same']['wM'] * 0.78, 0.84), follow=0.6, f_in=F_SAME, f_out=F_SAME + 52))
    ctx['same_frame'] = F_SAME

    # the day counter
    for k, d0 in enumerate(DAYS):
        dp, drv, _ = type_plane(f'Day{k + 1}', f'day{k + 1}', tuple(P + Vector((0.0, 0.05, -0.40))), mode='glow', strength=1.4, scale=1.5)
        # a glossy black glass capsule behind the counter, so it reads on any sky
        cap = rounded_box(f'DayCap{k + 1}', (TYPE[f'day{k + 1}']['wM'] * 1.5 + 0.06, 0.03, 0.105), 0.05, tuple(P + Vector((0.0, 0.075, -0.40))), segments=10)
        cm = bpy.data.materials.new(f'DayCap{k + 1}'); cnt = node_tree(cm)
        pb = N(cnt, 'ShaderNodeBsdfPrincipled'); pb.inputs['Base Color'].default_value = rgba('#0b0b0d'); pb.inputs['Roughness'].default_value = 0.12
        out_surface(cnt, pb.outputs[0]); cap.data.materials.append(cm)
        cap.parent = dp; cap.matrix_parent_inverse = dp.matrix_world.inverted()
        end = DAYS[k + 1] if k + 1 < len(DAYS) else F1 + 10
        keyed_value(drv, lambda f: 1.2, range(F0, F0 + 1))
        base = Vector(dp.location); bs = Vector(dp.scale)
        for f in range(d0 - 2, min(end + 6, F1 + 2)):
            k_ = max(0.001, spring_f(f, d0, 0.45, 0.3)) if f < end - 2 else max(0.001, 1 - ease_in_cubic((f - end + 2) / 6))
            dp.location = tuple(base); dp.scale = (bs.x * k_, bs.y * k_, bs.z)
            dp.keyframe_insert('location', frame=f); dp.keyframe_insert('scale', frame=f)
        set_visible(dp, 0, False); set_visible(dp, d0 - 1, True); set_visible(dp, min(end + 6, F1 + 40), False)

    # the messages: glass bubbles that leave their sender and stack into a thread above you
    bubbles = []
    for i, (key, who, day, fs) in enumerate(MSGS):
        w = TYPE[key]['wM'] * MSG_SCALE + 0.07; h = TYPE[key]['hM'] * MSG_SCALE + 0.05
        rad = min(0.11, h * 0.48)
        b = rounded_box(f'Msg{i}', (w, 0.05, h), rad, (0, 0, 0), segments=12)
        if who == 'her':
            b.data.materials.append(glass(f'Msg{i}', rough=0.26, ior=1.45, tint='#ffffff'))
            card_hex, card_s, mode = '#f3f5ff', 0.95, 'ink'
        else:
            b.data.materials.append(glass(f'Msg{i}', rough=0.24, ior=1.45, tint='#ffd9bd'))
            card_hex, card_s, mode = '#ffc092', 0.95, 'ink'
        card = rounded_box(f'Msg{i}Card', (w * 0.95, 0.014, h * 0.9), rad * 0.92, (0, 0.006, 0))
        card.data.materials.append(emissive(f'Msg{i}Card', card_hex, card_s)); card.parent = b; card.visible_shadow = False
        tx, trv2, _ = type_plane(f'Msg{i}Text', key, (0, -0.0262, 0), mode=mode, strength=1.4, scale=MSG_SCALE); tx.parent = b
        src = YE if who == 'you' else HE
        side = -1 if who == 'you' else 1
        bubbles.append((b, fs, src, side, w, h))
    # stack slots: newest lowest, older ones pushed up; all leave upward at the end
    slot_z = [0.44, 0.76, 1.08]
    F_OUT = round(beat(60)) + 6
    for i, (b, fs, src, side, w, h) in enumerate(bubbles):
        for f in range(F0 - 2, F_OUT + 40):
            # slot height, eased as newer messages arrive
            z = slot_z[0]
            for j in range(i + 1, len(bubbles)):
                fj = bubbles[j][1]
                z += (slot_z[1] - slot_z[0]) * spring_f(f, fj + 4, 0.5, 0.1)
            target = P + Vector((side * 0.09, -0.01, z))
            s = spring_f(f, fs, 0.55, 0.16)
            pos = Vector(src).lerp(target, s)
            # a little arc as it leaves the sender
            pos.z += 0.12 * math.sin(math.pi * clamp01(s)) * (1 - clamp01(s))
            if f >= F_OUT:
                pos.z += 1.4 * ease_in_cubic((f - F_OUT) / 30)
            k = max(0.001, lerp(0.15, 1.0, clamp01(s)))
            b.location = tuple(pos); b.scale = (k, k, k)
            b.keyframe_insert('location', frame=f); b.keyframe_insert('scale', frame=f)
        set_visible(b, 0, False); set_visible(b, fs, True); set_visible(b, F_OUT + 32, False)
    ctx['day_sun'] = sun

def cam(f, ctx, prev):
    """Day 0 frontal; each new day cuts to a fresh angle; SAME!! shakes the frame."""
    (px, py, pz), (prx, pry, prz), pfoc, pfs = prev
    P = ctx['meet']
    u = ease_in_out_sine((f - F0) / (F1 - F0))
    pos = Vector((px, py, pz)).lerp(P + Vector((0.0, -1.32, 0.30)), ease_in_out_cubic((f - F0) / 50))
    pos = pos + Vector((0.0, 0.10 * u, 0.0))
    tgt = P + Vector((0, 0, 0.30))
    if f >= DAYS[1] - 4:      # day 2: low and to the left, looking up into the thread
        u2 = ease_in_out_sine((f - DAYS[1]) / 120)
        pos = P + Vector((-0.42 + 0.12 * u2, -1.18, -0.20))
        tgt = P + Vector((0.02, 0, 0.42))
    if f >= DAYS[2] - 4:      # day 3: high and to the right, the sea below
        u3 = ease_in_out_sine((f - DAYS[2]) / 120)
        pos = P + Vector((0.40 - 0.10 * u3, -1.16, 0.78))
        tgt = P + Vector((0, 0, 0.28))
    fs_ = ctx.get('same_frame', 10 ** 9)
    pos = pos + Vector((kick(f, fs_, 0.03, 11.0, 0.16), 0, kick(f, fs_ + 1, 0.025, 9.0, 0.16)))
    look = (tgt - pos).normalized()
    yaw = math.degrees(math.atan2(-look.x, look.y)); pitch = 90 + math.degrees(math.asin(max(-1, min(1, look.z))))
    return tuple(pos), (math.radians(pitch), 0.0, math.radians(yaw)), (P - pos).length, 2.8
