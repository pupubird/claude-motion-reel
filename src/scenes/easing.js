// Bar 6 · the craft layer: a live graph editor driving three shapes, with onion skins
// and animator spacing charts that make each curve's timing visible.
import { W, H, BEAT, FPS, COLORS as C, FONTS } from '../config.js';
import { ease, seg, lerp, clamp, cubicBezier, spring, TAU } from '../util.js';
import { EASE_MOTION } from '../score.js';
import { font, advances } from '../draw2d.js';

const CURVES = [
  { name: 'easeInOutQuart', fn: cubicBezier(0.76, 0, 0.24, 1), label: 'cubic-bezier(.76, 0, .24, 1)' },
  { name: 'easeOutBack', fn: cubicBezier(0.34, 1.56, 0.64, 1), label: 'cubic-bezier(.34, 1.56, .64, 1)' },
  { name: 'bounce', fn: ease.outBounce, label: 'bounce · 4 contacts' },
  { name: 'spring', fn: (u) => spring(u * 1.1, 170, 9), label: 'spring(stiffness 170, damping 9)' },
];
const PANEL = { x: 140, y: 262, w: 640, h: 600 };
const PX0 = 212, PX1 = 732, PY0 = 332, PY1 = 792, VMIN = -0.3, VMAX = 1.3;
const gx = (u) => lerp(PX0, PX1, u);
const gy = (v) => lerp(PY1, PY0, (v - VMIN) / (VMAX - VMIN));
const LANES = [392, 582, 772];
const XA = 1000, XB = 1680;
const MOTION_FRAMES = Math.round(EASE_MOTION.len * BEAT * FPS);

// Motion progress (linear time) of beat k at local beat lb.
const prog = (lb, k, delay = 0) => seg(lb - k - delay, EASE_MOTION.start, EASE_MOTION.start + EASE_MOTION.len);

function laneX(lane, u) {
  if (lane === 0) return lerp(XA, XB, CURVES[0].fn(u));
  if (lane === 1) return lerp(XA, XB, CURVES[1].fn(u));
  return lerp(XA, XB - 40, CURVES[2].fn(u));
}

// Where each lane sits at local beat lb, including the beat-4 spring return.
function lanePos(lane, lb) {
  const u = prog(lb, lane);
  let x = laneX(lane, u);
  const r = prog(lb, 3, lane * 0.07);
  if (r > 0) x = lerp(laneX(lane, 1), XA, CURVES[3].fn(r));
  return x;
}

function shape(ctx, lane, x, y, alpha, fill, lb, u) {
  ctx.globalAlpha = alpha;
  ctx.save();
  ctx.translate(x, y);
  if (lane === 0) {
    ctx.beginPath();
    ctx.arc(0, 0, 44, 0, TAU);
  } else if (lane === 1) {
    ctx.rotate((CURVES[1].fn(u) * Math.PI) / 2);
    ctx.beginPath();
    ctx.rect(-42, -42, 84, 84);
  } else {
    let sq = 0;
    for (const c of [1 / 2.75, 2 / 2.75, 2.5 / 2.75, 1]) sq = Math.max(sq, Math.exp(-Math.abs(u - c) * 26) * (u < 1 || c === 1 ? 1 : 0));
    ctx.scale(1 - 0.22 * sq, 1 + 0.12 * sq);
    ctx.beginPath();
    ctx.moveTo(0, -52);
    ctx.lineTo(48, 32);
    ctx.lineTo(-48, 32);
    ctx.closePath();
  }
  if (fill) { ctx.fillStyle = [C.hot, C.volt, C.ink][lane]; ctx.fill(); }
  else { ctx.strokeStyle = C.ink; ctx.lineWidth = 1.5; ctx.stroke(); }
  ctx.restore();
  ctx.globalAlpha = 1;
}

function drawGrid(ctx) {
  ctx.strokeStyle = C.ink;
  for (let x = 0; x <= W; x += 80) {
    ctx.globalAlpha = x % 320 === 0 ? 0.1 : 0.045;
    ctx.fillRect(x, 0, 1, H);
  }
  for (let y = 0; y <= H; y += 80) {
    ctx.globalAlpha = y % 320 === 0 ? 0.1 : 0.045;
    ctx.fillRect(0, y, W, 1);
  }
  ctx.globalAlpha = 1;
}

