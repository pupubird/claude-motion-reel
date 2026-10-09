// The bubble: a soap film rendered with real thin-film interference, or a glass orb holding a person's colours.
//   soap  — transparent; colour comes only from the film: Airy reflectance of a water film in air, integrated over
//           16 wavelengths through the CIE 1931 observer (Wyman–Sloan–Shirley 2013 fits) → linear sRGB, multiplied
//           by a procedural photo studio (key window, strip light, sky gradient). Film thickness drains under
//           gravity (thin and gold at the top, banded magenta/green below) and swirls with 3D noise.
//   fill  — the same film over an interior of up to three colours swirling like ink in water (a person's
//           priorities), denser toward the rim, with a soft inner glow.
// Premultiplied output: reflection adds, the film's opacity (fill) or its reflectance (soap) covers what's behind.
import * as THREE from 'three';
import { FILM_GLSL } from './filmglsl.js';



const VERT = /* glsl */ `
uniform float uTime, uWobble, uSquash;
uniform vec3 uSquashDir;
varying vec3 vObj, vWorld, vNormal;
${FILM_GLSL}
void main() {
  vec3 p = position;
  vec3 n = normalize(normal);
  // soft-body wobble: low-frequency noise along the normal, plus a volume-preserving squash along uSquashDir
  float w = snoise(p * 1.3 + vec3(0.0, uTime * 0.9, uTime * 0.4)) * uWobble;
  p += n * w;
  float along = dot(p, uSquashDir);
  p += uSquashDir * along * uSquash - (p - uSquashDir * along) * uSquash * 0.5;
  vObj = position;
  vec4 wp = modelMatrix * vec4(p, 1.0);
  vWorld = wp.xyz;
  vNormal = normalize(mat3(modelMatrix) * n);
  gl_Position = projectionMatrix * viewMatrix * wp;
}`;

