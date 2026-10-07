// VII · FOAM (58–64 s) and VIII · MARK (64–68 s).
//   foam 56.0–62.0  more and more people keep becoming your friends (owner on v3: "more and more and more growing
//                   bubble… need more profile pics"), without the crowding (owner on v4: "有点密集恐惧", a little
//                   trypophobic). v4 packed 240 faces into a foam of small cells: a cluster of small, high-contrast,
//                   repeating shapes, which is what images that trigger trypophobia share (high contrast energy at
//                   mid-range spatial frequencies: Cole & Wilkins, "Fear of holes", Psychological Science 2013).
//                   v5: the two of you kiss into a double bubble at the centre; 26 friends pop in round you on an
//                   accelerating clock (score.js GROW), each its own soap bubble with air round it — never touching,
//                   never smaller than MIN_R on screen (both checked at load: a crowded edit fails the render); at the
//                   edges they run off the frame (the crowd goes on). The camera eases back just enough to keep the
//                   newest friend in frame. "Same values. New friends." ·
//                   "Friendship is the whole point." Then everyone rushes in and the two of you become the mark.
//   mark 62.0–66.0  the mark, the name (almost / friends.ai), the line; Bub winks
import { W, H } from '../config.js';
import { C, FONTS, P, SPRING, MOVE } from '../brand.js';
import { FOAM, MARK, GROW } from '../score.js';
import { T } from '../copy.js';
import { lerp, seg, ease, spring, rng, TAU, rgba } from '../util.js';
import { drawSky } from '../world/sky.js';
import { Line, drawLine, popEach, combine, centerX } from '../type.js';
import { about } from '../ui/kit.js';
import { drawPhoto, CROWD, LEADS } from '../assets.js';
import { REVEAL } from './unlock.js';
import { sp, sr, INK_ORB, inkOf, wallBetween, bubPrim } from '../liquid2d.js';

// foam space: px at scale 1, centred on the double bubble; the frame shows it at scale s(t) about CENTER
const CENTER = [W / 2, 1150];
const RA = 130;                                   // you and the one: equal radii, centres one radius apart (flat wall)
const S_END = 0.92;                               // the camera's widest
const MIN_R = 56;                                 // the anti-crowding rules, on screen at the widest (px): the smallest
const MIN_AIR = 28;                               // face in focus, and the least air between two bubbles
const OFF = 0.45;                                 // at the frame's edges a bubble may run off it by this much of its
                                                  // radius (the crowd goes on past the edge)
// The words stand inside the crowd, not over it (owner: "we cannot just put text on top area"): friends gather above
// them, beside them and below them, and only the pocket the words need stays clear. In foam space (px at scale 1,
// round the two of you), the words sweep this box as the lens eases back (they are deeper: foamWords' parallax)
const POCKET = { x: 400, y0: -610, y1: -185 };
const WORDS_Y = [645, 775, 645, 760];             // the lines' baselines (frame px at the start): the value, the point
const MARK_C = [W / 2, 1000];                     // where mark() draws the mark at the hit
const N = GROW.n, T0 = GROW.t0, DOUBLE = GROW.double;
const born = (i, t0 = T0, d = DOUBLE) => t0 + d * Math.log2(1 + i / 2);

