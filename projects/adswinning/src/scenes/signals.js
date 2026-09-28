// Bar 10 · the five signals, cut to the beat.
// One card per signal with its hairline plate from the landing's SignalCarousel, drawn with a
// constant-speed pen. VARIANTS is set as literal variants: the word stacked across Bricolage's
// width and weight axes like offset film cells.
import { W, H, BEAT, C, FONTS } from '../config.js';
import { ease, seg, clamp } from '../util.js';
import { font, rgba, fillR, strokeR } from '../draw2d.js';
import { B, SIGNAL_CUTS } from '../score.js';

export const CARDS = [
  { at: SIGNAL_CUTS[0], word: 'Spend.', desc: 'A disclosed spend or budget band', bg: C.ground, fg: C.ink, line: C.petrol, plate: 0 },
  { at: SIGNAL_CUTS[1], word: 'Reach.', desc: 'Views, reach, or impressions', bg: C.ground, fg: C.ink, line: C.petrol, plate: 1, mirror: true },
  { at: SIGNAL_CUTS[2], word: 'Days.', desc: 'How long it has kept running', bg: C.well, fg: C.ground, line: C.wellDim, plate: 2 },
  { at: SIGNAL_CUTS[3], word: 'Variants.', desc: 'Repeated or near-identical cuts', bg: C.ground, fg: C.ink, line: C.petrol, plate: 3 },
  { at: SIGNAL_CUTS[4], word: 'Ranked.', desc: 'A Top Ad or CTR designation', bg: C.petrol, fg: C.ground, line: '#9CC3C2', plate: 4 },
];
const END = 40;

// SignalCarousel plates (140-unit box): [path, width, opacity, kind]
const PLATES = [
  [['M18 32h74M18 32v13M92 32v13', 1.25], ['M18 120h90M18 120v-13M108 120v-13', 1.25], ['M30 102h24M30 86h40M30 70h56M30 54h34', 3], ['M125 60a11 11 0 1 1 -22 0a11 11 0 1 1 22 0', 1.25, 1, 'accent'], ['M114 54v12M110 56.5h5.5a2.6 2.6 0 0 1 0 5.2h-6', 1, 1, 'accent']],
  [['M50 92A30 30 0 0 1 80 62', 1.25], ['M50 92A52 52 0 0 1 102 40', 1.25], ['M50 92A74 74 0 0 1 124 18', 1.25], ['M50 92A96 96 0 0 1 146 -4', 1.25, 0.45], ['M56 92a6 6 0 1 1 -12 0a6 6 0 1 1 12 0', 0, 1, 'dot']],
  [['M14 98h116', 1.25], ['M28 98v-9M44 98v-9M60 98v-9M76 98v-9M92 98v-9M108 98v-9M124 98v-9', 0.9], ['M28 64h86', 3, 1, 'accent'], ['M28 56v14M114 56v14', 1.25], ['M118.5 64a4.5 4.5 0 1 1 -9 0a4.5 4.5 0 1 1 9 0', 0, 1, 'dotAccent']],
  [['M25 34h56a3 3 0 0 1 3 3v40a3 3 0 0 1 -3 3h-56a3 3 0 0 1 -3 -3v-40a3 3 0 0 1 3 -3z', 1.25, 0.45], ['M39 48h56a3 3 0 0 1 3 3v40a3 3 0 0 1 -3 3h-56a3 3 0 0 1 -3 -3v-40a3 3 0 0 1 3 -3z', 1.25, 0.7], ['M53 62h56a3 3 0 0 1 3 3v40a3 3 0 0 1 -3 3h-56a3 3 0 0 1 -3 -3v-40a3 3 0 0 1 3 -3z', 1.25], ['M60 85l8 8 17-19', 1.5, 1, 'accent']],
  [['M16 116h108', 1.25], ['M24 104l26-32 20 17 34-56', 2.25], ['M92 36A40 40 0 0 1 120 74', 1.25], ['M80 40A48 48 0 0 0 108 92', 1.25, 0.55], ['M110.5 33a6.5 6.5 0 1 1 -13 0a6.5 6.5 0 1 1 13 0', 1.25, 1, 'sulphur'], ['M106.5 33a2.5 2.5 0 1 1 -5 0a2.5 2.5 0 1 1 5 0', 0, 1, 'sulphurDot']],
].map((paths) => paths.map(([d, w, o = 1, kind = '']) => ({ p: new Path2D(d), w, o, kind })));

function plate(ctx, card, x, y, size, p) {
  const k = size / 140;
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(k, k);
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  PLATES[card.plate].forEach((seg_, i) => {
    const local = clamp(p * 1.6 - i * 0.14);
    if (local <= 0) return;
    ctx.globalAlpha = seg_.o;
    const col = seg_.kind.startsWith('sulphur') ? C.sulphur : seg_.kind.startsWith('accent') || seg_.kind === 'dotAccent' ? C.sulphur : card.line;
    if (seg_.w === 0) {
      ctx.fillStyle = seg_.kind === 'dot' ? card.line : col;
      ctx.globalAlpha = seg_.o * ease.outBack(local);
      ctx.fill(seg_.p);
      return;
    }
    // constant-speed pen: 420 units per unit of progress
    ctx.setLineDash([420, 420]);
    ctx.lineDashOffset = 420 * (1 - local);
    ctx.strokeStyle = col;
    ctx.lineWidth = (seg_.w * 2.2) / Math.sqrt(k) * 0.9;
    ctx.stroke(seg_.p);
  });
  ctx.restore();
}

