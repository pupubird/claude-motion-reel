// The wall of your bubble, seen from inside: a soap film just in front of the lens, filling the frame (the hook's
// "Knock knock", research/research-hooks.md §10.3 C1). Bub pushes on it from outside:
//   · the film bulges toward the lens round the contact (a Gaussian dome) and each smack sends a ripple ring out;
//   · it thins toward the contact, so its interference colours slide (blue → magenta → gold) and a black spot forms
//     (the thinnest film reflects nothing), as a real film does just before it bursts;
//   · then a hole tears open from that spot, racing outward, the film bunched into a bright rolled rim.
// Everywhere else it is a faint, slowly swirling film (the world shows through it). Plane units: the plane's own
// metres, x right, y up; the caller places it facing the camera at a distance (place()).
// Special edition, second pass: the hook's words are written on this wall (uType, laid out in frame pixels), so they
// are part of it — they ride its ripples and its bulge in 3D, its sheen and reflections lie over them, and when it
// tears they go with it.
import * as THREE from 'three';
import { FILM_GLSL } from './filmglsl.js';

const HFUN = /* glsl */ `
uniform vec2 uC;
uniform float uBulge, uSigma, uRingV, uRingW;
uniform vec4 uRingT, uRingA;      // up to four hits (v5: three knocks and a smack): the time since each (< 0: not yet), its amplitude
uniform float uTremor, uTime;
float H(vec2 q) {
  vec2 d = q - uC; float r = length(d);
  float h = uBulge * exp(-(r * r) / (uSigma * uSigma));
  for (int i = 0; i < 4; i++) {
    float k = uRingT[i], a = uRingA[i];
    if (k > 0.0) { float rr = uRingV * k; h += a * exp(-k * 2.2) * exp(-pow((r - rr) / uRingW, 2.0)); }
  }
  h += uTremor * exp(-(r * r) / (4.0 * uSigma * uSigma)) * sin(uTime * 70.0 + r * 60.0) * 0.004;
  return h;
}`;

const VERT = /* glsl */ `
${HFUN}
varying vec2 vP;
varying vec3 vN, vW;
void main() {
  vec3 p = position;
  p.z += H(p.xy);
  float e = 0.004;
  vec3 n = normalize(vec3(-(H(p.xy + vec2(e, 0.0)) - H(p.xy - vec2(e, 0.0))) / (2.0 * e), -(H(p.xy + vec2(0.0, e)) - H(p.xy - vec2(0.0, e))) / (2.0 * e), 1.0));
  vP = position.xy;
  vec4 wp = modelMatrix * vec4(p, 1.0);
  vW = wp.xyz;
  vN = normalize(mat3(modelMatrix) * n);
  gl_Position = projectionMatrix * viewMatrix * wp;
}`;

