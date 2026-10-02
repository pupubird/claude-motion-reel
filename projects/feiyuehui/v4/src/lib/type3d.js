// Physical type: glyph outlines (tools/glyphs.py → data/glyphs.json, Noto Serif SC) extruded with a bevel into real
// geometry, one mesh per character so each can move, catch the light and cast its own shadow. Units: em (1 = the
// font's em square); a shot scales the group to metres. Holes are found by containment, not by winding order alone.
import * as THREE from 'three';

let GLYPHS = null;
export async function loadGlyphs() {
  if (!GLYPHS) GLYPHS = await (await fetch(new URL('../../data/glyphs.json', import.meta.url))).json();
  return GLYPHS;
}

function contours(cmds, seg = 10) {
  const out = [];
  let cur = null, x = 0, y = 0;
  const push = (px, py) => cur.push(new THREE.Vector2(px, py));
  for (const c of cmds) {
    const op = c[0];
    if (op === 'M') { cur = []; out.push(cur); x = c[1]; y = c[2]; push(x, y); }
    else if (op === 'L') { x = c[1]; y = c[2]; push(x, y); }
    else if (op === 'Q') {
      const [cx, cy, ex, ey] = c.slice(1);
      for (let i = 1; i <= seg; i++) { const t = i / seg, a = (1 - t) * (1 - t), b = 2 * (1 - t) * t, d = t * t; push(a * x + b * cx + d * ex, a * y + b * cy + d * ey); }
      x = ex; y = ey;
    } else if (op === 'C') {
      const [c1x, c1y, c2x, c2y, ex, ey] = c.slice(1);
      for (let i = 1; i <= seg; i++) {
        const t = i / seg, u = 1 - t;
        push(u * u * u * x + 3 * u * u * t * c1x + 3 * u * t * t * c2x + t * t * t * ex, u * u * u * y + 3 * u * u * t * c1y + 3 * u * t * t * c2y + t * t * t * ey);
      }
      x = ex; y = ey;
    }
  }
  // drop a closing duplicate point
  for (const c of out) if (c.length > 2 && c[0].distanceTo(c[c.length - 1]) < 1e-6) c.pop();
  return out.filter((c) => c.length >= 3);
}

const area = (pts) => { let a = 0; for (let i = 0; i < pts.length; i++) { const p = pts[i], q = pts[(i + 1) % pts.length]; a += p.x * q.y - q.x * p.y; } return a / 2; };
function inside(pt, poly) {
  let c = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const a = poly[i], b = poly[j];
    if ((a.y > pt.y) !== (b.y > pt.y) && pt.x < ((b.x - a.x) * (pt.y - a.y)) / (b.y - a.y) + a.x) c = !c;
  }
  return c;
}

// glyph → THREE.Shape[] (outer contours with their holes)
export function glyphShapes(g, seg = 10) {
  const cs = contours(g.cmds, seg).map((pts) => ({ pts, a: area(pts) }));
  if (!cs.length) return [];
  const big = cs.reduce((m, c) => (Math.abs(c.a) > Math.abs(m.a) ? c : m));
  const outerSign = Math.sign(big.a);
  const outers = cs.filter((c) => Math.sign(c.a) === outerSign);
  const holes = cs.filter((c) => Math.sign(c.a) !== outerSign);
  const shapes = outers.map((o) => {
    const pts = outerSign < 0 ? o.pts.slice().reverse() : o.pts;      // THREE.Shape wants CCW outers
    return { o, shape: new THREE.Shape(pts) };
  });
  for (const h of holes) {
    // the smallest outer that contains the hole
    let best = null;
    for (const s of shapes) if (inside(h.pts[0], s.o.pts) && (!best || Math.abs(s.o.a) < Math.abs(best.o.a))) best = s;
    if (!best) continue;
    const pts = outerSign < 0 ? h.pts : h.pts.slice().reverse();
    best.shape.holes.push(new THREE.Path(pts));
  }
  return shapes.map((s) => s.shape);
}

// A line of type: { group, chars: [{ mesh, ch, x, adv }] }. Opts: font key, depth, bevel, tracking (em), material.
export function buildLine(text, { font = 'serif600', depth = 0.12, bevel = 0.018, bevelSegs = 4, tracking = 0.08, seg = 10,
  material, align = 'center' } = {}) {
  if (!GLYPHS) throw new Error('type3d: await loadGlyphs() first');
  const set = GLYPHS[font];
  const group = new THREE.Group();
  const chars = [];
  let x = 0;
  for (const ch of text) {
    if (ch === ' ') { x += 0.4; continue; }
    const g = set[ch];
    if (!g) throw new Error(`type3d: no glyph "${ch}" in ${font} (add it with tools/glyphs.py)`);
    const geo = new THREE.ExtrudeGeometry(glyphShapes(g, seg), {
      depth, bevelEnabled: bevel > 0, bevelThickness: bevel, bevelSize: bevel * 0.7, bevelOffset: -bevel * 0.35, bevelSegments: bevelSegs,
      curveSegments: seg,
    });
    geo.computeBoundingBox();
    // pivot each character at its own centre (x by advance, y by the em box, z through the slab)
    const cx = g.adv / 2, cy = 0.38, cz = depth / 2;
    geo.translate(-cx, -cy, -cz);
    geo.computeVertexNormals();
    const mesh = new THREE.Mesh(geo, material);
    mesh.castShadow = true; mesh.receiveShadow = true;
    const holder = new THREE.Group();        // holder = rest position; mesh animates inside it
    holder.position.set(x + cx, cy, 0);
    holder.add(mesh);
    group.add(holder);
    chars.push({ mesh, holder, ch, x: x + cx, adv: g.adv });
    x += g.adv + tracking;
  }
  const width = x - tracking;
  const off = align === 'center' ? -width / 2 : align === 'right' ? -width : 0;
  for (const c of chars) { c.holder.position.x += off; c.x += off; }
  return { group, chars, width };
}
