# Act C (film bars 8–11, frames 847–1331): the match.
# You rise off the studio floor as the sun sets in time-lapse; night falls and a sky of people
# switches on, each a frosted glass light. Your light sends out a search pulse; people it touches
# flicker and dim. On the brass hit one far light flares in your colours and a thread of light
# shoots between you; you rush to each other along it at speed, and meet side by side:
# "You both put Family first."
import bpy, math, random
from mathutils import Vector
from afx import *

F0 = round(bar(8)); F1 = round(bar(12))
R = range(F0 - 2, F1 + 2)
F_NIGHT = round(bar(9)); F_PULSES = [round(beat(32)), round(beat(34))]
F_MATCH = round(bar(10)); F_MEET = round(bar(11)); F_TYPE = round(beat(39))
Y0 = Vector((0.0, 3.40, 2.00))          # where you hover while searching
H0 = Vector((-3.2, 16.0, 3.40))         # where she is when found
MU = 0.42                                # you meet this far along the thread
MEET = Y0.lerp(H0, MU)
GAP = 0.235                              # half the distance between your centres when side by side
YOU_END = MEET + Vector((-GAP, 0, 0)); HER_END = MEET + Vector((GAP, 0.02, 0))
CAM_FINAL = MEET + Vector((0.0, -1.18, -0.02))

def thread_point(u):
    """The thread from you (u=0) to her (u=1): a gentle arc."""
    p = Y0.lerp(H0, u)
    return p + Vector((0.0, 0.0, 0.55 * math.sin(math.pi * u)))

