// Live tube geometry: a doubled ring that splits and weaves into torus knots.
// Rebuilt on the CPU every sub-frame with parallel-transport frames.
import * as THREE from 'three';
import { TAU } from '../util.js';

const SEG = 720, RAD = 36;

function curve(u, m1, m2, out) {
  const phi = u * TAU;
  // Doubled circle → (2,3) trefoil → (2,5) cinquefoil.
  const q = 3 + 2 * m2;
  const Rk = 1.5, rk = 0.62;
  const cr = Rk + rk * Math.cos(q * phi);
  const kx = cr * Math.cos(2 * phi), ky = cr * Math.sin(2 * phi), kz = rk * Math.sin(q * phi);
  const ox = Rk * Math.cos(2 * phi), oy = Rk * Math.sin(2 * phi);
  out.set(ox + (kx - ox) * m1, oy + (ky - oy) * m1, kz * m1);
  return out;
}

export function makeTube() {
  const count = (SEG + 1) * (RAD + 1);
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(count * 3), 3));
  geo.setAttribute('normal', new THREE.BufferAttribute(new Float32Array(count * 3), 3));
  const idx = [];
  for (let i = 0; i < SEG; i++) {
    for (let j = 0; j < RAD; j++) {
      const a = i * (RAD + 1) + j, b = (i + 1) * (RAD + 1) + j;
      idx.push(a, a + 1, b, b, a + 1, b + 1);
    }
  }
  geo.setIndex(idx);
  geo.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 4);
  return geo;
}

const P = [], T = [];
for (let i = 0; i <= SEG; i++) { P.push(new THREE.Vector3()); T.push(new THREE.Vector3()); }
const N = new THREE.Vector3(), B = new THREE.Vector3(), tmp = new THREE.Vector3(), a = new THREE.Vector3(), b = new THREE.Vector3();

// Fill geometry for morph weights m1 (ring→trefoil), m2 (trefoil→cinquefoil) and tube radius r.
export function updateTube(geo, m1, m2, r) {
  for (let i = 0; i <= SEG; i++) {
    const u = i / SEG;
    curve(u, m1, m2, P[i]);
    curve(u + 1e-4, m1, m2, a);
    curve(u - 1e-4, m1, m2, b);
    T[i].subVectors(a, b).normalize();
  }
  // Initial normal: any vector perpendicular to T0.
  tmp.set(0, 0, 1);
  if (Math.abs(T[0].dot(tmp)) > 0.9) tmp.set(1, 0, 0);
  N.crossVectors(T[0], tmp).normalize();
  const pos = geo.attributes.position.array, nor = geo.attributes.normal.array;
  let k = 0;
  for (let i = 0; i <= SEG; i++) {
    if (i > 0) { N.addScaledVector(T[i], -N.dot(T[i])).normalize(); }
    B.crossVectors(T[i], N);
    for (let j = 0; j <= RAD; j++) {
      const v = (j / RAD) * TAU, c = Math.cos(v), s = Math.sin(v);
      const nx = c * N.x + s * B.x, ny = c * N.y + s * B.y, nz = c * N.z + s * B.z;
      pos[k] = P[i].x + r * nx; pos[k + 1] = P[i].y + r * ny; pos[k + 2] = P[i].z + r * nz;
      nor[k] = nx; nor[k + 1] = ny; nor[k + 2] = nz;
      k += 3;
    }
  }
  geo.attributes.position.needsUpdate = true;
  geo.attributes.normal.needsUpdate = true;
}

// Sample `count` points on the tube surface (local space) — seeds for the particle burst.
export function sampleTube(geo, count, R) {
  const pos = geo.attributes.position.array;
  const out = new Float32Array(count * 3);
  const at = (i, j, o) => (i * (RAD + 1) + j) * 3 + o;
  for (let n = 0; n < count; n++) {
    const i = Math.floor(R() * SEG), j = Math.floor(R() * RAD), fu = R(), fv = R();
    for (let o = 0; o < 3; o++) {
      const p00 = pos[at(i, j, o)], p10 = pos[at(i + 1, j, o)], p01 = pos[at(i, j + 1, o)], p11 = pos[at(i + 1, j + 1, o)];
      out[n * 3 + o] = (p00 * (1 - fu) + p10 * fu) * (1 - fv) + (p01 * (1 - fu) + p11 * fu) * fv;
    }
  }
  return out;
}
