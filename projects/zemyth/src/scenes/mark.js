// Bar 13 · THE MARK (2D).
// The flattened coin stacks (continued pixel-for-pixel from the 3D) melt into the mark's base: the
// columns close their gaps and their tops tilt onto the zig-zag. The roof piece drops on from above —
// funding under, roof over: a house — and the trend line is left as the gap between them. Construction
// marks draw over the finished mark (bounds, anchors, the corner's Bézier handles) and name the gap:
// the chart line. Then the 3D mark takes over (mark3d.js).
import { W, H, BEAT, C, FONTS } from '../config.js';
import { ease, seg, clamp, lerp } from '../util.js';
import { font } from '../draw2d.js';
import { rr, markPolys, MARK_TOP, MARK_BOT } from '../brand.js';
import { B, MARK as T } from '../score.js';
import { CHART, STACKS, markToScreen, edgeY, coinRest, LINE } from './coins.js';

const PXW = CHART.px / CHART.k;                  // px per world unit in the flat view
const POLY = markPolys(16);
const P_TOP = new Path2D(MARK_TOP), P_BOT = new Path2D(MARK_BOT);
const TILE = { x: markToScreen(0, 0)[0], y: markToScreen(0, 0)[1], s: CHART.px };

function drawColumns(ctx, gb) {
  const p = ease.inOutCubic(seg(gb, T.melt0, T.melt1));
  ctx.fillStyle = C.lime;
  if (p >= 0.999) {
    ctx.save(); ctx.translate(TILE.x, TILE.y); ctx.scale(TILE.s, TILE.s); ctx.fill(P_BOT); ctx.restore();
    return;
  }
  const floorY = markToScreen(0, 30)[1];
  const q = clamp(p / 0.2);                        // first: the coins in each stack fuse into one column
  if (q < 1) {
    const P = coinRest();
    for (const c of P) {
      const x = W / 2 + c.x * PXW, y0 = floorY - (c.k + 1) * CHART.coinT * PXW, h = CHART.coinT * PXW;
      const grow = q * 1.2;
      rr(ctx, x - CHART.R * PXW, y0 - grow, CHART.R * 2 * PXW, h + grow * 2, 2.6 * (1 - q));
      ctx.fill();
    }
    if (p < 0.2) return;
  }
  // then each column widens to its share of the width and its top tilts onto the zig-zag
  const u = seg(p, 0.2, 1);
  for (const s of STACKS) {
    const x0t = s.i * CHART.spacing, x1t = Math.min(30.06, (s.i + 1) * CHART.spacing);
    const topS = 30 - s.n * (CHART.coinT / CHART.k);                 // column top (mark units)
    const x0s = s.mx - CHART.R / CHART.k, x1s = s.mx + CHART.R / CHART.k;
    const xs = [];
    for (let k = 0; k <= 6; k++) xs.push(lerp(x0t, x1t, k / 6));
    for (const v of [10.787, 24.746]) if (v > x0t && v < x1t) xs.push(v);
    xs.sort((a, b) => a - b);
    ctx.beginPath();
    const [bx0, by] = markToScreen(lerp(x0s, x0t, u), 30);
    ctx.moveTo(bx0 - 0.75, by + 0.5);     // columns overlap by 1.5 px so no anti-aliasing seam shows
    xs.forEach((x, k) => {
      const f = (x - x0t) / (x1t - x0t);
      const [sx, sy] = markToScreen(lerp(lerp(x0s, x1s, f), x, u), lerp(topS, edgeY(x), u));
      ctx.lineTo(sx + (k === 0 ? -0.75 : k === xs.length - 1 ? 0.75 : 0), sy);
    });
    const [bx1] = markToScreen(lerp(x1s, x1t, u), 30);
    ctx.lineTo(bx1 + 0.75, by + 0.5);
    ctx.closePath();
    ctx.fill();
  }
}

function drawRoof(ctx, gb, t) {
  const p = seg(gb, T.drop0, T.drop1);
  if (p <= 0) return;
  const land = t - B(T.drop1);
  let dy = -(1 - ease.inCubic(p)) * 920;                               // falls under gravity
  if (land > 0) dy = -10 * Math.exp(-land / 0.05) * Math.abs(Math.sin(land * 38));   // lands, settles
  ctx.save();
  ctx.translate(TILE.x, TILE.y + dy);
  ctx.scale(TILE.s, TILE.s);
  ctx.fillStyle = C.lime;
  ctx.fill(P_TOP);
  ctx.restore();
}

function drawTrend(ctx, gb) {
  const f = seg(gb, T.lineOut, T.lineOut + 0.45);
  if (f >= 1) return;
  ctx.save();
  ctx.globalAlpha *= 1 - ease.inCubic(f);
  ctx.strokeStyle = C.lime;
  ctx.lineWidth = lerp(7, 2, f);
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.beginPath();
  LINE.pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
  ctx.stroke();
  ctx.restore();
}

