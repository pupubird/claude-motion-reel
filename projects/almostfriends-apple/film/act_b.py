# Act B v4 (film bars 4–7, frames 363–847): 1 · What matters. One continuous camera, no cuts:
#  6.0  whip-in: the 1 slams in; "What matters to you?" flies in letter by letter
#  7.0  the sea lights up from beneath you, a ring of light racing to the horizon
#  8.1  six glass tags burst out of you and click onto a dial around you, upright and readable
#  9.1  the dial turns Family to twelve o'clock; it glides into your ring and fills its first third
# 10.1  Adventure turns to four o'clock and fills the next third
# 11.1  Career, eight o'clock: your ring is complete, your three colours
# 12.1  the tags you didn't pick drift away into the distance
# 13.1  you launch upward; the camera tilts after you into act C
import bpy, math, random
from mathutils import Vector
from afx import *

F0 = round(bar(4)); F1 = round(bar(8))
R = range(F0 - 2, F1 + 2)
C = Vector((0.0, 3.40, 0.10))
DIAL_R, PILL_SCALE = 0.50, 1.60          # the dial of tags round you (in your plane, facing the camera)
R_RING = 0.16 * 1.22 * 1.005              # your bezel's radius once you have grown into act B
F_SEA = round(beat(13)); F_BURST = round(bar(5))
PICKS = [(0, round(beat(18))), (3, round(beat(20))), (1, round(beat(22)))]
F_SHATTER = round(bar(7)); F_LAUNCH = round(beat(26))
FLIGHT = 20
def launch_z(f):
    """Your height above the ring centre during the launch: a 4-frame dip, then a burst that slows into a hover."""
    if f < F_LAUNCH: return 0.0
    if f < F_LAUNCH + 4: return -0.035 * ease_out_cubic((f - F_LAUNCH) / 4)
    return -0.035 + 0.985 * ease_out_quart((f - F_LAUNCH - 4) / (F1 - F_LAUNCH - 4))
PILLS = ['family', 'career', 'health', 'adventure', 'learning', 'money']

def dial_rot(f):
    """The dial's turn (deg, clockwise from twelve as the camera sees it): tag i sits at dial_rot + 60 i.
    Each pick is turned to the start of its third of your ring (twelve, four, eight o'clock) six frames
    before its tap, the short way round, landing with a small detent bounce."""
    want = []
    for k, (idx, ft) in enumerate(PICKS):
        a_ = 120 * k - 60 * idx
        if want: a_ += 360 * round((want[-1] - a_) / 360)
        want.append(a_)
    ang = lerp(want[0] + 90, want[0], spring_f(f, PICKS[0][1] - 34, 0.45, 0.12))
    for k in range(1, len(PICKS)):
        t0 = PICKS[k - 1][1] + 4 + FLIGHT - 2          # the previous tag has just reached your ring
        if f >= t0: ang = lerp(want[k - 1], want[k], spring_f(f, t0, 0.42, 0.12))
    return ang

AZ = [14.0, -12.0, 10.0]          # the camera circles you a little as the dial turns: a new side for each pick
def orbit_az(f):
    a = 0.0
    for k, (idx, ft) in enumerate(PICKS):
        t0 = (PICKS[0][1] - 34) if k == 0 else (PICKS[k - 1][1] + 4 + FLIGHT - 2)
        if f >= t0: a = lerp(AZ[k - 1] if k else 0.0, AZ[k], ease_in_out_cubic((f - t0) / (ft - 6 - t0)))
    if f >= F_SHATTER - 10: a = lerp(AZ[-1], 0.0, ease_in_out_cubic((f - F_SHATTER + 10) / 40))
    return a

def about_c(v, az):
    """v turned by az degrees about the vertical through C."""
    r = math.radians(az); d = Vector(v) - C
    return C + Vector((d.x * math.cos(r) - d.y * math.sin(r), d.x * math.sin(r) + d.y * math.cos(r), d.z))

def dial_pos(f, i):
    th = math.radians(dial_rot(f) + 60 * i)
    return about_c(C + Vector((DIAL_R * math.sin(th), -0.03, DIAL_R * math.cos(th))), orbit_az(f))

