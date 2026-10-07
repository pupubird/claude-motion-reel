// The cue sheet: every sound the picture causes, from the same timeline the picture reads (pure data, so node can
// read it too: tools/cues.mjs → audio/cues.json → tools/mix.py). A cue is
//   { t, s, db, pan, align, trim, rate, room }
//   s: a sound in audio/sfx (or a synthesised one: '@heart', '@sub'), db: gain, pan −1…1 (left…right, from where it
//   happens on screen), align: which point of the sound lands on t — 'onset' (transients), 'peak' (whooshes), 'end'
//   (risers into a hit) — trim: [from, to] s inside the file, rate: playback speed (pitch with it), room: reverb send.
// The owner's rule for this film: UI sounds are transients that click; the music carries every note.
import { TL } from './timeline.js';
import { PKEYS, PICKS } from './brand.js';

export function cues() {
  const c = [];
  const add = (t, s, db, o = {}) => c.push({ t, s, db, pan: 0, align: 'onset', room: 0.18, rate: 1, ...o });
  const N = TL.night, D = TL.day, V = TL.values, K = TL.crowd, H5 = TL.chat, U = TL.unlock, F = TL.friends;

  // I · night: a hit and a streak on frame 0; a pop and a stretch for every word; the riser; the pop
  add(0.0, '@sub', -5, { room: 0.1 });
  add(0.0, 'rim', -7, { align: 'onset', room: 0.35, pan: -0.3 });
  N.words.forEach((t, i) => {
    add(t, i % 2 ? 'pop_s2' : 'pop_s1', -11 + i * 1.2, { rate: 1.08 - i * 0.05, room: 0.25, pan: [-0.15, 0.15, 0, 0.1][i] });
    if (i) add(t + 0.02, 'stretch', -19 + i * 2.5, { trim: [0, 0.32], rate: 1.1 - i * 0.08, room: 0.3 });
  });
  add(N.words[3] + 0.14, 'pop_s2', -12, { rate: 0.95, pan: 0.2 });
  add(N.pop, 'riser', -8, { align: 'end', room: 0.3 });
  add(N.pop, 'pop_b1', -2, { room: 0.35 });
  add(N.pop, '@sub', -3, { room: 0.1 });
  add(N.pop + 0.02, 'air', -11, { trim: [0.5, 1.6], room: 0.45 });
  add(N.pop + 0.05, 'shimmer', -13, { room: 0.55 });
  [2.32, 2.55, 2.81, 3.14, 3.5].forEach((t, i) => add(t, 'pop_s2', -21 - i, { rate: 1.3 + i * 0.07, pan: [-0.5, 0.4, -0.2, 0.6, -0.4][i], room: 0.4 }));

  // II · day: Bub rises, inhales on the riser, opens its eyes on the drop
  add(D.bubIn + 0.2, 'fizz', -22, { trim: [0.3, 1.6], room: 0.4 });
  add(D.drop, 'riser', -14, { align: 'end', rate: 1.15, room: 0.25 });
  add(D.drop, 'bloop1', -7, { trim: [0, 0.2], rate: 0.85, room: 0.2 });
  add(D.drop, 'thud', -12, { room: 0.15 });

  // III · values
  add(V.extrude, 'bloop1', -6, { trim: [0, 0.22], rate: 1.0 });
  add(V.pinch, 'pop_s2', -9, { rate: 1.2 });
  add(V.typeFrom, 'typing', -11, { trim: [0, 0.6], room: 0.1, pan: 0 });
  PKEYS.forEach((k, i) => add(V.split + i * 0.045 + 0.47, 'uipop', -9 + (i % 2), { trim: [0, 0.25], rate: 0.95 + 0.04 * i, pan: [-0.45, 0, 0.45][i % 3], room: 0.15 }));
  PICKS.forEach((k, i) => {
    const t = V.taps[i], pan = [-0.45, 0.45, -0.45][i];
    add(t, 'tap1', -1, { pan, room: 0.08 });
    add(t + V.fly, 'send', -17, { trim: [0, 0.35], pan: pan * 0.5, rate: 1.1 });
    add(t + V.fly + V.flyDur, 'bloop1', -4, { trim: [0, 0.22], rate: 0.9 - i * 0.05 });
  });
  ['career', 'wealth', 'learning'].forEach((k) => add(V.drop + PKEYS.indexOf(k) * 0.05 + 0.04, 'pop_s1', -16, { rate: 1.25, pan: k === 'career' ? 0 : k === 'wealth' ? 0.45 : 0, room: 0.2 }));
  add(V.ring, 'shimmer', -18, { room: 0.4, rate: 1.1 });
  add(K.whip, 'riser', -16, { align: 'end', rate: 1.4, room: 0.2 });

  // IV · the crowd
  add(K.whip, 'whip', -4, { trim: [0, 0.5], room: 0.3 });
  add(K.whip, '@sub', -7);
  add(K.whip + 0.08, 'air', -13, { trim: [0.2, 1.4], room: 0.4 });
  add(K.land, 'thud', -13, { room: 0.25 });
  add(K.land + 0.05, 'scan', -10, { room: 0.5 });
  for (let i = 0; i < 9; i++) add(K.land + 0.06 + i * 0.12 * (1 + i * 0.08), 'tick', -17 + (i > 6 ? 2 : 0), { trim: [0, 0.06], rate: 1 + i * 0.02, room: 0.05 });
  [12.05, 12.66, 13.3].forEach((t, i) => add(t, 'air', -15, { trim: [0.3, 1.2], align: 'peak', rate: 1.1, pan: [0.3, -0.3, 0.3][i], room: 0.35 }));
  add(12.45, 'squish', -9, { trim: [0, 0.25], pan: 0.35 });
  add(13.12, 'squish', -9, { trim: [0, 0.25], pan: -0.35, rate: 1.1 });
  add(K.found, 'shimmer', -10, { room: 0.5 });
  add(K.found, 'pop_s1', -14, { rate: 0.9 });
  add(K.lock, 'lock', -6, { align: 'peak', room: 0.2, pan: 0.2 });
  add(K.lock + 0.05, '@sub', -11);
  add(K.dive[1], 'riser', -9, { align: 'end', rate: 1.2, room: 0.3 });
  add(K.dive[1], 'pop_b1', -9, { trim: [0, 0.4], rate: 0.7, room: 0.45 });
  add(K.dive[1] + 0.02, 'air', -12, { trim: [0.6, 1.5], rate: 0.8, room: 0.5 });

  // V · three days: three hits, the thread, the days
  H5.hits.forEach((t, i) => { add(t, 'thud', -5 + i * 0.5, { room: 0.12 }); add(t, '@sub', -9 + i); });
  H5.msgs.forEach((t, i) => {
    const mine = i % 2 === 1;
    if (mine) add(t, 'send', -6, { trim: [0, 0.4], pan: 0.4, room: 0.15 });
    else add(t, 'recv', -6, { trim: [0, 0.14], pan: -0.4, room: 0.15 });
    add(t + 0.03, 'tap2', -12, { pan: mine ? 0.4 : -0.4 });
  });
  H5.days.slice(1).forEach((t) => add(t, 'flip', -9, { room: 0.1 }));
  add(H5.absorb + 0.05, 'gather', -16, { trim: [0.3, 1.0], align: 'peak', room: 0.3 });
  add(H5.absorb + 0.38, 'bloop1', -10, { trim: [0, 0.22], pan: -0.4, rate: 0.85 });
  add(H5.absorb + 0.42, 'bloop1', -10, { trim: [0, 0.22], pan: 0.4, rate: 0.95 });

  // VI · the breath (the music falls away: every sound here is close and dry)
  [0, 0.12, 0.24].forEach((d, i) => add(U.ask + d, 'pop_s2', -21, { rate: 1.1 + i * 0.05, room: 0.1 }));
  add(U.you - 0.01, 'tap1', -8, { pan: 0.35, room: 0.05 });
  add(U.you + 0.02, 'padlock', -6, { pan: 0.35, room: 0.12 });
  add(23.75, 'squeak', -24, { rate: 1.2, room: 0.1 });
  [24.0, 24.75, 25.5, 26.0, 26.25].forEach((t, i) => add(t, '@heart', -15 + i * 1.2, { pan: -0.25, room: 0.08 }));
  add(U.them - 0.01, 'tap1', -8, { pan: -0.35, room: 0.05 });
  add(U.them + 0.02, 'padlock', -5, { pan: -0.35, room: 0.12 });
  add(U.touch[0] + 0.3, 'squish', -12, { room: 0.15 });
  add(U.touch[1] - 0.05, 'pop_s1', -16, { rate: 0.7, room: 0.2 });
  add(U.hold, 'stretch', -17, { trim: [0, 0.6], room: 0.25 });
  add(U.pop, 'riser', -9, { align: 'end', room: 0.3 });
  add(U.pop, 'pop_b1', -1, { room: 0.35 });
  add(U.pop, '@sub', -2);
  add(U.pop + 0.03, 'air', -11, { trim: [0.5, 1.6], room: 0.45 });

  // VII · friends
  add(F.reveal, 'shimmer', -9, { room: 0.55 });
  [0, 0.12, 0.24].forEach((d, i) => add(F.both + d, 'pop_s2', -17, { rate: 1.05 + 0.06 * i, room: 0.15 }));
  add(F.rise + 0.2, 'fizz', -14, { room: 0.45 });
  [0, 0.11, 0.22, 0.33, 0.44, 0.55, 0.66, 0.77].forEach((d, i) => add(F.rise + 0.35 + d * 1.3, 'pop_s1', -24 + (i % 3), { rate: 1.3 + 0.05 * i, pan: Math.sin(i * 2.1) * 0.6, room: 0.35 }));
  add(F.lines[0] - 0.2, 'uipop', -14, { trim: [0, 0.25] });
  add(F.mark, 'gather', -9, { align: 'end', trim: [0, 1.66], room: 0.4 });
  add(F.mark, 'riser', -12, { align: 'end', rate: 0.9, room: 0.3 });
  add(F.mark, 'impact', -8, { room: 0.4 });
  add(F.mark, 'pop_b1', -9, { trim: [0, 0.35], rate: 0.75, room: 0.3 });
  add(F.mark, '@sub', -2);
  add(F.word, 'thud', -15); add(F.word + 0.15, 'thud', -14, { rate: 0.9 });
  add(39.38, 'squeak', -22, { rate: 1.25, pan: 0.45 });
  add(F.stop, 'pop_s2', -12, { rate: 1.35, pan: 0.45 });
  add(F.stop + 0.05, 'shimmer', -14, { room: 0.5, pan: 0.2 });
  return c.sort((a, b) => a.t - b.t);
}
