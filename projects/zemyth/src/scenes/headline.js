// Bars 5–10 · the headline line.
// One display line at the top-left carries the story: TEN BUILDERS. → ONE HOUSE. → YOU SHIP SOMETHING
// REAL. → WE BACK THE BEST. Each word rises on its spoken onset (Scribe timings of the real voice);
// the previous line lifts away just before. One lime pill is the constant: it glides from keyword to
// keyword and the keyword rises into it, tilted with it like a sticker.
import { BEAT, C, FONTS } from '../config.js';
import { ease, seg, clamp, lerp } from '../util.js';
import { font } from '../draw2d.js';
import { layoutLine, pillRect, pill, capH } from '../brand.js';
import { B, HEADLINES, VO_AT } from '../score.js';
import { wordAt } from '../assets.js';
import { HEAD } from '../layout.js';

const TILT = -0.045;
const RISE = 0.3 * BEAT, EXIT = 0.22;
let LINES = null;

// Lay out every headline once: words with the keyword padded so the pill never touches its neighbours,
// the keyword's trailing punctuation set outside the pill.
function build(ctx) {
  LINES = HEADLINES.map((h) => {
    const words = h.words.slice();
    const kw = words[h.key];
    const punct = /[.,!?]$/.test(kw) ? kw.slice(-1) : '';
    const L = layoutLine(ctx, words, HEAD.x, HEAD.base, HEAD.size);
    const ch = L.capH;
    const pad = ch * 0.36;
    font(ctx, { f: FONTS.display, w: 700, s: HEAD.size });
    const pw = ctx.measureText(punct).width;
    // shift the keyword right by the pad and everything after it by 2 pads
    L.boxes.forEach((b, i) => { if (i === h.key) b.x += pad; if (i > h.key) b.x += pad * 2; });
    const kb = L.boxes[h.key];
    const inner = { ...kb, w: kb.w - pw };
    const pr = pillRect(inner, { padX: 0.36, padY: 0.31 });
    const on = L.boxes.map((_, i) => B(VO_AT[h.line]) + wordAt(h.line, i) - 0.035);
    return { ...h, L, kb, pr, punct, pw, pad, on, start: on[0] };
  });
}

// Which headline is live at t, and the next one (for exits).
function lineIndex(t) {
  let k = -1;
  for (let i = 0; i < LINES.length; i++) if (t >= LINES[i].start - EXIT - 0.02) k = i;
  return k;
}

function drawWords(ctx, H, t, exitP) {
  const ch = H.L.capH;
  const band = { y: HEAD.base - ch * 1.6, h: ch * 2.1 };
  font(ctx, { f: FONTS.display, w: 700, s: HEAD.size });
  ctx.textBaseline = 'alphabetic';
  H.L.boxes.forEach((b, i) => {
    const p = ease.outExpo(clamp((t - H.on[i]) / RISE));
    if (p <= 0) return;
    const dy = (1 - p) * ch * 1.35 - ease.inCubic(i === H.key ? clamp(exitP / 0.55) : exitP) * ch * 1.6;
    if (i === H.key) {
      // the keyword rises inside the pill, rotated with it; on exit it lifts out before the pill leaves
      if (exitP >= 0.55) return;
      ctx.save();
      ctx.globalAlpha *= 1 - seg(exitP, 0.2, 0.55);
      ctx.translate(H.pr.cx, H.pr.cy);
      ctx.rotate(TILT);
      ctx.beginPath();
      ctx.rect(-H.pr.w / 2, -H.pr.h / 2, H.pr.w, H.pr.h);
      ctx.clip();
      ctx.fillStyle = C.black;
      const word = H.punct ? b.text.slice(0, -1) : b.text;
      ctx.fillText(word, b.x - H.pr.cx, HEAD.base - H.pr.cy + dy);
      ctx.restore();
      if (H.punct) {
        ctx.save();
        ctx.beginPath(); ctx.rect(b.x - 10, band.y, b.w + H.pad * 2 + 40, band.h); ctx.clip();
        ctx.fillStyle = C.white;
        ctx.fillText(H.punct, H.pr.cx + H.pr.w / 2 + ch * 0.1, HEAD.base + dy);
        ctx.restore();
      }
      return;
    }
    ctx.save();
    ctx.beginPath(); ctx.rect(b.x - 10, band.y, b.w + 20, band.h); ctx.clip();
    ctx.fillStyle = C.white;
    ctx.fillText(b.text, b.x, HEAD.base + dy);
    ctx.restore();
  });
}

function draw(ctx, t) {
  if (!LINES) build(ctx);
  const k = lineIndex(t);
  if (k < 0) return;
  const H = LINES[k];
  const prev = k > 0 ? LINES[k - 1] : null;
  // outgoing line lifts away just before the new line's first word
  if (prev) {
    const xp = seg(t, H.start - EXIT, H.start);
    if (xp < 1) drawWords(ctx, prev, t, xp);
  }
  // the pill: grows in behind the first keyword, then glides keyword to keyword
  const kOn = H.on[H.key];
  let r = H.pr, sx = 1;
  if (prev) {
    // the pill moves while the old line lifts away, so it is already waiting in the new keyword's slot
    // before any new word rises (no word ever passes over it)
    const g = ease.inOutCubic(seg(t, H.start - EXIT * 0.45, H.start + 0.1));
    r = { cx: lerp(prev.pr.cx, H.pr.cx, g), cy: lerp(prev.pr.cy, H.pr.cy, g), w: lerp(prev.pr.w, H.pr.w, g), h: H.pr.h };
  } else {
    sx = ease.outExpo(seg(t, kOn - 0.1, kOn + 0.22));
  }
  // exit of the whole system at the end of Chapter 5
  const out = seg(t / BEAT, 39.55, 39.95, ease.inCubic);   // clears as the first coin falls into frame
  if (sx > 0.001 && out < 1) {
    ctx.save();
    ctx.globalAlpha *= 1 - out;
    ctx.translate(r.cx - r.w / 2, r.cy);
    ctx.scale(sx, 1);
    ctx.translate(-(r.cx - r.w / 2), -r.cy);
    pill(ctx, r.cx, r.cy - out * 40, r.w, r.h, { fill: C.lime, tilt: TILT });
    ctx.restore();
  }
  ctx.save();
  ctx.globalAlpha *= 1 - out;
  ctx.translate(0, -out * 40);
  drawWords(ctx, H, t, 0);
  ctx.restore();
}

// Screen rect of the pill at time t (other scenes align to it).
export function pillAt(ctx, t) {
  if (!LINES) build(ctx);
  const k = lineIndex(t);
  return k < 0 ? null : LINES[k].pr;
}

export default { id: 'headline', layers: [{ start: B(16), end: B(40), draw }] };
