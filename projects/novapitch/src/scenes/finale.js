// Acts VII–VIII — "Stop sending documents / that end in silence." over the field lighting up; then the line that
// ran through the whole film signs the N (up, diagonal, up), the tile blooms behind it in the brand gradient on
// the final hit, and the mark settles into the lockup and end card.
// The N is the real glyph (Plus Jakarta Sans 800, like the product's mark), revealed through a mask that follows
// a pen path measured from the glyph's own stems, so every frame is exact to the brand mark.
import { W, H, C, BEAT, GRAD_TEXT, GRAD_BRAND, FONTS } from '../config.js';
import { ease, clamp, lerp, seg } from '../util.js';
import { B, PAYOFF, SIGN } from '../score.js';
import { Line, drawLine, riseLine, centerX, cssGradient, glint } from '../type.js';
import { rr, text, novaButton } from '../ui/kit.js';
import { icon } from '../ui/icons.js';

let L1, L2, WORD, TAG, GLYPH, DEF;
const TILE = 300;                 // the mark at its hero size; the product's is 40 px with a 22 px N (ratio kept)
const N_SIZE = TILE * 22 / 40;
const R_TILE = TILE * 12 / 40;

// Measure the N's stems from its rendered pixels: centreline path + stem width, in glyph-local coordinates
// (origin = ink-box centre).
function measureN() {
  const S = 800, c = document.createElement('canvas'); c.width = c.height = S;
  const g = c.getContext('2d');
  g.font = `800 ${N_SIZE * 2}px ${FONTS.display}`;
  g.textBaseline = 'alphabetic';
  g.fillStyle = '#fff';
  const m = g.measureText('N');
  g.fillText('N', 100, 600);
  const d = g.getImageData(0, 0, S, S).data;
  const ink = (x, y) => d[(y * S + x) * 4 + 3] > 128;
  let x0 = S, x1 = 0, y0 = S, y1 = 0;
  for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) if (ink(x, y)) { x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y); }
  // stems: scan a row near the bottom for the two ink runs
  const yr = Math.round(y1 - (y1 - y0) * 0.08);
  const runs = [];
  let inRun = false, st = 0;
  for (let x = x0 - 1; x <= x1 + 1; x++) { const k = ink(x, yr); if (k && !inRun) { inRun = true; st = x; } if (!k && inRun) { inRun = false; runs.push([st, x - 1]); } }
  const L = runs[0], R = runs[runs.length - 1];
  const sw = (L[1] - L[0] + 1);
  const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2, s = 0.5;   // back to film size (measured at 2×)
  const lx = ((L[0] + L[1]) / 2 - cx) * s, rx = ((R[0] + R[1]) / 2 - cx) * s;
  const top = (y0 - cy) * s + sw * s * 0.5, bot = (y1 - cy) * s - sw * s * 0.5;
  return {
    stem: sw * s, w: (x1 - x0) * s, h: (y1 - y0) * s,
    // glyph origin offset: where to fillText so the ink box is centred at (0,0)
    ox: (100 - cx) * s, oy: (600 - cy) * s,
    path: [[lx, bot], [lx, top], [rx, bot], [rx, top]],
  };
}

function penPoint(path, u) {
  const seglen = [];
  let L = 0;
  for (let i = 1; i < path.length; i++) { const l = Math.hypot(path[i][0] - path[i - 1][0], path[i][1] - path[i - 1][1]); seglen.push(l); L += l; }
  let d = u * L;
  for (let i = 0; i < seglen.length; i++) {
    if (d <= seglen[i] || i === seglen.length - 1) {
      const f = clamp(d / seglen[i]);
      return { x: lerp(path[i][0], path[i + 1][0], f), y: lerp(path[i][1], path[i + 1][1], f), seg: i, L, prefix: seglen.slice(0, i).reduce((a, b) => a + b, 0) + f * seglen[i] };
    }
    d -= seglen[i];
  }
}

