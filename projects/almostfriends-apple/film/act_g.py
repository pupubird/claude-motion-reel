# Act G (film bar 22 to the end, frames 2539–3215): everywhere, people meeting; the line; the mark.
# The camera pulls back and rises; across the morning sky other pairs of strangers glide together
# and flash gold where they overlap. "Know them before you see them." Then the two of you slide
# together into the mark, faces clear and a gold lens between you, and the name rises. The music
# ends and the frame holds in silence.
import bpy, math, random
from mathutils import Vector
from afx import *

F0 = round(bar(22)); F_END = END
R = range(F0 - 2, F_END + 1)
F_LINE = round(bar(23)); F_MARK = round(bar(24)); F_WM1 = round(beat(93)); F_WM2 = round(beat(93.5))
F_GLINT = round(bar(25))
K = 1.22                                   # the avatars' scale since act B
OFF = 0.105 * K; R_COIN = 0.16 * K

def build(ctx):
    you, yv, them, tv = ctx['you'], ctx['you_v'], ctx['them'], ctx['them_v']
    P = ctx['meet']; YE, HE = ctx['you_end_c'], ctx['her_end_c']
    MARK = P + Vector((0.0, 0.0, 0.10))
    # sky: golden morning, then the warm white day the name lives on
    gold = {'morning': 0.45, 'sunny': 0.55, 'strength': 1.15, 'light': 1.05, 'rot': ctx.get('rot_f', rot_for_sun(-20.0))}
    rf = ctx.get('rot_f', rot_for_sun(-20.0)); rd = rot_for_sun(-25.0); rd += 360.0 * round((rf - rd) / 360.0)
    day = {'sunny': 1.0, 'strength': 1.2, 'light': 1.05, 'rot': rd}
    key_sky(ctx['sky'], range(F0, F_END + 1), lambda f: blend(gold, day, ease_in_out_sine((f - F_LINE - 40) / 120)))

    # other pairs, everywhere, meeting
    random.seed(19)
    keys = list(HUES); pairs = 0; tries = 0; placed = []
    while pairs < 12 and tries < 4000:
        tries += 1
        c = P + Vector((random.uniform(-2.4, 2.4), random.uniform(0.9, 4.2), random.uniform(-0.5, 2.1)))
        if abs(c.x - P.x) < 0.8 and abs(c.z - P.z) < 1.1: continue      # keep the centre clear
        if any((c - q).length < 1.3 for q in placed): continue
        placed.append(c)
        r = random.uniform(0.10, 0.16); off = r * 0.66
        f_meet = F0 + 30 + pairs * 14 + random.randint(-6, 6)
        cols = random.sample(keys, 3)
        for side in (-1, 1):
            coin = make_coin(f'Pair{pairs:02d}{"L" if side < 0 else "R"}', tuple(c), r, r * 0.13)
            m, gl = frosted_glow(coin.name, [HUES[k] for k in cols], strength=1.6, rough=0.34); coin.data.materials.append(m)
            for f in range(F0, F_MARK + 32, 2):
                s = spring_f(f, f_meet - 30, 0.9, 0.12)
                k_ = 1 - ease_in_cubic((f - F_MARK + 14) / 40)          # they shrink away as the mark lands
                coin.location = tuple(c + Vector((side * lerp(off + 0.45, off, s), 0, 0.02 * math.sin(f / 40 + pairs))))
                coin.scale = (max(k_, 0.001),) * 3
                coin.keyframe_insert('location', frame=f); coin.keyframe_insert('scale', frame=f)
            keyed_value(gl, lambda f, f_meet=f_meet: 1.6 + 5.0 * pulse(f, f_meet, 3, 26), range(F0, F_END + 1, 2))
            set_visible(coin, 0, False); set_visible(coin, F0 + 2, True); set_visible(coin, F_MARK + 28, False)
        # the gold where they overlap: a small lens of light that blooms on contact
        bpy.ops.mesh.primitive_uv_sphere_add(radius=1.0, location=tuple(c + Vector((0, -0.02, 0))), segments=24, ring_count=12)
        lens = bpy.context.object; lens.name = f'PairLens{pairs:02d}'; lens.visible_shadow = False
        lm = emissive(lens.name, '#ffa53a', 6.0); lens.data.materials.append(lm)
        for f in range(f_meet - 2, F_END + 1, 2):
            g = spring_f(f, f_meet, 0.5, 0.2)
            lens.scale = (0.32 * r * g, 0.05 * r, 0.82 * r * g); lens.keyframe_insert('scale', frame=f)
        set_visible(lens, 0, False); set_visible(lens, f_meet - 1, True); set_visible(lens, F_MARK + 10, False)
        pairs += 1

    # "friends" whips up and out; the names drop away; the end line cascades in
    frk = ctx['friends_word']; fr = frk['root']
    base = Vector(fr.location)
    for f in range(F_LINE - 30, F_LINE + 4):
        u = ease_in_cubic((f - F_LINE + 30) / 22)
        fr.location = tuple(base + Vector((0.0, -0.3 * u, 1.3 * u))); fr.keyframe_insert('location', frame=f)
    for g in frk['glyphs']: set_visible(g['ob'], F_LINE - 4, False)
    for tp in ctx.get('names', []):
        b2 = Vector(tp.location)
        for f in range(F_LINE - 30, F_LINE):
            tp.location = (b2.x, b2.y, b2.z - 0.9 * ease_in_cubic((f - F_LINE + 30) / 22)); tp.keyframe_insert('location', frame=f)
        set_visible(tp, F_LINE - 6, False)
    el = kinetic('EndLine', 'endline', P + Vector((0.0, -0.06, 0.62)), scale=0.95)
    animate_kinetic(el, F_LINE - 16, F_MARK + 6, style='fly', stagger=2.2, exit='whip', seed=18, depth=0.5)
    ctx.setdefault('titles', []).append(dict(name='EndLine', objs=[el['root']], point=P + Vector((0.0, -0.06, 0.62)),
        f_ref=F_LINE, ndc=(0.5, 0.74), depth=1.6, fit=(KIN['endline']['wM'] * 0.95, 0.72), follow=0.85,
        f_in=F_LINE - 16, f_out=F_MARK + 6))

    # the two of you slide together into the mark
    for coin, start, side in ((you, YE, -1), (them, HE, 1)):
        for f in R:
            s = spring_f(f, F_MARK, 0.8, 0.14)
            tgt = MARK + Vector((side * OFF, 0.0 if side < 0 else 0.045 * K, 0.0))
            p = Vector((start.x, start.y, start.z)).lerp(tgt, s)
            coin.location = (p.x, p.y, p.z + 0.006 * math.sin(f / 50 + side)); coin.keyframe_insert('location', frame=f)
    for vals in (yv, tv):
        for k in ('lens_glass', 'lens_photo'):
            keyed_value(vals[k], lambda f: ease_out_cubic((f - F_MARK - 22) / 16), R)
        keyed_value(vals['glow'], lambda f: 1.05 + 0.5 * pulse(f, F_GLINT, 4, 30), R)

    shards('MarkGold', tuple(MARK + Vector((0, -0.03, 0))), 70, F_MARK + 24, speed=(0.3, 1.2), life=(24, 44), size=(0.005, 0.013),
           tint='#ffb347', seed=81, gravity=0.4)
    # the name builds letter by letter out of depth (act A's lockup, scaled)
    wm = kinetic('EndWM', 'wm', MARK + Vector((0, -0.03, -0.285 * K)), scale=K)
    animate_kinetic(wm, F_WM1 - 4, None, style='fly', stagger=2.0, seed=19, depth=0.4)
    # one flip on the last hit: the two coins turn a full circle together and settle
    for coin, side in ((you, -1), (them, 1)):
        for f in range(F_GLINT - 2, F_GLINT + 50):
            s_ = spring_f(f, F_GLINT, 0.7, 0.12)
            coin.rotation_euler = (math.pi / 2, 0, 2 * math.pi * s_); coin.keyframe_insert('rotation_euler', frame=f)
    # a single glint of light sweeps across the mark on the last hit
    gl = bpy.data.lights.new('Glint', 'AREA'); gl.shape = 'RECTANGLE'; gl.size = 0.05; gl.size_y = 1.4; gl.energy = 0.0; gl.color = srgb('#ffffff')
    go = bpy.data.objects.new('Glint', gl); link(go); go.rotation_euler = (math.radians(90), 0, math.radians(-12))
    for f in range(F_GLINT - 2, F_GLINT + 50):
        u = ease_in_out_sine((f - F_GLINT) / 46)
        go.location = tuple(MARK + Vector((lerp(-0.7, 0.7, u), -0.55, 0.3))); go.keyframe_insert('location', frame=f)
        gl.energy = 40.0 * math.sin(math.pi * clamp01(u)); gl.keyframe_insert('energy', frame=f)
    set_visible(go, 0, False); set_visible(go, F_GLINT - 2, True); set_visible(go, F_GLINT + 50, False)
    ctx['mark_c'] = MARK

def cam(f, ctx, prev):
    (px, py, pz), (prx, pry, prz), pfoc, pfs = prev
    P = ctx['meet']; MARK = P + Vector((0.0, 0.0, 0.10))
    start = Vector((px, py, pz))
    # pull back and rise to see the sky of pairs, then land on the lockup
    wide = P + Vector((0.0, -2.70, 0.75))
    end = MARK + Vector((0.0, -0.98, -0.38))
    u1 = ease_in_out_cubic((f - F0) / (F_LINE - F0 + 40))
    u2 = ease_in_out_cubic((f - F_MARK + 20) / 110)
    pos = start.lerp(wide, u1).lerp(end, u2)
    tgt = (P + Vector((0, 0, 0.3))).lerp(MARK + Vector((0, 0, -0.14)), u2)
    look = (tgt - pos).normalized()
    yaw = math.degrees(math.atan2(-look.x, look.y)); pitch = 90 + math.degrees(math.asin(max(-1, min(1, look.z))))
    return tuple(pos), (math.radians(pitch), 0.0, math.radians(yaw)), (MARK - pos).length, lerp(3.2, 4.0, u2)
