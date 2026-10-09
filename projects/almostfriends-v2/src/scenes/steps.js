// The four steps' captions as things in the shot (special edition, second pass). The owner on the first pass, where
// they still sat in a band above the phone: "you see the Pick what matters to you etc etc, feel like text on top only"
// — "we cannot just put text on top area with background color and dropshadow etc, it *must* merge and design well
// seamlessly into the scene". So each caption is a sign (gl/sign.js) standing in the phone's world, composed with the
// phone the way the references compose a word with its object (a word beside the card, in the same light):
//   · its key shot turns the phone toward it and frames the two together; the sign is pinned there and stays put, so
//     every later move of the lens carries it (parallax, perspective, blur), and the phone, nearer, passes over it;
//   · out of focus by its distance from the glass the lens is focused on;
//   · it arrives a word at a time and leaves by bursting, word by word, as a bubble does; no badge, no plate, no
//     shadow, and the phone is never faded to make room for it.
import * as THREE from 'three';
import { W, H, SH } from '../config.js';
import { C, SPRING, MOVE } from '../brand.js';
import { ONB, MATCH, CHAT, UNLOCK } from '../score.js';
import { T, fill } from '../copy.js';
import { clamp, lerp, seg, spring, springVel } from '../util.js';
import { Line, drawLine, balance, measureStr, CJK } from '../type.js';
import { sign, pin, depthOf } from '../gl/sign.js';
import { phonePose, phoneCamera, projectScreen, BAND_PX, MARGIN } from '../ui/phonecam.js';
import { PHONE_CY } from '../ui/phone.js';
import { lightFill } from '../v2type.js';

const CAP_GAP = 0.35;
const NUM = { s: 168, w: 800, gap: 18 };          // the step's numeral, over its words
const DAY = { s: 112, w: 800, gap: 22 };          // the days' counter, in its place
const DAYS = [CHAT.days0, CHAT.day2, CHAT.day3];
// [numeral (null: the step goes on), arrives, leaves, the shot that composes it: key (when the lens lands on it), the
// lockup's top-left on that frame (x, y), its measure and size (px), how far behind the glass it stands (world units:
// the screen is 1 wide); step 2 floats in the universe instead, `ahead` units in front of the flight's lens, in the
// clear core of the crowd, carried along with the flight a beat behind its turns (lag, s): Bub flies in front of it,
// the crowd streams past behind it]
// Beside the phone, a caption's ink starts at the frame's MARGIN (the phone's band is as far from the right edge: the
// two-shot is balanced), its column runs to the phone's left edge at its key shot less a gap, and its block is centred
// on the row the phone is centred on (PHONE_CY): the words and the phone are one centred composition
const GAP = 32;
const STEPS = [
  { n: '1', at: ONB.cap, out: MATCH.cap - CAP_GAP, key: ONB.cap + 0.45, size: 88, behind: 1.4 },
  { n: '2', at: MATCH.fly + 0.3, out: MATCH.spot + 0.15, key: MATCH.fly + 0.9, cy: 560, measure: 560, size: 80, ahead: 4.6, lag: 0.07, world: 'universe', centre: true },
  { n: '3', at: CHAT.cap, out: CHAT.same - 0.1, key: CHAT.cap + 0.45, size: 80, behind: 1.4 },
  { n: null, day: true, at: CHAT.noNames, out: CHAT.last - 0.3, key: CHAT.noNames + 0.8, size: 76, behind: 1.6, sunlit: true },
  { n: '4', at: UNLOCK.step - 0.1, out: UNLOCK.both - 0.3, key: UNLOCK.step + 0.45, size: 92, behind: 1.4 },
];
// the column beside the phone at a key shot (px from the caption's ink to the phone's band, less the gap)
function columnAt(key) {
  const [x] = projectScreen(phonePose(key), -BAND_PX, SH / 2);
  return Math.round(x - GAP - MARGIN);
}

let caps = null;
const _cam = new THREE.PerspectiveCamera();

