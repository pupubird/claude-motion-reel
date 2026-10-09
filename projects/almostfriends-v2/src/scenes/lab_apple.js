// LAB · apple (v2 style frames; owner, mid-build: "要高级感，不一定要同一个design" · "现在的很低级" · "对标苹果").
// Three stills on their own clock, one second each, to agree the look before anything else is built:
//   0–1  the hook on black: Bub as a glass orb with light inside, the question over him
//   1–2  the product on paper: the phone at three-quarters, its screen's edge alight while Bub looks, the claim above
//   2–3  the mark on paper: your orb and theirs, two lights in glass sharing a wall, the name under them
// The language (research/refs/01, 02, 03): one subject, a neutral ground (black or Apple's #F5F5F7), colour only in
// light (one gradient, blue → violet → pink → coral), big tight type, glass and metal that mirror a real studio.
import * as THREE from 'three';
import { W, H, SH } from '../config.js';
import { FONTS } from '../brand.js';
import { clamp, lerp, TAU, rgba } from '../util.js';
import { SCREEN_SCALE } from '../ui/phone.js';
import { phoneCamera } from '../ui/phonecam.js';
import { phone3d, toWorld } from '../gl/phone3d.js';
import { sp, sr, bubPrim, quatFromZ } from '../liquid2d.js';
import { squirclePath } from '../ui/kit.js';
import { statusBar, dynamicIsland, homeIndicator } from '../ui/ios.js';

const K = W / 402;
const pt = (v) => v * K;
export const DUR = 3.0;
const INK = '#1D1D1F', GREY = '#86868B', GREY2 = '#6E6E73', PAPER = '#F5F5F7';
// the one gradient: the light of a friendship (blue → violet → pink → coral)
const GRAD = ['#2F6BFF', '#9B5CFF', '#FF4F9A', '#FF8A4C'];
const DISPLAY = '"Inter", sans-serif';
const UIF = '"SF Pro Text", "SF Pro", system-ui, sans-serif';
const UID = '"SF Pro Display", "SF Pro", system-ui, sans-serif';
const seg3 = (t) => (t < 1 ? 0 : t < 2 ? 1 : 2);

let PSCENE, PH, CAM;
const shot = (z, fx, fy, yaw = 0, pitch = 0, roll = 0, ax = W / 2, ay = 960) => {
  const sc = SCREEN_SCALE * z;
  return { cx: ax - fx * sc + (W * sc) / 2, top: ay - fy * sc, s: z, yaw: yaw * Math.PI / 180, pitch: pitch * Math.PI / 180, roll: roll * Math.PI / 180 };
};

export default {
  init(env) {
    PSCENE = new THREE.Scene();
    PSCENE.add(env.makeBackdrop());
    PH = phone3d(env);
    PSCENE.add(PH.group);
    CAM = new THREE.PerspectiveCamera();
  },
  three: {
    start: 1, end: 2,
    update(t) {
      phoneCamera(shot(0.98, W / 2, SH * 0.5, -24, 7, 0, W / 2, 1190), CAM, H);
      PH.draw((c) => lookingScreen(c, t), 1.4);
      return { scene: PSCENE, camera: CAM, bloom: { strength: 0 } };
    },
  },
  under: [{ start: 0, end: DUR, draw: ground }],
  liquid: { start: 0, end: DUR, frame: liquid },
  layers: [{ start: 0, end: DUR, draw: words }],
  fx: () => ({ grain: 0.01 }),
};

// ── the ground: black with the orb's light spilling round it; paper with a soft overhead light ───────────────────────
function ground(ctx, t) {
  const s = seg3(t);
  if (s === 0) {
    ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H);
    // the orb's light on the dark: a wide cool spill and a warmer heart
    glow(ctx, 540, 1080, 900, '#16244F', 0.9);
    glow(ctx, 470, 1050, 520, '#2F6BFF', 0.22);
    glow(ctx, 640, 1140, 480, '#FF4F9A', 0.16);
    return;
  }
  // the paper studio: a wall that bends into a floor at a soft horizon, lit from above (the glass turns it over)
  const g0 = ctx.createLinearGradient(0, 0, 0, H);
  g0.addColorStop(0, '#FBFBFD'); g0.addColorStop(0.56, '#F2F2F5'); g0.addColorStop(0.64, '#E4E4EA'); g0.addColorStop(1, '#ECECF0');
  ctx.fillStyle = g0; ctx.fillRect(0, 0, W, H);
  glow(ctx, 540, 520, 1100, '#FFFFFF', 0.8);
  if (s === 2) {
    // under the two orbs: their shadow, and the light they throw on the floor in their own colours
    ellipseGlow(ctx, 540, 1215, 300, 46, '#0B0B14', 0.22);
    glow(ctx, 410, 1170, 300, '#2F6BFF', 0.2);
    glow(ctx, 670, 1170, 300, '#FF6B5A', 0.2);
  }
}
function glow(ctx, x, y, r, col, a) {
  const g = ctx.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, rgba(col, a)); g.addColorStop(1, rgba(col, 0));
  ctx.fillStyle = g; ctx.fillRect(x - r, y - r, 2 * r, 2 * r);
}
function ellipseGlow(ctx, x, y, rx, ry, col, a) {
  ctx.save(); ctx.translate(x, y); ctx.scale(1, ry / rx); glow(ctx, 0, 0, rx, col, a); ctx.restore();
}

