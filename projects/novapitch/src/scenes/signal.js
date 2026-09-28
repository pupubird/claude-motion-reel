// Act VI — the signal comes home: the owner sees what the recipient cared about. Slide 5 shrinks out of the
// room into its slot in the deck's attention row (a match cut), attention rises off every slide (the showroom's
// real dwell data), then the top questions, and the interest that ends the silence. The interest folds into a
// point that hands over to Act VII's line without a cut: the 3D shot fades up under it.
import { W, H, C, BEAT, FONTS } from '../config.js';
import { ease, clamp, lerp, seg } from '../util.js';
import { B, SIGNAL, PAYOFF } from '../score.js';
import { SLIDES } from '../assets.js';
import { Line, riseLine, centerX, glint } from '../type.js';
import { SLIDE } from '../ui/room.js';
import { PROBE } from './world.js';
import { glass, text, chip, rr, measure } from '../ui/kit.js';
import { icon } from '../ui/icons.js';

// attention per slide: showroom demo scenario (dwell seconds, questions)
const DWELL = [32, 78, 156, 244, 352, 219, 137, 267];
const QS = [0, 1, 2, 4, 6, 3, 1, 5];
const TOPICS = [['ROI & payback', 12], ['Deployment', 9], ['Data advantage', 7], ['Security', 4]];
const ROW = { x: 127, y: 742, w: 196, h: 110, gap: 14 };
const slot = (i) => ({ x: ROW.x + i * (ROW.w + ROW.gap), y: ROW.y, w: ROW.w, h: ROW.h });
let T;

// where slide 5 sits on screen at the end of the room shot (room.js's push into the cited figure)
function roomSlideRect() {
  const zoom = 2.35;
  const fx = SLIDE.x + SLIDE.w * 0.16, fy = SLIDE.y + SLIDE.h * 0.65;
  return { x: W / 2 - fx * zoom + SLIDE.x * zoom, y: H / 2 - fy * zoom + SLIDE.y * zoom, w: SLIDE.w * zoom, h: SLIDE.h * zoom };
}

function slideCard(ctx, img, r, a = 1, hot = 0) {
  ctx.save();
  ctx.globalAlpha *= a;
  rr(ctx, r.x, r.y, r.w, r.h, Math.max(6, r.w * 0.03)); ctx.save(); ctx.clip();
  ctx.drawImage(img, r.x, r.y, r.w, r.h);
  ctx.restore();
  ctx.lineWidth = hot > 0 ? 2.5 : 1.2;
  ctx.strokeStyle = hot > 0 ? `rgba(92,141,255,${0.35 + 0.65 * hot})` : 'rgba(255,255,255,0.14)';
  rr(ctx, r.x + 0.5, r.y + 0.5, r.w - 1, r.h - 1, Math.max(6, r.w * 0.03)); ctx.stroke();
  ctx.restore();
}

function fmt(sec) { const m = Math.floor(sec / 60), s = Math.round(sec % 60); return m ? `${m}m ${String(s).padStart(2, '0')}s` : `${s}s`; }