// The friends: a greedy Poisson-disc fill in sunflower order round the two of you (born from the inside out), every
// bubble inside the frame at the widest, clear of the words' pocket, with at least MIN_AIR between any two. A bubble
// takes the size it wants, or less where it is tight, but never less than MIN_R on screen
const FRIENDS = (() => {
  const R = rng(611);
  const placed = [{ x: -RA / 2, y: 0, r: RA }, { x: RA / 2, y: 0, r: RA }];
  const out = [];
  const xMax = (W / 2) / S_END, yMin = -CENTER[1] / S_END, yMax = (H - CENTER[1]) / S_END;
  const air = MIN_AIR / S_END, rMin = (MIN_R + 2) / S_END;
  // the distance from (x, y) to the words' pocket (negative inside it)
  const pocket = (x, y) => {
    const dx = Math.abs(x) - POCKET.x, dy = Math.max(POCKET.y0 - y, y - POCKET.y1);
    return dx > 0 || dy > 0 ? Math.hypot(Math.max(dx, 0), Math.max(dy, 0)) : Math.max(dx, dy);
  };
  for (let k = 1; out.length < N && k < 6000; k++) {
    const th = k * 2.399963 + (R() - 0.5) * 0.6, rho = 60 * Math.sqrt(k) * (1 + (R() - 0.5) * 0.2);
    const x = Math.cos(th) * rho, y = Math.sin(th) * rho;
    const want = (rho < 380 ? 104 : 86) * (0.86 + 0.28 * R());
    const room = Math.min((xMax - Math.abs(x)) / (1 - OFF), (y - yMin) / (1 - OFF), (yMax - y) / (1 - OFF), pocket(x, y) - air,
      ...placed.map((o) => Math.hypot(o.x - x, o.y - y) - o.r - air));
    if (room < rMin) continue;
    // born from the middle of the group (the two of you and the words together) outward, so the words are in the
    // crowd from its first friends
    const f = { x, y, r: Math.min(want, room), order: Math.hypot(x, y + 260) + (R() - 0.5) * 120, ph: R() * TAU };
    placed.push(f); out.push(f);
  }
  out.sort((a, b) => a.order - b.order);
  // faces: the six from v3 first (the first ring), then the 40 new, shuffled
  const deck = CROWD.slice(0, 6).concat(CROWD.slice(6).sort(() => R() - 0.5));
  out.forEach((f, i) => { f.key = deck[i % deck.length]; f.born = born(i); f.seed = i * 1.37; });
  return out;
})();
{
  const small = Math.min(...FRIENDS.map((f) => f.r * S_END));
  if (FRIENDS.length !== N || small < MIN_R) {
    throw new Error(`foam: ${FRIENDS.length} of ${N} friends placed, the smallest ${small.toFixed(0)} px on screen (MIN_R ${MIN_R}): too crowded`);
  }
}

// The camera: each friend needs the camera wide enough to hold it in frame; the camera eases back to each friend's
// need from just before its birth, so the newest friend arrives inside the frame
const S0 = REVEAL.r / RA;
const NEED = FRIENDS.map((f) => Math.min(
  (W / 2) / (Math.abs(f.x) + f.r * (1 - OFF)),
  f.y > 0 ? (H - CENTER[1]) / (f.y + f.r * (1 - OFF)) : CENTER[1] / Math.max(1, f.r * (1 - OFF) - f.y),
));
function scaleAt(t) {
  let s = S0;
  FRIENDS.forEach((f, i) => { s = Math.min(s, lerp(S0, Math.max(S_END, NEED[i]), MOVE.go(seg(t, f.born - 0.4, f.born + 0.15)))); });
  return s;
}

let same1, same2, point1, point2, nameA, nameF, tag;

export default {
  init() {
    same1 = new Line(T.foam.same[0], { s: 112, w: 780, track: -0.03 });
    same2 = new Line(T.foam.same[1], { s: 112, w: 800, track: -0.03 });
    point1 = new Line(T.foam.point[0], { s: 92, w: 700, track: -0.025 });
    point2 = new Line(T.foam.point[1], { s: 92, w: 700, track: -0.025 });
    nameA = new Line('almost', { s: 150, w: 640, track: -0.02 });
    nameF = new Line('friends.ai', { s: 150, w: 800, track: -0.035 });
    tag = new Line(T.foam.tag, { s: 50, w: 600, f: FONTS.ui, track: -0.005 });
  },
  under: [{
    start: FOAM.in - 0.6, end: MARK.end,
    // the faces sit in UNDER: each friend's soap film is liquid, drawn over them (foamLiquid)
    draw(ctx, t) { drawSky(ctx); if (t < MARK.hit + 0.05) foamUnder(ctx, t); if (t >= MARK.hit) markWords(ctx, t); },
  }],
  liquid: { start: FOAM.in - 0.6, end: MARK.end, frame: (t) => (t < MARK.hit ? foamLiquid(t) : markLiquid(t)) },
  layers: [{
    start: FOAM.in - 0.6, end: MARK.end,
    draw(ctx, t) {
      if (t < MARK.hit + 0.05) foam(ctx, t);
      if (t >= MARK.hit) mark(ctx, t);
    },
  }],
  fx(t) {
    const k = t - MARK.hit;
    return k > 0 && k < 0.5 ? { zoom: 1 + 0.035 * Math.exp(-k * 8), flash: 0.14 * Math.exp(-k * 16) } : null;
  },
};