// ── the liquid: Bub (frames 1, 2) and the mark (3) ─────────────────────────────────────────────────────────────────
const ORB = { glass: 1, refr: 0.035, frost: 0, haze: 0, tintAmt: 0, edge: 0.6, env: 0.6, spec: 0, core: 0.35, absorb: 1.15, dense: 1.8 };
const DAY = { skyTop: '#FFFFFF', skyHor: '#F5F5F7', skyLow: '#B8B8C0', keyDir: [-0.5, 0.65, 0.57], keyGain: 6.5, ssr: 0, studio: 1 };
function liquid(t) {
  const s = seg3(t);
  if (s === 0) {
    const B = bubPrim({ pos: sp(540, 1080, 0), r: sr(235), look: [0.1, 0.15], eyeScale: 1, group: 1 });
    return {
      prims: [{ ...B.prim, ...ORB, tint: GRAD[0], c2: GRAD[2], c3: GRAD[3], coreSeed: 2.0, core: 0.7, absorb: 0 }],
      face: { ...B.face, style: 1 },
      env: { skyTop: '#0A1024', skyHor: '#05070F', skyLow: '#000000', night: 1, stars: 0, keyGain: 3.5, keyDir: [-0.5, 0.65, 0.57], ssr: 0,
        rim: { pos: [4, 3, -3], col: '#9FB8FF', gain: 2.2 } },
      bloom: { strength: 0.55, radius: 0.6, threshold: 1.0 },
    };
  }
  if (s === 1) {
    // Bub over the phone, a little in front of its glass, at its top right
    const B = bubPrim({ pos: toWorld(560, 760, 300), r: 0.15, camPos: CAM.position.toArray(), look: [-0.3, 0.1], eyeScale: 1, group: 1 });
    return { prims: [{ ...B.prim, ...ORB, tint: GRAD[0], c2: GRAD[2], c3: GRAD[3], coreSeed: 2.0 }], face: { ...B.face, style: 1 }, cam: CAM, useDepth: true, env: DAY };
  }
  // the mark: two orbs one radius apart (Plateau's flat wall between them), your blue and their coral
  const r = 245, d = r, cy = 900;
  const a = [540 - d / 2, cy], b = [540 + d / 2, cy];
  const wallR = Math.sqrt(r * r - (d * d) / 4);
  return {
    prims: [
      { type: 'sphere', pos: sp(...a), size: [sr(r)], group: 1, ...ORB, tint: '#2F6BFF', c2: '#6E9BFF', c3: '#1C3FD8', coreSeed: 1.0 },
      { type: 'sphere', pos: sp(...b), size: [sr(r)], group: 2, ...ORB, tint: '#FF6B5A', c2: '#FFA06B', c3: '#FF4F7A', coreSeed: 4.0 },
      { type: 'wall', pos: sp(540, cy), size: [sr(wallR)], quat: quatFromZ([1, 0, 0]), group: 3, thick: 360, seed: 5.5, env: 1.4, rim: 0.6, haze: 0.02, edge: 0 },
    ],
    env: DAY,
  };
}