def build(ctx):
    you, yv, them, tv, SKY = ctx['you'], ctx['you_v'], ctx['them'], ctx['them_v'], ctx['sky']
    yb = Vector((0.0, 3.40, 0.75))      # where act B left you
    # ---------------- sky: golden -> sunset -> night, the sun sets, stars come out
    SUN_AZ = math.radians(-30)
    gold = ctx['sky_end_b']
    sunset = {'sunny2': 1.0, 'strength': 1.15, 'light': 1.05, 'rot': rot_for_sun(-60.0)}
    dusk = {'sunny2': 0.6, 'golden': 0.4, 'strength': 1.15, 'light': 1.05, 'rot': rot_for_sun(-80.0)}
    night = {'sunny': 1.0, 'strength': 1.15, 'light': 1.05, 'rot': rot_for_sun(-100.0)}
    def sky(f):
        if f < F0 + 45: return blend(gold, sunset, ease_in_out_sine((f - F0) / 45))
        if f < F0 + 85: return blend(sunset, dusk, ease_in_out_sine((f - F0 - 45) / 40))
        return blend(dusk, night, ease_in_out_sine((f - F0 - 85) / (F_NIGHT - F0 - 70)))
    key_sky(SKY, range(F0, F1), sky)
    sun = ctx['sunB']
    for f in range(F0, F_NIGHT + 2):
        u = ease_in_out_sine((f - F0) / (F_NIGHT - F0))
        aim_sun(sun, SUN_AZ, math.radians(lerp(12, -6, u)), f)
        sun.data.energy = lerp(5.5, 0.0, u); sun.data.keyframe_insert('energy', frame=f)
        sun.data.color = vlerp(srgb('#ffc98f'), srgb('#ff7a45'), min(1, 1.5 * u)); sun.data.keyframe_insert('color', frame=f)
    set_visible(sun, F_NIGHT + 2, False)
    set_visible(ctx['rimB'], F_NIGHT, False)
    set_visible(ctx['top'], F0 + 40, False)
    # a cool moonlight so glass keeps its edges at night
    moon = sun_lamp('Moon', 0.0, '#a9bcff', 4.0); aim_sun(moon, math.radians(25), math.radians(35))
    for f in range(F0, F1 + 1, 2):
        moon.data.energy = 0.9 * ease_in_out_sine((f - F0 - 40) / 70); moon.data.keyframe_insert('energy', frame=f)

    # ---------------- the sky of people: a few people near you, hundreds far away like city lights
    random.seed(41)
    names = ['takumi', 'adaeze', 'giulia', 'jiwoo', 'imani', 'elsa', 'liam', 'haoran']
    keys = list(HUES)
    def triple():
        while True:
            t = random.sample(keys, 3)
            if tuple(t) != PAIR: return t
    def near_path(p):
        return min((p - thread_point(i / 20)).length for i in range(21))
    near = []; tries = 0
    while len(near) < 8 and tries < 20000:
        tries += 1
        ang = random.uniform(0, 2 * math.pi); d = random.uniform(1.7, 3.6)
        p = Y0 + Vector((math.cos(ang) * d, 1.2 + math.sin(ang) * d * 0.9, random.uniform(-0.9, 1.3)))
        if p.y < Y0.y + 0.6 or near_path(p) < 0.8: continue
        if any((p - q).length < 1.2 for q in near): continue
        near.append(p)
    lights = []
    for i, p in enumerate(near):
        coin, vals = person(f'N{i:02d}', tuple(p), random.uniform(0.15, 0.2), names[i], triple(), sharp=False)
        f_on = F0 + 70 + i * 6
        for f in range(F0, F1 + 1, 2):
            k = max(0.001, spring_f(f, f_on, 0.6, 0.12)); coin.scale = (k, k, k); coin.keyframe_insert('scale', frame=f)
        set_visible(coin, 0, False); set_visible(coin, f_on - 1, True); set_visible(coin, F1 + 24, False)
        pulse_at = [fp + (p - Y0).length / 22.0 * FPS for fp in F_PULSES]
        keyed_value(vals['glow'], lambda f, pulse_at=pulse_at: (1.0 + sum(1.6 * pulse(f, pa, 3, 20) for pa in pulse_at)) *
                    (1.0 if f < F_MATCH else lerp(1.0, 0.45, ease_out_cubic((f - F_MATCH) / 30))), range(F0, F1 + 1, 2))
        lights.append(coin)
    # the far lights share one material: they switch on with the night, flare as a search shell
    # passes them (distance from you vs the shell radius), and recede once she is found
    m = bpy.data.materials.new('FarPeople'); nt = node_tree(m)
    oi = N(nt, 'ShaderNodeObjectInfo')
    dvec = N(nt, 'ShaderNodeVectorMath', operation='DISTANCE'); L(nt, oi.outputs['Location'], dvec.inputs[0])
    dvec.inputs[1].default_value = tuple(Y0)
    dist = dvec.outputs['Value']
    on = VAL(nt, 0.0, 'on'); recede = VAL(nt, 1.0, 'recede')
    wave = None
    pulse_r = []
    for k in range(len(F_PULSES)):
        pr = VAL(nt, -10.0, f'r{k}'); ps = VAL(nt, 0.0, f's{k}'); pulse_r.append((pr, ps))
        band = M(nt, 'MULTIPLY', maprange(nt, M(nt, 'SUBTRACT', pr.outputs[0], dist), -0.2, 2.5, 0.0, 1.0),
                 maprange(nt, M(nt, 'SUBTRACT', pr.outputs[0], dist), 2.5, 6.0, 1.0, 0.0))
        band = M(nt, 'MULTIPLY', band, ps.outputs[0])
        wave = band if wave is None else M(nt, 'ADD', wave, band)
    hue = N(nt, 'ShaderNodeValToRGB'); L(nt, oi.outputs['Random'], hue.inputs['Fac']); cr = hue.color_ramp
    cols = ['#ffd6a0', '#ffb98c', '#ffe7c4', '#c9d4ff', '#ffc9d6', '#ffe2b0']
    cr.elements[0].position, cr.elements[0].color = 0.0, rgba(cols[0]); cr.elements[1].position, cr.elements[1].color = 1.0, rgba(cols[-1])
    for j, c in enumerate(cols[1:-1]):
        el = cr.elements.new((j + 1) / (len(cols) - 1)); el.color = rgba(c)
    flicker = M(nt, 'ADD', 0.7, M(nt, 'MULTIPLY', oi.outputs['Random'], 0.6))
    strength = M(nt, 'MULTIPLY', M(nt, 'ADD', M(nt, 'MULTIPLY', on.outputs[0], flicker), M(nt, 'MULTIPLY', wave, 5.0)), recede.outputs[0])
    em = N(nt, 'ShaderNodeEmission'); L(nt, hue.outputs['Color'], em.inputs['Color']); L(nt, M(nt, 'MULTIPLY', strength, 30.0), em.inputs['Strength'])
    out_surface(nt, em.outputs[0])
    keyed_value(on, lambda f: ease_in_out_sine((f - F0 - 55) / 70), range(F0, F1 + 1, 2))
    keyed_value(recede, lambda f: 1.0 if f < F_MATCH else lerp(1.0, 0.35, ease_out_cubic((f - F_MATCH) / 40)), range(F0, F1 + 1, 2))
    for (pr, ps), fp in zip(pulse_r, F_PULSES):
        keyed_value(pr, lambda f, fp=fp: -10.0 if f < fp else 0.2 + 22.0 * ease_out_cubic((f - fp) / 60.0) ** 1.2, range(F0, F1 + 1))
        keyed_value(ps, lambda f, fp=fp: 0.0 if f < fp else 1.0 - ease_in_out_sine((f - fp) / 60.0), range(F0, F1 + 1))
    random.seed(77)
    far = 0
    while far < 320:
        p = Vector((random.uniform(-14, 12), random.uniform(6, 34), random.uniform(-1.0, 12.0)))
        if near_path(p) < 1.0: continue
        bpy.ops.mesh.primitive_ico_sphere_add(radius=random.uniform(0.018, 0.04), subdivisions=2, location=tuple(p))
        o = bpy.context.object; o.name = f'Far{far:03d}'; o.data.materials.append(m); o.visible_shadow = False
        set_visible(o, 0, False); set_visible(o, F0 + 40, True); set_visible(o, F1 + 24, False)
        far += 1
    ctx['field_c'] = lights
    two = numeral('Num2', '2', tuple(Y0 + Vector((0.0, -0.42, 0.98))), size=0.42)
    slam_numeral(two, F0 + 10, F_NIGHT + 20, tuple(Y0 + Vector((0.0, -0.42, 0.98))), kick_dir=-1)
    fq = kinetic('Finds', 'finds', Y0 + Vector((0.0, -0.42, 0.70)), scale=0.78)
    animate_kinetic(fq, F0 + 18, F_NIGHT + 40, style='fly', stagger=1.6, exit='whip', seed=6, depth=0.5)
    ctx.setdefault('titles', []).append(dict(name='Two', objs=[two, fq['root']], point=Y0 + Vector((0.0, -0.42, 0.98)),
        f_ref=F0 + 90, ndc=(0.5, 0.85), depth=1.45, scale=1.30, follow=0.85, f_in=F0 - 10, f_out=F_NIGHT + 60))
    # sixty glass people fill the sky, popping in from near to far as the camera pulls back
    bez = bpy.data.materials.new('MidBezel'); bnt = node_tree(bez)
    pb = N(bnt, 'ShaderNodeBsdfPrincipled'); pb.inputs['Metallic'].default_value = 1.0; pb.inputs['Roughness'].default_value = 0.3
    oi2 = N(bnt, 'ShaderNodeObjectInfo'); hr = N(bnt, 'ShaderNodeValToRGB'); L(bnt, oi2.outputs['Random'], hr.inputs['Fac'])
    hc = hr.color_ramp; hl = list(HUES.values())
    hc.elements[0].position, hc.elements[0].color = 0.0, rgba(hl[0]); hc.elements[1].position, hc.elements[1].color = 1.0, rgba(hl[-1])
    for j, h in enumerate(hl[1:-1]):
        e_ = hc.elements.new((j + 1) / (len(hl) - 1)); e_.color = rgba(h)
    L(bnt, hr.outputs['Color'], pb.inputs['Base Color']); out_surface(bnt, pb.outputs[0])
    random.seed(55); mids = 0; placed = []
    while mids < 60:
        p = Y0 + Vector((random.uniform(-4.5, 4.5), random.uniform(0.8, 13.0), random.uniform(-1.6, 3.6)))
        if near_path(p) < 0.7 or (p - Y0).length < 0.9: continue
        if any((p - q).length < 0.9 for q in placed): continue
        placed.append(p)
        r = random.uniform(0.11, 0.2)
        coin = make_coin(f'Mid{mids:02d}', tuple(p), r, r * 0.13)
        mm, gl = frosted_glow(f'Mid{mids:02d}', [HUES[k] for k in triple()], strength=1.8, rough=0.3); coin.data.materials.append(mm)
        bpy.ops.mesh.primitive_torus_add(major_radius=r * 1.005, minor_radius=r * 0.08, major_segments=96, minor_segments=12, location=(0, 0, 0))
        tb = bpy.context.object; tb.name = f'Mid{mids:02d}Bezel'; tb.parent = coin; tb.data.materials.append(bez)
        f_on = F0 + 26 + 0.55 * (p - Y0).length * 8 + random.uniform(0, 10)
        for f in range(F0, F1 + 2, 2):
            k_ = max(0.001, spring_f(f, f_on, 0.5, 0.2)); coin.scale = (k_, k_, k_)
            coin.rotation_euler = (math.pi / 2 + 0.25 * math.sin(f / 40 + mids), 0, 0.3 * math.sin(f / 55 + mids))
            coin.keyframe_insert('scale', frame=f); coin.keyframe_insert('rotation_euler', frame=f)
        pulse_at = [fp + (p - Y0).length / 22.0 * FPS for fp in F_PULSES]
        keyed_value(gl, lambda f, pulse_at=pulse_at: (1.8 + sum(4.0 * pulse(f, pa, 3, 18) for pa in pulse_at)) *
                    (1.0 if f < F_MATCH else lerp(1.0, 0.5, ease_out_cubic((f - F_MATCH) / 30))), range(F0, F1 + 2, 2))
        set_visible(coin, 0, False); set_visible(coin, int(f_on) - 1, True); set_visible(coin, F1 + 24, False)
        mids += 1

    # ---------------- you rise into the sky, search, then rush to her
    for f in R:
        t = f / FPS
        if f < F_NIGHT:
            u = ease_in_out_cubic((f - F0) / (F_NIGHT - F0 + 20))
            p = yb.lerp(Y0, u)
        elif f < F_MATCH + 8:
            p = Y0
        else:
            u = ease_in_out_cubic((f - F_MATCH - 8) / (F_MEET - F_MATCH - 8))
            p = thread_point(MU * u) if u < 1 else YOU_END
            p = p.lerp(YOU_END, ease_in_cubic(u) * 0.0 + max(0.0, (u - 0.8) / 0.2) ** 2)
        if f >= F_MEET - 6:
            s = spring_f(f, F_MEET - 6, 0.6, 0.15)
            p = Vector(p).lerp(YOU_END, s)
        you.location = (p[0], p[1], p[2] + 0.01 * math.sin(1.3 * t)); you.keyframe_insert('location', frame=f)
    # she has been waiting out there; she reappears far away before the match
    set_visible(them, F0 + 60, True)
    for f in R:
        t = f / FPS
        if f < F_MATCH + 8:
            p = H0 + Vector((0.0, 0.0, 0.03 * math.sin(0.9 * t)))
        else:
            u = ease_in_out_cubic((f - F_MATCH - 8) / (F_MEET - F_MATCH - 8))
            p = thread_point(1 - (1 - MU) * u)
            p = p.lerp(HER_END, max(0.0, (u - 0.8) / 0.2) ** 2)
        if f >= F_MEET - 6:
            p = Vector(p).lerp(HER_END, spring_f(f, F_MEET - 6, 0.6, 0.15))
        them.location = tuple(p); them.keyframe_insert('location', frame=f)
        k = 1.22
        them.scale = (k, k, k); them.keyframe_insert('scale', frame=f)
    # her light: dim like everyone, then flares in your colours on the hit
    keyed_value(tv['glow'], lambda f: (0.6 if f < F_MATCH else 0.9 + 3.2 * math.exp(-(f - F_MATCH) / 10.0)), range(F0, F1 + 1))
    keyed_value(tv['tint'], lambda f: 1.05, range(F0, F0 + 1))
    keyed_value(yv['glow'], lambda f: 1.65 if f < F_MATCH else 1.4 + 2.4 * math.exp(-(f - F_MATCH) / 10.0), range(F0, F1 + 1))
    for vals in (yv, tv):
        for k in ('lens_glass', 'lens_photo'):
            keyed_value(vals[k], lambda f: 0.0, range(F0, F0 + 1))

    # ---------------- the search pulses: shells of light that sweep through the sky
    for k, fp in enumerate(F_PULSES):
        bpy.ops.mesh.primitive_uv_sphere_add(radius=1.0, location=tuple(Y0), segments=64, ring_count=32)
        sh = bpy.context.object; sh.name = f'Pulse{k}'; sh.visible_shadow = False
        m = bpy.data.materials.new(f'Pulse{k}'); nt = node_tree(m)
        lw = N(nt, 'ShaderNodeLayerWeight'); lw.inputs['Blend'].default_value = 0.12
        sv = VAL(nt, 0.0, 'strength')
        em = N(nt, 'ShaderNodeEmission'); em.inputs['Color'].default_value = rgba('#ffd7a3')
        L(nt, M(nt, 'MULTIPLY', M(nt, 'POWER', lw.outputs['Facing'], 3.0), sv.outputs[0]), em.inputs['Strength'])
        tr = N(nt, 'ShaderNodeBsdfTransparent')
        out_surface(nt, add_shader(nt, tr.outputs[0], em.outputs[0]))
        sh.data.materials.append(m)
        for f in range(fp - 1, fp + 62):
            u = (f - fp) / 60.0
            rr = 0.2 + 22.0 * ease_out_cubic(u) ** 1.2; sh.scale = (rr, rr, rr); sh.keyframe_insert('scale', frame=f)
            sv.outputs[0].default_value = 2.2 * (1 - ease_in_out_sine(u)); sv.outputs[0].keyframe_insert('default_value', frame=f)
        set_visible(sh, 0, False); set_visible(sh, fp, True); set_visible(sh, fp + 62, False)

    # ---------------- the thread
    pts = [tuple(thread_point(i / 7)) for i in range(8)]
    th = light_curve('Thread', pts, 0.0045, '#ffd29a', 22.0)
    for f in range(F_MATCH - 1, F_MEET + 20):
        if f < F_MATCH + 8:
            st, en = 0.0, ease_out_expo((f - F_MATCH) / 8)
        else:
            u = ease_in_out_cubic((f - F_MATCH - 8) / (F_MEET - F_MATCH - 8))
            st, en = MU * u, 1 - (1 - MU) * u
        th.data.bevel_factor_start = clamp01(st); th.data.bevel_factor_end = clamp01(max(st + 0.002, en))
        th.data.keyframe_insert('bevel_factor_start', frame=f); th.data.keyframe_insert('bevel_factor_end', frame=f)
    set_visible(th, 0, False); set_visible(th, F_MATCH, True); set_visible(th, F_MEET + 4, False)
    # a ring of light bursts around her on the hit
    bpy.ops.mesh.primitive_torus_add(major_radius=0.2, minor_radius=0.006, location=tuple(H0), rotation=(math.pi / 2, 0, 0))
    ring = bpy.context.object; ring.name = 'MatchRing'; ring.visible_shadow = False
    rm = glow('MatchRing', '#ffc46b', 18.0); ring.data.materials.append(rm)
    for f in range(F_MATCH - 1, F_MATCH + 30):
        u = ease_out_cubic((f - F_MATCH) / 28); k = lerp(1.0, 3.2, u)
        ring.scale = (k, k, 1); ring.keyframe_insert('scale', frame=f)
        emission_node(rm).inputs['Strength'].default_value = 18.0 * (1 - u); emission_node(rm).inputs['Strength'].keyframe_insert('default_value', frame=f)
    set_visible(ring, 0, False); set_visible(ring, F_MATCH, True); set_visible(ring, F_MATCH + 30, False)
    shards('MatchSpark', tuple(H0), 50, F_MATCH, speed=(0.4, 1.4), life=(22, 40), size=(0.006, 0.016), tint='#ffc46b', seed=21, gravity=0.4)
    bpy.ops.mesh.primitive_torus_add(major_radius=0.3, minor_radius=0.005, location=tuple(MEET + Vector((0, 0.03, 0))), rotation=(math.pi / 2, 0, 0))
    lr = bpy.context.object; lr.name = 'LandRing'; lr.visible_shadow = False
    lm = glow('LandRing', '#ffffff', 12.0); lr.data.materials.append(lm)
    for f in range(F_MEET - 1, F_MEET + 30):
        u = ease_out_cubic((f - F_MEET) / 28); k = lerp(1.0, 5.0, u)
        lr.scale = (k, k, 1); lr.keyframe_insert('scale', frame=f)
        emission_node(lm).inputs['Strength'].default_value = 12.0 * (1 - u); emission_node(lm).inputs['Strength'].keyframe_insert('default_value', frame=f)
    set_visible(lr, 0, False); set_visible(lr, F_MEET, True); set_visible(lr, F_MEET + 30, False)
    shards('LandSpark', tuple(MEET), 40, F_MEET, speed=(0.3, 1.1), life=(20, 34), size=(0.005, 0.012), tint='#ffffff', seed=23, gravity=0.5)

    # ---------------- speed: dust along the path that streaks as you rush
    random.seed(9)
    dust_m = emissive('Dust', '#fff1dc', 6.0)
    for i in range(160):
        u = random.uniform(-0.1, 1.1)
        p = thread_point(u) + Vector((random.uniform(-1.4, 1.4), random.uniform(-0.6, 0.6), random.uniform(-1.0, 1.0)))
        if (p - thread_point(min(1, max(0, u)))).length < 0.35: continue
        bpy.ops.mesh.primitive_ico_sphere_add(radius=random.uniform(0.004, 0.009), subdivisions=1, location=tuple(p))
        d = bpy.context.object; d.name = f'Dust{i:03d}'; d.data.materials.append(dust_m); d.visible_shadow = False
        set_visible(d, 0, False); set_visible(d, F_MATCH, True); set_visible(d, F_MEET + 30, False)

    # ---------------- "You both put Family first." slams in word by word as you land
    bt = kinetic('Both', 'both', MEET + Vector((0.0, 0.0, 0.50)), scale=0.92)
    animate_kinetic(bt, F_MEET + 2, F1 + 8, style='slam', stagger=5, exit='scatter', seed=9, by='word')
    ctx['both_type'] = None
    ctx['meet'] = MEET; ctx['you_end_c'] = YOU_END; ctx['her_end_c'] = HER_END; ctx['cam_final_c'] = CAM_FINAL

