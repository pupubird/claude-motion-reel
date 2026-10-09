// LAB · pick (v2 prototype 2: Bub as a lens; research/refs/04, 10). Look-dev on its own clock from 0: render with
// --scenes=lab_pick. Bub hops out of the app's avatar slot and down onto the value tags. He is a drop of water in a
// soap skin, so what he sits on is seen through him (magnified and upright while he touches the glass, turned over
// once he is in the air: the liquid layer traces both surfaces). Each landing throws droplets that pinch off him and
// a ripple over the glass, and fills the tag with its colour from where he touched it; as he pushes off, the tag
// lifts off the screen as a pill of Liquid Glass. Then the three colours rise off their pills as beads, he drinks
// them, and he is your orb.
import * as THREE from 'three';
import { W, H, SH } from '../config.js';
import { C, FONTS, UI, P, SPRING, MOVE } from '../brand.js';
import { T, fill } from '../copy.js';
import { clamp, lerp, seg, ease, spring, smoothstep, TAU, rgba, rng } from '../util.js';
import { squirclePath, text, measure, about } from '../ui/kit.js';
import { homeIndicator } from '../ui/ios.js';
import { K, appSky, topBar, aiTag, glass } from '../ui/app.js';
import { layoutMsg, drawMsg } from '../ui/chat.js';
import { system as systemUI, SCREEN_SCALE } from '../ui/phone.js';
import { phoneCamera, LAYOUT } from '../ui/phonecam.js';
import { phone3d, toWorld, FACE_Z } from '../gl/phone3d.js';
import { bubPrim } from '../liquid2d.js';
import { glint } from './lab_fx.js';

const pt = (v) => v * K;
const L = LAYOUT;
const PX = 1 / W;                                  // one screen design px in world units
const GLASS_Z = FACE_Z + 0.0015;                   // the screen's surface (world z): the plane the lens looks at
export const DUR = 4.0;
const PICKS = ['family', 'career', 'adventure'];
const ORDER = ['family', 'wealth', 'career', 'health', 'learning', 'adventure'];
const BR = pt(40);                                 // Bub's radius on the glass (design px; a tag is 44 pt tall)
const AV = { x: W / 2, y: 62 * K + 22 * K, r: 22 * K };   // the avatar slot in the top bar (ui/app.js topBar)
// the beat: out of the slot, three hops landing on 8ths, a hop of joy, the drink, your orb
const TT = { out: 0.08, hops: [[0.4, 0.75], [1.0, 1.25], [1.5, 1.75]], joy: 2.0, drink: 2.25, full: 3.05 };
const UP = [TT.hops[1][0], TT.hops[2][0], TT.joy];  // when each picked tag lifts off as glass (as he pushes off it)

let PSCENE, PH, CAM, chips, mB1, mB2;
const _v = new THREE.Vector3();

// a framing: the screen point (fx, fy) lands on frame (ax, ay) with the screen zoomed by z (ui/phonecam.js's shot),
// seen from yaw / pitch / roll degrees
const shot = (z, fx, fy, yaw = 0, pitch = 0, roll = 0, ax = W / 2, ay = 960) => {
  const sc = SCREEN_SCALE * z;
  return { cx: ax - fx * sc + (W * sc) / 2, top: ay - fy * sc, s: z, yaw: yaw * Math.PI / 180, pitch: pitch * Math.PI / 180, roll: roll * Math.PI / 180 };
};

