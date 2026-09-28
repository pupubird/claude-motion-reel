// Bars 7–8 · SIGNAL.
// The ranked grid, picked up 1:1 from the 2D hand-off, now on a 3D light table. Each frame's
// evidence arrives (stat chips pop, signal bars wipe in, staggered 40 ms per card like the product)
// and a sulphur bloom rises behind its bottom edge in proportion to its strength — strength you can
// see, not a score. The camera tilts the table, then flies to the strongest frame and the
// inspection corners lock on (hand-off to the 2D detail view, bar 9).
import * as THREE from 'three';
import { W, H, BEAT, C, FONTS } from '../config.js';
import { ease, seg, clamp } from '../util.js';
import { font, rgba, vgrad } from '../draw2d.js';
import { ADS, strength } from '../assets.js';
import { drawAdCard, cardDims, cardMarks, corners } from '../ui.js';
import { B, GRID_T } from '../score.js';
import { gridSlots } from '../layout.js';

const FOV = 30;
const D = H / 2 / Math.tan((FOV / 2) * (Math.PI / 180));   // camera distance where 1 world unit = 1 px
const HERO = gridSlots[0];
// Final framing = the detail view's creative rect (scenes/detail.js): hero image at 640 px wide.
export const HERO_SCALE = 640 / HERO.w;
export const HERO_RECT = { x: 180, y: 140, w: 640 };
const FINAL = {
  tx: HERO.x - (HERO_RECT.x - W / 2) / HERO_SCALE,
  ty: HERO.y - (HERO_RECT.y - H / 2) / HERO_SCALE,
  dist: D / HERO_SCALE,
};

const CARD_VERT = /* glsl */ `
uniform vec2 uSize;
uniform float uPad, uFocus, uAperture;
varying vec2 vLocal;
varying float vBlur;
void main() {
  vec2 ext = uSize + 2.0 * uPad;
  vLocal = vec2(position.x + 0.5, 0.5 - position.y) * ext - uPad;   // card px, y down, from top-left
  vec4 mv = modelViewMatrix * vec4(position.xy * ext, 0.0, 1.0);
  float depth = -mv.z;
  vBlur = uAperture * abs(depth - uFocus) / uFocus;
  gl_Position = projectionMatrix * mv;
}`;

const CARD_FRAG = /* glsl */ `
uniform sampler2D tBase, tFull;
uniform vec2 uSize;
uniform float uRad, uChips, uBars, uDim, uTexScale;
uniform vec4 uBarRect, uChipRect;
uniform vec3 uLine;
varying vec2 vLocal;
varying float vBlur;
float sdBox(vec2 p, vec2 b, float r) { vec2 q = abs(p) - b + r; return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r; }
float inRect(vec2 p, vec4 r) { return step(r.x, p.x) * step(p.x, r.z) * step(r.y, p.y) * step(p.y, r.w); }
void main() {
  float d = sdBox(vLocal - uSize * 0.5, uSize * 0.5, uRad);
  float aa = fwidth(d);
  float soft = max(aa * 0.75, vBlur);
  float inside = 1.0 - smoothstep(-soft, soft, d);
  if (inside <= 0.0) discard;
  vec2 uv = clamp(vLocal / uSize, 0.0, 1.0);
  uv.y = 1.0 - uv.y;
  float bias = clamp(log2(1.0 + vBlur * uTexScale * 0.7), 0.0, 6.0);
  vec3 base = texture2D(tBase, uv, bias).rgb;
  vec3 full = texture2D(tFull, uv, bias).rgb;
  float chipM = uChips * inRect(vLocal, uChipRect);
  float barM = inRect(vLocal, uBarRect) * step(vLocal.x, mix(uBarRect.x, uBarRect.z, uBars));
  vec3 col = mix(base, full, max(chipM, barM));
  float edge = 1.0 - smoothstep(0.0, aa * 1.5, abs(d + 0.5));
  col = mix(col, uLine, edge * step(vBlur, 2.0));
  col *= uDim;
  gl_FragColor = vec4(col * inside, inside);
}`;

