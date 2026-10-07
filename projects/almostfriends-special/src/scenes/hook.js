// I · HOOK (0–4 s) and II · NAME (4–9.5 s), v5. The owner on v4: "the first 2-3 seconds are very, very important… I
// want people to directly know what we are doing… 8 billion people, that's not really a nice hook… start with 'how to
// make more friends' as the hook, and then show our products". The staging is v4's (research/research-hooks.md §10.3 C1,
// "Knock knock": an abrupt onset, a face whose eyes snap onto yours, one subject on a quiet field, and a physical open
// loop — will the wall break? — that pays off on the drop); the words are now the promise, and the answer is the name.
//   0.0  frame 0: the screen is the wall of your bubble, seen from inside; Bub has just smacked into it from outside,
//        squashed flat, a ripple racing out; its eyes snap open onto you. Behind it, a pale sea of people (bubbles) to
//        the horizon. Knock, knock, knock — one line per knock: "How to" · 0.25 "make more" · 0.5 "friends" (big, blue)
//   0.65 its eyes flick up to the word; 0.85 back to you, hopeful, blushing
//   1.0  v6 (owner: "maximum 2 seconds"): one big push — the wall bulges at you and thins, its colours sliding blue →
//        magenta → gold; 1.25 a black spot blooms, Bub's eyes go huge; 1.6 the film trembles, it shuts its eyes
//   2.0  the drop: the wall tears from the spot, Bub bursts through past the lens, colour floods the world. "How to make
//        more" flies apart with the film; "friends" survives and glides down into the name as the droplets inflate into
//        the mark — two soap bubbles, blue and coral, kissing (3D): almost / friends.ai. In the Chinese cut the hero
//        word is 朋友: it glides into the same place and flips into "friends", the name translating itself
//   3.15 the camera dives through the mark (blue, the wall, coral: a colour wipe) onto the value, alone and big, held
//        while the world of people glides by: "New friends who share your values."
//   6.75 the app icon pops in; Bub dives into it (the tap) and the app opens (howto.js)
import * as THREE from 'three';
import { W, H } from '../config.js';
import { C, P, FONTS, SPRING, MOVE } from '../brand.js';
import { HOOK, NAME, valuePops } from '../score.js';
import { T } from '../copy.js';
import { clamp, lerp, seg, ease, spring, springVel, smoothstep, TAU, mixHex } from '../util.js';
import { drawSky } from '../world/sky.js';
import { APP_ICON, drawMark, ICON_RADIUS } from '../world/mark.js';
import { Line, drawLine, popEach, combine, centerX } from '../type.js';
import { squirclePath, about, text, measure } from '../ui/kit.js';
import { burst, particleAt, drawDroplet } from '../morph.js';
import { planet } from '../gl/planet.js';
import { bub3d } from '../gl/bub3d.js';
import { mark3d } from '../gl/mark3d.js';
import { membrane, heightAt } from '../gl/membrane.js';
import { INK_ORB, inkOf, quatFromZ } from '../liquid2d.js';
import { MARK_INK } from './foam.js';
import { sign, pin } from '../gl/sign.js';

// ── the world: the Earth made of people, and us inside our own bubble on its surface, over Kuala Lumpur ───────────
const KL = { lat: 3.15, lon: 101.7 };
const dirAt = (lat) => new THREE.Vector3(0, Math.sin(lat * Math.PI / 180), Math.cos(lat * Math.PI / 180));
const DE = dirAt(-8.6), E = DE.clone().multiplyScalar(11.04);   // the lens: just above the crowd, looking along it
const BPOS = dirAt(KL.lat).multiplyScalar(11.32);   // where the mark forms after the pop (ahead, over KL)
const FWD = BPOS.clone().sub(E).normalize(), RIGHT = new THREE.Vector3().crossVectors(FWD, DE).normalize();
const UPS = new THREE.Vector3().crossVectors(RIGHT, FWD);
const MARK_R = 0.36;                                // each of the mark's bubbles
const BUB_R = 0.25;                                 // Bub, at the wall
const CONTACT_Y = 1015;                             // where Bub meets the wall on screen (px)
const VALUE_TAGS = NAME.value + 1.2;                // the value's three tags pop in (tools/cues.mjs: the same)
const [Y_HOW, Y_MAKE, Y_FRIENDS] = T.hook.y;        // the hook's three lines (baselines; copy.js, per cut)
const Y_ALMOST = 1390, Y_NAME = 1535;               // the name: almost / friends.ai
const KNOCKS = [HOOK.knock1, HOOK.knock2, HOOK.knock3];
const lastKnock = (t) => KNOCKS.reduce((a, k) => (k <= t ? k : a), KNOCKS[0]);
// "friends" survives the pop and glides into the name: [start, end, stagger per letter] (s)
const CARRY = [HOOK.pop + 0.04, NAME.name + 0.1, 0.005];
const CARRY_END = CARRY[1] + 6 * CARRY[2];
// a hero word that is not the name's own (朋友) lands, then flips into it over this long, ending at CARRY_END
const FLIP = 0.16;
let scene, camera, PL, BUB, MK, MB, howTo, makeMore, bigF, almost, friendsAi, v1, v2, v3, WORDS, INK;
const drops = burst(23, 140, { speed: [800, 2400], spread: TAU, size: [8, 22] });
const _f = new THREE.Vector3(), _t = new THREE.Vector3();