function attention(ctx, t, gb, vis) {
  const into = seg(gb, SIGNAL.in, SIGNAL.in + 2.0, ease.inOutCubic);   // slow enough to follow slide 5 home
  const back = seg(gb, SIGNAL.topics - 0.2, SIGNAL.topics + 0.7, ease.brand);    // the row steps back for the cards
  ctx.save();
  ctx.globalAlpha = vis * (1 - 0.72 * back);
  ctx.translate(W / 2, ROW.y + ROW.h);
  ctx.scale(1 - 0.08 * back, 1 - 0.08 * back);
  ctx.translate(-W / 2, -(ROW.y + ROW.h) + back * 60);
  // a cobalt pool of light under the row
  const pool = ctx.createRadialGradient(W / 2, ROW.y + 60, 0, W / 2, ROW.y + 60, 900);
  pool.addColorStop(0, `rgba(37,99,235,${0.16 * into})`); pool.addColorStop(1, 'rgba(37,99,235,0)');
  ctx.fillStyle = pool; ctx.fillRect(0, 0, W, H);
  // heat bars: rise off each slide, height by dwell; slide 5 runs hottest
  const maxH = 360, maxD = Math.max(...DWELL);
  DWELL.forEach((d, i) => {
    const s = slot(i);
    const p = ease.brand(seg(gb, SIGNAL.heat0 + i * 0.12, SIGNAL.heat0 + i * 0.12 + 1.2));
    const h = (d / maxD) * maxH * p;
    const bx = s.x + 18, bw = s.w - 36, by = s.y - 18 - h;
    const hot = i === 4;
    const g = ctx.createLinearGradient(0, s.y - 18, 0, s.y - 18 - maxH);
    g.addColorStop(0, hot ? 'rgba(37,99,235,0.9)' : 'rgba(37,99,235,0.55)');
    g.addColorStop(1, hot ? 'rgba(125,227,244,1)' : 'rgba(52,211,235,0.55)');
    rr(ctx, bx, by, bw, h, 10); ctx.fillStyle = g; ctx.fill();
    if (hot && h > 4) {
      ctx.save(); ctx.shadowColor = 'rgba(52,211,235,0.85)'; ctx.shadowBlur = 40; rr(ctx, bx, by, bw, Math.min(h, 60), 10); ctx.fillStyle = 'rgba(200,245,255,0.9)'; ctx.fill(); ctx.restore();
    }
  });
  // the slides themselves (slide 5 arrives from the room, the rest fly in to meet it)
  const from = roomSlideRect(), to5 = slot(4);
  SLIDES.forEach((img, i) => {
    let r = slot(i), a = 1;
    if (i === 4) {
      r = { x: lerp(from.x, to5.x, into), y: lerp(from.y, to5.y, into), w: lerp(from.w, to5.w, into), h: lerp(from.h, to5.h, into) };
    } else {
      const p = ease.brand(seg(gb, SIGNAL.in + 0.6 + Math.abs(i - 4) * 0.1, SIGNAL.in + 1.9 + Math.abs(i - 4) * 0.1));
      r = { ...r, x: r.x + (i < 4 ? -1 : 1) * (1 - p) * 700 };
      a = p;
    }
    slideCard(ctx, img, r, a, i === 4 ? seg(gb, SIGNAL.heat0 + 0.6, SIGNAL.heat1) : 0);
    if (i === 4 && into < 1) {
      const ra = 1 - seg(gb, SIGNAL.in + 0.4, SIGNAL.in + 1.4);
      ctx.save(); ctx.globalAlpha *= ra; ctx.lineWidth = 4; ctx.strokeStyle = C.iris400;
      ctx.shadowColor = 'rgba(46,107,255,0.8)'; ctx.shadowBlur = 18;
      rr(ctx, r.x + r.w * 0.062, r.y + r.h * 0.585, r.w * 0.2, r.h * 0.135, 14 * r.w / SLIDE.w); ctx.stroke(); ctx.restore();
    }
  });
  // slide 5's reading: time on slide, questions asked — counted up as the bar rises
  const c = seg(gb, SIGNAL.heat0 + 0.5, SIGNAL.heat1 + 0.2, ease.outCubic);
  const cGone = seg(gb, SIGNAL.topics - 0.3, SIGNAL.topics + 0.2);
  if (c > 0 && cGone < 1) {
    const s = slot(4);
    const top = s.y - 18 - 360 * ease.brand(seg(gb, SIGNAL.heat0 + 0.48, SIGNAL.heat0 + 1.68));
    ctx.save();
    ctx.globalAlpha *= clamp(c * 2) * (1 - cGone);
    text(ctx, fmt(DWELL[4] * c), s.x + s.w / 2, top - 58, { f: FONTS.display, w: 700, size: 52, align: 'center' });
    text(ctx, `${Math.round(QS[4] * c)} questions`, s.x + s.w / 2, top - 18, { size: 27, color: C.text2, align: 'center', w: 500 });
    ctx.restore();
  }
  ctx.restore();
}

