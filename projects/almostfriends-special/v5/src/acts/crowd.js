// IV · THE CROWD (10–16 s). On the downbeat the camera whips out from Bub to the whole sky of people — thousands of
// glass orbs in their own priorities' colours — while the ring Bub gathered blasts outward as a scan front: the
// people who share your values swell and glow as it passes, the rest fall back toward the sky. A counter rolls up.
// Then Bub flies through them, the camera chasing: a first candidate (a look, a shake of the head), a second (no),
// and the one — the same three colours as Bub. A glass ring snaps round it, "98% match", and the camera dives
// through its film.
import * as THREE from 'three';
import { TL } from '../timeline.js';
import { C, FONTS, SPRING, P, PKEYS, PICKS } from '../brand.js';
import { clamp, lerp, seg, spring, springVel, ease as E, rng } from '../util.js';
import { project } from '../proj.js';
import { keyed, hand } from '../camera.js';
import { crowdField } from '../gl/crowd.js';
import { daySky, glow } from '../sky.js';
import { BUB } from './values.js';
import { filmWash, lensFilm } from './chat.js';

const K = TL.crowd;
const lerp3 = (a, b, u) => [lerp(a[0], b[0], u), lerp(a[1], b[1], u), lerp(a[2], b[2], u)];
const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const add = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const mul = (a, k) => [a[0] * k, a[1] * k, a[2] * k];
const len = (a) => Math.hypot(a[0], a[1], a[2]);
const norm = (a) => mul(a, 1 / (len(a) || 1));

// the flight: Catmull-Rom through these, from where Bub stood to beside the one
const PTS = [[0, -1.62, 0], [0.6, -1.2, -2.5], [1.9, 0.4, -8], [-1.3, 2.3, -15.5], [1.7, 3.9, -23], [2.55, 4.5, -27.6]];
function cr(p0, p1, p2, p3, u) {
  const u2 = u * u, u3 = u2 * u;
  return [0, 1, 2].map((k) => 0.5 * (2 * p1[k] + (-p0[k] + p2[k]) * u + (2 * p0[k] - 5 * p1[k] + 4 * p2[k] - p3[k]) * u2 + (-p0[k] + 3 * p1[k] - 3 * p2[k] + p3[k]) * u3));
}
export function path(u) {
  const n = PTS.length - 1;
  const x = clamp(u) * n, i = Math.min(n - 1, Math.floor(x)), f = x - i;
  return cr(PTS[Math.max(0, i - 1)], PTS[i], PTS[i + 1], PTS[Math.min(n, i + 2)], f);
}
const tangent = (u) => norm(sub(path(Math.min(1, u + 0.01)), path(Math.max(0, u - 0.01))));
export const ONE = [4.05, 5.15, -29.4];
export const ONE_R = 1.25;
const C1 = add(path(0.36), [1.55, 0.35, -0.4]);
const C2 = add(path(0.66), [-1.65, 0.55, -0.2]);
const ONE_COLS = PICKS.map((k) => P[k].color);

// progress along the path: a stop at each candidate
const UK = [[12.0, 0], [12.32, 0.33], [12.62, 0.36], [13.0, 0.63], [13.28, 0.66], [13.8, 1.0]];
function pathU(t) {
  if (t <= UK[0][0]) return 0;
  for (let i = 1; i < UK.length; i++) {
    if (t <= UK[i][0]) {
      const [t0, u0] = UK[i - 1], [t1, u1] = UK[i];
      const stop = u1 - u0 < 0.05;
      return lerp(u0, u1, (stop ? E.inOutSine : E.inOutCubic)((t - t0) / (t1 - t0)));
    }
  }
  return 1;
}

export function bubCrowd(t) {
  const u = pathU(t);
  const pos = path(u);
  // the "no"s: a look at the candidate, a shake
  let gaze = [0, 0], squint = 0, happy = 0, wide = 0.1;
  const no = (tc, cand) => {
    const a = seg(t, tc - 0.12, tc + 0.05), b = 1 - seg(t, tc + 0.32, tc + 0.42);
    const w = a * b;
    const d = norm(sub(cand, pos));
    gaze = [gaze[0] + d[0] * 0.9 * w + Math.sin((t - tc) * 34) * 0.32 * w * seg(t, tc + 0.05, tc + 0.12), gaze[1] + d[1] * 0.5 * w];
    squint = Math.max(squint, 0.45 * w);
  };
  no(12.45, C1); no(13.12, C2);
  if (t >= K.found - 0.15) { const d = norm(sub(ONE, pos)); const w = seg(t, K.found - 0.15, K.found); gaze = [d[0] * 0.8 * w, d[1] * 0.4 * w]; wide = 0.6 * w; }
  if (t >= K.found + 0.35) happy = 1;
  const v = len(sub(path(pathU(t + 0.02)), path(pathU(t - 0.02)))) / 0.04;
  return { pos, r: 1.0, squash: clamp(v * 0.012, 0, 0.14), k: 0.4, gaze, squint, happy, wide, fill: 0.53, c1: ONE_COLS[0], c2: ONE_COLS[1], c3: ONE_COLS[2], glow: 0.6, look: [gaze[0] * 0.6, gaze[1] * 0.4] };
}

