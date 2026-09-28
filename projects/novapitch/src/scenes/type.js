// The film's headlines and the few in-world UI marks that belong to the 3D shots (the typing bubble).
// Every word is brand or product copy; every size is legible on a phone.
import { W, H, C, BEAT, GRAD_TEXT } from '../config.js';
import { ease, clamp, lerp, seg } from '../util.js';
import { B, TITLE1, DOTS, NOVA, MEET, STEP } from '../score.js';
import { stepBadge } from '../ui/kit.js';
import { Line, drawLine, riseLine, centerX, glint } from '../type.js';
import { PROBE } from './world.js';

let L1, L2, Lmeet, STEPS;
const SIZE = 112;

/* ── Act I–II: Most decks get ignored. / See why yours won't. ───────────── */
function heroPair(ctx, t) {
  const gb = t / BEAT;
  const y1 = 792, y2 = y1 + Math.round(SIZE * 1.12);
  const x1 = centerX(L1), x2 = centerX(L2);
  // exit: the pair flies at the lens as the camera pushes into the light
  const ex = seg(gb, NOVA.push0 - 0.25, NOVA.push0 + 0.55, ease.inCubic);
  if (ex >= 1) return;
  ctx.save();
  // a dark bed under the words while the field behind them is lit
  const bed = ctx.createLinearGradient(0, H, 0, 560);
  bed.addColorStop(0, 'rgba(1,2,8,0.9)'); bed.addColorStop(0.6, 'rgba(1,2,8,0.55)'); bed.addColorStop(1, 'rgba(1,2,8,0)');
  ctx.globalAlpha = seg(gb, TITLE1.w1 - 0.6, TITLE1.w1, ease.inOutSine) * (1 - ex);
  ctx.fillStyle = bed; ctx.fillRect(0, 560, W, H - 560);
  ctx.globalAlpha = 1;
  const sc = 1 + ex * 0.3;
  ctx.translate(W / 2, 700);
  ctx.scale(sc, sc);
  ctx.translate(-W / 2, -700);
  ctx.globalAlpha = 1 - ex;
  // line 1: word by word on the beats; "ignored." then goes dark letter by letter
  const ign = L1.words[3];
  riseLine(ctx, L1, x1, y1, t, [B(TITLE1.w1), B(TITLE1.w1 + 0.25), B(TITLE1.w2), B(TITLE1.w2 + 0.25)], {
    fill: C.white, dur: 0.55,
    extra: (i) => {
      if (i < ign.a) return null;
      const k = (i - ign.a) / (ign.b - ign.a);
      const d = seg(gb, TITLE1.dim0 + k * 0.9, TITLE1.dim0 + k * 0.9 + 0.5, ease.inOutSine);
      return { a: 1 - 0.8 * d };
    },
  });
  // line 2: revealed by the nova's light as the wave crosses each glyph; the glyph flashes white, then settles
  // into the brand gradient
  if (gb >= NOVA.hit) {
    const ht = t - B(NOVA.hit);
    const R = 2400 * (1 - Math.exp(-ht / 0.55));
    const nx = PROBE.deck.x, ny = PROBE.deck.y;
    drawLine(ctx, L2, x2, y2, {
      gradient: GRAD_TEXT,
      each: (i, g) => {
        const gx = x2 + g.x + g.w / 2, gy = y2 - L2.ascent / 2;
        const d = Math.hypot(gx - nx, gy - ny);
        const front = R - d;                        // px the wave has travelled past this glyph
        const a = clamp(front / 140);
        const hot = Math.exp(-Math.max(0, front) / 160);
        return { a, dy: (1 - ease.outCubic(a)) * 26, fill: hot > 0.35 ? `rgba(255,255,255,${hot.toFixed(3)})` : undefined };
      },
    });
  }
  ctx.restore();
}

