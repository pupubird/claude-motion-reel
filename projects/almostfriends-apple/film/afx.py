# afx: the shared toolkit for the "almost friends" film (Blender 5.2, Cycles).
# Timing from film/timing.json, eases and springs, node helpers, materials (glass, people,
# type), the sky dome with keyed palettes, and per-frame keyframing helpers.
import bpy, json, math, os, random
from mathutils import Vector

FILM = os.path.dirname(os.path.abspath(__file__))
PROJECT = os.path.abspath(os.path.join(FILM, '..'))
TYPE_DIR = os.path.join(FILM, 'type')
PEOPLE = os.path.abspath(os.path.join(PROJECT, '../almostfriends/assets/people'))
BLUR_DIR = os.path.join(PROJECT, 'assets/people_blur')
TIMING = json.load(open(os.path.join(FILM, 'timing.json')))
TYPE = json.load(open(os.path.join(TYPE_DIR, 'type.json')))
CROPS = json.load(open(os.path.join(PEOPLE, 'crops.json')))
FPS = 60
END = TIMING['frames']
FRAMES = range(0, END + 1)

INK, GREY, WHITE = '#1d1d1f', '#6e6e73', '#ffffff'
HUES = {'family': '#ff7a3d', 'adventure': '#ffb21f', 'career': '#3b82ff',
        'health': '#2fd08a', 'learning': '#8f6bff', 'money': '#14b8b0'}
PAIR = ('family', 'adventure', 'career')

# ---------------------------------------------------------------- timing
def beat(i):
    """Frame (float) of film beat i, fractional allowed."""
    B = TIMING['beats_s']; k = int(math.floor(i)); f = i - k
    return (B[k] + (B[k + 1] - B[k]) * f) * FPS
def bar(n, b=0):
    """Frame of film bar n (1-based), beat b within it (0-based, fractional allowed)."""
    return beat((n - 1) * 4 + b)

# ---------------------------------------------------------------- eases and springs
def clamp01(x): return max(0.0, min(1.0, x))
def lerp(a, b, s): return a + (b - a) * s
def vlerp(a, b, s): return tuple(lerp(x, y, s) for x, y in zip(a, b))
def ease_in_cubic(s): s = clamp01(s); return s ** 3
def ease_out_cubic(s): s = clamp01(s); return 1 - (1 - s) ** 3
def ease_out_quart(s): s = clamp01(s); return 1 - (1 - s) ** 4
def ease_out_quint(s): s = clamp01(s); return 1 - (1 - s) ** 5
def ease_in_quint(s): s = clamp01(s); return s ** 5
def ease_out_expo(s): s = clamp01(s); return 1.0 if s >= 1 else 1 - 2 ** (-10 * s)
def ease_in_out_sine(s): s = clamp01(s); return 0.5 - 0.5 * math.cos(math.pi * s)
def ease_in_out_cubic(s):
    s = clamp01(s); return 4 * s ** 3 if s < 0.5 else 1 - (-2 * s + 2) ** 3 / 2
def smooth(s): s = clamp01(s); return s * s * (3 - 2 * s)
def spring(t, duration=0.5, bounce=0.15):
    """Step response of Apple's (duration, bounce) spring; t in seconds."""
    if t <= 0: return 0.0
    w = 2 * math.pi / duration; z = 1 - bounce
    if z >= 1: return 1 - math.exp(-w * t) * (1 + w * t)
    wd = w * math.sqrt(1 - z * z)
    return 1 - math.exp(-z * w * t) * (math.cos(wd * t) + (z * w / wd) * math.sin(wd * t))
def spring_f(f, f0, duration=0.5, bounce=0.15): return spring((f - f0) / FPS, duration, bounce)
def window(f, f0, f1): return clamp01((f - f0) / max(1e-6, f1 - f0))
def pulse(f, f0, attack, release):
    """0 → 1 over `attack` frames from f0, then back to 0 over `release` frames."""
    if f < f0: return 0.0
    if f < f0 + attack: return ease_out_cubic((f - f0) / attack)
    return 1 - ease_in_out_sine((f - f0 - attack) / release)

# ---------------------------------------------------------------- colour
def srgb(h):
    h = h.lstrip('#'); c = [int(h[i:i + 2], 16) / 255 for i in (0, 2, 4)]
    return tuple(x / 12.92 if x <= 0.04045 else ((x + 0.055) / 1.055) ** 2.4 for x in c)
def rgba(h): return (*srgb(h), 1.0)

# ---------------------------------------------------------------- node helpers
def node_tree(idb):
    try: idb.use_nodes = True
    except Exception: pass
    nt = idb.node_tree
    for n in list(nt.nodes): nt.nodes.remove(n)
    return nt
def N(nt, kind, **kw):
    n = nt.nodes.new(kind)
    for k, v in kw.items(): setattr(n, k, v)
    return n
def L(nt, a, b): nt.links.new(a, b)
def M(nt, op, a=None, b=None, clamp=False):
    n = N(nt, 'ShaderNodeMath', operation=op); n.use_clamp = clamp
    for i, v in enumerate((a, b)):
        if v is None: continue
        if isinstance(v, (int, float)): n.inputs[i].default_value = v
        else: L(nt, v, n.inputs[i])
    return n.outputs[0]
def VAL(nt, v=0.0, label=''):
    n = N(nt, 'ShaderNodeValue'); n.outputs[0].default_value = v; n.label = label; n.name = label or n.name; return n
def RGB(nt, h):
    n = N(nt, 'ShaderNodeRGB'); n.outputs[0].default_value = rgba(h); return n.outputs[0]
def mixrgb(nt, fac, a, b):
    n = N(nt, 'ShaderNodeMix', data_type='RGBA')
    for sock, v in ((n.inputs[0], fac), (n.inputs[6], a), (n.inputs[7], b)):
        if isinstance(v, (int, float)): sock.default_value = v
        else: L(nt, v, sock)
    return n.outputs[2]
def maprange(nt, v, a, b, c=0.0, d=1.0, smooth_=True):
    n = N(nt, 'ShaderNodeMapRange', interpolation_type='SMOOTHSTEP' if smooth_ else 'LINEAR')
    if isinstance(v, (int, float)): n.inputs['Value'].default_value = v
    else: L(nt, v, n.inputs['Value'])
    n.inputs['From Min'].default_value = a; n.inputs['From Max'].default_value = b
    n.inputs['To Min'].default_value = c; n.inputs['To Max'].default_value = d
    return n.outputs[0]
def out_surface(nt, shader):
    o = N(nt, 'ShaderNodeOutputMaterial'); L(nt, shader, o.inputs['Surface']); return o
def mix_shader(nt, fac, a, b):
    n = N(nt, 'ShaderNodeMixShader')
    if isinstance(fac, (int, float)): n.inputs[0].default_value = fac
    else: L(nt, fac, n.inputs[0])
    L(nt, a, n.inputs[1]); L(nt, b, n.inputs[2]); return n.outputs[0]
def add_shader(nt, a, b):
    n = N(nt, 'ShaderNodeAddShader'); L(nt, a, n.inputs[0]); L(nt, b, n.inputs[1]); return n.outputs[0]

# ---------------------------------------------------------------- keyframing
def keyed(target, path, fn, frames=FRAMES, index=-1):
    for f in frames:
        v = fn(f)
        if index >= 0:
            getattr(target, path)[index] = v; target.keyframe_insert(path, index=index, frame=f)
        else:
            setattr(target, path, v); target.keyframe_insert(path, frame=f)
def keyed_value(node, fn, frames=FRAMES):
    keyed(node.outputs[0], 'default_value', fn, frames)
def fcurves(idb):
    ad = getattr(idb, 'animation_data', None)
    if not ad or not ad.action: return []
    out = []
    try:
        for layer in ad.action.layers:
            for strip in layer.strips:
                for cb in strip.channelbags: out.extend(cb.fcurves)
    except Exception: pass
    if not out:
        try: out = list(ad.action.fcurves)
        except Exception: pass
    return out
def linearize_all():
    ids = list(bpy.data.objects) + list(bpy.data.lights) + list(bpy.data.cameras) + list(bpy.data.curves) + \
          list(bpy.data.materials) + list(bpy.data.worlds) + list(bpy.data.scenes)
    for idb in ids:
        targets = [idb]
        if getattr(idb, 'node_tree', None) is not None: targets.append(idb.node_tree)
        for t in targets:
            for fc in fcurves(t):
                for kp in fc.keyframe_points:
                    if kp.interpolation != 'CONSTANT': kp.interpolation = 'LINEAR'   # held keys stay held
