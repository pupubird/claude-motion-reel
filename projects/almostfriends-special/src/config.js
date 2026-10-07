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
// The phone's screen in the same design pixels (1080 wide = 402 pt): an iPhone 16 Pro's 402 × 874 pt (19.5 : 9).
// The released film drew its screens 1080 × 1920 (9 : 16), the frame's own shape, which made the 3D phone squat (owner,
// special edition: "the phone can make proper iphone size? look odds to me"); its content keeps its place from the top,
// and what sits on the bottom (the composer, the home indicator, the unlock sheet) moves down with the bottom.
export const SH = Math.round((W * 874) / 402);   // 2348

// Social safe zone (Reels / TikTok / Shorts overlays): key words stay inside this box.
// TODO(research): set from the vibe report's measured safe zones.
export const SAFE = { top: 220, bottom: 1520, left: 72, right: 960 };
