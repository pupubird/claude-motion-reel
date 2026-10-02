// Acts V–VI (24 – 40 s), one sunrise over the sea of cloud. The drop is the sunrise: the film opened on the moon (月),
// the sun (日) now breaks the horizon — 聚日月精华 — and the collection is cut on the beat in that light:
//   24.0 Buddha · 25.5 Guanyin · 26.5 pea-pod · 27.0 tulip · 27.5 the bangle · 28.5 the six close into a ring round the sun
// Then 聚 — gathering: the ring turns, faster, trailing light, and contracts into the sun; on the biggest hit of the film
// (33.0) the light bursts — god rays through the cloud, a shock ring, sparks — and the client's phoenix is born in solid
// gold out of it; 翡月荟 flies in letter by letter, 你的翡翠管家 rises under it, and the lockup holds in the sunrise.
import * as THREE from 'three';
import { Line2 } from 'three/addons/lines/Line2.js';
import { LineMaterial } from 'three/addons/lines/LineMaterial.js';
import { LineGeometry } from 'three/addons/lines/LineGeometry.js';
import { T, W as DW, H as DH, S as SCALE } from '../config.js';
import { model, createFilmMaterial } from '../assets.js';
import { createSkyWorld } from '../worlds/sky.js';
import { loadGlyphs } from '../lib/type3d.js';
import { buildLockup } from '../lib/logo3d.js';
import { keys, ease, seg, fovOf, DEG, lerp, fbm1, clamp, rng, pulse, cubicBezier } from '../lib/util.js';

const MM = 0.001;
const V = (x, y, z) => new THREE.Vector3(x, y, z);
const SUN_R = V(-0.35, 0.05, -0.94).normalize();    // sunrise: on the horizon, behind the ring
const CAMF = V(0.0, 0.058, 0.4);                     // the finale's camera
const C = CAMF.clone().addScaledVector(SUN_R, 0.44); // the ring's centre, on the line to the sun: the sun sits in it
const AX_U = new THREE.Vector3().crossVectors(SUN_R, V(0, 1, 0)).normalize().negate();   // screen right in the ring's plane
const AX_V = new THREE.Vector3().crossVectors(AX_U, SUN_R).normalize().negate();          // screen up
const R_WIDE = 0.14, R_RING = 0.078;
const S = {};

// the six, round the sun clockwise from the top
const PIECES = [
  { k: 'bangle', name: 'jewellery_bangle', th: 90 },
  { k: 'tulip', name: 'jewellery_tulip', th: 30 },
  { k: 'guanyin', name: 'jewellery_guanyin', th: -30 },
  { k: 'ring', name: 'jewellery_ring', th: -90 },
  { k: 'buddha', name: 'jewellery_buddha', th: -150 },
  { k: 'pod', name: 'jewellery_pod', th: 150 },
];
const slot = (th, R) => C.clone().addScaledVector(AX_U, Math.cos(th) * R).addScaledVector(AX_V, Math.sin(th) * R);

// the turn of the ring through the gather: slow, then faster and faster (radians since 30.0 s)
function spinAt(t) {
  const x = Math.max(0, t - T.gather);
  return 0.35 * x + 0.9 * Math.pow(x, 2.6);
}
function radiusAt(t) {
  return lerp(R_WIDE, R_RING, seg(t, T.drop + 4.5, T.gather, ease.inOutCubic)) * (1 - seg(t, T.gather + 1.7, T.burst - 0.04, ease.inCubic));
}

function frameOn(cam, target, facing, { dist, elev = 0, azim = 0, mm = 60, roll = 0, lift = 0 }) {
  // camera on the piece's facing direction, turned by azim (about up) and elev
  const f = facing.clone().applyAxisAngle(V(0, 1, 0), azim);
  f.y = Math.sin(elev) + f.y * Math.cos(elev);
  f.normalize();
  cam.position.copy(target).addScaledVector(f, dist);
  cam.position.y += lift;
  cam.up.set(Math.sin(roll), Math.cos(roll), 0);
  cam.lookAt(target);
  cam.fov = fovOf(mm);
  return dist;
}

