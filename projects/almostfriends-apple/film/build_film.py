# Builds the whole film into film/film.blend from code: scene and render settings, the sky, every
# act, and the single continuous camera.
#   blender -b -P projects/almostfriends-apple/film/build_film.py [-- --acts A,B]
import bpy, sys, os, math, importlib
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import afx; importlib.reload(afx)
from afx import *

argv = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
ACTS = (argv[argv.index('--acts') + 1] if '--acts' in argv else 'A,B').split(',')

bpy.ops.wm.read_factory_settings(use_empty=True)
scene = bpy.context.scene
scene.frame_start, scene.frame_end = 0, END
scene.render.fps = FPS
scene.render.resolution_x, scene.render.resolution_y = 1080, 1920
scene.render.engine = 'CYCLES'
cy = scene.cycles
try:
    prefs = bpy.context.preferences.addons['cycles'].preferences
    prefs.compute_device_type = 'METAL'
    try: prefs.refresh_devices()
    except Exception: prefs.get_devices()
    for d in prefs.devices: d.use = True
    cy.device = 'GPU'
except Exception as e:
    print('GPU setup failed:', e)
cy.samples = 128; cy.use_adaptive_sampling = True; cy.adaptive_threshold = 0.02
cy.use_denoising = True
try: cy.denoiser = 'OPENIMAGEDENOISE'
except Exception: pass
cy.max_bounces = 16; cy.transmission_bounces = 14; cy.glossy_bounces = 8; cy.diffuse_bounces = 3; cy.transparent_max_bounces = 24
cy.caustics_reflective = False; cy.caustics_refractive = False; cy.blur_glossy = 1.0; cy.sample_clamp_indirect = 8.0
scene.render.use_motion_blur = True; scene.render.motion_blur_shutter = 0.5
try: scene.render.motion_blur_position = 'START'
except Exception: pass
scene.view_settings.view_transform = 'AgX'
for look in ('AgX - Medium High Contrast', 'AgX - Punchy'):
    try: scene.view_settings.look = look; break
    except Exception: continue
scene.render.image_settings.file_format = 'PNG'; scene.render.image_settings.color_depth = '16'

world, SKY = hdri_world()
ctx = {'sky': SKY, 'world': world}
mods = {k: importlib.import_module('act_' + k.lower()) for k in ACTS}
for k, m in mods.items():
    importlib.reload(m); m.build(ctx); print('built act', k)
# nothing floats close enough to the sea for a shadow to read as contact: the sky's sun only paints
# dark blots on the water under every coin, so no object casts one
for ob in bpy.data.objects:
    if ob.type in ('MESH', 'CURVE', 'FONT'): ob.visible_shadow = False
# the photographic skies carry their own sun: the stand-in sun lamps go
for ob in [o for o in bpy.data.objects if o.type == 'LIGHT' and o.data.type == 'SUN']:
    bpy.data.objects.remove(ob, do_unlink=True)

# the camera: one move through every act. Each act proposes a path; the whole film's path, aim
# and roll are then smoothed as one, wider where acts meet (so speed carries across a boundary
# instead of resetting) and tight on the designed fast moves (the dive, the warp, the click).
import numpy as np
from mathutils import Euler, Matrix
cam_d = bpy.data.cameras.new('Cam'); cam_d.lens = 40; cam_d.sensor_fit = 'HORIZONTAL'; cam_d.sensor_width = 36
cam_d.dof.use_dof = True
cam = bpy.data.objects.new('Cam', cam_d); link(cam); scene.camera = cam
order = [k for k in 'ABCDEFG' if k in ACTS]
starts = {'A': 0, 'B': round(bar(4)), 'C': round(bar(8)), 'D': round(bar(12)), 'E': round(bar(16)), 'F': round(bar(18)), 'G': round(bar(22))}
nxt = {k: chr(ord(k) + 1) for k in 'ABCDEF'}
last_frame = END if order[-1] == 'G' else starts[nxt[order[-1]]]
raw = []; prev_state = None; ctx['cam_handoff'] = {}
for f in range(0, last_frame + 1):
    act = [k for k in order if starts[k] <= f][-1]
    m = mods[act]
    if act != 'A' and act not in ctx['cam_handoff']:
        ctx['cam_handoff'][act] = prev_state
    state = m.cam(f, ctx) if act == 'A' else m.cam(f, ctx, ctx['cam_handoff'][act])
    prev_state = state
    raw.append((state, getattr(m, 'exposure', lambda f: 0.0)(f)))
F = len(raw)
pos = np.array([r[0][0] for r in raw], dtype=float)
fwd = np.zeros((F, 3)); upv = np.zeros((F, 3))
for i, r in enumerate(raw):
    R = Euler(r[0][1], 'XYZ').to_matrix()
    fwd[i] = R @ Vector((0, 0, -1)); upv[i] = R @ Vector((0, 1, 0))
