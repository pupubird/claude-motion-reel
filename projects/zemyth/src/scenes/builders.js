// Bars 5–6 · TEN BUILDERS / ONE HOUSE.
// On the drop the guide rails spring apart to frame a grid, and ten seats pop in from the centre out:
// nine builders photographed in the house, and a tenth, empty seat drawn in lime — yours. On "One house."
// every card flips in a wave to reveal one continuous shot of the house across all ten (a video wall);
// the gaps close, the rails retract, and the window opens to full frame.
import { W, H, BEAT, C, FONTS, SAFE, CONTENT_W } from '../config.js';
import { ease, seg, clamp, lerp } from '../util.js';
import { font } from '../draw2d.js';
import { rr, card } from '../brand.js';
import { B, GRID as T, KICKS } from '../score.js';
import { drawPhoto } from '../assets.js';
import { drawClip } from '../footage.js';
import { FOURDAYS, GRIDBOX as G, cell } from '../layout.js';

const PHOTO = ['b1', 'b2', 'b3', 'b4', 'b5', 'b6', 'b7', 'b8', 'b9'];
// pop order: centre out (column distance, then row), so the grid blooms from where the type was
const ORDER = [...Array(10).keys()].sort((a, b) => {
  const da = Math.abs((a % 5) - 2) + Math.floor(a / 5) * 0.4, db = Math.abs((b % 5) - 2) + Math.floor(b / 5) * 0.4;
  return da - db || a - b;
});
const popAt = (i) => T.in0 + 0.12 + ORDER.indexOf(i) * T.stagger;   // first card lands as the type has cleared

// Guide rails: from Chapter 2's positions, spring to frame the grid, retract when the gaps close.
export function railsAt(gb) {
  const p = seg(gb, T.in0, T.in0 + 0.5);
  const s = p < 1 ? ease.outBack(p, 1.3) : 1;
  const ret = ease.inCubic(seg(gb, T.close0, T.close0 + 0.6));
  const half = (CONTENT_W / 2) * (1 - ret);
  return { top: lerp(FOURDAYS.railTop, G.railTop, s), bot: lerp(FOURDAYS.railBot, G.railBot, s), xa: W / 2 - half, xb: W / 2 + half, alpha: 1 - seg(ret, 0.7, 1) };
}

// The grid window as it closes its gaps, then opens to full frame.
function windowAt(gb) {
  const f = ease.inOutCubic(seg(gb, T.full0, T.full1));
  return { x: lerp(G.x, 0, f), y: lerp(G.y, 0, f), w: lerp(G.w, W, f), h: lerp(G.h, H, f), r: lerp(G.r, 0, f), f };
}

function flipP(i, gb) {
  const c = i % 5, r = Math.floor(i / 5);
  return seg(gb, T.flip0 + c * T.flipCol + r * T.flipRow, T.flip0 + c * T.flipCol + r * T.flipRow + T.flipDur, ease.inOutCubic);
}

function drawFront(ctx, i, x, y, w, h, gb, t) {
  const born = popAt(i);
  const kb = 1.04 - 0.04 * ease.outSine(seg(gb, born, born + 5));
  if (i < 9) {
    ctx.fillStyle = C.ink;
    ctx.fillRect(x, y, w, h);
    drawPhoto(ctx, PHOTO[i], x, y, w, h, kb * (1 + 0.1 * (1 - ease.outCubic(seg(gb, born, born + 0.5)))));
    const g = ctx.createLinearGradient(0, y + h * 0.55, 0, y + h);
    g.addColorStop(0, 'rgba(0,0,0,0)');
    g.addColorStop(1, 'rgba(0,0,0,0.5)');
    ctx.fillStyle = g;
    ctx.fillRect(x, y, w, h);
    return;
  }
  // seat 10: empty, lime — the viewer's seat
  ctx.fillStyle = C.ink;
  ctx.fillRect(x, y, w, h);
  font(ctx, { f: FONTS.display, w: 700, s: 46 });
  ctx.fillStyle = C.lime;
  ctx.textBaseline = 'alphabetic';
  const tp = seg(gb, born + 0.15, born + 0.5, ease.outExpo);
  ctx.save();
  ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip();
  ctx.fillText('YOUR', x + 26, y + h - 88 + (1 - tp) * 60);
  ctx.fillText('SEAT', x + 26, y + h - 34 + (1 - tp) * 90);
  ctx.restore();
  // plus in a ring, breathing on the beat
  const kp = Math.max(0, ...KICKS.map((b) => (gb >= b && gb < b + 1 ? Math.exp(-(t - B(b)) / 0.12) : 0)));
  const s = seg(gb, born + 0.25, born + 0.6, (x) => ease.outBack(x, 2)) * (1 + 0.1 * kp);
  const cx = x + w - 52, cy = y + 52;
  ctx.save();
  ctx.translate(cx, cy); ctx.scale(s, s);
  ctx.strokeStyle = C.lime; ctx.lineWidth = 3; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.arc(0, 0, 24, 0, Math.PI * 2); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(-10, 0); ctx.lineTo(10, 0); ctx.moveTo(0, -10); ctx.lineTo(0, 10); ctx.stroke();
  ctx.restore();
}

