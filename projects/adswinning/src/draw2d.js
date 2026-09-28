// Canvas-2D helpers shared by every layer: type, shapes, glyph-level animation.
import { FONTS } from './config.js';

// ctx.font from a spec. `ls` is letter-spacing in em (display type is tracked negative).
export function font(ctx, { w = 400, s = 100, f = FONTS.display, i = false, ls = 0 } = {}) {
  ctx.font = `${i ? 'italic ' : ''}${Math.round(w)} ${s}px ${f}`;
  ctx.letterSpacing = `${(ls * s).toFixed(2)}px`;
}

// Per-glyph x offsets measured from prefixes, so kerning survives per-letter animation.
export function advances(ctx, text) {
  const x = [];
  for (let i = 0; i < text.length; i++) x.push(ctx.measureText(text.slice(0, i)).width);
  return { x, total: ctx.measureText(text).width };
}

export function rrect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
}

export function fillR(ctx, x, y, w, h, r, color) {
  ctx.fillStyle = color;
  rrect(ctx, x, y, w, h, r);
  ctx.fill();
}

// Hairline stroke aligned to the pixel grid (0.5 px inset) so 1 px borders stay crisp.
export function strokeR(ctx, x, y, w, h, r, color, lw = 1) {
  ctx.strokeStyle = color;
  ctx.lineWidth = lw;
  rrect(ctx, x + lw / 2, y + lw / 2, w - lw, h - lw, Math.max(0, r - lw / 2));
  ctx.stroke();
}

// Draw a string glyph-by-glyph; fn(ctx, i, ch) may transform (ctx is at the glyph origin).
export function eachGlyph(ctx, text, x, y, fn) {
  const { x: adv } = advances(ctx, text);
  for (let i = 0; i < text.length; i++) {
    ctx.save();
    ctx.translate(x + adv[i], y);
    if (fn(ctx, i, text[i]) !== false) ctx.fillText(text[i], 0, 0);
    ctx.restore();
  }
}

// Rise-through-a-mask reveal for one line of display type: p 0 → 1 slides the line up
// out of a clip whose floor is the baseline + descender.
export function maskLine(ctx, text, x, y, size, p, { lineH = 1.0 } = {}) {
  ctx.save();
  ctx.beginPath();
  ctx.rect(x - size, y - size * lineH, ctx.measureText(text).width + size * 2, size * (lineH + 0.28));
  ctx.clip();
  ctx.fillText(text, x, y + (1 - p) * size * 1.1);
  ctx.restore();
}

const GLYPHS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789$%#+=<>/';
// Text-scramble decode: characters resolve left-to-right as p goes 0 → 1.
export function scramble(text, p, seed = 0) {
  let out = '';
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    const local = p * (text.length + 6) - i;
    if (ch === ' ' || local >= 6) out += ch;
    else if (local <= 0) out += ' ';
    else out += GLYPHS[Math.floor(Math.abs(Math.sin((i + 1) * 91.7 + Math.floor(local * 3) * 13.3 + seed)) * GLYPHS.length) % GLYPHS.length];
  }
  return out;
}

// Linear gradient helper.
export function vgrad(ctx, y0, y1, stops) {
  const g = ctx.createLinearGradient(0, y0, 0, y1);
  for (const [o, c] of stops) g.addColorStop(o, c);
  return g;
}

export const rgba = (hex, a) => {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
};
