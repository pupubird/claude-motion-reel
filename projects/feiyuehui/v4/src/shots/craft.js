// Act IV 匠心 (14 – 24 s): three crafts, three words, each made by its own craft.
//   设计 design  14 – 17.5  the drawing becomes the jewel: gold construction lines draw themselves on drafting paper while
//                         the ring hangs above them in exploded view; on the beat every part flies home and seats with
//                         a spark, the camera orbiting; the strokes of 设计 assemble the same way onto the paper
//   雕刻 carve   17.5 – 20.5  a dim workshop crossed by a shaft of sun: the jade plaque, backlit, glows from inside as
//                         雕刻 is cut into it; a spark at the cutter, jade dust turning in the beam
//   镶嵌 set     20.5 – 24  in macro, one brilliant falls through the beam in slow motion and seats in the gold plate;
//                         the rest of 嵌 rains home as the lens draws back; light runs across the finished word
import * as THREE from 'three';
import { Line2 } from 'three/addons/lines/Line2.js';
import { LineMaterial } from 'three/addons/lines/LineMaterial.js';
import { LineGeometry } from 'three/addons/lines/LineGeometry.js';
import { T, BEAT, W as DW, H as DH, S as SCALE } from '../config.js';
import { model, json, textures, find, createFilmMaterial, meshContext } from '../assets.js';
import { createAtelier, SUN_A } from '../worlds/atelier.js';
import { addCarveGild } from '../lib/gild.js';
import { gemStudio, goldStudio, jadeStudio } from '../env.js';
import { createBeamRoom } from '../worlds/beamroom.js';
import { prepareAssembly } from '../lib/assemble.js';
import { createCarvePlayback } from '../../../shared/assets/3d/materials/materials.js';
import { keys, ease, seg, fovOf, DEG, lerp, fbm1, rng, clamp, cubicBezier } from '../lib/util.js';

const MM = 0.001;
const V = (x, y, z) => new THREE.Vector3(x, y, z);
const lookFrom = (cam, pos, target, mm, roll = 0) => {
  cam.position.copy(pos);
  cam.up.set(Math.sin(roll), Math.cos(roll), 0);
  cam.lookAt(target);
  cam.fov = fovOf(mm);
  cam.updateMatrixWorld();
};
const handheld = (cam, t, mm, amp = 0.00022) => {
  const h = amp * (50 / mm);
  cam.position.x += fbm1(t * 0.4, 5) * h;
  cam.position.y += fbm1(t * 0.33, 6) * h;
};

// A glint: a tiny HDR sphere (the cutter) plus a point light that lights what is around it.
function glint(color = '#fff1d6', power = 40, light = 0.02) {
  const g = new THREE.Group();
  const s = new THREE.Mesh(new THREE.SphereGeometry(1, 16, 8), new THREE.MeshBasicMaterial({ color: new THREE.Color(color).multiplyScalar(power) }));
  const l = new THREE.PointLight(new THREE.Color(color), light, 0.08, 2);
  g.add(s, l);
  g.sphere = s; g.light = l;
  return g;
}

// Gold construction lines (world-unit width), drawn on progressively: `draw(u)` shows the first u of each line.
function goldLine(points, { width = 0.0008, color = '#e8bd6c', power = 3.6, dashed = false, dash = 0.004, gap = 0.002 } = {}) {
  const g = new LineGeometry();
  g.setPositions(points.flatMap((p) => [p.x, p.y, p.z]));
  const m = new LineMaterial({ color: new THREE.Color(color).multiplyScalar(power), linewidth: width, worldUnits: true, dashed,
    dashSize: dash, gapSize: gap, transparent: false });
  m.resolution.set(DW * SCALE, DH * SCALE);
  m.transparent = true;
  const line = new Line2(g, m);
  if (dashed) line.computeLineDistances();
  line.frustumCulled = false;
  const segs = points.length - 1;
  line.draw = (u, fade = 1) => { g.instanceCount = Math.round(clamp(u) * segs); line.visible = u > 0 && fade > 0; m.opacity = fade; };
  return line;
}
const circlePts = (c, r, axis = 'y', n = 160, a0 = 0, a1 = Math.PI * 2) => Array.from({ length: n + 1 }, (_, i) => {
  const a = a0 + (a1 - a0) * (i / n);
  return axis === 'y' ? V(c.x + Math.cos(a) * r, c.y, c.z + Math.sin(a) * r) : V(c.x + Math.cos(a) * r, c.y + Math.sin(a) * r, c.z);
});
const linePts = (a, b, n = 60) => Array.from({ length: n + 1 }, (_, i) => a.clone().lerp(b, i / n));

