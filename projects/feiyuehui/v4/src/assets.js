// The 翡月荟 three.js package (../../shared/assets/3d): GLBs with the film's calibrated materials. Loaded once, cached;
// a shot clones what it needs. The package's conventions hold: Y up, metres, facing +Z, never re-scale a piece.
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js';
import { applyFilmMaterials, loadFilmTextures, createFilmMaterial, meshContext, FILM } from '../../shared/assets/3d/materials/materials.js';
import { addJadeGlow } from './lib/jadeglow.js';

export const PKG = new URL('../../shared/assets/3d/', import.meta.url).href;
export const textures = loadFilmTextures(`${PKG}textures/`, { anisotropy: 8 });
export { createFilmMaterial, meshContext, applyFilmMaterials };

const loader = new GLTFLoader().setMeshoptDecoder(MeshoptDecoder);

// v4's imperial jade, calibrated against the client's photographs (see docs/LOOK.md): the film's recipe reads dark and
// cold (sRGB R ≈ 0) in three.js; the photographed stones are a luminous yellow-green. Registered at runtime as a
// variant of the package's jade_imperial, so the shared package is untouched: opts { imperial: 'v4' }.
export function jadeVariant(name, v) { FILM.jade_imperial.variants[name] = { src: 'v4 calibration', ...v }; }
// Measured (tools/labstat.py, green pixels, sRGB) against the client's photographs — on white: pod (27, 100, 31), ring
// (20, 90, 20); on black: Buddha (54, 134, 51). Calibrated on BOTH grounds (bright sky behind a stone is transmitted,
// so a black-only calibration blows out to neon in daylight): pod on cream (43, 110, 36), Buddha on black (12, 86, 19).
jadeVariant('v4', { deep: [0.025, 0.15, 0.03], light: [0.10, 0.50, 0.09], cloud: [0.42, 0.68, 0.40] });
export const JADE_THREE = { attenuationColor: [0.3, 0.7, 0.3], attenuationDistance: 0.0025, transmission: 0.55, albedoGain: 0.55 };
export const JADE_GLOW = { color: '#50d068', base: 0.06, back: 0.25, rim: 0.03 };
const cache = new Map();

// → the glTF scene with film materials applied (shared: clone() it before re-parenting if used twice). Imperial jade
// gets v4's calibrated variant and glow unless opts say otherwise; `key` separates two copies that animate apart.
export function model(name, { web = false, opts = {}, glow = JADE_GLOW, key: k = '' } = {}) {
  const o = { imperial: 'v4', ...opts, three: { ...JADE_THREE, ...(opts.three || {}) } };
  const key = `${web ? 'web/' : ''}${name}|${JSON.stringify(o)}|${JSON.stringify(glow)}|${k}`;
  if (!cache.has(key)) {
    cache.set(key, loader.loadAsync(`${PKG}models/${web ? 'web/' : ''}${name}.glb`).then((g) => {
      const root = g.scene;
      root.name = name;
      const report = applyFilmMaterials(root, { textures, ...o });
      if (glow) addJadeGlow(root, glow);
      if (report.unknown.length) console.warn(`${name}: unknown materials ${report.unknown.join(', ')}`);
      root.traverse((o) => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
      return root;
    }));
  }
  return cache.get(key);
}

// the glowing jade materials under an object (works on clones: they share materials)
export function glowMats(obj) {
  const out = new Set();
  obj.traverse((o) => { if (o.isMesh) for (const m of [].concat(o.material)) if (m?.userData?.glow) out.add(m); });
  return [...out];
}

export async function json(rel) {
  const r = await fetch(`${PKG}${rel}`);
  if (!r.ok) throw new Error(`${rel}: HTTP ${r.status}`);
  return r.json();
}

// World-space bounding box of an object (after its transforms).
export function bounds(obj) {
  obj.updateWorldMatrix(true, true);
  return new THREE.Box3().setFromObject(obj, true);
}

// Find a mesh by name under root.
export function find(root, name) {
  let hit = null;
  root.traverse((o) => { if (!hit && o.name === name) hit = o; });
  if (!hit) throw new Error(`no node "${name}" under ${root.name}`);
  return hit;
}
