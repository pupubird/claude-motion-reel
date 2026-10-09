// Shared look-dev effects for the v2 labs (not a scene: scenes/index.js never lists it).
import { TAU } from '../util.js';

// A glint: the lens's star on a highlight that catches the key — two long streaks, two short ones, a hot core and a
// halo; it flashes up in two frames, its streaks stretch as it dies, and it turns a little. d: seconds since it struck.
export function glint(ctx, x, y, size, d, dur = 0.35, { color = '255,222,160', rot = 0.35 } = {}) {
  if (d < 0 || d > dur || size < 1) return;
  const a = (d < 0.035 ? d / 0.035 : Math.exp(-(d - 0.035) * 9)) * (1 - d / dur);
  if (a < 0.01) return;
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rot + d * 0.6);
  const streak = (len, th, al) => {
    ctx.save();
    ctx.scale(len, th);
    const g = ctx.createRadialGradient(0, 0, 0, 0, 0, 1);
    g.addColorStop(0, `rgba(${color},${al})`); g.addColorStop(0.3, `rgba(${color},${al * 0.3})`); g.addColorStop(1, `rgba(${color},0)`);
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, 1, 0, TAU); ctx.fill();
    ctx.restore();
  };
  const L = size * (1.1 + 0.9 * (1 - a));
  streak(L * 1.6, Math.max(1.2, size * 0.05), a);
  ctx.rotate(Math.PI / 2); streak(L * 1.6, Math.max(1.2, size * 0.05), a);
  ctx.rotate(Math.PI / 4); streak(L * 0.6, Math.max(1, size * 0.035), a * 0.6);
  ctx.rotate(Math.PI / 2); streak(L * 0.6, Math.max(1, size * 0.035), a * 0.6);
  // on a light world a white flare vanishes: the flare carries colour — a warm core and a thin prismatic ring
  const ring = ctx.createRadialGradient(0, 0, size * 0.42, 0, 0, size * 0.62);
  ring.addColorStop(0, 'rgba(120,200,255,0)'); ring.addColorStop(0.35, `rgba(120,200,255,${a * 0.28})`);
  ring.addColorStop(0.6, `rgba(255,140,200,${a * 0.22})`); ring.addColorStop(1, 'rgba(255,140,200,0)');
  ctx.fillStyle = ring; ctx.beginPath(); ctx.arc(0, 0, size * 0.62, 0, TAU); ctx.fill();
  const g = ctx.createRadialGradient(0, 0, 0, 0, 0, size * 0.5);
  g.addColorStop(0, `rgba(255,255,255,${a})`); g.addColorStop(0.18, `rgba(${color},${a * 0.55})`); g.addColorStop(1, `rgba(${color},0)`);
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, size * 0.5, 0, TAU); ctx.fill();
  ctx.restore();
}

// An anamorphic flare: the long thin streak a wide lens draws through a bright light, its soft halo, and a few ghosts
// strung along the line from the light through the frame's centre. k: its strength (0..1).
export function flare(ctx, x, y, k, { W = 1080, H = 1920, color = '255,228,190', streak = '150,190,255' } = {}) {
  if (k <= 0.005) return;
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  // the streak: a horizontal line of light the width of the frame, hot at the source
  const g = ctx.createLinearGradient(0, 0, W, 0);
  const fx = x / W;
  g.addColorStop(0, `rgba(${streak},0)`); g.addColorStop(Math.max(0, fx - 0.25), `rgba(${streak},${0.18 * k})`);
  g.addColorStop(fx, `rgba(255,255,255,${0.75 * k})`); g.addColorStop(Math.min(1, fx + 0.25), `rgba(${streak},${0.18 * k})`); g.addColorStop(1, `rgba(${streak},0)`);
  ctx.fillStyle = g;
  ctx.fillRect(0, y - 2.5, W, 5);
  ctx.globalAlpha = 0.5; ctx.fillRect(0, y - 9, W, 18);
  ctx.globalAlpha = 1;
  // the halo
  const h = ctx.createRadialGradient(x, y, 0, x, y, 260);
  h.addColorStop(0, `rgba(${color},${0.5 * k})`); h.addColorStop(0.35, `rgba(${color},${0.12 * k})`); h.addColorStop(1, `rgba(${color},0)`);
  ctx.fillStyle = h; ctx.fillRect(x - 260, y - 260, 520, 520);
  // ghosts along the line through the centre
  const cx = W / 2, cy = H / 2;
  for (const [u, r, col, a] of [[-0.35, 60, '120,170,255', 0.10], [-0.7, 34, '255,150,200', 0.12], [-1.15, 120, '160,255,220', 0.05], [0.4, 22, '255,220,150', 0.14]]) {
    const gx = cx + (x - cx) * u, gy = cy + (y - cy) * u;
    const q = ctx.createRadialGradient(gx, gy, r * 0.6, gx, gy, r);
    q.addColorStop(0, `rgba(${col},${a * k * 0.4})`); q.addColorStop(0.85, `rgba(${col},${a * k})`); q.addColorStop(1, `rgba(${col},0)`);
    ctx.fillStyle = q; ctx.beginPath(); ctx.arc(gx, gy, r, 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();
}