function topicsCard(ctx, gb) {
  const p = seg(gb, SIGNAL.topics, SIGNAL.topics + 0.6, ease.brand);
  if (p <= 0) return;
  const w = 860, h = 330, x = (W - w) / 2, y = 292;
  ctx.save();
  ctx.globalAlpha = p;
  ctx.translate(0, (1 - p) * 30);
  glass(ctx, x, y, w, h, 18, { fill: 'rgba(9,11,19,0.96)', border: 'rgba(255,255,255,0.12)' });
  icon(ctx, 'message-square', x + 32, y + 30, 30, C.iris400, 2.2);
  text(ctx, 'Top questions asked', x + 76, y + 55, { f: FONTS.display, w: 700, size: 30 });
  TOPICS.forEach(([name, n], i) => {
    const rp = ease.brand(seg(gb, SIGNAL.topics + 0.3 + i * 0.25, SIGNAL.topics + 0.9 + i * 0.25));
    const ry = y + 104 + i * 56;
    ctx.globalAlpha = p * rp;
    icon(ctx, 'activity', x + 32, ry - 22, 26, C.iris400, 2.2);
    text(ctx, name, x + 72, ry, { size: 28, w: 500 });
    const bw = 300 * (n / 12) * rp;
    rr(ctx, x + w - 150 - 300, ry - 16, 300, 10, 5); ctx.fillStyle = 'rgba(255,255,255,0.08)'; ctx.fill();
    const g = ctx.createLinearGradient(x + w - 450, 0, x + w - 150, 0); g.addColorStop(0, C.iris600); g.addColorStop(1, C.cyan500);
    rr(ctx, x + w - 150 - 300, ry - 16, Math.max(10, bw), 10, 5); ctx.fillStyle = g; ctx.fill();
    chip(ctx, `×${n}`, x + w - 118, ry - 30, { size: 22, pad: 14, h: 40, fill: 'rgba(46,107,255,0.24)', color: C.iris300, w: 600 });
  });
  ctx.restore();
}

function interest(ctx, gb) {
  // enters while the cards finish leaving (they are nearly transparent by then): no black frame between them
  const p = seg(gb, SIGNAL.interest - 0.2, SIGNAL.interest + 0.5, ease.brand);
  if (p <= 0) return;
  const fold = seg(gb, SIGNAL.home0, SIGNAL.home1 - 0.4, ease.inOutQuart);        // → a lime point at the centre
  const w = lerp(1300, 0, fold), h = lerp(236, 0, fold), x = (W - w) / 2, y = 540 - h / 2;
  ctx.save();
  if (fold < 0.98) {
    ctx.globalAlpha = p * (1 - seg(fold, 0.6, 0.95));
    const sc = lerp(0.92, 1, p);
    ctx.translate(W / 2, 540); ctx.scale(sc, sc); ctx.translate(-W / 2, -540);
    // lime-lit glass: the one time the live colour carries a whole card
    const pool = ctx.createRadialGradient(W / 2, 540, 0, W / 2, 540, 820);
    pool.addColorStop(0, `rgba(195,255,31,${0.07 * p})`); pool.addColorStop(1, 'rgba(195,255,31,0)');
    ctx.fillStyle = pool; ctx.fillRect(0, 0, W, H);
    ctx.save(); ctx.shadowColor = 'rgba(195,255,31,0.3)'; ctx.shadowBlur = 80;
    glass(ctx, x, y, w, h, 28, { fill: 'rgba(12,16,12,0.95)', border: 'rgba(195,255,31,0.38)' }); ctx.restore();
    if (fold < 0.35) {
      ctx.save(); ctx.globalAlpha *= 1 - fold / 0.35;
      ctx.beginPath(); ctx.arc(x + 118, y + h / 2, 62, 0, Math.PI * 2); ctx.fillStyle = '#26314A'; ctx.fill();
      text(ctx, 'JL', x + 118, y + h / 2 + 17, { f: FONTS.display, w: 700, size: 48, align: 'center' });
      text(ctx, 'Jordan Lee flagged interest', x + 216, y + 106, { f: FONTS.display, w: 700, size: 52 });
      text(ctx, 'Northwind Energy  \u00b7  6 questions  \u00b7  all 8 slides', x + 216, y + 158, { size: 30, color: C.text2 });
      // the recipient's state: Interested (--text-positive)
      const pw = measure(ctx, 'Interested', { size: 26, w: 600 }) + 62;
      const px = x + w - 48 - pw, py = y + h / 2 - 25;
      rr(ctx, px, py, pw, 50, 25); ctx.fillStyle = 'rgba(195,255,31,0.12)'; ctx.fill();
      ctx.strokeStyle = 'rgba(195,255,31,0.4)'; ctx.lineWidth = 1.2; rr(ctx, px + 0.5, py + 0.5, pw - 1, 49, 24.5); ctx.stroke();
      const pulse = 0.5 + 0.5 * Math.sin((gb - SIGNAL.interest) * Math.PI * 2);
      ctx.fillStyle = C.lime; ctx.globalAlpha *= 0.6 + 0.4 * pulse;
      ctx.beginPath(); ctx.arc(px + 26, py + 25, 7, 0, Math.PI * 2); ctx.fill();
      ctx.globalAlpha /= 0.6 + 0.4 * pulse;
      text(ctx, 'Interested', px + 42, py + 34, { size: 26, w: 600, color: C.lime });
      ctx.restore();
    }
  }
  // the point of light the payoff line leaves from: it holds while the 3D shot fades up under it, whitening from
  // the live lime into the line's white-hot head, and goes as the head races off
  const pt = seg(gb, SIGNAL.home0 + 0.7, SIGNAL.home1 - 0.4, ease.outCubic) * (1 - seg(gb, PAYOFF.in + 0.1, PAYOFF.in + 0.75, ease.inOutSine));
  if (pt > 0) {
    ctx.globalAlpha = 1;
    const wh = seg(gb, SIGNAL.home1 - 0.75, PAYOFF.in + 0.25, ease.inOutSine);
    const mix = (a, b) => a.map((v, i) => Math.round(v + (b[i] - v) * wh)).join(',');
    const c0 = mix([250, 255, 235], [255, 255, 255]), c1 = mix([215, 255, 120], [200, 240, 255]), c2 = mix([195, 255, 31], [125, 227, 244]);
    const R = 150 + 30 * Math.sin((gb - SIGNAL.home1) * Math.PI * 4);
    const go = seg(gb, PAYOFF.pre, PAYOFF.in, ease.inOutSine);          // onto home, where the line leaves from
    const px = lerp(W / 2, PROBE.deck.x, go), py = lerp(540, PROBE.deck.y, go);
    const g = ctx.createRadialGradient(px, py, 0, px, py, R);
    g.addColorStop(0, `rgba(${c0},${pt})`); g.addColorStop(0.12, `rgba(${c1},${0.9 * pt})`); g.addColorStop(0.4, `rgba(${c2},${0.25 * pt})`); g.addColorStop(1, `rgba(${c2},0)`);
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(px, py, R, 0, Math.PI * 2); ctx.fill();
    // a thin horizontal glint through it, like the flare's streak
    const s2 = ctx.createLinearGradient(px - 420, 0, px + 420, 0);
    s2.addColorStop(0, `rgba(${c2},0)`); s2.addColorStop(0.5, `rgba(${c1},${0.7 * pt})`); s2.addColorStop(1, `rgba(${c2},0)`);
    ctx.fillStyle = s2; ctx.fillRect(px - 420, py - 2, 840, 4);
  }
  ctx.restore();
}