def visible_between(ob, f0, f1):
    """Render-visible only for frames f0 <= f < f1 (constant keys)."""
    ob.hide_render = True; ob.keyframe_insert('hide_render', frame=0)
    if f0 > 0:
        ob.hide_render = True; ob.keyframe_insert('hide_render', frame=max(0, int(f0) - 1))
    ob.hide_render = False; ob.keyframe_insert('hide_render', frame=int(f0))
    if f1 is not None and f1 <= END:
        ob.hide_render = True; ob.keyframe_insert('hide_render', frame=int(f1))
    for c in ob.children: visible_between(c, f0, f1)

# ---------------------------------------------------------------- materials
def emissive(name, hexc, strength):
    m = bpy.data.materials.new(name); nt = node_tree(m)
    e = N(nt, 'ShaderNodeEmission'); e.inputs['Color'].default_value = rgba(hexc); e.inputs['Strength'].default_value = strength
    out_surface(nt, e.outputs[0]); return m
def glow(name, hexc, strength):
    """Light with no body: emission added over a transparent surface, so when its strength is keyed down to 0
    it vanishes (an emission-only surface turns into a black shape instead)."""
    m = bpy.data.materials.new(name); nt = node_tree(m)
    e = N(nt, 'ShaderNodeEmission'); e.inputs['Color'].default_value = rgba(hexc); e.inputs['Strength'].default_value = strength
    t = N(nt, 'ShaderNodeBsdfTransparent')
    out_surface(nt, add_shader(nt, t.outputs[0], e.outputs[0])); return m
def emission_node(m):
    return [n for n in m.node_tree.nodes if n.type == 'EMISSION'][0]

def glass(name, rough=0.0, ior=1.45, tint='#ffffff'):
    m = bpy.data.materials.new(name); nt = node_tree(m)
    g = N(nt, 'ShaderNodeBsdfGlass'); g.inputs['Roughness'].default_value = rough; g.inputs['IOR'].default_value = ior
    g.inputs['Color'].default_value = rgba(tint)
    out_surface(nt, g.outputs[0]); return m

def frosted_glow(name, cols, strength=2.6, rough=0.32, tint_strength=1.0):
    """Frosted glass with three soft lights inside (the colours someone puts first).
    Returns (material, strength value node, colour mix value node)."""
    m = bpy.data.materials.new(name); nt = node_tree(m)
    tc = N(nt, 'ShaderNodeTexCoord'); sp = N(nt, 'ShaderNodeSeparateXYZ'); L(nt, tc.outputs['Generated'], sp.inputs[0])
    gx = M(nt, 'SUBTRACT', sp.outputs['X'], 0.5); gy = M(nt, 'SUBTRACT', sp.outputs['Y'], 0.5); gz = M(nt, 'SUBTRACT', sp.outputs['Z'], 0.5)
    acc_c = acc_w = None
    for (px, py), hexc in zip([(-0.2, 0.15), (0.2, 0.13), (0.0, -0.21)], cols):
        dx = M(nt, 'SUBTRACT', gx, px); dy = M(nt, 'SUBTRACT', M(nt, 'ADD', gy, gz), py)
        w = M(nt, 'EXPONENT', M(nt, 'MULTIPLY', M(nt, 'ADD', M(nt, 'MULTIPLY', dx, dx), M(nt, 'MULTIPLY', dy, dy)), -12.0))
        cw = N(nt, 'ShaderNodeVectorMath', operation='SCALE'); L(nt, RGB(nt, hexc), cw.inputs[0]); L(nt, w, cw.inputs['Scale'])
        if acc_c is None: acc_c, acc_w = cw.outputs[0], w
        else:
            a = N(nt, 'ShaderNodeVectorMath', operation='ADD'); L(nt, acc_c, a.inputs[0]); L(nt, cw.outputs[0], a.inputs[1])
            acc_c, acc_w = a.outputs[0], M(nt, 'ADD', acc_w, w)
    norm = N(nt, 'ShaderNodeVectorMath', operation='SCALE'); L(nt, acc_c, norm.inputs[0])
    L(nt, M(nt, 'DIVIDE', 1.0, M(nt, 'ADD', acc_w, 0.0001)), norm.inputs['Scale'])
    sv = VAL(nt, strength, 'strength')
    em = N(nt, 'ShaderNodeEmission'); L(nt, norm.outputs[0], em.inputs['Color']); L(nt, sv.outputs[0], em.inputs['Strength'])
    g = N(nt, 'ShaderNodeBsdfGlass'); g.inputs['Roughness'].default_value = rough; g.inputs['IOR'].default_value = 1.45
    out_surface(nt, add_shader(nt, g.outputs[0], em.outputs[0]))
    return m, sv

def type_material(name, key, mode='ink', strength=1.0):
    """A plane material for a type texture. mode 'ink': lit diffuse in the texture's colour.
    'glow': self-lit (for night). A 'reveal' value (0..1+) wipes the type up from its baseline,
    an 'alpha' value fades nothing by default (kept at 1) but is there for dissolves."""
    m = bpy.data.materials.new(name); nt = node_tree(m)
    tc = N(nt, 'ShaderNodeTexCoord')
    im = N(nt, 'ShaderNodeTexImage', extension='CLIP', interpolation='Cubic')
    im.image = bpy.data.images.load(os.path.join(TYPE_DIR, key + '.png')); L(nt, tc.outputs['UV'], im.inputs['Vector'])
    sp = N(nt, 'ShaderNodeSeparateXYZ'); L(nt, tc.outputs['UV'], sp.inputs[0])
    rv = VAL(nt, 1.2, 'reveal')
    up = M(nt, 'DIVIDE', M(nt, 'SUBTRACT', rv.outputs[0], sp.outputs['Y']), 0.08, clamp=True)
    dv = VAL(nt, 1.0, 'dissolve')   # 1 = solid; animate down to 0 with noise for a crumble
    noise = N(nt, 'ShaderNodeTexNoise'); noise.inputs['Scale'].default_value = 22.0; noise.inputs['Detail'].default_value = 6.0
    L(nt, tc.outputs['UV'], noise.inputs['Vector'])
    keep = M(nt, 'DIVIDE', M(nt, 'SUBTRACT', M(nt, 'ADD', dv.outputs[0], M(nt, 'MULTIPLY', noise.outputs['Fac'], 0.25)), 0.25), 0.05, clamp=True)
    alpha = M(nt, 'MULTIPLY', M(nt, 'MULTIPLY', im.outputs['Alpha'], up), keep)
    if mode == 'glow':
        body = N(nt, 'ShaderNodeEmission'); L(nt, im.outputs['Color'], body.inputs['Color']); body.inputs['Strength'].default_value = strength
    else:
        body = N(nt, 'ShaderNodeBsdfDiffuse'); L(nt, im.outputs['Color'], body.inputs['Color'])
    tr = N(nt, 'ShaderNodeBsdfTransparent')
    out_surface(nt, mix_shader(nt, alpha, tr.outputs[0], body.outputs[0]))
    return m, rv, dv

# ---------------------------------------------------------------- objects
def link(ob):
    if ob.name not in bpy.context.scene.collection.objects:
        bpy.context.scene.collection.objects.link(ob)
    return ob
def empty(name, loc=(0, 0, 0)):
    e = bpy.data.objects.new(name, None); link(e); e.location = loc; return e
def type_plane(name, key, centre, mode='ink', strength=1.0, scale=1.0, parent=None):
    """A plane carrying type texture `key`, its real size from type.json (metres) × scale.
    Faces -Y (toward a camera looking +Y). Returns (object, reveal node, dissolve node)."""
    w, h = TYPE[key]['wM'] * scale, TYPE[key]['hM'] * scale
    bpy.ops.mesh.primitive_plane_add(size=1, location=centre, rotation=(math.pi / 2, 0, 0))
    ob = bpy.context.object; ob.name = name; ob.scale = (w, h, 1); ob.visible_shadow = False
    m, rv, dv = type_material(name, key, mode, strength); ob.data.materials.append(m)
    if parent is not None:
        mw = ob.matrix_world.copy(); ob.parent = parent; ob.matrix_world = mw
    return ob, rv, dv

