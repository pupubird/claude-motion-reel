// Zemyth's visual language, drawn from the client's own files:
//   the Z-peak mark and the zemyth wordmark are the exact paths of public/assets/zemyth-mark.svg and
//   zemyth-wordmark.svg; pills, rounded lime-stroke cards, star-burst stickers, sparkles and hand-drawn
//   arrows follow BRAND.md and the moodboard.
import { C, FONTS } from './config.js';
import { font } from './draw2d.js';
import { clamp, lerp } from './util.js';

/* ------------------------------------------------------------------ the mark */
// zemyth-mark.svg with the tile moved to the origin: 30.14 × 30 units, two pieces.
// TOP: the roof piece, whose lower edge is the zig-zag; BOT: the base, whose upper edge runs parallel to it.
// The gap between them (4.59 units tall) is the rising chart line, drawn in negative space.
export const MARK_W = 30.1383, MARK_H = 30;
export const MARK_TOP = 'M30.059 8.07392V16.3853L24.745 21.6888L10.7856 7.7573L0.07812 18.4434V10.132L10.2304 0H22.0483C26.4899 0 30.1383 3.64118 30.1383 7.99476L30.059 8.07392Z';
export const MARK_BOT = 'M27.0463 23.9841L30.0602 20.9762V29.9999H0V23.0342L10.7868 12.3481L22.446 23.9841L24.7461 26.2796L27.0463 23.9841Z';
// Polygons of the same pieces (the corner curve sampled), for 3D extrusion and morphs.
export const TOP_EDGE = [[0.078, 18.443], [10.786, 7.757], [24.745, 21.689], [30.059, 16.385]]; // zig-zag, left → right
export const GAP = 4.59;                                                                          // channel height
export const CHANNEL = TOP_EDGE.map(([x, y]) => [x, y + GAP / 2]);                               // chart centre-line
export function markPolys(steps = 10) {
  const corner = [];
  // cubic from (22.048, 0) to (30.138, 7.995) with controls (26.49, 0) and (30.138, 3.641)
  for (let i = 0; i <= steps; i++) {
    const t = i / steps, u = 1 - t;
    corner.push([u * u * u * 22.048 + 3 * u * u * t * 26.49 + 3 * u * t * t * 30.138 + t * t * t * 30.138,
      u * u * u * 0 + 3 * u * u * t * 0 + 3 * u * t * t * 3.641 + t * t * t * 7.995]);
  }
  const top = [[30.059, 8.074], [30.059, 16.385], [24.745, 21.689], [10.786, 7.757], [0.078, 18.443], [0.078, 10.132], [10.230, 0], ...corner];
  const bot = [[27.046, 23.984], [30.06, 20.976], [30.06, 30], [0, 30], [0, 23.034], [10.787, 12.348], [24.746, 26.28]];
  return { top, bot };
}
const P_TOP = new Path2D(MARK_TOP), P_BOT = new Path2D(MARK_BOT);

// Draw the mark with its tile's centre at (cx, cy), tile height `size` px.
export function mark(ctx, cx, cy, size, color = C.lime, { top = 1, bot = 1 } = {}) {
  const s = size / MARK_H;
  ctx.save();
  ctx.translate(cx - (MARK_W / 2) * s, cy - (MARK_H / 2) * s);
  ctx.scale(s, s);
  ctx.fillStyle = color;
  if (bot > 0) { ctx.globalAlpha *= bot; ctx.fill(P_BOT); ctx.globalAlpha /= bot; }
  if (top > 0) { ctx.globalAlpha *= top; ctx.fill(P_TOP); }
  ctx.restore();
}

/* -------------------------------------------------------------- the wordmark */
// zemyth-wordmark.svg (168 × 32): mark + lowercase "zemyth", bottom-aligned.
const WM = [
  'M32.5632 8.61222V17.4777L26.8947 23.1348L12.0045 8.27448L0.583008 19.673V10.8075L11.4123 0H24.0182C28.756 0 32.6478 3.88394 32.6478 8.52778L32.5632 8.61222Z',
  'M29.3498 25.5831L32.5648 22.3746V32.0001H0.5V24.5699L12.0061 13.1714L24.4428 25.5831L26.8963 28.0317L29.3498 25.5831Z',
  'M60.4189 29.4678V31.9999H40.6475V29.2932L54.9074 19.6014H41.9597V17.0693H60.5064V19.7761L46.2465 29.3805H60.5064L60.4189 29.4678Z',
  'M82.8127 22.832V25.8007H66.3656V26.0626C66.3656 28.3328 67.7653 29.3805 70.1274 29.3805H80.9755V31.9126H68.5527C65.4033 31.9126 62.8662 29.2932 62.8662 26.2372V22.7447C62.8662 19.6014 65.4033 17.0693 68.5527 17.0693H77.2137C80.3631 17.0693 82.9002 19.6887 82.9002 22.7447H82.8127V22.832ZM79.2258 23.0066C79.2258 20.7365 77.8261 19.6887 75.5515 19.6887H70.2149C67.9403 19.6887 66.4531 20.7365 66.4531 23.0066V23.2686H79.2258V23.0066Z',
  'M108.273 32V23.0067C108.273 20.7366 106.873 19.6888 104.511 19.6888H100.661V32H96.9871V19.6888H95.2374L89.3759 26.0627V32H85.7891V17.1567H89.3759V22.3082L94.0126 17.1567H105.998C109.147 17.1567 111.684 19.7761 111.684 22.8321V32H108.098H108.273Z',
  'M120.783 32V27.4597L112.122 17.1567H115.621L122.533 25.3642L129.444 17.1567H132.943L124.282 27.4597V32H120.783Z',
  'M136.531 32.0001V19.689H134.693V17.1569H136.531V12.0054H140.117V17.1569H144.929V19.689H140.117V32.0001H136.531Z',
  'M163.912 32.0001V23.0069C163.912 20.7367 162.512 19.689 160.15 19.689H156.738L150.964 26.0628V32.0001H147.29V12.0054H150.964V22.3084L155.601 17.1569H161.812C164.962 17.1569 167.499 19.7763 167.499 22.8322V32.0001H163.912Z',
].map((d) => new Path2D(d));
export const WORDMARK = { w: 168, h: 32, markW: 33.15, lettersX: 40.6 };

