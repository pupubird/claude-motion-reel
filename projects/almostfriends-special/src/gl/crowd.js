// The crowd: thousands of people as small glass orbs in one draw call (InstancedMesh). Each orb carries its top
// priority as its body colour and its second priority as a rim light, so "like-minded" reads as "the same colours".
// A scan (the AI) sweeps out from a point: orbs it passes either light up (a match) or fade back (not this time).
import * as THREE from 'three';
import { rng, TAU } from '../util.js';

const VERT = /* glsl */ `
attribute vec3 aC1, aC2;
attribute vec4 aInfo;            // x seed, y match (0..1), z delay jitter, w phase
uniform float uTime, uScanR, uScanW;
uniform vec3 uScanAt;
varying vec3 vN, vV, vC1, vC2;
varying float vLit, vDim, vSeed, vDepth, vSy;
void main() {
  vec3 p = position;
  vec4 wp = modelMatrix * instanceMatrix * vec4(p, 1.0);
  vec3 c = (modelMatrix * instanceMatrix * vec4(0.0, 0.0, 0.0, 1.0)).xyz;
  // the scan front: has it passed this orb yet?
  float d = length(c - uScanAt) + aInfo.z;
  float passed = smoothstep(uScanR, uScanR - uScanW, d);
  float m = aInfo.y;
  vLit = passed * m;
  vDim = passed * (1.0 - m);
  // matches swell a little as the front passes; the others shrink back
  float s = 1.0 + 0.18 * vLit - 0.28 * vDim;
  wp.xyz = c + (wp.xyz - c) * s;
  vN = normalize(mat3(modelMatrix) * mat3(instanceMatrix) * normal);
  vV = normalize(cameraPosition - wp.xyz);
  vC1 = aC1; vC2 = aC2; vSeed = aInfo.x;
  vec4 cp = projectionMatrix * viewMatrix * vec4(c, 1.0);
  vSy = cp.y / cp.w;
  vDepth = -(viewMatrix * vec4(c, 1.0)).z;
  gl_Position = projectionMatrix * viewMatrix * wp;
}`;

const FRAG = /* glsl */ `
uniform vec3 uKey, uBg;
uniform float uFog, uVeil, uVeilY, uNear, uFar, uAlpha;
varying vec3 vN, vV, vC1, vC2;
varying float vLit, vDim, vSeed, vDepth, vSy;
void main() {
  vec3 N = normalize(vN), V = normalize(vV);
  float ci = clamp(dot(N, V), 0.0, 1.0);
  float rim = pow(1.0 - ci, 2.2);
  float key = 0.5 + 0.5 * dot(N, normalize(uKey));
  // a tinted soap bubble, not a ball: a luminous, partly clear body in the top priority, an iridescent rim that
  // leans to the second priority, a crisp window highlight
  vec3 body = vC1 * mix(0.86, 1.1, key);
  vec3 col = mix(body, vC2 * 1.1 + 0.08, rim * 0.8);
  col = mix(col, vec3(1.0), (1.0 - rim) * 0.18);
  vec3 R = reflect(-V, N);
  float spec = smoothstep(0.88, 0.96, dot(R, normalize(uKey + vec3(0.0, 0.2, 0.4))));
  col += spec * 0.85;
  float a = mix(0.62, 0.95, rim) + spec * 0.3;
  // lit matches glow; the others fall back toward the sky (still people, just not your people this time)
  col = mix(col, col * 1.12 + 0.06, vLit);
  col = mix(col, mix(uBg, vec3(dot(col, vec3(0.3, 0.55, 0.15))), 0.3), vDim * 0.8);
  a *= mix(1.0, 0.5, vDim);
  // aerial perspective: far bubbles fade into the sky; a veil keeps the title band clear when asked
  float far = smoothstep(uNear, uFar, vDepth);
  col = mix(col, uBg, far * 0.7);
  a *= 1.0 - far * 0.55;
  a *= 1.0 - uVeil * smoothstep(uVeilY - 0.12, uVeilY + 0.05, vSy);
  a *= uAlpha;
  gl_FragColor = vec4(col * a, a);
}`;

// colors: array of priority hex colours. Each person draws a top and second priority; `isMatch(top, second)` → 0..1.
export function crowd({ count = 2400, colors, seed = 11, isMatch, spread = [9, 16, 10] } = {}) {
  const R = rng(seed);
  const geo = new THREE.InstancedBufferGeometry().copy(new THREE.SphereGeometry(1, 28, 20));
  const lin = colors.map((h) => new THREE.Color(h).convertSRGBToLinear());
  const c1 = new Float32Array(count * 3), c2 = new Float32Array(count * 3), info = new Float32Array(count * 4);
  const mesh = new THREE.InstancedMesh(geo, null, count);
  const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), sc = new THREE.Vector3(), pos = new THREE.Vector3();
  const people = [];
  for (let i = 0; i < count; i++) {
    const a = Math.floor(R() * colors.length);
    let b = Math.floor(R() * (colors.length - 1)); if (b >= a) b++;
    lin[a].toArray(c1, i * 3); lin[b].toArray(c2, i * 3);
    // a loose slab of people in front of the camera, denser toward the middle
    const x = (R() - 0.5) * spread[0] * 2, y = (R() - 0.5) * spread[1] * 2, z = -R() * spread[2];
    const s = 0.1 + Math.pow(R(), 2.2) * 0.5;
    pos.set(x, y, z); sc.setScalar(s);
    m4.compose(pos, q, sc);
    mesh.setMatrixAt(i, m4);
    const m = isMatch ? isMatch(a, b) : 0;
    info.set([R() * 100, m, (R() - 0.5) * 0.8, R() * TAU], i * 4);
    people.push({ x, y, z, s, a, b, m });
  }
  geo.setAttribute('aC1', new THREE.InstancedBufferAttribute(c1, 3));
  geo.setAttribute('aC2', new THREE.InstancedBufferAttribute(c2, 3));
  geo.setAttribute('aInfo', new THREE.InstancedBufferAttribute(info, 4));
  mesh.material = new THREE.ShaderMaterial({
    vertexShader: VERT, fragmentShader: FRAG,
    uniforms: {
      uTime: { value: 0 }, uScanR: { value: -1 }, uScanW: { value: 1.2 }, uScanAt: { value: new THREE.Vector3() },
      uKey: { value: new THREE.Vector3(-0.5, 0.7, 0.6) }, uBg: { value: new THREE.Color('#EEF2FB').convertSRGBToLinear() }, uFog: { value: 0 },
      uVeil: { value: 0 }, uVeilY: { value: 0.35 }, uNear: { value: 12 }, uFar: { value: 30 }, uAlpha: { value: 1 },
    },
    transparent: true, depthWrite: true,
    blending: THREE.CustomBlending, blendSrc: THREE.OneFactor, blendDst: THREE.OneMinusSrcAlphaFactor,
  });
  mesh.frustumCulled = false;
  mesh.people = people;
  return mesh;
}
