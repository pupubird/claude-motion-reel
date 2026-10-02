// The client's lockup as solid gold: the phoenix mark and the 翡月荟 wordmark (the vector traces in
// shared/assets/derived, made from the client's lockup) extruded with a bevel, and the tagline 你｜的｜翡｜翠｜管｜家
// set in Noto Serif SC like the lockup's. Layout follows derived/logo.json exactly (lockup 211 × 102 units: mark
// x 0–56, wordmark x 79–211 / y 13–64, tagline x 84–187 / y 80–91); 1 unit = 1 mm here, y up, the group centred.
import * as THREE from 'three';
import { SVGLoader } from 'three/addons/loaders/SVGLoader.js';
import { buildLine } from './type3d.js';

const DERIVED = new URL('../../../shared/assets/derived/', import.meta.url).href;
const MM = 0.001;

async function svgShapes(file) {
  const data = await new SVGLoader().loadAsync(DERIVED + file);
  const shapes = [];
  for (const p of data.paths) shapes.push(...SVGLoader.createShapes(p));
  return shapes;
}

function boundsOf(shapes) {
  const b = new THREE.Box2();
  for (const s of shapes) for (const p of s.getPoints(4)) b.expandByPoint(p);
  return b;
}

// fit shapes (SVG units, y down) into a lockup box (mm, y up): returns a geometry builder
function fitted(shapes, box, { depth, bevel, curveSegments = 10 }) {
  const b = boundsOf(shapes);
  const s = (box.y1 - box.y0) / (b.max.y - b.min.y);
  const geo = new THREE.ExtrudeGeometry(shapes, {
    depth: depth / s, bevelEnabled: true, bevelThickness: bevel / s, bevelSize: (bevel * 0.6) / s, bevelOffset: -(bevel * 0.3) / s,
    bevelSegments: 4, curveSegments,
  });
  // SVG y runs down: flip, scale to mm, and put the ink box where the lockup wants it
  // y and z both flip (= a half turn about x): SVG's y-down becomes y-up and the winding stays front-facing
  geo.translate(-b.min.x, -b.min.y, 0);
  geo.scale(s, -s, -s);
  geo.translate(box.x0, box.y1, depth / 2);
  geo.computeVertexNormals();
  return geo;
}

// split a set of shapes into n characters by the gaps in their x extents
function splitByX(shapes, n) {
  const items = shapes.map((sh) => { const b = boundsOf([sh]); return { sh, x0: b.min.x, x1: b.max.x, cx: (b.min.x + b.max.x) / 2 }; });
  items.sort((a, b) => a.cx - b.cx);
  // gaps between successive spans (sorted by start), widest n−1 are the character boundaries
  const bySpan = items.slice().sort((a, b) => a.x0 - b.x0);
  let reach = -Infinity;
  const gaps = [];
  for (const it of bySpan) { if (it.x0 > reach && reach > -Infinity) gaps.push({ at: (it.x0 + reach) / 2, w: it.x0 - reach }); reach = Math.max(reach, it.x1); }
  const cuts = gaps.sort((a, b) => b.w - a.w).slice(0, n - 1).map((g) => g.at).sort((a, b) => a - b);
  const groups = Array.from({ length: n }, () => []);
  for (const it of items) groups[cuts.filter((c) => it.cx > c).length].push(it.sh);
  return groups;
}

// LOCKUP units (logo.json), y measured from the top in the source; here y up from the lockup's bottom
const H = 102;
const box = (x0, y0top, x1, y1top) => ({ x0, x1, y0: H - y1top, y1: H - y0top });

export async function buildLockup({ gold, goldTag = gold } = {}) {
  const group = new THREE.Group();
  const [markShapes, wordShapes] = await Promise.all([svgShapes('mark.svg'), svgShapes('wordmark.svg')]);
  // the mark: deepest, a strong bevel to catch the light
  const markGeo = fitted(markShapes, box(0, 1, 56, 101), { depth: 7, bevel: 1.3 });
  const mark = new THREE.Mesh(markGeo, gold);
  // the wordmark, character by character (each pivots on its own centre so it can fly in)
  const wb = boundsOf(wordShapes);
  const wbox = box(79, 13, 211, 64);
  const s = (wbox.y1 - wbox.y0) / (wb.max.y - wb.min.y);
  const chars = splitByX(wordShapes, 3).map((shs) => {
    const geo = new THREE.ExtrudeGeometry(shs, { depth: 5 / s, bevelEnabled: true, bevelThickness: 0.9 / s, bevelSize: 0.5 / s, bevelOffset: -0.25 / s, bevelSegments: 4, curveSegments: 10 });
    geo.translate(-wb.min.x, -wb.min.y, 0);
    geo.scale(s, -s, -s);
    geo.translate(wbox.x0, wbox.y1, 2.5);
    geo.computeBoundingBox();
    const c = geo.boundingBox.getCenter(new THREE.Vector3());
    geo.translate(-c.x, -c.y, -c.z);
    geo.computeVertexNormals();
    const m = new THREE.Mesh(geo, gold);
    const holder = new THREE.Group();
    holder.position.copy(c);
    holder.add(m);
    return { mesh: m, holder, rest: c.clone() };
  });
  // the tagline: six characters with thin bars between them, across x 84 … 187, cap height ≈ 11
  const tag = buildLine('你的翡翠管家', { material: goldTag, depth: 0.06, bevel: 0.012, tracking: 0.62, align: 'left' });
  const tagH = 11 / 0.92;           // em so that the glyphs (≈ 0.92 em tall) are 11 units
  tag.group.scale.setScalar(tagH);
  const tagW = tag.width * tagH;
  tag.group.position.set(84 + (103 - tagW) / 2 - 0.0, H - 91 + 0.4, 0);
  const bars = [];
  for (let i = 0; i < 5; i++) {
    const a = tag.chars[i], b = tag.chars[i + 1];
    const x = ((a.x + a.adv / 2 + b.x - b.adv / 2) / 2) * tagH + tag.group.position.x;
    const bar = new THREE.Mesh(new THREE.BoxGeometry(0.45, 9.5, 0.5), goldTag);
    bar.position.set(x, H - 85.5, 0);
    bars.push(bar);
  }
  group.add(mark, ...chars.map((c) => c.holder), tag.group, ...bars);
  // centre the lockup on its origin, in mm → metres
  const inner = new THREE.Group();
  inner.add(group);
  group.position.set(-211 / 2, -H / 2, 0);
  inner.scale.setScalar(MM);
  for (const o of [mark, ...chars.map((c) => c.mesh), ...tag.chars.map((c) => c.mesh), ...bars]) { o.castShadow = true; o.receiveShadow = true; }
  return { group: inner, mark, chars, tag, bars, size: [211 * MM, H * MM] };
}
