// Bars 1–4 · LIGHT TABLE + LOUPE.
// A dark light table of 4,032 ad frames switches on in a wave from one frame outward; the camera
// rises from top-down to a low grazing angle with a focus pull. Every ad is public — but no frame
// carries evidence (hollow signal ticks). A loupe hops across frames asking which ones work, then
// becomes a lens portal into the product (bar 5).
import * as THREE from 'three';
import { W, H, BEAT, C, FONTS } from '../config.js';
import { ease, seg, clamp, lerp, rng, settle } from '../util.js';
import { font, rgba, vgrad } from '../draw2d.js';
import { ADS, WALL, buildAtlas } from '../assets.js';
import { B, LOUPE_HOPS, TABLE } from '../score.js';

const COLS = 72, ROWS = 56;
const FW = 0.8, FH = 1.0, GX = 0.14, GZ = 0.14;
const PX = FW + GX, PZ = FH + GZ;
const ROW0 = 8;                 // rows in front of the centre frame (toward the camera)
const N = COLS * ROWS;
const HERO = 'brewbird-hero';   // the first frame to light

const VERT = /* glsl */ `
attribute vec3 aOffset;
attribute vec4 aTile;
attribute float aLit;
attribute float aPlat;
uniform vec2 uSize;
uniform float uPad, uFocus, uAperture, uFogStart, uFogRange;
varying vec2 vLocal, vUv;
varying float vBlur, vLit, vFog, vPlat;
void main() {
  vec2 ext = uSize * 0.5 + uPad;
  vec2 p = position.xy * 2.0 * ext;
  vLocal = p;
  vUv = mix(aTile.xy, aTile.zw, p / uSize + 0.5);
  vec3 wp = aOffset + vec3(p.x, 0.0, -p.y);
  vec4 mv = viewMatrix * vec4(wp, 1.0);
  float depth = -mv.z;
  vBlur = uAperture * abs(depth - uFocus) / uFocus;
  vFog = exp(-max(0.0, depth - uFogStart) / uFogRange);
  vLit = aLit;
  vPlat = aPlat;
  gl_Position = projectionMatrix * mv;
}`;

const FRAG = /* glsl */ `
uniform sampler2D tAtlas;
uniform vec2 uSize;
uniform float uBright, uHalo, uSlots;
uniform vec3 uHaloColor, uLine, uMeta, uTik;
varying vec2 vLocal, vUv;
varying float vBlur, vLit, vFog, vPlat;
float sdBox(vec2 p, vec2 b, float r) { vec2 q = abs(p) - b + r; return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r; }
void main() {
  vec2 hs = uSize * 0.5;
  float d = sdBox(vLocal, hs, 0.045);
  float aa = fwidth(d);
  float soft = max(aa * 0.75, vBlur);
  float inside = 1.0 - smoothstep(-soft, soft, d);
  float bias = clamp(log2(1.0 + vBlur / (uSize.x / 368.0) * 0.6), 0.0, 7.0);
  vec3 img = texture2D(tAtlas, vUv, bias).rgb;
  float lit = vLit;
  vec3 col = img * uBright * lit;
  // scrim along the bottom edge so the signal ticks read over any creative
  col *= mix(0.45, 1.0, smoothstep(-hs.y, -hs.y + 0.24, vLocal.y));
  // platform dot (badge), top-left
  vec2 dp = vLocal - vec2(-hs.x + 0.075, hs.y - 0.075);
  float dot_ = 1.0 - smoothstep(0.018 - aa, 0.018 + aa, length(dp));
  col = mix(col, mix(uMeta, uTik, vPlat) * lit, dot_ * 0.95);
  // five hollow signal ticks, bottom-right: public ad, no evidence attached
  float sw = 0.058, sh = 0.012, gap = 0.012;
  for (int i = 0; i < 5; i++) {
    vec2 c = vec2(hs.x - 0.05 - sw * 0.5 - float(4 - i) * (sw + gap), -hs.y + 0.05 + sh * 0.5);
    float s = sdBox(vLocal - c, vec2(sw, sh) * 0.5, sh * 0.5);
    float ring = 1.0 - smoothstep(0.0, max(aa, 0.003) * 1.2, abs(s) - 0.0025);
    col = mix(col, vec3(0.8, 0.85, 0.85) * lit, ring * uSlots * 0.55);
  }
  // hairline frame edge
  float edge = 1.0 - smoothstep(0.0, aa * 1.5, abs(d + 0.003));
  col = mix(col, uLine * (0.5 + 0.5 * lit), edge * 0.7 * step(vBlur, 0.06));
  // backlight leaking out around the frame
  float halo = exp(-max(d, 0.0) / 0.07) * (1.0 - inside) * uHalo * lit;
  vec3 outc = col * inside + uHaloColor * halo;
  gl_FragColor = vec4(outc * vFog, inside * vFog);
}`;

