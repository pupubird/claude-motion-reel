// Shared screen layouts, so 2D and 3D hand-offs land on the same pixels.
import { W } from './config.js';
import { ADS } from './assets.js';
import { cardDims } from './ui.js';

// The ranked grid on the light table: masonry, rank order, shortest column first (like AdGrid).
export const GRID = { cols: 6, colW: 262, gap: 22, y0: 118 };
GRID.x0 = Math.round((W - (GRID.cols * GRID.colW + (GRID.cols - 1) * GRID.gap)) / 2);

export const gridSlots = (() => {
  const colY = new Array(GRID.cols).fill(GRID.y0);
  return ADS.map((ad, rank) => {
    let c = 0;
    for (let i = 1; i < GRID.cols; i++) if (colY[i] < colY[c] - 1) c = i;
    const { h } = cardDims(ad, GRID.colW);
    const slot = { x: GRID.x0 + c * (GRID.colW + GRID.gap), y: colY[c], w: GRID.colW, h, col: c, rank };
    colY[c] += h + GRID.gap;
    return slot;
  });
})();

// The results well during the agent's run (right half of the trace).
export const WELL = { x: 1004, y: 150, w: 766, h: 792, r: 16 };
// The trace panel (left half).
export const TRACE = { x: 150, y: 150, w: 790, s: 1.72 };
