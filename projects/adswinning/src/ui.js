// The product's UI, redrawn on canvas at film scale from its React sources:
// AdCard, SignalBar, PlatformBadge, stat chips, ToolReceiptRow, the landing composer,
// inspection corners and the Proof Aperture mark. `s` is a scale factor over product pixels.
import { C, FONTS } from './config.js';
import { font, rrect, fillR, strokeR, rgba } from './draw2d.js';
import { icon } from './icons.js';
import { drawCover, slots as signalSlots } from './assets.js';
import { clamp, ease, seg } from './util.js';

/* ------------------------------------------------------------------ ad card */

// Product card is ~240 px wide; everything scales from that.
export function cardDims(ad, w) {
  const s = w / 240;
  const imgH = Math.round(w / ad.ar);
  const metaH = Math.round(s * (12 + 18 + 6 + 15 + 6 + 13 + 12));
  return { s, imgH, metaH, h: imgH + metaH };
}

export function platformBadge(ctx, platform, x, y, s, onWell = true, alpha = 1) {
  font(ctx, { f: FONTS.mono, w: 500, s: 10 * s });
  ctx.letterSpacing = `${0.8 * s}px`;
  const label = platform === 'meta' ? 'META' : 'TIKTOK';
  const tw = ctx.measureText(label).width;
  const h = 18 * s, w = 6 * s + 6 * s + 6 * s + tw + 6 * s - 6 * s;
  ctx.globalAlpha *= alpha;
  fillR(ctx, x, y, w, h, 4 * s, onWell ? 'rgba(255,255,255,0.06)' : C.surface);
  strokeR(ctx, x, y, w, h, 4 * s, onWell ? 'rgba(255,255,255,0.1)' : C.line, Math.max(1, s * 0.9));
  ctx.fillStyle = platform === 'meta' ? C.meta : C.tiktok;
  ctx.beginPath();
  ctx.arc(x + 6 * s + 3 * s, y + h / 2, 3 * s, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = onWell ? C.wellText : C.slate;
  ctx.textBaseline = 'middle';
  ctx.fillText(label, x + 6 * s + 6 * s + 6 * s, y + h / 2 + 0.5 * s);
  ctx.globalAlpha /= alpha || 1;
  return w;
}

// SPEND / REACH / DAYS liquid-glass chips, stacked at the card's top-right. p reveals them in turn.
export function statChips(ctx, ad, xr, y, s, p = 1) {
  const tags = [];
  if (ad.spend) tags.push(['SPEND', 'banknote']);
  if (ad.reach) tags.push([ad.platform === 'meta' ? 'EU REACH' : 'REACH', 'radio']);
  if (ad.days != null) tags.push([`${ad.days} DAYS`, 'calendar-clock']);
  font(ctx, { f: FONTS.mono, w: 500, s: 10 * s });
  ctx.letterSpacing = `${0.8 * s}px`;
  tags.forEach(([label, ic], i) => {
    const a = seg(p, i * 0.2, i * 0.2 + 0.6, ease.brand);
    if (a <= 0) return;
    const tw = ctx.measureText(label).width;
    const h = 21 * s, w = 6 * s + 12 * s + 4 * s + tw + 8 * s;
    const x = xr - w, yy = y + i * (h + 4 * s) + (1 - a) * 4 * s;
    ctx.save();
    ctx.globalAlpha *= a;
    fillR(ctx, x, yy, w, h, h / 2, rgba(C.well, 0.72));
    strokeR(ctx, x, yy, w, h, h / 2, 'rgba(255,255,255,0.14)', Math.max(1, s * 0.9));
    icon(ctx, ic, x + 6 * s, yy + (h - 12 * s) / 2, 12 * s, C.sulphur, 2.25);
    ctx.fillStyle = 'rgba(255,255,255,0.9)';
    ctx.textBaseline = 'middle';
    ctx.fillText(label, x + 6 * s + 12 * s + 4 * s, yy + h / 2 + 0.5 * s);
    ctx.restore();
  });
}

// Five slots, fixed order. Present = sulphur fill in a track; absent = hollow outline, never a short bar.
export function signalBar(ctx, sl, xr, yb, s, { onWell = true, p = 1, slotW = 16, slotH = 3, gap = 3 } = {}) {
  const w = slotW * s, h = slotH * s, g = gap * s;
  const x0 = xr - (5 * w + 4 * g);
  sl.forEach((sig, i) => {
    const x = x0 + i * (w + g), y = yb - h;
    if (sig.present) {
      fillR(ctx, x, y, w, h, h / 2, onWell ? 'rgba(255,255,255,0.12)' : C.line);
      const f = Math.max(0.12, sig.fill) * clamp(p * 1.4 - i * 0.1);
      if (f > 0) fillR(ctx, x, y, Math.max(h, w * f), h, h / 2, C.sulphur);
    } else {
      strokeR(ctx, x, y, w, h, h / 2, onWell ? 'rgba(255,255,255,0.3)' : C.slateSoft, Math.max(1, 0.9 * s));
    }
  });
  return x0;
}

export function drawAdCard(ctx, ad, x, y, w, o = {}) {
  const { s, imgH, h } = cardDims(ad, w);
  const r = 10 * s;
  const { chips = 1, signals = 1, meta = 1, badge = 1, zoom = 1, bright = 0.86, flat = false } = o;
  ctx.save();
  // flat: square-cornered and borderless, for GPU textures whose shader rounds and outlines them
  if (!flat) { rrect(ctx, x, y, w, h, r); ctx.clip(); }
  ctx.fillStyle = C.wellLift;
  ctx.fillRect(x, y, w, h);
  // creative at 86% brightness so overlaid marks keep contrast (AdCard.tsx)
  drawCover(ctx, ad.id, x, y, w, imgH, zoom);
  if (bright < 1) { ctx.fillStyle = `rgba(0,0,0,${1 - bright})`; ctx.fillRect(x, y, w, imgH); }
  // bottom scrim
  const g = ctx.createLinearGradient(0, y + imgH - 64 * s, 0, y + imgH);
  g.addColorStop(0, rgba(C.well, 0));
  g.addColorStop(1, rgba(C.well, 0.85));
  ctx.fillStyle = g;
  ctx.fillRect(x, y + imgH - 64 * s, w, 64 * s);
  if (badge > 0) platformBadge(ctx, ad.platform, x + 8 * s, y + 8 * s, s, true, badge);
  if (chips > 0) statChips(ctx, ad, x + w - 8 * s, y + 8 * s, s, chips);
  if (ad.platform === 'tiktok') {
    const cr = 14 * s, cx = x + 8 * s + cr, cy = y + imgH - 8 * s - cr;
    ctx.fillStyle = rgba(C.wellLift, 0.62);
    ctx.beginPath(); ctx.arc(cx, cy, cr, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.12)'; ctx.lineWidth = 1; ctx.stroke();
    // filled play glyph (lucide Play with fill-white)
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.moveTo(cx - 3.5 * s, cy - 5.5 * s); ctx.lineTo(cx + 5.5 * s, cy); ctx.lineTo(cx - 3.5 * s, cy + 5.5 * s);
    ctx.closePath(); ctx.fill();
  }
  if (signals > 0) signalBar(ctx, signalSlots(ad), x + w - 10 * s, y + imgH - 10 * s, s, { p: signals });
  if (meta > 0) {
    ctx.globalAlpha *= meta;
    const mx = x + 12 * s;
    let my = y + imgH + 12 * s;
    ctx.fillStyle = 'rgba(255,255,255,0.08)';
    ctx.beginPath(); ctx.arc(mx + 9 * s, my + 9 * s, 9 * s, 0, Math.PI * 2); ctx.fill();
    font(ctx, { f: FONTS.mono, w: 400, s: 9 * s });
    ctx.fillStyle = C.wellDim;
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(ad.brand[0], mx + 9 * s, my + 9.5 * s);
    ctx.textAlign = 'left';
    font(ctx, { f: FONTS.sans, w: 500, s: 13 * s });
    ctx.fillStyle = C.wellText;
    ctx.fillText(ad.brand, mx + 18 * s + 8 * s, my + 9.5 * s);
    my += 18 * s + 6 * s;
    font(ctx, { f: FONTS.sans, w: 400, s: 12 * s });
    ctx.fillStyle = C.wellDim;
    ctx.textBaseline = 'top';
    let copy = ad.copy;
    while (ctx.measureText(copy).width > w - 24 * s && copy.length > 4) copy = copy.slice(0, -2);
    if (copy !== ad.copy) copy = copy.trimEnd() + '…';
    ctx.fillText(copy, mx, my);
    my += 15 * s + 6 * s;
    icon(ctx, 'arrow-up-right', mx - 1 * s, my - 0.5 * s, 12 * s, rgba(C.wellDim, 0.8), 2);
    font(ctx, { f: FONTS.mono, w: 400, s: 10 * s });
    ctx.fillStyle = rgba(C.wellDim, 0.8);
    ctx.fillText(ad.domain, mx + 15 * s, my + 0.5 * s);
  }
  ctx.restore();
  if (!flat) strokeR(ctx, x, y, w, h, r, C.wellLine, Math.max(1, s));
  return h;
}

// Where the animated marks sit on a card (card-local px), so a shader can reveal them.
export function cardMarks(ad, w) {
  const { s, imgH } = cardDims(ad, w);
  const bars = [w - 10 * s - 92 * s - 3 * s, imgH - 10 * s - 3 * s - 3 * s, w - 10 * s + 3 * s, imgH - 10 * s + 3 * s];
  const n = (ad.spend ? 1 : 0) + (ad.reach ? 1 : 0) + (ad.days != null ? 1 : 0);
  const chips = [w - 8 * s - 118 * s, 8 * s - 2 * s, w - 8 * s + 2 * s, 8 * s + n * 25 * s + 2 * s];
  return { bars, chips };
}

/* ----------------------------------------------------------------- receipts */

// One ToolReceiptRow. state: { p (0..1 row-in), running (0..1), done (0..1), sweep (phase) }.
export function receiptRow(ctx, rc, x, y, w, s, st) {
  const h = 34 * s;
  const a = st.p;
  if (a <= 0) return h;
  ctx.save();
  ctx.globalAlpha *= a;
  ctx.translate(0, (1 - a) * 4 * s);
  const running = st.running > 0 && st.done < 1;
  if (running) {
    fillR(ctx, x, y, w, h, 6 * s, rgba(C.petrolWash, 0.6 * (1 - st.done)));
    // the sweep: a measurement pass along the row, not a spinner
    ctx.save();
    rrect(ctx, x, y, w, h, 6 * s);
    ctx.clip();
    const sx = x - w / 3 + ((st.sweep % 1) * (w * 4 / 3));
    const g = ctx.createLinearGradient(sx, 0, sx + w / 3, 0);
    g.addColorStop(0, rgba(C.petrol, 0)); g.addColorStop(0.5, rgba(C.petrol, 0.09)); g.addColorStop(1, rgba(C.petrol, 0));
    ctx.fillStyle = g;
    ctx.fillRect(sx, y, w / 3, h);
    ctx.restore();
  }
  const ib = 22 * s, ix = x + 8 * s, iy = y + (h - ib) / 2;
  fillR(ctx, ix, iy, ib, ib, 5 * s, C.surface);
  strokeR(ctx, ix, iy, ib, ib, 5 * s, running ? rgba(C.petrol, 0.25) : C.line, Math.max(1, s * 0.9));
  icon(ctx, rc.icon, ix + (ib - 12 * s) / 2, iy + (ib - 12 * s) / 2, 12 * s, running ? C.petrol : C.slate, 2.2);
  const tx = ix + ib + 10 * s, ty = y + h / 2;
  font(ctx, { f: FONTS.sans, w: 500, s: 13 * s });
  ctx.textBaseline = 'middle';
  ctx.fillStyle = running ? C.petrol : C.ink;
  ctx.fillText(rc.label, tx, ty);
  let cx = tx + ctx.measureText(rc.label).width;
  if (rc.detail) {
    ctx.fillStyle = C.line;
    ctx.fillText('·', cx + 6 * s, ty);
    font(ctx, { f: FONTS.mono, w: 400, s: 11 * s });
    ctx.fillStyle = C.slate;
    // result counts tick up while the call runs
    const m = /^(\d+)(.*)$/.exec(rc.detail);
    const detail = m && st.done < 1 ? `${Math.round(Number(m[1]) * ease.outCubic(clamp(st.count ?? 1)))}${m[2]}` : rc.detail;
    ctx.fillText(detail, cx + 18 * s, ty + 0.5 * s);
  }
  // right rail: credits, duration, outcome — mono, because these are facts
  font(ctx, { f: FONTS.mono, w: 400, s: 10 * s });
  ctx.textAlign = 'right';
  ctx.fillStyle = C.slateSoft;
  let rx = x + w - 10 * s;
  const oc = 12 * s;
  if (st.done > 0) {
    ctx.save();
    const k = ease.outBack(clamp(st.done));
    ctx.translate(rx - oc / 2, ty);
    ctx.scale(k, k);
    icon(ctx, 'check', -oc / 2, -oc / 2, oc, C.good, 2.4);
    ctx.restore();
  } else if (running) {
    ctx.fillStyle = C.petrol;
    ctx.globalAlpha *= 0.55 + 0.45 * Math.sin(st.sweep * Math.PI * 4);
    ctx.beginPath(); ctx.arc(rx - oc / 2, ty, 3 * s, 0, Math.PI * 2); ctx.fill();
    ctx.globalAlpha = a;
  }
  rx -= oc + 8 * s;
  ctx.fillStyle = C.slateSoft;
  if (st.done > 0) {
    ctx.globalAlpha = a * clamp(st.done * 2);
    ctx.fillText(rc.ms, rx, ty + 0.5 * s);
    rx -= ctx.measureText(rc.ms).width + 8 * s;
    if (rc.credits > 0) {
      icon(ctx, 'coins', rx - 11 * s, ty - 5.5 * s, 11 * s, C.sulphur, 1.9);
      ctx.fillText(String(rc.credits), rx - 15 * s, ty + 0.5 * s);
    }
  }
  ctx.textAlign = 'left';
  ctx.restore();
  return h;
}

/* ----------------------------------------------------------------- composer */

// The landing hero form: input + petrol "Research →" button in one lifted surface.
export function composer(ctx, { x, y, w, s, text = '', caret = false, placeholder = 'Website, brand or keyword', press = 0, focus = 1, btn = 1, lead = 0 }) {
  const h = 60 * s, r = 12 * s;
  ctx.save();
  ctx.shadowColor = 'rgba(11,22,24,0.08)';
  ctx.shadowBlur = 16 * s;
  ctx.shadowOffsetY = 4 * s;
  fillR(ctx, x, y, w, h, r, C.surfaceLift);
  ctx.restore();
  // focus ring: petrol-wash halo + petrol/40 border
  if (focus > 0) {
    ctx.save();
    ctx.globalAlpha = focus;
    strokeR(ctx, x - 3 * s, y - 3 * s, w + 6 * s, h + 6 * s, r + 3 * s, C.petrolWash, 3 * s);
    ctx.restore();
  }
  strokeR(ctx, x, y, w, h, r, focus > 0.5 ? rgba(C.petrol, 0.4) : C.line, Math.max(1, s));
  // button
  font(ctx, { f: FONTS.sans, w: 500, s: 14 * s });
  const label = 'Research';
  const bw = 16 * s + ctx.measureText(label).width + 8 * s + 16 * s + 16 * s, bh = 40 * s;
  const bx = x + w - 8 * s - bw, by = y + (h - bh) / 2;
  ctx.save();
  ctx.globalAlpha *= btn;
  const k = 1 - 0.015 * press;
  ctx.translate(bx + bw / 2, by + bh / 2);
  ctx.scale(k, k);
  ctx.translate(-(bx + bw / 2), -(by + bh / 2));
  fillR(ctx, bx, by, bw, bh, 6 * s, press > 0.5 ? C.petrolSunk : C.petrol);
  ctx.fillStyle = '#fff';
  ctx.textBaseline = 'middle';
  ctx.fillText(label, bx + 16 * s, by + bh / 2 + 0.5 * s);
  icon(ctx, 'arrow-right', bx + bw - 16 * s - 16 * s, by + bh / 2 - 8 * s, 16 * s, '#fff', 2);
  ctx.restore();
  // input text (optionally led by a search glyph once docked in the trace)
  if (lead > 0) { ctx.save(); ctx.globalAlpha *= lead; icon(ctx, 'search', x + 16 * s, y + h / 2 - 8 * s, 16 * s, C.slateSoft, 2); ctx.restore(); }
  const ix = x + 12 * s + 10 * s + lead * 22 * s, iy = y + h / 2;
  font(ctx, { f: FONTS.sans, w: 400, s: 16 * s });
  ctx.textBaseline = 'middle';
  if (text) {
    ctx.fillStyle = C.ink;
    ctx.fillText(text, ix, iy + 0.5 * s);
  } else if (placeholder) {
    ctx.fillStyle = C.slateSoft;
    ctx.fillText(placeholder, ix, iy + 0.5 * s);
  }
  if (caret) {
    const cx = ix + (text ? ctx.measureText(text).width : 0) + 2 * s;
    ctx.fillStyle = C.sulphur;
    ctx.fillRect(Math.round(cx), iy - 11 * s, Math.max(2, 1.5 * s), 22 * s);
  }
  return { h, button: { x: bx, y: by, w: bw, h: bh } };
}

/* ------------------------------------------------------ inspection corners */

export function corners(ctx, x, y, w, h, { arm = 24, r = 8, lw = 2, color = C.petrol } = {}) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = lw;
  ctx.lineCap = 'square';
  ctx.lineJoin = 'round';
  ctx.beginPath();
  for (const [cx, cy, sx, sy] of [[x, y, 1, 1], [x + w, y, -1, 1], [x, y + h, 1, -1], [x + w, y + h, -1, -1]]) {
    ctx.moveTo(cx + sx * arm, cy);
    ctx.lineTo(cx + sx * r, cy);
    ctx.arcTo(cx, cy, cx, cy + sy * r, r);
    ctx.lineTo(cx, cy + sy * arm);
  }
  ctx.stroke();
  ctx.restore();
}