// ============================================================================================================ 设计
// The ring hangs upright above the paper in exploded view; its parts are classified by where they sit (the crown of
// claws, the halo's diamonds, the gallery, the shank and its stones) and each group separates along the ring's axis,
// the halo blooming outward. Lines: the axis (dash-dot), a circle at each part's level, and a compass drawing on the
// paper under it. Then the parts fly home in order — shank, gallery, halo, claws, the cabochon last — and the strokes
// of 设计 fly onto the paper beside it.
const D = {};
const RING_AT = V(-0.03, 0.056, -0.018);      // the assembled ring's centre, upright over the paper (left third)
const WORD_AT = V(0.078, 0.07, -0.2385);        // 设计 mounted on the paper wall behind, to its right, like gold leaf on a scroll
const ASM0 = T.design + 1.0;                 // the first part leaves for home (15.0); the cabochon seats ≈ 15.85
const design = {
  id: 'design', start: T.design, end: T.carve, samples: 1,
  async init(ctx) {
    // toned drafting paper: jewellery designers render in gouache on grey-tan stock so whites and metals stand out
    // the sweep's cove is tight (40 mm) so the wall is vertical where the word is mounted (z = −0.24 from 40 mm up)
    D.world = createAtelier(ctx, { paper: [2.6, 1.0], sweep: { front: 0.5, back: 0.2, radius: 0.04, wall: 1.1 }, tone: '#a89780' });
    D.scene = D.world.scene;
    D.camera = new THREE.PerspectiveCamera(30, 16 / 9, 0.005, 10);

    // ---- the ring, exploded
    // its own load (own materials), so this shot's assembly patch never touches the ring of act I
    const ring = (await model('jewellery_ring', { key: 'design' })).clone();
    D.ringPivot = new THREE.Group();
    D.ringPivot.position.copy(RING_AT);
    D.ringPivot.add(ring);
    D.scene.add(D.ringPivot);
    D.ringPivot.updateMatrixWorld(true);
    D.ring = ring;
    const r = rng(512);
    const axisDir = V(0, 1, 0);
    const radial = (c) => { const d = V(c.x - RING_AT.x, 0, c.z - RING_AT.z); return d.lengthSq() > 1e-12 ? d.normalize() : V(1, 0, 0); };
    const plan = (kind) => ({ centre, size }) => {
      const y = (centre.y - RING_AT.y) / MM;     // height in the ring (mm), centre at 0
      const ang = Math.atan2(centre.z - RING_AT.z, centre.x - RING_AT.x);
      const wave = (ang / (Math.PI * 2) + 0.5) * 0.12;     // a sweep round the ring
      let from, start;
      if (kind === 'cab') { from = axisDir.clone().multiplyScalar(0.026); start = ASM0 + 0.36; }
      else if (kind === 'stones') {
        if (y > 2) { from = axisDir.clone().multiplyScalar(0.013).addScaledVector(radial(centre), 0.009); start = ASM0 + 0.2 + wave; }
        else { from = axisDir.clone().multiplyScalar(-0.012).addScaledVector(radial(centre), 0.006); start = ASM0 + 0.02 + wave; }
      } else {   // metal
        if (y > 9) { from = axisDir.clone().multiplyScalar(0.019).addScaledVector(radial(centre), 0.004); start = ASM0 + 0.28 + wave; }
        else if (y > 2) { from = axisDir.clone().multiplyScalar(0.007); start = ASM0 + 0.12 + wave * 0.5; }
        else { from = axisDir.clone().multiplyScalar(-0.016).addScaledVector(radial(centre), 0.003); start = ASM0 + wave * 0.5; }
      }
      const axis = V(r() - 0.5, r() - 0.5, r() - 0.5).normalize();
      return { from, axis, angle: kind === 'cab' ? 0 : (r() - 0.5) * 1.2, start, dur: kind === 'cab' ? 0.5 : 0.42 + r() * 0.08 };
    };
    D.asm = [
      prepareAssembly(find(ring, 'ring_metal'), plan('metal'), { sparkPower: 4, overshoot: 1.1 }),
      prepareAssembly(find(ring, 'ring_stones'), plan('stones'), { sparkPower: 10, overshoot: 1.1 }),
      prepareAssembly(find(ring, 'ring_cab'), plan('cab'), { spark: '#9dffb8', sparkPower: 3, overshoot: 0.9, sparkLife: 0.2 }),
    ];
    find(ring, 'ring_stones').material.userData.filmUniforms.uGemFire.value = 0.2;

    // ---- 设计: the package's brush strokes, flying onto the paper one after another in writing order
    const word = (await model('type_design')).clone();
    word.scale.setScalar(0.058);
    word.position.copy(WORD_AT);
    D.scene.add(word);
    D.strokes = [];
    word.traverse((o) => { if (o.isMesh) D.strokes.push(o); });
    const order = (n) => '设计'.indexOf(n[0]) * 100 + Number(n.slice(2));   // writing order: 设_00 … 设_05, 计_00 … 计_03
    D.strokes.sort((a, b) => order(a.name) - order(b.name));
    for (const m of D.strokes) m.userData.matte = true;   // type: in the engine's matte pass
    for (const [i, m] of D.strokes.entries()) {
      m.userData.rest = { p: m.position.clone(), q: m.quaternion.clone() };
      // thrown at the wall from the lens side: each stroke arrives out of the camera's space, turning, and lands flat
      m.userData.fly = { off: V((r() - 0.5) * 1.4, (r() - 0.5) * 1.0, 2.2 + r() * 1.6), axis: V(r() - 0.5, r() - 0.5, r() - 0.5).normalize(), ang: (r() - 0.5) * 3, t0: T.design + 1.55 + i * 0.06 };
    }

    // ---- gold construction lines: the axis, a circle at each part's level, and the compass drawing on the paper
    const L = (D.lines = []);
    const add = (pts, o, t0, t1) => { const l = goldLine(pts, o); D.scene.add(l); L.push({ l, t0, t1 }); return l; };
    const c = RING_AT;
    add(linePts(V(c.x, 0.0004, c.z), V(c.x, c.y + 0.042, c.z)), { dashed: true, dash: 0.006, gap: 0.0025, width: 0.0005 }, T.design, T.design + 0.63);
    add(circlePts(V(c.x, c.y + 0.026 + 0.0115, c.z), 0.0085), { width: 0.0003 }, T.design + 0.17, T.design + 0.70);      // the cabochon's level
    add(circlePts(V(c.x, c.y + 0.013 + 0.008, c.z), 0.0175), { width: 0.0003 }, T.design + 0.25, T.design + 0.81);     // the halo, bloomed
    add(circlePts(V(c.x, c.y - 0.016 - 0.004, c.z), 0.012), { width: 0.0003 }, T.design + 0.34, T.design + 0.87);      // the shank
    // on the paper: a compass circle, the centre cross, the halo and the cabochon's oval, a radius at 45° with its arc
    const P0 = V(c.x, 0.0004, c.z);
    add(circlePts(P0, 0.032), { width: 0.00032, power: 1.6 }, T.design + 0.07, T.design + 0.77);
    add(linePts(V(c.x - 0.042, 0.0004, c.z), V(c.x + 0.042, 0.0004, c.z)), { width: 0.00024, power: 1.4, dashed: true, dash: 0.005, gap: 0.002 }, T.design, T.design + 0.42);
    add(linePts(V(c.x, 0.0004, c.z - 0.042), V(c.x, 0.0004, c.z + 0.042)), { width: 0.00024, power: 1.4, dashed: true, dash: 0.005, gap: 0.002 }, T.design + 0.08, T.design + 0.50);
    add(circlePts(P0, 0.0135), { width: 0.0003, power: 1.6 }, T.design + 0.28, T.design + 0.84);
    add(Array.from({ length: 121 }, (_, i) => { const a = (i / 120) * Math.PI * 2; return V(c.x + Math.cos(a) * 0.006, 0.0004, c.z + Math.sin(a) * 0.008); }), { width: 0.0003, power: 1.6 }, T.design + 0.42, T.design + 0.92);
    add(linePts(P0, V(c.x + 0.032 * Math.cos(-0.8), 0.0004, c.z + 0.032 * Math.sin(-0.8))), { width: 0.00024, power: 1.4 }, T.design + 0.48, T.design + 0.73);
    add(circlePts(P0, 0.021, 'y', 60, -0.8, -0.1), { width: 0.00024, power: 1.4 }, T.design + 0.64, T.design + 0.98);
    D.world.finish();
  },
  update(t, sub) {
    D.world.update(t, sub, V(0, 0, 0));
    for (const a of D.asm) a.uniforms.uAsmTime.value = t;
    // the exploded ring turns slowly while it waits, then settles square to us as it assembles
    D.ringPivot.rotation.y = keys([[T.design, -0.9], [ASM0, -0.35, ease.linear], [T.design + 2.2, 0.12, ease.outCubic], [T.carve, 0.2]], t);
    D.ringPivot.position.y = RING_AT.y + Math.sin(t * 2.1) * 0.0007;
    // the construction is scaffolding: once the ring has closed it fades, and the last frame is the ring and the word
    const fade = 1 - seg(t, T.design + 2.1, T.design + 2.6, ease.inOutSine);
    for (const { l, t0, t1 } of D.lines) l.draw(seg(t, t0, t1, ease.inOutSine), fade);
    // strokes: each flies in from above the paper, turning, and lands with a small settle
    for (const m of D.strokes) {
      const f = m.userData.fly, R = m.userData.rest;
      const u = seg(t, f.t0, f.t0 + 0.34, ease.land);
      const k = 1 - u;
      m.position.copy(R.p).addScaledVector(f.off, k);
      m.quaternion.copy(R.q).premultiply(new THREE.Quaternion().setFromAxisAngle(f.axis, f.ang * k));
      m.visible = t >= f.t0 - 0.02;
    }
    // camera: an orbit from the ring's right side round to the front, rising, the word coming into view
    const cam = D.camera;
    // the exploded ring fills the frame (it is ~75 mm tall exploded); as it closes the camera comes round to the front
    // and lifts, the paper and the word rising into the bottom of the frame
    // the exploded ring (≈ 75 mm tall) fills two thirds of the frame; as it closes the camera comes round to the front and
    // lifts, ending on the ring above and 设计 on the paper below it
    // the exploded ring (≈ 75 mm tall) fills two thirds of the frame from its side; as it closes the camera comes round
    // to the front and eases back, the word arriving on the wall above and behind it
    const orbit = keys([[T.design, -50 * DEG], [T.design + 2.1, 0, ease.cam], [T.carve, 1.5 * DEG]], t);
    const dist = keys([[T.design, 0.24], [T.design + 1.3, 0.215, ease.inOutSine], [T.design + 2.3, 0.25, ease.cam], [T.carve, 0.256]], t);
    // high enough while the construction is up that its circles read as ellipses, not a crosshair; level at the end
    const elev = keys([[T.design, 16 * DEG], [T.design + 1.4, 14 * DEG], [T.design + 2.35, 4 * DEG, ease.cam], [T.carve, 4 * DEG]], t);
    const tgt = V(...keys([[T.design, [RING_AT.x, RING_AT.y + 0.008, RING_AT.z]], [T.design + 1.3, [RING_AT.x, RING_AT.y + 0.002, RING_AT.z]], [T.design + 2.3, [0.012, 0.058, -0.03], ease.cam], [T.carve, [0.013, 0.058, -0.03]]], t));
    const pos = V(tgt.x + dist * Math.cos(elev) * Math.sin(orbit), tgt.y + dist * Math.sin(elev), tgt.z + dist * Math.cos(elev) * Math.cos(orbit));
    const mm = keys([[T.design, 48], [T.design + 1.3, 52], [T.design + 2.3, 55, ease.cam], [T.carve, 56]], t);
    lookFrom(cam, pos, tgt, mm, keys([[T.design, -5 * DEG], [T.design + 1.8, 0, ease.cam]], t));
    handheld(cam, t, mm, 0.00015);
    cam.near = 0.004; cam.far = 6;
    return {
      scene: D.scene, camera: cam,
      dof: { focus: pos.distanceTo(RING_AT), fstop: 11, scale: 0.4, maxCoc: 18 },
      look: { exposure: 0.86, bloom: 0.07, glint: 0.55, glintThreshold: 8, ca: 0.35, vignette: 0.28, grain: 0.024 },
    };
  },
};

