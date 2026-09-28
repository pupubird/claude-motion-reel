// The line: a camera-facing ribbon along a 3D path, a constant width in pixels whatever the depth, drawn
// between a tail and a head (arc-length fractions). A white-hot core in a cobalt→cyan glow, a comet head, and up
// to four pulses travelling along it (messages). Additive, depth-tested so the orb occludes it.
import * as THREE from 'three';

const VERT = /* glsl */ `
attribute vec3 aPrev, aNext;
attribute float aU, aSide;
uniform vec2 uRes;
uniform float uWidth;
varying float vU, vSide, vDepth;
void main() {
  vec4 c = projectionMatrix * viewMatrix * vec4(position, 1.0);
  vec4 cp = projectionMatrix * viewMatrix * vec4(aPrev, 1.0);
  vec4 cn = projectionMatrix * viewMatrix * vec4(aNext, 1.0);
  vec2 s = c.xy / c.w, sp = cp.xy / cp.w, sn = cn.xy / cn.w;
  vec2 d = normalize(((sn - sp) * uRes) + vec2(1e-6, 0.0));
  vec2 n = vec2(-d.y, d.x);
  c.xy += n * aSide * uWidth / uRes * c.w;
  gl_Position = c;
  vU = aU;
  vSide = aSide;
  vDepth = c.w;
}
`;

const FRAG = /* glsl */ `
precision highp float;
uniform float uHead, uTail, uCore, uWidth, uBright, uFadeLen, uHeadGlow, uLen;
uniform vec3 uColA, uColB;
uniform vec4 uPulse;
varying float vU, vSide, vDepth;
void main() {
  if (vU > uHead || vU < uTail) discard;
  float px = abs(vSide) * uWidth;                 // distance from the centre line in pixels
  float core = exp(-pow(px / uCore, 2.0));
  float glow = exp(-px / (uWidth * 0.22));
  float along = smoothstep(uTail, uTail + uFadeLen, vU);
  float head = exp(-(uHead - vU) * uLen / 90.0);  // brightest at the head (comet)
  float pul = 0.0;
  for (int i = 0; i < 4; i++) { float p = uPulse[i]; if (p > -0.5) pul += exp(-pow((vU - p) * uLen / 70.0, 2.0)); }
  vec3 tint = mix(uColA, uColB, clamp(vU * 1.3 - 0.15, 0.0, 1.0));
  vec3 col = (vec3(1.0) * core * (1.4 + 3.0 * head + 2.5 * pul) + tint * glow * (0.55 + uHeadGlow * head + 1.2 * pul)) * along * uBright;
  gl_FragColor = vec4(col, 1.0);
}
`;