export const crowdCam = (t) => {
  const keys = [
    { t: 10.0, pos: [0, -1.62, 9.3], target: [0, -1.62, 0], fov: 35 },
    { t: 10.62, pos: [-1.5, 4.2, 36], target: [0.6, 0.6, -10], fov: 38, ease: E.outExpo },        // a whip: all speed at once
    { t: 11.95, pos: [-0.6, 3.2, 31], target: [0.6, 0.8, -10], fov: 38, ease: E.inOutSine },
  ];
  let cam;
  if (t < 11.95) cam = keyed(keys, t);
  else {
    // the chase: behind and above Bub, a little late (it follows); the target a little ahead (it leads)
    const u = pathU(t);
    const b = path(u), bl = path(Math.max(0, pathU(t - 0.12))), ahead = path(Math.min(1, pathU(t + 0.1)));
    const tg = tangent(Math.max(0.02, u));
    const chase = { pos: add(add(bl, mul(tg, -8.2)), [-1.1, 1.9, 0]), target: add(lerp3(b, ahead, 0.6), [0.9, 0.2, 0]), fov: 40 };
    const from = keyed(keys, 11.95);
    const w = seg(t, 11.95, 12.45, E.inOutCubic);
    cam = { pos: lerp3(from.pos, chase.pos, w), target: lerp3(from.target, chase.target, w), fov: lerp(from.fov, chase.fov, w), roll: -0.05 * tg[0] * w };
    // found: frame Bub and the one together, then the dive through its film
    if (t >= K.found - 0.3) {
      const mid = lerp3(path(1), ONE, 0.5);
      const two = { pos: add(mid, [0.5, 0.6, 7.6]), target: add(mid, [0, 0.1, 0]), fov: 38, roll: 0 };
      const w2 = seg(t, K.found - 0.3, K.found + 0.45, E.inOutCubic);
      cam = { pos: lerp3(cam.pos, two.pos, w2), target: lerp3(cam.target, two.target, w2), fov: lerp(cam.fov, two.fov, w2), roll: lerp(cam.roll, 0, w2) };
      if (t >= K.dive[0] - 0.25) {
        const dive = { pos: add(ONE, [0, 0, 0.35]), target: add(ONE, [0, 0, -3]), fov: 46, roll: 0.06 };
        const w3 = seg(t, K.dive[0] - 0.25, K.dive[1], E.inExpo);
        cam = { pos: lerp3(cam.pos, dive.pos, w3), target: lerp3(cam.target, dive.target, Math.min(1, w3 * 1.6)), fov: lerp(cam.fov, dive.fov, w3), roll: lerp(cam.roll, dive.roll, w3) };
      }
    }
  }
  return hand(cam, t, seg(t, 10.7, 11.2) * (1 - seg(t, 14.9, 15.1)), 0.0035);
};
export const CROWD_HITS = [[K.whip, 10, 0.1], [K.land, 18, 0.14], [12.45, 4, 0.1], [13.12, 4, 0.1], [K.found, 9, 0.12], [K.lock, 12, 0.1]];

// the people
let CROWD = null;
const isMatch = (a, b) => {
  const pa = PICKS.includes(PKEYS[a]), pb = PICKS.includes(PKEYS[b]);
  return pa && pb ? 1 : pa ? 0.35 : 0;
};
export const crowdHide = () => { if (CROWD) CROWD.mesh.visible = false; };
export function crowdInit(env) {
  const R = rng(23);
  const samples = Array.from({ length: 60 }, (_, i) => path(i / 59));
  const clear = (x, y, z) => samples.every((p) => Math.hypot(x - p[0], y - p[1], z - p[2]) > 2.4)
    && (z < -9 || Math.hypot(x - BUB[0], (y - BUB[1]) * 0.75) > 6.2) && Math.hypot(x - ONE[0], y - ONE[1], z - ONE[2]) > 3.2;
  CROWD = crowdField({
    count: 1700, seed: 23, colors: PKEYS.map((k) => P[k].color), isMatch,
    place: (Rr) => {
      for (let tries = 0; tries < 40; tries++) {
        const x = (Rr() - 0.5) * 52, y = -18 + Rr() * 42, z = 16 - Rr() * 80;
        if (clear(x, y, z)) return { x, y, z, s: 0.16 + Math.pow(Rr(), 2.2) * 0.62 };
      }
      return { x: 60, y: 60, z: -200, s: 0.01 };
    },
  });
  const U = CROWD.uniforms;
  U.uBg.value = new THREE.Color(C.sky).convertSRGBToLinear();
  U.uNear.value = 18; U.uFar.value = 80;
  CROWD.mesh.visible = false;
  env.scene3d.add(CROWD.mesh);
}

