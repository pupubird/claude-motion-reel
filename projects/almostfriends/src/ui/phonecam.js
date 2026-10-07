// The camera on the phone (v3). The phone rests whole and in frame; for each beat the camera pushes in on the part of
// the screen that matters and puts it in the clear band (y 620–1248: below it Reels, TikTok and Shorts cover the
// frame; above it is the caption). LAYOUT says where things are on the screens, in full-bleed design pixels, and both
// the screens (scenes/howto.js) and the camera read it, so they agree by construction.
import { W } from '../config.js';
import { MOVE } from '../brand.js';
import { NAME, ONB, MATCH, CHAT, UNLOCK } from '../score.js';
import { clamp, ease, lerp } from '../util.js';
import { kicks } from '../cam.js';
import { SCREEN_SCALE, REST } from './phone.js';

const K = W / 402;
const pt = (v) => v * K;

export const LAYOUT = {
  onb: { m1: pt(166), m2: pt(214), pick: pt(316), chips: pt(334), row: pt(54), chipH: pt(44), sent: pt(316) },
  radar: { orb: pt(250), you: pt(326) },
  matched: { cy: pt(236), r: pt(64), labels: pt(322), hero1: pt(378), hero2: pt(416), sayhi: pt(436), sayhiH: pt(50), apart: 0.32 * W },
  chat: { same: [W - pt(86), pt(348)], last: pt(400) },
  sheet: { y: pt(330), slotY: pt(480), slotDX: pt(88), button: pt(588) },
};

// A framing: the design point (fx, fy) lands on the frame at (ax, ay) with the screen zoomed by z.
const shot = (z, fx, fy, ax = W / 2, ay = 934) => {
  const sc = SCREEN_SCALE * z;
  return { cx: ax - fx * sc + (W * sc) / 2, top: ay - fy * sc, s: z };
};
const L = LAYOUT;
const DOLLY_END = shot(2.6, W / 2 + L.sheet.slotDX, L.sheet.slotY, W / 2, 960);
// [start, duration, curve, pose] — each glides from wherever the camera is to its pose
const CUTS = [
  [NAME.phone, 0, ease.linear, REST],
  [ONB.chips - 0.25, 0.45, MOVE.go, shot(1.5, W / 2, pt(352))],                             // the question and the chips
  [ONB.next, 0.45, MOVE.go, shot(1.35, W / 2, pt(290))],                                     // matching: you and the radar
  [MATCH.dive - 0.3, 0.4, ease.inExpo, shot(10, W / 2, L.radar.orb, W / 2, 960)],            // dive into your orb
  [MATCH.back, 0.001, ease.linear, shot(14, W / 2 + L.matched.apart, L.matched.cy, W / 2, 960)], // the one, overfilling the frame (the 3D cut matches)
  [MATCH.back + 0.02, 0.75, MOVE.go, shot(1.35, W / 2, pt(330))],                            // …the match
  [MATCH.next, 0.45, MOVE.go, shot(1.3, W / 2, pt(240), W / 2, 900)],                        // the chat
  [CHAT.same - 0.05, 0.5, MOVE.go, shot(2.2, L.chat.same[0], L.chat.same[1], W / 2, 950)],  // push in on "WAIT. Same!!"
  [CHAT.sameBurst, 0.35, MOVE.go, shot(1, W / 2, pt(330))],                                  // pull back as SAME!! bursts
  [CHAT.noNames, 0.6, MOVE.go, shot(0.86, W / 2, 0, W / 2, 740)],                            // the days: smaller, below "Day N"
  [CHAT.last - 0.4, 0.5, MOVE.go, shot(1.35, W / 2, L.chat.last, W / 2, 1000)],              // the last message
  [UNLOCK.sheet, 0.6, MOVE.go, shot(1.3, W / 2, pt(500), W / 2, 934)],                       // the unlock sheet
  [UNLOCK.waiting, UNLOCK.both - UNLOCK.waiting, ease.inOutSine, DOLLY_END],                 // the slow push onto their slot
  [UNLOCK.both, 0.4, MOVE.go, { ...shot(0.75, W / 2, pt(500), W / 2, 1500) }],               // the reveal throws it back and down
];

const TAPS = [...ONB.taps, MATCH.sayhi, UNLOCK.tap];

export function phonePose(t) {
  let pose = CUTS[0][3];
  for (const [t0, dur, curve, to] of CUTS) {
    if (t < t0) break;
    const u = dur > 0 ? curve(clamp((t - t0) / dur)) : 1;
    pose = { cx: lerp(pose.cx, to.cx, u), top: lerp(pose.top, to.top, u), s: lerp(pose.s, to.s, u) };
  }
  // a small push on every tap (the camera answers the finger)
  const k = kicks(t, TAPS, 0.02, 9, 20);
  if (k) {
    const sc0 = SCREEN_SCALE * pose.s, s = pose.s * (1 + k);
    const sc1 = SCREEN_SCALE * s, my = 934;
    pose = { cx: pose.cx, top: my - (my - pose.top) * (sc1 / sc0), s };
  }
  return pose;
}
