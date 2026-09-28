// The Zembit's geometry, built from primitives so every part can be rigged:
// a superquadric head, a visor patch that follows the head's front surface, a bevelled rim,
// stacked headphone rings (lathe), a lathe torso, capsule limbs and mitten hands.
// Units: the figure is ~2.0 tall, feet at y = 0, facing +z.
import * as THREE from 'three';

// Head superquadric: F = (|x/a|^p + |y/b|^p)^(q/p) + |z/c|^q = 1.
export const HEAD = { a: 0.672, b: 0.553, c: 0.5, p: 3.6, q: 2.7, y: 1.45, taper: 0.04 };
const taperAt = (y) => 1 + HEAD.taper * Math.max(-1, Math.min(1, y / HEAD.b));
// Visor: rounded rectangle on the head's front, in head-local x/y.
export const VISOR = { cx: 0, cy: -0.183, hw: 0.556, hh: 0.332, r: 0.22 };   // measured off mascot-hero.png

const sgnpow = (v, e) => Math.sign(v) * Math.pow(Math.abs(v), e);

function headG(x, y) {
  const { a, b, p } = HEAD;
  return Math.pow(Math.abs(x / a), p) + Math.pow(Math.abs(y / b), p);
}
// Front surface depth z(x, y) of the (tapered) head, 0 outside the silhouette.
export function headZ(x, y) {
  const { c, p, q } = HEAD;
  const g = Math.pow(headG(x / taperAt(y), y), q / p);
  return g >= 1 ? 0 : c * Math.pow(1 - g, 1 / q);
}
// Surface normal of the front by central differences of headZ (exact enough for the visor and rim).
function frontNormal(x, y) {
  const e = 1e-4;
  const dzdx = (headZ(x + e, y) - headZ(x - e, y)) / (2 * e);
  const dzdy = (headZ(x, y + e) - headZ(x, y - e)) / (2 * e);
  return new THREE.Vector3(-dzdx, -dzdy, 1).normalize();
}
function headNormal(x, y, z) {
  const { a, b, c, p, q } = HEAD;
  const G = Math.max(1e-9, headG(x, y));
  const k = q * Math.pow(G, q / p - 1);
  const nx = (k * sgnpow(x / a, p - 1)) / a;
  const ny = (k * sgnpow(y / b, p - 1)) / b;
  const nz = (q * sgnpow(z / c, q - 1)) / c;
  return new THREE.Vector3(nx, ny, nz).normalize();
}

export function headGeometry(seg = 128, rings = 96) {
  const geo = new THREE.SphereGeometry(1, seg, rings);
  const pos = geo.attributes.position, nor = geo.attributes.normal;
  const { a, b, c, p, q } = HEAD;
  const v = new THREE.Vector3();
  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i);
    const F = Math.pow(Math.pow(Math.abs(v.x / a), p) + Math.pow(Math.abs(v.y / b), p), q / p) + Math.pow(Math.abs(v.z / c), q);
    const s = Math.pow(F, -1 / q);
    const x = v.x * s, y = v.y * s, z = v.z * s;
    pos.setXYZ(i, x * taperAt(y), y, z);
  }
  geo.computeVertexNormals();
  return geo;
}

// Rounded-rectangle outline (closed, counter-clockwise), n points.
export function roundedRectOutline(cx, cy, hw, hh, r, n = 240) {
  const pts = [];
  const straightX = 2 * (hw - r), straightY = 2 * (hh - r), arc = (Math.PI / 2) * r;
  const per = 2 * straightX + 2 * straightY + 4 * arc;
  for (let i = 0; i < n; i++) {
    let d = (i / n) * per;
    // start at the middle of the right edge, go up (CCW)
    const segs = [
      [straightY / 2, (s) => [cx + hw, cy + s]],
      [arc, (s) => { const t = s / r; return [cx + hw - r + r * Math.cos(t), cy + hh - r + r * Math.sin(t)]; }],
      [straightX, (s) => [cx + hw - r - s, cy + hh]],
      [arc, (s) => { const t = Math.PI / 2 + s / r; return [cx - hw + r + r * Math.cos(t), cy + hh - r + r * Math.sin(t)]; }],
      [straightY, (s) => [cx - hw, cy + hh - r - s]],
      [arc, (s) => { const t = Math.PI + s / r; return [cx - hw + r + r * Math.cos(t), cy - hh + r + r * Math.sin(t)]; }],
      [straightX, (s) => [cx - hw + r + s, cy - hh]],
      [arc, (s) => { const t = 1.5 * Math.PI + s / r; return [cx + hw - r + r * Math.cos(t), cy - hh + r + r * Math.sin(t)]; }],
      [straightY / 2, (s) => [cx + hw, cy - hh + r + s]],
    ];
    for (const [len, f] of segs) {
      if (d <= len) { pts.push(f(d)); break; }
      d -= len;
    }
  }
  return pts;
}

