// Bar 5 · liquid satin: domain-warped fbm with lit normals, bursting out of the singularity.
import * as THREE from 'three';
import { W, H, BEAT, COLORS as C, FONTS } from '../config.js';
import { ease, seg, lerp, TAU } from '../util.js';
import { KICKS, sec } from '../score.js';
import { font, advances } from '../draw2d.js';

const FRAG = /* glsl */ `
precision highp float;
uniform float uTime, uB, uAspect, uKickAge, uReveal;
uniform vec3 cInk, cHot, cVolt, cBone;
varying vec2 vUv;

float hash(vec2 p) { p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
float noise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  vec2 u = f * f * f * (f * (f * 6.0 - 15.0) + 10.0);
  float a = hash(i), b = hash(i + vec2(1.0, 0.0)), c = hash(i + vec2(0.0, 1.0)), d = hash(i + vec2(1.0, 1.0));
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}
float fbm(vec2 p) {
  float s = 0.0, a = 0.5;
  mat2 m = mat2(1.6, 1.2, -1.2, 1.6);
  for (int i = 0; i < 5; i++) { s += a * noise(p); p = m * p; a *= 0.5; }
  return s;
}
float field(vec2 p, float t, out vec2 q, out vec2 r) {
  q = vec2(fbm(p + 0.10 * t), fbm(p + vec2(5.2, 1.3) - 0.08 * t));
  r = vec2(fbm(p + 3.6 * q + vec2(1.7, 9.2) + 0.14 * t), fbm(p + 3.6 * q + vec2(8.3, 2.8) - 0.12 * t));
  return fbm(p + 3.2 * r);
}
void main() {
  vec2 uv = (vUv - 0.5) * vec2(uAspect, 1.0);
  float d = length(uv);
  float sw = 2.2 * exp(-uB * 1.1) * exp(-d * 1.5);
  uv = mat2(cos(sw), sin(sw), -sin(sw), cos(sw)) * uv;
  uv += (uv / max(d, 1e-3)) * sin(d * 26.0 - uKickAge * 20.0) * 0.011 * exp(-uKickAge * 5.0);
  vec2 p = uv * 1.25 + vec2(3.0, 1.0);
  float t = uTime * 1.6;
  vec2 q, r, q2, r2;
  float f = field(p, t, q, r);
  float e = 0.003;
  float fx = field(p + vec2(e, 0.0), t, q2, r2);
  float fy = field(p + vec2(0.0, e), t, q2, r2);
  vec3 n = normalize(vec3(-(fx - f) / e * 0.1, -(fy - f) / e * 0.1, 1.0));
  vec3 col = mix(cInk, cVolt * 0.8, smoothstep(0.25, 0.75, f));
  col = mix(col, cHot, smoothstep(0.6, 1.15, length(q)));
  col = mix(col, cBone, smoothstep(0.82, 1.0, r.x * f * 1.5) * 0.45);
  col *= mix(0.08, 1.0, smoothstep(0.12, 0.62, f));
  vec3 L = normalize(vec3(-0.5, 0.55, 0.75));
  float diff = clamp(dot(n, L), 0.0, 1.0);
  float spec = pow(max(dot(n, normalize(L + vec3(0.0, 0.0, 1.0))), 0.0), 44.0);
  float fres = pow(1.0 - clamp(n.z, 0.0, 1.0), 2.5);
  col = col * (0.12 + 0.95 * diff) + spec * vec3(1.3, 1.25, 1.2) + fres * cVolt * 0.25;
  col *= 1.0 - 0.45 * exp(-dot(uv * vec2(0.9, 1.6), uv * vec2(0.9, 1.6)) * 5.0);
  float R = uReveal;
  col *= smoothstep(R, R - 0.015, d);
  col += cBone * 8.0 * exp(-pow((d - R) * 70.0, 2.0)) * (1.0 - smoothstep(0.7, 1.15, R));
  gl_FragColor = vec4(col, 1.0);
}
`;

let scene, cam, mat;
const KT = KICKS.map(sec);

function init() {
  scene = new THREE.Scene();
  cam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  mat = new THREE.ShaderMaterial({
    vertexShader: 'varying vec2 vUv; void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }',
    fragmentShader: FRAG,
    uniforms: {
      uTime: { value: 0 }, uB: { value: 0 }, uAspect: { value: W / H }, uKickAge: { value: 10 }, uReveal: { value: 0 },
      cInk: { value: new THREE.Color(C.ink) }, cHot: { value: new THREE.Color(C.hot) },
      cVolt: { value: new THREE.Color(C.volt) }, cBone: { value: new THREE.Color(C.bone) },
    },
    depthTest: false,
    depthWrite: false,
  });
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), mat);
  mesh.frustumCulled = false;
  scene.add(mesh);
}

function update(t) {
  const lb = t / BEAT - 16;
  let last = -10;
  for (const k of KT) if (k <= t) last = k;
  const U = mat.uniforms;
  U.uTime.value = t;
  U.uB.value = lb;
  U.uKickAge.value = t - last;
  U.uReveal.value = 1.15 * seg(lb, 0, 0.6, ease.outExpo);
  return { scene, camera: cam, exposure: 0.8, bloom: { strength: 0.5, radius: 0.8, threshold: 0.9 } };
}

const WORD = 'fluid';
const BANDS = [C.hot, C.volt, C.ink, C.bone];

function draw(ctx, t) {
  const lb = t / BEAT - 16;
  // "fluid": each glyph focus-pulls in, then drifts on its own sine current.
  font(ctx, { f: FONTS.serif, i: true, s: 440 });
  const { x: adv, total } = advances(ctx, WORD);
  const x0 = W / 2 - total / 2, base = H / 2 + 120;
  ctx.fillStyle = C.bone;
  for (let i = 0; i < WORD.length; i++) {
    const k = seg(lb, 0.35 + i * 0.09, 1.1 + i * 0.09, ease.outExpo);
    if (k <= 0) continue;
    ctx.save();
    ctx.globalAlpha = k;
    const blur = (1 - k) * 22;
    if (blur > 0.5) ctx.filter = `blur(${blur.toFixed(1)}px)`;
    ctx.translate(x0 + adv[i] + 60, base + Math.sin(t * 2.6 + i * 0.9) * 16 + (1 - k) * 90);
    ctx.rotate(Math.sin(t * 1.9 + i * 1.7) * 0.045);
    ctx.scale(0.8 + 0.2 * k, 0.8 + 0.2 * k);
    ctx.fillText(WORD[i], -60, 0);
    ctx.restore();
  }
  // Exit: four-colour diagonal band wipe into the paper-white of bar 6.
  const skew = 0.42 * H;
  for (let k = 0; k < BANDS.length; k++) {
    const p = seg(lb, 3.18 + k * 0.1, 3.72 + k * 0.08, ease.inOutQuart);
    if (p <= 0) continue;
    const front = lerp(-skew / 2 - 30, W + skew / 2 + 30, p);
    ctx.fillStyle = BANDS[k];
    ctx.beginPath();
    ctx.moveTo(-50, 0);
    ctx.lineTo(front + skew / 2, 0);
    ctx.lineTo(front - skew / 2, H);
    ctx.lineTo(-50, H);
    ctx.fill();
  }
}

export default {
  id: 'liquid',
  init,
  three: { start: 16 * BEAT, end: 20 * BEAT, update },
  layers: [{ start: 16 * BEAT, end: 20 * BEAT, draw }],
};
