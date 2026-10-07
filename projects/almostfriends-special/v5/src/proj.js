// World ↔ frame. project(env, p) → [x, y, k, z]: the frame position of world point p, k = frame pixels per world unit
// at its depth (to size 2D things anchored in 3D), z = view depth. Uses the engine's camera as set for this sub-frame.
import * as THREE from 'three';
import { W, H } from './config.js';
const v = new THREE.Vector3();
export function project(env, p) {
  const cam = env.camera;
  v.set(p[0], p[1], p[2]).applyMatrix4(cam.matrixWorldInverse);
  const z = -v.z;
  v.applyMatrix4(cam.projectionMatrix);
  const k = H / (2 * Math.tan(THREE.MathUtils.degToRad(cam.fov) / 2) * Math.max(z, 1e-4));
  return [(v.x + 1) / 2 * W, (1 - v.y) / 2 * H, k, z];
}
// the pixels-per-unit at distance d for a camera fov (before any camera exists)
export const pxPerUnit = (fov, d) => H / (2 * Math.tan(THREE.MathUtils.degToRad(fov) / 2) * d);
