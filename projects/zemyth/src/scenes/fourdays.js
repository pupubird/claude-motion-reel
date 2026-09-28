// Bars 3–4 · FOUR DAYS.
// The Zembit's closed eyes (pixel-exact from the 3D hand-off) slide together and snap into one lime
// line — stretching thinner as it grows, like a rubber band. The line opens like an eyelid: its two
// edges become guide rails, and between them "FOUR DAYS." rises word by word on the spoken syllables,
// filled with the house's own footage. A DAY counter ticks 01 → 04 and the footage jumps a day each time.
import { W, H, BEAT, C, FONTS, SAFE, CONTENT_W } from '../config.js';
import { ease, seg, clamp, lerp } from '../util.js';
import { font } from '../draw2d.js';
import { pill, rr } from '../brand.js';
import { B, FOUR as T, VO_AT } from '../score.js';
import { wordAt } from '../assets.js';
import { drawClip } from '../footage.js';
import { FOURDAYS as L } from '../layout.js';
import { handoffBars } from './hello.js';
import { railsAt as railsBuilders } from './builders.js';

const WORDS = ['FOUR', 'DAYS.'];
let off, octx, size, x0, adv, bars;
const RAIL = 4;

// The visor shader's halo is linear light 0.3·e^(−d/0.035) around each eye (d = SDF distance), which at
// the close-up is 0.3·e^(−d/77 px). Canvas blurs work in sRGB and can't match it, so each bar gets a
// sprite computed per pixel with the same distance field and falloff, then encoded to sRGB.
const HALO_PAD = 380, HALO = [];
const LIME_LIN = [0.855, 0.991, 0.111];
const srgb8 = (v) => Math.round(255 * (v <= 0.0031308 ? v * 12.92 : 1.055 * Math.pow(v, 1 / 2.4) - 0.055));
function haloSprite(w, h) {
  const c = document.createElement('canvas');
  c.width = Math.ceil(w + HALO_PAD * 2); c.height = Math.ceil(h + HALO_PAD * 2);
  const g = c.getContext('2d');
  const img = g.createImageData(c.width, c.height);
  const hx = w / 2, hy = h / 2, r = Math.min(hx, hy), cx = c.width / 2, cy = c.height / 2;
  for (let y = 0; y < c.height; y++) for (let x = 0; x < c.width; x++) {
    const qx = Math.abs(x + 0.5 - cx) - hx + r, qy = Math.abs(y + 0.5 - cy) - hy + r;
    const d = Math.hypot(Math.max(qx, 0), Math.max(qy, 0)) + Math.min(Math.max(qx, qy), 0) - r;
    if (d <= 0) continue;
    const I = 0.3 * Math.exp(-d / 77);
    const o = (y * c.width + x) * 4;
    img.data[o] = srgb8(LIME_LIN[0] * I); img.data[o + 1] = srgb8(LIME_LIN[1] * I); img.data[o + 2] = srgb8(LIME_LIN[2] * I); img.data[o + 3] = 255;
  }
  g.putImageData(img, 0, 0);
  return c;
}

function init(env) {
  off = document.createElement('canvas');
  off.width = W; off.height = H;
  octx = off.getContext('2d');
  // Set the line to span the content width exactly, ink edge to ink edge.
  font(octx, { f: FONTS.display, w: 700, s: 100 });
  const m = octx.measureText('FOUR DAYS.');
  const ink = m.actualBoundingBoxLeft + m.actualBoundingBoxRight;
  size = (CONTENT_W / ink) * 100;
  font(octx, { f: FONTS.display, w: 700, s: size });
  const mm = octx.measureText('FOUR DAYS.');
  x0 = SAFE.x + mm.actualBoundingBoxLeft;
  adv = [0, octx.measureText('FOUR ').width];
  bars = handoffBars(env);
  HALO.push(haloSprite(bars[0].w, bars[0].h), haloSprite(bars[1].w, bars[1].h));
}

