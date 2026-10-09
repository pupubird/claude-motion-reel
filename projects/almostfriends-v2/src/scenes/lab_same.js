// LAB · SAME!! (v2 prototype 3: the light hit; research/refs/07, 12, 02, 11). Look-dev on its own clock from 0:
// render with --scenes=lab_same. The released chat (ui/convo.js) runs to "WAIT. Same!!"; the lens pushes in on it.
// Then half a beat of nothing: the world drains to grey, the phone dims round the message and a single light runs
// round its edge. On the beat: two crossed beams fire from it, a ring of air runs out bending the frame, the colour
// splits and floods back, the lens is thrown back, and SAME!! slams down behind the phone as architecture — huge, in
// the phone's world (it parallaxes as the lens swings round), the phone standing in front of it. Jelly droplets of
// your colours burst out past the lens.
import * as THREE from 'three';
import { W, H, SH } from '../config.js';
import { C, FONTS, P, MOVE } from '../brand.js';
import { T } from '../copy.js';
import { CHAT } from '../score.js';
import { clamp, lerp, seg, ease, spring, smoothstep, TAU, rng, mixHex, rgba } from '../util.js';
import { system as systemUI, SCREEN_SCALE } from '../ui/phone.js';
import { phoneCamera } from '../ui/phonecam.js';
import { conversation, threadTargets } from '../ui/convo.js';
import { phone3d, toWorld } from '../gl/phone3d.js';
import { sign } from '../gl/sign.js';
import { squirclePath } from '../ui/kit.js';
import { K } from '../ui/app.js';

const pt = (v) => v * K;
export const DUR = 4.0;
const HIT = 1.5;                                     // the downbeat
const STRIP = 1.0;                                   // the half beat of nothing before it
const SEND = 0.5;                                    // "WAIT. Same!!" goes
const VIEW = { viewBottom: pt(430) };
const film = (t) => CHAT.same - SEND + Math.min(t, SEND + 0.7);   // the released chat's clock (held before its burst)

let PSCENE, PH, CAM, CAM2, BIG, MSG;
const _v = new THREE.Vector3();

// a framing (ui/phonecam.js's shot): screen point (fx, fy) on frame (ax, ay), zoom z, seen from yaw / pitch / roll°
const shot = (z, fx, fy, yaw = 0, pitch = 0, roll = 0, ax = W / 2, ay = 960) => {
  const sc = SCREEN_SCALE * z;
  return { cx: ax - fx * sc + (W * sc) / 2, top: ay - fy * sc, s: z, yaw: yaw * Math.PI / 180, pitch: pitch * Math.PI / 180, roll: roll * Math.PI / 180 };
};
const lerpPose = (a, b, u) => Object.fromEntries(Object.keys(a).map((k) => [k, lerp(a[k], b[k], u)]));

// the giant word: its canvas (design px) and where it stands in the phone's world (behind it, a little high)
const BIGW = 2400, BIGH = 820, BIG_AT = { x: 0, y: 1.36, z: -0.5, w: 1.72 };

export default {
  init(env) {
    PSCENE = new THREE.Scene();
    PSCENE.add(env.makeBackdrop());
    PH = phone3d(env);
    PSCENE.add(PH.group);
    CAM = new THREE.PerspectiveCamera();
    CAM2 = new THREE.PerspectiveCamera();
    BIG = sign({ w: BIGW, h: BIGH, q: 1 });
    MSG = threadTargets(VIEW).find((m) => m.at === CHAT.same);
  },

  three: {
    start: 0, end: DUR,
    update(t) {
      const pose = poseAt(t);
      phoneCamera(pose, CAM, H);
      PH.draw((c) => { screen(c, t); systemUI(c); }, clamp(SCREEN_SCALE * pose.s * 1.25, 0.6, 2.2));
      bigWord(t);
      return { scene: PSCENE, camera: CAM, bloom: { strength: 0 } };
    },
  },

  liquid: { start: HIT, end: DUR, frame: droplets },

  fx(t) {
    const k = t - HIT;
    // the world: drained to a cool grey for the half beat, then the colour floods back richer than before
    const drain = seg(t, STRIP, STRIP + 0.12, ease.outCubic) * (k < 0 ? 1 : 0);
    const flood = k >= 0 ? Math.exp(-k * 1.4) : 0;
    const base = ['#DDEEFF', '#FFE6D8', '#FFD9EC', '#D6F4EC'], grey = ['#F6F7FA', '#F8F8FA', '#F7F7F9', '#F6F8F9'], rich = ['#C9E2FF', '#FFD3BD', '#FFC2E0', '#BFEFE2'];
    const colors = base.map((c, i) => mixHex(mixHex(c, grey[i], drain), rich[i], flood * 0.9));
    const fx = { field: { colors, flow: 1 + 3 * flood, silk: 1 }, shutter: 0.6 };
    if (k < -0.02 || k > 0.9) return fx;
    // the hit, at the message as the lens sees it
    const [hx, hy] = msgOnFrame(t);
    fx.beam = { x: hx, y: hy, gain: 1.1 * Math.exp(-Math.max(0, k) * 5.5), len: 1.6, ang: 0.42, color: '#FFF1DE' };
    fx.flash = 0.32 * Math.exp(-Math.max(0, k) * 22);
    fx.flashColor = '#FFFFFF';
    fx.chroma = 0.018 * Math.exp(-Math.max(0, k) * 16);
    fx.chromaAt = [hx, hy];
    fx.shock = { x: hx, y: hy, r: 60 + 2100 * ease.outCubic(clamp(k / 0.7)), k: 46 * (1 - clamp(k / 0.7)), w: 110 };
    // a punch on the lens: a kick that dies in a few frames, and a longer shutter so the throw back is one streak
    fx.sx = 0.006 * Math.exp(-Math.max(0, k) * 12) * Math.sin(k * 90);
    fx.sy = 0.004 * Math.exp(-Math.max(0, k) * 12) * Math.cos(k * 77);
    fx.shutter = 1.0;
    fx.samples = 24;
    return fx;
  },
};