def rounded_box(name, size, radius, loc=(0, 0, 0), segments=10):
    """A box (x, y=depth, z) with all edges rounded by `radius`."""
    bpy.ops.mesh.primitive_cube_add(size=1, location=loc)
    ob = bpy.context.object; ob.name = name; ob.scale = size
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    bev = ob.modifiers.new('Round', 'BEVEL'); bev.width = radius; bev.segments = segments; bev.limit_method = 'NONE'
    bev.affect = 'EDGES'
    bpy.ops.object.shade_smooth()
    return ob

def make_coin(name, loc, radius, thick):
    bpy.ops.mesh.primitive_cylinder_add(vertices=160, radius=radius, depth=thick, location=loc, rotation=(math.pi / 2, 0, 0))
    ob = bpy.context.object; ob.name = name
    bev = ob.modifiers.new('Bevel', 'BEVEL'); bev.width = thick * 0.38; bev.segments = 8; bev.limit_method = 'ANGLE'
    bpy.ops.object.shade_smooth()
    try: bpy.ops.object.shade_auto_smooth(angle=math.radians(40))
    except Exception:
        try: bpy.ops.object.shade_smooth_by_angle(angle=math.radians(40))
        except Exception: pass
    return ob

def sky_dome(name='Sky'):
    """World: a sky by elevation, as a weighted blend of palettes (each weight keyed), a sun disc
    and stars. Returns dict of value nodes: weights per palette, 'strength', 'sun_az', 'sun_el',
    'sun_size', 'sun_power', 'stars'."""
    world = bpy.data.worlds.new(name); bpy.context.scene.world = world
    nt = node_tree(world)
    tc = N(nt, 'ShaderNodeTexCoord'); D = tc.outputs['Generated']
    sp = N(nt, 'ShaderNodeSeparateXYZ'); L(nt, D, sp.inputs[0])
    horiz = M(nt, 'SQRT', M(nt, 'ADD', M(nt, 'MULTIPLY', sp.outputs['X'], sp.outputs['X']), M(nt, 'MULTIPLY', sp.outputs['Y'], sp.outputs['Y'])))
    tan_e = M(nt, 'DIVIDE', sp.outputs['Z'], M(nt, 'ADD', horiz, 0.0001))
    fac = M(nt, 'ADD', 0.5, M(nt, 'MULTIPLY', tan_e, 0.26), clamp=True)
    PALETTES = {
        'studio': [(0.0, '#2a2622'), (1.0, '#2a2622')],
        'dusk':   [(0.30, '#e3955f'), (0.37, '#b0646f'), (0.45, '#5b3f7c'), (0.56, '#26306e'), (0.70, '#121b4c'), (0.88, '#070b26')],
        'day':    [(0.30, '#ffd9bd'), (0.42, '#fff1e6'), (0.58, '#f6f4f8'), (0.86, '#e6ecfb')],
        'golden': [(0.30, '#f08a3c'), (0.40, '#ffb36a'), (0.50, '#f7c99c'), (0.60, '#b9c3dc'), (0.74, '#7f9bd0'), (0.92, '#4c69ad')],
        'sunset': [(0.30, '#ff7a3c'), (0.38, '#ff9a5a'), (0.46, '#d0697e'), (0.56, '#6a4c8c'), (0.72, '#2a3270'), (0.90, '#11163d')],
        'night':  [(0.30, '#1a1f4a'), (0.42, '#0e1436'), (0.60, '#070b22'), (0.90, '#020410')],
        'dawn':   [(0.30, '#ffb48a'), (0.38, '#f3a6a2'), (0.48, '#b597c4'), (0.62, '#6a7fc0'), (0.85, '#2c3b78')],
    }
    acc = None; weights = {}
    for key, stops in PALETTES.items():
        r = N(nt, 'ShaderNodeValToRGB'); L(nt, fac, r.inputs['Fac']); cr = r.color_ramp
        cr.elements[0].position, cr.elements[0].color = stops[0][0], rgba(stops[0][1])
        cr.elements[1].position, cr.elements[1].color = stops[-1][0], rgba(stops[-1][1])
        for p_, h in stops[1:-1]:
            el = cr.elements.new(p_); el.color = rgba(h)
        w = VAL(nt, 0.0, 'w_' + key); weights[key] = w
        sc = N(nt, 'ShaderNodeVectorMath', operation='SCALE'); L(nt, r.outputs['Color'], sc.inputs[0]); L(nt, w.outputs[0], sc.inputs['Scale'])
        if acc is None: acc = sc.outputs[0]
        else:
            a = N(nt, 'ShaderNodeVectorMath', operation='ADD'); L(nt, acc, a.inputs[0]); L(nt, sc.outputs[0], a.inputs[1]); acc = a.outputs[0]
    # sun disc + glow
    az = VAL(nt, 0.0, 'sun_az'); el = VAL(nt, -0.3, 'sun_el'); size = VAL(nt, 0.9995, 'sun_size'); spow = VAL(nt, 0.0, 'sun_power')
    cos_el = M(nt, 'COSINE', el.outputs[0])
    sx = M(nt, 'MULTIPLY', M(nt, 'SINE', az.outputs[0]), cos_el)
    sy = M(nt, 'MULTIPLY', M(nt, 'COSINE', az.outputs[0]), cos_el)
    sz = M(nt, 'SINE', el.outputs[0])
    sv = N(nt, 'ShaderNodeCombineXYZ'); L(nt, sx, sv.inputs['X']); L(nt, sy, sv.inputs['Y']); L(nt, sz, sv.inputs['Z'])
    dn = N(nt, 'ShaderNodeVectorMath', operation='NORMALIZE'); L(nt, D, dn.inputs[0])
    dot = N(nt, 'ShaderNodeVectorMath', operation='DOT_PRODUCT'); L(nt, dn.outputs[0], dot.inputs[0]); L(nt, sv.outputs[0], dot.inputs[1])
    disc = N(nt, 'ShaderNodeMapRange', interpolation_type='SMOOTHSTEP'); L(nt, dot.outputs['Value'], disc.inputs['Value'])
    L(nt, size.outputs[0], disc.inputs['From Min']); disc.inputs['From Max'].default_value = 1.0
    glow = M(nt, 'POWER', M(nt, 'MAXIMUM', dot.outputs['Value'], 0.0), 64.0)
    sun_amt = M(nt, 'MULTIPLY', M(nt, 'ADD', M(nt, 'MULTIPLY', disc.outputs[0], 30.0), M(nt, 'MULTIPLY', glow, 1.6)), spow.outputs[0])
    sun_col = N(nt, 'ShaderNodeVectorMath', operation='SCALE'); L(nt, RGB(nt, '#ffd7a0'), sun_col.inputs[0]); L(nt, sun_amt, sun_col.inputs['Scale'])
    a = N(nt, 'ShaderNodeVectorMath', operation='ADD'); L(nt, acc, a.inputs[0]); L(nt, sun_col.outputs[0], a.inputs[1]); acc = a.outputs[0]
    # stars: sparse points on the dome
    stars = VAL(nt, 0.0, 'stars')
    vor = N(nt, 'ShaderNodeTexVoronoi'); vor.inputs['Scale'].default_value = 420.0; L(nt, dn.outputs[0], vor.inputs['Vector'])
    pt = maprange(nt, vor.outputs['Distance'], 0.0, 0.06, 1.0, 0.0)
    keep = M(nt, 'GREATER_THAN', vor.outputs['Color'], 0.82)
    above = maprange(nt, sp.outputs['Z'], -0.05, 0.15, 0.0, 1.0)
    st = M(nt, 'MULTIPLY', M(nt, 'MULTIPLY', M(nt, 'MULTIPLY', pt, keep), above), M(nt, 'MULTIPLY', stars.outputs[0], 6.0))
    stc = N(nt, 'ShaderNodeVectorMath', operation='SCALE'); L(nt, RGB(nt, '#dfe6ff'), stc.inputs[0]); L(nt, st, stc.inputs['Scale'])
    a2 = N(nt, 'ShaderNodeVectorMath', operation='ADD'); L(nt, acc, a2.inputs[0]); L(nt, stc.outputs[0], a2.inputs[1])
    strength = VAL(nt, 1.0, 'strength')        # what the camera sees
    light = VAL(nt, 1.0, 'light')              # what lights and reflects in the objects
    lp = N(nt, 'ShaderNodeLightPath'); cam_ray = lp.outputs['Is Camera Ray']
    s_mix = M(nt, 'ADD', M(nt, 'MULTIPLY', cam_ray, strength.outputs[0]), M(nt, 'MULTIPLY', M(nt, 'SUBTRACT', 1.0, cam_ray), light.outputs[0]))
    bg = N(nt, 'ShaderNodeBackground'); L(nt, a2.outputs[0], bg.inputs['Color']); L(nt, s_mix, bg.inputs['Strength'])
    wo = N(nt, 'ShaderNodeOutputWorld'); L(nt, bg.outputs[0], wo.inputs['Surface'])
    v = dict(weights); v.update(strength=strength, light=light, sun_az=az, sun_el=el, sun_size=size, sun_power=spow, stars=stars)
    return world, v