// A caption's lines for its measure. Latin: its words broken anew, as evenly as they fit (balance), the copy's blue
// line kept as words. Chinese keeps the writer's breaks: a line that fits stays whole, one that does not breaks at its
// own phrase marks (copy.js z()), never inside a phrase; its blue line stays blue whole.
const ZW = '\u200B';
function layout(c, measure, size) {
  const opt = { s: size, w: 760, track: -0.03 };
  if (!CJK.test(c.lines.join(''))) {
    const lines = balance(c.lines.join(' '), measure, opt);
    const before = c.lines.slice(0, c.blue ?? 0).join(' ').split(' ').filter(Boolean).length;
    const blueWords = c.blue === undefined ? new Set() : new Set(c.lines[c.blue].split(' ').filter(Boolean).map((_, k) => before + k));
    return { lines: lines.map((l) => new Line(l, opt)), blueWords, blueLines: new Set() };
  }
  const lines = [], blueLines = new Set();
  c.lines.forEach((cl, ci) => {
    let cur = '';
    for (const ph of cl.split(ZW)) {
      if (cur && measureStr(cur + ph, opt) > measure) { if (ci === c.blue) blueLines.add(lines.length); lines.push(cur); cur = ph; } else cur += (cur ? ZW : '') + ph;
    }
    if (ci === c.blue) blueLines.add(lines.length);
    lines.push(cur);
  });
  return { lines: lines.map((l) => new Line(l, opt)), blueWords: new Set(), blueLines };
}

function build() {
  if (STEPS.some((st) => typeof st.at !== 'number' || typeof st.out !== 'number')) throw new Error('steps: every caption needs a numeric at and out');
  caps = T.caps.map((c, i) => {
    const st = { ...STEPS[i] };
    if (st.world !== 'universe') st.measure = columnAt(st.key);
    const han = CJK.test(c.lines.join(''));
    // the size the step asks for, or less if its longest unbreakable piece (a word; a Chinese phrase) would not fit
    // (Chinese lines are short and dense: they may take a little more of the column)
    let size = st.size ?? c.s * 0.95;
    const measure = st.measure + (han ? 16 : 0);
    const pieces = han ? c.lines.flatMap((l) => l.split(ZW)) : c.lines.join(' ').split(' ');
    const widest = (sz) => Math.max(...pieces.map((wd) => measureStr(wd, { s: sz, w: 760, track: -0.03 })));
    while (size > 48 && widest(size) > measure) size -= 2;
    // and a little less again rather than strand a word on a line of its own: at most three lines under a numeral
    let lay = layout(c, measure, size);
    while (st.n && lay.lines.length > 3 && size > 60) { size -= 2; lay = layout(c, measure, size); }
    const { lines, blueWords, blueLines } = lay;
    // the header over the words: the step's numeral, or (the three days) Day 1 · 2 · 3, rolling at each dawn
    const head = st.n ? { lines: [new Line(st.n, { s: NUM.s, w: NUM.w, track: 0 })], s: NUM.s, gap: NUM.gap, at: [st.at] }
      : st.day ? { lines: [1, 2, 3].map((d) => new Line(fill(T.day, { d }), { s: DAY.s, w: DAY.w, track: -0.03 })), s: DAY.s, gap: DAY.gap, at: DAYS } : null;
    // Chinese fills the em box and has no ascenders or descenders to share the gap: led at 1.14 (the released cut's)
    const lead = size * (han ? 1.14 : 1.0);
    const top = head ? head.s * 0.78 + head.gap : 0;
    const h = Math.ceil(top + lines.length * lead + size * 0.35 + 40);
    const w = Math.ceil(Math.max(...lines.map((l) => l.width)) + 60);
    const sg = sign({ w, h });
    // where its sign's centre sits on the key frame: beside the phone, centred on its row; in the universe, centred
    // across the frame, high above Bub
    const spot = st.world === 'universe' ? [W / 2, st.cy] : [MARGIN - 20 + w / 2, PHONE_CY];
    const cap = { ...st, i, lines, head, top, lead, size, sg, blueWords, blueLines, spot, pinned: null };
    if (cap.at !== st.at || cap.out !== st.out) throw new Error('steps: a caption\'s timing was overwritten');
    return cap;
  });
}

