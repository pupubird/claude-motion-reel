# Act A (film bars 1–3, frames 0–363): the hook clears itself in a fogged pane on the beats,
# the camera dives through "friends" on the drop, strangers pass as frosted-glass people, and two
# of them slide together; their overlap turns gold and the world turns from dusk to day.
# The look of the approved scenes 1–2 style test, carried into the film unchanged.
import bpy, json, math, os, random
from mathutils import Vector
from afx import *

HOOK = json.load(open(os.path.join(FILM, 'type/hook/type.json')))
HOOK_MASK = os.path.join(FILM, 'type/hook/hook_mask.png')
F_END = round(bar(4))                      # act B takes over here
RANGE = range(0, F_END + 60)               # keys a little past the handoff for continuity
Y_MARK, R_HERO, Z_MARK = 3.40, 0.16, 0.14
F_PUSH, F_CROSS = round(beat(3)), round(beat(4))
F_MEET0, F_MEET = round(beat(6)), round(beat(8))
F_WM1, F_WM2 = round(beat(9)), round(beat(9.5))
Y_END = 2.40

def aim(ob, target):
    c = ob.constraints.new('TRACK_TO'); c.target = target; c.track_axis = 'TRACK_NEGATIVE_Z'; c.up_axis = 'UP_Y'
def area(name, loc, size, power, hexc, size_y=None):
    ld = bpy.data.lights.new(name, 'AREA'); ld.energy = power; ld.color = srgb(hexc)
    if size_y: ld.shape = 'RECTANGLE'; ld.size = size; ld.size_y = size_y
    else: ld.size = size
    ob = bpy.data.objects.new(name, ld); link(ob); ob.location = loc
    return ob

