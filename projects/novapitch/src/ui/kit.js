// Product UI primitives at film scale, from relatefy/frontend (dark theme): glass cards, hairlines, chips, buttons.
// Everything takes a scale `k` so a component can be drawn at 1:1 product size (k = 1) or blown up for the film.
import { C, FONTS, GRAD_BRAND } from '../config.js';
import { cssGradient } from '../type.js';

export function rr(ctx, x, y, w, h, r) { ctx.beginPath(); ctx.roundRect(x, y, w, h, r); }

export function text(ctx, s, x, y, { f = FONTS.sans, w = 400, size = 16, color = C.white, track = 0, align = 'left', base = 'alphabetic' } = {}) {
  ctx.font = `${w} ${size}px ${f}`;
  ctx.letterSpacing = `${track}px`;
  ctx.textAlign = align;
  ctx.textBaseline = base;
  ctx.fillStyle = color;
  ctx.fillText(s, x, y);
  ctx.letterSpacing = '0px';
  if (globalThis.__textlog) globalThis.__textlog.push({ s, a: ctx.globalAlpha, dy: 0 });   // reading-time audit
  return ctx.measureText(s).width;
}

export function measure(ctx, s, { f = FONTS.sans, w = 400, size = 16, track = 0 } = {}) {
  ctx.font = `${w} ${size}px ${f}`;
  ctx.letterSpacing = `${track}px`;
  const m = ctx.measureText(s).width;
  ctx.letterSpacing = '0px';
  return m;
}

// .glass-card: white 5 % over the navy, 1 px white 8 % border, the inset top sheen + hairline of --card-shadow
export function glass(ctx, x, y, w, h, r = 16, { fill = C.card, border = C.hair, sheen = true } = {}) {
  rr(ctx, x, y, w, h, r);
  ctx.fillStyle = fill;
  ctx.fill();
  ctx.lineWidth = 1;
  ctx.strokeStyle = border;
  rr(ctx, x + 0.5, y + 0.5, w - 1, h - 1, r);
  ctx.stroke();
  if (sheen) {
    ctx.save();
    rr(ctx, x, y, w, h, r);
    ctx.clip();
    ctx.strokeStyle = 'rgba(255,255,255,0.07)';
    ctx.beginPath();
    ctx.moveTo(x + r, y + 1.5);
    ctx.lineTo(x + w - r, y + 1.5);
    ctx.stroke();
    ctx.restore();
  }
}

// a neutral pill chip ("Deck · Slide 5")
export function chip(ctx, s, x, y, { size = 16, pad = 10, h = null, fill = 'rgba(255,255,255,0.08)', color = C.text2, w = 500, border = null, icon = null } = {}) {
  const tw = measure(ctx, s, { size, w });
  const H = h ?? Math.round(size * 1.9);
  const iw = icon ? size * 1.05 + 6 : 0;
  const W = tw + pad * 2 + iw;
  rr(ctx, x, y, W, H, H / 2);
  ctx.fillStyle = fill;
  ctx.fill();
  if (border) { ctx.strokeStyle = border; ctx.lineWidth = 1; rr(ctx, x + 0.5, y + 0.5, W - 1, H - 1, H / 2); ctx.stroke(); }
  if (icon) icon(x + pad, y + (H - size * 1.05) / 2, size * 1.05);
  text(ctx, s, x + pad + iw, y + H / 2 + size * 0.36, { size, w, color });
  return W;
}

// .btn-nova: the brand gradient face with its cobalt glow
export function novaButton(ctx, x, y, w, h, r = 12, glow = 1) {
  ctx.save();
  ctx.shadowColor = `rgba(37,99,235,${0.3 * glow})`;
  ctx.shadowBlur = 16;
  ctx.shadowOffsetY = 4;
  rr(ctx, x, y, w, h, r);
  ctx.fillStyle = cssGradient(ctx, x, y, w, h, GRAD_BRAND);
  ctx.fill();
  ctx.restore();
}

// The site's How-it-works step number (.home-step-num): a gradient tile, radius 10/32 of its size, a white
// Plus Jakarta 700 numeral at 15/32. `roll` ∈ [0,1] rolls the numeral up to the next one (drawn by the caller).
export function stepBadge(ctx, x, y, size, numeral, { scale = 1, roll = 0, next = null } = {}) {
  if (scale <= 0.001) return;
  ctx.save();
  ctx.translate(x + size / 2, y + size / 2);
  ctx.scale(scale, scale);
  ctx.translate(-size / 2, -size / 2);
  ctx.save();
  ctx.shadowColor = 'rgba(37,99,235,0.45)'; ctx.shadowBlur = size * 0.35; ctx.shadowOffsetY = size * 0.06;
  rr(ctx, 0, 0, size, size, size * 10 / 32);
  ctx.fillStyle = cssGradient(ctx, 0, 0, size, size, GRAD_BRAND);
  ctx.fill();
  ctx.restore();
  rr(ctx, 0, 0, size, size, size * 10 / 32); ctx.clip();
  const fs = size * 15 / 32 * 1.1;
  // the numeral rolls: the outgoing one lifts out as the incoming one rises in
  const r = Math.min(1, Math.max(0, roll));
  const base = size / 2 + fs * 0.36;
  if (r < 1) text(ctx, numeral, size / 2, base - r * size, { f: FONTS.display, w: 700, size: fs, align: 'center' });
  if (next && r > 0) text(ctx, next, size / 2, base + (1 - r) * size, { f: FONTS.display, w: 700, size: fs, align: 'center' });
  ctx.restore();
}