// the foam's clocks: everyone rushes in, and the two of you become the mark
const collapseAt = (t) => seg(t, MARK.hit - 0.42, MARK.hit, MOVE.out);
const toMarkAt = (t) => seg(t, MARK.hit - 0.42, MARK.hit, MOVE.go);
// one friend at t, in frame px (null: not born yet, or gone into the mark)
function friendAt(f, t, s, collapse) {
  const p = spring(t - f.born, SPRING.wobble);
  if (p <= 0.002) return null;
  let x = CENTER[0] + f.x * s + 5 * Math.sin(t * 0.9 + f.ph), y = CENTER[1] + f.y * s + 7 * Math.sin(t * 0.7 + f.ph * 1.3);
  let r = f.r * s * p * (1 + 0.012 * Math.sin(t * 2.4 + f.ph));
  x = lerp(x, MARK_C[0], collapse); y = lerp(y, MARK_C[1], collapse); r *= 1 - collapse;
  return r < 0.6 ? null : { x, y, r };
}

// UNDER: the faces (a white disc lifting each off the sky, the photo), then the two of you
function foamUnder(ctx, t) {
  const s = scaleAt(t), collapse = collapseAt(t);
  ctx.save();
  ctx.globalAlpha *= 1 - seg(t, MARK.hit - 0.06, MARK.hit + 0.05);
  for (const f of FRIENDS) {
    const a = friendAt(f, t, s, collapse);
    if (a) friend(ctx, f.key, a.x, a.y, a.r);
  }
  if (t >= FOAM.in) pair(ctx, t, s, toMarkAt(t));
  ctx.restore();
  foamWords(ctx, t);
}

// → the liquid for the foam: a soap film round every friend; the two of you as one double bubble (a real shared
// wall) that floods with the brand's blue and coral as everyone rushes in
const FILM = { type: 'sphere', glass: 0, thick: 420, haze: 0.04, rim: 1.7, edge: 0.45, env: 1.15, frost: 0.9, wobble: 0.01 };
// the brand's mark in liquid: the inks at full strength under a clear glossy skin (no milk, no glow, a thin rim)
const MARK_ORB = { ...INK_ORB, fill: 1, glow: 0, haze: 0, rim: 0.15, edge: 0.25, env: 0.7, tintAmt: 0.85 };   // a crisp silhouette
export const MARK_INK = [[C.blue, '#2A5BFF', '#1A45D8'], [P.family.color, '#FF8A66', '#FF6A4C']];
function foamLiquid(t) {
  const s = scaleAt(t), collapse = collapseAt(t), toMark = toMarkAt(t);
  const prims = [];
  if (t >= FOAM.in) {
    // the two of you first: the lowest groups keep their registers when the rush crowds the middle
    const cells = pairCells(t, s, toMark), flood = seg(toMark, 0.3, 1, MOVE.in), born = seg(t, FOAM.in, FOAM.in + 0.3);
    cells.forEach((c, i) => prims.push({ ...FILM, ...inkOf(MARK_INK[i]), spec: 1, fill: flood, frost: FILM.frost * (1 - flood), env: lerp(FILM.env, MARK_ORB.env, flood),
      rim: lerp(FILM.rim, MARK_ORB.rim, flood), haze: lerp(FILM.haze, 0, flood), edge: lerp(FILM.edge, 0, flood), pos: sp(c.x, c.y), size: [sr(c.r)],
      alpha: born, seed: i ? 3.7 : 1.2, group: 1 + i }));
    const w = wallBetween([cells[0].x, cells[0].y], [cells[1].x, cells[1].y], (cells[0].r + cells[1].r) / 2, { group: 3, alpha: born });
    if (w) prims.push(w);
  }
  FRIENDS.forEach((f, i) => {
    const a = friendAt(f, t, s, collapse);
    if (a) prims.push({ ...FILM, pos: sp(a.x, a.y), size: [sr(a.r)], seed: f.seed, group: 10 + i });
  });
  prims.push(...foamAir(t));
  return { prims };
}

