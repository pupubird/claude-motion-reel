// Global camera/lens language: impacts on the drops, kick breathing inside the grooves.
import { BEAT } from './config.js';
import { IMPACTS, B, kickPulse } from './score.js';

function fx(t) {
  const gb = t / BEAT;
  let flash = 0, ca = 0, zoom = 1, sx = 0, sy = 0;
  for (const b of IMPACTS) {
    const dt = t - B(b);
    if (dt < 0 || dt > 1.5) continue;
    const e = Math.exp(-dt / 0.045), s = Math.exp(-dt / 0.22);
    flash = Math.max(flash, 0.32 * e);
    ca += 3.2 * s;
    zoom *= 1 + 0.05 * s;
    sx += 0.004 * s * Math.sin(dt * 90);
    sy += 0.004 * s * Math.cos(dt * 113);
  }
  const groove = (gb >= 8 && gb < 47.5) || (gb >= 56 && gb < 62);
  const kp = groove ? kickPulse(t, 0.09) : 0;
  ca += 0.45 * kp;
  zoom *= 1 + 0.004 * kp;
  return { flash, ca, zoom, sx, sy };
}

export default { id: 'fx', fx };
