// Easing, interpolation, keyframes and deterministic randomness. Every frame is a pure function of time.
export const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
export const lerp = (a, b, t) => a + (b - a) * t;
export const invLerp = (a, b, x) => clamp((x - a) / (b - a));
export const smoothstep = (a, b, x) => { const t = invLerp(a, b, x); return t * t * (3 - 2 * t); };
export const TAU = Math.PI * 2;
export const DEG = Math.PI / 180;

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
  inOutBack: (t, s = 1.70158 * 1.525) => (t < 0.5
    ? (pow(2 * t, 2) * ((s + 1) * 2 * t - s)) / 2
    : (pow(2 * t - 2, 2) * ((s + 1) * (t * 2 - 2) + s) + 2) / 2),
};

// CSS-style cubic-bezier timing function. Exact 0/1 endpoints (a bisected 0 is ~1e-8 and reads as "started").
export function cubicBezier(x1, y1, x2, y2) {
  const bez = (a, b, t) => 3 * a * t * (1 - t) * (1 - t) + 3 * b * t * t * (1 - t) + t * t * t;
  const fn = (x) => {
    if (x <= 0) return 0;
    if (x >= 1) return 1;
    let lo = 0, hi = 1, t = x;
    for (let i = 0; i < 30; i++) {
      t = (lo + hi) / 2;
      if (bez(x1, x2, t) < x) lo = t; else hi = t;
    }
    return bez(y1, y2, t);
  };
  fn.points = [x1, y1, x2, y2];
  return fn;
}
// The film's motion vocabulary: one gentle in-out for camera, one decisive arrival, one slow-in for reveals.
ease.cam = cubicBezier(0.45, 0, 0.2, 1);       // camera: soft start, long settle
ease.land = cubicBezier(0.16, 1, 0.3, 1);      // objects arriving: fast, then a long glide to rest
ease.whip = cubicBezier(0.7, 0, 0.3, 1);       // whips and dives: slow in, slam, slow out
ease.reveal = cubicBezier(0.33, 0, 0.1, 1);

// Eased progress of x through [a, b].
export const seg = (x, a, b, e = ease.linear) => e(invLerp(a, b, x));

// Keyframes: [[t, value], …] with an ease per segment ([t, value, ease] eases INTO that key). Numbers or arrays.
export function keys(kf, t, defEase = ease.inOutCubic) {
  if (t <= kf[0][0]) return kf[0][1];
  for (let i = 0; i < kf.length - 1; i++) {
    const [t0, v0] = kf[i], [t1, v1, e] = kf[i + 1];
    if (t <= t1) {
      const u = (e || defEase)(t1 > t0 ? (t - t0) / (t1 - t0) : 1);
      if (Array.isArray(v0)) return v0.map((a, j) => a + (v1[j] - a) * u);
      return v0 + (v1 - v0) * u;
    }
  }
  return kf[kf.length - 1][1];
}

// mulberry32: deterministic PRNG so every render is identical.
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

// Halton low-discrepancy sequence: sub-pixel and lens offsets.
export function halton(i, base) {
  let f = 1, r = 0;
  while (i > 0) { f /= base; r += f * (i % base); i = Math.floor(i / base); }
  return r;
}

// Smooth 1D value noise (deterministic), range ≈ [-1, 1]: hand-held breathing, flicker.
function hash1(n) { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); }
export function noise1(x, seed = 0) {
  const i = Math.floor(x), f = x - i;
  const u = f * f * (3 - 2 * f);
  return (lerp(hash1(i + seed * 57.3), hash1(i + 1 + seed * 57.3), u) - 0.5) * 2;
}
export const fbm1 = (x, seed = 0) => noise1(x, seed) * 0.6 + noise1(x * 2.13, seed + 3) * 0.28 + noise1(x * 4.37, seed + 7) * 0.12;

// Exponential decay since the latest event time ≤ t.
export function pulse(t, times, decay) {
  let last = -Infinity;
  for (const e of times) { if (e <= t) last = e; else break; }
  return Number.isFinite(last) ? Math.exp(-(t - last) / decay) : 0;
}

// Catmull–Rom (centripetal enough for our gentle paths) through points [[x,y,z], …] at u ∈ [0, 1].
export function catmull(points, u) {
  const n = points.length - 1;
  const x = clamp(u) * n;
  const i = Math.min(n - 1, Math.floor(x));
  const f = x - i;
  const p0 = points[Math.max(0, i - 1)], p1 = points[i], p2 = points[i + 1], p3 = points[Math.min(n, i + 2)];
  const f2 = f * f, f3 = f2 * f;
  return p1.map((_, k) => 0.5 * ((2 * p1[k]) + (-p0[k] + p2[k]) * f + (2 * p0[k] - 5 * p1[k] + 4 * p2[k] - p3[k]) * f2
    + (-p0[k] + 3 * p1[k] - 3 * p2[k] + p3[k]) * f3));
}

// Focal length (mm, full-frame 36 × 24) → vertical fov in degrees for a 16:9 frame (sensor cropped to 36 × 20.25).
export const fovOf = (mm) => 2 * Math.atan(20.25 / 2 / mm) / DEG;
