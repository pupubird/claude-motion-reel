// Acts I–III (0 – 12 s), one unbroken camera in one world: the dawn sky over a sea of cloud.
//   拨云  0 – 3    inside cloud; a green glow burns through; the sea of cloud sinks and the moon stands clear
//   见月  3 – 7.5  the moon is the imperial cabochon of a ring; pull back over the cloud sea, swing to the shank, dive
//   严选  7.5 – 12 through the hoop into a vortex of a hundred jade stones; ninety-nine fall into the cloud, one stays
// Type lives in the same sky, lit by the same sun: 拨开云雾 / 见明月 as two vertical gold columns flanking the moon,
// then 严选 ● 1% set in one line with the chosen stone as its centre.
import * as THREE from 'three';
import { T, bar, BEAT } from '../config.js';
import { model, find, glowMats, createFilmMaterial, meshContext, JADE_THREE, JADE_GLOW } from '../assets.js';
import { createSkyWorld, SUN } from '../worlds/sky.js';
import { loadGlyphs, buildLine } from '../lib/type3d.js';
import { addJadeGlow } from '../lib/jadeglow.js';
import { keys, ease, seg, fovOf, DEG, lerp, fbm1, rng, clamp, smoothstep, cubicBezier } from '../lib/util.js';

const CLOUD_TOP = -0.066;   // the billow tops under the moon (the slab top is -0.021; here the sea dips between towers)
const smax = (a, b, k) => 0.5 * (a + b + Math.sqrt((a - b) * (a - b) + k * k));

const MM = 0.001;
const S = {};
const V = (x, y, z) => new THREE.Vector3(x, y, z);

// ------------------------------------------------------------------------------------------------ the stones
// A double cabochon (domed both sides, the way loose stones are cut), oval 12 × 16 mm.
function cabochonGeometry() {
  const pts = [];
  const R = 6 * MM, top = 4.6 * MM, bot = 1.6 * MM;
  for (let i = 0; i <= 16; i++) { const a = (i / 16) * Math.PI / 2; pts.push(new THREE.Vector2(Math.sin(a) * R, -bot * Math.cos(a))); }
  for (let i = 1; i <= 28; i++) { const a = (i / 28) * Math.PI / 2; pts.push(new THREE.Vector2(Math.cos(a) * R, top * Math.sin(a))); }
  pts[pts.length - 1].x = 0; pts[0].x = 0;
  const g = new THREE.LatheGeometry(pts, 72);
  g.scale(1, 1, 16 / 12);
  g.computeVertexNormals();
  return g;
}

// The hundred: grade by weight (the common grades more often), one imperial. Each has a vortex orbit and a fall.
// greens, whites and greys only — honey, lavender and spring read as sweets in a crowd
const GRADES = [['white', 16], ['apple', 14], ['oily', 14], ['flower', 13], ['spinach', 12], ['water', 11], ['ice', 11], ['black', 8]];
function planStones() {
  const r = rng(20261001);
  const pool = GRADES.flatMap(([g, w]) => Array(w).fill(g));
  const stones = [];
  for (let i = 0; i < 99; i++) {
    // a three-start helix about the flight axis: arm a, evenly spaced in depth, twisting 1.6 turns over the tunnel
    const arm = i % 3, k = Math.floor(i / 3) / 33;
    const z = -lerp(0.05, 0.42, k + (r() - 0.5) * 0.012);
    stones.push({
      grade: pool[Math.floor(r() * pool.length)],
      r: lerp(19, 27, r()) * MM * lerp(1.15, 0.85, k),  // orbit radius about the flight axis
      th: arm * (Math.PI * 2 / 3) + k * Math.PI * 2 * 1.6 + (r() - 0.5) * 0.25,
      z,                                               // depth along the axis
      w: lerp(0.6, 1.4, r()),                          // angular speed factor
      s: lerp(0.55, 0.85, r()),
      ax: V(r() - 0.5, r() - 0.5, r() - 0.5).normalize(), spin: lerp(1.5, 4.5, r()), ph: r() * 6.28,
      fall: T.fall + r() * 0.45,                       // when gravity takes it
      fx: (r() - 0.5) * 0.02,                          // sideways drift as it falls
    });
  }
  return stones;
}

