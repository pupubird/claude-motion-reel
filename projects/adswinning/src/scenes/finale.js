// Bars 15–16 · SIGNATURE (final hit).
// The mark, now flat, pings open and the wordmark slides out from behind it. The landing's own
// headline follows with its sulphur highlighter under "copying", then the CTA. Last, everything
// collapses back into the evidence cuboid, which blinks out — the bookend to the single lit frame
// the film opened on.
import { W, H, BEAT, C, FONTS } from '../config.js';
import { ease, seg, lerp } from '../util.js';
import { font, rgba, fillR, rrect } from '../draw2d.js';
import { mark, cuboid, lockup } from '../ui.js';
import { icon } from '../icons.js';
import { B, FIN_T } from '../score.js';

const TAG = ['See', 'which', 'ads', 'are', 'worth', 'copying.'];

function draw(ctx, t) {
  const gb = t / BEAT;
  const L = lockup();
  const col = seg(gb, FIN_T.collapse, FIN_T.blink, ease.inBack);
  const dark = seg(gb, FIN_T.blink - 0.15, FIN_T.end - 0.2, ease.inOutCubic);
  ctx.fillStyle = C.ground;
  ctx.fillRect(0, 0, W, H);
  // cube centre (the collapse target)
  const cubeX = L.mark.x + 16 * (L.mark.size / 32), cubeY = L.mark.y + 14.95 * (L.mark.size / 32);
  const cx = lerp(cubeX, W / 2, col), cy = lerp(cubeY, H / 2, col);

  ctx.save();
  // collapse: the whole card scales into the cube's position
  const k = lerp(1, 0.0, col);
  ctx.translate(cx, cy); ctx.scale(Math.max(k, 0.0001), Math.max(k, 0.0001)); ctx.translate(-cubeX, -cubeY);
  ctx.globalAlpha = 1 - seg(col, 0.6, 1);

  // aperture pings: square rings opening out of the mark on the hit
  const mcx = L.mark.x + (14.375 / 32) * L.mark.size, mcy = L.cy;
  for (let i = 0; i < 3; i++) {
    const p = seg(gb, FIN_T.word + i * 0.3, FIN_T.word + 1.6 + i * 0.3);
    if (p <= 0 || p >= 1) continue;
    const s = L.mark.size * (0.9 + 1.4 * ease.outCubic(p));
    ctx.strokeStyle = rgba(C.petrol, 0.35 * (1 - p));
    ctx.lineWidth = 2;
    rrect(ctx, mcx - s / 2, mcy - s / 2, s, s, 14 + 18 * p);
    ctx.stroke();
  }

  mark(ctx, L.mark.x, L.mark.y, L.mark.size, {});

  // wordmark slides out from behind the mark
  const wp = seg(gb, FIN_T.word, FIN_T.word + 0.55, ease.outExpo);
  font(ctx, { f: FONTS.display, w: 650, s: L.text.size, ls: -0.01 });
  ctx.fillStyle = C.wordmark;
  ctx.textBaseline = 'alphabetic';
  ctx.save();
  ctx.beginPath();
  ctx.rect(L.text.x - 6, L.cy - L.text.size, W, L.text.size * 2);
  ctx.clip();
  ctx.fillText('Adswinning', L.text.x - (1 - wp) * (L.text.w + 40), L.text.base);
  ctx.restore();

  // eyebrow above
  const eb = seg(gb, FIN_T.eyebrow, FIN_T.eyebrow + 0.4, ease.brand);
  if (eb > 0) {
    ctx.save();
    ctx.globalAlpha *= eb;
    font(ctx, { f: FONTS.mono, w: 500, s: 18 });
    ctx.letterSpacing = '3px';
    ctx.fillStyle = C.slate;
    ctx.textAlign = 'center';
    ctx.fillText('META + TIKTOK AD RESEARCH', W / 2, 250 + (1 - eb) * 8);
    ctx.restore();
  }

  // the landing headline, word by word, with the sulphur mark under "copying."
  font(ctx, { f: FONTS.display, w: 800, s: 84, ls: -0.04 });
  const widths = TAG.map((w) => ctx.measureText(w).width);
  const space = ctx.measureText(' ').width;
  const total = widths.reduce((a, b) => a + b, 0) + space * (TAG.length - 1);
  let x = (W - total) / 2;
  const y = 700;
  TAG.forEach((w, i) => {
    const p = seg(gb, FIN_T.tag + i * FIN_T.tagStep, FIN_T.tag + 0.45 + i * FIN_T.tagStep, ease.outExpo);
    if (i === TAG.length - 1) {
      const hp = seg(gb, FIN_T.high, FIN_T.high + 0.45, ease.brand);
      if (hp > 0) {
        ctx.fillStyle = rgba(C.sulphur, 0.6);
        ctx.fillRect(x, y - 0.3 * 84 + 12, (widths[i] - ctx.measureText('.').width) * hp, 0.3 * 84 - 2);
      }
    }
    if (p > 0) {
      ctx.save();
      ctx.beginPath(); ctx.rect(x - 10, y - 90, widths[i] + 20, 116); ctx.clip();
      ctx.fillStyle = C.ink;
      ctx.fillText(w, x, y + (1 - p) * 96);
      ctx.restore();
    }
    x += widths[i] + space;
  });

  // CTA: the product's primary button + the address
  const cp = seg(gb, FIN_T.cta, FIN_T.cta + 0.45, ease.brand);
  if (cp > 0) {
    ctx.save();
    ctx.globalAlpha *= cp;
    ctx.translate(0, (1 - cp) * 14);
    font(ctx, { f: FONTS.sans, w: 500, s: 28 });
    ctx.letterSpacing = '0px';
    const label = 'Try a search';
    const lw = ctx.measureText(label).width;
    const bw = 34 + lw + 14 + 26 + 30, bh = 68;
    font(ctx, { f: FONTS.mono, w: 500, s: 26 });
    const url = 'adswinning.com';
    const uw = ctx.measureText(url).width;
    const rowW = bw + 40 + uw;
    const bx = (W - rowW) / 2, by = 812;
    ctx.shadowColor = 'rgba(11,22,24,0.16)'; ctx.shadowBlur = 6; ctx.shadowOffsetY = 2;
    fillR(ctx, bx, by, bw, bh, 10, C.petrol);
    ctx.shadowColor = 'transparent';
    font(ctx, { f: FONTS.sans, w: 500, s: 28 });
    ctx.fillStyle = '#fff';
    ctx.textBaseline = 'middle';
    ctx.fillText(label, bx + 34, by + bh / 2 + 1);
    icon(ctx, 'arrow-right', bx + 34 + lw + 14, by + bh / 2 - 13, 26, '#fff', 2);
    font(ctx, { f: FONTS.mono, w: 500, s: 26 });
    ctx.fillStyle = C.ink;
    ctx.fillText(url, bx + bw + 40, by + bh / 2 + 1);
    ctx.restore();
  }
  ctx.restore();

  // the cuboid remains as everything else collapses, then blinks out
  if (col > 0) {
    const s = lerp(9.7 * (L.mark.size / 32), 60, ease.outCubic(col)) * (1 - seg(gb, FIN_T.blink, FIN_T.blink + 0.35, ease.inBack));
    if (s > 0.5) cuboid(ctx, cx, cy, s);
  }
  if (dark > 0) {
    ctx.fillStyle = rgba('#000000', dark);
    ctx.fillRect(0, 0, W, H);
  }
}

export default {
  id: 'finale',
  layers: [{ start: B(FIN_T.start), end: B(FIN_T.end) + 1, draw }],
};
