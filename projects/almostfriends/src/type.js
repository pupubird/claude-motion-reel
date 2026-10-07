// Kinetic type. Kerning-safe glyph layout: every glyph sits at the measured width of its prefix, so per-glyph motion
// never breaks the font's spacing. Glyphs and words animate with springs (pop, rise, bounce) and variable weight.
// Every string drawn is logged for the reading-time gate (tools/check_reading.mjs) when the page runs with ?textlog.
import { FONTS, SPRING } from './brand.js';
import { clamp, spring, springVel } from './util.js';

const mctx = document.createElement('canvas').getContext('2d');

export function setFont(ctx, { f = FONTS.display, w = 700, s = 100, track = 0, stretch = 'normal' } = {}) {
  ctx.font = `${Math.round(w)} ${s}px ${f}`;
  ctx.fontStretch = stretch;
  ctx.letterSpacing = `${(track * s).toFixed(2)}px`;
  ctx.textBaseline = 'alphabetic';
  ctx.textAlign = 'left';
}

export class Line {
  constructor(text, opt = {}) {
    this.text = text;
    this.opt = { f: FONTS.display, w: 700, s: 110, track: -0.02, ...opt };
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
    this.ascent = mctx.measureText('H').actualBoundingBoxAscent;
    this.xh = mctx.measureText('x').actualBoundingBoxAscent;
    this.descent = mctx.measureText('gy').actualBoundingBoxDescent;
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
  wordOf(i) { return this.words.findIndex((w) => i >= w.a && i < w.b); }
}

// Draw `line` with its baseline at (x, y). `each(i, g, wordIndex)` may return per glyph:
//   { a, dx, dy, sc, sx, sy, rot, w, fill } — alpha, offset, uniform/axis scale (about the glyph's x-height centre),
//   rotation, a variable weight override and a fill. Glyphs are drawn one by one at their measured positions.
export function drawLine(ctx, line, x, y, { fill = '#000', each = null, log = true, alpha = 1 } = {}) {
  setFont(ctx, line.opt);
  ctx.letterSpacing = '0px';
  const os = line.glyphs.map((g, i) => (g.ch === ' ' || !each ? null : each(i, g, line.wordOf(i))));
  if (log && globalThis.__textlog) {
    const ink = os.filter((o, i) => line.glyphs[i].ch !== ' ');
    const a = Math.min(1, ...ink.map((o) => clamp(o?.a ?? 1))) * alpha;
    const mv = Math.max(0, ...ink.map((o) => Math.abs(o?.dy ?? 0) + Math.abs(o?.dx ?? 0) + Math.abs((o?.sc ?? 1) - 1) * line.opt.s));
    globalThis.__textlog.push({ s: line.text, a: ctx.globalAlpha * a, dy: mv });
  }
  line.glyphs.forEach((g, i) => {
    if (g.ch === ' ') return;
    const o = os[i];
    const a = (o?.a ?? 1) * alpha;
    if (a <= 0.002) return;
    ctx.save();
    ctx.globalAlpha *= clamp(a);
    ctx.fillStyle = o?.fill ?? fill;
    if (o?.w !== undefined) ctx.font = `${Math.round(o.w)} ${line.opt.s}px ${line.opt.f}`;
    const gx = x + g.x + (o?.dx ?? 0), gy = y + (o?.dy ?? 0);
    const sx = (o?.sc ?? 1) * (o?.sx ?? 1), sy = (o?.sc ?? 1) * (o?.sy ?? 1);
    if (sx !== 1 || sy !== 1 || o?.rot) {
      const cy = gy - line.xh / 2;
      ctx.translate(gx + g.w / 2, cy);
      if (o?.rot) ctx.rotate(o.rot);
      ctx.scale(sx, sy);
      ctx.fillText(g.ch, -g.w / 2, line.xh / 2);
    } else ctx.fillText(g.ch, gx, gy);
    ctx.restore();
  });
}

export const centerX = (line, cx) => cx - line.width / 2;

// Spring pop per word: word k is released at at[k]; it scales up from 0 with the spring's overshoot and squashes
// along its motion (stretch tall while it grows fast, settle round).
export function popEach(line, t, at, { spr = SPRING.pop, from = 0, lift = 0.32 } = {}) {
  return (i, g, wk) => {
    const k = Math.max(0, wk), t0 = at[Math.min(k, at.length - 1)];
    const p = spring(t - t0, spr);
    if (t < t0) return { a: 0 };
    const v = springVel(t - t0, spr);
    const sq = clamp(v * 0.02, -0.12, 0.12);              // squash & stretch from velocity
    const sc = from + (1 - from) * p;
    return { a: clamp(p * 4), sc, sx: 1 - sq, sy: 1 + sq, dy: (1 - p) * lift * line.opt.s };
  };
}

// Per-glyph wave: a bounce that travels along the line (for a word landing as a group, or a celebration).
export function waveEach(line, t, t0, { amp = 0.22, gap = 0.035, spr = SPRING.pop } = {}) {
  return (i) => {
    const dt = t - t0 - i * gap;
    if (dt <= 0) return null;
    const p = spring(dt, spr);
    const kick = Math.sin(Math.min(1, p) * Math.PI) * (1 - Math.min(1, dt * 1.5));
    return { dy: -kick * amp * line.opt.s };
  };
}

// Combine `each` functions (alpha and scales multiply, offsets add, last fill/weight wins).
export function combine(...fns) {
  return (i, g, wk) => {
    const o = { a: 1, dx: 0, dy: 0, sc: 1, sx: 1, sy: 1, rot: 0 };
    let any = false;
    for (const f of fns) {
      if (!f) continue;
      const r = f(i, g, wk);
      if (!r) continue;
      any = true;
      if (r.a !== undefined) o.a *= r.a;
      o.dx += r.dx ?? 0; o.dy += r.dy ?? 0; o.rot += r.rot ?? 0;
      if (r.sc !== undefined) o.sc *= r.sc;
      if (r.sx !== undefined) o.sx *= r.sx;
      if (r.sy !== undefined) o.sy *= r.sy;
      if (r.fill !== undefined) o.fill = r.fill;
      if (r.w !== undefined) o.w = r.w;
    }
    return any ? o : null;
  };
}

// Wrap a string into lines no wider than maxW at the given font options.
export function wrap(s, maxW, opt) {
  setFont(mctx, opt);
  const words = s.split(' ');
  const lines = [];
  let cur = '';
  for (const w of words) {
    const t2 = cur ? cur + ' ' + w : w;
    if (mctx.measureText(t2).width > maxW && cur) { lines.push(cur); cur = w; } else cur = t2;
  }
  if (cur) lines.push(cur);
  return lines;
}

export function measureStr(s, opt) {          // (s, { f, w, s }) — not kit.measure(ctx, s, …)
  setFont(mctx, opt);
  return mctx.measureText(s).width - (opt.track ?? 0) * (opt.s ?? 100);
}
