// Bar 11 · HONESTY — missing is never zero.
// A naive readout slams "$0". It is rejected: the dollar sign drops, the zero's ring morphs into
// the product's hollow tick, and "Not disclosed" types beside it. Then the principle, with the one
// sulphur mark under the words that carry it.
import { W, H, BEAT, C, FONTS } from '../config.js';
import { ease, seg, lerp } from '../util.js';
import { font, rgba } from '../draw2d.js';
import { B, ZERO_T, NOT_DISCLOSED as NOT, typeTimesZero } from '../score.js';


const SZ = 440;            // "$0" size
const ZX = 960, ZY = 610;  // "$0" centre-baseline
const PILL = { cx: 598, cy: 432, w: 176, h: 34, lw: 5 };

function draw(ctx, t) {
  const gb = t / BEAT;
  ctx.fillStyle = C.ground;
  ctx.fillRect(0, 0, W, H);
  const out = seg(gb, ZERO_T.out, ZERO_T.end, ease.inCubic);
  ctx.save();
  ctx.translate(0, -out * 120);
  ctx.globalAlpha = 1 - out;

  // "SPEND" label (the naive readout's field name)
  const lab = seg(gb, 40.0, 40.3, ease.brand);
  font(ctx, { f: FONTS.mono, w: 500, s: 26 });
  ctx.letterSpacing = '4px';
  ctx.fillStyle = C.slate;
  ctx.textBaseline = 'alphabetic';
  const labX = lerp(ZX - 250, PILL.cx - PILL.w / 2, seg(gb, ZERO_T.morph, ZERO_T.morph + 0.5, ease.inOutCubic));
  const labY = lerp(ZY - 380, PILL.cy - 58, seg(gb, ZERO_T.morph, ZERO_T.morph + 0.5, ease.inOutCubic));
  ctx.globalAlpha = (1 - out) * lab;
  ctx.fillText('SPEND', labX, labY);
  ctx.globalAlpha = 1 - out;

  // "$0": slam, shudder, reject
  font(ctx, { f: FONTS.display, w: 800, s: SZ, ls: -0.04 });
  const m$ = ctx.measureText('$'), m0 = ctx.measureText('0');
  const full = ctx.measureText('$0').width;
  const x0 = ZX - full / 2;
  const slam = seg(gb, ZERO_T.slam, ZERO_T.slam + 0.14, ease.outCubic);
  const shake = gb > ZERO_T.reject && gb < ZERO_T.reject + 0.2 ? Math.sin((gb - ZERO_T.reject) * 120) * 14 * (1 - seg(gb, ZERO_T.reject, ZERO_T.reject + 0.2)) : 0;
  const drop = seg(gb, ZERO_T.reject + 0.08, ZERO_T.reject + 0.6, ease.inCubic);
  const morph = seg(gb, ZERO_T.morph, ZERO_T.morph + 0.55, ease.inOutCubic);
  if (slam > 0) {
    ctx.fillStyle = C.ink;
    // dollar sign: falls away and fades
    if (drop < 1) {
      ctx.save();
      ctx.globalAlpha = (1 - out) * slam * (1 - drop);
      ctx.translate(x0 + shake, ZY + drop * 260);
      ctx.rotate(-drop * 0.25);
      ctx.scale(lerp(1.25, 1, slam), lerp(1.25, 1, slam));
      ctx.fillText('$', 0, 0);
      ctx.restore();
    }
    // the zero: glyph first, then its ring takes over and morphs into the hollow tick
    const g = m0;
    const gx = x0 + m$.width + shake;
    const gw = g.actualBoundingBoxRight - g.actualBoundingBoxLeft, gh = g.actualBoundingBoxAscent + g.actualBoundingBoxDescent;
    const gcx = gx + (g.actualBoundingBoxLeft * -1 + g.actualBoundingBoxRight) / 2, gcy = ZY - g.actualBoundingBoxAscent + gh / 2;
    if (morph <= 0) {
      ctx.save();
      ctx.globalAlpha = (1 - out) * slam;
      ctx.translate(gx, ZY);
      ctx.scale(lerp(1.25, 1, slam), lerp(1.25, 1, slam));
      ctx.fillText('0', 0, 0);
      ctx.restore();
    } else {
      const ring = 0.2 * SZ;                      // stroke weight of the heavy zero
      const w = lerp(gw - ring * 0.95, PILL.w, morph), h = lerp(gh - ring * 0.95, PILL.h, morph);
      const cx = lerp(gcx, PILL.cx, morph), cy = lerp(gcy, PILL.cy, morph);
      const lw = lerp(ring, PILL.lw, ease.outCubic(morph));
      ctx.save();
      ctx.strokeStyle = C.ink;
      ctx.lineWidth = lw;
      ctx.beginPath();
      ctx.roundRect(cx - w / 2, cy - h / 2, w, h, Math.min(w, h) / 2);
      ctx.stroke();
      ctx.restore();
    }
  }

  // "Not disclosed", typed beside the hollow tick
  const tt = typeTimesZero();
  let n = 0;
  for (const x of tt) if (gb >= x) n++;
  if (n > 0) {
    font(ctx, { f: FONTS.mono, w: 400, s: 70, i: true });
    ctx.fillStyle = C.slate;
    ctx.textBaseline = 'middle';
    ctx.fillText(NOT.slice(0, n), PILL.cx + PILL.w / 2 + 44, PILL.cy + 4);
    if (gb < ZERO_T.head + 0.5 && Math.floor(gb * 4) % 2 === 0) {
      const cw = ctx.measureText(NOT.slice(0, n)).width;
      ctx.fillStyle = C.sulphur;
      ctx.fillRect(PILL.cx + PILL.w / 2 + 50 + cw, PILL.cy - 32, 4, 64);
    }
  }

  // the principle, with the sulphur mark under "never zero."
  const lines = [['Missing is', ZERO_T.head], ['never zero.', ZERO_T.head + 0.25]];
  font(ctx, { f: FONTS.display, w: 800, s: 176, ls: -0.045 });
  ctx.textBaseline = 'alphabetic';
  lines.forEach(([text, at], i) => {
    const p = seg(gb, at, at + 0.45, ease.outExpo);
    if (p <= 0) return;
    const x = PILL.cx - PILL.w / 2 - 8, y = 700 + i * 170;
    if (i === 1) {
      const mk = seg(gb, ZERO_T.mark, ZERO_T.mark + 0.4, ease.brand);
      const wv = ctx.measureText(text).width;
      ctx.fillStyle = rgba(C.sulphur, 0.6);
      ctx.fillRect(x, y - 0.3 * 176 + 34, wv * mk, 0.3 * 176 - 12);
    }
    ctx.save();
    ctx.beginPath(); ctx.rect(x - 30, y - 176, W, 176 * 1.3); ctx.clip();
    ctx.fillStyle = C.ink;
    ctx.fillText(text, x, y + (1 - p) * 190);
    ctx.restore();
  });
  ctx.restore();
}

export default {
  id: 'zero',
  layers: [{ start: B(ZERO_T.start), end: B(ZERO_T.end), draw }],
};