const GLOW_VERT = /* glsl */ `
uniform vec2 uSize;
uniform float uExt;
varying vec2 vLocal;
void main() {
  vLocal = position.xy * (uSize + 2.0 * uExt);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(vLocal, 0.0, 1.0);
}`;
const GLOW_FRAG = /* glsl */ `
uniform vec3 uColor;
uniform vec2 uSize;
uniform float uAmt;
varying vec2 vLocal;
float sdBox(vec2 p, vec2 b, float r) { vec2 q = abs(p) - b + r; return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r; }
void main() {
  // backlight leaking around the frame, pooling under its bottom edge
  float d = max(sdBox(vLocal, uSize * 0.5, 12.0), 0.0);
  float bottom = smoothstep(uSize.y * 0.5, -uSize.y * 0.6, vLocal.y);
  float g = exp(-d / mix(9.0, 30.0, bottom)) * (0.08 + 0.92 * bottom * bottom * bottom);
  gl_FragColor = vec4(uColor * g * uAmt, 1.0);   // additive blending scales by alpha
}`;

const TABLE_FRAG = /* glsl */ `
uniform vec3 uWell;
varying vec2 vW;
void main() {
  vec2 g = abs(fract(vW / 72.0 - 0.5) - 0.5) * 72.0;
  float line = 1.0 - smoothstep(0.0, 1.2 * fwidth(vW.x) + 0.6, min(g.x, g.y));
  gl_FragColor = vec4(uWell + vec3(0.012, 0.022, 0.022) * line, 1.0);
}`;
const TABLE_VERT = /* glsl */ `
varying vec2 vW;
void main() { vec4 w = modelMatrix * vec4(position, 1.0); vW = w.xy; gl_Position = projectionMatrix * viewMatrix * w; }`;

let scene, camera, cards;

function cardTexture(ad, scale, full) {
  const w = HERO.w * scale;
  const { h } = cardDims(ad, w);
  const cv = document.createElement('canvas');
  cv.width = Math.round(w);
  cv.height = Math.round(h);
  drawAdCard(cv.getContext('2d'), ad, 0, 0, w, { flat: true, chips: full ? 1 : 0, signals: full ? 1 : 0 });
  const tex = new THREE.CanvasTexture(cv);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.generateMipmaps = true;
  tex.minFilter = THREE.LinearMipmapLinearFilter;
  tex.anisotropy = 8;
  return tex;
}

function init(env) {
  scene = new THREE.Scene();
  scene.background = new THREE.Color(C.well);
  camera = new THREE.PerspectiveCamera(FOV, W / H, 5, 20000);
  const u = (v) => ({ value: v });

  const table = new THREE.Mesh(new THREE.PlaneGeometry(9000, 9000), new THREE.ShaderMaterial({
    vertexShader: TABLE_VERT, fragmentShader: TABLE_FRAG, uniforms: { uWell: u(new THREE.Color(C.well)) }, depthWrite: false,
  }));
  table.position.set(960, -540, -6);
  table.renderOrder = -2;
  scene.add(table);

  cards = ADS.map((ad, rank) => {
    const slot = gridSlots[rank];
    const scale = rank === 0 ? 3 : 2.2;       // the hero gets extra texels for the push-in
    const base = cardTexture(ad, scale, false), full = cardTexture(ad, scale, true);
    const { s } = cardDims(ad, slot.w);
    const marks = cardMarks(ad, slot.w);
    const pad = 40;
    const mat = new THREE.ShaderMaterial({
      vertexShader: CARD_VERT,
      fragmentShader: CARD_FRAG,
      uniforms: {
        tBase: u(base), tFull: u(full), uSize: u(new THREE.Vector2(slot.w, slot.h)), uPad: u(pad), uRad: u(10 * s),
        uFocus: u(D), uAperture: u(0), uChips: u(0), uBars: u(0), uDim: u(1), uTexScale: u(scale),
        uBarRect: u(new THREE.Vector4(...marks.bars)), uChipRect: u(new THREE.Vector4(...marks.chips)),
        uLine: u(new THREE.Color(C.wellLine)),
      },
      transparent: true,
      depthWrite: false,
      blending: THREE.CustomBlending,
      blendSrc: THREE.OneFactor,
      blendDst: THREE.OneMinusSrcAlphaFactor,
    });
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), mat);
    mesh.position.set(slot.x + slot.w / 2, -(slot.y + slot.h / 2), 0);
    mesh.renderOrder = 2;
    scene.add(mesh);
    const glow = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.ShaderMaterial({
      vertexShader: GLOW_VERT, fragmentShader: GLOW_FRAG,
      uniforms: { uColor: u(new THREE.Color(C.sulphur)), uAmt: u(0), uSize: u(new THREE.Vector2(slot.w, slot.h)), uExt: u(90) },
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    }));
    glow.position.set(slot.x + slot.w / 2, -(slot.y + slot.h / 2), -3);
    glow.renderOrder = 1;
    scene.add(glow);
    return { ad, slot, mesh, glow, strength: strength(ad) };
  });
}