// ── the knock: the wall and Bub, as functions of t ──────────────────────────────────────────────────────────────
const ringOf = (k, a) => (k > 0 && k < 1.6 ? [k, a] : [-1, 0]);
function wall(t) {
  const k1 = t - lastKnock(t);
  // the knocks (pressed, a rebound each), then one big push: the dome swells at you as the film thins, a black spot
  // blooms and spreads, and the film trembles before it goes
  const knock = 0.05 + 0.035 * Math.exp(-k1 * 6) * Math.cos(k1 * 22);
  const bulge = t < HOOK.push ? knock : lerp(knock, 0.16, seg(t, HOOK.push, HOOK.spot + 0.1, ease.outCubic)) + 0.05 * seg(t, HOOK.brace, HOOK.pop, ease.inQuad);
  const thin = seg(t, HOOK.push, HOOK.brace, ease.inOutSine);
  const spot = lerp(0, 0.5, seg(t, HOOK.spot, HOOK.brace, ease.outCubic)) + 0.5 * seg(t, HOOK.brace, HOOK.pop, ease.inQuad);
  const hole = t < HOOK.pop ? 0 : 1.7 * seg(t, HOOK.pop, HOOK.pop + 0.13, ease.outCubic);
  // the camera leans in (the wall and Bub come at you): a little over the knocks, looming on the push, a last lean
  const Dm = 1.2 - 0.03 * seg(t, HOOK.knock3, HOOK.push) - 0.14 * seg(t, HOOK.push, HOOK.brace, ease.inOutSine)
    - 0.05 * seg(t, HOOK.brace, HOOK.pop, ease.inOutSine);
  return {
    bulge, thin, spot, hole, Dm,
    rings: [...KNOCKS.map((k, i) => ringOf(t - k, [0.03, 0.024, 0.032][i])), ringOf(t - HOOK.spot, 0.02)],
    tremor: seg(t, HOOK.brace - 0.1, HOOK.pop),
  };
}

function bubKnock(t, Wl) {
  // its squash along the view axis (1 = round): flattened by each knock, a rebound; pressed harder as it pushes
  const k1 = t - lastKnock(t);
  let sz = 0.74 - 0.22 * Math.exp(-k1 * 7) * Math.cos(k1 * 18);
  if (t >= HOOK.push) sz = lerp(sz, 0.58, seg(t, HOOK.push, HOOK.brace, ease.outCubic));
  // knock, knock, knock: between knocks it rears back a little and rounds out
  let off = 0;
  for (let i = 0; i + 1 < KNOCKS.length; i++) {
    if (t > KNOCKS[i] && t < KNOCKS[i + 1]) { off = 0.05 * Math.sin(Math.PI * seg(t, KNOCKS[i], KNOCKS[i + 1])); sz = lerp(sz, 0.95, 0.6 * off / 0.05); }
  }
  const apex = heightAt(MB.uniforms, 0, MB.uniforms.uC.value.y);
  const tremor = Wl.tremor * 0.006 * Math.sin(t * 70);
  const dist = Wl.Dm - apex + BUB_R * sz + off + tremor;
  const yPlane = -((CONTACT_Y - H / 2) / (H / 2)) * Math.tan(32 * Math.PI / 180);
  const pos = camPoint(0, yPlane * dist, dist);
  // the eyes: snap open on you; set on you while it knocks; up to "friends"; back to you, hopeful; straining on the
  // push; huge as the spot blooms; shut tight
  const camDir = camera.position.clone().sub(pos).normalize();
  const camUp = new THREE.Vector3(0, 1, 0).applyQuaternion(camera.quaternion);
  const gaze = camDir.clone();
  const upL = seg(t, HOOK.look, HOOK.look + 0.06, MOVE.go) * (1 - seg(t, HOOK.back, HOOK.back + 0.08, MOVE.go));
  gaze.addScaledVector(camUp, 0.75 * upL).normalize();
  return {
    vis: true, pos, r: BUB_R, gaze, faceMin: 0.55,
    // pressed on the glass its cheeks spread: the silhouette squashes too (wider, shorter) — the view-axis squash
    // alone barely shows from the front
    squashDir: camUp, squashK: 0.55 * (sz - 1),
    blink: t > HOOK.brace + 0.05 ? 1 : 0, eyeScale: 1.55,
    squint: t > HOOK.knock2 && t < HOOK.look ? 0.3 : t > HOOK.push && t < HOOK.spot ? 0.5 : 0,
    wide: t < HOOK.knock2 ? 0.6 : t > HOOK.back && t < HOOK.push ? 0.55 : t > HOOK.spot && t < HOOK.brace ? 1 : 0.2,
    look: [0, -0.5 * upL], blush: lerp(0.7, 1, seg(t, HOOK.back, HOOK.back + 0.15) * (1 - seg(t, HOOK.push, HOOK.push + 0.2))),
  };
}

// ── the camera ───────────────────────────────────────────────────────────────────────────────────────────────────
function rig(t) {
  const pos = E.clone();
  const look = BPOS.clone().addScaledVector(UPS, -0.32);                 // the sea of people up to mid-frame
  const up = DE.clone();
  // the pop blasts us back out of our bubble, then a slow drift toward where the mark is forming
  if (t > HOOK.pop) {
    const k = t - HOOK.pop;
    pos.addScaledVector(FWD, -0.55 * (1 - Math.exp(-k * 9)) + 0.25 * seg(t, HOOK.pop + 0.4, NAME.dive, ease.inOutSine));
    look.lerp(BPOS, seg(t, HOOK.pop, HOOK.pop + 0.5, MOVE.go));
  }
  // the dive through the mark (blue, the wall, coral), out over the world: then the camera flies on low over the
  // surface, following its curve north, the horizon of people low in the frame under the words
  const dv = seg(t, NAME.dive, NAME.value + 0.05, ease.inOutCubic);
  if (dv > 0) {
    const lat = KL.lat + 1.6 + 3.2 * Math.max(0, t - NAME.value), n = dirAt(lat);
    const tan = new THREE.Vector3(0, Math.cos(lat * Math.PI / 180), -Math.sin(lat * Math.PI / 180));
    const fly = n.clone().multiplyScalar(11.12);
    pos.lerp(fly, dv);
    look.lerp(fly.clone().addScaledVector(tan, 4).addScaledVector(n, -0.5), dv);
    up.lerp(n, dv).normalize();
  }
  return { pos, look, up };
}

