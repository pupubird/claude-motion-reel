// Bars 11–12 · FUNDING.
// The two tossed coins come back down, and 355 more follow: glossy lime coins with the Z-peak struck
// into their faces, falling on analytic trajectories (gravity, tumble that settles to flat, a landing
// tick) into twelve stacks. The stack heights trace the zig-zag of the Zemyth mark. The camera swings
// round to face them, then a dolly zoom (fov 28° → 1.2°, distance ×40) flattens the perspective until
// the stacks read as a bar chart; a trend line draws across them, and the coins flatten to pure lime —
// the exact silhouettes Chapter 7 turns into the logo.
import * as THREE from 'three';
import { W, H, BEAT, C } from '../config.js';
import { ease, seg, clamp, lerp, rng } from '../util.js';
import { B } from '../score.js';
import { mark as drawMark, CHANNEL, inkPath } from '../brand.js';
import { studioEnv } from '../zembit/stage.js';

/* ---------------------------------------------------------------- the chart */
// Mark units (the 30.14 × 30 tile) ↔ world ↔ screen. The final flat view puts the tile at the frame
// centre, 777 px tall, which is where Chapter 7 builds the logo.
export const CHART = { k: 0.909, px: 25.9, cx: 15.069, cy: 15, n: 12, coinT: 0.32, R: 1 };
CHART.spacing = 30.1383 / CHART.n;
const BASE_EDGE = [[0, 23.034], [10.787, 12.348], [24.746, 26.28], [30.06, 20.976]];
export const edgeY = (mx) => {
  for (let i = 0; i < BASE_EDGE.length - 1; i++) {
    const [x0, y0] = BASE_EDGE[i], [x1, y1] = BASE_EDGE[i + 1];
    if (mx <= x1) return y0 + ((y1 - y0) * (mx - x0)) / (x1 - x0);
  }
  return BASE_EDGE[BASE_EDGE.length - 1][1];
};
export const STACKS = [...Array(CHART.n).keys()].map((i) => {
  const mx = (i + 0.5) * CHART.spacing;
  const h = 30 - edgeY(mx);
  const n = Math.round(h / (CHART.coinT / CHART.k));
  return { i, mx, n, x: (mx - CHART.cx) * CHART.k, top: n * CHART.coinT };
});
export const markToScreen = (mx, my) => [W / 2 + (mx - CHART.cx) * CHART.px, H / 2 + (my - CHART.cy) * CHART.px];
const TARGET_Y = (30 - CHART.cy) * CHART.k;             // tile centre, world y
const VIEW_H = (H / CHART.px) * CHART.k;                // world units visible vertically in the flat view

/* ------------------------------------------------------------------ timing */
export const COINS = { lead: [40.2, 40.45], fill0: 40.55, fill1: 44.5, fall: 0.5, line0: 46.45, line1: 47.4, flat0: 46.7, flat1: 47.6, end: 48 };

let scene, camera, mesh, mirror, mirrorMat, mat, N, P, lime, black;
const FLIP = new THREE.Matrix4().makeScale(1, -1, 1);
const M = new THREE.Matrix4(), Q = new THREE.Quaternion(), E = new THREE.Euler(), S = new THREE.Vector3(), T3 = new THREE.Vector3();

function coinGeometry() {
  const prof = [[0.0001, 0.12], [0.74, 0.12], [0.785, 0.132], [0.83, 0.155], [0.9, 0.16], [0.95, 0.152], [0.985, 0.13], [1.0, 0.1], [1.0, -0.1], [0.985, -0.13], [0.95, -0.152], [0.9, -0.16], [0.83, -0.155], [0.785, -0.132], [0.74, -0.12], [0.0001, -0.12]];
  const geo = new THREE.LatheGeometry(prof.map(([r, y]) => new THREE.Vector2(r, y)), 72);
  const pos = geo.attributes.position, uv = geo.attributes.uv;
  for (let i = 0; i < pos.count; i++) uv.setXY(i, pos.getX(i) * 0.5 + 0.5, pos.getZ(i) * 0.5 + 0.5);
  geo.computeVertexNormals();
  return geo;
}

