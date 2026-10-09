// Bub in 3D: the AI host as a character inside the bubble universe, not a sticker on top of it (owner, v3 notes: "the
// bubble is also part of the universe… now just feel like detached"). A soap-film body (the hero bubble shader with
// haze, rim and edge, so a clear film still reads on the pale sky) and a face on its surface — two eyes with
// catchlights, happy arcs, blush — on a head that turns toward whatever Bub looks at: the eyes slide round the sphere
// toward the silhouette when it looks away, as a real head turns. Squash and stretch along any direction, a head
// shake. Depth-tested with the crowd: an orb in front hides it, orbs behind show through its film.
//   const B = bub3d(); scene.add(B.root); B.set({ pos, r, gaze, toCam, … }) every frame
import * as THREE from 'three';
import { bubbleMesh } from './bubble.js';

const Z = new THREE.Vector3(0, 0, 1), Y = new THREE.Vector3(0, 1, 0);
const _m = new THREE.Matrix4(), _x = new THREE.Vector3(), _y = new THREE.Vector3(), _z = new THREE.Vector3();
const _q = new THREE.Quaternion(), _g = new THREE.Vector3();

// orient an object so its +z is the unit vector n and its +y leans to world up
function onSurface(o, n, r) {
  _z.copy(n).normalize();
  _x.crossVectors(Y, _z); if (_x.lengthSq() < 1e-6) _x.set(1, 0, 0); _x.normalize();
  _y.crossVectors(_z, _x);
  o.quaternion.setFromRotationMatrix(_m.makeBasis(_x, _y, _z));
  o.position.copy(_z).multiplyScalar(r);
}

export function bub3d({ seed = 9 } = {}) {
  const root = new THREE.Group();                    // position, radius
  const orient = new THREE.Group();                  // squash axis → +y
  const squash = new THREE.Group();                  // volume-preserving scale along +y
  const unorient = new THREE.Group();
  root.add(orient); orient.add(squash); squash.add(unorient);
  const film = bubbleMesh({ thick: 430, fill: 0, seed, glow: 0.2 });
  const U = film.uniforms;
  U.uHaze.value = 0.22; U.uRimGain.value = 2.2; U.uEdge.value = 0.85; U.uEnvGain.value = 1.35; U.uWobble.value = 0.03;
  U.uEdgeCol.value.setRGB(0.36, 0.4, 0.7);
  unorient.add(film);
  const head = new THREE.Group();                    // +z = where the face points
  unorient.add(head);

  const navy = new THREE.MeshBasicMaterial({ color: new THREE.Color('#0B1B3F') });
  const white = new THREE.MeshBasicMaterial({ color: new THREE.Color('#FFFFFF') });
  const blushMat = new THREE.MeshBasicMaterial({ color: new THREE.Color('#FF7A9C'), transparent: true, opacity: 0.3, depthWrite: false });
  const eyeGeo = new THREE.SphereGeometry(1, 32, 20), dotGeo = new THREE.CircleGeometry(1, 24);
  const arcGeo = new THREE.TorusGeometry(1, 0.2, 10, 40, Math.PI * 0.7);
  const eyes = [-1, 1].map((s) => {
    const g = new THREE.Group();
    const ball = new THREE.Mesh(eyeGeo, navy), dot = new THREE.Mesh(dotGeo, white), arc = new THREE.Mesh(arcGeo, navy);
    arc.rotation.z = Math.PI * 0.15;                 // the arc spans 0.15π → 0.85π: an upward ∩ (^)
    g.add(ball, dot, arc);
    head.add(g);
    return { s, g, ball, dot, arc };
  });
  const blush = [-1, 1].map((s) => { const m = new THREE.Mesh(dotGeo, blushMat); head.add(m); return { s, m }; });

  const api = {
    root, film, uniforms: U,
    // pos (Vector3), r (world radius), gaze (world direction the face points), toCam (unit vector Bub → camera),
    // squashDir (world unit), squashK (+ stretch along it, − squash), look [x, y] (eye darts inside the face, −1…1),
    // blink, happy, wide, squint (0…1), blush (0…1), shake (radians of head yaw), t, order (render order base)
    set({ pos, r, gaze, toCam, squashDir = null, squashK = 0, look = [0, 0], blink = 0, happy = 0, wide = 0, squint = 0,
      blush: bl = 0.6, shake = 0, t = 0, order = 10, faceMin = 0.6, eyeScale = 1 }) {
      root.position.copy(pos);
      root.scale.setScalar(r);
      // squash along an axis (volume-preserving)
      if (squashDir && Math.abs(squashK) > 1e-4) {
        _q.setFromUnitVectors(Y, _g.copy(squashDir).normalize());
        orient.quaternion.copy(_q); unorient.quaternion.copy(_q).invert();
        const a = 1 + squashK, b = 1 / Math.sqrt(Math.max(0.2, a));
        squash.scale.set(b, a, b);
      } else { orient.quaternion.identity(); unorient.quaternion.identity(); squash.scale.set(1, 1, 1); }
      // the head: the face points along gaze, but never so far round that the camera loses it (a character, not a
      // sphere: we keep seeing its eyes); then the shake
      _g.copy(gaze).normalize();
      const d = _g.dot(toCam);
      if (d < faceMin) _g.addScaledVector(toCam, faceMin - d).normalize();
      _z.copy(_g); _x.crossVectors(Y, _z); if (_x.lengthSq() < 1e-6) _x.set(1, 0, 0); _x.normalize(); _y.crossVectors(_z, _x);
      head.quaternion.setFromRotationMatrix(_m.makeBasis(_x, _y, _z));
      if (shake) head.rotateY(shake);
      // the eyes (sizes in Bub radii, from the 2D face: eyes 0.3 apart, a little low — baby schema)
      const w = (0.15 + 0.03 * wide) * eyeScale, h = (0.23 + 0.05 * wide) * eyeScale * (1 - 0.88 * Math.min(1, blink)) * (1 - 0.55 * squint);
      for (const e of eyes) {
        const n = _x.set(e.s * (0.3 + 0.06 * (eyeScale - 1)) + look[0] * 0.12, -0.08 - look[1] * 0.07, 0).setZ(Math.sqrt(Math.max(0.2, 1 - _x.lengthSq())));
        onSurface(e.g, n.clone(), 0.965);
        const isHappy = happy > 0.5;
        e.ball.visible = !isHappy; e.dot.visible = !isHappy && blink < 0.6 && squint < 0.7;
        e.arc.visible = isHappy;
        e.ball.scale.set(w, Math.max(h, 0.02), 0.045);
        e.dot.scale.setScalar(w * 0.34); e.dot.position.set(w * 0.32, h * 0.38, 0.05);
        e.arc.scale.setScalar(w * 1.05); e.arc.position.set(0, -0.06, 0.03);
      }
      for (const b of blush) {
        onSurface(b.m, new THREE.Vector3(b.s * 0.47, -0.36 - look[1] * 0.07, 0.8), 1.004);
        b.m.scale.set(0.12, 0.06, 1);
      }
      blushMat.opacity = 0.28 * bl;
      U.uTime.value = t;
      // render order: the far wall, then the face, then the near wall (the film's front is drawn over the face's edges)
      film.children[0].renderOrder = order; film.children[1].renderOrder = order + 3;
      for (const b of blush) b.m.renderOrder = order + 2;
    },
  };
  return api;
}
