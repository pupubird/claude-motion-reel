// I–II · the crazy version's opening (0–7.5 s; CRAZY.md). The anchors are the released film's (score.js HOOK, NAME).
//   0–2.0   THE PANE. Black. Bub, a glass orb with light inside, smacks into the glass between him and you; each knock
//           is a ring of light through the pane and a word slamming in as chrome (How to · make more · friends, the
//           last in light). He pushes: the pane bows, cracks of light run out from him; on the drop it shatters along
//           those cracks and the pieces fly past the lens; How to make more scatters with them.
//   2.0–3.4 THE MARK. Two lights streak in on trails and collide into the mark (two glass orbs sharing a wall);
//           friends falls into almost / friends.ai; the lens dives through the shared wall into a prismatic tunnel.
//   3.4–7.5 THE WORLD OF PEOPLE. Out of the tunnel into a helix of faces in glass orbs streaming past; New friends /
//           who share / your values. word by word; the app icon slams in; Bub dives into it; it opens.
import * as THREE from 'three';
import { W, H } from '../config.js';
import { HOOK, NAME, valuePops } from '../score.js';
import { T, words } from '../copy.js';
import { clamp, lerp, seg, ease, spring, smoothstep, TAU, rng, rgba, mixHex } from '../util.js';
import { MOVE } from '../brand.js';
import { text3d, titanium, lightGlass, satin, glassMat, studioEnv, LIGHT } from '../gl/text3d.js';
import { pane, fly } from '../gl/shards.js';
import { faceOrb } from '../gl/faceorb.js';
import { bubPrim, quatFromZ } from '../liquid2d.js';
import { CROWD } from '../assets.js';
import { glint } from './lab_fx.js';

const END = NAME.phone;                                   // 7.5: the phone takes over
const POP = HOOK.pop;
const KNOCKS = [HOOK.knock1, HOOK.knock2, HOOK.knock3];
const GRAD = ['#1E5BFF', '#5A3DFF', '#A230FF', '#FF2E8A', '#FF3D4F', '#FF6A2B', '#FF8A1F'];
// a stretch [u0, u1] of a gradient, as three stops (a line's gradient split between its words, continuous across them)
function gradSlice(stops, u0, u1) {
  const at = (u) => { const f = Math.min(0.9999, Math.max(0, u)) * (stops.length - 1), i = Math.floor(f); return mixHex(stops[i], stops[i + 1], f - i); };
  return [at(u0), at((u0 + u1) / 2), at(u1)];
}
const PANE_Z = 1.15;
const BUB = { x: 0, y: -1.42, r: 0.95 };                   // Bub at rest, world (z = 0 plane: 304.5 px a unit)
const MARK = { y: 1.05, r: 0.56 };                         // the mark's two orbs, one radius apart
const DIVE = NAME.dive, VALUE = NAME.value;
const ICON = NAME.exit, TAP = NAME.tap, OPEN = NAME.open;

let scene, CAM, ENV, ENV2, A = {};
const CAMF = new THREE.PerspectiveCamera(35, W / H, 0.05, 200);    // the lens at t for fx(), which runs before update()
const _v = new THREE.Vector3();

