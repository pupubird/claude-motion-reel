// The nova: a screen-space flare at a world point — white-hot core, anamorphic streak, four-point rays and an
// expanding shock ring. HDR output (values » 1) so bloom and the tone curve shape it; additive.
import * as THREE from 'three';

const VERT = /* glsl */ `
uniform vec3 uC;
uniform vec2 uRes;
uniform float uSizePx;
varying vec2 vPx;
void main() {
  vec4 c = projectionMatrix * viewMatrix * vec4(uC, 1.0);
  vec2 off = position.xy * uSizePx;
  vPx = off;
  c.xy += off / uRes * 2.0 * c.w;
  gl_Position = c;
}
`;

const FRAG = /* glsl */ `
precision highp float;
uniform float uCore, uStreak, uRays, uRing, uRingR, uRingW, uSizePx, uCoreR;
uniform vec3 uTintA, uTintB;
varying vec2 vPx;
void main() {
  float r = length(vPx);
  float core = exp(-pow(r / uCoreR, 2.0)) * 6.0 + exp(-r / (uCoreR * 2.5)) * 1.2;
  float streak = exp(-pow(vPx.x / (uSizePx * 0.2), 2.0) - pow(vPx.y / (uCoreR * 0.14), 2.0));
  float ang = atan(vPx.y, vPx.x);
  float rays = pow(abs(cos(ang * 2.0)), 180.0) * exp(-r / (uSizePx * 0.12)) + pow(abs(cos(ang * 2.0 + 0.7854)), 260.0) * exp(-r / (uSizePx * 0.07)) * 0.5;
  // shockwave: a soft band, cobalt on the inside edge, cyan on the outside, thinning as it grows
  float x = (r - uRingR) / uRingW;
  float ring = exp(-x * x);
  vec3 ringC = mix(uTintA, uTintB, smoothstep(-1.2, 1.2, x)) * 1.4 + vec3(0.25) * exp(-x * x * 4.0);
  vec3 col = vec3(1.0, 0.97, 0.95) * core * uCore
           + mix(uTintA, vec3(0.8, 0.9, 1.0), 0.35) * streak * uStreak * 3.0
           + vec3(0.85, 0.92, 1.0) * rays * uRays * 2.0
           + ringC * ring * uRing;
  float edge = 1.0 - smoothstep(0.85, 1.0, max(abs(vPx.x), abs(vPx.y)) / uSizePx);
  gl_FragColor = vec4(col * edge, 1.0);
}
`;

export class Flare {
  constructor() {
    const u = (v) => ({ value: v });
    this.uniforms = {
      uC: u(new THREE.Vector3()), uRes: u(new THREE.Vector2(1920, 1080)), uSizePx: u(1400), uCoreR: u(30),
      uCore: u(0), uStreak: u(0), uRays: u(0), uRing: u(0), uRingR: u(0), uRingW: u(6),
      uTintA: u(new THREE.Color('#5C8DFF').convertSRGBToLinear()), uTintB: u(new THREE.Color('#34D3EB').convertSRGBToLinear()),
    };
    this.mesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), new THREE.ShaderMaterial({
      vertexShader: VERT, fragmentShader: FRAG, uniforms: this.uniforms, transparent: true, depthWrite: false, depthTest: false,
      blending: THREE.AdditiveBlending,
    }));
    this.mesh.frustumCulled = false;
    this.mesh.renderOrder = 10;
  }
  set(p) {
    const U = this.uniforms;
    U.uC.value.copy(p.pos);
    for (const [k, n] of [['size', 'uSizePx'], ['coreR', 'uCoreR'], ['core', 'uCore'], ['streak', 'uStreak'], ['rays', 'uRays'],
      ['ring', 'uRing'], ['ringR', 'uRingR'], ['ringW', 'uRingW']]) if (p[k] !== undefined) U[n].value = p[k];
    this.mesh.visible = (p.core || 0) + (p.streak || 0) + (p.ring || 0) + (p.rays || 0) > 0.001;
  }
}