// The mark at (cx, cy) with size multiplier k. `draw` ∈ [0,1] (pen progress), `tile` ∈ [0,1] (bloom), `glow` extra light.
function mark(ctx, cx, cy, k, drawP, tileP, glow, glintP = 0, lead = 1) {
  const G = GLYPH;
  ctx.save();
  ctx.translate(cx, cy);
  ctx.scale(k, k);
  if (tileP > 0) {
    const s = ease.outBack(clamp(tileP), 1.4);
    ctx.save();
    ctx.scale(s, s);
    ctx.shadowColor = `rgba(37,99,235,${0.45 + 0.4 * glow})`;
    ctx.shadowBlur = 60 + 80 * glow;
    rr(ctx, -TILE / 2, -TILE / 2, TILE, TILE, R_TILE);
    ctx.fillStyle = cssGradient(ctx, -TILE / 2, -TILE / 2, TILE, TILE, GRAD_BRAND);
    ctx.fill();
    if (glintP > 0 && glintP < 1) {
      ctx.shadowBlur = 0;
      rr(ctx, -TILE / 2, -TILE / 2, TILE, TILE, R_TILE); ctx.clip();
      const gx = lerp(-TILE * 1.2, TILE * 1.2, ease.inOutSine(glintP));
      const gl = ctx.createLinearGradient(gx - 120, -TILE, gx + 120, TILE);
      gl.addColorStop(0, 'rgba(255,255,255,0)'); gl.addColorStop(0.5, 'rgba(255,255,255,0.35)'); gl.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = gl; ctx.fillRect(-TILE, -TILE, TILE * 2, TILE * 2);
    }
    ctx.restore();
  }
  // the glyph, revealed along the pen path
  if (drawP > 0) {
    const pp = penPoint(G.path, clamp(drawP));
    ctx.save();
    if (drawP < 1) {
      // canvas cannot clip to a stroke, so the pen path is stroked into an offscreen alpha mask (maskGlyph)
      const done = G.path.slice(0, pp.seg + 1);
      const mask = new Path2D();
      mask.moveTo(done[0][0], done[0][1] + G.stem);
      for (const [x, y] of done) mask.lineTo(x, y);
      mask.lineTo(pp.x, pp.y);
      maskGlyph(ctx, mask, G.stem * 2.3, G);
    } else {
      glyph(ctx, G, tileP > 0 ? '#FFFFFF' : '#F4F8FF');
    }
    ctx.restore();
    // the pen: the film's line, still burning at the head
    if (drawP < 1) pen(ctx, pp.x, pp.y);
  } else pen(ctx, G.path[0][0] * lead, G.path[0][1] * lead);   // the collapse point, travelling to the first stroke
  ctx.restore();
}

function pen(ctx, x, y) {
  const grd = ctx.createRadialGradient(x, y, 0, x, y, 70);
  grd.addColorStop(0, 'rgba(255,255,255,1)'); grd.addColorStop(0.18, 'rgba(125,227,244,0.8)'); grd.addColorStop(1, 'rgba(46,107,255,0)');
  ctx.fillStyle = grd; ctx.beginPath(); ctx.arc(x, y, 70, 0, Math.PI * 2); ctx.fill();
}

function glyph(ctx, G, color) {
  ctx.font = `800 ${N_SIZE}px ${FONTS.display}`;
  ctx.textBaseline = 'alphabetic';
  ctx.letterSpacing = '0px';
  ctx.fillStyle = color;
  ctx.fillText('N', G.ox, G.oy);
}

const MC = document.createElement('canvas'); MC.width = MC.height = 1024;
const MX = MC.getContext('2d');
function maskGlyph(ctx, mask, width, G) {
  // draw the glyph into an offscreen canvas, keep only the pixels under the stroked pen path, then composite
  MX.setTransform(1, 0, 0, 1, 0, 0);
  MX.clearRect(0, 0, 1024, 1024);
  MX.setTransform(2, 0, 0, 2, 512, 512);
  glyph(MX, G, '#F4F8FF');
  MX.globalCompositeOperation = 'destination-in';
  MX.lineCap = 'round'; MX.lineJoin = 'round'; MX.lineWidth = width;
  MX.strokeStyle = '#000';
  MX.stroke(mask);
  MX.globalCompositeOperation = 'source-over';
  MX.setTransform(1, 0, 0, 1, 0, 0);
  ctx.drawImage(MC, -256, -256, 512, 512);
}