// Visor patch: concentric rings of the rounded rectangle, projected onto the head surface (+offset).
// The attribute `visor` carries head-local x/y so the face shader can draw the eyes in flat units.
export function visorGeometry(offset = 0.004, rings = 40, n = 240) {
  const { cx, cy, hw, hh, r } = VISOR;
  const outline = roundedRectOutline(cx, cy, hw, hh, r, n);
  const verts = [], norms = [], vis = [], idx = [];
  const push = (x, y) => {
    const z = headZ(x, y);
    const nn = frontNormal(x, y);
    verts.push(x + nn.x * offset, y + nn.y * offset, z + nn.z * offset);
    norms.push(nn.x, nn.y, nn.z);
    vis.push(x, y);
  };
  push(cx, cy);
  for (let k = 1; k <= rings; k++) {
    const s = k / rings;
    for (const [x, y] of outline) push(cx + (x - cx) * s, cy + (y - cy) * s);
  }
  for (let i = 0; i < n; i++) idx.push(0, 1 + i, 1 + ((i + 1) % n));
  for (let k = 1; k < rings; k++) {
    const a0 = 1 + (k - 1) * n, b0 = 1 + k * n;
    for (let i = 0; i < n; i++) {
      const i1 = (i + 1) % n;
      idx.push(a0 + i, b0 + i, b0 + i1, a0 + i, b0 + i1, a0 + i1);
    }
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(verts, 3));
  geo.setAttribute('normal', new THREE.Float32BufferAttribute(norms, 3));
  geo.setAttribute('visor', new THREE.Float32BufferAttribute(vis, 2));
  geo.setIndex(idx);
  return geo;
}

// Bevelled lip around the visor: a tube laid on the head surface along the visor outline.
export function rimGeometry(radius = 0.03, offset = 0.004) {
  const { cx, cy, hw, hh, r } = VISOR;
  const pts = roundedRectOutline(cx, cy, hw + 0.012, hh + 0.012, r + 0.012, 200).map(([x, y]) => {
    const z = headZ(x, y);
    const nn = frontNormal(x, y);
    return new THREE.Vector3(x + nn.x * offset, y + nn.y * offset, z + nn.z * offset);
  });
  const curve = new THREE.CatmullRomCurve3(pts, true, 'centripetal');
  return new THREE.TubeGeometry(curve, 400, radius, 16, true);
}

// A disc with rounded edges (lathe around y), then turned to lie along x.
export function discGeometry(R, t, e, segs = 96, dome = 0) {
  const prof = [];
  const arc = (cx, cy, a0, a1, n = 10) => { for (let i = 0; i <= n; i++) { const a = a0 + (a1 - a0) * (i / n); prof.push(new THREE.Vector2(cx + Math.cos(a) * e, cy + Math.sin(a) * e)); } };
  prof.push(new THREE.Vector2(0.0001, -t / 2 - dome));
  for (let i = 1; i <= 6; i++) { const u = i / 7; prof.push(new THREE.Vector2((R - e) * u, -t / 2 - dome * (1 - u * u))); }
  arc(R - e, -t / 2 + e, -Math.PI / 2, 0);
  arc(R - e, t / 2 - e, 0, Math.PI / 2);
  for (let i = 6; i >= 1; i--) { const u = i / 7; prof.push(new THREE.Vector2((R - e) * u, t / 2 + dome * (1 - u * u))); }
  prof.push(new THREE.Vector2(0.0001, t / 2 + dome));
  const geo = new THREE.LatheGeometry(prof, segs);
  geo.rotateZ(-Math.PI / 2); // lathe axis y → x
  return geo;
}

// Torso: a soft bell, lathe of a smoothed profile, flattened front-to-back.
export function torsoGeometry() {
  const ctrl = [[0.0001, 0.33], [0.26, 0.333], [0.36, 0.352], [0.405, 0.4], [0.418, 0.48], [0.414, 0.6], [0.4, 0.7], [0.374, 0.78], [0.31, 0.845], [0.19, 0.888], [0.0001, 0.905]];
  const curve = new THREE.SplineCurve(ctrl.map(([r, y]) => new THREE.Vector2(r, y)));
  const geo = new THREE.LatheGeometry(curve.getPoints(64), 128);
  geo.scale(1, 1, 0.8);
  geo.computeVertexNormals();
  return geo;
}

export const capsule = (r, len, cap = 12, rad = 24) => new THREE.CapsuleGeometry(r, len, cap, rad);

// Mitten hand: palm + four stubby fingers + thumb, in hand-local space (wrist at origin, fingers −y).
export function handGeometries() {
  const parts = [];
  const palm = new THREE.SphereGeometry(1, 32, 24);
  palm.scale(0.104, 0.098, 0.068);
  palm.translate(0, -0.075, 0);
  parts.push(palm);
  for (let i = 0; i < 4; i++) {
    const f = capsule(0.031, 0.05, 6, 12);
    const x = -0.06 + i * 0.04;
    f.rotateZ(x * 1.7);
    f.translate(x * 1.18, -0.172 + Math.abs(x) * 0.28, 0.006);
    parts.push(f);
  }
  const th = capsule(0.032, 0.05, 6, 12);
  th.rotateZ(-0.95);
  th.rotateY(0.45);
  th.translate(0.098, -0.09, 0.034);
  parts.push(th);
  return parts;
}