export default {
  init(env) {
    scene = new THREE.Scene();
    scene.add(env.makeBackdrop());
    CAM = new THREE.PerspectiveCamera(35, W / H, 0.05, 200);
    ENV = studioEnv(env.renderer, 'night');                       // chrome type: with the card behind the lens
    ENV2 = studioEnv(env.renderer, 'night', { card: false });     // glass balls: no card (it lay a bar across every face)
    // v2, the Apple pass: titanium for the question, light-filled glass for friends (one gradient across the word)
    const ti = titanium(ENV, { tint: '#F2F3F6', env: 1.3, rough: 0.26 }), graphite = titanium(ENV, { tint: '#DADDE4', rough: 0.3, env: 1.5 })   /* (Apple's secondary grey on the night, ≈ #A1A1A6) */, light = lightGlass(ENV);
    const [h1, h2, h3] = T.hook.lines;
    A.w1 = text3d(h1, { size: 0.6, material: ti, seenPx: 150 });
    A.w2 = text3d(h2, { size: 0.6, material: ti, seenPx: 150 });
    A.w3 = text3d(h3, { size: 0.8, material: light, gradient: LIGHT, seenPx: 210 });
    // the name: almost (graphite) over friends.ai (friends is the hook's own word; .ai carries its gradient's end on)
    A.almost = text3d('almost', { size: 0.5, material: graphite, seenPx: 130 });
    A.ai = text3d('.ai', { size: 0.8, material: light, gradient: [LIGHT[3], '#FFB25E'], seenPx: 210 });
    for (const w of [A.w1, A.w2, A.w3, A.almost, A.ai]) scene.add(w.group);
    // the value, word by word, pinned in front of the lens as the faces stream past
    const vl = T.value.lines;
    // the value: white satin, its last line in light — one gradient across the line, split between its words
    const white = satin(ENV2);
    A.value = vl.map((line, i) => {
      const ws = words(line);
      if (i !== T.value.blue) return ws.map((wd) => text3d(wd, { size: 0.25, material: white, seenPx: 96 }));
      const total = ws.join(' ').length;
      let at = 0;
      return ws.map((wd) => {
        const u0 = at / total, u1 = (at + wd.length) / total; at += wd.length + 1;
        return text3d(wd, { size: 0.25, material: light, gradient: gradSlice(LIGHT, u0, u1), seenPx: 96 });
      });
    });
    for (const line of A.value) for (const w of line) scene.add(w.group);
    // the pane and its pieces
    A.pane = pane({ w: 3.5, h: 6.0, impact: [0, BUB.y * (10 - PANE_Z) / (10 - BUB.r * 0.2)], count: 56, seed: 11, material: glassMat(ENV2, { thickness: 0.05, rough: 0.015, env: 1.5 }) });
    A.pane.group.position.z = PANE_Z;
    scene.add(A.pane.group);
    // the world of people: a long helix of faces in glass orbs (air round every one: never a packed field)
    const R = rng(77);
    A.faces = CROWD.slice(0, 14).map((key, i) => {
      const o = faceOrb(key, ENV2, { r: 0.62 + R() * 0.14 });
      const th = i * 2.399 + 0.6, rad = 2.05 + R() * 0.6;
      o.home = new THREE.Vector3(Math.cos(th) * rad, Math.sin(th) * rad * 1.45, -1.0 - i * 1.6);
      scene.add(o.group);
      return o;
    });
    // the app icon: a glass tile with the mark inside, the gradient behind
    A.icon = appIcon(ENV2);
    scene.add(A.icon);
  },

  under: [{ start: 0, end: END, draw: ground }],
  three: { start: 0, end: END, update },
  liquid: { start: 0, end: END, frame: liquid },
  layers: [{ start: 0, end: END, draw: over }],
  fx,
};

// ── the camera ─────────────────────────────────────────────────────────────────────────────────────────────────────
function camAt(t) {
  if (t < VALUE) {
    // a slow push through the hook; a lurch on the pop; the dive into the mark's wall
    const push = seg(t, 0, POP, ease.inQuad) * 0.6, shove = t > POP ? 0.5 * (1 - Math.exp(-(t - POP) * 5)) : 0;
    const dive = seg(t, DIVE, VALUE, ease.inExpo);
    const z = lerp(10 - push + shove, 0.9, dive), y = lerp(0.05, MARK.y, dive);
    return { pos: [0.18 * Math.sin(t * 0.7), y, z], look: [0, lerp(0.05, MARK.y, dive), lerp(0, -4, dive)], roll: 0.012 * Math.sin(t * 0.9) + dive * 0.25 };
  }
  // the world of people: flying forward down the helix, a slow roll
  const k = t - VALUE;
  const z = 7 - 2.1 * k;
  return { pos: [0, 0, z], look: [0, 0, z - 10], roll: 0.18 - 0.05 * k };
}

function setCam(cam, t) {
  const c = camAt(t);
  cam.position.set(...c.pos); cam.up.set(0, 1, 0); cam.lookAt(...c.look); cam.rotateZ(c.roll); cam.updateMatrixWorld();
  return cam;
}
function update(t) {
  setCam(CAM, t);
  hookWords(t);
  nameWords(t);
  valueWords(t);
  shards(t);
  people(t);
  icon(t);
  return { scene, camera: CAM, bloom: { strength: 0.3, radius: 0.5, threshold: 1.05 } };      // (no glow on type)
}