// Normal map of the struck mark: a blurred height field of the Z-peak, differentiated.
function markNormalMap() {
  const n = 512, c = document.createElement('canvas');
  c.width = c.height = n;
  const g = c.getContext('2d');
  g.fillStyle = '#000'; g.fillRect(0, 0, n, n);
  g.filter = 'blur(2.5px)';
  drawMark(g, n / 2, n / 2, n * 0.42, '#fff');
  g.filter = 'none';
  const src = g.getImageData(0, 0, n, n).data;
  const out = g.createImageData(n, n);
  const hgt = (x, y) => src[(Math.min(n - 1, Math.max(0, y)) * n + Math.min(n - 1, Math.max(0, x))) * 4] / 255;
  for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) {
    const dx = (hgt(x + 1, y) - hgt(x - 1, y)) * 3.2, dy = (hgt(x, y + 1) - hgt(x, y - 1)) * 3.2;
    const l = Math.hypot(dx, dy, 1);
    const o = (y * n + x) * 4;
    out.data[o] = ((-dx / l) * 0.5 + 0.5) * 255;
    out.data[o + 1] = ((dy / l) * 0.5 + 0.5) * 255;
    out.data[o + 2] = ((1 / l) * 0.5 + 0.5) * 255;
    out.data[o + 3] = 255;
  }
  g.putImageData(out, 0, 0);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.NoColorSpace;
  tex.anisotropy = 8;
  return tex;
}

function init(env) {
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0);
  scene.environment = studioEnv(env.renderer);
  scene.environmentIntensity = 0.55;
  const key = new THREE.DirectionalLight(0xffffff, 1.15); key.position.set(-6, 14, 12);
  const rim = new THREE.DirectionalLight(0xffffff, 1.0); rim.position.set(10, 6, -8);
  scene.add(key, rim);
  lime = new THREE.Color(C.lime);
  black = new THREE.Color(0);
  mat = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color('#C6D52B'), roughness: 0.24, metalness: 0,
    clearcoat: 1, clearcoatRoughness: 0.06, sheen: 0.25, sheenColor: new THREE.Color('#ffffff'),
    normalMap: markNormalMap(), normalScale: new THREE.Vector2(1.1, 1.1),
    emissive: new THREE.Color(C.lime), emissiveIntensity: 0,
  });
  // schedule every coin: stack, level, landing beat, drop drift, tumble
  const R = rng(4077);
  P = [];
  for (const s of STACKS) {
    const start = COINS.fill0 + Math.abs(s.i - 4) * 0.07;
    for (let k = 0; k < s.n; k++) {
      let land = start + Math.pow(k / s.n, 0.9) * (COINS.fill1 - start) + (R() - 0.5) * 0.06;
      if (k === 0 && s.i === 4) land = COINS.lead[0];
      if (k === 0 && s.i === 3) land = COINS.lead[1];
      P.push({
        s, k, land,
        x: s.x + (R() - 0.5) * 0.07, z: (R() - 0.5) * 0.07, yaw: R() * Math.PI * 2,
        dx: (R() - 0.5) * 3.2, dz: (R() - 0.5) * 3 - 1.2,
        ax: (R() - 0.5) * 2, az: (R() - 0.5) * 2, w: 8 + R() * 10, ph: R() * 6.28,
        lead: k === 0 && (s.i === 3 || s.i === 4),
      });
    }
  }
  // stacks settle bottom-up: a coin can't land before the one beneath it
  for (const s of STACKS) {
    const cs = P.filter((p) => p.s === s).sort((a, b) => a.k - b.k);
    for (let k = 1; k < cs.length; k++) cs[k].land = Math.max(cs[k].land, cs[k - 1].land + 0.012);
  }
  N = P.length;
  mesh = new THREE.InstancedMesh(coinGeometry(), mat, N);
  mesh.frustumCulled = false;
  scene.add(mesh);
  // a glossy black floor: the coins' reflections, dim and fading with the dolly zoom
  // unlit and faded with depth below the floor: reads as a soft reflection, never as more coins
  mirrorMat = new THREE.MeshBasicMaterial({ color: new THREE.Color('#C6D52B'), transparent: true, opacity: 0.14, depthWrite: false, side: THREE.DoubleSide });
  mirrorMat.onBeforeCompile = (sh) => {
    sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nvarying float vWy;')
      .replace('#include <project_vertex>', '#include <project_vertex>\nvWy = (modelMatrix * instanceMatrix * vec4(transformed, 1.0)).y;');
    sh.fragmentShader = sh.fragmentShader.replace('#include <common>', '#include <common>\nvarying float vWy;')
      .replace('#include <dithering_fragment>', '#include <dithering_fragment>\ngl_FragColor.a *= smoothstep(-5.0, 0.0, vWy);');
  };
  mirror = new THREE.InstancedMesh(mesh.geometry, mirrorMat, N);
  mirror.frustumCulled = false;
  scene.add(mirror);
  camera = new THREE.PerspectiveCamera(30, W / H, 0.5, 5000);
}

