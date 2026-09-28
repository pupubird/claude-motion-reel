// Bar 8 · end card. Radial burst on the hit, name rises from a mask, credentials decode,
// then everything collapses back into a single dot — the same dot the reel began with.
import { W, H, BEAT, COLORS as C, FONTS } from '../config.js';
import { ease, seg, lerp, clamp, hash1, TAU } from '../util.js';
import { SCRAMBLE, SKILL_POPS, FINAL_BLIP } from '../score.js';
import { font, advances, scramble } from '../draw2d.js';

const CX = W / 2, CY = H / 2;
const NAME = 'Claude';
const SKILLS = ['TYPE', '3D', 'PARTICLES', 'SHADERS', 'TIMING', 'SOUND'];
const BASE = 640;
let L = null;

function layout(ctx) {
  if (L) return L;
  font(ctx, { f: FONTS.serif, i: true, s: 300 });
  const n = advances(ctx, NAME);
  const x0 = CX - (n.total + 56) / 2;
  L = { adv: n.x, x0, dot: { x: x0 + n.total + 34, y: BASE - 24 } };
  return L;
}

function burst(ctx, lb) {
  if (lb > 1.1) return;
  for (let i = 0; i < 56; i++) {
    const h = hash1(i * 3.7), a = (i / 56) * TAU + (h - 0.5) * 0.08;
    const ro = lerp(40, 1500, ease.outExpo(clamp(lb / (0.7 + h * 0.3))));
    const ri = lerp(30, 1400, ease.outCubic(clamp(lb / (1.1 + h * 0.4))));
    ctx.globalAlpha = 1 - seg(lb, 0.2, 1.0);
    ctx.strokeStyle = i % 3 === 0 ? C.hot : C.bone;
    ctx.lineWidth = 1.5 + h * 4;
    ctx.beginPath();
    ctx.moveTo(CX + Math.cos(a) * ri, CY + Math.sin(a) * ri);
    ctx.lineTo(CX + Math.cos(a) * ro, CY + Math.sin(a) * ro);
    ctx.stroke();
  }
  const rp = seg(lb, 0, 0.9, ease.outExpo);
  ctx.globalAlpha = 1 - rp;
  ctx.strokeStyle = C.bone;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(CX, CY, rp * 1150, 0, TAU);
  ctx.stroke();
  ctx.globalAlpha = 1;
}

function draw(ctx, t) {
  const gb = t / BEAT, lb = gb - 28;
  const l = layout(ctx);
  ctx.fillStyle = C.ink;
  ctx.fillRect(0, 0, W, H);

  // Warm bloom behind the name + drifting dust.
  const glow = ctx.createRadialGradient(CX, CY + 40, 0, CX, CY + 40, 820);
  glow.addColorStop(0, 'rgba(255,74,28,0.16)');
  glow.addColorStop(1, 'rgba(255,74,28,0)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = C.bone;
  for (let i = 0; i < 90; i++) {
    const x = hash1(i) * W, y = ((hash1(i + 50) * H - t * (12 + hash1(i + 9) * 30)) % H + H) % H;
    ctx.globalAlpha = 0.12 + 0.2 * hash1(i + 3);
    ctx.fillRect(x, y, 2, 2);
  }
  ctx.globalAlpha = 1;
  burst(ctx, lb);

  // Collapse toward the dot, which glides to centre and pops on the final blip.
  const col = seg(lb, 3.2, 3.62, ease.inExpo);
  const dm = seg(lb, 3.25, 3.66, ease.inOutCubic);
  const dx = lerp(l.dot.x, CX, dm), dy = lerp(l.dot.y, CY, dm);
  ctx.save();
  ctx.translate(dx, dy);
  ctx.scale(1 - col, 1 - col);
  ctx.translate(-dx, -dy);
  ctx.globalAlpha = 1 - col;

  // MOTION DESIGNER — decode.
  font(ctx, { f: FONTS.mono, w: 700, s: 24 });
  ctx.letterSpacing = '12px';
  ctx.fillStyle = C.bone;
  const title = scramble('MOTION DESIGNER', seg(gb, SCRAMBLE.start, SCRAMBLE.end), Math.floor(t * 30));
  const tw = ctx.measureText('MOTION DESIGNER').width - 12;
  ctx.globalAlpha = (1 - col) * 0.85;
  ctx.fillText(title, CX - tw / 2, 372);
  ctx.letterSpacing = '0px';
  ctx.globalAlpha = 1 - col;

  // Name rises out of a mask.
  font(ctx, { f: FONTS.serif, i: true, s: 300 });
  ctx.save();
  ctx.beginPath();
  ctx.rect(0, BASE - 320, W, 360);
  ctx.clip();
  for (let i = 0; i < NAME.length; i++) {
    const k = seg(lb, 0.1 + i * 0.055, 0.85 + i * 0.055, ease.outExpo);
    ctx.save();
    ctx.translate(l.x0 + l.adv[i], BASE + (1 - k) * 330);
    ctx.rotate((1 - k) * 0.12);
    ctx.fillText(NAME[i], 0, 0);
    ctx.restore();
  }
  ctx.restore();

  // Divider + skills.
  const dw = 760 * seg(lb, 0.45, 1.2, ease.outExpo);
  ctx.globalAlpha = (1 - col) * 0.35;
  ctx.fillRect(CX - dw / 2, 700, dw, 1.5);
  font(ctx, { f: FONTS.mono, w: 400, s: 19 });
  ctx.letterSpacing = '5px';
  const parts = SKILLS.map((s) => ctx.measureText(s).width);
  const sep = 54, total = parts.reduce((a, b) => a + b, 0) + sep * (SKILLS.length - 1);
  let x = CX - total / 2;
  for (let i = 0; i < SKILLS.length; i++) {
    const k = seg(gb, SKILL_POPS[i], SKILL_POPS[i] + 0.35, ease.outBack);
    ctx.globalAlpha = (1 - col) * clamp(k) * 0.9;
    ctx.fillText(SKILLS[i], x, 766 + (1 - k) * 18);
    if (i > 0) { ctx.globalAlpha *= 0.5; ctx.fillText('·', x - sep / 2 - 6, 766); }
    x += parts[i] + sep;
  }
  ctx.letterSpacing = '0px';
  font(ctx, { f: FONTS.serif, i: true, s: 34 });
  ctx.globalAlpha = (1 - col) * 0.72 * seg(lb, 1.9, 2.5, ease.outCubic);
  const foot = 'every frame and every sound, rendered from code.';
  ctx.fillText(foot, CX - ctx.measureText(foot).width / 2, 890);
  ctx.restore();

  // The dot.
  const drop = seg(lb, 0.62, 1.0, ease.outBack);
  const pop = gb < FINAL_BLIP ? 1 : 1 - seg(gb, FINAL_BLIP, FINAL_BLIP + 0.16, ease.inBack);
  const swell = gb >= FINAL_BLIP - 0.06 && gb < FINAL_BLIP ? 1.25 : 1;
  const r = 22 * drop * Math.max(0, pop) * swell;
  if (r > 0.1) {
    ctx.fillStyle = C.hot;
    ctx.beginPath();
    ctx.arc(dx, dy - (1 - drop) * 60, r, 0, TAU);
    ctx.fill();
  }
}

export default {
  id: 'signature',
  layers: [{ start: 28 * BEAT, end: 32 * BEAT + 1, draw }],
};
