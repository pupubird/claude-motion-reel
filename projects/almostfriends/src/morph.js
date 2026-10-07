// Shape morphing and particles for 2D motion graphics.
// Shapes are closed outlines resampled to N points evenly spaced by arc length; a morph lerps corresponding points
// after rotating B's start index to the alignment with the least squared travel (no twisting through the middle).
import { lerp, rng, TAU, clamp } from './util.js';

export const N = 240;

// Resample a dense closed polyline [[x,y],…] to n points evenly spaced by arc length.
export function resample(pts, n = N) {
  const L = [0];
  for (let i = 1; i <= pts.length; i++) {
    const a = pts[i - 1], b = pts[i % pts.length];
    L.push(L[i - 1] + Math.hypot(b[0] - a[0], b[1] - a[1]));
  }
  const total = L[L.length - 1];
  const out = [];
  let j = 0;
  for (let k = 0; k < n; k++) {
    const d = (k / n) * total;
    while (L[j + 1] < d) j++;
    const a = pts[j], b = pts[(j + 1) % pts.length];
    const u = (d - L[j]) / Math.max(1e-9, L[j + 1] - L[j]);
    out.push([lerp(a[0], b[0], u), lerp(a[1], b[1], u)]);
  }
  return out;
}

// Dense outlines (clockwise in screen space, starting at the top centre so default alignments are sensible).
export function circle(cx, cy, r, n = 720) {
  const p = [];
  for (let i = 0; i < n; i++) { const a = -Math.PI / 2 + (i / n) * TAU; p.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]); }
  return p;
}

// Rounded rectangle with per-corner radii [tl, tr, br, bl] (circular corners; at film scale the difference from a
// squircle is invisible mid-morph) and an optional tail at the bottom-left or bottom-right corner.
export function roundRect(x, y, w, h, r, { tail = null, tailSize = 0 } = {}) {
  const [tl, tr, br, bl] = (Array.isArray(r) ? r : [r, r, r, r]).map((v) => Math.min(v, w / 2, h / 2));
  const p = [];
  const arc = (cx, cy, rad, a0, a1, steps = 48) => { for (let i = 0; i <= steps; i++) { const a = a0 + (a1 - a0) * (i / steps); p.push([cx + rad * Math.cos(a), cy + rad * Math.sin(a)]); } };
  const line = (x0, y0, x1, y1, steps = 40) => { for (let i = 1; i < steps; i++) p.push([lerp(x0, x1, i / steps), lerp(y0, y1, i / steps)]); };
  p.push([x + w / 2, y]);
  line(x + w / 2, y, x + w - tr, y);
  arc(x + w - tr, y + tr, tr, -Math.PI / 2, 0);
  line(x + w, y + tr, x + w, y + h - br);
  if (tail === 'right') { p.push([x + w, y + h - br * 0.4]); p.push([x + w + tailSize * 0.55, y + h + tailSize * 0.12]); p.push([x + w - tailSize * 0.6, y + h]); }
  else arc(x + w - br, y + h - br, br, 0, Math.PI / 2);
  line(x + w - br, y + h, x + bl, y + h);
  if (tail === 'left') { p.push([x + tailSize * 0.6, y + h]); p.push([x - tailSize * 0.55, y + h + tailSize * 0.12]); p.push([x, y + h - bl * 0.4]); }
  else arc(x + bl, y + h - bl, bl, Math.PI / 2, Math.PI);
  line(x, y + h - bl, x, y + tl);
  arc(x + tl, y + tl, tl, Math.PI, Math.PI * 1.5);
  line(x + tl, y, x + w / 2, y, 20);
  return p;
}

// A heart (classic parametric), centred at (cx, cy), width ≈ 2r.
export function heart(cx, cy, r, n = 720) {
  const p = [];
  for (let i = 0; i < n; i++) {
    const t = Math.PI + (i / n) * TAU;     // start at the top notch
    const x = 16 * Math.sin(t) ** 3;
    const y = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t);
    p.push([cx + (x / 16) * r, cy - (y / 16) * r]);
  }
  return p;
}