function payoffTitle(ctx, t, gb) {
  const out = seg(gb, PAYOFF.collapse0 - 0.4, PAYOFF.collapse0 + 0.2, ease.inCubic);
  if (out >= 1 || gb < PAYOFF.w1 - 0.1) return;
  ctx.save();
  ctx.globalAlpha = 1 - out;
  // a soft dark bed under the words so they hold over the lit field
  const bed = ctx.createLinearGradient(0, H, 0, 560);
  bed.addColorStop(0, 'rgba(1,2,8,0.92)'); bed.addColorStop(0.55, 'rgba(1,2,8,0.6)'); bed.addColorStop(1, 'rgba(1,2,8,0)');
  ctx.fillStyle = bed; ctx.fillRect(0, 560, W, H - 560);
  const y1 = 842, y2 = y1 + 118;
  riseLine(ctx, L1, centerX(L1), y1, t, [B(PAYOFF.w1), B(PAYOFF.w1 + 0.25), B(PAYOFF.w1 + 0.5)], { fill: C.white });
  const sil = L2.words[3];
  glint(ctx, L1, centerX(L1), y1, seg(gb, PAYOFF.w1 + 1.2, PAYOFF.w1 + 2.4, ease.inOutSine), 0.4);
  riseLine(ctx, L2, centerX(L2), y2, t, [B(PAYOFF.w2), B(PAYOFF.w2 + 0.25), B(PAYOFF.w2 + 0.5), B(PAYOFF.w2 + 1.0)], {
    fill: C.white,
    extra: (i) => (i >= sil.a ? { fill: cssGradient(ctx, centerX(L2) + L2.glyphs[sil.a].x, y2 - L2.ascent, sil.w, L2.ascent + L2.descent, GRAD_TEXT) } : null),
  });
  ctx.restore();
}

