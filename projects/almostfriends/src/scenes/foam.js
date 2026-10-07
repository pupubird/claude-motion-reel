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
import { clamp, lerp, seg, ease, spring, rng, TAU, rgba } from '../util.js';
import { drawSky } from '../world/sky.js';
import { drawBubble2D, drawBubFace } from '../world/bubble2d.js';
import { Line, drawLine, popEach, combine, centerX } from '../type.js';
import { drawPhoto, CROWD, LEADS } from '../assets.js';
import { drawMark } from '../world/mark.js';
import { REVEAL } from './unlock.js';

// foam space: px at scale 1, centred on the double bubble; the frame shows it at scale s(t) about CENTER
const CENTER = [W / 2, 1150];
const RA = 130;                                   // you and the one: equal radii, centres one radius apart (flat wall)
const S_END = 0.92;                               // the camera's widest
const MIN_R = 56;                                 // the anti-crowding rules, on screen at the widest (px): the smallest
const MIN_AIR = 28;                               // face in focus, and the least air between two bubbles
const OFF = 0.45;                                 // at the sides and the bottom a bubble may run off the frame by this
                                                  // much of its radius (the crowd goes on past the edge)
const WORDS_BOTTOM = 700;                         // the words' band (y < 700 on screen) stays clear
const MARK_C = [W / 2, 1000];                     // where mark() draws the mark at the hit
const N = GROW.n, T0 = GROW.t0, DOUBLE = GROW.double;
const born = (i, t0 = T0, d = DOUBLE) => t0 + d * Math.log2(1 + i / 2);