// A soft blob: a circle whose radius breathes with a few seeded harmonics (wobble amount a ∈ [0, 0.3]).
export function blob(cx, cy, r, a, t, seed = 1, n = 720) {
  const R = rng(seed);
  const h = [2, 3, 5].map((k) => ({ k, ph: R() * TAU, sp: 0.6 + R() * 0.9, amp: 0.4 + R() * 0.6 }));
  const p = [];
  for (let i = 0; i < n; i++) {
    const ang = -Math.PI / 2 + (i / n) * TAU;
    let d = 0;
    for (const { k, ph, sp, amp } of h) d += Math.sin(k * ang + ph + t * sp) * amp;
    const rr = r * (1 + (a * d) / 2);
    p.push([cx + rr * Math.cos(ang), cy + rr * Math.sin(ang)]);
  }
  return p;
}

// Rotate b's index so it best matches a (least total squared distance); both already resampled to the same n.
export function align(a, b) {
  const n = a.length;
  let best = 0, bestD = Infinity;
  for (let s = 0; s < n; s += 2) {
    let d = 0;
    for (let i = 0; i < n; i += 4) { const p = a[i], q = b[(i + s) % n]; d += (p[0] - q[0]) ** 2 + (p[1] - q[1]) ** 2; }
    if (d < bestD) { bestD = d; best = s; }
  }
  return b.map((_, i) => b[(i + best) % n]);
}

export function morph(a, b, t) {
  return a.map((p, i) => [lerp(p[0], b[i][0], t), lerp(p[1], b[i][1], t)]);
}

export function toPath(pts) {
  const p = new Path2D();
  p.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length; i++) p.lineTo(pts[i][0], pts[i][1]);
  p.closePath();
  return p;
}

// Confetti / droplets: a deterministic ballistic burst. Each particle is a pure function of time since `t0`
// (gravity, quadratic drag approximated by exponential velocity decay, spin), so any frame renders in any order.
export function burst(seed, count, { speed = [600, 1400], spread = TAU, dir = -Math.PI / 2, gravity = 1800, drag = 2.2, life = [1.0, 1.8], size = [10, 22], colors = ['#fff'] } = {}) {
  const R = rng(seed);
  return Array.from({ length: count }, () => {
    const a = dir + (R() - 0.5) * spread;
    const v = lerp(speed[0], speed[1], R());
    return {
      vx: Math.cos(a) * v, vy: Math.sin(a) * v, spin: (R() - 0.5) * 14, rot0: R() * TAU,
      life: lerp(life[0], life[1], R()), size: lerp(size[0], size[1], R()), color: colors[Math.floor(R() * colors.length)],
      shape: R() < 0.55 ? 'dot' : R() < 0.8 ? 'pill' : 'tri', flutter: R() * TAU,
    };
  });
}

// Position of particle q at dt seconds after the burst from (x0, y0): velocity decays as e^(−drag·t), gravity pulls.
export function particleAt(q, x0, y0, dt, gravity = 1800, drag = 2.2) {
  const e = Math.exp(-drag * dt);
  const k = (1 - e) / drag;                          // ∫ e^(−drag·s) ds
  const vt = gravity / drag;                         // terminal-ish fall speed under drag
  return {
    x: x0 + q.vx * k + Math.sin(dt * 6 + q.flutter) * 14 * clamp(dt),
    y: y0 + q.vy * k + vt * (dt - k),
    rot: q.rot0 + q.spin * dt,
    a: clamp((q.life - dt) / 0.3),
  };
}

// A droplet as a tiny lens: a faint body darker than a light background, a crisp specular dot and a soft
// contact rim, stretched along its velocity (a streak at speed). Reads on pastel grounds where a white dot vanishes.
export function drawDroplet(ctx, x, y, r, vx, vy, a = 1, tint = [150, 140, 200]) {
  if (a <= 0.01 || r <= 0.3) return;
  const sp = Math.hypot(vx, vy);
  const st = Math.min(3.2, 1 + sp / 900);
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(Math.atan2(vy, vx));
  ctx.scale(st, 1 / Math.sqrt(st));
  ctx.globalAlpha *= a;
  const g = ctx.createRadialGradient(-r * 0.25, -r * 0.3, r * 0.1, 0, 0, r);
  g.addColorStop(0, 'rgba(255,255,255,0.95)');
  g.addColorStop(0.35, `rgba(${tint[0]},${tint[1]},${tint[2]},0.22)`);
  g.addColorStop(0.85, `rgba(${tint[0] * 0.7},${tint[1] * 0.7},${tint[2] * 0.85},0.45)`);
  g.addColorStop(1, `rgba(${tint[0] * 0.7},${tint[1] * 0.7},${tint[2] * 0.85},0)`);
  ctx.fillStyle = g;
  ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}