// Camera keys: [beat, view height (world, at the target), fov°, azimuth, elevation, target y].
// Opens low over the peak stack so the ground (and where coins land) is in shot from the first coin.
const KEYS = [
  [40.0, 15, 36, 0.62, 0.5, 2.5],
  [42.4, 25, 34, 0.34, 0.3, 6.5],
  [44.6, VIEW_H, 28, 0.0, 0.0, TARGET_Y],
  [46.3, VIEW_H, 1.2, 0.0, 0.0, TARGET_Y],
];
function camAt(gb) {
  const k = KEYS;
  let i = 0;
  while (i < k.length - 2 && gb > k[i + 1][0]) i++;
  const u = ease.inOutCubic(seg(gb, k[i][0], k[i + 1][0]));
  const L = (j) => lerp(k[i][j], k[i + 1][j], u);
  // fov interpolates in log-tan space so the dolly zoom's flattening feels even
  const t0 = Math.log(Math.tan((k[i][2] * Math.PI) / 360)), t1 = Math.log(Math.tan((k[i + 1][2] * Math.PI) / 360));
  const fov = (Math.atan(Math.exp(lerp(t0, t1, u))) * 360) / Math.PI;
  return { vh: L(1), fov, az: L(3), el: L(4), ty: L(5) };
}

