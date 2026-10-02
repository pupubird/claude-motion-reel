// The workshop of 雕刻 and 镶嵌: a dim, warm room — walnut bench, umber plaster — crossed by one shaft of sun from a
// high window behind and to the left. The shaft is a spot light (the pool on the bench, the patch on the wall, hard
// shadows), a volume of lit haze (gl/beam.js) and dust turning in it; the reflections are a dark studio holding one
// bright window, so gold and diamonds carry precise highlights against depth. Light is backlight: jade glows, metal
// rims, stones fire.
import * as THREE from 'three';
import { buildEnv } from '../env.js';
import { createFilmMaterial, meshContext, textures } from '../assets.js';
import { createBeam } from '../gl/beam.js';
import { createFill } from '../lib/fill.js';
import { rng, lerp } from '../lib/util.js';

const ENVS = new Map();   // one reflection studio per window direction

// window: { centre (on the wall), radius, power } — a round lattice window (月洞窗, the moon window) the sun comes through;
// it becomes the shaft's apex, the spot's position and the bright shape the reflections hold.
export function createBeamRoom(ctx, { target = new THREE.Vector3(0, 0.03, 0), apex = new THREE.Vector3(-0.42, 0.62, -0.38), cone = 0.17,
  wallZ = -0.7, dust = 520, sunPower = 9, window: win = null, beamLen = 1.6, envWindow = 16, envBand = 0.85 } = {}) {
  if (win) apex = win.centre.clone().add(new THREE.Vector3(0, 0, -0.02));
  const dir = target.clone().sub(apex).normalize();
  const envKey = apex.clone().sub(target).normalize().toArray().map((v) => v.toFixed(2)).join(',') + `|${envWindow}|${envBand}`;
  if (!ENVS.has(envKey)) ENVS.set(envKey, buildEnv(ctx.renderer, {
    zenith: '#2a2119', horizon: '#3c2e23', ground: '#150f0c', sharp: 0.7, intensity: 1.0,
    boxes: [
      { dir: apex.clone().sub(target).toArray(), dist: 10, size: [2.6, 2.6], color: '#ffe2b8', power: envWindow, shape: win ? 'disc' : 'rect' },   // the window
      { dir: [0.0, 0.95, -0.32], dist: 10, size: [9, 3.4], color: '#fff0dc', power: 1.6 },                                 // a long soft source overhead-behind
      { dir: [0.0, 0.5, -0.86], dist: 10, size: [14, 4], color: '#ffd9a8', power: envBand },                               // a broad warm band behind: gold's body
      { dir: [0.6, 0.55, 0.6], dist: 10, size: [5, 4], color: '#ffe9d2', power: 1.2 },                                   // a warm bounce, front right
      { dir: [-0.1, -0.9, 0.2], dist: 10, size: [6, 6], color: '#7a5a40', power: 0.6 },                                   // the bench under it
      { dir: [0.95, 0.2, -0.2], dist: 10, size: [0.4, 6], color: '#fff3e2', power: 6 },                                   // a thin strip: edges
    ],
  }));
  const ENV = ENVS.get(envKey);
  const scene = new THREE.Scene();
  const DEBUG = typeof location !== 'undefined' && new URLSearchParams(location.search).get('beamdebug');
  scene.environment = DEBUG === 'noenv' ? null : ENV;
  scene.background = new THREE.Color('#120d0a');

  // bench and wall
  const bench = new THREE.Mesh(new THREE.PlaneGeometry(1.8, 1.8), null);
  bench.rotation.x = -Math.PI / 2;
  bench.material = createFilmMaterial('walnut', { ctx: meshContext(bench, bench), textures });
  bench.receiveShadow = true;
  const wall = new THREE.Mesh(new THREE.PlaneGeometry(2.2, 1.2), null);
  wall.position.set(0, 0.6, wallZ);
  wall.material = createFilmMaterial('plaster_lime', { ctx: meshContext(wall, wall), textures });
  wall.material.userData.filmUniforms.uScanTint?.value.set(0.36, 0.25, 0.17, 0.85);   // warm umber lime
  wall.receiveShadow = true;
  scene.add(bench, wall);
  // the moon window: the ice-crack lattice glowing with the sun behind it (mask white = open, black = the lattice)
  if (win) {
    const tex = textures.mask('lattice_moonwindow');     // the ice-crack lattice (its disc is 17.0 % of the texture, centred)
    // opaque with an alpha test, not transparent: three.js leaves transparent objects out of the pass that transmissive
    // materials refract, and jade in front of the window must see its light through itself
    const glass = new THREE.Mesh(new THREE.CircleGeometry(win.radius, 96), new THREE.MeshBasicMaterial({
      color: new THREE.Color('#ffe2b6').multiplyScalar(win.power ?? 5), map: tex, alphaMap: tex, alphaTest: 0.5 }));
    const uv = glass.geometry.attributes.uv;
    for (let i = 0; i < uv.count; i++) uv.setXY(i, 0.5 + (uv.getX(i) - 0.5) * 0.1704, 0.5 + (uv.getY(i) - 0.5) * 0.1704);
    glass.position.copy(win.centre).setZ(wallZ + 0.001);
    scene.add(glass);
  }

  // the sun through the window: a soft-edged spot, its shadow, and a very low fill
  const sun = new THREE.SpotLight(new THREE.Color('#ffdcae'), 0, 0, cone, 0.45, 0);
  sun.castShadow = true;
  sun.shadow.mapSize.set(4096, 4096);
  sun.shadow.bias = -0.00004;
  sun.shadow.normalBias = 0.0003;
  sun.shadow.camera.near = 0.2; sun.shadow.camera.far = 2.0;
  sun.position.copy(apex);
  sun.target.position.copy(target);
  scene.add(sun, sun.target);
  // a faint directional along the shaft: it lights almost nothing, but the diamonds' traced fire reads directional
  // lights as the sun's disc (their uGemSun is raised to match)
  const fire = new THREE.DirectionalLight(new THREE.Color('#ffe4bf'), 0.12);
  fire.position.copy(apex).sub(target).normalize();
  scene.add(fire, fire.target);
  const hemi = new THREE.HemisphereLight(new THREE.Color('#5a4a3c'), new THREE.Color('#241a14'), 0.35);
  scene.add(hemi);
  const fill = createFill(0.22);

  // the visible shaft
  const beam = createBeam({ apex, dir, tan: Math.tan(cone * 0.92), r0: win ? win.radius * 0.8 : 0.03, len: apex.distanceTo(target) * beamLen, color: '#ffd7a2', power: 1.0, density: 1.6, g: 0.62, bars: win ? 0.2 : 0.45 });

  // dust: specks turning in the air; lit only inside the shaft
  const r = rng(808);
  const motes = [];
  for (let i = 0; i < dust; i++) {
    const a = r();
    const along = lerp(0.25, 1.15, a) * apex.distanceTo(target);
    motes.push({ along, ang: r() * Math.PI * 2, rad: Math.sqrt(r()), s: lerp(0.12, 0.38, r() * r()) * 0.001, ph: r() * 6.28, sp: lerp(0.1, 0.4, r()) });
  }
  const moteMat = new THREE.MeshBasicMaterial({ color: new THREE.Color('#ffe6c4').multiplyScalar(6), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending });
  const moteMesh = new THREE.InstancedMesh(new THREE.SphereGeometry(1, 6, 4), moteMat, dust);
  moteMesh.instanceColor = new THREE.InstancedBufferAttribute(new Float32Array(dust * 3), 3);
  moteMesh.frustumCulled = false;
  scene.add(moteMesh);
  const side = new THREE.Vector3().crossVectors(dir, new THREE.Vector3(0, 1, 0)).normalize();
  const up = new THREE.Vector3().crossVectors(side, dir).normalize();
  const tanC = Math.tan(cone);

  return {
    scene, sun, fire, hemi, fill, beam, dir, apex, target,
    finish() { fill.apply(scene); },
    update(t, sub, { power = 1, beamPower = 1 } = {}) {
      // the sun is an area source (the window): jitter its position per sub-sample for soft shadow edges
      const j = 0.035;
      sun.position.copy(apex).addScaledVector(side, (sub.lu - 0.5) * j).addScaledVector(up, (sub.lv - 0.5) * j);
      sun.intensity = sunPower * power;
      beam.uniforms.uTime.value = t;
      beam.uniforms.uColor.value.set('#ffd7a2').multiplyScalar(beamPower * power);
      const m = new THREE.Matrix4(), q = new THREE.Quaternion(), p = new THREE.Vector3(), sc = new THREE.Vector3(), c = new THREE.Color();
      motes.forEach((d, i) => {
        // drift: down the shaft a little, round its axis slowly, a wobble
        const along = d.along + Math.sin(t * d.sp + d.ph) * 0.01 - t * 0.004;
        const R = (0.03 + along * tanC) * d.rad * 1.25;
        const ang = d.ang + t * 0.08 * d.sp;
        p.copy(apex).addScaledVector(dir, along).addScaledVector(side, Math.cos(ang) * R).addScaledVector(up, Math.sin(ang) * R);
        p.y += Math.sin(t * 0.7 + d.ph) * 0.002;
        // lit inside the shaft only (soft edge), so specks wink as they cross its border
        const rr = R / Math.max(1e-4, 0.03 + along * tanC);
        const lit = Math.max(0, Math.min(1, (1.0 - rr) / 0.25)) * power;
        sc.setScalar(d.s);
        m.compose(p, q, sc);
        moteMesh.setMatrixAt(i, m);
        moteMesh.setColorAt(i, c.setScalar(lit));
      });
      moteMesh.instanceMatrix.needsUpdate = true;
      moteMesh.instanceColor.needsUpdate = true;
    },
    composite: (r, color, depth, camera, out, s) => beam.composite(r, color, depth, camera, out, s),
  };
}
