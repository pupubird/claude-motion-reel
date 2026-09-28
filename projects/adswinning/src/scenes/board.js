// Bar 12 · the Deep Research board: from swipe file to strategy.
// Ranked frames on the left, the strategies they evidence on the right, connected by hairlines
// drawn with a constant-speed pen. Then everything converges into the sulphur evidence cuboid
// (hand-off to the 3D mark, bar 13).
import { W, H, BEAT, C, FONTS } from '../config.js';
import { ease, seg, clamp, lerp } from '../util.js';
import { font, rgba, fillR, strokeR, rrect } from '../draw2d.js';
import { drawCover } from '../assets.js';
import { cuboid } from '../ui.js';
import { B, BOARD_T } from '../score.js';

export const CUBE0 = { cx: W / 2, cy: H / 2, size: 158 };   // where the 3D cube picks up

const THUMBS = ['northpour-lake', 'northpour-camp', 'brewbird-car', 'loopday-splash', 'brewbird-unbox', 'kiln-pour'];
const TW = 118, TH = 148, TG = 16;
const TX = 400, TY = 470;
const thumbRect = (i) => ({ x: TX + (i % 2) * (TW + TG), y: TY + Math.floor(i / 2) * (TH + TG), w: TW, h: TH });
const CARDS = [
  { label: 'HOOK', text: 'Sunrise ritual, before the day starts', meta: '2 ADS · UP TO 94 DAYS', from: [0, 1] },
  { label: 'ANGLE', text: 'Clean energy, no afternoon crash', meta: '3 ADS · UP TO 71 DAYS', from: [2, 3, 5] },
  { label: 'OFFER', text: 'First 12-pack ships free', meta: '1 AD · 19 DAYS', from: [4] },
];
const CX = 856, CWD = 700, CH = 128, CG = 26;
const cardRect = (i) => ({ x: CX, y: TY + i * (CH + CG), w: CWD, h: CH });