def light_curve(name, points, depth, hexc, strength):
    """A glowing tube along a smooth path (light thread / trail). Animate
    `ob.data.bevel_factor_start/end` to draw it. Returns the object."""
    cd = bpy.data.curves.new(name, 'CURVE'); cd.dimensions = '3D'; cd.bevel_depth = depth; cd.bevel_resolution = 4
    cd.use_fill_caps = True; cd.bevel_factor_mapping_start = 'SPLINE'; cd.bevel_factor_mapping_end = 'SPLINE'
    sp = cd.splines.new('NURBS'); sp.points.add(len(points) - 1)
    for p, c in zip(sp.points, points): p.co = (*c, 1.0)
    sp.use_endpoint_u = True; sp.order_u = min(4, len(points))
    ob = bpy.data.objects.new(name, cd); link(ob)
    ob.data.materials.append(emissive(name, hexc, strength)); ob.visible_shadow = False
    return ob

# ---------------------------------------------------------------- people: frosted glass avatars
def _overlap(nt, other, other_r, gate):
    """1 inside the other coin's disc (its local x/y), times the gate value node."""
    tco = N(nt, 'ShaderNodeTexCoord'); tco.object = other
    so = N(nt, 'ShaderNodeSeparateXYZ'); L(nt, tco.outputs['Object'], so.inputs[0])
    r = M(nt, 'SQRT', M(nt, 'ADD', M(nt, 'MULTIPLY', so.outputs['X'], so.outputs['X']), M(nt, 'MULTIPLY', so.outputs['Y'], so.outputs['Y'])))
    return M(nt, 'MULTIPLY', maprange(nt, r, other_r * 0.94, other_r, 1.0, 0.0), gate.outputs[0])

def _melt_mask(nt, radial01, melt, noise_vec):
    """Cleared (1) inside the melt front. radial01: 0 at centre, 1 at rim. melt: value node 0..1.25."""
    nz = N(nt, 'ShaderNodeTexNoise'); nz.inputs['Scale'].default_value = 7.0; nz.inputs['Detail'].default_value = 5.0
    L(nt, noise_vec, nz.inputs['Vector'])
    rr = M(nt, 'ADD', radial01, M(nt, 'MULTIPLY', M(nt, 'SUBTRACT', nz.outputs['Fac'], 0.5), 0.22))
    return M(nt, 'DIVIDE', M(nt, 'SUBTRACT', melt.outputs[0], rr), 0.08, clamp=True)

def person(name, loc, radius, who, prio, other=None, sharp=True):
    """A frosted glass coin with the person's photo behind the frost. Value nodes returned in a
    dict: 'glow' (photo light), 'melt' (0 = frosted, 1.25 = fully clear; reveals the sharp photo),
    'lens' (overlap gate, if `other`). Call bind_lens() after both coins exist."""
    thick = radius * 0.13
    coin = make_coin(name, loc, radius, thick)
    vals = {}
    # glass
    gm = bpy.data.materials.new(name + 'Glass'); nt = node_tree(gm)
    tc = N(nt, 'ShaderNodeTexCoord'); so = N(nt, 'ShaderNodeSeparateXYZ'); L(nt, tc.outputs['Object'], so.inputs[0])
    rad = M(nt, 'DIVIDE', M(nt, 'SQRT', M(nt, 'ADD', M(nt, 'MULTIPLY', so.outputs['X'], so.outputs['X']), M(nt, 'MULTIPLY', so.outputs['Y'], so.outputs['Y']))), radius)
    melt_g = VAL(nt, 0.0, 'melt'); vals['melt_glass'] = melt_g
    clear = _melt_mask(nt, rad, melt_g, tc.outputs['Object'])
    lens_g = VAL(nt, 0.0, 'lens'); vals['lens_glass'] = lens_g
    g = N(nt, 'ShaderNodeBsdfGlass'); g.inputs['IOR'].default_value = 1.5
    rough_base = 0.40
    vals['_glass_tree'] = (gm, clear, g, rough_base)
    L(nt, M(nt, 'MULTIPLY', rough_base, M(nt, 'SUBTRACT', 1.0, clear)), g.inputs['Roughness'])
    out_surface(nt, g.outputs[0])
    coin.data.materials.append(gm)
    # photo plane at the back face
    bpy.ops.mesh.primitive_plane_add(size=radius * 1.9, location=(0, 0, 0))
    ph = bpy.context.object; ph.name = name + 'Photo'; ph.parent = coin; ph.location = (0, 0, -thick * 0.30); ph.visible_shadow = False
    pm = bpy.data.materials.new(name + 'Photo'); nt = node_tree(pm)
    path, cx, cyy, size = CROPS[who]
    tc = N(nt, 'ShaderNodeTexCoord'); sp = N(nt, 'ShaderNodeSeparateXYZ'); L(nt, tc.outputs['UV'], sp.inputs[0])
    U = M(nt, 'ADD', cx - size / 2, M(nt, 'MULTIPLY', sp.outputs['X'], size))
    V = M(nt, 'ADD', (1 - cyy) - size / 2, M(nt, 'MULTIPLY', sp.outputs['Y'], size))
    cc = N(nt, 'ShaderNodeCombineXYZ'); L(nt, U, cc.inputs['X']); L(nt, V, cc.inputs['Y'])
    blur = N(nt, 'ShaderNodeTexImage', extension='EXTEND'); L(nt, cc.outputs[0], blur.inputs['Vector'])
    bp = os.path.join(BLUR_DIR, who + '.jpg')
    blur.image = bpy.data.images.load(bp)
    col = blur.outputs['Color']
    du = M(nt, 'SUBTRACT', sp.outputs['X'], 0.5); dvv = M(nt, 'SUBTRACT', sp.outputs['Y'], 0.5)
    rr = M(nt, 'MULTIPLY', M(nt, 'SQRT', M(nt, 'ADD', M(nt, 'MULTIPLY', du, du), M(nt, 'MULTIPLY', dvv, dvv))), 2.0)  # 0 centre, 1 rim
    melt_p = VAL(nt, 0.0, 'melt'); vals['melt_photo'] = melt_p
    if sharp:
        sh = N(nt, 'ShaderNodeTexImage', extension='EXTEND'); sh.image = bpy.data.images.load(os.path.join(PEOPLE, os.path.basename(path)))
        L(nt, cc.outputs[0], sh.inputs['Vector'])
        clear_p = _melt_mask(nt, rr, melt_p, tc.outputs['UV'])
        col = mixrgb(nt, clear_p, col, sh.outputs['Color'])
    else:
        clear_p = None
    # tint: their three colours, softly, fading away as the frost clears (the truth is the face)
    gr = N(nt, 'ShaderNodeValToRGB'); L(nt, M(nt, 'MULTIPLY', M(nt, 'ADD', sp.outputs['X'], sp.outputs['Y']), 0.5), gr.inputs['Fac'])
    cr = gr.color_ramp
    cr.elements[0].position, cr.elements[0].color = 0.15, rgba(HUES[prio[0]])
    cr.elements[1].position, cr.elements[1].color = 0.85, rgba(HUES[prio[2]])
    mid = cr.elements.new(0.5); mid.color = rgba(HUES[prio[1]])
    tint_v = VAL(nt, 1.0, 'tint'); vals['tint'] = tint_v
    tint_amt = M(nt, 'MULTIPLY', 0.55, tint_v.outputs[0], clamp=True) if clear_p is None else \
        M(nt, 'MULTIPLY', M(nt, 'MULTIPLY', 0.55, tint_v.outputs[0]), M(nt, 'SUBTRACT', 1.0, clear_p), clamp=True)
    tn = N(nt, 'ShaderNodeMix', data_type='RGBA', blend_type='MULTIPLY'); L(nt, tint_amt, tn.inputs[0])
    L(nt, col, tn.inputs[6]); L(nt, gr.outputs['Color'], tn.inputs[7])
    col = tn.outputs[2]
    lens_p = VAL(nt, 0.0, 'lens'); vals['lens_photo'] = lens_p
    vals['_photo_tree'] = (pm, col)
    glow = VAL(nt, 1.0, 'glow'); vals['glow'] = glow
    em = N(nt, 'ShaderNodeEmission'); L(nt, col, em.inputs['Color'])
    L(nt, M(nt, 'MULTIPLY', glow.outputs[0], 2.2), em.inputs['Strength'])
    vals['_photo_em'] = em
    circ = maprange(nt, rr, 0.94, 1.0, 1.0, 0.0)
    tr = N(nt, 'ShaderNodeBsdfTransparent')
    out_surface(nt, mix_shader(nt, circ, tr.outputs[0], em.outputs[0]))
    ph.data.materials.append(pm)
    # the bezel: a thin satin-metal ring hugging the glass, anodised in the person's first colour, with
    # their other two colours running round it
    bpy.ops.mesh.primitive_torus_add(major_radius=radius * 1.005, minor_radius=thick * 0.62, major_segments=160, minor_segments=24,
                                     location=(0, 0, 0))
    bz = bpy.context.object; bz.name = name + 'Bezel'; bz.parent = coin; bz.location = (0, 0, 0); bz.visible_shadow = True
    bpy.ops.object.shade_smooth()
    bm = bpy.data.materials.new(name + 'Bezel'); bnt = node_tree(bm)
    btc = N(bnt, 'ShaderNodeTexCoord'); bsp = N(bnt, 'ShaderNodeSeparateXYZ'); L(bnt, btc.outputs['Object'], bsp.inputs[0])
    ang = M(bnt, 'DIVIDE', M(bnt, 'ADD', M(bnt, 'ARCTAN2', bsp.outputs['Y'], bsp.outputs['X']), math.pi), 2 * math.pi)
    # read clockwise from twelve o'clock (as the camera sees the coin): one third per priority
    clock = M(bnt, 'FRACT', M(bnt, 'SUBTRACT', 0.75, ang))
    br = N(bnt, 'ShaderNodeValToRGB'); L(bnt, clock, br.inputs['Fac']); cr2 = br.color_ramp
    cr2.elements[0].position, cr2.elements[0].color = 0.0, rgba(HUES[prio[0]])
    cr2.elements[1].position, cr2.elements[1].color = 1.0, rgba(HUES[prio[0]])
    for pos_, h_ in ((0.17, prio[0]), (0.5, prio[1]), (0.83, prio[2]), (0.97, prio[2])):
        e_ = cr2.elements.new(pos_); e_.color = rgba(HUES[h_])
    # 'fill' (0..1): how far round the ring the colours have come; the rest is plain satin silver.
    # 'fill_glow': the travelling front burns bright while a third fills.
    fill = VAL(bnt, 1.0, 'fill'); vals['fill'] = fill
    fg = VAL(bnt, 0.0, 'fill_glow'); vals['fill_glow'] = fg
    behind = M(bnt, 'SUBTRACT', fill.outputs[0], clock)
    mask = M(bnt, 'ADD', M(bnt, 'MULTIPLY', behind, 90.0), 0.5, clamp=True)
    col = mixrgb(bnt, mask, RGB(bnt, '#c9cdd4'), br.outputs['Color'])
    front = M(bnt, 'MULTIPLY', M(bnt, 'SUBTRACT', 1.0, M(bnt, 'MULTIPLY', M(bnt, 'ABSOLUTE', behind), 14.0), clamp=True), fg.outputs[0])
    pb = N(bnt, 'ShaderNodeBsdfPrincipled'); L(bnt, col, pb.inputs['Base Color'])
    pb.inputs['Metallic'].default_value = 1.0; pb.inputs['Roughness'].default_value = 0.28
    L(bnt, br.outputs['Color'], pb.inputs['Emission Color']); L(bnt, M(bnt, 'MULTIPLY', front, 9.0), pb.inputs['Emission Strength'])
    out_surface(bnt, pb.outputs[0]); bz.data.materials.append(bm)
    coin['radius'] = radius
    return coin, vals

