// Tileable 3D noise for volumes, generated once on the CPU (deterministic):
//   R = Perlin–Worley (billowy cloud base, after Schneider 2015), G/B/A = Worley fBm at 2×, 4×, 8× frequency.
import * as THREE from 'three';

function hash3(x, y, z, s) {
  let h = (x * 374761393 + y * 668265263 + z * 2147483647 + s * 1442695041) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  h ^= h >>> 16;
  return (h >>> 0) / 4294967296;
}

// gradient noise, period P (integer lattice wraps)
function perlin(x, y, z, P, seed) {
  const xi = Math.floor(x), yi = Math.floor(y), zi = Math.floor(z);
  const xf = x - xi, yf = y - yi, zf = z - zi;
  const fade = (t) => t * t * t * (t * (t * 6 - 15) + 10);
  const u = fade(xf), v = fade(yf), w = fade(zf);
  const g = (ix, iy, iz, dx, dy, dz) => {
    const a = ((ix % P) + P) % P, b = ((iy % P) + P) % P, c = ((iz % P) + P) % P;
    const h = hash3(a, b, c, seed);
    const th = h * Math.PI * 2, ph = Math.acos(2 * hash3(a, b, c, seed + 17) - 1);
    return Math.sin(ph) * Math.cos(th) * dx + Math.sin(ph) * Math.sin(th) * dy + Math.cos(ph) * dz;
  };
  const l = (a, b, t) => a + (b - a) * t;
  return l(
    l(l(g(xi, yi, zi, xf, yf, zf), g(xi + 1, yi, zi, xf - 1, yf, zf), u), l(g(xi, yi + 1, zi, xf, yf - 1, zf), g(xi + 1, yi + 1, zi, xf - 1, yf - 1, zf), u), v),
    l(l(g(xi, yi, zi + 1, xf, yf, zf - 1), g(xi + 1, yi, zi + 1, xf - 1, yf, zf - 1), u), l(g(xi, yi + 1, zi + 1, xf, yf - 1, zf - 1), g(xi + 1, yi + 1, zi + 1, xf - 1, yf - 1, zf - 1), u), v),
    w);
}

// inverted Worley F1 (1 at a feature point), period P cells
function worley(x, y, z, P, seed) {
  const xi = Math.floor(x), yi = Math.floor(y), zi = Math.floor(z);
  let d = 9;
  for (let k = -1; k <= 1; k++) for (let j = -1; j <= 1; j++) for (let i = -1; i <= 1; i++) {
    const cx = xi + i, cy = yi + j, cz = zi + k;
    const a = ((cx % P) + P) % P, b = ((cy % P) + P) % P, c = ((cz % P) + P) % P;
    const px = cx + hash3(a, b, c, seed), py = cy + hash3(a, b, c, seed + 3), pz = cz + hash3(a, b, c, seed + 7);
    const dd = (px - x) ** 2 + (py - y) ** 2 + (pz - z) ** 2;
    if (dd < d) d = dd;
  }
  return 1 - Math.min(1, Math.sqrt(d));
}

const remap = (v, a, b, c, d) => c + ((v - a) / (b - a)) * (d - c);

export function cloudNoise(N = 64, seed = 7) {
  const data = new Uint8Array(N * N * N * 4);
  const F = 4;   // base cells across the tile
  let i = 0;
  for (let z = 0; z < N; z++) for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
    const fx = (x / N) * F, fy = (y / N) * F, fz = (z / N) * F;
    // Perlin fBm, 3 octaves
    let p = 0, amp = 1, norm = 0;
    for (let o = 0; o < 3; o++) { const s = 2 ** o; p += perlin(fx * s, fy * s, fz * s, F * s, seed + o) * amp; norm += amp; amp *= 0.5; }
    p = p / norm * 0.5 + 0.5;
    const w1 = worley(fx, fy, fz, F, seed + 11), w2 = worley(fx * 2, fy * 2, fz * 2, F * 2, seed + 12), w3 = worley(fx * 4, fy * 4, fz * 4, F * 4, seed + 13);
    const wf = w1 * 0.625 + w2 * 0.25 + w3 * 0.125;
    const pw = Math.min(1, Math.max(0, remap(p, wf - 1, 1, 0, 1)));
    const g = worley(fx * 2, fy * 2, fz * 2, F * 2, seed + 21);
    const b = worley(fx * 4, fy * 4, fz * 4, F * 4, seed + 22);
    const a = worley(fx * 8, fy * 8, fz * 8, F * 8, seed + 23);
    data[i++] = Math.round(pw * 255); data[i++] = Math.round(g * 255); data[i++] = Math.round(b * 255); data[i++] = Math.round(a * 255);
  }
  const tex = new THREE.Data3DTexture(data, N, N, N);
  tex.format = THREE.RGBAFormat;
  tex.type = THREE.UnsignedByteType;
  tex.minFilter = THREE.LinearFilter;
  tex.magFilter = THREE.LinearFilter;
  tex.wrapS = tex.wrapT = tex.wrapR = THREE.RepeatWrapping;
  tex.unpackAlignment = 1;
  tex.needsUpdate = true;
  return tex;
}