def pill(name, hue, key, scale=2.1):
    w = max(0.15, TYPE[key]['wM'] + 0.045)
    body = rounded_box(name, (w, 0.05, 0.064), 0.03, (0, 0, 0))
    body.data.materials.append(glass(name, rough=0.16, ior=1.45, tint='#fbfcff'))
    core = rounded_box(name + 'Core', (w * 0.82, 0.022, 0.038), 0.017, (0, 0, 0))
    cm = emissive(name + 'Core', hue, 3.2); core.data.materials.append(cm); core.visible_shadow = False; core.parent = body
    label, rv, dv = type_plane(name + 'Label', key, (0, -0.0262, 0)); label.parent = body
    body.scale = (scale, scale, scale)
    return body, emission_node(cm)

def build(ctx):
    you, yv, them, tv = ctx['you'], ctx['you_v'], ctx['them'], ctx['them_v']
    # the two separate; Sofia flies off into the world; you take the centre
    for vals in (yv, tv):
        for k in ('lens_glass', 'lens_photo'):
            keyed_value(vals[k], lambda f: 1 - ease_out_cubic((f - F0) / 8), R)
    for f in R:
        t = f / FPS
        s = spring_f(f, F0, 0.6, 0.12)
        p = Vector((-0.105, 3.40, 0.14)).lerp(C, s)
        if f >= F_LAUNCH:
            p = C + Vector((0, 0, launch_z(f)))
        k = lerp(1.0, 1.22, ease_in_out_cubic((f - F0) / 40))
        you.location = (p.x, p.y, p.z + 0.008 * math.sin(1.3 * t)); you.scale = (k, k, k)
        you.keyframe_insert('location', frame=f); you.keyframe_insert('scale', frame=f)
        them.location = tuple(Vector((0.105, 3.445, 0.14)).lerp(Vector((2.6, 10.0, 1.4)), ease_in_cubic((f - F0) / 34)))
        them.keyframe_insert('location', frame=f)
    set_visible(them, 0, True); set_visible(them, F0 + 36, False)
    for key_, K in ctx.get('wm_kin', {}).items():
        pass
    # the sea lights up from under you
    seaob, seav = sea('Sea', reveal=True)
    seav['cx'].outputs[0].default_value = C.x; seav['cy'].outputs[0].default_value = C.y
    keyed_value(seav['front'], lambda f: 0.0 if f < F_SEA else 60.0 * ease_out_cubic((f - F_SEA) / 70) ** 1.6, range(0, F1 + 2, 2))
    set_visible(seaob, 0, False); set_visible(seaob, F_SEA - 1, True)
    visible_between(ctx['backdrop'], 0, F0 + 4)
    for l in ctx['lights_a']: visible_between(l, 0, F0 + 4)
    sun = sun_lamp('SunB', 0.0, '#ffd2a0', 2.0)
    day = {'sunny': 1.0, 'strength': 1.15, 'light': 1.0, 'rot': rot_for_sun(-20.0)}
    gold = {'sunny': 0.55, 'golden': 0.45, 'strength': 1.15, 'light': 1.05, 'rot': rot_for_sun(-35.0)}
    key_sky(ctx['sky'], range(F0, F1), lambda f: blend(day, gold, ease_in_out_sine((f - F0 - 10) / 80)))
    ctx['sky_end_b'] = gold
    pd = bpy.data.lights.new('YouLight', 'POINT'); pd.energy = 0.0; pd.shadow_soft_size = 0.12
    plight = bpy.data.objects.new('YouLight', pd); link(plight); plight.parent = you; no_specular(plight)
    for f in R:
        pd.energy = 0.0; col = srgb('#ffffff')
        for idx, ft in PICKS:
            hit = ft + 4 + FLIGHT
            if f >= hit - 2: pd.energy = 26.0 * math.exp(-(f - hit) / 14.0) + 5.0; col = srgb(HUES[PILLS[idx]])
        pd.color = col; pd.keyframe_insert('energy', frame=f); pd.keyframe_insert('color', frame=f)
    levels = [0.7, 1.0, 1.3, 1.7]; tints = [0.2, 0.5, 0.8, 1.1]
    def glow_at(f):
        g = lerp(1.0, levels[0], ease_out_cubic((f - F0) / 30))
        for k, (_, ft) in enumerate(PICKS):
            hit = ft + 4 + FLIGHT
            if f >= hit: g = levels[k + 1] + 1.8 * math.exp(-(f - hit) / 7.0)
        return g
    def tint_at(f):
        t_ = lerp(1.0, tints[0], ease_out_cubic((f - F0) / 30))
        for k, (_, ft) in enumerate(PICKS):
            hit = ft + 4 + FLIGHT
            if f >= hit: t_ = lerp(tints[k], tints[k + 1], ease_out_cubic((f - hit) / 12))
        return t_
    keyed_value(yv['glow'], glow_at, R); keyed_value(yv['tint'], tint_at, R)

    # 1 · What matters to you?
    one = numeral('Num1', '1', (0.0, C.y - 0.40, 0.86), size=0.46)
    slam_numeral(one, F0 + 6, F_BURST - 8, (0.0, C.y - 0.40, 0.86), kick_dir=1)
    q = kinetic('Matters', 'matters', C + Vector((0.0, -0.40, 0.50)), scale=0.84)
    animate_kinetic(q, F0 + 14, F_SHATTER - 2, style='fly', stagger=2.5, exit='whip', seed=4)
    q0, q1 = Vector(q['root'].location), C + Vector((0.0, -0.10, 0.85))
    for f in range(F_BURST - 14, F_SHATTER + 42):                      # it turns with the camera, so the line stays level
        u = ease_in_out_cubic((f - F_BURST + 14) / 30)
        q['root'].location = tuple(about_c(q0.lerp(q1, u), orbit_az(f))); q['root'].scale = (lerp(1.0, 1.25, u),) * 3
        q['root'].rotation_euler = (0, 0, math.radians(orbit_az(f)))
        for pth in ('location', 'scale', 'rotation_euler'): q['root'].keyframe_insert(pth, frame=f)

    # six tags burst out of you and click onto the dial round you
    pills = []
    for i, p in enumerate(PILLS):
        body, core_em = pill(f'Pill_{p}', HUES[p], 'pill_' + p, scale=PILL_SCALE)
        pills.append((i, p, body, core_em))
    picked = {i: (k, ft) for k, (i, ft) in enumerate(PICKS)}
    unpicked = [i for i in range(len(PILLS)) if i not in picked]
    def you_at(f):
        return C + Vector((0, 0, 0.008 * math.sin(1.3 * f / FPS)))
    for i, p, body, core_em in pills:
        k_ft = picked.get(i)
        f_out = F_SHATTER + 3 * unpicked.index(i) if i not in picked else None
        f_end = (k_ft[1] + 4 + FLIGHT + 1) if k_ft else (f_out + 24)
        for f in range(F_BURST - 1, f_end + 1):
            home = dial_pos(f, i)
            s_ = spring_f(f, F_BURST + 1.5 * i, 0.5, 0.2)
            pos = C.lerp(home, s_) + Vector((0, -0.22 * math.sin(math.pi * clamp01((f - F_BURST - 1.5 * i) / 26)), 0))
            sc = PILL_SCALE * lerp(0.25, 1.0, clamp01(s_))
            if k_ft is not None and f >= k_ft[1]:
                k, ft = k_ft
                tap = f - ft
                az = orbit_az(f); fwd = about_c(C + Vector((0, -1, 0)), az) - C
                step = 0.2 * ease_out_cubic(tap / 6)                       # chosen: it steps toward you, the viewer
                sc *= 1 + 0.12 * ease_out_cubic(tap / 6)
                pos = home + fwd * step
                if tap >= 6:                                               # then glides into its third of your ring
                    u = ease_in_out_cubic((tap - 6) / (FLIGHT - 2))
                    th = math.radians(120 * k)
                    start = dial_pos(ft + 6, i) + fwd * 0.2
                    end = you_at(f) + (about_c(C + Vector((R_RING * math.sin(th), -0.02, R_RING * math.cos(th))), az) - C)
                    pos = start.lerp(end, u)
                    sc *= lerp(1.0, 0.28, ease_in_cubic(u)) * (1 - ease_in_cubic(clamp01((tap - FLIGHT + 1) / 5)))
            if f_out is not None and f >= f_out:                           # not picked: drifts away into the distance
                u = ease_in_cubic((f - f_out) / 22)
                out = (home - C); out.y = 0
                pos = pos + out.normalized() * 0.35 * u + Vector((0, 1.1 * u, 0))
                sc *= 1 - u
            body.location = tuple(pos); body.rotation_euler = (0, 0, math.radians(orbit_az(f))); body.scale = (max(sc, 0.001),) * 3
            body.keyframe_insert('location', frame=f); body.keyframe_insert('rotation_euler', frame=f); body.keyframe_insert('scale', frame=f)
        set_visible(body, 0, False); set_visible(body, F_BURST, True); set_visible(body, f_end, False)
        if k_ft is not None:
            k, ft = k_ft
            keyed(core_em.inputs['Strength'], 'default_value', lambda f, ft=ft: 3.2 + 9.0 * pulse(f, ft, 3, 18), R)
            hit = ft + 4 + FLIGHT
    for f in range(F_BURST - 12, F_SHATTER + 42):
        you.rotation_euler = (math.pi / 2, 0, math.radians(orbit_az(f))); you.keyframe_insert('rotation_euler', frame=f)
    wash, wcol = ctx['sky']['wash'], ctx['sky']['wash_col']
    keyed_value(wash, lambda f: sum(0.75 * pulse(f, ft, 8, 44) for _, ft in PICKS), range(F0, F1 + 2))
    for idx, ft in PICKS:
        wcol.outputs[0].default_value = rgba(HUES[PILLS[idx]]); wcol.outputs[0].keyframe_insert('default_value', frame=ft - 12)
    for fc in fcurves(ctx['world'].node_tree):                            # each colour holds until the next pick
        if fc.data_path == f'nodes["{wcol.name}"].outputs[0].default_value':
            for kp in fc.keyframe_points: kp.interpolation = 'CONSTANT'
    # your ring: plain silver until you choose; each pick fills its third, clockwise from twelve
    hits = [ft + 4 + FLIGHT for _, ft in PICKS]
    keyed_value(yv['fill'], lambda f: sum(ease_out_cubic((f - h) / 18) for h in hits) / 3.0, range(0, F1 + 2))
    keyed_value(yv['fill_glow'], lambda f: sum(pulse(f, h, 2, 30) for h in hits), range(F0, F1 + 2))
    shards('LaunchSpark', tuple(C), 40, F_LAUNCH + 4, speed=(0.3, 1.0), life=(20, 36), size=(0.006, 0.014), tint='#ffd28a', seed=77, gravity=1.0)
    ctx['sea'] = (seaob, seav); ctx['sunB'] = sun; ctx['you_light'] = plight; ctx['floor'] = None
    ctx['rimB'] = plight   # kept for act C's hide call