export default {
  init(env) {
    PSCENE = new THREE.Scene();
    PSCENE.add(env.makeBackdrop());
    PH = phone3d(env);
    PSCENE.add(PH.group);
    CAM = new THREE.PerspectiveCamera();
    const lm = (s) => layoutMsg(s, K, { maxW: 300, size: 19 });
    mB1 = lm(T.bub.hi);
    mB2 = lm(T.bub.ask);
    const mctx = document.createElement('canvas').getContext('2d');
    chips = ORDER.map((key) => ({ key, label: `${P[key].emoji}  ${P[key].label}` }));
    for (let r = 0; r < 3; r++) {
      const pair = chips.slice(r * 2, r * 2 + 2);
      const ws = pair.map((c) => measure(mctx, c.label, { f: FONTS.ui, w: 650, size: pt(17.5) }) + pt(34));
      let x = W / 2 - (ws[0] + ws[1] + pt(10)) / 2;
      pair.forEach((c, i) => { c.x = x; c.y = L.onb.chips + r * L.onb.row; c.w = ws[i]; c.h = L.onb.chipH; x += ws[i] + pt(10); });
    }
    for (const c of chips) { c.cx = c.x + c.w / 2; c.cy = c.y + c.h / 2; }
  },

  three: {
    start: 0, end: DUR,
    update(t) {
      const pose = poseAt(t);
      phoneCamera(pose, CAM, H);
      PH.draw((c) => { screen(c, t); systemUI(c); }, clamp(SCREEN_SCALE * pose.s * 1.25, 0.6, 2.2));
      return { scene: PSCENE, camera: CAM, bloom: { strength: 0 } };
    },
  },

  liquid: { start: 0, end: DUR, frame: liquid },

  // the light Bub catches: a glint on his highlight at each landing and when he is full
  layers: [{ start: 0, end: DUR, draw: overLayer }],

  fx() {
    // the world behind the phone: a light silk field (post.js FIELD_FRAG), and a shutter a little longer than film's
    return { field: { colors: ['#DDEEFF', '#FFE6D8', '#FFD9EC', '#D6F4EC'], flow: 1, silk: 1 }, shutter: 0.6 };
  },
};

// ── the camera: a follow-cam on Bub — it frames where he has just been (an average over the last 0.3 s, so it lags
// him and never jerks), pushes in for each landing, eases out to watch him drink, and in again on your orb ──────────
const tag = (k) => chips.find((c) => c.key === k);
const ZOOM = [[0, 2.9], [0.35, 2.65], [1.9, 2.75], [2.3, 2.2], [3.0, 2.3], [4.0, 3.0]];
const zoomAt = (t) => {
  for (let i = 1; i < ZOOM.length; i++) if (t < ZOOM[i][0]) return lerp(ZOOM[i - 1][1], ZOOM[i][1], ease.inOutSine(invLerpT(ZOOM[i - 1][0], ZOOM[i][0], t)));
  return ZOOM[ZOOM.length - 1][1];
};
const invLerpT = (a, b, x) => clamp((x - a) / (b - a));
// the screen point that lies behind him on the frame: raised off the glass toward a lens that looks down the screen
// from above and round to the side, he is seen lower and to the left of the point under him
function followAt(t, yaw, pitch) {
  let sx = 0, sy = 0, sw = 0;
  for (let i = 0; i < 12; i++) {
    const tt = Math.max(0, t - i * 0.025), w = Math.exp(-i * 0.22);
    const b = bubAt(tt);
    sx += (b.x - b.h * Math.tan(yaw)) * w; sy += (b.y + b.h * Math.tan(pitch)) * w; sw += w;
  }
  return [sx / sw, sy / sw];
}
function poseAt(t) {
  // a slow orbit that never stops: the lens swings round him, from a little above the glass
  const yaw = 9 * Math.sin(t * 1.25 + 0.4), pitch = 15 + 4 * Math.sin(t * 0.9), roll = 1.6 * Math.sin(t * 1.1);
  const [fx, fy] = followAt(t, yaw * Math.PI / 180, pitch * Math.PI / 180);
  const kick = TT.hops.reduce((s, [, l]) => s + (t > l ? 0.03 * Math.exp(-(t - l) * 9) * Math.cos((t - l) * 22) : 0), 0);
  return shot(zoomAt(t) * (1 + kick), fx, fy, yaw, pitch, roll, W / 2, 1000);
}