// ── the camera: push in on the message, hold still through the half beat, thrown back on the hit, a slow swing round
// the phone so the word behind it shows how far back it stands ─────────────────────────────────────────────────────
function keys() {
  const mx = MSG.x + MSG.w / 2, my = MSG.y + MSG.h / 2;
  return [
    [0, 0, ease.linear, shot(1.75, W / 2 + 60, my - 140, 11, 6, 1.5)],
    [0, SEND + 0.55, MOVE.go, shot(2.45, mx - 70, my, 5, 4, 0)],
    [STRIP, HIT - STRIP, ease.inSine, shot(2.6, mx - 74, my, 4, 4, 0)],
    [HIT, 0.32, MOVE.go, shot(0.96, W / 2, SH * 0.36, -15, 5, -4, W / 2, 1240)],
    [HIT + 0.32, DUR - HIT - 0.32, ease.inOutSine, shot(1.02, W / 2, SH * 0.36, 13, 2, 1.5, W / 2, 1240)],
  ];
}
let KEYS = null;
function poseAt(t) {
  KEYS ??= keys();
  let pose = KEYS[0][3];
  for (const [t0, dur, curve, to] of KEYS) {
    if (t < t0) break;
    pose = lerpPose(pose, to, dur > 0 ? curve(clamp((t - t0) / dur)) : 1);
  }
  return pose;
}
// the message's centre on the frame at t (for the hit's light and its ring)
function msgOnFrame(t) {
  phoneCamera(poseAt(t), CAM2, H);
  _v.set(...toWorld(MSG.x + MSG.w / 2, MSG.y + MSG.h / 2, 0)).project(CAM2);
  return [(_v.x + 1) / 2 * W, (1 - _v.y) / 2 * H];
}

// ── the screen: the released chat; for the half beat a veil over all of it but the message, and a light on its edge
function screen(ctx, t) {
  conversation(ctx, film(t), VIEW);
  const veil = seg(t, STRIP, STRIP + 0.1) * (t < HIT ? 1 : 0);
  if (veil <= 0) return;
  const pad = pt(10), x = MSG.x - pad, y = MSG.y - pad, w = MSG.w + 2 * pad, h = MSG.h + 2 * pad;
  ctx.save();
  // the veil, with the message cut out of it (even-odd)
  const p = new Path2D();
  p.rect(0, 0, W, SH);
  p.addPath(squirclePath(x, y, w, h, h / 2));
  ctx.fillStyle = rgba('#F4F6FB', 0.78 * veil);
  ctx.fill(p, 'evenodd');
  // one light runs round the message's edge: a comet with a tail, a white core in a blue glow
  const u = seg(t, STRIP + 0.04, HIT, ease.inOutSine);
  const path = squirclePath(MSG.x - pt(3), MSG.y - pt(3), MSG.w + pt(6), MSG.h + pt(6), (MSG.h + pt(6)) / 2);
  const per = 2 * (MSG.w + MSG.h);
  for (const [lw, col, blur, len] of [[pt(7), rgba('#7FA4FF', 0.55), pt(14), 0.36], [pt(2.6), '#FFFFFF', pt(4), 0.22]]) {
    ctx.save();
    ctx.lineWidth = lw; ctx.lineCap = 'round'; ctx.strokeStyle = col;
    ctx.shadowColor = rgba('#9DB8FF', 0.9); ctx.shadowBlur = blur;
    ctx.setLineDash([per * len, per * (1 - len)]);
    ctx.lineDashOffset = -per * (u * 1.25);
    ctx.globalAlpha *= veil * (1 - 0.3 * seg(t, HIT - 0.05, HIT));
    ctx.stroke(path);
    ctx.restore();
  }
  ctx.restore();
}

