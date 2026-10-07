// A 2D camera for the UI shots: a scale about a focus point, a whisper of roll, and spring "kicks" on events (a tap,
// a message landing). Drawn as a canvas transform, so UI stays vector-sharp at any zoom (a post-process zoom would
// resample the frame).
import { spring } from './util.js';

export function applyCam(ctx, { s = 1, fx = 540, fy = 960, rot = 0 }) {
  ctx.translate(fx, fy);
  if (rot) ctx.rotate(rot);
  ctx.scale(s, s);
  ctx.translate(-fx, -fy);
}
export const camPoint = ({ s = 1, fx = 540, fy = 960 }, x, y) => [fx + (x - fx) * s, fy + (y - fy) * s];

// A sum of damped kicks: each event pushes the zoom by `amp` and springs back (no overshoot below zero matters here).
export function kicks(t, times, amp = 0.012, decay = 7, freq = 18) {
  let k = 0;
  for (const t0 of times) { const d = t - t0; if (d > 0 && d < 1.2) k += amp * Math.exp(-d * decay) * Math.cos(d * freq); }
  return k;
}