function word(ctx, card, x, y, size, p, gb) {
  font(ctx, { f: FONTS.display, w: 800, s: size, ls: -0.045 });
  ctx.fillStyle = card.fg;
  ctx.textBaseline = 'alphabetic';
  if (card.plate !== 3) {
    ctx.save();
    ctx.beginPath(); ctx.rect(x - 40, y - size, W, size * 1.28); ctx.clip();
    ctx.fillText(card.word, x, y + (1 - p) * size * 1.1);
    ctx.restore();
    return;
  }
  // Variants: a type specimen — the same word cut four ways across Bricolage's width and weight axes
  const cuts = [[75, 300, 0.32], [85, 500, 0.52], [95, 650, 0.76], [100, 800, 1]];
  const vs = 128;
  cuts.forEach(([wd, wt, a], i) => {
    const q = seg(gb, card.at + i * 0.06, card.at + 0.3 + i * 0.06, ease.outExpo);
    if (q <= 0) return;
    const yy = 430 + i * 112;
    ctx.save();
    ctx.font = `${wt} ${vs}px BricoW${wd}`;
    ctx.letterSpacing = `${(-0.04 * vs).toFixed(1)}px`;
    ctx.globalAlpha = a;
    ctx.beginPath(); ctx.rect(x - 40, yy - vs, W, vs * 1.22); ctx.clip();
    ctx.fillText(card.word, x, yy + (1 - q) * vs * 1.1);
    ctx.restore();
    ctx.save();
    font(ctx, { f: FONTS.mono, w: 500, s: 15 });
    ctx.letterSpacing = '1.5px';
    ctx.globalAlpha = 0.55 * q;
    ctx.fillText(`wdth ${wd} · wght ${wt}`, x + 830, yy - 8);
    ctx.restore();
  });
}

function draw(ctx, t) {
  const gb = t / BEAT;
  let i = CARDS.length - 1;
  while (i > 0 && gb < CARDS[i].at) i--;
  const card = CARDS[i];
  ctx.fillStyle = card.bg;
  ctx.fillRect(0, 0, W, H);
  const p = seg(gb, card.at, card.at + 0.22, ease.outExpo);

  // counter + the mini slot row with this signal lit
  ctx.save();
  font(ctx, { f: FONTS.mono, w: 500, s: 20 });
  ctx.letterSpacing = '3px';
  ctx.fillStyle = card.fg;
  ctx.globalAlpha = 0.7;
  ctx.textBaseline = 'middle';
  const cx0 = card.mirror ? W - 154 - 336 : 154;
  ctx.fillText(`0${i + 1} / 05`, cx0, 300);
  for (let k = 0; k < 5; k++) {
    const x = cx0 + 146 + k * 38, y = 294;
    if (k === i) fillR(ctx, x, y, 30, 8, 4, C.sulphur);
    else strokeR(ctx, x, y, 30, 8, 4, rgba(card.fg === C.ink ? C.ink : C.ground, 0.45), 1.5);
  }
  ctx.restore();

  if (card.mirror) {
    font(ctx, { f: FONTS.display, w: 800, s: 300, ls: -0.045 });
    const ww = ctx.measureText(card.word).width;
    word(ctx, card, W - 146 - ww, 640, 300, p, gb);
  } else word(ctx, card, 146, 640, 300, p, gb);
  // description
  const d = seg(gb, card.at + 0.12, card.at + 0.4, ease.brand);
  ctx.save();
  ctx.globalAlpha = d * 0.85;
  font(ctx, { f: FONTS.sans, w: 500, s: 40 });
  ctx.fillStyle = card.fg;
  ctx.textBaseline = 'alphabetic';
  if (card.mirror) { ctx.textAlign = 'right'; ctx.fillText(card.desc, W - 154, 760 + (1 - d) * 16); ctx.textAlign = 'left'; }
  else ctx.fillText(card.desc, 154, (card.plate === 3 ? 842 : 760) + (1 - d) * 16);
  ctx.restore();
  if (card.mirror) plate(ctx, card, 150, 250, 560, seg(gb, card.at + 0.02, card.at + 0.7));
  else if (card.plate === 3) plate(ctx, card, 1330, 330, 420, seg(gb, card.at + 0.02, card.at + 0.7));
  else plate(ctx, card, 1180, 250, 560, seg(gb, card.at + 0.02, card.at + 0.7));
}

export default {
  id: 'signals',
  layers: [{ start: B(36), end: B(END), draw }],
};
