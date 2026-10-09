// The camera on the phone (v3). The phone rests whole and in frame; for each beat the camera pushes in on the part of
// the screen that matters and puts it in the clear band (y 620–1248: below it Reels, TikTok and Shorts cover the
// frame; above it is the caption). LAYOUT says where things are on the screens, in full-bleed design pixels, and both
// the screens (scenes/howto.js) and the camera read it, so they agree by construction.
// Special edition (owner on its first cut: "the UI screens etc needs to be more cool, camera zoom in, not static
// camera", pointing at a reference that never stops moving and frames the action tight): the camera is always moving.
// It lands close on each thing as it happens (Bub's question, each message, the kiss, the buttons), rides the finger
// from tag to tag, and creeps through every hold; the taps still kick it. The screens tell it where things are
// (setTargets, from scenes/howto.js), so it frames the real layout.
import { W, H, SH } from '../config.js';
import { MOVE } from '../brand.js';
import { NAME, ONB, MATCH, CHAT, UNLOCK } from '../score.js';
import * as THREE from 'three';
import { clamp, ease, lerp } from '../util.js';
import { threadTargets } from './convo.js';
import { toWorld } from '../gl/phone3d.js';
import { kicks } from '../cam.js';
import { SCREEN_SCALE, REST, PHONE_CY } from './phone.js';

const K = W / 402;
const pt = (v) => v * K;
const DH = SH - H;                              // how much taller the screen is than the released film's

export const LAYOUT = {
  onb: { m1: pt(166), m2: pt(214), pick: pt(316), chips: pt(334), row: pt(54), chipH: pt(44), sent: pt(316) },
  radar: { orb: pt(250), you: pt(326) },
  matched: { cy: pt(236), r: pt(64), labels: pt(322), hero1: pt(378), hero2: pt(416), sayhi: pt(436), sayhiH: pt(50), apart: 0.32 * W },
  chat: { same: [W - pt(86), pt(348)], last: pt(400) },
  sheet: { y: pt(330) + DH, slotY: pt(480) + DH, slotDX: pt(88), button: pt(588) + DH },     // a bottom sheet: it sits on the screen's bottom
};

