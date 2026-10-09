// The daylight sky every world shot lives in: sky blue above, peach haze below, two soft light pools for depth.
// `tod` (time of day, 0 dawn → 0.5 noon → 1 golden → 1.5 dusk) tints it for the three-day time-lapse.
import { W, H } from '../config.js';
import { mixHex } from '../util.js';
import { C } from '../brand.js';
import { lightAt } from '../v2look.js';

const KEYS = [   // [tod, top, bottom, glow]
  [0.0, '#FFE3D6', '#FFD2C2', '#FFF4E8'],   // dawn
  [0.5, C.sky, C.peach, '#FFFFFF'],         // day (the brand sky)
  [1.0, '#FFD9A8', '#FFC4B0', '#FFF1D6'],   // golden hour
  [1.5, '#C9C2F0', '#F6C6D8', '#FFE9F2'],   // dusk (never night: the film stays light)
];
function at(tod) {
  const k = Math.max(0, Math.min(KEYS.length - 1.001, tod / 0.5));
  const i = Math.floor(k), f = k - i;
  const [, a0, b0, g0] = KEYS[i], [, a1, b1, g1] = KEYS[i + 1];
  return [mixHex(a0, a1, f), mixHex(b0, b1, f), mixHex(g0, g1, f)];
}

// v2: the night, the dawn and the day as three skies, each a gradient (top, middle, bottom) and its lights; the film's
// light level (v2look.lightAt) moves through them (night → dawn over the first half, dawn → day over the second), so
// the sky passes through a sunrise rather than greying between two skies
const NIGHT = { stops: ['#05081A', '#0B0A22', '#170C2C'], glows: [[0.18, 0.22, 1050, '#2047C9', 0.36], [0.88, 0.74, 950, '#9C2A7E', 0.26], [0.5, 0.52, 700, '#4634A0', 0.22]] };
const DAWN = { stops: ['#1B1F5E', '#6A3D9E', '#FF8E70'], glows: [[0.5, 1.02, 1100, '#FFB27A', 0.6], [0.2, 0.25, 900, '#4C5BD6', 0.3], [0.85, 0.6, 800, '#FF6FAE', 0.28]] };
export function drawSky(ctx, { tod = 0.5, glowAt = [0.28, 0.2], glow2 = [0.85, 0.72], alpha = 1, t = null } = {}) {
  const L = t == null ? 1 : lightAt(t);
  ctx.save();
  ctx.globalAlpha *= alpha;
  if (alpha <= 0.001) { ctx.restore(); return; }
  const [top, bot, glow] = at(tod);
  const DAY = { stops: [top, mixHex(top, bot, 0.5), bot], glows: [[glowAt[0], glowAt[1], 900, glow, 0.75], [glow2[0], glow2[1], 700, glow, 0.45]] };
  const [A, B, u] = L < 0.5 ? [NIGHT, DAWN, L * 2] : [DAWN, DAY, (L - 0.5) * 2];
  const g = ctx.createLinearGradient(0, 0, 0, H);
  [0, 0.6, 1].forEach((p, i) => g.addColorStop(p, mixHex(A.stops[i], B.stops[i], u)));
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  const a0 = ctx.globalAlpha;
  for (const [set, k] of [[A, 1 - u], [B, u]]) {
    for (const [gx, gy, r, col, a] of set.glows) {
      if (a * k < 0.005) continue;
      const rg = ctx.createRadialGradient(gx * W, gy * H, 0, gx * W, gy * H, r);
      rg.addColorStop(0, col); rg.addColorStop(1, col.startsWith('#') ? `${col}00` : 'rgba(255,255,255,0)');
      ctx.globalAlpha = a0 * a * k;
      ctx.fillStyle = rg; ctx.fillRect(0, 0, W, H);
    }
  }
  ctx.restore();
}
