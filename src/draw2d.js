// Small canvas-2D helpers shared by the typographic scenes.
import { FONTS } from './config.js';

export function font(ctx, { w = 400, s = 100, f = FONTS.sans, i = false } = {}) {
  ctx.font = `${i ? 'italic ' : ''}${Math.round(w)} ${s}px ${f}`;
}

// Per-glyph x offsets measured from prefixes, so kerning survives per-letter animation.
export function advances(ctx, text) {
  const x = [];
  for (let i = 0; i < text.length; i++) x.push(ctx.measureText(text.slice(0, i)).width);
  return { x, total: ctx.measureText(text).width };
}

export function fillBg(ctx, color, W, H) {
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, W, H);
}

export function rrect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
}

// Draw a string glyph-by-glyph, letting fn transform each glyph (ctx is pre-translated to its origin).
export function eachGlyph(ctx, text, x, y, fn) {
  const { x: adv } = advances(ctx, text);
  for (let i = 0; i < text.length; i++) {
    ctx.save();
    ctx.translate(x + adv[i], y);
    if (fn(ctx, i, text[i]) !== false) ctx.fillText(text[i], 0, 0);
    ctx.restore();
  }
}

const GLYPHS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#%&*/+=<>';
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