// A framing: the design point (fx, fy) lands on the frame at (ax, ay) with the screen zoomed by z.
const shot = (z, fx, fy, ax = W / 2, ay = 934) => {
  const sc = SCREEN_SCALE * z;
  return { cx: ax - fx * sc + (W * sc) / 2, top: ay - fy * sc, s: z };
};
// a pose seen from an angle (degrees): the camera orbits the point it frames (yaw: round to the phone's right, pitch:
// from above, roll: about the lens)
const turn = (pose, yaw = 0, pitch = 0, roll = 0) => ({ ...pose, yaw: yaw * Math.PI / 180, pitch: pitch * Math.PI / 180, roll: roll * Math.PI / 180 });
// a close shot: the point (fx, fy) in the clear band, the screen still filling the frame's width where it can (no sky
// beside a close-up)
const close = (z, fx, fy, ay = 934) => {
  const half = W / 2 / (SCREEN_SCALE * z);                      // half the frame's width, in screen design px
  return shot(z, half < W / 2 ? clamp(fx, half, W - half) : W / 2, fy, W / 2, ay);
};
// a whole phone at zoom z, its screen centred on the resting row (PHONE_CY), its centre at frame x cx
export const BAND_PX = 14 * K;                       // the bezel and the titanium band round the glass (design px)
const whole = (z, cx = W / 2) => ({ cx, top: PHONE_CY - (SH * SCREEN_SCALE * z) / 2, s: z });
// a two-shot: the phone whole on the right, as far from the frame's right edge (MARGIN, its band included) as its
// caption is from the left (scenes/steps.js), centred on the resting row — the left of the frame is the caption's
export const MARGIN = 60;
const beside = (z) => whole(z, W - MARGIN - (BAND_PX + W / 2) * SCREEN_SCALE * z);
const L = LAYOUT;
const DOLLY_END = shot(2.25, W / 2, L.sheet.slotY - pt(20), W / 2, 960);   // v2: onto the lock between the slots (scenes/unlock.js lockRig)
const centre = (b) => [b.x + b.w / 2, b.y + b.h / 2];
const hold = (t0, t1, pose) => [t0, Math.max(0.05, t1 - t0), ease.inOutSine, pose];   // a creep that fills a hold
// [start, duration, curve, pose] — each glides from wherever the camera is to its pose. `T` (setTargets): where the
// screens put things (screen design px): q (Bub's two messages), chips { key: [x, y] at the finger }, chipsY, answer,
// reply ([x, y] centres)
function buildCuts(T) {
  const th = threadTargets({ viewBottom: pt(430) });
  const card = th[0], at = (t) => th.find((m) => m.at === t);
  const q = T ? [T.q.x + T.q.w / 2, T.q.y + T.q.h / 2] : [W / 2, pt(200)];
  const ch = (k) => (T ? T.chips[k] : [W / 2, pt(380)]);
  // angles in degrees (turn): the camera orbits what it frames — it swings to a side as it lands on each thing, and
  // every hold is a slow orbit, so the phone is never seen still
  return [
    // v2, the Apple pass: the phone arrives as a hero shot — close, low and turned (out of the icon's light) — and
    // settles into its two-shot with the caption
    [NAME.phone, 0, ease.linear, turn(shot(1.75, W / 2, SH * 0.4), 26, -18, 7)],
    // 1 · the phone lands and turns to its caption, which stands in the sky at its left (scenes/steps.js); the lens
    // creeps in on the two of them while Bub asks
    [NAME.phone + 0.02, 0.95, MOVE.go, turn(beside(0.96), 15, 5)],
    hold(NAME.phone + 0.82, ONB.taps[0] - 0.36, turn(beside(0.985), 13, 5.5)),
    // three quick taps: the camera rides the finger from tag to tag
    // v2: a longer push (0.3 s read as a cut against the night: one blurred frame between a dark two-shot and a white screen)
    [ONB.taps[0] - 0.52, 0.46, MOVE.go, turn(close(2.45, ...ch('family')), 6, 16, 1)],
    [ONB.taps[1] - 0.15, 0.16, MOVE.go, turn(close(2.45, ...ch('career')), 3, 15)],
    [ONB.taps[2] - 0.15, 0.16, MOVE.go, turn(close(2.45, ...ch('adventure')), 10, 14, -1)],
    // your answer flies up into the thread; Bub types and answers; a slow orbit while it reads
    [ONB.sent - 0.12, 0.4, MOVE.go, turn(close(1.7, ...(T ? T.answer : [W / 2, pt(330)])), -9, 7)],
    [ONB.typing + 0.05, 0.45, MOVE.go, turn(close(1.95, ...(T ? T.reply : [W / 2, pt(380)])), -5, 6)],
    // back out to the caption and the answer: the two of them together again
    [ONB.reply + 0.4, 0.55, MOVE.go, turn(beside(0.96), 12, 6)],
    hold(ONB.reply + 0.95, ONB.next, turn(beside(0.98), 10.5, 6.5)),
    // 2 · matching: you and the radar; an orbit onto your orb as it pulses; the dive into it, straightening
    [ONB.next, 0.45, MOVE.go, turn(shot(1.45, W / 2, pt(285)), -9, 9)],
    hold(ONB.next + 0.45, MATCH.dive - 0.3, turn(shot(1.9, W / 2, L.radar.orb + pt(25)), 9, 11)),
    [MATCH.dive - 0.3, 0.4, ease.inExpo, shot(10, W / 2, L.radar.orb, W / 2, 960)],            // dive into your orb
    [MATCH.back, 0.001, ease.linear, shot(14, W / 2 + L.matched.apart, L.matched.cy, W / 2, 960)], // the one, overfilling the frame (the 3D cut matches)
    // the match: out of their orb onto the two of you; close on the kiss; the line; down onto Say hi for the tap
    [MATCH.back + 0.02, 0.7, MOVE.go, turn(shot(1.55, W / 2, pt(250)), -10, 9)],
    [MATCH.kiss - 0.35, 0.6, MOVE.go, turn(shot(2.15, W / 2, L.matched.cy + pt(10)), 0, 7)],   // (0.6 s: the air's parallax made a 0.4 s push a jump)
    [MATCH.line - 0.1, 0.45, MOVE.go, turn(shot(1.8, W / 2, pt(330)), 8, 7)],
    hold(MATCH.line + 0.4, MATCH.sayhi - 0.45, turn(shot(2.0, W / 2, pt(360)), -7, 9)),
    [MATCH.sayhi - 0.45, 0.35, MOVE.go, turn(shot(2.6, W / 2, L.matched.sayhi + L.matched.sayhiH / 2), 0, 17)],
    [MATCH.sayhi + 0.3, 0.5, MOVE.go, turn(shot(1.55, W / 2, pt(300)), -6, 7)],
    // 3 · the chat: the phone turns to its caption again; Bub's icebreaker and their first message read beside it;
    // then the push in on "WAIT. Same!!" and an orbit onto it
    [MATCH.next, 0.55, MOVE.go, turn(beside(0.96), 14, 5)],
    hold(MATCH.next + 0.55, CHAT.same - 0.05, turn(beside(0.985), 12, 5.5)),
    [CHAT.same - 0.05, 0.5, MOVE.go, turn(shot(2.25, L.chat.same[0], L.chat.same[1], W / 2, 950), 9, 7)],
    hold(CHAT.same + 0.45, CHAT.sameBurst, turn(shot(2.6, L.chat.same[0], L.chat.same[1], W / 2, 950), 3, 5)),
    // v2: thrown back on the hit, the phone low in the frame so SAME!! stands over its top, then a slow swing round it
    [CHAT.sameBurst, 0.3, MOVE.go, turn({ ...whole(0.84), top: whole(0.84).top + 150 }, -12, 5, -3)],
    hold(CHAT.sameBurst + 0.3, CHAT.noNames, turn({ ...whole(0.86), top: whole(0.86).top + 140 }, 9, 3, 1)),
    // three days: the phone smaller at the right, turning on a slow turntable (its own turn: scenes/howto.js), its
    // caption at the left, as three suns cross the sky behind them both; the lens itself only creeps
    [CHAT.noNames, 0.6, MOVE.go, turn(beside(0.86), 6, 6)],
    hold(CHAT.noNames + 0.6, CHAT.last - 0.4, turn(beside(0.88), 8, 5)),
    // the last message: close, and an orbit
    [CHAT.last - 0.4, 0.5, MOVE.go, turn(close(1.75, ...centre(at(CHAT.last)), 1000), -7, 7)],
    hold(CHAT.last + 0.1, UNLOCK.sheet, turn(close(1.95, ...centre(at(CHAT.last)), 1000), 5, 5)),
    // 4 · the sheet; an orbit onto its question; down onto Unlock for your tap; out to both slots; the slow push onto
    // theirs, straightening; the reveal throws the phone back and down, tumbling
    [UNLOCK.sheet, 0.6, MOVE.go, turn(beside(0.96), 14, 7)],
    hold(UNLOCK.sheet + 0.6, UNLOCK.tap - 0.3, turn(beside(0.98), 12.5, 7.5)),
    [UNLOCK.tap - 0.3, 0.25, MOVE.go, turn(shot(2.3, W / 2, L.sheet.button + pt(28)), 0, 16)],
    [UNLOCK.tap + 0.25, 0.45, MOVE.go, turn(shot(1.6, W / 2, L.sheet.slotY), -6, 8)],
    [UNLOCK.waiting, UNLOCK.both - UNLOCK.waiting, ease.inOutSine, turn(DOLLY_END, 0, 2)],      // the slow push onto their slot
    [UNLOCK.both, 0.4, MOVE.go, turn(shot(0.75, W / 2, pt(500) + DH, W / 2, 2900), 16, -26, 7)],    // thrown back and down, tumbling, out of the frame (v2)
  ];
}
// the phone's lens (gl/phone3d.js), set for each sub-frame by phoneCamera()
export const PHONE_CAM = new THREE.PerspectiveCamera();
let CUTS = buildCuts(null);
// the screens' layout, once it is measured (scenes/howto.js init): the camera frames the real positions
export function setTargets(T) { CUTS = buildCuts(T); }

