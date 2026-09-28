// Nova, the product's orb (relatefy ROrb / orb-video.mp4) rebuilt as an analytic shader: a sphere holding two
// liquid phases — a milky ice-white phase and a saturated cobalt-violet phase — split by a wavy interface that
// reads as the thin dark meniscus line. Ray-traced per pixel on a camera-facing quad, so it is exact at any size,
// writes true sphere depth, and every quality (slosh, waves, voice, heat, clarity) is a uniform on the timeline.
import * as THREE from 'three';

const COMMON = /* glsl */ `
vec3 lin(vec3 c) { return pow(c, vec3(2.2)); }
float hash3(vec3 p) { p = fract(p * 0.3183099 + 0.1); p *= 17.0; return fract(p.x * p.y * p.z * (p.x + p.y + p.z)); }
float noise3(vec3 x) {
  vec3 i = floor(x), f = fract(x); f = f * f * (3.0 - 2.0 * f);
  return mix(mix(mix(hash3(i), hash3(i + vec3(1,0,0)), f.x), mix(hash3(i + vec3(0,1,0)), hash3(i + vec3(1,1,0)), f.x), f.y),
             mix(mix(hash3(i + vec3(0,0,1)), hash3(i + vec3(1,0,1)), f.x), mix(hash3(i + vec3(0,1,1)), hash3(i + vec3(1,1,1)), f.x), f.y), f.z);
}
float fbm3(vec3 p) { float a = 0.5, s = 0.0; for (int i = 0; i < 4; i++) { s += a * noise3(p); p = p * 2.03 + 11.7; a *= 0.5; } return s; }
`;

const VERT = /* glsl */ `
uniform vec3 uC;
uniform float uSize;
varying vec3 vWorld;
void main() {
  // camera-facing quad around the orb centre
  vec3 right = vec3(viewMatrix[0][0], viewMatrix[1][0], viewMatrix[2][0]);
  vec3 up = vec3(viewMatrix[0][1], viewMatrix[1][1], viewMatrix[2][1]);
  vWorld = uC + (right * position.x + up * position.y) * uSize;
  gl_Position = projectionMatrix * viewMatrix * vec4(vWorld, 1.0);
}
`;

