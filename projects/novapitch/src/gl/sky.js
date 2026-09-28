// The dark: the page navy with a faint domain-warped nebula in the brand's cobalt, cyan and orchid (the site hero
// is a hue-rotated galaxy under a navy overlay), plus a star dome. The dome follows the camera (no parallax);
// parallax comes from the decks.
import * as THREE from 'three';
import { rng } from '../util.js';

const NEB_VERT = /* glsl */ `
varying vec3 vDir;
void main() { vDir = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); gl_Position.z = gl_Position.w; }
`;
const NEB_FRAG = /* glsl */ `
precision highp float;
uniform float uNebula, uTime, uLift;
uniform vec3 uKey;
varying vec3 vDir;
float hash3(vec3 p) { p = fract(p * 0.3183099 + 0.1); p *= 17.0; return fract(p.x * p.y * p.z * (p.x + p.y + p.z)); }
float noise3(vec3 x) {
  vec3 i = floor(x), f = fract(x); f = f * f * (3.0 - 2.0 * f);
  return mix(mix(mix(hash3(i), hash3(i + vec3(1,0,0)), f.x), mix(hash3(i + vec3(0,1,0)), hash3(i + vec3(1,1,0)), f.x), f.y),
             mix(mix(hash3(i + vec3(0,0,1)), hash3(i + vec3(1,0,1)), f.x), mix(hash3(i + vec3(0,1,1)), hash3(i + vec3(1,1,1)), f.x), f.y), f.z);
}
float fbm(vec3 p) { float a = 0.5, s = 0.0; for (int i = 0; i < 6; i++) { s += a * noise3(p); p = p * 2.02 + 7.1; a *= 0.5; } return s; }
void main() {
  vec3 d = normalize(vDir);
  vec3 q = d * 2.2;
  vec3 w = vec3(fbm(q + 1.3), fbm(q + 8.1), fbm(q + 4.7));
  float n = fbm(q * 1.6 + w * 2.4 + vec3(0.0, 0.0, uTime * 0.005));
  float band = smoothstep(0.1, 1.0, dot(d, uKey) * 0.5 + 0.5);
  float cloud = pow(smoothstep(0.35, 0.95, n), 2.2) * (0.25 + 0.75 * band);
  vec3 cobalt = vec3(0.012, 0.035, 0.16), cyan = vec3(0.0, 0.07, 0.11), orchid = vec3(0.07, 0.03, 0.11);
  vec3 col = mix(cobalt, cyan, smoothstep(0.4, 0.8, w.x)) + orchid * smoothstep(0.55, 0.9, w.y) * 0.6;
  vec3 page = vec3(0.0003, 0.0006, 0.0024);   // #010208 in linear light
  gl_FragColor = vec4(page * (1.0 + uLift) + col * cloud * uNebula, 1.0);
}
`;

const STAR_VERT = /* glsl */ `
attribute float aSize, aSeed;
uniform float uTime, uStars;
varying float vA;
void main() {
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  gl_Position = projectionMatrix * mv;
  gl_Position.z = gl_Position.w * 0.99999;
  float tw = 0.75 + 0.25 * sin(uTime * (1.3 + aSeed * 2.7) + aSeed * 40.0);
  vA = tw * uStars * (0.35 + aSeed * 0.65);
  gl_PointSize = aSize;
}
`;
const STAR_FRAG = /* glsl */ `
precision highp float;
varying float vA;
void main() {
  vec2 p = gl_PointCoord - 0.5;
  float a = exp(-dot(p, p) * 18.0) * vA;
  gl_FragColor = vec4(vec3(0.75, 0.85, 1.0) * a, 1.0);
}
`;

export class Sky {
  constructor() {
    const u = (v) => ({ value: v });
    this.uniforms = { uNebula: u(0.5), uTime: u(0), uLift: u(0), uKey: u(new THREE.Vector3(0.6, 0.45, -0.66).normalize()), uStars: u(1) };
    this.dome = new THREE.Mesh(new THREE.SphereGeometry(50000, 64, 32), new THREE.ShaderMaterial({
      vertexShader: NEB_VERT, fragmentShader: NEB_FRAG, uniforms: this.uniforms, side: THREE.BackSide, depthWrite: false,
    }));
    const R = rng(31337), N = 4200;
    const pos = new Float32Array(N * 3), size = new Float32Array(N), seed = new Float32Array(N);
    for (let i = 0; i < N; i++) {
      const z = R() * 2 - 1, a = R() * Math.PI * 2, r = Math.sqrt(1 - z * z);
      pos.set([Math.cos(a) * r * 45000, z * 45000, Math.sin(a) * r * 45000], i * 3);
      const big = R();
      size[i] = big > 0.985 ? 3.6 + R() * 2 : 1.4 + R() * 1.6;
      seed[i] = R();
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    g.setAttribute('aSize', new THREE.BufferAttribute(size, 1));
    g.setAttribute('aSeed', new THREE.BufferAttribute(seed, 1));
    this.stars = new THREE.Points(g, new THREE.ShaderMaterial({
      vertexShader: STAR_VERT, fragmentShader: STAR_FRAG, uniforms: this.uniforms, transparent: true, depthWrite: false,
      blending: THREE.AdditiveBlending,
    }));
    this.group = new THREE.Group();
    this.group.add(this.dome, this.stars);
    this.dome.renderOrder = -10;
    this.stars.renderOrder = -9;
    this.dome.frustumCulled = this.stars.frustumCulled = false;
  }
  follow(camera) { this.group.position.copy(camera.position); }
}
