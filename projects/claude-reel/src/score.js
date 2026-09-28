// The score: every musical + foley event, in beats. Visuals and audio both read this,
// so a cut, a bounce or a keystroke lands on the exact sample it is heard.
import { BEAT } from './config.js';
import { pulse } from './util.js';

const range = (a, b, step = 1) => {
  const r = [];
  for (let x = a; x < b - 1e-9; x += step) r.push(Math.round(x * 1e4) / 1e4);
  return r;
};
const skip = (arr, ...drop) => arr.filter((b) => !drop.includes(b));

// Drums. Beat 15 and 27 are deliberate silences before the two big hits.
export const KICKS = [...skip(range(4, 27), 15), 28];
export const CLAPS = skip(range(5, 27, 2), 15);
export const HATS = skip(range(4.5, 27, 1), 14.5, 15.5, 26.5);
export const HATS16 = range(20, 26.5, 0.25).filter((b) => b % 0.5 !== 0);
export const ROLL = [...range(25, 26, 0.25), ...range(26, 26.875, 0.125)];
export const IMPACTS = [4, 16, 28];

// Harmony: one chord per bar (A minor), bass roots in MIDI.
export const CHORDS = [
  [57, 60, 64], [57, 60, 64], [53, 57, 60], [55, 60, 64],
  [55, 59, 62], [53, 57, 60], [56, 59, 64], [57, 60, 64, 71],
];
export const ROOTS = [33, 33, 29, 36, 31, 29, 28, 33];

// Choreography anchors shared with foley.
export const TYPE_CAPTION = { text: 'motion is emotion.', start: 4.35, end: 5.45 };
export const EASE_MOTION = { start: 0.06, len: 0.78 }; // within each beat of bar 6
export const BOUNCE_CONTACTS = [1 / 2.75, 2 / 2.75, 2.5 / 2.75, 1].map((u) => 22 + EASE_MOTION.start + EASE_MOTION.len * u);
export const MONTAGE_CUTS = [24, 24.5, 25, 25.5, 26, 26.5, 27];
export const SCRAMBLE = { start: 28.3, end: 29.1 };
export const SKILL_POPS = range(28.9, 30.4, 0.25);
export const FINAL_BLIP = 31.72;

export const sec = (b) => b * BEAT;
export const beatOf = (t) => t / BEAT;

const KICK_T = KICKS.map(sec);
const IMPACT_T = IMPACTS.map(sec);
export const kickPulse = (t, decay = 0.11) => pulse(t, KICK_T, decay);
export const impactPulse = (t, decay = 0.25) => pulse(t, IMPACT_T, decay);
