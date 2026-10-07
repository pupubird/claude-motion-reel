// I · NIGHT (0–2 s) and II · DAYLIGHT (2–6 s).
// Frame 0 is already moving: in the dark, a light races round the rim of one soap bubble and the first word lands
// inside it. One word a beat — "Make friends / outside / your bubble." — and with each word the bubble inflates and
// its film thins (blue and magenta → gold → the black film a bubble shows just before it goes). On the 2.0 hit it
// tears from the top, and the light of the day pours out of it in a ring that crosses the frame: night outside the
// ring, day inside. The words are thrown by the burst, land in ink, and hold to be read. Droplets drift. Then a small
// sleeping bubble rises into the frame — Bub — and inhales on the riser; on the 6.0 drop its eyes open.
import { TL } from '../timeline.js';
import { C, FONTS, SPRING } from '../brand.js';
import { W, H } from '../config.js';
import { clamp, lerp, seg, spring, springVel, ease as E, rng, mixHex } from '../util.js';
import { Line, drawLine, combine } from '../type.js';
import { daySky, nightSky, glow, rays } from '../sky.js';
import { project } from '../proj.js';
import { keyed, hand, shake } from '../camera.js';

const N = TL.night, D = TL.day;
export const BUBBLE = [0, 0.15, 0];                  // the bubble you are in
const POP = N.pop;

// the words: one line each, popping a word a beat
const LINES = [
  { line: new Line('Make friends', { s: 112, w: 800 }), at: [N.words[0] - 0.12, N.words[1]] },     // mid-pop on frame 0
  { line: new Line('outside', { s: 152, w: 800 }), at: [N.words[2]] },
  { line: new Line('your bubble.', { s: 112, w: 800 }), at: [N.words[3], N.words[3] + 0.14] },
];
const PITCH = [0, 150, 150];                         // baseline to baseline (px at the reference scale)
// where each line's baseline sits (relative to the block's centre) once n lines are up
function layout(n) {
  const hs = LINES.slice(0, n).map((l) => l.line.ascent);
  let y = 0; const ys = [];
  for (let i = 0; i < n; i++) { if (i) y += PITCH[i]; ys.push(y); }
  const top = ys[0] - hs[0], bot = ys[n - 1];
  const mid = (top + bot) / 2;
  return ys.map((v) => v - mid);
}
const LAYOUT = [null, layout(1), layout(2), layout(3)];
const ARRIVE = [N.words[0] - 0.12, N.words[2], N.words[3]];

// the bubble's radius and film thickness, word by word
const RAD = [[-0.14, 0.0], [-0.1, 1.18], [0.5, 1.42], [1.0, 1.72], [1.5, 1.98], [1.92, 2.08]];
function radiusAt(t) {
  let r = 0;
  for (let i = 1; i < RAD.length; i++) {
    const [t0] = RAD[i], prev = RAD[i - 1][1], next = RAD[i][1];
    if (t >= t0) r = prev + (next - prev) * spring(t - t0, SPRING.wobble);
  }
  return r;
}
const thickAt = (t) => lerp(560, 70, E.inQuad(clamp(t / 1.95)));

// the rim light: round the back of the bubble, fast at first, slowing as the words take over
const rimAngle = (t) => -1.2 + 9.5 * (1 - Math.exp(-t / 0.55)) + t * 1.4;

// droplets thrown by the pop
const R1 = rng(7);
const DROPS = Array.from({ length: 24 }, () => {
  const a = R1() * Math.PI * 2, el = (R1() - 0.5) * 1.2;
  const near = R1() < 0.2;
  return { dir: [Math.cos(a) * Math.cos(el), Math.sin(a) * Math.cos(el) * 0.9, near ? 0.9 + R1() * 0.4 : Math.sin(el)], v: (near ? 5 : 2.2) + R1() * 3.4, r: near ? 0.12 + R1() * 0.1 : 0.05 + R1() * 0.11, seed: R1() * 10 };
});

