// Bars 15–16 · SIGNATURE (final hit).
// The locked mark is on the Zembit's visor: the camera pulls back out of the screen we have been
// watching since bar 3 and finds it standing there. The mark leaves the visor — handed from the 3D
// glass to 2D at its exact projected pixels — and arcs into the lockup while the Zembit's eyes come
// back on and follow it there. "Funding builders!" A wave, a wink. The lights go down, the eyes stay
// a moment, then switch off — the film ends the way it began.
import * as THREE from 'three';
import { W, H, BEAT, C, FONTS } from '../config.js';
import { ease, seg, clamp, lerp } from '../util.js';
import { kf, blink } from '../anim.js';
import { font } from '../draw2d.js';
import { lockup, pill, sparkle, popScale, inkPath, drawArrow, MARK_H } from '../brand.js';
import { B, SIGN as T, VO_AT, MARK } from '../score.js';
import { voEnv, wordAt } from '../assets.js';
import { getWorld, setLights, aim, visorToScreen } from '../zembit/world.js';
import { HEAD } from '../zembit/geometry.js';
import { EYE } from '../zembit/index.js';

const EYE_Y = HEAD.y + EYE.y;
const C0 = { pos: new THREE.Vector3(0, EYE_Y, 1.423), tgt: new THREE.Vector3(0, EYE_Y, 0) };
const C2 = { pos: new THREE.Vector3(-1.16, 1.32, 5.3), tgt: new THREE.Vector3(-1.16, 1.1, 0) };
// the lockup, left column
export const LOCK = { x: 150, y: 392, h: 150 };
const PILL_WORDS = ['FUNDING', 'BUILDERS'];
let w, visorMarkH = 0.167, flyFrom = null;

function camAt(gb) {
  const e = ease.outQuart(seg(gb, T.pull0, T.pull1));
  const e2 = ease.inOutCubic(seg(gb, T.pull0 + 0.15, T.pull1));
  return {
    pos: new THREE.Vector3(lerp(C0.pos.x, C2.pos.x, e2), lerp(C0.pos.y, C2.pos.y, e), C0.pos.z * Math.pow(C2.pos.z / C0.pos.z, e)),
    tgt: new THREE.Vector3(lerp(C0.tgt.x, C2.tgt.x, e2), lerp(C0.tgt.y, C2.tgt.y, e), 0),
  };
}

function pose(gb, t) {
  const zb = w.zb;
  const talk = voEnv('funding', t - B(VO_AT.funding));
  // eyes: off while the mark is on the visor, flicker on as it leaves, follow it to the lockup
  let power = 0;
  if (gb >= T.eyesOn) {
    const d = gb - T.eyesOn;
    power = d < 0.06 ? 0.8 : d < 0.1 ? 0.1 : 1;
  }
  const follow = kf([[T.fly0, 0], [T.fly0 + 0.25, 1, ease.outCubic], [58.25, 1], [58.55, 0]], gb);
  const happy = kf([[T.happy0, 0], [T.happy0 + 0.12, 1, ease.outCubic], [T.happy1, 1], [T.happy1 + 0.15, 0]], gb);
  const wink = kf([[T.wink, 0], [T.wink + 0.1, 1, ease.outCubic], [T.wink + 0.55, 1], [T.wink + 0.7, 0]], gb);
  let open = blink(gb, 60.9) * (1 - 0.9 * seg(gb, T.off0, T.off0 + 0.12, ease.inCubic));
  const offSx = 1 - 0.9 * seg(gb, T.off0 + 0.12, T.off1, ease.inQuad);
  const eyeL = { open, gx: -0.068 * follow, gy: 0.018 * follow, happy: Math.max(happy, wink), sx: offSx, sy: 1 - 0.1 * talk };
  const eyeR = { open, gx: -0.068 * follow, gy: 0.018 * follow, happy, sx: offSx, sy: 1 - 0.1 * talk };
  const lit = power * (1 - seg(gb, T.off0 + 0.12, T.off1));
  zb.setFace({
    L: eyeL, R: eyeR, power: lit,
    mark: gb < T.fly0 ? { on: 1, cx: 0, cy: EYE.y, h: visorMarkH, hideEyes: 1 } : null,
  });
  // body: turn toward the lockup, watch the mark land, wave, wink with a head tilt
  const yaw = -0.24 * ease.inOutCubic(seg(gb, T.pull0 + 0.3, T.pull1));
  const turn = -0.2 * follow + 0.015 * talk;
  const tilt = 0.12 * wink + 0.05 * happy;
  // no breathing at the hand-off frame: the visor mark must sit exactly on the locked mark's pixels
  const squash = kf([[56.0, 1], [56.12, 0.97, ease.outQuad], [56.4, 1.02], [56.7, 1]], gb) + 0.006 * Math.sin(t * 2.6) * seg(gb, 56.2, 56.8);
  const up = kf([[T.wave0 - 0.35, 0], [T.wave0, 1, (x) => ease.outBack(x, 1.6)], [T.wave1, 1], [T.wave1 + 0.3, 0]], gb);
  const wv = seg(gb, T.wave0, T.wave0 + 0.2) * (1 - seg(gb, T.wave1 - 0.25, T.wave1));
  const ph = (gb - T.wave0) * Math.PI * 2;
  const arms = [
    { raise: 0.46, bend: 0.22, bendZ: 0.12, wrist: 0.1 },
    { raise: lerp(0.4, 1.22, up), swing: 0.18 * up, bend: 0.1, bendZ: lerp(0.08, 1.32, up) + 0.3 * wv * Math.sin(ph), wrist: 0.26 * wv * Math.sin(ph - 0.9) },
  ];
  zb.setPose({ yaw, squash, turn, tilt, nod: 0.03 * talk, arms });
}