// ── the hook's words: each slams in from the lens on its knock; on the pop the first two scatter with the pane ──────
function slam(w, t, t0, y, z = 0) {
  const k = t - t0;
  w.group.visible = k >= 0;
  if (k < 0) return;
  const s = spring(k, { stiffness: 900, damping: 0.62 });
  w.group.position.set(0, y, lerp(1.3, z, s));
  w.group.scale.setScalar(lerp(1.3, 1, s));
}
function hookWords(t) {
  const ys = [2.28, 1.6, 0.78];          // (v2, the Apple pass: line spacing ≈ 1.07 of the size, the hero line a little apart)
  [A.w1, A.w2].forEach((w, i) => {
    slam(w, t, KNOCKS[i], ys[i]);
    // the pane breaks: the letters go with its pieces, tumbling at the lens
    const k = t - POP;
    w.letters.forEach((L, j) => {
      if (k <= 0) { L.mesh.position.copy(L.home); L.mesh.rotation.set(0, 0, 0); L.mesh.visible = true; return; }
      const R = rng(100 + i * 20 + j)(), ang = (j / w.letters.length - 0.5) * 2.4 + (i ? 0.4 : -0.2);
      const go = (1 - Math.exp(-k * 2.5)) / 2.5;
      L.mesh.position.set(L.home.x + Math.sin(ang) * 3.2 * go, L.home.y + (1.2 + R) * go, L.home.z + (5 + 7 * R) * k);
      L.mesh.rotation.set(k * (3 + 6 * R), k * (2 + 5 * R), k * (1 + 3 * R));
      L.mesh.visible = L.mesh.position.z < 9.2;
    });
    // a tremble in the last half second: the pane shakes them
    if (t > HOOK.brace && t < POP) w.group.position.x += 0.012 * Math.sin(t * 93 + i);
  });
  // friends: slams on the third knock, glows brighter as Bub pushes; after the pop it falls into the name
  slam(A.w3, t, KNOCKS[2], 0.78);
  if (t >= POP) {
    const u = seg(t, POP + 0.05, NAME.name + 0.15, MOVE.go);
    const L = lockup();
    A.w3.group.position.set(lerp(0, L.fx, u), lerp(0.78, L.y, u), 0);
    A.w3.group.scale.setScalar(lerp(1, L.sc, u));
  }
  if (t > HOOK.brace && t < POP) A.w3.group.position.x += 0.01 * Math.sin(t * 81);
  const fade = 1 - seg(t, DIVE - 0.05, DIVE + 0.2);
  for (const w of [A.w1, A.w2, A.w3]) w.group.visible &&= fade > 0.01;
}

// the name's lockup: friends.ai as wide as the frame allows, centred, under almost
function lockup() {
  const sc = Math.min(0.95, 3.05 / (A.w3.width + A.ai.width));
  const total = (A.w3.width + A.ai.width) * sc;
  return { sc, fx: -total / 2 + (A.w3.width * sc) / 2, y: -0.98 };
}
// ── the name: almost assembles from the air over friends; .ai joins friends ──────────────────────────────────────
function nameWords(t) {
  const on = t >= NAME.name - 0.1 && t < DIVE + 0.25;
  A.almost.group.visible = A.ai.group.visible = on;
  if (!on) return;
  A.almost.letters.forEach((L, j) => {
    // each letter flies in from where the scattered hook letters went, and lands with a tick
    const s = spring(t - NAME.name - j * 0.035, { stiffness: 700, damping: 0.7 });
    const R = rng(300 + j)();
    L.mesh.position.set(L.home.x + (R - 0.5) * 4 * (1 - s), L.home.y + (1.5 + R) * (1 - s), L.home.z + 3 * (1 - s));
    L.mesh.rotation.set((1 - s) * 2.5, (1 - s) * (R - 0.5) * 4, 0);
    L.mesh.visible = s > 0.02;
  });
  // .ai: next to friends (friends' right edge, scaled as friends is)
  const sc = A.w3.group.scale.x;
  A.ai.group.scale.setScalar(sc);
  A.ai.group.position.set(A.w3.group.position.x + (A.w3.width / 2 + A.ai.width / 2) * sc, A.w3.group.position.y, 0);
  A.almost.group.position.set(0, lockup().y + 0.75, 0);
  A.ai.letters.forEach((L, j) => {
    const s = spring(t - NAME.name - 0.25 - j * 0.06, { stiffness: 900, damping: 0.55 });
    L.mesh.scale.setScalar(Math.max(0.001, s));
    L.mesh.visible = s > 0.01;
  });
  const fade = 1 - seg(t, DIVE - 0.05, DIVE + 0.2);
  if (fade <= 0.01) A.almost.group.visible = A.ai.group.visible = false;
}