// Lockup at (x, y) = top-left of the mark tile, height h px. `reveal` 0 → 1 slides the letters out
// from behind the mark (clipped at the mark's right edge), the way a lockup unpacks.
export function lockup(ctx, x, y, h, color = C.lime, { reveal = 1, markAlpha = 1 } = {}) {
  const s = h / 32;
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s, s);
  ctx.fillStyle = color;
  if (markAlpha > 0) { ctx.globalAlpha *= markAlpha; ctx.fill(WM[0]); ctx.fill(WM[1]); ctx.globalAlpha /= markAlpha; }
  if (reveal > 0) {
    ctx.save();
    ctx.beginPath();
    ctx.rect(35.5, -4, 140, 40);
    ctx.clip();
    ctx.translate(-(1 - reveal) * 132, 0);
    for (let i = 2; i < WM.length; i++) ctx.fill(WM[i]);
    ctx.restore();
  }
  ctx.restore();
}
export const lockupWidth = (h) => (167.5 / 32) * h;

/* ------------------------------------------------------------------- shapes */
export function rr(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, Math.max(0, Math.min(r, w / 2, h / 2)));
}

// Rounded card: near-black surface, optional lime (or hairline white) stroke drawn inside the edge.
export function card(ctx, x, y, w, h, { r = 32, fill = C.ink, stroke = null, lw = 3 } = {}) {
  if (fill) { ctx.fillStyle = fill; rr(ctx, x, y, w, h, r); ctx.fill(); }
  if (stroke) {
    ctx.strokeStyle = stroke;
    ctx.lineWidth = lw;
    rr(ctx, x + lw / 2, y + lw / 2, w - lw, h - lw, r - lw / 2);
    ctx.stroke();
  }
}

// Pill around a centre, rotated by `tilt` radians.
export function pill(ctx, cx, cy, w, h, { fill = C.lime, stroke = null, lw = 3, tilt = 0 } = {}) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(tilt);
  if (fill) { ctx.fillStyle = fill; rr(ctx, -w / 2, -h / 2, w, h, h / 2); ctx.fill(); }
  if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = lw; rr(ctx, -w / 2 + lw / 2, -h / 2 + lw / 2, w - lw, h - lw, (h - lw) / 2); ctx.stroke(); }
  ctx.restore();
}

// Cap height of the display face at size s (measured once, cached).
const capCache = {};
export function capH(ctx, s, f = FONTS.display, w = 700) {
  const k = `${f}|${w}`;
  if (!capCache[k]) {
    ctx.save();
    font(ctx, { f, w, s: 100 });
    const m = ctx.measureText('H');
    capCache[k] = m.actualBoundingBoxAscent / 100;
    ctx.restore();
  }
  return capCache[k] * s;
}

/* ------------------------------------------------------- headline + keyword */
// Lay out a one-line display headline. Returns word boxes so a keyword pill can be placed (or
// magic-moved between two headlines). Words are measured with the tracking applied.
export function layoutLine(ctx, words, x, baseline, size, { ls = 0.0, align = 'left', f = FONTS.display } = {}) {
  ctx.save();
  font(ctx, { f, w: 700, s: size, ls });
  const space = ctx.measureText(' ').width;
  const widths = words.map((w) => ctx.measureText(w).width - ls * size);  // trailing tracking is not ink
  ctx.restore();
  const total = widths.reduce((a, b) => a + b, 0) + space * (words.length - 1);
  let cx = align === 'center' ? x - total / 2 : align === 'right' ? x - total : x;
  const ch = capH(ctx, size, f);
  const boxes = words.map((w, i) => {
    const b = { text: w, x: cx, w: widths[i], y: baseline - ch, h: ch, baseline, size };
    cx += widths[i] + space;
    return b;
  });
  return { boxes, total, capH: ch, x0: boxes[0].x, size, ls, f };
}