// The friends: a greedy Poisson-disc fill in sunflower order round the two of you (born from the inside out), every
// bubble inside the frame at the widest, clear of the words, with at least MIN_AIR between any two. A bubble takes the
// size it wants, or less where it is tight, but never less than MIN_R on screen
const FRIENDS = (() => {
  const R = rng(611);
  const placed = [{ x: -RA / 2, y: 0, r: RA }, { x: RA / 2, y: 0, r: RA }];
  const out = [];
  const xMax = (W / 2) / S_END, yMin = (WORDS_BOTTOM - CENTER[1]) / S_END, yMax = (H - CENTER[1]) / S_END;
  const air = MIN_AIR / S_END, rMin = (MIN_R + 2) / S_END;
  for (let k = 1; out.length < N && k < 6000; k++) {
    const th = k * 2.399963 + (R() - 0.5) * 0.6, rho = 60 * Math.sqrt(k) * (1 + (R() - 0.5) * 0.2);
    const x = Math.cos(th) * rho, y = Math.sin(th) * rho;
    const want = (rho < 380 ? 104 : 86) * (0.86 + 0.28 * R());
    const room = Math.min((xMax - Math.abs(x)) / (1 - OFF), y - yMin, (yMax - y) / (1 - OFF), ...placed.map((o) => Math.hypot(o.x - x, o.y - y) - o.r - air));
    if (room < rMin) continue;
    const f = { x, y, r: Math.min(want, room), order: rho + (R() - 0.5) * 120, ph: R() * TAU };
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

// The camera: each friend needs the camera wide enough to hold it in frame (below the words); the camera eases back
// to each friend's need from just before its birth, so the newest friend arrives inside the frame
const S0 = REVEAL.r / RA;
const NEED = FRIENDS.map((f) => Math.min(
  (W / 2) / (Math.abs(f.x) + f.r * (1 - OFF)),
  f.y > 0 ? (H - CENTER[1]) / (f.y + f.r * (1 - OFF)) : (CENTER[1] - WORDS_BOTTOM) / Math.max(1, f.r - f.y),
));
function scaleAt(t) {
  let s = S0;
  FRIENDS.forEach((f, i) => { s = Math.min(s, lerp(S0, Math.max(S_END, NEED[i]), MOVE.go(seg(t, f.born - 0.4, f.born + 0.15)))); });
  return s;
}

let same1, same2, point1, point2, nameA, nameF, tag;

export default {
  init() {
    same1 = new Line('Same values.', { s: 112, w: 780, track: -0.03 });
    same2 = new Line('New friends.', { s: 112, w: 800, track: -0.03 });
    point1 = new Line('Friendship is', { s: 92, w: 700, track: -0.025 });
    point2 = new Line('the whole point.', { s: 92, w: 700, track: -0.025 });
    nameA = new Line('almost', { s: 150, w: 640, track: -0.02 });
    nameF = new Line('friends.ai', { s: 150, w: 800, track: -0.035 });
    tag = new Line('Make friends outside your bubble.', { s: 50, w: 600, f: FONTS.ui, track: -0.005 });
  },
  under: [{ start: FOAM.in - 0.6, end: MARK.end, draw(ctx) { drawSky(ctx); } }],
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

function foam(ctx, t) {
  const s = scaleAt(t);
  const collapse = seg(t, MARK.hit - 0.42, MARK.hit, MOVE.out);          // everyone rushes in
  const toMark = seg(t, MARK.hit - 0.42, MARK.hit, MOVE.go);              // …and the two of you become the mark
  const alpha = 1 - seg(t, MARK.hit - 0.06, MARK.hit + 0.05);
  ctx.save();
  ctx.globalAlpha *= alpha;
  // the friends: each its own bubble, bobbing slowly
  for (const f of FRIENDS) {
    const p = spring(t - f.born, SPRING.wobble);
    if (p <= 0.002) continue;
    let x = CENTER[0] + f.x * s + 5 * Math.sin(t * 0.9 + f.ph), y = CENTER[1] + f.y * s + 7 * Math.sin(t * 0.7 + f.ph * 1.3);
    let r = f.r * s * p * (1 + 0.012 * Math.sin(t * 2.4 + f.ph));
    x = lerp(x, MARK_C[0], collapse); y = lerp(y, MARK_C[1], collapse); r *= 1 - collapse;
    if (r < 0.6) continue;
    friend(ctx, f.key, x, y, r, t, f.seed);
    // a ring of light where it arrives
    const k = t - f.born;
    if (k >= 0 && k < 0.35) {
      ctx.save(); ctx.globalAlpha *= 1 - k / 0.35;
      ctx.strokeStyle = '#FFFFFF'; ctx.lineWidth = 6 * (1 - k / 0.35) + 1;
      ctx.beginPath(); ctx.arc(x, y, r * (1.04 + 0.45 * MOVE.in(k / 0.35)), 0, TAU); ctx.stroke();
      ctx.restore();
    }
  }
  // the two of you, on top: from the reveal (apart, big) into the double bubble at the centre, and into the mark
  if (t >= FOAM.in) pair(ctx, t, s, toMark);
  ctx.restore();
  // the sky keeps the words' band clear
  const fog = ctx.createLinearGradient(0, 160, 0, 760);
  fog.addColorStop(0, 'rgba(222,238,255,0.97)'); fog.addColorStop(0.55, 'rgba(226,236,252,0.8)'); fog.addColorStop(1, 'rgba(230,236,250,0)');
  ctx.save(); ctx.globalAlpha *= seg(t, FOAM.line1 - 0.3, FOAM.line1) * (1 - collapse); ctx.fillStyle = fog; ctx.fillRect(0, 0, W, 760); ctx.restore();
  // words: the value, then the point
  const w1 = seg(t, FOAM.line2 - 0.3, FOAM.line2, ease.inCubic);
  if (t >= FOAM.line1 && w1 < 1) {
    const o = () => (w1 > 0 ? { a: 1 - w1, dy: -w1 * 100 } : null);
    drawLine(ctx, same1, centerX(same1, W / 2), 430, { fill: C.ink, each: combine(popEach(same1, t, [FOAM.line1, FOAM.line1 + 0.12]), o) });
    drawLine(ctx, same2, centerX(same2, W / 2), 560, { fill: C.blue, each: combine(popEach(same2, t, [FOAM.line1 + 0.5, FOAM.line1 + 0.62]), o) });
  }
  const w2 = seg(t, MARK.hit - 0.35, MARK.hit - 0.05, ease.inCubic);
  if (t >= FOAM.line2 && w2 < 1) {
    const o = () => (w2 > 0 ? { a: 1 - w2, dy: -w2 * 100 } : null);
    drawLine(ctx, point1, centerX(point1, W / 2), 430, { fill: C.ink, each: combine(popEach(point1, t, [FOAM.line2 + 0.05, FOAM.line2 + 0.17]), o) });
    drawLine(ctx, point2, centerX(point2, W / 2), 546, { fill: C.ink, each: combine(popEach(point2, t, [FOAM.line2 + 0.4, FOAM.line2 + 0.52, FOAM.line2 + 0.64]), o) });
  }
}

// a friend: their photo in a soap bubble (the film's rim and highlight over it), lifted off the sky by a soft shadow
function friend(ctx, key, x, y, r, t, seed) {
  ctx.save();
  ctx.shadowColor = 'rgba(11,27,63,0.14)'; ctx.shadowBlur = r * 0.3; ctx.shadowOffsetY = r * 0.08;
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill();
  ctx.restore();
  drawPhoto(ctx, key, x, y, r);
  drawBubble2D(ctx, x, y, r, { t, seed });
}

// you and the one: two cells of one double bubble (each clipped at their shared wall, the radical axis), rings in your
// colours, the wall a white film; as they become the mark the colours flood them
function pair(ctx, t, s, toMark) {
  const join = spring(t - FOAM.in, SPRING.settle);
  const cells = [[LEADS.you, -1, C.blue], [LEADS.one, 1, P.family.color]].map(([key, side, ring]) => {
    const rx = W / 2 + side * REVEAL.gap / 2;
    let x = lerp(rx, CENTER[0] + side * (RA / 2) * s, join), y = lerp(REVEAL.y, CENTER[1], join), r = lerp(REVEAL.r, RA * s, join);
    x = lerp(x, MARK_C[0] + side * 65, toMark); y = lerp(y, MARK_C[1], toMark); r = lerp(r, 130, toMark);
    return { key, x, y, r: r * (1 + 0.015 * Math.sin(t * 2.4 + side)), ring };
  });
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
    if (toMark > 0.5) { ctx.fillStyle = rgba(c.ring, seg(toMark, 0.5, 1)); ctx.fillRect(c.x - c.r, c.y - c.r, 2 * c.r, 2 * c.r); }
    const g = ctx.createLinearGradient(c.x - c.r, c.y - c.r, c.x + c.r, c.y + c.r);
    g.addColorStop(0, 'rgba(255,255,255,0.2)'); g.addColorStop(0.45, 'rgba(255,255,255,0)'); g.addColorStop(1, 'rgba(155,140,255,0.14)');
    ctx.fillStyle = g; ctx.fillRect(c.x - c.r, c.y - c.r, 2 * c.r, 2 * c.r);
    ctx.lineWidth = Math.max(2, c.r * 0.05); ctx.strokeStyle = rgba(c.ring, 0.9);
    ctx.beginPath(); ctx.arc(c.x, c.y, c.r, 0, TAU); ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.beginPath(); ctx.ellipse(c.x - c.r * 0.45, c.y - c.r * 0.5, c.r * 0.16, c.r * 0.08, -0.7, 0, TAU); ctx.fill();
    if (wall) {
      const [px, py, ux, uy, L, rm] = wall;
      ctx.strokeStyle = 'rgba(255,255,255,0.95)'; ctx.lineWidth = Math.max(3, rm * 0.16);
      ctx.beginPath(); ctx.moveTo(px - uy * L, py + ux * L); ctx.lineTo(px + uy * L, py - ux * L); ctx.stroke();
    }
    ctx.restore();
  });
}

function mark(ctx, t) {
  // the two of you arrive as its two circles (r 130): the hit lands as a wobble, then the mark rises for the name
  const k = t - MARK.hit;
  const r = 130 * (1 + 0.12 * Math.exp(-k * 6) * Math.sin(k * 22));
  const my = lerp(MARK_C[1], 640, seg(t, MARK.name - 0.2, MARK.name + 0.35, MOVE.go));
  drawMark(ctx, W / 2, my, r, { t, wob: Math.sin(k * 14) * Math.exp(-k * 3) });
  // the name, as the brand writes it everywhere: almost / friends.ai; then the line
  if (t >= MARK.name) {
    drawLine(ctx, nameA, centerX(nameA, W / 2), 950, { fill: C.inkSoft, each: popEach(nameA, t, [MARK.name]) });
    drawLine(ctx, nameF, centerX(nameF, W / 2), 1090, { fill: C.ink, each: popEach(nameF, t, [MARK.name + 0.15]) });
  }
  if (t >= MARK.tag) drawLine(ctx, tag, centerX(tag, W / 2), 1210, { fill: C.ink, each: popEach(tag, t, [MARK.tag, MARK.tag + 0.06, MARK.tag + 0.12, MARK.tag + 0.18, MARK.tag + 0.24]) });
  // Bub's wink from behind the mark
  const peek = seg(t, MARK.wink, MARK.wink + 0.5, ease.outBack) * (1 - seg(t, MARK.end - 0.4, MARK.end, ease.inCubic));
  if (peek > 0) {
    const bx = W / 2 + 230, by = my - 120 + (1 - peek) * 60, br = 54 * peek;
    drawBubble2D(ctx, bx, by, br, { t, seed: 9 });
    const wink = seg(t, MARK.wink + 0.6, MARK.wink + 0.72) * (1 - seg(t, MARK.wink + 0.95, MARK.wink + 1.1));
    drawBubFace(ctx, bx, by, br, { happy: wink > 0.5 ? 1 : 0, look: [-0.5, 0.2] });
  }
}
