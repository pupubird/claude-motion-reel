// Bars 1–2 · dot → line → staff → MOTION → E·MOTION → dive through the O into 3D.
import { W, H, BEAT, BAR, COLORS as C, FONTS } from '../config.js';
import { ease, seg, clamp, lerp, rng, TAU } from '../util.js';
import { font, advances } from '../draw2d.js';
import { TYPE_CAPTION, kickPulse } from '../score.js';

const CX = W / 2, CY = H / 2;
const SIZE = 300;
const RAILS = 7;
const ZOOM = 48;
let L = null;

function layout() {
  if (L) return L;
  const ctx = document.createElement('canvas').getContext('2d');
  font(ctx, { w: 900, s: SIZE });
  const word = 'MOTION';
  const adv = advances(ctx, word);
  const o = ctx.measureText('O');
  const cap = ctx.measureText('H').actualBoundingBoxAscent;
  font(ctx, { f: FONTS.serif, i: true, s: SIZE });
  const eAsc = ctx.measureText('E').actualBoundingBoxAscent;
  const eSize = (SIZE * cap * 1.1) / eAsc;
  font(ctx, { f: FONTS.serif, i: true, s: eSize });
  const eW = ctx.measureText('E').width;
  const gap = SIZE * 0.07;
  const total = eW + gap + adv.total;
  const R = rng(7);
  L = {
    word, adv, cap, eSize, eW,
    xSolo: CX - adv.total / 2,
    xDuo: CX - total / 2 + eW + gap,
    xE: CX - total / 2,
    base: CY + cap / 2,
    o: { l: o.actualBoundingBoxLeft, r: o.actualBoundingBoxRight, a: o.actualBoundingBoxAscent, d: o.actualBoundingBoxDescent },
    rails: Array.from({ length: RAILS }, (_, i) => ({ len: 0.5 + 0.5 * R(), shift: (R() - 0.5) * 260, i })),
  };
  return L;
}

const wordX = (gb) => lerp(layout().xSolo, L.xDuo, seg(gb, 3.46, 3.93, ease.inOutQuart));

// Screen-space centre of the first O's counter (the portal). Shared with the 3D world.
export function oCenter(gb) {
  const l = layout();
  const px = wordX(Math.min(gb, 6)) + l.adv.x[1];
  const ox = px + (l.o.r - l.o.l) / 2;
  const oy = l.base - (l.o.a - l.o.d) / 2;
  const k = seg(gb, 6.0, 7.3, ease.inOutCubic);
  return { x: lerp(ox, CX, k), y: lerp(oy, CY, k), ox, oy };
}

function drawWord(ctx, gb, t, { cull = null } = {}) {
  const x = wordX(gb);
  font(ctx, { w: 900, s: SIZE });
  for (let i = 0; i < 6; i++) {
    const gx = x + L.adv.x[i];
    if (cull && cull(gx, i)) continue;
    const wave = gb >= 4 && gb < 5.95 ? -18 * kickPulse(t - (i + 1) * 0.022, 0.13) : 0;
    ctx.save();
    ctx.translate(gx, L.base + wave);
    if (i === 1 && gb >= 3) {
      ctx.fillStyle = C.hot;
      const pop = 1 + 0.12 * Math.exp(-(gb - 3) * 7) * Math.sin((gb - 3) * 14);
      const cx = (L.o.r - L.o.l) / 2, cy = -(L.o.a - L.o.d) / 2;
      ctx.translate(cx, cy);
      ctx.scale(pop, pop);
      ctx.translate(-cx, -cy);
    } else ctx.fillStyle = C.bone;
    ctx.fillText(L.word[i], 0, 0);
    ctx.restore();
  }
}

function drawE(ctx, gb, t) {
  if (gb < 3.7) return;
  const fall = seg(gb, 3.7, 4.0, ease.inQuad);
  const tau = Math.max(0, t - 4 * BEAT);
  const sq = gb >= 4 ? Math.exp(-tau * 9) * Math.cos(tau * 30) : 0;
  const wave = gb >= 4 && gb < 5.95 ? -18 * kickPulse(t, 0.13) : 0;
  ctx.save();
  ctx.translate(L.xE + L.eW * 0.45, L.base - (1 - fall) * 1000 + wave);
  ctx.scale(1 + 0.2 * sq, 1 - 0.26 * sq + (1 - fall) * 0.25);
  font(ctx, { f: FONTS.serif, i: true, s: L.eSize });
  ctx.fillStyle = C.hot;
  ctx.fillText('E', -L.eW * 0.45, 0);
  ctx.restore();
}

