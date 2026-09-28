// Bar 9 · EVIDENCE (drop B).
// The strongest frame, picked up from the 3D push-in at the same pixels, with the product's
// SignalReadout building beside it: five slots, always five, values counting up in tabular mono;
// what the platform did not disclose says so. The SPEND slot then opens into the next scene.
import { W, H, BEAT, C, FONTS } from '../config.js';
import { ease, seg, clamp, lerp } from '../util.js';
import { font, rgba, fillR, strokeR } from '../draw2d.js';
import { ADS, slots, readout } from '../assets.js';
import { drawAdCard, platformBadge, corners } from '../ui.js';
import { icon } from '../icons.js';
import { B, DETAIL_T } from '../score.js';
import { HERO_RECT } from './grid.js';

const AD = ADS[0];
const PX = 900, PW = 840;              // readout panel
const BAR = { x: PX, y: 318, w: 124, h: 12, gap: 17 };
const ROWS_Y = 402, ROW_H = 84;
export const SPEND_SLOT = { x: BAR.x, y: BAR.y, w: BAR.w, h: BAR.h };

function countUp(text, p) {
  // animate every number in the string from 0, keeping units and separators
  return text.replace(/(\d+(?:\.\d+)?)/g, (m) => {
    const v = Number(m) * ease.outCubic(clamp(p));
    return m.includes('.') ? v.toFixed(1) : String(Math.round(v));
  });
}

