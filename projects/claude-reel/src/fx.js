// Global camera/lens language: impacts, kick breathing, letterbox.
import { BEAT } from './config.js';
import { IMPACTS, sec, kickPulse } from './score.js';
import { seg, ease } from './util.js';

const LB = 0.128; // 2.39:1 bars

function fx(t) {
  const gb = t / BEAT;
  let flash = 0, ca = 0, zoom = 1, sx = 0, sy = 0;
  for (const b of IMPACTS) {
    const dt = t - sec(b);
    if (dt < 0 || dt > 1.5) continue;
    const e = Math.exp(-dt / 0.045), s = Math.exp(-dt / 0.22);
    flash = Math.max(flash, 0.45 * e);
    ca += 4.5 * s;
    zoom *= 1 + 0.07 * s;
    sx += 0.006 * s * Math.sin(dt * 90);
    sy += 0.006 * s * Math.cos(dt * 113);
  }
  const kp = gb >= 4 && gb < 27 ? kickPulse(t, 0.09) : 0;
  ca += 0.6 * kp;
  zoom *= 1 + 0.005 * kp;
  let letterbox = 0;
  if (gb < 4.6) letterbox = LB * (1 - seg(gb, 4, 4.5, ease.outExpo));
  else if (gb >= 27 && gb < 28) letterbox = LB * seg(gb, 27, 27.6, ease.inOutCubic);
  else if (gb >= 28) letterbox = LB * (1 - seg(gb, 28, 28.45, ease.outExpo));
  return { flash, ca, zoom, sx, sy, letterbox };
}

export default { id: 'fx', fx };