def bind_lens(coin, vals, other):
    """Where `coin` overlaps `other`, its frost clears and its photo turns to warm gold light."""
    r = other['radius']
    gm, clear, g, rough_base = vals['_glass_tree']; nt = gm.node_tree
    lens = _overlap(nt, other, r, vals['lens_glass'])
    both = M(nt, 'MAXIMUM', clear, lens)
    L(nt, M(nt, 'MULTIPLY', rough_base, M(nt, 'SUBTRACT', 1.0, both)), g.inputs['Roughness'])
    pm, col = vals['_photo_tree']; nt = pm.node_tree
    lens_p = _overlap(nt, other, r, vals['lens_photo'])
    # inside the overlap the face turns to a gold duotone (a warm gel over the photo, never a flat fill),
    # with a fine line of light where the two discs cross
    bw = N(nt, 'ShaderNodeRGBToBW'); L(nt, col, bw.inputs[0])
    duo = N(nt, 'ShaderNodeValToRGB'); L(nt, bw.outputs[0], duo.inputs['Fac']); dr = duo.color_ramp
    dr.elements[0].position, dr.elements[0].color = 0.04, rgba('#8a2f06')
    dr.elements[1].position, dr.elements[1].color = 0.80, rgba('#ffe3b3')
    dm = dr.elements.new(0.36); dm.color = rgba('#ff9a1f')
    tco = N(nt, 'ShaderNodeTexCoord'); tco.object = other
    so = N(nt, 'ShaderNodeSeparateXYZ'); L(nt, tco.outputs['Object'], so.inputs[0])
    ro = M(nt, 'DIVIDE', M(nt, 'SQRT', M(nt, 'ADD', M(nt, 'MULTIPLY', so.outputs['X'], so.outputs['X']),
                                            M(nt, 'MULTIPLY', so.outputs['Y'], so.outputs['Y']))), r)
    rim = M(nt, 'MULTIPLY', maprange(nt, ro, 0.915, 0.958, 0.0, 1.0), maprange(nt, ro, 0.958, 0.985, 1.0, 0.0))
    rim = M(nt, 'MULTIPLY', rim, vals['lens_photo'].outputs[0])
    lit = mixrgb(nt, rim, duo.outputs['Color'], RGB(nt, '#fff4de'))
    em = vals['_photo_em']
    L(nt, mixrgb(nt, lens_p, col, lit), em.inputs['Color'])
    glow = vals['glow']
    L(nt, M(nt, 'MULTIPLY', M(nt, 'ADD', glow.outputs[0], M(nt, 'MULTIPLY', rim, 1.6)), 2.2), em.inputs['Strength'])


SKY_KEYS = ('studio', 'dusk', 'day', 'golden', 'sunset', 'night', 'dawn')
def key_sky(SKY, frames, fn):
    """fn(f) -> dict: palette weights (missing = 0) and optional strength, light, sun_az, sun_el,
    sun_power, sun_size, stars. Keys every frame given."""
    for f in frames:
        d = fn(f)
        for k in SKY_KEYS:
            SKY[k].outputs[0].default_value = d.get(k, 0.0); SKY[k].outputs[0].keyframe_insert('default_value', frame=f)
        for k, dv in (('strength', 1.0), ('light', 1.0), ('sun_az', 0.0), ('sun_el', -0.3), ('sun_power', 0.0), ('sun_size', 0.9995), ('stars', 0.0)):
            SKY[k].outputs[0].default_value = d.get(k, dv); SKY[k].outputs[0].keyframe_insert('default_value', frame=f)
SKY_DEFAULTS = {'strength': 1.0, 'light': 1.0, 'sun_az': 0.0, 'sun_el': -0.3, 'sun_power': 0.0, 'sun_size': 0.9995, 'stars': 0.0}
def blend(a, b, s):
    """Blend two sky dicts; a value one side leaves out takes its default, never zero."""
    keys = set(a) | set(b)
    return {k: lerp(a.get(k, SKY_DEFAULTS.get(k, 0.0)), b.get(k, SKY_DEFAULTS.get(k, 0.0)), s) for k in keys}
def sun_dir(az, el):
    return Vector((math.sin(az) * math.cos(el), math.cos(az) * math.cos(el), math.sin(el)))
def sun_lamp(name, energy, hexc, angle_deg=2.5):
    ld = bpy.data.lights.new(name, 'SUN'); ld.energy = energy; ld.color = srgb(hexc); ld.angle = math.radians(angle_deg)
    ob = bpy.data.objects.new(name, ld); link(ob); return ob