function signature(ctx, t, gb) {
  if (gb < PAYOFF.sign0) return;
  // the collapsed galaxy's point becomes the pen: it travels from the centre to the N's first stroke, then writes
  const lead = seg(gb, PAYOFF.sign0, PAYOFF.pen0, ease.inOutSine);
  const drawP = ease.inOutSine(seg(gb, PAYOFF.pen0, PAYOFF.sign1));
  const tileP = seg(gb, SIGN.tile, SIGN.tile + 0.55);
  const glow = Math.exp(-Math.max(0, (gb - SIGN.tile)) * BEAT / 0.35) * (gb >= SIGN.tile ? 1 : 0);
  // lockup: the mark shrinks and steps left; "Nova Pitch" wipes out of it; "Pitch Better." after a divider
  const lk = seg(gb, SIGN.word - 0.2, SIGN.word + 0.6, ease.brand);
  const k = lerp(1, 0.5, lk);
  const markW = TILE * 0.5, gap = 40;
  const wordW = WORD.width, tagW = TAG.width, divGap = 38;
  const total = markW + gap + wordW + divGap * 2 + 2 + tagW;
  const baseFix = 0;
  const lx0 = (W - total) / 2;
  const endY = 470 - 70 * seg(gb, SIGN.url - 0.2, SIGN.url + 0.6, ease.brand);
  const cx = lerp(W / 2, lx0 + markW / 2, lk), cy = lerp(540, endY, lk);
  // shockwave off the bloom
  if (glow > 0.01) {
    const r = lerp(TILE * 0.55, 1300, 1 - Math.exp(-(gb - SIGN.tile) * BEAT / 0.3));
    const wv = ctx.createRadialGradient(W / 2, 540, r * 0.7, W / 2, 540, r);
    wv.addColorStop(0, 'rgba(46,107,255,0)'); wv.addColorStop(0.75, `rgba(52,211,235,${0.22 * glow})`); wv.addColorStop(1, 'rgba(125,227,244,0)');
    ctx.fillStyle = wv; ctx.fillRect(0, 0, W, H);
  }
  mark(ctx, cx, cy, k, drawP, tileP, glow, seg(gb, SIGN.glint, SIGN.glint + 1.4), lead);
  if (lk > 0) {
    const wx = lx0 + markW + gap, base = cy + WORD.ascent / 2 - 4;
    ctx.save();
    ctx.beginPath(); ctx.rect(wx - 10, 0, (wordW + 20) * ease.brand(seg(gb, SIGN.word, SIGN.word + 0.8)), H); ctx.clip();
    drawLine(ctx, WORD, wx - (1 - seg(gb, SIGN.word, SIGN.word + 0.8, ease.brand)) * 60, base, { fill: C.white });
    ctx.restore();
    const tg = seg(gb, SIGN.tag, SIGN.tag + 0.7, ease.brand);
    if (tg > 0) {
      const dx = wx + wordW + divGap;
      ctx.save();
      ctx.globalAlpha = tg;
      ctx.fillStyle = 'rgba(255,255,255,0.28)';
      ctx.fillRect(dx, cy - 36 * tg, 2, 72 * tg);
      drawLine(ctx, TAG, dx + 2 + divGap + (1 - tg) * 24, base - (WORD.ascent - TAG.ascent) / 2, { fill: 'rgba(255,255,255,0.55)' });
      ctx.restore();
    }
  }
  // end card: what it is, in the product's own words, then the call to action
  const u = seg(gb, SIGN.url, SIGN.url + 0.7, ease.brand);
  if (u > 0) {
    ctx.save();
    ctx.globalAlpha = u;
    drawLine(ctx, DEF, centerX(DEF), 530 + (1 - u) * 14, { fill: 'rgba(255,255,255,0.8)' });
    ctx.restore();
  }
  const uc = seg(gb, SIGN.url + 0.3, SIGN.url + 1.0, ease.brand);
  if (uc > 0) {
    const u = uc;
    const bw = 440, bh = 104, bx = (W - bw) / 2, by = 620 + (1 - u) * 20;
    ctx.save();
    ctx.globalAlpha = u;
    novaButton(ctx, bx, by, bw, bh, 18, 1.4);
    icon(ctx, 'zap', bx + 52, by + bh / 2 - 19, 38, '#fff', 2.2);
    text(ctx, 'Start free', bx + 106, by + bh / 2 + 15, { size: 42, w: 600 });
    icon(ctx, 'arrow-right', bx + bw - 88, by + bh / 2 - 18, 36, '#fff', 2.4);
    const v = seg(gb, SIGN.cta, SIGN.cta + 0.7, ease.brand);
    ctx.globalAlpha = v;
    text(ctx, 'novapitch.ai', W / 2, by + bh + 74 + (1 - v) * 12, { f: FONTS.display, size: 40, w: 600, color: 'rgba(255,255,255,0.78)', align: 'center' });
    ctx.restore();
  }
}

function draw(ctx, t) {
  const gb = t / BEAT;
  payoffTitle(ctx, t, gb);
  const push = seg(gb, SIGN.url, SIGN.fade1, ease.inOutSine);
  ctx.save();
  ctx.translate(W / 2, 540); ctx.scale(1 + 0.03 * push, 1 + 0.03 * push); ctx.translate(-W / 2, -540);
  signature(ctx, t, gb);
  ctx.restore();
}

export default {
  id: 'finale',
  init() {
    L1 = new Line('Stop sending documents', { s: 112, w: 700 });
    L2 = new Line('that end in silence.', { s: 112, w: 700 });
    WORD = new Line('Nova Pitch', { s: 80, w: 700, track: -0.02 });
    TAG = new Line('Pitch Better.', { s: 58, w: 600, track: -0.02 });
    DEF = new Line('One link. Your whole pitch \u2014 that answers back.', { s: 46, w: 600, track: -0.01 });
    GLYPH = measureN();
  },
  layers: [{ start: B(PAYOFF.w1 - 0.1), end: B(SIGN.fade1) + 0.1, draw }],
};
