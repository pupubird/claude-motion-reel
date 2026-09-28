// Kinetic type: kerning-safe glyph layout (every glyph placed at the measured width of its prefix, so per-glyph
// motion never breaks the font's spacing), words that rise out of a mask, the site's 135° gradient text, and
// per-glyph reveals driven by any function (a light wave, a dimming, a swap).
import { FONTS, GRAD_TEXT } from './config.js';
import { clamp, ease } from './util.js';

const mctx = document.createElement('canvas').getContext('2d');

export function setFont(ctx, { f = FONTS.display, w = 700, s = 100, track = -0.03 } = {}) {
  ctx.font = `${w} ${s}px ${f}`;
  ctx.letterSpacing = `${(track * s).toFixed(2)}px`;
  ctx.textBaseline = 'alphabetic';
  ctx.textAlign = 'left';
}

export class Line {
  constructor(text, opt = {}) {
    this.text = text;
    this.opt = { f: FONTS.display, w: 700, s: 118, track: -0.03, ...opt };
    setFont(mctx, this.opt);
    const chars = [...text];
    this.glyphs = [];
    let acc = '';
    for (const ch of chars) {
      const x = mctx.measureText(acc).width;
      acc += ch;
      this.glyphs.push({ ch, x, w: mctx.measureText(acc).width - x });
    }
    // trailing letter-spacing is not ink: drop one tracking unit from the measured width
    this.width = mctx.measureText(text).width - this.opt.track * this.opt.s;
    const m = mctx.measureText('Hdgy');
    this.ascent = mctx.measureText('H').actualBoundingBoxAscent;
    this.descent = m.actualBoundingBoxDescent;
    // words: index ranges over glyphs (a word keeps its trailing punctuation)
    this.words = [];
    let st = 0;
    chars.forEach((ch, i) => {
      if (ch === ' ') { if (i > st) this.words.push(this.#word(st, i)); st = i + 1; }
    });
    if (st < chars.length) this.words.push(this.#word(st, chars.length));
  }
  #word(a, b) {
    const g = this.glyphs;
    return { a, b, x: g[a].x, w: g[b - 1].x + g[b - 1].w - g[a].x, text: this.text.slice(a, b) };
  }
}

// 135° CSS gradient across a box (x, top, w, h), like the site's .home-gradient-text.
export function cssGradient(ctx, x, top, w, h, stops = GRAD_TEXT, deg = 135) {
  const a = (deg * Math.PI) / 180;
  const dx = Math.sin(a), dy = -Math.cos(a);
  const L = Math.abs(w * dx) + Math.abs(h * dy);
  const cx = x + w / 2, cy = top + h / 2;
  const g = ctx.createLinearGradient(cx - (dx * L) / 2, cy - (dy * L) / 2, cx + (dx * L) / 2, cy + (dy * L) / 2);
  for (const [o, c] of stops) g.addColorStop(o, c);
  return g;
}

// Draw `line` with its baseline at (x, y). `each(i, g, word)` may return { a, dx, dy, sc, fill } per glyph.
// `fill` is a colour or 'gradient'. Glyphs are drawn one by one at their measured positions.
export function drawLine(ctx, line, x, y, { fill = '#fff', each = null, gradient = null, log = true } = {}) {
  setFont(ctx, line.opt);
  ctx.letterSpacing = '0px';
  const grad = gradient ? cssGradient(ctx, x, y - line.ascent, line.width, line.ascent + line.descent, gradient) : null;
  const wordOf = (i) => line.words.findIndex((w) => i >= w.a && i < w.b);
  const os = line.glyphs.map((g, i) => (g.ch === ' ' || !each ? null : each(i, g, wordOf(i))));
  // reading-time audit (tools/check_reading.mjs): how visible the whole line is on this frame
  if (log && globalThis.__textlog) {
    const ink = os.filter((o, i) => line.glyphs[i].ch !== ' ');
    const a = Math.min(1, ...ink.map((o) => clamp(o?.a ?? 1)));
    const dy = Math.max(0, ...ink.map((o) => Math.abs((o?.dy ?? 0)) + Math.abs(o?.dx ?? 0)));
    globalThis.__textlog.push({ s: line.text, a: ctx.globalAlpha * a, dy });
  }
  // glyphs asking for 'gradient' share one brand gradient spanning just their own box (like the site's gradient span)
  let gGrad = null;
  const gi = os.map((o, i) => (o?.fill === 'gradient' ? i : -1)).filter((i) => i >= 0);
  if (gi.length) {
    const a = line.glyphs[gi[0]], b = line.glyphs[gi[gi.length - 1]];
    gGrad = cssGradient(ctx, x + a.x, y - line.ascent, b.x + b.w - a.x, line.ascent + line.descent, GRAD_TEXT);
  }
  line.glyphs.forEach((g, i) => {
    if (g.ch === ' ') return;
    const o = os[i] ? { ...os[i], fill: os[i].fill === 'gradient' ? gGrad : os[i].fill } : null;
    const a = o?.a ?? 1;
    if (a <= 0.002) return;
    ctx.save();
    ctx.globalAlpha *= clamp(a);
    ctx.fillStyle = o?.fill ?? grad ?? fill;
    const gx = x + g.x + (o?.dx ?? 0), gy = y + (o?.dy ?? 0);
    if (o?.sc && o.sc !== 1) {
      ctx.translate(gx + g.w / 2, gy - line.ascent / 2);
      ctx.scale(o.sc, o.sc);
      ctx.fillText(g.ch, -g.w / 2, line.ascent / 2);
    } else ctx.fillText(g.ch, gx, gy);
    ctx.restore();
  });
}

// Words rising out of a mask: word k starts at `at[k]` (seconds), takes `dur`; returns an `each` for drawLine.
// The mask is the line box itself, applied by clipping (see riseLine).
export function riseEach(line, t, at, dur = 0.5) {
  const lift = line.ascent + line.descent + 6;       // start fully below the mask
  return (i, g, wk) => {
    const p = ease.brand(clamp((t - at[Math.max(0, wk)]) / dur));
    return { a: p > 0 ? 1 : 0, dy: (1 - p) * lift };
  };
}

// Draw a line whose words rise into place; the clip keeps rising glyphs invisible below the baseline band.
export function riseLine(ctx, line, x, y, t, at, opt = {}) {
  const { dur = 0.5, fill, gradient, extra = null, out = null } = opt;
  ctx.save();
  ctx.beginPath();
  ctx.rect(x - 40, y - line.ascent - line.opt.s * 0.35, line.width + 80, line.ascent + line.descent + line.opt.s * 0.35 + 3);
  ctx.clip();
  const rise = riseEach(line, t, at, dur);
  drawLine(ctx, line, x, y, {
    fill, gradient,
    each: (i, g, wk) => {
      const r = rise(i, g, wk);
      const e = extra ? extra(i, g, wk) : null;
      const o = out ? out(i, g, wk) : null;
      return { a: r.a * (e?.a ?? 1) * (o?.a ?? 1), dy: r.dy + (o?.dy ?? 0), dx: e?.dx ?? 0, fill: e?.fill };
    },
  });
  ctx.restore();
}

export const centerX = (line, cx = 960) => cx - line.width / 2;

// A specular glint that sweeps once across a set line (p: 0 → 1), like light catching the lettering.
// Drawn as the same glyphs in white, clipped to a slanted band.
export function glint(ctx, line, x, y, p, strength = 0.55) {
  if (p <= 0 || p >= 1) return;
  const bw = line.opt.s * 0.9, span = line.width + bw * 2;
  const bx = x - bw + span * p;
  ctx.save();
  ctx.beginPath();
  const top = y - line.ascent - 10, bot = y + line.descent + 10, lean = (bot - top) * 0.35;
  ctx.moveTo(bx + lean, top); ctx.lineTo(bx + bw + lean, top); ctx.lineTo(bx + bw - lean, bot); ctx.lineTo(bx - lean, bot); ctx.closePath();
  ctx.clip();
  const g = ctx.createLinearGradient(bx - lean, 0, bx + bw + lean, 0);
  g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(0.5, `rgba(255,255,255,${strength})`); g.addColorStop(1, 'rgba(255,255,255,0)');
  drawLine(ctx, line, x, y, { fill: g, log: false });
  ctx.restore();
}
