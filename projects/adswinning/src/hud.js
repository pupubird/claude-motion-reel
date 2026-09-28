// Viewfinder HUD in the Proof Aperture language: rounded inspection corners, timecode,
// beat clock, chapter captions and a reel timeline. Drawn white; the FINAL pass recolours
// it to ground or ink depending on what sits beneath.
import { W, H, BEAT, CHAPTERS, FONTS, DURATION, FPS, BPM, HUD_ID } from './config.js';
import { ease, seg, clamp } from './util.js';
import { font } from './draw2d.js';

const M = 58;
const pad = (n, l = 2) => String(Math.floor(n)).padStart(l, '0');

export function hudAlpha(t) {
  const gb = t / BEAT;
  return seg(gb, 0.6, 1.6, ease.outCubic) * (1 - 0.55 * seg(gb, 56, 56.5)) * (1 - seg(gb, 62.6, 63.2));
}

// A rounded inspection corner (the mark's frame, at HUD scale).
export function corner(ctx, x, y, sx, sy, arm, r) {
  ctx.moveTo(x + sx * arm, y);
  ctx.lineTo(x + sx * r, y);
  ctx.arcTo(x, y, x, y + sy * r, r);
  ctx.lineTo(x, y + sy * arm);
}

function caption(ctx, gb) {
  const i = clamp(Math.floor(gb / 8), 0, 7);
  const lb = gb - i * 8;
  const inn = seg(lb, 0.1, 0.8, ease.outExpo);
  const out = i === 7 ? 0 : seg(lb, 7.55, 8.0, ease.inCubic);
  const c = CHAPTERS[i];
  const x = M + 30, y = H - M - 16;
  ctx.save();
  ctx.beginPath();
  ctx.rect(x - 4, y - 72, 820, 86);
  ctx.clip();
  const dy = (1 - inn) * 64 - out * 64;
  ctx.globalAlpha = inn * (1 - out);
  font(ctx, { f: FONTS.display, w: 700, s: 40, ls: -0.02 });
  ctx.textBaseline = 'alphabetic';
  ctx.fillText(c.n, x, y - 24 + dy);
  const nw = ctx.measureText(c.n).width;
  font(ctx, { f: FONTS.mono, w: 600, s: 14 });
  ctx.letterSpacing = '4px';
  ctx.fillText(c.title, x + nw + 18, y - 32 + dy * 1.15);
  font(ctx, { f: FONTS.mono, w: 400, s: 13 });
  ctx.letterSpacing = '1px';
  ctx.globalAlpha *= 0.62;
  ctx.fillText(c.sub, x + nw + 18, y - 10 + dy * 1.3);
  ctx.restore();
}

export function drawHud(ctx, t, frame) {
  const gb = t / BEAT;
  ctx.fillStyle = '#fff';
  ctx.strokeStyle = '#fff';
  ctx.textBaseline = 'middle';

  // Inspection corners draw in.
  const arm = 34 * seg(gb, 0.4, 1.6, ease.outExpo);
  ctx.lineWidth = 2;
  ctx.lineCap = 'square';
  ctx.beginPath();
  for (const [x, y, sx, sy] of [[M, M, 1, 1], [W - M, M, -1, 1], [M, H - M, 1, -1], [W - M, H - M, -1, -1]]) {
    if (arm > 1) corner(ctx, x, y, sx, sy, arm, Math.min(8, arm * 0.4));
  }
  ctx.stroke();

  const typeIn = seg(gb, 0.9, 1.9, ease.outCubic);
  ctx.globalAlpha = typeIn;

  // Top-left: identity.
  font(ctx, { f: FONTS.mono, w: 600, s: 14 });
  ctx.letterSpacing = '4px';
  ctx.fillText(HUD_ID.name, M + 30, M + 18);
  const cw = ctx.measureText(HUD_ID.name).width;
  font(ctx, { f: FONTS.mono, w: 400, s: 13 });
  ctx.letterSpacing = '2px';
  ctx.globalAlpha = typeIn * 0.62;
  ctx.fillText(HUD_ID.sub, M + 30 + cw + 14, M + 18);

  // Top-right: timecode + beat clock.
  ctx.globalAlpha = typeIn;
  ctx.textAlign = 'right';
  const ss = Math.floor(t), ff = frame % FPS;
  font(ctx, { f: FONTS.mono, w: 400, s: 14 });
  ctx.letterSpacing = '2px';
  ctx.fillText(`TC 00:00:${pad(ss)}:${pad(ff)}`, W - M - 30, M + 18);
  const beatInBar = Math.floor(gb) % 4;
  const bp = 1 - clamp((gb % 1) * 3);
  for (let i = 0; i < 4; i++) {
    const s = 8 + (i === beatInBar ? 3 * bp : 0);
    const cx = W - M - 30 - (3 - i) * 18 - 4, cy = M + 46;
    if (i === beatInBar) ctx.fillRect(cx - s / 2, cy - s / 2, s, s);
    else { ctx.lineWidth = 1.5; ctx.strokeRect(cx - 4, cy - 4, 8, 8); }
  }
  ctx.globalAlpha = typeIn * 0.62;
  font(ctx, { f: FONTS.mono, w: 400, s: 12 });
  ctx.fillText(`${BPM} BPM`, W - M - 30 - 4 * 18 - 8, M + 47);

  // Bottom-right: reel timeline, one segment per chapter.
  ctx.globalAlpha = typeIn;
  const tw = 330, gap = 6, segW = (tw - gap * 7) / 8, x0 = W - M - 30 - tw, y0 = H - M - 18;
  for (let i = 0; i < 8; i++) {
    const x = x0 + i * (segW + gap);
    const f = clamp(gb / 8 - i);
    ctx.globalAlpha = typeIn * 0.25;
    ctx.fillRect(x, y0 - 1.5, segW, 3);
    ctx.globalAlpha = typeIn;
    ctx.fillRect(x, y0 - 1.5, segW * f, 3);
  }
  const ph = x0 + clamp(gb / 8, 0, 8) / 8 * tw;
  ctx.fillRect(Math.round(ph) - 1, y0 - 9, 2, 18);
  font(ctx, { f: FONTS.mono, w: 400, s: 13 });
  ctx.letterSpacing = '1px';
  const sec = (v) => `${pad(v)}.${pad((v % 1) * 100)}`;
  ctx.fillText(`${sec(t)} / ${sec(DURATION)}`, W - M - 30, H - M - 42);
  ctx.textAlign = 'left';

  caption(ctx, gb);
  ctx.globalAlpha = 1;
  ctx.letterSpacing = '0px';
}
