import { cubicBezier } from './util.js';
import { LANG, T } from './copy.js';
// almost friends — brand tokens. Direction A, "Outside Your Bubble" (research/research-vibe.md §4–5): a daylight
// sky, white UI, iridescent film accents; ink on light only. Contrast pairs from the vibe report (WCAG 2.2).
export const C = {
  sky: '#DCEFFF',        // background, top
  peach: '#FFE8DA',      // background, bottom
  ink: '#0B1B3F',        // all type on light (14.3:1 on sky and peach)
  inkSoft: '#7A859B',    // the wordmark's "almost": solid, not ink at 50 % (3.2:1 on sky, display sizes only)
  blue: '#1D4FF0',       // brand: sent bubbles, primary actions (white on blue 6.1:1)
  white: '#FFFFFF',
  magenta: '#FF6FAE',    // film accent
  teal: '#3EE0C5',       // film accent
  gold: '#FFC93C',       // the Unlock button (ink on gold 11.0:1)
};
export const BG = C.sky;
export const INK = C.ink;

// Display: Bricolage Grotesque (opsz 12–96, wght 200–800, wdth 75–100). UI: Figtree (stands in for the system font
// in the mock app). Emoji from Noto Color Emoji (COLRv1). Chinese (the zh cut): Noto Sans SC, the Source Han Sans
// design, variable 100–900, so every weight the film asks for is drawn, never synthesised; it follows the emoji face
// in the stack because it carries monochrome emoji of its own. Latin, digits and the brand keep their faces in every
// cut. All SIL OFL 1.1.
const HAN = LANG === 'en' ? '' : ', "Noto Sans SC Variable"';
export const FONTS = {
  display: `"Bricolage Grotesque", "Noto Color Emoji"${HAN}`,
  ui: `"Figtree", "Noto Color Emoji"${HAN}`,
};

// The mock app's UI tokens (light mode, iOS 26 grammar: research/research-ui.md §4)
export const UI = {
  ink: C.ink, ink2: 'rgba(11,27,63,0.58)', ink3: 'rgba(11,27,63,0.38)', hair: 'rgba(11,27,63,0.09)',
  bg: '#FFFFFF', chipIdle: '#FFFFFF', chipStroke: 'rgba(11,27,63,0.14)',
  inBubble: '#EEF1F8', outBubble: C.blue, card: '#F6F8FC',
};

// Six life priorities, one hue each, used everywhere the priority appears (chips, orbs, rings, the crowd, the circle).
// `text` is the label colour that clears 4.5:1 on the fill.
export const P = {
  family: { label: T.priority.family, emoji: '\u{1F468}‍\u{1F469}‍\u{1F467}', color: '#FF7A59', text: C.ink },
  career: { label: T.priority.career, emoji: '\u{1F4BC}', color: '#3B6CFF', text: '#FFFFFF' },
  wealth: { label: T.priority.wealth, emoji: '\u{1F4B0}', color: '#17B890', text: C.ink },
  health: { label: T.priority.health, emoji: '\u{1F4AA}', color: '#FF6FAE', text: C.ink },
  learning: { label: T.priority.learning, emoji: '\u{1F4DA}', color: '#1FB5E5', text: C.ink },   // v4: was Faith (Malaysia's Content Code §8.7 keeps religion out of ads; its violet read as "AI purple")
  adventure: { label: T.priority.adventure, emoji: '\u{1F3D4}️', color: '#FFB224', text: C.ink },
};
export const PKEYS = Object.keys(P);

// The film's motion (v3; owner: "not energetic enough… rework the easing for the whole video"). Springs are stiffer
// and bouncier than Material's defaults, and every timed move uses Material 3's emphasized curves (leave fast, land
// soft) instead of a symmetric slow-in/slow-out, which read as floaty. Unit mass; overshoot in the comments.
export const SPRING = {
  pop: { stiffness: 1100, damping: 0.5 },     // 16 %, ~0.22 s: words, chips, badges, landings
  snap: { stiffness: 1800, damping: 0.62 },   // 8 %, ~0.12 s: presses, ticks, small UI
  settle: { stiffness: 620, damping: 0.7 },   // 4.6 %: cards, sheets
  glide: { stiffness: 340, damping: 0.76 },   // 2.4 %: big moves
  fx: { stiffness: 1600, damping: 1 },        // colour, opacity: no overshoot
  wobble: { stiffness: 240, damping: 0.38 },  // 27 %: bubbles and contact
};
export const MOVE = {
  go: cubicBezier(0.2, 0, 0, 1),              // emphasized: camera, phone, screens
  in: cubicBezier(0.05, 0.7, 0.1, 1),         // emphasized decelerate: entrances
  out: cubicBezier(0.3, 0, 0.8, 0.15),        // emphasized accelerate: exits
  whip: cubicBezier(0.6, 0, 0.1, 1),          // a whip: holds a beat, snaps, lands
};
