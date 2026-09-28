// Bars 7–10 · SHIP IT / FUNDED.
// The house darkens and steps back behind the headline ("You ship something real."), and the six real
// products of Hackerhouse 1.0 are dealt onto it. A lime scan passes over them; the music drops out.
// On the drop two are stamped FUNDED — Afferens and Schism, the two Zemu VC backed — while the rest step
// back and the two come forward ("We back the best."). Their stamps turn over into coins and toss upward.
import { W, H, BEAT, C, FONTS } from '../config.js';
import { ease, seg, clamp, lerp } from '../util.js';
import { font } from '../draw2d.js';
import { rr, card, burstPath, mark, pill } from '../brand.js';
import { B, COHORT as T, GRID } from '../score.js';
import { COHORT, drawPhoto } from '../assets.js';
import { drawClip } from '../footage.js';
import { GRIDBOX as G } from '../layout.js';

const COLS = 3, CW = (G.w - G.gap * 2) / 3, CH = (G.h - G.gap) / 2, PW = 214;
const base = (i) => ({ x: G.x + (i % COLS) * (CW + G.gap), y: G.y + Math.floor(i / COLS) * (CH + G.gap), w: CW, h: CH });
const FUNDED = COHORT.map((c, i) => (c.funded ? i : -1)).filter((i) => i >= 0);   // [2, 4]
// centre stage for the two funded cards after the re-flow
const STAGE_W = 680, STAGE_H = STAGE_W * (CH / CW), STAGE_GAP = 40;
const stage = (k) => ({ x: (W - (STAGE_W * 2 + STAGE_GAP)) / 2 + k * (STAGE_W + STAGE_GAP), y: 372, w: STAGE_W, h: STAGE_H });
// stage slots by current x (Schism sits left of Afferens in the grid), so the two never cross paths
const SLOT = [...FUNDED].sort((a, b) => base(a).x - base(b).x);

// Wrap a one-liner into at most two lines at a width.
const wrapCache = new Map();
function wrap(ctx, text, maxW) {
  if (wrapCache.has(text)) return wrapCache.get(text);
  const words = text.split(' ');
  const lines = [''];
  for (const w of words) {
    const tryL = lines[lines.length - 1] ? `${lines[lines.length - 1]} ${w}` : w;
    if (ctx.measureText(tryL).width <= maxW || !lines[lines.length - 1]) lines[lines.length - 1] = tryL;
    else lines.push(w);
  }
  wrapCache.set(text, lines);
  return lines;
}

