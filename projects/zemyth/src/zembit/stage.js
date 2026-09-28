// The Zembit's studio: black cyclorama, soft room reflections, a key, two rim lights (one lime —
// the brand colour as light), a faint floor pool so the figure stands on something.
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

let ENV = null;
export function studioEnv(renderer) {
  if (ENV) return ENV;
  const pm = new THREE.PMREMGenerator(renderer);
  ENV = pm.fromScene(new RoomEnvironment(), 0.04).texture;
  pm.dispose();
  return ENV;
}

export function createStage(renderer) {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x000000);
  scene.environment = studioEnv(renderer);
  scene.environmentIntensity = 0.38;

  const key = new THREE.DirectionalLight(0xffffff, 1.75);
  key.position.set(-2.0, 3.6, 4.0);
  const top = new THREE.DirectionalLight(0xffffff, 0.9);
  top.position.set(0.3, 6, 0.8);
  const rimL = new THREE.DirectionalLight(0xffffff, 2.2);
  rimL.position.set(-4.5, 2.6, -3.2);
  const rimR = new THREE.DirectionalLight(new THREE.Color('#EEFE5E'), 1.1);
  rimR.position.set(4.6, 1.8, -3.0);
  const fill = new THREE.HemisphereLight(0xffffff, 0x0a0a0a, 0.3);
  scene.add(key, top, rimL, rimR, fill);

  // Floor pool: a soft radial glow on black, plus a contact shadow under the feet.
  const c = document.createElement('canvas');
  c.width = c.height = 512;
  const g = c.getContext('2d');
  const grad = g.createRadialGradient(256, 256, 0, 256, 256, 256);
  grad.addColorStop(0, 'rgba(20,21,18,1)');
  grad.addColorStop(0.45, 'rgba(8,8,7,1)');
  grad.addColorStop(1, 'rgba(0,0,0,1)');
  g.fillStyle = grad;
  g.fillRect(0, 0, 512, 512);
  const sh = g.createRadialGradient(256, 256, 0, 256, 256, 70);
  sh.addColorStop(0, 'rgba(0,0,0,0.95)');
  sh.addColorStop(1, 'rgba(0,0,0,0)');
  g.fillStyle = sh;
  g.save(); g.translate(256, 256); g.scale(1.25, 0.8); g.translate(-256, -256);
  g.fillRect(0, 0, 512, 512);
  g.restore();
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(6, 6), new THREE.MeshBasicMaterial({ map: tex, transparent: false }));
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = -0.001;
  scene.add(floor);

  return { scene, lights: { key, top, rimL, rimR, fill }, floor };
}
