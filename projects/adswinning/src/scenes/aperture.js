// Bars 13–14 · APERTURE.
// The Proof Aperture mark, built in 3D from mark.svg's own geometry: petrol inspection corners
// (extruded strokes), the mineral section plate, the recessed corners and the isometric sulphur
// cuboid, each at its own depth. An orthographic camera orbits the stack; when it settles on the
// exact front view the layers align into the flat logo (anamorphic lock) — the hand-off to 2D.
import * as THREE from 'three';
import { W, H, BEAT, C } from '../config.js';
import { ease, seg, clamp, lerp } from '../util.js';
import { lockup } from '../ui.js';
import { B, AP_T } from '../score.js';
import { CUBE0 } from './board.js';


let scene, camera, cube, plate, frames, recesses, U, toW;

// Outline of a stroked quarter-corner (square caps, round join), top-left orientation, SVG units.
function cornerOutline(x0, y0, r, xEnd, yEnd, hw) {
  const pts = [];
  const ax = x0 + r, ay = y0 + r;
  pts.push([x0 - hw, yEnd + hw], [x0 - hw, ay]);
  for (let i = 1; i <= 12; i++) { const a = Math.PI + (i / 12) * (Math.PI / 2); pts.push([ax + Math.cos(a) * (r + hw), ay + Math.sin(a) * (r + hw)]); }
  pts.push([xEnd + hw, y0 - hw], [xEnd + hw, y0 + hw], [ax, y0 + hw]);
  for (let i = 1; i <= 12; i++) { const a = Math.PI * 1.5 - (i / 12) * (Math.PI / 2); pts.push([ax + Math.cos(a) * (r - hw), ay + Math.sin(a) * (r - hw)]); }
  pts.push([x0 + hw, yEnd + hw]);
  return pts;
}

function cornerMeshes(outline, cx, cy, depth, mats) {
  const out = [];
  for (const [mx, my] of [[1, 1], [-1, 1], [1, -1], [-1, -1]]) {
    const shape = new THREE.Shape();
    outline.forEach(([sx, sy], i) => {
      const px = mx === 1 ? sx : 2 * cx - sx, py = my === 1 ? sy : 2 * cy - sy;
      const [X, Y] = toW(px, py);
      if (i === 0) shape.moveTo(X, Y); else shape.lineTo(X, Y);
    });
    const geo = new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: false, curveSegments: 12 });
    // centre each corner on its own pivot so it can fly in and land
    geo.computeBoundingBox();
    const c = geo.boundingBox.getCenter(new THREE.Vector3());
    geo.translate(-c.x, -c.y, 0);
    const mesh = new THREE.Mesh(geo, mats);
    mesh.userData.home = c;
    mesh.userData.dir = new THREE.Vector2(mx === 1 ? -1 : 1, my === 1 ? 1 : -1);
    out.push(mesh);
  }
  return out;
}

const basic = (hex, extra = {}) => new THREE.MeshBasicMaterial({ color: new THREE.Color(hex), ...extra });

function init() {
  scene = new THREE.Scene();
  scene.background = new THREE.Color(C.ground);
  camera = new THREE.OrthographicCamera(-W / 2, W / 2, H / 2, -H / 2, 1, 20000);
  const L = lockup();
  U = L.mark.size / 32;
  toW = (sx, sy) => [L.mark.x + sx * U - W / 2, H / 2 - (L.mark.y + sy * U)];

  // section plate
  const [px, py] = toW(15, 15);
  plate = new THREE.Mesh(new THREE.BoxGeometry(18.5 * U, 18.5 * U, 1.0 * U), [
    basic('#C3D2CF'), basic('#C3D2CF'), basic('#CFDCD9'), basic('#B5C6C3'), basic(C.markSection), basic(C.markSection),
  ]);
  plate.userData.home = new THREE.Vector3(px, py, -1.2 * U);
  scene.add(plate);

  // petrol frame corners (front) and recessed corners (back), from the SVG strokes
  frames = cornerMeshes(cornerOutline(4.5, 4.5, 2, 10, 10, 1), 12, 12, 0.9 * U, [basic(C.petrol), basic(C.petrolSunk)]);
  frames.forEach((m) => { m.userData.home.z = 0; scene.add(m); });
  // recess: well at 38 % over ground, pre-mixed so it lands on the exact flat colour
  recesses = cornerMeshes(cornerOutline(8, 7, 2.5, 14, 13, 1.25), 16, 15, 0.4 * U, [basic('#989F9F'), basic('#8C9494')]);
  recesses.forEach((m) => { m.userData.home.z = -3.4 * U; scene.add(m); });

  // the isometric evidence cuboid: 5.657 × 6.246 × 5.657 units, iso-rotated so its front view is the SVG's hexagon
  cube = new THREE.Mesh(new THREE.BoxGeometry(5.657 * U, 6.246 * U, 5.657 * U), [
    basic('#C48C1F'), basic(C.markLeft), basic(C.markTop), basic('#8A6410'), basic(C.markRight), basic('#A77112'),
  ]);
  const [cx, cy] = toW(16, 14.95);
  cube.userData.home = new THREE.Vector3(cx, cy, 5.2 * U);
  scene.add(cube);
  buildKeys();
}

