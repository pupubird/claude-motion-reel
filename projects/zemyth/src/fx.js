// Global camera/lens language: impacts on the drops, kick breathing inside the grooves.
import { BEAT } from './config.js';
import { IMPACTS, B, kickPulse, GROOVE } from './score.js';

function fx(t) {
  const gb = t / BEAT;
  let flash = 0, ca = 0, zoom = 1, sx = 0, sy = 0;
  for (const b of IMPACTS) {
    const dt = t - B(b);
    if (dt < 0 || dt > 1.5) continue;
    const e = Math.exp(-dt / 0.045), s = Math.exp(-dt / 0.22);
    flash = Math.max(flash, 0 * e);   // no wash: on black + lime a flash reads as olive mud
    ca += 1.7 * s;
    zoom *= 1 + 0.035 * s;
    sx += 0.003 * s * Math.sin(dt * 90);
    sy += 0.003 * s * Math.cos(dt * 113);
  }
  const kp = GROOVE(gb) ? kickPulse(t, 0.09) : 0;
  ca += 0.35 * kp;
  zoom *= 1 + 0.003 * kp;
  return { flash, flashColor: '#F4FF9A', ca, zoom, sx, sy };
}

export default { id: 'fx', fx };
