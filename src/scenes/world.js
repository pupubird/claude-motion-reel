// Bars 3–4 · the 3D world seen through the O: knot + satellites, then the particle galaxy.
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { W, H, BEAT, COLORS as C, FONTS } from '../config.js';
import { ease, seg, lerp, rng, TAU, wobble, clamp } from '../util.js';
import { kickPulse } from '../score.js';
import { font } from '../draw2d.js';
import { oCenter } from './type.js';
import { makeTube, updateTube, sampleTube } from './knot.js';
import { makeParticles, makeDust, COUNT } from './particles.js';

const CX = W / 2, CY = H / 2;
const SAT = 180;
let scene, cam, knot, knotMat, sats, particles, dust, core;
const dummy = new THREE.Object3D();
const v = new THREE.Vector3(), a = new THREE.Vector3(), b = new THREE.Vector3();

function knotState(gb, t) {
  return {
    m1: seg(gb, 8.0, 8.85, ease.outExpo),
    m2: seg(gb, 10.0, 10.85, ease.inOutCubic),
    r: 0.42 + 0.05 * kickPulse(t, 0.12),
    rx: 0.35 * seg(gb, 8, 9.5, ease.inOutCubic) + Math.PI * seg(gb, 9.9, 10.75, ease.inOutQuart),
    ry: (gb - 6) * 0.2,
    rz: (gb - 6) * 0.3,
    glow: seg(gb, 11.2, 12.0, ease.inQuad),
  };
}

function camParams(gb) {
  if (gb < 8.2) return { r: 70 * Math.pow(9 / 70, seg(gb, 6.0, 8.2, ease.inOutQuart)), th: 0, ph: 0 };
  if (gb < 12) {
    const k = seg(gb, 8.2, 12, ease.inOutSine);
    return { r: lerp(9, 7.6, k), th: lerp(0, 1.3, k), ph: lerp(0, 0.42, k) };
  }
  let r = lerp(7.6, 14.5, seg(gb, 12, 13.3, ease.outCubic));
  r = lerp(r, 2.2, seg(gb, 14.7, 16, ease.inExpo));
  let ph = lerp(0.42, 0.98, seg(gb, 12.3, 14.5, ease.inOutCubic));
  ph = lerp(ph, 0.62, seg(gb, 14.7, 16, ease.inCubic));
  return { r, th: 1.3 + (gb - 12) * 0.34, ph };
}

// Satellite choreography: centre → ring → double helix → Fibonacci sphere → vortex.
function satPos(i, gb, out) {
  const u = i / SAT, d = (i % 12) / 12 * 0.28;
  const ring = a.set(Math.cos(u * TAU + gb * 0.4) * 3.4, Math.sin(u * TAU + gb * 0.4) * 3.4, 0.35 * Math.sin(u * TAU * 5 + gb));
  out.set(0, 0, 0).lerp(ring, seg(gb, 8.0 + d, 8.8 + d, ease.outExpo));
  const s = i % 2, k = Math.floor(i / 2) / (SAT / 2), ang = k * TAU * 2 + s * Math.PI + gb * 0.6;
  out.lerp(b.set(Math.cos(ang) * 2.9, (k - 0.5) * 6.4, Math.sin(ang) * 2.9), seg(gb, 9.0 + d, 9.8 + d, ease.inOutCubic));
  const y = 1 - (2 * (i + 0.5)) / SAT, rr = Math.sqrt(1 - y * y), fa = i * 2.39996 + gb * 0.35;
  out.lerp(a.set(Math.cos(fa) * rr * 3.6, y * 3.6, Math.sin(fa) * rr * 3.6), seg(gb, 10.0 + d, 10.8 + d, ease.inOutCubic));
  const kv = seg(gb, 11.0 + d * 0.5, 11.85, ease.inExpo);
  const va = kv * 5.0, c = Math.cos(va), sn = Math.sin(va);
  out.set(out.x * c - out.z * sn, out.y, out.x * sn + out.z * c).multiplyScalar(1 - kv);
  return seg(gb, 8.0 + d, 8.5 + d, ease.outBack) * (1 - kv);
}

