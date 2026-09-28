// The reel's HUD, in Zemyth's language: Blender Pro labels, a pill for the chapter number, the
// Zembit's eyes as the beat clock. No frame border (removed at the client's request). Drawn white; the FINAL pass turns
// it black wherever it sits on lime.
import { W, H, BEAT, CHAPTERS, FONTS, DURATION, FPS, BPM, HUD_ID } from './config.js';
import { ease, seg, clamp } from './util.js';
import { font } from './draw2d.js';
import { mark, rr } from './brand.js';

const M = 56;
const pad = (n, l = 2) => String(Math.floor(n)).padStart(l, '0');

export function hudAlpha(t) {
  const gb = t / BEAT;
  return 0.9 * seg(gb, 0.9, 1.9, ease.outCubic) * (1 - 0.6 * seg(gb, 56, 56.6)) * (1 - seg(gb, 62.4, 63.0));
}

function caption(ctx, gb) {
  const i = clamp(Math.floor(gb / 8), 0, 7);
  const lb = gb - i * 8;
  const inn = seg(lb, 0.1, 0.8, ease.outExpo);
  const out = i === 7 ? 0 : seg(lb, 7.55, 8.0, ease.inCubic);
  const c = CHAPTERS[i];
  const x = M + 28, y = H - M - 20;
  ctx.save();
  ctx.beginPath();
  ctx.rect(x - 6, y - 64, 900, 84);
  ctx.clip();
  const dy = (1 - inn) * 56 - out * 56;
  ctx.globalAlpha *= inn * (1 - out);
  // chapter number in an outline pill
  font(ctx, { f: FONTS.label, w: 700, s: 17 });
  ctx.letterSpacing = '2px';
  const nw = ctx.measureText(c.n).width;
  const pw = nw + 26, ph = 28, py = y - 38 + dy;
  ctx.lineWidth = 1.5;
  rr(ctx, x + 0.75, py - ph / 2 + 0.75, pw - 1.5, ph - 1.5, (ph - 1.5) / 2);
  ctx.stroke();
  ctx.textBaseline = 'middle';
  ctx.fillText(c.n, x + 13, py + 1);
  font(ctx, { f: FONTS.label, w: 700, s: 17 });
  ctx.letterSpacing = '4px';
  ctx.fillText(c.title, x + pw + 14, py + 1);
  font(ctx, { f: FONTS.sans, w: 400, s: 14 });
  ctx.letterSpacing = '0.2px';
  ctx.globalAlpha *= 0.62;
  ctx.fillText(c.sub, x + 2, y - 4 + dy * 1.25);
  ctx.restore();
}

export function drawHud(ctx, t, frame) {
  const gb = t / BEAT;
  ctx.fillStyle = '#fff';
  ctx.strokeStyle = '#fff';
  ctx.textBaseline = 'middle';

  const typeIn = seg(gb, 0.9, 1.9, ease.outCubic);
  ctx.globalAlpha = typeIn;

  // Top-left: the mark (white is an allowed logo colour) + identity.
  mark(ctx, M + 28 + 11, M + 22, 20, '#fff');
  font(ctx, { f: FONTS.label, w: 700, s: 17 });
  ctx.letterSpacing = '4px';
  ctx.fillText(HUD_ID.name, M + 28 + 32, M + 23);
  const cw = ctx.measureText(HUD_ID.name).width;
  font(ctx, { f: FONTS.label, w: 400, s: 16 });
  ctx.letterSpacing = '2px';
  ctx.globalAlpha = typeIn * 0.62;
  ctx.fillText(HUD_ID.sub, M + 28 + 32 + cw + 12, M + 23);

  // Top-right: timecode + a beat clock drawn as the Zembit's eyes.
  ctx.globalAlpha = typeIn;
  ctx.textAlign = 'right';
  const ss = Math.floor(t), ff = frame % FPS;
  font(ctx, { f: FONTS.label, w: 400, s: 17 });
  ctx.letterSpacing = '2px';
  ctx.fillText(`TC 00:00:${pad(ss)}:${pad(ff)}`, W - M - 28, M + 23);
  const beatInBar = Math.floor(gb) % 4;
  const bp = 1 - clamp((gb % 1) * 3);
  for (let i = 0; i < 4; i++) {
    const cx = W - M - 28 - (3 - i) * 18 - 5, cy = M + 51;
    if (i === beatInBar) {
      const s = 1 + 0.35 * bp;
      rr(ctx, cx - 5 * s, cy - 6 * s, 10 * s, 12 * s, 2.6 * s);
      ctx.fill();
    } else {
      ctx.lineWidth = 1.5;
      rr(ctx, cx - 4.25, cy - 5.25, 8.5, 10.5, 2.2);
      ctx.stroke();
    }
  }
  ctx.globalAlpha = typeIn * 0.62;
  font(ctx, { f: FONTS.label, w: 400, s: 15 });
  ctx.fillText(`${BPM} BPM`, W - M - 28 - 4 * 18 - 10, M + 52);

  // Bottom-right: reel timeline, one rounded segment per chapter.
  ctx.globalAlpha = typeIn;
  const tw = 330, gap = 6, segW = (tw - gap * 7) / 8, x0 = W - M - 28 - tw, y0 = H - M - 22;
  for (let i = 0; i < 8; i++) {
    const x = x0 + i * (segW + gap);
    const f = clamp(gb / 8 - i);
    ctx.globalAlpha = typeIn * 0.25;
    rr(ctx, x, y0 - 2, segW, 4, 2); ctx.fill();
    if (f > 0) { ctx.globalAlpha = typeIn; rr(ctx, x, y0 - 2, Math.max(4, segW * f), 4, 2); ctx.fill(); }
  }
  font(ctx, { f: FONTS.label, w: 400, s: 16 });
  ctx.letterSpacing = '1px';
  ctx.globalAlpha = typeIn;
  const sec = (v) => `${pad(v)}.${pad((v % 1) * 100)}`;
  ctx.fillText(`${sec(t)} / ${sec(DURATION)}`, W - M - 28, H - M - 46);
  ctx.textAlign = 'left';

  caption(ctx, gb);
  ctx.globalAlpha = 1;
  ctx.letterSpacing = '0px';
}
