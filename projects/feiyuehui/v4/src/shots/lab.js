// Material lab (not in the film): one piece, framed to its bounds, under the jewellery studio, on black or cream —
// to calibrate the jade against the client's photographs.  ?shots=lab&lab=jewellery_buddha&bg=black&glow=0.05,0.32
import * as THREE from 'three';
import { model, jadeVariant } from '../assets.js';
import { buildEnv } from '../env.js';
import { addJadeGlow } from '../lib/jadeglow.js';
import { fovOf } from '../lib/util.js';

const q = new URLSearchParams(location.search);
const S = {};

export default {
  id: 'lab', start: 0, end: 1e9, samples: 1,
  async init(ctx) {
    const name = q.get('lab') || 'jewellery_buddha';
    const three = q.get('three') ? JSON.parse(q.get('three')) : {};
    S.scene = new THREE.Scene();
    S.scene.background = new THREE.Color(q.get('bg') === 'cream' ? '#efe6da' : '#050505');
    S.scene.environment = buildEnv(ctx.renderer, {
      zenith: '#3a3a40', horizon: '#4a4440', ground: '#141312', sharp: 0.7,
      boxes: [
        { dir: [-0.2, 0.9, 0.35], dist: 10, size: [7, 5], color: '#ffffff', power: Number(q.get('key') || 6) },
        { dir: [0.75, 0.45, 0.5], dist: 10, size: [4, 6], color: '#f4f6ff', power: 2.2 },
        { dir: [-0.9, 0.3, 0.25], dist: 10, size: [0.7, 8], color: '#ffffff', power: 12 },
        { dir: [0.95, 0.25, -0.2], dist: 10, size: [0.5, 8], color: '#ffffff', power: 9 },
        { dir: [0.0, 0.2, -1], dist: 10, size: [6, 6], color: '#ffffff', power: Number(q.get('back') || 3) },
      ],
      cards: [{ dir: [0, 0.1, 1], dist: 9, size: [4, 3] }],
    });
    if (q.get('jade')) jadeVariant('lab', JSON.parse(q.get('jade')));
    const root = (await model(name, { opts: { three, imperial: q.get('imperial') || (q.get('jade') ? 'lab' : undefined) } })).clone();
    S.scene.add(root);
    const [base, back, rim] = (q.get('glow') || '0,0,0').split(',').map(Number);
    if (base + back + rim > 0) addJadeGlow(root, { color: q.get('glowc') || '#2fff62', base, back, rim });
    const sun = new THREE.DirectionalLight('#ffffff', Number(q.get('sun') || 2.5));
    sun.position.set(-0.3, 0.8, 0.5);
    S.scene.add(sun);
    const box = new THREE.Box3().setFromObject(root);
    const c = box.getCenter(new THREE.Vector3()), size = box.getSize(new THREE.Vector3());
    const mm = Number(q.get('mm') || 100);
    S.camera = new THREE.PerspectiveCamera(fovOf(mm), 16 / 9, 0.001, 50);
    const d = (Math.max(size.y, size.x / 1.78) * 0.62) / Math.tan((fovOf(mm) * Math.PI) / 360);
    const yaw = Number(q.get('yaw') || 0), pitch = Number(q.get('pitch') || 0);
    S.camera.position.set(c.x + d * Math.sin(yaw) * Math.cos(pitch), c.y + d * Math.sin(pitch), c.z + d * Math.cos(yaw) * Math.cos(pitch));
    S.camera.lookAt(c);
    S.d = d;
  },
  update() {
    return { scene: S.scene, camera: S.camera, dof: null, look: { bloom: 0.04, glint: 0.3, glintThreshold: 10, ca: 0, vignette: 0, grain: 0 } };
  },
};
