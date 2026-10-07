// The foley cue sheet, built from the picture's own anchors (src/score.js), so sound and picture cannot drift.
//   node projects/<film>/tools/cues.mjs > projects/<film>/audio/cues.json
// Each cue: { t (s), kind, gain (dB), pan (−1…1), …options } for tools/foley.py. v3: nothing is pitched — every UI
// sound is a click, tap, tick, pop, swoosh, thump or impact (owner: "no more ding ding dong dong"); the score
// carries the melody. A 'quiet' entry is a window foley.py keeps empty (it fails the render if a tail rings into it).
import { HOOK, NAME, ONB, MATCH, CHAT, UNLOCK, FOAM, GROW, MARK } from '../src/score.js';

const cues = [];
// a cue a hair before frame 0 (an anchor that starts the film already moving) sounds on frame 0; earlier is a bug
const add = (t, kind, o = {}) => {
  if (t < -0.5) throw new Error(`cue ${kind} at ${t}s is before the film starts`);
  cues.push({ t: Math.round(Math.max(0, t) * 1e4) / 1e4, kind, ...o });
};
// levels (dB) by role, so a whole family moves together
// (levels set by an audit against the score in each family's own band: a UI click must clear the music's hats and
// claps, or it doesn't click. Letter and word ticks are texture: flagged so the audit reports them on their own)
const G = { impact: 0, impactS: -4, popBig: -2, pop: -4, spray: -10, whoosh: -7, swish: -8, riser: -8, tap: 0,
  click: -4, send: -7, recv: -6, tick: -6, tickQuiet: -16, typing: -12, air: -15 };

// I · the hook (v6: one bar; research-hooks.md C1 "Knock knock" with the owner's words): knock, knock, knock on frame 0,
// 0.25 and 0.5 s — a rubbery thwup each, one line landing with each ("How to" / "make more" / "friends"), the first with
// a small impact for the onset and a crisp pip as the eyes snap open, the last with a dry tock; the eyes flick up to
// "friends" and back; the push (a rubber creak, the riser); the black spot (a tighter creak); a breath; the tear
add(HOOK.knock1, 'impact', { size: 'small', gain: G.impactS - 2 });
add(HOOK.knock1, 'thwup', { gain: 0 });
add(HOOK.knock1 + 0.09, 'tick', { gain: G.tick - 2 });                        // the eyes snap open
add(HOOK.knock2, 'impact', { size: 'small', gain: G.impactS - 4 });         // the three knocks hit evenly
add(HOOK.knock2, 'thwup', { gain: 1 });
add(HOOK.knock3, 'thwup', { gain: 1 });
add(HOOK.knock3, 'click', { gain: G.click });                                  // "friends" lands: the tock
add(HOOK.look, 'swish', { dur: 0.08, gain: G.swish - 10, pan: 0.1 });         // the eyes flick up…
add(HOOK.back, 'tick', { gain: G.tick - 4 });                                  // …and back to you
add(HOOK.push, 'creak', { dur: HOOK.spot - HOOK.push, gain: -4 });
add(HOOK.push, 'riser', { dur: HOOK.pop - HOOK.push, gain: G.riser - 2 });
add(HOOK.spot, 'creak', { dur: HOOK.pop - HOOK.spot - 0.05, gain: -6 });
add(HOOK.brace, 'air', { dur: HOOK.pop - HOOK.brace, gain: G.air + 4 });      // a breath before the drop
add(HOOK.pop, 'impact', { gain: G.impact });
add(HOOK.pop, 'pop', { size: 'big', gain: G.popBig + 1 });
add(HOOK.pop + 0.02, 'spray', { gain: G.spray + 2 });
add(HOOK.pop + 0.05, 'whoosh', { dur: 0.35, gain: G.whoosh, pan: -0.4 });    // Bub bursts through past the lens