// the lockup, drawn in its sign: the numeral, then the words, left-aligned; words pop in, then burst out
function drawCap(ctx, c, t) {
  const x0 = 20;
  const outAt = (k) => c.out + k * 0.035;
  const gone = (k) => seg(t, outAt(k), outAt(k) + 0.16);
  // the header: it pops in; a new state rolls up into its place, the old one up and out (clipped to the header)
  const h = c.head;
  if (h && t >= h.at[0]) {
    const base = 20 + h.s * 0.74, on = gone(0);
    let cur = 0;
    for (let i = 1; i < h.at.length; i++) if (t >= h.at[i] - 0.12) cur = i;
    const roll = cur > 0 ? MOVE.go(seg(t, h.at[cur] - 0.12, h.at[cur] + 0.16)) : 1;
    const pn = spring(t - h.at[0], SPRING.pop);
    const sc = pn * (1 + 0.22 * on);
    const L = h.lines[cur];
    const hx = (Ln) => (c.centre ? (c.sg.w - Ln.width) / 2 - Ln.lead : x0);
    ctx.save();
    ctx.globalAlpha *= clamp(pn * 4) * (1 - on * on);
    ctx.beginPath(); ctx.rect(0, 0, ctx.canvas.width, base + h.s * 0.12); ctx.clip();
    ctx.translate(hx(L) + L.width / 2, base - L.xh / 2); ctx.scale(sc, sc); ctx.translate(-(hx(L) + L.width / 2), -(base - L.xh / 2));
    const dy = h.s * 0.95;
    const lf = (Ln) => lightFill(ctx, hx(Ln), hx(Ln) + Ln.width);
    if (roll < 1) drawLine(ctx, h.lines[cur - 1], hx(h.lines[cur - 1]), base - dy * roll, { fill: lf(h.lines[cur - 1]) });
    drawLine(ctx, L, hx(L), base + dy * (1 - roll), { fill: lf(L) });
    ctx.restore();
  }
  let k = 0, y = 20 + c.top + c.size * 0.8;
  c.lines.forEach((line, li) => {
    const k0 = k;
    const lx0 = c.centre ? (c.sg.w - line.width) / 2 : x0, hiFill = lightFill(ctx, lx0, lx0 + line.width);
    const each = (i, g, wk) => {
      const w = k0 + Math.max(0, wk);
      const t0 = c.at + 0.1 + w * 0.075;
      if (t < t0) return { a: 0 };
      const p = spring(t - t0, SPRING.pop), v = springVel(t - t0, SPRING.pop);
      const sq = clamp(v * 0.02, -0.12, 0.12);
      const o = gone(w + 1);
      return { a: clamp(p * 4) * (1 - o * o), sc: p * (1 + 0.2 * o), sx: 1 - sq, sy: 1 + sq, dy: (1 - p) * 0.3 * line.opt.s, fill: c.blueWords.has(w) || c.blueLines.has(li) ? hiFill : '#F5F5F7' };
    };
    k += line.words.length;
    const lx = c.centre ? (c.sg.w - line.width) / 2 : x0;
    drawLine(ctx, line, lx - line.lead, y, { fill: '#F4F6FF', each });     // (aligned on its ink: Chinese starts with a bearing)
    y += c.lead;
  });
}

// The sun of the three days (scenes/howto.js draws it in the sky): one crossing a day, left to right → its frame
// position and how much it shows (0 outside the days)
export function sunAt(t) {
  const k = seg(t, CHAT.days0 - 0.2, CHAT.days0 + 0.2) * (1 - seg(t, CHAT.last - 0.2, CHAT.last + 0.3));
  const u = clamp(((t - CHAT.days0) / 2) % 1);
  return { x: lerp(80, 1000, u), y: 900 - Math.sin(u * Math.PI) * 420, k };
}

