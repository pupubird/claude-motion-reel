// VII · FRIENDS (28–44 s). The wall is gone and the two are one bubble — and inside it, for the first time, faces:
// Hana and Sofia, opened by an iris of light. "You're both in!" The camera cranes back and up and the sky fills
// with friends rising, two faces to a bubble, at three depths, with air round every one. "Same values. / New
// friends." Then every bubble streams to the centre and merges, and the merged mass splits into the brand's mark —
// a blue bubble and a coral one sharing a wall — on the 38.0 hit. The name drops in; Bub peeks out and winks on the
// music's last hit; a light crosses the name; the frame holds dead still to the end.
import * as THREE from 'three';
import { TL } from '../timeline.js';
import { C, FONTS, SPRING } from '../brand.js';
import { W, H } from '../config.js';
import { clamp, lerp, seg, spring, springVel, ease as E, rng } from '../util.js';
import { project } from '../proj.js';
import { keyed, hand } from '../camera.js';
import { Line, drawLine, popEach } from '../type.js';
import { daySky, glow, rays } from '../sky.js';
import { drawPhoto, LEADS, NAMES, CROWD } from '../assets.js';
import { THEIRS, YOURS, chatGround } from './chat.js';

const F = TL.friends, POP = TL.unlock.pop;
const lerp3 = (a, b, u) => [lerp(a[0], b[0], u), lerp(a[1], b[1], u), lerp(a[2], b[2], u)];
const sub3 = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]], add3 = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]], mul3 = (a, k) => [a[0] * k, a[1] * k, a[2] * k];
const norm3 = (a) => mul3(a, 1 / (Math.hypot(...a) || 1));
const quatToCam = (fwd) => { const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), new THREE.Vector3(-fwd[0], -fwd[1], -fwd[2])); return [q.x, q.y, q.z, q.w]; };
const BR = 0.9, RM = BR * Math.cbrt(2);
const CENTER = [0, 0.45, 0];
const MARK_C = [0, 1.25, 0], MR = 1.0;

// the merged bubble across the act: it rises a little as the foam comes, then joins the gather
function merged(t) {
  const m = spring(t - POP - 0.06, SPRING.jelly), v = springVel(t - POP - 0.06, SPRING.jelly);
  const sq = clamp(v * 0.02, -0.25, 0.25);
  const rise = E.inOutCubic(seg(t, F.rise, F.rise + 2.2));
  const pos = lerp3(CENTER, [0, 1.15, 0], rise);
  return { pos, r: lerp(BR, RM, clamp(m)), sq, m };
}

// friends: two faces to a bubble, around the frame at three depths
const R1 = rng(77);
const SLOTS = [[-3.0, 3.6, -2.5], [2.9, 4.2, -3.5], [-3.6, -0.6, -1.0], [3.4, 0.4, -0.5], [-1.6, -3.4, 0.5], [1.8, -3.0, -1.5], [0.2, 5.6, -6.0],
  [-4.6, 2.0, -6.5], [4.8, 2.6, -7.0], [-2.2, 7.0, -9.0], [3.0, 7.4, -10.0], [-5.4, -3.6, -6.0], [5.6, -2.8, -8.0], [0.6, -5.4, -4.0]];
const FOAM = SLOTS.map((p, i) => ({
  pos: p, r: 0.84 + R1() * 0.3, born: F.rise + 0.25 + i * 0.11, ph: R1() * 6, a: CROWD[(i * 2) % CROWD.length], b: CROWD[(i * 2 + 1) % CROWD.length],
  tint: ['#FF7A59', '#1D4FF0', '#FFB224', '#FF6FAE', '#17B890', '#1FB5E5'][i % 6], seed: i * 1.7 + 0.3, gd: 0.07 * (i % 7),
}));
const GATHER = F.gather;

export const friendsCam = (t) => {
  const keys = [
    { t: POP, pos: [0, 0.5, 9.15], target: [0, 0.48, 0], fov: 35 },
    { t: F.rise, pos: [0, 0.5, 8.1], target: [0, 0.48, 0], fov: 35, ease: E.inOutSine },
    { t: F.rise + 2.6, pos: [0, 2.2, 21.5], target: [0, 1.5, -2], fov: 36, ease: E.inOutCubic },
    { t: GATHER[0], pos: [0.4, 2.4, 23.0], target: [0, 1.6, -2], fov: 36, ease: E.inOutSine },
    { t: GATHER[1], pos: [0, 1.0, 13.0], target: [0, 0.75, 0], fov: 35, ease: E.inOutCubic },
    { t: F.mark + 0.6, pos: [0, 0.75, 12.0], target: [0, 0.6, 0], fov: 35, ease: E.outCubic },
    { t: F.stop, pos: [0, 0.75, 11.8], target: [0, 0.6, 0], fov: 35, ease: E.inOutSine },
  ];
  return hand(keyed(keys, t), t, seg(t, F.rise, F.rise + 0.6) * (1 - seg(t, GATHER[1] - 0.4, GATHER[1])), 0.004);
};
export const FRIENDS_HITS = [[POP, 26, 0.16, 22], [F.both, 6, 0.1], [F.mark, 20, 0.14], [F.stop, 8, 0.12]];

