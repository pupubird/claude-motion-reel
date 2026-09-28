// Keyframe helpers. Time is always in beats (gb) so choreography reads like the score.
import { ease, clamp, lerp } from './util.js';

// kf([[b0, v0], [b1, v1, ease?], …], gb): piecewise, each segment eased by its destination key's ease.
export function kf(keys, gb) {
  if (gb <= keys[0][0]) return keys[0][1];
  for (let i = 1; i < keys.length; i++) {
    const [b1, v1, e = ease.inOutCubic] = keys[i];
    if (gb < b1) {
      const [b0, v0] = keys[i - 1];
      return lerp(v0, v1, e(clamp((gb - b0) / (b1 - b0))));
    }
  }
  return keys[keys.length - 1][1];
}

// Damped settle toward 1 after `at` (beats→seconds handled by caller); overshoot ~ k.
export function settleOvershoot(p, k = 1.70158) { return p <= 0 ? 0 : p >= 1 ? 1 : ease.outBack(p, k); }

// A blink: open → closed → open with a small overshoot; returns openness 0.1–1.05.
export function blink(gb, at, close = 0.15, open = 0.28) {
  if (gb < at || gb > at + close + open) return 1;
  if (gb < at + close) return lerp(1, 0.1, ease.inQuad((gb - at) / close));
  const p = (gb - at - close) / open;
  return lerp(0.1, 1, ease.outBack(p, 2.2));
}