// Where the words stand after the tear (a sign the size of the frame): flying from the wall's distance to the mark's
// with the tear (carried by the lens: the torn letters, "friends" gliding down); from there the name stands still in
// the world under the mark, and the lens drifts and dives past it; the value waits out over the world of people, the
// lens gaining on it as it flies
const _pc = new THREE.PerspectiveCamera(64, W / H, 0.02, 400);
const lensAt = (t) => { const R = rig(t); _pc.position.copy(R.pos); _pc.up.copy(R.up); _pc.lookAt(R.look); _pc.updateMatrixWorld(); return _pc; };
const SETTLE = HOOK.pop + 0.3;
// the words on the wall come at you with it, half as much as the wall does: they are laid out for a wall 1.2 away
const wallScaleD = (Dm) => lerp(1.2, Dm, 0.5);
let NAME_AT = null, VALUE_AT = null;
function wordsAt(t) {
  if (t < SETTLE) {
    // from the wall's distance (and the size the words had on it) to the mark's
    const Dp = wall(HOOK.pop).Dm, grow = lerp(wallScaleD(Dp) / Dp, 1, seg(t, HOOK.pop, SETTLE, MOVE.go));
    const d = lerp(wall(t).Dm, camera.position.distanceTo(BPOS), seg(t, HOOK.pop, SETTLE));
    const at = pin(camera, W / 2, H / 2, d);
    at.wpp *= grow;
    return at;
  }
  if (t < NAME.value - 0.05) return (NAME_AT ??= (() => { const c = lensAt(SETTLE); return pin(c, W / 2, H / 2, c.position.distanceTo(BPOS)); })());
  // the value floats over the people, in front of them, drifting with the lens (it gains on the words a little)
  VALUE_AT ??= { ...pin(lensAt(VALUE_KEY), W / 2, H / 2, 4.5), from: lensAt(VALUE_KEY).position.clone() };
  return { pos: VALUE_AT.pos.clone().addScaledVector(lensAt(t).position.clone().sub(VALUE_AT.from), 0.75), quat: VALUE_AT.quat, wpp: VALUE_AT.wpp };
}
const VALUE_KEY = NAME.value + 0.45;

// the world point under frame pixel (x, y) at distance d from the lens (the current camera)
function screenPoint(x, y, d) {
  camera.updateMatrixWorld();
  return new THREE.Vector3((x / W) * 2 - 1, 1 - (y / H) * 2, 0.5).unproject(camera).sub(camera.position).normalize().multiplyScalar(d).add(camera.position);
}
// a camera-space point (x right, y up, d ahead)
function camPoint(x, y, d) {
  camera.updateMatrixWorld();
  return _t.set(x, y, -d).applyMatrix4(camera.matrixWorld).clone();
}

