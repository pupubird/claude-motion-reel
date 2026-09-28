// Bars 5–6 · AGENT.
// Through the loupe into the product: the landing composer, "cold brew coffee" typed on the 32nds,
// Research pressed, then the agent's receipts land one by one. Each library search throws its
// results into the well; the relevance check drops what isn't cold brew; the 16 that remain rank
// into the grid, and the well opens to fill the frame (hand-off to the 3D light table, bar 7).
import { W, H, BEAT, C, FONTS } from '../config.js';
import { ease, seg, clamp, lerp, rng, settle } from '../util.js';
import { font, rgba, fillR, strokeR, rrect } from '../draw2d.js';
import { ADS, WALL, drawCover } from '../assets.js';
import { composer, receiptRow, drawAdCard } from '../ui.js';
import { icon } from '../icons.js';
import { B, QUERY, RECEIPTS, typeTimes, TABLE } from '../score.js';
import { lensAt } from './table.js';
import { gridSlots, GRID, WELL, TRACE } from '../layout.js';

const TYPE_T = typeTimes();
const CW = 1240, CS = 2.0, CX = (W - CW) / 2, CY = 488;     // composer at hero scale
const S = TRACE.s;
const QX = TRACE.x + 24, QY = TRACE.y + 70, QW = TRACE.w - 48, QS = 1.28;  // query field inside the trace
const ROW0 = QY + 60 * QS + 64;                                             // first receipt row
const ROWH = 34 * S + 2;
const MINI = 0.4;                                                           // grid scale inside the well
const MINI_CX = WELL.x + WELL.w / 2, MINI_Y = WELL.y + 84;

/* ---------------------------------------------------------- the 88 results */
const RESULTS = (() => {
  const R = rng(88);
  const cells = [];
  const cols = 11, rows = 8, gx = (WELL.w - 52) / cols, gy = (WELL.h - 110) / rows;
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) cells.push({ x: WELL.x + 26 + gx * (c + 0.5), y: WELL.y + 86 + gy * (r + 0.5) });
  for (let i = cells.length - 1; i > 0; i--) { const j = Math.floor(R() * (i + 1)); [cells[i], cells[j]] = [cells[j], cells[i]]; }
  const metaAds = ADS.filter((a) => a.platform === 'meta'), tikAds = ADS.filter((a) => a.platform === 'tiktok');
  const pick = (n, k) => { const s = new Set(); while (s.size < k) s.add(Math.floor(R() * n)); return [...s]; };
  const relMeta = pick(50, metaAds.length), relTik = pick(38, tikAds.length);
  const out = [];
  for (let i = 0; i < 88; i++) {
    const meta = i < 50, local = meta ? i : i - 50;
    const relIdx = (meta ? relMeta : relTik).indexOf(local);
    const ad = relIdx >= 0 ? (meta ? metaAds : tikAds)[relIdx] : null;
    out.push({
      meta, ad, id: ad ? ad.id : WALL[Math.floor(R() * WALL.length)],
      cell: { x: cells[i].x + (R() - 0.5) * 8, y: cells[i].y + (R() - 0.5) * 8 },
      spawn: (meta ? RECEIPTS[1].done : RECEIPTS[2].done) + (local / (meta ? 50 : 38)) * 0.42 + R() * 0.05,
      spin: (R() - 0.5) * 50,
      fall: RECEIPTS[3].done + R() * 0.32,
      drift: (R() - 0.5) * 120,
    });
  }
  return out;
})();
const RANK = ADS.map((a) => RESULTS.find((r) => r.ad === a));

// Grid group transform: mini grid inside the well → full screen at the hand-off (m: 0 → 1).
function gridXf(m) {
  const k = lerp(MINI, 1, m);
  const cx = lerp(MINI_CX, W / 2, m), y0 = lerp(MINI_Y, GRID.y0, m);
  return (slot) => ({ x: cx + (slot.x - W / 2) * k, y: y0 + (slot.y - GRID.y0) * k, w: slot.w * k, k });
}

/* ------------------------------------------------------------- background */
function ground(ctx, t) {
  ctx.fillStyle = C.ground;
  ctx.fillRect(0, 0, W, H);
  // ShapeGrid from the landing hero: 72 px squares, petrol at 10 %, drifting
  const sq = 72, off = (t * 14) % sq;
  ctx.strokeStyle = 'rgba(15,76,82,0.08)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  for (let x = -sq - off; x <= W + sq; x += sq) { ctx.moveTo(x, 0); ctx.lineTo(x, H); }
  for (let y = -sq + (off * 0.5) % sq; y <= H + sq; y += sq) { ctx.moveTo(0, y); ctx.lineTo(W, y); }
  ctx.stroke();
}

