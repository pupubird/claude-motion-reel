// A pane of glass and the pieces it breaks into (v2, the crazy version; CRAZY.md, the hook). The pane is cut once
// into Voronoi cells, small round the point of impact and large at the edges; each cell is a thin bevelled slab of
// glass (one mesh each, so each flies and tumbles on its own). The cells' shared edges are the cracks: before it
// breaks, the scene draws them running out from the impact (cracks()), so the pane breaks exactly where it cracked.
import * as THREE from 'three';
import { rng, TAU } from '../util.js';

// clip a convex polygon to the half-plane where dot(p - m, n) <= 0 (Sutherland–Hodgman)
function clip(poly, m, n) {
  const out = [];
  for (let i = 0; i < poly.length; i++) {
    const a = poly[i], b = poly[(i + 1) % poly.length];
    const da = (a[0] - m[0]) * n[0] + (a[1] - m[1]) * n[1], db = (b[0] - m[0]) * n[0] + (b[1] - m[1]) * n[1];
    if (da <= 0) out.push(a);
    if ((da < 0) !== (db < 0)) { const u = da / (da - db); out.push([a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u]); }
  }
  return out;
}

// → { group, pieces, edges, impact } in the pane's own plane (x right, y up, the pane at z = 0, w × h)
//   pieces: [{ mesh, c: [x, y] (centroid), d (its distance from the impact, 0..1 of the pane's half-diagonal) }]
//   edges:  [{ a: [x, y], b: [x, y], d0, d1 }] the cracks, each end's distance from the impact (0..1)
export function pane({ w, h, impact = [0, 0], count = 52, seed = 7, depth = 0.028, material }) {
  const R = rng(seed);
  const diag = Math.hypot(w, h) / 2;
  const seeds = [];
  for (let i = 0; i < count; i++) {
    if (i < count * 0.55) {
      // dense round the impact: a power law in radius
      const a = R() * TAU, r = Math.pow(R(), 1.8) * diag * 0.55;
      seeds.push([impact[0] + Math.cos(a) * r, impact[1] + Math.sin(a) * r * 1.2]);
    } else seeds.push([(R() - 0.5) * w * 1.04, (R() - 0.5) * h * 1.04]);
  }
  const rect = [[-w / 2, -h / 2], [w / 2, -h / 2], [w / 2, h / 2], [-w / 2, h / 2]];
  const group = new THREE.Group();
  const pieces = [], edgeMap = new Map();
  const dist = (p) => Math.hypot(p[0] - impact[0], p[1] - impact[1]) / diag;
  seeds.forEach((s, i) => {
    let poly = rect;
    seeds.forEach((q, j) => {
      if (i === j || poly.length < 3) return;
      poly = clip(poly, [(s[0] + q[0]) / 2, (s[1] + q[1]) / 2], [q[0] - s[0], q[1] - s[1]]);
    });
    if (poly.length < 3) return;
    const c = poly.reduce((a, p) => [a[0] + p[0] / poly.length, a[1] + p[1] / poly.length], [0, 0]);
    const shape = new THREE.Shape(poly.map(([x, y]) => new THREE.Vector2(x - c[0], y - c[1])));
    const geo = new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: true, bevelThickness: depth * 0.3, bevelSize: depth * 0.28, bevelSegments: 2, curveSegments: 1 });
    geo.translate(0, 0, -depth / 2);
    const mesh = new THREE.Mesh(geo, material);
    mesh.position.set(c[0], c[1], 0);
    group.add(mesh);
    pieces.push({ mesh, c, d: dist(c), seed: R() });
    // its edges, deduplicated (a crack is the edge two cells share; the pane's border is no crack)
    poly.forEach((a, k) => {
      const b = poly[(k + 1) % poly.length];
      const onBorder = (p, q) => (Math.abs(p[0] - q[0]) < 1e-6 && Math.abs(Math.abs(p[0]) - w / 2) < 1e-6) || (Math.abs(p[1] - q[1]) < 1e-6 && Math.abs(Math.abs(p[1]) - h / 2) < 1e-6);
      if (onBorder(a, b)) return;
      const key = [a, b].map((p) => `${p[0].toFixed(4)},${p[1].toFixed(4)}`).sort().join('|');
      if (!edgeMap.has(key)) edgeMap.set(key, { a, b, d0: dist(a), d1: dist(b) });
    });
  });
  return { group, pieces, edges: [...edgeMap.values()], impact, w, h };
}

// the pieces' flight k seconds after the break: out from the impact and at the lens, tumbling, nearer pieces faster
export function fly(P, k, { speed = 1, toward = 1 } = {}) {
  for (const p of P.pieces) {
    const near = 1 - Math.min(1, p.d);
    const dx = p.c[0] - P.impact[0], dy = p.c[1] - P.impact[1], L = Math.hypot(dx, dy) || 1;
    const out = (0.6 + 2.6 * near) * speed * (0.7 + 0.6 * p.seed);
    const go = (1 - Math.exp(-k * 3)) / 3;                            // a hard start, then the air slows them
    const z = (2 + 9 * near) * toward * (0.6 + 0.8 * p.seed) * k;      // at the lens, straight on
    p.mesh.position.set(p.c[0] + (dx / L) * out * go * 2.2, p.c[1] + (dy / L) * out * go * 2.2 - 0.4 * k * k, z);
    const ax = new THREE.Vector3(Math.sin(p.seed * 31), Math.cos(p.seed * 17), Math.sin(p.seed * 7)).normalize();
    p.mesh.quaternion.setFromAxisAngle(ax, k * (4 + 10 * p.seed) * (0.5 + near));
  }
}
