// V · THREE DAYS (15.85–22 s) and VI · THE BREATH (22–28 s). We come out of the dive inside the one's colours.
// Three hits — "No names." "No photos." "Just talk." — then the conversation: each message pulls out of the bottom
// of the frame as a droplet and settles into a Liquid Glass bubble, the thread lifting as it grows, while the days
// turn behind the glass (a warm day, a night where the glass glows, a gold morning). On the last message the thread
// drains into two bubbles: theirs (coral) and yours (blue).
// Ready to meet? You unlock (a padlock opens; your bubble rings gold). Then the wait — the music falls away, the
// light goes to dusk, the camera creeps toward them, Bub peeks up holding its breath, their bubble beats. They
// unlock. The two drift together and touch: a blue bubble and a coral one sharing one flat wall — the brand's own
// mark. The wall thins. On the 28.0 drop it bursts.
import * as THREE from 'three';
import { TL } from '../timeline.js';
import { C, FONTS, SPRING, P, PICKS } from '../brand.js';
import { W, H } from '../config.js';
import { clamp, lerp, seg, spring, springVel, ease as E, mixHex, rng } from '../util.js';
import { project } from '../proj.js';
import { keyed, hand } from '../camera.js';
import { Line, drawLine, popEach, wrap, setFont } from '../type.js';
import { glow } from '../sky.js';
import { touch } from '../ui/touch.js';
import { icon } from '../ui/icons.js';

const T5 = TL.chat, T6 = TL.unlock;
const lerp3 = (a, b, u) => [lerp(a[0], b[0], u), lerp(a[1], b[1], u), lerp(a[2], b[2], u)];
export const THEIRS = { c1: '#FF7A59', c2: '#FF9A6B', c3: '#FFB224' };
export const YOURS = { c1: '#1D4FF0', c2: '#3E6BFF', c3: '#6E8CFF' };
const BR = 0.9;                                      // the two bubbles' radius
const SEP = 1.06;                                    // their centres, apart
const LEFT = [-SEP, 0.45, 0], RIGHT = [SEP, 0.45, 0];

// ── the ground: the inside of the one; the days; dusk; ──────────────────────────────────────────────────────────
const R0 = rng(5);
const BLOBS = Array.from({ length: 7 }, (_, i) => ({ x: R0(), y: R0(), r: 380 + R0() * 420, c: [THEIRS.c1, P.adventure.color, P.health.color, '#FFD7C4'][i % 4], ph: R0() * 6, sp: 0.2 + R0() * 0.3 }));
const STARS = Array.from({ length: 60 }, () => ({ x: R0(), y: R0() * 0.8, r: 0.6 + R0() * 1.6, tw: R0() * 6 }));
// 0 day · 1 night · 2 gold morning · 3 dusk (the wait)
function sky(t) {
  const night = seg(t, 18.95, 19.25) * (1 - seg(t, 19.8, 20.35));
  const gold = seg(t, 20.2, 20.6) * (1 - seg(t, 21.3, 21.9));
  const dusk = seg(t, 23.25, 24.6, E.inOutSine);          // the day comes back by the ring from the wall (friends.js), not by a switch
  return { night, gold, dusk };
}
export function chatGround(g, t) {
  const { night, gold, dusk } = sky(t);
  let top = '#FFE7DA', bot = '#FFD3E2';
  top = mixHex(top, '#FFE3B0', gold); bot = mixHex(bot, '#FFC98F', gold);
  top = mixHex(top, '#0A1534', night); bot = mixHex(bot, '#1B2A5A', night);
  top = mixHex(top, '#140F33', dusk); bot = mixHex(bot, '#2A1D4D', dusk);
  const gr = g.createLinearGradient(0, 0, 0, H);
  gr.addColorStop(0, top); gr.addColorStop(1, bot);
  g.fillStyle = gr; g.fillRect(0, 0, W, H);
  // out-of-focus ink drifting (the inside of someone's colours)
  g.save(); g.globalCompositeOperation = night + dusk > 0.5 ? 'lighter' : 'source-over';
  for (const b of BLOBS) {
    const x = b.x * W + Math.sin(t * b.sp + b.ph) * 80, y = b.y * H + Math.cos(t * b.sp * 0.8 + b.ph) * 60;
    glow(g, x, y, b.r, b.c, (0.32 - 0.18 * night - 0.2 * dusk));
  }
  g.restore();
  if (night > 0.01) {
    g.save(); g.fillStyle = '#ffffff';
    for (const s of STARS) { g.globalAlpha = night * (0.4 + 0.6 * Math.abs(Math.sin(t * 2 + s.tw))); g.beginPath(); g.arc(s.x * W, s.y * H, s.r, 0, 6.283); g.fill(); }
    g.restore();
  }
}