export default {
  id: 'heavens', start: 0, end: T.design, samples: 1,

  async init(ctx) {
    await loadGlyphs();
    const W = (S.world = createSkyWorld(ctx));
    const scene = (S.scene = W.scene);
    S.camera = new THREE.PerspectiveCamera(10, 16 / 9, 0.004, 20);

    // ---- the ring
    const ring = (S.ring = (await model('jewellery_ring')).clone());
    S.tilt = new THREE.Group();
    S.pivot = new THREE.Group();
    S.tilt.add(ring); S.pivot.add(S.tilt); scene.add(S.pivot);
    S.cab = find(ring, 'ring_cab');
    S.metal = find(ring, 'ring_metal');
    find(ring, 'ring_stones').material.userData.filmUniforms.uGemFire.value = 0.18;
    ring.updateWorldMatrix(true, true);
    const rc = new THREE.Raycaster();
    let best = { y: 0, r: 0 };
    for (let y = -10; y <= 0; y += 0.25) {
      const o = V(0, y * MM, 0);
      let rmin = Infinity;
      for (let a = 0; a < 24; a++) {
        rc.set(o, V(Math.cos((a / 24) * Math.PI * 2), Math.sin((a / 24) * Math.PI * 2), 0));
        const hit = rc.intersectObject(S.metal, false)[0];
        rmin = Math.min(rmin, hit ? hit.distance : Infinity);
      }
      if (rmin > best.r && Number.isFinite(rmin)) best = { y: y * MM, r: rmin };
    }
    S.hole = best;
    S.cabCentre0 = new THREE.Box3().setFromObject(S.cab).getCenter(V());
    S.cabCentre = S.cabCentre0.clone();

    // ---- the hundred stones (instanced per grade) and the one
    const geo = cabochonGeometry();
    const probe = new THREE.Mesh(geo);
    const pctx = meshContext(probe, probe);
    S.stones = planStones();
    S.byGrade = new Map();
    for (const st of S.stones) {
      if (!S.byGrade.has(st.grade)) S.byGrade.set(st.grade, []);
      st.slot = S.byGrade.get(st.grade).length;
      S.byGrade.get(st.grade).push(st);
    }
    S.inst = new Map();
    for (const [g, list] of S.byGrade) {
      const mat = createFilmMaterial(`grade_${g}`, { ctx: pctx, seed: list.length * 3.7 });
      const im = new THREE.InstancedMesh(geo, mat, list.length);
      im.frustumCulled = false; im.castShadow = true; im.receiveShadow = true;
      addJadeGlow(im, { color: '#' + new THREE.Color().setRGB(...mat.userData.filmUniforms.uJadeLight.value.toArray()).getHexString(), base: 0.03, back: 0.18, rim: 0.02 });
      scene.add(im);
      S.inst.set(g, im);
    }
    const oneMat = createFilmMaterial('jade_imperial', { ctx: pctx, variant: 'v4', three: JADE_THREE });
    S.one = new THREE.Mesh(geo, oneMat);
    S.one.castShadow = true;
    addJadeGlow(S.one, JADE_GLOW);
    scene.add(S.one);

    // ---- type: gold, in the sky
    // the brand's foil gold (#ab8d51 on screen): satin, so its colour holds whatever the sky behind it does
    const gold = createFilmMaterial('gold_foil', { ctx: { asset: new THREE.Matrix4().makeScale(0.02, 0.02, 0.02), assetInv: new THREE.Matrix4(), box: null, size: null, worldScale: 0.02, seed: 1 } });
    gold.envMap = W.goldEnv;
    gold.envMapIntensity = 0.5;
    S.gold = gold;
    // 拨开云雾 / 见明月: two vertical columns flanking the moon (read right column first? no — 拨开云雾 first, on the right,
    // as traditional vertical text runs right to left)
    S.colA = this.column('拨开云雾', gold);
    S.colB = this.column('见明月', gold);
    scene.add(S.colA.group, S.colB.group);
    S.colA.group.userData.matte = S.colB.group.userData.matte = true;   // type: in the engine's matte pass
    // 严选 ● 1%
    S.lineL = buildLine('严选', { material: gold, depth: 0.14, bevel: 0.02, tracking: 0.06 });
    S.lineR = buildLine('1%', { font: 'serif600', material: gold, depth: 0.14, bevel: 0.02, tracking: 0.0 });
    scene.add(S.lineL.group, S.lineR.group);
    S.lineL.group.userData.matte = S.lineR.group.userData.matte = true;
  },

  column(text, material) {
    const group = new THREE.Group();
    const chars = [];
    let i = 0;
    for (const ch of text) {
      const l = buildLine(ch, { material, depth: 0.1, bevel: 0.014, tracking: 0 });
      const c = l.chars[0];
      c.holder.position.set(0, -i * 1.12, 0);
      group.add(c.holder);
      chars.push(c);
      i++;
    }
    return { group, chars, n: i };
  },

  update(t, sub) {
    const W = S.world;
    W.update(t, sub);
    const cam = S.camera;
    const U = W.clouds.uniforms;

    // ============================================================= the ring: pitched to us for the moon, square for the dive
    S.tilt.rotation.x = keys([[0, 34 * DEG], [T.reveal, 30 * DEG], [T.dive, 4 * DEG, ease.cam], [T.select - 0.3, 0, ease.inOutSine]], t);
    S.pivot.rotation.y = keys([[0, 0.06], [T.reveal, -0.02], [T.dive, -0.3, ease.cam], [T.select - 0.3, 0, ease.inOutSine]], t);
    // 海上生明月: the ring rises out of the sea of cloud as the camera arrives (its top breaks the cloud ≈ 2.4 s)
    // (the cloud tops dip to 71 mm below the ring's line between towers: start under all of them)
    S.pivot.position.y = keys([[0, -0.115], [T.part - 1.1, -0.11], [T.moon + 0.3, 0, cubicBezier(0.3, 0, 0.15, 1)]], t);
    S.pivot.updateMatrixWorld(true);
    S.cabCentre.copy(S.cabCentre0).applyMatrix4(S.tilt.matrix).applyMatrix4(S.pivot.matrix);
    S.ring.visible = t < T.select + 0.2;

    // ============================================================= camera
    const holeY = S.hole.y;
    let lookAt, mm, roll = 0;
    if (t < T.select) {
      const c = S.cabCentre;
      // aim where the moon will stand, not at the ring under the cloud: we fly over the tops and it rises into frame
      const cy = c.y - S.pivot.position.y;
      const target = keys([[0, [c.x, cy - 1 * MM, c.z]], [T.reveal, [c.x, cy - 1 * MM, c.z]], [T.dive, [0, 1 * MM, 0], ease.cam], [T.select, [0, holeY, 0], ease.whip]], t);
      const dist = keys([[0, 0.78], [T.moon, 0.2, cubicBezier(0.25, 0.1, 0.25, 1)], [T.reveal, 0.18, ease.inOutSine], [T.dive, 0.165, ease.cam], [T.select, 0.0, ease.whip]], t);
      const elev = keys([[0, 6.5 * DEG], [T.part, 5 * DEG], [T.moon, 4 * DEG, ease.inOutSine], [T.reveal, 4 * DEG, ease.inOutSine], [T.dive, 9 * DEG, ease.cam], [T.select, 0, ease.whip]], t);
      const azim = keys([[0, 9 * DEG], [T.moon, 0, ease.inOutSine], [T.reveal, 0], [T.dive, -22 * DEG, ease.cam], [T.select, 0, ease.whip]], t);
      mm = keys([[0, 38], [T.moon, 112, cubicBezier(0.5, 0, 0.3, 1)], [T.reveal, 112, ease.inOutSine], [T.dive, 60, ease.cam], [T.select, 26, ease.whip]], t);
      const p = V(...target);
      cam.position.set(p.x + dist * Math.cos(elev) * Math.sin(azim), p.y + dist * Math.sin(elev), p.z + dist * Math.cos(elev) * Math.cos(azim));
      // the eye stays on the moon: on its glow in the cloud tops while it is under them, then riding up with it
      lookAt = dist > 1e-4 ? V(p.x, smax(p.y + c.y - cy, CLOUD_TOP, 0.012), p.z) : V(0, holeY, -1);
      S.focus = Math.max(dist, 0.01);
    } else {
      // through the hoop and on into the vortex, decelerating; a slow bank
      const z = keys([[T.select, 0], [T.fall, -0.21, ease.outCubic], [T.one, -0.255, ease.outSine], [T.design, -0.275, ease.linear]], t);
      const y = keys([[T.select, holeY], [T.fall, holeY + 4 * MM], [T.one, holeY + 9 * MM, ease.inOutSine]], t);
      cam.position.set(0, y, z);
      lookAt = V(0, y - keys([[T.select, 0], [T.one, 1.5 * MM]], t), z - 1);
      roll = keys([[T.select, 0], [T.fall, -9 * DEG, ease.outCubic], [T.one, 0, ease.inOutSine]], t);
      mm = keys([[T.select, 26], [T.fall, 30, ease.outCubic], [T.one, 36, ease.inOutSine], [T.design, 40]], t);
      S.focus = keys([[T.select, 0.06], [T.fall, 0.09], [T.one, 0.12, ease.inOutSine]], t);
    }
    const hh = 0.00016 * (60 / mm);
    cam.position.x += fbm1(t * 0.35, 1) * hh;
    cam.position.y += fbm1(t * 0.31, 2) * hh;
    cam.up.set(Math.sin(roll), Math.cos(roll), 0);
    cam.lookAt(lookAt);
    cam.fov = fovOf(mm);
    cam.near = 0.002; cam.far = 20;
    cam.updateMatrixWorld();

    // ============================================================= the hundred
    this.stones(t, cam);

    // ============================================================= type
    this.type(t, cam);

    // ============================================================= cloud: a bank wrapped round the moon parts over the sea
    // The sea is settled from frame one (we glide over it toward a bank of cloud lit green from inside: the moon hidden
    // in it). From 1.4 s the bank thins and a clearing opens on the line of sight; by 3.2 s the moon stands clear.
    U.uSlab.value.set(-0.14, -0.021);
    U.uCoverage.value = 0.36; U.uDensity.value = 520; U.uVeil.value = 0;
    const part = seg(t, T.part - 0.9, T.moon + 0.3, ease.inOutSine);
    // no hole until the ring breaks the surface; then a small clearing lets it stand clear of the wisps
    U.uPart.value.set(S.cabCentre.x, S.cabCentre.y, S.cabCentre.z, t < T.reveal + 1 ? lerp(-0.006, 0.02, part) : -2);
    U.uBankDensity.value = 0;
    // the light sits just under the tops while the ring is deep, so the cloud glows where it will break through
    U.uGlowPos.value.copy(S.cabCentre).setY(smax(S.cabCentre.y, CLOUD_TOP - 0.01, 0.008));
    // the moon behind the cloud: a bright jade-white core, so thin cloud glows, thick cloud shades, and the god-ray
    // pass streams its light through the gaps toward the lens
    // the moon under the cloud: its jade light glows up through the cloud tops ahead of us, then rides the ring up
    U.uGlowColor.value.set('#cfffdc').multiplyScalar(lerp(5.0, 0.4, part));
    U.uGlowRadius.value = lerp(0.03, 0.01, part);

    const fstop = keys([[0, 5.6], [T.moon, 8], [T.reveal, 11], [T.dive, 11], [T.select, 4], [T.fall, 5.6], [T.one, 8]], t);
    const mp = S.cabCentre.clone().project(cam);
    // rays from the glow under the cloud — only while it is under the cloud (the diamonds would streak them)
    const rays = 0.8 * (1 - seg(t, T.part - 0.9, T.part - 0.2));
    return {
      scene: S.scene, camera: cam,
      composite: W.composite, compositeAfterDof: true,
      dof: { focus: S.focus, fstop, scale: 0.35, maxCoc: 22 },
      look: {
        exposure: 1.0, bloom: 0.06, glint: keys([[0, 0.2], [T.reveal, 0.3], [T.one, 0.5]], t), glintThreshold: 12, glintKnee: 8,
        ca: 0.4, vignette: 0.22,
        rays, raysAt: [mp.x * 0.5 + 0.5, mp.y * 0.5 + 0.5], raysThreshold: 1.2, raysDensity: 0.9, raysDecay: 0.962,
      },
    };
  },

  // ------------------------------------------------------------------------------------------------ the vortex
  stones(t, cam) {
    const m = new THREE.Matrix4(), q = new THREE.Quaternion(), p = V(), sc = V();
    const hy = S.hole.y;
    const vis = t > T.dive - 0.5;
    for (const [g, list] of S.byGrade) {
      const im = S.inst.get(g);
      im.visible = vis;
      if (!vis) continue;
      for (const st of list) {
        const tt = t - T.dive;
        const th = st.th + tt * 0.55;                                                  // the helix turns as one
        p.set(Math.cos(th) * st.r, hy + Math.sin(th) * st.r, st.z);
        // entrance: each rises out of the cloud sea along a short arc, staggered by depth
        const rise = seg(t, T.dive - 0.5 + (-st.z - 0.05) * 2.2, T.dive + 0.7 + (-st.z - 0.05) * 2.2, ease.land);
        p.y = lerp(-0.06, p.y, rise);
        // the fall: gravity in slow motion (a miniature in real g would drop out of frame in a blink)
        const ft = Math.max(0, t - st.fall);
        p.y -= 0.5 * 0.16 * ft * ft;
        p.x += st.fx * ft;
        const spin = st.spin * (1 + 1.5 * Math.min(ft, 1));
        q.setFromAxisAngle(st.ax, st.ph + t * spin);
        const s = st.s * (ft > 0 ? Math.max(0, 1 - Math.max(0, ft - 1.2) * 1.2) : 1);
        sc.set(s, s, s);
        m.compose(p, q, sc);
        im.setMatrixAt(st.slot, m);
      }
      im.instanceMatrix.needsUpdate = true;
    }
    // the one: deep in the swirl, then up into the light to the line's centre
    const tt = t - T.dive;
    const orbit = V(Math.cos(1.2 + tt * 0.7) * 20 * MM, hy + Math.sin(1.2 + tt * 0.7) * 20 * MM, -0.36);
    const home = this.home(t);
    const k = seg(t, T.fall - 0.1, T.one + 0.35, ease.land);
    S.one.position.copy(orbit).lerp(home, k);
    S.one.visible = vis;
    // stands upright (long axis vertical), turning slowly to catch the sun
    S.one.rotation.set(Math.PI / 2 * k + (1 - k) * (t * 1.3), (1 - k) * t * 0.9 + k * (0.35 * Math.sin((t - T.one) * 0.9)), 0);
    S.one.scale.setScalar(lerp(1, 1.35, k));
  },

  // where the chosen stone sits: the centre of the line 严选 ● 1%, in front of the camera's final position
  home(t) {
    return V(0, S.hole.y + 9 * MM, -0.255 - 0.135);
  },

  // ------------------------------------------------------------------------------------------------ type
  type(t, cam) {
    // 拨开云雾 / 见明月: right column first (vertical text reads right to left), beside the moon, facing the opening camera
    const c = S.cabCentre;
    const em = 5.2 * MM;
    const face = Math.atan2(0.215 * Math.sin(4 * DEG), 0.215);
    S.colA.group.position.set(c.x + 21 * MM, c.y + 6.5 * MM, c.z + 4 * MM);
    S.colB.group.position.set(c.x - 21 * MM, c.y + 6.5 * MM, c.z + 4 * MM);
    // the columns rise once the moon stands clear and hold through the first half of the pull-back (≈ 2.5 s formed)
    for (const [col, t0] of [[S.colA, T.moon + 0.05], [S.colB, T.moon + 0.05 + 4 * 0.14 + 0.1]]) {
      col.group.scale.setScalar(em);
      col.group.rotation.set(-face, 0, 0);
      col.group.visible = t > t0 - 0.1 && t < T.dive + 0.4;
      col.chars.forEach((ch, i) => {
        const a = seg(t, t0 + i * 0.14, t0 + i * 0.14 + 0.7, ease.land);
        ch.mesh.position.set(0, lerp(-0.6, 0, a), lerp(-1.2, 0, a));
        ch.mesh.rotation.set(lerp(0.9, 0, a), 0, 0);
        ch.mesh.scale.setScalar(Math.max(1e-4, a));
      });
    }
    // 严选 ● 1%: rising out of the cloud into the line, one after another, the chosen stone at its centre
    const home = this.home(t);
    const em2 = 16 * MM;
    S.lineL.group.scale.setScalar(em2);
    S.lineR.group.scale.setScalar(em2);
    S.lineL.group.position.set(home.x - (S.lineL.width / 2 + 0.95) * em2, home.y - 0.02 * em2, home.z);
    S.lineR.group.position.set(home.x + (S.lineR.width / 2 + 0.95) * em2, home.y - 0.02 * em2, home.z);
    const show = t > T.fall + 0.3;
    S.lineL.group.visible = S.lineR.group.visible = show;
    const all = [...S.lineL.chars, ...S.lineR.chars];
    all.forEach((ch, i) => {
      const t0 = T.one - 0.35 + (i < 2 ? i : i + 0.6) * 0.12;
      const a = seg(t, t0, t0 + 0.8, ease.land);
      ch.mesh.position.set(0, lerp(-2.6, 0, a), 0);
      ch.mesh.rotation.set(lerp(-1.1, 0, a), lerp(0.4 * (i % 2 ? 1 : -1), 0, a), 0);
    });
  },
};