// Where the lime line / rails are at beat gb: { mode, top, bot, xa, xb, th }.
export function railsAt(gb) {
  const cy = (bars[0].y + bars[0].h / 2 + bars[1].y + bars[1].h / 2) / 2;
  const mid = (L.railTop + L.railBot) / 2;
  if (gb < T.merge) return null;
  const s = ease.outExpo(seg(gb, T.merge, T.stretch + 0.1));
  const halfW = lerp((bars[1].x + bars[1].w - bars[0].x) / 2, CONTENT_W / 2, s);
  const th = lerp(bars[0].h, RAIL, ease.outExpo(seg(gb, T.merge, T.stretch)));
  const o = (x) => (x < 1 ? ease.outBack(x, 1.25) : 1);
  const open = o(seg(gb, T.open0, T.open1));
  const y = lerp(cy, mid, s);
  return { th, xa: W / 2 - halfW, xb: W / 2 + halfW, top: lerp(y, L.railTop, open), bot: lerp(y, L.railBot, open), open };
}

function drawBars(ctx, gb) {
  // 8.00 → merge: both bars accelerate into the centre; their glow (the visor's) dies away
  const p = ease.inQuad(seg(gb, 8.0, T.merge));
  const glow = 1 - seg(gb, 8.0, T.merge);
  const [a, b] = bars;
  const ax = lerp(a.x, W / 2 - a.w, p), bx = lerp(b.x, W / 2, p);
  // the halo the eyes cast on the visor glass, reproduced exactly (see haloSprite)
  if (glow > 0.01) {
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.globalAlpha = glow;
    ctx.drawImage(HALO[0], ax - HALO_PAD, a.y - HALO_PAD);
    ctx.drawImage(HALO[1], bx - HALO_PAD, b.y - HALO_PAD);
    ctx.restore();
  }
  ctx.fillStyle = C.lime;
  rr(ctx, ax, a.y, a.w, a.h, a.h / 2); ctx.fill();
  rr(ctx, bx, b.y, b.w, b.h, b.h / 2); ctx.fill();
}

function drawRails(ctx, r, alpha = 1) {
  ctx.save();
  ctx.globalAlpha *= alpha;
  ctx.fillStyle = C.lime;
  if (r.open <= 0.001) {
    rr(ctx, r.xa, r.top - r.th / 2, r.xb - r.xa, r.th, r.th / 2);
    ctx.fill();
  } else {
    for (const y of [r.top, r.bot]) { rr(ctx, r.xa, y - r.th / 2, r.xb - r.xa, r.th, r.th / 2); ctx.fill(); }
  }
  ctx.restore();
}

const dayIndex = (gb) => T.days.filter((d) => gb >= d).length - 1;   // −1 before DAY 01