foc = np.array([r[0][2] for r in raw]); fst = np.array([r[0][3] for r in raw]); exp_ = np.array([r[1] for r in raw])
bounds = [starts[k] for k in order if starts[k] > 0]
def sigma_cam(f):
    s = 5.0
    for b_ in bounds:
        if b_ == starts.get('F'): continue           # the click stays crisp
        s += 16.0 * math.exp(-((f - b_) / 34.0) ** 2)
    def soft_cap(s, f, f0, f1, cap, ramp=24.0):
        # cap sigma inside [f0, f1], easing the cap off over `ramp` frames on both sides
        if f < f0: k = clamp01(1 - (f0 - f) / ramp)
        elif f > f1: k = clamp01(1 - (f - f1) / ramp)
        else: k = 1.0
        k = smooth(k)
        return s * (1 - k) + min(s, cap) * k
    s = soft_cap(s, f, 84, 132, 2.5)                     # the dive through the glass
    if 'F' in starts: s = soft_cap(s, f, starts['F'] - 2, starts['F'] + 14, 4.0, 18.0)   # the click
    return s
def vsmooth(arr, sig_fn):
    arr = np.asarray(arr, dtype=float); out = np.empty_like(arr); n = len(arr)
    for i in range(n):
        sg = sig_fn(i); r = int(3 * sg) + 1
        lo, hi = max(0, i - r), min(n, i + r + 1)
        idx = np.arange(lo, hi); w = np.exp(-0.5 * ((idx - i) / sg) ** 2); w /= w.sum()
        out[i] = np.tensordot(w, arr[lo:hi], axes=(0, 0))
    return out
cuts = sorted(set(int(c) for c in ctx.get('cuts', []) if 0 < c < F))
segs = list(zip([0] + cuts, cuts + [F]))
def seg_smooth(arr, sig_fn):
    out = np.empty_like(np.asarray(arr, dtype=float))
    for a_, b_ in segs:
        out[a_:b_] = vsmooth(np.asarray(arr, dtype=float)[a_:b_], lambda i, a_=a_: sig_fn(i + a_))
    return out
pos_s = seg_smooth(pos, sigma_cam); fwd_s = seg_smooth(fwd, sigma_cam); up_s = seg_smooth(upv, sigma_cam)
foc_s = seg_smooth(foc, lambda f: sigma_cam(f) + 2); fst_s = seg_smooth(fst, lambda f: 6.0)
vs = scene.view_settings
for f in range(F):
    fw = Vector(fwd_s[f]).normalized(); up = Vector(up_s[f])
    rt = fw.cross(up).normalized(); up2 = rt.cross(fw).normalized()
    Rm = Matrix((rt, up2, -fw)).transposed()
    cam.location = tuple(pos_s[f]); cam.rotation_euler = Rm.to_euler('XYZ')
    cam.keyframe_insert('location', frame=f); cam.keyframe_insert('rotation_euler', frame=f)
    cam_d.dof.focus_distance = max(0.05, float(foc_s[f])); cam_d.dof.aperture_fstop = float(fst_s[f])
    cam_d.dof.keyframe_insert('focus_distance', frame=f); cam_d.dof.keyframe_insert('aperture_fstop', frame=f)
    vs.exposure = float(exp_[f]); vs.keyframe_insert('exposure', frame=f)
# a cut is a cut: the key before it holds, so nothing interpolates (or blurs) across it
for fc in fcurves(cam) + fcurves(cam_d):
    for kp in fc.keyframe_points:
        if int(round(kp.co[0])) + 1 in cuts: kp.interpolation = 'CONSTANT'
# euler continuity (no 360° wraps between neighbouring frames)
for fc in fcurves(cam):
    if fc.data_path == 'rotation_euler':
        pts = fc.keyframe_points
        for i in range(1, len(pts)):
            d = pts[i].co[1] - pts[i - 1].co[1]
            while d > math.pi: pts[i].co[1] -= 2 * math.pi; d -= 2 * math.pi
            while d < -math.pi: pts[i].co[1] += 2 * math.pi; d += 2 * math.pi

# every other animated element: the same polish, so nothing jolts where acts meet
def sigma_obj(f):
    s = 1.6
    for b_ in bounds:
        if b_ == starts.get('F'): continue
        s += 9.0 * math.exp(-((f - b_) / 26.0) ** 2)
    return s
SKIP = ('Drop', 'Flake', 'Dust', 'Far', 'Bokeh', 'Glow', 'Cam')
polished = 0
for ob in bpy.data.objects:
    if any(ob.name.startswith(k) or k in ob.name for k in SKIP): continue
    for fc in fcurves(ob):
        if fc.data_path not in ('location', 'rotation_euler', 'scale'): continue
        pts = fc.keyframe_points
        if len(pts) < 40: continue
        xs = [int(round(p.co[0])) for p in pts]
        f0, f1 = min(xs), max(xs)
        series = np.array([fc.evaluate(f) for f in range(f0, f1 + 1)])
        sm = vsmooth(series, lambda i, f0=f0: sigma_obj(i + f0))
        for p in pts:
            p.co[1] = float(sm[int(round(p.co[0])) - f0])
        polished += 1