/* ------------------------------------------------------------ camera path */
// Keyframes in beats: [gb, tx, ty (px), dist, yaw, pitch, roll]. Catmull-Rom through them,
// with zero velocity at both ends (it starts and lands at rest for the hand-offs).
const KEYS = [
  [24.0, 960, 540, D, 0, 0, 0],
  [24.35, 960, 545, D * 0.985, 0, 0.012, 0],
  [26.6, 930, 700, 1560, -0.2, 0.66, 0.035],
  [28.4, 600, 470, 1180, -0.09, 0.4, 0.012],
  [30.0, FINAL.tx + 14, FINAL.ty + 10, FINAL.dist * 1.07, 0.018, 0.05, 0],
  [31.95, FINAL.tx, FINAL.ty, FINAL.dist, 0, 0, 0],
];
function spline(gb, j) {
  const k = KEYS;
  if (gb <= k[0][0]) return k[0][j];
  if (gb >= k[k.length - 1][0]) return k[k.length - 1][j];
  let i = 0;
  while (gb > k[i + 1][0]) i++;
  const [t0, t1] = [k[i][0], k[i + 1][0]];
  const p0 = k[i][j], p1 = k[i + 1][j];
  const tan = (n) => {
    if (n <= 0 || n >= k.length - 1) return 0;
    return (k[n + 1][j] - k[n - 1][j]) / (k[n + 1][0] - k[n - 1][0]);
  };
  const m0 = tan(i) * (t1 - t0), m1 = tan(i + 1) * (t1 - t0);
  const u = (gb - t0) / (t1 - t0), u2 = u * u, u3 = u2 * u;
  return (2 * u3 - 3 * u2 + 1) * p0 + (u3 - 2 * u2 + u) * m0 + (-2 * u3 + 3 * u2) * p1 + (u3 - u2) * m1;
}

const T = new THREE.Vector3();
export function poseAt(gb, cam) {
  const tx = spline(gb, 1), ty = spline(gb, 2), dist = spline(gb, 3), yaw = spline(gb, 4), pitch = spline(gb, 5), roll = spline(gb, 6);
  T.set(tx, -ty, 0);
  cam.position.set(tx + dist * Math.sin(yaw) * Math.cos(pitch), -ty - dist * Math.sin(pitch), dist * Math.cos(yaw) * Math.cos(pitch));
  cam.up.set(Math.sin(roll), Math.cos(roll), 0);
  cam.lookAt(T);
  cam.updateMatrixWorld(true);
  return dist;
}

function update(t) {
  const gb = t / BEAT;
  const dist = poseAt(gb, camera);
  const lock = seg(gb, GRID_T.lock - 0.4, GRID_T.lock + 0.6, ease.inOutCubic);
  cards.forEach((c, i) => {
    const U = c.mesh.material.uniforms;
    // product spec: 40 ms per item, capped at 12
    const d0 = GRID_T.marks + (Math.min(i, 12) * 0.04) / BEAT;
    U.uChips.value = seg(gb, d0, d0 + 0.5, ease.brand);
    U.uBars.value = seg(gb, d0 + 0.15, d0 + 0.9, ease.outCubic);
    U.uFocus.value = dist;
    U.uAperture.value = 26 * seg(gb, 24.5, 25.6) * (1 - seg(gb, 30.4, 31.6));
    U.uDim.value = i === 0 ? 1 : 1 - 0.62 * lock;
    const lit = seg(gb, d0 + 0.2, d0 + 1.4, ease.outCubic);
    c.glow.material.uniforms.uAmt.value = lit * (0.01 + 0.46 * c.strength ** 4) * (i === 0 ? 1 + 0.5 * lock : 1 - 0.8 * lock);
  });
  return { scene, camera, bloom: { strength: 0.38, radius: 0.6, threshold: 0.75 }, exposure: 1, tonemap: 0 };
}