// ── Bub: where he is (screen design px), how high above the glass his centre is, his squash ───────────────────────────
function bubAt(t) {
  const stops = PICKS.map((k) => [tag(k).cx, tag(k).cy]);
  // out of the slot: he inflates from the avatar's size and sits up off the glass
  const outP = spring(t - TT.out, SPRING.pop);
  let x = AV.x, y = AV.y, r = lerp(AV.r * 0.95, BR, outP), h = r, sq = 0, sqDir = [0, 1, 0], air = 0;
  let from = [AV.x, AV.y];
  for (let i = 0; i < 3; i++) {
    const [t0, t1] = TT.hops[i], to = stops[i];
    if (t < t0 - 0.1) break;
    if (t < t0) {                                                    // the crouch before the jump
      x = from[0]; y = from[1]; sq = -0.12 * Math.sin(seg(t, t0 - 0.1, t0) * Math.PI * 0.5);
    } else if (t < t1) {                                             // in the air: a ballistic arc, stretched along it
      const u = (t - t0) / (t1 - t0);
      x = lerp(from[0], to[0], u); y = lerp(from[1], to[1], u);
      air = 4 * u * (1 - u);
      h = r + BR * 2.1 * air;
      // his velocity in world axes (x right, y up the screen, z off the glass), design px per second
      const v = [(to[0] - from[0]) / (t1 - t0), -(to[1] - from[1]) / (t1 - t0), BR * 2.1 * 4 * (1 - 2 * u) / (t1 - t0)];
      const sp = Math.hypot(...v) || 1;
      sq = 0.16 * Math.min(1, sp / 2600);
      sqDir = v.map((c) => c / sp);
    } else {                                                         // landed: a soft squash that wobbles out
      x = to[0]; y = to[1];
      const d = t - t1;
      sq = -0.22 * Math.exp(-d * 7) * Math.cos(d * 26);
    }
    from = to;
  }
  // a hop of joy once all three are picked
  const j = t - TT.joy;
  if (j > 0 && j < 0.32) { const u = j / 0.32; h = r + BR * 0.7 * 4 * u * (1 - u); sq = 0.08 * (1 - 2 * u); }
  // the drink: he lifts off the glass over the middle of the tags as the beads come to him, then floats up at you
  const lift = seg(t, TT.drink, TT.drink + 0.5, MOVE.go);
  const rise = seg(t, TT.full - 0.1, DUR, MOVE.go);
  const mid = tag('career').cy + pt(20);
  x = lerp(x, W / 2, lift); y = lerp(y, mid, lift);
  h = lerp(h, BR * 2.6, lift) + BR * 3.2 * rise;
  const ink = seg(t, TT.drink + 0.25, TT.full, ease.inOutCubic);
  r *= 1 + 0.14 * ink + 0.012 * Math.sin(t * 3.1);
  return { x, y, r, h, sq, sqDir, air, ink, out: outP };
}

// ── a picked tag as Liquid Glass: it lifts off the screen as he pushes off it ────────────────────────────────────────
const PILL_H = pt(1.5);                              // the glass lies on its tag (a raised pill parts from its label as the lens turns)
function pillAt(i, t) {
  const p = spring(t - UP[i], SPRING.pop);
  if (p <= 0.001) return null;
  const c = tag(PICKS[i]);
  return { c, p, h: PILL_H * p };
}

// ── the beads: each picked pill's colour rises off it and runs to Bub ─────────────────────────────────────────────────
const BEAD = (i) => TT.drink + 0.05 + i * 0.16;
function beadAt(i, t, bub) {
  const c = tag(PICKS[i]), t0 = BEAD(i);
  const u = seg(t, t0, t0 + 0.55, ease.inOutCubic);
  if (t < t0 || u >= 1) return null;
  const grow = spring(t - t0, SPRING.pop);
  const k = u * u * (3 - 2 * u);
  const x = lerp(c.cx, bub.x, k), y = lerp(c.cy, bub.y, k);
  const h = lerp(PILL_H, bub.h, k) + BR * 1.2 * Math.sin(Math.PI * u);
  const r = pt(19) * grow * (1 - 0.55 * smoothstep(0.75, 1, u));
  return { x, y, h, r, color: P[PICKS[i]].color };
}

// ── the splash: each landing throws a few droplets that pinch off his base, skid out over the glass and dry up ───────
const SPLASH = TT.hops.map((_, i) => {
  const R = rng(40 + i);
  return Array.from({ length: 5 }, (_, k) => ({ a: (k / 5) * TAU + R() * 0.9, v: 0.9 + R() * 0.8, up: 0.6 + R() * 0.7, r: 0.12 + R() * 0.09 }));
});
function splashAt(t) {
  const out = [];
  TT.hops.forEach(([, tl], i) => {
    const d = t - tl;
    if (d < 0 || d > 0.7) return;
    const at = [tag(PICKS[i]).cx, tag(PICKS[i]).cy];
    for (const s of SPLASH[i]) {
      const reach = BR * (0.55 + 1.15 * s.v * (1 - Math.exp(-d * 5)));      // out from under him, slowing on the glass
      const hop = BR * 0.55 * s.up * Math.max(0, Math.sin(Math.min(1, d / 0.32) * Math.PI));
      const r = BR * s.r * (1 - smoothstep(0.35, 0.7, d));
      out.push({ x: at[0] + Math.cos(s.a) * reach, y: at[1] + Math.sin(s.a) * reach * 0.8, h: r + hop, r });
    }
  });
  return out;
}