def aim_sun(ob, az, el, f=None):
    ob.rotation_euler = sun_dir(az, el).to_track_quat('Z', 'Y').to_euler()
    if f is not None: ob.keyframe_insert('rotation_euler', frame=f)

def set_visible(ob, f, vis, children=True):
    """Insert a constant visibility key at frame f (later keys override earlier ones)."""
    ob.hide_render = not vis; ob.keyframe_insert('hide_render', frame=int(f))
    if children:
        for c in ob.children: set_visible(c, f, vis)
def no_specular(light_ob):
    """A light that lights things but never shows up as a dot in glass."""
    for attr in ('visible_glossy', 'visible_transmission', 'visible_camera'):
        try: setattr(light_ob, attr, False)
        except Exception: pass

# ---------------------------------------------------------------- the real sky: photographic HDRIs
# Qwantani pure skies (Poly Haven, CC0): one place at every time of day, blended by keyed weights at
# matched exposure, all rotated together ('rot', degrees about Z) so the real sun lands where a shot
# needs it. A sun at azimuth az0 in the file appears at az0 + rot in the world.
HDRI_DIR = os.path.join(PROJECT, 'assets/hdri')
HDRI_INFO = json.load(open(os.path.join(HDRI_DIR, 'hdri_info.json')))
HDRIS = {   # key: (file, artistic exposure)
    'dawn': ('qwantani_dawn_puresky', 0.62), 'sunrise': ('qwantani_sunrise_puresky', 0.8),
    'morning': ('qwantani_morning_puresky', 1.0), 'day': ('qwantani_mid_morning_puresky', 1.0),
    'golden': ('qwantani_late_afternoon_puresky', 0.95), 'sunset': ('qwantani_sunset_puresky', 0.85),
    'dusk': ('qwantani_dusk_2_puresky', 0.5), 'night': ('qwantani_night_puresky', 0.22),
    'sunny': ('kloofendal_48d_partly_cloudy_puresky', 1.05), 'sunny2': ('sunflowers_puresky', 1.05),
    'shade': ('kloofendal_overcast_puresky', 0.95),
}
SUN_AZ0 = 126.0          # measured -54 with u flipped; Blender's equirect u runs the other way
SKY_KEYS = ('studio',) + tuple(HDRIS)
SKY_DEFAULTS = {'strength': 1.0, 'light': 1.0, 'rot': 0.0}

def hdri_world(name='Sky'):
    world = bpy.data.worlds.new(name); bpy.context.scene.world = world
    nt = node_tree(world)
    tc = N(nt, 'ShaderNodeTexCoord')
    rot = VAL(nt, 0.0, 'rot')
    rad = M(nt, 'MULTIPLY', rot.outputs[0], math.pi / 180.0)
    gs = N(nt, 'ShaderNodeSeparateXYZ'); L(nt, tc.outputs['Generated'], gs.inputs[0])
    mz = M(nt, 'ABSOLUTE', gs.outputs['Z'])
    gm = N(nt, 'ShaderNodeCombineXYZ'); L(nt, gs.outputs['X'], gm.inputs['X']); L(nt, gs.outputs['Y'], gm.inputs['Y']); L(nt, mz, gm.inputs['Z'])
    below = maprange(nt, gs.outputs['Z'], 0.0, -0.01, 0.0, 1.0)
    mp = N(nt, 'ShaderNodeMapping', vector_type='POINT'); L(nt, gm.outputs[0], mp.inputs['Vector'])
    cz = N(nt, 'ShaderNodeCombineXYZ'); L(nt, rad, cz.inputs['Z']); L(nt, cz.outputs[0], mp.inputs['Rotation'])
    acc = None; vals = {'rot': rot}
    # studio: a flat warm grey that only lights act A's hook
    sw = VAL(nt, 0.0, 'w_studio'); vals['studio'] = sw
    sc = N(nt, 'ShaderNodeVectorMath', operation='SCALE'); L(nt, RGB(nt, '#2a2622'), sc.inputs[0]); L(nt, sw.outputs[0], sc.inputs['Scale'])
    acc = sc.outputs[0]
    for key, (fn, art) in HDRIS.items():
        env = N(nt, 'ShaderNodeTexEnvironment', interpolation='Cubic')
        env.image = bpy.data.images.load(os.path.join(HDRI_DIR, fn + '.hdr'))
        L(nt, mp.outputs['Vector'], env.inputs['Vector'])
        w = VAL(nt, 0.0, 'w_' + key); vals[key] = w
        k = art / max(0.05, HDRI_INFO[fn]['mean_sky'])
        s = N(nt, 'ShaderNodeVectorMath', operation='SCALE'); L(nt, env.outputs['Color'], s.inputs[0])
        L(nt, M(nt, 'MULTIPLY', w.outputs[0], k), s.inputs['Scale'])
        a = N(nt, 'ShaderNodeVectorMath', operation='ADD'); L(nt, acc, a.inputs[0]); L(nt, s.outputs[0], a.inputs[1]); acc = a.outputs[0]
    sea_tint = N(nt, 'ShaderNodeMix', data_type='RGBA', blend_type='MULTIPLY'); L(nt, below, sea_tint.inputs[0])
    L(nt, acc, sea_tint.inputs[6]); sea_tint.inputs[7].default_value = rgba('#7cc3cc')
    acc = sea_tint.outputs[2]
    # a colour wash along the horizon: 'wash' (0..1) and 'wash_col' (an RGB node), keyed by an act when the
    # light should take on a choice's colour; zero (no change) everywhere else
    wash = VAL(nt, 0.0, 'wash'); wash_col = N(nt, 'ShaderNodeRGB'); wash_col.outputs[0].default_value = rgba('#ff7a3d')
    near_horizon = maprange(nt, mz, 0.0, 0.45, 1.0, 0.0)
    wg = N(nt, 'ShaderNodeVectorMath', operation='SCALE'); L(nt, wash_col.outputs[0], wg.inputs[0])
    L(nt, M(nt, 'MULTIPLY', near_horizon, wash.outputs[0]), wg.inputs['Scale'])
    wa = N(nt, 'ShaderNodeVectorMath', operation='ADD'); L(nt, acc, wa.inputs[0]); L(nt, wg.outputs[0], wa.inputs[1]); acc = wa.outputs[0]
    vals['wash'] = wash; vals['wash_col'] = wash_col
    strength = VAL(nt, 1.0, 'strength'); light = VAL(nt, 1.0, 'light')
    lp = N(nt, 'ShaderNodeLightPath'); cam_ray = lp.outputs['Is Camera Ray']
    s_mix = M(nt, 'ADD', M(nt, 'MULTIPLY', cam_ray, strength.outputs[0]), M(nt, 'MULTIPLY', M(nt, 'SUBTRACT', 1.0, cam_ray), light.outputs[0]))
    bg = N(nt, 'ShaderNodeBackground'); L(nt, acc, bg.inputs['Color']); L(nt, s_mix, bg.inputs['Strength'])
    wo = N(nt, 'ShaderNodeOutputWorld'); L(nt, bg.outputs[0], wo.inputs['Surface'])
    vals.update(strength=strength, light=light)
    return world, vals

def key_sky(SKY, frames, fn):
    """fn(f) -> dict of HDRI weights (missing = 0), 'rot' (deg), 'strength' (camera), 'light'."""
    for f in frames:
        d = fn(f)
        for k in SKY_KEYS:
            SKY[k].outputs[0].default_value = d.get(k, 0.0); SKY[k].outputs[0].keyframe_insert('default_value', frame=f)
        for k, dv in SKY_DEFAULTS.items():
            SKY[k].outputs[0].default_value = d.get(k, dv); SKY[k].outputs[0].keyframe_insert('default_value', frame=f)
def blend(a, b, s):
    keys = set(a) | set(b)
    return {k: lerp(a.get(k, SKY_DEFAULTS.get(k, 0.0)), b.get(k, SKY_DEFAULTS.get(k, 0.0)), s) for k in keys}
def rot_for_sun(az_deg):
    """The 'rot' that puts the skies' sun at world azimuth az_deg."""
    return az_deg - SUN_AZ0