// One product card, drawn at its base size in local coordinates (0, 0, CW, CH).
function drawCard(ctx, i, lit, dim, tagA = 1) {
  const c = COHORT[i];
  ctx.save();
  ctx.shadowColor = 'rgba(0,0,0,0.5)';
  ctx.shadowBlur = 28;
  ctx.shadowOffsetY = 10;
  card(ctx, 0, 0, CW, CH, { r: G.r, fill: C.ink });
  ctx.restore();
  ctx.save();
  rr(ctx, 0, 0, CW, CH, G.r);
  ctx.clip();
  ctx.beginPath();
  ctx.rect(0, 0, PW, CH);           // cover-fit overflows the column: clip to it, text sits on ink
  ctx.clip();
  drawPhoto(ctx, c.key, 0, 0, PW, CH, 1.02);
  ctx.restore();
  const tx = PW + 28, tw = CW - PW - 52;
  // row 1: number + market tag
  font(ctx, { f: FONTS.label, w: 700, s: 17 });
  ctx.letterSpacing = '2px';
  ctx.fillStyle = C.dim;
  ctx.textBaseline = 'middle';
  ctx.fillText(String(i + 1).padStart(2, '0'), tx, 40);
  font(ctx, { f: FONTS.label, w: 700, s: 14 });
  ctx.letterSpacing = '1.6px';
  const mw = ctx.measureText(c.market).width;
  ctx.save();
  ctx.globalAlpha *= tagA;
  ctx.strokeStyle = 'rgba(255,255,255,0.3)';
  ctx.lineWidth = 1.5;
  rr(ctx, CW - 26 - mw - 22, 27, mw + 22, 26, 13); ctx.stroke();
  ctx.fillText(c.market, CW - 26 - mw - 11 + 1, 41);
  ctx.restore();
  // project name
  font(ctx, { f: FONTS.display, w: 700, s: 36 });
  ctx.letterSpacing = '0px';
  ctx.fillStyle = C.white;
  ctx.textBaseline = 'alphabetic';
  ctx.fillText(c.project.toUpperCase(), tx, 124);
  // one-liner
  font(ctx, { f: FONTS.sans, w: 400, s: 21 });
  ctx.fillStyle = 'rgba(255,255,255,0.72)';
  wrap(ctx, c.line, tw).forEach((l, k) => ctx.fillText(l, tx, 166 + k * 28));
  // founder
  font(ctx, { f: FONTS.sans, w: 600, s: 19 });
  ctx.fillStyle = C.white;
  ctx.fillText(c.name, tx, CH - 30);
  font(ctx, { f: FONTS.sans, w: 400, s: 19 });
  ctx.fillStyle = C.faint;
  ctx.fillText('founder', tx + ctx.measureText(`${c.name} `).width + 2, CH - 30);
  // edge: hairline, lit lime while the scan passes
  card(ctx, 0, 0, CW, CH, { r: G.r, fill: null, stroke: lit > 0.01 ? `rgba(238,254,94,${0.25 + 0.75 * lit})` : 'rgba(255,255,255,0.12)', lw: lit > 0.01 ? 2 + lit : 1.5 });
  if (dim > 0) { ctx.fillStyle = `rgba(0,0,0,${0.62 * dim})`; rr(ctx, -1, -1, CW + 2, CH + 2, G.r); ctx.fill(); }
}