// Camera keyframes (beats): [gb, yaw, pitch, zoom, target]; target 0 = cube, 1 = the mark's ink centre,
// 2 = the lockup framing. Big and centred while it orbits, then it pulls back into the lockup and locks.
let KEYS = null, MARK_C = null;
function buildKeys() {
  const cubeZoom = CUBE0.size / (9.7 * U);
  const [mx, my] = toW(14.375, 14.375);
  MARK_C = new THREE.Vector3(mx, my, 0);
  KEYS = [
    [48.0, 0, 0, cubeZoom, 0],
    [49.6, -0.62, 0.3, 2.3, 0.55],
    [51.6, -0.2, 0.42, 2.2, 1.0],
    [53.4, 0.3, 0.16, 1.95, 1.0],
    [54.5, 0.03, 0.02, 1.35, 1.75],
    [AP_T.settle, 0, 0, 1.0, 2.0],
  ];
}
function spline(gb, j) {
  const k = KEYS;
  if (gb <= k[0][0]) return k[0][j];
  if (gb >= k[k.length - 1][0]) return k[k.length - 1][j];
  let i = 0;
  while (gb > k[i + 1][0]) i++;
  const t0 = k[i][0], t1 = k[i + 1][0];
  const tan = (n) => (n <= 0 || n >= k.length - 1 ? 0 : (k[n + 1][j] - k[n - 1][j]) / (k[n + 1][0] - k[n - 1][0]));
  const m0 = tan(i) * (t1 - t0), m1 = tan(i + 1) * (t1 - t0);
  const u = (gb - t0) / (t1 - t0), u2 = u * u, u3 = u2 * u;
  return (2 * u3 - 3 * u2 + 1) * k[i][j] + (u3 - 2 * u2 + u) * m0 + (-2 * u3 + 3 * u2) * k[i + 1][j] + (u3 - u2) * m1;
}

const T = new THREE.Vector3();
function update(t) {
  const gb = t / BEAT;
  // cube: one full spin about its vertical, landing in the iso pose
  const spin = (1 - ease.inOutCubic(seg(gb, 48.0, AP_T.spin))) * Math.PI * 2;
  cube.rotation.set(Math.atan(1 / Math.SQRT2), Math.PI / 4 + spin, 0, 'XYZ');
  cube.position.copy(cube.userData.home);

  // plate slides up out of depth, corners fly in from their diagonals and land, recess settles behind
  const pl = seg(gb, AP_T.plate, AP_T.plate + 0.9, ease.outBack);
  plate.position.copy(plate.userData.home).add(new THREE.Vector3(0, 0, -(1 - pl) * 60 * U));
  plate.scale.setScalar(Math.max(0.001, lerp(0.4, 1, clamp(pl))));
  plate.visible = gb >= AP_T.plate;
  frames.forEach((m, i) => {
    const p = seg(gb, AP_T.frame + i * 0.1, AP_T.frame + 0.8 + i * 0.1, (x) => ease.outBack(x, 2.0));
    const d = (1 - p) * 34 * U;
    m.position.set(m.userData.home.x + m.userData.dir.x * d, m.userData.home.y + m.userData.dir.y * d, m.userData.home.z + (1 - p) * 20 * U);
    m.rotation.z = (1 - p) * 0.6 * (i % 2 ? 1 : -1);
    m.visible = gb >= AP_T.frame + i * 0.1;
  });
  recesses.forEach((m, i) => {
    const p = seg(gb, AP_T.recess + i * 0.06, AP_T.recess + 0.7 + i * 0.06, ease.outCubic);
    m.position.set(m.userData.home.x, m.userData.home.y, m.userData.home.z - (1 - p) * 40 * U);
    m.scale.setScalar(Math.max(0.001, lerp(0.6, 1, p)));
    m.visible = gb >= AP_T.recess + i * 0.06;
  });

  const yaw = spline(gb, 1), pitch = spline(gb, 2), tm = spline(gb, 4);
  camera.zoom = spline(gb, 3);
  camera.updateProjectionMatrix();
  if (tm <= 1) T.lerpVectors(cube.userData.home, MARK_C, tm);
  else T.copy(MARK_C).lerp(new THREE.Vector3(0, 0, 0), tm - 1);
  const R = 6000;
  camera.position.set(T.x + R * Math.sin(yaw) * Math.cos(pitch), T.y + R * Math.sin(pitch), T.z + R * Math.cos(yaw) * Math.cos(pitch));
  camera.up.set(0, 1, 0);
  camera.lookAt(T);
  camera.updateMatrixWorld(true);
  return { scene, camera, bloom: { strength: 0 }, exposure: 1, tonemap: 0 };
}

export default {
  id: 'aperture',
  init,
  three: { start: B(AP_T.start), end: B(AP_T.end), update },
};