function drawPanel(ctx, lb) {
  const k = clamp(Math.floor(lb), 0, 3), ph = lb - k;
  const cur = CURVES[k];
  const open = seg(lb, 0, 0.28, ease.outExpo);
  ctx.save();
  ctx.fillStyle = C.ink;
  ctx.beginPath();
  ctx.roundRect(PANEL.x, PANEL.y, PANEL.w, PANEL.h * open, 22);
  ctx.fill();
  ctx.clip();
  // Axes + guides.
  ctx.fillStyle = C.bone;
  for (const u of [0, 0.25, 0.5, 0.75, 1]) { ctx.globalAlpha = u % 1 === 0 ? 0.35 : 0.12; ctx.fillRect(gx(u), PY0 - 10, 1, PY1 - PY0 + 20); }
  for (const v of [0, 0.5, 1]) { ctx.globalAlpha = v === 0.5 ? 0.12 : 0.35; ctx.fillRect(PX0 - 10, gy(v), PX1 - PX0 + 20, 1); }
  ctx.globalAlpha = 0.6;
  font(ctx, { f: FONTS.mono, w: 700, s: 13 });
  ctx.letterSpacing = '3px';
  ctx.fillText('VALUE GRAPH', PANEL.x + 30, PANEL.y + 42);
  ctx.textAlign = 'right';
  ctx.fillStyle = C.hot;
  ctx.globalAlpha = 1;
  ctx.fillText(cur.name.toUpperCase(), PANEL.x + PANEL.w - 30, PANEL.y + 42);
  ctx.textAlign = 'left';
  ctx.letterSpacing = '0px';
  // Curve draws on, previous curve fades.
  const drawOn = seg(ph, 0.0, 0.28, ease.outCubic);
  const strokeCurve = (fn, upto, alpha, width) => {
    ctx.globalAlpha = alpha;
    ctx.beginPath();
    const n = 140;
    for (let i = 0; i <= n * upto; i++) {
      const u = i / n;
      i === 0 ? ctx.moveTo(gx(u), gy(fn(u))) : ctx.lineTo(gx(u), gy(fn(u)));
    }
    ctx.lineWidth = width;
    ctx.stroke();
  };
  ctx.strokeStyle = C.bone;
  if (k > 0) strokeCurve(CURVES[k - 1].fn, 1, 0.25 * (1 - seg(ph, 0, 0.3)), 2);
  ctx.strokeStyle = C.hot;
  ctx.lineCap = 'round';
  strokeCurve(cur.fn, drawOn, 1, 4);
  // Bezier handles.
  if (cur.fn.points) {
    const [x1, y1, x2, y2] = cur.fn.points;
    const hk = seg(ph, 0.1, 0.35, ease.outBack);
    ctx.globalAlpha = hk;
    ctx.strokeStyle = C.bone;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(gx(0), gy(0)); ctx.lineTo(gx(x1 * hk), gy(y1 * hk));
    ctx.moveTo(gx(1), gy(1)); ctx.lineTo(gx(1 + (x2 - 1) * hk), gy(1 + (y2 - 1) * hk));
    ctx.stroke();
    for (const [hx, hy] of [[x1, y1], [x2, y2]]) {
      ctx.beginPath();
      ctx.arc(gx(hx), gy(hy), 7 * hk, 0, TAU);
      ctx.fillStyle = C.ink; ctx.fill(); ctx.stroke();
    }
  }
  // Playhead.
  const u = prog(lb, k);
  const v = cur.fn(u);
  ctx.globalAlpha = 0.4;
  ctx.fillStyle = C.bone;
  ctx.fillRect(gx(u), PY0 - 10, 1.5, PY1 - PY0 + 20);
  ctx.globalAlpha = 0.5;
  ctx.setLineDash([4, 6]);
  ctx.strokeStyle = C.bone;
  ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(PX0 - 10, gy(v)); ctx.lineTo(gx(u), gy(v)); ctx.stroke();
  ctx.setLineDash([]);
  ctx.globalAlpha = 1;
  ctx.beginPath(); ctx.arc(gx(u), gy(v), 9, 0, TAU); ctx.fillStyle = C.hot; ctx.fill();
  ctx.lineWidth = 2.5; ctx.strokeStyle = C.bone; ctx.stroke();
  font(ctx, { f: FONTS.mono, w: 400, s: 15 });
  ctx.fillStyle = C.bone;
  ctx.fillText(cur.label, PANEL.x + 30, PANEL.y + PANEL.h - 30);
  ctx.textAlign = 'right';
  ctx.fillText(`v ${v.toFixed(3)}`, PANEL.x + PANEL.w - 30, PANEL.y + PANEL.h - 30);
  ctx.textAlign = 'left';
  ctx.restore();
}