function trail(color) {
  const g = new LineGeometry();
  const N = 48;
  g.setPositions(new Array(N * 3).fill(0));
  const cols = [];
  const c = new THREE.Color(color).multiplyScalar(5);
  for (let i = 0; i < N; i++) { const k = Math.pow(i / (N - 1), 2.2); cols.push(c.r * k, c.g * k, c.b * k); }
  g.setColors(cols);
  const m = new LineMaterial({ linewidth: 0.0011, worldUnits: true, vertexColors: true, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending });
  m.resolution.set(DW * SCALE, DH * SCALE);
  const l = new Line2(g, m);
  l.frustumCulled = false;
  l.N = N;
  return l;
}

export default {
  id: 'collection', start: T.drop, end: T.end + 1, samples: 1,

  async init(ctx) {
    await loadGlyphs();
    const W = (S.world = createSkyWorld(ctx, { sun: SUN_R }));
    S.scene = W.scene;
    S.camera = new THREE.PerspectiveCamera(30, 16 / 9, 0.003, 20);
    W.sun.color.set('#ffdcb0');
    W.clouds.uniforms.uSunColor.value.set('#ffd7ac').multiplyScalar(1.6);
    W.sky.u.uSunRadius.value = 0.016;
    // the finale's sky: deeper blue above, molten gold on the horizon (the gold needs a ground to stand against)
    S.skyDawn = { top: W.sky.u.uTop.value.clone(), mid: W.sky.u.uMid.value.clone(), glow: W.sky.u.uGlowColor.value.clone() };
    S.skyGold = { top: new THREE.Color('#3f5596'), mid: new THREE.Color('#ffb46e'), glow: new THREE.Color('#ffc477') };
    // a warm key from over the lens' left shoulder for the gold's faces
    S.key = new THREE.DirectionalLight(new THREE.Color('#ffe7c4'), 0);
    S.scene.add(S.key, S.key.target);

    // ---- the six
    S.pieces = [];
    for (const P of PIECES) {
      const root = (await model(P.name, { key: 'coll' })).clone();
      const box = new THREE.Box3().setFromObject(root);
      root.position.sub(box.getCenter(V()));
      const holder = new THREE.Group();
      holder.add(root);
      S.scene.add(holder);
      const mats = new Set();
      root.traverse((o) => { if (o.isMesh) for (const m of [].concat(o.material)) mats.add(m); });
      S.pieces.push({ ...P, th: P.th * DEG, holder, root, mats: [...mats], size: box.getSize(V()), trail: trail(P.k === 'bangle' || P.k === 'ring' ? '#d8ff9a' : '#ffd58a') });
    }
    for (const p of S.pieces) S.scene.add(p.trail);

    // ---- the gather's light ring, the shock ring, the sparks
    const glowMat = (c, k) => new THREE.MeshBasicMaterial({ color: new THREE.Color(c).multiplyScalar(k), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending });
    S.lightRing = new THREE.Mesh(new THREE.TorusGeometry(1, 0.012, 12, 180), glowMat('#ffe2a4', 6));
    S.shock = new THREE.Mesh(new THREE.TorusGeometry(1, 0.006, 8, 220), glowMat('#fff0c8', 8));
    for (const m of [S.lightRing, S.shock]) { m.position.copy(C); m.lookAt(CAMF); m.frustumCulled = false; S.scene.add(m); }
    const r = rng(3303);
    S.sparks = [];
    const N = 420;
    for (let i = 0; i < N; i++) {
      const a = r() * Math.PI * 2, out = Math.pow(r(), 0.5);
      const dir = AX_U.clone().multiplyScalar(Math.cos(a)).addScaledVector(AX_V, Math.sin(a)).addScaledVector(SUN_R, (r() - 0.5) * 0.5).normalize();
      S.sparks.push({ dir, v: lerp(0.08, 0.55, out), life: lerp(0.6, 1.8, r()), s: lerp(0.25, 0.9, r() * r()) * MM, t0: T.burst + r() * 0.08 });
    }
    S.sparkMesh = new THREE.InstancedMesh(new THREE.SphereGeometry(1, 8, 6), glowMat('#ffe7b0', 9), N);
    S.sparkMesh.frustumCulled = false;
    S.scene.add(S.sparkMesh);

    // ---- the lockup, in gold
    const goldCtx = () => ({ asset: new THREE.Matrix4().makeScale(MM, MM, MM), assetInv: new THREE.Matrix4(), box: null, size: null, worldScale: MM, seed: 2 });
    S.gold = createFilmMaterial('gold_brand', { ctx: goldCtx() });
    S.goldTag = createFilmMaterial('gold_brand', { ctx: goldCtx() });
    for (const g of [S.gold, S.goldTag]) { g.emissive = new THREE.Color('#ffb860'); g.emissiveIntensity = 0; g.envMapIntensity = 1.15; }
    S.L = await buildLockup({ gold: S.gold, goldTag: S.goldTag });
    // just under the sun: the light and its rays crown the logo instead of washing its centre
    S.L.group.position.copy(C).addScaledVector(SUN_R, -0.035).addScaledVector(AX_V, -0.052);
    S.lockAt = S.L.group.position.clone();
    S.L.group.userData.matte = true;   // the lockup: in the engine's matte pass
    S.L.group.lookAt(CAMF);
    S.scene.add(S.L.group);
    // a sweep light for the gold's last gleam
    S.sweep = new THREE.DirectionalLight(new THREE.Color('#fff4e0'), 0);
    S.scene.add(S.sweep, S.sweep.target);
  },

  update(t, sub) {
    const W = S.world;
    W.update(t, sub);
    const U = W.clouds.uniforms;
    U.uPart.value.w = -2; U.uVeil.value = 0; U.uBankDensity.value = 0;
    const cam = S.camera;

    // ---- the sun: breaks the horizon on the downbeat, the light up in a quarter second
    const rise = seg(t, T.drop - 0.05, T.drop + 0.35, ease.outCubic);
    const burst = pulse(t, [T.burst], 0.45);
    W.sun.intensity = lerp(0.8, 3.6, rise) + burst * 6;
    W.sky.u.uGlowPower.value = lerp(0.6, 2.4, rise) + burst * 5;
    W.sky.u.uGlowSize.value = 0.16 + burst * 0.1;
    W.sky.u.uSunDisc.value = lerp(0, 60, rise) * (1 + burst * 3);
    U.uGlowPos.value.copy(C);
    U.uGlowColor.value.set('#ffd28a').multiplyScalar(burst * 9 + seg(t, T.gather + 1.5, T.burst, ease.inQuad) * 2);
    U.uGlowRadius.value = 0.12;
    const gold = seg(t, T.gather - 0.5, T.burst + 0.5, ease.inOutSine);
    W.sky.u.uTop.value.copy(S.skyDawn.top).lerp(S.skyGold.top, gold);
    W.sky.u.uMid.value.copy(S.skyDawn.mid).lerp(S.skyGold.mid, gold);
    W.sky.u.uGlowColor.value.copy(S.skyDawn.glow).lerp(S.skyGold.glow, gold);
    S.key.intensity = seg(t, T.burst + 0.2, T.burst + 1.2) * 2.4;
    S.key.position.copy(CAMF).add(V(-0.25, 0.22, 0.1));
    S.key.target.position.copy(C);

    // ---- the six: wide arc (24 – 28.5), close into the ring (28.5 – 30), turn and gather (30 – 33)
    const spin = spinAt(t), R = radiusAt(t);
    const dissolve = seg(t, T.gather + 2.2, T.burst - 0.03, ease.inQuad);
    for (const p of S.pieces) {
      const pos = slot(p.th + spin, R);
      p.holder.position.copy(pos);
      p.holder.lookAt(CAMF);
      p.holder.rotateY(Math.sin((t - T.drop) * 0.9 + p.th) * 0.25 + (p.k === 'bangle' ? seg(t, 27.5, 28.7, ease.outCubic) * Math.PI * 3 : 0));
      p.holder.scale.setScalar(Math.max(1e-4, 1 - dissolve));
      p.holder.visible = t < T.burst;
      // they become light as they gather
      for (const m of p.mats) if (m.emissive) { m.emissive.set('#ffd9a0'); m.emissiveIntensity = dissolve * 4 + seg(t, T.gather + 1.0, T.burst, ease.inQuad) * 0.6; }
      // trails: the path behind each piece over the last 0.35 s
      const on = seg(t, T.gather + 0.3, T.gather + 0.9) * (1 - seg(t, T.burst - 0.05, T.burst + 0.15));
      p.trail.visible = on > 0;
      if (on > 0) {
        const pts = [];
        for (let i = 0; i < p.trail.N; i++) {
          const tt = t - 0.35 * (1 - i / (p.trail.N - 1));
          const q = slot(p.th + spinAt(tt), radiusAt(tt));
          pts.push(q.x, q.y, q.z);
        }
        p.trail.geometry.setPositions(pts);
        p.trail.material.opacity = on;
        p.trail.material.linewidth = 0.0011 * (0.6 + on * 0.6);
      }
    }
    // the light ring: the gather's circle, contracting into the sun
    const ringOn = seg(t, T.gather + 1.4, T.gather + 2.2) * (1 - seg(t, T.burst - 0.02, T.burst + 0.05));
    S.lightRing.visible = ringOn > 0;
    S.lightRing.scale.setScalar(Math.max(R, 0.002));
    S.lightRing.material.opacity = ringOn;
    // the burst: a shock ring and sparks
    const sh = seg(t, T.burst, T.burst + 0.8, ease.outCubic);
    S.shock.visible = t >= T.burst && sh < 1;
    S.shock.scale.setScalar(0.01 + sh * 0.42);
    S.shock.material.opacity = 1 - sh;
    const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), pp = V(), sc = V();
    S.sparks.forEach((sp, i) => {
      const age = t - sp.t0;
      let s = 1e-7;
      if (age > 0 && age < sp.life) {
        const d = (sp.v / 3.2) * (1 - Math.exp(-3.2 * age));         // drag
        pp.copy(C).addScaledVector(sp.dir, d);
        pp.y -= 0.012 * age * age;
        s = sp.s * (1 - age / sp.life);
      } else pp.copy(C);
      sc.setScalar(s);
      m4.compose(pp, q, sc);
      S.sparkMesh.setMatrixAt(i, m4);
    });
    S.sparkMesh.instanceMatrix.needsUpdate = true;

    // ---- the lockup: the phoenix born from the light, the name flying in, the tagline rising
    const L = S.L;
    const born = seg(t, T.burst, T.burst + 1.0, ease.land);
    L.group.visible = t >= T.burst - 0.02;
    L.mark.scale.setScalar(Math.max(1e-4, lerp(0.55, 1, born)));
    L.mark.rotation.y = lerp(-1.25, 0, born);
    L.mark.position.set(lerp(80, 0, born), 0, lerp(-30, 0, born));   // from the centre of the light (lockup mm) to its place
    S.gold.emissiveIntensity = lerp(3.2, 0, seg(t, T.burst, T.burst + 1.4, ease.outCubic)) * (t >= T.burst ? 1 : 0);
    L.chars.forEach((c, i) => {
      const t0 = T.word + i * 0.16;
      const u = seg(t, t0, t0 + 0.62, ease.land);
      c.holder.visible = t >= t0 - 0.01;
      c.holder.position.copy(c.rest).add(V(lerp(-60 - i * 25, 0, u), lerp(10, 0, u), lerp(40, 0, u)));
      c.holder.rotation.set(lerp(0.6, 0, u), lerp(-1.4, 0, u), 0);
      c.holder.scale.setScalar(Math.max(1e-4, lerp(0.4, 1, u)));
    });
    L.tag.chars.forEach((c, i) => {
      const t0 = T.tag + i * 0.07;
      const u = seg(t, t0, t0 + 0.55, ease.land);
      c.holder.visible = t >= t0 - 0.01;
      c.mesh.position.set(0, lerp(-0.5, 0, u), 0);
      c.mesh.scale.setScalar(Math.max(1e-4, u));
    });
    L.bars.forEach((b, i) => { const u = seg(t, T.tag + 0.25 + i * 0.07, T.tag + 0.7 + i * 0.07, ease.land); b.visible = u > 0; b.scale.set(1, Math.max(1e-4, u), 1); });
    // the last gleam: a light passes across the gold
    const gl = seg(t, T.tag + 1.4, T.tag + 2.6, ease.inOutSine);
    S.sweep.intensity = gl > 0 && gl < 1 ? 7 * Math.sin(gl * Math.PI) : 0;
    S.sweep.position.copy(C).add(V(lerp(-0.4, 0.4, gl), 0.18, 0.35));
    S.sweep.target.position.copy(C);

    // ---- camera
    const u = (a, b, e = ease.inOutSine) => seg(t, a, b, e);
    let focus, fstop = 8, mm = 40;
    const P = (k) => S.pieces.find((p) => p.k === k);
    const facing = (k) => CAMF.clone().sub(P(k).holder.position).normalize();
    if (t < 25.5) {        // Buddha: a slow push as the sunrise light sweeps across it
      focus = frameOn(cam, P('buddha').holder.position, facing('buddha'), { dist: lerp(0.15, 0.12, u(24.0, 25.5)), elev: 4 * DEG, azim: lerp(16, 6, u(24, 25.5)) * DEG, mm: 75 });
    } else if (t < 26.5) { // Guanyin: a low orbit
      focus = frameOn(cam, P('guanyin').holder.position, facing('guanyin'), { dist: 0.13, elev: lerp(-6, 2, u(25.5, 26.5)) * DEG, azim: lerp(-22, 6, u(25.5, 26.5)) * DEG, mm: 70, roll: 3 * DEG });
    } else if (t < 27.0) { // pea-pod: up its length
      focus = frameOn(cam, P('pod').holder.position, facing('pod'), { dist: 0.12, elev: 6 * DEG, azim: 18 * DEG, mm: 85, lift: lerp(-0.012, 0.01, u(26.5, 27)) });
    } else if (t < 27.5) { // tulip: across the pavé petals
      focus = frameOn(cam, P('tulip').holder.position, facing('tulip'), { dist: 0.12, elev: 10 * DEG, azim: lerp(-28, -14, u(27, 27.5)) * DEG, mm: 80, lift: 0.006 });
    } else if (t < T.gather) { // the bangle spinning, then back and up into the finale's frame
      const k = u(28.3, T.gather, ease.cam);
      const bp = P('bangle').holder.position;
      const near = bp.clone().addScaledVector(facing('bangle'), 0.2);
      cam.position.copy(near).lerp(CAMF, k);
      const tgt = bp.clone().lerp(C, k);
      cam.up.set(0, 1, 0);
      cam.lookAt(tgt);
      mm = lerp(65, 40, k);
      cam.fov = fovOf(mm);
      focus = cam.position.distanceTo(tgt);
      fstop = lerp(8, 11, k);
    } else {               // the push into the gather, the kick on the burst, the slow push on the lockup
      const push = seg(t, T.gather, T.end, cubicBezier(0.3, 0, 0.2, 1));
      cam.position.copy(CAMF).lerp(C, push * 0.15);
      const kick = pulse(t, [T.burst], 0.12);
      cam.position.x += Math.sin(t * 87) * kick * 0.0022;
      cam.position.y += Math.cos(t * 71) * kick * 0.0016;
      cam.up.set(0, 1, 0);
      // from the sun (the gather) down to the lockup's centre as it forms
      cam.lookAt(C.clone().lerp(S.lockAt, seg(t, T.burst, T.word + 0.6, ease.inOutSine)));
      mm = 40 * (1 - pulse(t, [T.burst], 0.25) * 0.05);
      cam.fov = fovOf(mm);
      focus = cam.position.distanceTo(C);
      fstop = 11;
    }
    if (t < T.gather) {
      cam.position.x += fbm1(t * 0.4, 9) * 0.0002;
      cam.position.y += fbm1(t * 0.37, 10) * 0.0002;
    }
    cam.near = 0.003; cam.far = 20;
    cam.updateMatrixWorld();
    cam.updateProjectionMatrix();
    // where the sun is on screen (for the god rays)
    const sp = C.clone().addScaledVector(SUN_R, 3).addScaledVector(AX_V, 0.0).project(cam);
    const rays = (t >= T.gather - 1 ? 0.35 : 0.15) + burst * 2.2 + seg(t, T.gather + 1.2, T.burst, ease.inQuad) * 0.6;
    return {
      scene: S.scene, camera: cam,
      composite: W.composite, compositeAfterDof: true,
      dof: { focus, fstop, scale: 0.4, maxCoc: 22 },
      look: {
        exposure: 0.92 - gold * 0.08, bloom: 0.08 + burst * 0.12, glint: lerp(0.5, 0.18, seg(t, T.word, T.tag + 0.5)), glintThreshold: lerp(8, 12, seg(t, T.word, T.tag + 0.5)), glintKnee: 6,
        ca: 0.4 + burst * 0.8, vignette: 0.26 + gold * 0.12,
        contrast: 1 + gold * 0.12, sat: 1 + gold * 0.12,
        fade: pulse(t, [T.burst], 0.09) * 0.55, fadeColor: [1.0, 0.95, 0.85],
        rays, raysAt: [sp.x * 0.5 + 0.5, sp.y * 0.5 + 0.5], raysThreshold: 1.1, raysDensity: 0.95, raysDecay: 0.958,
      },
    };
  },
};
