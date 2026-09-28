// The score: every musical, voice, foley and choreography anchor, in beats (120 BPM → 1 beat = 30 frames).
// Visuals and audio both read this. The music is take t6 (assets/music/score.mp3): measured 120.00 BPM, grid phase
// +8 ms, section hits within 21 ms of every bar line below (tools/beats.py).
import { BEAT } from './config.js';
import { pulse } from './util.js';
import { MUSIC } from './assets.js';

export const B = (b) => b * BEAT;

/* ---------------------------------------------------------------- structure */
// bars 1–3 void (near silence) · 4 DROP · 4–16 groove · 17–18 breakdown · 19 final hit · 20–21 tail
export const DROPS = [12, 40, 52, 64, 72];       // section hits the lens answers

/* ------------------------------------------------------------ act I · silence */
export const SEND = {
  pull0: 0.6, pull1: 5.4,         // powers of ten: from our slide, filling the frame, out to the galaxy of decks
  dark0: 6.0, dark1: 9.2,         // lights out: darkness closes in from the arms; ours is the last light
};
export const TITLE1 = { w1: 4.0, w2: 5.0, dim0: 10.0, dim1: 11.2 };
export const DOTS = { on: 7.5, stop: 9.75, off: 10.5 };

/* ----------------------------------------------------------- act II · ignition */
export const NOVA = { hit: 12.0, wave0: 12.0, wave1: 15.0, push0: 15.5, form0: 16.0, form1: 18.5 };

/* ---------------------------------------------------------- act III · it reads */
// the eight pages spawn beside the lens on eighth notes and are swallowed by the orb 1.25 beats later
export const READ = { spawn0: 20.0, step: 0.5, fly: 1.25 };
export const absorbAt = (k) => READ.spawn0 + k * READ.step + READ.fly;
export const KB = { panel: 24.25, rows: [24.5, 25.5, 26.5, 27.25], fold0: 28.0, fold1: 29.0 };
export const TWIN = { title: 28.25, riser0: 30.0 };
// the plain-spoken titles: name the product, then its four steps (the site's own How it works)
export const MEET = { in: 16.5, out: 19.6 };
export const STEP = { s1: 20.25, s2: 24.25, out: 31.6 };

/* ---------------------------------------------------------- act IV · one link */
export const LINK = { fire: 32.0, field0: 32.25, title: 32.5, type0: 32.75, type1: 34.0, copy: 34.5, fold: 35.5, launch: 36.0, arrive: 39.5 };

/* ------------------------------------------------------ act V · conversation */
export const ROOM = {
  in: 40.0, ask: 40.25, type0: 40.75, type1: 42.5, send: 43.0, dots: 43.5,
  vo: 44.0,                       // the Digital Twin's line starts on the bar
  answers: 44.0, asYou: 46.5,
  pill: 50.1,                     // on "slide five"
  jump: 50.5, zoom0: 50.5, zoom1: 52.0,
};

/* ---------------------------------------------------------- act VI · signal */
export const SIGNAL = { in: 52.0, see: 52.5, heat0: 52.25, heat1: 54.0, topics: 56.0, req: 58.0, approve: 59.0, interest: 60.0, home0: 62.0, home1: 64.0 };

/* ------------------------------------------------------ act VII · payoff */
export const PAYOFF = { in: 64.0, w1: 64.5, w2: 68.0, collapse0: 70.0, collapse1: 70.5, sign0: 70.5, sign1: 71.8 };

/* ------------------------------------------------------ act VIII · signature */
export const SIGN = { tile: 72.0, word: 73.75, tag: 74.5, url: 75.5, cta: 76.0, glint: 78.0, fade0: 81.0, fade1: 84.0 };

// the score's real hits (syncopated: beat 1 and the 2-and through the groove), measured, not assumed
export const hitPulse = (t, decay = 0.12) => pulse(t, MUSIC.kicks, decay);