/* ------------------------------------------------------- Proof Aperture mark */

const FRAME = new Path2D('M4.5 10V6.5A2 2 0 0 1 6.5 4.5H10M14 4.5H17.5A2 2 0 0 1 19.5 6.5V10M19.5 14V17.5A2 2 0 0 1 17.5 19.5H14M10 19.5H6.5A2 2 0 0 1 4.5 17.5V14');
const RECESS = new Path2D('M8 13V9.5A2.5 2.5 0 0 1 10.5 7H14M18 7H21.5A2.5 2.5 0 0 1 24 9.5V13M24 17V20.5A2.5 2.5 0 0 1 21.5 23H18M14 23H10.5A2.5 2.5 0 0 1 8 20.5V17');
const TOP = new Path2D('M12 12.4 16 10.1l4 2.3-4 2.3-4-2.3Z');
const LEFT = new Path2D('M12 12.4 16 14.7v5.1l-4-2.3v-5.1Z');
const RIGHT = new Path2D('M16 14.7 20 12.4v5.1l-4 2.3v-5.1Z');

// The mark in its 32-unit box, drawn at (x, y) with `size` px. `parts` staggers the build:
// { recess, section, frame, cube } each 0..1.
export function mark(ctx, x, y, size, { onWell = false, parts = {}, cubeOffset = 0 } = {}) {
  const P = { recess: 1, section: 1, frame: 1, cube: 1, ...parts };
  const frameC = onWell ? '#DCE7E5' : C.petrol;
  const sectionC = onWell ? '#B6CBC8' : C.markSection;
  const recessC = onWell ? '#071012' : C.well;
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(size / 32, size / 32);
  ctx.lineCap = 'square';
  ctx.lineJoin = 'round';
  if (P.recess > 0) {
    ctx.save();
    ctx.globalAlpha *= 0.38 * P.recess;
    ctx.strokeStyle = recessC;
    ctx.lineWidth = 2.5;
    ctx.stroke(RECESS);
    ctx.restore();
  }
  if (P.section > 0) {
    ctx.save();
    ctx.globalAlpha *= P.section;
    ctx.fillStyle = sectionC;
    const k = P.section;
    ctx.fillRect(5.75 + (1 - k) * 9.25, 5.75 + (1 - k) * 9.25, 18.5 * k, 18.5 * k);
    ctx.restore();
  }
  if (P.frame > 0) {
    ctx.save();
    ctx.globalAlpha *= clamp(P.frame * 2);
    ctx.strokeStyle = frameC;
    ctx.lineWidth = 2;
    const k = 1.6 - 0.6 * ease.outCubic(P.frame);
    ctx.translate(12, 12); ctx.scale(k, k); ctx.translate(-12, -12);
    ctx.stroke(FRAME);
    ctx.restore();
  }
  if (P.cube > 0) {
    ctx.save();
    ctx.globalAlpha *= clamp(P.cube * 3);
    ctx.translate(0, cubeOffset);
    ctx.fillStyle = C.markTop; ctx.fill(TOP);
    ctx.fillStyle = C.markLeft; ctx.fill(LEFT);
    ctx.fillStyle = C.markRight; ctx.fill(RIGHT);
    ctx.restore();
  }
  ctx.restore();
}