// ── the hits ─────────────────────────────────────────────────────────────────────────────────────────────────────
const HITS = ['No names.', 'No photos.', 'Just talk.'].map((s) => new Line(s, { s: 156, w: 800, track: -0.03 }));

// ── the thread ───────────────────────────────────────────────────────────────────────────────────────────────────
const MSGS = [
  ['them', 'Sunday dinner at my mum’s. Non-negotiable \u{1F602}'],
  ['you', 'WAIT. Same!!'],
  ['them', 'ok we’re trading dumpling recipes'],
  ['you', 'tried yours. my mum cried \u{1F62D}'],
  ['them', 'she wants to meet you lol'],
].map(([who, text], i) => ({ who, text, at: T5.msgs[i] }));
const U_TXT = 0.168, U_LH = 0.215, U_PADX = 0.17, U_PADY = 0.125, MAXW = 2.45, GAP = 0.13;
const TXT_OPT = { f: FONTS.ui, w: 600, s: 100 };
let LAID = null;
function layoutMsgs() {
  if (LAID) return LAID;
  // measured at 100 px and scaled to world units (U_TXT world units a text em)
  LAID = MSGS.map((m) => {
    const lines = wrap(m.text, (MAXW - 2 * U_PADX) / U_TXT * 100, TXT_OPT);
    const cv = document.createElement('canvas').getContext('2d'); setFont(cv, TXT_OPT);
    const w = Math.max(...lines.map((l) => cv.measureText(l).width)) / 100 * U_TXT + 2 * U_PADX;
    const h = lines.length * U_LH + 2 * U_PADY;
    return { ...m, lines, w, h };
  });
  return LAID;
}
const BOTTOM = -2.55, XL = -1.95, XR = 1.95;          // the thread's newest edge and its margins (world)

// ── Bub's peek during the wait ───────────────────────────────────────────────────────────────────────────────────
export function bubWait(t) {
  const u0 = seg(t, 23.7, 24.3);
  const down = seg(t, T6.pop + 0.6, T6.pop + 1.1, E.inCubic);
  if (u0 <= 0 || down >= 1) return null;
  const up = E.outBack(u0);
  const gasp = seg(t, T6.touch[0], T6.touch[0] + 0.15);
  return {
    pos: [0.05, lerp(-3.35, -2.42, up) - down * 1.4, 1.2], r: 0.5, squash: -0.1 * (1 - gasp) + 0.08 * gasp, wide: 0.3 + 0.5 * gasp, squint: 0.4 * (1 - gasp),
    blush: 1, look: t < T6.them ? [-0.7, 0.6] : [-0.2 + 0.2 * gasp, 0.7], happy: t > T6.pop + 0.1 ? 1 : 0, faceAlpha: 1, k: 0.2,
  };
}

export const chatCam = (t) => {
  const keys = [
    { t: 15.85, pos: [0, 0.2, 9.0], target: [0, 0.1, 0], fov: 46, roll: 0.06 },          // the dive's own lens
    { t: 16.5, pos: [0, 0.1, 12.2], target: [0, 0.05, 0], fov: 35, roll: 0, ease: E.outCubic },
    { t: 21.6, pos: [0, 0.0, 12.0], target: [0, 0.0, 0], fov: 35, ease: E.inOutSine },
    { t: 22.3, pos: [0, 0.3, 12.4], target: [0, 0.25, 0], fov: 35, ease: E.inOutCubic },
    { t: 26.45, pos: [-0.4, 0.45, 9.9], target: [-0.34, 0.4, 0], fov: 35, ease: E.inOutSine },     // the creep
    { t: 27.35, pos: [0, 0.5, 9.4], target: [0, 0.48, 0], fov: 35, ease: E.inOutCubic },
    { t: 28.0, pos: [0, 0.5, 9.15], target: [0, 0.48, 0], fov: 35, ease: E.inOutSine },
  ];
  // hold still through the wait: the creep is the only motion (onetake: rests are what make the hits land)
  return hand(keyed(keys, t), t, seg(t, 16.6, 17.2) * (1 - seg(t, 22.6, 23.2)), 0.003);
};
export const CHAT_HITS = [[T5.hits[0], 16, 0.1], [T5.hits[1], 16, 0.1], [T5.hits[2], 18, 0.12], [T6.you, 6, 0.08], [T6.them, 8, 0.1], [T6.touch[1], 6, 0.1]];