// ── the words: big, tight, one gradient ─────────────────────────────────────────────────────────────────────────────
function words(ctx, t) {
  const s = seg3(t);
  if (s === 0) {
    headline(ctx, [['How to make'], ['more ', { g: 'friends.' }]], { y: 470, size: 124, color: '#F5F5F7' });
    return;
  }
  if (s === 1) {
    headline(ctx, [['AI finds people'], ['who share ', { g: 'your values.' }]], { y: 250, size: 84, color: INK });
    return;
  }
  // the name: "almost" in grey, "friends" in ink; the line under it
  const size = 128, y = 1330;
  ctx.font = `700 ${size}px ${DISPLAY}`;
  ctx.letterSpacing = `${-0.035 * size}px`;
  ctx.textBaseline = 'alphabetic';
  const wa = ctx.measureText('almost ').width, wf = ctx.measureText('friends').width;
  const x0 = W / 2 - (wa + wf) / 2;
  ctx.textAlign = 'left';
  ctx.fillStyle = GREY; ctx.fillText('almost ', x0, y);
  ctx.fillStyle = INK; ctx.fillText('friends', x0 + wa, y);
  ctx.font = `500 ${44}px ${DISPLAY}`;
  ctx.letterSpacing = `${-0.01 * 44}px`;
  ctx.textAlign = 'center'; ctx.fillStyle = GREY2;
  ctx.fillText('Make friends outside your bubble.', W / 2, y + 96);
  ctx.letterSpacing = '0px';
}
// lines: each an array of strings and { g: 'word' } (drawn in the gradient); centred, tight
function headline(ctx, lines, { y, size, color, lh = 1.05, track = -0.035, weight = 700 }) {
  ctx.save();
  ctx.font = `${weight} ${size}px ${DISPLAY}`;
  ctx.letterSpacing = `${track * size}px`;
  ctx.textBaseline = 'alphabetic'; ctx.textAlign = 'left';
  lines.forEach((parts, i) => {
    const segs = parts.map((p) => (typeof p === 'string' ? { s: p } : { s: p.g, g: true }));
    const ws = segs.map((q) => ctx.measureText(q.s).width);
    let x = W / 2 - ws.reduce((a, b) => a + b, 0) / 2;
    const yy = y + i * size * lh;
    segs.forEach((q, k) => {
      if (q.g) {
        const g = ctx.createLinearGradient(x, 0, x + ws[k], 0);
        GRAD.forEach((c, j) => g.addColorStop(j / (GRAD.length - 1), c));
        ctx.fillStyle = g;
      } else ctx.fillStyle = color;
      ctx.fillText(q.s, x, yy);
      x += ws[k];
    });
  });
  ctx.restore();
}

// ── the phone's screen while Bub looks: the app in iOS's own type, its edge alight ─────────────────────────────────
function lookingScreen(ctx, t) {
  ctx.fillStyle = '#FFFFFF'; ctx.fillRect(0, 0, W, SH);
  statusBar(ctx, 0, 0, W, K, { ink: '#000', font: UIF });
  dynamicIsland(ctx, 0, 0, W, K);
  ctx.textAlign = 'center'; ctx.fillStyle = INK;
  ctx.font = `600 ${pt(17)}px ${UIF}`; ctx.fillText('Bub', W / 2, pt(112));
  ctx.font = `400 ${pt(13)}px ${UIF}`; ctx.fillStyle = GREY; ctx.fillText('Finding your people', W / 2, pt(132));
  // what you asked for: three quiet pills, each with its colour as a dot
  const vals = [['Family', '#FF6B5A'], ['Career', '#2F6BFF'], ['Adventure', '#FFA53D']];
  ctx.font = `500 ${pt(15)}px ${UIF}`;
  const ws = vals.map(([s]) => ctx.measureText(s).width + pt(40));
  let x = W / 2 - (ws.reduce((a, b) => a + b, 0) + pt(16)) / 2;
  const y = pt(560);
  vals.forEach(([s, c], i) => {
    ctx.fillStyle = '#F2F2F7'; ctx.fill(squirclePath(x, y, ws[i], pt(36), pt(18)));
    ctx.fillStyle = c; ctx.beginPath(); ctx.arc(x + pt(16), y + pt(18), pt(4.5), 0, TAU); ctx.fill();
    ctx.fillStyle = INK; ctx.textAlign = 'left'; ctx.fillText(s, x + pt(27), y + pt(23));
    x += ws[i] + pt(8);
  });
  ctx.textAlign = 'center';
  ctx.font = `700 ${pt(34)}px ${UID}`; ctx.fillStyle = INK; ctx.fillText('Looking…', W / 2, pt(470));
  ctx.font = `400 ${pt(16)}px ${UIF}`; ctx.fillStyle = GREY2; ctx.fillText('People who put the same things first', W / 2, pt(500));
  homeIndicator(ctx, 0, 0, W, SH, K, '#000');
  edgeGlow(ctx, t);
}
// the screen's edge alight (Apple Intelligence's grammar): the gradient runs round the border, soft inside, crisp at it
function edgeGlow(ctx, t) {
  const path = squirclePath(0, 0, W, SH, pt(55));
  ctx.save();
  ctx.clip(path);
  const g = ctx.createConicGradient(t * 1.4, W / 2, SH / 2);
  [...GRAD, GRAD[0]].forEach((c, i, a) => g.addColorStop(i / (a.length - 1), c));
  ctx.strokeStyle = g;
  ctx.filter = `blur(${Math.round(pt(14))}px)`; ctx.lineWidth = pt(40); ctx.globalAlpha = 0.85; ctx.stroke(path);
  ctx.filter = `blur(${Math.round(pt(3))}px)`; ctx.lineWidth = pt(9); ctx.globalAlpha = 1; ctx.stroke(path);
  ctx.restore();
}