# ---------------------------------------------------------------- the sea
SEA_Z = -0.80
def sea(name='Sea', reveal=True):
    """A calm, reflective sea to the horizon with moving ripples. Returns (object, values): 'front'
    (radius in m of the reveal ring of light from under you; huge = all shown), plus shockwave
    slots added by add_sea_wave()."""
    bpy.ops.mesh.primitive_plane_add(size=4000, location=(0, 0, SEA_Z))
    ob = bpy.context.object; ob.name = name
    m = bpy.data.materials.new(name); nt = node_tree(m)
    tc = N(nt, 'ShaderNodeTexCoord'); so = N(nt, 'ShaderNodeSeparateXYZ'); L(nt, tc.outputs['Object'], so.inputs[0])
    t = VAL(nt, 0.0, 'time')
    n1 = N(nt, 'ShaderNodeTexNoise', noise_dimensions='4D'); n1.inputs['Scale'].default_value = 0.9; n1.inputs['Detail'].default_value = 6.0
    n2 = N(nt, 'ShaderNodeTexNoise', noise_dimensions='4D'); n2.inputs['Scale'].default_value = 7.0; n2.inputs['Detail'].default_value = 4.0
    for n_, sp in ((n1, 0.25), (n2, 0.9)):
        L(nt, tc.outputs['Object'], n_.inputs['Vector']); L(nt, M(nt, 'MULTIPLY', t.outputs[0], sp), n_.inputs['W'])
    h = M(nt, 'ADD', M(nt, 'MULTIPLY', n1.outputs['Fac'], 1.0), M(nt, 'MULTIPLY', n2.outputs['Fac'], 0.25))
    bump = N(nt, 'ShaderNodeBump'); bump.inputs['Strength'].default_value = 0.35; bump.inputs['Distance'].default_value = 0.05
    L(nt, h, bump.inputs['Height'])
    b = N(nt, 'ShaderNodeBsdfPrincipled'); b.inputs['Base Color'].default_value = rgba('#0a8f9f')
    b.inputs['Roughness'].default_value = 0.05; b.inputs['IOR'].default_value = 1.33
    try: b.inputs['Specular IOR Level'].default_value = 0.6
    except Exception: pass
    L(nt, bump.outputs['Normal'], b.inputs['Normal'])
    d = M(nt, 'SQRT', M(nt, 'ADD', M(nt, 'MULTIPLY', so.outputs['X'], so.outputs['X']), M(nt, 'MULTIPLY', so.outputs['Y'], so.outputs['Y'])))
    cx = VAL(nt, 0.0, 'cx'); cy = VAL(nt, 0.0, 'cy')
    dx = M(nt, 'SUBTRACT', so.outputs['X'], cx.outputs[0]); dy = M(nt, 'SUBTRACT', so.outputs['Y'], cy.outputs[0])
    dc = M(nt, 'SQRT', M(nt, 'ADD', M(nt, 'MULTIPLY', dx, dx), M(nt, 'MULTIPLY', dy, dy)))
    front = VAL(nt, 1e5 if not reveal else 0.0, 'front')
    shown = M(nt, 'DIVIDE', M(nt, 'SUBTRACT', front.outputs[0], dc), 0.35, clamp=True)
    edge = M(nt, 'MULTIPLY', maprange(nt, M(nt, 'ABSOLUTE', M(nt, 'SUBTRACT', front.outputs[0], dc)), 0.0, 0.25, 1.0, 0.0),
             M(nt, 'SUBTRACT', 1.0, maprange(nt, front.outputs[0], 8.0, 30.0)))
    em = N(nt, 'ShaderNodeEmission'); em.inputs['Color'].default_value = rgba('#ffcf8a'); L(nt, M(nt, 'MULTIPLY', edge, 7.0), em.inputs['Strength'])
    body = add_shader(nt, b.outputs[0], em.outputs[0])
    tr = N(nt, 'ShaderNodeBsdfTransparent')
    mixo = mix_shader(nt, shown, tr.outputs[0], body)
    out = out_surface(nt, mixo)
    ob.data.materials.append(m)
    keyed_value(t, lambda f: f / FPS, range(0, END + 1, 6))
    return ob, {'mat': m, 'front': front, 'cx': cx, 'cy': cy, 'dist': dc, 'body': body, 'shown': shown, 'tr': tr, 'out': out}

def add_sea_wave(seav, hexc):
    """A ring of coloured light that can race across the sea; returns (radius value, strength value)."""
    m = seav['mat']; nt = m.node_tree
    wr = VAL(nt, -1.0, 'wave_r'); ws = VAL(nt, 0.0, 'wave_s')
    band = M(nt, 'MULTIPLY', maprange(nt, M(nt, 'ABSOLUTE', M(nt, 'SUBTRACT', wr.outputs[0], seav['dist'])), 0.0, 0.08, 1.0, 0.0), ws.outputs[0])
    we = N(nt, 'ShaderNodeEmission'); we.inputs['Color'].default_value = rgba(hexc); L(nt, band, we.inputs['Strength'])
    body = add_shader(nt, seav['body'], we.outputs[0]); seav['body'] = body
    mixo = mix_shader(nt, seav['shown'], seav['tr'].outputs[0], body)
    L(nt, mixo, seav['out'].inputs['Surface'])
    return wr, ws

# ---------------------------------------------------------------- kinetic type: every letter its own object
KIN = json.load(open(os.path.join(TYPE_DIR, 'kinetic.json')))

def _glyph_material(name, path, mode='glow', strength=1.0):
    m = bpy.data.materials.new(name); nt = node_tree(m)
    tc = N(nt, 'ShaderNodeTexCoord')
    im = N(nt, 'ShaderNodeTexImage', extension='CLIP', interpolation='Cubic'); im.image = bpy.data.images.load(path)
    L(nt, tc.outputs['UV'], im.inputs['Vector'])
    op = N(nt, 'ShaderNodeAttribute', attribute_type='OBJECT', attribute_name='op')
    alpha = M(nt, 'MULTIPLY', im.outputs['Alpha'], op.outputs['Fac'])
    if mode == 'glow':
        body = N(nt, 'ShaderNodeEmission'); L(nt, im.outputs['Color'], body.inputs['Color']); body.inputs['Strength'].default_value = strength
    else:
        body = N(nt, 'ShaderNodeBsdfDiffuse'); L(nt, im.outputs['Color'], body.inputs['Color'])
    tr = N(nt, 'ShaderNodeBsdfTransparent')
    out_surface(nt, mix_shader(nt, alpha, tr.outputs[0], body.outputs[0]))
    return m

def kinetic(name, key, centre, scale=1.0, strength=1.0, mode='glow'):
    """Builds line `key` as one plane per letter, centred at `centre`, facing -Y. Returns a dict:
    root (empty), glyphs: [{ob, rest: Vector (local), word, i}], size (em in metres)."""
    info = KIN[key]
    root = empty(name + 'Root', tuple(centre))
    W, H = info['wM'], info['hM']
    glyphs = []
    for i, g in enumerate(info['glyphs']):
        bpy.ops.mesh.primitive_plane_add(size=1, location=(0, 0, 0), rotation=(math.pi / 2, 0, 0))
        ob = bpy.context.object; ob.name = f'{name}_{i:02d}'; ob.visible_shadow = False
        ob.scale = (g['w'] * scale, g['h'] * scale, 1)
        bpy.ops.object.transform_apply(location=False, rotation=True, scale=True)
        ob.data.materials.append(_glyph_material(ob.name, os.path.join(TYPE_DIR, g['file']), mode, strength))
        ob.parent = root
        rest = Vector(((g['cx'] - W / 2) * scale, 0.0006 * (i % 2) + 0.0003 * i, (H / 2 - g['cy']) * scale))   # never coplanar: transparent planes at one depth drop slices
        ob.location = rest; ob['op'] = 0.0
        glyphs.append({'ob': ob, 'rest': rest, 'word': g['word'], 'i': i})
    return {'root': root, 'glyphs': glyphs, 'size': info['size'] * scale, 'name': name}

def _key_glyph(ob, f, loc, rot, sc, op):
    ob.location = tuple(loc); ob.rotation_euler = tuple(rot); ob.scale = (sc, sc, sc); ob['op'] = op
    ob.keyframe_insert('location', frame=f); ob.keyframe_insert('rotation_euler', frame=f)
    ob.keyframe_insert('scale', frame=f); ob.keyframe_insert('["op"]', frame=f)

