// Zembit materials: speckled matte clay (black and lime), and the visor — glossy black glass whose
// emission is an SDF face: two rounded-square eyes that blink, look, squash into lines or bend into
// happy arcs, and can show the Z-peak mark instead. Resolution-independent at any camera distance.
import * as THREE from 'three';
import { mark as drawMark } from '../brand.js';

const SPECKLE_GLSL = /* glsl */ `
varying vec3 vObj;
uniform float uSpeckScale, uSpeckDensity, uSpeckAmt, uSpeckGlint;
vec3 zbHash33(vec3 p) { p = fract(p * vec3(0.1031, 0.1030, 0.0973)); p += dot(p, p.yxz + 33.33); return fract((p.xxy + p.yxx) * p.zyx); }
// One jittered dot per cell (kept inside the cell, so no neighbour search), anti-aliased with fwidth.
float zbSpeck(vec3 p, out float bright) {
  vec3 q = p * uSpeckScale;
  vec3 c = floor(q), f = fract(q);
  vec3 h = zbHash33(c);
  vec3 ctr = 0.3 + 0.4 * zbHash33(c + 17.13);
  float r = mix(0.07, 0.19, h.y);
  float d = length(f - ctr);
  float aa = max(length(fwidth(q)) * 0.7, 1e-4);
  bright = h.z;
  return step(h.x, uSpeckDensity) * (1.0 - smoothstep(r - aa, r + aa, d)) * smoothstep(1.2, 0.35, aa);
}
`;

// Adds object-space speckles to a physical material. Options tune colour mix and glint.
function speckled(mat, { scale = 70, density = 0.26, amount = 0.55, glint = 0.035, lighten = true, decal = null } = {}) {
  mat.onBeforeCompile = (sh) => {
    sh.uniforms.uSpeckScale = { value: scale };
    sh.uniforms.uSpeckDensity = { value: density };
    sh.uniforms.uSpeckAmt = { value: amount };
    sh.uniforms.uSpeckGlint = { value: glint };
    if (decal) Object.assign(sh.uniforms, decal.uniforms);
    sh.vertexShader = sh.vertexShader
      .replace('#include <common>', '#include <common>\nvarying vec3 vObj;')
      .replace('#include <begin_vertex>', '#include <begin_vertex>\nvObj = position;');
    sh.fragmentShader = sh.fragmentShader
      .replace('#include <common>', `#include <common>\n${SPECKLE_GLSL}\n${decal ? decal.decl : ''}\nfloat zbS = 0.0, zbB = 0.0;`)
      .replace('#include <color_fragment>', `#include <color_fragment>
        zbS = zbSpeck(vObj, zbB);
        diffuseColor.rgb = mix(diffuseColor.rgb, ${lighten ? 'vec3(0.34 + 0.4 * zbB)' : 'diffuseColor.rgb * 0.55'}, zbS * uSpeckAmt);
        ${decal ? decal.color : ''}`)
      .replace('#include <roughnessmap_fragment>', '#include <roughnessmap_fragment>\nroughnessFactor = mix(roughnessFactor, 0.28, zbS);')
      .replace('#include <emissivemap_fragment>', `#include <emissivemap_fragment>
        totalEmissiveRadiance += vec3(uSpeckGlint * (0.4 + zbB)) * zbS;
        ${decal ? decal.emissive : ''}`);
  };
  mat.customProgramCacheKey = () => `zb-speck-${scale}-${density}-${lighten}-${decal ? 'decal' : ''}`;
  return mat;
}

const srgb = (hex) => new THREE.Color(hex);

// Charcoal clay: the reference reads black, but its lit faces sit around 25–40 % grey, so the albedo
// is a dark grey and the soft velvet edge comes from sheen.
export function clayMaterial(hex = '#2c2e2e') {
  return speckled(new THREE.MeshPhysicalMaterial({
    color: srgb(hex), roughness: 0.62, metalness: 0,
    sheen: 1, sheenColor: srgb('#5e6060'), sheenRoughness: 0.4,
    clearcoat: 0.1, clearcoatRoughness: 0.5,
  }));
}

export function limeMaterial() {
  return speckled(new THREE.MeshPhysicalMaterial({
    color: srgb('#B9C935'), roughness: 0.62, metalness: 0,
    sheen: 0.35, sheenColor: srgb('#ffffff'), sheenRoughness: 0.5,
  }), { density: 0.14, amount: 0.35, glint: 0.0, lighten: false });
}

// Texture of the mark (white on transparent), used by the chest decal and the visor.
let MARK_TEX = null;
export function markTexture() {
  if (MARK_TEX) return MARK_TEX;
  const c = document.createElement('canvas');
  c.width = c.height = 1024;
  const ctx = c.getContext('2d');
  drawMark(ctx, 512, 512, 1000, '#ffffff');
  MARK_TEX = new THREE.CanvasTexture(c);
  MARK_TEX.colorSpace = THREE.NoColorSpace;
  MARK_TEX.anisotropy = 8;
  MARK_TEX.generateMipmaps = true;
  MARK_TEX.minFilter = THREE.LinearMipmapLinearFilter;
  return MARK_TEX;
}