// II · the name (v4): the droplets inflate into the mark; letters; the dive through the mark (the wall pops); the
// value word by word, held; the icon; the tap
add(NAME.icon, 'swish', { dur: 0.2, gain: G.swish - 4 });
add(NAME.icon + 0.2, 'impact', { size: 'small', gain: G.impactS });
add(NAME.icon + 0.2, 'pop', { gain: G.pop });
'almost'.split('').forEach((_, i) => add(NAME.name + i * 0.035, 'tick', { gain: G.tickQuiet, texture: 1 }));
// "friends" is carried over from the hook; only ".ai" pops (hook.js CARRY_END = NAME.name + 0.1 + 6 · 0.005)
'.ai'.split('').forEach((_, i) => add(NAME.name + 0.13 + 0.02 + i * 0.05, 'tick', { gain: G.tickQuiet, texture: 1 }));
add(NAME.dive, 'whoosh', { dur: 0.3, gain: G.whoosh + 2 });
add(NAME.dive + 0.16, 'pop', { gain: G.pop - 2 });                           // through the wall
[0.04, 0.14, 0.24, 0.34, 0.46, 0.58].forEach((dt) => add(NAME.value + dt, 'click', { gain: G.click - 12, texture: 1 }));
[0, 0.14, 0.28].forEach((dt, i) => add(NAME.value + 1.2 + dt, 'pop', { gain: G.pop - 4, pan: (i - 1) * 0.4 }));   // hook.js VALUE_TAGS: three tags
add(NAME.exit - 0.15, 'swish', { dur: 0.3, gain: G.swish - 2, pan: -0.4 }); // Bub flies to the icon
add(NAME.exit, 'pop', { gain: G.pop - 2 });                                   // the icon
add(NAME.tap, 'tap', { gain: G.tap });
add(NAME.open, 'whoosh', { dur: NAME.phone - NAME.open + 0.2, gain: G.whoosh + 1 });

// III · step 1: the caption; Bub's two messages; the chips; three quick taps; your answer; Bub types and replies
add(ONB.cap, 'tick', { gain: G.tick });
add(ONB.m1, 'recv', { gain: G.recv, pan: -0.2 }); add(ONB.m2, 'recv', { gain: G.recv, pan: -0.2 });
for (let i = 0; i < 6; i++) add(ONB.chips + i * 0.05, 'tick', { gain: G.tickQuiet + 2, texture: 1 });
ONB.taps.forEach((tt) => add(tt, 'click', { gain: G.click }));
add(ONB.sent, 'send', { gain: G.send, pan: 0.2 });
add(ONB.typing, 'typing', { dur: ONB.reply - ONB.typing - 0.05, gain: G.typing, pan: -0.2 });
add(ONB.reply, 'recv', { gain: G.recv, pan: -0.2 });
add(ONB.next, 'swish', { gain: G.swish });