function drawType(ctx, gb, t, r) {
  const d = Math.max(0, dayIndex(gb));
  const clip = T.clips[d];
  const clipT = t - B(d === 0 ? T.open0 : T.days[d]);
  const t0 = B(VO_AT.fourdays);
  // offscreen: the words at their animated positions, then the footage composited into them (source-in),
  // so the mask is built in one pass and no footage exists outside the letters
  octx.setTransform(1, 0, 0, 1, 0, 0);
  octx.globalCompositeOperation = 'source-over';
  octx.clearRect(0, 0, W, H);
  font(octx, { f: FONTS.display, w: 700, s: size });
  octx.fillStyle = '#fff';
  const gap = L.railBot - L.railTop;
  let any = false;
  WORDS.forEach((word, i) => {
    const on = t0 + wordAt('fourdays', i) - 0.03;
    const p = ease.outExpo(clamp((t - on) / (0.32 * BEAT)));
    if (p <= 0) return;
    any = true;
    octx.fillText(word, x0 + adv[i], L.base + (1 - p) * gap * 0.92);
  });
  if (!any) return;
  octx.globalCompositeOperation = 'source-in';
  // ink base first: where the footage is dark the letterforms still read against pure black
  octx.fillStyle = '#2a2d2d';
  octx.fillRect(SAFE.x, L.railTop, CONTENT_W, gap);
  octx.globalCompositeOperation = 'source-atop';
  octx.globalAlpha = 0.9;
  octx.filter = 'brightness(1.32) contrast(1.04) saturate(1.08)';
  const ds = T.days[d] ?? T.open0;
  drawClip(octx, clip, clipT, SAFE.x, L.railTop, CONTENT_W, gap, 1.02 + 0.04 * seg(gb, ds, ds + 3));
  octx.filter = 'none';
  octx.globalAlpha = 1;
  // cut accent: a short shutter flash inside the letters on each day change
  const cut = Math.max(0, ...T.days.slice(1).map((b) => (gb >= b ? Math.exp(-(t - B(b)) / 0.05) : 0)));
  if (cut > 0.01) {
    octx.globalCompositeOperation = 'source-atop';
    octx.fillStyle = `rgba(255,255,255,${0.28 * cut})`;
    octx.fillRect(SAFE.x, L.railTop, CONTENT_W, gap);
  }
  octx.globalCompositeOperation = 'source-over';
  // only what lies between the (opening) rails is visible
  ctx.save();
  ctx.beginPath();
  ctx.rect(0, r.top + r.th / 2, W, Math.max(0, r.bot - r.top - r.th));
  ctx.clip();
  ctx.drawImage(off, 0, 0);
  // hairline keyline: the letter edges stay crisp over any frame
  font(ctx, { f: FONTS.display, w: 700, s: size });
  ctx.strokeStyle = 'rgba(255,255,255,0.34)';
  ctx.lineWidth = 1.6;
  ctx.lineJoin = 'round';
  WORDS.forEach((word, i) => {
    const p = ease.outExpo(clamp((t - (t0 + wordAt('fourdays', i) - 0.03)) / (0.32 * BEAT)));
    if (p > 0) ctx.strokeText(word, x0 + adv[i], L.base + (1 - p) * gap * 0.92);
  });
  ctx.restore();
}

