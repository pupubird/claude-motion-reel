// iOS system chrome at film scale: status bar, Dynamic Island, home indicator. Geometry in points (iPhone 16/17 Pro:
// 402 × 874 pt; status bar 54 pt with the island; island 126 × 37.33 pt at y = 11; home indicator 134 × 5 pt, 8 pt
// above the bottom edge). `k` = pixels per point.
import { rr, text } from './kit.js';

export const PHONE = { w: 402, h: 874 };
// Full-bleed: the video frame is the phone's screen (1080 px wide → k ≈ 2.687 px/pt); 714.6 pt of it fits in 1920 px.
export const KFULL = 1080 / 402;

// Status bar: time on the left of the island, cellular / Wi-Fi / battery on the right. `ink` is the glyph colour.
export function statusBar(ctx, x, y, w, k, { ink = '#000', time = '9:41', font = '"Inter"' } = {}) {
  const cy = y + 11 * k + 37.33 * k / 2;                 // centred on the island's midline
  text(ctx, time, x + w * 0.165, cy + 6.2 * k, { f: font, w: 600, size: 17 * k, color: ink, align: 'center', log: false });
  const rx = x + w - 24 * k;
  ctx.save();
  ctx.fillStyle = ink;
  // battery: 25 × 12 pt body, 1 pt stroke, nub
  const bw = 25 * k, bh = 12 * k, bx = rx - bw, by = cy - bh / 2;
  ctx.globalAlpha *= 0.4;
  ctx.lineWidth = 1 * k; ctx.strokeStyle = ink;
  rr(ctx, bx + 0.5 * k, by + 0.5 * k, bw - k, bh - k, 3.6 * k); ctx.stroke();
  rr(ctx, bx + bw + 1 * k, cy - 2 * k, 1.5 * k, 4 * k, 0.8 * k); ctx.fill();
  ctx.globalAlpha /= 0.4;
  rr(ctx, bx + 2 * k, by + 2 * k, (bw - 4 * k) * 0.82, bh - 4 * k, 2.2 * k); ctx.fill();
  // Wi-Fi: three arcs and a dot
  const wx = bx - 9 * k - 8 * k, wy = cy + 4.6 * k;
  ctx.lineCap = 'round';
  for (let i = 0; i < 3; i++) {
    ctx.beginPath();
    ctx.lineWidth = 2.1 * k;
    const r = (3.4 + i * 3.6) * k;
    ctx.arc(wx, wy, r, -Math.PI * 0.75, -Math.PI * 0.25);
    ctx.stroke();
  }
  ctx.beginPath(); ctx.arc(wx, wy - 0.5 * k, 1.5 * k, 0, Math.PI * 2); ctx.fill();
  // cellular: four rising bars
  const cx0 = wx - 12 * k - 17 * k;
  for (let i = 0; i < 4; i++) {
    const bh2 = (4 + i * 2.6) * k;
    rr(ctx, cx0 + i * 4.6 * k, cy + 5.4 * k - bh2, 3.1 * k, bh2, 1 * k); ctx.fill();
  }
  ctx.restore();
}

export function dynamicIsland(ctx, x, y, w, k) {
  const iw = 126 * k, ih = 37.33 * k;
  ctx.fillStyle = '#000';
  rr(ctx, x + w / 2 - iw / 2, y + 11 * k, iw, ih, ih / 2);
  ctx.fill();
}

export function homeIndicator(ctx, x, y, w, h, k, ink = '#000') {
  ctx.save();
  ctx.fillStyle = ink;
  ctx.globalAlpha *= 0.9;
  rr(ctx, x + w / 2 - 67 * k, y + h - 8 * k - 5 * k, 134 * k, 5 * k, 2.5 * k);
  ctx.fill();
  ctx.restore();
}