export default {
  init(env) {
    scene = new THREE.Scene();
    scene.add(env.makeBackdrop());
    PL = planet();
    PL.mesh.rotation.set(0, PL.face(KL.lon), 0);
    scene.add(PL.mesh);
    BUB = bub3d({ seed: 9 });
    scene.add(BUB.root);
    MK = mark3d();
    scene.add(MK.group);
    MB = membrane();
    scene.add(MB.mesh);
    camera = new THREE.PerspectiveCamera(64, W / H, 0.02, 400);
    // the words: until the wall tears they are written on it (its shader reads them: gl/membrane.js); from the tear
    // they are a sign in the world (gl/sign.js) — torn letters and "friends" between the wall and the mark, the name
    // standing under the mark, the value over the world of people
    const ic = document.createElement('canvas'); ic.width = W; ic.height = H;
    INK = { canvas: ic, ctx: ic.getContext('2d'), tex: new THREE.CanvasTexture(ic) };
    INK.tex.colorSpace = THREE.SRGBColorSpace;
    MB.uniforms.uType.value = INK.tex;
    WORDS = sign({ w: W, h: H, q: 1 });
    const [h1, h2, h3] = T.hook.lines, [s1, s2, s3] = T.hook.s;
    howTo = new Line(h1, { s: s1, w: 800, track: -0.035 });
    makeMore = new Line(h2, { s: s2, w: 800, track: -0.035 });
    bigF = new Line(h3, { s: s3, w: 800, track: -0.03 });     // same weight and tracking as the name's: carried()
    almost = new Line('almost', { s: 150, w: 640, track: -0.015 });
    friendsAi = new Line('friends.ai', { s: 150, w: 800, track: -0.03 });
    [v1, v2, v3] = T.value.lines.map((l, i) => new Line(l, { s: 150, w: i === 2 ? 820 : 800, track: -0.035 }));
  },

  three: {
    start: 0, end: NAME.open + 0.05,
    update(t) {
      const R = rig(t);
      camera.position.copy(R.pos); camera.up.copy(R.up); camera.lookAt(R.look); camera.updateMatrixWorld();
      // the people: a pale, still sea until the wall breaks, then colour floods in
      const u = PL.uniforms;
      u.uTime.value = t;
      u.uSat.value = seg(t, HOOK.pop, HOOK.pop + 0.35, ease.outCubic);
      u.uNear.value = 10; u.uFar.value = lerp(60, 45, seg(t, HOOK.pop, HOOK.pop + 0.4));
      u.uSun.value.set(-0.55, 0.55, 0.62); u.uGlobeAt.value.set(0, 0, 0);
      u.uClearAt.value.copy(BPOS); u.uClearR.value = MARK_R * 2.2;
      u.uBurstAt.value.copy(E).addScaledVector(FWD, 1.2); u.uBurst.value = t > HOOK.pop ? 1 - Math.exp(-(t - HOOK.pop) * 2.4) : 0; u.uBurstAmp.value = 3;
      u.uAlpha.value = 1 - seg(t, NAME.exit, NAME.open, ease.inQuad);
      u.uVeil.value = 0; u.uScanR.value = -1; u.uPush.value = 0; u.uNearFade.value = 1.6 * seg(t, NAME.dive, NAME.value);
      // the wall of your bubble
      const Wl = wall(t);
      MB.mesh.visible = Wl.hole < 1.6;
      if (MB.mesh.visible) {
        const yPlane = -((CONTACT_Y - H / 2) / (H / 2)) * Math.tan(32 * Math.PI / 180) * Wl.Dm;
        const mu = MB.uniforms;
        mu.uC.value.set(0, yPlane); mu.uBulge.value = Wl.bulge; mu.uThin.value = Wl.thin; mu.uSpot.value = Wl.spot; mu.uHole.value = Wl.hole;
        mu.uRingT.value.set(...Wl.rings.map((r) => r[0])); mu.uRingA.value.set(...Wl.rings.map((r) => r[1]));
        mu.uTremor.value = Wl.tremor; mu.uTime.value = t;
        const between = KNOCKS.some((k, i) => i + 1 < KNOCKS.length && t > k + 0.06 && t < KNOCKS[i + 1] - 0.02);   // reared back
        mu.uPatch.value = !between && t < HOOK.pop ? BUB_R * 0.62 : 0;
        MB.place(camera, Wl.Dm);
      }
      // Bub: at the wall, through it on the drop, then beside the mark; into the app icon at the end
      const b = t < HOOK.pop ? bubKnock(t, Wl) : bubAfter(t);
      BUB.root.visible = !!b.vis;
      if (b.vis) BUB.set({ ...b, toCam: camera.position.clone().sub(b.pos).normalize(), t, order: 40 });
      // the mark
      const m = markState(t);
      MK.set({ pos: BPOS, r: m.r, axis: RIGHT, t, alpha: 0, glow: 0.6, wob: m.wob, order: 30 });   // (the mark is liquid: hookLiquid)
      // the words
      if (t < HOOK.pop) {
        // written on the wall: they ride its ripples and bulge, under its film; they come at you with it, a little
        const g = INK.ctx;
        g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, W, H);
        hookWords(g, t);
        INK.tex.needsUpdate = true;
        MB.uniforms.uTypeOn.value = 1;
        MB.uniforms.uTypeK.value = H / (2 * Math.tan((32 * Math.PI) / 180) * wallScaleD(Wl.Dm));
        WORDS.hide(scene);
      } else {
        MB.uniforms.uTypeOn.value = 0;
        WORDS.draw((c) => { hookWords(c, t); carried(c, t); nameWords(c, t); valueWords(c, t); valueTags(c, t); });
        WORDS.place(scene, wordsAt(t), { order: 60 });
      }
      return { scene, camera, bloom: { strength: 0.3, threshold: 1.02, radius: 0.55 } };
    },
  },

  // the special edition's liquid: the pop's droplets fly together and inflate into the mark; the dive passes its film
  liquid: { start: HOOK.pop, end: NAME.exit + 0.3, frame: (t) => mergeLiquid(t < NAME.dive + 0.3 ? hookLiquid(t) : null, t >= NAME.value - 0.1 ? valueLiquid(t) : null) },

  under: [{ start: 0, end: NAME.open + 0.1, draw(ctx) { drawSky(ctx); } }],

  layers: [{
    start: 0, end: NAME.open + 0.2,
    // (the words are in the shot: HTYPE) — over it: the droplets thrown at the lens, the dive's sheet of film, the icon
    draw(ctx, t) { pop2d(ctx, t); wipe(ctx, t); icon(ctx, t); },
  }],

  fx(t) {
    const hit = (t0, zoom, flash, shake, decay = 9) => {
      const k = t - t0;
      if (k < 0 || k > 0.6) return null;
      const sh = shake * Math.exp(-k * decay);
      return { zoom: 1 + zoom * Math.exp(-k * decay), flash: flash * Math.exp(-k * 30), sx: sh * Math.sin(k * 90), sy: sh * Math.cos(k * 71) };
    };
    // the knocks shake the lens (a few frames each; the latest wins, they are a quarter second apart); the pop's flash
    // is one short, partial white (research §10.4)
    const hits = [[HOOK.knock1, 0.04, 0, 0.012, 14], [HOOK.knock2, 0.02, 0, 0.006, 16], [HOOK.knock3, 0.03, 0, 0.009, 16],
      [HOOK.pop, 0.06, 0.35, 0.014, 9], [NAME.icon + 0.2, 0.025, 0, 0.006, 9], [NAME.tap, 0.02, 0, 0.004, 9]];
    for (let i = hits.length - 1; i >= 0; i--) { if (t >= hits[i][0]) return hit(...hits[i]); }
    return null;
  },
};