const wpt = (x, y, h) => toWorld(x, y, h);
const DROP = { glass: 1, lens: 1.33, lensZ: GLASS_Z, disp: 0.035, coat: 1, refr: 0, frost: 0, haze: 0, tintAmt: 0, edge: 0.7, env: 1.0, spec: 1.1, rim: 1.6, thick: 420 };
function liquid(t) {
  if (t < TT.out) return null;
  const b = bubAt(t);
  const { prim, face } = bubPrim({
    pos: wpt(b.x, b.y, b.h), r: b.r * PX, squash: b.sq, squashDir: b.sqDir, camPos: CAM.position.toArray(),
    blink: blink(t), happy: t > TT.joy - 0.05 && t < TT.drink + 0.2 ? 1 : 0, wide: b.air > 0.3 ? 0.6 : 0,
    look: [0.25 * Math.sin(t * 2.3), 0.12], blush: 0.55, eyeScale: 0.74, group: 1, k: 0.035,
  });
  const inkU = b.ink;
  const prims = [{
    ...prim, ...DROP,
    // as he drinks, the inks: your three colours, filling him
    glass: 1 - inkU, fill: 0.95 * inkU, tint: P.family.color, c2: P.career.color, c3: P.adventure.color, ncol: 3, glow: 0.2,
  }];
  // the droplets he throws: the same water as him (his group), so they leave him on a neck and pinch off
  for (const d of splashAt(t)) if (d.r > 1) prims.push({ type: 'sphere', pos: wpt(d.x, d.y, d.h), size: [d.r * PX], group: 1, k: 0.035, ...DROP, coat: 0.6, seed: d.x });
  // the picked tags as glass pills over their colour
  for (let i = 0; i < 3; i++) {
    const pl = pillAt(i, t);
    if (!pl) continue;
    const { c } = pl, hz = pt(4) * pl.p;
    prims.push({ type: 'slab', pos: wpt(c.cx, c.cy, pl.h + hz), size: [c.w / 2 * PX * (1.02 + 0.03 * pl.p), c.h / 2 * PX * 1.04, hz * PX], round: c.h / 2 * PX * 1.04,
      group: 10 + i, glass: 1, refr: 0.022, frost: 0, haze: 0, tint: '#FFFFFF', tintAmt: 0, edge: 0.45, env: 1.15, spec: 1.3, fill: 0 });
  }
  for (let i = 0; i < 3; i++) {
    const d = beadAt(i, t, b);
    if (!d || d.r < 0.5) continue;
    prims.push({ type: 'sphere', pos: wpt(d.x, d.y, d.h), size: [d.r * PX], group: 1, k: 0.035, glass: 0, fill: 0.95, tint: d.color, ncol: 1, thick: 380,
      glow: 0.15, rim: 0.8, haze: 0.03, edge: 0.55, env: 1.0, spec: 1, wobble: 0.01, seed: 3 + i });
  }
  // the light he catches as he fills: a strip light sweeps over every surface
  const sw = seg(t, TT.full - 0.15, TT.full + 0.6, ease.inOutSine);
  return {
    prims, cam: CAM, useDepth: true, face,
    env: { skyTop: '#EAF4FF', skyHor: '#FFF0E6', skyLow: '#B9B3C4', keyDir: [-0.55, 0.62, 0.58], keyGain: 4.5, ssr: 0.35 },
    ...(sw > 0 && sw < 1 ? { sweep: [2.3, lerp(-1, 1, sw), 5.5 * Math.sin(sw * Math.PI), 0.09], sweepTilt: 0.35 } : {}),
  };
}
const blink = (t) => { for (const b of [0.62, 2.6]) { const d = t - b; if (d > 0 && d < 0.16) return Math.sin(d / 0.16 * Math.PI); } return 0; };

