// III · VALUES (6–10 s). Bub is the interface. On the drop its eyes open; a droplet pulls out of its crown on a neck,
// pinches off and flattens into a Liquid Glass pill that asks "What matters to you?". Six drops fall from Bub's
// underside and land as six glass chips, one colour each. A finger taps three on the beat: each chip presses, lifts,
// rounds back into a droplet and flies home into Bub, whose film takes its colour like ink in water. The other three
// burst. Bub glows with your three colours and a ring of glass gathers round it — the crowd is next.
import { TL } from '../timeline.js';
import { C, FONTS, SPRING, P, PKEYS, PICKS } from '../brand.js';
import { clamp, lerp, seg, spring, springVel, ease as E, rng } from '../util.js';
import { project } from '../proj.js';
import { keyed, hand } from '../camera.js';
import { BUB_AT_DROP } from './hook.js';
import { measure } from '../type.js';
import { touch } from '../ui/touch.js';

const V = TL.values;
export const BUB = BUB_AT_DROP;
const PILL = [0, 0.42, 0.25];
const PILL_SIZE = [1.42, 0.3, 0.13];
const ROWS = [-3.3, -4.16], XS = [-1.27, 0, 1.27];
const CHIP = [0.6, 0.215, 0.1];
// six chips: row 1 family, career, wealth; row 2 health, learning, adventure
export const CHIPS = PKEYS.map((key, i) => ({ key, slot: [XS[i % 3], ROWS[Math.floor(i / 3)], 0.15], born: V.split + i * 0.045, ang: -Math.PI * (0.83 - 0.66 * (i % 3) / 2) - (Math.floor(i / 3) ? 0.05 : -0.05) }));
const tapOf = (key) => { const i = PICKS.indexOf(key); return i < 0 ? null : V.taps[i]; };

const lerp3 = (a, b, u) => [lerp(a[0], b[0], u), lerp(a[1], b[1], u), lerp(a[2], b[2], u)];
const bez = (a, c, b, u) => lerp3(lerp3(a, c, u), lerp3(c, b, u), u);

// Bub during the act: the "hi" bounce, a gulp at each merge, colours filling in
export function bubValues(t) {
  const dropP = spring(t - V.hi, SPRING.pop), dropV = springVel(t - V.hi, SPRING.pop);
  let squash = clamp(-dropV * 0.02, -0.16, 0.16);
  let r = lerp(0.82, 1.0, dropP);
  let y = lerp(-1.8, BUB[1], dropP);
  const merges = V.taps.map((tp) => tp + V.fly + V.flyDur);
  for (const m of merges) { if (t >= m) { const v = springVel(t - m, SPRING.wobble); squash += clamp(v * 0.016, -0.09, 0.09); } }
  // the extrusion pulls Bub up a little; the drops leave it a little lighter
  squash += 0.06 * Math.sin(Math.PI * seg(t, V.extrude, V.pinch + 0.1));
  const nIn = merges.filter((m) => t >= m).length;
  const fillP = (i) => spring(t - merges[i], SPRING.settle);
  const fill = nIn === 0 ? 0 : 0.2 + 0.11 * (nIn - 1) + 0.06 * fillP(nIn - 1);
  const cols = PICKS.slice(0, Math.max(1, nIn)).map((k) => P[k].color);
  const happy = (t > V.hi + 0.05 && t < V.hi + 0.55) || merges.some((m) => t > m && t < m + 0.42) || t > V.drop + 0.1;
  const look = t < V.split ? [0, 0.35 * seg(t, V.extrude, V.pinch)] : t < V.taps[0] - 0.3 ? [0, -0.5 * seg(t, V.split, V.split + 0.3)] : [0, -0.2];
  return {
    pos: [BUB[0], y, BUB[2]], r, squash, k: 0.5, happy: happy ? 1 : 0, wide: t < V.hi + 0.6 ? 0.4 : 0.1,
    look, fill, c1: cols[0], c2: cols[1], c3: cols[2], glow: 0.35 + 0.3 * seg(t, V.ring, V.ring + 0.4), blink: blinkAt(t),
  };
}
const blinkAt = (t) => { for (const b of [7.15, 9.62]) { const d = Math.abs(t - b); if (d < 0.07) return 1 - d / 0.07; } return 0; };

