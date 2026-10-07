// The daylight sky every world shot lives in: sky blue above, peach haze below, two soft light pools for depth.
// `tod` (time of day, 0 dawn → 0.5 noon → 1 golden → 1.5 dusk) tints it for the three-day time-lapse.
import { W, H } from '../config.js';
import { mixHex } from '../util.js';
import { C } from '../brand.js';

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

export function drawSky(ctx, { tod = 0.5, glowAt = [0.28, 0.2], glow2 = [0.85, 0.72], alpha = 1 } = {}) {
  const [top, bot, glow] = at(tod);
  ctx.save();
  ctx.globalAlpha *= alpha;
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, top); g.addColorStop(1, bot);
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  for (const [gx, gy, r, a] of [[glowAt[0], glowAt[1], 900, 0.75], [glow2[0], glow2[1], 700, 0.45]]) {
    const rg = ctx.createRadialGradient(gx * W, gy * H, 0, gx * W, gy * H, r);
    rg.addColorStop(0, glow); rg.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.globalAlpha = alpha * a;
    ctx.fillStyle = rg; ctx.fillRect(0, 0, W, H);
  }
  ctx.restore();
}