// Just the sulphur evidence cuboid, centred at (cx, cy), `size` = its full height in px.
export function cuboid(ctx, cx, cy, size, alpha = 1) {
  ctx.save();
  ctx.globalAlpha *= alpha;
  const k = size / 9.7;
  ctx.translate(cx, cy);
  ctx.scale(k, k);
  ctx.translate(-16, -14.95);
  ctx.fillStyle = C.markTop; ctx.fill(TOP);
  ctx.fillStyle = C.markLeft; ctx.fill(LEFT);
  ctx.fillStyle = C.markRight; ctx.fill(RIGHT);
  ctx.restore();
}

/* ------------------------------------------------------------------ lockup */
// Mark + "Adswinning" wordmark (Bricolage 650), centred on the ink of the mark, not its box.
let LOCK = null;
export function lockup() {
  if (LOCK) return LOCK;
  const ctx = document.createElement('canvas').getContext('2d');
  const ts = 172;
  font(ctx, { f: FONTS.display, w: 650, s: ts, ls: -0.01 });
  const m = ctx.measureText('Adswinning');
  const ms = 250, gap = 30;
  const inkL = (3.5 / 32) * ms, inkR = (25.25 / 32) * ms;
  const total = inkR - inkL + gap + m.width;
  const x0 = (1920 - total) / 2 - inkL;
  const cy = 446;
  LOCK = {
    mark: { x: x0, y: cy - (14.375 / 32) * ms, size: ms },
    text: { x: x0 + inkR + gap, base: cy + (m.actualBoundingBoxAscent - 4) / 2, size: ts, w: m.width },
    cy,
  };
  return LOCK;
}
