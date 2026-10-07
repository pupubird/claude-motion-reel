// The operator. A keyed camera ({ t, pos, target, fov, roll, ease }) eased key to key, plus the three layers that make
// a keyed camera feel operated (onetake's lesson, from the method only): a hand — a slow two-sine float, scaled by
// distance and faded to zero in the holds — a shake on every landing (decaying, deterministic), and keys placed to
// lead what they frame (a key ~0.1 s ahead of the subject follows it; a key at the landing before a snap whips to it).
import { clamp, lerp, ease as E } from './util.js';

const lerp3 = (a, b, u) => [lerp(a[0], b[0], u), lerp(a[1], b[1], u), lerp(a[2], b[2], u)];
const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);

// keys sorted by t; each key's ease shapes the move INTO it. Positions interpolate linearly in the eased parameter,
// but the distance to the target interpolates in log space (a dolly from 60 to 6 should not crawl the last metres).
export function keyed(keys, t) {
  if (t <= keys[0].t) return { ...keys[0] };
  const last = keys[keys.length - 1];
  if (t >= last.t) return { ...last };
  let i = 1;
  while (keys[i].t < t) i++;
  const a = keys[i - 1], b = keys[i];
  const u = (b.ease || E.inOutCubic)(clamp((t - a.t) / (b.t - a.t)));
  const tgt = lerp3(a.target, b.target, u);
  // the offset from the target: direction slerped by lerp-normalise, length in log space
  const oa = a.pos.map((v, k) => v - a.target[k]), ob = b.pos.map((v, k) => v - b.target[k]);
  const la = Math.hypot(...oa), lb = Math.hypot(...ob);
  const dir = lerp3(oa.map((v) => v / la), ob.map((v) => v / lb), u);
  const dl = Math.hypot(...dir) || 1;
  const len = Math.exp(lerp(Math.log(la), Math.log(lb), u));
  return {
    pos: dir.map((v, k) => tgt[k] + (v / dl) * len),
    target: tgt,
    fov: lerp(a.fov ?? 35, b.fov ?? 35, u),
    roll: lerp(a.roll ?? 0, b.roll ?? 0, u),
  };
}

// the hand: a float in world units proportional to the distance to the target, faded by env (0 = dead still)
export function hand(cam, t, env, amp = 0.006) {
  if (env <= 0) return cam;
  const d = dist(cam.pos, cam.target) * amp * env;
  const fx = Math.sin(1.7 * t) + 0.6 * Math.sin(2.9 * t + 1.0);
  const fy = Math.sin(1.3 * t + 2.0) + 0.5 * Math.sin(3.3 * t);
  return { ...cam, pos: [cam.pos[0] + fx * d, cam.pos[1] + fy * d, cam.pos[2]], target: [cam.target[0] + fx * d * 0.4, cam.target[1] + fy * d * 0.4, cam.target[2]], roll: (cam.roll ?? 0) + 0.0025 * env * Math.sin(1.1 * t + 0.5) };
}

// shakes in screen pixels: hits [[t, amp, decay, freq]] → { x, y, rot }; zero before each hit
export function shake(t, hits) {
  let x = 0, y = 0, rot = 0;
  for (const [t0, amp, decay = 0.12, freq = 26] of hits) {
    const dt = t - t0;
    if (dt < 0 || dt > decay * 6) continue;
    const e = amp * Math.exp(-dt / decay);
    const s = t0 * 13.7;
    x += e * (Math.sin(dt * freq * 6.283 * 0.53 + s) * 0.7 + Math.sin(dt * freq * 6.283 * 1.31 + s * 2.1) * 0.3);
    y += e * (Math.sin(dt * freq * 6.283 * 0.61 + s * 1.7) * 0.7 + Math.sin(dt * freq * 6.283 * 1.13 + s * 0.3) * 0.3);
    rot += e * 0.00045 * Math.sin(dt * freq * 6.283 * 0.47 + s * 0.9);
  }
  return { x, y, rot };
}