// ── the value: pinned before the lens, word by word on the score's clicks ────────────────────────────────────────
const POPS = () => valuePops(T.value.lines.map((l) => words(l).length));
function valueWords(t) {
  const on = t >= VALUE && t < ICON + 0.3;
  const P = POPS();
  const fwd = new THREE.Vector3(0, 0, -1).applyQuaternion(CAM.quaternion), up = new THREE.Vector3(0, 1, 0).applyQuaternion(CAM.quaternion),
    right = new THREE.Vector3(1, 0, 0).applyQuaternion(CAM.quaternion);
  const ys = [0.5, 0.17, -0.2], D = 5.6;
  const out = seg(t, ICON - 0.1, ICON + 0.25, MOVE.out);
  A.value.forEach((line, i) => {
    const widths = line.map((w) => w.width), gap = 0.07;
    const total = widths.reduce((a, b) => a + b, 0) + gap * (line.length - 1);
    let x = -total / 2;
    line.forEach((w, j) => {
      const t0 = P[i][j];
      const s = spring(t - t0, { stiffness: 1000, damping: 0.6 });
      w.group.visible = on && s > 0.01;
      const cx = x + w.width / 2;
      x += w.width + gap;
      if (!w.group.visible) return;
      const p = CAM.position.clone().addScaledVector(fwd, D + out * 3).addScaledVector(up, ys[i] + (1 - s) * -0.25).addScaledVector(right, cx);
      w.group.position.copy(p);
      w.group.quaternion.copy(CAM.quaternion);
      w.group.scale.setScalar(Math.max(0.001, s * (1 - out)));
    });
  });
}

// ── the pane's pieces: whole and invisible until the pop, then out and at the lens ─────────────────────────────────
function shards(t) {
  const k = t - POP;
  A.pane.group.visible = k >= 0 && k < 0.9;
  if (A.pane.group.visible) fly(A.pane, k, { speed: 1.2, toward: 1 });
}

// ── the world of people ────────────────────────────────────────────────────────────────────────────────────────
function people(t) {
  const on = t >= VALUE - 0.02 && t < OPEN + 0.3;
  A.faces.forEach((o, i) => {
    o.group.visible = on;
    if (!on) return;
    // the helix turns slowly; each orb bobs
    const th = (t - VALUE) * 0.22;
    const c = Math.cos(th), s = Math.sin(th);
    const h = o.home;
    o.group.position.set(h.x * c - h.y * s, h.x * s + h.y * c + 0.05 * Math.sin(t * 1.3 + i), h.z);
    const dz = CAM.position.z - h.z;
    const ahead = dz > 0.25 ? 1 : 0, far = 1 - smoothstep(13, 19, dz);      // the far ones are still in the dark
    o.group.scale.setScalar(Math.max(0.001, spring(t - VALUE - 0.05 - i * 0.02, { stiffness: 500, damping: 0.75 }) * ahead * far));
    o.setLook(CAM);
  });
}

// ── the app icon: slams in before the lens; Bub dives in; it opens ─────────────────────────────────────────────────
function appIcon(envMap) {
  const g = new THREE.Group();
  const c = document.createElement('canvas'); c.width = c.height = 512;
  const x = c.getContext('2d');
  const gr = x.createLinearGradient(0, 0, 512, 512);
  gr.addColorStop(0, '#1E5BFF'); gr.addColorStop(0.55, '#A230FF'); gr.addColorStop(1, '#FF6A2B');
  x.fillStyle = gr; x.fillRect(0, 0, 512, 512);
  // the mark: two circles sharing a wall, white
  x.fillStyle = '#FFFFFF';
  x.beginPath(); x.arc(206, 256, 92, 0, TAU); x.fill();
  x.globalAlpha = 0.86; x.beginPath(); x.arc(306, 256, 92, 0, TAU); x.fill();
  const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace;
  const face = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: tex, toneMapped: false }));
  face.position.z = 0.001;
  // the face sits in a rounded slab of glass (the squircle cut by an alpha mask on the art)
  const m = document.createElement('canvas'); m.width = m.height = 256;
  const mx = m.getContext('2d'); mx.fillStyle = '#000'; mx.fillRect(0, 0, 256, 256);
  mx.fillStyle = '#FFF'; mx.beginPath(); mx.roundRect(0, 0, 256, 256, 58); mx.fill();
  face.material.alphaMap = new THREE.CanvasTexture(m); face.material.alphaTest = 0.5;     // a cut-out, opaque: the glass round it refracts it
  g.add(face);
  const glassTile = new THREE.Mesh(roundedTile(1.04, 1.04, 0.16, 0.25), glassMat(envMap, { thickness: 0.2, env: 1.6 }));
  glassTile.position.z = 0.06;
  g.add(glassTile);
  g.visible = false;
  return g;
}
function roundedTile(w, h, d, r) {
  const s = new THREE.Shape();
  const x0 = -w / 2, y0 = -h / 2;
  s.moveTo(x0 + r, y0); s.lineTo(x0 + w - r, y0); s.quadraticCurveTo(x0 + w, y0, x0 + w, y0 + r); s.lineTo(x0 + w, y0 + h - r);
  s.quadraticCurveTo(x0 + w, y0 + h, x0 + w - r, y0 + h); s.lineTo(x0 + r, y0 + h); s.quadraticCurveTo(x0, y0 + h, x0, y0 + h - r);
  s.lineTo(x0, y0 + r); s.quadraticCurveTo(x0, y0, x0 + r, y0);
  const geo = new THREE.ExtrudeGeometry(s, { depth: d, bevelEnabled: true, bevelThickness: 0.04, bevelSize: 0.04, bevelSegments: 5, curveSegments: 16 });
  geo.translate(0, 0, -d / 2);
  return geo;
}
function icon(t) {
  const k = t - ICON;
  A.icon.visible = k >= 0 && t < END;
  if (!A.icon.visible) return;
  const fwd = new THREE.Vector3(0, 0, -1).applyQuaternion(CAM.quaternion);
  const s = spring(k, { stiffness: 800, damping: 0.6 });
  const open = seg(t, OPEN, END, ease.inExpo);
  const D = lerp(4.6, 0.35, open);
  A.icon.position.copy(CAM.position).addScaledVector(fwd, D);
  A.icon.quaternion.copy(CAM.quaternion);
  A.icon.rotateY(0.5 * (1 - s)); A.icon.rotateX(-0.3 * (1 - s));
  const tap = t > TAP ? 1 - 0.12 * Math.exp(-(t - TAP) * 14) * Math.sin(Math.min(1, (t - TAP) / 0.12) * Math.PI) : 1;
  A.icon.scale.setScalar(lerp(2.6, 1, s) * tap * 1.15);
}