def animate_kinetic(K, f_in, f_out=None, style='fly', stagger=3.0, exit='whip', seed=1, depth=0.55, by='letter'):
    """Entrance styles: 'fly' (out of depth toward the camera, spring overshoot, real motion blur),
    'slam' (each word drops in big on its frame, hard spring), 'rise' (from below with a stagger).
    Exits: 'whip' (sideways, staggered), 'scatter' (letters burst toward the camera), None (stay)."""
    rnd = random.Random(seed)
    glyphs = K['glyphs']; n = len(glyphs); em = K['size']
    words = sorted(set(g['word'] for g in glyphs))
    for g in glyphs:
        ob, rest = g['ob'], g['rest']
        k = g['i'] if by == 'letter' else words.index(g['word'])
        t0 = f_in + k * stagger
        jit = Vector((rnd.uniform(-1, 1) * 0.6 * em, 0, rnd.uniform(-1, 1) * 0.5 * em))
        r0 = Vector((rnd.uniform(-0.5, 0.5), rnd.uniform(-0.3, 0.3), rnd.uniform(-0.6, 0.6)))
        fx_dir = 1 if rnd.random() > 0.5 else -1
        frames = range(int(f_in) - 2, int((f_out if f_out else f_in + 120) + 40))
        for f in frames:
            if style == 'fly':      # a wave: every letter on the same path, a tight stagger, a little tilt
                s = spring_f(f, t0, 0.5, 0.14)
                loc = rest + Vector((0, -depth * 0.6, -0.35 * em)) * (1 - s)
                rot = Vector((0.45 * (1 - s), 0, 0)); sc = lerp(1.12, 1.0, clamp01(s)); op = clamp01((f - t0) / 5)
            elif style == 'slam':   # each word drops in a little big, on its frame, and settles hard
                s = spring_f(f, t0, 0.38, 0.22)
                loc = rest + Vector((0, -0.12 * em, 0.3 * em)) * (1 - s)
                rot = Vector((0, 0, 0)); sc = lerp(1.5, 1.0, clamp01(s)) if f >= t0 else 1.5; op = clamp01((f - t0) / 3) if f >= t0 else 0.0
            else:   # rise
                s = spring_f(f, t0, 0.5, 0.12)
                loc = rest + Vector((0, 0, -0.9 * em)) * (1 - s)
                rot = Vector((0.4 * (1 - s), 0, 0)); sc = 1.0; op = clamp01((f - t0) / 5)
            if f_out is not None and f >= f_out:
                e = (f - f_out - k * 0.8)
                u = ease_in_cubic(clamp01(e / 12))
                if exit == 'whip':      # the whole line leaves together, one way, with motion blur
                    loc = loc + Vector((1.4 * u, 0, 0.08 * u))
                elif exit == 'scatter': # toward the lens and up, as one burst
                    loc = loc + Vector((rest.x * 0.8 * u, -0.9 * u, 0.25 * u)); sc *= (1 + 0.35 * u)
                op = op * (1 - clamp01((e - 6) / 6))
            _key_glyph(ob, f, loc, rot, sc, op)
        # absent until it enters and after it has left (no invisible planes for rays to wade through)
        set_visible(ob, 0, False); set_visible(ob, int(t0) - 2, True)
        if f_out is not None: set_visible(ob, int(f_out + k * 0.8 + 16), False)
    return K

# ---------------------------------------------------------------- giant 3D glass step numerals
FONT_BOLD = os.path.join(PROJECT, 'assets/fonts/InterDisplay-Bold.ttf')
def numeral(name, digit, centre, size=0.62, tint='#ff6a2b'):
    cd = bpy.data.curves.new(name, 'FONT'); cd.body = digit
    cd.font = bpy.data.fonts.load(FONT_BOLD) if 'InterBold' not in bpy.data.fonts else bpy.data.fonts['InterBold']
    cd.font.name = 'InterBold'
    cd.size = size; cd.extrude = size * 0.09; cd.bevel_depth = size * 0.018; cd.bevel_resolution = 4
    cd.align_x = 'CENTER'; cd.align_y = 'CENTER'
    ob = bpy.data.objects.new(name, cd); link(ob)
    ob.location = tuple(centre); ob.rotation_euler = (math.pi / 2, 0, 0)
    m = bpy.data.materials.new(name); nt = node_tree(m)
    b = N(nt, 'ShaderNodeBsdfPrincipled'); b.inputs['Base Color'].default_value = rgba(tint); b.inputs['Roughness'].default_value = 0.22
    try:
        b.inputs['Coat Weight'].default_value = 1.0; b.inputs['Coat Roughness'].default_value = 0.03
    except Exception: pass
    em = N(nt, 'ShaderNodeEmission'); em.inputs['Color'].default_value = rgba(tint); em.inputs['Strength'].default_value = 0.35
    out_surface(nt, add_shader(nt, b.outputs[0], em.outputs[0]))
    cd.materials.append(m)
    return ob

def slam_numeral(ob, f_in, f_out, home, kick_dir=1):
    """Flies in from behind the camera spinning, lands on its beat with a hard spring, leaves with a whip."""
    home = Vector(home)
    for f in range(int(f_in) - 20, int(f_out) + 24):
        s = spring_f(f, f_in - 10, 0.5, 0.25)
        loc = home + Vector((0.4 * kick_dir, -1.6, 0.35)) * (1 - s)
        spin = (1 - clamp01(s)) * math.pi * 1.5 * kick_dir
        sc = lerp(1.9, 1.0, clamp01(s))
        if f >= f_out:
            u = ease_in_cubic((f - f_out) / 16); loc = loc + Vector((-2.2 * kick_dir * u, 0, 0.3 * u)); spin += -0.8 * kick_dir * u
        ob.location = tuple(loc); ob.rotation_euler = (math.pi / 2, 0, spin); ob.scale = (sc, sc, sc)
        ob.keyframe_insert('location', frame=f); ob.keyframe_insert('rotation_euler', frame=f); ob.keyframe_insert('scale', frame=f)
    set_visible(ob, 0, False); set_visible(ob, int(f_in) - 20, True); set_visible(ob, int(f_out) + 24, False)

# ---------------------------------------------------------------- bursts of glass shards
def shards(name, centre, n, f0, speed=(0.6, 1.6), life=(26, 44), size=(0.008, 0.022), tint='#ffffff', toward=None, seed=3, gravity=1.6):
    """Glass shards thrown from `centre` at f0, with real motion blur. `toward`: a bias direction (e.g. the camera)."""
    rnd = random.Random(seed); made = []
    gm = glass(name + 'Glass', rough=0.02, ior=1.5, tint=tint)
    em = emissive(name + 'Glint', tint, 2.0)
    for i in range(n):
        d = Vector((rnd.gauss(0, 1), rnd.gauss(0, 1), rnd.gauss(0, 1))).normalized()
        if toward is not None: d = (d + Vector(toward) * 0.9).normalized()
        v = d * rnd.uniform(*speed); lf = rnd.randint(*life); s0 = rnd.uniform(*size)
        bpy.ops.mesh.primitive_ico_sphere_add(radius=1.0, subdivisions=1, location=tuple(centre))
        ob = bpy.context.object; ob.name = f'{name}{i:03d}'; ob.visible_shadow = False
        ob.data.materials.append(gm if rnd.random() > 0.25 else em)
        sq = (rnd.uniform(0.3, 1.0), rnd.uniform(0.15, 0.5), rnd.uniform(0.6, 1.4))
        w = Vector((rnd.uniform(-9, 9), rnd.uniform(-9, 9), rnd.uniform(-9, 9)))
        for f in range(int(f0) - 1, int(f0) + lf + 1):
            t = max(0.0, (f - f0) / FPS)
            ob.location = tuple(Vector(centre) + v * t + Vector((0, 0, -gravity * t * t)))
            k = s0 * (1 - ease_in_cubic((f - f0) / lf))
            ob.scale = (k * sq[0], k * sq[1], k * sq[2]); ob.rotation_euler = tuple(w * t)
            ob.keyframe_insert('location', frame=f); ob.keyframe_insert('scale', frame=f); ob.keyframe_insert('rotation_euler', frame=f)
        set_visible(ob, 0, False); set_visible(ob, int(f0), True); set_visible(ob, int(f0) + lf, False)
        made.append(ob)
    return made

def kick(f, f0, amp=0.03, freq=9.0, decay=0.12):
    """A camera kick: a damped shake starting at f0 (returns a scalar offset)."""
    if f < f0: return 0.0
    t = (f - f0) / FPS
    return amp * math.exp(-t / decay) * math.sin(2 * math.pi * freq * t + 1.2)