// ── Bub after the wall ───────────────────────────────────────────────────────────────────────────────────────────
function bubAfter(t) {
  const R0 = 0.22;
  if (t > NAME.tap + 0.02) return { vis: false };
  // through the wall and past the lens (it ends behind us, off frame) …
  if (t < HOOK.pop + 0.5) {
    const k = seg(t, HOOK.pop, HOOK.pop + 0.32, ease.inCubic);
    const pos = camPoint(lerp(0, -0.55, k), lerp(-0.04, 0.12, k), lerp(1.0, -0.2, k));
    return { vis: k < 0.98, pos, r: BUB_R, gaze: camera.position.clone().sub(pos).normalize(), happy: 1, blush: 1, squashDir: new THREE.Vector3(0, 0, 1).applyQuaternion(camera.quaternion), squashK: 0.35 * Math.sin(Math.PI * k), faceMin: 0.6 };
  }
  // … and back in from the right as the mark forms: it bobs at the mark's upper right until the dive leaves it behind
  if (t < NAME.dive + 0.1) {
    const enter = MOVE.in(seg(t, NAME.icon + 0.1, NAME.name + 0.2));
    const pos = screenPoint(lerp(1300, 850, enter), 690 + 14 * Math.sin(t * 4), 2.3);
    return { vis: true, pos, r: R0, gaze: camera.position.clone().sub(pos).normalize(), happy: 1, blush: 0.9, faceMin: 0.55 };
  }
  // the app icon: Bub flies in from the left and dives into it (the tap)
  if (t < NAME.exit - 0.15) return { vis: false };
  const go = MOVE.go(seg(t, NAME.exit - 0.15, NAME.tap));
  const pos = screenPoint(lerp(-200, APP_ICON.x, go), lerp(1100, APP_ICON.y, go) - Math.sin(Math.PI * go) * 260, lerp(2.0, 2.4, go));
  return { vis: true, pos, r: R0 * (1 - 0.75 * smoothstep(0.75, 1, go)), gaze: camera.position.clone().sub(pos).normalize(), happy: go > 0.5 ? 1 : 0, blush: 0.8, faceMin: 0.6,
    squashDir: new THREE.Vector3(1, -0.4, 0).applyQuaternion(camera.quaternion).normalize(), squashK: 0.25 * Math.sin(Math.PI * go) };
}

// ── the liquid ───────────────────────────────────────────────────────────────────────────────────────────────────
// The mark as liquid in the hook's world (the 3D camera, the planet's depth): a blue bubble and a coral one sharing a
// wall. It is born from the pop: droplets thrown off the tear stream to where it forms and merge into it, each into
// its own colour (smooth union), as the spring inflates it
const MARK_SKIN = { ...INK_ORB, fill: 1, glow: 0.1, haze: 0, rim: 0.3, edge: 0.25, env: 0.85, tintAmt: 0.7 };
const DROPS3 = Array.from({ length: 16 }, (_, i) => {
  const R = Math.sin(i * 12.9898 + 4.1) * 43758.5453, f = R - Math.floor(R);
  return { side: i % 2 ? 1 : -1, a: i * 2.399 + f, lift: 0.15 + 0.3 * f, arrive: NAME.icon + 0.1 + 0.02 * i, r: 0.045 + 0.035 * ((i * 7) % 5) / 4 };
});
let tearAt = null;                                   // the tear's world point (where the droplets start)
function hookLiquid(t) {
  if (!tearAt) tearAt = BPOS.clone().addScaledVector(FWD, -1.25).addScaledVector(UPS, -0.28);   // the wall's contact, ahead of the lens
  const prims = [];
  const m = markState(t);
  const axis = RIGHT.clone().multiplyScalar(Math.cos(m.yaw)).addScaledVector(FWD, Math.sin(m.yaw)).normalize();
  const sides = [-1, 1];
  if (m.alpha > 0 && m.r > 0.002) {
    sides.forEach((sd, i) => {
      const c = BPOS.clone().addScaledVector(axis, sd * m.r / 2);
      prims.push({ ...MARK_SKIN, ...inkOf(MARK_INK[i]), pos: [c.x, c.y, c.z], size: [m.r * (1 + 0.04 * sd * m.wob)], seed: i ? 3.7 : 1.2, group: 1 + i, k: 0.05 });
    });
    if (m.r > 0.02) prims.push({ type: 'wall', pos: [BPOS.x, BPOS.y, BPOS.z], size: [m.r * Math.sqrt(3) / 2], quat: quatFromZ([axis.x, axis.y, axis.z]),
      thick: 360, seed: 5.5, env: 1.6, rim: 1.0, haze: 0.04, edge: 0, group: 3 });
  }
  // the droplets: off the tear, an arc up and over, into their colour
  for (const d of DROPS3) {
    const u = seg(t, HOOK.pop + 0.02, d.arrive, ease.inOutCubic);
    if (u <= 0 || u >= 1) continue;
    const goal = BPOS.clone().addScaledVector(RIGHT, d.side * MARK_R / 2);
    const p = tearAt.clone().lerp(goal, u)
      .addScaledVector(RIGHT, Math.cos(d.a) * 0.7 * Math.sin(Math.PI * u))
      .addScaledVector(UPS, (Math.sin(d.a) * 0.45 + d.lift) * Math.sin(Math.PI * u));
    const i = d.side > 0 ? 1 : 0;
    prims.push({ ...MARK_SKIN, ...inkOf(MARK_INK[i]), fill: lerp(0.5, 1, u), pos: [p.x, p.y, p.z], size: [d.r * (1 - 0.55 * u * u)], seed: d.a, group: 1 + i, k: 0.12 });
  }
  // the dive passes the mark's shared wall: a sheet of real film just in front of the lens, its colours swirling
  const w = Math.sin(Math.PI * seg(t, NAME.dive + 0.06, NAME.dive + 0.28));
  if (w > 0.002) {
    camera.updateMatrixWorld();
    const fwd = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion), at = camera.position.clone().addScaledVector(fwd, 0.3);
    prims.push({ type: 'wall', pos: [at.x, at.y, at.z], size: [0.26], quat: quatFromZ([-fwd.x, -fwd.y, -fwd.z]), fill: 0.4, tint: '#FFE9F4', c2: '#D9ECFF', c3: '#FFF1C9',
      thick: 380, env: 2.4, rim: 0, haze: 0, edge: 0, glow: 0.3, alpha: w, seed: 6.1 + t * 0.6, group: 9 });
  }
  return { prims, cam: '3d', useDepth: true, bloom: { strength: 0.3, threshold: 1.02, radius: 0.55 } };
}