// ── the liquid: Bub (the hook), the two lights and the mark, Bub again diving into the icon ──────────────────────────
const ORB = { glass: 1, refr: 0.035, frost: 0, haze: 0, tintAmt: 0, edge: 0.55, env: 0.75, spec: 0, absorb: 0 };
const NIGHT = { skyTop: '#0B1230', skyHor: '#04060E', skyLow: '#000000', night: 1, stars: 0, keyGain: 4, keyDir: [-0.5, 0.65, 0.57], ssr: 0,
  rim: { pos: [6, 4, -2], col: '#9DB6FF', gain: 2.4 } };
function bubState(t) {
  // knocks: a smack into the pane (flattened on it), a bounce back off it
  let z = -0.25, sq = 0;
  for (const k of KNOCKS) {
    const d = t - k;
    if (d < -0.06 || d > 0.5) continue;
    const hit = d < 0 ? 1 - (-d / 0.06) : Math.exp(-d * 9);
    z += 0.42 * hit;
    sq -= 0.3 * (d < 0 ? 0 : Math.exp(-d * 18));
  }
  // the push: into the bowing pane, swelling with light
  const push = seg(t, HOOK.push, POP, ease.inQuad);
  z += 0.62 * push;
  sq -= 0.18 * push;
  const glow = 0.55 + 0.75 * push + (t > HOOK.spot ? 0.15 : 0);
  // through the pane at the lens on the pop
  const out = seg(t, POP, POP + 0.4, ease.inQuad);
  z = lerp(z, 9.6, out);
  return { pos: [BUB.x, BUB.y * (1 - out * 0.6), z], sq, glow, out };
}
function liquid(t) {
  const prims = [];
  let face = null;
  if (t < POP + 0.42) {
    const b = bubState(t);
    const B = bubPrim({ pos: b.pos, r: BUB.r, squash: b.sq, squashDir: [0, 0, 1], camPos: CAM.position.toArray(),
      look: t > HOOK.look && t < HOOK.back ? [0, 0.9] : [0, 0.05], blink: t > HOOK.brace && t < POP ? 1 : 0, eyeScale: t > HOOK.spot ? 1.18 : 1, group: 1 });
    prims.push({ ...B.prim, ...ORB, tint: GRAD[0], c2: GRAD[3], c3: GRAD[5], core: b.glow * (1 - 0.8 * b.out), coreSeed: 2, alpha: 1 - smoothstep(0.55, 0.9, b.out) });
    face = { ...B.face, style: 1 };
  }
  // the two lights: streaking in from either side to kiss into the mark (on NAME.name), then the mark
  if (t >= POP + 0.02 && t < DIVE + 0.3) {
    const u = seg(t, POP + 0.02, NAME.name, ease.inCubic);
    const d = MARK.r;                                         // centres one radius apart: Plateau's flat wall
    const kiss = t >= NAME.name ? spring(t - NAME.name, { stiffness: 260, damping: 0.42 }) : 0;
    const a = [lerp(-3.4, -d / 2, u) - (t >= NAME.name ? 0.06 * (1 - kiss) : 0), lerp(2.9, MARK.y, u), lerp(2.5, 0, u)];
    const b = [lerp(3.4, d / 2, u) + (t >= NAME.name ? 0.06 * (1 - kiss) : 0), lerp(2.9, MARK.y, u), lerp(2.5, 0, u)];
    const r = MARK.r * lerp(0.45, 1, u);
    prims.push({ type: 'sphere', pos: a, size: [r], group: 2, ...ORB, tint: '#2F6BFF', c2: '#6E9BFF', c3: '#1C3FD8', core: 1.1, coreSeed: 1 });
    prims.push({ type: 'sphere', pos: b, size: [r], group: 3, ...ORB, tint: '#FF6B5A', c2: '#FFA06B', c3: '#FF4F7A', core: 1.1, coreSeed: 4 });
    if (t >= NAME.name) {
      const wr = Math.sqrt(Math.max(0, r * r - ((b[0] - a[0]) * (b[0] - a[0])) / 4));
      if (wr > 0.01) prims.push({ type: 'wall', pos: [(a[0] + b[0]) / 2, MARK.y, 0], size: [wr], quat: quatFromZ([1, 0, 0]), group: 4, thick: 360, seed: 5.5, env: 1.4, rim: 0.7, haze: 0.02, edge: 0 });
    }
  }
  // Bub again, small, swooping in to dive into the icon (the tap)
  if (t >= ICON + 0.05 && t < OPEN + 0.05) {
    const fwd = new THREE.Vector3(0, 0, -1).applyQuaternion(CAM.quaternion), up = new THREE.Vector3(0, 1, 0).applyQuaternion(CAM.quaternion),
      right = new THREE.Vector3(1, 0, 0).applyQuaternion(CAM.quaternion);
    const u = seg(t, ICON + 0.05, TAP, ease.inCubic);
    const p = CAM.position.clone().addScaledVector(fwd, lerp(3.2, 4.4, u)).addScaledVector(up, lerp(1.7, 0, u)).addScaledVector(right, lerp(0.9, 0, u));
    const B = bubPrim({ pos: p.toArray(), r: lerp(0.32, 0.12, u), squash: t > TAP ? -0.3 : 0.15 * u, squashDir: fwd.toArray(), camPos: CAM.position.toArray(), group: 5 });
    prims.push({ ...B.prim, ...ORB, tint: GRAD[0], c2: GRAD[3], c3: GRAD[5], core: 1.2, coreSeed: 2, alpha: 1 - seg(t, TAP, TAP + 0.08) });
    face = { ...B.face, style: 1 };
  }
  if (!prims.length) return null;
  return { prims, face, cam: CAM, useDepth: true, env: NIGHT, bloom: { strength: 0.55, radius: 0.55, threshold: 1.0 } };
}

