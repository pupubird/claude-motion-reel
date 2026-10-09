// Liquid placed by the 2D layout. The released film lays out its UI shots in frame pixels (1080×1920); the special
// edition's bubbles are raymarched in 3D (gl/liquid.js). The engine renders 2D-placed liquid through one fixed lens,
// SCREEN_CAM, looking down −z at the plane z = 0 from d units away: a narrow lens, so a sphere drawn here lands where
// the 2D layout put its circle (off-axis stretch ≤ 1 % at the frame's edge).
//   sp(x, y, z)  frame pixels (x, y) → the world point at depth z (z > 0 is toward the lens)
//   sr(r, z)     a radius in frame pixels at depth z → world units
//   bubPrim(b)   Bub as a liquid primitive with the face painted on his film
import { W, H } from './config.js';
import { LIGHT_ORB, BUB_LIGHT } from './v2look.js';

export const SCREEN_CAM = { fov: 30, d: 10 };
const TAN = Math.tan((SCREEN_CAM.fov * Math.PI) / 360);
export const pxPerUnit = (z = 0) => H / (2 * (SCREEN_CAM.d - z) * TAN);

export const sp = (x, y, z = 0) => { const k = pxPerUnit(z); return [(x - W / 2) / k, (H / 2 - y) / k, z]; };
export const sr = (r, z = 0) => r / pxPerUnit(z);
// world → frame pixels (for 2D drawn against a screen-placed bubble)
export const toScreen = ([x, y, z]) => { const k = pxPerUnit(z); return [W / 2 + x * k, H / 2 - y * k, k]; };

const norm = (v) => { const L = Math.hypot(...v) || 1; return v.map((c) => c / L); };

// Bub: a clear soap bubble with a face. b = { pos (world), r, squash (+ stretch along squashDir, − squash), squashDir,
// gaze [x, y] (added to the look at the lens), camPos, blink, happy, wide, squint, look, blush, eyeScale, faceAlpha,
// group, k, fill, c1, c2, c3, glow, alpha } → { prim, face }
export function bubPrim(b) {
  const s = b.squash ?? 0;
  const sy = 1 + s, sx = 1 / Math.sqrt(Math.max(0.2, sy));
  const cam = b.camPos ?? [0, 0, SCREEN_CAM.d];
  const dir = b.faceDir ? norm(b.faceDir) : norm(cam.map((v, k) => v - b.pos[k]));
  const quat = b.squashDir ? quatFromY(norm(b.squashDir)) : [0, 0, 0, 1];
  return {
    // v2: a glass orb with light inside (v2look.LIGHT_ORB): his own light, or your colours once he has drunk them
    prim: {
      type: 'sphere', pos: b.pos, size: [b.r], scale: [sx, sy, sx], quat, face: true, group: b.group ?? 1, k: b.k ?? 0.2,
      wobble: b.wobble ?? 0.012, seed: 9, ...LIGHT_ORB, coreSeed: 2,
      tint: b.c1 ?? BUB_LIGHT.tint, c2: b.c2 ?? BUB_LIGHT.c2, c3: b.c3 ?? BUB_LIGHT.c3, alpha: b.alpha ?? 1,
    },
    face: {
      dir: norm([dir[0] + (b.gaze?.[0] ?? 0), dir[1] + (b.gaze?.[1] ?? 0), dir[2] + (b.gaze?.[2] ?? 0)]), up: b.up ?? [0, 1, 0],
      blink: b.blink ?? 0, happy: b.happy ?? 0, wide: b.wide ?? 0, squint: b.squint ?? 0, look: b.look ?? [0, 0],
      blush: b.blush ?? 0.6, eyeScale: b.eyeScale ?? 1, alpha: b.faceAlpha ?? 1, style: 1,
    },
  };
}

// the rotation taking +y to the unit vector n (a squash axis), as [x, y, z, w]
export function quatFromY(n) {
  const [x, y, z] = n;
  const d = y;                                   // dot((0,1,0), n)
  if (d < -0.999999) return [1, 0, 0, 0];
  const c = [z, 0, -x];                          // cross((0,1,0), n) = (1·z − 0·y, 0·x − 0·z, 0·y − 1·x)
  const w = 1 + d;
  const L = Math.hypot(c[0], c[1], c[2], w);
  return [c[0] / L, c[1] / L, c[2] / L, w / L];
}
// the rotation taking +z to the unit vector n (a wall's normal), as [x, y, z, w]
export function quatFromZ(n) {
  const [x, y, z] = n;
  if (z < -0.999999) return [0, 1, 0, 0];
  const c = [-y, x, 0];                          // cross((0,0,1), n)
  const w = 1 + z;
  const L = Math.hypot(c[0], c[1], c[2], w);
  return [c[0] / L, c[1] / L, c[2] / L, w / L];
}

// A person's orb: their three priorities as inks inside a soap film (the 2D drawColorOrb, made of liquid)
export const INK_ORB = { type: 'sphere', ...LIGHT_ORB, wobble: 0.006 };       // v2: their colours as light in glass
export const inkOf = (colors) => ({ tint: colors[0], c2: colors[1] ?? colors[0], c3: colors[2] ?? colors[1] ?? colors[0] });
// the shared wall's film
export const WALL = { type: 'wall', thick: 360, seed: 5.5, env: 1.6, rim: 1.0, haze: 0.04, edge: 0 };
// the flat wall two touching bubbles share, between centres a and b (frame px) of radius r (frame px)
export function wallBetween(a, b, r, opt = {}) {
  const d = Math.hypot(b[0] - a[0], b[1] - a[1]);
  if (d >= 2 * r - 0.5) return null;
  const n = [(b[0] - a[0]) / d, -(b[1] - a[1]) / d, 0];
  return { type: 'wall', pos: sp((a[0] + b[0]) / 2, (a[1] + b[1]) / 2), size: [sr(Math.sqrt(r * r - (d * d) / 4))], quat: quatFromZ(n),
    thick: 360, seed: 5.5, env: 1.6, rim: 1.0, haze: 0.04, edge: 0, ...opt };
}
