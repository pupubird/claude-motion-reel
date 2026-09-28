// Easing, interpolation and deterministic randomness.
export const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
export const lerp = (a, b, t) => a + (b - a) * t;
export const invLerp = (a, b, x) => clamp((x - a) / (b - a));
export const fract = (x) => x - Math.floor(x);
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
  outElastic: (t) => (t <= 0 ? 0 : t >= 1 ? 1 : pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * (TAU / 3)) + 1),
  outBounce: (x) => {
    const n1 = 7.5625, d1 = 2.75;
    if (x < 1 / d1) return n1 * x * x;
    if (x < 2 / d1) return n1 * (x -= 1.5 / d1) * x + 0.75;
    if (x < 2.5 / d1) return n1 * (x -= 2.25 / d1) * x + 0.9375;
    return n1 * (x -= 2.625 / d1) * x + 0.984375;
  },
};

// Eased progress of x through [a, b].
export const seg = (x, a, b, e = ease.linear) => e(invLerp(a, b, x));

// Damped spring step response 0 → 1 (mass 1), t in seconds.
export function spring(t, k = 170, c = 9) {
  if (t <= 0) return 0;
  const w0 = Math.sqrt(k), z = c / (2 * w0);
  if (z < 1) {
    const wd = w0 * Math.sqrt(1 - z * z);
    return 1 - Math.exp(-z * w0 * t) * (Math.cos(wd * t) + ((z * w0) / wd) * Math.sin(wd * t));
  }
  return 1 - Math.exp(-w0 * t) * (1 + w0 * t);
}

// CSS-style cubic-bezier timing function (bisection on x; monotone for x1, x2 in [0,1]).
export function cubicBezier(x1, y1, x2, y2) {
  const bez = (a, b, t) => 3 * a * t * (1 - t) * (1 - t) + 3 * b * t * t * (1 - t) + t * t * t;
  const fn = (x) => {
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

export const hash1 = (n) => fract(Math.sin(n * 127.1 + 311.7) * 43758.5453);

// Exponential decay since the latest event time ≤ t (times sorted ascending, seconds).
export function pulse(t, times, decay) {
  let last = -1;
  for (const e of times) { if (e <= t) last = e; else break; }
  return last < 0 ? 0 : Math.exp(-(t - last) / decay);
}

// Smooth pseudo-random wobble (sum of sines), deterministic.
export const wobble = (t, seed = 0) =>
  Math.sin(t * 1.7 + seed * 3.1) * 0.5 + Math.sin(t * 2.9 + seed * 1.3) * 0.3 + Math.sin(t * 5.3 + seed * 7.7) * 0.2;

export const smoothstep = (a, b, x) => { const t = clamp((x - a) / (b - a)); return t * t * (3 - 2 * t); };
export const mix = lerp;

// The product's one easing curve (--ease-out-quint in app/src/index.css) and GSAP's names for the rest.
ease.brand = cubicBezier(0.32, 0.72, 0, 1);
ease.power2Out = ease.outCubic;
ease.power3InOut = ease.inOutQuart;

// Halton low-discrepancy sequence: sub-pixel jitter offsets for temporal anti-aliasing.
export function halton(i, base) {
  let f = 1, r = 0;
  while (i > 0) { f /= base; r += f * (i % base); i = Math.floor(i / base); }
  return r;
}

// Seconds-based spring settle used for "lands and settles" moves; returns 0 → 1 with overshoot.
export const settle = (dt, k = 260, c = 18) => spring(Math.max(0, dt), k, c);
