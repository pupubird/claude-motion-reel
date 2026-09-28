// The recipient room (/r/:token, relatefy components/recipient/Companion.tsx + companion.css), rebuilt as a
// film-scale layout: the product's own components — deck top bar, slide stage, the Digital Twin rail header,
// NovaChat bubbles, the citation pill, the composer — at their product styles, scaled up so they read on
// screen. The thumbnail strip and the docs strip are left out; nothing is added that the product lacks.
import { H, C } from '../config.js';
import { ease, clamp, lerp } from '../util.js';
import { SLIDES, IMG } from '../assets.js';
import { rr, text, measure } from './kit.js';
import { icon } from './icons.js';
import { miniOrb, voiceMeter } from './miniorb.js';

export const K = 1.9;                         // rail scale
export const RAIL = { x: 1160, w: 760 };
export const DECK = { x: 0, w: 1160, top: 84 };
// slide stage: 16:9 fitted into the deck column with the product's 20 px stage padding (scaled)
export const SLIDE = { x: 44, y: 150, w: 1072, h: 603 };

const INDIGO_TEXT = '#A3B6FF';                  // oklch(0.78 0.15 265) — cite pill text
const indigo = (a) => `rgba(63,91,240,${a})`;  // oklch(0.58 0.22 265 / a)

function wrap(ctx, s, maxW, opt) {
  const words = s.split(' ');
  const lines = [];
  let cur = '';
  for (const w of words) {
    const t2 = cur ? cur + ' ' + w : w;
    if (measure(ctx, t2, opt) > maxW && cur) { lines.push(cur); cur = w; } else cur = t2;
  }
  if (cur) lines.push(cur);
  return lines;
}

// Maya's avatar (the showroom's maya-chen.svg) in a circle
function avatar(ctx, x, y, d) {
  ctx.save();
  ctx.beginPath(); ctx.arc(x + d / 2, y + d / 2, d / 2, 0, Math.PI * 2); ctx.clip();
  ctx.drawImage(IMG.maya, x, y, d, d);
  ctx.restore();
}

export function drawDeckTop(ctx, st) {
  // .cm-deck-top: 56 px bar, divider under it; logo box 28 px (gradient, owner logo), title 14/600
  const k = 1.5, h = DECK.top;
  ctx.fillStyle = 'rgba(255,255,255,0.08)';
  ctx.fillRect(0, h - 1, DECK.w, 1);
  const lx = 24 * k, ly = (h - 28 * k) / 2;
  ctx.save();
  rr(ctx, lx, ly, 28 * k, 28 * k, 8 * k); ctx.clip();
  ctx.drawImage(IMG.luminex, lx, ly, 28 * k, 28 * k);
  ctx.restore();
  text(ctx, 'Luminex Labs', lx + 28 * k + 12, h / 2 + 7.5, { size: 14 * k, w: 600 });
  // right cluster: progress track + counter, the "Powered by Nova Pitch" pill
  const pw = measure(ctx, 'Powered by Nova Pitch', { size: 11 * k, w: 600 }) + 24 * k;
  const px = DECK.w - 24 * k - pw, py = (h - 26 * k) / 2;
  rr(ctx, px, py, pw, 26 * k, 13 * k); ctx.fillStyle = indigo(0.10); ctx.fill();
  ctx.strokeStyle = indigo(0.22); ctx.lineWidth = 1; rr(ctx, px + 0.5, py + 0.5, pw - 1, 26 * k - 1, 13 * k); ctx.stroke();
  text(ctx, 'Powered by Nova Pitch', px + 12 * k, h / 2 + 6, { size: 11 * k, w: 600, color: '#7F98E8' });
  const cx = px - 20 * k;
  text(ctx, `${st.slide} / 8`, cx, h / 2 + 6, { size: 12 * k, color: C.text3, align: 'right' });
  const tw = 150 * k, tx = cx - measure(ctx, '8 / 8', { size: 12 * k }) - 14 * k - tw;
  rr(ctx, tx, h / 2 - 3, tw, 6, 3); ctx.fillStyle = 'rgba(255,255,255,0.08)'; ctx.fill();
  const g = ctx.createLinearGradient(tx, 0, tx + tw, 0); g.addColorStop(0, C.iris600); g.addColorStop(1, C.iris500);
  rr(ctx, tx, h / 2 - 3, Math.max(6, tw * st.slideP), 6, 3); ctx.fillStyle = g; ctx.fill();
}

