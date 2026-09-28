// Model check (not in the film): the Zembit in the reference pose, rendered next to mascot-hero.png by tools/compare.py.
import * as THREE from 'three';
import { W, H } from '../config.js';
import { createZembit } from '../zembit/index.js';
import { createStage } from '../zembit/stage.js';

let st, zb, cam;
const view = 'front';
function init(env) {
  st = createStage(env.renderer);
  zb = createZembit();
  st.scene.add(zb.root);
  cam = new THREE.PerspectiveCamera(30, W / H, 0.05, 100);
}
function update(t) {
  const yaw = view === 'three' ? -0.55 : view === 'side' ? -1.45 : 0.06;
  zb.setPose({ yaw, arms: [{ raise: 0.55, bend: 0.25, bendZ: 0.1 }, { raise: 1.25, bend: 0.0, bendZ: 1.35, wrist: 0.15 }] });
  zb.setFace({});
  const d = 4.6;
  cam.position.set(0, 1.1, d);
  cam.lookAt(0, 1.02, 0);
  return { scene: st.scene, camera: cam, bloom: { strength: 0 }, tonemap: 2 };
}
export default { id: 'zbtest', init, three: { start: 0, end: 99, update } };
