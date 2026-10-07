// The score: every shot, hit and choreography anchor in seconds on the 120 BPM grid (1 beat = 0.5 s, 1 bar = 2 s).
// Picture, foley (tools/cues.mjs) and the music plan (tools/music.py) all read this. Anchors are frozen and strict:
// reading a name that does not exist throws, so a stale anchor fails the render instead of turning a seg() into NaN.
// v3 (66 s), from the owner's notes on v2: energy from frame 0 (we're already flying through the bubble universe when
// the question slams in); a real phone with a camera that pushes in on what matters; quick taps; step 2 is a 3D flight
// in which Bub searches the universe and finds you the one; a push-in on "WAIT. Same!!"; step 4 inside the phone and
// the reveal as the film's peak. The score's sections and drops are unchanged (4, 10, 18, 28, 42, 50, 56, 62 s).
// v6 (66 s): the hook is one bar (owner: "maximum 2 seconds"); every anchor after it is v5's minus 2 s, and so is the
// score (its second intro bar cut).
import { BEAT, BAR } from './config.js';

export const b = (beats) => beats * BEAT;          // beats → seconds
export const bar = (n, beat = 0) => (n - 1) * BAR + beat * BEAT;   // bar n (1-based), beat offset → seconds

const strict = (name, o) => new Proxy(Object.freeze(o), {
  get(t, k) {
    if (typeof k === 'string' && !(k in t) && k !== 'toJSON' && k !== 'then') throw new Error(`score: ${name}.${k} is not an anchor`);
    return t[k];
  },
});

// I · HOOK (bar 1), v6. The owner on v4: "start with 'how to make more friends' as the hook, and then show our
// products"; on v5: "make the first scene … faster … maximum 2 seconds … attention span is like 2 seconds". v4's
// staging (research/research-hooks.md §10.3 C1: the screen is the wall of your bubble, Bub on it from outside, eyes on
// you; the wall bursts on the drop) in one bar: knock, knock, knock — "How to" / "make more" / "friends" — a glance at
// the word, one big push, the film thins to a black spot and trembles, and it pops on the drop at 2.0 s, where
// "friends" survives to become the name. The score lost its second intro bar (splice_score.py --cut 2), so everything
// after the hook plays 2 s earlier than in v5.
export const HOOK = strict('HOOK', {
  knock1: 0.0,          // frame 0: Bub smacks into the wall (flattened, a ripple out): "How to"; its eyes snap open on you
  knock2: 0.25,         // knock: "make more"
  knock3: 0.5,          // knock: "friends", big and blue
  look: 0.65,           // its eyes flick up to the word…
  back: 0.85,           // …and back to you, hopeful (it blushes)
  push: 1.0,            // it pushes: the wall bulges at you and thins, its colours sliding blue → magenta → gold
  spot: 1.25,           // a black spot blooms in the film; Bub's eyes go huge
  brace: 1.6,           // the film trembles; it shuts its eyes
  pop: 2.0,             // POP on the downbeat of bar 2 (the drop): the wall tears, colour floods the world; "How to make
                        // more" flies apart with it, "friends" glides down into the name: almost / friends.ai
});
// II · NAME (bars 2–4), v4 (owner: "remake this"; "no need to say not dates"): one idea per beat, no stacked poster —
// the pop's droplets inflate into the mark (3D: two soap bubbles kissing) and the name; the camera dives through the
// mark (blue, the wall, coral) onto the value, held while the world of people glides by; the app icon, Bub's dive (the
// tap), the app opens
export const NAME = strict('NAME', {
  icon: 2.05,           // the mark inflates out of the pop
  name: 2.3,            // almost / friends.ai
  dive: 3.15,           // the camera dives through the mark: a colour wipe
  value: 3.4,           // "New friends who share your values."
  exit: 6.75,           // the app icon pops in
  tap: 7.0,             // Bub dives in (the tap)
  open: 7.12,           // the app opens out of the icon (howto.js)
  phone: 7.5,
});

