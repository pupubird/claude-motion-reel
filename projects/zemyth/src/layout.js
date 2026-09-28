// Shared screen layout, so elements that travel between chapters land on the same pixels.
import { W, H, SAFE, CONTENT_W } from './config.js';

// Chapter 2 type block: "FOUR DAYS." set to the full content width, centred on the eye line.
export const FOURDAYS = { size: CONTENT_W / 6.922, railTop: 416, railBot: 666, base: 626 };

// Chapters 3–5: headline at the top-left, grid between two guide rails.
// The block ends at y 928 so nothing touches the HUD caption band (≈ 948–1004).
export const HEAD = { x: SAFE.x, base: 222, size: 88 };
export const GRIDBOX = { x: SAFE.x, y: 296, w: CONTENT_W, h: 610, cols: 5, rows: 2, gap: 24, r: 28, railTop: 272, railBot: 928 };
GRIDBOX.cw = (GRIDBOX.w - GRIDBOX.gap * (GRIDBOX.cols - 1)) / GRIDBOX.cols;
GRIDBOX.ch = (GRIDBOX.h - GRIDBOX.gap * (GRIDBOX.rows - 1)) / GRIDBOX.rows;
export const cell = (i, gap = GRIDBOX.gap) => {
  const c = i % GRIDBOX.cols, r = Math.floor(i / GRIDBOX.cols);
  const cw = (GRIDBOX.w - gap * (GRIDBOX.cols - 1)) / GRIDBOX.cols, ch = (GRIDBOX.h - gap * (GRIDBOX.rows - 1)) / GRIDBOX.rows;
  return { x: GRIDBOX.x + c * (cw + gap), y: GRIDBOX.y + r * (ch + gap), w: cw, h: ch, c, r };
};
export { W, H };