// ── SAME!! as architecture: a sign in the phone's world, behind it ──────────────────────────────────────────────────
function bigWord(t) {
  const k = t - HIT;
  if (k < 0) { BIG.hide(PSCENE); return; }
  // it slams down from big and overshoots a little under its size
  const s = 1 + 0.75 * (1 - spring(k, { stiffness: 900, damping: 0.5 }));
  BIG.draw((g) => {
    g.save();
    g.translate(BIGW / 2, BIGH / 2);
    g.scale(s, s);
    g.font = `800 ${Math.round(BIGH * 0.92)}px ${FONTS.display}`;
    g.letterSpacing = `${Math.round(-BIGH * 0.035)}px`;
    g.textAlign = 'center'; g.textBaseline = 'middle';
    const word = T.same.text;
    // the ink: brand blue, lit from above
    const grad = g.createLinearGradient(0, -BIGH * 0.45, 0, BIGH * 0.45);
    grad.addColorStop(0, '#5B86FF'); grad.addColorStop(0.45, C.blue); grad.addColorStop(1, '#1236B8');
    g.fillStyle = grad;
    g.fillText(word, 0, BIGH * 0.04);
    // light on it: a soft gloss along the top, and a band of light that sweeps across the letters after the hit
    g.globalCompositeOperation = 'source-atop';
    const gl = g.createLinearGradient(0, -BIGH * 0.45, 0, 0);
    gl.addColorStop(0, 'rgba(255,255,255,0.32)'); gl.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = gl; g.fillRect(-BIGW, -BIGH, BIGW * 2, BIGH);
    const sw = seg(t, HIT + 0.95, HIT + 1.75, ease.inOutSine);
    if (sw > 0 && sw < 1) {
      const sx = lerp(-BIGW * 0.75, BIGW * 0.75, sw);
      const band = g.createLinearGradient(sx - 260, 0, sx + 260, 0);
      band.addColorStop(0, 'rgba(255,255,255,0)'); band.addColorStop(0.5, 'rgba(255,255,255,0.75)'); band.addColorStop(1, 'rgba(255,255,255,0)');
      g.save(); g.transform(1, 0, -0.35, 1, 0, 0); g.fillStyle = band; g.fillRect(-BIGW, -BIGH, BIGW * 2, BIGH * 2); g.restore();
    }
    g.restore();
  });
  const wpp = BIG_AT.w / BIGW;
  BIG.place(PSCENE, { pos: new THREE.Vector3(BIG_AT.x, BIG_AT.y, BIG_AT.z), quat: new THREE.Quaternion(), wpp }, { order: -5, alpha: 1, blur: 1.2 * seg(k, 0.25, 0.8) });
}

// ── the droplets: your colours burst out of the message past the lens, slow in the air, and pop ──────────────────
const DROPS = (() => {
  const R = rng(1500), cols = [C.blue, P.career.color, P.family.color, P.adventure.color, '#FFFFFF'];
  return Array.from({ length: 14 }, (_, i) => {
    const a = R() * TAU, up = 0.45 + R() * 0.55;
    const dir = [Math.cos(a) * (1 - up * 0.5), Math.sin(a) * (1 - up * 0.5) * 0.85, up];
    const L = Math.hypot(...dir);
    return { dir: dir.map((c) => c / L), v: 3.2 + R() * 4.2, r: 0.025 + R() * 0.045, col: cols[i % cols.length], life: 0.45 + R() * 0.5, seed: R() * 10 };
  });
})();
function droplets(t) {
  const k = t - HIT;
  if (k < 0) return null;
  const o = toWorld(MSG.x + MSG.w / 2, MSG.y + MSG.h / 2, pt(8));
  const prims = [];
  DROPS.forEach((d, i) => {
    if (k > d.life) return;
    const go = (1 - Math.exp(-k * 2.4)) / 2.4;                        // drag: fast out, slowing in the air
    const pos = [o[0] + d.dir[0] * d.v * go, o[1] + d.dir[1] * d.v * go - 0.12 * k * k, o[2] + d.dir[2] * d.v * go];
    const pop = smoothstep(d.life - 0.18, d.life, k);
    const r = d.r * Math.min(1, k / 0.06) * (1 - pop);
    if (r < 0.002) return;
    const white = d.col === '#FFFFFF';
    prims.push({
      type: 'sphere', pos, size: [r], group: 30 + i, wobble: 0.03,
      // clear glass beads of your colours (water, not candy): the light through them takes their colour
      glass: 1, refr: 0.06, frost: 0, haze: white ? 0.05 : 0.02, tint: white ? '#FFFFFF' : d.col, tintAmt: white ? 0 : 0.75,
      fill: white ? 0 : 0.35, edge: 0.6, env: 1.15, spec: 1.3,
      seed: d.seed,
    });
  });
  return { prims, cam: CAM, useDepth: true, env: { skyTop: '#EAF4FF', skyHor: '#FFF0E6', skyLow: '#B9B3C4', keyDir: [-0.55, 0.62, 0.58], keyGain: 4.5 } };
}
