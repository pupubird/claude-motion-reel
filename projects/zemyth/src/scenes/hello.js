// Bars 1–2 · HELLO, WORLD.
// Two lime eyes flicker on in the dark and glance around before anything else exists. The studio
// lights come up as the camera dollies back: they belong to the Zembit, which bounces, waves and says
// hello (its eyes bend into happy arcs, and squash with each syllable). Then the camera pushes back
// into the visor and it blinks — the closed eyes are the lime bars that Chapter 2 opens into the house.
import * as THREE from 'three';
import { W, BEAT, C, FONTS } from '../config.js';
import { ease, seg, clamp, lerp } from '../util.js';
import { kf, blink } from '../anim.js';
import { font } from '../draw2d.js';
import { pill, sparkle, popScale } from '../brand.js';
import { B, HELLO as T, VO_AT } from '../score.js';
import { voEnv, wordAt } from '../assets.js';
import { getWorld, setLights, aim, eyeRects, visorToScreen } from '../zembit/world.js';
import { HEAD } from '../zembit/geometry.js';
import { EYE } from '../zembit/index.js';

const EYE_Y = HEAD.y + EYE.y;                                   // world height of the eyes
const C0 = { pos: new THREE.Vector3(0, EYE_Y, 1.423), tgt: new THREE.Vector3(0, EYE_Y, 0) };   // eyes fill the frame
const C1 = { pos: new THREE.Vector3(0.62, 1.16, 5.5), tgt: new THREE.Vector3(0.3, 1.02, 0) };  // full figure, room for the pill
let w;

// Camera between the close-up and the full figure: distance interpolates logarithmically so the
// perceived zoom speed follows the easing, not the raw distance.
function camAt(e) {
  const z = C0.pos.z * Math.pow(C1.pos.z / C0.pos.z, e);
  return {
    pos: new THREE.Vector3(lerp(C0.pos.x, C1.pos.x, e), lerp(C0.pos.y, C1.pos.y, e), z),
    tgt: new THREE.Vector3(lerp(C0.tgt.x, C1.tgt.x, e), lerp(C0.tgt.y, C1.tgt.y, e), 0),
  };
}
const dolly = (gb) => {
  if (gb < T.push0) return ease.inOutCubic(seg(gb, T.dolly0, T.dolly1));
  return 1 - ease.inOutQuart(seg(gb, T.push0, T.push1));
};

// Power-on flicker (each state ≥ 2 frames so motion blur cannot swallow it), then a settle.
// One soft dip rather than hard off-states: reads as a power-on stutter, stays well clear of
// photosensitivity limits for shapes this large.
function power(gb) {
  if (gb < T.power) return 0;
  const d = gb - T.power;
  if (d < 0.08) return 0.85;
  if (d < 0.15) return 0.42;
  return 1 + 0.06 * Math.exp(-(d - 0.15) * 6);
}

// Saccade: fast move with squash & stretch along the motion.
function saccade(gb, at, from, to, dur = 0.14) {
  const p = seg(gb, at, at + dur);
  return { v: lerp(from, to, ease.outExpo(p)), s: Math.sin(Math.PI * clamp(p)) };
}

function pose(gb, t) {
  const zb = w.zb;
  // gaze in the dark: left, right, back to camera
  const g1 = saccade(gb, T.lookL, 0, -0.062), g2 = saccade(gb, T.lookR, -0.062, 0.062), g3 = saccade(gb, T.lookC, 0.062, 0);
  const g = gb < T.lookR ? g1 : gb < T.lookC ? g2 : g3;
  const gx = gb < T.lookL ? 0 : g.v;
  const gy = gb < T.lookR ? 0.012 * seg(gb, T.lookL, T.lookL + 0.14) : gb < T.lookC ? -0.004 : 0;
  const stretch = gb < T.lookL ? 0 : g.s;
  const talk = voEnv('hello', t - B(VO_AT.hello));
  const happy = kf([[T.happy0, 0], [T.happy0 + 0.12, 1, ease.outCubic], [T.happy1, 1], [T.happy1 + 0.15, 0]], gb);
  const open = Math.min(blink(gb, T.blink), gb >= T.close0 ? lerp(1, 0.1, ease.inCubic(seg(gb, T.close0, T.close1))) : 1);
  const eye = { open, gx, gy, sx: 1 + 0.16 * stretch, sy: (1 - 0.09 * stretch) * (1 - 0.1 * talk), happy };
  zb.setFace({ L: eye, R: eye, power: power(gb), glass: 1 });

  // body: a hello bounce, head tilt, the wave with follow-through in the wrist
  const squash = kf([[4.62, 1], [4.8, 0.955, ease.inOutQuad], [4.97, 1.035, ease.outQuad], [5.2, 0.992], [5.4, 1]], gb) + 0.006 * Math.sin(t * 2.6);
  const hop = kf([[4.8, 0], [4.97, 0.035, ease.outQuad], [5.16, 0, ease.inQuad]], gb);
  const tilt = kf([[T.tilt, 0], [T.tilt + 0.35, 0.16, (x) => ease.outBack(x, 2)], [T.lookCam, 0.16], [T.lookCam + 0.3, 0]], gb);
  const turn = kf([[T.lights0, 0.05], [T.tilt, -0.04], [T.tilt + 0.4, 0.03], [T.lookCam + 0.3, 0]], gb) + 0.02 * talk;
  const nod = 0.03 * talk - 0.02 * kf([[4.78, 0], [4.97, 1], [5.2, 0]], gb);
  const up = kf([[T.arm, 0], [T.arm + 0.34, 1, (x) => ease.outBack(x, 1.6)], [T.wave1, 1], [T.wave1 + 0.32, 0]], gb);
  const wv = seg(gb, T.wave0, T.wave0 + 0.2) * (1 - seg(gb, T.wave1 - 0.25, T.wave1));
  const ph = (gb - T.wave0) * Math.PI * 2;
  const arms = [
    { raise: 0.46 + 0.04 * up, bend: 0.22, bendZ: 0.12 - 0.05 * up, wrist: 0.1 },
    { raise: lerp(0.4, 1.22, up), swing: 0.18 * up, bend: 0.1, bendZ: lerp(0.08, 1.32, up) + 0.3 * wv * Math.sin(ph), wrist: 0.26 * wv * Math.sin(ph - 0.9) },
  ];
  zb.setPose({ y: hop, squash, tilt, turn, nod, leanZ: -0.03 * up, arms });
}