function draw(ctx, t) {
  const gb = t / BEAT;
  ctx.fillStyle = C.well;
  ctx.fillRect(0, 0, W, H);

  // creative: exactly where the 3D push-in left it, drifting in slowly
  const push = seg(gb, 32, 36, ease.inOutSine);
  const k = 1 + 0.03 * push;
  const cx = HERO_RECT.x + HERO_RECT.w / 2, cy = HERO_RECT.y + 400;
  ctx.save();
  ctx.translate(cx, cy); ctx.scale(k, k); ctx.translate(-cx, -cy);
  drawAdCard(ctx, AD, HERO_RECT.x, HERO_RECT.y, HERO_RECT.w, {});
  // the meta strip under the image falls away so the frame reads as a single creative
  ctx.fillStyle = rgba(C.well, seg(gb, 32.0, 32.5, ease.outCubic));
  ctx.fillRect(HERO_RECT.x - 4, HERO_RECT.y + 800 + 1, HERO_RECT.w + 8, 400);
  ctx.restore();
  corners(ctx, HERO_RECT.x - 22 * k, HERO_RECT.y - 22 * k, HERO_RECT.w * k + 44, 800 * k + 44, { arm: 46, r: 14, lw: 3, color: '#DCE7E5' });

  // header
  const hIn = seg(gb, 32.0, 32.45, ease.brand);
  ctx.save();
  ctx.globalAlpha = hIn;
  ctx.translate(0, (1 - hIn) * 18);
  ctx.fillStyle = 'rgba(255,255,255,0.08)';
  ctx.beginPath(); ctx.arc(PX + 28, 176, 28, 0, Math.PI * 2); ctx.fill();
  font(ctx, { f: FONTS.mono, w: 500, s: 22 });
  ctx.fillStyle = C.wellDim; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText('N', PX + 28, 177);
  ctx.textAlign = 'left';
  font(ctx, { f: FONTS.sans, w: 600, s: 46 });
  ctx.fillStyle = C.wellText;
  ctx.fillText(AD.brand, PX + 76, 174);
  const nw = ctx.measureText(AD.brand).width;
  platformBadge(ctx, 'meta', PX + 76 + nw + 22, 174 - 20, 2.2, true);
  ctx.fillStyle = '#4FA37A';
  ctx.beginPath(); ctx.arc(PX + PW - 150, 175, 7, 0, Math.PI * 2); ctx.fill();
  font(ctx, { f: FONTS.mono, w: 500, s: 18 });
  ctx.letterSpacing = '2px';
  ctx.fillStyle = C.wellText;
  ctx.fillText('ACTIVE', PX + PW - 132, 176);
  ctx.restore();

  const dIn = seg(gb, 32.12, 32.55, ease.brand);
  ctx.save();
  ctx.globalAlpha = dIn;
  ctx.translate(0, (1 - dIn) * 14);
  icon(ctx, 'arrow-up-right', PX, 222, 22, C.wellDim, 2);
  font(ctx, { f: FONTS.mono, w: 400, s: 20 });
  ctx.fillStyle = C.wellDim;
  ctx.textBaseline = 'middle';
  ctx.fillText(`${AD.domain}  ·  “${AD.copy.split('.')[0]}.”`, PX + 32, 234);
  ctx.restore();
  // divider draws across
  const div = seg(gb, 32.2, 32.8, ease.brand);
  ctx.fillStyle = C.wellLine;
  ctx.fillRect(PX, 276, PW * div, 2);

  // the five slots, big: fills arrive in order
  const sl = slots(AD);
  const barIn = seg(gb, 32.3, 33.3, ease.outCubic);
  const open = seg(gb, DETAIL_T.open, DETAIL_T.end, ease.inOutQuart);
  ['SPEND', 'REACH', 'DAYS', 'VARIANTS', 'RANKED'].forEach((lab, i) => {
    const x = BAR.x + i * (BAR.w + BAR.gap), y = BAR.y;
    const a = seg(gb, 32.3 + i * 0.08, 32.6 + i * 0.08, ease.brand);
    if (a <= 0) return;
    ctx.save();
    ctx.globalAlpha = a;
    const s = sl[i];
    if (s.present) {
      fillR(ctx, x, y, BAR.w, BAR.h, BAR.h / 2, 'rgba(255,255,255,0.12)');
      const f = Math.max(0.12, s.fill) * clamp(barIn * 1.3 - i * 0.12);
      if (f > 0) fillR(ctx, x, y, Math.max(BAR.h, BAR.w * f), BAR.h, BAR.h / 2, C.sulphur);
    } else if (!(i === 0 && open > 0)) {
      strokeR(ctx, x, y, BAR.w, BAR.h, BAR.h / 2, 'rgba(255,255,255,0.4)', 2);
    }
    font(ctx, { f: FONTS.mono, w: 500, s: 14 });
    ctx.letterSpacing = '1.6px';
    ctx.fillStyle = C.wellDim;
    ctx.textBaseline = 'top';
    ctx.fillText(lab, x, y + 24);
    ctx.restore();
  });

  // readout rows: label left, value right; absent rows dimmed with their reason
  const rows = readout(AD);
  rows[4][1] = null;
  rows.forEach(([label, value], i) => {
    const at = DETAIL_T.rows + i * DETAIL_T.rowStep;
    const p = seg(gb, at, at + 0.38, ease.power2Out);
    if (p <= 0) return;
    const y = ROWS_Y + i * ROW_H;
    ctx.save();
    ctx.globalAlpha = p * (value ? 1 : 0.62);
    ctx.translate(0, (1 - p) * 10);
    ctx.fillStyle = C.wellLine;
    ctx.fillRect(PX, y + ROW_H - 1, PW, 1);
    font(ctx, { f: FONTS.mono, w: 500, s: 18 });
    ctx.letterSpacing = '2.2px';
    ctx.fillStyle = C.wellDim;
    ctx.textBaseline = 'middle';
    ctx.fillText(label, PX, y + ROW_H / 2);
    ctx.textAlign = 'right';
    if (value) {
      font(ctx, { f: FONTS.mono, w: 500, s: 40 });
      ctx.letterSpacing = '0px';
      ctx.fillStyle = '#FFFFFF';
      ctx.fillText(countUp(value, seg(gb, at, at + 0.9)), PX + PW, y + ROW_H / 2 + 2);
    } else {
      font(ctx, { f: FONTS.mono, w: 400, s: 30, i: true });
      ctx.letterSpacing = '0px';
      ctx.fillStyle = C.wellDim;
      const txt = i === 4 ? 'Not applicable' : 'Not disclosed';
      ctx.fillText(txt, PX + PW, y + ROW_H / 2 + 2);
      const tw = ctx.measureText(txt).width;
      strokeR(ctx, PX + PW - tw - 72, y + ROW_H / 2 - 5, 50, 10, 5, 'rgba(255,255,255,0.45)', 2);
    }
    ctx.restore();
  });

  const fIn = seg(gb, 34.1, 34.6, ease.brand);
  if (fIn > 0) {
    ctx.save();
    ctx.globalAlpha = fIn;
    font(ctx, { f: FONTS.mono, w: 500, s: 16 });
    ctx.letterSpacing = '2px';
    ctx.fillStyle = C.wellDim;
    ctx.textBaseline = 'middle';
    ctx.fillText('SOURCE · META AD LIBRARY · OBSERVED 28 SEP 2026', PX, 882);
    ctx.restore();
  }

  // the hollow SPEND slot opens into the next scene
  if (open > 0) {
    const x = lerp(BAR.x, 0, open), y = lerp(BAR.y, 0, open), w = lerp(BAR.w, W, open), h = lerp(BAR.h, H, open);
    const r = lerp(BAR.h / 2, 0, open);
    fillR(ctx, x, y, w, h, r, C.ground);
    strokeR(ctx, x, y, w, h, r, rgba('#FFFFFF', 0.4 * (1 - open)), 2);
  }
}

export default {
  id: 'detail',
  layers: [{ start: B(DETAIL_T.start), end: B(DETAIL_T.end), draw }],
};