export function chatFrame(t, st, env) {
  if (t < POP) st.under.push((g) => chatGround(g, t));
  const { night } = sky(t);
  // after the pop the dusk's light settles with the ring of day crossing the frame (the ground itself is friends.js's)
  const dusk = sky(t).dusk * (1 - E.outCubic(seg(t, TL.unlock.pop, TL.unlock.pop + 0.45)));
  st.env.night = Math.max(night * 0.8, dusk * 0.7);
  st.env.keyGain = 4.5 - 2.5 * Math.max(night, dusk);
  st.bg = '#FFE7DA';

  // the dive's film: still filling the lens, then thinning away
  const wash = 1 - seg(t, TL.crowd.switch, TL.crowd.switch + 0.42, E.inQuad);
  if (wash > 0.01) {
    st.prims.push(lensFilm(st.cam, wash, t));
    st.over.push((g) => filmWash(g, t, wash * 0.45));
  }

  // the hits
  if (t >= T5.hits[0] - 0.05 && t < 18.2) st.under.push((g) => {
    const out = seg(t, 17.75, 18.15, E.inCubic);
    const cy = H * 0.47;
    HITS.forEach((L, i) => {
      const t0 = T5.hits[i];
      if (t < t0) return;
      const y = cy + (i - 1) * 190 - out * 520;
      const each = (j) => {
        const dt = t - t0 - j * 0.012;
        if (dt < 0) return { a: 0 };
        const p = spring(dt, SPRING.snap), v = springVel(dt, SPRING.snap);
        const sq = clamp(v * 0.012, -0.2, 0.2);
        return { a: clamp(p * 5) * (1 - out), sc: lerp(1.5, 1, p), sx: 1 - sq, sy: 1 + sq };
      };
      drawLine(g, L, W / 2 - L.width / 2, y, { fill: night > 0.5 ? '#ffffff' : C.ink, each });
    });
  });

  // the thread (each message a glass bubble that pulls out of the bottom of the frame)
  const msgs = layoutMsgs();
  const drain = seg(t, T5.absorb, T5.absorb + 0.4, E.inOutCubic);
  if (t >= msgs[0].at - 0.1 && drain < 1) {
    // where each message sits: stacked up from the bottom by everything that arrived after it (eased)
    const lift = (i) => {
      let y = BOTTOM;
      for (let j = i + 1; j < msgs.length; j++) y += (msgs[j].h + GAP) * E.inOutCubic(seg(t, msgs[j].at - 0.05, msgs[j].at + 0.25));
      return y;
    };
    msgs.forEach((m, i) => {
      if (t < m.at - 0.05) return;
      const born = spring(t - (m.at - 0.05), SPRING.jelly), bornV = springVel(t - (m.at - 0.05), SPRING.jelly);
      const yb = lift(i);
      const mine = m.who === 'you';
      const cx = mine ? XR - m.w / 2 : XL + m.w / 2;
      let pos = [cx, yb + m.h / 2, 0.2];
      // from a droplet at its corner
      const corner = [mine ? XR - 0.2 : XL + 0.2, BOTTOM - 0.35, 0.2];
      const g0 = clamp(born);
      pos = lerp3(corner, pos, Math.min(1, g0 * 1.15));
      let sx = lerp(0.18 / m.w, 1, g0), sy = lerp(0.18 / m.h, 1, g0);
      const sq = clamp(bornV * 0.012, -0.12, 0.12);
      sx *= 1 + sq * 0.6; sy *= 1 - sq;
      // drained into its owner's bubble
      if (drain > 0) {
        const home = mine ? RIGHT : LEFT;
        pos = lerp3(pos, home, drain);
        sx *= 1 - drain * 0.8; sy *= 1 - drain * 0.6;
      }
      const top = msgs.length - i;                      // older ones fade as they rise to the top
      const fade = 1 - seg(yb, 2.4, 3.2);
      const alpha = fade * (drain > 0 ? 1 - seg(drain, 0.75, 1) : 1);
      if (alpha <= 0.01) return;
      const glassTint = mine ? C.blue : '#FFFFFF';
      // at night the glass glows: a lit white body for theirs, a brighter blue for yours
      st.prims.push({ type: 'box', pos, size: [m.w / 2 * sx, m.h / 2 * sy, 0.07], round: Math.min(0.22, m.h / 2) * Math.min(sx, sy), glass: 1, tint: glassTint,
        tintAmt: mine ? 0.75 : 0.06, fill: mine ? 0.72 + 0.15 * night : 0.62 * night, haze: mine ? 0.05 : 0.5, frost: 0.7, refr: 0.05, edge: 0.75 + 0.4 * night, spec: 1, glow: (mine ? 0.3 : 0.1) + 0.5 * night,
        alpha, group: 600 + i, k: 0, shadow: alpha * (1 - night) });
      if (g0 > 0.55 && drain < 0.15) st.over.push((g) => {
        const [x, y, k] = project(env, [pos[0], pos[1], pos[2] + 0.07]);
        const s = U_TXT * k;
        g.save(); g.globalAlpha = alpha * seg(g0, 0.55, 0.8) * (1 - seg(drain, 0, 0.15));
        g.font = `600 ${s}px ${FONTS.ui}`; g.textBaseline = 'middle'; g.fillStyle = mine ? '#FFFFFF' : C.ink;
        const x0 = x - (m.w / 2 - U_PADX) * k, y0 = y - ((m.lines.length - 1) * U_LH / 2) * k;
        m.lines.forEach((l, j) => g.fillText(l, x0, y0 + j * U_LH * k + s * 0.05));
        g.restore();
        if (globalThis.__textlog) globalThis.__textlog.push({ s: m.text, a: alpha });
      });
      void top;
    });
    // the header: who you are talking to, and which day it is
    const hA = seg(t, T5.days[0] - 0.25, T5.days[0]) * (1 - seg(t, T5.absorb - 0.1, T5.absorb + 0.2));
    if (hA > 0.01) {
      const hp = [0, 3.05, 0.2], pop = spring(t - (T5.days[0] - 0.25), SPRING.pop);
      st.prims.push({ type: 'box', pos: hp, size: [1.55 * pop, 0.3 * pop, 0.08], round: 0.3 * pop, glass: 1, tint: '#FFFFFF', tintAmt: 0.05, haze: 0.5, frost: 0.8, fill: 0.62 * night, glow: 0.5 * night,
        refr: 0.05, edge: 0.8, spec: 1, alpha: hA, group: 650, shadow: hA * (1 - night) });
      st.prims.push({ type: 'sphere', pos: [hp[0] - 1.18 * pop, hp[1], hp[2] + 0.12], size: [0.21 * pop], fill: 0.85, tint: THEIRS.c1, c2: THEIRS.c3, thick: 380, alpha: hA, group: 651, glow: 0.4 });
      st.over.push((g) => {
        const [x, y, k] = project(env, [hp[0], hp[1], hp[2] + 0.08]);
        const d = 1 + T5.days.filter((dt) => t >= dt).length - 1;
        g.save(); g.globalAlpha = hA * clamp(pop * 3); g.textBaseline = 'middle';
        const x0 = x - 0.9 * k;
        g.font = `720 ${0.155 * k}px ${FONTS.ui}`; g.fillStyle = C.ink; g.fillText('Curious Otter', x0, y - 0.075 * k);
        g.font = `600 ${0.112 * k}px ${FONTS.ui}`; g.fillStyle = 'rgba(11,27,63,0.6)';
        // the day flips like a counter
        const flip = Math.max(0, ...T5.days.map((dt) => (t >= dt && t < dt + 0.3 ? 1 - (t - dt) / 0.3 : 0)));
        g.fillText(`Day ${Math.max(1, d)} of 3 · anonymous`, x0, y + 0.1 * k - flip * 0.06 * k);
        g.restore();
        if (globalThis.__textlog) globalThis.__textlog.push({ s: 'Curious Otter', a: hA });
      });
    }
  }

  // ── VI: the two bubbles ───────────────────────────────────────────────────────────────────────────────────────
  if (t >= T5.absorb + 0.05) unlockFrame(t, st, env);
}