function init(env) {
  w = getWorld(env.renderer);
  // size the visor's mark so that, from the close-up, it covers exactly the locked 2D/3D mark (360 px)
  aim(w, C0.pos, C0.tgt);
  w.zb.setPose({});
  const a = visorToScreen(w, 0, EYE.y + 0.05), b = visorToScreen(w, 0, EYE.y - 0.05);
  visorMarkH = (MARK.size / Math.abs(b[1] - a[1])) * 0.1;
}

function update(t) {
  const gb = t / BEAT;
  pose(gb, t);
  setLights(w, seg(gb, T.lights0, T.lights1, ease.inOutSine) * (1 - seg(gb, T.dim0, T.dim1, ease.inOutSine)));
  const c = camAt(gb);
  aim(w, c.pos, c.tgt);
  return { scene: w.scene, camera: w.camera, bloom: { strength: 0 }, tonemap: 0 };
}

// Where the visor's mark is on screen at the instant it leaves (centre, tile height).
function flyStart() {
  if (!flyFrom) {
    const t0 = B(T.fly0) - 1e-4;
    pose(T.fly0 - 1e-4 / BEAT, t0);
    const c = camAt(T.fly0);
    aim(w, c.pos, c.tgt);
    const [cx, cy] = visorToScreen(w, 0, EYE.y);
    const a = visorToScreen(w, 0, EYE.y + visorMarkH / 2), b = visorToScreen(w, 0, EYE.y - visorMarkH / 2);
    flyFrom = { cx, cy, h: Math.abs(b[1] - a[1]) };
  }
  return flyFrom;
}

/* -------------------------------------------------------------------- 2D */
const ARROW = inkPath([[590, 690], [540, 668], [468, 676], [404, 712]], 16);