// pin every caption where its key shot sees it (after the camera knows the screens' layout: setTargets);
// flightCam(t, cam) sets `cam` to the flight's lens at t (the universe's captions)
export function pinSteps(flightCam) {
  if (!caps) build();
  for (const c of caps) {
    if (c.world === 'universe') {
      flightCam(c.key, _cam);
      c.pinned = pin(_cam, ...c.spot, c.ahead);
      // its pose in the lens's own frame, so it can be carried
      const inv = _cam.quaternion.clone().invert();
      c.local = { pos: c.pinned.pos.clone().sub(_cam.position).applyQuaternion(inv), quat: inv.multiply(c.pinned.quat) };
      c.carry = (t, cam) => {
        flightCam(t - c.lag, _cam);                                 // the lens a beat ago turns it; the lens now carries it
        c.pinned.pos.copy(c.local.pos).applyQuaternion(_cam.quaternion).add(cam.position);
        c.pinned.quat.copy(_cam.quaternion).multiply(c.local.quat);
      };
      continue;
    }
    const pose = phonePose(c.key);
    phoneCamera(pose, _cam);
    const f = new THREE.Vector3(0, 0, -1).applyQuaternion(_cam.quaternion);
    const glass = _cam.position.z / -f.z;                        // the axis meets the glass (z ≈ 0) this far ahead
    const D = depthOf(_cam, _cam.position.clone().addScaledVector(f, glass)) + c.behind;
    c.pinned = pin(_cam, ...c.spot, D);
  }
}

// how much of a pinned sign the frame holds (0–1, by its projected width and height): a sign the lens has mostly
// left is let go, so no sliver of a word is stranded at the frame's edge
const _c = new THREE.Vector3(), _x = new THREE.Vector3(), _y = new THREE.Vector3();
// a pinned sign's corners on the frame: [top-left, top-right, bottom-left, bottom-right] as [x, y] px
function corners(cam, c) {
  const { pos, quat, wpp } = c.pinned, hw = (c.sg.w * wpp) / 2, hh = (c.sg.h * wpp) / 2;
  _x.set(1, 0, 0).applyQuaternion(quat); _y.set(0, 1, 0).applyQuaternion(quat);
  return [[-1, 1], [1, 1], [-1, -1], [1, -1]].map(([sx, sy]) => {
    _c.copy(pos).addScaledVector(_x, sx * hw).addScaledVector(_y, sy * hh).project(cam);
    return [(_c.x + 1) / 2 * W, (1 - _c.y) / 2 * H];
  });
}
function framed(cam, c) {
  const q = corners(cam, c), xs = q.map((p) => p[0]), ys = q.map((p) => p[1]);
  const x0 = Math.min(...xs), x1 = Math.max(...xs), y0 = Math.min(...ys), y1 = Math.max(...ys);
  const fx = clamp((Math.min(x1, W) - Math.max(x0, 0)) / Math.max(1, x1 - x0)), fy = clamp((Math.min(y1, H) - Math.max(y0, 0)) / Math.max(1, y1 - y0));
  return fx * fy;
}
// a frame point → the sign's own uv (0–1 across it, v up), through the parallelogram its corners make
function uvOf(cam, c, px, py) {
  const [tl, tr, bl] = corners(cam, c);
  const ax = tr[0] - tl[0], ay = tr[1] - tl[1], bx = bl[0] - tl[0], by = bl[1] - tl[1], dx = px - tl[0], dy = py - tl[1];
  const det = ax * by - ay * bx || 1e-6;
  return [(dx * by - dy * bx) / det, 1 - (ax * dy - ay * dx) / det];
}

// The lens's focus: on the caption while it lands (a rack focus: the words are what the shot is about) and whenever
// the shot is wide enough to be about the two of them; on the glass it frames when it moves in on the phone → the
// distance in focus at t (zoom: the pose's)
export function focusAt(t, cam, glass, zoom) {
  const wide = clamp((1.3 - zoom) / 0.3);
  let f = glass;
  for (const c of caps) {
    if ((c.world ?? 'phone') !== 'phone' || t < c.at - 0.25 || t > c.out + 0.3) continue;
    const rack = seg(t, c.at - 0.25, c.at + 0.05) * (1 - seg(t, c.at + 1.05, c.at + 1.45));
    const on = Math.max(rack, wide);
    f += (depthOf(cam, c.pinned.pos) - f) * on * on * (3 - 2 * on);
  }
  return f;
}