const FRAG = /* glsl */ `
uniform vec2 uC;
uniform float uSigma, uThin, uSpot, uHole, uAlpha, uGain, uTime, uPatch;
uniform sampler2D uType;
uniform float uTypeOn, uTypeK;     // the words on it (0 = none); frame px per plane unit at its distance
varying vec2 vP;
varying vec3 vN, vW;
${FILM_GLSL}
void main() {
  vec2 d = vP - uC; float r = length(d);
  // the tear: a ragged hole from the contact, its edge a bright rolled rim
  float rag = 0.012 * snoise(vec3(vP * 9.0, 1.3)) + 0.004 * snoise(vec3(vP * 31.0, 4.1));
  float edge = r - (uHole + rag);
  if (uHole > 0.0 && edge < 0.0) discard;
  float rim = uHole > 0.0 ? 1.0 - smoothstep(0.0, 0.012, edge) : 0.0;
  vec3 N = normalize(vN), V = normalize(cameraPosition - vW);
  float ci = clamp(abs(dot(N, V)), 0.0, 1.0);
  // thickness (nm): a swirling film, thinned toward the contact as Bub stretches it, down to black film at the spot
  vec3 q = vec3(vP * 2.4, uTime * 0.08);
  float sw = fbm(q + vec3(0.0, -uTime * 0.05, 0.0)) * 0.5 + fbm(q * 2.3 + 4.0) * 0.25;
  float near = exp(-(r * r) / (2.2 * uSigma * uSigma));
  float dnm = 520.0 + 230.0 * sw;
  dnm = mix(dnm, mix(dnm * 0.42, 60.0, uThin), near * uThin);
  float spot = smoothstep(0.0, 0.25, uSpot) * (1.0 - smoothstep(uSigma * 0.9 * uSpot, uSigma * (0.15 + 1.05 * uSpot), r + rag * 2.0));
  dnm = mix(dnm, 8.0, spot);
  vec3 film = filmRGB(max(dnm, 6.0), ci);
  // reflection of a bright sky (above) and the pale world (below); stronger where stretched, and at grazing angles
  vec3 env = mix(vec3(0.95, 0.93, 0.92), vec3(1.0, 1.0, 1.04), smoothstep(-0.6, 0.6, N.y + 0.2));
  float stretch = 0.55 + 1.6 * near * (0.4 + uThin);
  // thicker toward the frame's edges (a film drains to its rim): more colour there, so you feel inside a bubble
  float edgeF = smoothstep(0.25, 0.75, length(vP * vec2(1.6, 0.9)));
  vec3 R = clamp(film * uGain * (stretch + 0.5 * edgeF), 0.0, 1.0);
  float lum = dot(R, vec3(0.2126, 0.7152, 0.0722));
  float a = clamp(0.015 + lum * 0.55 + pow(1.0 - ci, 3.0) * 0.35, 0.0, 0.85);
  vec3 col = R * env;
  // where Bub presses on the wall: a flat contact patch, its edge a bright meniscus line
  if (uPatch > 0.0) {
    float ring = exp(-pow((r - uPatch) / (uPatch * 0.07), 2.0));
    col += vec3(1.0) * ring * 0.65; a = max(a, ring * 0.55);
    float inside = 1.0 - smoothstep(uPatch * 0.85, uPatch, r);
    col = mix(col, vec3(0.97, 0.98, 1.0) * 0.25, inside * 0.25); a = mix(a, a * 0.6 + 0.08, inside);
  }
  // a soft key highlight on the dome (it is a curved surface now)
  float spec = smoothstep(0.86, 0.97, dot(reflect(-V, N), normalize(vec3(-0.35, 0.55, 0.75))));
  col += spec * 0.8 * near; a = max(a, spec * 0.6 * near);
  // the black spot: no reflection, so against the bright film it reads dark
  col = mix(col, vec3(0.03, 0.04, 0.09) * 0.8, spot * 0.92); a = mix(a, 0.82, spot);
  // the rolled rim of the tear
  col += rim * (filmRGB(dnm * 1.8 + 140.0, ci) * 1.4 + 0.6); a = max(a, rim * 0.9);
  // the words, written on the wall: under its reflection (the film's sheen and highlights slide over them), thinned
  // where the film thins to black, the film's colour catching their edges
  vec3 outC = col * a;
  float outA = a;
  if (uTypeOn > 0.0) {
    vec2 uvT = vec2(0.5 + vP.x * uTypeK / 1080.0, 0.5 + vP.y * uTypeK / 1920.0);   // (a canvas texture is flipped: v up)
    vec4 ink = texture2D(uType, uvT);
    float ia = ink.a * uTypeOn * (1.0 - 0.6 * spot);
    outC = outC + ink.rgb * ia * (1.0 - a);
    outA = outA + ia * (1.0 - a);
    // a film's colours show best against something dark: over the ink its swirl of interference colour is plain to
    // see, sliding as the film drains and thins (the words are under your bubble's wall, not printed on the picture)
    outC += R * ia * (0.12 + 0.2 * near);
  }
  gl_FragColor = vec4(outC * uAlpha, outA * uAlpha);
}`;

// → { mesh, uniforms, place(camera, dist) }: a w × h plane (plane units), subdivided for the dome and the rings
export function membrane({ w = 1.4, h = 2.4, seg = [140, 240] } = {}) {
  const u = (v) => ({ value: v });
  const mat = new THREE.ShaderMaterial({
    vertexShader: VERT, fragmentShader: FRAG,
    uniforms: {
      uC: u(new THREE.Vector2(0, 0)), uBulge: u(0), uSigma: u(0.12), uRingV: u(1.6), uRingW: u(0.035),
      uRingT: u(new THREE.Vector4(-1, -1, -1, -1)), uRingA: u(new THREE.Vector4(0, 0, 0, 0)), uTremor: u(0), uTime: u(0),
      uThin: u(0), uSpot: u(0), uHole: u(0), uAlpha: u(1), uGain: u(3.0), uPatch: u(0), uType: u(null), uTypeOn: u(0), uTypeK: u(1),
    },
    transparent: true, depthWrite: false, side: THREE.DoubleSide,
    blending: THREE.CustomBlending, blendSrc: THREE.OneFactor, blendDst: THREE.OneMinusSrcAlphaFactor,
  });
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(w, h, seg[0], seg[1]), mat);
  mesh.frustumCulled = false;
  mesh.renderOrder = 100;
  return {
    mesh, uniforms: mat.uniforms,
    // face the camera at `dist` in front of it (the wall moves with the lens: it is the bubble you are in)
    place(camera, dist) {
      camera.updateMatrixWorld();
      mesh.quaternion.copy(camera.quaternion);
      mesh.position.set(0, 0, -dist).applyMatrix4(camera.matrixWorld);
      mesh.updateMatrixWorld();
    },
  };
}

// the same height field in JS (for the 2D type that bows with the wall, and for placing Bub on the dome)
export function heightAt(U, x, y) {
  const dx = x - U.uC.value.x, dy = y - U.uC.value.y, r = Math.hypot(dx, dy), s = U.uSigma.value;
  let h = U.uBulge.value * Math.exp(-(r * r) / (s * s));
  const T = U.uRingT.value.toArray(), A = U.uRingA.value.toArray();
  for (const [k, a] of T.map((k, i) => [k, A[i]])) {
    if (k > 0) { const rr = U.uRingV.value * k; h += a * Math.exp(-k * 2.2) * Math.exp(-(((r - rr) / U.uRingW.value) ** 2)); }
  }
  return h;
}