// IV · step 2: the radar; the dive through it into the universe; the flight (a wind bed, things rushing past); the
// scan; Bub spots the one and brings them home; the whoosh back into the phone; the kiss; Say hi
add(MATCH.cap, 'tick', { gain: G.tick });
for (let k = 0; k < 2; k++) add(MATCH.radar + k * 0.5, 'tick', { gain: G.tickQuiet + 2, texture: 1 });
add(MATCH.dive - 0.3, 'whoosh', { dur: 0.45, gain: G.whoosh + 2 });       // phonecam: the zoom into your orb
add(MATCH.dive + 0.1, 'impact', { size: 'small', gain: G.impactS - 2 });  // howto.js FLY0: your orb bursts
add(MATCH.dive + 0.1, 'pop', { size: 'big', gain: G.popBig });
add(MATCH.dive + 0.12, 'spray', { gain: G.spray });
add(MATCH.dive + 0.1, 'air', { dur: MATCH.back - MATCH.dive - 0.1, gain: G.air });
// v4: Bub's search (howto.js flightRig): it swoops past the camera, glances left and right, flies over to someone,
// bumps them, their callout pops, a head shake (no), again, a breath and the scan, the glint, the dash, the bump (yes)
add(MATCH.fly, 'whoosh', { dur: 0.45, gain: G.whoosh - 1, pan: 0.45 });
add(MATCH.fly + 0.5, 'swish', { dur: 0.12, gain: G.swish - 6, pan: -0.4 }); add(MATCH.fly + 0.78, 'swish', { dur: 0.12, gain: G.swish - 6, pan: 0.4 });
for (const [at, nope, pan] of [[MATCH.cand1, MATCH.nope1, 0.35], [MATCH.cand2, MATCH.nope2, -0.35]]) {
  add(at - 0.42, 'swish', { dur: 0.3, gain: G.swish - 1, pan });           // it flies over
  add(at, 'pop', { gain: G.pop - 1, pan });                                 // the bump
  add(at + 0.01, 'tap', { gain: G.tap - 8, pan });
  add(at + 0.08, 'tick', { gain: G.tick, pan });                            // their callout
  [0, 0.1, 0.2].forEach((dt, i) => add(nope + dt, 'swish', { dur: 0.07, gain: G.swish - 7, pan: i % 2 ? -0.3 : 0.3 }));   // the head shake
  add(nope + 0.32, 'tick', { gain: G.tickQuiet + 4, pan });                 // the callout leaves
}
add(MATCH.nope2 + 0.1, 'air', { dur: 0.4, gain: G.air + 2 });              // a sigh
add(MATCH.scan - 0.3, 'riser', { dur: 0.3, gain: G.riser - 4 });           // a breath in…
add(MATCH.scan, 'pop', { gain: G.pop }); add(MATCH.scan, 'whoosh', { dur: 0.8, gain: G.whoosh });   // …and the scan
add(MATCH.spot, 'tick', { gain: G.tick + 3, pan: 0.3 });                    // the glint
add(MATCH.spot + 0.12, 'whoosh', { dur: 0.6, gain: G.whoosh + 1, pan: 0.2 });   // the dash
add(MATCH.found, 'impact', { size: 'small', gain: G.impactS });
add(MATCH.found, 'pop', { gain: G.pop + 2 });
add(MATCH.found + 0.02, 'spray', { gain: G.spray });
add(MATCH.found + 0.05, 'tick', { gain: G.tick + 1 });                       // "Family first"
add(MATCH.found + 0.35, 'tap', { gain: G.tap - 6 });                         // the happy hop
add(MATCH.rush, 'whoosh', { dur: MATCH.back - MATCH.rush + 0.1, gain: G.whoosh + 2 });   // the rush into the one
add(MATCH.back, 'whoosh', { dur: 0.6, gain: G.whoosh });                 // …and out of their orb in the app
add(MATCH.kiss, 'pop', { gain: G.pop + 2 });
add(MATCH.kiss, 'impact', { size: 'small', gain: G.impactS - 2 });
add(MATCH.line, 'tick', { gain: G.tick });
add(MATCH.sayhi - 0.55, 'pop', { gain: G.pop - 4 });                     // Say hi appears
add(MATCH.sayhi, 'tap', { gain: G.tap });
add(MATCH.next, 'swish', { gain: G.swish });

// V · step 3: the chat; "WAIT. Same!!" and the push-in on it; SAME!! bursts; the three days; the move to the sheet
add(CHAT.cap, 'tick', { gain: G.tick });
add(CHAT.ice, 'recv', { gain: G.recv, pan: -0.2 });
add(CHAT.otter - 0.55, 'typing', { dur: 0.5, gain: G.typing, pan: -0.2 });
add(CHAT.otter, 'recv', { gain: G.recv, pan: -0.25 });
add(CHAT.same, 'send', { gain: G.send, pan: 0.25 });
add(CHAT.same + 0.05, 'whoosh', { dur: 0.5, gain: G.whoosh - 2 });
add(CHAT.sameBurst, 'impact', { gain: G.impact - 2 });
add(CHAT.sameBurst, 'pop', { size: 'big', gain: G.popBig });
add(CHAT.sameBurst + 0.03, 'spray', { gain: G.spray });
add(CHAT.sameBack, 'swish', { gain: G.swish });
add(CHAT.noNames, 'tick', { gain: G.tick });
[CHAT.days0, CHAT.day2, CHAT.day3].forEach((tt) => { add(tt, 'tick', { gain: G.tick + 2 }); add(tt - 0.55, 'air', { dur: 0.6, gain: G.air + 2 }); });
for (const [tt, you] of [[CHAT.days0 + 0.5, 0], [CHAT.day2 - 0.6, 1], [CHAT.day2 + 0.2, 0], [CHAT.day2 + 0.9, 1], [CHAT.day3 - 0.2, 0], [CHAT.day3 + 0.6, 1], [CHAT.last, 0]]) {
  add(tt, you ? 'send' : 'recv', { gain: (you ? G.send : G.recv) - 2, pan: you ? 0.25 : -0.25 });
}
add(CHAT.push, 'whoosh', { dur: 0.6, gain: G.whoosh });