function draw(ctx, t) {
  const gb = t / BEAT;
  ctx.fillStyle = C.ground;
  ctx.fillRect(0, 0, W, H);
  const conv = seg(gb, BOARD_T.converge, BOARD_T.end, ease.inQuart);
  // everything pulls in toward the cube's position as it converges
  const pull = (x, y) => [lerp(x, CUBE0.cx, conv), lerp(y, CUBE0.cy, conv)];
  const shrink = 1 - conv;

  // title
  font(ctx, { f: FONTS.mono, w: 500, s: 18 });
  ctx.letterSpacing = '2.6px';
  ctx.fillStyle = C.sulphurInk;
  ctx.globalAlpha = seg(gb, 44.0, 44.3) * shrink;
  ctx.textBaseline = 'alphabetic';
  ctx.fillText('DEEP RESEARCH · BOARD', 154, 196);
  ctx.globalAlpha = 1;
  font(ctx, { f: FONTS.display, w: 800, s: 124, ls: -0.045 });
  ctx.fillStyle = C.ink;
  [['From swipe file', 44.0], ['to strategy.', 44.2]].forEach(([s, at], i) => {
    const p = seg(gb, at, at + 0.45, ease.outExpo);
    if (p <= 0) return;
    const y = 318 + i * 118;
    ctx.save();
    ctx.globalAlpha = shrink;
    ctx.beginPath(); ctx.rect(140, y - 124, W, 150); ctx.clip();
    ctx.fillText(s, 150, y + (1 - p) * 130 - conv * 130);
    ctx.restore();
  });

  // connectors (under the cards)
  CARDS.forEach((cd, ci) => {
    cd.from.forEach((ti, k) => {
      const a = thumbRect(ti), b = cardRect(ci);
      const p = seg(gb, BOARD_T.lines + (ci * 2 + k) * 0.09, BOARD_T.lines + 0.55 + (ci * 2 + k) * 0.09, ease.inOutCubic);
      if (p <= 0) return;
      const [x0, y0] = pull(a.x + a.w, a.y + a.h / 2), [x1, y1] = pull(b.x, b.y + b.h / 2);
      const path = new Path2D();
      const mx = (x0 + x1) / 2;
      path.moveTo(x0, y0);
      path.bezierCurveTo(mx, y0, mx, y1, x1, y1);
      ctx.save();
      ctx.setLineDash([900, 900]);
      ctx.lineDashOffset = 900 * (1 - p);
      ctx.strokeStyle = rgba(C.petrol, 0.55 * shrink);
      ctx.lineWidth = 2;
      ctx.stroke(path);
      ctx.restore();
      ctx.fillStyle = rgba(C.petrol, shrink);
      ctx.beginPath(); ctx.arc(x0, y0, 4.5 * p, 0, Math.PI * 2); ctx.fill();
      if (p > 0.95) { ctx.beginPath(); ctx.arc(x1, y1, 4.5, 0, Math.PI * 2); ctx.fill(); }
    });
  });

  // thumbnails (ranked frames from the grid)
  THUMBS.forEach((id, i) => {
    const r = thumbRect(i);
    const p = seg(gb, BOARD_T.thumbs + i * 0.085, BOARD_T.thumbs + 0.4 + i * 0.085, ease.outBack);
    if (p <= 0) return;
    const [cx, cy] = pull(r.x + r.w / 2, r.y + r.h / 2);
    const k = p * lerp(1, 0.05, conv);
    ctx.save();
    ctx.translate(cx, cy); ctx.scale(k, k);
    ctx.shadowColor = 'rgba(11,22,24,0.18)'; ctx.shadowBlur = 18; ctx.shadowOffsetY = 6;
    fillR(ctx, -r.w / 2, -r.h / 2, r.w, r.h, 8, C.wellLift);
    ctx.shadowColor = 'transparent';
    rrect(ctx, -r.w / 2, -r.h / 2, r.w, r.h, 8);
    ctx.clip();
    drawCover(ctx, id, -r.w / 2, -r.h / 2, r.w, r.h);
    ctx.restore();
  });

  // strategy cards
  CARDS.forEach((cd, i) => {
    const r = cardRect(i);
    const p = seg(gb, BOARD_T.cards + i * 0.12, BOARD_T.cards + 0.45 + i * 0.12, ease.brand);
    if (p <= 0) return;
    const [cx, cy] = pull(r.x + r.w / 2, r.y + r.h / 2);
    const k = lerp(1, 0.05, conv);
    ctx.save();
    ctx.globalAlpha = p;
    ctx.translate(cx, cy + (1 - p) * 20); ctx.scale(k, k); ctx.translate(-r.w / 2, -r.h / 2);
    ctx.shadowColor = 'rgba(11,22,24,0.08)'; ctx.shadowBlur = 20; ctx.shadowOffsetY = 6;
    fillR(ctx, 0, 0, r.w, r.h, 10, C.surfaceLift);
    ctx.shadowColor = 'transparent';
    strokeR(ctx, 0, 0, r.w, r.h, 10, C.line);
    // cut corner, the one sulphur mark, lit on this card's evidence
    ctx.save();
    ctx.beginPath(); ctx.moveTo(r.w - 30, 0); ctx.lineTo(r.w, 0); ctx.lineTo(r.w, 30); ctx.closePath();
    ctx.fillStyle = i === 0 ? C.sulphur : rgba(C.petrol, 0.2);
    ctx.fill();
    ctx.restore();
    font(ctx, { f: FONTS.mono, w: 500, s: 17 });
    ctx.letterSpacing = '2.6px';
    ctx.fillStyle = C.petrol;
    ctx.textBaseline = 'alphabetic';
    ctx.fillText(cd.label, 28, 42);
    font(ctx, { f: FONTS.sans, w: 500, s: 32 });
    ctx.fillStyle = C.ink;
    ctx.fillText(cd.text, 28, 88);
    const cp = seg(gb, BOARD_T.counts + i * 0.1, BOARD_T.counts + 0.4 + i * 0.1);
    font(ctx, { f: FONTS.mono, w: 400, s: 16 });
    ctx.letterSpacing = '1.6px';
    ctx.fillStyle = C.slate;
    ctx.globalAlpha = p * cp;
    ctx.fillText(cd.meta, 28, 116);
    ctx.restore();
  });

  // the cuboid gathers what converges
  if (conv > 0) {
    const s = CUBE0.size * ease.outBack(clamp(conv * 1.15));
    cuboid(ctx, CUBE0.cx, CUBE0.cy, s, clamp(conv * 3));
  }
}

export default {
  id: 'board',
  layers: [{ start: B(BOARD_T.start), end: B(BOARD_T.end), draw }],
};
