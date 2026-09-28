// The score: every musical, foley and choreography anchor, in beats (128 BPM, 64 beats = 30 s).
// Visuals and audio both read this, so a cut, a keystroke or a landing is heard on its exact frame.
import { BEAT } from './config.js';
import { pulse } from './util.js';

export const B = (b) => b * BEAT;
export const beatOf = (t) => t / BEAT;

const range = (a, b, step = 1) => {
  const r = [];
  for (let x = a; x < b - 1e-9; x += step) r.push(Math.round(x * 1e4) / 1e4);
  return r;
};
const skip = (arr, ...drop) => arr.filter((b) => !drop.some((d) => Math.abs(d - b) < 1e-6));

/* ---------------------------------------------------------------- structure */
// 01–04 intro (light table, loupe) · 05–08 drop A (agent, grid) · 09–12 drop B (evidence)
// 13–14 breakdown (aperture) · 15–16 final hit (signature). Silences before each hit.
export const IMPACTS = [16, 32, 56];
export const SILENCES = [15.5, 31.5, 55.25];

/* -------------------------------------------------------------------- drums */
export const KICKS = [
  ...range(8, 15),                       // intro groove joins as the camera settles
  ...skip(range(16, 31.5), 31),          // drop A
  ...skip(range(32, 47.5), 47),          // drop B
  56, 57, 58, 59, 60, 61,                // final hit and outro
];
export const CLAPS = [...range(9, 15, 2), ...skip(range(17, 31, 2)), ...range(33, 47, 2), 57, 59, 61];
export const HATS = [...range(8.5, 15, 1), ...range(16.5, 31, 1), ...range(32.5, 47, 1), ...range(56.5, 62, 1)];
export const HATS16 = [...range(40, 47, 0.25).filter((b) => b % 0.5 !== 0)];
export const ROLL = [...range(52, 54, 0.5), ...range(54, 55, 0.25), ...range(55, 55.25, 0.125)];

/* ------------------------------------------------------------------ harmony */
// D minor-ish, one chord per bar; bass roots in MIDI.
export const CHORDS = [
  [62, 65, 69], [62, 65, 69], [58, 62, 65], [60, 64, 67],
  [62, 65, 69], [58, 62, 65], [55, 58, 62], [57, 61, 64],
  [62, 65, 69], [58, 62, 65], [60, 64, 67], [57, 60, 64],
  [58, 62, 65], [55, 58, 62], [62, 65, 69, 72], [62, 65, 69, 74],
];
export const ROOTS = [38, 38, 34, 36, 38, 34, 31, 33, 38, 34, 36, 33, 34, 31, 38, 38];

/* -------------------------------------------------------------- choreography */
export const TABLE = { ignite0: 0.25, wave0: 1.0, lensCentre: 13.9, portal: 15.0 };
export const LOUPE_HOPS = [
  { at: 9, col: 37, row: 9, label: 'SPEND' },
  { at: 10, col: 40, row: 9, label: 'REACH' },
  { at: 11, col: 36, row: 7, label: 'DAYS' },
  { at: 12, col: 39, row: 7, label: 'VARIANTS' },
  { at: 13, col: 38, row: 10, label: 'RANKED' },
];

// Bars 5–6: the query is typed, then the agent's receipts land.
export const QUERY = { text: 'cold brew coffee', start: 16.5, step: 0.125, press: 19.0 };
export const typeTimes = () => [...QUERY.text].map((_, i) => QUERY.start + i * QUERY.step + (i % 5 === 3 ? 0.03 : 0));
export const RECEIPTS = [
  { at: 20.0, done: 20.5, icon: 'tags', label: 'Expanded keywords', detail: '9 terms', credits: 2, ms: '1.8s' },
  { at: 20.5, done: 21.5, icon: 'search', label: 'Searched Meta', detail: '50 results', credits: 12, ms: '38.4s' },
  { at: 21.0, done: 22.0, icon: 'search', label: 'Searched TikTok', detail: '38 results', credits: 10, ms: '41.9s' },
  { at: 22.0, done: 22.5, icon: 'sliders-horizontal', label: 'Checked relevance', detail: '16 of 88 kept', credits: 3, ms: '6.2s' },
  { at: 22.5, done: 23.0, icon: 'arrow-down-wide-narrow', label: 'Ranked 16 ads', detail: 'by longevity', credits: 0, ms: '0.4s' },
];

// Bars 7–8: evidence arrives on the grid, the table tilts, the camera flies to the strongest frame.
export const GRID_T = { start: 24, marks: 24.35, tilt: 24.4, fly: 27.4, lock: 30.0, end: 32 };
// Bar 9: the readout builds; the hollow SPEND slot opens into bar 10.
export const DETAIL_T = { start: 32, rows: 32.55, rowStep: 0.32, open: 35.55, end: 36 };
// Bar 10: one signal card per cut.
export const SIGNAL_CUTS = [36.0, 36.75, 37.5, 38.25, 39.0];
// Bar 11: "$0" is rejected; "Not disclosed" types; the principle lands.
export const ZERO_T = { start: 40, slam: 40.0, reject: 40.75, morph: 40.9, type: 41.55, head: 42.0, mark: 42.55, out: 43.55, end: 44 };
export const NOT_DISCLOSED = 'Not disclosed';
export const typeTimesZero = () => [...NOT_DISCLOSED].map((_, i) => ZERO_T.type + i * 0.0625);
// Bar 12: the board, then everything converges into the cuboid.
export const BOARD_T = { start: 44, title: 44.0, thumbs: 44.45, cards: 44.9, lines: 45.35, counts: 46.3, converge: 47.25, end: 48 };
// Bars 13–14: the mark assembles in 3D and locks; silence from the lock to the hit.
export const AP_T = { start: 48, spin: 49.6, plate: 49.0, frame: 49.45, recess: 50.2, settle: 55.25, end: 56 };
// Bars 15–16: signature.
export const FIN_T = { start: 56, word: 56.0, eyebrow: 56.5, tag: 57.1, tagStep: 0.1, high: 58.2, cta: 58.8, collapse: 62.8, blink: 63.4, end: 64 };

export const kickPulse = (t, decay = 0.11) => pulse(t, KICKS.map(B), decay);
export const impactPulse = (t, decay = 0.25) => pulse(t, IMPACTS.map(B), decay);
