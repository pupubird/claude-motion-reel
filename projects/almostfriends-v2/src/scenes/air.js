// The air of the phone's world (special edition, second pass): soap bubbles drifting up through the sky the phone and
// its captions stand in. They are at every depth, so each move of the lens parts them (near ones slide fast, far ones
// slow), and a few rise through each caption, just in front of its words, bending them as they pass (the liquid
// refracts what lies behind it). This is what makes the words part of the place rather than a layer on it.
import * as THREE from 'three';
import { rng, clamp, smoothstep } from '../util.js';
import { capFrame } from './steps.js';

// a soap bubble: thin film, clear in the middle, its colour at the rim
const SOAP_AIR = { type: 'sphere', thick: 410, haze: 0.03, rim: 1.4, edge: 0.5, env: 1.2, frost: 0.45, wobble: 0.012 };
// lanes through a caption: [where across it (0 left – 1 right), how far in front of it (units), radius, when it is
// level with the caption's middle (s after the caption arrives), rise speed (units/s)]
const LANES = {
  0: [[0.62, 0.42, 0.13, 0.9, 0.34], [0.2, 0.75, 0.085, 4.4, 0.3]],
  2: [[0.7, 0.45, 0.12, 1.1, 0.33], [0.15, 0.8, 0.08, 2.4, 0.36]],
  3: [[0.55, 0.5, 0.14, 1.6, 0.3], [0.85, 0.9, 0.09, 4.2, 0.34], [0.25, 0.4, 0.1, 6.0, 0.32]],
  4: [[0.68, 0.45, 0.12, 0.9, 0.34]],
};
// and the rest of the air, round the phone: [x, z, radius, rise speed, phase] (world; the screen is 1 wide at z = 0)
const R = rng(905);
const FREE = Array.from({ length: 7 }, (_, i) => {
  const side = i % 2 ? 1 : -1;
  return [side * (0.75 + R() * 1.6), -2.6 + R() * 3.4 * (i < 5 ? 0.6 : 1), 0.05 + R() * 0.12, 0.16 + R() * 0.16, R() * 10];
});
const SPAN = 7;                                   // the free bubbles wrap through this much height (off frame)

const _p = new THREE.Vector3(), _q = new THREE.Vector3();
const V = (v) => [v.x, v.y, v.z];
// cam: the lens they are seen through; a bubble nearing it fades (a close-up never has one smack into the lens)
export function airPrims(t, cam, { group = 80 } = {}) {
  const prims = [];
  let g = group;
  const near = (p, r) => smoothstep(r * 2 + 0.15, r * 2 + 0.75, _q.set(...p).distanceTo(cam.position));
  for (const [ci, lanes] of Object.entries(LANES)) {
    const f = capFrame(Number(ci));
    if (f.world !== 'phone' || t < f.at - 2 || t > f.out + 3) continue;
    for (const [ox, dz, r, mid, v] of lanes) {
      const k = (t - f.at - mid) * v;                              // its height above the caption's middle (units)
      const vis = smoothstep(-2.2, -1.6, k) * (1 - smoothstep(1.6, 2.2, k));
      if (vis <= 0.002) continue;
      _p.copy(f.pos).addScaledVector(f.right, (ox - 0.5) * f.w + 0.05 * Math.sin(t * 1.3 + mid)).addScaledVector(f.toward, dz).addScaledVector(f.up, k);
      const pos = V(_p);
      prims.push({ ...SOAP_AIR, pos, size: [r * (1 + 0.015 * Math.sin(t * 3 + mid))], alpha: vis * near(pos, r), seed: 3.1 + mid, group: g++ });
    }
  }
  FREE.forEach(([x, z, r, v, ph]) => {
    const y = ((t * v + ph) % SPAN + SPAN) % SPAN - SPAN / 2;
    const vis = smoothstep(-SPAN / 2, -SPAN / 2 + 0.6, y) * (1 - smoothstep(SPAN / 2 - 0.6, SPAN / 2, y));
    const pos = [x + 0.06 * Math.sin(t * 0.9 + ph), y, z];
    prims.push({ ...SOAP_AIR, pos, size: [r], alpha: vis * near(pos, r), seed: ph, group: g++ });
  });
  return prims;
}
