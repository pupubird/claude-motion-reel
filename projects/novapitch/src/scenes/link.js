// Act IV — "Share one link." Nova collapses to a point; the point opens into a line; the line draws the
// product's link field (Links page: a mono URL in a hairline field with the copy action); the URL types in,
// copy flips to a check, and the field folds back into the point that launches (world.js takes it from there).
import { W, C, BEAT } from '../config.js';
import { ease, clamp, seg } from '../util.js';
import { B, LINK } from '../score.js';
import { Line, riseLine, glint } from '../type.js';
import { rr, text, measure, stepBadge } from '../ui/kit.js';
import { icon } from '../ui/icons.js';

const URL = 'novapitch.ai/r/luminex';
const MONO = '"JetBrains Mono"';
const F = { w: 1040, h: 116, cy: 540 };
let TITLE;

function glow(ctx, draw, core = 2.2) {
  ctx.save();
  ctx.lineCap = 'round';
  for (const [wd, col] of [[14, 'rgba(46,107,255,0.22)'], [6, 'rgba(34,197,235,0.5)'], [core, 'rgba(255,255,255,1)']]) {
    ctx.lineWidth = wd; ctx.strokeStyle = col; draw(); ctx.stroke();
  }
  ctx.restore();
}

function draw(ctx, t) {
  const gb = t / BEAT;
  const cx = W / 2;
  // 1 · the point opens into a line (fire → field0), 2 · the line opens into the field (field0 → +0.4),
  // 5 · the field folds back to a line and the line to a point (fold → launch)
  const open = seg(gb, LINK.fire + 0.2, LINK.field0 + 0.25, ease.outExpo);
  const tall = seg(gb, LINK.field0 + 0.15, LINK.field0 + 0.6, ease.brand);
  const shut = seg(gb, LINK.fold, LINK.fold + 0.3, ease.inCubic);
  const pinch = seg(gb, LINK.fold + 0.25, LINK.launch, ease.inCubic);
  const w = F.w * open * (1 - pinch), h = F.h * tall * (1 - shut);
  const x = cx - w / 2, y = F.cy - h / 2;
  if (gb < LINK.fire || gb >= LINK.launch) return;

  // the title
  const tOut = seg(gb, LINK.fold - 0.4, LINK.fold + 0.1, ease.inCubic);
  if (tOut < 1) {
    ctx.save();
    ctx.globalAlpha = 1 - tOut;
    const BS = 92, gap = 30, x0 = W / 2 - (BS + gap + TITLE.width) / 2, ty = 380 - tOut * 30;
    stepBadge(ctx, x0, ty - TITLE.ascent / 2 - BS / 2, BS, '3', { scale: ease.outBack(clamp((t - B(LINK.title - 0.2)) / 0.45), 1.8) });
    riseLine(ctx, TITLE, x0 + BS + gap, ty, t, [B(LINK.title), B(LINK.title + 0.25), B(LINK.title + 0.5)], {
      fill: C.white, extra: (i) => (i >= TITLE.words[1].a ? { fill: 'gradient' } : null) });
    glint(ctx, TITLE, x0 + BS + gap, ty, seg(gb, LINK.title + 1.0, LINK.title + 2.0, ease.inOutSine), 0.45);
    ctx.restore();
  }

  if (h < 2) {
    // a line (or a point) of light
    const hw = Math.max(w / 2, 3);
    glow(ctx, () => { ctx.beginPath(); ctx.moveTo(cx - hw, F.cy); ctx.lineTo(cx + hw, F.cy); }, 2.6);
    const g = ctx.createRadialGradient(cx, F.cy, 0, cx, F.cy, 60);
    g.addColorStop(0, `rgba(255,255,255,${0.9 * (pinch > 0 ? 1 : 1 - open)})`); g.addColorStop(1, 'rgba(52,211,235,0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(cx, F.cy, 60, 0, Math.PI * 2); ctx.fill();
    return;
  }
  // the field: glass fill, a hairline that is still carrying the line's light, the icon, the URL, copy
  const r = Math.min(h / 2, 22);
  ctx.save();
  rr(ctx, x, y, w, h, r); ctx.fillStyle = 'rgba(255,255,255,0.05)'; ctx.fill();
  const lit = 1 - seg(gb, LINK.field0 + 0.3, LINK.field0 + 1.4, ease.inOutSine);
  ctx.lineWidth = 1.5; ctx.strokeStyle = `rgba(255,255,255,${0.1 + 0.2 * lit})`;
  rr(ctx, x + 0.75, y + 0.75, w - 1.5, h - 1.5, r); ctx.stroke();
  if (lit > 0.01) {
    ctx.globalAlpha = lit;
    glow(ctx, () => { rr(ctx, x, y, w, h, r); }, 1.6);
    ctx.globalAlpha = 1;
  }
  rr(ctx, x, y, w, h, r); ctx.clip();
  const a = seg(gb, LINK.field0 + 0.3, LINK.type0, ease.outCubic) * (1 - shut);
  ctx.globalAlpha = a;
  icon(ctx, 'link-2', x + 34, F.cy - 20, 40, C.iris400, 2.2);
  const n = Math.round(clamp((gb - LINK.type0) / (LINK.type1 - LINK.type0)) * URL.length);
  ctx.font = `500 46px ${MONO}`;
  const tx = x + 100;
  text(ctx, URL.slice(0, n), tx, F.cy + 16, { f: MONO, w: 500, size: 46, color: C.white });
  if (gb < LINK.copy + 0.2 && Math.floor(t * 3.5) % 2 === 0) {
    const cw = measure(ctx, URL.slice(0, n), { f: MONO, w: 500, size: 46 });
    ctx.fillStyle = C.iris300; ctx.fillRect(tx + cw + 4, F.cy - 26, 3, 52);
  }
  // copy → check (the product's copy action), with a press on the click
  const bx = x + w - 92, by = F.cy - 34;
  const press = gb >= LINK.copy ? Math.sin(Math.PI * clamp((gb - LINK.copy) / 0.35)) : 0;
  const done = gb >= LINK.copy + 0.1;
  ctx.save();
  ctx.translate(bx + 34, by + 34); ctx.scale(1 - 0.1 * press, 1 - 0.1 * press); ctx.translate(-(bx + 34), -(by + 34));
  rr(ctx, bx, by, 68, 68, 16); ctx.fillStyle = done ? 'rgba(195,255,31,0.12)' : 'rgba(46,107,255,0.18)'; ctx.fill();
  icon(ctx, done ? 'check' : 'copy', bx + 16, by + 16, 36, done ? C.lime : C.iris300, 2.4);
  ctx.restore();
  ctx.restore();
  // "Copied" hangs under the field for a beat
  const cp = seg(gb, LINK.copy + 0.1, LINK.copy + 0.5, ease.brand) * (1 - seg(gb, LINK.fold - 0.2, LINK.fold + 0.1));
  if (cp > 0) {
    ctx.save();
    ctx.globalAlpha = cp;
    const label = 'Link copied';
    const lw = measure(ctx, label, { size: 30, w: 500 }) + 56;
    const lx = cx + F.w / 2 - lw, ly = F.cy + F.h / 2 + 22 + (1 - cp) * 10;
    rr(ctx, lx, ly, lw, 52, 26); ctx.fillStyle = 'rgba(195,255,31,0.10)'; ctx.fill();
    ctx.strokeStyle = 'rgba(195,255,31,0.28)'; ctx.lineWidth = 1; rr(ctx, lx + 0.5, ly + 0.5, lw - 1, 51, 25.5); ctx.stroke();
    ctx.fillStyle = C.lime; ctx.beginPath(); ctx.arc(lx + 24, ly + 26, 5, 0, Math.PI * 2); ctx.fill();
    text(ctx, label, lx + 38, ly + 36, { size: 30, w: 500, color: C.lime });
    ctx.restore();
  }
}

export default {
  id: 'link',
  init() { TITLE = new Line('Share one link.', { s: 96, w: 700 }); },
  layers: [{ start: B(LINK.fire), end: B(LINK.launch), draw }],
};