def cam(f, ctx, prev):
    (px, py, pz), (prx, pry, prz), pfoc, pfs = prev
    you_p = None
    # rise with you as the sun sets
    if f < F_NIGHT:
        u = ease_in_out_cubic((f - F0) / (F_NIGHT - F0))
        tgt = Vector((0.0, 1.95, 1.88))
        x, y, z = vlerp((px, py, pz), tuple(tgt), u)
        pitch = lerp(math.degrees(prx), 97.0, u); yaw = lerp(math.degrees(prz), 0.0, u)
        return (x, y, z), (math.radians(pitch), 0.0, math.radians(yaw)), Y0.y - y, lerp(pfs, 2.0, u)
    # orbit slowly around you while the pulses sweep the sky
    if f < F_MATCH:
        u = ease_in_out_sine((f - F_NIGHT) / (F_MATCH - F_NIGHT))
        ang = math.radians(lerp(0.0, 52.0, u)); d = lerp(1.45, 1.75, u)
        pos = Y0 + Vector((math.sin(ang) * d, -math.cos(ang) * d, -0.12 + 0.1 * u))
        yaw = math.degrees(ang)
        return tuple(pos), (math.radians(lerp(97.0, 95.0, u)), 0.0, math.radians(yaw)), d, 2.0
    # the hit: whip to look along the thread, ride behind you to the meeting, settle into the two-shot.
    # One continuous aim point and one continuous position through all three, by construction.
    ang_end = math.radians(52.0); d_end = 1.75
    p_orbit = Y0 + Vector((math.sin(ang_end) * d_end, -math.cos(ang_end) * d_end, -0.02))
    look_orbit = Y0 + Vector((0, 0, 0.12))
    def ride_state(g):
        u = ease_in_out_cubic((g - F_MATCH - 8) / (F_MEET - F_MATCH - 8))
        you_now = thread_point(MU * u)
        ride = you_now + Vector((0.18, -1.05, 0.10))
        w = ease_in_out_cubic((g - F_MATCH - 8) / 24)
        pos = p_orbit.lerp(ride, w)
        aim = look_orbit.lerp(you_now.lerp(H0, 0.12) + Vector((0, 0.5, 0.05)), w)
        return pos, aim, you_now
    FS = F_MEET - 6
    if f < FS:
        pos, aim, you_now = ride_state(f)
        roll = -4.0 * math.sin(math.pi * clamp01((f - F_MATCH) / (FS - F_MATCH)))
    else:
        p0, a0, _ = ride_state(FS)
        u = ease_in_out_sine((f - FS) / (F1 - FS))
        pos = p0.lerp(CAM_FINAL, u); aim = a0.lerp(MEET, ease_in_out_sine(min(1.0, (f - FS) / 50.0)))
        roll = 0.0
    look = (aim - pos).normalized()
    yaw = math.degrees(math.atan2(-look.x, look.y)); pitch = 90 + math.degrees(math.asin(max(-1, min(1, look.z))))
    return tuple(pos), (math.radians(pitch), math.radians(roll), math.radians(yaw)), (aim - pos).length, lerp(2.0, 2.8, clamp01((f - FS) / 80))