const TABLE_FRAG = /* glsl */ `
uniform vec3 uWell, uGlow;
uniform vec2 uCentre;
uniform float uGlowAmt, uPower;
varying vec3 vW;
void main() {
  float g = exp(-dot(vW.xz - uCentre, vW.xz - uCentre) / 60.0);
  // the table powers on with the ignition wave, spreading out from the first frame
  float on = smoothstep(uPower * 40.0 - 6.0, uPower * 40.0, length(vW.xz));
  gl_FragColor = vec4((uWell + uGlow * g * uGlowAmt) * mix(1.0, 0.06, on), 1.0);
}`;
const TABLE_VERT = /* glsl */ `
varying vec3 vW;
void main() { vec4 w = modelMatrix * vec4(position, 1.0); vW = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }`;

let scene, camera, mesh, litAttr, ignite, flickerKind, gridX, gridZ, atlas;
const WELL_LIN = new THREE.Color(C.well);
const lin = (hex) => new THREE.Color(hex); // three converts sRGB hex → linear working space

// Fluorescent ignition: stutter, catch, settle. dt in seconds since this frame's cue.
function flicker(dt, kind) {
  if (dt < 0) return 0;
  if (kind > 0.55) return 1 - Math.exp(-dt / 0.03);        // clean catch
  if (dt < 0.035) return 0.85;
  if (dt < 0.07) return 0.08;
  if (dt < 0.1) return 1.05;
  if (dt < 0.13) return 0.3;
  return 1 - 0.7 * Math.exp(-(dt - 0.13) / 0.07);
}

// Camera choreography, global beats → pose.
export function camAt(gb, cam = camera) {
  const rise = seg(gb, 1.4, 7.6, ease.inOutCubic);
  const drift = seg(gb, 7.6, 16, ease.inOutSine);
  const y = lerp(2.55, 6.2, rise) - 0.25 * seg(gb, 0, 1.4, ease.outCubic) - 0.5 * drift;
  const z = lerp(0.0, 10.2, rise) - 1.2 * drift;
  const x = lerp(0, -0.9, rise) + 1.6 * drift;
  const pitch = lerp(-Math.PI / 2, -0.43, ease.inOutQuart(seg(gb, 1.4, 7.4))) + 0.05 * drift;
  const yaw = lerp(0, 0.1, rise) - 0.16 * drift;
  cam.position.set(x, y, z);
  cam.rotation.set(pitch, yaw, 0, 'YXZ');
  cam.updateMatrixWorld(true);
  return cam;
}

const tmp = new THREE.Vector3();
const projCam = new THREE.PerspectiveCamera(35, W / H, 0.05, 200);
// Screen position (px) and depth of a grid frame's centre at global beat gb.
export function frameOnScreen(col, row, gb) {
  camAt(gb, projCam);
  tmp.set((col - COLS / 2) * PX, 0, -(row - ROW0) * PZ);
  const depth = tmp.clone().applyMatrix4(projCam.matrixWorldInverse).z * -1;
  tmp.project(projCam);
  return { x: (tmp.x * 0.5 + 0.5) * W, y: (1 - (tmp.y * 0.5 + 0.5)) * H, depth };
}