function init(env) { w = getWorld(env.renderer); }

function update(t) {
  const gb = t / BEAT;
  pose(gb, t);
  const lights = seg(gb, T.lights0, T.lights1, ease.inOutSine) * (1 - seg(gb, 7.25, T.push1, ease.inOutSine));
  setLights(w, lights);
  const c = camAt(dolly(gb));
  aim(w, c.pos, c.tgt);
  // tonemap 0 (clamp): the eyes must land on brand lime exactly; the lighting is budgeted to stay < 1
  return { scene: w.scene, camera: w.camera, bloom: { strength: 0 }, tonemap: 0 };
}

/* ------------------------------------------------------------- 2D overlay */
const PILL_WORDS = ['HELLO,', 'WORLD!'];
function drawOverlay(ctx, t) {
  const gb = t / BEAT;
  pose(gb, t);
  aim(w, camAt(dolly(gb)).pos, camAt(dolly(gb)).tgt);
  // the pill hangs off the head's upper right, so it rides along with the bounce and tilt
  const [ax, ay] = visorToScreen(w, 0.5, 0.36);
  const t0 = B(VO_AT.hello);
  const shown = PILL_WORDS.filter((_, i) => t >= t0 + wordAt('hello', i) - 0.02).length;
  const pIn = seg(t, t0 + wordAt('hello', 0) - 0.02, t0 + wordAt('hello', 0) + 0.3);
  const pOut = seg(gb, T.pillOut, T.pillOut + 0.22, ease.inBack);
  const s = popScale(pIn) * (1 - pOut);
  if (s > 0.001 && shown > 0) {
    font(ctx, { f: FONTS.display, w: 700, s: 40 });
    const full = ctx.measureText(PILL_WORDS.join(' ')).width;
    const part = ctx.measureText(PILL_WORDS.slice(0, shown).join(' ')).width;
    // width eases to the words spoken so far
    const grow = shown === 2 ? ease.outBack(seg(t, t0 + wordAt('hello', 1) - 0.02, t0 + wordAt('hello', 1) + 0.22), 1.4) : 1;
    const tw = shown === 2 ? lerp(ctx.measureText(PILL_WORDS[0]).width, full, grow) : part;
    const ph = 72, pw = tw + 60;
    const cx = ax + 70 + pw / 2, cy = ay - 70;
    ctx.save();
    ctx.translate(ax + 40, ay - 40);
    ctx.scale(s, s);
    ctx.translate(-(ax + 40), -(ay - 40));
    pill(ctx, cx, cy, pw, ph, { fill: C.lime, tilt: -0.07 });
    ctx.translate(cx, cy);
    ctx.rotate(-0.07);
    ctx.beginPath();
    ctx.rect(-pw / 2 + 12, -ph / 2, pw - 24, ph);
    ctx.clip();
    ctx.fillStyle = C.black;
    ctx.textBaseline = 'middle';
    ctx.fillText(PILL_WORDS.slice(0, shown).join(' '), -tw / 2, 3);
    ctx.restore();
  }
  // sparkles pop around the wave
  const spots = [[ax + 20, ay + 150, 26, C.white], [ax + 420, ay - 170, 18, C.lime], [ax - 360, ay - 120, 22, C.white]];
  T.sparkles.forEach((b, i) => {
    const p = seg(gb, b, b + 0.7);
    if (p <= 0 || p >= 1) return;
    const r = spots[i][2] * popScale(p * 1.6) * (1 - ease.inCubic(seg(p, 0.55, 1)));
    sparkle(ctx, spots[i][0], spots[i][1], r, spots[i][3], p * 0.9);
  });
}

// Screen rectangles of the closed eyes at the hand-off frame (Chapter 2 draws its bars here).
let HANDOFF = null;
export function handoffBars(env) {
  if (!HANDOFF) {
    if (!w) init(env);
    update(B(T.handoff) - 1e-4);
    HANDOFF = eyeRects(w);
  }
  return HANDOFF;
}

export default {
  id: 'hello',
  init,
  three: { start: 0, end: B(T.handoff), update },
  layers: [{ start: B(4.5), end: B(T.push0 + 0.5), draw: drawOverlay }],
};
