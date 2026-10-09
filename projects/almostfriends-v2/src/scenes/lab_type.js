// LAB · type in 3D (gl/text3d.js): chrome and light-filled glass on the night studio
import * as THREE from 'three';
import { W, H } from '../config.js';
import { text3d, chrome, lightMat, studioEnv } from '../gl/text3d.js';

let scene, cam, A, B, C;
const GRAD = ['#1E5BFF', '#5A3DFF', '#A230FF', '#FF2E8A', '#FF3D4F', '#FF6A2B', '#FF8A1F'];
export default {
  init(env) {
    scene = new THREE.Scene();
    scene.add(env.makeBackdrop());
    const envMap = studioEnv(env.renderer, 'night');
    const ch = chrome(envMap);
    A = text3d('How to', { size: 0.62, material: ch }); A.group.position.set(0, 1.9, 0); scene.add(A.group);
    B = text3d('make more', { size: 0.62, material: ch }); B.group.position.set(0, 1.15, 0); scene.add(B.group);
    C = text3d('friends.', { size: 0.82, materials: GRAD.map((c) => lightMat(envMap, c)) }); C.group.position.set(0, 0.15, 0); scene.add(C.group);
    cam = new THREE.PerspectiveCamera(35, W / H, 0.1, 100);
  },
  under: [{ start: 0, end: 3, draw(ctx) { const g = ctx.createRadialGradient(540, 1100, 0, 540, 1100, 1300); g.addColorStop(0, '#141C3A'); g.addColorStop(1, '#03040A'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); } }],
  three: {
    start: 0, end: 3,
    update(t) {
      cam.position.set(Math.sin(t * 0.6) * 2.2, 0.6, 11); cam.lookAt(0, 0.6, 0); cam.updateMatrixWorld();
      return { scene, camera: cam, bloom: { strength: 0.6, radius: 0.55, threshold: 1.0 } };
    },
  },
};