// ── over the frame: the glints (a landing, the full orb) where his highlight sits ────────────────────────────────────
function overLayer(ctx, t) {
  if (t < TT.out) return;
  const b = bubAt(t);
  const hits = [...TT.hops.map(([, l]) => l), TT.full];
  for (const t0 of hits) {
    const d = t - t0;
    if (d < -0.02 || d > 0.35) continue;
    // his highlight: up and to the key's side of his centre
    _v.set(...wpt(b.x - b.r * 0.42, b.y - b.r * 0.5, b.h + b.r * 0.6)).project(CAM);
    const x = (_v.x + 1) / 2 * W, y = (1 - _v.y) / 2 * H;
    const scale = CAM.projectionMatrix.elements[5] * H / 2 / Math.max(0.05, CAM.position.distanceTo(_v.set(...wpt(b.x, b.y, b.h))));
    glint(ctx, x, y, (t0 === TT.full ? 1.6 : 1.0) * b.r * PX * scale * 1.6, Math.max(0, d), 0.35);
  }
}

// ── the screen ─────────────────────────────────────────────────────────────────────────────────────────────────────
function screen(ctx, t) {
  appSky(ctx);
  const b = bubAt(t);
  // the avatar: Bub himself until he steps out of it, then the empty glass slot he came from
  topBar(ctx, t, {
    title: 'Bub', sub: T.bub.sub,
    avatar: (c, x, y, r) => {
      glass(c, squirclePath(x - r, y - r, 2 * r, 2 * r, r), { k: K });
      if (t < TT.out + 0.02) { c.save(); c.fillStyle = rgba('#B8C6E8', 0.5); c.beginPath(); c.arc(x, y, r * 0.86, 0, TAU); c.fill(); c.restore(); }
    },
    right: (c, x, y) => aiTag(c, x + 8 * K, y + 12 * K),
  });
  drawMsg(ctx, mB1, pt(16), L.onb.m1, 'in', t, -1, { fill: '#FFFFFF', ink: UI.ink, k: K, lift: 0.6, joinBottom: true });
  drawMsg(ctx, mB2, pt(16), L.onb.m1 + mB1.H + pt(4), 'in', t, -1, { fill: '#FFFFFF', ink: UI.ink, k: K, lift: 0.6, joinTop: true });
  const picked = TT.hops.filter(([, l]) => t >= l).length;
  counter(ctx, t, picked);
  chips.forEach((c) => {
    const rank = PICKS.indexOf(c.key);
    chipView(ctx, c, t, rank, rank >= 0 ? TT.hops[rank][1] : Infinity);
  });
  // each landing: a ripple runs out over the glass — a bright crest on the key's side, a soft trough after it
  TT.hops.forEach(([, tl], i) => {
    const d = t - tl;
    if (d < 0 || d > 0.7) return;
    const c = tag(PICKS[i]), u = d / 0.7, R = BR * (0.9 + 2.4 * ease.outCubic(u)), a = (1 - u) * (1 - u);
    ctx.save();
    ctx.lineWidth = pt(5) * (1 - 0.5 * u);
    ctx.strokeStyle = `rgba(255,255,255,${0.75 * a})`;
    ctx.beginPath(); ctx.ellipse(c.cx - pt(1.5), c.cy - pt(1.5), R, R * 0.8, 0, 0, TAU); ctx.stroke();
    ctx.strokeStyle = rgba('#0B1B3F', 0.08 * a);
    ctx.beginPath(); ctx.ellipse(c.cx + pt(2), c.cy + pt(2), R - pt(4), (R - pt(4)) * 0.8, 0, 0, TAU); ctx.stroke();
    ctx.restore();
  });
  // under every drop and pill on the glass: a soft contact shadow and, away from the key, the light it focuses
  const drops = [];
  if (t >= TT.out) drops.push([b.x, b.y, b.r, clamp(1 - (b.h - b.r) / (BR * 2.4))]);
  for (const d of splashAt(t)) drops.push([d.x, d.y, d.r, clamp(1 - (d.h - d.r) / BR)]);
  for (const [x, y, r, near] of drops) contact(ctx, x, y, r, near);
  homeIndicator(ctx, 0, 0, W, SH, K, UI.ink);
}
function contact(ctx, x, y, r, near) {
  if (near <= 0.01) return;
  ctx.save();
  const sx = x + r * 0.08, sy = y + r * 0.12, rs = r * (0.95 + 0.4 * (1 - near));
  const g = ctx.createRadialGradient(sx, sy, 0, sx, sy, rs);
  g.addColorStop(0, rgba('#0B1B3F', 0.16 * near)); g.addColorStop(0.6, rgba('#0B1B3F', 0.07 * near)); g.addColorStop(1, rgba('#0B1B3F', 0));
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(sx, sy, rs, 0, TAU); ctx.fill();
  const cx = x + r * 0.36, cy = y + r * 0.42, rc = r * 0.44;
  const g2 = ctx.createRadialGradient(cx, cy, 0, cx, cy, rc);
  g2.addColorStop(0, `rgba(255,255,250,${0.85 * near})`); g2.addColorStop(0.45, `rgba(255,252,240,${0.35 * near})`); g2.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.globalCompositeOperation = 'lighter';
  ctx.fillStyle = g2; ctx.beginPath(); ctx.arc(cx, cy, rc, 0, TAU); ctx.fill();
  ctx.restore();
}