function update(t) {
  const gb = t / BEAT;
  const cam = camAt(gb);
  const dist = cam.vh / (2 * Math.tan((cam.fov * Math.PI) / 360));
  camera.fov = cam.fov;
  camera.near = Math.max(0.5, dist - 60);
  camera.far = dist + 60;
  camera.position.set(Math.sin(cam.az) * Math.cos(cam.el) * dist, cam.ty + Math.sin(cam.el) * dist, Math.cos(cam.az) * Math.cos(cam.el) * dist);
  camera.lookAt(0, cam.ty, 0);
  camera.updateProjectionMatrix();
  camera.updateMatrixWorld(true);

  const fallS = COINS.fall;
  for (let i = 0; i < N; i++) {
    const p = P[i];
    const tl = B(p.land);
    const tf = p.lead ? 0.75 : fallS;
    const tau = t - (tl - tf);
    const restY = p.k * CHART.coinT + CHART.coinT / 2;
    if (tau < 0) { M.makeScale(0, 0, 0); mesh.setMatrixAt(i, M); mirror.setMatrixAt(i, M); continue; }
    let x = p.x, y = restY, z = p.z, rx = 0, rz = 0;
    if (tau < tf) {
      const u = tau / tf;                      // 0 → 1 over the fall
      const drop = p.lead ? 26 : 16;
      y = restY + drop * (1 - u * u);          // constant gravity, lands at u = 1
      x = p.x + p.dx * (1 - u);
      z = p.z + p.dz * (1 - u);
      const damp = 1 - u * u * u;
      rx = p.ax * damp * Math.sin(p.w * tau + p.ph);
      rz = p.az * damp * Math.cos(p.w * tau * 0.8 + p.ph);
    } else {
      // landing: a tiny rebound, then still
      const d = tau - tf;
      y = restY + 0.09 * Math.exp(-d / 0.04) * Math.abs(Math.sin(d * 55));
      rx = 0.04 * Math.exp(-d / 0.05) * Math.sin(d * 70 + p.ph);
    }
    E.set(rx, p.yaw + (tau < tf ? tau * 3 : tf * 3), rz, 'YXZ');
    Q.setFromEuler(E);
    S.set(CHART.R, 1, CHART.R);
    T3.set(x, y, z);
    M.compose(T3, Q, S);
    mesh.setMatrixAt(i, M);
    mirror.setMatrixAt(i, M.premultiply(FLIP));
  }
  mesh.instanceMatrix.needsUpdate = true;
  mirror.instanceMatrix.needsUpdate = true;
  mirrorMat.opacity = 0.14 * (1 - seg(gb, 44.2, 45.4));
  mirror.visible = mirrorMat.opacity > 0.001;

  // flatten to pure brand lime: the silhouettes Chapter 7 continues in 2D
  const f = ease.inOutCubic(seg(gb, COINS.flat0, COINS.flat1));
  mat.color.set('#C6D52B').lerp(black, f);
  mat.emissiveIntensity = f;
  mat.envMapIntensity = 1 - f;
  mat.clearcoat = 1 - f;
  mat.sheen = 0.25 * (1 - f);
  mat.specularIntensity = 1 - f;
  mat.normalScale.setScalar(1.1 * (1 - f));
  return { scene, camera, bloom: { strength: 0.22 * (1 - f), radius: 0.35, threshold: 1.25 }, tonemap: 0 };
}

/* ------------------------------------------------------------- trend line */
const LINE = inkPath(CHANNEL.map(([mx, my]) => markToScreen(mx, my)), 2);
export { LINE };
function drawLine(ctx, t) {
  const gb = t / BEAT;
  const p = ease.inOutSine(seg(gb, COINS.line0, COINS.line1));
  if (p <= 0) return;
  // straight segments (the mark's zig-zag is straight), constant pen speed
  const L = LINE.total * p;
  ctx.save();
  ctx.strokeStyle = C.lime;
  ctx.lineWidth = 7;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.beginPath();
  let end = LINE.pts[0];
  ctx.moveTo(end[0], end[1]);
  for (let i = 1; i < LINE.pts.length; i++) {
    if (LINE.len[i] >= L) {
      const a = LINE.pts[i - 1], b = LINE.pts[i];
      const u = (L - LINE.len[i - 1]) / Math.max(1e-6, LINE.len[i] - LINE.len[i - 1]);
      end = [lerp(a[0], b[0], u), lerp(a[1], b[1], u)];
      ctx.lineTo(end[0], end[1]);
      break;
    }
    end = LINE.pts[i];
    ctx.lineTo(end[0], end[1]);
  }
  ctx.stroke();
  // the leading dot, as on the brand's earnings chart
  const dp = 1 - seg(gb, COINS.line1, COINS.line1 + 0.3);
  ctx.fillStyle = C.lime;
  ctx.shadowColor = 'rgba(238,254,94,0.8)';
  ctx.shadowBlur = 24 * dp;
  ctx.beginPath(); ctx.arc(end[0], end[1], 11 * (0.6 + 0.4 * dp), 0, Math.PI * 2); ctx.fill();
  ctx.shadowBlur = 0;
  ctx.fillStyle = C.black;
  ctx.beginPath(); ctx.arc(end[0], end[1], 4.5 * dp, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}

// Each coin's resting x (world) per stack, so Chapter 7's 2D columns start on the exact silhouettes.
export const coinRest = () => P;

export default {
  id: 'coins',
  init,
  three: { start: B(39.5), end: B(COINS.end), update },
  layers: [{ start: B(COINS.line0), end: B(COINS.end), draw: drawLine }],
};
