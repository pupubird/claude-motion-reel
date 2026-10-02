// The heavens of acts I–III: a dawn sky over a sea of cloud, a low sun 40° left of the lens axis, and a dark jewellery
// studio for the reflections. One recipe, instanced per shot (each shot owns its scene), so the moon and the vortex
// stand in the same light and the hoop's portal looks into the same world.
import * as THREE from 'three';
import { buildEnv } from '../env.js';
import { createSky } from '../gl/sky.js';
import { createClouds } from '../gl/clouds.js';

export const SUN = new THREE.Vector3(-0.62, 0.15, -0.77).normalize();
let ENV = null, GOLD_ENV = null;

export function createSkyWorld(ctx, { veil = false, sun: SUN_DIR = SUN } = {}) {
  // reflections: a dark studio warmed by dawn — black flags so the diamonds read, a broad warm source for the domes,
  // strips for platinum, two hard points for fire
  ENV ??= buildEnv(ctx.renderer, {
    zenith: '#4a4a52', horizon: '#6a5a50', ground: '#1c1a19', sharp: 0.7, intensity: 1.0,
    boxes: [
      { dir: [SUN.x, SUN.y + 0.25, SUN.z], dist: 10, size: [8, 3.5], color: '#ffe6cc', power: 6.0 },
      { dir: [0.2, 0.9, 0.3], dist: 10, size: [6, 6], color: '#f0f0ff', power: 2.6 },
      { dir: [-0.9, 0.3, 0.25], dist: 10, size: [0.7, 8], color: '#fff6ea', power: 14.0 },
      { dir: [0.95, 0.25, -0.2], dist: 10, size: [0.5, 8], color: '#fff6ea', power: 11.0 },
      { dir: [0.15, 0.55, 0.85], dist: 10, size: [6, 0.4], color: '#ffffff', power: 8.0 },
      { dir: [0.35, 0.75, -0.55], dist: 10, size: [0.45, 0.45], color: '#ffffff', power: 170, shape: 'disc' },
      { dir: [-0.55, 0.55, 0.62], dist: 10, size: [0.35, 0.35], color: '#ffffff', power: 150, shape: 'disc' },
    ],
    cards: [{ dir: [0, 0.2, 1], dist: 9, size: [4, 2.5] }],
  });
  // what gold type reflects: the sky itself, bright and warm (in the dark jewellery studio, gold reads as bronze)
  GOLD_ENV ??= buildEnv(ctx.renderer, {
    zenith: '#7f93c8', horizon: '#ffd2a0', ground: '#f3e3d4', sharp: 0.5, intensity: 1.3,
    boxes: [
      { dir: [SUN.x, SUN.y, SUN.z], dist: 10, size: [5, 2.5], color: '#ffd7a8', power: 14.0 },
      { dir: [0.2, 0.9, 0.3], dist: 10, size: [9, 6], color: '#fff4e6', power: 3.0 },
      { dir: [0.9, 0.2, 0.4], dist: 10, size: [0.8, 8], color: '#ffffff', power: 10.0 },
    ],
    cards: [{ dir: [0, -0.35, 1], dist: 9, size: [7, 2], color: '#3a2a1c', power: 1 }],
  });
  const scene = new THREE.Scene();
  scene.environment = ENV;
  // the horizon behind the jewel is a pale, cool cream so warm gold type reads on it; the dawn's warmth sits on the sun
  const sky = createSky({ radius: 8, top: '#7389cc', mid: '#efe3df', low: '#f1e2d8', glow: '#ffbb73', glowSize: 0.11, glowPower: 1.7,
    spread: 0.11, gain: 0.95, cirrus: 0.6, cirrusColor: '#fff1ea' });
  sky.u.uSunDir.value.copy(SUN_DIR);
  scene.add(sky.mesh);
  const sun = new THREE.DirectionalLight(new THREE.Color('#ffe9d2'), 3.0);
  const fill = new THREE.DirectionalLight(new THREE.Color('#dfe6ff'), 0.55);
  scene.add(sun, fill, sun.target, fill.target);

  const clouds = createClouds({ res: 64, seed: 11 });
  const U = clouds.uniforms;
  U.uExtent.value = 1.2;
  U.uScale.value = 7.5;            // tiles per metre: a cell ≈ 33 mm — billows read as cumulus at these lenses
  U.uDetailScale.value = 52;
  U.uMinStep.value = 0.0012; U.uStepK.value = 0.022; U.uMaxDist.value = 1.6;
  U.uSoftBottom.value = 0.35; U.uSoftTop.value = 0.55;
  U.uPartSoft.value = 0.012; U.uPartNoise.value = 0.6;
  U.uG1.value = 0.62; U.uG2.value = -0.2; U.uGMix.value = 0.22; U.uPowder.value = 0.55;
  U.uSunDir.value.copy(SUN_DIR);
  U.uSunColor.value.set('#ffe2c8').multiplyScalar(1.35);
  U.uAmbTop.value.set('#aebcf0').multiplyScalar(0.5);
  U.uAmbBottom.value.set('#7d7aa4').multiplyScalar(0.3);
  U.uVeilLight.value.set('#fff3e8').multiplyScalar(0.95);
  U.uGlowColor.value.set('#4dff7a').multiplyScalar(0);
  U.uGlowRadius.value = 0.006;
  U.uHazeColor.value.set('#f1dccb').multiplyScalar(0.95);
  U.uHazeDist.value = 0.9;
  U.uTopVar.value = 0.05; U.uTopScale.value = 3.2;
  U.uVeilScale.value = 14; U.uVeilCov.value = 0.15;
  // the settled sea (after act I's parting): tops 21 mm under the ring's centre line
  U.uSlab.value.set(-0.14, -0.021);
  U.uCoverage.value = 0.36; U.uDensity.value = 520; U.uDetail.value = 0.42; U.uFade.value = 1;

  return {
    scene, sky, sun, fill, clouds, goldEnv: GOLD_ENV,
    // per sub-sample: the sun is an area source (soft shadows, softer sparkle); wind moves with t
    update(t, sub) {
      const j = 0.06;
      sun.position.copy(SUN_DIR).add(new THREE.Vector3((sub.lu - 0.5) * j, (sub.lv - 0.5) * j, 0)).multiplyScalar(0.3);
      fill.position.set(0.7, 0.6, 0.9).multiplyScalar(0.3);
      sky.u.uTime.value = t;
      U.uWind.value.set(t * 0.03, -t * 0.004, t * 0.012);
      U.uWindDetail.value.set(t * 0.08, -t * 0.03, t * 0.04);
    },
    composite: (r, color, depth, camera, out, s) => clouds.composite(r, color, depth, camera, out, s),
  };
}
