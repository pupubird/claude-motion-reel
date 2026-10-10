# Act F (film bars 18–21, frames 2056–2539): the reveal, the peak of the film.
# Her ring clicks open on the downbeat; the sun bursts up directly behind her; the frost melts
# from the centre out, spraying droplets, and her face appears: the first face in the film. Then
# yours. Names. "almost friends" — and "almost" crumbles away like frost in the sun: "friends".
import bpy, math, random
from mathutils import Vector
from afx import *

F0 = round(bar(18)); F1 = round(bar(22))
R = range(F0 - 2, F1 + 2)
F_HER = F0; F_YOU = round(beat(70)); F_NAMES = round(bar(19))
F_WORD = round(bar(20)); F_CRUMBLE = round(beat(78)); F_HOLD = round(bar(21))
MELT = 46            # frames for a full melt

def droplets(name, coin, centre, radius, f0, n, seed):
    """Water thrown off as the frost melts: beads launch from the melt front, outward and toward
    the camera, then fall. Clear water glass, real motion blur."""
    random.seed(seed)
    wm = glass(name + 'Water', rough=0.0, ior=1.33)
    for i in range(n):
        th = random.uniform(0, 2 * math.pi)
        fl = f0 + 3 + (MELT - 6) * random.random() ** 1.3
        r_l = min(1.0, 1.25 * ease_out_cubic((fl - f0) / MELT)) * radius
        p0 = centre + Vector((r_l * math.cos(th), -0.03, r_l * math.sin(th)))
        v = Vector((math.cos(th), 0, math.sin(th))) * random.uniform(0.35, 0.9) + Vector((0, -random.uniform(0.15, 0.45), random.uniform(0.0, 0.35)))
        life = random.randint(26, 44); size = random.uniform(0.0035, 0.009)
        bpy.ops.mesh.primitive_uv_sphere_add(radius=1.0, location=tuple(p0), segments=14, ring_count=8)
        d = bpy.context.object; d.name = f'{name}Drop{i:02d}'; d.data.materials.append(wm); d.visible_shadow = False
        bpy.ops.object.shade_smooth()
        for f in range(int(fl) - 1, int(fl) + life + 1, 1):
            t = max(0.0, (f - fl) / FPS)
            pos = p0 + v * t + Vector((0, 0, -2.4 * t * t))
            k = size * (1 - ease_in_cubic((f - fl) / life)) if f >= fl else size
            d.location = tuple(pos); d.scale = (k, k * 1.25, k); d.keyframe_insert('location', frame=f); d.keyframe_insert('scale', frame=f)
        set_visible(d, 0, False); set_visible(d, int(fl), True); set_visible(d, int(fl) + life, False)