export const valuesCam = (t) => {
  const keys = [
    { t: 6.0, pos: [0, -1.25, 7.4], target: [0, -1.5, 0], fov: 35 },
    { t: 6.2, pos: [0, -1.25, 7.4], target: [0, -1.5, 0], fov: 35 },
    { t: 6.75, pos: [0, -0.85, 9.8], target: [0, -0.8, 0], fov: 35, ease: E.inOutCubic },
    { t: 7.95, pos: [0, -1.86, 11.3], target: [0, -1.86, 0], fov: 35, ease: E.inOutCubic },
    { t: 9.45, pos: [0, -1.86, 11.1], target: [0, -1.86, 0], fov: 35, ease: E.inOutSine },
    { t: 9.98, pos: [0, -1.62, 9.3], target: [0, -1.62, 0], fov: 35, ease: E.inCubic },
  ];
  return hand(keyed(keys, t), t, seg(t, 6.3, 6.8), 0.004);
};
export const VALUES_HITS = [[V.hi, 14, 0.12], ...V.taps.map((tp) => [tp + V.fly + V.flyDur, 5, 0.08])];

export function valuesFrame(t, st, env) {
  const bub = bubValues(t);
  // ── the question: a droplet out of Bub's crown, pinched off, flattened into glass ──
  if (t >= V.extrude && t < 9.95) {
    const u = seg(t, V.extrude, V.pinch + 0.12, E.outCubic);
    const crown = [bub.pos[0], bub.pos[1] + bub.r * 0.55, 0];
    const pos = lerp3(crown, PILL, u);
    const r0 = lerp(0.3, 0.42, u);
    const m = spring(t - V.pinch, SPRING.jelly);
    const size = t < V.pinch ? [r0, r0, r0] : lerp3([0.42, 0.42, 0.42], PILL_SIZE, m);
    const round = t < V.pinch ? r0 : lerp(0.42, PILL_SIZE[1], clamp(m));
    const glass = seg(t, V.pinch, V.pinch + 0.25);
    const out = seg(t, 9.7, 9.95, E.inBack);
    st.prims.push({ type: 'box', pos, size: size.map((v) => v * (1 - out)), round: round * (1 - out), group: 1, k: 0.5, glass,
      tint: '#FFFFFF', tintAmt: 0.06, frost: 0.7, refr: 0.06, spec: 1.0, edge: 0.8, thick: 430, haze: glass > 0.5 ? 0.42 : 0.2, rim: 2.0, env: 1.3, seed: 5, shadow: glass });
    // the words, typed onto the glass
    if (t >= V.typeFrom) st.over.push((g) => {
      const [x, y, k] = project(env, [PILL[0], PILL[1], PILL[2] + PILL_SIZE[2]]);
      const q = 'What matters to you?';
      const n = Math.min(q.length, Math.floor((t - V.typeFrom) * 34));
      const s = 0.19 * k;
      g.save(); g.globalAlpha = 1 - out;
      g.font = `640 ${s}px ${FONTS.ui}`; g.fillStyle = C.ink; g.textBaseline = 'middle';
      const w = g.measureText(q).width;
      g.fillText(q.slice(0, n), x - w / 2, y + s * 0.04);
      if (n < q.length || (t * 2.2) % 1 < 0.55) { g.fillStyle = C.blue; g.fillRect(x - w / 2 + g.measureText(q.slice(0, n)).width + 3, y - s * 0.42, Math.max(2, s * 0.06), s * 0.84); }
      g.restore();
      if (globalThis.__textlog && n === q.length) globalThis.__textlog.push({ s: q, a: 1 - out });
    });
  }

  // ── the six chips ──
  for (const c of CHIPS) {
    if (t < c.born) continue;
    const pc = P[c.key];
    const tap = tapOf(c.key);
    // spat out of Bub's side toward its slot: a quick neck, a pinch, an arc, a jelly landing
    const dx = c.slot[0] - bub.pos[0], dy = c.slot[1] - bub.pos[1], dl = Math.hypot(dx, dy);
    const dir = [dx / dl, dy / dl, 0];
    const emerge = seg(t, c.born, c.born + 0.13, E.outCubic);
    const fall = seg(t, c.born + 0.1, c.born + 0.48, E.inOutCubic);
    const start = [bub.pos[0] + dir[0] * bub.r * 0.55, bub.pos[1] + dir[1] * bub.r * 0.55, 0.1];
    const mid = [bub.pos[0] + dir[0] * (bub.r + 0.42), bub.pos[1] + dir[1] * (bub.r + 0.42), 0.25];
    const ctrl = [mid[0] + dir[0] * 0.5, mid[1] + 0.25, 0.4];
    let pos = fall <= 0 ? lerp3(start, mid, emerge) : bez(mid, ctrl, c.slot, fall);
    const land = spring(t - (c.born + 0.48), SPRING.jelly);
    const landV = springVel(t - (c.born + 0.48), SPRING.jelly);
    let size = fall < 1 ? [0.21, 0.21, 0.21] : lerp3([0.24, 0.24, 0.24], CHIP, land);
    let round = fall < 1 ? 0.21 : lerp(0.24, CHIP[1], clamp(land));
    let glass = seg(t, c.born + 0.25, c.born + 0.55);
    let fill = 0.5, alpha = 1, group = fall < 0.12 ? 1 : 200 + PKEYS.indexOf(c.key), scale = [1, 1, 1];
    if (fall >= 1) { const sq = clamp(landV * 0.02, -0.25, 0.25); scale = [1 + sq * 0.5, 1 - sq, 1]; }
    // idle: a slow bob, out of phase
    pos = [pos[0], pos[1] + 0.025 * Math.sin(t * 2.4 + c.slot[0] * 2) * seg(t, c.born + 0.6, c.born + 1), pos[2]];
    if (tap !== null && t >= tap - 0.02) {
      // pressed, lifted, rounded back into a droplet, flown home
      const press = Math.sin(Math.PI * seg(t, tap - 0.02, tap + 0.12));
      scale = [1 - 0.08 * press, 1 - 0.14 * press, 1];
      fill = lerp(0.5, 0.92, seg(t, tap, tap + 0.1));
      const f = seg(t, tap + V.fly, tap + V.fly + V.flyDur, E.inOutCubic);
      if (f > 0) {
        const home = [bub.pos[0], bub.pos[1] - 0.15, 0];
        const ctl = [lerp(c.slot[0], home[0], 0.25) + (c.slot[0] > 0 ? 0.6 : -0.6), Math.max(c.slot[1], home[1]) + 0.9, 0.6];
        pos = bez(c.slot, ctl, home, f);
        const r = lerp(0.24, 0.3, f);
        const m = seg(f, 0, 0.45, E.outCubic);
        size = lerp3(CHIP, [r, r, r], m); round = lerp(CHIP[1], r, m);
        glass = 1 - seg(f, 0.2, 0.7);
        group = f > 0.55 ? 1 : group;
        alpha = 1 - seg(f, 0.94, 1);
      }
    } else if (tap === null && t >= V.drop) {
      // not picked: a burst
      const b = seg(t, V.drop + PKEYS.indexOf(c.key) * 0.05, V.drop + PKEYS.indexOf(c.key) * 0.05 + 0.09);
      if (b >= 1) continue;
      scale = scale.map((v) => v * (1 + 0.22 * Math.sin(Math.PI * Math.min(1, b * 1.6))) * (b > 0.55 ? 1 - (b - 0.55) / 0.45 : 1));
    }
    if (alpha <= 0.001) continue;
    st.prims.push({ type: 'box', pos, size, round, scale, group, k: 0.5, glass, tint: pc.color, fill, tintAmt: 0.55, frost: 0.6, refr: 0.055,
      spec: 1.0, edge: 0.7, glow: 0.3, thick: 400, haze: glass > 0.5 ? 0.12 : 0.18, rim: 1.8, env: 1.3, alpha, seed: PKEYS.indexOf(c.key) * 2.1, shadow: glass * alpha });
    // its label, once it is a chip
    const labelA = seg(t, c.born + 0.46, c.born + 0.64) * (tap !== null ? 1 - seg(t, tap + V.fly, tap + V.fly + 0.12) : 1 - seg(t, V.drop + PKEYS.indexOf(c.key) * 0.05, V.drop + PKEYS.indexOf(c.key) * 0.05 + 0.06));
    if (labelA > 0.01) st.over.push((g) => {
      const [x, y, k] = project(env, [pos[0], pos[1], pos[2] + CHIP[2]]);
      const s = 0.155 * k;
      const lbl = pc.label;
      g.save(); g.globalAlpha = labelA;
      g.textBaseline = 'middle';
      g.font = `${s * 1.05}px ${FONTS.ui}`;
      const ew = g.measureText(pc.emoji).width;
      g.font = `680 ${s}px ${FONTS.ui}`;
      const lw = g.measureText(lbl).width;
      const gap = s * 0.35, x0 = x - (ew + gap + lw) / 2;
      g.translate(x, y); g.scale(scale[0], scale[1]); g.translate(-x, -y);
      g.font = `${s * 1.05}px ${FONTS.ui}`; g.fillText(pc.emoji, x0, y + s * 0.05);
      g.font = `680 ${s}px ${FONTS.ui}`; g.fillStyle = C.ink; g.fillText(lbl, x0 + ew + gap, y + s * 0.05);
      g.restore();
      if (globalThis.__textlog) globalThis.__textlog.push({ s: lbl, a: labelA });
    });
    // tiny drops from a burst
    if (tap === null && t >= V.drop) {
      const t0 = V.drop + PKEYS.indexOf(c.key) * 0.05 + 0.06, dt = t - t0;
      if (dt > 0 && dt < 0.9) for (let j = 0; j < 4; j++) {
        const a = j * 1.57 + PKEYS.indexOf(c.key);
        st.prims.push({ type: 'sphere', pos: [c.slot[0] + Math.cos(a) * (0.3 + dt * 1.2), c.slot[1] + Math.sin(a) * (0.2 + dt * 0.8) - dt * dt * 1.5, 0.15], size: [0.05 * (1 - dt / 0.9)], thick: 380, seed: j + a, rim: 1.4 });
      }
    }
    // the finger
    if (tap !== null) st.over.push((g) => touch(g, t, tap, project(env, [c.slot[0] + 0.12, c.slot[1] - 0.04, c.slot[2] + 0.1])));
  }

  // ── the ring: Bub gathers itself before the whip ──
  if (t >= V.ring) {
    const u = spring(t - V.ring, SPRING.settle);
    st.prims.push({ type: 'torus', pos: bub.pos, size: [lerp(bub.r * 0.9, bub.r * 1.32, u), 0.028], quat: [0.7071, 0, 0, 0.7071], glass: 1, tint: '#FFFFFF',
      tintAmt: 0.1, edge: 0.9, spec: 1.2, frost: 0.2, refr: 0.04, alpha: seg(t, V.ring, V.ring + 0.12), group: 300 });
  }
  st.fx.bloom = { strength: 0.3, radius: 0.55, threshold: 1.0 };
}
