// Global constants shared by the picture, the cue sheet and the renderer.
// Vertical 1080×1920 (9:16) design space; S scales every buffer (S = 2 → the 2160×3840 master), never the layout.
// The film is one take on the score's grid: 120 BPM, 2 s bars, 22 bars. Take s3 (tools/music.py, measured by
// tools/score_check.py): the quiet night pulse 0–6, the groove drops at 6.0, the breath 22–28, the climax 28–40, the
// ring-out to 44.
const q = new URLSearchParams(typeof location !== 'undefined' ? location.search : '');
export const S = Number(q.get('scale') || 1);
export const W = 1080;
export const H = 1920;
export const FPS = 60;
export const BPM = 120;
export const BEAT = 60 / BPM;           // 0.5 s = 30 frames
export const BAR = BEAT * 4;            // 2 s
export const BARS = 22;
export const DURATION = BAR * BARS;     // 44 s
export const FRAMES = Math.round(DURATION * FPS);   // 2640

// Reels / TikTok / Shorts overlays: words that must be read stay inside this box.
export const SAFE = { top: 220, bottom: 1520, left: 72, right: 960 };
