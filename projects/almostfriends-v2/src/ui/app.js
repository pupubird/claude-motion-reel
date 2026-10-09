// The almost friends app at film scale: shared chrome for its screens. The app lives in the brand's sky (its screens
// are sky-gradient, not flat grey); controls follow iOS 26 (44 pt glass circles, a glass title pill, a floating
// composer). Geometry in points; k = px per pt (full bleed: 1080 px = 402 pt → k ≈ 2.687; the screen is 874 pt tall).
import { W, SH } from '../config.js';
import { C, FONTS, UI } from '../brand.js';
import { squirclePath, text, measure } from './kit.js';
import { icon } from './icons.js';
import { drawBubble2D, drawBubFace } from '../world/bubble2d.js';

export const K = W / 402;

// The app's background: its own sky (lighter than the film's world sky so the UI reads as a screen)
export function appSky(ctx, x = 0, y = 0, w = W, h = SH, a = 1) {
  ctx.save();
  ctx.globalAlpha *= a;
  const g = ctx.createLinearGradient(0, y, 0, y + h);
  g.addColorStop(0, '#EAF4FF'); g.addColorStop(0.55, '#F7F5FF'); g.addColorStop(1, '#FFF1EA');
  ctx.fillStyle = g; ctx.fillRect(x, y, w, h);
  ctx.restore();
}

// A Liquid Glass control: translucent white, a bright top edge, soft shadow (HIG: controls float above content).
export function glass(ctx, path, { a = 1, k = K } = {}) {
  ctx.save();
  ctx.globalAlpha *= a;
  ctx.shadowColor = 'rgba(11,27,63,0.10)'; ctx.shadowBlur = 10 * k; ctx.shadowOffsetY = 3 * k;
  ctx.fillStyle = 'rgba(255,255,255,0.72)';
  ctx.fill(path);
  ctx.shadowColor = 'transparent';
  ctx.lineWidth = 1.2;
  ctx.strokeStyle = 'rgba(255,255,255,0.95)';
  ctx.stroke(path);
  ctx.restore();
}

// Top chrome: status bar + island, a back circle, and a centred glass title pill with an avatar drawer.
//   avatar(ctx, cx, cy, r) draws the orb; title / sub are the pill's lines.
export function topBar(ctx, t, { k = K, title, sub = null, avatar = null, right = null, ox = 0, oy = 0 } = {}) {
  // the status bar and Dynamic Island are the phone's (ui/phone.js draws them over every screen)
  const y0 = oy + 62 * k;
  // back
  glass(ctx, squirclePath(ox + 16 * k, y0, 44 * k, 44 * k, 22 * k), { k });
  icon(ctx, 'chevron-left', ox + 26 * k, y0 + 10 * k, 24 * k, UI.ink, 2.2);
  // centre: avatar above a title pill (the Messages header pattern)
  const cx = ox + W / 2;
  if (avatar) avatar(ctx, cx, y0 + 22 * k, 22 * k);
  const tw = measure(ctx, title, { f: FONTS.ui, w: 650, size: 15 * k }) + 24 * k;
  const pillY = y0 + 48 * k;
  glass(ctx, squirclePath(cx - tw / 2, pillY, tw, 26 * k, 13 * k), { k });
  text(ctx, title, cx, pillY + 18 * k, { f: FONTS.ui, w: 650, size: 15 * k, color: UI.ink, align: 'center' });
  if (sub) text(ctx, sub, cx, pillY + 26 * k + 17 * k, { f: FONTS.ui, w: 550, size: 12.5 * k, color: UI.ink2, align: 'center' });
  if (right) right(ctx, ox + W - 60 * k, y0, k);
}

// Bub as an avatar (2D): the iridescent bubble with its face, happy by default.
export function bubAvatar(t, face = {}) {
  return (ctx, cx, cy, r) => { drawBubble2D(ctx, cx, cy, r, { t, seed: 9 }); drawBubFace(ctx, cx, cy, r, { happy: 1, blush: 0.5, ...face }); };
}

// A small "AI" tag (HIG: say clearly where AI is used)
export function aiTag(ctx, x, y, k = K) {
  const w = 30 * k, h = 20 * k;
  ctx.fillStyle = 'rgba(29,79,240,0.12)';
  ctx.fill(squirclePath(x, y, w, h, h / 2));
  text(ctx, 'AI', x + w / 2, y + h / 2 + 4.6 * k, { f: FONTS.ui, w: 750, size: 12 * k, color: C.blue, align: 'center' });
}