function init(env) {
  const R = rng(42);
  scene = new THREE.Scene();
  scene.background = new THREE.Color(C.ink).multiplyScalar(0.7);
  const pmrem = new THREE.PMREMGenerator(env.renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environmentIntensity = 0.42;
  cam = new THREE.PerspectiveCamera(35, W / H, 0.1, 400);

  const key = new THREE.DirectionalLight(0xfff1e0, 2.8);
  key.position.set(5, 6, 7);
  const rim = new THREE.PointLight(new THREE.Color(C.volt), 60, 0, 2);
  rim.position.set(-4, -2, -5);
  scene.add(key, rim);

  knotMat = new THREE.MeshPhysicalMaterial({
    color: C.hot, roughness: 0.3, metalness: 0.0, clearcoat: 1, clearcoatRoughness: 0.05,
    emissive: new THREE.Color(C.hot), emissiveIntensity: 0,
  });
  knot = new THREE.Mesh(makeTube(), knotMat);
  scene.add(knot);

  sats = new THREE.InstancedMesh(
    new RoundedBoxGeometry(0.2, 0.2, 0.2, 2, 0.045),
    new THREE.MeshPhysicalMaterial({ roughness: 0.4, clearcoat: 0.6, clearcoatRoughness: 0.15 }),
    SAT,
  );
  const col = new THREE.Color();
  for (let i = 0; i < SAT; i++) sats.setColorAt(i, col.set(i % 9 === 0 ? C.hot : i % 4 === 0 ? C.volt : C.bone));
  scene.add(sats);

  // Freeze the knot exactly as it is at beat 12 and seed the particles on its surface.
  const ks = knotState(12, 12 * BEAT);
  updateTube(knot.geometry, ks.m1, ks.m2, ks.r);
  knot.rotation.set(ks.rx, ks.ry, ks.rz);
  knot.updateMatrixWorld(true);
  const pts = sampleTube(knot.geometry, COUNT, R);
  for (let n = 0; n < COUNT; n++) {
    v.fromArray(pts, n * 3).applyMatrix4(knot.matrixWorld).toArray(pts, n * 3);
  }
  particles = makeParticles(pts, R, C);
  scene.add(particles);

  dust = makeDust(R);
  scene.add(dust);

  core = new THREE.Mesh(new THREE.SphereGeometry(0.06, 24, 16), new THREE.MeshBasicMaterial({ color: new THREE.Color(C.bone) }));
  scene.add(core);
}

function update(t) {
  const gb = t / BEAT;
  const { r, th, ph } = camParams(gb);
  cam.position.set(r * Math.sin(th) * Math.cos(ph), r * Math.sin(ph), r * Math.cos(th) * Math.cos(ph));
  const hand = gb > 8 ? 0.06 : 0;
  cam.up.set(Math.sin(wobble(t * 0.5, 3) * 0.04), 1, 0).normalize();
  cam.lookAt(wobble(t, 1) * hand, wobble(t, 2) * hand, 0);
  cam.fov = 35 - 1.4 * kickPulse(t, 0.1) * (gb > 8 ? 1 : 0);
  cam.updateProjectionMatrix();
  if (gb < 8) {
    const oc = oCenter(gb);
    cam.setViewOffset(W, H, CX - oc.x, CY - oc.y, W, H);
  } else cam.clearViewOffset();
  const pix = H / (2 * Math.tan(THREE.MathUtils.degToRad(cam.fov) / 2));

  const ks = knotState(gb, t);
  knot.visible = gb < 12;
  if (knot.visible) {
    updateTube(knot.geometry, ks.m1, ks.m2, ks.r);
    knot.rotation.set(ks.rx, ks.ry, ks.rz);
    knotMat.emissiveIntensity = 2.2 * ks.glow;
  }

  sats.visible = gb >= 8 && gb < 12;
  if (sats.visible) {
    const kp = kickPulse(t, 0.1);
    for (let i = 0; i < SAT; i++) {
      const s = satPos(i, gb, dummy.position);
      dummy.rotation.set(i * 0.7 + gb * 1.1, i * 1.3 + gb * 0.8, 0);
      dummy.scale.setScalar(Math.max(1e-4, s * (1 + 0.35 * kp)));
      dummy.updateMatrix();
      sats.setMatrixAt(i, dummy.matrix);
    }
    sats.instanceMatrix.needsUpdate = true;
  }

  particles.visible = gb >= 12;
  const pu = particles.material.uniforms;
  pu.uB.value = gb - 12;
  pu.uTime.value = t;
  pu.uPix.value = pix;
  dust.material.uniforms.uPix.value = pix;

  const sing = seg(gb, 15.0, 15.95, ease.inQuad);
  core.visible = gb >= 15;
  core.scale.setScalar(0.4 + sing * 2.2);
  core.material.color.set(C.bone).multiplyScalar(1 + sing * 30);

  const burst = gb >= 12 ? 1 : 0;
  return {
    scene, camera: cam, exposure: 1.0,
    bloom: burst
      ? { strength: 0.75 + sing * 1.2, radius: 0.7, threshold: 0.62 }
      : { strength: 0.32 + ks.glow * 1.1, radius: 0.5, threshold: 1.0 - ks.glow * 0.3 },
  };
}

// 2D overlay: technical callout on the knot, particle counter.
function drawOverlay(ctx, t) {
  const gb = t / BEAT;
  ctx.fillStyle = C.bone;
  ctx.strokeStyle = C.bone;
  if (gb >= 8.5 && gb < 11.6) {
    const ks = knotState(gb, t);
    v.set(1.5 + 0.62, 0, 0);
    v.applyEuler(new THREE.Euler(ks.rx, ks.ry, ks.rz)).project(cam);
    const ax = (v.x * 0.5 + 0.5) * W, ay = (-v.y * 0.5 + 0.5) * H;
    const draw = seg(gb, 8.55, 9.2, ease.outExpo), hide = seg(gb, 11.2, 11.6, ease.inCubic);
    const k = draw * (1 - hide);
    const ex = ax + 90 * k, ey = ay - 90 * k, lx = ex + 230 * seg(gb, 8.7, 9.3, ease.outExpo) * (1 - hide);
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(ax, ay, 5 * k, 0, TAU);
    ctx.moveTo(ax, ay);
    ctx.lineTo(ex, ey);
    ctx.lineTo(lx, ey);
    ctx.stroke();
    ctx.globalAlpha = seg(gb, 8.9, 9.3) * (1 - hide);
    font(ctx, { f: FONTS.mono, w: 700, s: 14 });
    ctx.letterSpacing = '3px';
    ctx.fillText('TORUS KNOT', ex + 4, ey - 34);
    font(ctx, { f: FONTS.mono, w: 400, s: 14 });
    ctx.letterSpacing = '1px';
    ctx.fillText(`p=2 · q=${(3 + 2 * ks.m2).toFixed(2)} · r=${ks.r.toFixed(3)}`, ex + 4, ey - 12);
    ctx.globalAlpha *= 0.6;
    ctx.fillText(`${knot.geometry.attributes.position.count.toLocaleString('en-US')} verts · rebuilt every frame`, ex + 4, ey + 20);
    ctx.globalAlpha = 1;
    ctx.letterSpacing = '0px';
  }
  if (gb >= 12.2 && gb < 15.6) {
    const k = seg(gb, 12.2, 12.6, ease.outExpo) * (1 - seg(gb, 15.2, 15.6));
    const n = Math.round(COUNT * seg(gb, 12.2, 13.4, ease.outCubic));
    ctx.globalAlpha = k;
    ctx.textAlign = 'right';
    font(ctx, { w: 800, s: 64 });
    ctx.fillText(n.toLocaleString('en-US'), W - 90, 210);
    font(ctx, { f: FONTS.serif, i: true, s: 34 });
    ctx.fillText('particles, one draw call', W - 90, 252);
    ctx.textAlign = 'left';
    ctx.globalAlpha = 1;
  }
}

function fx(t) {
  const gb = t / BEAT;
  if (gb < 11 || gb >= 16.2) return null;
  const shatter = gb >= 12 ? Math.exp(-(t - 12 * BEAT) / 0.12) : 0;
  const suck = seg(gb, 15.0, 16.0, ease.inCubic) * (gb < 16 ? 1 : 0);
  return { flash: shatter * 0.28, ca: shatter * 2.5 + suck * 3.5, zoom: 1 + suck * 0.04 };
}

export default {
  id: 'world',
  init,
  three: { start: 6 * BEAT, end: 16 * BEAT, update },
  layers: [{ start: 8 * BEAT, end: 16 * BEAT, draw: drawOverlay }],
  fx,
};
