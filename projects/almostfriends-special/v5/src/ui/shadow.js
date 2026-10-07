// Soft contact shadows for floating glass (Liquid Glass's own depth cue on a light ground): a blurred pill stamped
// under each glass primitive that asks for one, sized from its projection. A design shadow, not a physical one.
import { S } from '../config.js';
import { project } from '../proj.js';
let SPR = null;
function sprite() {
  if (SPR) return SPR;
  const n = Math.round(160 * S);
  SPR = document.createElement('canvas'); SPR.width = SPR.height = n;
  const g = SPR.getContext('2d');
  g.filter = `blur(${Math.round(16 * S)}px)`;
  g.fillStyle = '#0B1B3F';
  g.beginPath(); g.roundRect(n * 0.22, n * 0.3, n * 0.56, n * 0.4, n * 0.2); g.fill();
  return SPR;
}
export function shadowsFor(prims, env) {
  const list = prims.filter((p) => (p.shadow ?? 0) > 0.01);
  return (g) => {
    const spr = sprite();
    for (const p of list) {
      const [x, y, k] = project(env, [p.pos[0], p.pos[1] - (p.size[1] ?? p.size[0]) * 0.55, p.pos[2]]);
      const sx = p.scale?.[0] ?? 1, sy = p.scale?.[1] ?? 1;
      const w = 2 * p.size[0] * k * sx * 1.55, h = 2 * (p.size[1] ?? p.size[0]) * k * sy * 2.3;
      g.save(); g.globalAlpha = 0.16 * p.shadow * (p.alpha ?? 1);
      g.drawImage(spr, x - w / 2, y - h / 2 + h * 0.12, w, h);
      g.restore();
    }
  };
}