function draw(ctx, t) {
  const gb = t / BEAT;
  ctx.save();
  ctx.globalAlpha = 1 - seg(gb, PAYOFF.pre, PAYOFF.in + 0.25, ease.inOutSine);
  ctx.fillStyle = C.page;
  ctx.fillRect(0, 0, W, H);
  ctx.restore();
  const dz = 1 + 0.035 * seg(gb, SIGNAL.in + 1, SIGNAL.interest, ease.inOutSine);
  ctx.translate(W / 2, H / 2); ctx.scale(dz, dz); ctx.translate(-W / 2, -H / 2);
  const rowVis = 1 - seg(gb, SIGNAL.interest - 0.55, SIGNAL.interest - 0.05, ease.inCubic);
  if (rowVis > 0) attention(ctx, t, gb, rowVis);
  const cardsVis = 1 - seg(gb, SIGNAL.interest - 0.55, SIGNAL.interest - 0.05, ease.inCubic);
  if (cardsVis > 0) { ctx.save(); ctx.globalAlpha = cardsVis; topicsCard(ctx, gb); ctx.restore(); }
  // "See what people actually care about." — the brand line, one row across the top
  const tOut = seg(gb, SIGNAL.interest - 0.55, SIGNAL.interest - 0.1, ease.inCubic);
  if (tOut < 1) {
    ctx.save();
    ctx.globalAlpha = 1 - tOut;
    const at = [0, 0.2, 0.4, 0.75, 0.95, 1.15].map((k) => B(SIGNAL.see + k));
    const grad = T.words[3].a;
    riseLine(ctx, T, centerX(T), 196, t, at, { fill: C.white, extra: (i) => (i >= grad ? { fill: 'gradient' } : null) });
    glint(ctx, T, centerX(T), 196, seg(gb, SIGNAL.see + 1.8, SIGNAL.see + 3.2, ease.inOutSine), 0.4);
    ctx.restore();
  }
  interest(ctx, gb);
}

export default {
  id: 'signal',
  init() {
    T = new Line('See what people actually care about.', { s: 88, w: 700 });
  },
  layers: [{ start: B(SIGNAL.in), end: B(PAYOFF.in + 0.75), draw }],
};
