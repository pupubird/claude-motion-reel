// Bubbles drawn in 2D (for UI avatars and small background bubbles) matching the 3D film's look, and Bub's face.
// The 2D bubble: a near-transparent body, an iridescent rim (a conic gradient through the film's colours, rotating
// slowly), a soft key-window highlight up-left and a small sky reflection down-right. `tint` fills it with a person's
// colours (their top priority body, second as the rim glow).
import { clamp, lerp, TAU, rgba } from '../util.js';
import { C } from '../brand.js';

const FILM = ['#FFD36E', '#FF8FC7', '#9B8CFF', '#6FD3FF', '#7CF0C0', '#FFE38A'];   // first-order soap film colours

export function drawBubble2D(ctx, x, y, r, { t = 0, seed = 0, tint = null, tint2 = null, fill = 0, alpha = 1, rim = 1 } = {}) {
  if (r < 0.5 || alpha <= 0.002) return;
  ctx.save();
  ctx.globalAlpha *= alpha;
  // body
  if (tint && fill > 0) {
    const g = ctx.createRadialGradient(x - r * 0.25, y - r * 0.3, r * 0.1, x, y, r);
    g.addColorStop(0, rgba(tint, 0.55 * fill + 0.25));
    g.addColorStop(0.7, rgba(tint, 0.78 * fill + 0.1));
    g.addColorStop(1, rgba(tint2 || tint, 0.95 * fill));
    ctx.fillStyle = g;
  } else {
    const g = ctx.createRadialGradient(x, y, r * 0.6, x, y, r);
    g.addColorStop(0, 'rgba(255,255,255,0.04)');
    g.addColorStop(1, 'rgba(255,255,255,0.22)');
    ctx.fillStyle = g;
  }
  ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill();
  // iridescent rim: a conic sweep of film colours, masked to a ring that thickens toward the bottom (drainage)
  if (rim > 0) {
    const cg = ctx.createConicGradient(seed * 1.7 + t * 0.4, x, y);
    FILM.forEach((c, i) => cg.addColorStop(i / FILM.length, c));
    cg.addColorStop(1, FILM[0]);
    ctx.save();
    ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.clip();
    ctx.globalAlpha *= 0.75 * rim;
    ctx.lineWidth = r * 0.16;
    ctx.strokeStyle = cg;
    ctx.filter = `blur(${Math.max(0.5, r * 0.05).toFixed(1)}px)`;
    ctx.beginPath(); ctx.arc(x, y + r * 0.02, r * 0.95, 0, TAU); ctx.stroke();
    ctx.filter = 'none';
    ctx.restore();
    // crisp outer edge
    ctx.lineWidth = Math.max(1, r * 0.025);
    ctx.strokeStyle = tint ? rgba('#ffffff', 0.55) : 'rgba(120,130,200,0.35)';
    ctx.beginPath(); ctx.arc(x, y, r - ctx.lineWidth / 2, 0, TAU); ctx.stroke();
  }
  // key window (up-left) and a small bounce (down-right)
  ctx.save();
  ctx.translate(x - r * 0.42, y - r * 0.45);
  ctx.rotate(-0.6);
  const hg = ctx.createRadialGradient(0, 0, 0, 0, 0, r * 0.32);
  hg.addColorStop(0, 'rgba(255,255,255,0.95)');
  hg.addColorStop(0.5, 'rgba(255,255,255,0.45)');
  hg.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = hg;
  ctx.scale(1, 0.55);
  ctx.beginPath(); ctx.arc(0, 0, r * 0.32, 0, TAU); ctx.fill();
  ctx.restore();
  ctx.fillStyle = 'rgba(255,255,255,0.5)';
  ctx.beginPath(); ctx.ellipse(x + r * 0.5, y + r * 0.52, r * 0.1, r * 0.05, -0.7, 0, TAU); ctx.fill();
  ctx.restore();
}

// Bub's face. `e` = expression: { blink 0..1, happy 0..1 (^ ^), wide 0..1, look [x, y] in −1..1, blush 0..1 }.
// Eyes sit low on the sphere (baby schema), a little apart; a specular dot in each keeps them alive.
export function drawBubFace(ctx, x, y, r, e = {}) {
  const { blink = 0, happy = 0, wide = 0, look = [0, 0], blush = 0.6, alpha = 1 } = e;
  if (r < 2 || alpha <= 0.002) return;
  ctx.save();
  ctx.globalAlpha *= alpha;
  const ex = r * 0.3, ey = y + r * 0.08 + look[1] * r * 0.08;
  const lx = look[0] * r * 0.14;
  const w = r * (0.15 + 0.03 * wide), h = r * (0.23 + 0.05 * wide) * (1 - 0.88 * clamp(blink));
  for (const s of [-1, 1]) {
    const cx = x + s * ex + lx;
    if (happy > 0.5) {
      // ^ ^ : a thick upward arc
      ctx.strokeStyle = C.ink;
      ctx.lineWidth = r * 0.075;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.arc(cx, ey + r * 0.06, w * 1.05, Math.PI * 1.15, Math.PI * 1.85);
      ctx.stroke();
    } else {
      ctx.fillStyle = C.ink;
      ctx.beginPath(); ctx.ellipse(cx, ey, w, Math.max(h, r * 0.02), 0, 0, TAU); ctx.fill();
      if (blink < 0.6) {
        ctx.fillStyle = 'rgba(255,255,255,0.95)';
        ctx.beginPath(); ctx.arc(cx + w * 0.32, ey - h * 0.38, w * 0.34, 0, TAU); ctx.fill();
      }
    }
    if (blush > 0) {
      ctx.fillStyle = rgba('#FF7A9C', 0.28 * blush);
      ctx.beginPath(); ctx.ellipse(cx + s * r * 0.16, ey + r * 0.27, r * 0.12, r * 0.06, 0, 0, TAU); ctx.fill();
    }
  }
  ctx.restore();
}

