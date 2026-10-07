// The mark in 3D: the double bubble as real soap film — a blue bubble and a coral one kissing, centres one radius
// apart (Plateau: equal radii meet at a flat wall of radius r·√3/2), each film clipped where it would pass inside the
// other, and the shared wall a film disc between them. The 2D mark (world/mark.js) is its drawing; this is the object.
//   const M = mark3d(); scene.add(M.group); M.set({ pos, r, yaw, pitch, t, alpha, glow, wob })
import * as THREE from 'three';
import { bubbleMesh, wallMesh } from './bubble.js';

const _a = new THREE.Vector3(), _b = new THREE.Vector3(), _ax = new THREE.Vector3();

export function mark3d() {
  const group = new THREE.Group();
  const blue = bubbleMesh({ thick: 360, fill: 0.92, colors: ['#1D4FF0', '#3E6BFF', '#2A5BFF'], seed: 1.2, glow: 0.55 });
  const coral = bubbleMesh({ thick: 360, fill: 0.92, colors: ['#FF7A59', '#FF936B', '#FF6A4C'], seed: 3.7, glow: 0.55 });
  const wall = wallMesh({ seed: 5.5 });
  wall.uniforms.uEnvGain.value = 1.6;
  group.add(blue, coral, wall);
  const api = {
    group, blue, coral, wall,
    // pos: world centre (between the two), r: bubble radius, axis (or yaw/pitch, radians) blue → coral, wob: a squash
    // impulse (−1…1) for landings, glow 0…1, order: render order base
    set({ pos, r, axis = null, yaw = 0, pitch = 0, t = 0, alpha = 1, glow = 0.5, wob = 0, order = 30 }) {
      group.visible = alpha > 0.002;
      if (!group.visible) return;
      if (axis) _ax.copy(axis).normalize();          // from blue to coral, in world space
      else _ax.set(Math.cos(yaw) * Math.cos(pitch), Math.sin(pitch), -Math.sin(yaw) * Math.cos(pitch)).normalize();
      _a.copy(pos).addScaledVector(_ax, -r / 2);
      _b.copy(pos).addScaledVector(_ax, r / 2);
      for (const [m, c, o] of [[blue, _a, _b], [coral, _b, _a]]) {
        m.position.copy(c); m.scale.setScalar(r);
        const u = m.uniforms;
        u.uTime.value = t; u.uAlpha.value = alpha; u.uGlow.value = glow;
        u.uClip.value.set(o.x, o.y, o.z, r * 0.999);           // no film inside the other bubble
        u.uSquash.value = 0.12 * wob; u.uSquashDir.value.copy(_ax);
        u.uWobble.value = 0.02 + 0.04 * Math.abs(wob);
      }
      wall.position.copy(pos);
      wall.scale.setScalar(r * Math.sqrt(3) / 2);
      wall.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), _ax);
      wall.uniforms.uTime.value = t; wall.uniforms.uAlpha.value = alpha;
      // far film first: the bubble farther from the camera, then the wall, then the nearer one (set by the caller's
      // camera through `nearFirst`; default blue behind)
      blue.children[0].renderOrder = order; blue.children[1].renderOrder = order + 1;
      wall.renderOrder = order + 2;
      coral.children[0].renderOrder = order + 3; coral.children[1].renderOrder = order + 4;
    },
    // which bubble is nearer the camera decides the order (call after set, with the camera position)
    sortFor(cameraPos, order = 30) {
      const nearBlue = blue.position.distanceToSquared(cameraPos) < coral.position.distanceToSquared(cameraPos);
      const [far, near] = nearBlue ? [coral, blue] : [blue, coral];
      far.children[0].renderOrder = order; far.children[1].renderOrder = order + 1;
      wall.renderOrder = order + 2;
      near.children[0].renderOrder = order + 3; near.children[1].renderOrder = order + 4;
    },
  };
  return api;
}