// OVER: your colour and theirs as rings over the pair's film, a ring of light where each friend arrives, the words'
// clear band, the words
function foam(ctx, t) {
  const s = scaleAt(t);
  const collapse = collapseAt(t);
  const alpha = 1 - seg(t, MARK.hit - 0.06, MARK.hit + 0.05);
  ctx.save();
  ctx.globalAlpha *= alpha;
  if (t >= FOAM.in) {
    const toMark = toMarkAt(t);
    ctx.save(); ctx.globalAlpha *= seg(t, FOAM.in, FOAM.in + 0.3) * (1 - seg(toMark, 0.2, 0.6));
    const cells = pairCells(t, s, toMark);
    cells.forEach((c, i) => {
      // each ring stops at the wall (the radical axis), as the cells do
      const o = cells[1 - i], dx = o.x - c.x, dy = o.y - c.y, d = Math.hypot(dx, dy);
      ctx.save();
      if (d < c.r + o.r && d > 1e-3) {
        const a = (d * d + c.r * c.r - o.r * o.r) / (2 * d), ux = dx / d, uy = dy / d, px = c.x + ux * a, py = c.y + uy * a, L = 4 * (c.r + o.r);
        ctx.beginPath();
        ctx.moveTo(px - uy * L, py + ux * L); ctx.lineTo(px + uy * L, py - ux * L);
        ctx.lineTo(px + uy * L - ux * L, py - ux * L - uy * L); ctx.lineTo(px - uy * L - ux * L, py + ux * L - uy * L);
        ctx.closePath(); ctx.clip();
      }
      ctx.lineWidth = Math.max(2, c.r * 0.045); ctx.strokeStyle = rgba(c.ring, 0.9);
      ctx.beginPath(); ctx.arc(c.x, c.y, c.r * 0.985, 0, TAU); ctx.stroke();
      ctx.restore();
    });
    ctx.restore();
  }
  for (const f of FRIENDS) {
    const a = friendAt(f, t, s, collapse);
    if (!a) continue;
    const { x, y, r } = a;
    // a ring of light where it arrives
    const k = t - f.born;
    if (k >= 0 && k < 0.35) {
      ctx.save(); ctx.globalAlpha *= 1 - k / 0.35;
      ctx.strokeStyle = '#FFFFFF'; ctx.lineWidth = 6 * (1 - k / 0.35) + 1;
      ctx.beginPath(); ctx.arc(x, y, r * (1.04 + 0.45 * MOVE.in(k / 0.35)), 0, TAU); ctx.stroke();
      ctx.restore();
    }
  }
  ctx.restore();
}

// a friend: their photo, lifted off the sky by a soft shadow (their soap film is liquid: foamLiquid)
function friend(ctx, key, x, y, r) {
  ctx.save();
  ctx.shadowColor = 'rgba(11,27,63,0.14)'; ctx.shadowBlur = r * 0.3; ctx.shadowOffsetY = r * 0.08;
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill();
  ctx.restore();
  drawPhoto(ctx, key, x, y, r);
}

