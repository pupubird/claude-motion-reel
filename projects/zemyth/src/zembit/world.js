// One Zembit, one studio, shared by the chapters it appears in (hello, signature). Provides the camera
// and screen projections used for pixel-exact 3D ↔ 2D hand-offs (eyes → lime line, mark → lockup).
import * as THREE from 'three';
import { W, H } from '../config.js';
import { createZembit, EYE } from './index.js';
import { createStage } from './stage.js';
import { headZ } from './geometry.js';

let world = null;
export function getWorld(renderer) {
  if (world) return world;
  const stage = createStage(renderer);
  const zb = createZembit();
  stage.scene.add(zb.root);
  const camera = new THREE.PerspectiveCamera(30, W / H, 0.02, 100);
  const base = Object.fromEntries(Object.entries(stage.lights).map(([k, l]) => [k, l.intensity]));
  world = { ...stage, zb, camera, base };
  return world;
}

// Scale every light and the environment (0 = only emissive eyes are visible).
export function setLights(w, k, env = k) {
  for (const [name, l] of Object.entries(w.lights)) l.intensity = w.base[name] * k;
  w.scene.environmentIntensity = 0.38 * env;
  w.zb.materials.visorMat.userData.env = env;
  w.floor.material.color.setScalar(Math.min(1, k));
}

// Camera from a look-at target and a camera position.
export function aim(w, pos, target) {
  // close to the visor its reflection of the studio ceiling becomes a smudge: fade it with distance
  const d = pos.distanceTo(new THREE.Vector3(0, 1.28, 0.49));
  w.zb.materials.visorMat.userData.near = Math.pow(Math.min(1, Math.max(0, (d - 1.2) / 3.8)), 1.5);
  w.camera.position.copy(pos);
  w.camera.up.set(0, 1, 0);
  w.camera.lookAt(target);
  w.camera.updateMatrixWorld(true);
  w.camera.updateProjectionMatrix();
  const vm = w.zb.materials.visorMat;
  vm.envMapIntensity = 0.3 * (vm.userData.env ?? 1) * vm.userData.near;
  vm.clearcoat = 0.25 + 0.45 * vm.userData.near;
  // the clearcoat's Fresnel (F0 ≈ 0.04) dims emission; compensate so the eyes stay exactly #EEFE5E
  vm.userData.face.uEyeGain.value = 1 / (1 - vm.clearcoat * 0.04);
}

const V = new THREE.Vector3();
// World point → screen px (y down).
export function toScreen(w, p) {
  V.copy(p).project(w.camera);
  return [(V.x * 0.5 + 0.5) * W, (-V.y * 0.5 + 0.5) * H];
}

// A head-local point on the visor surface → screen px (the rig must be posed and matrices updated).
export function visorToScreen(w, x, y) {
  w.zb.root.updateMatrixWorld(true);
  const p = new THREE.Vector3(x, y, headZ(x, y) + 0.004).applyMatrix4(w.zb.head.matrixWorld);
  return toScreen(w, p);
}

// Screen rectangles of both eyes as currently set on the visor uniforms: [{x, y, w, h}, …].
export function eyeRects(w) {
  const f = w.zb.materials.visorMat.userData.face;
  return [f.uEyeL.value, f.uEyeR.value].map((e) => {
    const [x0, y0] = visorToScreen(w, e.x - e.z, e.y + e.w);
    const [x1, y1] = visorToScreen(w, e.x + e.z, e.y - e.w);
    return { x: x0, y: y0, w: x1 - x0, h: y1 - y0 };
  });
}
export { EYE };