const BOTH = new Line('You’re both in!', { s: 124, w: 800, track: -0.03 });
const L1 = new Line('Same values.', { s: 112, w: 800, track: -0.03 });
const L2 = new Line('New friends.', { s: 112, w: 800, track: -0.03 });
const NAME_A = new Line('almost', { s: 150, w: 640, track: -0.02 });
const NAME_F = new Line('friends.ai', { s: 150, w: 800, track: -0.035 });
const TAG = new Line('Make friends outside your bubble.', { s: 50, w: 640, f: FONTS.ui, track: -0.005 });

export function bubEnd(t) {
  if (t < 39.35) return null;
  const peek = E.outBack(seg(t, 39.35, 39.85));
  const wink = t > F.stop - 0.05 && t < F.stop + 0.35;
  return { pos: [MARK_C[0] + 1.62, MARK_C[1] + 0.95 - (1 - peek) * 0.6, -0.6], r: 0.42 * peek + 0.001, happy: wink ? 1 : 0, look: [-0.6, -0.2], blush: 0.9, k: 0.1, squash: 0 };
}

export function friendsFrame(t, st, env) {
  // the day again, brighter than before
  st.under.push((g) => {
    const [x, y] = project(env, [0, 0, -60]);
    const f = E.outCubic(seg(t, POP, POP + 0.45));
    if (f < 1) {
      chatGround(g, t);
      const [cx, cy] = project(env, CENTER);
      g.save(); g.beginPath(); g.arc(cx, cy, f * 1650, 0, 6.283); g.clip();
    }
    daySky(g, t, { shift: [(x - 540) * 0.4, (y - 960) * 0.4], bubbles: 0.6, sun: 1.2 });
    rays(g, t, { a: 0.85 * (1 - seg(t, F.mark - 0.5, F.mark + 1.0)) });
    if (f < 1) g.restore();
  });
  st.bg = C.sky;
  const M = merged(t);
  const gat = (f) => seg(t, GATHER[0] + f.gd, GATHER[0] + f.gd + 1.35, E.inOutCubic);
  const split = seg(t, GATHER[1] - 0.25, F.mark, E.inOutCubic);

  // ── the merged bubble (and, in the gather, the mass every bubble joins) ──
  if (t >= POP + 0.55 && t < F.mark + 0.02) {
    const grow = seg(t, GATHER[0] + 0.3, GATHER[1] - 0.2);
    const pos = lerp3(M.pos, MARK_C, seg(t, GATHER[0], GATHER[1] - 0.3, E.inOutCubic));
    const r = lerp(M.r, MR * 1.5, grow) * (1 - 0.25 * split);
    for (const [sd, col] of [[-1, THEIRS], [1, YOURS]]) st.prims.push({ type: 'sphere', pos: [pos[0] + sd * MR * 0.5 * split, pos[1], 0], size: [r * lerp(1, MR / (MR * 1.5 * 0.75), split)],
      scale: [1 + M.sq * 0.5, 1 - M.sq, 1 + M.sq * 0.5], fill: lerp(0.1, 0.9, seg(t, GATHER[0] + 0.6, GATHER[1])), tint: col.c1, c2: col.c2, c3: col.c3, thick: 400, glow: 0.45,
      seed: sd > 0 ? 1.2 : 3.7, group: split > 0.6 ? 800 + sd : 800, k: lerp(1.4, 0.0, seg(split, 0.5, 0.9)), rim: 1.8, haze: 0.14, wobble: 0.012 });
  }
  // ── the mark: the two halves, one radius apart, the wall between them ──
  if (t >= F.mark) {
    const hit = t - F.mark;
    const wob = Math.sin(hit * 16) * Math.exp(-hit * 3.2);
    for (const [sd, col] of [[-1, THEIRS], [1, YOURS]]) st.prims.push({ type: 'sphere', pos: [MARK_C[0] + sd * MR * 0.5, MARK_C[1], 0], size: [MR],
      scale: [1 - 0.06 * wob, 1 + 0.08 * wob, 1 - 0.06 * wob], fill: 0.9, tint: col.c1, c2: col.c2, c3: col.c3, thick: 360, glow: 0.55, seed: sd > 0 ? 1.2 : 3.7, group: 810 + sd, rim: 1.7, haze: 0.1, wobble: 0.008 * Math.exp(-hit) });
    st.prims.push({ type: 'wall', pos: MARK_C, size: [MR * Math.sqrt(3) / 2 * (1 + 0.05 * wob)], quat: [0, 0.7071, 0, 0.7071], thick: 360, seed: 5.5, env: 1.6, rim: 1.0, group: 812 });
  }
  // ── the foam of friends ──
  for (const f of FOAM) {
    if (t < f.born) continue;
    const up = E.outCubic(seg(t, f.born, f.born + 1.25));
    let pos = [f.pos[0], lerp(f.pos[1] - 9, f.pos[1], up) + 0.08 * Math.sin(t * 1.6 + f.ph), f.pos[2]];
    let r = f.r, alpha = 1;
    const g = gat(f);
    if (g > 0) {
      const ctrl = [f.pos[0] * 0.4, f.pos[1] + 2.0, f.pos[2] * 0.5];
      const a = lerp3(pos, ctrl, g), b = lerp3(ctrl, MARK_C, g);
      pos = lerp3(a, b, g);
      r *= 1 - 0.45 * g;
      alpha = 1 - seg(g, 0.85, 1);
    }
    if (alpha <= 0.01) continue;
    st.prims.push({ type: 'sphere', pos, size: [r], fill: 0.08 + 0.5 * g, tint: f.tint, thick: 400, seed: f.seed, alpha, group: g > 0.55 ? 800 : 820 + FOAM.indexOf(f),
      k: g > 0.55 ? 1.1 : 0, rim: 1.8, haze: 0.16, wobble: 0.01 });
    // their faces, inside the film
    const faceA = (1 - seg(g, 0.2, 0.6)) * seg(t, f.born + 0.15, f.born + 0.5);
    if (faceA > 0.01) st.under.push((gg) => {
      const [x, y, k] = project(env, pos);
      const rr = r * k * 0.44;
      gg.save(); gg.globalAlpha = faceA;
      drawPhoto(gg, f.a, x - rr * 0.98, y + rr * 0.05, rr);
      drawPhoto(gg, f.b, x + rr * 0.98, y + rr * 0.05, rr);
      gg.restore();
    });
  }
  // ── Hana and Sofia, opened by an iris of light ──
  const reveal = spring(t - F.reveal, SPRING.settle);
  const revA = 1 - seg(t, F.rise + 1.6, F.rise + 2.4) * 0 - seg(t, GATHER[0] + 0.4, GATHER[0] + 1.0);
  if (t >= F.reveal && revA > 0.01) {
    st.under.push((g) => {
      const [x, y, k] = project(env, M.pos);
      const R = M.r * k;
      const rr = R * 0.4;
      // the light the faces come out of
      glow(g, x, y, R * 1.3 * clamp(reveal), '#ffffff', 0.5 * (1 - seg(t, F.reveal + 0.3, F.reveal + 1.2)));
      g.save(); g.globalAlpha = revA;
      for (const [sd, key] of [[-1, LEADS.you], [1, LEADS.one]]) {
        const p = spring(t - F.reveal - (sd > 0 ? 0.08 : 0), SPRING.pop);
        if (p < 0.06) continue;
        const cx = x + sd * R * 0.43, cy = y - R * 0.06;
        g.save(); g.beginPath(); g.arc(cx, cy, rr * 1.04 * clamp(p * 1.2), 0, 6.283); g.clip();
        drawPhoto(g, key, cx, cy, rr * Math.max(0.01, p), { clip: false });
        g.restore();
        // a white rim, as the app draws a profile
        g.save(); g.lineWidth = rr * 0.06; g.strokeStyle = 'rgba(255,255,255,0.95)';
        g.beginPath(); g.arc(cx, cy, rr * p, 0, 6.283); g.stroke(); g.restore();
      }
      g.restore();
    });
    st.over.push((g) => {
      const [x, y, k] = project(env, M.pos);
      const R = M.r * k, a = seg(t, F.reveal + 0.35, F.reveal + 0.6) * revA;
      g.save(); g.globalAlpha = a; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = C.ink;
      g.font = `720 ${R * 0.15}px ${FONTS.ui}`;
      g.fillText(NAMES[LEADS.you], x - R * 0.43, y + R * 0.52);
      g.fillText(NAMES[LEADS.one], x + R * 0.43, y + R * 0.52);
      g.restore();
      if (globalThis.__textlog) { globalThis.__textlog.push({ s: NAMES[LEADS.you], a }); globalThis.__textlog.push({ s: NAMES[LEADS.one], a }); }
    });
  }
  // ── the words ──
  st.under.push((g) => {
    const [x, y, k] = project(env, [0, 2.6, 0]);
    const out = seg(t, F.rise + 0.2, F.rise + 0.6);
    if (t >= F.both && out < 1) {
      const sc = Math.min(k / 253, 960 / BOTH.width);
      g.save(); g.translate(W / 2, Math.max(300, y)); g.scale(sc, sc);
      drawLine(g, BOTH, -BOTH.width / 2, 0, { fill: C.ink, each: popEach(BOTH, t, [F.both, F.both + 0.12, F.both + 0.24]), alpha: 1 - out });
      g.restore();
    }

    // the name
    if (t >= F.word) {
      const [nx, ny] = project(env, [0, MARK_C[1] - MR - 0.55, 0]);
      drawLine(g, NAME_A, nx - NAME_A.width / 2, ny + 40, { fill: C.inkSoft, each: popEach(NAME_A, t, [F.word]) });
      drawLine(g, NAME_F, nx - NAME_F.width / 2, ny + 180, { fill: C.ink, each: popEach(NAME_F, t, [F.word + 0.15]) });
      if (t >= 39.1) drawLine(g, TAG, nx - TAG.width / 2, ny + 290, { fill: 'rgba(11,27,63,0.75)', each: popEach(TAG, t, [39.1, 39.16, 39.22, 39.28, 39.34]) });
      // a light crosses the name on the last hit: the name drawn again in a moving band of white
      const sweep = seg(t, F.stop, F.stop + 0.9, E.inOutSine);
      if (sweep > 0 && sweep < 1) {
        const sx = lerp(nx - 520, nx + 520, sweep);
        const gr = g.createLinearGradient(sx - 140, 0, sx + 140, 0);
        gr.addColorStop(0, 'rgba(255,255,255,0)'); gr.addColorStop(0.5, 'rgba(255,255,255,0.9)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
        drawLine(g, NAME_A, nx - NAME_A.width / 2, ny + 40, { fill: gr, log: false });
        drawLine(g, NAME_F, nx - NAME_F.width / 2, ny + 180, { fill: gr, log: false });
      }
    }
  });
  // same values / new friends: on a frosted glass card held in front of the foam (the foam refracts through it)
  const la = seg(t, F.lines[0] - 0.2, F.lines[0]) * (1 - seg(t, GATHER[0] - 0.1, GATHER[0] + 0.3));
  if (la > 0.01) {
    const c = st.cam;
    const fwd = norm3(sub3(c.target, c.pos)), rt = norm3([-fwd[2], 0, fwd[0]]);
    const up = norm3([rt[1] * fwd[2] - rt[2] * fwd[1], rt[2] * fwd[0] - rt[0] * fwd[2], rt[0] * fwd[1] - rt[1] * fwd[0]]);
    const D = 7, hh = D * Math.tan((c.fov * Math.PI) / 360);
    const cp = add3(add3(c.pos, mul3(fwd, D)), mul3(up, hh * 0.56));
    const pop = spring(t - (F.lines[0] - 0.2), SPRING.pop);
    st.prims.push({ type: 'box', pos: cp, size: [hh * 0.46 * pop, hh * 0.19 * pop, 0.06], round: hh * 0.09 * pop, glass: 1, tint: '#FFFFFF', tintAmt: 0.05, haze: 0.42,
      frost: 1.0, refr: 0.07, edge: 0.85, spec: 1, alpha: la, group: 850, shadow: la, quat: quatToCam(fwd) });
    st.over.push((g) => {
      const [x, y, k] = project(env, cp);
      const sc = (hh * 0.8 * k) / Math.max(L1.width, L2.width) * pop;
      g.save(); g.translate(x, y); g.scale(sc, sc);
      drawLine(g, L1, -L1.width / 2, -18, { fill: C.ink, each: popEach(L1, t, [F.lines[0], F.lines[0] + 0.12]), alpha: la });
      if (t >= F.lines[1]) drawLine(g, L2, -L2.width / 2, 112, { fill: C.blue, each: popEach(L2, t, [F.lines[1], F.lines[1] + 0.12]), alpha: la });
      g.restore();
    });
  }
  st.fx.flash = Math.max(st.fx.flash, t >= F.mark ? 0.12 * Math.exp(-(t - F.mark) / 0.06) : 0);
  st.fx.bloom = { strength: 0.3, radius: 0.55, threshold: 1.0 };
}