// the captions of one world ('phone' or 'universe'), seen through `cam` focused at distance `focus`
export function placeSteps(t, scene, cam, focus, world = 'phone', { order = -5, aperture = 34 } = {}) {
  for (const c of caps) {
    const live = (c.world ?? 'phone') === world && t >= c.at - 0.05 && t < c.out + 0.6;
    if (!live) { c.sg.hide(scene); continue; }
    if (c.carry) c.carry(t, cam);
    const seen = clamp((framed(cam, c) - 0.6) / 0.3);
    if (seen <= 0) { c.sg.hide(scene); continue; }
    c.sg.draw((g) => drawCap(g, c, t));
    const d = depthOf(cam, c.pinned.pos);
    const blur = clamp(aperture * Math.abs(1 - focus / Math.max(0.1, d)), 0, 16);
    // the days' sun, crossing behind the words: a glow round them, their edges lit
    let light = null;
    if (c.sunlit) {
      const sun = sunAt(t);
      if (sun.k > 0) { const [u, v] = uvOf(cam, c, sun.x, sun.y); light = { x: u, y: v, r: 0.42, k: sun.k }; }
    }
    c.sg.place(scene, c.pinned, { order, blur, light, alpha: seen * seen * (3 - 2 * seen), haze: clamp((d - 6) / 30) * 0.25 });
  }
}
export const stepCaps = () => caps;
// v2: a world's captions drawn over the frame instead of placed in its 3D scene — the same pin, carry and focus, but
// on top of the liquid (in the universe Bub's lit glass orb swims in front of the words and hid them)
export function overSteps(ctx, t, cam, world = 'universe') {
  for (const c of caps) {
    if ((c.world ?? 'phone') !== world || t < c.at - 0.05 || t >= c.out + 0.6) continue;
    if (c.carry) c.carry(t, cam);
    const seen = clamp((framed(cam, c) - 0.6) / 0.3);
    if (seen <= 0) continue;
    c.sg.draw((g) => drawCap(g, c, t));
    const [tl, tr, bl] = corners(cam, c);
    ctx.save();
    ctx.globalAlpha *= seen * seen * (3 - 2 * seen);
    ctx.transform((tr[0] - tl[0]) / c.sg.w, (tr[1] - tl[1]) / c.sg.w, (bl[0] - tl[0]) / c.sg.h, (bl[1] - tl[1]) / c.sg.h, tl[0], tl[1]);
    ctx.drawImage(c.sg.canvas, 0, 0, c.sg.w, c.sg.h);
    ctx.restore();
  }
}

// Where a caption stands, for what moves round it (scenes/air.js, the picks in scenes/howto.js):
//   capPoint(i, sx, sy)  a point of caption i's lockup (its sign's px) → world
//   capLineEnd(i, j)     the end of its line j, at the middle of the x-height (sign px)
//   capFrame(i)          its world centre, axes (right, up, toward the lens it was pinned for) and size (units)
export function capPoint(i, sx, sy, out = new THREE.Vector3()) {
  const c = caps[i], { pos, quat, wpp } = c.pinned;
  return out.set((sx - c.sg.w / 2) * wpp, (c.sg.h / 2 - sy) * wpp, 0).applyQuaternion(quat).add(pos);
}
export function capLineEnd(i, j) {
  const c = caps[i], line = c.lines[j];
  return [20 + line.width, 20 + c.top + c.size * 0.8 + j * c.lead - line.xh / 2];
}
// where n beads of radius r (sign px) sit after caption i's last line: on the line if they fit in its measure, else a
// row under it (Chinese lines run long) → [x, y] of each bead's centre, sign px
export function capBeads(i, n, r, gap = 14) {
  const c = caps[i], j = c.lines.length - 1, [ex, ey] = capLineEnd(i, j), x0 = 20;
  const fits = ex + 26 + n * (2 * r + gap) <= c.sg.w + 30;
  return Array.from({ length: n }, (_, k) => (fits ? [ex + 26 + r + k * (2 * r + gap), ey] : [x0 + r + k * (2 * r + gap), ey + c.lead * 0.9]));
}
export function capFrame(i) {
  const c = caps[i], { pos, quat, wpp } = c.pinned;
  return { pos, right: new THREE.Vector3(1, 0, 0).applyQuaternion(quat), up: new THREE.Vector3(0, 1, 0).applyQuaternion(quat),
    toward: new THREE.Vector3(0, 0, 1).applyQuaternion(quat), w: c.sg.w * wpp, h: c.sg.h * wpp, at: c.at, out: c.out, world: c.world ?? 'phone' };
}
