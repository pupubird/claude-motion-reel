// "It remembers." — the product's Knowledge Base (Data Vault → Knowledge Base) building itself beside Nova, one
// answer per beat, each carried out of the orb on a line of light. Rows are the Luminex showroom's real Q&A,
// cited to their slides. At the fold, the answers are pulled back into the orb.
import { C, BEAT, FONTS } from '../config.js';
import { ease, lerp, seg } from '../util.js';
import { B, KB } from '../score.js';
import { PROBE } from './world.js';
import { glass, text, chip, rr } from '../ui/kit.js';

const ROWS = [
  { q: 'What is the customer payback period?', a: 'Median payback is 7.2 months.', c: 'Deck · Slide 5' },
  { q: 'What makes the forecast defensible?', a: 'A continuously calibrated operating graph.', c: 'Deck · Slide 4' },
  { q: 'How fast is a first deployment?', a: 'Live at the first site in 14 days.', c: 'Deck · Slide 6' },
];
const P = { x: 944, y: 262, w: 852, head: 84, row: 156 };
P.h = P.head + ROWS.length * P.row + 8;

function glowLine(ctx, x0, y0, x1, y1, head, tail, alpha) {
  // a cubic with horizontal tangents from the orb's rim to the row; drawn between tail and head (0–1)
  const pt = (u) => {
    const cx0 = lerp(x0, x1, 0.55), cx1 = lerp(x0, x1, 0.45);
    const a = (1 - u) ** 3, b = 3 * (1 - u) ** 2 * u, c = 3 * (1 - u) * u * u, d = u ** 3;
    return [a * x0 + b * cx0 + c * cx1 + d * x1, a * y0 + b * y0 + c * y1 + d * y1];
  };
  const N = 40;
  ctx.save();
  ctx.lineCap = 'round';
  for (const [wd, col, al] of [[10, 'rgba(46,107,255,', 0.28], [4, 'rgba(34,197,235,', 0.55], [1.6, 'rgba(255,255,255,', 1]]) {
    ctx.beginPath();
    for (let i = 0; i <= N; i++) {
      const u = lerp(tail, head, i / N);
      const [x, y] = pt(u);
      i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
    }
    ctx.strokeStyle = col + (al * alpha).toFixed(3) + ')';
    ctx.lineWidth = wd;
    ctx.stroke();
  }
  const [hx, hy] = pt(head);
  const g = ctx.createRadialGradient(hx, hy, 0, hx, hy, 18);
  g.addColorStop(0, `rgba(255,255,255,${alpha})`);
  g.addColorStop(1, 'rgba(52,211,235,0)');
  ctx.fillStyle = g;
  ctx.beginPath(); ctx.arc(hx, hy, 18, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}

function draw(ctx, t) {
  const gb = t / BEAT;
  const inP = seg(gb, KB.panel, KB.panel + 0.6, ease.brand);
  const fold = seg(gb, KB.fold0, KB.fold1, ease.inCubic);
  if (inP <= 0 || fold >= 1) return;
  const o = PROBE.orb;
  ctx.save();
  // the panel slides in from the orb's side and is pulled back into it at the fold
  const px = lerp(P.x + 60, P.x, inP) - fold * (P.x - o.x) * 0.6;
  ctx.globalAlpha = inP * (1 - fold);
  ctx.translate(px + P.w / 2, P.y + P.h / 2);
  ctx.scale(lerp(0.97, 1, inP) * (1 - fold * 0.5), (1 - fold * 0.75));
  ctx.translate(-P.w / 2, -P.h / 2);
  glass(ctx, 0, 0, P.w, P.h, 18, { fill: 'rgba(12,14,22,0.72)' });
  // header: the section, and coverage of the deck filling as answers land
  text(ctx, 'Knowledge Base', 36, 54, { f: FONTS.display, w: 700, size: 30 });
  const cov = seg(gb, KB.rows[0] - 0.2, KB.rows[2] + 0.4, ease.inOutSine);
  const slides = Math.max(1, Math.round(lerp(1, 8, cov)));
  text(ctx, `${slides} / 8 slides read`, P.w - 36, 52, { size: 22, color: C.text3, align: 'right', w: 500 });
  rr(ctx, 36, 70, P.w - 72, 4, 2); ctx.fillStyle = 'rgba(255,255,255,0.08)'; ctx.fill();
  const g = ctx.createLinearGradient(36, 0, P.w - 36, 0);
  g.addColorStop(0, C.iris600); g.addColorStop(1, C.iris500);
  rr(ctx, 36, 70, Math.max(4, (P.w - 72) * cov), 4, 2); ctx.fillStyle = g; ctx.fill();
  ROWS.forEach((r, i) => {
    const at = KB.rows[i];
    const p = seg(gb, at, at + 0.6, ease.brand);
    if (p <= 0) return;
    const y = P.head + 10 + i * P.row;
    ctx.save();
    ctx.globalAlpha *= p;
    ctx.translate(0, (1 - p) * 16);
    if (i) { ctx.fillStyle = 'rgba(255,255,255,0.07)'; ctx.fillRect(36, y, P.w - 72, 1); }
    text(ctx, r.q, 36, y + 46, { size: 29, w: 600 });
    text(ctx, r.a, 36, y + 86, { size: 26, color: C.text2 });
    chip(ctx, r.c, 36, y + 104, { size: 19, pad: 12, h: 36, color: C.text2 });
    ctx.restore();
  });
  ctx.restore();
  // the line each answer rides out of the orb on (drawn in screen space, over the panel's left edge)
  ROWS.forEach((r, i) => {
    const at = KB.rows[i];
    const head = seg(gb, at - 0.45, at, ease.inOutCubic), tail = seg(gb, at + 0.1, at + 0.8, ease.inCubic);
    if (head <= 0 || tail >= 1 || fold > 0) return;
    const ry = P.y + P.head + 10 + i * P.row + 70;
    const ang = Math.atan2(ry - o.y, P.x - o.x);
    glowLine(ctx, o.x + Math.cos(ang) * o.r * 0.98, o.y + Math.sin(ang) * o.r * 0.98, P.x - 6, ry, head, tail, 1);
  });
}

export default { id: 'kb', layers: [{ start: B(KB.panel), end: B(KB.fold1 + 0.1), draw }] };