// ============================================================================================================ 雕刻
// A page of a jade album (玉册): the polished plaque stands on a zitan block before the moon window, lit from behind so
// its edges glow. In macro the cutter runs — frosted cuts, a spark, jade dust turning in the beam — and as the lens
// draws back, gold runs down into every stroke (描金), its front molten, until 雕刻 stands in gold on deep green.
const C = {};
const PLAQUE_AT = V(0, 0.091, 0);
const CUT = 1.4;                            // seconds the cut takes
const GILD = [T.carve + 1.4, T.carve + 2.25];   // the gold runs down the plaque (world y: top → foot)
const carve = {
  id: 'carve', start: T.carve, end: T.set, samples: 1,
  async init(ctx) {
    // the plaque in front of the moon window: its light comes through the jade; the shaft ends just past the plaque
    C.world = createBeamRoom(ctx, { target: V(0.0, 0.085, 0.0), cone: 0.24, wallZ: -0.24, sunPower: 4.2, beamLen: 1.12,
      window: { centre: V(0.062, 0.128, -0.24), radius: 0.088, power: 1.6 }, envWindow: 2.5 });
    C.scene = C.world.scene;
    C.camera = new THREE.PerspectiveCamera(30, 16 / 9, 0.004, 10);
    const root = (await model('craft_tablet_carved', { key: 'beam', glow: { color: '#43c865', base: 0.03, back: 0.42, rim: 0.14 } })).clone();
    root.traverse((o) => {
      const U = o.material?.userData?.filmUniforms;
      // a deep, glassy green with the cotton kept soft (the package's apple-green field reads as camouflage this close)
      if (o.isMesh && U?.uJadeDeep) {
        U.uJadeDeep.value.set(0.03, 0.2, 0.06); U.uJadeLight.value.set(0.1, 0.42, 0.13); U.uJadeAlbedoGain.value = 0.6;
        U.uFrostColor.value.set(0.62, 0.8, 0.64);           // a fresh cut frosts pale before the gold goes in
        o.material.envMap = jadeStudio(ctx.renderer);       // the polish holds a soft panel: a sheen fading down the face
        o.material.envMapIntensity = 1.0;
      }
    });
    root.position.copy(PLAQUE_AT);
    C.scene.add(root);
    C.root = root;
    const block = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.016, 0.034), null);
    block.material = createFilmMaterial('zitan', { ctx: meshContext(block, block) });
    block.position.set(0, 0.008, 0);
    block.castShadow = block.receiveShadow = true;
    C.scene.add(block);
    C.play = createCarvePlayback(root, textures);
    C.gild = addCarveGild(C.play.materials, { color: '#eab448', rough: 0.2, env: 1.9, stoneEnv: 0.45 });   // (much more env and the leaf clips to cream in the tonemap)
    // the carving draws its own matte (its cut coverage) in the engine's matte pass; ?gildmatte=1 draws only the gold
    // laid so far instead — the key for painting the 描金 onto a clay blockout, so a generative pass keeps it
    const gildOnly = typeof location !== 'undefined' && new URLSearchParams(location.search).has('gildmatte');
    root.traverse((o) => { if (o.isMesh && C.play.materials.includes(o.material)) o.userData.matteFn = (on) => { C.gild.uGildMatte.value = on ? (gildOnly ? 2 : 1) : 0; }; });
    await textures.ready();
    C.meta = await C.play.sequence.meta;
    C.cutter = glint('#f0fff2', 40, 0.008);
    C.cutter.sphere.scale.setScalar(0.45 * MM);
    C.scene.add(C.cutter);
    // jade dust: specks thrown from the cutter, slowing in the air, falling and turning in the beam
    const r = rng(77);
    const N = 360;
    C.dust = [];
    for (let i = 0; i < N; i++) C.dust.push({ b: T.carve + 0.1 + r() * (CUT - 0.05), v: V((r() - 0.5) * 0.05, (r() - 0.2) * 0.05, 0.02 + r() * 0.05), s: lerp(0.06, 0.2, r() * r()) * MM, life: lerp(0.6, 1.4, r()) });
    C.dustMesh = new THREE.InstancedMesh(new THREE.SphereGeometry(1, 6, 4), new THREE.MeshStandardMaterial({ color: new THREE.Color('#eef8ec'), roughness: 0.5, emissive: new THREE.Color('#d9f2da'), emissiveIntensity: 0.6 }), N);
    C.dustMesh.frustumCulled = false;
    C.scene.add(C.dustMesh);
    C.world.finish();
  },
  // tablet face coords (x ∈ [0, W], y ∈ [0, H] from the bottom, metres) → world (the plaque stands upright, facing +z)
  face(x, y) { return V(x - 0.04, -0.075 + y, 0.0033).add(PLAQUE_AT); },
  cutterAt(t) {
    // the cut runs 17.6 → 19.0 s over its 65 frames; cutter[k] = where the tool was on frame k (or lifted)
    const k = clamp(Math.round(lerp(1, 65, (t - (T.carve + 0.1)) / CUT)), 1, 65);
    return { k, xy: C.meta.cutter[k - 1] };
  },
  update(t, sub) {
    C.world.update(t, sub, { power: 1, beamPower: 1 });
    const { k, xy } = this.cutterAt(t);
    C.play.setFrame(k);
    if (xy && t < T.carve + 0.1 + CUT + 0.05) { C.cutter.position.copy(this.face(xy[0], xy[1])); C.cutter.visible = true; } else C.cutter.visible = false;
    // 描金: the gold front runs from above the plaque to below its foot; molten while it runs
    const g = seg(t, GILD[0], GILD[1], ease.inOutSine);
    C.gild.uGildOn.value = t >= GILD[0] ? 1 : 0;
    C.gild.uGildY.value = lerp(PLAQUE_AT.y + 0.08, PLAQUE_AT.y - 0.08, g);
    C.gild.uGildHot.value = 2.2 * Math.sin(Math.min(1, seg(t, GILD[0], GILD[1] + 0.15)) * Math.PI);
    const m = new THREE.Matrix4(), q = new THREE.Quaternion(), p = V(), sc = V();
    C.dust.forEach((d, i) => {
      const age = t - d.b;
      let s = 0;
      if (age > 0 && age < d.life) {
        const c = this.cutterAt(d.b);
        if (c.xy) {
          const drag = (1 - Math.exp(-2.5 * age)) / 2.5;
          p.copy(this.face(c.xy[0], c.xy[1])).addScaledVector(d.v, drag);
          p.y -= 0.5 * 0.05 * age * age;
          s = d.s * Math.min(1, (d.life - age) / 0.3);
        }
      }
      sc.setScalar(Math.max(s, 1e-7));
      m.compose(p, q, sc);
      C.dustMesh.setMatrixAt(i, m);
    });
    C.dustMesh.instanceMatrix.needsUpdate = true;
    // camera: macro on the cut (雕's upper strokes), then drawing back and down to the whole plaque in its light
    const cam = C.camera;
    const k2 = seg(t, T.carve + 0.9, T.carve + 2.2, ease.cam);
    const near = xy ? this.face(xy[0], xy[1]) : this.face(0.03, 0.12);
    const tgt = V(...keys([[T.carve, [near.x, near.y, near.z]], [T.carve + 0.9, [0.004, PLAQUE_AT.y + 0.03, 0]], [T.carve + 2.2, [0.02, PLAQUE_AT.y - 0.007, 0], ease.cam], [T.set, [0.021, PLAQUE_AT.y - 0.007, 0]]], t));
    const pos = V(...keys([[T.carve, [0.035, PLAQUE_AT.y + 0.045, 0.085]], [T.carve + 0.9, [0.045, PLAQUE_AT.y + 0.04, 0.12]], [T.carve + 2.2, [0.064, PLAQUE_AT.y + 0.006, 0.385], ease.cam], [T.set, [0.07, PLAQUE_AT.y + 0.004, 0.39]]], t));
    const mm = lerp(70, 43, k2);
    lookFrom(cam, pos, tgt, mm, lerp(-4, 0, k2) * DEG);
    handheld(cam, t, mm, 0.00012);
    cam.near = 0.004; cam.far = 6;
    return {
      scene: C.scene, camera: cam,
      composite: C.world.composite, compositeAfterDof: true,
      dof: { focus: pos.distanceTo(tgt), fstop: lerp(4, 8, k2), scale: 0.45, maxCoc: 22 },
      look: { exposure: 1.0, bloom: 0.07, glint: 0.3, glintThreshold: 26, glintKnee: 12, ca: 0.35, vignette: 0.34, grain: 0.026, contrast: 1.05 },
    };
  },
};

