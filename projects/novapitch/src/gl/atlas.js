// A texture atlas of "other people's decks" for the field of ignored decks: 56 procedurally laid-out slides
// (greeked text — bars, not words — so nothing fake is readable) plus the eight real Luminex slides.
// 8×8 cells of 256×144 → 2048×1152. Cell i: col = i % 8, row = floor(i / 8). Cells 56–63 are Luminex 1–8.
import { rng } from '../util.js';
import { SLIDES } from '../assets.js';

export const CELL_W = 256, CELL_H = 144, COLS = 8, ROWS = 8, OURS = 56;

export function buildAtlas() {
  const cv = document.createElement('canvas');
  cv.width = CELL_W * COLS;
  cv.height = CELL_H * ROWS;
  const g = cv.getContext('2d');
  const R = rng(4242);
  const accents = ['#E8B04A', '#E4675A', '#5FB8A5', '#8C7BE8', '#D9D4C7', '#6FA8DC', '#C77DBA', '#9BC46B'];
  for (let i = 0; i < 56; i++) {
    const x0 = (i % COLS) * CELL_W, y0 = Math.floor(i / COLS) * CELL_H;
    const light = R() < 0.3;
    const bg = light ? ['#F4F2EE', '#EDEFF3', '#FFFFFF'][Math.floor(R() * 3)] : ['#111316', '#0E1420', '#17151A', '#0B0F14'][Math.floor(R() * 4)];
    const ink = light ? 'rgba(20,22,28,' : 'rgba(235,238,245,';
    const acc = accents[Math.floor(R() * accents.length)];
    g.fillStyle = bg;
    g.fillRect(x0, y0, CELL_W, CELL_H);
    const bar = (x, y, w, h, a) => { g.fillStyle = ink + a + ')'; g.beginPath(); g.roundRect(x0 + x, y0 + y, w, h, h / 2); g.fill(); };
    const layout = Math.floor(R() * 5);
    bar(14, 12, 28 + R() * 20, 4, 0.35);                          // header
    if (layout === 0) {                                           // title slide
      bar(18, 50, 150 + R() * 60, 12, 0.85); bar(18, 70, 110 + R() * 70, 12, 0.85);
      g.fillStyle = acc; g.fillRect(x0 + 18, y0 + 94, 40, 4);
      bar(18, 108, 90, 5, 0.4);
    } else if (layout === 1) {                                    // big number + label
      bar(18, 36, 120, 8, 0.8);
      g.fillStyle = acc; g.font = '700 38px Inter'; g.fillText(['3×', '42%', '$9M', '18k', '7.4', '2.1×'][Math.floor(R() * 6)], x0 + 18, y0 + 96);
      bar(18, 110, 80, 5, 0.4); bar(150, 60, 88, 60, 0.08);
    } else if (layout === 2) {                                    // bar chart
      bar(18, 30, 130, 8, 0.8);
      for (let k = 0; k < 7; k++) { const h = 16 + R() * 58; g.fillStyle = k === 5 ? acc : ink + '0.25)'; g.fillRect(x0 + 24 + k * 30, y0 + 124 - h, 18, h); }
    } else if (layout === 3) {                                    // line chart
      bar(18, 30, 110, 8, 0.8);
      g.strokeStyle = acc; g.lineWidth = 3; g.beginPath();
      let y = 110; for (let k = 0; k < 9; k++) { y = Math.max(56, Math.min(122, y - 4 - R() * 14 + 6)); const x = 22 + k * 26; k ? g.lineTo(x0 + x, y0 + y) : g.moveTo(x0 + x, y0 + y); }
      g.stroke();
    } else {                                                      // three cards
      bar(18, 30, 140, 8, 0.8);
      for (let k = 0; k < 3; k++) { g.fillStyle = ink + '0.07)'; g.beginPath(); g.roundRect(x0 + 16 + k * 76, y0 + 58, 68, 62, 6); g.fill();
        g.fillStyle = k === 1 ? acc : ink + '0.5)'; g.fillRect(x0 + 24 + k * 76, y0 + 70, 26, 8); bar(24 + k * 76, 90, 44, 4, 0.3); }
    }
  }
  for (let k = 0; k < 8; k++) {
    const i = OURS + k;
    g.drawImage(SLIDES[k], (i % COLS) * CELL_W, Math.floor(i / COLS) * CELL_H, CELL_W, CELL_H);
  }
  return cv;
}
