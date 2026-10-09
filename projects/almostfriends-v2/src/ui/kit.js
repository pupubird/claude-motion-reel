// UI primitives for the mock app, drawn at film scale. Every size is in iOS points × K (the film's scale), so a
// component can be drawn at its true phone proportions and blown up to read on a phone-sized video.
import { FONTS } from '../brand.js';
import { clamp } from '../util.js';

// iOS continuous corners ("squircle"), after figma-squircle's corner construction: each corner spends
// p = (1 + smoothing)·r of its edges on two Béziers around a shortened circular arc, so curvature ramps up instead
// of jumping at the tangent point. smoothing 0.6 ≈ iOS.
function corner(r, s, budget) {
  let p = (1 + s) * r;
  const maxS = budget / r - 1;
  s = Math.max(0, Math.min(s, maxS));
  p = Math.min(p, budget);
  const rad = (d) => (d * Math.PI) / 180;
  const arc = 90 * (1 - s);
  const arcLen = Math.sin(rad(arc / 2)) * r * Math.SQRT2;
  const alpha = (90 - arc) / 2;
  const p34 = r * Math.tan(rad(alpha / 2));
  const beta = 45 * s;
  const c = p34 * Math.cos(rad(beta));
  const d = c * Math.tan(rad(beta));
  const b = (p - arcLen - c - d) / 3;
  const a = 2 * b;
  return { a, b, c, d, p, arcLen, r };
}

// r: one radius or [topLeft, topRight, bottomRight, bottomLeft]; each corner spends at most half the short side.
export function squirclePath(x, y, w, h, r, s = 0.6) {
  const rs = (Array.isArray(r) ? r : [r, r, r, r]).map((v) => Math.max(0, Math.min(v, w / 2, h / 2)));
  const budget = Math.min(w, h) / 2;
  const K = rs.map((v) => (v < 0.5 ? null : corner(v, s, budget)));
  const f = (n) => n.toFixed(3);
  const P = (k) => (k ? k.p : 0);
  let d = `M ${f(x + w - P(K[1]))} ${f(y)} `;
  const tr = K[1], br = K[2], bl = K[3], tl = K[0];
  if (tr) d += `c ${f(tr.a)} 0 ${f(tr.a + tr.b)} 0 ${f(tr.a + tr.b + tr.c)} ${f(tr.d)} a ${f(tr.r)} ${f(tr.r)} 0 0 1 ${f(tr.arcLen)} ${f(tr.arcLen)} c ${f(tr.d)} ${f(tr.c)} ${f(tr.d)} ${f(tr.b + tr.c)} ${f(tr.d)} ${f(tr.a + tr.b + tr.c)} `;
  d += `L ${f(x + w)} ${f(y + h - P(br))} `;
  if (br) d += `c 0 ${f(br.a)} 0 ${f(br.a + br.b)} ${f(-br.d)} ${f(br.a + br.b + br.c)} a ${f(br.r)} ${f(br.r)} 0 0 1 ${f(-br.arcLen)} ${f(br.arcLen)} c ${f(-br.c)} ${f(br.d)} ${f(-(br.b + br.c))} ${f(br.d)} ${f(-(br.a + br.b + br.c))} ${f(br.d)} `;
  d += `L ${f(x + P(bl))} ${f(y + h)} `;
  if (bl) d += `c ${f(-bl.a)} 0 ${f(-(bl.a + bl.b))} 0 ${f(-(bl.a + bl.b + bl.c))} ${f(-bl.d)} a ${f(bl.r)} ${f(bl.r)} 0 0 1 ${f(-bl.arcLen)} ${f(-bl.arcLen)} c ${f(-bl.d)} ${f(-bl.c)} ${f(-bl.d)} ${f(-(bl.b + bl.c))} ${f(-bl.d)} ${f(-(bl.a + bl.b + bl.c))} `;
  d += `L ${f(x)} ${f(y + P(tl))} `;
  if (tl) d += `c 0 ${f(-tl.a)} 0 ${f(-(tl.a + tl.b))} ${f(tl.d)} ${f(-(tl.a + tl.b + tl.c))} a ${f(tl.r)} ${f(tl.r)} 0 0 1 ${f(tl.arcLen)} ${f(-tl.arcLen)} c ${f(tl.c)} ${f(-tl.d)} ${f(tl.b + tl.c)} ${f(-tl.d)} ${f(tl.a + tl.b + tl.c)} ${f(-tl.d)} `;
  d += 'Z';
  return new Path2D(d);
}

export function rr(ctx, x, y, w, h, r) { ctx.beginPath(); ctx.roundRect(x, y, w, h, r); }

// Text with the reading-time log. Returns the advance width.
export function text(ctx, s, x, y, { f = FONTS.ui, w = 400, size = 16, color = '#000', track = 0, align = 'left', base = 'alphabetic', log = true } = {}) {
  ctx.font = `${Math.round(w)} ${size}px ${f}`;
  ctx.letterSpacing = `${track}px`;
  ctx.textAlign = align;
  ctx.textBaseline = base;
  ctx.fillStyle = color;
  ctx.fillText(s, x, y);
  const m = ctx.measureText(s).width;
  ctx.letterSpacing = '0px';
  if (log && globalThis.__textlog) globalThis.__textlog.push({ s, a: ctx.globalAlpha, dy: 0 });
  return m;
}

export function measure(ctx, s, { f = FONTS.ui, w = 400, size = 16, track = 0 } = {}) {
  ctx.font = `${Math.round(w)} ${size}px ${f}`;
  ctx.letterSpacing = `${track}px`;
  const m = ctx.measureText(s).width;
  ctx.letterSpacing = '0px';
  return m;
}

// Soft layered shadow under a path (two passes: a tight contact shadow and a wide ambient one).
export function shadowed(ctx, path, fill, { c = 'rgba(40,20,80,', k = 1, lift = 1 } = {}) {
  ctx.save();
  ctx.fillStyle = fill;
  ctx.shadowColor = `${c}${0.10 * lift})`; ctx.shadowBlur = 40 * k * lift; ctx.shadowOffsetY = 18 * k * lift;
  ctx.fill(path);
  ctx.shadowColor = `${c}${0.08 * lift})`; ctx.shadowBlur = 6 * k; ctx.shadowOffsetY = 2 * k;
  ctx.fill(path);
  ctx.restore();
}

// Scale about a point: run `fn` inside a transform that scales by (sx, sy) about (cx, cy).
export function about(ctx, cx, cy, sx, sy, fn) {
  if (sx <= 0.0005 || sy <= 0.0005) return;
  ctx.save();
  ctx.translate(cx, cy);
  ctx.scale(sx, sy);
  ctx.translate(-cx, -cy);
  fn();
  ctx.restore();
}

export const alpha = (ctx, a, fn) => { if (a <= 0.002) return; ctx.save(); ctx.globalAlpha *= clamp(a); fn(); ctx.restore(); };