const FRAG = /* glsl */ `
uniform float uTime, uThick, uSwirl, uFill, uAlpha, uEnvGain, uPop, uSeed, uGlow;
uniform float uHaze, uRimGain, uEdge;
uniform vec3 uC1, uC2, uC3, uPopAt, uKeyDir, uEdgeCol;
uniform float uNumColors;
uniform vec4 uClip;             // xyz: the neighbour's centre (world), w: its radius (0 = off)
varying vec3 vObj, vWorld, vNormal;
${FILM_GLSL}

// A procedural photo studio for reflections: bright sky above, warm floor bounce, one big soft key window and a
// strip light on the far side. Luminance above 1 is fine: the film only reflects a few percent of it.
float softRect(vec2 p, vec2 c, vec2 h, float r) { vec2 q = abs(p - c) - h; return 1.0 - smoothstep(-r, r, length(max(q, 0.0)) + min(max(q.x, q.y), 0.0)); }
vec3 studio(vec3 r) {
  // a soft room: pale sky above, a darker horizon band and floor below (structure for the film to colour)
  vec3 sky = mix(vec3(1.0, 0.95, 0.92), vec3(0.88, 0.93, 1.0), smoothstep(-0.1, 0.9, r.y));
  vec3 c = sky * 0.55;
  c = mix(c, vec3(0.32, 0.27, 0.36), smoothstep(0.05, -0.25, r.y) * 0.85);
  c = mix(c, vec3(0.6, 0.5, 0.52), smoothstep(-0.25, -0.9, r.y) * 0.5);
  // key window: up-left, in front of the bubble (the viewer's side), with mullions
  vec3 k = normalize(uKeyDir);
  vec3 kx = normalize(cross(k, vec3(0.0, 1.0, 0.0))), ky = cross(kx, k);
  float dk = dot(r, k);
  if (dk > 0.0) {
    vec2 pk = vec2(dot(r, kx), dot(r, ky)) / dk;
    // a softbox, not a window: a four-pane cross in the highlight read as a certain OS logo on the bigger bubbles
    float win = softRect(pk, vec2(0.0), vec2(0.36, 0.24), 0.06);
    c += vec3(1.0, 0.98, 0.95) * 5.0 * win * (0.8 + 0.2 * smoothstep(0.3, 0.0, length(pk)));
  }
  // strip light: right, behind
  vec3 s = normalize(vec3(0.85, 0.15, -0.5));
  vec3 sx = normalize(cross(s, vec3(0.0, 1.0, 0.0))), sy = cross(sx, s);
  float ds = dot(r, s);
  if (ds > 0.0) { vec2 ps = vec2(dot(r, sx), dot(r, sy)) / ds; c += vec3(0.9, 0.95, 1.0) * 3.0 * softRect(ps, vec2(0.0), vec2(0.05, 0.5), 0.03); }
  return c;
}

void main() {
  vec3 N = normalize(vNormal);
  vec3 V = normalize(cameraPosition - vWorld);
  if (uClip.w > 0.0 && length(vWorld - uClip.xyz) < uClip.w) discard;
  bool back = !gl_FrontFacing;
  if (back) N = -N;
  float ci = clamp(abs(dot(N, V)), 0.0, 1.0);

  // pop: the film tears open from uPopAt and the hole races round the sphere; the film bunches into a thicker,
  // brighter rim at the tear (as a real film retracts into a rim before it sprays droplets)
  float tearRim = 0.0;
  if (uPop > 0.0) {
    float ang = acos(clamp(dot(normalize(vObj), normalize(uPopAt)), -1.0, 1.0)) / 3.14159265;
    float ragged = 0.035 * snoise(vObj * 4.0 + uSeed) + 0.008 * snoise(vObj * 14.0 - uSeed);
    float front = uPop * 1.18 + ragged;
    if (ang < front) discard;
    tearRim = 1.0 - smoothstep(0.0, 0.022, ang - front);
    tearRim *= tearRim;
  }

  // film thickness (nm): drains toward the top, swirls
  vec3 q = vObj * 1.6 + vec3(uSeed);
  vec3 flow = vec3(0.0, -uTime * 0.12, 0.0);
  float sw = fbm(q + flow + uSwirl * vec3(sin(uTime * 0.3), 0.0, cos(uTime * 0.27)));
  float drain = mix(0.45, 1.35, 0.5 - 0.5 * normalize(vObj).y);
  float d = uThick * drain + 260.0 * sw;
  d = max(d, 20.0);
  vec3 film = filmRGB(d, ci);

  vec3 R = reflect(-V, N);
  vec3 refl = film * studio(R) * uEnvGain;

  // interior colours (fill mode): three inks swirling, denser at the rim like a lit marble
  vec3 inside = vec3(0.0);
  float cover = 0.0;
  if (uFill > 0.0 && !back) {
    // a smooth three-colour gradient orb: two slow, low-frequency fields blend the inks (no blotches), lit from the
    // key side with a luminous core, deeper toward the rim like coloured glass
    vec3 p = normalize(vObj);
    float a = 0.5 + 0.5 * snoise(p * 0.75 + vec3(uSeed, uTime * 0.18, 0.0));
    float b = 0.5 + 0.5 * snoise(p * 0.65 + vec3(-uSeed * 1.3, 2.0, uTime * 0.15));
    float grad = 0.5 + 0.5 * dot(p, normalize(vec3(-0.6, 0.8, 0.2)));
    vec3 col = uC1;
    if (uNumColors > 1.5) col = okMix(uC1, uC2, smoothstep(0.25, 0.75, mix(a, 1.0 - grad, 0.55)));
    if (uNumColors > 2.5) col = okMix(col, uC3, smoothstep(0.45, 0.85, mix(b, grad, 0.35)) * 0.9);
    float rim = pow(1.0 - ci, 2.0);
    float key = 0.5 + 0.5 * dot(N, normalize(uKeyDir));
    vec3 lit = col * mix(0.82, 1.08, key) + uGlow * 0.35 * (1.0 - rim) * mix(col, vec3(1.0), 0.5);
    inside = okMix(lit, col * 0.72, rim * 0.6);
    cover = uFill;
  }

  // transmission loss through the film: the rim reads (light-theme bubbles need an edge)
  float Ravg = dot(film, vec3(0.2126, 0.7152, 0.0722));
  float edge = pow(1.0 - ci, 3.0) * 0.18;
  float a = clamp(cover + (1.0 - cover) * (Ravg * 0.35 + edge), 0.0, 1.0);
  vec3 col = inside * cover + refl * (back ? 0.45 : 1.0);
  // the bunched rim: thicker film, more reflectance, a bright iridescent lip
  col += tearRim * (filmRGB(d * 1.6 + 120.0, ci) * 1.6 + vec3(0.9, 0.92, 1.0));
  a = max(a, tearRim * 0.35);
  // a clear bubble on a pale sky needs body: a milky haze that thickens toward the rim, the film's colour pushed into
  // the rim (as the 2D bubbles draw it) and a crisp silhouette line. All 0 by default.
  if (uHaze + uRimGain + uEdge > 0.0) {
    float rimH = pow(1.0 - ci, 1.7);
    float h = uHaze * mix(0.12, 1.0, rimH) * (back ? 0.35 : 1.0);
    col += vec3(1.0) * h; a += h * (1.0 - a);
    float rr = uRimGain * pow(1.0 - ci, 2.4) * (back ? 0.3 : 1.0);
    vec3 fr = filmRGB(d * 1.25 + 90.0, ci);
    // the rim's film colour, saturated and laid OVER the sky (coverage, not light): added light on a white sky is white
    float lum = dot(fr, vec3(0.2126, 0.7152, 0.0722));
    vec3 sat = clamp(lum + (fr - lum) * 2.4, 0.0, 1.6) * 0.62;
    float cover = clamp(rr * 0.42, 0.0, 0.75);
    col = col * (1.0 - cover) + sat * cover; a += cover * (1.0 - a);
    float e = uEdge * smoothstep(0.3, 0.05, ci) * (back ? 0.0 : 1.0);
    col = col * (1.0 - e) + uEdgeCol * e; a = a * (1.0 - e) + e;
  }
  gl_FragColor = vec4(col * uAlpha, a * uAlpha);
}`;