// a sheet of soap film just in front of the lens, filling the frame (the one's colours inside it)
export function lensFilm(cam, a, t) {
  const f = cam.target.map((v, k) => v - cam.pos[k]);
  const L = Math.hypot(...f), fwd = f.map((v) => v / L);
  const D = 0.6, hh = 0.32;                         // fixed: the same sheet on both sides of the dive's cut, whatever the lens
  const pos = cam.pos.map((v, k) => v + fwd[k] * D);
  const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), new THREE.Vector3(-fwd[0], -fwd[1], -fwd[2]));
  // a sheet, not a solid: the camera is inside the one's bubble when it is there, and a solid inside a solid is no surface
  return { type: 'wall', pos, size: [hh * 1.4], quat: [q.x, q.y, q.z, q.w], fill: 0.35 + 0.65 * a, tint: THEIRS.c1, c2: P.health.color, c3: P.adventure.color,
    thick: 420, seed: 2.2 + t * 0.3, alpha: a, rim: 0, haze: 0.05, edge: 0, env: 1.5, glow: 0.5, group: 990 };
}
export function filmWash(g, t, a) {
  const gr = g.createRadialGradient(W * 0.5, H * 0.45, 100, W * 0.5, H * 0.5, H * 0.8);
  gr.addColorStop(0, '#FFC2A0'); gr.addColorStop(0.45, '#FF9FBF'); gr.addColorStop(0.8, '#FFC66B'); gr.addColorStop(1, '#FF8C6E');
  g.save(); g.globalAlpha = a; g.fillStyle = gr; g.fillRect(0, 0, W, H);
  // film swirl bands
  g.globalCompositeOperation = 'lighter';
  for (let i = 0; i < 5; i++) {
    g.strokeStyle = ['rgba(62,224,197,0.18)', 'rgba(255,111,174,0.2)', 'rgba(255,201,60,0.2)', 'rgba(110,140,255,0.18)', 'rgba(255,255,255,0.2)'][i];
    g.lineWidth = 120;
    g.beginPath(); g.ellipse(W / 2 + Math.sin(t * 3 + i) * 120, H / 2, 300 + i * 160 + t * 40, 520 + i * 200, t * 0.6 + i, 0, 6.283); g.stroke();
  }
  g.restore();
}

