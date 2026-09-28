// Global constants shared by visuals, soundtrack and renderer.
// Design space is 1920×1080; S scales the render (S = 2 → a 3840×2160 master) without touching layout.
const q = new URLSearchParams(typeof location !== 'undefined' ? location.search : '');
export const S = Number(q.get('scale') || 1);
export const W = 1920;
export const H = 1080;
export const FPS = 60;
export const BPM = 120;
export const BEAT = 60 / BPM;          // 0.5 s = 30 frames: every beat lands on a frame boundary
export const BAR = BEAT * 4;           // 2 s
export const BARS = 21;
export const DURATION = BAR * BARS;    // 42 s
export const FRAMES = Math.round(DURATION * FPS); // 2520

// Nova Pitch tokens, from relatefy/frontend/app/relatefy.css (the W6 "Electric Cobalt → Cyan" palette fence,
// dark theme) and components/marketing/marketing.css.
export const C = {
  page: '#010208',          // --ink-indigo, the dark page (rgb 1,2,8)
  white: '#FFFFFF',
  text2: 'rgba(255,255,255,0.78)',   // --text-secondary
  text3: 'rgba(255,255,255,0.48)',   // --text-tertiary
  card: 'rgba(255,255,255,0.05)',    // --bg-card
  subtle: 'rgba(255,255,255,0.08)',  // --bg-subtle
  hair: 'rgba(255,255,255,0.08)',    // --border-card
  hairHi: 'rgba(255,255,255,0.10)',  // --card-shadow inset hairline
  control: 'rgba(255,255,255,0.24)', // --border-control
  iris300: '#93B5FF',       // --text-brand (dark)
  iris400: '#5C8DFF',       // --accent-brand (dark)
  iris500: '#2E6BFF',       // electric cobalt
  iris600: '#2563EB',       // brand / primary
  iris700: '#1D4ED8',
  iris100: '#DBE7FF',
  cyan300: '#7DE3F4',       // --violet-300 (the accent slot is cyan)
  cyan400: '#34D3EB',
  cyan500: '#22C5EB',
  ocean200: '#92EBFF',
  orchid300: '#E9C9F0',
  lime: '#C3FF1F',          // --text-positive (dark): the live / interested dot
  brandSoft: 'rgba(46,107,255,0.24)', // --accent-brand-soft (dark)
  ink800: '#21201F',
};
// --gradient-brand: 135deg iris-600 → cyan-500 (buttons, the mark's tile)
export const GRAD_BRAND = [[0, C.iris600], [1, C.cyan500]];
// --gradient-text: 135deg iris-400 → cyan-300 → cyan-400 (the hero's second line)
export const GRAD_TEXT = [[0, C.iris400], [0.5, C.cyan300], [1, C.cyan400]];

// Plus Jakarta Sans (display, 700/800) and Inter (UI/body): the product's next/font pair.
export const FONTS = { display: '"Plus Jakarta Sans"', sans: '"Inter"' };