// Seat number in a small dark pill, top-left of the card.
function seatLabel(ctx, i, x, y, a) {
  if (a <= 0) return;
  font(ctx, { f: FONTS.label, w: 700, s: 17 });
  ctx.letterSpacing = '2px';
  const label = String(i + 1).padStart(2, '0');
  const lw = ctx.measureText(label).width;
  ctx.save();
  ctx.globalAlpha *= a;
  ctx.fillStyle = i === 9 ? 'rgba(238,254,94,0.14)' : 'rgba(0,0,0,0.55)';
  rr(ctx, x + 16, y + 16, lw + 22, 28, 14); ctx.fill();
  ctx.fillStyle = i === 9 ? C.lime : C.white;
  ctx.textBaseline = 'middle';
  ctx.fillText(label, x + 27, y + 31);
  ctx.restore();
  ctx.letterSpacing = '0px';
}

function draw(ctx, t) {
  const gb = t / BEAT;
  const win = windowAt(gb);
  const closing = ease.inOutCubic(seg(gb, T.close0, T.close1));
  const gap = G.gap * (1 - closing);
  const houseT = t - B(T.flip0);

  // everything lives inside the window's rounded outline (it becomes the full frame at the end)
  ctx.save();
  rr(ctx, win.x, win.y, win.w, win.h, win.r);
  ctx.clip();
  if (win.f > 0) {
    drawClip(ctx, 'house', houseT, win.x, win.y, win.w, win.h, 1 + 0.03 * (1 - win.f));
  } else {
    for (let i = 0; i < 10; i++) {
      const born = popAt(i);
      const pp = seg(gb, born, born + 0.36);
      if (pp <= 0) continue;
      const c = cell(i, gap);
      const s = pp < 1 ? lerp(0.82, 1, ease.outBack(pp, 1.6)) : 1;
      const fp = flipP(i, gb);
      const sx = Math.abs(Math.cos(Math.PI * fp));
      const back = fp >= 0.5;
      const cx = c.x + c.w / 2, cy = c.y + c.h / 2;
      const r = G.r * (1 - closing);
      ctx.save();
      ctx.globalAlpha *= clamp(pp * 2.5);
      ctx.translate(cx, cy);
      ctx.scale(s * Math.max(0.001, sx), s * (1 + 0.05 * Math.sin(Math.PI * fp)));
      ctx.translate(-cx, -cy);
      rr(ctx, c.x, c.y, c.w, c.h, r);
      ctx.save();
      ctx.clip();
      if (back) {
        // the house, mapped to the whole grid: every card shows its own slice of one shot
        drawClip(ctx, 'house', houseT, G.x, G.y, G.w, G.h, 1.03);
      } else {
        drawFront(ctx, i, c.x, c.y, c.w, c.h, gb, t);
      }
      // turning away from the light: a card darkens as it passes edge-on
      const shade = Math.sin(Math.PI * fp) * 0.55;
      if (shade > 0.01) { ctx.fillStyle = `rgba(0,0,0,${shade})`; ctx.fillRect(c.x, c.y, c.w, c.h); }
      ctx.restore();
      // card edges: hairline on photos, lime on the empty seat (drawn on as it arrives)
      if (!back) {
        if (i === 9) {
          const per = 2 * (c.w + c.h);
          const dp = seg(gb, born, born + 0.45, ease.inOutCubic);
          ctx.save();
          ctx.setLineDash([per * dp, per]);
          card(ctx, c.x, c.y, c.w, c.h, { r, fill: null, stroke: C.lime, lw: 3 });
          ctx.restore();
        } else {
          card(ctx, c.x, c.y, c.w, c.h, { r, fill: null, stroke: 'rgba(255,255,255,0.12)', lw: 1.5 });
        }
        seatLabel(ctx, i, c.x, c.y, seg(gb, born + 0.2, born + 0.45) * (1 - seg(fp, 0.2, 0.45)));
      }
      ctx.restore();
    }
  }
  // headline legibility over the opening frame
  if (win.f > 0) {
    const g = ctx.createLinearGradient(0, 0, 0, H * 0.45);
    g.addColorStop(0, `rgba(0,0,0,${0.72 * win.f})`);
    g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
  }
  ctx.restore();

  // rails, above the cards
  const rl = railsAt(gb);
  if (rl.alpha > 0 && rl.xb - rl.xa > 1) {
    ctx.save();
    ctx.globalAlpha *= rl.alpha;
    ctx.fillStyle = C.lime;
    for (const y of [rl.top, rl.bot]) { rr(ctx, rl.xa, y - 2, rl.xb - rl.xa, 4, 2); ctx.fill(); }
    ctx.restore();
  }
}

export default {
  id: 'builders',
  layers: [{ start: B(T.in0), end: B(24), draw }],
  needs: (t) => {
    const gb = t / BEAT;
    return gb >= T.flip0 && gb < 24 ? [['house', t - B(T.flip0)]] : null;
  },
};