// VI · step 4: the sheet; your tap and its latch; their typing; the breath (empty); both yeses; the wall pops; faces
add(UNLOCK.sheet, 'swish', { gain: G.swish });
add(UNLOCK.step, 'tick', { gain: G.tick });
add(UNLOCK.tap, 'tap', { gain: G.tap });
add(UNLOCK.tap + 0.2, 'click', { double: 1, gain: G.click });
for (const dt of [0, 1.1, 2.2]) add(UNLOCK.waiting + dt, 'typing', { dur: 0.55, gain: G.typing - 2, pan: 0.2 });
// the breath, then (v4) their padlock: it rises in the silence and springs open with a click-clack; half a second of
// held silence; the drop
cues.push({ t: UNLOCK.breath, kind: 'quiet', dur: UNLOCK.open - 0.05 - UNLOCK.breath });
add(UNLOCK.open, 'unlock', { gain: 1, pan: 0.15 });
add(UNLOCK.open + 0.06, 'spray', { gain: G.spray - 4, pan: 0.15 });
add(UNLOCK.both, 'impact', { gain: G.impact });
add(UNLOCK.lift, 'whoosh', { dur: 0.4, gain: G.whoosh + 1 });           // the orbs burst out of the phone
add(UNLOCK.wallPop, 'impact', { gain: G.impact });
add(UNLOCK.wallPop, 'pop', { size: 'big', gain: G.popBig + 1 });
[0, 0.1, 0.2].forEach((dt) => add(UNLOCK.wallPop + 0.02 + dt, 'click', { gain: G.click }));   // You're · both · in!
add(UNLOCK.wallPop + 0.02, 'spray', { gain: G.spray + 2 });
add(UNLOCK.faces, 'pop', { gain: G.pop + 3, pan: -0.3 }); add(UNLOCK.faces + 0.12, 'pop', { gain: G.pop + 3, pan: 0.3 });
add(UNLOCK.names, 'tick', { gain: G.tick, pan: -0.3 }); add(UNLOCK.names + 0.15, 'tick', { gain: G.tick, pan: 0.3 });
add(UNLOCK.almost, 'pop', { gain: G.pop });
add(UNLOCK.almost + 0.45, 'riser', { dur: 0.4, gain: G.riser - 2 });     // "almost" swells…
add(UNLOCK.almost + 0.85, 'pop', { size: 'big', gain: G.popBig + 2 });  // …and pops: friends.ai
add(UNLOCK.almost + 0.87, 'spray', { gain: G.spray });

// VII · foam (v5): the two of you kiss into a double bubble; then friends keep popping in on the accelerating clock
// (score.js GROW): a pop each, quieter as they come faster (a popcorn crescendo); its two lines; everyone rushing into
// the mark
add(FOAM.in + 0.18, 'pop', { gain: G.pop + 1 });
{
  const born = (i) => GROW.t0 + GROW.double * Math.log2(1 + i / 2);
  for (let i = 0; i < GROW.n; i++) add(born(i), 'pop', { gain: G.pop - 2 - (i / GROW.n) * 8, pan: Math.sin(i * 2.399963) * 0.7 });
}
add(FOAM.line1, 'click', { gain: G.click - 2 }); add(FOAM.line2, 'click', { gain: G.click - 2 });
add(MARK.hit - 0.42, 'whoosh', { dur: 0.42, gain: G.whoosh - 1 });

// VIII · the mark: the final hit; the name; the line; Bub's wink
add(MARK.hit, 'impact', { gain: G.impact });
for (let i = 0; i < 4; i++) add(MARK.name + i * 0.06, 'tick', { gain: G.tickQuiet, texture: 1 });
add(MARK.tag, 'tick', { gain: G.tick });
add(MARK.wink + 0.6, 'tick', { gain: G.tick - 2 });                    // the wink itself (foam.js: MARK.wink + 0.6)

cues.sort((a, b) => a.t - b.t);
process.stdout.write(JSON.stringify(cues, null, 0));