// Bub's entrance (world): rises from below, inhales on the riser, opens its eyes on the drop
export const BUB_AT_DROP = [0, -1.62, 0];
export function bubHook(t) {
  const up = E.outCubic(seg(t, D.bubIn, D.riser));
  const inhale = seg(t, D.riser, D.drop, E.inQuad);
  let y = lerp(-8.2, -2.55, up) + inhale * 0.75 + Math.sin(t * 2.2) * 0.04 * (1 - inhale);
  let r = lerp(0.5, 0.82, inhale);
  let squash = -0.08 * Math.sin(t * 2.2) * (1 - inhale) + inhale * 0.16;     // a sleepy bob, then stretch on the inhale
  if (t >= D.drop) {
    const p = spring(t - D.drop, SPRING.pop), v = springVel(t - D.drop, SPRING.pop);
    r = lerp(0.82, 1.0, p);
    y = lerp(-1.8, BUB_AT_DROP[1], p);
    squash = clamp(-v * 0.035, -0.3, 0.3);
  }
  return { pos: [0.15 * (1 - up), y, 0], r, squash, asleep: t < D.drop };
}

export const hookCam = (t) => {
  const keys = [
    { t: 0, pos: [0, 0.15, 14.4], target: [0, 0.15, 0], fov: 35 },
    { t: 1.95, pos: [0, 0.15, 12.7], target: [0, 0.15, 0], fov: 35, ease: E.inOutSine },
    { t: 2.35, pos: [0, 0.2, 13.4], target: [0, 0.18, 0], fov: 35, ease: E.outCubic },      // blown back by the pop
    { t: 4.55, pos: [0, 0.12, 13.1], target: [0, 0.12, 0], fov: 35, ease: E.inOutSine },
    { t: 6.0, pos: [0, -1.25, 7.4], target: [0, -1.5, 0], fov: 35, ease: E.inOutCubic },
  ];
  let cam = keyed(keys, t);
  const env = t < 2 ? 0.6 : clamp(seg(t, 2.3, 3.0) * (1 - seg(t, 3.0, 3.6)) + seg(t, 4.4, 5.0), 0, 1);
  cam = hand(cam, t, env, 0.004);
  return cam;
};
export const HOOK_HITS = [[0.0, 7, 0.1], [0.5, 4, 0.08], [1.0, 5, 0.08], [1.5, 6, 0.09], [POP, 26, 0.16, 22], [D.drop, 14, 0.12]];