const COUNT = 2481;
export function crowdFrame(t, st, env) {
  const bub = bubCrowd(t);
  st.useDepth = true;
  st.under.push((g) => { const [x, y] = project(env, [0, 0, -120]); daySky(g, t, { shift: [(x - 540) * 0.25, (y - 960) * 0.25], bubbles: 0.5 }); });
  st.update3d.push(() => {
    CROWD.mesh.visible = true;
    const U = CROWD.uniforms;
    U.uTime.value = t;
    U.uScanAt.value.set(...BUB);
    U.uScanR.value = lerp(0, 70, E.outCubic(seg(t, K.whip + 0.05, K.scan[1])));
    U.uScanW.value = 5;
    U.uBubAt.value.set(...bub.pos); U.uBubR.value = bub.r; U.uPush.value = 1;
    U.uClearAt.value.set(...ONE); U.uClearR.value = ONE_R;
    U.uLitGain.value = 1;
    U.uAlpha.value = seg(t, K.whip, K.whip + 0.2);
    U.uNearFade.value = t > 14 ? 4 : 0;
  });
  // the scan front: the ring Bub gathered, thrown outward through the crowd
  const ringR = lerp(1.32, 60, E.outCubic(seg(t, K.whip, K.scan[1])));
  if (ringR < 59) st.prims.push({ type: 'torus', pos: BUB, size: [ringR, 0.028 + ringR * 0.004], quat: [0.7071, 0, 0, 0.7071], glass: 1, tint: '#FFFFFF', tintAmt: 0.1,
    edge: 0.9, spec: 1.2, frost: 0.2, refr: 0.05, haze: 0.1, alpha: 1 - seg(t, K.scan[1] - 0.5, K.scan[1]), group: 300 });

  // the two candidates and the one
  const cand = (pos, cols, seed, tc) => {
    const a = seg(t, tc - 1.0, tc - 0.6) * (1 - seg(t, 14.0, 14.4));
    if (a > 0.01) st.prims.push({ type: 'sphere', pos, size: [0.82], fill: 0.85, tint: cols[0], c2: cols[1], c3: cols[2], thick: 380, glow: 0.4, seed, alpha: a, group: 400 + seed, rim: 1.6, haze: 0.12 });
  };
  cand(C1, [P.career.color, P.wealth.color, P.learning.color], 4, 12.45);
  cand(C2, [P.learning.color, P.family.color, P.career.color], 7, 13.12);
  const found = spring(t - K.found, SPRING.pop);
  const pulse = 1 + 0.06 * Math.exp(-Math.max(0, t - K.lock) / 0.15) * (t >= K.lock ? 1 : 0);
  if (t < K.switch) st.prims.push({ type: 'sphere', pos: ONE, size: [ONE_R * (0.92 + 0.08 * found) * pulse], fill: 0.88, tint: ONE_COLS[0], c2: ONE_COLS[1], c3: ONE_COLS[2],
    thick: 380, glow: 0.5 + 0.6 * seg(t, K.found, K.found + 0.3), seed: 2.2, group: 500, rim: 1.7, haze: 0.1, wobble: 0.01 });
  if (t >= K.found - 0.1 && t < K.switch) st.under.push((g) => {
    const [x, y, k] = project(env, ONE);
    const a = seg(t, K.found - 0.1, K.found + 0.3) * (1 - seg(t, K.dive[0], K.dive[1]));
    glow(g, x, y, ONE_R * k * 2.4, '#FFC9A8', 0.55 * a);
  });
  // the lock: a ring snapping in from wide
  if (t >= K.lock - 0.15 && t < K.dive[0] + 0.3) {
    const p = spring(t - (K.lock - 0.15), SPRING.snap);
    const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), new THREE.Vector3(...norm(sub(env.camera.position.toArray(), ONE))));
    st.prims.push({ type: 'torus', pos: ONE, size: [lerp(ONE_R * 3.2, ONE_R * 1.22, p), 0.04], quat: [q.x, q.y, q.z, q.w], glass: 1, tint: C.gold, tintAmt: 0.5,
      fill: 0.4, edge: 1, spec: 1.3, frost: 0.2, refr: 0.05, glow: 0.6, alpha: seg(t, K.lock - 0.15, K.lock) * (1 - seg(t, K.dive[0], K.dive[0] + 0.3)), group: 301 });
  }

  // the counter: a glass pill held at the top of the frame
  const cA = seg(t, K.land - 0.05, K.land + 0.2) * (1 - seg(t, 13.6, 13.9));
  if (cA > 0.01) {
    const c = st.cam;
    const fwd = norm(sub(c.target, c.pos));
    const rt = norm([-fwd[2], 0, fwd[0]]), up = norm([rt[1] * fwd[2] - rt[2] * fwd[1], rt[2] * fwd[0] - rt[0] * fwd[2], rt[0] * fwd[1] - rt[1] * fwd[0]]);
    const D = 6, hh = D * Math.tan((c.fov * Math.PI) / 360);
    const pos = add(add(c.pos, mul(fwd, D)), mul(up, -hh * 0.66 * -1));
    const pop = spring(t - K.land, SPRING.pop);
    st.prims.push({ type: 'box', pos, size: [hh * 0.47 * pop, hh * 0.075 * pop, 0.05], round: hh * 0.075 * pop, glass: 1, tint: '#FFFFFF', haze: 0.45, frost: 0.8,
      refr: 0.06, edge: 0.8, spec: 1, alpha: cA, group: 302, shadow: cA, quat: quatLook(fwd) });
    st.over.push((g) => {
      const [x, y, k] = project(env, pos);
      const s = 0.092 * k;
      const n = Math.round(COUNT * E.outCubic(seg(t, K.land, K.land + 1.1)));
      const txt = `${n.toLocaleString('en-US')} people share your values`;
      g.save(); g.globalAlpha = cA * clamp(pop * 3); g.font = `660 ${s}px ${FONTS.ui}`; g.textBaseline = 'middle'; g.textAlign = 'center';
      const num = n.toLocaleString('en-US');
      const w = g.measureText(txt).width, wn = g.measureText(num).width;
      g.fillStyle = C.blue; g.textAlign = 'left'; g.fillText(num, x - w / 2, y + s * 0.04);
      g.fillStyle = C.ink; g.fillText(txt.slice(num.length), x - w / 2 + wn, y + s * 0.04);
      g.restore();
      if (globalThis.__textlog) globalThis.__textlog.push({ s: `${COUNT.toLocaleString('en-US')} people share your values`, a: cA });
    });
  }
  // 98% — a label beside the one
  const mA = seg(t, K.lock, K.lock + 0.15) * (1 - seg(t, K.dive[0] + 0.2, K.dive[0] + 0.45));
  if (mA > 0.01) {
    const lp = add(ONE, [-0.25, -ONE_R - 0.5, 0.6]);
    const pop = spring(t - K.lock, SPRING.pop);
    st.prims.push({ type: 'box', pos: lp, size: [0.95 * pop, 0.2 * pop, 0.08], round: 0.2 * pop, glass: 1, tint: C.gold, tintAmt: 0.55, fill: 0.55, haze: 0.2, frost: 0.6,
      refr: 0.05, edge: 0.8, spec: 1, glow: 0.4, alpha: mA, group: 303, shadow: mA });
    st.over.push((g) => {
      const [x, y, k] = project(env, add(lp, [0, 0, 0.08]));
      const s = 0.2 * k;
      const pct = Math.round(lerp(61, 98, E.outCubic(seg(t, K.lock, K.lock + 0.28))));
      g.save(); g.globalAlpha = mA * clamp(pop * 3); g.textBaseline = 'middle'; g.textAlign = 'center'; g.fillStyle = C.ink;
      g.font = `760 ${s}px ${FONTS.ui}`; g.fillText(`${pct}% match`, x, y + s * 0.05);
      g.restore();
      if (globalThis.__textlog) globalThis.__textlog.push({ s: '98% match', a: mA });
    });
  }
  // the dive: the one's film fills the lens (a sheet of real film just in front of the camera), and the chat begins
  // inside it
  const wash = seg(t, K.dive[1] - 0.32, K.dive[1], E.inQuad);
  if (wash > 0) {
    st.prims.push(lensFilm(st.cam, wash, t));
    st.over.push((g) => filmWash(g, t, wash * 0.45));
  }
  st.fx.bloom = { strength: 0.32, radius: 0.55, threshold: 1.0 };
  // the whip: the lens strains; the dive: the film of the one fills the frame
  const whipV = Math.sin(Math.PI * seg(t, K.whip, K.land));
  st.fx.ca = Math.max(st.fx.ca, 0.012 * whipV + 0.02 * seg(t, K.dive[1] - 0.25, K.dive[1]));
  st.fx.zoom = 1 + 0.025 * whipV;
}

// a box facing back along fwd (its local +z toward the camera)
function quatLook(fwd) {
  const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), new THREE.Vector3(-fwd[0], -fwd[1], -fwd[2]));
  return [q.x, q.y, q.z, q.w];
}