def build(ctx):
    you, yv, them, tv = ctx['you'], ctx['you_v'], ctx['them'], ctx['them_v']
    P = ctx['meet']; YE, HE = ctx['you_end_c'], ctx['her_end_c']
    # where the camera is at the click: the sun rises exactly behind her from there
    cam_pos = (P + Vector((0.0, -1.22, 0.30))).lerp(HE + Vector((0.02, -0.62, 0.02)), 0.85)   # act E's camera at the click
    d = (HE - cam_pos).normalized()
    SUN_AZ = math.atan2(d.x, d.y) + math.radians(6); SUN_EL = math.asin(max(-1, min(1, d.z))) + math.radians(1.5)
    prev = rot_for_sun(340.0)                         # act E's shade sky
    r = rot_for_sun(math.degrees(SUN_AZ)); r += 360.0 * round((prev - r) / 360.0)   # nearest turn, never a spin
    deep = {'shade': 1.0, 'strength': 1.0, 'light': 0.85, 'rot': prev}
    dawn = {'morning': 1.0, 'strength': 1.2, 'light': 1.15, 'rot': r}
    gold = {'morning': 0.45, 'sunny': 0.55, 'strength': 1.15, 'light': 1.05, 'rot': r}
    def sky(f):
        if f < F0 + 26: return blend(deep, dawn, ease_out_cubic((f - F0) / 26))
        return blend(dawn, gold, ease_in_out_sine((f - F0 - 26) / 120))
    key_sky(ctx['sky'], range(F0, F1), sky)
    ctx['rot_f'] = r
    sun = sun_lamp('SunF', 0.0, '#ffcf96', 3.0)
    set_visible(sun, 0, False); set_visible(sun, F0, True)
    for f in range(F0, F1 + 1, 2):
        u = ease_out_cubic((f - F0) / 30)
        aim_sun(sun, SUN_AZ, max(math.radians(4), SUN_EL), f)
        sun.data.energy = 5.0 * u; sun.data.keyframe_insert('energy', frame=f)
    # a soft warm front light so the faces and the glass read once the frost is gone
    front = bpy.data.lights.new('FaceFill', 'AREA'); front.energy = 0.0; front.size = 1.4; front.color = srgb('#ffe2c4')
    fo = bpy.data.objects.new('FaceFill', front); link(fo); fo.location = tuple(P + Vector((0.5, -1.6, 0.8)))
    c = fo.constraints.new('TRACK_TO'); c.target = empty('FaceFillTarget', tuple(P)); c.track_axis = 'TRACK_NEGATIVE_Z'; c.up_axis = 'UP_Y'
    no_specular(fo)
    for f in range(F0, F1 + 1, 2):
        front.energy = 90.0 * ease_out_cubic((f - F0 - 10) / 40); front.keyframe_insert('energy', frame=f)

    # the melts
    for who, coin, vals, f_m, centre in (('her', them, tv, F_HER, HE), ('you', you, yv, F_YOU, YE)):
        for k in ('melt_glass', 'melt_photo'):
            keyed_value(vals[k], lambda f, f_m=f_m: 1.3 * ease_out_cubic((f - f_m) / MELT), R)
        keyed_value(vals['glow'], lambda f, f_m=f_m: (1.3 if who == 'her' else 1.75) if f < f_m else 1.05 + 1.4 * math.exp(-(f - f_m) / 9.0), R)
        droplets(f'{who}', coin, centre, 0.16 * 1.22, f_m, 70, 31 if who == 'her' else 47)
        shards(f'Ice_{who}', tuple(centre + Vector((0, -0.04, 0))), 90, f_m + 1, speed=(0.5, 1.9), life=(24, 46), size=(0.006, 0.02),
               tint='#eef8ff', toward=(0, -0.8, 0.1), seed=41 if who == 'her' else 43, gravity=0.9)
        # a ring of light bursts outward from each reveal
        bpy.ops.mesh.primitive_torus_add(major_radius=0.2, minor_radius=0.004, location=tuple(centre + Vector((0, -0.01, 0))), rotation=(math.pi / 2, 0, 0))
        rg = bpy.context.object; rg.name = f'Burst_{who}'; rg.visible_shadow = False
        rm = glow(f'Burst_{who}', '#ffd49a', 16.0); rg.data.materials.append(rm)
        for f in range(f_m - 1, f_m + 34):
            u = ease_out_cubic((f - f_m) / 32); k = lerp(1.0, 4.5, u)
            rg.scale = (k, k, 1); rg.keyframe_insert('scale', frame=f)
            emission_node(rm).inputs['Strength'].default_value = 16.0 * (1 - u); emission_node(rm).inputs['Strength'].keyframe_insert('default_value', frame=f)
        set_visible(rg, 0, False); set_visible(rg, f_m, True); set_visible(rg, f_m + 34, False)
    # the rings of light fade away once you both said yes
    for who, r in ctx['rings'].items():
        set_visible(r, F_YOU + 50, False)

    # You're both in!
    bi = kinetic('BothIn', 'bothin', P + Vector((0.0, -0.08, 0.58)), scale=0.9)
    animate_kinetic(bi, F_YOU + 30, F_NAMES + 48, style='slam', stagger=6, exit='scatter', seed=15, by='word')
    ctx.setdefault('titles', []).append(dict(name='BothIn', objs=[bi['root']], point=P + Vector((0.0, -0.08, 0.58)),
        f_ref=F_YOU + 40, ndc=(0.5, 0.74), follow=0.85, f_in=F_YOU + 30, f_out=F_NAMES + 48))
    shards('Confetti', tuple(P + Vector((0, -0.1, 0.9))), 120, F_NAMES - 4, speed=(0.3, 1.2), life=(40, 70), size=(0.008, 0.02),
           tint='#ffd27a', seed=51, gravity=0.7)
    shards('Confetti2', tuple(P + Vector((0.2, -0.1, 0.9))), 90, F_NAMES + 2, speed=(0.3, 1.2), life=(40, 70), size=(0.008, 0.02),
           tint='#7cc3ff', seed=52, gravity=0.7)
    # names pop on springs, on black glass capsules
    for key, centre, f_in in (('sofia', HE, F_NAMES + 4), ('hana', YE, F_NAMES)):
        tp, trv, _ = type_plane('Name_' + key, key, tuple(centre + Vector((0, 0.0, -0.33))), mode='glow', strength=1.4, scale=1.9)
        cap = rounded_box('NameCap_' + key, (TYPE[key]['wM'] * 1.9 + 0.05, 0.03, 0.11), 0.055, tuple(centre + Vector((0, 0.025, -0.33))), segments=10)
        cmat = bpy.data.materials.new('NameCap_' + key); cnt = node_tree(cmat)
        pb = N(cnt, 'ShaderNodeBsdfPrincipled'); pb.inputs['Base Color'].default_value = rgba('#0b0b0d'); pb.inputs['Roughness'].default_value = 0.12
        out_surface(cnt, pb.outputs[0]); cap.data.materials.append(cmat)
        cap.parent = tp; cap.matrix_parent_inverse = tp.matrix_world.inverted()
        keyed_value(trv, lambda f: 1.2, range(F0, F0 + 1))
        base = Vector(tp.location); bs = Vector(tp.scale)
        for f in range(F_NAMES - 4, F1 + 2):
            k_ = max(0.001, spring_f(f, f_in, 0.45, 0.3))
            tp.location = tuple(base); tp.scale = (bs.x * k_, bs.y * k_, bs.z)
            tp.keyframe_insert('location', frame=f); tp.keyframe_insert('scale', frame=f)
        set_visible(tp, 0, False); set_visible(tp, f_in - 1, True)
        ctx.setdefault('names', []).append(tp)
    # almost friends — "almost" crumbles like frost in the sun; "friends" takes the stage
    al = kinetic('BigAlmost', 'almost_big', P + Vector((0, -0.06, 0.74)), scale=0.82)
    animate_kinetic(al, F_WORD - 50, F_CRUMBLE, style='fly', stagger=2.5, exit='scatter', seed=16, depth=0.4)
    fr_k = kinetic('BigFriends', 'friends_big', P + Vector((0, -0.06, 0.52)), scale=0.82)
    animate_kinetic(fr_k, F_WORD - 44, None, style='fly', stagger=2.5, seed=17, depth=0.4)
    dust = shards('AlmostDust', tuple(P + Vector((0, -0.08, 0.74))), 120, F_CRUMBLE + 2, speed=(0.15, 0.7), life=(30, 60), size=(0.003, 0.008),
                  tint='#e9eef3', seed=61, gravity=0.35)
    ctx.setdefault('titles', []).append(dict(name='Friends', objs=[al['root'], fr_k['root']] + dust, point=P + Vector((0, -0.06, 0.63)),
        f_ref=F_WORD, ndc=(0.5, 0.78), depth=1.0, fit=(KIN['almost_big']['wM'] * 0.82, 0.78), follow=0.85,
        f_in=F_WORD - 50, f_out=round(bar(23)) + 4))
    # "friends" rises to the centre and grows once "almost" is gone
    for f in range(F_CRUMBLE, F1 + 60):
        u = ease_in_out_cubic((f - F_CRUMBLE - 10) / 40)
        fr_k['root'].location = tuple(P + Vector((0, -0.06, 0.52 + 0.12 * u))); fr_k['root'].scale = (1 + 0.25 * u,) * 3
        fr_k['root'].keyframe_insert('location', frame=f); fr_k['root'].keyframe_insert('scale', frame=f)
    # more friends: three other pairs slide in and their frost bursts on the beats
    pairs = [(('takumi', 'camille'), Vector((-0.66, 0.30, 0.42))), (('jiwoo', 'mateo'), Vector((0.68, 0.42, -0.12))), (('adaeze', 'liam'), Vector((-0.06, 0.95, 0.82)))]
    for k, ((a_, b_), off) in enumerate(pairs):
        f_m = round(beat(81 + k))
        for j, who in enumerate((a_, b_)):
            c0 = P + off + Vector(((-0.16 if j == 0 else 0.16), 0, 0))
            coin, vals = person(f'Friend{k}{j}', tuple(c0 + Vector((0, 0, -1.5))), 0.13, who, list(HUES)[(k + j) % 6:(k + j) % 6 + 3] if (k + j) % 6 <= 3 else PAIR)
            F_CLEAR = round(bar(23)) - 30                    # act G's end line lands on bar 23: the frame clears for it
            away = Vector((1.3 if c0.x >= P.x else -1.3, 1.6, 0.35))
            for f in range(f_m - 40, F_CLEAR + 44, 2):
                s_ = spring_f(f, f_m - 30, 0.7, 0.15)
                loc = (c0 + Vector((0, 0, -1.5))).lerp(c0, s_) + away * ease_in_cubic((f - F_CLEAR - 3 * (k + j)) / 36)
                coin.location = tuple(loc); coin.keyframe_insert('location', frame=f)
            for kk in ('melt_glass', 'melt_photo'):
                keyed_value(vals[kk], lambda f, f_m=f_m: 1.3 * ease_out_cubic((f - f_m) / 36), range(f_m - 2, f_m + 40, 2))
            keyed_value(vals['glow'], lambda f, f_m=f_m: 1.0 + 1.2 * math.exp(-max(0, f - f_m) / 9.0) if f >= f_m else 1.0, range(f_m - 2, f_m + 40, 2))
            set_visible(coin, 0, False); set_visible(coin, f_m - 40, True); set_visible(coin, F_CLEAR + 44, False)
        shards(f'PairIce{k}', tuple(P + off), 50, f_m + 1, speed=(0.4, 1.4), life=(22, 40), size=(0.005, 0.014), tint='#eef8ff', seed=70 + k, gravity=0.8)
    fr = fr_k['root']
    ctx['friends_word'] = fr_k