/* ── Act I: somebody is typing… and then nobody is ────────────────────── */
function typing(ctx, t) {
  const gb = t / BEAT;
  const on = seg(gb, DOTS.on, DOTS.on + 0.5, ease.brand), off = seg(gb, DOTS.off - 0.4, DOTS.off + 0.2, ease.inCubic);
  if (on <= 0 || off >= 1) return;
  const d = PROBE.deck;
  const s = d.s;
  const bw = 136, bh = 72;
  const x = d.x + s * 0.5 + 22, y = d.y - s * 0.28 - bh * 0.35;
  const k = on * (1 - off);
  ctx.save();
  ctx.translate(x, y + bh);
  ctx.scale(lerp(0.6, 1, k), lerp(0.6, 1, k));
  ctx.globalAlpha = k;
  // the product's Nova bubble: white 8 % glass, hairline, tail corner bottom-left
  ctx.beginPath();
  ctx.roundRect(0, -bh, bw, bh, [22, 22, 22, 6]);
  ctx.fillStyle = 'rgba(255,255,255,0.08)';
  ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.12)';
  ctx.lineWidth = 1.5;
  ctx.stroke();
  // typing dots (the product's .typing-dot rhythm, locked to eighth notes); frozen once they stop
  const stop = gb >= DOTS.stop;
  for (let i = 0; i < 3; i++) {
    const ph = ((gb - DOTS.on) * 2 - i * 0.5) % 1.5;
    const pk = stop ? 0 : Math.max(0, Math.sin(Math.PI * clamp(ph / 0.9)));
    const r = 8.5 * lerp(0.62, 1, pk);
    ctx.globalAlpha = k * lerp(0.4, 1, pk) * (stop ? lerp(1, 0.55, seg(gb, DOTS.stop, DOTS.stop + 0.5)) : 1);
    ctx.fillStyle = C.iris300;
    ctx.beginPath();
    ctx.arc(34 + i * 34, -bh / 2, r, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

/* ── Act II: Meet Nova Pitch. — the product named as the orb is born ───── */
function meet(ctx, t) {
  const gb = t / BEAT;
  const out = seg(gb, MEET.out - 0.35, MEET.out, ease.inCubic);
  if (gb < MEET.in - 0.05 || out >= 1) return;
  ctx.save();
  ctx.globalAlpha = 1 - out;
  const y = 930 - out * 30;
  const nova = Lmeet.words[1];
  riseLine(ctx, Lmeet, centerX(Lmeet), y, t, [B(MEET.in), B(MEET.in + 0.3), B(MEET.in + 0.45)], {
    fill: C.white,
    extra: (i) => (i >= nova.a ? { fill: 'gradient' } : null),
  });
  glint(ctx, Lmeet, centerX(Lmeet), y, seg(gb, MEET.in + 1.1, MEET.in + 2.3, ease.inOutSine));
  ctx.restore();
}

/* ── Acts III–IV: 1 Upload your deck. → 2 Build your Digital Twin. → 3 Share one link. ──────── */
// One title bar for the three steps: the site's step badge (the gradient tile with a numeral) rolls to the next
// numeral and the title swaps in place, so the chapter changes while the picture underneath transforms.
function drawStep(ctx, s, x, y) {
  drawLine(ctx, s.line, x, y, { fill: C.white, gradient: null,
    each: s.grad == null ? undefined : (i) => (i >= s.line.words[s.grad].a ? { fill: 'gradient' } : null) });
}

function steps(ctx, t) {
  const gb = t / BEAT;
  if (gb < STEP.s1 - 0.1 || gb > STEP.out + 0.4) return;
  const y = 200, BS = 92, gap = 30;
  const at = [STEP.s1, STEP.s2, STEP.s3];
  let k = 0;
  while (k + 1 < at.length && gb >= at[k + 1] - 0.1) k++;
  const sw = k ? seg(gb, at[k] - 0.1, at[k] + 0.5, ease.brand) : 1;          // swap progress from step k-1 into k
  const prev = STEPS[Math.max(0, k - 1)], cur = STEPS[k];
  const out = seg(gb, STEP.out - 0.3, STEP.out + 0.3, ease.inCubic);
  const wOf = (s) => BS + gap + s.line.width;
  const x0 = W / 2 - lerp(wOf(prev), wOf(cur), sw) / 2;
  const inP = ease.brand(clamp((t - B(STEP.s1)) / 0.5));
  const L0 = STEPS[0].line;
  ctx.save();
  ctx.globalAlpha = 1 - out;
  // the badge
  const by = y - L0.ascent / 2 - BS / 2 - (out * 40);
  stepBadge(ctx, x0, by, BS, prev.n, { next: k ? cur.n : STEPS[1].n, scale: ease.outBack(inP, 1.8), roll: k ? sw : 0 });
  // the title, swapped in place: the old one rises out of the band as the new one rises into it
  const tx = x0 + BS + gap;
  const band = L0.ascent + L0.descent + 6;
  ctx.beginPath(); ctx.rect(0, y - L0.ascent - 10, W, band + 10); ctx.clip();
  if (!k) drawStep(ctx, cur, tx, y + (1 - inP) * band);
  else {
    if (sw < 1) drawStep(ctx, prev, tx, y - sw * band);
    drawStep(ctx, cur, tx, y + (1 - sw) * band);
  }
  if (sw > 0.99) glint(ctx, cur.line, tx, y, seg(gb, at[k] + 1.0, at[k] + 2.2, ease.inOutSine), 0.45);
  ctx.restore();
}

export default {
  id: 'type',
  init() {
    const o = { s: SIZE, w: 700 };
    L1 = new Line('Most decks get ignored.', o);
    L2 = new Line('See why yours won’t.', o);
    Lmeet = new Line('Meet Nova Pitch.', o);
    const o2 = { s: 96, w: 700 };
    STEPS = [
      { n: '1', line: new Line('Upload your deck.', o2), grad: null },
      { n: '2', line: new Line('Build your Digital Twin.', o2), grad: 2 },    // "Digital Twin." in the brand gradient
      { n: '3', line: new Line('Share one link.', o2), grad: 1 },             // "one link."
    ];
  },
  layers: [
    { start: B(TITLE1.w1 - 0.1), end: B(NOVA.push0 + 1.3), draw: heroPair },
    { start: B(DOTS.on), end: B(DOTS.off + 0.3), draw: typing },
    { start: B(MEET.in - 0.1), end: B(MEET.out + 0.1), draw: meet },
    { start: B(STEP.s1 - 0.1), end: B(STEP.out + 0.5), draw: steps },
  ],
};
