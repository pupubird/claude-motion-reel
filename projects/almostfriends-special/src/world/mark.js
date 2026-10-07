// The mark and the app icon. The mark: two circles sharing one wall (a double bubble: centres one radius apart, the wall
// flat). Left blue, right coral — two people, one conversation.
import { C, P } from '../brand.js';
import { TAU, rgba } from '../util.js';
import { squirclePath } from '../ui/kit.js';

export function drawMark(ctx, cx, cy, r, { t = 0, wall = 1, alpha = 1, wob = 0 } = {}) {
  const d = r;
  ctx.save();
  ctx.globalAlpha *= alpha;
  for (const [side, color] of [[-1, C.blue], [1, P.family.color]]) {
    ctx.save();
    ctx.beginPath();
    if (side < 0) ctx.rect(cx - 4 * r, cy - 4 * r, 4 * r, 8 * r); else ctx.rect(cx, cy - 4 * r, 4 * r, 8 * r);
    ctx.clip();
    const x = cx + side * d / 2, rr = r * (1 + wob * side * 0.04);
    const g = ctx.createRadialGradient(x - r * 0.35, cy - r * 0.4, r * 0.1, x, cy, rr);
    g.addColorStop(0, rgba(color, 0.88)); g.addColorStop(1, color);
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.arc(x, cy, rr, 0, TAU); ctx.fill();
    // a window highlight: it is a bubble
    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.beginPath(); ctx.ellipse(x - r * 0.42, cy - r * 0.42, r * 0.17, r * 0.09, -0.7, 0, TAU); ctx.fill();
    ctx.restore();
  }
  // the shared wall
  const half = r * Math.sqrt(3) / 2;
  ctx.strokeStyle = '#FFFFFF'; ctx.lineWidth = Math.max(2, r * 0.07) * wall; ctx.lineCap = 'round';
  if (wall > 0.01) { ctx.beginPath(); ctx.moveTo(cx, cy - half); ctx.lineTo(cx, cy + half); ctx.stroke(); }
  ctx.restore();
}


// The app icon: a white squircle (iOS proportions: radius ≈ 22.5 % of the side) holding the mark, with a soft shadow.
// The app icon on the home screen of the film (the hook builds it, the launch opens it).
export const APP_ICON = { x: 540, y: 470, size: 250 };
export const ICON_RADIUS = 0.225;                     // corner radius / size

export function drawAppIcon(ctx, cx, cy, size, { t = 0, alpha = 1, wob = 0 } = {}) {
  if (size < 1 || alpha <= 0.002) return;
  ctx.save();
  ctx.globalAlpha *= alpha;
  const path = squirclePath(cx - size / 2, cy - size / 2, size, size, size * ICON_RADIUS);
  ctx.shadowColor = 'rgba(11,27,63,0.18)'; ctx.shadowBlur = size * 0.18; ctx.shadowOffsetY = size * 0.06;
  ctx.fillStyle = '#FFFFFF';
  ctx.fill(path);
  ctx.shadowColor = 'transparent';
  drawMark(ctx, cx, cy, size * 0.27, { t, wob });
  ctx.restore();
}