const TAPS = [...ONB.taps, MATCH.sayhi, UNLOCK.tap];


export function phonePose(t) {
  let pose = CUTS[0][3];
  for (const [t0, dur, curve, to] of CUTS) {
    if (t < t0) break;
    const u = dur > 0 ? curve(clamp((t - t0) / dur)) : 1;
    pose = { cx: lerp(pose.cx, to.cx, u), top: lerp(pose.top, to.top, u), s: lerp(pose.s, to.s, u),
      yaw: lerp(pose.yaw ?? 0, to.yaw ?? 0, u), pitch: lerp(pose.pitch ?? 0, to.pitch ?? 0, u), roll: lerp(pose.roll ?? 0, to.roll ?? 0, u) };
  }
  // a small push on every tap (the camera answers the finger)
  const k = kicks(t, TAPS, 0.02, 9, 20);
  if (k) {
    const sc0 = SCREEN_SCALE * pose.s, s = pose.s * (1 + k);
    const sc1 = SCREEN_SCALE * s, my = 934;
    pose = { ...pose, cx: pose.cx, top: my - (my - pose.top) * (sc1 / sc0), s };
  }
  return pose;
}

// ── the phone in 3D (gl/phone3d.js): the pose's framing, seen through a real lens that orbits the framed point ──────
// A pose { cx, top, s } puts the screen where the 2D phone was (s = 1: 560 px wide, top at 600); the 3D camera keeps
// that framing for the point at the clear band's centre (934) and orbits it by yaw / pitch / roll.
export const LENS = { fov: 26, anchor: [W / 2, 934] };
const TANH = Math.tan((LENS.fov * Math.PI) / 360);
// → the screen point (design px) under the frame anchor for a 2D pose
function anchorPoint(pose) {
  const sc = SCREEN_SCALE * pose.s, x0 = pose.cx - (W * sc) / 2;
  return [(LENS.anchor[0] - x0) / sc, (LENS.anchor[1] - pose.top) / sc];
}
const _F = new THREE.Vector3(), _D = new THREE.Vector3();
// set `cam` (a PerspectiveCamera) for a pose; `frame` [W, H] in px (the view offset puts the anchor where it belongs)
export function phoneCamera(pose, cam, H = 1920) {
  const [fx, fy] = anchorPoint(pose);
  _F.set(...toWorld(fx, fy));
  const wpx = W * SCREEN_SCALE * pose.s;                       // the screen's width on the frame, facing the lens
  const d = H / (2 * TANH * wpx);                              // the distance at which 1 world unit is wpx pixels
  const yaw = pose.yaw ?? 0, pitch = pose.pitch ?? 0;
  _D.set(Math.sin(yaw) * Math.cos(pitch), Math.sin(pitch), Math.cos(yaw) * Math.cos(pitch));
  cam.fov = LENS.fov; cam.aspect = W / H; cam.near = 0.01; cam.far = 100;
  cam.position.copy(_F).addScaledVector(_D, d);
  cam.up.set(0, 1, 0);
  cam.lookAt(_F);
  if (pose.roll) cam.rotateZ(pose.roll);
  cam.setViewOffset(W, H, W / 2 - LENS.anchor[0], H / 2 - LENS.anchor[1], W, H);
  cam.updateProjectionMatrix();
  cam.updateMatrixWorld();
  return cam;
}
const _cam = new THREE.PerspectiveCamera(), _p = new THREE.Vector3();
// a point of the screen (design px, h px above the glass) → [frame x, frame y, px per screen design px] for a pose
export function projectScreen(pose, x, y, h = 0) {
  phoneCamera(pose, _cam);
  _p.set(...toWorld(x, y, h)).project(_cam);
  const fx = (_p.x + 1) / 2 * W, fy = (1 - _p.y) / 2 * 1920;
  _p.set(...toWorld(x + 1, y, h)).project(_cam);
  return [fx, fy, Math.hypot((_p.x + 1) / 2 * W - fx, (1 - _p.y) / 2 * 1920 - fy)];
}
