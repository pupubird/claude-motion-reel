// A sea of cloud, ray-marched and composited over the rendered scene (it reads the scene's depth, so cloud in front of
// the jewel hides it and cloud behind it is hidden). Density: Perlin–Worley base eroded by Worley detail inside a
// slab whose top can sink (the cloud parts downward), opened by a clearing around the line of sight to the subject.
// Light: the sun through the slab (Beer), a two-lobe Henyey–Greenstein phase, Wrenninge multiple-scattering octaves,
// a sky ambient graded by height, the subject's glow scattering in the mist, and aerial haze toward the horizon.
// Steps grow with distance; energy-conserving step integration (Hillaire 2015).
import * as THREE from 'three';
import { QUAD_VERT } from './post.js';
import { cloudNoise } from './noise3d.js';

const FRAG = /* glsl */ `
precision highp float;
precision highp sampler3D;
uniform sampler2D tScene;
uniform sampler2D tDepth;
uniform sampler3D tNoise;
uniform mat4 uInvProj, uCamWorld;
uniform vec3 uCamPos;
uniform float uNear, uFar;
uniform vec2 uSlab;          // y bottom, y top (world)
uniform float uExtent;       // half-size in x / z
uniform float uScale, uDetailScale, uCoverage, uDensity, uDetail, uFade, uSeed, uSoftBottom, uSoftTop;
uniform float uMinStep, uStepK, uMaxDist;
uniform vec3 uWind, uWindDetail;
uniform vec3 uSunDir, uSunColor, uAmbTop, uAmbBottom;
uniform vec3 uGlowPos, uGlowColor;
uniform float uGlowRadius;
uniform vec4 uPart;          // xyz clearing centre (the subject), w radius (m) about the line of sight
uniform float uPartSoft, uPartNoise;
uniform float uAlbedo, uG1, uG2, uGMix, uPowder;
uniform vec3 uHazeColor;
uniform float uHazeDist;
uniform float uTopVar, uTopScale;   // cumulus tops: how far the top dips between towers, and the towers' spacing (1/m)
uniform float uVeil, uVeilScale, uVeilCov;   // mist around the lens (the opening), any height, opened by the clearing
uniform vec3 uVeilLight;     // light inside the mist: the many-bounce glow a single sun ray cannot carry
uniform vec4 uBank;          // a cloud bank wrapped round the subject: xyz centre, w radius (any height, above the sea)
uniform float uBankDensity;
in vec2 vUv;
out vec4 fragColor;

float hash(vec3 p) { p = fract(p * 0.1031); p += dot(p, p.zyx + 31.32); return fract((p.x + p.y) * p.z); }
float remap(float v, float a, float b, float c, float d) { return c + (v - a) / (b - a) * (d - c); }
float hg(float c, float g) { float g2 = g * g; return (1.0 - g2) / (4.0 * 3.14159265 * pow(1.0 + g2 - 2.0 * g * c, 1.5)); }

float clearing(vec3 p) {
  if (uPart.w <= -1.0) return 1.0;
  vec3 a = normalize(uPart.xyz - uCamPos);
  vec3 v = p - uCamPos;
  float along = dot(v, a);
  float d = length(v - a * along);
  float n = texture(tNoise, p * uScale * 0.6 + uWind * 0.4).r;
  float r = uPart.w * (1.0 + uPartNoise * (n - 0.5) * 2.0);
  // the clearing reaches a little past the subject, not to the horizon
  float reach = smoothstep(length(uPart.xyz - uCamPos) + 0.05, length(uPart.xyz - uCamPos) + 0.01, along);
  return mix(1.0, smoothstep(r, r + uPartSoft, d), reach);
}

float veil(vec3 p) {
  if (uVeil <= 0.0) return 0.0;
  float n = texture(tNoise, p * uVeilScale + uWind * 0.8).r;
  float m = texture(tNoise, p * uVeilScale * 3.1 + uWindDetail).g;
  float d = clamp(remap(n * 0.75 + m * 0.25, uVeilCov, 1.0, 0.0, 1.0), 0.0, 1.0);
  return d * uVeil * clearing(p);
}

float bank(vec3 p) {
  if (uBankDensity <= 0.0) return 0.0;
  // a flattened layer of billows in front of the moon: the envelope is wide and low, the inside broken by two octaves
  // of cloud noise so light gets through the thin parts
  float dist = length((p - uBank.xyz) * vec3(0.8, 2.1, 1.1));
  float n = texture(tNoise, p * uScale * 2.6 + uWind * 1.3).r;
  float m = texture(tNoise, p * uDetailScale * 1.1 + uWindDetail).g;
  float env = 1.0 - dist / uBank.w;
  float body = remap(n * 0.75 + m * 0.25, 0.42 - env * 0.35, 1.0, 0.0, 1.0);
  return clamp(body, 0.0, 1.0) * smoothstep(0.0, 0.25, env) * uBankDensity * clearing(p);
}

float density(vec3 p, bool detail) {
  float top = uSlab.y - uTopVar * (1.0 - texture(tNoise, vec3(p.x, 0.37, p.z) * uTopScale + vec3(uWind.x, 0.0, uWind.z) * 0.3).r);
  float h = (p.y - uSlab.x) / (top - uSlab.x);
  if (h < 0.0 || h > 1.0) return veil(p) + bank(p);
  vec3 q = p * uScale + uWind;
  vec4 n = texture(tNoise, q);
  float wf = n.g * 0.625 + n.b * 0.25 + n.a * 0.125;
  float base = remap(n.r, wf - 1.0, 1.0, 0.0, 1.0);
  // cumulus profile: rounded tops, a flatter base
  float prof = smoothstep(0.0, uSoftBottom, h) * smoothstep(1.0, 1.0 - uSoftTop, h);
  float d = clamp(remap(base * prof, uCoverage, 1.0, 0.0, 1.0), 0.0, 1.0);
  if (detail && d > 0.0) {
    vec4 m = texture(tNoise, p * uDetailScale + uWindDetail);
    float df = m.g * 0.5 + m.b * 0.3 + m.a * 0.2;
    d = clamp(remap(d, df * uDetail * (1.0 - h * 0.5), 1.0, 0.0, 1.0), 0.0, 1.0);
  }
  return d * uDensity * uFade * clearing(p) + veil(p) + bank(p);
}

void main() {
  vec3 scene = texture(tScene, vUv).rgb;
  if (uFade <= 0.0) { fragColor = vec4(scene, 1.0); return; }
  vec4 vp = uInvProj * vec4(vUv * 2.0 - 1.0, 1.0, 1.0);
  vec3 dv = normalize(vp.xyz / vp.w);
  vec3 rd = normalize((uCamWorld * vec4(dv, 0.0)).xyz);
  vec3 ro = uCamPos;
  float zn = texture(tDepth, vUv).r * 2.0 - 1.0;
  float viewZ = 2.0 * uNear * uFar / ((uFar + uNear) - zn * (uFar - uNear));
  float tScene = viewZ / max(1e-4, -dv.z);
  // slab intersection (y), plus the x/z extent
  float t0, t1;
  if (abs(rd.y) < 1e-5) { t0 = 0.0; t1 = uMaxDist; if (ro.y < uSlab.x || ro.y > uSlab.y) { t1 = 0.0; } }
  else {
    float a = (uSlab.x - ro.y) / rd.y, b = (uSlab.y - ro.y) / rd.y;
    t0 = max(min(a, b), 0.0); t1 = max(a, b);
  }
  vec2 ex = (vec2(uExtent) * sign(rd.xz) - ro.xz) / rd.xz;
  t1 = min(t1, min(ex.x, ex.y));
  if (uVeil > 0.0) { t0 = 0.0; t1 = max(t1, uMaxDist); }
  if (uBankDensity > 0.0) {   // extend the march over the bank's sphere
    vec3 oc = ro - uBank.xyz; float R = uBank.w * 1.4;
    float b = dot(oc, rd), c = dot(oc, oc) - R * R, disc = b * b - c;
    if (disc > 0.0) { float sq = sqrt(disc); float a0 = max(-b - sq, 0.0), a1 = -b + sq;
      if (a1 > 0.0) { if (t1 <= t0) { t0 = a0; t1 = a1; } else { t0 = min(t0, a0); t1 = max(t1, a1); } } }
    t1 = min(t1, min(tScene, uMaxDist));
  }
  t1 = min(t1, min(tScene, uMaxDist));
  if (t1 <= t0) { fragColor = vec4(scene, 1.0); return; }
  float jit = hash(vec3(gl_FragCoord.xy, uSeed));
  float t = t0 + uMinStep * jit;
  float T = 1.0;
  vec3 L = vec3(0.0);
  float cosT = dot(rd, uSunDir);
  float ph1 = mix(hg(cosT, uG1), hg(cosT, uG2), uGMix);
  float ph2 = mix(hg(cosT, uG1 * 0.5), hg(cosT, uG2 * 0.5), uGMix);
  float ph3 = mix(hg(cosT, uG1 * 0.25), hg(cosT, uG2 * 0.25), uGMix);
  float lstep = (uSlab.y - uSlab.x) / 6.0;
  float firstHit = -1.0;
  for (int i = 0; i < 160; i++) {
    if (t >= t1 || T < 0.008) break;
    float dt = max(uMinStep, t * uStepK);
    vec3 p = ro + rd * (t + dt * 0.5);
    float s = density(p, true);
    if (s > 0.0) {
      if (firstHit < 0.0) firstHit = t;
      float od = 0.0;
      for (int k = 1; k <= 6; k++) od += density(p + uSunDir * lstep * (float(k) - 0.5), false) * lstep;
      vec3 sun = uSunColor * (exp(-od) * ph1 + 0.5 * exp(-od * 0.5) * ph2 + 0.25 * exp(-od * 0.25) * ph3) * 12.566;
      float powder = 1.0 - uPowder * exp(-s * 0.004);
      float h = clamp((p.y - uSlab.x) / (uSlab.y - uSlab.x), 0.0, 1.0);
      vec3 amb = mix(uAmbBottom, uAmbTop, smoothstep(0.0, 1.0, h));
      vec3 glow = uGlowColor * exp(-length(p - uGlowPos) / max(1e-5, uGlowRadius));
      float vf = uVeil > 0.0 ? clamp(veil(p) / s, 0.0, 1.0) : 0.0;
      vec3 S = (sun * powder + amb + glow + uVeilLight * vf) * uAlbedo;
      float ex = exp(-s * dt);
      L += T * (S - S * ex);
      T *= ex;
    }
    t += dt;
  }
  // aerial haze over the cloud seen far away
  if (firstHit > 0.0) {
    float hz = 1.0 - exp(-firstHit / uHazeDist);
    L = mix(L, uHazeColor * (1.0 - T), hz);
  }
  fragColor = vec4(scene * T + L, 1.0);
}
`;

