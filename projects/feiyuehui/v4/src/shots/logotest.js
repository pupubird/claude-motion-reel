// Look-dev for the gold lockup (not in the film): ?shots=logotest
import * as THREE from 'three';
import { createSkyWorld } from '../worlds/sky.js';
import { createFilmMaterial } from '../assets.js';
import { loadGlyphs } from '../lib/type3d.js';
import { buildLockup } from '../lib/logo3d.js';
import { fovOf } from '../lib/util.js';
const S = {};
export default {
  id: 'logotest', start: 0, end: 1e9, samples: 1,
  async init(ctx) {
    await loadGlyphs();
    S.world = createSkyWorld(ctx, { sun: new THREE.Vector3(-0.35, 0.06, -0.94).normalize() });
    S.scene = S.world.scene;
    const gold = createFilmMaterial('gold_brand', { ctx: { asset: new THREE.Matrix4().makeScale(0.001, 0.001, 0.001), assetInv: new THREE.Matrix4(), box: null, size: null, worldScale: 0.001, seed: 2 } });
    gold.envMap = S.world.goldEnv;
    S.L = await buildLockup({ gold });
    S.L.group.position.set(0, 0.06, -0.05);
    S.L.group.rotation.y = Number(new URLSearchParams(location.search).get('ry') || 0);
    S.scene.add(S.L.group);
    S.camera = new THREE.PerspectiveCamera(fovOf(45), 16 / 9, 0.01, 20);
    S.camera.position.set(0, 0.075, 0.33);
    S.camera.lookAt(0, 0.06, -0.05);
  },
  update(t, sub) {
    S.world.update(t, sub);
    S.world.clouds.uniforms.uPart.value.w = -2;
    S.world.sky.u.uSunDisc.value = 40;
    return { scene: S.scene, camera: S.camera, composite: S.world.composite, compositeAfterDof: true, dof: null, look: { bloom: 0.07, glint: 0.4, glintThreshold: 8 } };
  },
};