const BODY_FRAG = /* glsl */ `
precision highp float;
uniform vec3 uC;
uniform float uR, uTime, uLevel, uWave, uSpeak, uBright, uClear, uHeat, uHasBack, uFade, uViolet, uLine;
uniform vec3 uN;
uniform mat4 uProj;
uniform sampler2D tBack;
uniform vec2 uRes;
varying vec3 vWorld;
${COMMON}

// the interface: a plane through the (offset) centre, rippled by two travelling waves and the voice
float field(vec3 p) {
  vec3 n = uN;
  vec3 u = normalize(cross(n, abs(n.y) < 0.9 ? vec3(0,1,0) : vec3(1,0,0)));
  vec3 v = cross(n, u);
  float a = uWave * (1.0 + 1.8 * uSpeak);
  float w = a * sin(dot(p, u) * 3.1 + uTime * 1.9) + a * 0.55 * sin(dot(p, v) * 4.3 - uTime * 2.6 + 1.3)
          + uSpeak * 0.035 * sin(dot(p, u) * 11.0 - uTime * 14.0);
  return dot(p, n) - uLevel - w;
}
vec3 gradF(vec3 p) {
  float e = 0.004;
  return vec3(field(p + vec3(e,0,0)) - field(p - vec3(e,0,0)), field(p + vec3(0,e,0)) - field(p - vec3(0,e,0)),
              field(p + vec3(0,0,e)) - field(p - vec3(0,0,e))) / (2.0 * e);
}

void main() {
  vec3 ro = cameraPosition;
  vec3 rd = normalize(vWorld - ro);
  vec3 oc = ro - uC;
  float b = dot(oc, rd), c = dot(oc, oc) - uR * uR, h = b * b - c;
  if (h < 0.0) discard;
  h = sqrt(h);
  float t1 = -b - h, t2 = -b + h;
  if (t2 < 0.0) discard;
  vec3 P1 = ro + rd * max(t1, 0.0), P2 = ro + rd * t2;
  vec3 N1 = normalize(P1 - uC);
  float cosT = clamp(dot(-rd, N1), 0.0, 1.0);
  float rim = 1.0 - cosT;
  // analytic anti-aliasing of the silhouette: distance of the ray from the centre, in pixels
  float dmin = length(cross(rd, uC - ro));
  float edgePx = (uR - dmin) / max(fwidth(dmin), 1e-5);
  float cover = clamp(edgePx + 0.5, 0.0, 1.0);

  // march the chord: phase fraction, interface crossings seen edge-on
  vec3 a1 = (P1 - uC) / uR, a2 = (P2 - uC) / uR;
  float deep = 0.0, band = 0.0;
  float fPrev = field(a1);
  const int STEPS = 18;
  for (int i = 1; i <= STEPS; i++) {
    vec3 p = mix(a1, a2, float(i) / float(STEPS));
    float f = field(p);
    deep += smoothstep(0.03, -0.03, f);
    if (sign(f) != sign(fPrev)) {
      vec3 pc = mix(a1, a2, (float(i) - f / (f - fPrev + 1e-6) * 1.0) / float(STEPS));
      vec3 g = normalize(gradF(pc));
      float graze = 1.0 - abs(dot(rd, g));
      band = max(band, smoothstep(0.86, 0.985, graze));
    }
    fPrev = f;
  }
  deep /= float(STEPS);
  float fFront = field(a1);
  float frontDeep = smoothstep(0.02, -0.02, fFront);
  deep = mix(deep, frontDeep, 0.45);
  // contact line of the interface on the front shell (and faintly on the back)
  float wPx = fwidth(fFront) + 1e-5;
  float contact = 1.0 - smoothstep(uLine, uLine + 1.5 * wPx, abs(fFront));
  float contactBack = (1.0 - smoothstep(0.012, 0.03, abs(field(a2)))) * 0.35;
  band = max(band, max(contact, contactBack));

  // phase colours, sampled from orb-video.mp4: the dense liquid glows from its core (ice or violet, drifting) and
  // saturates to pure cobalt toward the silhouette; the milky phase stays white until the very edge.
  vec3 ice = lin(vec3(0.686, 0.863, 0.976)), iceHi = lin(vec3(0.90, 0.965, 1.0)), violet = lin(vec3(0.459, 0.0, 0.98));
  vec3 electric = lin(vec3(0.149, 0.18, 0.92)), cobalt = lin(vec3(0.0, 0.0, 0.83)), milk = lin(vec3(0.988, 0.969, 0.973));
  vec3 milkRim = lin(vec3(0.463, 0.675, 0.894)), men = lin(vec3(0.06, 0.06, 0.55));
  vec3 mid = (a1 + a2) * 0.5;
  float sw = fbm3(mid * 1.7 + vec3(0.0, uTime * 0.16, uTime * 0.09));
  float sw2 = fbm3(mid * 2.9 - vec3(uTime * 0.12, 0.0, 0.0));
  vec3 core = mix(mix(iceHi, ice, 0.5 + 0.5 * sw2), violet, smoothstep(0.42, 0.72, sw) * uViolet);
  core = mix(core, electric, smoothstep(0.55, 0.85, sw2) * 0.5);
  float glowK = smoothstep(0.62, 1.0, cosT) * 0.85 + pow(cosT, 9.0) * 0.15;
  vec3 dcol = mix(cobalt, core, glowK);
  dcol = mix(dcol, electric, (1.0 - glowK) * (0.35 + 0.4 * smoothstep(0.35, 0.6, sw)));
  dcol = mix(dcol, violet * 0.9, (1.0 - glowK) * smoothstep(0.5, 0.75, sw) * uViolet * 0.7);
  vec3 pale = mix(milk, milkRim, smoothstep(0.35, 0.85, rim));
  pale = mix(pale, cobalt, smoothstep(0.78, 1.0, rim) * 0.85);
  vec3 body = mix(pale, dcol, deep);
  // clarity: the milky phase clears so what is behind the orb shows through, refracted (and inverted, like glass)
  if (uHasBack > 0.5 && uClear > 0.001) {
    vec2 suv = gl_FragCoord.xy / uRes;
    vec3 refr = refract(rd, N1, 1.0 / 1.45);
    vec2 off = (refr.xy - rd.xy) * 0.35 * uR / max(length(uC - ro), 1.0) * 60.0;
    vec3 back = texture2D(tBack, suv + off).rgb;
    vec3 flipped = texture2D(tBack, suv - (suv - vec2(0.5)) * 0.0 + (N1.xy * -0.18 * cosT) * uR / max(length(uC - ro), 1.0) * 6.0).rgb;
    vec3 seen = mix(back, flipped, 0.5) * mix(vec3(1.0), lin(vec3(0.82, 0.92, 1.0)), 0.6);
    body = mix(body, seen + body * 0.12, uClear * (1.0 - deep) * smoothstep(1.0, 0.35, rim));
  }
  body = mix(body, men, band * 0.95);
  // a lit lip right above the meniscus
  body += lin(vec3(0.8, 0.95, 1.0)) * contact * 0.0;

  // glass: Fresnel, a soft key, a cyan kicker, iridescent fringe
  vec3 refl = reflect(rd, N1);
  float F = 0.04 + 0.96 * pow(rim, 5.0);
  vec3 L1 = normalize(vec3(-0.55, 0.75, 0.45)), L2 = normalize(vec3(0.85, 0.05, -0.2));
  float spec = pow(max(dot(refl, L1), 0.0), 90.0) * 1.6 + pow(max(dot(refl, L1), 0.0), 14.0) * 0.08;
  float kick = pow(max(dot(refl, L2), 0.0), 10.0);
  vec3 env = lin(vec3(0.05, 0.08, 0.22)) + lin(vec3(0.55, 0.9, 1.0)) * kick * 0.5;
  vec3 col = mix(body, env, F * 0.35) + vec3(spec);
  vec3 film = 0.5 + 0.5 * cos(6.2831 * (vec3(0.0, 0.33, 0.67) + rim * 1.6 + 0.15));
  col += lin(film) * pow(rim, 4.0) * 0.28;

  // voice + heat: the phases glow brighter while it speaks; heat pushes it to a white-hot star
  col *= uBright * (1.0 + 0.35 * uSpeak);
  col = mix(col, vec3(2.2, 2.5, 3.2), uHeat);
  col *= 1.0 - uFade;

  gl_FragColor = vec4(col, cover);
  vec4 clip = uProj * viewMatrix * vec4(P1, 1.0);
  gl_FragDepth = clip.z / clip.w * 0.5 + 0.5;
}
`;