// ============================================================================================================ 镶嵌
// The champagne-gold plate lies on the bench in the shaft of sun, under the moon window; 镶 is already set. In macro at
// a grazing angle, 嵌's stones rain home in stroke order, each turning as it falls; the lens draws up and back to the
// finished word, and the light runs across it before the drop.
const P = {};
const PLATE_AT = V(0, 0.012, 0);
const TILT = -Math.PI / 2;                 // face up
const set = {
  id: 'set', start: T.set, end: T.drop, samples: 1,
  async init(ctx) {
    // the plate lies flat with the moon window behind it, so its polish mirrors the window: the reflection studio's
    // disc is kept to a glow (envWindow) and the plate's body darker and richer (envBand), so the white of the stones
    // carries the word
    P.world = createBeamRoom(ctx, { target: V(0.0, 0.012, 0.0), cone: 0.26, wallZ: -0.3, sunPower: 5, beamLen: 1.05,
      window: { centre: V(-0.24, 0.2, -0.3), radius: 0.095, power: 1.1 }, envWindow: 1.6, envBand: 0.42 });
    P.scene = P.world.scene;
    P.camera = new THREE.PerspectiveCamera(30, 16 / 9, 0.002, 10);
    const plate = (await model('craft_pave_set', { glow: null, key: 'beam' })).clone();
    plate.rotation.x = TILT;
    plate.position.copy(PLATE_AT);
    P.scene.add(plate);
    plate.updateMatrixWorld(true);
    P.plate = plate;
    P.pave = find(plate, 'pave');
    P.pave.userData.matteSelf = true;   // the stones spell 镶嵌: in the engine's matte pass (not the plate, its child)
    P.pave.userData.notextKeep = true;  // …but kept in the clean plate, so a generative pass renders them as real stones
    const gem = P.pave.material.userData.filmUniforms;
    gem.uGemFire.value = 0.3;
    gem.uGemSun.value = 14;            // the faint directional along the shaft reads as the sun's disc in the stones
    P.pave.material.envMap = gemStudio(ctx.renderer);   // the stones' own studio: scintillation against black
    P.pave.material.envMapIntensity = 0.75;           // white fire; the glint threshold keeps it to points, not starbursts
    // the plate's own studio: a soft panel behind, so the polish holds a light sweep into deep gold, not a flat slab
    // the sun's own mirror image in the polish is a blown double disc (the jittered area source): keep a trace of it
    const Q = typeof location !== 'undefined' ? new URLSearchParams(location.search) : new URLSearchParams();
    P.plateSun = { value: Number(Q.get('platesun') ?? 0.18) };
    for (const n of ['plate_face', 'plate_body']) {
      const m = find(plate, n).material;
      m.envMap = goldStudio(ctx.renderer);
      m.envMapIntensity = 1.0;
      if (Q.has('scratch')) m.userData.filmUniforms.uScratch.value = Number(Q.get('scratch'));
      const prev = m.onBeforeCompile, prevKey = m.customProgramCacheKey?.bind(m);
      m.onBeforeCompile = (sh, r) => {
        prev?.call(m, sh, r);
        sh.uniforms.uPlateSun = P.plateSun;
        sh.fragmentShader = 'uniform float uPlateSun;\n' + sh.fragmentShader.replace('#include <lights_fragment_end>',
          '#include <lights_fragment_end>\n  reflectedLight.directSpecular *= uPlateSun;');
      };
      m.customProgramCacheKey = () => (prevKey ? prevKey() : '') + '|plateSun';
      m.needsUpdate = true;
    }
    P.pave.frustumCulled = false;
    P.final = [];
    for (let i = 0; i < P.pave.count; i++) { const m = new THREE.Matrix4(); P.pave.getMatrixAt(i, m); const p = V(), q = new THREE.Quaternion(), s = V(); m.decompose(p, q, s); P.final.push({ p, q, s }); }
    const layout = await json('data/pave_stones.json');
    // 镶 = strokes 0 … 21 (already set), 嵌 = 22 … 33 (rain home)
    const firstQian = layout.findIndex((st) => st.k >= 22);
    const r = rng(2205);
    P.drops = layout.map((st, i) => {
      if (i < firstQian) return { t: -1 };
      const k = (i - firstQian) / (layout.length - firstQian);
      return { t: T.set + 0.15 + k * 1.5 + (r() - 0.5) * 0.04, dur: 0.5, h: 0.018 + r() * 0.01, spin: 1 + r() * 2, axis: V(r() - 0.5, r() - 0.5, r() - 0.5).normalize() };
    });

    P.world.finish();
  },
  update(t, sub) {
    P.world.update(t, sub, { power: 1, beamPower: 0.9 });
    const m = new THREE.Matrix4(), pos = V(), q = new THREE.Quaternion(), s = V(), q2 = new THREE.Quaternion();
    P.drops.forEach((d, i) => {
      const f = P.final[i];
      pos.copy(f.p); q.copy(f.q); s.copy(f.s);
      if (d.t >= 0) {
        const u = (t - d.t) / d.dur;
        if (u < 0) s.setScalar(1e-6);
        else if (u < 1) {
          // a slow-motion fall (eased in), a whisper of a bounce, seated; turning until it seats
          const fall = u < 0.82 ? 1 - Math.pow(u / 0.82, 2.2) : 0;
          const bounce = u >= 0.82 ? Math.sin(((u - 0.82) / 0.18) * Math.PI) * 0.025 : 0;
          pos.y += (fall + bounce) * d.h;              // the pave node's local y is the plate's normal
          q2.setFromAxisAngle(d.axis, (1 - Math.min(u / 0.82, 1)) * d.spin * Math.PI);
          q.premultiply(q2);
        }
      }
      m.compose(pos, q, s);
      P.pave.setMatrixAt(i, m);
    });
    P.pave.instanceMatrix.needsUpdate = true;
    // camera: macro on 嵌 at a grazing angle (its stones drop into frame), then up and back to the word
    const cam = P.camera;
    const k = seg(t, T.set + 1.2, T.set + 2.5, ease.cam);
    const qian = V(0.022, 0.012, 0.0);                                       // 嵌, on the plate (world)
    const e = seg(t, T.set, T.set + 1.2, ease.inOutSine);
    // (not closer: the plate's baked channels step at about 0.1 mm, which a closer lens resolves)
    const macroPos = V(lerp(0.064, 0.052, e), lerp(0.061, 0.068, e), lerp(0.07, 0.076, e));
    const macroTgt = qian.clone().add(V(lerp(0.008, -0.002, e), 0.0, lerp(-0.004, 0.0, e)));
    const widePos = V(0.004, 0.1, 0.135), wideTgt = V(0.003, 0.012, 0.004);
    const pos2 = macroPos.clone().lerp(widePos, k), tgt = macroTgt.clone().lerp(wideTgt, k);
    pos2.add(V(Math.sin(t * 0.4) * 0.001 * (1 - k), 0, 0));
    const mm = lerp(75, 50, k);
    lookFrom(cam, pos2, tgt, mm, lerp(6, 0, k) * DEG);
    handheld(cam, t, mm, 0.0001);
    cam.near = 0.002; cam.far = 6;
    const sweep = seg(t, T.drop - 0.9, T.drop - 0.1, ease.inOutSine);
    P.world.fire.intensity = 0.12 + Math.sin(sweep * Math.PI) * 0.12;
    return {
      scene: P.scene, camera: cam,
      composite: P.world.composite, compositeAfterDof: true,
      // a thin band of focus on the landing stones in macro (at ~10 cm the 75 mm's CoC is steep: keep scale low)
      dof: { focus: pos2.distanceTo(tgt), fstop: 11, scale: lerp(0.05, 0.2, k), maxCoc: 14 },
      look: { exposure: lerp(0.85, 0.95, k), bloom: 0.05, glint: 0.08 + Math.sin(sweep * Math.PI) * 0.12, glintThreshold: 22, glintKnee: 14, ca: 0.3, vignette: 0.34, grain: 0.026, contrast: 1.06 },
    };
  },
};

export default [design, carve, set];