// Torso clay with the lime Z-peak on the chest, projected from the front.
export function torsoMaterial(center = new THREE.Vector2(0.0, 0.64), size = 0.13) {
  const decal = {
    uniforms: { tDecal: { value: markTexture() }, uDecal: { value: new THREE.Vector3(center.x, center.y, size) }, uDecalColor: { value: srgb('#B9C935') } },
    decl: 'uniform sampler2D tDecal; uniform vec3 uDecal; uniform vec3 uDecalColor; float zbD = 0.0;',
    color: `
      vec2 duv = (vObj.xy - uDecal.xy) / uDecal.z + 0.5;
      if (vObj.z > 0.0 && all(greaterThan(duv, vec2(0.0))) && all(lessThan(duv, vec2(1.0)))) zbD = texture2D(tDecal, duv).a;
      diffuseColor.rgb = mix(diffuseColor.rgb, uDecalColor, zbD);`,
    emissive: '',
  };
  return speckled(new THREE.MeshPhysicalMaterial({
    color: srgb('#2c2e2e'), roughness: 0.62, metalness: 0,
    sheen: 1, sheenColor: srgb('#5e6060'), sheenRoughness: 0.4,
    clearcoat: 0.1, clearcoatRoughness: 0.5,
  }), { decal });
}

const FACE_GLSL = /* glsl */ `
varying vec2 vVis;
uniform vec4 uEyeL, uEyeR;       // centre xy, half size wh (head-local units)
uniform vec2 uHappy;             // 0 = rounded square, 1 = happy arc (per eye)
uniform float uEyeRad, uPower, uEyeGain, uGlass;
uniform vec4 uMark;              // centre xy, half height, alpha
uniform sampler2D tMark;
uniform vec3 uLime;
float zbBox(vec2 p, vec2 b, float r) { r = min(r, min(b.x, b.y)); vec2 q = abs(p) - b + r; return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r; }
// iq's arc: circle of radius ra, half-aperture given by sc = (sin, cos), thickness rb; opens downward (∩)
float zbArc(vec2 p, vec2 sc, float ra, float rb) { p.x = abs(p.x); return ((sc.y * p.x > sc.x * p.y) ? length(p - sc * ra) : abs(length(p) - ra)) - rb; }
float zbEye(vec2 p, vec4 e, float happy) {
  vec2 q = p - e.xy;
  float box = zbBox(q, e.zw, min(uEyeRad, min(e.z, e.w)));
  float ra = e.z * 0.95;
  float arc = zbArc(q + vec2(0.0, ra * 0.55), vec2(sin(1.05), cos(1.05)), ra, 0.024);
  return mix(box, arc, happy);
}
vec3 zbFace(vec2 p) {
  float dl = zbEye(p, uEyeL, uHappy.x), dr = zbEye(p, uEyeR, uHappy.y);
  float d = min(dl, dr);
  float aa = max(fwidth(d) * 0.75, 1e-5);
  float core = 1.0 - smoothstep(-aa, aa, d);
  float glow = (1.0 - core) * exp(-max(d, 0.0) / 0.035) * uGlass;   // halo on the glass only, never inside the eye
  vec2 muv = (p - uMark.xy) / (uMark.z * 2.0) + 0.5;   // canvas textures are flipY: v = 1 is the top
  float m = 0.0;
  if (uMark.w > 0.0 && all(greaterThan(muv, vec2(0.0))) && all(lessThan(muv, vec2(1.0)))) m = texture2D(tMark, muv).a * uMark.w;
  return uLime * (max(core * min(uPower, 1.06), m) * uEyeGain + glow * 0.3 * min(uPower, 1.0));
}
`;

export function visorMaterial() {
  const U = {
    uEyeL: { value: new THREE.Vector4(-0.244, -0.169, 0.085, 0.095) },
    uEyeR: { value: new THREE.Vector4(0.244, -0.169, 0.085, 0.095) },
    uHappy: { value: new THREE.Vector2(0, 0) },
    uEyeRad: { value: 0.03 },
    uPower: { value: 1 },
    uEyeGain: { value: 1.037 },   // compensates the clearcoat's Fresnel loss so the eyes land on #EEFE5E
    uGlass: { value: 1 },
    uMark: { value: new THREE.Vector4(0, -0.18, 0.1, 0) },
    tMark: { value: markTexture() },
    uLime: { value: srgb('#EEFE5E') },
  };
  const mat = new THREE.MeshPhysicalMaterial({
    color: srgb('#040503'), roughness: 0.16, metalness: 0,
    clearcoat: 0.7, clearcoatRoughness: 0.16, envMapIntensity: 0.3,
  });
  mat.onBeforeCompile = (sh) => {
    Object.assign(sh.uniforms, U);
    sh.vertexShader = sh.vertexShader
      .replace('#include <common>', '#include <common>\nattribute vec2 visor;\nvarying vec2 vVis;')
      .replace('#include <begin_vertex>', '#include <begin_vertex>\nvVis = visor;');
    sh.fragmentShader = sh.fragmentShader
      .replace('#include <common>', `#include <common>\n${FACE_GLSL}`)
      .replace('#include <emissivemap_fragment>', '#include <emissivemap_fragment>\ntotalEmissiveRadiance += zbFace(vVis);');
  };
  mat.customProgramCacheKey = () => 'zb-visor';
  mat.userData.face = U;
  return mat;
}