// The FUNDED stamp (star-burst) or, after it turns over, the coin face (lime disc, black mark).
function drawStamp(ctx, face, R) {
  if (face === 'stamp') {
    burstPath(ctx, R, R * 0.86, 20);
    ctx.fillStyle = C.lime;
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = 'rgba(0,0,0,0.85)';
    ctx.beginPath(); ctx.arc(0, 0, R * 0.7, 0, Math.PI * 2); ctx.stroke();
    font(ctx, { f: FONTS.display, w: 700, s: R * 0.27 });
    ctx.fillStyle = C.black;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('FUNDED', 0, R * 0.03);
    ctx.textAlign = 'left';
  } else {
    ctx.fillStyle = C.limeDeep;
    ctx.beginPath(); ctx.arc(0, 0, R * 0.9, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = C.lime;
    ctx.beginPath(); ctx.arc(0, 0, R * 0.78, 0, Math.PI * 2); ctx.fill();
    mark(ctx, 0, 0, R * 0.8, C.black);
  }
}

function cardRect(i, gb) {
  const b = base(i);
  const k = SLOT.indexOf(i);
  const f = ease.inOutCubic(seg(gb, T.reflow0 + (k < 0 ? 0 : 0.08 * k), T.reflow1 + (k < 0 ? 0 : 0.08 * k)));
  if (k >= 0) {
    const s = stage(k);
    return { x: lerp(b.x, s.x, f), y: lerp(b.y, s.y, f), sc: lerp(1, s.w / CW, f), f };
  }
  // the others step back: shrink a little and sink away
  return { x: b.x + CW * 0.04 * f, y: b.y + 60 * f, sc: 1 - 0.08 * f, f, gone: f };
}

function draw(ctx, t) {
  const gb = t / BEAT;
  // the house steps back: darkened and softened, gone by the silence
  const dim = ease.inOutCubic(seg(gb, T.dim0, T.dim1));
  const gone = seg(gb, 31.3, 31.5);
  if (gone < 1) {
    ctx.save();
    ctx.filter = `blur(${(8 * dim).toFixed(2)}px)`;
    drawClip(ctx, 'house', t - B(GRID.flip0), 0, 0, W, H);
    ctx.filter = 'none';
    ctx.restore();
    const g = ctx.createLinearGradient(0, 0, 0, H * 0.45);
    g.addColorStop(0, 'rgba(0,0,0,0.72)');
    g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = `rgba(0,0,0,${lerp(0, 0.8, dim) + 0.2 * gone})`;
    ctx.fillRect(0, 0, W, H);
    if (gone > 0) { ctx.fillStyle = `rgba(0,0,0,${gone})`; ctx.fillRect(0, 0, W, H); }
  }

  // scan line position (x) while it passes over the grid
  const sp = seg(gb, T.scan0, T.scan1, ease.inOutSine);
  const scanX = lerp(G.x - 40, G.x + G.w + 40, sp);
  const scanOn = sp > 0 && sp < 1;

  // cards (non-funded first so the funded ones travel above them)
  const order = [0, 1, 3, 5, 2, 4];
  for (const i of order) {
    const b = base(i);
    const at = T.deal0 + i * T.dealStep;
    const p = seg(gb, at, at + T.dealDur);
    if (p <= 0) continue;
    const r = cardRect(i, gb);
    const outP = ease.inCubic(seg(gb, T.out0 + (FUNDED.includes(i) ? 0.25 : 0), T.out1));
    const alpha = clamp(p * 3) * (1 - (r.gone || 0)) * (1 - outP);
    if (alpha <= 0.002) continue;
    const e = ease.outCubic(p);
    const rot = (1 - ease.outBack(p, 1.2)) * 0.17;
    const dx = (1 - e) * 140, dy = (1 - e) * 380 + outP * 240;
    // stamp contact jolt
    const k = FUNDED.indexOf(i);
    const jolt = k >= 0 ? Math.exp(-Math.max(0, t - B(T.stamps[k]) - 0.07) / 0.06) * (t >= B(T.stamps[k]) + 0.07 ? 1 : 0) : 0;
    const lit = scanOn ? Math.exp(-Math.abs(scanX - (b.x + CW / 2)) / 140) : 0;
    const dimO = k < 0 ? ease.outCubic(seg(gb, T.dimOthers, T.dimOthers + 0.5)) : 0;
    ctx.save();
    ctx.globalAlpha *= alpha;
    ctx.translate(r.x + dx + CW / 2, r.y + dy + CH / 2);
    ctx.rotate(rot);
    const s = r.sc * (0.9 + 0.1 * e) * (1 - 0.025 * jolt);
    ctx.scale(s, s);
    ctx.translate(-CW / 2, -CH / 2);
    const tagA = k >= 0 ? 1 - seg(t, B(T.stamps[k]) - 0.02, B(T.stamps[k]) + 0.06) : 1;   // the stamp replaces the tag
    drawCard(ctx, i, lit, dimO, tagA);
    ctx.restore();
  }

  // the scan line
  if (scanOn) {
    ctx.save();
    const gl = ctx.createLinearGradient(scanX - 60, 0, scanX + 6, 0);
    gl.addColorStop(0, 'rgba(238,254,94,0)');
    gl.addColorStop(1, 'rgba(238,254,94,0.16)');
    ctx.fillStyle = gl;
    ctx.fillRect(scanX - 60, G.y - 20, 66, G.h + 40);
    ctx.fillStyle = C.lime;
    rr(ctx, scanX - 1.5, G.y - 24, 3, G.h + 48, 1.5); ctx.fill();
    ctx.restore();
  }

  // stamps → coins → toss
  FUNDED.forEach((i, k) => {
    const at = T.stamps[k];
    if (gb < at - 0.2) return;
    const r = cardRect(i, gb);
    const sc = r.sc;
    const outP = ease.inCubic(seg(gb, T.out0 + 0.25, T.out1));
    const tossP = seg(gb, T.toss0 + k * 0.12, T.toss1 + k * 0.12);
    let cx = r.x + (CW - 40) * sc, cy = r.y + 30 * sc;
    const fall = seg(t, B(at) - 0.03, B(at) + 0.07);                   // slapped down, lands just after the hit
    const land = t - (B(at) + 0.07);
    let scale = fall < 1 ? lerp(1.75, 1, ease.inQuad(fall)) : 1 + 0.1 * Math.exp(-land / 0.08) * Math.sin(land * 60) - 0.08 * Math.exp(-land / 0.05);
    let R = 76 * sc;
    const rot0 = k === 0 ? -0.21 : 0.16;
    // turn over: stamp → coin (a Y-axis flip), then the toss up and out of frame
    const flip = seg(gb, T.coin0 + k * 0.1, T.coin1 + k * 0.1, ease.inOutCubic);
    const face = flip < 0.5 ? 'stamp' : 'coin';
    let sx = Math.abs(Math.cos(Math.PI * flip));
    let rot = rot0 * (1 - seg(flip, 0.5, 1));
    if (tossP > 0) {
      const up = ease.inCubic(tossP);
      cy -= up * (cy + 260);
      cx += (k === 0 ? -1 : 1) * 40 * up;
      sx = Math.abs(Math.cos(tossP * Math.PI * 5));               // spinning as it rises
      scale *= 1 + 0.25 * up;
    }
    ctx.save();
    ctx.globalAlpha *= clamp(fall * 4) * (tossP > 0 ? 1 : 1 - outP);
    // shadow: wide and soft while high, tight on contact
    const h = fall < 1 ? 1 - fall : 0;
    ctx.shadowColor = 'rgba(0,0,0,0.55)';
    ctx.shadowBlur = 8 + 30 * h;
    ctx.shadowOffsetX = 4 + 16 * h;
    ctx.shadowOffsetY = 6 + 26 * h;
    ctx.translate(cx, cy);
    ctx.rotate(rot);
    ctx.scale(scale * Math.max(0.02, sx), scale);
    drawStamp(ctx, face, R);
    ctx.restore();
    // shock ring on contact
    if (land > 0 && land < 0.45) {
      const q = land / 0.45;
      ctx.save();
      ctx.strokeStyle = `rgba(238,254,94,${0.7 * (1 - q)})`;
      ctx.lineWidth = 3 * (1 - q) + 0.5;
      ctx.beginPath(); ctx.arc(cx, cy, R * (1 + 1.3 * ease.outCubic(q)), 0, Math.PI * 2); ctx.stroke();
      ctx.restore();
    }
  });

  // caption under the two funded cards
  const cp = seg(gb, T.caption, T.caption + 0.5, ease.outExpo) * (1 - seg(gb, T.out0, T.out0 + 0.4));
  if (cp > 0) {
    ctx.save();
    font(ctx, { f: FONTS.label, w: 700, s: 22 });
    ctx.letterSpacing = '4.4px';
    const text = '6 BUILT · 2 FUNDED · NOW IN THE ACCELERATOR';
    const tw = ctx.measureText(text).width;
    const y = stage(0).y + STAGE_H + 64;
    ctx.beginPath(); ctx.rect(0, y - 30, W, 40); ctx.clip();
    ctx.globalAlpha *= cp;
    ctx.fillStyle = C.dim;
    ctx.textBaseline = 'alphabetic';
    ctx.fillText(text, (W - tw) / 2, y + (1 - cp) * 30);
    ctx.restore();
  }
}

export default {
  id: 'cohort',
  layers: [{ start: B(24), end: B(40), draw }],
  needs: (t) => (t < B(31.5) ? [['house', t - B(GRID.flip0)]] : null),
};
