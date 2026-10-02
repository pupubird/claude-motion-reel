// A shaft of sun through a high window: single scattering in a cone of haze, ray-marched over the rendered scene and
// stopped by its depth. Haze density carries slow fBm (the air moves), the scattering is forward-peaked (Henyey–
// Greenstein, so the beam brightens as the lens looks along it), and a window-bar mask across the cone gives the shaft
// its structure. Composited after the lens blur, like the cloud.
import * as THREE from 'three';
import { QUAD_VERT } from './post.js';

const FRAG = /* glsl */ `
precision highp float;
uniform sampler2D tScene;
uniform sampler2D tDepth;
uniform mat4 uInvProj, uCamWorld;
uniform vec3 uCamPos;
uniform float uNear, uFar;
uniform vec3 uApex;          // where the cone starts (the window)
uniform vec3 uDir;           // its axis (the sun's travel)
uniform float uTan;          // tan of the half-angle
uniform float uR0;           // radius at the apex (the window's size)
uniform float uLen;          // how far it reaches
uniform vec3 uColor;         // scattered light (HDR)
uniform float uDensity, uG, uTime, uSeed, uBars;
in vec2 vUv;
out vec4 fragColor;

float hash(vec3 p) { p = fract(p * 0.1031); p += dot(p, p.zyx + 31.32); return fract((p.x + p.y) * p.z); }
float vnoise(vec3 p) {
  vec3 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
  float n = mix(mix(mix(hash(i), hash(i + vec3(1,0,0)), f.x), mix(hash(i + vec3(0,1,0)), hash(i + vec3(1,1,0)), f.x), f.y),
                mix(mix(hash(i + vec3(0,0,1)), hash(i + vec3(1,0,1)), f.x), mix(hash(i + vec3(0,1,1)), hash(i + vec3(1,1,1)), f.x), f.y), f.z);
  return n;
}
float fbm(vec3 p) { return vnoise(p) * 0.55 + vnoise(p * 2.07) * 0.28 + vnoise(p * 4.3) * 0.17; }
float hg(float c, float g) { float g2 = g * g; return (1.0 - g2) / (4.0 * 3.14159265 * pow(1.0 + g2 - 2.0 * g * c, 1.5)); }

// inside the cone? → soft membership 0…1, and the cross-section coordinate for the window bars
float cone(vec3 p, out vec2 cs) {
  vec3 v = p - uApex;
  float a = dot(v, uDir);
  if (a < 0.0 || a > uLen) { cs = vec2(0.0); return 0.0; }
  vec3 radial = v - uDir * a;
  float R = uR0 + a * uTan;
  float r = length(radial);
  vec3 side = normalize(cross(uDir, vec3(0.0, 1.0, 0.0)));
  vec3 up = cross(side, uDir);
  cs = vec2(dot(radial, side), dot(radial, up)) / R;
  return smoothstep(1.0, 0.82, r / R) * smoothstep(0.0, 0.08, a / uLen) * smoothstep(1.0, 0.7, a / uLen);
}

void main() {
  vec3 scene = texture(tScene, vUv).rgb;
  vec4 vp = uInvProj * vec4(vUv * 2.0 - 1.0, 1.0, 1.0);
  vec3 dv = normalize(vp.xyz / vp.w);
  vec3 rd = normalize((uCamWorld * vec4(dv, 0.0)).xyz);
  float zn = texture(tDepth, vUv).r * 2.0 - 1.0;
  float viewZ = 2.0 * uNear * uFar / ((uFar + uNear) - zn * (uFar - uNear));
  float tEnd = min(viewZ / max(1e-4, -dv.z), 4.0);
  const int N = 48;
  float dt = tEnd / float(N);
  float t = dt * hash(vec3(gl_FragCoord.xy, uSeed));
  float ph = hg(dot(rd, uDir), uG) * 12.566;
  vec3 L = vec3(0.0);
  for (int i = 0; i < N; i++) {
    vec3 p = uCamPos + rd * t;
    vec2 cs;
    float m = cone(p, cs);
    if (m > 0.0) {
      float d = uDensity * (0.55 + 0.9 * fbm(p * 38.0 + vec3(uTime * 0.05, uTime * 0.02, 0.0)));
      // the window's mullions: two soft dark bars across the shaft
      float bars = 1.0 - uBars * (1.0 - smoothstep(0.03, 0.07, abs(cs.x - 0.08))) - uBars * 0.7 * (1.0 - smoothstep(0.02, 0.05, abs(cs.y + 0.25)));
      L += uColor * ph * d * m * max(bars, 0.0) * dt;
    }
    t += dt;
  }
  fragColor = vec4(scene + L, 1.0);
}
`;

export function createBeam(o = {}) {
  const u = (v) => ({ value: v });
  const uniforms = {
    tScene: u(null), tDepth: u(null), uInvProj: u(new THREE.Matrix4()), uCamWorld: u(new THREE.Matrix4()), uCamPos: u(new THREE.Vector3()),
    uNear: u(0.01), uFar: u(10),
    uApex: u(o.apex ?? new THREE.Vector3()), uDir: u((o.dir ?? new THREE.Vector3(0, -1, 0)).clone().normalize()),
    uTan: u(o.tan ?? 0.08), uR0: u(o.r0 ?? 0.06), uLen: u(o.len ?? 1.5),
    uColor: u(new THREE.Color(o.color ?? '#ffd9a8').multiplyScalar(o.power ?? 1)), uDensity: u(o.density ?? 1.2), uG: u(o.g ?? 0.6),
    uTime: u(0), uSeed: u(0), uBars: u(o.bars ?? 0.5),
  };
  const material = new THREE.ShaderMaterial({ glslVersion: THREE.GLSL3, vertexShader: QUAD_VERT, fragmentShader: FRAG, uniforms, depthTest: false, depthWrite: false });
  const scene = new THREE.Scene();
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material);
  mesh.frustumCulled = false;
  scene.add(mesh);
  const quadCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  return {
    uniforms,
    composite(r, color, depth, camera, out, sub) {
      uniforms.tScene.value = color; uniforms.tDepth.value = depth;
      uniforms.uInvProj.value.copy(camera.projectionMatrixInverse);
      uniforms.uCamWorld.value.copy(camera.matrixWorld);
      uniforms.uCamPos.value.setFromMatrixPosition(camera.matrixWorld);
      uniforms.uNear.value = camera.near; uniforms.uFar.value = camera.far;
      uniforms.uSeed.value = (sub?.k ?? 0) * 3.91 + 0.7;
      r.setRenderTarget(out);
      r.render(scene, quadCam);
      return out.texture;
    },
  };
}