// slide stage with a slide-to-slide swipe (from → to, p ∈ [0,1]) and an optional highlight ring
export function drawStage(ctx, st) {
  const { x, y, w, h } = SLIDE;
  ctx.save();
  rr(ctx, x, y, w, h, 16); ctx.clip();
  if (st.blur > 0.2) ctx.filter = `blur(${st.blur.toFixed(1)}px)`;
  ctx.fillStyle = '#0B0C0E'; ctx.fillRect(x, y, w, h);
  const p = ease.inOutQuart(clamp(st.swipe));
  if (p > 0 && p < 1) {
    ctx.drawImage(SLIDES[st.from - 1], x - p * w * 0.35, y, w, h);
    ctx.globalAlpha = p;
    ctx.drawImage(SLIDES[st.to - 1], x + (1 - p) * w * 0.35, y, w, h);
    ctx.globalAlpha = 1;
  } else ctx.drawImage(SLIDES[(p >= 1 ? st.to : st.from) - 1], x, y, w, h);
  ctx.filter = 'none';
  ctx.restore();
  ctx.strokeStyle = 'rgba(255,255,255,0.10)'; ctx.lineWidth = 1.5;
  rr(ctx, x + 0.75, y + 0.75, w - 1.5, h - 1.5, 16); ctx.stroke();
  // the cited figure: a cobalt ring drawn around it, clockwise from the top-left
  if (st.ring > 0) {
    const bx = x + w * 0.062, by = y + h * 0.585, bw = w * 0.2, bh = h * 0.135;
    const L = 2 * (bw + bh);
    ctx.save();
    ctx.setLineDash([L * st.ring, L]);
    ctx.lineWidth = 4;
    ctx.strokeStyle = C.iris400;
    ctx.shadowColor = 'rgba(46,107,255,0.8)'; ctx.shadowBlur = 18;
    rr(ctx, bx, by, bw, bh, 14); ctx.stroke();
    ctx.restore();
  }
}