// III · 1 PICK WHAT MATTERS TO YOU (bars 5–7)
export const ONB = strict('ONB', {
  cap: 8.0, m1: 8.3, m2: 8.6, chips: 9.0,
  taps: [9.75, 10.0, 10.25],   // Family 1 · Career 2 · Adventure 3, three quick taps on 8ths
  sent: 10.6, typing: 10.85, reply: 11.25, next: 13.25,
});

// IV · 2 AI FINDS PEOPLE WHO SHARE THEM (bars 7–14): the matching screen; the camera dives through the radar into
// the bubble universe, where Bub (a 3D character now, owner's v3 notes: "the bubble is also part of the universe") searches:
// no, not this one… no, not this one… a scan… ah! yes, this is the one. v4 adds one bar here (everything from
// MATCH.back on is v3 + 2 s; the score gets the same bar, tools/splice_score.py --insert).
export const MATCH = strict('MATCH', {
  cap: 13.75, radar: 14.0,
  dive: 14.75,          // the camera dives into the radar and comes out in the universe
  fly: 15.0,            // Bub swoops past the camera into the crowd, looking around
  cand1: 16.15,         // it checks someone: "💰 Wealth first"
  nope1: 16.75,         // …no, not this one (a head shake)
  cand2: 17.6,          // someone else: "💪 Health first"
  nope2: 18.15,         // …no, not this one either
  scan: 18.65,          // Bub sends out a scan: everyone who puts family first lights up
  spot: 19.25,          // …and spots the one
  found: 20.0,          // reaches them on the downbeat of bar 11: yes! "👨‍👩‍👧 Family first"
  rush: 21.95,          // the camera rushes into their bubble
  back: 22.75,          // out of their orb, back in the app
  kiss: 23.75, line: 24.25, sayhi: 26.5, next: 27.5,
});

// V · 3 CHAT ANONYMOUSLY FOR 3 DAYS (bars 15–21)
export const CHAT = strict('CHAT', {
  cap: 28.0, ice: 28.5, otter: 29.4,
  same: 30.5,           // "WAIT. Same!!" — the camera pushes in on it and holds
  sameBurst: 32.0,      // SAME!! bursts out to hero size as the camera pulls back (bar 17)
  sameBack: 33.0,
  noNames: 33.5, days0: 34.25, day2: 36.25, day3: 38.25, last: 40.0,
  push: 41.25,          // the camera moves onto the unlock sheet rising inside the phone
});

// VI · 4 IT TAKES TWO YESES (bars 21–28), inside the phone: the slow push onto their slot and the silence (kept from
// v1), then the peak: both locks open, the two orbs burst out of the phone, the wall pops, two real faces
export const UNLOCK = strict('UNLOCK', {
  sheet: 41.5, step: 42.0, tap: 44.0, waiting: 44.75,
  breath: 48.0,         // the one breath (bar 25)
  lockUp: 49.2,         // v4 (owner: "i didnt know its unlock"): their padlock rises big over their slot…
  open: 49.5,           // …and springs open with a click-clack in the silence; their slot goes gold
  both: 50.0,           // the drop (downbeat of bar 26): the reveal
  lift: 50.05,          // the two slot orbs burst out of the phone and kiss mid-air
  wallPop: 50.5, faces: 50.85, names: 51.6,
  almost: 54.0,         // "almost" pops off: friends
});

// VII · FOAM, VIII · MARK
export const FOAM = strict('FOAM', { in: 56.0, line1: 56.75, line2: 59.0, settle: 61.0 });
// the foam's birth clocks: friend i is born at t0 + double · log2(1 + i/2), i < n (an accelerating crescendo). v5 (owner on
// v4: "有点密集恐惧", a little trypophobic): 26 friends, each its own bubble with air round it (v4 packed 240 into a foam)
export const GROW = strict('GROW', { t0: 56.25, double: 1.15, n: 26 });
export const MARK = strict('MARK', { hit: 62.0, name: 62.5, tag: 63.25, wink: 64.4, end: 66.0 });