/* ----------------------------------------------------------- composer phase */
function typed(gb) {
  let n = 0;
  for (const tt of TYPE_T) if (gb >= tt) n++;
  return QUERY.text.slice(0, n);
}

function drawComposerPhase(ctx, gb) {
  const move = seg(gb, QUERY.press + 0.22, QUERY.press + 0.95, ease.inOutQuart);
  const s = lerp(CS, QS, move);
  const x = lerp(CX, QX, move), y = lerp(CY, QY, move), w = lerp(CW, QW, move);
  // eyebrow above the hero composer
  const eb = (1 - seg(gb, QUERY.press + 0.1, QUERY.press + 0.4)) * seg(gb, 15.4, 16.2);
  if (eb > 0) {
    ctx.save();
    ctx.globalAlpha = eb;
    font(ctx, { f: FONTS.mono, w: 500, s: 17 });
    ctx.letterSpacing = '2.4px';
    ctx.fillStyle = C.sulphurInk;
    ctx.textAlign = 'center';
    ctx.fillText('MULTI-PLATFORM AD RESEARCH', W / 2, CY - 44);
    ctx.restore();
  }
  const text = typed(gb);
  const typing = gb >= QUERY.start - 0.2 && gb < QUERY.press + 0.2;
  const blink = Math.floor((gb - 16) * 2) % 2 === 0;
  const lastKey = TYPE_T.filter((tt) => tt <= gb).pop() ?? -9;
  const caret = typing && (gb - lastKey < 0.5 || blink);
  const press = seg(gb, QUERY.press, QUERY.press + 0.06) * (1 - seg(gb, QUERY.press + 0.14, QUERY.press + 0.3));
  const c = composer(ctx, {
    x, y, w, s, text, caret, press,
    placeholder: gb < QUERY.start ? 'Website, brand or keyword' : '',
    focus: seg(gb, 16.0, 16.4) * (1 - move),
    btn: 1 - seg(move, 0, 0.45),
    lead: seg(move, 0.4, 1),
  });
  // press ripple around the button
  if (gb >= QUERY.press && gb < QUERY.press + 0.7 && move < 0.2) {
    const p = seg(gb, QUERY.press, QUERY.press + 0.7, ease.outCubic);
    const b = c.button, g = 26 * p;
    ctx.strokeStyle = rgba(C.petrol, 0.4 * (1 - p));
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(b.x - g, b.y - g, b.w + 2 * g, b.h + 2 * g, 12 + g);
    ctx.stroke();
  }
}

/* ------------------------------------------------------------- trace panel */
function drawTrace(ctx, gb) {
  const open = seg(gb, QUERY.press + 0.3, QUERY.press + 1.1, ease.brand);
  if (open <= 0) return;
  const h = lerp(60 * QS + 90, ROW0 + RECEIPTS.length * ROWH + 34 - TRACE.y, open);
  ctx.save();
  ctx.globalAlpha = seg(gb, QUERY.press + 0.3, QUERY.press + 0.6);
  ctx.shadowColor = 'rgba(11,22,24,0.10)';
  ctx.shadowBlur = 32;
  ctx.shadowOffsetY = 12;
  fillR(ctx, TRACE.x, TRACE.y, TRACE.w, h, 16, C.surface);
  ctx.restore();
  ctx.save();
  ctx.globalAlpha = seg(gb, QUERY.press + 0.3, QUERY.press + 0.6);
  strokeR(ctx, TRACE.x, TRACE.y, TRACE.w, h, 16, C.line);
  // header
  for (let i = 0; i < 3; i++) { ctx.fillStyle = i ? 'rgba(11,22,24,0.08)' : 'rgba(11,22,24,0.14)'; ctx.beginPath(); ctx.arc(TRACE.x + 26 + i * 16, TRACE.y + 30, 5, 0, Math.PI * 2); ctx.fill(); }
  font(ctx, { f: FONTS.mono, w: 500, s: 15 });
  ctx.letterSpacing = '2px';
  ctx.fillStyle = C.slateSoft;
  ctx.textBaseline = 'middle';
  ctx.fillText('RESEARCH TRACE', TRACE.x + 84, TRACE.y + 31);
  ctx.textAlign = 'right';
  ctx.fillText('6 STEPS · 5 TOOL CALLS · UP TO 50', TRACE.x + TRACE.w - 48, TRACE.y + 31);
  icon(ctx, 'coins', TRACE.x + TRACE.w - 42, TRACE.y + 22, 17, C.sulphur, 1.9);
  ctx.textAlign = 'left';
  ctx.fillStyle = C.line;
  ctx.fillRect(TRACE.x, TRACE.y + 58, TRACE.w, 1);
  ctx.restore();

  // receipt group
  const gy = ROW0 - 8;
  const gh = RECEIPTS.length * ROWH + 12;
  const g = seg(gb, RECEIPTS[0].at - 0.25, RECEIPTS[0].at + 0.1, ease.brand);
  if (g > 0) {
    ctx.save();
    ctx.globalAlpha = g;
    fillR(ctx, QX, gy, QW, gh * g + 8, 8 * S * 0.8, rgba(C.surfaceLift, 0.7));
    strokeR(ctx, QX, gy, QW, gh * g + 8, 8 * S * 0.8, C.lineSoft);
    ctx.restore();
  }
  RECEIPTS.forEach((rc, i) => {
    const st = {
      p: seg(gb, rc.at, rc.at + 0.18 / BEAT, ease.power2Out),
      running: gb >= rc.at ? 1 : 0,
      done: seg(gb, rc.done, rc.done + 0.3),
      sweep: (gb - rc.at) * BEAT / 1.4,
      count: seg(gb, rc.at + 0.15, rc.done, ease.inOutSine),
    };
    receiptRow(ctx, rc, QX + 4, ROW0 + i * ROWH, QW - 8, S, st);
  });
}