// "Pick 3 · n/3": the count rolls over, the old digit up and out, the new one up from below
function counter(ctx, t, n) {
  const s = pt(15), y = L.onb.pick;
  const full = fill(T.pick, { n: 0 });
  const [pre] = full.split('0');
  const wPre = measure(ctx, pre, { f: FONTS.ui, w: 700, size: s });
  const wAll = measure(ctx, full, { f: FONTS.ui, w: 700, size: s });
  const x0 = W / 2 - wAll / 2;
  text(ctx, pre, x0, y, { f: FONTS.ui, w: 700, size: s, color: UI.ink2 });
  const wd = measure(ctx, '0', { f: FONTS.ui, w: 700, size: s });
  text(ctx, full.slice(pre.length + 1), x0 + wPre + wd, y, { f: FONTS.ui, w: 700, size: s, color: UI.ink2 });
  const last = n > 0 ? TT.hops[n - 1][1] : -1;
  const u = n > 0 ? seg(t, last, last + 0.16, MOVE.go) : 1;
  ctx.save();
  ctx.beginPath(); ctx.rect(x0 + wPre - 4, y - s * 1.1, wd + 8, s * 1.45); ctx.clip();
  const col = n > 0 ? C.blue : UI.ink2;
  if (u < 1) { ctx.globalAlpha *= 1 - u; text(ctx, String(n - 1), x0 + wPre, y - s * 0.9 * u, { f: FONTS.ui, w: 800, size: s, color: UI.ink2 }); ctx.globalAlpha /= Math.max(1e-3, 1 - u); }
  ctx.globalAlpha *= u;
  text(ctx, String(n), x0 + wPre, y + s * 0.9 * (1 - u), { f: FONTS.ui, w: 800, size: s, color: col });
  ctx.restore();
}

function chipView(ctx, c, t, rank, tl) {
  const st = rank >= 0 ? seg(t, tl, tl + 0.2, MOVE.in) : 0;
  const press = rank >= 0 && t > tl ? 1 - 0.1 * Math.exp(-(t - tl) * 14) : 1;
  about(ctx, c.cx, c.cy, press, press, () => {
    const path = squirclePath(c.x, c.y, c.w, c.h, c.h / 2);
    ctx.save(); ctx.shadowColor = 'rgba(11,27,63,0.08)'; ctx.shadowBlur = 8 * K; ctx.shadowOffsetY = 2 * K;
    ctx.fillStyle = '#fff'; ctx.fill(path); ctx.restore();
    if (st > 0) {
      // the colour floods out from where he touched down
      ctx.save(); ctx.clip(path); ctx.fillStyle = P[c.key].color;
      ctx.beginPath(); ctx.arc(c.cx, c.cy + pt(4), c.w * 0.8 * st, 0, TAU); ctx.fill(); ctx.restore();
    } else { ctx.lineWidth = 1.5 * K; ctx.strokeStyle = UI.chipStroke; ctx.stroke(path); }
    text(ctx, c.label, c.x + 17 * K, c.cy + 17.5 * K * 0.36, { f: FONTS.ui, w: 650, size: 17.5 * K, color: st > 0.5 ? P[c.key].text : UI.ink });
  });
  if (rank >= 0) {
    const bp = spring(t - tl - 0.05, SPRING.pop);
    if (bp > 0.001) {
      const bx = c.x + c.w - 4 * K, by = c.y + 3 * K;
      about(ctx, bx, by, bp, bp, () => {
        ctx.fillStyle = C.ink; ctx.beginPath(); ctx.arc(bx, by, 13 * K, 0, TAU); ctx.fill();
        ctx.strokeStyle = '#fff'; ctx.lineWidth = 2 * K; ctx.stroke();
        text(ctx, String(rank + 1), bx, by + 5 * K, { f: FONTS.ui, w: 800, size: 14 * K, color: '#fff', align: 'center' });
      });
    }
  }
}