// Loupe: enters, hops frame to frame on the beat, glides to centre, then opens into the product.
export function lensAt(gb) {
  const hops = LOUPE_HOPS;
  if (gb < hops[0].at - 0.9 || gb >= 16) return null;
  let x, y, r = 170, mag = 2.25;
  const tgt = (h) => frameOnScreen(h.col, h.row, gb);
  // which hop are we travelling toward?
  let i = 0;
  while (i + 1 < hops.length && gb >= hops[i + 1].at - 0.02) i++;
  const cur = tgt(hops[i]);
  if (i === 0) {
    const p = seg(gb, hops[0].at - 0.9, hops[0].at, ease.outQuart);
    x = lerp(W + 260, cur.x, p); y = lerp(H + 240, cur.y, p);
  } else {
    const prev = tgt(hops[i - 1]);
    const dt = (gb - hops[i].at + 0.02) * BEAT;
    const k = settle(dt, 320, 22);
    const back = Math.sin(clamp(dt / 0.06) * Math.PI) * 0.06 * (1 - clamp(dt / 0.06));
    x = lerp(prev.x, cur.x, k - back); y = lerp(prev.y, cur.y, k - back);
  }
  // glide to centre and open
  const g = seg(gb, TABLE.lensCentre, TABLE.portal, ease.inOutCubic);
  x = lerp(x, W / 2, g); y = lerp(y, H / 2 + 10, g);
  r = lerp(r, 230, g);
  mag = lerp(mag, 2.8, g);
  const open = seg(gb, TABLE.portal, 16, ease.inExpo);
  r = lerp(r, 1180, open);
  mag = lerp(mag, 1.0, seg(gb, TABLE.portal, TABLE.portal + 0.35, ease.outCubic));
  const on = seg(gb, hops[0].at - 0.9, hops[0].at - 0.5);
  return { x, y, r, mag, on, focusDepth: cur.depth };
}