// ── the mark ─────────────────────────────────────────────────────────────────────────────────────────────────────
function markState(t) {
  if (t < NAME.icon || t > NAME.dive + 0.17) return { alpha: 0, r: 0.001, yaw: 0, wob: 0 };   // gone behind the wall's shimmer
  const born = spring(t - NAME.icon, SPRING.wobble);
  const k = t - NAME.icon;
  // a slow turn shows it is round; then, for the dive, it swings its axis toward us (blue in front)
  const yaw = 0.18 * Math.sin(k * 2.2) + (Math.PI / 2) * MOVE.go(seg(t, NAME.dive - 0.12, NAME.dive + 0.12));
  return { alpha: 1, r: MARK_R * Math.max(0.001, born), yaw, wob: Math.sin(k * 18) * Math.exp(-k * 5) };
}

// ── the words ────────────────────────────────────────────────────────────────────────────────────────────────────
// a whole line slams in: big and fast to its size (a snap spring), scaled about its own centre
function lineSlam(ctx, line, y, t, t0, { from = 1.5, fill = C.ink, each = null } = {}) {
  if (t < t0) return;
  const p = spring(t - t0, SPRING.snap);
  const s = lerp(from, 1, p);
  ctx.save(); ctx.globalAlpha *= clamp(p * 4);
  about(ctx, W / 2, y - line.ascent / 2, s, s, () => drawLine(ctx, line, centerX(line, W / 2), y, { fill, each }));
  ctx.restore();
}

// knock, knock, knock: one line per knock, the last one the hero
function hookWords(ctx, t) {
  const popT = t - HOOK.pop;
  if (popT > 0.32) return;
  const lines = [[howTo, Y_HOW, HOOK.knock1 - 0.12, 1.35], [makeMore, Y_MAKE, HOOK.knock2, 1.45], [bigF, Y_FRIENDS, HOOK.knock3, 1.6]];
  for (const [line, y, t0, from] of lines) {
    if (t < t0) continue;
    const x0 = centerX(line, W / 2), fill = line === bigF ? C.blue : C.ink;
    if (popT < 0) {
      const strain = seg(t, HOOK.brace, HOOK.pop) * 0.015;
      ctx.save(); ctx.translate(W / 2, CONTACT_Y); ctx.scale(1 + strain, 1 - strain * 0.5); ctx.translate(-W / 2, -CONTACT_Y);
      lineSlam(ctx, line, y, t, t0, { from, fill });     // (on the wall: its ripples move them, gl/membrane.js)
      ctx.restore();
    } else if (line !== bigF) {
      // the wall bursts: "How to make more" flies apart with it ("friends" stays: carried())
      drawLine(ctx, line, x0, y, {
        fill,
        each: (i) => {
          const ang = (i * 2.399 + y * 0.01) % TAU, u = clamp(popT / 0.3);
          return { dx: Math.cos(ang) * 2600 * popT, dy: Math.sin(ang) * 1900 * popT - 500 * popT + 1600 * popT * popT, rot: (i % 2 ? 1 : -1) * popT * 9, a: 1 - u, sc: 1 + 1.2 * popT };
        },
      });
    }
  }
}

// "friends" survives the pop: each letter glides down into its place in the name (almost / friends.ai), shrinking and
// going from blue to ink, a little after the one before it; nameWords() takes over, letter for letter, at CARRY_END
function carried(ctx, t) {
  if (t < HOOK.pop || t >= CARRY_END) return;
  if (!friendsAi.text.startsWith(bigF.text)) return flipped(ctx, t);
  const x0 = centerX(bigF, W / 2), x1 = centerX(friendsAi, W / 2), k = friendsAi.opt.s / bigF.opt.s;
  drawLine(ctx, bigF, x0, Y_FRIENDS, {
    fill: C.blue,
    each: (i, g) => {
      const p = MOVE.go(seg(t, CARRY[0] + i * CARRY[2], CARRY[1] + i * CARRY[2]));
      const g1 = friendsAi.glyphs[i];
      const dx = (x1 + g1.x + g1.w / 2) - (x0 + g.x + g.w / 2);
      const dy = (Y_NAME - friendsAi.xh / 2) - (Y_FRIENDS - bigF.xh / 2);
      const flinch = 0.06 * Math.sin(Math.PI * seg(t, HOOK.pop, CARRY[0] + 0.05));   // the shockwave passes through it
      return { dx: dx * p, dy: dy * p, sc: lerp(1, k, p) * (1 + flinch), fill: mixHex(C.blue, C.ink, p) };
    },
  });
}

