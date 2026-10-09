// Chat components at film scale (sizes in points × k): message bubbles with grouped corners, the typing indicator,
// quick-reply chips. Styling comes from the brand tokens; geometry from iMessage / Messenger conventions
// (17 pt text, 12 × 7.5 pt padding, 18 pt radius, 4 pt corner on the sender's side for a joined group).
import { FONTS, UI, SPRING } from '../brand.js';
import { squirclePath, text, about } from './kit.js';
import { clamp, spring, springVel, smoothstep } from '../util.js';
import { wrap, measureStr } from '../type.js';

// Lay out a message: wrapped lines and the bubble's size. `maxW` in points.
export function layoutMsg(s, k, { size = 17, w = 400, maxW = 260, padX = 13, padY = 8.5, lh = 1.29, font = FONTS.ui } = {}) {
  const opt = { f: font, w, s: size * k, track: 0 };
  const lines = wrap(s, maxW * k - padX * 2 * k, opt);
  const tw = Math.max(...lines.map((l) => measureStr(l, opt)));
  return { lines, opt, W: tw + padX * 2 * k, H: lines.length * size * lh * k + padY * 2 * k, lh: size * lh * k, padX: padX * k, padY: padY * k };
}

// Draw a laid-out message with its top-left at (x, y). side: 'in' (left) or 'out' (right); `joinTop`/`joinBottom`
// shrink the sender-side corners where it touches its neighbours. `t0` is when it was sent: it springs up from its
// sender-side bottom corner. Returns the bubble's height.
export function drawMsg(ctx, m, x, y, side, t, t0, { fill, ink, k, joinTop = false, joinBottom = false, r = 18, small = 5, lift = 1, emphasis = 0 } = {}) {
  const dt = t - t0;
  if (dt < 0) return 0;
  const p = spring(dt, SPRING.pop);
  const v = springVel(dt, SPRING.pop);
  const rr = r * k, sm = small * k;
  const out = side === 'out';
  const radii = out
    ? [rr, joinTop ? sm : rr, joinBottom ? sm : sm * 1.2, rr]
    : [joinTop ? sm : rr, rr, rr, joinBottom ? sm : sm * 1.2];
  const ox = out ? x + m.W : x, oy = y + m.H;          // grows from the sender-side bottom corner
  const sq = clamp(v * 0.012, -0.06, 0.08);
  const sc = 0.4 + 0.6 * p;
  about(ctx, ox, oy, sc * (1 + sq), sc * (1 - sq), () => {
    ctx.save();
    ctx.globalAlpha *= clamp(dt * 12);
    const path = squirclePath(x, y, m.W, m.H, radii);
    if (lift > 0) {
      ctx.shadowColor = `rgba(40, 20, 70, ${0.07 * lift})`; ctx.shadowBlur = 14 * k; ctx.shadowOffsetY = 4 * k;
    }
    ctx.fillStyle = fill;
    ctx.fill(path);
    ctx.shadowColor = 'transparent';
    m.lines.forEach((l, i) => {
      text(ctx, l, x + m.padX, y + m.padY + m.lh * (i + 0.5) + m.opt.s * 0.35, { f: m.opt.f, w: m.opt.w + emphasis * 300, size: m.opt.s, color: ink });
    });
    ctx.restore();
  });
  return m.H;
}

// Typing indicator: three dots in a bubble, each rising on its own phase (≈ iMessage cadence: 1.2 s per cycle).
export function typing(ctx, x, y, t, t0, t1, { fill, dot, k, side = 'in' } = {}) {
  if (t < t0 || t > t1 + 0.25) return;
  const p = spring(t - t0, SPRING.pop) * (1 - smoothstep(t1, t1 + 0.25, t));
  const W = 58 * k, H = 36 * k;
  const ox = side === 'out' ? x + W : x;
  about(ctx, ox, y + H, p, p, () => {
    ctx.fillStyle = fill;
    ctx.fill(squirclePath(x, y, W, H, side === 'out' ? [H / 2, H / 2, 6 * k, H / 2] : [H / 2, H / 2, H / 2, 6 * k]));
    for (let i = 0; i < 3; i++) {
      const ph = ((t - t0) / 1.2 - i * 0.16) % 1;
      const b = Math.max(0, Math.sin(ph * Math.PI * 2)) ** 2;
      ctx.globalAlpha = 0.45 + 0.55 * b;
      ctx.fillStyle = dot;
      ctx.beginPath();
      ctx.arc(x + W / 2 + (i - 1) * 12 * k, y + H / 2 - b * 3.5 * k, 4.2 * k, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  });
}

// A quick-reply / priority chip. state: 0 idle → 1 selected (fills with its colour, the label turns white).
export function chip(ctx, label, x, y, k, { color, state = 0, size = 16, icon = null, badge = null, h = 40, pad = 16, alpha = 1, scale = 1 } = {}) {
  const tw = measureStr(label, { f: FONTS.ui, w: 600, s: size * k });
  const iw = icon ? 22 * k : 0;
  const W = tw + pad * 2 * k + iw, H = h * k;
  about(ctx, x + W / 2, y + H / 2, scale, scale, () => {
    ctx.save();
    ctx.globalAlpha *= alpha;
    const path = squirclePath(x, y, W, H, H / 2);
    ctx.fillStyle = UI.chipIdle;
    ctx.fill(path);
    if (state > 0) {
      ctx.save();
      ctx.clip(path);
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(x + W / 2, y + H / 2, (W / 2 + 4 * k) * state, 0, Math.PI * 2);   // the colour floods from the tap point
      ctx.fill();
      ctx.restore();
    }
    ctx.lineWidth = 1.5 * k;
    ctx.strokeStyle = state > 0.5 ? 'transparent' : UI.chipStroke;
    ctx.stroke(path);
    const ink = state > 0.5 ? '#fff' : UI.ink;
    if (icon) icon(ctx, x + pad * k, y + H / 2 - 9 * k, 18 * k, ink);
    text(ctx, label, x + pad * k + iw, y + H / 2 + size * k * 0.36, { f: FONTS.ui, w: 600, size: size * k, color: ink });
    if (badge) badge(ctx, x + W - 4 * k, y + 2 * k);
    ctx.restore();
  });
  return W;
}