def build(ctx):
    # ---------------- the light world behind the glass (a far backdrop: dusk, then day)
    bpy.ops.mesh.primitive_plane_add(size=1, location=(0, 14.0, 0), rotation=(math.pi / 2, 0, 0))
    back = bpy.context.object; back.name = 'Backdrop'; back.scale = (30, 46, 1)
    mb = bpy.data.materials.new('Backdrop'); nt = node_tree(mb)
    tc = N(nt, 'ShaderNodeTexCoord'); sep = N(nt, 'ShaderNodeSeparateXYZ'); L(nt, tc.outputs['Generated'], sep.inputs[0])
    def ramp_node(stops):
        r = N(nt, 'ShaderNodeValToRGB'); L(nt, sep.outputs['Y'], r.inputs['Fac']); cr = r.color_ramp
        cr.elements[0].position, cr.elements[0].color = stops[0][0], rgba(stops[0][1])
        cr.elements[1].position, cr.elements[1].color = stops[-1][0], rgba(stops[-1][1])
        for p_, h in stops[1:-1]:
            el = cr.elements.new(p_); el.color = rgba(h)
        return r
    dusk = ramp_node([(0.30, '#ffc86a'), (0.37, '#ffdba0'), (0.42, '#3f8ef0'), (0.50, '#1f63d8'), (0.66, '#1a4fbf'), (0.88, '#123d9c')])
    day = ramp_node([(0.30, '#ffd9bd'), (0.42, '#fff1e6'), (0.58, '#f6f4f8'), (0.86, '#e6ecfb')])
    DAWN = VAL(nt, 0.0, 'dawn')
    em = N(nt, 'ShaderNodeEmission'); L(nt, mixrgb(nt, DAWN.outputs[0], dusk.outputs['Color'], day.outputs['Color']), em.inputs['Color'])
    L(nt, M(nt, 'ADD', 0.9, M(nt, 'MULTIPLY', DAWN.outputs[0], 2.3)), em.inputs['Strength'])
    out_surface(nt, em.outputs[0])
    back.data.materials.append(mb)
    ctx['backdrop'] = back; ctx['dawn'] = DAWN

    random.seed(7)
    bokeh_mats = [emissive(f'Bokeh{i}', h, 16.0) for i, h in enumerate(['#ffc56e', '#ffa463', '#ff7fa8', '#ffdcae', '#8fa6ff', '#b99aff'])]
    bokeh = []
    for i in range(22):
        y = random.uniform(8.0, 13.5); spread = 0.42 * y
        x = random.uniform(-spread, spread); z = random.uniform(-spread * 1.3, spread * 1.1)
        bpy.ops.mesh.primitive_uv_sphere_add(radius=random.uniform(0.05, 0.09), location=(x, y, z), segments=16, ring_count=8)
        b = bpy.context.object; b.name = f'Bokeh{i:02d}'; b.data.materials.append(random.choice(bokeh_mats)); b.visible_shadow = False
        bokeh.append(b)

    # ---------------- city glow just behind the glass (hook only)
    random.seed(23)
    glow_cols = ['#ffb46b', '#ff8a5c', '#ff7f9e', '#ffd28a', '#ffc27a', '#ff9d7a', '#ffa985', '#a9b4ff']
    glows = []; CAM_D = 0.86; placed = tries = 0
    while placed < 16 and tries < 5000:
        tries += 1; below = placed < 11
        gx = random.uniform(-1.0, 1.0); gy = random.uniform(0.7, 1.7)
        gz = random.uniform(-1.7, -0.6) if below else random.uniform(0.7, 1.6)
        k = CAM_D / (CAM_D + gy); px, pz = gx * k, gz * k
        if abs(px) > 0.42 or abs(pz) < 0.30 or abs(pz) > 0.62: continue
        r = random.uniform(0.07, 0.18) if below else random.uniform(0.05, 0.10)
        bpy.ops.mesh.primitive_uv_sphere_add(radius=r, location=(gx, gy, gz), segments=24, ring_count=12)
        g = bpy.context.object; g.name = f'Glow{placed:02d}'; g.visible_shadow = False
        g.data.materials.append(emissive(f'Glow{placed:02d}', glow_cols[placed % len(glow_cols)],
                                         random.uniform(9.0, 16.0) if below else random.uniform(4.0, 7.0)))
        glows.append(g); placed += 1

    # ---------------- the fogged pane with the hook
    HR = HOOK['hookRegion']; LINES = HOOK['lines']
    bpy.ops.mesh.primitive_plane_add(size=1, location=(0, 0, 0), rotation=(math.pi / 2, 0, 0))
    pane = bpy.context.object; pane.name = 'Pane'; pane.scale = (2.4, 4.0, 1)
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    sol = pane.modifiers.new('Thickness', 'SOLIDIFY'); sol.thickness = 0.008; sol.offset = 0
    mp = bpy.data.materials.new('Pane'); nt = node_tree(mp)
    tc = N(nt, 'ShaderNodeTexCoord'); sep = N(nt, 'ShaderNodeSeparateXYZ'); L(nt, tc.outputs['Object'], sep.inputs[0])
    X = sep.outputs['X']; Z = sep.outputs['Y']
    u = M(nt, 'DIVIDE', M(nt, 'SUBTRACT', X, HR['x0']), HR['x1'] - HR['x0'])
    v = M(nt, 'DIVIDE', M(nt, 'SUBTRACT', Z, HR['z0']), HR['z1'] - HR['z0'])
    cxyz = N(nt, 'ShaderNodeCombineXYZ'); L(nt, u, cxyz.inputs['X']); L(nt, v, cxyz.inputs['Y'])
    img = N(nt, 'ShaderNodeTexImage', extension='CLIP', interpolation='Cubic')
    img.image = bpy.data.images.load(HOOK_MASK); img.image.colorspace_settings.name = 'Non-Color'
    L(nt, cxyz.outputs[0], img.inputs['Vector'])
    sc = N(nt, 'ShaderNodeSeparateColor'); L(nt, img.outputs['Color'], sc.inputs['Color'])
    noise = N(nt, 'ShaderNodeTexNoise'); noise.inputs['Scale'].default_value = 38.0; noise.inputs['Detail'].default_value = 4.0
    L(nt, tc.outputs['Object'], noise.inputs['Vector'])
    xn = M(nt, 'ADD', X, M(nt, 'MULTIPLY', M(nt, 'SUBTRACT', noise.outputs['Fac'], 0.5), 0.05))
    SOFT = 0.035
    fronts, clear = [], None
    for i, ch in enumerate(('Red', 'Green', 'Blue')):
        front = VAL(nt, LINES[i]['x0'] - SOFT, f'front{i}'); fronts.append(front)
        rev = M(nt, 'DIVIDE', M(nt, 'SUBTRACT', front.outputs[0], xn), SOFT, clamp=True)
        m_i = M(nt, 'MULTIPLY', sc.outputs[ch], rev)
        clear = m_i if clear is None else M(nt, 'MAXIMUM', clear, m_i)
    frost_tr = N(nt, 'ShaderNodeBsdfTranslucent'); frost_tr.inputs['Color'].default_value = rgba('#f4efe9')
    frost_df = N(nt, 'ShaderNodeBsdfDiffuse'); frost_df.inputs['Color'].default_value = rgba('#f6f2ee')
    frost_gl = N(nt, 'ShaderNodeBsdfGlass'); frost_gl.inputs['Roughness'].default_value = 0.42; frost_gl.inputs['IOR'].default_value = 1.33
    fm1 = mix_shader(nt, 0.35, frost_tr.outputs[0], frost_df.outputs[0])
    patch = N(nt, 'ShaderNodeTexNoise'); patch.inputs['Scale'].default_value = 2.6; patch.inputs['Detail'].default_value = 3.0
    L(nt, tc.outputs['Object'], patch.inputs['Vector'])
    fm2 = mix_shader(nt, M(nt, 'ADD', 0.55, M(nt, 'MULTIPLY', patch.outputs['Fac'], 0.3)), fm1, frost_gl.outputs[0])
    vor = N(nt, 'ShaderNodeTexVoronoi'); vor.inputs['Scale'].default_value = 120.0; L(nt, tc.outputs['Object'], vor.inputs['Vector'])
    bead = maprange(nt, vor.outputs['Distance'], 0.0, 0.34, 1.0, 0.0)
    vor2 = N(nt, 'ShaderNodeTexVoronoi'); vor2.inputs['Scale'].default_value = 34.0; L(nt, tc.outputs['Object'], vor2.inputs['Vector'])
    bead2 = maprange(nt, vor2.outputs['Distance'], 0.0, 0.22, 1.0, 0.0)
    beads = M(nt, 'MAXIMUM', bead, M(nt, 'MULTIPLY', bead2, 1.6))
    bump = N(nt, 'ShaderNodeBump'); bump.inputs['Strength'].default_value = 0.55; bump.inputs['Distance'].default_value = 0.0015
    L(nt, beads, bump.inputs['Height'])
    for s_ in (frost_df, frost_gl, frost_tr): L(nt, bump.outputs['Normal'], s_.inputs['Normal'])
    clear_gl = N(nt, 'ShaderNodeBsdfGlass'); clear_gl.inputs['Roughness'].default_value = 0.0; clear_gl.inputs['IOR'].default_value = 1.45
    out_surface(nt, mix_shader(nt, clear, fm2, clear_gl.outputs[0]))
    pane.data.materials.append(mp)
    for i, b_ in enumerate((0, 1, 2)):
        f0 = beat(b_) - (1 if b_ == 0 else 0)
        x0, x1 = LINES[i]['x0'] - SOFT, LINES[i]['x1'] + 2 * SOFT + 0.03
        keyed_value(fronts[i], lambda f, f0=f0, x0=x0, x1=x1: lerp(x0, x1, ease_out_cubic((f - f0) / 11)), range(0, F_CROSS + 2))
    pane.hide_render = False; pane.keyframe_insert('hide_render', frame=0)
    pane.hide_render = True; pane.keyframe_insert('hide_render', frame=F_CROSS)
    for g in glows:
        g.hide_render = False; g.keyframe_insert('hide_render', frame=0)
        g.hide_render = True; g.keyframe_insert('hide_render', frame=F_CROSS - 2)

    # ---------------- lights on our side
    target = empty('PaneCentre', (0, 0, 0))
    key = area('Key', (-0.95, -1.05, 0.85), 0.7, 150, '#fff1e2'); aim(key, target)
    fill = area('Fill', (1.6, -1.4, -0.4), 2.2, 90, '#e8eeff'); aim(fill, target)
    sweep = area('Sweep', (-0.9, -0.9, 0.9), 0.08, 60, '#ffffff', size_y=1.8); sweep.rotation_euler = (math.radians(90), 0, 0)
    for f in range(0, F_CROSS + 2):
        sweep.location = (lerp(-0.9, 0.9, ease_in_out_sine(f / 118)), -0.9, 0.9); sweep.keyframe_insert('location', frame=f)
    for f, e in ((0, 60), (F_CROSS - 6, 60), (F_CROSS, 0)):
        sweep.data.energy = e; sweep.data.keyframe_insert('energy', frame=f)
    ctx['lights_a'] = (key, fill)

    # ---------------- strangers passing the lens on the dive
    FIELD = [((0.30, 0.70, 0.16), 0.10, 'takumi', ('health', 'learning', 'career')),
             ((-0.40, 1.30, -0.26), 0.12, 'adaeze', ('money', 'adventure', 'health')),
             ((0.44, 1.95, -0.18), 0.11, 'mateo', ('learning', 'family', 'money')),
             ((-0.52, 2.45, 0.30), 0.12, 'camille', ('career', 'money', 'health')),
             ((0.16, 0.95, -0.22), 0.09, 'giulia', ('family', 'learning', 'money')),
             ((-0.20, 1.55, 0.20), 0.10, 'jiwoo', ('adventure', 'health', 'learning')),
             ((0.24, 2.05, 0.26), 0.10, 'imani', ('money', 'career', 'family')),
             ((-0.26, 0.55, -0.05), 0.08, 'liam', ('learning', 'adventure', 'career'))]
    random.seed(11)
    for i, (loc, rad, who, prio) in enumerate(FIELD):
        coin, _ = person(f'P{i:02d}', loc, rad, who, prio, sharp=False)
        ph = random.uniform(0, 6.28)
        for f in range(0, F_END + 4, 4):
            t = f / FPS
            coin.location = (loc[0] + 0.012 * math.sin(0.9 * t + ph), loc[1], loc[2] + 0.016 * math.sin(1.1 * t + ph * 1.3))
            coin.rotation_euler = (math.pi / 2 + 0.22 * math.sin(0.7 * t + ph), 0, 0.35 + 0.25 * math.sin(0.5 * t + ph))
            coin.keyframe_insert('location', frame=f); coin.keyframe_insert('rotation_euler', frame=f)
        visible_between(coin, 0, F_END)

    # ---------------- the heroes: you (Hana) and the match (Sofia)
    you, yv = person('You', (-0.105, Y_MARK, Z_MARK), R_HERO, 'hana', PAIR)
    them, tv = person('Them', (0.105, Y_MARK + 0.045, Z_MARK), R_HERO, 'sofia', PAIR)
    bind_lens(you, yv, them); bind_lens(them, tv, you)
    for vals in (yv, tv):
        for k in ('lens_glass', 'lens_photo'):
            keyed_value(vals[k], lambda f: ease_out_cubic((f - (F_MEET - 3)) / 14), range(0, F_END + 1))
    for f in range(0, F_END + 1):
        t = f / FPS; s_ = spring_f(f, F_MEET0, 1.0, 0.15)
        you.location = (lerp(-0.78, -0.105, s_), Y_MARK, Z_MARK + 0.010 * math.sin(1.3 * t)); you.keyframe_insert('location', frame=f)
        them.location = (lerp(0.78, 0.105, s_), Y_MARK + 0.045, Z_MARK + 0.010 * math.sin(1.3 * t + 1.7)); them.keyframe_insert('location', frame=f)
    ctx.update(you=you, them=them, you_v=yv, them_v=tv)

    # ---------------- the wordmark: letters fly in out of depth, then scatter toward the lens
    wm = kinetic('WM', 'wm', (0.0, Y_MARK - 0.03, -0.155), scale=1.0, strength=1.0)
    animate_kinetic(wm, F_WM1 - 6, F_END - 2, style='fly', stagger=2.0, exit='scatter', seed=2, depth=0.45)
    ctx['wm_a'] = {}
    # ---------------- the meeting lands: a shockwave ring and gold sparks
    bpy.ops.mesh.primitive_torus_add(major_radius=0.12, minor_radius=0.004, location=(0, Y_MARK + 0.02, Z_MARK), rotation=(math.pi / 2, 0, 0))
    ring = bpy.context.object; ring.name = 'MeetRing'; ring.visible_shadow = False
    rm = glow('MeetRing', '#ffb347', 14.0); ring.data.materials.append(rm)
    for f in range(F_MEET - 1, F_MEET + 32):
        u = ease_out_cubic((f - F_MEET) / 30); k = lerp(1.0, 7.0, u)
        ring.scale = (k, k, 1); ring.keyframe_insert('scale', frame=f)
        emission_node(rm).inputs['Strength'].default_value = 14.0 * (1 - u); emission_node(rm).inputs['Strength'].keyframe_insert('default_value', frame=f)
    set_visible(ring, 0, False); set_visible(ring, F_MEET, True); set_visible(ring, F_MEET + 32, False)

    # ---------------- dawn: their light floods the world
    keyed_value(DAWN, lambda f: ease_in_out_sine((f - (F_MEET - 4)) / 34), range(0, F_END + 1))
    for bm in bokeh_mats:
        keyed(emission_node(bm).inputs['Strength'], 'default_value',
              lambda f: 16.0 * (1 - ease_in_out_sine((f - (F_MEET - 4)) / 30)), range(0, F_END + 1))
    F_DAY = F_MEET + 30
    for b in bokeh:
        visible_between(b, 0, F_DAY)
    mark_target = empty('MarkCentre', (0, Y_MARK, Z_MARK))
    top = area('Top', (-0.6, Y_MARK - 1.0, 1.2), 0.9, 220, '#fff4e8'); aim(top, mark_target)
    ctx['top'] = top
    ctx['FRIENDS'] = ((LINES[2]['x0'] + LINES[2]['x1']) / 2, (LINES[2]['z0'] + LINES[2]['z1']) / 2)
    # the sky only lights act A (the camera sees the backdrop): a dim studio grey
    rot = rot_for_sun(-20.0)
    def sky(f):
        if f < F_CROSS: return {'studio': 1.0, 'strength': 1.0, 'light': 0.7, 'rot': rot}
        u = ease_in_out_sine((f - (F_MEET - 4)) / 34)
        return {'sunny2': 1 - u, 'sunny': u, 'strength': lerp(1.05, 1.15, u), 'light': 1.0, 'rot': rot}
    key_sky(ctx['sky'], range(0, F_END), sky)
    set_visible(back, F_CROSS + 1, False)    # the far backdrop hands over to the real sky inside the bloom