// you and the one: two cells of one double bubble (each clipped at their shared wall, the radical axis), rings in your
// colours, the wall a white film; as they become the mark the colours flood them
function pairCells(t, s, toMark) {
  const join = spring(t - FOAM.in, SPRING.settle);
  return [[LEADS.you, -1, C.blue], [LEADS.one, 1, P.family.color]].map(([key, side, ring]) => {
    const rx = W / 2 + side * REVEAL.gap / 2;
    let x = lerp(rx, CENTER[0] + side * (RA / 2) * s, join), y = lerp(REVEAL.y, CENTER[1], join), r = lerp(REVEAL.r, RA * s, join);
    x = lerp(x, MARK_C[0] + side * 65, toMark); y = lerp(y, MARK_C[1], toMark); r = lerp(r, 130, toMark);
    return { key, x, y, r: r * (1 + 0.015 * Math.sin(t * 2.4 + side)), ring };
  });
}
function pair(ctx, t, s, toMark) {
  const cells = pairCells(t, s, toMark);
  cells.forEach((c, i) => {
    const o = cells[1 - i];
    ctx.save();
    ctx.beginPath(); ctx.arc(c.x, c.y, c.r, 0, TAU); ctx.clip();
    const dx = o.x - c.x, dy = o.y - c.y, d = Math.hypot(dx, dy);
    let wall = null;
    if (d < c.r + o.r && d > 1e-3) {
      const a = (d * d + c.r * c.r - o.r * o.r) / (2 * d);
      const ux = dx / d, uy = dy / d, px = c.x + ux * a, py = c.y + uy * a, L = 4 * (c.r + o.r);
      ctx.beginPath();
      ctx.moveTo(px - uy * L, py + ux * L); ctx.lineTo(px + uy * L, py - ux * L);
      ctx.lineTo(px + uy * L - ux * L, py - ux * L - uy * L); ctx.lineTo(px - uy * L - ux * L, py + ux * L - uy * L);
      ctx.closePath(); ctx.clip();
      wall = [px, py, ux, uy, L, Math.min(c.r, o.r)];
    }
    drawPhoto(ctx, c.key, c.x, c.y, c.r, { clip: false });
    ctx.restore();
  });
}

// the mark at t: the two of you arrive as its two circles (r 130): the hit lands as a wobble, then it rises for the
// name and sways a few degrees in the light (it is a real double bubble)
function markAt(t) {
  const k = t - MARK.hit;
  return {
    r: 130 * (1 + 0.12 * Math.exp(-k * 6) * Math.sin(k * 22)),
    my: lerp(MARK_C[1], 640, seg(t, MARK.name - 0.2, MARK.name + 0.35, MOVE.go)),
    wob: Math.sin(k * 14) * Math.exp(-k * 3),
    yaw: 0.07 * Math.sin(Math.max(0, k - 0.6) * 1.15) * seg(t, MARK.hit + 0.6, MARK.hit + 1.6),
  };
}
// Bub at the end: it peeks out from behind the mark and winks
function bubEnd(t, my) {
  const peek = seg(t, MARK.wink, MARK.wink + 0.5, ease.outBack) * (1 - seg(t, MARK.end - 0.4, MARK.end, ease.inCubic));
  if (peek <= 0.01) return null;
  const wink = seg(t, MARK.wink + 0.6, MARK.wink + 0.72) * (1 - seg(t, MARK.wink + 0.95, MARK.wink + 1.1));
  return { x: W / 2 + 230, y: my - 120 + (1 - peek) * 60, r: 54 * peek, happy: wink > 0.5 ? 1 : 0 };
}
// → the liquid mark: a blue bubble and a coral one sharing a flat wall, and Bub
function markLiquid(t) {
  const m = markAt(t);
  const C0 = sp(W / 2, m.my), h = sr(m.r) / 2, cy = Math.cos(m.yaw), sy = Math.sin(m.yaw);
  const prims = [0, 1].map((i) => {
    const sd = i ? 1 : -1;
    return { ...MARK_ORB, ...inkOf(MARK_INK[i]), pos: [C0[0] + sd * h * cy, C0[1], C0[2] - sd * h * sy], size: [sr(m.r) * (1 + m.wob * sd * 0.04)],
      seed: i ? 3.7 : 1.2, group: 1 + i };
  });
  prims.push({ ...wallBetween([W / 2 - m.r / 2, m.my], [W / 2 + m.r / 2, m.my], m.r, { group: 3 }), quat: [0, Math.sin((Math.PI / 2 + m.yaw) / 2), 0, Math.cos((Math.PI / 2 + m.yaw) / 2)] });   // its normal: blue → coral
  const b = bubEnd(t, m.my);
  if (!b) return { prims };
  const B = bubPrim({ pos: sp(b.x, b.y, -0.2), r: sr(b.r, -0.2), happy: b.happy, look: [-0.5, 0.2], blush: 0.8, group: 5 });
  prims.push(B.prim);
  return { prims, face: B.face };
}