function drawStage(ctx, lb) {
  // Tracks, wall, spacing charts, onion skins, shapes.
  ctx.fillStyle = C.ink;
  for (let lane = 0; lane < 3; lane++) {
    const y = LANES[lane];
    const trk = seg(lb, 0.05 + lane * 0.06, 0.5 + lane * 0.06, ease.outExpo);
    ctx.globalAlpha = 0.2;
    ctx.fillRect(XA - 60, y + 76, (XB - XA + 120) * trk, 1.5);
    ctx.globalAlpha = 1;
    // Spacing chart: one tick per rendered frame of this lane's move.
    const u = prog(lb, lane);
    const fade = 1 - seg(lb, lane + 1.4, lane + 2.2);
    if (u > 0 && fade > 0) {
      for (let f = 0; f <= MOTION_FRAMES; f++) {
        const fu = f / MOTION_FRAMES;
        if (fu > u) break;
        const x = laneX(lane, fu);
        ctx.globalAlpha = 0.7 * fade;
        ctx.fillRect(x - 0.75, y + 66, 1.5, f % 5 === 0 ? 22 : 12);
        if (f % 2 === 0 && fu < u - 0.02) shape(ctx, lane, x, y, 0.2 * fade, false, lb, fu);
      }
      ctx.globalAlpha = fade * seg(u, 0, 0.3);
      font(ctx, { f: FONTS.mono, w: 400, s: 13 });
      ctx.fillStyle = C.ink;
      ctx.fillText(`${MOTION_FRAMES} frames · ${CURVES[lane].name}`, XA - 60, y + 118);
      ctx.globalAlpha = 1;
    }
  }
  ctx.globalAlpha = seg(lb, 1.9, 2.1);
  ctx.fillRect(XB + 12, LANES[2] - 70, 6, 140);
  ctx.globalAlpha = 1;
  for (let lane = 0; lane < 3; lane++) {
    const appear = seg(lb, 0.0 + lane * 0.08, 0.4 + lane * 0.08, ease.outBack);
    if (appear <= 0) continue;
    ctx.save();
    const x = lanePos(lane, lb), y = LANES[lane];
    ctx.translate(x, y);
    ctx.scale(appear, appear);
    ctx.translate(-x, -y);
    shape(ctx, lane, x, y, 1, true, lb, prog(lb, lane));
    ctx.restore();
  }
}

function draw(ctx, t) {
  const lb = t / BEAT - 20;
  ctx.fillStyle = C.bone;
  ctx.fillRect(0, 0, W, H);
  drawGrid(ctx);
  // Title.
  font(ctx, { f: FONTS.serif, i: true, s: 76 });
  ctx.fillStyle = C.ink;
  const words = ['ease', 'is', 'everything.'];
  let x = PANEL.x;
  for (let i = 0; i < words.length; i++) {
    const k = seg(lb, 0.1 + i * 0.12, 0.7 + i * 0.12, ease.outExpo);
    ctx.save();
    ctx.beginPath();
    ctx.rect(x - 10, 120, 700, 110);
    ctx.clip();
    ctx.fillText(words[i], x, 212 + (1 - k) * 100);
    ctx.restore();
    x += ctx.measureText(words[i] + ' ').width;
  }
  drawPanel(ctx, lb);
  drawStage(ctx, lb);
}

export default {
  id: 'easing',
  layers: [{ start: 20 * BEAT, end: 24 * BEAT, draw }],
};
