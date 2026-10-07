// The finger: the cause of every tap (a phone has no cursor). A soft frosted disc with a shadow comes in just before
// the tap, presses down on it (smaller, darker, its shadow tucked in), and a ring leaves it; then it lifts and goes.
//   touch(g, t, tTap, [x, y, k]) — (x, y): where it presses, k: pixels per world unit there (sizes scale with it)
import { clamp, seg, ease as E } from '../util.js';

export function touch(g, t, tap, [x, y, k], { pre = 0.24, post = 0.26 } = {}) {
  if (t < tap - pre || t > tap + post + 0.4) return;
  const s = Math.max(0.6, k / 280);
  const inA = seg(t, tap - pre, tap - pre + 0.12, E.outCubic);
  const outA = 1 - seg(t, tap + post, tap + post + 0.14);
  const press = Math.sin(Math.PI * clamp((t - tap + 0.03) / 0.16));
  const a = inA * outA;
  const r = 44 * s * (1 - 0.16 * press);
  // approach: from a little down-right, as a thumb comes in
  const ox = (1 - inA) * 60 * s, oy = (1 - inA) * 90 * s;
  g.save();
  if (a > 0.01) {
    g.globalAlpha = a;
    g.shadowColor = 'rgba(11,27,63,0.28)'; g.shadowBlur = 26 * s * (1 - 0.6 * press); g.shadowOffsetY = 10 * s * (1 - 0.7 * press);
    const gr = g.createRadialGradient(x + ox - r * 0.3, y + oy - r * 0.35, r * 0.1, x + ox, y + oy, r);
    gr.addColorStop(0, `rgba(255,255,255,${0.92 - 0.12 * press})`); gr.addColorStop(1, `rgba(236,241,255,${0.8 - 0.1 * press})`);
    g.fillStyle = gr; g.beginPath(); g.arc(x + ox, y + oy, r, 0, Math.PI * 2); g.fill();
    g.shadowColor = 'transparent';
    g.lineWidth = 2 * s; g.strokeStyle = 'rgba(255,255,255,0.95)'; g.stroke();
  }
  // the ring that leaves the press
  const dt = t - tap;
  if (dt > 0 && dt < 0.45) {
    const u = dt / 0.45;
    g.globalAlpha = (1 - u) * 0.75;
    g.lineWidth = 3 * s * (1 - u) + 1;
    g.strokeStyle = 'rgba(255,255,255,1)';
    g.beginPath(); g.arc(x, y, 44 * s + E.outCubic(u) * 90 * s, 0, Math.PI * 2); g.stroke();
  }
  g.restore();
}
