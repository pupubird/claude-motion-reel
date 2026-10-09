// A person in a glass orb (v2, the crazy version): their face on a disc at the heart of a ball of clear glass with a
// soap film's rainbow on its skin (iridescence) — the glass refracts the face (three's transmission), so each one is
// a little world. The disc always faces the lens; the ball turns with the light.
import * as THREE from 'three';
import { drawPhoto } from '../assets.js';

const TEX = new Map();
function faceTex(key, px = 512) {
  if (TEX.has(key)) return TEX.get(key);
  const c = document.createElement('canvas');
  c.width = c.height = px;
  drawPhoto(c.getContext('2d'), key, px / 2, px / 2, px / 2);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  TEX.set(key, t);
  return t;
}

// → { group, disc, shell, setLook(camera) }; r: the ball's radius (world)
export function faceOrb(key, envMap, { r = 0.45, tint = '#FFFFFF', irid = 0.85 } = {}) {
  const group = new THREE.Group();
  const disc = new THREE.Mesh(new THREE.CircleGeometry(r * 0.86, 64), new THREE.MeshBasicMaterial({ map: faceTex(key), toneMapped: false }));
  group.add(disc);
  const shell = new THREE.Mesh(new THREE.SphereGeometry(r, 64, 40), new THREE.MeshPhysicalMaterial({
    color: new THREE.Color('#FFFFFF'), metalness: 0, roughness: 0.02, transmission: 1, thickness: r * 1.6, ior: 1.35,
    attenuationColor: new THREE.Color(tint), attenuationDistance: 3, envMap, envMapIntensity: 0.9, clearcoat: 1, clearcoatRoughness: 0.02,
    iridescence: irid, iridescenceIOR: 1.33, iridescenceThicknessRange: [180, 620], specularIntensity: 1,
  }));
  group.add(shell);
  return {
    group, disc, shell,
    // the face turns to the lens (a billboard inside the ball)
    setLook(camera) { disc.quaternion.copy(camera.quaternion); },
  };
}