// ── VI · the breath ──────────────────────────────────────────────────────────────────────────────────────────────
const ASK = new Line('Ready to meet?', { s: 118, w: 800, track: -0.03 });
const POP = T6.pop;
function bubbleState(t, side) {
  const born = spring(t - T5.absorb - 0.1, SPRING.jelly);
  let r = BR * lerp(0.35, 1, clamp(born));
  // the touch: from apart to one radius apart (Plateau: equal bubbles share a flat wall)
  const tt = seg(t, T6.touch[0], T6.touch[1], E.inOutCubic);
  let x = lerp(side * SEP, side * BR * 0.5, tt);
  const y = 0.45;
  // their heartbeat while you wait
  let beat = 0;
  if (side < 0) for (const b of [24.0, 24.75, 25.5, 26.0, 26.25]) { const d = t - b; if (d > 0 && d < 0.3) beat = Math.max(beat, Math.sin(Math.PI * d / 0.3)); }
  r *= 1 + 0.025 * beat;
  return { pos: [x, y, 0], r, tt };
}
function unlockFrame(t, st, env) {
  const L = bubbleState(t, -1), Rr = bubbleState(t, 1);
  const popP = seg(t, POP, POP + 0.1);
  const youUnlocked = t >= T6.you, themUnlocked = t >= T6.them;
  const goldR = youUnlocked ? Math.exp(-(t - T6.you) / 0.4) : 0, goldL = themUnlocked ? Math.exp(-(t - T6.them) / 0.4) : 0;
  const wallThin = seg(t, T6.hold, POP);
  if (t < POP) {
    // two bubbles, then the double bubble: separate groups (they crease, they don't melt), and a wall between them
    const quiver = t > T6.hold ? 0.006 * Math.sin(t * 71) : 0;
    st.prims.push({ type: 'sphere', pos: L.pos, size: [L.r * (1 + quiver)], fill: 0.72, tint: THEIRS.c1, c2: THEIRS.c2, c3: THEIRS.c3, thick: 380, glow: 0.45 + 0.8 * goldL,
      seed: 3.7, group: 700, rim: 1.6, haze: 0.08, wobble: 0.008 });
    st.prims.push({ type: 'sphere', pos: Rr.pos, size: [Rr.r * (1 - quiver)], fill: 0.72, tint: YOURS.c1, c2: YOURS.c2, c3: YOURS.c3, thick: 380, glow: 0.45 + 0.8 * goldR,
      seed: 1.2, group: 701, rim: 1.6, haze: 0.08, wobble: 0.008 });
    const d = Rr.pos[0] - L.pos[0];
    if (d < 2 * BR) {
      const a = Math.sqrt(Math.max(0, BR * BR - (d / 2) * (d / 2)));
      st.prims.push({ type: 'wall', pos: [(L.pos[0] + Rr.pos[0]) / 2, 0.45, 0], size: [a], quat: [0, 0.7071, 0, 0.7071], thick: lerp(380, 70, wallThin), seed: 5.5,
        env: 1.8, rim: 1.0, haze: 0.04, edge: 0, group: 702 });
    }
  } else if (t < POP + 0.55) {
    // the wall goes; the two become one (volume kept: r·2^⅓), wobbling
    const m = spring(t - POP - 0.06, SPRING.jelly);
    const R1 = BR * Math.cbrt(2);
    const r = lerp(BR, R1, clamp(m));
    const x = lerp(BR * 0.5, 0, clamp(m * 1.2));
    const v = springVel(t - POP - 0.06, SPRING.jelly);
    const sq = clamp(v * 0.02, -0.25, 0.25);
    if (t < POP + 0.14) st.prims.push({ type: 'wall', pos: [0, 0.45, 0], size: [BR * Math.sqrt(3) / 2], quat: [0, 0.7071, 0, 0.7071], hole: BR * Math.sqrt(3) / 2 * popP * 1.05,
      thick: 70, seed: 5.5, env: 2.2, rim: 1.2, group: 702 });
    for (const [sd, col] of [[-1, THEIRS], [1, YOURS]]) st.prims.push({ type: 'sphere', pos: [sd * x, 0.45, 0], size: [r], scale: [1 + sq * 0.5, 1 - sq, 1 + sq * 0.5], fill: lerp(0.72, 0.1, seg(t, POP, POP + 0.5)),
      tint: col.c1, c2: col.c2, c3: col.c3, thick: 400, glow: 0.4, seed: sd > 0 ? 1.2 : 3.7, group: 710, k: lerp(0.05, 1.4, clamp(m * 1.5)), rim: 1.8, haze: 0.14, wobble: 0.01 });
  }

  const ui = 1 - seg(t, T6.touch[0] - 0.1, T6.touch[0] + 0.2);
  // ready to meet?
  if (t >= T6.ask && t < 24.45) st.under.push((g) => {
    const [x, y, k] = project(env, [0, 2.55, 0]);
    const sc = k / 253;
    g.save(); g.translate(x, y); g.scale(sc, sc);
    drawLine(g, ASK, -ASK.width / 2, 0, { fill: sky(t).dusk > 0.5 ? '#ffffff' : C.ink, each: popEach(ASK, t, [T6.ask, T6.ask + 0.12, T6.ask + 0.24]), alpha: ui * (1 - seg(t, 23.9, 24.4)) });
    g.restore();
  });
  // names, buttons, the wait
  if (ui > 0.01) st.over.push((g) => {
    const dusk = sky(t).dusk;
    for (const [side, b, name, at, done] of [[-1, L, 'Curious Otter', T6.them, themUnlocked], [1, Rr, 'You', T6.you, youUnlocked]]) {
      const [x, y, k] = project(env, [b.pos[0], b.pos[1] - BR - 0.32, 0.4]);
      const a = seg(t, T6.ask + 0.1, T6.ask + 0.35) * ui;
      g.save(); g.globalAlpha = a; g.textAlign = 'center'; g.textBaseline = 'middle';
      g.font = `700 ${0.15 * k}px ${FONTS.ui}`; g.fillStyle = dusk > 0.5 ? '#ffffff' : C.ink;
      g.fillText(name, x, y);
      g.restore();
      void side; void at; void done;
    }
    // waiting…
    if (t > T6.wait[0] && t < T6.them + 0.2) {
      const [x, y, k] = project(env, [-0.2, -1.95, 0.4]);
      const n = 1 + Math.floor((t * 2.5) % 3);
      g.save(); g.globalAlpha = seg(t, T6.wait[0], T6.wait[0] + 0.3) * (1 - seg(t, T6.them, T6.them + 0.2)); g.textAlign = 'center'; g.textBaseline = 'middle';
      g.font = `600 ${0.13 * k}px ${FONTS.ui}`; g.fillStyle = 'rgba(255,255,255,0.85)';
      g.fillText(`Waiting for Curious Otter${'.'.repeat(n)}`, x, y);
      g.restore();
      if (globalThis.__textlog) globalThis.__textlog.push({ s: 'Waiting for Curious Otter…', a: 1 });
    }
  });
  // the unlock buttons: gold glass, a padlock that opens
  for (const [side, b, at] of [[-1, L, T6.them], [1, Rr, T6.you]]) {
    const pop = spring(t - (T6.ask + 0.2 + (side > 0 ? 0 : 0.08)), SPRING.pop);
    const bp = [b.pos[0], b.pos[1] - BR - 0.78, 0.35];
    const press = Math.sin(Math.PI * seg(t, at - 0.02, at + 0.14));
    const done = t >= at;
    const a = clamp(pop * 3) * ui;
    if (a <= 0.01) continue;
    st.prims.push({ type: 'box', pos: bp, size: [0.62 * pop * (1 - 0.06 * press), 0.2 * pop * (1 - 0.12 * press), 0.08], round: 0.2 * pop, glass: 1, tint: C.gold, tintAmt: 0.6,
      fill: done ? 0.85 : 0.55, haze: 0.15, frost: 0.6, refr: 0.05, edge: 0.8, spec: 1.1, glow: done ? 0.8 : 0.3, alpha: a, group: 720 + side, shadow: a * (1 - sky(t).dusk) });
    st.over.push((g) => {
      const [x, y, k] = project(env, [bp[0], bp[1], bp[2] + 0.08]);
      const s = 0.14 * k;
      const open = done ? spring(t - at, SPRING.snap) : 0;
      g.save(); g.globalAlpha = a; g.textBaseline = 'middle';
      const label = done ? 'Unlocked' : 'Unlock';
      g.font = `720 ${s}px ${FONTS.ui}`;
      const w = g.measureText(label).width + s * 1.25;
      const x0 = x - w / 2;
      // the padlock: the shackle lifts and swings when it opens
      g.save(); g.translate(x0 + s * 0.45, y);
      icon(g, open > 0.5 ? 'lock-open' : 'lock', -s * 0.5, -s * 0.55 - open * s * 0.12, s, C.ink, 2.4);
      g.restore();
      g.fillStyle = C.ink; g.fillText(label, x0 + s * 1.25, y + s * 0.05);
      g.restore();
      if (globalThis.__textlog) globalThis.__textlog.push({ s: label, a });
    });
    st.over.push((g) => touch(g, t, at, project(env, [bp[0] + 0.15, bp[1] - 0.04, bp[2] + 0.1])));
  }
  // a spotlight on them during the wait; the gold rings on unlock
  st.under.push((g) => {
    const dusk = sky(t).dusk;
    if (dusk > 0.01) { const [x, y, k] = project(env, L.pos); glow(g, x, y - 120, BR * k * 2.6, '#FFE3C4', 0.35 * dusk); }
    for (const [b, gold] of [[L, goldL], [Rr, goldR]]) if (gold > 0.01) { const [x, y, k] = project(env, b.pos); glow(g, x, y, BR * k * 2.2, '#FFC93C', 0.7 * gold); }
  });
  // the pop: a ring of daylight from the wall, as at the start of the film
  if (t >= POP) {
    const f = E.outCubic(seg(t, POP, POP + 0.45));
    st.over.push((g) => {
      const [x, y] = project(env, [0, 0.45, 0]);
      if (f < 1) {
        g.save(); g.globalCompositeOperation = 'lighter'; g.shadowColor = 'rgba(255,255,255,0.9)'; g.shadowBlur = 40;
        g.strokeStyle = `rgba(255,255,255,${0.9 * (1 - f)})`; g.lineWidth = 10;
        g.beginPath(); g.arc(x, y, f * 1500, 0, 6.283); g.stroke(); g.restore();
      }
    });
  }
  st.fx.flash = Math.max(st.fx.flash, t >= POP ? 0.1 * Math.exp(-(t - POP) / 0.05) : 0);
  if (t >= POP) st.fx.flashColor = '#FFF6EC';
  const duskFx = sky(t).dusk * (1 - E.outCubic(seg(t, POP, POP + 0.45)));
  st.fx.bloom = { strength: 0.3 + 0.35 * duskFx, radius: 0.6, threshold: 1.0 };
  st.fx.vignette = 0.12 + 0.3 * duskFx;
}