const AURA_FRAG = /* glsl */ `
precision highp float;
uniform vec3 uC;
uniform float uR, uTime, uGlow, uSpeak, uHeat, uFade;
varying vec3 vWorld;
${COMMON}
void main() {
  vec3 ro = cameraPosition;
  vec3 rd = normalize(vWorld - ro);
  vec3 toC = uC - ro;
  float along = dot(toC, rd);
  float dmin = length(cross(rd, toC));
  float x = (dmin - uR) / uR;
  // the product's orb-aura: a blurred conic of iris-300 / ocean-200 / orchid-300 / iris-400
  vec3 rightV = normalize(cross(rd, vec3(0.0, 1.0, 0.0)));
  vec3 upV = cross(rightV, rd);
  vec3 q = ro + rd * along - uC;
  float ang = atan(dot(q, upV), dot(q, rightV)) + uTime * 0.25;
  float k = 0.5 + 0.5 * sin(ang);
  float k2 = 0.5 + 0.5 * sin(ang * 2.0 + 1.7);
  vec3 c1 = lin(vec3(0.576, 0.710, 1.0)), c2 = lin(vec3(0.573, 0.922, 1.0)), c3 = lin(vec3(0.914, 0.788, 0.941)), c4 = lin(vec3(0.361, 0.553, 1.0));
  vec3 conic = mix(mix(c1, c2, k), mix(c3, c4, k2), 0.45);
  float inner = smoothstep(-0.02, 0.02, x);
  float g = exp(-max(x, 0.0) / (0.075 + 0.06 * uSpeak)) * 0.55 * inner + exp(-max(x, 0.0) / 0.32) * 0.07 * inner;
  vec3 col = conic * g * uGlow * (0.55 + 0.45 * uSpeak) + vec3(1.0, 0.97, 0.94) * exp(-max(x, 0.0) / 0.35) * uHeat * 1.1 * inner;
  gl_FragColor = vec4(col * (1.0 - uFade), 1.0);
}
`;

export class Orb {
  constructor() {
    const u = (v) => ({ value: v });
    this.uniforms = {
      uC: u(new THREE.Vector3()), uR: u(100), uSize: u(300), uTime: u(0), uN: u(new THREE.Vector3(0, 1, 0)),
      uLevel: u(-0.05), uWave: u(0.035), uViolet: u(0.8), uLine: u(0.016), uSpeak: u(0), uBright: u(1), uClear: u(0), uHeat: u(0), uGlow: u(0.9),
      uHasBack: u(0), tBack: u(null), uProj: u(new THREE.Matrix4()), uRes: u(new THREE.Vector2(1920, 1080)), uFade: u(0),
    };
    const geo = new THREE.PlaneGeometry(2, 2);
    this.body = new THREE.Mesh(geo, new THREE.ShaderMaterial({
      vertexShader: VERT, fragmentShader: BODY_FRAG, uniforms: this.uniforms, transparent: true, depthWrite: true,
      extensions: { derivatives: true },
    }));
    this.aura = new THREE.Mesh(geo, new THREE.ShaderMaterial({
      vertexShader: VERT, fragmentShader: AURA_FRAG, uniforms: this.uniforms, transparent: true, depthWrite: false,
      blending: THREE.AdditiveBlending,
    }));
    this.body.frustumCulled = this.aura.frustumCulled = false;
    this.aura.renderOrder = 1;
    this.body.renderOrder = 2;
    this.group = new THREE.Group();
    this.group.add(this.aura, this.body);
  }

  // p: { pos: Vector3, r, time, normal: Vector3, level, wave, speak, bright, clear, heat, glow, fade }
  set(p) {
    const U = this.uniforms;
    if (p.camera) U.uProj.value = p.camera.projectionMatrix;   // by reference: sees the jitter
    U.uC.value.copy(p.pos);
    U.uR.value = p.r;
    U.uSize.value = p.r * (p.auraSize ?? 3.2);
    U.uTime.value = p.time ?? 0;
    if (p.normal) U.uN.value.copy(p.normal).normalize();
    for (const [k, n] of [['level', 'uLevel'], ['wave', 'uWave'], ['speak', 'uSpeak'], ['bright', 'uBright'], ['clear', 'uClear'],
      ['heat', 'uHeat'], ['glow', 'uGlow'], ['fade', 'uFade'], ['violet', 'uViolet'], ['line', 'uLine']]) if (p[k] !== undefined) U[n].value = p[k];
    this.group.visible = (p.visible ?? true) && p.r > 0.01;
  }
}
