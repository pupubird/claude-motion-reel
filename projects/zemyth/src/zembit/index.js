// The Zembit rig. Hierarchy (feet at the origin, facing +z):
//   root → body (squash & stretch about the feet) → hips (lean) → torso, arms, neck → head → visor, rim, phones
//   legs hang off body so they stay planted while the torso leans.
// setPose() takes plain numbers; setFace() drives the SDF eyes on the visor.
import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { HEAD, headGeometry, visorGeometry, rimGeometry, discGeometry, torsoGeometry, capsule, handGeometries } from './geometry.js';
import { clayMaterial, limeMaterial, torsoMaterial, visorMaterial } from './materials.js';

// Eye layout on the visor (head-local units), measured off mascot-hero.png.
export const EYE = { x: 0.244, y: -0.169, hw: 0.085, hh: 0.095 };
const MARK_FILL = 1000 / 1024;   // the mark texture draws the tile at 1000 of 1024 px

export function createZembit() {
  const clay = clayMaterial(), lime = limeMaterial(), torsoMat = torsoMaterial(), visorMat = visorMaterial();
  const face = visorMat.userData.face;

  const root = new THREE.Group();
  const body = new THREE.Group();
  root.add(body);
  const hips = new THREE.Group();
  hips.position.set(0, 0.34, 0);
  body.add(hips);
  const torso = new THREE.Mesh(torsoGeometry(), torsoMat);
  torso.position.y = -0.34;
  hips.add(torso);
  const neck = new THREE.Group();
  neck.position.set(0, 0.9 - 0.34, 0);
  hips.add(neck);
  const head = new THREE.Group();
  head.position.set(0, HEAD.y - 0.9, 0);
  neck.add(head);
  head.add(new THREE.Mesh(headGeometry(), clay));
  const visor = new THREE.Mesh(visorGeometry(), visorMat);
  head.add(visor);
  const rimMat = clayMaterial('#57595a');   // the visor lip reads lighter than the shell in the reference
  head.add(new THREE.Mesh(rimGeometry(), rimMat));

  // Headphones: dark spacer, lime pad, dark cup, lime cap — outward from each side of the head.
  const phones = [];
  for (const side of [-1, 1]) {
    const g = new THREE.Group();
    g.position.set(side * 0.6, 0.0, -0.05);
    head.add(g);
    // [R, thickness, x offset, material, dome] — the lime face sits inset in the dark cup's rim (mic / 404 poses)
    const stack = [[0.34, 0.08, 0.07, clay, 0], [0.378, 0.06, 0.135, lime, 0], [0.405, 0.14, 0.235, clay, 0], [0.345, 0.05, 0.3, lime, 0.026]];
    for (const [R, t, x, m, dome] of stack) {
      const d = new THREE.Mesh(discGeometry(R, t, Math.min(0.038, t * 0.48), 96, dome), m);
      d.position.x = side * x;
      g.add(d);
    }
    phones.push(g);
  }

  // Arms: shoulder → upper arm → elbow → forearm → wrist → mitten.
  const handGeo = mergeGeometries(handGeometries());
  const arms = [-1, 1].map((side) => {
    const shoulder = new THREE.Group();
    shoulder.position.set(side * 0.335, 0.8 - 0.34, 0.0);
    hips.add(shoulder);
    const upper = new THREE.Mesh(capsule(0.084, 0.1), clay);
    upper.position.y = -0.09;
    shoulder.add(upper);
    const elbow = new THREE.Group();
    elbow.position.y = -0.165;
    shoulder.add(elbow);
    const fore = new THREE.Mesh(capsule(0.079, 0.06), clay);
    fore.position.y = -0.055;
    elbow.add(fore);
    const wrist = new THREE.Group();
    wrist.position.y = -0.105;
    elbow.add(wrist);
    const hand = new THREE.Mesh(handGeo, clay);
    if (side < 0) hand.scale.x = -1;   // mirror the thumb
    wrist.add(hand);
    return { side, shoulder, elbow, wrist, hand };
  });

  // Legs: stubby capsules, feet at y = 0.
  for (const side of [-1, 1]) {
    const leg = new THREE.Mesh(capsule(0.128, 0.18), clay);
    leg.position.set(side * 0.142, 0.218, 0.0);
    leg.scale.set(1, 1, 1.08);
    body.add(leg);
  }

  root.traverse((o) => { if (o.isMesh) { o.castShadow = false; o.receiveShadow = false; } });

  // p: { x, y, z, yaw, squash, leanX, leanZ, nod, turn, tilt, phone, arms: [{ raise, swing, bend, bendZ, wrist }, …] }
  function setPose(p = {}) {
    root.position.set(p.x ?? 0, p.y ?? 0, p.z ?? 0);
    root.rotation.set(0, p.yaw ?? 0, 0);
    const s = p.squash ?? 1;
    body.scale.set(1 / Math.sqrt(s), s, 1 / Math.sqrt(s));
    hips.rotation.set(p.leanX ?? 0, 0, p.leanZ ?? 0);
    neck.rotation.set(p.nod ?? 0, p.turn ?? 0, p.tilt ?? 0, 'YXZ');
    phones.forEach((g) => g.rotation.set(p.phone ?? 0, 0, 0));
    arms.forEach((a, i) => {
      const q = (p.arms && p.arms[i]) || {};
      a.shoulder.rotation.set(q.swing ?? 0, q.twist ?? 0, a.side * (q.raise ?? 0.3), 'XYZ');
      a.elbow.rotation.set(q.bend ?? 0.1, 0, a.side * (q.bendZ ?? 0.05));
      a.wrist.rotation.set(q.wristX ?? 0, q.wristY ?? 0, a.side * (q.wrist ?? 0));
    });
  }

  // e: { open, gx, gy, sx, sy, happy } per eye; power 0–1; mark: { on, cx, cy, h } (visor units, tile height)
  function setFace({ L = {}, R = {}, power = 1, gain = 1.037, glass = 1, mark = null } = {}) {
    const eye = (v, e, side) => {
      const open = Math.max(0, Math.min(1, e.open ?? 1));
      const sx = (e.sx ?? 1) * (1 + (1 - open) * 0.14);
      const sy = (e.sy ?? 1) * Math.max(0.1, open);
      v.set(side * EYE.x + (e.gx ?? 0), EYE.y + (e.gy ?? 0), EYE.hw * sx, EYE.hh * sy);
    };
    eye(face.uEyeL.value, L, -1);
    eye(face.uEyeR.value, R, 1);
    face.uHappy.value.set(L.happy ?? 0, R.happy ?? 0);
    face.uPower.value = power;
    face.uEyeGain.value = gain;
    face.uGlass.value = glass;
    if (mark && mark.on > 0) face.uMark.value.set(mark.cx, mark.cy, (mark.h / 2) / MARK_FILL, mark.on);
    else face.uMark.value.w = 0;
    // eyes vanish while the mark is on screen (the mark replaces them)
    if (mark && mark.hideEyes) face.uPower.value = power * (1 - mark.hideEyes);
  }

  setPose();
  setFace();
  return { root, body, hips, neck, head, visor, phones, arms, setPose, setFace, materials: { clay, lime, torsoMat, visorMat } };
}