/* ---------------------------------------------------------------- the well */
function wellRect(gb) {
  const m = seg(gb, 23.25, 24, ease.inOutCubic);
  return {
    x: lerp(WELL.x, 0, m), y: lerp(WELL.y, 0, m), w: lerp(WELL.w, W, m), h: lerp(WELL.h, H, m), r: lerp(WELL.r, 0, m), m,
  };
}

function thumb(ctx, id, x, y, w, h, alpha, rot, grey = 0) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rot);
  ctx.globalAlpha = alpha;
  rrect(ctx, -w / 2, -h / 2, w, h, 5);
  ctx.save();
  ctx.clip();
  drawCover(ctx, id, -w / 2, -h / 2, w, h);
  if (grey > 0) { ctx.fillStyle = rgba(C.well, 0.55 * grey); ctx.fillRect(-w / 2, -h / 2, w, h); }
  ctx.restore();
  strokeR(ctx, -w / 2, -h / 2, w, h, 5, 'rgba(255,255,255,0.12)');
  ctx.restore();
}

function drawWell(ctx, gb) {
  const inn = seg(gb, 20.8, 21.35, ease.brand);
  if (inn <= 0) return;
  const R = wellRect(gb);
  ctx.save();
  ctx.globalAlpha = inn;
  const k = lerp(0.965, 1, inn);
  ctx.translate(R.x + R.w / 2, R.y + R.h / 2); ctx.scale(k, k); ctx.translate(-(R.x + R.w / 2), -(R.y + R.h / 2));
  ctx.shadowColor = 'rgba(11,22,24,0.45)';
  ctx.shadowBlur = 40 * (1 - R.m);
  ctx.shadowOffsetY = 18 * (1 - R.m);
  fillR(ctx, R.x, R.y, R.w, R.h, R.r, C.well);
  ctx.restore();
  ctx.save();
  ctx.globalAlpha = inn * (1 - R.m);
  strokeR(ctx, R.x, R.y, R.w, R.h, R.r, C.wellLine);
  // header: results + running count
  ctx.save();
  ctx.translate(R.x - WELL.x, R.y - WELL.y);
  font(ctx, { f: FONTS.mono, w: 500, s: 15 });
  ctx.letterSpacing = '1.6px';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = C.wellDim;
  ctx.fillText('RESULTS', WELL.x + 26, WELL.y + 36);
  const arrived = RESULTS.filter((r) => gb >= r.spawn + 0.4).length;
  const kept = gb >= RECEIPTS[3].done ? 16 : arrived;
  ctx.textAlign = 'right';
  ctx.fillStyle = C.sulphur;
  ctx.fillText(gb >= RECEIPTS[3].done ? `${kept} KEPT · RANKED BY LONGEVITY` : `${kept} MATCHES`, WELL.x + WELL.w - 26, WELL.y + 36);
  ctx.textAlign = 'left';
  ctx.fillStyle = C.wellLine;
  ctx.fillRect(WELL.x, WELL.y + 62, WELL.w, 1);
  ctx.restore();
  ctx.restore();

  // result frames
  const tw = 52, th = 65;
  const rankStart = RECEIPTS[4].at + 0.25;
  RESULTS.forEach((r) => {
    const dt = gb - r.spawn;
    if (dt < 0) return;
    const rowY = ROW0 + (r.meta ? 1 : 2) * ROWH + (34 * S) / 2;
    const ox = QX + QW - 40, oy = rowY;
    const f = clamp(dt / 0.5);
    const fe = ease.outCubic(f);
    let x = lerp(ox, r.cell.x, fe), y = lerp(oy, r.cell.y, fe) - Math.sin(f * Math.PI) * 90;
    let rot = (r.spin * (1 - settle(dt * BEAT, 200, 16))) * (Math.PI / 180);
    let sc = lerp(0.35, 1, ease.outBack(f));
    if (!r.ad) {
      const ft = gb - r.fall;
      if (ft > 0) {
        const fs = ft * BEAT;
        y += 1800 * fs * fs;
        x += r.drift * fs;
        rot += r.spin * 0.05 * fs * 6;
        const a = 1 - clamp(ft / 0.55);
        if (a <= 0) return;
        thumb(ctx, r.id, x, y, tw * sc, th * sc, a * inn, rot, clamp(ft / 0.2));
        return;
      }
      thumb(ctx, r.id, x, y, tw * sc, th * sc, inn, rot);
      return;
    }
    // relevant: lift, glow, then fly into the ranked grid
    const lift = seg(gb, RECEIPTS[3].done, RECEIPTS[3].done + 0.3, ease.outBack);
    sc *= 1 + 0.18 * lift;
    const rk = ADS.indexOf(r.ad);
    const fly = seg(gb, rankStart + rk * 0.018, rankStart + 0.45 + rk * 0.018, ease.inOutCubic);
    if (fly <= 0) {
      if (lift > 0) {
        ctx.save();
        ctx.strokeStyle = rgba(C.sulphur, 0.9 * lift);
        ctx.lineWidth = 2;
        rrect(ctx, x - (tw * sc) / 2 - 4, y - (th * sc) / 2 - 4, tw * sc + 8, th * sc + 8, 8);
        ctx.stroke();
        ctx.restore();
      }
      thumb(ctx, r.id, x, y, tw * sc, th * sc, inn, rot);
    }
  });
  // ranked grid (mini → full screen); drawn as full cards so bar 7 can pick them up 1:1
  const flyAll = RANK.map((r, rk) => seg(gb, rankStart + rk * 0.018, rankStart + 0.45 + rk * 0.018, ease.inOutCubic));
  const xf = gridXf(R.m);
  ADS.forEach((ad, rk) => {
    const f = flyAll[rk];
    if (f <= 0) return;
    const r = RANK[rk];
    const slot = xf(gridSlots[rk]);
    const sc = 1.18;
    const fromW = tw * sc, fromX = r.cell.x - fromW / 2, fromY = r.cell.y - (th * sc) / 2;
    const w = lerp(fromW, slot.w, f), x = lerp(fromX, slot.x, f), y = lerp(fromY, slot.y, f);
    ctx.save();
    ctx.globalAlpha = inn;
    drawAdCard(ctx, ad, x, y, w, { chips: 0, signals: 0, meta: seg(f, 0.4, 1), badge: seg(f, 0.5, 1) });
    ctx.restore();
  });
}

/* ----------------------------------------------------------------- layers */
function draw(ctx, t) {
  const gb = t / BEAT;
  if (gb < 16) {
    // lens portal: the product seen through the loupe, dollying in as the glass opens
    const lens = lensAt(gb);
    if (!lens) return;
    const a = seg(gb, TABLE.portal - 0.2, TABLE.portal + 0.25);
    if (a <= 0) return;
    ctx.save();
    ctx.beginPath();
    ctx.arc(lens.x, lens.y, Math.max(0, lens.r - 2), 0, Math.PI * 2);
    ctx.clip();
    ctx.globalAlpha = a;
    // dolly in with the glass: the whole composer sits inside the lens, then fills the frame
    const k = lerp(0.36, 1, clamp((lens.r - 230) / 950));
    ctx.translate(lens.x, lens.y); ctx.scale(k, k); ctx.translate(-W / 2, -H / 2 - 10);
    ground(ctx, t);
    drawComposerPhase(ctx, gb);
    ctx.restore();
    return;
  }
  ground(ctx, t);
  drawTrace(ctx, gb);
  drawComposerPhase(ctx, gb);
  drawWell(ctx, gb);
}

export default {
  id: 'query',
  layers: [{ start: B(14.6), end: B(24), draw }],
};