function drawMeta(ctx, gb, t) {
  const m = seg(gb, T.meta, T.meta + 0.35, ease.outExpo);
  const fade = 1 - seg(gb, T.out - 0.12, T.out);
  if (m <= 0 || fade <= 0) return;
  ctx.save();
  ctx.globalAlpha *= fade;
  // eyebrows above the top rail rise out of it
  font(ctx, { f: FONTS.label, w: 700, s: 22 });
  ctx.letterSpacing = '4.4px';
  ctx.fillStyle = C.dim;
  ctx.textBaseline = 'alphabetic';
  ctx.save();
  ctx.beginPath(); ctx.rect(0, L.railTop - 60, W, 58); ctx.clip();
  ctx.fillText('ZEMYTH HACKERHOUSE', SAFE.x, L.railTop - 22 + (1 - m) * 34);
  ctx.textAlign = 'right';
  ctx.fillText('KUALA LUMPUR', SAFE.x + CONTENT_W + 4.4, L.railTop - 22 + (1 - seg(gb, T.meta + 0.08, T.meta + 0.43, ease.outExpo)) * 34);
  ctx.restore();
  // below the bottom rail: the DAY counter pill (left) and the format (right)
  const di = dayIndex(gb);
  if (di >= 0) {
    const pp = seg(gb, T.days[0], T.days[0] + 0.4);
    const bump = Math.max(0, ...T.days.map((b) => (gb >= b ? Math.exp(-(t - B(b)) / 0.09) : 0)));
    const s = (pp < 1 ? ease.outBack(pp, 2.2) : 1) * (1 + 0.06 * bump);
    font(ctx, { f: FONTS.display, w: 700, s: 28 });
    ctx.letterSpacing = '0px';
    const label = 'DAY 0', lw = ctx.measureText(label).width, dw = ctx.measureText('0').width;
    const pw = lw + dw + 44, ph = 52, pcx = SAFE.x + pw / 2, pcy = L.railBot + 24 + ph / 2;
    ctx.save();
    ctx.translate(SAFE.x, pcy);
    ctx.scale(s, s);
    ctx.translate(-SAFE.x, -pcy);
    pill(ctx, pcx, pcy, pw, ph, { fill: C.lime });
    ctx.fillStyle = C.black;
    ctx.textBaseline = 'middle';
    const tx = pcx - (lw + dw) / 2;
    ctx.fillText(label, tx, pcy + 2);
    // odometer: the last digit rolls up to the new day
    const roll = ease.outExpo(seg(gb, T.days[di], T.days[di] + 0.28));
    ctx.beginPath(); ctx.rect(tx + lw - 2, pcy - ph / 2 + 6, dw + 6, ph - 12); ctx.clip();
    if (di > 0 && roll < 1) ctx.fillText(String(di), tx + lw, pcy + 2 - roll * 34);
    ctx.fillText(String(di + 1), tx + lw, pcy + 2 + (di > 0 ? (1 - roll) * 34 : 0));
    ctx.restore();
  }
  const f = seg(gb, T.days[0] + 0.1, T.days[0] + 0.5, ease.outExpo);
  if (f > 0) {
    font(ctx, { f: FONTS.label, w: 700, s: 22 });
    ctx.letterSpacing = '4.4px';
    ctx.fillStyle = C.dim;
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    ctx.globalAlpha *= f;
    ctx.fillText('4 NIGHTS · LIVE-IN', SAFE.x + CONTENT_W + 4.4 - (1 - f) * 24, L.railBot + 24 + 27);
  }
  ctx.restore();
}

function draw(ctx, t) {
  const gb = t / BEAT;
  if (gb < T.merge) { drawBars(ctx, gb); return; }
  if (gb >= T.out) {
    // the drop: the type zooms through the lens and is gone as the rails spring to the grid
    const x = seg(gb, T.out, T.out + 0.2);
    const rb = railsBuilders(gb);
    ctx.save();
    ctx.globalAlpha *= 1 - ease.inQuad(x);
    ctx.translate(W / 2, (L.railTop + L.railBot) / 2);
    const k = 1 + 0.9 * ease.inCubic(x);
    ctx.scale(k, k);
    ctx.translate(-W / 2, -(L.railTop + L.railBot) / 2);
    drawType(ctx, T.days[3] + 1.4, t, { top: rb.top, bot: rb.bot, th: 4, open: 1 });
    ctx.restore();
    return;
  }
  const r = railsAt(gb);
  // tension: a slow push through the last days, an inhale before the drop, then stillness
  const push = 1 + 0.028 * ease.inOutSine(seg(gb, T.days[3], T.inhale)) - 0.02 * ease.inOutQuad(seg(gb, T.inhale, T.hold));
  ctx.save();
  ctx.translate(W / 2, (L.railTop + L.railBot) / 2);
  ctx.scale(push, push);
  ctx.translate(-W / 2, -(L.railTop + L.railBot) / 2);
  if (r.open > 0) drawType(ctx, gb, t, r);
  drawRails(ctx, r);
  drawMeta(ctx, gb, t);
  ctx.restore();
}

export default {
  id: 'fourdays',
  init,
  layers: [{ start: B(8.0), end: B(T.out + 0.2), draw }],
  needs: (t) => {
    const gb = t / BEAT;
    if (gb < T.open0 - 0.1 || gb >= T.out + 0.3) return null;
    const d = Math.max(0, dayIndex(Math.min(gb, T.out - 0.01)));
    return [[T.clips[d], t - B(d === 0 ? T.open0 : T.days[d])]];
  },
};