def cam(f, ctx, prev):
    """One continuous move: down from the name to you, back and level to hold the whole dial, a small push on
    every pick (alternating sides, so each lands in a fresh composition), then back and up after you."""
    (px, py, pz), (prx, pry, prz), pfoc, pfs = prev
    def aim_state(pos, tgt, roll=0.0, fstop=3.2, focus=None):
        look = (tgt - pos).normalized()
        yaw = math.degrees(math.atan2(-look.x, look.y)); pitch = 90 + math.degrees(math.asin(max(-1, min(1, look.z))))
        return tuple(pos), (math.radians(pitch), math.radians(roll), math.radians(yaw)), (focus if focus else (tgt - pos).length), fstop
    s_ = ease_in_out_cubic((f - F0) / 50)
    pos = Vector((px, py, pz)).lerp(C + Vector((0.06, -1.30, 0.36)), s_)
    tgt = C + Vector((0.0, 0, 0.40))
    w = ease_in_out_cubic((f - F_BURST + 10) / 36)                   # back and level: the whole dial
    pos = pos.lerp(C + Vector((0.0, -1.55, 0.12)), w); tgt = tgt.lerp(C + Vector((0, 0, 0.08)), w)
    for k, (idx, ft) in enumerate(PICKS):                              # a push as each pick turns into place
        u = ease_in_out_cubic((f - (ft - 32)) / 28)
        pos = pos + Vector(((0.0, 0.06, -0.06)[k] * u, 0.07 * u, -0.01 * u))
    v = ease_in_out_cubic((f - F_SHATTER + 6) / 40)                    # the dial clears: back a touch, up a touch
    pos = pos + Vector((0.0, -0.16 * v, 0.06 * v))
    pos = about_c(pos, orbit_az(f)); tgt = about_c(tgt, orbit_az(f))   # and circles you as the dial turns
    if f >= F_LAUNCH:
        w2 = clamp01((launch_z(f - 3) + 0.035) / 0.985)
        tgt = tgt + Vector((0, 0, 0.95 * w2)); pos = pos + Vector((0, 0.15 * w2, 0.45 * w2))
    return aim_state(pos, tgt, fstop=lerp(3.2, 3.6, w))