// A blink track: returns 0..1 blink amount at time t for blinks starting at `times` (each ~0.15 s, ease in/out).
export function blinkAt(t, times, dur = 0.16) {
  for (const t0 of times) {
    const u = (t - t0) / dur;
    if (u >= 0 && u <= 1) return Math.sin(u * Math.PI);
  }
  return 0;
}

// Background bokeh bubbles: deterministic small bubbles drifting up across a region (a pure function of time).
export function driftBubbles(ctx, t, { seed = 1, count = 14, area = [0, 0, 1080, 1920], rmin = 10, rmax = 46, speed = 60, alpha = 0.7 } = {}) {
  let s = seed * 9301 + 49297;
  const R = () => ((s = (s * 9301 + 49297) % 233280) / 233280);
  const [ax, ay, aw, ah] = area;
  for (let i = 0; i < count; i++) {
    const r = lerp(rmin, rmax, R() ** 2);
    const x0 = ax + R() * aw, y0 = ay + R() * ah, sp = speed * lerp(0.6, 1.4, R()), ph = R() * TAU;
    const y = ay + ((((y0 - ay) - t * sp) % (ah + 2 * r)) + ah + 2 * r) % (ah + 2 * r) - r;
    const x = x0 + Math.sin(t * 0.7 + ph) * 18;
    drawBubble2D(ctx, x, y, r, { t, seed: ph, alpha });
  }
}

// Your orb: up to three priority colours swirling inside a bubble like inks (each a soft blob orbiting slowly),
// `amounts[i]` 0..1 = how much of each has poured in. The film rim and highlights sit on top, so it stays a bubble.
export function drawColorOrb(ctx, x, y, r, colors, amounts, { t = 0, seed = 0, alpha = 1, splash = 0 } = {}) {
  if (r < 1 || alpha <= 0.002) return;
  ctx.save();
  ctx.globalAlpha *= alpha;
  ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.clip();
  // a pale interior first
  ctx.fillStyle = 'rgba(255,255,255,0.35)';
  ctx.fillRect(x - r, y - r, 2 * r, 2 * r);
  // A mesh-gradient orb, never concentric (concentric rings read as an eye): the first colour fills the whole orb, and
  // each later one floods in from its own side and keeps that sector, so three priorities read as three tones.
  const anchors = [[-0.5, -0.6], [0.75, 0.35], [-0.55, 0.7]];
  colors.forEach((c, i) => {
    const a = clamp(amounts[i] ?? 0);
    if (a <= 0) return;
    const wob = Math.sin(t * 0.7 + i * 2.1 + seed) * 0.25;
    const [ax, ay] = anchors[i];
    const d = i === 0 ? 0.35 : 0.9;
    const bx = x + (ax * Math.cos(wob) - ay * Math.sin(wob)) * r * d, by = y + (ax * Math.sin(wob) + ay * Math.cos(wob)) * r * d;
    const br = r * (i === 0 ? lerp(0.7, 1.9, a) : lerp(0.3, 1.25, a));
    const g = ctx.createRadialGradient(bx, by, 0, bx, by, br);
    g.addColorStop(0, rgba(c, 0.97));
    g.addColorStop(i === 0 ? 0.6 : 0.42, rgba(c, i === 0 ? 0.92 : 0.8));
    g.addColorStop(1, rgba(c, 0));
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.arc(bx, by, br, 0, TAU); ctx.fill();
  });
  ctx.restore();
  if (splash > 0) {      // a ring where a colour lands
    ctx.save();
    ctx.globalAlpha *= alpha * (1 - splash);
    ctx.strokeStyle = 'rgba(255,255,255,0.9)';
    ctx.lineWidth = r * 0.06 * (1 - splash);
    ctx.beginPath(); ctx.arc(x, y, r * (1 + 0.35 * splash), 0, TAU); ctx.stroke();
    ctx.restore();
  }
  drawBubble2D(ctx, x, y, r, { t, seed, alpha });
}