export class Ribbon {
  constructor(maxPts = 700) {
    this.max = maxPts;
    const n = maxPts * 2;
    const g = new THREE.BufferGeometry();
    this.aPos = new THREE.BufferAttribute(new Float32Array(n * 3), 3);
    this.aPrev = new THREE.BufferAttribute(new Float32Array(n * 3), 3);
    this.aNext = new THREE.BufferAttribute(new Float32Array(n * 3), 3);
    this.aU = new THREE.BufferAttribute(new Float32Array(n), 1);
    const side = new Float32Array(n);
    for (let i = 0; i < maxPts; i++) { side[i * 2] = -1; side[i * 2 + 1] = 1; }
    const idx = [];
    for (let i = 0; i < maxPts - 1; i++) { const a = i * 2; idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2); }
    g.setIndex(idx);
    g.setAttribute('position', this.aPos);
    g.setAttribute('aPrev', this.aPrev);
    g.setAttribute('aNext', this.aNext);
    g.setAttribute('aU', this.aU);
    g.setAttribute('aSide', new THREE.BufferAttribute(side, 1));
    const u = (v) => ({ value: v });
    this.uniforms = {
      uRes: u(new THREE.Vector2(1920, 1080)), uWidth: u(26), uCore: u(1.6), uHead: u(1), uTail: u(0), uBright: u(1),
      uFadeLen: u(0.25), uHeadGlow: u(1.5), uLen: u(1000), uColA: u(new THREE.Color('#2E6BFF').convertSRGBToLinear()),
      uColB: u(new THREE.Color('#22C5EB').convertSRGBToLinear()), uPulse: u(new THREE.Vector4(-1, -1, -1, -1)),
    };
    this.mesh = new THREE.Mesh(g, new THREE.ShaderMaterial({
      vertexShader: VERT, fragmentShader: FRAG, uniforms: this.uniforms, transparent: true, depthWrite: false,
      blending: THREE.AdditiveBlending, side: THREE.DoubleSide,
    }));
    this.mesh.frustumCulled = false;
    this.count = 0;
  }

  // Resample `pts` (Vector3[]) to evenly spaced points along arc length.
  setPath(pts) {
    const cum = [0];
    for (let i = 1; i < pts.length; i++) cum.push(cum[i - 1] + pts[i].distanceTo(pts[i - 1]));
    const L = cum[cum.length - 1] || 1;
    const n = Math.min(this.max, Math.max(2, pts.length));
    const P = this.aPos.array, Pp = this.aPrev.array, Pn = this.aNext.array, U = this.aU.array;
    const at = (s) => {
      let k = 1;
      while (k < cum.length - 1 && cum[k] < s) k++;
      const f = (s - cum[k - 1]) / Math.max(1e-6, cum[k] - cum[k - 1]);
      return pts[k - 1].clone().lerp(pts[k], Math.min(1, Math.max(0, f)));
    };
    const res = [];
    for (let i = 0; i < n; i++) res.push(at((i / (n - 1)) * L));
    for (let i = 0; i < this.max; i++) {
      const j = Math.min(i, n - 1);
      const p = res[j], pp = res[Math.max(0, j - 1)], pn = res[Math.min(n - 1, j + 1)];
      for (const s of [0, 1]) {
        const o = (i * 2 + s) * 3;
        P[o] = p.x; P[o + 1] = p.y; P[o + 2] = p.z;
        Pp[o] = pp.x; Pp[o + 1] = pp.y; Pp[o + 2] = pp.z;
        Pn[o] = pn.x; Pn[o + 1] = pn.y; Pn[o + 2] = pn.z;
        U[i * 2 + s] = j / (n - 1);
      }
    }
    this.aPos.needsUpdate = this.aPrev.needsUpdate = this.aNext.needsUpdate = this.aU.needsUpdate = true;
    this.mesh.geometry.setDrawRange(0, (n - 1) * 6);
    this.uniforms.uLen.value = L;
    this.length = L;
    this.points = res;
    return this;
  }

  // Point on the resampled path at arc fraction u.
  pointAt(u) {
    const r = this.points, n = r.length;
    const x = Math.min(n - 1, Math.max(0, u * (n - 1)));
    const k = Math.floor(x), f = x - k;
    return r[k].clone().lerp(r[Math.min(n - 1, k + 1)], f);
  }

  set({ head = 1, tail = 0, width, core, bright, fadeLen, pulses, visible = true } = {}) {
    const U = this.uniforms;
    U.uHead.value = head; U.uTail.value = tail;
    if (width !== undefined) U.uWidth.value = width;
    if (core !== undefined) U.uCore.value = core;
    if (bright !== undefined) U.uBright.value = bright;
    if (fadeLen !== undefined) U.uFadeLen.value = fadeLen;
    const p = pulses || [];
    U.uPulse.value.set(p[0] ?? -1, p[1] ?? -1, p[2] ?? -1, p[3] ?? -1);
    this.mesh.visible = visible && head > tail;
  }
}

// Catmull–Rom through control points → dense polyline.
export function spline(ctrl, per = 40) {
  const c = new THREE.CatmullRomCurve3(ctrl, false, 'centripetal');
  return c.getPoints(Math.max(2, (ctrl.length - 1) * per));
}