const NOISE = new Map();   // one 3D noise per (res, seed), shared by every cloud instance

export function createClouds(opts = {}) {
  const u = (v) => ({ value: v });
  const nk = `${opts.res ?? 64}:${opts.seed ?? 7}`;
  if (!NOISE.has(nk)) NOISE.set(nk, cloudNoise(opts.res ?? 64, opts.seed ?? 7));
  const noise = NOISE.get(nk);
  const uniforms = {
    tScene: u(null), tDepth: u(null), tNoise: u(noise),
    uInvProj: u(new THREE.Matrix4()), uCamWorld: u(new THREE.Matrix4()), uCamPos: u(new THREE.Vector3()), uNear: u(0.01), uFar: u(10),
    uSlab: u(new THREE.Vector2(-0.05, 0)), uExtent: u(1.0),
    uScale: u(20), uDetailScale: u(80), uCoverage: u(0.45), uDensity: u(600), uDetail: u(0.35), uFade: u(1), uSeed: u(0),
    uSoftBottom: u(0.3), uSoftTop: u(0.5), uMinStep: u(0.0015), uStepK: u(0.03), uMaxDist: u(2.0),
    uWind: u(new THREE.Vector3()), uWindDetail: u(new THREE.Vector3()),
    uSunDir: u(new THREE.Vector3(0, 1, 0)), uSunColor: u(new THREE.Color(1, 1, 1)),
    uAmbTop: u(new THREE.Color(0.6, 0.62, 0.7)), uAmbBottom: u(new THREE.Color(0.55, 0.5, 0.48)),
    uGlowPos: u(new THREE.Vector3()), uGlowColor: u(new THREE.Color(0, 0, 0)), uGlowRadius: u(0.005),
    uPart: u(new THREE.Vector4(0, 0, 0, -2)), uPartSoft: u(0.004), uPartNoise: u(0.4),
    uAlbedo: u(0.95), uG1: u(0.6), uG2: u(-0.25), uGMix: u(0.3), uPowder: u(0.5),
    uHazeColor: u(new THREE.Color(1, 1, 1)), uHazeDist: u(1.0),
    uTopVar: u(0.0), uTopScale: u(3.0), uVeil: u(0), uVeilScale: u(12), uVeilCov: u(0.2), uVeilLight: u(new THREE.Color(1, 1, 1)),
    uBank: u(new THREE.Vector4()), uBankDensity: u(0),
  };
  const material = new THREE.ShaderMaterial({ glslVersion: THREE.GLSL3, vertexShader: QUAD_VERT, fragmentShader: FRAG, uniforms, depthTest: false, depthWrite: false });
  const scene = new THREE.Scene();
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material);
  mesh.frustumCulled = false;
  scene.add(mesh);
  const quadCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  return {
    uniforms, material,
    // engine hook: (renderer, colour texture, depth texture, camera, out target, sub) → out texture
    composite(r, color, depth, camera, out, sub) {
      uniforms.tScene.value = color; uniforms.tDepth.value = depth;
      uniforms.uInvProj.value.copy(camera.projectionMatrixInverse);
      uniforms.uCamWorld.value.copy(camera.matrixWorld);
      uniforms.uCamPos.value.setFromMatrixPosition(camera.matrixWorld);
      uniforms.uNear.value = camera.near; uniforms.uFar.value = camera.far;
      uniforms.uSeed.value = (sub?.k ?? 0) * 7.31 + 0.5;
      r.setRenderTarget(out);
      r.render(scene, quadCam);
      return out.texture;
    },
  };
}