// The Chinese cut: 朋友 glides down whole into the place of "friends" (shrinking to its height, blue to ink, the same
// shockwave flinch), then flips into it like a split-flap: 朋友 folds flat about its middle as "friends" unfolds from
// it, landing exactly at CARRY_END, where nameWords() takes over and ".ai" pops on
function flipped(ctx, t) {
  const word = friendsAi.glyphs.slice(0, 7), wx0 = word[0].x, wx1 = word[6].x + word[6].w;
  const x1 = centerX(friendsAi, W / 2), cx1 = x1 + (wx0 + wx1) / 2;
  const cy0 = Y_FRIENDS - bigF.xh / 2, cy1 = Y_NAME - friendsAi.xh / 2;
  const k = friendsAi.ascent / bigF.ascent;                       // 朋友 lands as tall as "friends"' capitals
  const p = MOVE.go(seg(t, CARRY[0], CARRY_END - FLIP));
  const f = seg(t, CARRY_END - FLIP, CARRY_END);                   // the flip: 0 → 1
  const flinch = 0.06 * Math.sin(Math.PI * seg(t, HOOK.pop, CARRY[0] + 0.05));
  const cx = lerp(W / 2, cx1, p), cy = lerp(cy0, cy1, p);
  if (f < 0.5) {
    const sy = Math.cos(Math.PI * f), sc = lerp(1, k, p) * (1 + flinch);
    about(ctx, cx, cy, sc, sc * sy, () => drawLine(ctx, bigF, centerX(bigF, cx), cy + bigF.xh / 2, { fill: mixHex(C.blue, C.ink, p), log: false }));
  } else {
    const sy = -Math.cos(Math.PI * f);
    about(ctx, cx1, cy1, 1, sy, () => drawLine(ctx, friendsAi, x1, Y_NAME, { fill: C.ink, each: (i) => (i < 7 ? null : { a: 0 }), log: false }));
  }
}

// the tear in 2D: droplets thrown from the spot toward the lens (they streak), a shockwave
function pop2d(ctx, t) {
  const popT = t - HOOK.pop;
  if (popT <= 0 || popT > 1.4) return;
  for (const q of drops) {
    const ang = Math.atan2(q.vy, q.vx);
    const p = particleAt(q, W / 2 + Math.cos(ang) * 120, CONTACT_Y + Math.sin(ang) * 120, popT, 900, 2.8);
    if (p.a > 0) drawDroplet(ctx, p.x, p.y, q.size * (0.6 + popT * 1.4), q.vx * Math.exp(-2.8 * popT), q.vy * Math.exp(-2.8 * popT), p.a * (popT < 0.4 ? 1 : 0.4));
  }
  if (popT < 0.45) {
    ctx.save(); ctx.globalAlpha *= 1 - popT / 0.45;
    ctx.strokeStyle = '#FFFFFF'; ctx.lineWidth = 22 * (1 - popT / 0.45) + 2;
    ctx.beginPath(); ctx.arc(W / 2, CONTACT_Y, 120 + 1400 * MOVE.in(popT / 0.45), 0, TAU); ctx.stroke(); ctx.restore();
  }
}

function nameWords(ctx, t) {
  if (t < NAME.name || t > NAME.dive + 0.3) return;
  const out = seg(t, NAME.dive - 0.05, NAME.dive + 0.15, MOVE.out);
  const letters = (t0, gap) => (i) => {
    const a0 = t0 + i * gap, p = spring(t - a0, SPRING.pop), v = springVel(t - a0, SPRING.pop), sq = clamp(v * 0.012, -0.14, 0.14);
    return t < a0 ? { a: 0 } : { sc: p, sx: 1 - sq, sy: 1 + sq, a: clamp(p * 4), dy: (1 - p) * 50 };
  };
  const o = () => (out > 0 ? { a: 1 - out, sc: 1 + 0.6 * out, dy: out * 120 } : null);
  drawLine(ctx, almost, centerX(almost, W / 2), Y_ALMOST, { fill: C.inkSoft, each: combine(letters(NAME.name, 0.035), o) });
  // "friends" is already here (carried()); ".ai" pops in after it
  if (t >= CARRY_END) {
    const ai = (i) => (i < 7 ? null : letters(CARRY_END + 0.02, 0.05)(i - 7));
    drawLine(ctx, friendsAi, centerX(friendsAi, W / 2), Y_NAME, { fill: C.ink, each: combine(ai, o) });
  }
}

// the dive through the mark: the mark fills the frame (blue, coral), and the lens passes its shared wall — a bright
// sheet of film colour for a few frames, never a dark or saturated full-frame flash (research-hooks.md §10.4; the frame
// gate's dip check)
function wipe(ctx, t) {
  const w = Math.sin(Math.PI * seg(t, NAME.dive + 0.1, NAME.dive + 0.24));
  if (w <= 0) return;
  const g = ctx.createLinearGradient(0, 0, W, H);
  ['#FFE9A8', '#FFC4E1', '#CFE8FF', '#B8F0FF', '#C9F7E3'].forEach((c, i, arr) => g.addColorStop(i / (arr.length - 1), c));
  // (a sheet of real film rides in front of the lens with it: hookLiquid)
  ctx.save(); ctx.globalAlpha *= 0.45 * w; ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  ctx.globalAlpha = 0.2 * w; ctx.fillStyle = '#FFFFFF'; ctx.fillRect(0, 0, W, H); ctx.restore();
}

// the value, alone and big, held over the world of people gliding by
function valueWords(ctx, t) {
  if (t < NAME.value || t > NAME.exit + 0.1) return;
  const vOut = (i, g, wk) => {
    const o = seg(t, NAME.exit - 0.2 + Math.max(0, wk) * 0.03, NAME.exit - 0.2 + Math.max(0, wk) * 0.03 + 0.18, MOVE.out);
    return o > 0 ? { a: 1 - o, dy: -o * 90 } : null;
  };
  const at = valuePops([v1, v2, v3].map((l) => l.words.length));
  [[v1, 760], [v2, 915], [v3, 1070]].forEach(([l, y], i) => drawLine(ctx, l, centerX(l, W / 2), y, { fill: i === T.value.blue ? C.blue : C.ink, each: combine(popEach(l, t, at[i]), vOut) }));
}

