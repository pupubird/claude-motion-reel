// Bar 7 · cut to the beat. Backgrounds change once per beat (≤ 2.2 Hz, photosensitivity-safe);
// words change on 8ths. Beat 27 is a held breath of silence before the final hit.
import { W, H, BEAT, COLORS as C, FONTS } from '../config.js';
import { ease, seg, lerp, clamp, hash1, TAU } from '../util.js';
import { font, advances } from '../draw2d.js';

const CX = W / 2, CY = H / 2;

function centered(ctx, text, y, { track = 0 } = {}) {
  ctx.letterSpacing = `${track}px`;
  const w = ctx.measureText(text).width - track;
  ctx.fillText(text, CX - w / 2, y);
  ctx.letterSpacing = '0px';
}

const CARDS = [
  { at: 24.0, bg: C.ink, draw: (ctx, p, t) => { // TIMING — slam
      font(ctx, { w: 900, s: 300 });
      ctx.fillStyle = C.bone;
      const s = lerp(1.35, 1, ease.outExpo(clamp(p * 3)));
      ctx.translate(CX, CY); ctx.scale(s, s); ctx.translate(-CX, -CY);
      centered(ctx, 'TIMING', CY + 108);
    } },
  { at: 24.5, bg: C.ink, draw: (ctx, p) => { // SPACING — tracking opens
      font(ctx, { w: 300, s: 190 });
      ctx.fillStyle = C.bone;
      centered(ctx, 'SPACING', CY + 68, { track: lerp(-8, 70, ease.outExpo(p)) });
    } },
  { at: 25.0, bg: C.volt, draw: (ctx, p) => { // WEIGHT — variable axis 100 → 900
      font(ctx, { w: lerp(100, 900, ease.inOutCubic(clamp(p * 1.25))), s: 290 });
      ctx.fillStyle = C.bone;
      centered(ctx, 'WEIGHT', CY + 104);
    } },
  { at: 25.5, bg: C.volt, draw: (ctx, p) => { // CONTRAST — split fill
      font(ctx, { w: 900, s: 250 });
      const y = CY + 90;
      const split = lerp(CY + 90, CY - 90, ease.inOutExpo(clamp(p * 1.5)));
      ctx.save(); ctx.beginPath(); ctx.rect(0, 0, W, split); ctx.clip();
      ctx.fillStyle = C.bone; centered(ctx, 'CONTRAST', y); ctx.restore();
      ctx.save(); ctx.beginPath(); ctx.rect(0, split, W, H); ctx.clip();
      ctx.fillStyle = C.ink; centered(ctx, 'CONTRAST', y); ctx.restore();
    } },
  { at: 26.0, bg: C.hot, draw: (ctx, p, t) => { // RHYTHM — counter-scrolling rows
      font(ctx, { w: 900, s: 150 });
      const unit = ctx.measureText('RHYTHM ').width;
      for (let r = -3; r <= 3; r++) {
        const dir = r % 2 ? 1 : -1;
        const off = ((t * 900 * dir) % unit + unit) % unit;
        const y = CY + 54 + r * 150;
        ctx.fillStyle = r === 0 ? C.ink : C.bone;
        ctx.globalAlpha = r === 0 ? 1 : 0.9 - Math.abs(r) * 0.18;
        for (let x = -unit * 2 + off; x < W + unit; x += unit) {
          if (r === 0) ctx.fillText('RHYTHM', x, y);
          else { ctx.strokeStyle = C.bone; ctx.lineWidth = 2; ctx.strokeText('RHYTHM', x, y); }
        }
      }
      ctx.globalAlpha = 1;
    } },
  { at: 26.5, bg: C.hot, draw: (ctx, p, t) => { // CRAFT — jittered, glitched
      font(ctx, { w: 900, s: 330 });
      ctx.fillStyle = C.ink;
      const j = (1 - p) * 10;
      ctx.translate((hash1(Math.floor(t * 60)) - 0.5) * j, (hash1(Math.floor(t * 60) + 9) - 0.5) * j);
      centered(ctx, 'CRAFT', CY + 118);
    } },
  { at: 27.0, bg: C.ink, draw: (ctx, p) => { // (breathe)
      font(ctx, { f: FONTS.serif, i: true, s: 58 });
      ctx.fillStyle = C.bone;
      ctx.globalAlpha = seg(p, 0.08, 0.5, ease.outCubic);
      centered(ctx, '(breathe)', CY + 20, { track: lerp(0, 6, p) });
      ctx.globalAlpha = 1;
    } },
];

function draw(ctx, t) {
  const gb = t / BEAT;
  let i = CARDS.length - 1;
  while (i > 0 && gb < CARDS[i].at) i--;
  const c = CARDS[i];
  const next = CARDS[i + 1]?.at ?? 28;
  const p = clamp((gb - c.at) / (next - c.at));
  ctx.fillStyle = c.bg;
  ctx.fillRect(0, 0, W, H);
  ctx.save();
  c.draw(ctx, p, t);
  ctx.restore();
}

function fx(t) {
  const gb = t / BEAT;
  if (gb < 24 || gb >= 28) return null;
  const since = gb - Math.floor(gb * 2) / 2;
  const cut = Math.exp(-since * BEAT / 0.07);
  const craft = gb >= 26.5 && gb < 27 ? 1 - seg(gb, 26.5, 27) : 0;
  return {
    zoom: 1 + 0.035 * cut * (gb < 27 ? 1 : 0),
    ca: 1.2 * cut * (gb < 27 ? 1 : 0) + craft * 3,
    glitch: craft * 0.8,
  };
}

export default {
  id: 'montage',
  layers: [{ start: 24 * BEAT, end: 28 * BEAT, draw }],
  fx,
};