// Construction layer: bounds, anchors, the corner's Bézier handles, and the gap named.
const ANCHORS = [
  ...[[30.059, 8.074], [30.059, 16.385], [24.745, 21.689], [10.786, 7.757], [0.078, 18.443], [0.078, 10.132], [10.23, 0], [22.048, 0], [30.138, 7.995]],
  ...[[27.046, 23.984], [30.06, 20.976], [30.06, 30], [0, 30], [0, 23.034], [10.787, 12.348], [24.746, 26.28]],
];
function drawBuild(ctx, gb) {
  const a = seg(gb, T.build0, T.build0 + 0.3) * (1 - seg(gb, T.build1 - 0.3, T.build1));
  if (a <= 0) return;
  ctx.save();
  ctx.globalAlpha *= a;
  const [x0, y0] = markToScreen(0, 0), [x1, y1] = markToScreen(30.138, 30);
  // bounds, drawn on
  const bp = ease.inOutCubic(seg(gb, T.build0, T.build0 + 0.45));
  const per = 2 * ((x1 - x0) + (y1 - y0)) + 64;
  ctx.setLineDash([per * bp, per]);
  ctx.strokeStyle = 'rgba(255,255,255,0.3)';
  ctx.lineWidth = 1;
  ctx.strokeRect(x0 - 16.5, y0 - 16.5, x1 - x0 + 33, y1 - y0 + 33);
  ctx.setLineDash([]);
  // anchors pop along the outline
  ANCHORS.forEach(([mx, my], i) => {
    const s = seg(gb, T.build0 + 0.2 + i * 0.045, T.build0 + 0.4 + i * 0.045, (x) => ease.outBack(x, 2.4));
    if (s <= 0) return;
    const [x, y] = markToScreen(mx, my);
    const h = 5.5 * s;
    ctx.fillStyle = C.black;
    ctx.strokeStyle = C.white;
    ctx.lineWidth = 1.5;
    ctx.fillRect(x - h, y - h, h * 2, h * 2);
    ctx.strokeRect(x - h, y - h, h * 2, h * 2);
  });
  // the rounded corner's handles
  const hp = seg(gb, T.build0 + 0.75, T.build0 + 1.05, ease.outCubic);
  if (hp > 0) {
    ctx.strokeStyle = 'rgba(255,255,255,0.7)';
    ctx.fillStyle = C.white;
    ctx.lineWidth = 1.5;
    for (const [[ax, ay], [cx, cy]] of [[[22.048, 0], [26.49, 0]], [[30.138, 7.995], [30.138, 3.641]]]) {
      const [sx, sy] = markToScreen(ax, ay), [ex, ey] = markToScreen(lerp(ax, cx, hp), lerp(ay, cy, hp));
      ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(ex, ey); ctx.stroke();
      ctx.beginPath(); ctx.arc(ex, ey, 5, 0, Math.PI * 2); ctx.fill();
    }
  }
  // name the gap: the chart line lives on as negative space
  const lp = seg(gb, T.build0 + 0.55, T.build0 + 0.9, ease.outExpo);
  if (lp > 0) {
    const [gx, gy] = markToScreen(17.8, 17.3);              // inside the channel, on the falling leg
    const [lx, ly] = [x1 + 70, gy + 40];
    ctx.strokeStyle = 'rgba(255,255,255,0.75)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(gx, gy);
    ctx.lineTo(lerp(gx, lx - 14, lp), lerp(gy, ly, lp));
    ctx.stroke();
    ctx.fillStyle = C.white;
    ctx.beginPath(); ctx.arc(gx, gy, 4.5, 0, Math.PI * 2); ctx.fill();
    font(ctx, { f: FONTS.label, w: 700, s: 20 });
    ctx.letterSpacing = '4px';
    ctx.globalAlpha *= lp;
    ctx.fillStyle = 'rgba(255,255,255,0.8)';
    ctx.textBaseline = 'middle';
    ctx.fillText('THE CHART LINE', lx, ly);
    font(ctx, { f: FONTS.sans, w: 400, s: 17 });
    ctx.letterSpacing = '0px';
    ctx.fillStyle = C.dim;
    ctx.fillText('kept as negative space', lx, ly + 26);
  }
  ctx.restore();
}

function draw(ctx, t) {
  const gb = t / BEAT;
  drawColumns(ctx, gb);
  drawTrend(ctx, gb);
  drawRoof(ctx, gb, t);
  drawBuild(ctx, gb);
}

export default { id: 'mark', layers: [{ start: B(T.melt0), end: B(T.spin0), draw }] };
export { TILE };
