// Nova at avatar size (the product's .cm-rail-orb / ROrb < 48 px path is a flat CSS blob; this keeps the film's
// orb language): milky and cobalt phases split by a wavy meniscus that moves with the voice.
export function miniOrb(ctx, cx, cy, r, t, env = 0, alpha = 1) {
  if (alpha <= 0.001) return;
  ctx.save();
  ctx.globalAlpha *= alpha;
  // aura: the product's blurred conic (iris / ocean / orchid), breathing with the voice
  const ar = r * (1.45 + 0.35 * env);
  const aura = ctx.createRadialGradient(cx, cy, r * 0.85, cx, cy, ar);
  aura.addColorStop(0, `rgba(147,181,255,${0.45 + 0.35 * env})`);
  aura.addColorStop(0.5, `rgba(146,235,255,${0.18 + 0.2 * env})`);
  aura.addColorStop(1, 'rgba(233,201,240,0)');
  ctx.fillStyle = aura;
  ctx.beginPath(); ctx.arc(cx, cy, ar, 0, Math.PI * 2); ctx.fill();
  ctx.save();
  ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.clip();
  // milk phase
  const milk = ctx.createRadialGradient(cx - r * 0.25, cy - r * 0.35, r * 0.1, cx, cy, r * 1.05);
  milk.addColorStop(0, '#FFFFFF'); milk.addColorStop(0.6, '#EEF4FB'); milk.addColorStop(0.88, '#9CC8EE'); milk.addColorStop(1, '#2A3BE0');
  ctx.fillStyle = milk; ctx.fillRect(cx - r, cy - r, r * 2, r * 2);
  // the meniscus: a tilted wave that rides higher and rougher while it speaks
  const tilt = 0.18 * Math.sin(t * 0.9), lvl = r * (0.08 - 0.06 * env);
  const amp = r * (0.06 + 0.16 * env);
  const wave = (x) => cy + lvl + (x - cx) * tilt + Math.sin((x - cx) / r * 3.1 + t * 5.5) * amp * 0.6 + Math.sin((x - cx) / r * 5.3 - t * 7.3) * amp * 0.4;
  ctx.beginPath();
  ctx.moveTo(cx - r, wave(cx - r));
  for (let x = cx - r; x <= cx + r; x += r / 12) ctx.lineTo(x, wave(x));
  ctx.lineTo(cx + r, cy + r); ctx.lineTo(cx - r, cy + r); ctx.closePath();
  const deep = ctx.createRadialGradient(cx + r * 0.1, cy + r * 0.25, r * 0.05, cx, cy + r * 0.1, r * 1.05);
  deep.addColorStop(0, `rgb(${117 + 40 * env},${20 + 30 * env},250)`); deep.addColorStop(0.45, '#262EEB'); deep.addColorStop(1, '#0000C8');
  ctx.fillStyle = deep; ctx.fill();
  ctx.beginPath();
  for (let x = cx - r; x <= cx + r; x += r / 12) (x === cx - r ? ctx.moveTo : ctx.lineTo).call(ctx, x, wave(x));
  ctx.strokeStyle = '#12138F'; ctx.lineWidth = Math.max(1.5, r * 0.07); ctx.stroke();
  ctx.restore();
  // glass: a cobalt rim and one specular
  ctx.strokeStyle = 'rgba(40,60,230,0.85)'; ctx.lineWidth = Math.max(1, r * 0.05);
  ctx.beginPath(); ctx.arc(cx, cy, r - ctx.lineWidth / 2, 0, Math.PI * 2); ctx.stroke();
  const sp = ctx.createRadialGradient(cx - r * 0.38, cy - r * 0.42, 0, cx - r * 0.38, cy - r * 0.42, r * 0.35);
  sp.addColorStop(0, 'rgba(255,255,255,0.9)'); sp.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = sp; ctx.beginPath(); ctx.arc(cx - r * 0.38, cy - r * 0.42, r * 0.35, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}

// five bars that follow the voice (the product's audio-lines, animated)
export function voiceMeter(ctx, x, y, h, env, t, color = '#93B5FF') {
  ctx.save();
  ctx.fillStyle = color;
  for (let i = 0; i < 5; i++) {
    const k = 0.35 + 0.65 * Math.abs(Math.sin(t * (7 + i * 1.7) + i * 1.3));
    const bh = Math.max(h * 0.18, h * env * k);
    ctx.beginPath(); ctx.roundRect(x + i * h * 0.34, y - bh / 2, h * 0.18, bh, h * 0.09); ctx.fill();
  }
  ctx.restore();
}
