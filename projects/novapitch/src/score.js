// The score: every musical, voice, foley and choreography anchor, in beats (120 BPM → 1 beat = 30 frames).
// Visuals and audio both read this. The music is take t6 re-cut on the bar grid to these 30 bars (tools/recut.py):
// 120.00 BPM, every section downbeat within 21 ms of its bar line (tools/beats.py).
// Reading time: every title stays fully legible for 0.8 s + 13 characters a second (never under 1.8 s) before
// anything replaces it, so it can be read, not just seen.
import { BEAT } from './config.js';
import { pulse } from './util.js';
import { MUSIC } from './assets.js';

export const B = (b) => b * BEAT;
// Anchors are read-only and strict: reading one that does not exist throws. A stale name would otherwise read as
// undefined and turn every seg() on it into NaN — a silent timing bug across the whole frame.
const strict = (name, o) => new Proxy(Object.freeze(o), {
  get(t, k) {
    if (typeof k === 'string' && !(k in t) && k !== 'toJSON' && k !== 'then') throw new Error(`score: ${name}.${k} is not an anchor`);
    return t[k];
  },
});

/* ---------------------------------------------------------------- structure */
// bars 1–3 void (near silence) · 4 DROP · 4–24 groove · 25–26 breakdown · 27 final hit · 28–30 tail
export const DROPS = [12, 56, 72, 92, 104];       // section hits the lens answers: nova, room, signal, payoff, tile

/* ------------------------------------------------------------ act I · silence */
export const SEND = strict('SEND', {
  pull0: 0.6, pull1: 5.4,         // powers of ten: from our slide, filling the frame, out to the galaxy of decks
  dark0: 6.0, dark1: 9.2,         // lights out: darkness closes in from the arms; ours is the last light
});
export const TITLE1 = strict('TITLE1', { w1: 4.0, w2: 5.0, dim0: 10.0, dim1: 11.2 });
export const DOTS = strict('DOTS', { on: 7.5, stop: 9.75, off: 10.5 });

/* ----------------------------------------------------------- act II · ignition */
export const NOVA = strict('NOVA', { hit: 12.0, wave0: 12.0, wave1: 16.0, push0: 18.0, form0: 18.5, form1: 21.0 });
// the plain-spoken titles: name the product, then its four steps (the site's own How it works)
export const MEET = strict('MEET', { in: 19.0, out: 24.0 });

/* ------------------------------------------------- act III · upload · the twin */
export const STEP = strict('STEP', { s1: 24.25, s2: 30.25, s3: 44.25, out: 50.6 });   // one title bar: 1 → 2 → 3, the badge rolling
// the eight pages spawn beside the lens on eighth notes and are swallowed by the orb 1.25 beats later
export const READ = strict('READ', { spawn0: 24.75, step: 0.5, fly: 1.25 });
export const absorbAt = (k) => READ.spawn0 + k * READ.step + READ.fly;
export const KB = strict('KB', { panel: 30.5, rows: [31.0, 31.75, 32.5], fold0: 40.0, fold1: 41.0 });
export const TWIN = strict('TWIN', { gather: 40.5, riser0: 42.0 });          // the orb gathers itself for the fire

/* ---------------------------------------------------------- act IV · one link */
// fire → point: the orb gulps and implodes into a point of light; the point opens into the line, the line into the field
export const LINK = strict('LINK', { fire: 44.0, point: 45.0, field0: 45.5, type0: 46.0, type1: 47.0, copy: 47.5, fold: 51.0, launch: 51.5, arrive: 55.5 });

/* ------------------------------------------------------ act V · conversation */
export const ROOM = strict('ROOM', {
  in: 56.0,                       // the room holds, undimmed, before anything is written over it
  ask: 58.0, type0: 58.5, type1: 60.0, send: 60.5, dots: 61.0,
  vo: 62.0,                       // the Digital Twin's line starts on beat 3 of bar 16
  answers: 62.0, asYou: 63.75,
  pill: 68.1,                     // on "slide five" (VO + 6.1 beats, from the Scribe word timings)
  jump: 68.5, zoom0: 68.5, zoom1: 70.0,
});

/* ---------------------------------------------------------- act VI · signal */
export const SIGNAL = strict('SIGNAL', { in: 72.0, see: 73.0, heat0: 73.5, heat1: 75.5, topics: 79.0, interest: 83.5, home0: 90.0, home1: 92.0 });

/* ------------------------------------------------------ act VII · payoff */
// pre: the 3D shot fades up under the signal's folding card; w1/w2: the title's two lines ("silence." lands on bar 25, where the groove drops to the breakdown);
// race1: the line reaches home; the lit field swirls into the galaxy until collapse0; sign0 → pen0: the collapsed
// point travels to the N's first stroke; pen0 → sign1: it writes the N
export const PAYOFF = strict('PAYOFF', { pre: 90.75, in: 92.0, w1: 92.5, w2: 95.0, race1: 97.0, collapse0: 101.5, collapse1: 102.0, sign0: 102.0, pen0: 102.35, sign1: 103.55 });

/* ------------------------------------------------------ act VIII · signature */
export const SIGN = strict('SIGN', { tile: 104.0, word: 105.75, tag: 106.5, url: 107.5, cta: 108.0, glint: 110.0, fade0: 117.5, fade1: 120.0 });

// the score's real hits (syncopated: beat 1 and the 2-and through the groove), measured, not assumed
export const hitPulse = (t, decay = 0.12) => pulse(t, MUSIC.kicks, decay);
