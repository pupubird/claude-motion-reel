// Global lens language: the drops kick the lens (chromatic aberration, a push, a short shake); the nova also
// flashes. Full-frame flashes are rare and soft (photosensitivity: ≤ 3 large luminance flips per second).
import { BEAT } from '../config.js';
import { B, DROPS, NOVA, SIGN, ROOM, PAYOFF, hitPulse } from '../score.js';

function fx(t) {
  let flash = 0, ca = 0, zoom = 1, sx = 0, sy = 0;
  for (const b of DROPS) {
    const dt = t - B(b);
    if (dt < 0 || dt > 1.5) continue;
    const s = Math.exp(-dt / 0.22);
    ca += (b === NOVA.hit ? 2.2 : 0.35) * s;      // UI-heavy drops get only a whisper of aberration
    zoom *= 1 + (b === NOVA.hit ? 0.03 : 0.018) * s;
    const amp = b === NOVA.hit ? 0.0035 : 0.0018;
    sx += amp * s * Math.sin(dt * 90);
    sy += amp * s * Math.cos(dt * 113);
  }
  // 3D shots breathe on the score's hits; UI shots never move under a hit
  const gb = t / BEAT;
  if (gb >= NOVA.hit && (gb < ROOM.in || gb >= PAYOFF.in) && gb < SIGN.tile) zoom *= 1 + 0.004 * hitPulse(t, 0.1);
  const nv = t - B(NOVA.hit);
  if (nv >= 0 && nv < 0.6) flash = 0.42 * Math.exp(-nv / 0.05);
  const fade = t < 0.034 ? 1 : 0;   // two black frames, then the slide in close-up
  const end = Math.max(0, Math.min(1, (t - B(SIGN.fade0)) / (B(SIGN.fade1) - B(SIGN.fade0))));
  return { flash, flashColor: '#EAF2FF', ca, zoom, sx, sy, fade: Math.max(fade, end * end), vignette: 0.35 };
}

export default { id: 'fx', fx };
