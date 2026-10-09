// Easing, springs, interpolation and deterministic randomness. Every function is a pure function of its inputs, so
// any frame renders identically in any order.
export const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
export const lerp = (a, b, t) => a + (b - a) * t;
export const invLerp = (a, b, x) => (b === a ? (x >= b ? 1 : 0) : clamp((x - a) / (b - a)));
export const smoothstep = (a, b, x) => { const t = invLerp(a, b, x); return t * t * (3 - 2 * t); };
export const TAU = Math.PI * 2;

const pow = Math.pow;
export const ease = {
  linear: (t) => t,
  inQuad: (t) => t * t,
  outQuad: (t) => 1 - (1 - t) * (1 - t),
  inOutQuad: (t) => (t < 0.5 ? 2 * t * t : 1 - pow(-2 * t + 2, 2) / 2),
  inCubic: (t) => t * t * t,
  outCubic: (t) => 1 - pow(1 - t, 3),
  inOutCubic: (t) => (t < 0.5 ? 4 * t * t * t : 1 - pow(-2 * t + 2, 3) / 2),
  inQuart: (t) => t * t * t * t,
  outQuart: (t) => 1 - pow(1 - t, 4),
  inOutQuart: (t) => (t < 0.5 ? 8 * t * t * t * t : 1 - pow(-2 * t + 2, 4) / 2),
  outQuint: (t) => 1 - pow(1 - t, 5),
  inOutQuint: (t) => (t < 0.5 ? 16 * pow(t, 5) : 1 - pow(-2 * t + 2, 5) / 2),
  inExpo: (t) => (t <= 0 ? 0 : pow(2, 10 * t - 10)),
  outExpo: (t) => (t >= 1 ? 1 : 1 - pow(2, -10 * t)),
  inOutExpo: (t) => (t <= 0 ? 0 : t >= 1 ? 1 : t < 0.5 ? pow(2, 20 * t - 10) / 2 : (2 - pow(2, -20 * t + 10)) / 2),
  inSine: (t) => 1 - Math.cos((t * Math.PI) / 2),
  outSine: (t) => Math.sin((t * Math.PI) / 2),
  inOutSine: (t) => -(Math.cos(Math.PI * t) - 1) / 2,
  inBack: (t, s = 1.70158) => (s + 1) * t * t * t - s * t * t,
  outBack: (t, s = 1.70158) => 1 + (s + 1) * pow(t - 1, 3) + s * pow(t - 1, 2),
};

// Eased progress of x through [a, b].
export const seg = (x, a, b, e = ease.linear) => e(invLerp(a, b, x));

// CSS-style cubic-bezier timing function (bisection on x; monotone for x1, x2 in [0,1]).
export function cubicBezier(x1, y1, x2, y2) {
  const bez = (a, b, t) => 3 * a * t * (1 - t) * (1 - t) + 3 * b * t * t * (1 - t) + t * t * t;
  const fn = (x) => {
    if (x <= 0) return 0;            // exact endpoints: a bisected 0 is ~1e-8, which reads as "started"
    if (x >= 1) return 1;
    let lo = 0, hi = 1, t = x;
    for (let i = 0; i < 28; i++) {
      t = (lo + hi) / 2;
      if (bez(x1, x2, t) < x) lo = t; else hi = t;
    }
    return bez(y1, y2, t);
  };
  fn.points = [x1, y1, x2, y2];
  return fn;
}

// Analytic damped spring (mass 1), the way Compose / Material 3 specify motion: stiffness k and damping ratio ζ.
// Returns progress from 0 → 1 at `dt` seconds after release (0 before it), overshooting when ζ < 1. `v0` is the
// initial velocity toward the target in units of the travel per second (a flick).
export function spring(dt, { stiffness = 380, damping = 0.8, v0 = 0 } = {}) {
  if (dt <= 0) return 0;
  const w0 = Math.sqrt(stiffness);
  const z = damping;
  let x;                                            // remaining displacement (1 at release, 0 at rest)
  if (z < 1) {
    const wd = w0 * Math.sqrt(1 - z * z);
    x = Math.exp(-z * w0 * dt) * (Math.cos(wd * dt) + ((z * w0 - v0) / wd) * Math.sin(wd * dt));
  } else if (z === 1) {
    x = Math.exp(-w0 * dt) * (1 + (w0 - v0) * dt);
  } else {
    const s = w0 * Math.sqrt(z * z - 1);
    const r1 = -z * w0 + s, r2 = -z * w0 - s;
    const c2 = (v0 + r1) / (r1 - r2);                 // x(0) = 1, x'(0) = −v0
    x = (1 - c2) * Math.exp(r1 * dt) + c2 * Math.exp(r2 * dt);
  }
  return 1 - x;
}
// Its velocity (progress per second), for squash & stretch.
export function springVel(dt, opt) {
  const h = 1 / 960;
  return dt <= 0 ? 0 : (spring(dt + h, opt) - spring(Math.max(0, dt - h), opt)) / (2 * h);
}
// Time for a spring to settle within `eps` of rest (for sequencing and reading-time holds).
export function springSettle(opt, eps = 0.005) {
  let last = 0;
  for (let t = 0; t < 5; t += 1 / 240) if (Math.abs(1 - spring(t, opt)) > eps) last = t;
  return last;
}

// mulberry32 — deterministic PRNG so every render is identical.
export function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Exponential decay since the latest event time ≤ t (times sorted ascending, seconds).
export function pulse(t, times, decay) {
  let last = -1;
  for (const e of times) { if (e <= t) last = e; else break; }
  return last < 0 ? 0 : Math.exp(-(t - last) / decay);
}

// Smooth pseudo-random wobble (sum of sines), deterministic.
export const wobble = (t, seed = 0) =>
  Math.sin(t * 1.7 + seed * 3.1) * 0.5 + Math.sin(t * 2.9 + seed * 1.3) * 0.3 + Math.sin(t * 5.3 + seed * 7.7) * 0.2;

// Halton low-discrepancy sequence: sub-pixel jitter offsets for temporal anti-aliasing.
export function halton(i, base) {
  let f = 1, r = 0;
  while (i > 0) { f /= base; r += f * (i % base); i = Math.floor(i / base); }
  return r;
}

// Colour helpers: hex ↔ rgb, mixing in linear light (mixing in sRGB muddies saturated pairs).
export function hexRgb(hex) {
  const m = /^rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)/i.exec(hex);   // mixHex's own output chains
  if (m) return [Number(m[1]), Number(m[2]), Number(m[3])];
  if (!/^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.test(hex)) throw new Error(`hexRgb: not a hex colour: ${hex}`);
  const h = hex.replace('#', '');
  const n = parseInt(h.length === 3 ? h.split('').map((c) => c + c).join('') : h, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
const toLin = (c) => { c /= 255; return c <= 0.04045 ? c / 12.92 : pow((c + 0.055) / 1.055, 2.4); };
const toSrgb = (c) => 255 * (c <= 0.0031308 ? c * 12.92 : 1.055 * pow(c, 1 / 2.4) - 0.055);
export function mixHex(a, b, t) {
  const A = hexRgb(a).map(toLin), B = hexRgb(b).map(toLin);
  return rgbStr(A.map((v, i) => toSrgb(lerp(v, B[i], t))));
}
export const rgbStr = ([r, g, b], a = 1) => (a >= 1 ? `rgb(${r | 0},${g | 0},${b | 0})` : `rgba(${r | 0},${g | 0},${b | 0},${a})`);
export const rgba = (hex, a) => rgbStr(hexRgb(hex), a);