// Rail: header, messages anchored above the composer, composer.
export function drawRail(ctx, st) {
  const x0 = RAIL.x, w = RAIL.w;
  ctx.fillStyle = 'rgba(255,255,255,0.08)';          // .cm-rail bg-subtle
  ctx.fillRect(x0, 0, w, H);
  ctx.fillStyle = 'rgba(255,255,255,0.08)';
  ctx.fillRect(x0, 0, 1, H);                         // border-left divider
  // header (.cm-rail-head, 60 px): avatar 32, name 14/600, status 12 tertiary; Flag Interest (btn-nova sm)
  const hh = 60 * K;
  ctx.fillRect(x0, hh - 1, w, 1);
  // Maya's avatar; while the Twin speaks, it becomes Nova, moving with the voice
  const ax = x0 + 16 * K, ay = (hh - 32 * K) / 2;
  ctx.save(); ctx.globalAlpha *= 1 - (st.orbMix || 0); avatar(ctx, ax, ay, 32 * K); ctx.restore();
  miniOrb(ctx, ax + 16 * K, ay + 16 * K, 16 * K, st.t || 0, st.voice, st.orbMix || 0);
  const nx = x0 + 16 * K + 32 * K + 12 * K;
  text(ctx, 'Maya Chen’s Digital Twin', nx, hh / 2 - 3, { size: 14 * K, w: 600 });
  // status: ready / typing… / speaking… with the live dot
  const sy = hh / 2 + 12 * K;
  ctx.fillStyle = st.status === 'speaking…' ? C.iris400 : C.lime;
  ctx.globalAlpha = st.status === 'speaking…' ? 0.6 + 0.4 * st.voice : 1;
  ctx.beginPath(); ctx.arc(nx + 4 * K, sy - 4.5 * K, 3.2 * K, 0, Math.PI * 2); ctx.fill();
  ctx.globalAlpha = 1;
  const sw = text(ctx, st.status, nx + 12 * K, sy, { size: 12 * K, color: C.text3 });
  if (st.status === 'speaking\u2026') voiceMeter(ctx, nx + 12 * K + sw + 8 * K, sy - 4.5 * K, 12 * K, st.voice, st.t || 0);
  if (st.nameUnderline > 0) {
    const nw = measure(ctx, 'Maya Chen’s Digital Twin', { size: 14 * K, w: 600 });
    const g = ctx.createLinearGradient(nx, 0, nx + nw, 0); g.addColorStop(0, C.iris400); g.addColorStop(1, C.cyan400);
    ctx.fillStyle = g; rr(ctx, nx, hh / 2 + 1, nw * st.nameUnderline, 3, 1.5); ctx.fill();
  }
  // Flag Interest (the product's cobalt primary button)
  const fw = measure(ctx, 'Flag Interest', { size: 13 * K, w: 600 }) + 28 * K, fh = 34 * K;
  const fx = x0 + w - 16 * K - fw, fy = (hh - fh) / 2;
  rr(ctx, fx, fy, fw, fh, 10 * K); ctx.fillStyle = C.iris600; ctx.fill();
  text(ctx, 'Flag Interest', fx + fw / 2, fy + fh / 2 + 4.6 * K, { size: 13 * K, w: 600, align: 'center' });

  // docs strip (.cm-doc-chip): the files this link shares
  const dy0 = hh + 14 * K;
  text(ctx, 'Docs', x0 + 16 * K, dy0 + 17 * K, { size: 12 * K, color: C.text3, w: 500 });
  let chipX = x0 + 16 * K + measure(ctx, 'Docs', { size: 12 * K, w: 500 }) + 10 * K;
  for (const d of ['ROI Model \u2014 Grid Operator', 'Deployment FAQ']) {
    const cw = measure(ctx, d, { size: 12 * K, w: 500 }) + 24 * K;
    rr(ctx, chipX, dy0, cw, 26 * K, 13 * K); ctx.fillStyle = 'rgba(255,255,255,0.05)'; ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.10)'; ctx.lineWidth = 1; rr(ctx, chipX + 0.5, dy0 + 0.5, cw - 1, 26 * K - 1, 13 * K); ctx.stroke();
    text(ctx, d, chipX + 12 * K, dy0 + 17.4 * K, { size: 12 * K, w: 500, color: C.text2 });
    chipX += cw + 8 * K;
  }
  ctx.fillStyle = 'rgba(255,255,255,0.08)';
  ctx.fillRect(x0, dy0 + 26 * K + 12 * K, w, 1);

  // composer (.cm-composer): call orb button 40, field 40 (pill), send 32 — scaled
  const cy = H - 16 * K - 40 * K;
  const cbx = x0 + 16 * K;
  const cg = ctx.createLinearGradient(cbx, cy, cbx + 40 * K, cy + 40 * K); cg.addColorStop(0, C.iris400); cg.addColorStop(1, C.cyan500);
  ctx.fillStyle = cg; ctx.beginPath(); ctx.arc(cbx + 20 * K, cy + 20 * K, 20 * K, 0, Math.PI * 2); ctx.fill();
  icon(ctx, 'mic', cbx + 20 * K - 11 * K, cy + 20 * K - 11 * K, 22 * K, '#fff', 2);
  const fx2 = cbx + 40 * K + 8 * K, fw2 = x0 + w - 16 * K - fx2;
  rr(ctx, fx2, cy, fw2, 40 * K, 20 * K); ctx.fillStyle = 'rgba(255,255,255,0.05)'; ctx.fill();
  ctx.lineWidth = st.focus ? 1.5 : 1;
  ctx.strokeStyle = st.focus ? C.iris400 : 'rgba(255,255,255,0.08)';
  rr(ctx, fx2 + 0.5, cy + 0.5, fw2 - 1, 40 * K - 1, 20 * K); ctx.stroke();
  if (st.focus) { ctx.strokeStyle = 'rgba(46,107,255,0.24)'; ctx.lineWidth = 3 * K; rr(ctx, fx2 - 1.5 * K, cy - 1.5 * K, fw2 + 3 * K, 43 * K, 21.5 * K); ctx.stroke(); }
  const ix = fx2 + 16 * K, iy = cy + 20 * K + 4.6 * K;
  if (st.draft) {
    const dw = text(ctx, st.draft, ix, iy, { size: 13 * K });
    if (st.caret) { ctx.fillStyle = C.iris300; ctx.fillRect(ix + dw + 3, cy + 11 * K, 2.5, 18 * K); }
  } else {
    text(ctx, 'Ask Maya Chen’s Digital Twin…', ix, iy, { size: 13 * K, color: C.text3 });
    if (st.caret) { ctx.fillStyle = C.iris300; ctx.fillRect(ix - 4, cy + 11 * K, 2.5, 18 * K); }
  }
  const sx = x0 + w - 16 * K - 4 * K - 32 * K, sy2 = cy + 4 * K;
  ctx.save();
  ctx.globalAlpha = st.draft ? 1 : 0.35;
  const sg = ctx.createLinearGradient(sx, sy2, sx + 32 * K, sy2 + 32 * K); sg.addColorStop(0, C.iris600); sg.addColorStop(1, C.iris500);
  const press = st.press || 0;
  ctx.translate(sx + 16 * K, sy2 + 16 * K); ctx.scale(1 - 0.12 * press, 1 - 0.12 * press); ctx.translate(-(sx + 16 * K), -(sy2 + 16 * K));
  ctx.fillStyle = sg; ctx.beginPath(); ctx.arc(sx + 16 * K, sy2 + 16 * K, 16 * K, 0, Math.PI * 2); ctx.fill();
  icon(ctx, 'arrow-right', sx + 16 * K - 7.5 * K, sy2 + 16 * K - 7.5 * K, 15 * K, '#fff', 2.4);
  ctx.restore();

  // messages, stacked upward from above the composer
  let y = cy - 16 * K;
  const gap = 16 * K;
  for (let i = st.msgs.length - 1; i >= 0; i--) {
    const m = st.msgs[i];
    const hgt = msgHeight(ctx, m);
    y -= hgt * (m.grow ?? 1);
    if (m.alpha > 0) drawMsg(ctx, m, x0 + 16 * K, y, w - 32 * K);
    y -= gap * (m.grow ?? 1);
  }
}