// The pill that sits behind a keyword: 1.62 × cap height tall, 0.34 × cap height side padding.
export function pillRect(box, { padX = 0.36, padY = 0.31, trimRight = 0 } = {}) {
  const ch = box.h;
  return { cx: box.x + (box.w - trimRight) / 2, cy: box.y + ch / 2, w: box.w - trimRight + ch * padX * 2, h: ch * (1 + padY * 2) };
}
export const lerpRect = (a, b, t) => ({ cx: lerp(a.cx, b.cx, t), cy: lerp(a.cy, b.cy, t), w: lerp(a.w, b.w, t), h: lerp(a.h, b.h, t) });

/* ----------------------------------------------------------------- stickers */
// Star-burst badge path (n spikes), centred at the origin.
export function burstPath(ctx, R, r, n = 20, rot = 0) {
  ctx.beginPath();
  for (let i = 0; i < n * 2; i++) {
    const a = rot + (i / (n * 2)) * Math.PI * 2 - Math.PI / 2;
    const rad = i % 2 === 0 ? R : r;
    const px = Math.cos(a) * rad, py = Math.sin(a) * rad;
    if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
  }
  ctx.closePath();
}

// Four-point sparkle (concave sides), the moodboard's ✦.
export function sparkle(ctx, cx, cy, R, color = C.white, rot = 0) {
  if (R <= 0.3) return;
  const k = R * 0.16;
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(rot);
  ctx.beginPath();
  ctx.moveTo(0, -R);
  ctx.quadraticCurveTo(k, -k, R, 0);
  ctx.quadraticCurveTo(k, k, 0, R);
  ctx.quadraticCurveTo(-k, k, -R, 0);
  ctx.quadraticCurveTo(-k, -k, 0, -R);
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();
  ctx.restore();
}

// Pop envelope for stickers: 0 → overshoot → 1, then optional exit.
export function popScale(p) {
  if (p <= 0) return 0;
  if (p >= 1) return 1;
  // critically-tuned overshoot (≈ 12 %) that settles by p = 1
  return 1 - Math.exp(-6 * p) * Math.cos(9.5 * p) * (1 - p * 0.2);
}

/* ------------------------------------------------------------ hand-drawn ink */
// Catmull-Rom through points → dense polyline with cumulative length (for constant pen speed).
export function inkPath(pts, steps = 14) {
  const out = [];
  const P = (i) => pts[clamp(i, 0, pts.length - 1)];
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = P(i - 1), p1 = P(i), p2 = P(i + 1), p3 = P(i + 2);
    for (let s = 0; s < steps; s++) {
      const t = s / steps, t2 = t * t, t3 = t2 * t;
      out.push([
        0.5 * (2 * p1[0] + (-p0[0] + p2[0]) * t + (2 * p0[0] - 5 * p1[0] + 4 * p2[0] - p3[0]) * t2 + (-p0[0] + 3 * p1[0] - 3 * p2[0] + p3[0]) * t3),
        0.5 * (2 * p1[1] + (-p0[1] + p2[1]) * t + (2 * p0[1] - 5 * p1[1] + 4 * p2[1] - p3[1]) * t2 + (-p0[1] + 3 * p1[1] - 3 * p2[1] + p3[1]) * t3),
      ]);
    }
  }
  out.push(pts[pts.length - 1]);
  const len = [0];
  for (let i = 1; i < out.length; i++) len.push(len[i - 1] + Math.hypot(out[i][0] - out[i - 1][0], out[i][1] - out[i - 1][1]));
  return { pts: out, len, total: len[len.length - 1] };
}

// Draw the first `p` (0–1) of an ink path, then its arrowhead once the stroke arrives.
export function drawArrow(ctx, path, p, { color = C.white, w = 5, head = 26, headP = 1 } = {}) {
  if (p <= 0) return;
  const L = path.total * clamp(p);
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = w;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.beginPath();
  let end = path.pts[0], dir = [1, 0];
  ctx.moveTo(end[0], end[1]);
  for (let i = 1; i < path.pts.length; i++) {
    if (path.len[i] >= L) {
      const a = path.pts[i - 1], b = path.pts[i];
      const f = (L - path.len[i - 1]) / Math.max(1e-6, path.len[i] - path.len[i - 1]);
      end = [lerp(a[0], b[0], f), lerp(a[1], b[1], f)];
      dir = [b[0] - a[0], b[1] - a[1]];
      ctx.lineTo(end[0], end[1]);
      break;
    }
    end = path.pts[i];
    dir = [path.pts[i][0] - path.pts[i - 1][0], path.pts[i][1] - path.pts[i - 1][1]];
    ctx.lineTo(end[0], end[1]);
  }
  ctx.stroke();
  if (p >= 1 && headP > 0) {
    const a = Math.atan2(dir[1], dir[0]);
    const hl = head * clamp(headP);
    ctx.beginPath();
    for (const s of [-1, 1]) {
      ctx.moveTo(end[0], end[1]);
      ctx.lineTo(end[0] - Math.cos(a + s * 0.52) * hl, end[1] - Math.sin(a + s * 0.52) * hl);
    }
    ctx.stroke();
  }
  ctx.restore();
}