function init() {
  scene = new THREE.Scene();
  scene.background = lin(C.well);
  camera = new THREE.PerspectiveCamera(35, W / H, 0.05, 200);

  const pool = [...ADS.map((a) => a.id), ...WALL];
  atlas = buildAtlas(pool);
  const tex = new THREE.CanvasTexture(atlas.canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.generateMipmaps = true;
  tex.minFilter = THREE.LinearMipmapLinearFilter;
  tex.anisotropy = 8;

  const R = rng(4032);
  const geo = new THREE.InstancedBufferGeometry().copy(new THREE.PlaneGeometry(1, 1));
  geo.instanceCount = N;
  const off = new Float32Array(N * 3), tile = new Float32Array(N * 4), lit = new Float32Array(N), plat = new Float32Array(N);
  ignite = new Float32Array(N); flickerKind = new Float32Array(N); gridX = new Int16Array(N); gridZ = new Int16Array(N);
  const heroIdx = pool.indexOf(HERO);
  for (let i = 0; i < N; i++) {
    const col = i % COLS, row = Math.floor(i / COLS);
    gridX[i] = col; gridZ[i] = row;
    off.set([(col - COLS / 2) * PX, 0.002, -(row - ROW0) * PZ], i * 3);
    const dc = col - COLS / 2, dr = row - ROW0;
    const isHero = dc === 0 && dr === 0;
    let pick = isHero ? heroIdx : Math.floor(R() * pool.length);
    if (!isHero && pick === heroIdx) pick = (pick + 7) % pool.length;
    tile.set(atlas.rects[pick], i * 4);
    plat[i] = pool[pick].startsWith('wall-') ? (R() < 0.3 ? 1 : 0) : ADS[pick].platform === 'tiktok' ? 1 : 0;
    const d = Math.hypot(dc, dr * 1.1);
    // one frame at the cold open, then a wave that accelerates outward
    ignite[i] = isHero ? TABLE.ignite0 : TABLE.wave0 + Math.pow(Math.max(0, d - 0.6), 0.78) * 0.26 + R() * 0.12;
    flickerKind[i] = isHero ? 0 : R();
  }
  geo.setAttribute('aOffset', new THREE.InstancedBufferAttribute(off, 3));
  geo.setAttribute('aTile', new THREE.InstancedBufferAttribute(tile, 4));
  litAttr = new THREE.InstancedBufferAttribute(lit, 1);
  litAttr.setUsage(THREE.DynamicDrawUsage);
  geo.setAttribute('aLit', litAttr);
  geo.setAttribute('aPlat', new THREE.InstancedBufferAttribute(plat, 1));

  const u = (v) => ({ value: v });
  const mat = new THREE.ShaderMaterial({
    vertexShader: VERT,
    fragmentShader: FRAG,
    uniforms: {
      tAtlas: u(tex), uSize: u(new THREE.Vector2(FW, FH)), uPad: u(0.16), uFocus: u(3), uAperture: u(0),
      uFogStart: u(16), uFogRange: u(13), uBright: u(0.8), uHalo: u(0.12), uSlots: u(1),
      uHaloColor: u(lin('#6f9a9c')), uLine: u(lin(C.wellLine)), uMeta: u(lin(C.meta)), uTik: u(lin(C.tiktok)),
    },
    transparent: true,
    depthWrite: false,
    blending: THREE.CustomBlending,
    blendSrc: THREE.OneFactor,
    blendDst: THREE.OneMinusSrcAlphaFactor,
  });
  mesh = new THREE.Mesh(geo, mat);
  mesh.frustumCulled = false;
  scene.add(mesh);

  const table = new THREE.Mesh(
    new THREE.PlaneGeometry(400, 400),
    new THREE.ShaderMaterial({
      vertexShader: TABLE_VERT,
      fragmentShader: TABLE_FRAG,
      uniforms: { uWell: u(lin(C.well)), uGlow: u(lin('#12292a')), uCentre: u(new THREE.Vector2(0, -6)), uGlowAmt: u(0), uPower: u(0) },
      depthWrite: false,
    }),
  );
  table.rotation.x = -Math.PI / 2;
  table.renderOrder = -1;
  scene.add(table);
  scene.userData.table = table;
}

function update(t) {
  const gb = t / BEAT;
  camAt(gb);
  const lit = litAttr.array;
  const lens = lensAt(gb);
  for (let i = 0; i < N; i++) {
    const f = flicker(t - ignite[i] * BEAT, flickerKind[i]);
    lit[i] = 0.008 + 0.992 * f;   // unlit film: just a ghost (linear light; sRGB lifts it to ~7 %)
  }
  litAttr.needsUpdate = true;
  const U = mesh.material.uniforms;
  // focus pull: on the hero frame while top-down, then out to mid-table, then onto the loupe's frame
  const tilt = seg(gb, 2.0, 7.2, ease.inOutCubic);
  let focus = lerp(2.4, 13.5, tilt);
  if (lens) focus = lerp(focus, lens.focusDepth, lens.on);
  U.uFocus.value = focus;
  U.uAperture.value = 0.16 * seg(gb, 1.6, 4.5);
  const TU = scene.userData.table.material.uniforms;
  TU.uGlowAmt.value = 0.35 * seg(gb, 1.0, 4.0);
  TU.uPower.value = 0.02 + seg(gb, TABLE.ignite0, 4.2, ease.inCubic);
  scene.background.copy(WELL_LIN).multiplyScalar(lerp(0.06, 1, seg(gb, 2.5, 4.5)));
  return { scene, camera, bloom: { strength: 0.55, radius: 0.55, threshold: 0.62 }, exposure: 1, tonemap: 2 };
}

/* ---------------------------------------------------------------- 2D layers */

function headline(ctx, lines, x, y, size, t0, t1, gb, color) {
  font(ctx, { f: FONTS.display, w: 800, s: size, ls: -0.045 });
  ctx.fillStyle = color;
  ctx.textBaseline = 'alphabetic';
  lines.forEach(([text, at], li) => {
    const inn = seg(gb, at, at + 0.55, ease.outExpo);
    const out = seg(gb, t1 + li * 0.08, t1 + 0.45 + li * 0.08, ease.inCubic);
    if (inn <= 0 || out >= 1) return;
    const ly = y + li * size * 0.98;
    ctx.save();
    ctx.beginPath();
    ctx.rect(x - 20, ly - size * 0.98, W, size * 1.24);
    ctx.clip();
    ctx.fillText(text, x, ly + (1 - inn) * size * 1.05 - out * size * 1.05);
    ctx.restore();
  });
}

function drawType(ctx, t) {
  const gb = t / BEAT;
  // darken the far table behind the type block
  const scrim = seg(gb, 3.0, 4.5) * (1 - seg(gb, 14.2, 15.2));
  if (scrim > 0) {
    ctx.fillStyle = vgrad(ctx, 0, H * 0.62, [[0, rgba(C.well, 0.9 * scrim)], [0.55, rgba(C.well, 0.6 * scrim)], [1, rgba(C.well, 0)]]);
    ctx.fillRect(0, 0, W, H * 0.62);
  }
  const x = 150;
  // eyebrow
  const eb = seg(gb, 3.7, 4.2, ease.outCubic) * (1 - seg(gb, 7.2, 7.6));
  if (eb > 0) {
    ctx.globalAlpha = eb;
    font(ctx, { f: FONTS.mono, w: 500, s: 15 });
    ctx.letterSpacing = '2.4px';
    ctx.fillStyle = C.sulphur;
    ctx.fillText('META + TIKTOK AD LIBRARIES', x + 4, 196 - (1 - eb) * 10);
    ctx.globalAlpha = 1;
  }
  headline(ctx, [['Every ad', 4.0], ['is public.', 4.5]], x, 356, 168, 4.0, 7.3, gb, C.ground);
  const eb2 = seg(gb, 8.2, 8.7, ease.outCubic) * (1 - seg(gb, 13.8, 14.2));
  if (eb2 > 0) {
    ctx.globalAlpha = eb2;
    font(ctx, { f: FONTS.mono, w: 500, s: 15 });
    ctx.letterSpacing = '2.4px';
    ctx.fillStyle = C.sulphur;
    ctx.fillText('THE HARD PART', x + 4, 196 - (1 - eb2) * 10);
    ctx.globalAlpha = 1;
  }
  headline(ctx, [['Which ones', 8.5], ['actually work?', 9.0]], x, 356, 168, 8.5, 13.9, gb, C.ground);
}

// Tags that pop beside the loupe as it lands: each signal, unanswered.
function drawLoupeTags(ctx, t) {
  const gb = t / BEAT;
  const lens = lensAt(gb);
  if (!lens) return;
  LOUPE_HOPS.forEach((h, i) => {
    const on = seg(gb, h.at + 0.12, h.at + 0.4, ease.outBack) * (1 - seg(gb, h.at + 0.9, h.at + 1.05));
    if (on <= 0 || gb > TABLE.lensCentre + 0.2) return;
    ctx.save();
    ctx.translate(lens.x, lens.y - lens.r - 34);
    ctx.scale(0.85 + 0.15 * on, 0.85 + 0.15 * on);
    ctx.globalAlpha = clamp(on);
    font(ctx, { f: FONTS.mono, w: 500, s: 15 });
    ctx.letterSpacing = '1.8px';
    const label = `${h.label}`, q = 'NOT SHOWN';
    const w1 = ctx.measureText(label).width, w2 = ctx.measureText(q).width;
    const bw = 22 + 14 + w1 + 16 + w2 + 18, bh = 36;
    ctx.translate(-bw / 2, 0);
    ctx.fillStyle = rgba(C.wellLift, 0.86);
    ctx.strokeStyle = 'rgba(255,255,255,0.16)';
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.roundRect(0, -bh / 2, bw, bh, bh / 2); ctx.fill(); ctx.stroke();
    // hollow tick
    ctx.strokeStyle = 'rgba(255,255,255,0.55)';
    ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.roundRect(14, -3, 20, 6, 3); ctx.stroke();
    ctx.fillStyle = C.wellText;
    ctx.textBaseline = 'middle';
    ctx.fillText(label, 44, 1);
    ctx.fillStyle = C.wellDim;
    ctx.fillText(q, 44 + w1 + 16, 1);
    ctx.restore();
  });
}

function fx(t) {
  const gb = t / BEAT;
  const lens = lensAt(gb);
  return { loupe: lens ? { x: lens.x, y: lens.y, r: lens.r, mag: lens.mag, on: lens.on } : null, vignette: 0.42 };
}

export default {
  id: 'table',
  init,
  three: { start: 0, end: B(16), update },
  layers: [
    { start: 0, end: B(16), draw: drawType },
    { start: B(7.5), end: B(15.2), draw: drawLoupeTags },
  ],
  fx,
};
