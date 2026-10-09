// Type in 3D (v2; CRAZY.md, then the Apple pass): Inter Display SemiBold's outlines — the film's one headline face
// (v2type.js) — extruded into objects with a crisp, small bevel, one mesh per letter, so a word can slam in, scatter
// with a shattering pane, or assemble out of the air. Finishes taken from Apple's own product language:
//   titanium   satin metal that mirrors a soft studio (no glare, no glow: it stays legible as it turns)
//   lightGlass glass filled with the film's gradient of light, the gradient running continuously across the whole
//              word (vertex colours from each vertex's place in the word), never one colour per letter
//   satin      white ceramic, for words over a busy ground
// The outlines are the fonts' own (opentype.js), kerned as the font kerns, tracked as apple.com tracks its headlines.
import * as THREE from 'three';
import { parse } from '/node_modules/opentype.js/dist/opentype.module.js';
import { trackFor, LIGHT } from '../v2type.js';

const asset = (f) => new URL(`../../assets/fonts/${f}`, import.meta.url).href;
const FILES = {
  display500: asset('InterDisplay-Medium.ttf'),
  display600: asset('InterDisplay-SemiBold.ttf'),
  display700: asset('InterDisplay-Bold.ttf'),
};
const FONT = {};
export async function loadFonts3D() {
  await Promise.all(Object.entries(FILES).map(async ([k, url]) => {
    const r = await fetch(url);
    if (!r.ok) throw new Error(`text3d: ${url} ${r.status}`);
    FONT[k] = parse(await r.arrayBuffer());
  }));
}

// a glyph's outline → THREE shapes (font units scaled to `size`, y up)
const SHAPES = new Map();
function glyphShapes(font, key, glyph, size) {
  const k = `${key}|${glyph.index}|${size}`;
  if (SHAPES.has(k)) return SHAPES.get(k);
  const path = glyph.getPath(0, 0, size);
  const sp = new THREE.ShapePath();
  for (const c of path.commands) {
    if (c.type === 'M') sp.moveTo(c.x, -c.y);
    else if (c.type === 'L') sp.lineTo(c.x, -c.y);
    else if (c.type === 'C') sp.bezierCurveTo(c.x1, -c.y1, c.x2, -c.y2, c.x, -c.y);
    else if (c.type === 'Q') sp.quadraticCurveTo(c.x1, -c.y1, c.x, -c.y);
  }
  const shapes = sp.toShapes(true);
  SHAPES.set(k, shapes);
  return shapes;
}

// lay out a line: each glyph's x (kerning + tracking in em), the line's advance width
export function layout(str, { font = 'display600', size = 1, tracking = -0.02 } = {}) {
  const f = FONT[font];
  if (!f) throw new Error(`text3d: font ${font} not loaded (loadFonts3D)`);
  const glyphs = f.stringToGlyphs(str);
  const k = size / f.unitsPerEm;
  let x = 0;
  const out = glyphs.map((g, i) => {
    const at = x;
    x += g.advanceWidth * k + tracking * size;
    if (i < glyphs.length - 1) x += f.getKerningValue(g, glyphs[i + 1]) * k;
    return { g, x: at, adv: g.advanceWidth * k, ch: str[i] };
  });
  return { font: f, glyphs: out, width: x - tracking * size, capH: (f.tables.os2?.sCapHeight ?? 0.73 * f.unitsPerEm) * k };
}

// → { group, letters: [{ mesh, home, ch, w, h }], width, capH }. The group's origin is the line's centre (x) on its
// baseline (y); each letter mesh is centred on its own ink so it turns about itself, `home` its rest position.
//   seenPx: the size (px) the word is seen at on the frame, for its tracking (apple.com's curve: tighter as it grows)
//   gradient: stops for the light finish, run across the whole word (vertex colours)
export function text3d(str, { font = 'display600', size = 1, depth = 0.11, bevel = 0.007, seenPx = 160, tracking = null, material, materials = null,
  gradient = null, curve = 10 } = {}) {
  const tr = tracking ?? trackFor(seenPx);
  const L = layout(str, { font, size, tracking: tr });
  const group = new THREE.Group();
  const letters = [];
  const grad = gradient ? gradient.map((c) => new THREE.Color(c)) : null;
  const colAt = (u) => {
    const f = Math.min(0.9999, Math.max(0, u)) * (grad.length - 1), i = Math.floor(f);
    return grad[i].clone().lerp(grad[i + 1], f - i);
  };
  L.glyphs.forEach((q, gi) => {
    if (q.ch === ' ') return;
    const shapes = glyphShapes(L.font, font, q.g, size);
    if (!shapes.length) return;
    const geo = new THREE.ExtrudeGeometry(shapes, { depth: depth * size, bevelEnabled: true, bevelThickness: bevel * size, bevelSize: bevel * size * 0.8,
      bevelSegments: 3, curveSegments: curve });
    geo.computeBoundingBox();
    const bb = geo.boundingBox, c = new THREE.Vector3();
    bb.getCenter(c);
    if (grad) {
      const pos = geo.attributes.position, cols = new Float32Array(pos.count * 3);
      for (let i = 0; i < pos.count; i++) colAt((q.x + pos.getX(i)) / L.width).toArray(cols, i * 3);
      geo.setAttribute('color', new THREE.BufferAttribute(cols, 3));
    }
    geo.translate(-c.x, -c.y, -c.z);
    const mesh = new THREE.Mesh(geo, materials ? materials[gi % materials.length] : material);
    const home = new THREE.Vector3(q.x + c.x - L.width / 2, c.y, 0);
    mesh.position.copy(home);
    group.add(mesh);
    letters.push({ mesh, home, ch: q.ch, i: letters.length, w: bb.max.x - bb.min.x, h: bb.max.y - bb.min.y });
  });
  return { group, letters, width: L.width, capH: L.capH };
}

