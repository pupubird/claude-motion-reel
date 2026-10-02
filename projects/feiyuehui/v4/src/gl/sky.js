// The sky every outdoor shot stands in: a big inverted sphere whose colour is a function of the view direction —
// a dawn gradient about an "up" (the world's, or the camera's while a shot pretends), a glow on the sun, and high
// wisps of cirrus lit warm near the sun. It writes depth, so the bokeh treats it as infinitely far.
import * as THREE from 'three';

const VERT = /* glsl */ `
varying vec3 vWorld;
void main() {
  vec4 w = modelMatrix * vec4(position, 1.0);
  vWorld = w.xyz;
  gl_Position = projectionMatrix * viewMatrix * w;
}
`;
const FRAG = /* glsl */ `
uniform vec3 uTop, uMid, uLow, uGlowColor, uCirrusColor;
uniform vec3 uSunDir;
uniform float uGlowSize, uGlowPower, uHorizon, uSpread, uGain, uCirrus, uTime;
uniform float uSunDisc;      // HDR radiance of the sun's disc (0 = no disc: dawn before the sun is up)
uniform float uSunRadius;    // its angular radius (rad)
uniform vec3 uUp;
varying vec3 vWorld;
float hash(vec3 p) { p = fract(p * 0.1031); p += dot(p, p.zyx + 31.32); return fract((p.x + p.y) * p.z); }
float h2(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float n2(vec2 p) { vec2 i = floor(p), f = fract(p); vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(h2(i), h2(i + vec2(1, 0)), u.x), mix(h2(i + vec2(0, 1)), h2(i + vec2(1, 1)), u.x), u.y); }
float fbm(vec2 p) { float s = 0.0, a = 0.5; for (int i = 0; i < 6; i++) { s += a * n2(p); p = p * 2.03 + vec2(1.7, 9.2); a *= 0.5; } return s; }
void main() {
  vec3 d = normalize(vWorld - cameraPosition);
  float e = dot(d, uUp) - uHorizon;
  vec3 c = e > 0.0 ? mix(uMid, uTop, smoothstep(0.0, uSpread, e)) : mix(uMid, uLow, smoothstep(0.0, uSpread * 0.6, -e));
  float s = max(dot(d, uSunDir), 0.0);
  float a = acos(clamp(dot(d, uSunDir), -1.0, 1.0));
  vec3 glow = uGlowColor * (exp(-a * a / (uGlowSize * uGlowSize)) * uGlowPower + exp(-a / (uGlowSize * 3.5)) * uGlowPower * 0.25);
  // the glow hugs the horizon more than it climbs
  glow *= mix(1.0, 0.45, smoothstep(0.0, 0.5, e));
  c += glow;
  // the disc itself, with a soft limb, sitting on the horizon (cut by it: below the horizon line it is hidden)
  if (uSunDisc > 0.0) {
    float disc = smoothstep(uSunRadius, uSunRadius * 0.82, a) * smoothstep(-0.004, 0.003, e);
    c += uGlowColor * uSunDisc * disc;
  }
  // cirrus: streaked fbm on a plane above, thinning toward the horizon, warm where the sun is
  if (uCirrus > 0.0 && e > 0.0) {
    vec3 side = normalize(cross(uUp, vec3(0.0, 0.0, 1.0) + uUp.zxy * 0.01));
    vec3 fwd = cross(side, uUp);
    vec2 uv = vec2(dot(d, side), dot(d, fwd)) / max(e + 0.08, 0.02);
    float n = fbm(uv * vec2(1.6, 6.0) + vec2(uTime * 0.02, 0.0));
    float wisp = smoothstep(0.52, 0.85, n) * smoothstep(0.0, 0.12, e) * (1.0 - smoothstep(0.35, 0.9, e));
    vec3 cc = mix(uCirrusColor, uGlowColor * 1.2, pow(s, 6.0));
    c = mix(c, cc, wisp * uCirrus);
  }
  c *= uGain;
  c += (hash(vec3(gl_FragCoord.xy, 7.0)) - 0.5) / 512.0;   // de-band before tone mapping
  gl_FragColor = vec4(c, 1.0);
}
`;

const lin = (hex) => new THREE.Color(hex);

export function createSky({ radius = 6, top = '#c9ccdc', mid = '#f2e6da', low = '#e9ddd0', glow = '#fff1dc', glowSize = 0.12,
  glowPower = 1.2, horizon = 0, spread = 0.35, gain = 1, cirrus = 0, cirrusColor = '#fff6ee' } = {}) {
  const material = new THREE.ShaderMaterial({
    vertexShader: VERT, fragmentShader: FRAG, side: THREE.BackSide, depthWrite: true,
    uniforms: {
      uTop: { value: lin(top) }, uMid: { value: lin(mid) }, uLow: { value: lin(low) }, uGlowColor: { value: lin(glow) },
      uCirrusColor: { value: lin(cirrusColor) }, uSunDir: { value: new THREE.Vector3(0, 0.2, -1).normalize() },
      uGlowSize: { value: glowSize }, uGlowPower: { value: glowPower }, uHorizon: { value: horizon }, uSpread: { value: spread },
      uGain: { value: gain }, uCirrus: { value: cirrus }, uTime: { value: 0 }, uUp: { value: new THREE.Vector3(0, 1, 0) },
      uSunDisc: { value: 0 }, uSunRadius: { value: 0.0125 },
    },
  });
  const mesh = new THREE.Mesh(new THREE.SphereGeometry(radius, 96, 48), material);
  mesh.frustumCulled = false;
  mesh.renderOrder = -10;
  return { mesh, material, u: material.uniforms };
}
