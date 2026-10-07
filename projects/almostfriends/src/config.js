// Global constants shared by the picture, the soundtrack and the renderer.
// Vertical: the design space is 1080×1920 (9:16, a phone held upright). S scales the render (S = 2 → a 2160×3840
// master) without touching layout.
const q = new URLSearchParams(typeof location !== 'undefined' ? location.search : '');
export const S = Number(q.get('scale') || 1);
export const W = 1080;
export const H = 1920;
export const FPS = 60;
export const BPM = 120;
export const BEAT = 60 / BPM;          // 0.5 s = 30 frames: every beat lands on a frame boundary
export const BAR = BEAT * 4;           // 2 s
export const BARS = 33;            // v6: 66 s (v4 added a bar for Bub's search; v6 cut one from the hook)
export const DURATION = BAR * BARS;    // 66 s
export const FRAMES = Math.round(DURATION * FPS); // 3960

// Social safe zone (Reels / TikTok / Shorts overlays): key words stay inside this box.
// TODO(research): set from the vibe report's measured safe zones.
export const SAFE = { top: 220, bottom: 1520, left: 72, right: 960 };