const BUB = { size: 14.4, lh: 1.5, padX: 16, padY: 12, max: 0.85 };
function bubbleLines(ctx, m, maxW) {
  const agent = m.who === 'agent';
  const inner = maxW * (agent ? BUB.max : 0.8) - BUB.padX * 2 * K - (agent ? 34 * K : 0);
  return wrap(ctx, m.full || ' ', inner, { size: BUB.size * K });
}
export function msgHeight(ctx, m) {
  const lines = m.dots ? [' '] : bubbleLines(ctx, m, RAIL.w - 32 * K);
  let h = BUB.padY * 2 * K + lines.length * BUB.size * BUB.lh * K;
  if (m.cite) h += (26 + 8) * K * (m.citeP ?? 1);
  return h;
}

function drawMsg(ctx, m, x, y, maxW) {
  ctx.save();
  ctx.globalAlpha *= m.alpha;
  const agent = m.who === 'agent';
  const lines = m.dots ? [' '] : bubbleLines(ctx, m, maxW);
  const lh = BUB.size * BUB.lh * K;
  const inner = Math.max(...lines.map((l) => measure(ctx, l, { size: BUB.size * K })));
  let bw = inner + BUB.padX * 2 * K;
  if (m.dots) bw = 76 * K;
  let bh = BUB.padY * 2 * K + lines.length * lh;
  const citeH = m.cite ? (26 + 8) * K * (m.citeP ?? 1) : 0;
  if (m.cite) { const cw = measure(ctx, m.cite, { size: 12 * K, w: 600 }) + 24 * K + 18 * K; bw = Math.max(bw, cw + BUB.padX * 2 * K); }
  bh += citeH;
  const dy = (1 - (m.enter ?? 1)) * 12 * K;
  if (agent) {
    // .cm-msg-av 26 px (owner avatar) + .chat-bubble-nova: white 8 %, hairline, radius 16 16 16 4
    avatar(ctx, x, y + 2 * K + dy, 26 * K);
    const bx = x + 26 * K + 8 * K;
    rr(ctx, bx, y + dy, bw, bh, [16 * K, 16 * K, 16 * K, 4 * K]);
    ctx.fillStyle = 'rgba(255,255,255,0.08)'; ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.08)'; ctx.lineWidth = 1; ctx.stroke();
    if (m.dots) {
      for (let i = 0; i < 3; i++) {
        const ph = ((m.dotT * 2.2 - i * 0.28) % 1 + 1) % 1;
        const pk = Math.max(0, Math.sin(Math.PI * clamp(ph / 0.6)));
        ctx.globalAlpha = m.alpha * lerp(0.4, 1, pk);
        ctx.fillStyle = C.iris400;
        ctx.beginPath(); ctx.arc(bx + 22 * K + i * 16 * K, y + dy + bh / 2, 3.2 * K * lerp(0.6, 1, pk), 0, Math.PI * 2); ctx.fill();
      }
      ctx.globalAlpha = m.alpha;
    } else {
      // streamed text: the visible prefix (m.shown characters), laid out as the full text so nothing reflows
      let left = m.shown ?? (m.full || '').length;
      lines.forEach((l, i) => {
        if (left <= 0) return;
        const part = l.slice(0, left);
        left -= l.length + 1;
        text(ctx, part, bx + BUB.padX * K, y + dy + BUB.padY * K + lh * i + BUB.size * K * 1.08, { size: BUB.size * K });
      });
      if (m.cite && (m.citeP ?? 1) > 0) {
        // .cm-cite: indigo-tinted pill with the list icon
        const p = m.citeP;
        const cx = bx + BUB.padX * K, cyy = y + dy + BUB.padY * K + lines.length * lh + 8 * K;
        const cw = measure(ctx, m.cite, { size: 12 * K, w: 600 }) + 24 * K + 18 * K, ch = 26 * K;
        ctx.save();
        ctx.translate(cx + cw / 2, cyy + ch / 2); ctx.scale(ease.outBack(clamp(p), 2.2), ease.outBack(clamp(p), 2.2)); ctx.translate(-(cx + cw / 2), -(cyy + ch / 2));
        rr(ctx, cx, cyy, cw, ch, ch / 2); ctx.fillStyle = indigo(0.12 + 0.2 * (m.citeHot || 0)); ctx.fill();
        ctx.strokeStyle = indigo(0.25 + 0.4 * (m.citeHot || 0)); ctx.lineWidth = 1.2; rr(ctx, cx + 0.5, cyy + 0.5, cw - 1, ch - 1, ch / 2); ctx.stroke();
        icon(ctx, 'list', cx + 12 * K, cyy + ch / 2 - 6 * K, 12 * K, INDIGO_TEXT, 2.4);
        text(ctx, m.cite, cx + 12 * K + 18 * K, cyy + ch / 2 + 4.3 * K, { size: 12 * K, w: 600, color: INDIGO_TEXT });
        ctx.restore();
        m.citeBox = { x: cx, y: cyy, w: cw, h: ch };
      }
    }
  } else {
    // .chat-bubble-user: white, ink-800 text, radius 16 16 4 16, right-aligned
    const bx = x + maxW - bw;
    rr(ctx, bx, y + dy, bw, bh, [16 * K, 16 * K, 4 * K, 16 * K]);
    ctx.fillStyle = '#fff'; ctx.fill();
    lines.forEach((l, i) => text(ctx, l, bx + BUB.padX * K, y + dy + BUB.padY * K + lh * i + BUB.size * K * 1.08, { size: BUB.size * K, color: C.ink800 }));
  }
  ctx.restore();
}