print('polished channels', polished)
linearize_all()
for fc in fcurves(cam) + fcurves(cam_d):
    for kp in fc.keyframe_points:
        if int(round(kp.co[0])) + 1 in cuts: kp.interpolation = 'CONSTANT'
# titles composed on the frame: an act can ask for a group (a numeral and its line) to sit at a spot on
# the screen at a reference frame, square to the lens, then ride the camera by `follow` (1 = locked to
# the frame, 0 = left in the world). A line can no longer drift out of frame, and it still breathes.
from mathutils import Quaternion
def cam_matrix(f):
    loc = [0.0, 0.0, 0.0]; rot = [0.0, 0.0, 0.0]
    for fc in fcurves(cam):
        if fc.data_path == 'location': loc[fc.array_index] = fc.evaluate(f)
        elif fc.data_path == 'rotation_euler': rot[fc.array_index] = fc.evaluate(f)
    return Matrix.LocRotScale(Vector(loc), Euler(rot, 'XYZ'), None)
TAN_H = cam_d.sensor_width / 2 / cam_d.lens; TAN_V = TAN_H * scene.render.resolution_y / scene.render.resolution_x
R_LEVEL = Euler((math.pi / 2, 0, 0), 'XYZ').to_matrix()      # a level camera looking down +y: what type is set for
for t in ctx.get('titles', []):
    Mref = cam_matrix(t['f_ref']); p0 = Vector(t['point'])
    d = t.get('depth') or -(Mref.inverted() @ p0).z
    sc = t.get('scale', 1.0)
    if 'fit' in t: w_m, frac = t['fit']; sc = frac * 2 * TAN_H * d / w_m
    nx, ny = t['ndc']
    p1 = Mref @ Vector(((nx - 0.5) * 2 * TAN_H * d, (ny - 0.5) * 2 * TAN_V * d, -d))
    Rf = (Mref.to_3x3().normalized() @ R_LEVEL.transposed()).to_4x4() if t.get('face', True) else Matrix.Identity(4)
    place = Matrix.Translation(p1) @ Rf @ Matrix.Scale(sc, 4) @ Matrix.Translation(-p0)
    an = bpy.data.objects.new('CamAnchor' + t['name'], None); link(an); an.rotation_mode = 'QUATERNION'
    for ob in t['objs']:
        if ob.parent is None: ob.parent = an; ob.matrix_parent_inverse = Matrix.Identity(4)
    inv = Mref.inverted(); w = t.get('follow', 0.85); qp = None
    for f in range(max(0, int(t['f_in']) - 24), min(last_frame, int(t['f_out']) + 40) + 1):
        l_, q_, _ = (cam_matrix(f) @ inv).decompose()
        if q_.w < 0: q_.negate()
        l2, q2, s2 = (Matrix.LocRotScale(l_ * w, Quaternion().slerp(q_, w), None) @ place).decompose()
        if qp is not None and q2.dot(qp) < 0: q2.negate()
        qp = q2
        an.location = l2; an.rotation_quaternion = q2; an.scale = s2
        for pth in ('location', 'rotation_quaternion', 'scale'): an.keyframe_insert(pth, frame=f)
    for fc in fcurves(an):
        for kp in fc.keyframe_points:
            kp.interpolation = 'CONSTANT' if int(round(kp.co[0])) + 1 in cuts else 'LINEAR'
    print('title', t['name'], 'at', tuple(round(v, 2) for v in p1), 'depth', round(d, 2), 'scale', round(sc, 2))
scene.frame_end = last_frame
# gate: report the worst camera jolts after the polish
P_ = np.array([tuple(cam.matrix_world.translation) for _ in [0]])
spk = []
pp = []; qq = []
for f in range(0, last_frame + 1):
    scene.frame_set(f); mw = cam.matrix_world; pp.append(tuple(mw.translation)); qq.append(tuple(mw.to_quaternion()))
pp = np.array(pp); qq = np.array(qq)
v = np.linalg.norm(np.diff(pp, axis=0), axis=1) * 60; a_ = np.abs(np.diff(v)) * 60
dq = np.abs(np.sum(qq[1:] * qq[:-1], axis=1)).clip(0, 1); w_ = np.degrees(2 * np.arccos(dq)) * 60; aw = np.abs(np.diff(w_)) * 60
for c in cuts:
    for j in (c - 2, c - 1, c):
        if 0 <= j < len(a_): a_[j] = 0
        if 0 <= j < len(aw): aw[j] = 0
print('GATE cuts', cuts)
print('GATE worst linear accel', [(int(i + 1), round(float(a_[i]), 1)) for i in np.argsort(a_)[::-1][:5]])
print('GATE worst angular accel', [(int(i + 1), round(float(aw[i]))) for i in np.argsort(aw)[::-1][:5]])
out = os.path.join(FILM, 'film.blend')
bpy.ops.wm.save_as_mainfile(filepath=out)
print('SAVED', out, 'acts', ACTS, 'frames 0 -', last_frame)
