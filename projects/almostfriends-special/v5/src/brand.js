import { cubicBezier } from './util.js';
// almost friends — the special edition's tokens. The brand is the released film's (projects/almostfriends/src/brand.js:
// a daylight sky, ink type, the blue, iridescent film accents); the special edition adds the night it opens in
// ("inside your bubble": the brand's ink taken toward black) and the light that carries the camera.
export const C = {
  sky: '#DCEFFF',        // daylight, top
  peach: '#FFE8DA',      // daylight, bottom
  ink: '#0B1B3F',        // type on light
  inkSoft: '#7A859B',    // "almost" in the wordmark
  blue: '#1D4FF0',       // brand: your bubbles, primary actions
  white: '#FFFFFF',
  magenta: '#FF6FAE',    // film accents
  teal: '#3EE0C5',
  gold: '#FFC93C',       // unlock
  night: '#050B1E',      // inside your bubble: the ink, deeper
  nightHi: '#16264F',    // the night's lit side
};

// Display: Bricolage Grotesque (opsz 12–96, wght 200–800, wdth 75–100). UI: Figtree. Emoji: Noto Color Emoji (COLRv1).
// All SIL OFL 1.1, the same faces as the released film.
export const FONTS = {
  display: '"Bricolage Grotesque", "Noto Color Emoji"',
  ui: '"Figtree", "Noto Color Emoji"',
};

// Six life priorities, one hue each (as in the released film)
export const P = {
  family: { label: 'Family', emoji: '\u{1F468}‍\u{1F469}‍\u{1F467}', color: '#FF7A59' },
  career: { label: 'Career', emoji: '\u{1F4BC}', color: '#3B6CFF' },
  wealth: { label: 'Wealth', emoji: '\u{1F4B0}', color: '#17B890' },
  health: { label: 'Health', emoji: '\u{1F4AA}', color: '#FF6FAE' },
  learning: { label: 'Learning', emoji: '\u{1F4DA}', color: '#1FB5E5' },
  adventure: { label: 'Adventure', emoji: '\u{1F3D4}️', color: '#FFB224' },
};
export const PKEYS = Object.keys(P);
export const PICKS = ['family', 'adventure', 'health'];      // what "you" pick, in tap order

// One energetic motion set for the whole film (the released film's v3 set: leave fast, land soft, bouncy springs)
export const SPRING = {
  pop: { stiffness: 1100, damping: 0.5 },
  snap: { stiffness: 1800, damping: 0.62 },
  settle: { stiffness: 620, damping: 0.7 },
  glide: { stiffness: 340, damping: 0.76 },
  fx: { stiffness: 1600, damping: 1 },
  wobble: { stiffness: 240, damping: 0.38 },
  jelly: { stiffness: 420, damping: 0.28 },
};
export const MOVE = {
  go: cubicBezier(0.2, 0, 0, 1),
  in: cubicBezier(0.05, 0.7, 0.1, 1),
  out: cubicBezier(0.3, 0, 0.8, 0.15),
  whip: cubicBezier(0.6, 0, 0.1, 1),
  sine: cubicBezier(0.37, 0, 0.63, 1),
};