// → a ShaderMaterial for one wall of a bubble (see bubbleMesh for the two-pass draw)
export function bubbleMaterial({ fill = 0, colors = ['#FF7A59', '#3D7BFF', '#2BB673'], thick = 380, seed = 0, glow = 0.4 } = {}) {
  const c = colors.map((h) => new THREE.Color(h).convertSRGBToLinear());
  while (c.length < 3) c.push(c[c.length - 1].clone());
  return new THREE.ShaderMaterial({
    vertexShader: VERT, fragmentShader: FRAG,
    uniforms: {
      uTime: { value: 0 }, uThick: { value: thick }, uSwirl: { value: 1 }, uFill: { value: fill }, uAlpha: { value: 1 },
      uEnvGain: { value: 1 }, uPop: { value: 0 }, uSeed: { value: seed }, uGlow: { value: glow },
      uC1: { value: c[0] }, uC2: { value: c[1] }, uC3: { value: c[2] }, uNumColors: { value: colors.length },
      uPopAt: { value: new THREE.Vector3(0.3, 0.6, 1) }, uKeyDir: { value: new THREE.Vector3(-0.55, 0.6, 0.6) },
      uWobble: { value: 0.02 }, uSquash: { value: 0 }, uSquashDir: { value: new THREE.Vector3(0, 1, 0) },
      uClip: { value: new THREE.Vector4(0, 0, 0, 0) },
      uHaze: { value: 0 }, uRimGain: { value: 0 }, uEdge: { value: 0 }, uEdgeCol: { value: new THREE.Color(0.47, 0.51, 0.78) },
    },
    transparent: true, depthWrite: false,
    blending: THREE.CustomBlending, blendSrc: THREE.OneFactor, blendDst: THREE.OneMinusSrcAlphaFactor,
    blendSrcAlpha: THREE.OneFactor, blendDstAlpha: THREE.OneMinusSrcAlphaFactor,
  });
}

// → a Group: the far wall of the film (back faces) drawn first, then the near wall, sharing one set of uniforms.
// Transparent double-sided meshes in one pass draw in triangle order and the far wall can cover the near one.
export function bubbleMesh(opt = {}) {
  const geo = new THREE.SphereGeometry(1, 128, 96);
  const front = bubbleMaterial(opt);
  const backMat = front.clone();
  backMat.uniforms = front.uniforms;
  backMat.side = THREE.BackSide;
  front.side = THREE.FrontSide;
  const g = new THREE.Group();
  const b = new THREE.Mesh(geo, backMat); b.renderOrder = 0;
  const f = new THREE.Mesh(geo, front); f.renderOrder = 1;
  g.add(b, f);
  g.uniforms = front.uniforms;
  return g;
}

// The shared wall of a double bubble: a flat soap film (equal radii → a flat wall) on the plane between the two
// centres, as a disc of the film shader. Plateau's laws put the films at 120°, which for equal radii means the centres
// sit one radius apart and the wall's radius is r·√3/2.
export function wallMesh(opt = {}) {
  const m = bubbleMaterial({ thick: 360, ...opt });
  m.side = THREE.DoubleSide;
  const mesh = new THREE.Mesh(new THREE.CircleGeometry(1, 128), m);
  mesh.uniforms = m.uniforms;
  return mesh;
}