function mark(ctx, t) {
  // (the mark is liquid: markLiquid; the name and the line lie in the ground under it: markWords; Bub is liquid too)
}
// the name, as the brand writes it everywhere — almost / friends.ai — and the line, in the scene's ground: lit, a
// shadow on the sky, and a light that crosses the name as Bub winks
function markWords(ctx, t) {
  if (t >= MARK.name) {
    drawLine(ctx, nameA, centerX(nameA, W / 2), 950, { fill: C.inkSoft, each: popEach(nameA, t, [MARK.name]) });
    drawLine(ctx, nameF, centerX(nameF, W / 2), 1090, { fill: C.ink, each: popEach(nameF, t, [MARK.name + 0.15]) });
  }
  if (t >= MARK.tag) drawLine(ctx, tag, centerX(tag, W / 2), 1210, { fill: C.ink, each: popEach(tag, t, [MARK.tag, MARK.tag + 0.06, MARK.tag + 0.12, MARK.tag + 0.18, MARK.tag + 0.24]) });
}

// The words, in the scene's ground (UNDER), under the friends' films. No band is cleared for them and nothing is laid
// behind them: they stand in the sky deeper than the friends — as the lens eases back they shrink less than the
// friends do (parallax) — and a few clear bubbles rise across them, bending them as they pass (foamAir)
function foamWords(ctx, t) {
  const collapse = collapseAt(t);
  const k = 1 + (scaleAt(t) / S0 - 1) * 0.3;
  ctx.save();
  ctx.translate(CENTER[0], CENTER[1]); ctx.scale(k, k); ctx.translate(-CENTER[0], -CENTER[1]);
  ctx.globalAlpha *= 1 - collapse;
  const w1 = seg(t, FOAM.line2 - 0.3, FOAM.line2, ease.inCubic);
  if (t >= FOAM.line1 && w1 < 1) {
    const o = () => (w1 > 0 ? { a: 1 - w1, dy: -w1 * 100 } : null);
    drawLine(ctx, same1, centerX(same1, W / 2), WORDS_Y[0], { fill: C.ink, each: combine(popEach(same1, t, [FOAM.line1, FOAM.line1 + 0.12]), o) });
    drawLine(ctx, same2, centerX(same2, W / 2), WORDS_Y[1], { fill: C.blue, each: combine(popEach(same2, t, [FOAM.line1 + 0.5, FOAM.line1 + 0.62]), o) });
  }
  const w2 = seg(t, MARK.hit - 0.35, MARK.hit - 0.05, ease.inCubic);
  if (t >= FOAM.line2 && w2 < 1) {
    const o = () => (w2 > 0 ? { a: 1 - w2, dy: -w2 * 100 } : null);
    drawLine(ctx, point1, centerX(point1, W / 2), WORDS_Y[2], { fill: C.ink, each: combine(popEach(point1, t, [FOAM.line2 + 0.05, FOAM.line2 + 0.17]), o) });
    drawLine(ctx, point2, centerX(point2, W / 2), WORDS_Y[3], { fill: C.ink, each: combine(popEach(point2, t, [FOAM.line2 + 0.4, FOAM.line2 + 0.52, FOAM.line2 + 0.64]), o) });
  }
  ctx.restore();
}
// clear bubbles rising through the words (frame px): [x, radius, when level with the words (s), rise (px/s)]
const AIR_F = [[200, 46, FOAM.line1 + 1.0, 230], [860, 38, FOAM.line1 + 2.2, 210], [610, 54, FOAM.line2 + 0.9, 240], [330, 34, FOAM.line2 + 2.0, 220]];
function foamAir(t) {
  return AIR_F.flatMap(([x, r, mid, v], i) => {
    const y = 700 - (t - mid) * v, vis = Math.min(1, Math.max(0, (900 - y) / 120)) * Math.min(1, Math.max(0, (y + 80) / 120)) * (1 - collapseAt(t));
    return vis > 0.002 ? [{ ...FILM, frost: 0.4, rim: 1.4, pos: sp(x + 14 * Math.sin(t * 1.2 + i), y), size: [sr(r)], alpha: vis, seed: 8 + i, group: 60 + i }] : [];
  });
}