def cam(f, ctx):
    """((x, y, z), (rx, ry, rz) radians, focus distance, f-stop) for act A frames."""
    FR = ctx['FRIENDS']; F_LAND = F_MEET
    if f <= F_PUSH:
        s = ease_in_out_sine(f / F_PUSH)
        x, y, z = lerp(-0.018, -0.024, s), lerp(-0.86, -0.72, s), lerp(0.0, -0.01, s)
        return (x, y, z), (math.radians(90), math.radians(lerp(-1.2, -0.4, f / F_PUSH)), 0), -y, 2.2
    if f <= F_CROSS:
        s = (f - F_PUSH) / (F_CROSS - F_PUSH)
        x = lerp(-0.024, FR[0], ease_in_out_sine(s)); z = lerp(-0.01, FR[1], ease_in_out_sine(s))
        y = lerp(-0.72, 0.0, ease_in_cubic(s))
        return (x, y, z), (math.radians(90), math.radians(lerp(-0.4, 1.5, s)), 0), max(0.03, -y), 2.2
    s = (f - F_CROSS) / (F_LAND - F_CROSS)
    x = lerp(FR[0], 0.0, ease_out_quint(s)); z = lerp(FR[1], 0.02, ease_out_quint(s))
    y = lerp(0.0, Y_END, ease_out_cubic(s))
    if f > F_LAND: y = Y_END + 0.05 * (f - F_LAND) / FPS
    z += kick(f, F_MEET, 0.02)
    # the swing: orbit round the mark as the name lands
    o = ease_in_out_cubic((f - round(beat(10))) / 70)
    ang = math.radians(-32.0 * o); d = Y_MARK - y
    x = x + d * math.sin(ang); y = Y_MARK - d * math.cos(ang)
    return (x, y, z), (math.radians(90), math.radians(lerp(1.5, 0.0, ease_out_cubic(s))), ang), d, 0.7 if f < F_LAND else lerp(0.7, 2.4, ease_in_out_sine((f - F_LAND) / 60))

def exposure(f):
    d = (f - F_CROSS) / 5.0
    return 2.6 * math.exp(-d * d)
