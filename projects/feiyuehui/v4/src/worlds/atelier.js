// The atelier of act IV: a sheet of xuan paper on a desk in morning sun through a window with bamboo outside. Warm key
// low from the left (long shadows: every stroke, groove and stone stands up), the bamboo's shadow drifting across the
// paper, a dark-edged studio for the metals' reflections. Instanced per shot.
import * as THREE from 'three';
import { buildEnv } from '../env.js';
import { createFilmMaterial, textures } from '../assets.js';
import { createCookie } from '../lib/cookie.js';
import { createFill } from '../lib/fill.js';

export const SUN_A = new THREE.Vector3(-0.78, 0.42, 0.46).normalize();   // morning sun: left, low, a little toward the lens
let ENV = null;
const DEBUG_NOENV = typeof location !== 'undefined' && new URLSearchParams(location.search).has('noenv');

// A paper sweep (a photographer's cove): a floor that bends up into a wall behind the work, so a low camera sees
// paper all the way up instead of the room's dark beyond the sheet's edge.
function sweepGeometry(width, { front = 0.45, back = 0.16, radius = 0.12, wall = 0.5, seg = 160 } = {}) {
  const L = front + back + radius * Math.PI / 2 + wall;
  const g = new THREE.PlaneGeometry(width, L, 1, seg);
  const pos = g.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const u = (pos.getY(i) + L / 2);                     // 0 at the front edge … L at the top of the wall
    let y = 0, z;
    if (u <= front + back) z = front - u;
    else if (u <= front + back + radius * Math.PI / 2) {
      const a = (u - front - back) / radius;
      z = -back - radius * Math.sin(a); y = radius * (1 - Math.cos(a));
    } else { z = -back - radius; y = radius + (u - front - back - radius * Math.PI / 2); }
    pos.setXYZ(i, pos.getX(i), y, z);
  }
  g.computeVertexNormals();
  return g;
}

export function createAtelier(ctx, { paper = [1.6, 1.0], bamboo = true, sweep = null, tone = null } = {}) {
  // what gold and champagne reflect: a bright, warm room — the window, a big soft ceiling, a pale wall behind the lens
  // (gold reads as gold only when it has something bright to mirror), with two dark flags for edge contrast
  ENV ??= buildEnv(ctx.renderer, {
    zenith: '#d9cbbb', horizon: '#a8927c', ground: '#5c4a3c', sharp: 0.6, intensity: 1.0,
    boxes: [
      { dir: [SUN_A.x, SUN_A.y + 0.1, SUN_A.z], dist: 10, size: [5, 4], color: '#ffe0b8', power: 14.0 },  // the window
      { dir: [0.1, 0.98, 0.15], dist: 10, size: [9, 7], color: '#fff4e6', power: 3.2 },                    // ceiling bounce
      { dir: [0.2, 0.45, 0.88], dist: 10, size: [8, 4], color: '#f6eadc', power: 2.4 },                    // the wall behind the lens
      { dir: [0.95, 0.25, 0.2], dist: 10, size: [0.6, 7], color: '#fff2e2', power: 10.0 },                 // a strip right
      { dir: [-0.2, 0.35, -0.95], dist: 10, size: [7, 0.5], color: '#ffffff', power: 8.0 },                // a strip behind
      { dir: [0.0, -0.9, 0.2], dist: 10, size: [8, 8], color: '#f1e2cf', power: 1.2 },                      // the paper's bounce
    ],
    cards: [{ dir: [0.75, 0.3, -0.55], dist: 9, size: [3, 4] }, { dir: [-0.6, 0.2, -0.75], dist: 9, size: [2, 3] }],
  });
  const scene = new THREE.Scene();
  scene.environment = DEBUG_NOENV ? null : ENV;
  // the room's diffuse light is flagged down (key/fill ≈ 4:1): shape and shadow from the sun, while gold and jade still
  // mirror the whole bright room at full strength
  const fill = createFill(0.28);
  scene.background = new THREE.Color('#2a221c');

  // the desk paper
  const geo = sweep ? sweepGeometry(paper[0], sweep) : new THREE.PlaneGeometry(paper[0], paper[1], 1, 1);
  const mat = createFilmMaterial('paper_xuan', { ctx: { asset: new THREE.Matrix4(), assetInv: new THREE.Matrix4(), box: null, size: null, worldScale: 1, seed: 3 } });
  mat.envMapIntensity = 0.5;
  // xuan fibre and tooth a little stronger than the film's: this lens sits closer to the sheet
  mat.userData.filmUniforms.uPaperFibre.value = 0.16;
  mat.userData.filmUniforms.uPaperBump.value = 1.0;            // the room's light on the paper is soft; metals see the whole room at full
  if (tone) { const c = new THREE.Color(tone); mat.userData.filmUniforms.uPaperBase.value.set(c.r, c.g, c.b); }   // toned paper (vec3 uniform: linear)
  mat.envMapIntensity = 0.3;   // the paper's broad sheen at grazing angles washed it out; metals keep the room at full
  const sheet = new THREE.Mesh(geo, mat);
  sheet.userData.clayKeep = true;   // the paper keeps its bamboo shadows in a clay blockout (Engine.claySwap)
  if (!sweep) sheet.rotation.x = -Math.PI / 2;
  sheet.receiveShadow = true;
  scene.add(sheet);

  // the sun: a soft area key (sampled per sub-sample) with a tight shadow frustum around the work
  const sun = new THREE.DirectionalLight(new THREE.Color('#ffe2bf'), 6.0);
  sun.castShadow = true;
  sun.shadow.mapSize.set(4096, 4096);
  sun.shadow.bias = -0.00005;
  sun.shadow.normalBias = 0.0004;
  const sc = sun.shadow.camera;
  sc.left = -0.22; sc.right = 0.22; sc.top = 0.22; sc.bottom = -0.22; sc.near = 0.05; sc.far = 3;
  scene.add(sun, sun.target);
  const hemi = new THREE.HemisphereLight(new THREE.Color('#f3ecff'), new THREE.Color('#d8c3a8'), 0.5);
  scene.add(hemi);

  // bamboo outside the window: its shadow, projected along the sun onto the paper (and whatever a shot adds)
  const tex = textures.mask('bamboo');
  const cookie = bamboo ? createCookie(tex, { dir: SUN_A, scale: 0.55, strength: 0.72, blur: 1.6 }) : null;
  if (cookie) cookie.apply(mat);
  const leaves = { intensity: 0 };   // kept so shots can still set it; the cookie is the leaves now

  return {
    scene, sheet, sun, hemi, fill, leaves, cookie,
    // call once a shot has added its pieces: every material gets the fill control
    finish() { fill.apply(scene); },
    update(t, sub, centre = new THREE.Vector3()) {
      const j = 0.05;
      const d = SUN_A.clone().add(new THREE.Vector3((sub.lu - 0.5) * j, (sub.lv - 0.5) * j, 0)).normalize();
      sun.position.copy(centre).addScaledVector(d, 1.2);
      sun.target.position.copy(centre);
      // the breeze: the leaves' shadow drifts and sways a few centimetres
      if (cookie) cookie.uniforms.uCookieOffset.value.set(Math.sin(t * 0.7) * 0.025 + t * 0.006, Math.cos(t * 0.5) * 0.02);
    },
  };
}