// ── the ground: a night that answers the light in it ─────────────────────────────────────────────────────────────
function ground(ctx, t) {
  const pop = t > POP ? Math.exp(-(t - POP) * 1.2) : 0;
  const g = ctx.createRadialGradient(540, 1250, 0, 540, 1250, 1500);
  g.addColorStop(0, '#141C3C'); g.addColorStop(0.55, '#070A18'); g.addColorStop(1, '#020309');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  const glow = (x, y, r, col, a) => { const q = ctx.createRadialGradient(x, y, 0, x, y, r); q.addColorStop(0, rgba(col, a)); q.addColorStop(1, rgba(col, 0)); ctx.fillStyle = q; ctx.fillRect(0, 0, W, H); };
  // Bub's light on the dark, swelling as he pushes; after the pop the two lights' colours
  const push = seg(t, HOOK.push, POP, ease.inQuad) * (t < POP ? 1 : 0);
  if (t < POP + 0.4) { glow(500, 1390, 760, '#2F6BFF', 0.22 + 0.3 * push); glow(620, 1450, 600, '#FF2E8A', 0.12 + 0.25 * push); }
  if (t >= POP && t < VALUE) { glow(260, 640, 900, '#2F6BFF', 0.3 + 0.3 * pop); glow(820, 640, 900, '#FF4F5A', 0.25 + 0.3 * pop); }
  if (t >= VALUE) { glow(540, 960, 1100, '#2A1F6B', 0.55); glow(300, 500, 800, '#1E5BFF', 0.18); glow(800, 1500, 800, '#FF2E8A', 0.14); }
}