// ── finishes ───────────────────────────────────────────────────────────────────────────────────────────────────────
export const titanium = (envMap, { tint = '#E4E6EB', rough = 0.3, env = 1.05 } = {}) => new THREE.MeshPhysicalMaterial({
  color: new THREE.Color(tint), metalness: 1, roughness: rough, envMap, envMapIntensity: env, clearcoat: 0.2, clearcoatRoughness: 0.2,
});
export function lightGlass(envMap, { glow = 0.95, env = 0.75 } = {}) {
  const m = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(0.3, 0.3, 0.3), vertexColors: true, metalness: 0, roughness: 0.14, emissive: new THREE.Color(1, 1, 1), emissiveIntensity: glow,
    envMap, envMapIntensity: env, clearcoat: 1, clearcoatRoughness: 0.05,
  });
  m.onBeforeCompile = (sh) => {
    sh.fragmentShader = sh.fragmentShader.replace('vec3 totalEmissiveRadiance = emissive;', 'vec3 totalEmissiveRadiance = emissive * vColor.rgb;');
  };
  return m;
}
export const satin = (envMap, { tint = '#F5F5F7', env = 0.7, glow = 0.8 } = {}) => new THREE.MeshPhysicalMaterial({
  color: new THREE.Color(tint), metalness: 0, roughness: 0.34, envMap, envMapIntensity: env, clearcoat: 1, clearcoatRoughness: 0.08,
  emissive: new THREE.Color(tint), emissiveIntensity: glow,
});
// (the first pass's finishes, kept for the labs and the pane)
export const chrome = (envMap, o = {}) => titanium(envMap, { rough: 0.12, ...o });
export const gloss = (envMap, { tint = '#FFFFFF', env = 0.8 } = {}) => satin(envMap, { tint, env, glow: 0.85 });
export const glassMat = (envMap, { tint = '#FFFFFF', thickness = 0.35, rough = 0.03, env = 1.2, attenuate = 0.9 } = {}) => new THREE.MeshPhysicalMaterial({
  color: new THREE.Color('#FFFFFF'), metalness: 0, roughness: rough, transmission: 1, thickness, ior: 1.5, envMap, envMapIntensity: env,
  attenuationColor: new THREE.Color(tint), attenuationDistance: attenuate, specularIntensity: 1, clearcoat: 1, clearcoatRoughness: 0.03,
});
export const lightMat = (envMap, color, { glow = 1.15, env = 0.9 } = {}) => new THREE.MeshPhysicalMaterial({
  color: new THREE.Color(color).multiplyScalar(0.25), metalness: 0, roughness: 0.08, emissive: new THREE.Color(color), emissiveIntensity: glow,
  envMap, envMapIntensity: env, clearcoat: 1, clearcoatRoughness: 0.04,
});
export { LIGHT };

// ── a studio to mirror: a room with softboxes and strips, prefiltered once (PMREM) ─────────────────────────────────
// 'night': a black room, a big key, two soft tinted strips; 'day': a pale room, a big white key. card: a tall soft card
// behind the lens, bright at its top (what a face turned to us mirrors: satin metal's gradient). No hard strips: they
// blew letters out.
export function studioEnv(renderer, mood = 'night', { card = true } = {}) {
  const scene = new THREE.Scene();
  const night = mood === 'night';
  scene.add(new THREE.Mesh(new THREE.SphereGeometry(30, 32, 16), new THREE.MeshBasicMaterial({ color: night ? 0x030409 : 0xd8dae2, side: THREE.BackSide })));
  const panel = (w, h, pos, col, k) => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: new THREE.Color(col).multiplyScalar(k), side: THREE.DoubleSide }));
    m.position.set(...pos); m.lookAt(0, 0, 0); scene.add(m);
  };
  if (card) panel(10, 6, [-7, 9, 8], '#FFFFFF', night ? 5 : 4.5);
  else panel(4, 6, [-11, 8, 4], '#FFFFFF', night ? 4.5 : 4);
  panel(1.4, 18, [11, 1, 3], night ? '#A9C2FF' : '#EEF2FF', night ? 3.2 : 2.6);
  panel(1.4, 18, [-11, 0, -4], night ? '#FFB3D6' : '#FFF2EA', night ? 2.6 : 2.2);
  panel(24, 4, [0, -10, 2], '#FFFFFF', night ? 0.45 : 1.4);
  if (card) for (let i = 0; i < 7; i++) panel(22, 1.9, [0, 9 - i * 1.8, 16], '#FFFFFF', (night ? 0.62 : 1.0) * (1 - i / 7.5));
  const pm = new THREE.PMREMGenerator(renderer);
  const tex = pm.fromScene(scene, 0.02).texture;
  pm.dispose();
  return tex;
}