export function hookFrame(t, st, env) {
  if (t >= D.drop) return;
  const night = t < POP;
  const R = radiusAt(t);
  const tear = seg(t, POP, POP + 0.16, E.outQuad);
  const flood = E.outCubic(seg(t, D.flood[0], D.flood[1]));

  // ── the environment ──
  if (t < POP + 0.6) {
    const th = rimAngle(t);
    st.env.night = 1 - flood;
    st.env.rimGain = night ? 3.2 : 3.2 * (1 - seg(t, POP, POP + 0.3));
    st.env.rimPos = [BUBBLE[0] + Math.cos(th) * R * 2.4, BUBBLE[1] + Math.sin(th) * R * 2.4, -R * 1.9];
    st.env.rimCol = '#FFF3E0';
    st.env.keyGain = night ? 1.2 : 4.5;
  }

  // ── the bubble you are in: film, then the tear ──
  if (t < POP + 0.17 && R > 0.01) {
    const quiver = t > 1.5 ? 0.012 * (t - 1.5) * Math.sin(t * 61) : 0;
    const base = { pos: BUBBLE, size: [R * (1 + quiver)], thick: thickAt(t), seed: 3.3, env: 1.6, haze: 0.05, rim: 2.6, edge: 0.0, wobble: 0.012 + 0.02 * seg(t, 1.5, 2.0) };
    if (t < POP) st.prims.push({ ...base, type: 'sphere', group: 50 });
    else st.prims.push({ ...base, type: 'shell', pop: tear, popDir: [0.05, 0.82, 0.57], alpha: 1 - seg(t, POP + 0.12, POP + 0.17) });
  }
  // droplets from the tear
  if (t >= POP && t < POP + 3.4) {
    const dt = t - POP;
    for (const d of DROPS) {
      const travel = d.v * (1 - Math.exp(-dt * 3.2)) / 3.2;
      const p = [BUBBLE[0] + d.dir[0] * (R * 1.02 + travel), BUBBLE[1] + d.dir[1] * (R * 1.02 + travel) + dt * 0.18, d.dir[2] * (R + travel)];
      st.prims.push({ type: 'sphere', pos: p, size: [d.r * (1 - 0.3 * seg(dt, 2.4, 3.4))], thick: 380, seed: d.seed, alpha: 1 - seg(dt, 2.6, 3.4), rim: 1.4, haze: 0.12, env: 1.4 });
    }
  }

  // ── the ground: night, the flood of day from the pop, day ──
  st.under.push((g) => {
    const [bx, by] = project(env, BUBBLE);
    const fr = flood * 1650;
    if (flood < 1) {
      nightSky(g, t, { center: [bx, by], glow: 1 });
      // the rim light's glow behind the bubble, where the streak is
      if (night) {
        const th = rimAngle(t), [, , k] = project(env, BUBBLE);
        const gx = bx + Math.cos(th) * R * k * 1.02, gy = by - Math.sin(th) * R * k * 1.02;
        glow(g, gx, gy, 260, '#FFD9B0', 0.5);
        glow(g, gx, gy, 90, '#ffffff', 0.65);
        // the trail: the arc the light has just run, fading behind it
        const rr = R * k * 1.012, spd = Math.min(1.6, Math.abs(rimAngle(t + 0.02) - th) * 25);
        g.save(); g.globalCompositeOperation = 'lighter'; g.lineCap = 'round';
        for (let i = 0; i < 18; i++) {
          const a0 = th - (i / 18) * spd * 0.9, a1 = th - ((i + 1) / 18) * spd * 0.9;
          g.strokeStyle = `rgba(255,238,215,${(0.55 * (1 - i / 18) ** 1.6).toFixed(3)})`;
          g.lineWidth = 7 * (1 - i / 22);
          g.beginPath(); g.arc(bx, by, rr, -a0, -a1, false); g.stroke();
        }
        g.restore();
      }
    }
    if (flood > 0) {
      g.save();
      if (flood < 1) { g.beginPath(); g.arc(bx, by, fr, 0, Math.PI * 2); g.clip(); }
      daySky(g, t, { bubbles: 0.8 + 0.2 * flood, sun: flood });
      rays(g, t, { a: flood * 0.9 });
      g.restore();
      if (flood < 1) {
        // the front of the flood: a thin hot edge, a soft glow round it, film colour trailing just inside
        g.save(); g.globalCompositeOperation = 'lighter';
        const bands = [[-46, 'rgba(62,224,197,0.22)', 26], [-24, 'rgba(255,111,174,0.26)', 18], [-8, 'rgba(255,201,60,0.3)', 12]];
        for (const [dr, col, lw] of bands) { g.strokeStyle = col; g.lineWidth = lw; g.beginPath(); g.arc(bx, by, Math.max(1, fr + dr), 0, Math.PI * 2); g.stroke(); }
        g.shadowColor = 'rgba(255,255,255,0.9)'; g.shadowBlur = 40;
        g.strokeStyle = 'rgba(255,255,255,0.95)'; g.lineWidth = 7;
        g.beginPath(); g.arc(bx, by, Math.max(1, fr), 0, Math.PI * 2); g.stroke();
        g.restore();
      }
    }
    drawWords(g, t, env, bx, by, flood, fr);
  });

  // ── lens ──
  st.fx.flash = Math.max(st.fx.flash, 0.16 * Math.exp(-Math.max(0, t - POP) / 0.05) * (t >= POP ? 1 : 0));
  st.fx.ca = Math.max(st.fx.ca, 0.016 * Math.exp(-Math.max(0, t - POP) / 0.18) * (t >= POP ? 1 : 0));
  // bloom only on light brighter than paper: the rim light and the film's glints, never the words or the day's sky
  if (night) st.fx.bloom = { strength: 0.65, radius: 0.62, threshold: 1.0 };
  else st.fx.bloom = { strength: 0.28, radius: 0.55, threshold: 1.0 };
  st.fx.vignette = night ? 0.35 : lerp(0.35, 0.1, seg(t, POP, POP + 0.8));
}

