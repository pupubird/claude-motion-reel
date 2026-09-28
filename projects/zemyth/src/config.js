// Global constants shared by visuals, soundtrack and renderer.
export const W = 1920;
export const H = 1080;
export const FPS = 60;
export const BPM = 128;
export const BEAT = 60 / BPM;          // 0.46875 s
export const BAR = BEAT * 4;           // 1.875 s
export const BARS = 16;
export const DURATION = BAR * BARS;    // 30.000 s
export const FRAMES = Math.round(DURATION * FPS); // 1800

// Zemyth brand tokens, from Zemyth-website/BRAND.md (the client's Logo Guidelines + Moodboard).
// Black + electric lime carry everything; white for type; the extension accents are not used.
export const C = {
  lime: '#EEFE5E',        // primary electric lime, RGB 238 254 94
  limeDeep: '#D8E20E',    // wordmark.svg fill
  black: '#000000',
  ink: '#111414',         // near-black: card surfaces
  inkLift: '#1A1E1E',
  white: '#FFFFFF',
  gray: '#E5E7EB',
  dim: 'rgba(255,255,255,0.56)',
  faint: 'rgba(255,255,255,0.32)',
  trace: 'rgba(255,255,255,0.12)',
};

// Display: Refinery 95 Bold, from the client's ZEMITH_Font_Family (the wide, techy face the brand
// book asks for). Secondary: Inter (brand book). Labels: Blender Pro, also in ZEMITH_Font_Family.
export const FONTS = {
  display: '"Refinery 95"',
  sans: '"Inter"',
  label: '"Blender Pro"',
};

// Layout: 120 px side margins, 12-column grid, rounded cards (brand: 20–32 px radii).
export const SAFE = { x: 120, top: 108, bottom: 108 };
export const CONTENT_W = W - SAFE.x * 2;   // 1680
export const RADIUS = { card: 32, tile: 28, small: 20 };

export const HUD_ID = { name: 'ZEMYTH', sub: 'MOTION REEL ’26 · EVERY FRAME RENDERED IN CODE' };

// One chapter per two bars; drives the HUD caption (title + the technique on screen).
export const CHAPTERS = [
  { n: '01', title: 'HELLO, WORLD', sub: 'procedural 3D character · clay shader · SDF eye rig' },
  { n: '02', title: 'FOUR DAYS', sub: 'blink match cut · video in type · VO-locked kinetics' },
  { n: '03', title: 'TEN BUILDERS', sub: 'guide rails → grid · card-flip video wall' },
  { n: '04', title: 'SHIP IT', sub: 'syllable-synced type · card deal' },
  { n: '05', title: 'FUNDED', sub: 'stamp physics · FLIP re-flow · stamp → coin' },
  { n: '06', title: 'FUNDING', sub: '357 instanced coins · analytic physics · dolly zoom' },
  { n: '07', title: 'THE MARK', sub: 'chart → negative space → logo · pixel-locked 3D' },
  { n: '08', title: 'SIGNATURE', sub: 'visor pull-out · lockup · wink' },
];