function drawIntro(ctx, gb) {
  // Dot pop (with anticipation squash), stretch into a line, split into rails.
  if (gb < 1.5) {
    const pop = ease.outBack(seg(gb, 0.0, 0.32), 2.2);
    const antic = seg(gb, 0.55, 0.8, ease.inOutSine) * (1 - seg(gb, 0.8, 0.95));
    const st = seg(gb, 0.8, 1.42, ease.inOutExpo);
    const w = lerp(30 * pop + antic * 14, 1400, st);
    const h = lerp(30 * pop - antic * 8, 4, seg(gb, 0.8, 1.15, ease.outExpo));
    ctx.fillStyle = C.bone;
    ctx.beginPath();
    ctx.roundRect(CX - w / 2, CY - h / 2, w, h, h / 2);
    ctx.fill();
    const rp = seg(gb, 0.02, 1.1, ease.outExpo);
    ctx.globalAlpha = 0.55 * (1 - rp);
    ctx.strokeStyle = C.bone;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(CX, CY, 16 + rp * 170, 0, TAU);
    ctx.stroke();
    ctx.globalAlpha = 1;
    return;
  }
  const top = L.base - L.cap - 24, span = L.cap + 48, sh = span / RAILS;
  // Rails fan out from the centre line.
  for (const r of L.rails) {
    const i = r.i, d = Math.abs(i - (RAILS - 1) / 2);
    const k = seg(gb, 1.5 + d * 0.05, 2.1 + d * 0.05, ease.outExpo);
    const y = lerp(CY, top + (i + 0.5) * sh, k);
    const len = lerp(1400, 1400 * r.len, k);
    const a = 1 - seg(gb, 2.25 + i * 0.06, 2.7 + i * 0.06);
    if (a <= 0) continue;
    ctx.globalAlpha = a;
    ctx.fillStyle = C.bone;
    ctx.fillRect(CX - len / 2 + r.shift * k, y - 2, len, 4);
  }
  ctx.globalAlpha = 1;
  // Word slices slide in along their rails from alternating sides.
  if (gb >= 2.0) {
    for (let i = 0; i < RAILS; i++) {
      const k = seg(gb, 2.0 + i * 0.065, 2.8 + i * 0.065, ease.outExpo);
      if (k <= 0) continue;
      const dx = (i % 2 ? 1 : -1) * 1500 * (1 - k);
      ctx.save();
      ctx.beginPath();
      ctx.rect(0, top + i * sh - 0.5, W, sh + 1);
      ctx.clip();
      ctx.translate(dx, 0);
      drawWord(ctx, gb, 0);
      ctx.restore();
    }
  }
}

function drawCaption(ctx, gb) {
  const { text, start, end } = TYPE_CAPTION;
  if (gb < start) return;
  const n = Math.min(text.length, Math.floor(((gb - start) / (end - start)) * text.length) + 1);
  const a = 1 - seg(gb, 5.85, 6.15);
  if (a <= 0) return;
  font(ctx, { f: FONTS.mono, w: 400, s: 30 });
  ctx.letterSpacing = '2px';
  const full = ctx.measureText(text).width;
  const x = CX - full / 2, y = L.base + 120;
  ctx.globalAlpha = a * 0.8;
  ctx.fillStyle = C.bone;
  ctx.fillText(text.slice(0, n), x, y);
  const cx = x + ctx.measureText(text.slice(0, n)).width + 4;
  if (Math.floor(gb * 2) % 2 === 0 || gb < end) ctx.fillRect(cx, y - 24, 16, 30);
  ctx.globalAlpha = 1;
  ctx.letterSpacing = '0px';
}

function draw(ctx, t) {
  const gb = t / BEAT;
  layout();
  ctx.fillStyle = C.ink;
  ctx.fillRect(0, 0, W, H);
  ctx.textBaseline = 'alphabetic';
  if (gb < 3.0) { drawIntro(ctx, gb); return; }
  if (gb < 6.0) {
    drawWord(ctx, gb, t);
    drawE(ctx, gb, t);
    drawCaption(ctx, gb);
    return;
  }
  // Portal: open the O's counter onto the 3D world, then dive through it.
  const oc = oCenter(gb);
  const s = Math.exp(Math.log(ZOOM) * seg(gb, 6.15, 8.0, ease.inCubic));
  const iris = seg(gb, 6.0, 6.4, ease.outExpo);
  ctx.translate(oc.x, oc.y);
  ctx.scale(s, s);
  ctx.translate(-oc.ox, -oc.oy);
  const hx = ((L.o.r + L.o.l) / 2) * 0.8, hy = ((L.o.a + L.o.d) / 2) * 0.8;
  ctx.globalCompositeOperation = 'destination-out';
  ctx.beginPath();
  ctx.ellipse(oc.ox, oc.oy, hx * iris + 0.01, hy * iris + 0.01, 0, 0, TAU);
  ctx.fill();
  ctx.globalCompositeOperation = 'source-over';
  const cull = (gx) => {
    const sx = (gx - oc.ox) * s + oc.x;
    return sx > W + 50 || sx + SIZE * 1.1 * s < -50;
  };
  drawWord(ctx, gb, t, { cull });
  drawCaption(ctx, gb);
  if ((L.xE - oc.ox) * s + oc.x + L.eW * s > -50) drawE(ctx, gb, t);
}

function fx(t) {
  const gb = t / BEAT;
  if (gb >= 8) return null;
  const tension = seg(gb, 3.3, 3.98, ease.inQuad) * (gb < 4 ? 1 : 0);
  const dive = seg(gb, 6.6, 7.95, ease.inCubic) * (1 - seg(gb, 7.95, 8.0));
  return {
    sx: tension * 0.0022 * Math.sin(t * 91),
    sy: tension * 0.0022 * Math.cos(t * 127),
    ca: tension * 1.2 + dive * 3.0,
  };
}

export default {
  id: 'type',
  layers: [{ start: 0, end: 2 * BAR, draw }],
  fx,
};