def exposure(f):
    # a breath of light on the click
    return 0.35 * pulse(f, F0, 2, 16)

def cam(f, ctx, prev):
    (px, py, pz), (prx, pry, prz), pfoc, pfs = prev
    P = ctx['meet']; HE = ctx['her_end_c']
    start = Vector((px, py, pz))
    # the click: a small kick toward her, then pull back to hold you both and the words
    kick = 0.04 * pulse(f, F0, 3, 14)
    close = start + Vector((0, kick, 0))
    wide = P + Vector((0.0, -1.30, 0.26))
    u = ease_in_out_cubic((f - F_YOU + 10) / 90)
    pos = close.lerp(wide, u)
    tgt = HE.lerp(P + Vector((0, 0, 0.24)), u)
    # from the names to the crumble: a 22° arc in close on the two faces (the first time we see you both);
    # on bar 21 a hard pull back and up finds the other pairs opening around you
    def orbit(az, d, h):
        r = math.radians(az); return P + Vector((d * math.sin(r), -d * math.cos(r), h))
    a = ease_in_out_sine((f - (F_NAMES - 20)) / (F_CRUMBLE + 30 - F_NAMES))
    b = ease_in_out_cubic((f - (F_HOLD - 6)) / 56)
    az = lerp(0.0, 22.0, a) - 10.0 * b
    d = lerp(1.30, 1.12, a) + 1.33 * b
    h = lerp(0.26, 0.18, a) + 0.37 * b
    w = ease_in_out_sine((f - (F_NAMES - 20)) / 40)
    pos = pos.lerp(orbit(az, d, h), w)
    tgt = tgt.lerp(P + Vector((0, 0, 0.30 + 0.05 * b)), w)
    look = (tgt - pos).normalized()
    yaw = math.degrees(math.atan2(-look.x, look.y)); pitch = 90 + math.degrees(math.asin(max(-1, min(1, look.z))))
    return tuple(pos), (math.radians(pitch), 0.0, math.radians(yaw)), (tgt - pos).length, lerp(2.2, 3.2, max(u * (1 - a), b))