function draw(ctx, t) {
  const gb = t / BEAT;
  const fade = 1 - seg(gb, T.dim0, T.dim1 - 0.1, ease.inOutSine);
  if (fade <= 0) return;
  ctx.save();
  ctx.globalAlpha *= fade;
  const markTile = { x: LOCK.x, y: LOCK.y, h: LOCK.h };
  // the mark's flight from the visor to the lockup (upright: the brand only allows 0° / 90°)
  if (gb < T.fly1) {
    const f0 = flyStart();
    const p = ease.outCubic(seg(gb, T.fly0, T.fly1));
    const MC = (0.5 + 32.15 / 2) / 32;               // the lockup mark's centre, as a fraction of its height
    const tx = markTile.x + MC * markTile.h, ty = markTile.y + markTile.h / 2;
    const mx = lerp(lerp(f0.cx, (f0.cx + tx) / 2, p), lerp((f0.cx + tx) / 2, tx, p), p);
    const my = lerp(lerp(f0.cy, Math.min(f0.cy, ty) - 170, p), lerp(Math.min(f0.cy, ty) - 170, ty, p), p);
    const h = lerp(f0.h, markTile.h, ease.outBack(clamp(p), 1.3));
    // draw the lockup's own mark paths at the flight position (identical geometry to the landed one)
    lockup(ctx, mx - MC * h, my - h / 2, h, C.lime, { reveal: 0 });
  } else {
    const r = ease.outExpo(seg(gb, T.word0, T.word1));
    lockup(ctx, markTile.x, markTile.y, markTile.h, C.lime, { reveal: r });
  }
  // eyebrow above the lockup
  const eb = seg(gb, T.eyebrow, T.eyebrow + 0.4, ease.outExpo);
  if (eb > 0) {
    ctx.save();
    font(ctx, { f: FONTS.label, w: 700, s: 20 });
    ctx.letterSpacing = '4px';
    ctx.fillStyle = C.dim;
    ctx.beginPath(); ctx.rect(0, LOCK.y - 64, W / 2, 44); ctx.clip();
    ctx.fillText('ZEMYTH HACKERHOUSE · KUALA LUMPUR', LOCK.x + 2, LOCK.y - 32 + (1 - eb) * 30);
    ctx.restore();
  }
  // "FUNDING BUILDERS": an outline pill that grows word by word with the voice
  const t0 = B(VO_AT.funding);
  const shown = PILL_WORDS.filter((_, i) => t >= t0 + wordAt('funding', i) - 0.03).length;
  if (shown > 0) {
    font(ctx, { f: FONTS.display, w: 700, s: 36 });
    ctx.letterSpacing = '0px';
    const w0 = ctx.measureText(PILL_WORDS[0]).width, full = ctx.measureText(PILL_WORDS.join(' ')).width;
    const grow = shown === 2 ? ease.outBack(seg(t, t0 + wordAt('funding', 1) - 0.03, t0 + wordAt('funding', 1) + 0.22), 1.3) : 1;
    const tw = shown === 2 ? lerp(w0, full, grow) : w0;
    const ph = 76, pw = tw + 64;
    const s = popScale(seg(t, t0 + wordAt('funding', 0) - 0.03, t0 + wordAt('funding', 0) + 0.3));
    const cx = LOCK.x + pw / 2, cy = LOCK.y + LOCK.h + 74;
    ctx.save();
    ctx.translate(LOCK.x, cy);
    ctx.scale(s, s);
    ctx.translate(-LOCK.x, -cy);
    pill(ctx, cx, cy, pw, ph, { fill: null, stroke: C.lime, lw: 3, tilt: -0.07 });
    ctx.translate(cx, cy);
    ctx.rotate(-0.07);
    ctx.beginPath(); ctx.rect(-pw / 2 + 14, -ph / 2, pw - 28, ph); ctx.clip();
    ctx.fillStyle = C.white;
    ctx.textBaseline = 'middle';
    ctx.fillText(PILL_WORDS.slice(0, shown).join(' '), -tw / 2, 3);
    ctx.restore();
  }
  // the address, and a hand-drawn arrow pointing at it
  const up = seg(gb, T.url, T.url + 0.4, ease.outExpo);
  if (up > 0) {
    ctx.save();
    font(ctx, { f: FONTS.sans, w: 600, s: 32 });
    ctx.fillStyle = C.white;
    ctx.beginPath(); ctx.rect(0, 690, W / 2, 60); ctx.clip();
    ctx.fillText('zemyth.app', LOCK.x + 2, 734 + (1 - up) * 40);
    ctx.restore();
  }
  const ap = seg(gb, T.arrow0, T.arrow1, ease.inOutSine);
  drawArrow(ctx, ARROW, ap, { color: C.white, w: 4.5, head: 20, headP: seg(gb, T.arrow1, T.arrow1 + 0.15) });
  // sparkles on the beat, around the lockup and the Zembit
  const spots = [[LOCK.x + 190, LOCK.y - 18, 20, C.lime], [1640, 250, 26, C.white], [990, 430, 16, C.white], [1185, 180, 18, C.lime]];
  T.sparkles.forEach((b, i) => {
    const p = seg(gb, b, b + 0.8);
    if (p <= 0 || p >= 1) return;
    const r = spots[i][2] * popScale(p * 1.6) * (1 - ease.inCubic(seg(p, 0.55, 1)));
    sparkle(ctx, spots[i][0], spots[i][1], r, spots[i][3], p * 0.9);
  });
  ctx.restore();
}

export default {
  id: 'signature',
  init,
  three: { start: B(56), end: B(64) + 1, update },
  layers: [{ start: B(T.fly0), end: B(64) + 1, draw }],
};