/* ---------------------------------------------------------------- 2D layers */
const proj = new THREE.PerspectiveCamera(FOV, W / H, 5, 20000);
const V = new THREE.Vector3();
function heroImageRect(gb) {
  poseAt(gb, proj);
  const { imgH } = cardDims(HERO_ADS(), HERO.w);
  const pts = [[HERO.x, HERO.y], [HERO.x + HERO.w, HERO.y], [HERO.x, HERO.y + imgH], [HERO.x + HERO.w, HERO.y + imgH]].map(([x, y]) => {
    V.set(x, -y, 0).project(proj);
    return [(V.x * 0.5 + 0.5) * W, (1 - (V.y * 0.5 + 0.5)) * H];
  });
  const xs = pts.map((p) => p[0]), ys = pts.map((p) => p[1]);
  return { x: Math.min(...xs), y: Math.min(...ys), w: Math.max(...xs) - Math.min(...xs), h: Math.max(...ys) - Math.min(...ys) };
}
const HERO_ADS = () => ADS[0];

function drawOverlay(ctx, t) {
  const gb = t / BEAT;
  // headline over the tilted table
  const on = seg(gb, 25.4, 25.9, ease.outCubic) * (1 - seg(gb, 28.2, 28.6));
  if (on > 0) {
    ctx.fillStyle = vgrad(ctx, 0, 460, [[0, rgba(C.well, 0.85 * on)], [1, rgba(C.well, 0)]]);
    ctx.fillRect(0, 0, W, 460);
    font(ctx, { f: FONTS.mono, w: 500, s: 15 });
    ctx.letterSpacing = '2.4px';
    ctx.fillStyle = C.sulphur;
    ctx.globalAlpha = on;
    ctx.fillText('RANKED BY LONGEVITY', 154, 168);
    ctx.globalAlpha = 1;
    font(ctx, { f: FONTS.display, w: 800, s: 124, ls: -0.045 });
    ctx.fillStyle = C.ground;
    [['Strength you', 25.5], ['can see.', 25.85]].forEach(([line, at], i) => {
      const p = seg(gb, at, at + 0.5, ease.outExpo), q = seg(gb, 28.1 + i * 0.06, 28.5 + i * 0.06, ease.inCubic);
      if (p <= 0 || q >= 1) return;
      const y = 300 + i * 118;
      ctx.save();
      ctx.beginPath(); ctx.rect(140, y - 124, W, 150); ctx.clip();
      ctx.fillText(line, 150, y + (1 - p) * 130 - q * 130);
      ctx.restore();
    });
  }
  // inspection corners lock onto the strongest frame
  const lk = seg(gb, GRID_T.lock - 0.25, GRID_T.lock + 0.35);
  if (lk > 0) {
    const r = heroImageRect(gb);
    const k = 1 + 0.22 * (1 - ease.outBack(lk, 2.2));
    const pad = 22;
    const cx = r.x + r.w / 2, cy = r.y + r.h / 2;
    const w = (r.w + pad * 2) * k, h = (r.h + pad * 2) * k;
    ctx.globalAlpha = clamp(lk * 3);
    corners(ctx, cx - w / 2, cy - h / 2, w, h, { arm: 46, r: 14, lw: 3, color: '#DCE7E5' });
    // aperture ping: square rings expanding out of the lock
    for (let i = 0; i < 2; i++) {
      const pp = seg(gb, GRID_T.lock + i * 0.35, GRID_T.lock + 1.3 + i * 0.35);
      if (pp <= 0 || pp >= 1) continue;
      const kk = 1 + 0.35 * ease.outCubic(pp);
      ctx.strokeStyle = rgba(C.sulphur, 0.5 * (1 - pp));
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(cx - (w * kk) / 2, cy - (h * kk) / 2, w * kk, h * kk, 18);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  }
}

export default {
  id: 'grid',
  init,
  three: { start: B(GRID_T.start), end: B(GRID_T.end), update },
  layers: [{ start: B(24), end: B(32), draw: drawOverlay }],
};
