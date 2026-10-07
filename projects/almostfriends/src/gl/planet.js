// A planet of people: the hook's "8 billion people" — the Earth made of soap-glass bubbles, one per person (the same
// orbs as the universe), the land in warm colours and the sea in cool ones, so it reads as the world at a glance.
// A dense shell over a sphere (a Fibonacci cover: even, no poles), seen whole on frame 0, then the camera dives in.
//   const P = planet(); scene.add(P.mesh); rotate it with P.mesh.rotation.y = P.face(lon) + spin
import { crowdField } from './universe.js';
import { landAt } from '../assets.js';
import { P } from '../brand.js';

const GOLD = Math.PI * (3 - Math.sqrt(5));
// land: green (most), amber, coral; sea: blue and cyan (no violet: research-hooks.md §10.4); ice: a pale film
export const PLANET_COLORS = [P.wealth.color, P.adventure.color, P.family.color, P.career.color, P.learning.color, '#E6EEFF'];
const pick = (R, w) => { let u = R() * w.reduce((a, b) => a + b, 0); for (let i = 0; i < w.length; i++) { u -= w[i]; if (u <= 0) return i; } return w.length - 1; };

export function planet({ count = 16000, radius = 10, seed = 21 } = {}) {
  const f = crowdField({
    count, seed, colors: PLANET_COLORS, isMatch: null, segs: [18, 12],
    place: (R, i) => {
      const k = i + 0.5, y = 1 - (2 * k) / count, rr = Math.sqrt(1 - y * y), th = GOLD * k + (R() - 0.5) * 0.05;
      const r = radius * (1 + Math.pow(R(), 1.8) * 0.08);
      return { x: Math.sin(th) * rr * r, y: y * r, z: Math.cos(th) * rr * r, s: radius * (0.014 + Math.pow(R(), 2.2) * 0.024) };
    },
    paint: (R, i, x, y, z) => {
      const L = Math.hypot(x, y, z), lat = Math.asin(y / L) * 180 / Math.PI, lon = Math.atan2(x, z) * 180 / Math.PI;
      const land = landAt(lat, lon) > 0.5;
      if (land && Math.abs(lat) > 62) return [5, R() < 0.5 ? 0 : 3];
      if (land) { const a = pick(R, [0.72, 0.16, 0.12]); return [a, pick(R, [0.5, 0.3, 0.2])]; }
      return [R() < 0.8 ? 3 : 4, R() < 0.6 ? 3 : 4];
    },
  });
  // the rotation about y that brings longitude `lon` (degrees) to face +z
  f.face = (lon) => -lon * Math.PI / 180;
  f.uniforms.uGlobeR.value = radius;
  return f;
}
