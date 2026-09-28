// Viewfinder HUD: crop marks, timecode, beat clock, chapter captions, reel timeline.
// Drawn in white; the FINAL pass recolours it to contrast with whatever sits beneath.
import { W, H, BEAT, CHAPTERS, FONTS, DURATION, FPS, BPM } from './config.js';
import { ease, seg, clamp } from './util.js';
import { font } from './draw2d.js';

const M = 64;
const pad = (n, l = 2) => String(Math.floor(n)).padStart(l, '0');

export function hudAlpha(t) {
  const gb = t / BEAT;
  return seg(gb, 0.1, 0.9, ease.outCubic) * (1 - 0.6 * seg(gb, 28, 28.5)) * (1 - seg(gb, 31.0, 31.5));
}

function caption(ctx, gb) {
  const i = clamp(Math.floor(gb / 4), 0, 7);
  const lb = gb - i * 4;
  const inn = seg(lb, 0.04, 0.55, ease.outExpo);
  const out = i === 7 ? 0 : seg(lb, 3.72, 4.0, ease.inCubic);
  const c = CHAPTERS[i];
  const x = M + 26, y = H - M - 14;
  ctx.save();
  ctx.beginPath();
  ctx.rect(x - 4, y - 70, 760, 84);
  ctx.clip();
  const dy = (1 - inn) * 60 - out * 60;
  ctx.globalAlpha = inn * (1 - out);
  font(ctx, { f: FONTS.serif, i: true, s: 40 });
  ctx.textBaseline = 'alphabetic';
  ctx.fillText(c.n, x, y - 26 + dy);
  const nw = ctx.measureText(c.n).width;
  font(ctx, { f: FONTS.mono, w: 700, s: 15 });
  ctx.letterSpacing = '4px';
  ctx.fillText(c.title, x + nw + 16, y - 30 + dy * 1.15);
  font(ctx, { f: FONTS.mono, w: 400, s: 13 });
  ctx.letterSpacing = '1px';
  ctx.globalAlpha *= 0.62;
  ctx.fillText(c.sub, x + nw + 16, y - 8 + dy * 1.3);
  ctx.restore();
}

export function drawHud(ctx, t, frame) {
  const gb = t / BEAT;
  ctx.fillStyle = '#fff';
  ctx.strokeStyle = '#fff';
  ctx.textBaseline = 'middle';

  // Crop marks draw in.
  const arm = 34 * seg(gb, 0.05, 1.1, ease.outExpo);
  ctx.lineWidth = 2;
  ctx.beginPath();
  for (const [x, y, sx, sy] of [[M, M, 1, 1], [W - M, M, -1, 1], [M, H - M, 1, -1], [W - M, H - M, -1, -1]]) {
    ctx.moveTo(x + sx * arm, y);
    ctx.lineTo(x, y);
    ctx.lineTo(x, y + sy * arm);
  }
  ctx.stroke();

  const typeIn = seg(gb, 0.3, 1.3, ease.outCubic);
  ctx.globalAlpha = typeIn;

  // Top-left: identity.
  font(ctx, { f: FONTS.mono, w: 700, s: 15 });
  ctx.letterSpacing = '4px';
  ctx.fillText('CLAUDE', M + 26, M + 16);
  const cw = ctx.measureText('CLAUDE').width;
  font(ctx, { f: FONTS.mono, w: 400, s: 15 });
  ctx.letterSpacing = '2px';
  ctx.globalAlpha = typeIn * 0.62;
  ctx.fillText('MOTION DESIGN REEL ’26', M + 26 + cw + 14, M + 16);

  // Top-right: timecode + beat clock.
  ctx.globalAlpha = typeIn;
  ctx.textAlign = 'right';
  const ss = Math.floor(t), ff = frame % FPS;
  font(ctx, { f: FONTS.mono, w: 400, s: 15 });
  ctx.letterSpacing = '2px';
  ctx.fillText(`TC 00:00:${pad(ss)}:${pad(ff)}`, W - M - 26, M + 16);
  const beatInBar = Math.floor(gb) % 4;
  const bp = 1 - clamp((gb % 1) * 3);
  for (let i = 0; i < 4; i++) {
    const s = 8 + (i === beatInBar ? 3 * bp : 0);
    const cx = W - M - 26 - (3 - i) * 18 - 4, cy = M + 44;
    if (i === beatInBar) ctx.fillRect(cx - s / 2, cy - s / 2, s, s);
    else { ctx.lineWidth = 1.5; ctx.strokeRect(cx - 4, cy - 4, 8, 8); }
  }
  ctx.globalAlpha = typeIn * 0.62;
  font(ctx, { f: FONTS.mono, w: 400, s: 12 });
  ctx.fillText(`${BPM} BPM`, W - M - 26 - 4 * 18 - 8, M + 45);

  // Bottom-right: reel timeline, one segment per chapter.
  ctx.globalAlpha = typeIn;
  const tw = 330, gap = 6, segW = (tw - gap * 7) / 8, x0 = W - M - 26 - tw, y0 = H - M - 16;
  for (let i = 0; i < 8; i++) {
    const x = x0 + i * (segW + gap);
    const f = clamp(gb / 4 - i);
    ctx.globalAlpha = typeIn * 0.25;
    ctx.fillRect(x, y0 - 1.5, segW, 3);
    ctx.globalAlpha = typeIn;
    ctx.fillRect(x, y0 - 1.5, segW * f, 3);
  }
  const ph = x0 + clamp(gb / 4, 0, 8) / 8 * tw;
  ctx.fillRect(Math.round(ph) - 1, y0 - 9, 2, 18);
  font(ctx, { f: FONTS.mono, w: 400, s: 13 });
  ctx.letterSpacing = '1px';
  const sec = (v) => `${pad(v)}.${pad((v % 1) * 100)}`;
  ctx.fillText(`${sec(t)} / ${sec(DURATION)}`, W - M - 26, H - M - 40);
  ctx.textAlign = 'left';

  caption(ctx, gb);
  ctx.globalAlpha = 1;
  ctx.letterSpacing = '0px';
}