// Three of the values, as inks (they come back as your picks, and fill your orb): beads of colour that float up out of
// the world of people into a row under the line, each with its word hanging under it (in the words' own plane, so the
// two stay together as the lens flies on); they pop as the app icon arrives
const TAGS = ['family', 'career', 'adventure'];
const TAG = { y: 1170, gap: 230, r: 48, label: 1272 };
const tagX = (i) => W / 2 + (i - 1) * TAG.gap;
const tagIn = (i) => VALUE_TAGS + i * 0.14;                  // when each lands (tools/cues.mjs clicks there)
function valueTags(ctx, t) {
  if (t < VALUE_TAGS || t > NAME.exit + 0.1) return;
  const out = seg(t, NAME.exit - 0.2, NAME.exit, MOVE.out);
  TAGS.forEach((k, i) => {
    const p = spring(t - tagIn(i) - 0.06, SPRING.pop);
    if (p <= 0.001) return;
    const label = `${P[k].emoji} ${P[k].label}`;
    ctx.save(); ctx.globalAlpha *= clamp(p * 3) * (1 - out);
    about(ctx, tagX(i), TAG.label - 14, p, p, () => text(ctx, label, tagX(i), TAG.label, { f: FONTS.ui, w: 750, size: 40, color: C.ink, align: 'center' }));
    ctx.restore();
  });
}
// → the liquid over the value: the three beads, and soap bubbles rising through the words
const AIR_V = [[0.16, 0.35, 0.12, 0.5, 0.7], [0.86, 0.6, 0.1, 1.5, 0.65], [0.45, 0.3, 0.14, 2.5, 0.75]];
function valueLiquid(t) {
  const at = wordsAt(Math.max(t, NAME.value - 0.05));
  const right = new THREE.Vector3(1, 0, 0).applyQuaternion(at.quat), up = new THREE.Vector3(0, 1, 0).applyQuaternion(at.quat);
  const toward = new THREE.Vector3(0, 0, 1).applyQuaternion(at.quat);
  const onPlane = (x, y) => at.pos.clone().addScaledVector(right, (x - W / 2) * at.wpp).addScaledVector(up, (H / 2 - y) * at.wpp);
  const V = (v) => [v.x, v.y, v.z];
  const prims = [];
  const gone = seg(t, NAME.exit - 0.12, NAME.exit + 0.06);
  TAGS.forEach((k, i) => {
    const rise = MOVE.go(seg(t, tagIn(i) - 0.5, tagIn(i)));
    if (rise <= 0) return;
    const land = spring(t - tagIn(i), SPRING.wobble);
    const p = onPlane(tagX(i), TAG.y + (1 - rise) * 700 + 6 * Math.sin(t * 2.6 + i)).addScaledVector(toward, 0.05);
    const r = TAG.r * at.wpp * (0.6 + 0.4 * rise) * (t > tagIn(i) ? 0.9 + 0.1 * land : 1);
    // the icon arrives: they pop
    if (gone > 0) prims.push({ ...INK_ORB, ...inkOf([P[k].color]), type: 'shell', pop: gone, popDir: [0, 0.2, 1], pos: V(p), size: [r], seed: 5 + i, group: 40 + i });
    else prims.push({ ...INK_ORB, ...inkOf([P[k].color]), pos: V(p), size: [r], seed: 5 + i, group: 40 + i });
  });
  AIR_V.forEach(([ox, dz, r, mid, v], i) => {
    const k = (t - NAME.value - mid) * v;                   // height above the words' middle (units)
    const vis = smoothstep(-1.6, -1.1, k) * (1 - smoothstep(1.1, 1.6, k)) * (1 - gone) * seg(t, NAME.value, NAME.value + 0.35);
    if (vis <= 0.002) return;
    const p = onPlane(W * ox, 900).addScaledVector(toward, dz).addScaledVector(up, k);
    prims.push({ type: 'sphere', thick: 410, haze: 0.03, rim: 1.4, edge: 0.5, env: 1.2, frost: 0.45, wobble: 0.012, pos: V(p), size: [r], alpha: vis, seed: 7 + i, group: 50 + i });
  });
  return { prims, cam: '3d', useDepth: true };
}
const mergeLiquid = (a, b) => (!a ? b : !b ? a : { ...a, prims: [...a.prims, ...b.prims] });

// the app icon: a white tile with the mark pops in where the app will open from; Bub's dive presses it
function icon(ctx, t) {
  if (t < NAME.exit || t >= NAME.open) return;
  const tile = spring(t - NAME.exit, SPRING.pop);
  const press = 1 - 0.1 * Math.sin(Math.PI * seg(t, NAME.tap, NAME.open));
  const size = APP_ICON.size * tile * press;
  if (size < 1) return;
  ctx.save();
  ctx.shadowColor = 'rgba(11,27,63,0.18)'; ctx.shadowBlur = size * 0.18; ctx.shadowOffsetY = size * 0.06;
  ctx.fillStyle = '#FFFFFF';
  ctx.fill(squirclePath(APP_ICON.x - size / 2, APP_ICON.y - size / 2, size, size, size * ICON_RADIUS));
  ctx.restore();
  drawMark(ctx, APP_ICON.x, APP_ICON.y, size * 0.27, { t, wob: Math.sin((t - NAME.exit) * 16) * Math.exp(-(t - NAME.exit) * 4) });
}
