// 80k GPU particles: knot surface → turbulent burst → 3-arm spiral galaxy → singularity.
// All motion lives in the vertex shader; the CPU only advances two uniforms.
import * as THREE from 'three';
import { TAU } from '../util.js';

export const COUNT = 80000;

const VERT = /* glsl */ `
uniform float uB, uTime, uPix;
uniform vec3 cHot, cBone, cVolt;
attribute vec3 aA, aB, aC;
attribute vec4 aR;
varying vec3 vCol;
varying float vA;
float oExpo(float x) { x = clamp(x, 0.0, 1.0); return x >= 1.0 ? 1.0 : 1.0 - pow(2.0, -10.0 * x); }
float ioCubic(float x) { x = clamp(x, 0.0, 1.0); return x < 0.5 ? 4.0 * x * x * x : 1.0 - pow(-2.0 * x + 2.0, 3.0) / 2.0; }
float iExpo(float x) { x = clamp(x, 0.0, 1.0); return x <= 0.0 ? 0.0 : pow(2.0, 10.0 * x - 10.0); }
vec3 flow(vec3 p, float t) {
  return vec3(sin(p.y * 1.1 + t * 1.3) + sin(p.z * 1.9 - t * 0.7),
              sin(p.z * 1.3 + t * 0.9) + sin(p.x * 1.7 + t * 1.1),
              sin(p.x * 1.2 - t * 1.2) + sin(p.y * 2.1 + t * 0.8));
}
void main() {
  float b = uB;
  float k1 = oExpo((b - aR.x * 0.2) / 1.3);
  vec3 p = mix(aA, aB, k1);
  float k2 = ioCubic((b - 0.95 - aR.y * 0.65) / 1.35);
  p += flow(p * 0.65, uTime * 1.6) * 0.42 * k1 * (1.0 - k2);
  float r = aC.x;
  float th = aC.y + uTime * 0.85 / (0.35 + r * 0.55);
  vec3 g = vec3(r * cos(th), aC.z, r * sin(th));
  p = mix(p, g, k2);
  float k3 = iExpo((b - 3.0 - aR.z * 0.28) / 0.6);
  float ang = k3 * (3.0 + 2.5 / (0.3 + r));
  float c = cos(ang), s = sin(ang);
  p.xz = mat2(c, s, -s, c) * p.xz;
  p *= 1.0 - k3;
  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  gl_Position = projectionMatrix * mv;
  float size = mix(0.014, 0.05, aR.w * aR.w * aR.w) * (1.0 + 0.5 * k1 * (1.0 - k2));
  float px = size * uPix / max(-mv.z, 0.05);
  gl_PointSize = max(px, 1.6);
  vec3 core = mix(cBone * 1.1, cHot * 1.1, smoothstep(0.2, 1.3, r));
  vec3 gc = mix(core, cVolt * 1.4, smoothstep(1.6, 4.8, r + aR.z * 1.4));
  gc = mix(gc, cBone * 1.5, step(0.95, aR.w));
  vCol = mix(mix(cHot * 1.2, cBone * 1.5, step(0.82, aR.w)), gc, k2);
  float dens = mix(1.0, 0.35 + 0.65 * smoothstep(0.2, 2.5, r), k2);
  vA = (0.18 + 0.3 * aR.z) * dens * clamp(px / 1.6, 0.15, 1.0) * (1.0 - 0.6 * k3) * smoothstep(0.6, 2.8, -mv.z);
}
`;

const FRAG = /* glsl */ `
varying vec3 vCol;
varying float vA;
void main() {
  vec2 d = gl_PointCoord - 0.5;
  float a = smoothstep(0.25, 0.0, dot(d, d)) * vA;
  gl_FragColor = vec4(vCol, a);
}
`;

export function makeParticles(knotPoints, R, colors) {
  const aB = new Float32Array(COUNT * 3), aC = new Float32Array(COUNT * 3), aR = new Float32Array(COUNT * 4);
  const gauss = () => { let s = 0; for (let i = 0; i < 4; i++) s += R(); return (s - 2) / 0.577; };
  for (let n = 0; n < COUNT; n++) {
    const x = knotPoints[n * 3], y = knotPoints[n * 3 + 1], z = knotPoints[n * 3 + 2];
    let dx = x + (R() - 0.5) * 1.6, dy = y + (R() - 0.5) * 1.6, dz = z + (R() - 0.5) * 1.6;
    const dl = Math.hypot(dx, dy, dz) || 1, rad = 1.8 + Math.sqrt(R()) * 3.8;
    aB.set([(dx / dl) * rad, (dy / dl) * rad, (dz / dl) * rad], n * 3);
    let r, th, gy;
    if (R() < 0.12) { // halo
      r = 0.6 + R() * 6.5; th = R() * TAU; gy = gauss() * 0.9;
    } else {
      r = 0.2 + 5.7 * Math.pow(R(), 1.15);
      const arm = n % 3;
      th = (arm * TAU) / 3 + r * 0.95 + gauss() * (0.22 + 0.1 / (0.3 + r));
      gy = gauss() * (0.05 + 0.42 * Math.exp(-r * 1.3));
    }
    aC.set([r, th, gy], n * 3);
    aR.set([R(), R(), R(), R()], n * 4);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(knotPoints.slice(), 3));
  geo.setAttribute('aA', new THREE.BufferAttribute(knotPoints, 3));
  geo.setAttribute('aB', new THREE.BufferAttribute(aB, 3));
  geo.setAttribute('aC', new THREE.BufferAttribute(aC, 3));
  geo.setAttribute('aR', new THREE.BufferAttribute(aR, 4));
  const mat = new THREE.ShaderMaterial({
    vertexShader: VERT,
    fragmentShader: FRAG,
    uniforms: {
      uB: { value: 0 }, uTime: { value: 0 }, uPix: { value: 1 },
      cHot: { value: new THREE.Color(colors.hot) }, cBone: { value: new THREE.Color(colors.bone) }, cVolt: { value: new THREE.Color(colors.volt) },
    },
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  const pts = new THREE.Points(geo, mat);
  pts.frustumCulled = false;
  return pts;
}

// Soft round dust for depth and parallax.
export function makeDust(R, count = 2600) {
  const pos = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) pos.set([(R() - 0.5) * 50, (R() - 0.5) * 30, -30 + R() * 105], i * 3);
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const mat = new THREE.ShaderMaterial({
    vertexShader: /* glsl */ `
      uniform float uPix;
      varying float vA;
      void main() {
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        gl_Position = projectionMatrix * mv;
        float px = 0.045 * uPix / max(-mv.z, 0.05);
        gl_PointSize = clamp(px, 1.5, 28.0);
        vA = smoothstep(0.6, 4.0, -mv.z) * smoothstep(90.0, 20.0, -mv.z) * clamp(px / 1.5, 0.2, 1.0);
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uCol;
      varying float vA;
      void main() {
        vec2 d = gl_PointCoord - 0.5;
        gl_FragColor = vec4(uCol, smoothstep(0.25, 0.0, dot(d, d)) * vA * 0.7);
      }`,
    uniforms: { uPix: { value: 1 }, uCol: { value: new THREE.Color(0.9, 0.85, 0.8) } },
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  const pts = new THREE.Points(geo, mat);
  pts.frustumCulled = false;
  return pts;
}
