// Every time the picture and the sound share, in film seconds, on the score's grid (take s3, 120 BPM: a beat is 0.5 s).
// The picture reads these; tools/cues.mjs reads the film's events (film.events()), which are built from these, so a
// re-timed beat takes its sound with it.
export const TL = {
  // I · night — "Make friends / outside / your bubble." inside a bubble in the dark, one word a beat
  night: { start: 0, words: [0.0, 0.5, 1.0, 1.5], pop: 2.0 },
  // II · daylight — the flood of light, the line re-forms in ink, Bub floats up and inhales on the riser
  day: { flood: [2.0, 2.45], settle: 2.75, bubIn: 3.9, riser: 5.5, drop: 6.0 },
  // III · values — Bub's droplet becomes the question, the question splits into six chips, three taps, three merges
  values: { hi: 6.0, extrude: 6.15, pinch: 6.42, typeFrom: 6.5, split: 7.0, taps: [8.0, 8.5, 9.0], fly: 0.12, flyDur: 0.34, drop: 9.25, ring: 9.5 },
  // IV · the crowd — whip out on the downbeat, the scan, two nos and a yes, the lock, the dive
  crowd: { whip: 10.0, land: 10.6, scan: [10.6, 12.2], nos: [12.2, 13.0], found: 13.8, lock: 14.25, dive: [15.0, 15.85], switch: 15.85 },
  // V · three days — the rules as three hits, then the conversation while the days turn
  chat: { start: 16.0, hits: [16.0, 16.5, 17.0], msgs: [17.4, 18.1, 18.8, 19.5, 20.2], days: [17.5, 19.0, 20.5], absorb: 21.8 },
  // VI · the breath — ready to meet? you unlock; the long wait; they unlock; the two bubbles touch
  unlock: { start: 22.0, ask: 22.15, you: 22.75, wait: [23.2, 26.5], them: 26.5, touch: [26.65, 27.35], hold: 27.35, pop: 28.0 },
  // VII · friends — the reveal, the foam, the gather, the mark
  friends: { reveal: 28.15, both: 28.5, rise: 31.0, lines: [31.5, 32.5], gather: [35.6, 37.8], mark: 38.0, word: 38.4, stop: 40.0 },
  end: 44.0,
};
