// The film's type, set the way apple.com sets its own (its stylesheet, read 2026-10-09: every headline SF Pro Display
// at weight 600; 80 px at line-height 1.05 and −0.015 em, 56 px at 1.07 and −0.005 em, 28 px at 1.14 and +0.007 em —
// tracking tightens as the type grows; eyebrows 600 at +0.009 em). Here in Inter Display (its display cut, OFL), scaled
// to a 1080 × 1920 frame read on a phone. One gradient of light, run continuously across a highlighted word or line,
// never letter by letter; white and grey on the night, near-black and grey on the day.
import { lerp, clamp } from './util.js';

export const FACE = '"Inter Display", "Noto Color Emoji"';
// size (px) → tracking (em): apple.com's curve (−0.015 at 80, −0.005 at 56, +0.007 at 28) extended to the frame's sizes
export function trackFor(size) {
  if (size <= 28) return 0.007;
  if (size <= 56) return lerp(0.007, -0.005, (size - 28) / 28);
  if (size <= 80) return lerp(-0.005, -0.015, (size - 56) / 24);
  return lerp(-0.015, -0.024, clamp((size - 80) / 120));
}
export const leadFor = (size) => (size >= 80 ? 1.05 : size >= 56 ? 1.07 : 1.14);
// the scale: hero (a word or two), headline, caption headline, eyebrow, small
export const TYPE = { hero: 176, headline: 124, caption: 92, sub: 60, eyebrow: 40, small: 34 };
export const INK = { night: '#F5F5F7', nightSoft: '#A1A1A6', day: '#1D1D1F', daySoft: '#6E6E73' };
// the gradient of light (blue → violet → pink → coral), four stops so it runs smooth
export const LIGHT = ['#3A7BFF', '#9B6BFF', '#FF5FA2', '#FF9A4D'];

// a canvas font string and tracking for a size and weight
export function setType(ctx, size, weight = 600) {
  ctx.font = `${weight} ${size}px ${FACE}`;
  ctx.letterSpacing = `${(trackFor(size) * size).toFixed(2)}px`;
}
// the gradient across [x0, x1] (one word or line)
export function lightFill(ctx, x0, x1, stops = LIGHT) {
  const g = ctx.createLinearGradient(x0, 0, x1, 0);
  stops.forEach((c, i) => g.addColorStop(i / (stops.length - 1), c));
  g.__lin = { x0, x1, stops };                    // (type.js drawLine re-lays it for a glyph drawn about its own centre)
  return g;
}
