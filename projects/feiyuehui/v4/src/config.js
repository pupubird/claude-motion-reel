// Global constants shared by the picture, the cue sheet and the renderer.
// Design space is 1920×1080; S scales every buffer (S = 2 → a 3840×2160 master) without touching the layout.
const q = new URLSearchParams(typeof location !== 'undefined' ? location.search : '');
export const S = Number(q.get('scale') || 1);
export const W = 1920;
export const H = 1080;
export const FPS = 60;
export const BPM = 120;
export const BEAT = 60 / BPM;          // 0.5 s = 30 frames: every beat lands on a frame boundary
export const BAR = BEAT * 4;           // 2 s
export const BARS = 20;
export const DURATION = BAR * BARS;    // 40 s (the 30 s first cut read too fast: every title now holds ≥ 1.5 s formed)
export const FRAMES = Math.round(DURATION * FPS); // 2400

// Bar b (1-based) starts at bar(b); beats inside it with bar(b, beat).
export const bar = (b, beat = 0) => (b - 1) * BAR + beat * BEAT;

// The cut. One source of truth for the shots, the cue sheet (tools/cues.py reads these lines) and the music plan.
// Every boundary sits on the beat grid.
export const T = {
  // I  拨云 — a cloud bank lit green from inside; it parts on the moon
  open: 0,
  part: bar(2, 1),          // 2.5  the cloud parts
  moon: bar(2, 3),          // 3.5  the moon stands clear; 拨开云雾 / 见明月 rise beside it
  // II 见月 — the pull-back: the moon is the cabochon of a ring
  reveal: bar(4),           // 6.0  the pull-back
  dive: bar(5),             // 8.0  turn and dive through the shank
  // III 严选 — a hundred stones, one stays
  select: bar(5, 3),        // 9.5  through the hoop into the vortex
  fall: bar(6, 2),          // 11.0 ninety-nine fall away
  one: bar(6, 3),           // 11.5 the one rises; 严选 ● 1% forms and holds
  // IV 匠心 — design · carve · set
  design: bar(8),           // 14.0
  carve: bar(9, 3),         // 17.5
  set: bar(11, 1),          // 20.5
  // V 传世 — the sunrise on the drop; the collection
  drop: bar(13),            // 24.0
  // VI 翡月荟 — the pieces orbit, gather into light, burst: the phoenix and the name in gold
  gather: bar(16),          // 30.0
  burst: bar(17, 2),        // 33.0
  word: bar(18),            // 34.0
  tag: bar(18, 3),          // 35.5
  end: DURATION,
};

// 翡月荟 tokens, measured from the client's site and lockup (see ../shared docs).
export const C = {
  gold: '#ab8d51',          // brand gold (lockup foil, measured)
  green: '#24572f',         // heading green
  paper: '#f9f6ef',         // site paper
  imperial: '#0f6723',      // client reference median, imperial jade
  cinnabar: '#b2261c',
};