// ── over the frame: the cracks of light, the knocks' light rings, the lights' trails, glints ──────────────────────
function proj(x, y, z, cam = CAM) { _v.set(x, y, z).project(cam); return [(_v.x + 1) / 2 * W, (1 - _v.y) / 2 * H]; }
function over(ctx, t) {
  // the knocks: a ring of light runs out through the pane from where he hit it
  if (t < POP) {
    const [ix, iy] = proj(A.pane.impact[0], A.pane.impact[1], PANE_Z);
    for (const k of KNOCKS) {
      const d = t - k;
      if (d < 0 || d > 0.45) continue;
      const u = d / 0.45, r = 120 + 760 * ease.outCubic(u);
      ctx.save();
      // (v2, the Apple pass: a hairline of light, not a drawn ring — the pane's ripple itself is the shockwave)
      ctx.globalAlpha = (1 - u) * (1 - u) * 0.55;
      ctx.strokeStyle = '#DCE7FF'; ctx.lineWidth = 1.5 + 2.5 * (1 - u);
      ctx.shadowColor = '#8FB0FF'; ctx.shadowBlur = 16;
      ctx.beginPath(); ctx.ellipse(ix, iy, r, r * 0.92, 0, 0, TAU); ctx.stroke();
      ctx.restore();
      glint(ctx, ix - 120, iy - 160, 170, d, 0.3, { color: '210,225,255' });
    }
    cracks(ctx, t);
  }
  // the two lights' trails as they streak in to kiss
  if (t >= POP + 0.02 && t < NAME.name + 0.12) {
    const u = seg(t, POP + 0.02, NAME.name, ease.inCubic);
    for (const [sx, col] of [[-1, '#6E9BFF'], [1, '#FF8A6B']]) {
      const pts = [];
      for (let i = 0; i <= 14; i++) {
        const uu = Math.max(0, u - i * 0.035);
        pts.push(proj(lerp(3.4 * sx, (MARK.r / 2) * sx, uu), lerp(2.9, MARK.y, uu), lerp(2.5, 0, uu)));
      }
      ctx.save();
      ctx.lineCap = 'round';
      for (let i = 0; i < pts.length - 1; i++) {
        const a = 1 - i / (pts.length - 1);
        ctx.strokeStyle = rgba(col, 0.9 * a); ctx.lineWidth = 34 * a + 2;
        ctx.shadowColor = col; ctx.shadowBlur = 40 * a;
        ctx.beginPath(); ctx.moveTo(...pts[i]); ctx.lineTo(...pts[i + 1]); ctx.stroke();
      }
      ctx.restore();
    }
  }
  // the kiss: a glint where they meet
  if (t >= NAME.name - 0.02 && t < NAME.name + 0.4) {
    const [mx, my] = proj(0, MARK.y + MARK.r * 0.55, 0.3);
    glint(ctx, mx, my, 420, t - NAME.name, 0.4, { color: '255,236,210' });
  }
}
// the cracks: the pane's own cell edges (gl/shards.js) — the radial ones (running out from the impact) and the rings
// close to it, thin and jagged, brightest near the impact — running out from it as he pushes
let CRACKS = null;
function crackSet() {
  if (CRACKS) return CRACKS;
  const R = rng(919), [ix, iy] = A.pane.impact;
  CRACKS = A.pane.edges.filter((e) => {
    const [n, f] = e.d0 <= e.d1 ? [e.a, e.b] : [e.b, e.a];
    const rx = n[0] - ix, ry = n[1] - iy, ex = f[0] - n[0], ey = f[1] - n[1];
    const cos = Math.abs(rx * ex + ry * ey) / (Math.hypot(rx, ry) * Math.hypot(ex, ey) + 1e-6);
    return cos > 0.8 || Math.min(e.d0, e.d1) < 0.16 || R() < 0.12;
  }).map((e) => {
    const [n, f, dn, df] = e.d0 <= e.d1 ? [e.a, e.b, e.d0, e.d1] : [e.b, e.a, e.d1, e.d0];
    // a jagged line: the edge cut into kinks
    const pts = [n];
    const k = 5;
    for (let i = 1; i < k; i++) {
      const u = i / k, j = (R() - 0.5) * 0.035;
      pts.push([n[0] + (f[0] - n[0]) * u - (f[1] - n[1]) * j * 4, n[1] + (f[1] - n[1]) * u + (f[0] - n[0]) * j * 4]);
    }
    pts.push(f);
    return { pts, dn, df };
  });
  return CRACKS;
}
function cracks(ctx, t) {
  const front = seg(t, HOOK.spot, POP - 0.02, ease.inCubic) * 1.25 + (t > HOOK.spot ? 0.04 : 0);
  if (front <= 0) return;
  const tremble = t > HOOK.brace ? 0.6 + 0.4 * Math.sin(t * 70) : 1;
  ctx.save();
  ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  for (const c of crackSet()) {
    if (c.dn > front) continue;
    const reach = c.df <= front ? 1 : (front - c.dn) / Math.max(1e-4, c.df - c.dn);
    const n = c.pts.length - 1, upto = reach * n;
    const P = c.pts.map((p) => proj(p[0], p[1], PANE_Z));
    const near = 1 - Math.min(1, c.dn / 0.9);
    for (const [w, col, blur, a] of [[5 * near + 2, '#8FB2FF', 14, 0.28], [1.1 + 1.3 * near, '#FFFFFF', 3, 0.92]]) {
      ctx.strokeStyle = col; ctx.lineWidth = w; ctx.shadowColor = col; ctx.shadowBlur = blur;
      ctx.globalAlpha = a * (0.35 + 0.65 * near) * tremble;
      ctx.beginPath(); ctx.moveTo(...P[0]);
      for (let i = 1; i <= Math.ceil(upto); i++) {
        const q = Math.min(1, upto - (i - 1));
        ctx.lineTo(lerp(P[i - 1][0], P[i][0], q), lerp(P[i - 1][1], P[i][1], q));
      }
      ctx.stroke();
    }
  }
  ctx.restore();
}

