// The score: every musical, voice, foley and choreography anchor, in beats (128 BPM, 64 beats = 30 s).
// Visuals and audio both read this, so a blink, a stamp or a spoken word lands on its exact frame.
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
// 01–02 intro (the Zembit wakes) · 03–04 build (four days) · 05–08 drop A (builders, ship)
// 09–12 drop B (funded, coins) · 13–14 breakdown (the mark) · 15–16 final hit (signature).
export const IMPACTS = [16, 32, 56];
export const SILENCES = [15.5, 31.5, 55.25];
export const GROOVE = (gb) => (gb >= 16 && gb < 31.5) || (gb >= 32 && gb < 47.75) || (gb >= 56 && gb < 62);

/* -------------------------------------------------------------------- voice */
// The Zembit hosts the film (ElevenLabs v3, voice "Jessica"). Line start in beats; word onsets come
// from Scribe timings of the real audio (assets/vo/meta.json).
export const VO_AT = { hello: 5.0, fourdays: 8.5, tenbuilders: 16.25, onehouse: 20.25, ship: 24.25, best: 32.25, funding: 58.0 };

/* -------------------------------------------------------------------- drums */
export const KICKS = [
  ...range(12, 15),                      // the build: four-on-the-floor arrives with DAY 02
  ...skip(range(16, 31.5), 31),          // drop A
  ...skip(range(32, 47.5), 47),          // drop B
  56, 57, 58, 59, 60, 61,                // final hit and outro
];
export const CLAPS = [...skip(range(17, 31, 2)), ...range(33, 47, 2), 57, 59, 61];
export const HATS = [...range(4.5, 8, 1), ...range(12.5, 15, 1), ...range(16.5, 31, 1), ...range(32.5, 47, 1), ...range(56.5, 62, 1)];
export const HATS16 = [...range(40, 47, 0.25).filter((b) => b % 0.5 !== 0)];
export const ROLL = [...range(29, 30, 0.5), ...range(30, 31, 0.25), ...range(31, 31.5, 0.125)];

/* ------------------------------------------------------------------ harmony */
// F major, bright and bouncy: one chord per bar (MIDI), bass roots per bar.
export const CHORDS = [
  [65, 69, 72, 76], [65, 69, 72, 76], [62, 65, 69, 72], [58, 62, 65, 69],
  [65, 69, 72, 76], [60, 64, 67, 70], [62, 65, 69, 72], [58, 62, 65, 69],
  [65, 69, 72, 76], [60, 64, 67, 70], [62, 65, 69, 72], [58, 62, 65, 69],
  [62, 65, 69, 72], [58, 62, 65, 69], [60, 64, 67, 70], [65, 69, 72, 77],
];
export const ROOTS = [41, 41, 38, 34, 41, 36, 38, 34, 41, 36, 38, 34, 38, 34, 36, 41];

/* -------------------------------------------------------------- choreography */
// Bars 1–2: the Zembit powers on in the dark, looks around, is revealed, waves, then we push into its
// visor and it blinks — the closed eyes become the lime line that opens onto the house.
export const HELLO = {
  power: 0.5, lookL: 1.25, lookR: 2.0, lookC: 2.75, blink: 3.1,
  dolly0: 3.4, dolly1: 6.1, lights0: 3.4, lights1: 5.2,
  tilt: 4.1, arm: 4.8, wave0: 5.15, wave1: 6.55, happy0: 5.0, happy1: 6.5,
  pill: 5.08, pillOut: 6.7, sparkles: [5.35, 5.7, 6.05],
  lookCam: 6.6, push0: 6.85, push1: 7.7, close0: 7.42, close1: 7.7, handoff: 8.0,
};

// Bars 3–4: the closed eyes slide into one lime line; the line opens like an eyelid onto the house,
// "FOUR DAYS." rises word by word with the voice, filled with footage that jumps a day on each tick.
export const FOUR = {
  merge: 8.18, stretch: 8.42, open0: 8.42, open1: 8.95,
  meta: 9.85, days: [10.0, 12.0, 13.0, 14.0], clips: ['day1', 'day2', 'day3', 'day4'],
  inhale: 15.0, hold: 15.5, out: 16.0,
};

// Bars 5–6: the rails spring apart into the grid's guides; ten seats pop in, the tenth is yours.
// The cards flip into one video wall ("One house."), close their gaps, and open to full frame.
export const GRID = { in0: 16.0, stagger: 0.1, flip0: 20.0, flipCol: 0.07, flipRow: 0.035, flipDur: 0.36, close0: 21.9, close1: 22.9, full0: 22.9, full1: 23.9 };

// Headlines (bars 5–10): one display line at the top-left; each word enters on its spoken onset and a
// lime pill glides from keyword to keyword. `key` is the keyword's index.
export const HEADLINES = [
  { line: 'tenbuilders', words: ['TEN', 'BUILDERS.'], key: 1 },
  { line: 'onehouse', words: ['ONE', 'HOUSE.'], key: 1 },
  { line: 'ship', words: ['YOU', 'SHIP', 'SOMETHING', 'REAL.'], key: 3 },
  { line: 'best', words: ['WE', 'BACK', 'THE', 'BEST.'], key: 3 },
];

// Bars 7–8: the house darkens behind the line; the six real products of Hackerhouse 1.0 are dealt
// onto the table; a lime scan passes over them. Bars 9–10: two are stamped FUNDED on the drop, the
// others step back, the two come forward — and their stamps turn over into coins that toss upward.
export const COHORT = {
  dim0: 24.0, dim1: 24.9, deal0: 25.5, dealStep: 0.4, dealDur: 0.55,
  scan0: 29.9, scan1: 31.35,
  stamps: [32.0, 32.25], dimOthers: 32.1, reflow0: 33.9, reflow1: 35.1, caption: 35.3,
  coin0: 36.4, coin1: 37.0, toss0: 37.9, toss1: 39.4, out0: 38.6, out1: 39.6,
};

// Bars 13–14: the stacks melt into the mark's base, the roof piece drops on, the trend line is left
// as the negative-space channel; construction marks; then a glossy 3D spin that shrinks and locks flat.
export const MARK = { melt0: 48.0, melt1: 48.75, drop0: 48.55, drop1: 49.3, lineOut: 49.3, build0: 49.75, build1: 51.35, spin0: 51.4, spin1: 55.05, lock: 55.25, size: 360 };

// Bars 15–16: pull back out of the visor (the mark is on it); the mark leaves the visor for the
// lockup as the eyes come back on and follow it; "Funding builders!"; a wave, a wink; lights out,
// and last, the eyes — the film ends the way it began.
export const SIGN = {
  pull0: 56.0, pull1: 57.7, lights0: 56.1, lights1: 57.2, fly0: 57.3, fly1: 57.85, eyesOn: 57.36,
  word0: 57.9, word1: 58.35, eyebrow: 58.3, url: 59.55, arrow0: 59.7, arrow1: 60.3,
  wave0: 59.35, wave1: 61.25, happy0: 59.3, happy1: 61.3, wink: 62.0, sparkles: [58.0, 59.0, 60.0, 61.0],
  dim0: 62.85, dim1: 63.4, off0: 63.42, off1: 63.72,
};

export const kickPulse = (t, decay = 0.11) => pulse(t, KICKS.map(B), decay);
export const impactPulse = (t, decay = 0.25) => pulse(t, IMPACTS.map(B), decay);
// Seconds since a voice line's word onset (negative before it).
export const voT = (line, t) => t - B(VO_AT[line]);