// the words: white inside the night, ink once the day reaches them; thrown by the pop and settling back
const R2 = rng(19);
const KICK = LINES.map((l) => l.line.glyphs.map(() => ({ a: R2(), r: R2() - 0.5, s: 0.6 + R2() * 0.8 })));
function drawWords(g, t, env, bx, by, flood, fr) {
  const [, , k] = project(env, BUBBLE);
  const sc = k / 240;                                 // the type is set for the bubble at full size (12.7 away)
  // the block rises out of the frame as the camera tilts down to Bub
  const nUp = t < ARRIVE[1] ? 1 : t < ARRIVE[2] ? 2 : 3;
  LINES.forEach((L, li) => {
    if (t < L.at[0]) return;
    // the line's y: springs from the layout before this line to the layout with it
    let y = LAYOUT[Math.max(li + 1, 1)][li];
    for (let n = li + 2; n <= nUp; n++) {
      const p = spring(t - ARRIVE[n - 1], SPRING.settle);
      y = lerp(y, LAYOUT[n][li], p);
    }
    const line = L.line;
    // centre what is up: a line whose second word has not arrived yet sits centred on its first, and slides over
    let x0 = -line.width / 2;
    if (L.at.length > 1) {
      const w0 = line.words[0].w;
      x0 = lerp(-w0 / 2, -line.width / 2, spring(t - L.at[1], SPRING.settle));
    }
    const dtPop = t - POP;
    const each = (i, gl, wk) => {
      const t0 = L.at[Math.min(Math.max(wk, 0), L.at.length - 1)];
      if (t < t0) return { a: 0 };
      const p = spring(t - t0, SPRING.pop), v = springVel(t - t0, SPRING.pop);
      const sq = clamp(v * 0.02, -0.14, 0.14);
      let o = { a: clamp(p * 4), sc: p, sx: 1 - sq, sy: 1 + sq, dy: (1 - p) * 0.3 * line.opt.s };
      if (dtPop >= 0) {
        // thrown outward from the tear (top of the bubble) and pulled back: an impulse that rises and decays
        const kk = KICK[li][i];
        const gx = x0 + gl.x + gl.w / 2, gy = y - line.xh / 2;
        const ang = Math.atan2(gy + 260, gx) + kk.r * 0.8;
        const w = 7.5, f = dtPop * w * Math.exp(1 - dtPop * w);
        o.dx = (o.dx ?? 0) + Math.cos(ang) * 120 * kk.s * f;
        o.dy += Math.sin(ang) * 120 * kk.s * f;
        o.rot = kk.r * 0.9 * f;
        o.sc *= 1 + 0.25 * f;
      }
      return o;
    };
    const exit = seg(t, 4.55, 5.35, E.inCubic);
    if (exit >= 1) return;
    const drawAs = (fill, blue) => {
      g.save();
      g.globalAlpha *= 1 - seg(t, 4.95, 5.35);
      g.translate(bx, by - exit * 520);
      g.scale(sc, sc);
      drawLine(g, line, x0, y, {
        fill, each: blue ? combine(each, (i, gl, wk) => (li === 0 && wk === 1 ? { fill: C.blue } : null)) : each,
        log: !blue,
      });
      g.restore();
    };
    if (flood < 1) {                                   // night: white, under the film
      g.save();
      if (flood > 0) { g.beginPath(); g.rect(0, 0, W, H); g.arc(bx, by, fr, 0, Math.PI * 2, true); g.clip('evenodd'); }
      drawAs('rgba(236,241,255,0.93)', false);
      g.restore();
    }
    if (flood > 0) {                                   // day: ink, "friends" in the brand blue
      g.save();
      if (flood < 1) { g.beginPath(); g.arc(bx, by, fr, 0, Math.PI * 2); g.clip(); }
      drawAs(C.ink, true);
      g.restore();
    }
  });
}