// ── the lens: ripples through the pane on each knock, its bow as he pushes, the pop, the kiss, the dive ────────────
function fx(t) {
  if (t >= END) return null;                      // (the engine asks every scene at every frame: this one ends at 7.5)
  const out = { grain: 0.016 };
  const cam = setCam(CAMF, t);
  const [ix, iy] = proj(A.pane.impact[0], A.pane.impact[1], PANE_Z, cam);
  for (const k of KNOCKS) {
    const d = t - k;
    if (d >= 0 && d < 0.4) out.shock = { x: ix, y: iy, r: 60 + 1100 * ease.outCubic(d / 0.4), k: 26 * (1 - d / 0.4), w: 80 };
  }
  if (t >= HOOK.push - 0.1 && t < POP) out.bulge = { x: ix, y: iy, r: 900, k: 0.2 * seg(t, HOOK.push - 0.1, POP, ease.inQuad) };
  if (t > HOOK.brace && t < POP) { out.sx = 0.0025 * Math.sin(t * 97); out.sy = 0.0018 * Math.cos(t * 83); }
  const k = t - POP;
  if (k >= -0.01 && k < 1.0) {
    out.flash = 0.75 * Math.exp(-Math.max(0, k) * 16);
    out.flashColor = '#FFFFFF';
    out.chroma = 0.03 * Math.exp(-Math.max(0, k) * 9);
    out.chromaAt = [ix, iy];
    out.shock = { x: ix, y: iy, r: 80 + 2400 * ease.outCubic(clamp(k / 0.8)), k: 60 * (1 - clamp(k / 0.8)), w: 160 };
    out.rays = { x: ix, y: iy, k: 2.2 * Math.exp(-Math.max(0, k) * 3), reach: 0.7, color: '#DCE6FF' };
    out.shutter = 1.0; out.samples = 24;
  }
  const kk = t - NAME.name;
  if (kk >= 0 && kk < 0.7) {
    const [mx, my] = proj(0, MARK.y, 0, cam);
    out.flash = Math.max(out.flash ?? 0, 0.25 * Math.exp(-kk * 14)); out.flashColor = out.flashColor ?? '#FFF4E6';
    out.rays = { x: mx, y: my, k: 1.6 * Math.exp(-kk * 4), reach: 0.65, color: '#FFE6D2' };
    out.shock = { x: mx, y: my, r: 60 + 1600 * ease.outCubic(kk / 0.7), k: 30 * (1 - kk / 0.7), w: 110 };
  }
  // the dive: a prismatic tunnel through the mark's wall
  const dv = seg(t, DIVE, VALUE + 0.15);
  if (dv > 0 && dv < 1) { const [mx, my] = proj(0, MARK.y, 0, cam); out.tunnel = { x: mx, y: my, k: 0.42 * Math.sin(dv * Math.PI), prism: 0.05 }; out.shutter = 1.0; }
  // the icon opens: everything goes to light
  if (t > OPEN) out.flash = Math.max(out.flash ?? 0, seg(t, OPEN + 0.12, END, ease.inCubic) * 0.95);
  return out;
}
