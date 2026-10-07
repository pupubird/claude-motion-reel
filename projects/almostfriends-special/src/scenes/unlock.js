// VI · 4 IT TAKES TWO YESES (41.5–56 s).
//   in the phone (unlockScreen, drawn by howto.js): the chat dims, the sheet rises — two slots, two locks, Unlock; you
//     tap; theirs pulses, dashed: "Waiting for Curious Otter…"; the camera pushes slowly onto their slot while Bub
//     peeks over the sheet and the music falls silent (kept from v1: the owner's favourite)
//   the peak (this scene, from the drop at 50.0): their lock springs, the camera throws the phone back, the two orbs
//     burst out of it and kiss mid-air; the wall pops — a flash, a shockwave, the whole universe bursts toward you —
//     and two real people pop out at hero size: "You're both in!"; names, what they share; then the brand's own
//     punchline: "almost" swells and pops — friends (owner, v3 notes: no ".ai" in this scene)
import * as THREE from 'three';
import { W, H, SH } from '../config.js';
import { C, FONTS, UI, P, SPRING, MOVE } from '../brand.js';
import { UNLOCK, FOAM } from '../score.js';
import { T, fill } from '../copy.js';
import { clamp, lerp, seg, ease, spring, springVel, TAU, rgba } from '../util.js';
import { drawSky } from '../world/sky.js';
import { drawBubble2D, drawBubFace, blinkAt } from '../world/bubble2d.js';
import { Line, drawLine, popEach, combine, centerX, waveEach, measureStr } from '../type.js';
import { squirclePath, text, measure, about } from '../ui/kit.js';
import { icon } from '../ui/icons.js';
import { K } from '../ui/app.js';
import { conversation, OTTER_COLORS, UNIVERSE_CAST, YOU_COLORS } from '../ui/convo.js';
import { typing } from '../ui/chat.js';
import { homeIndicator } from '../ui/ios.js';
import { phonePose, LAYOUT, projectScreen, PHONE_CAM } from '../ui/phonecam.js';
import { toWorld, worldPerPx } from '../gl/phone3d.js';
import { drawPhoto, LEADS, NAMES } from '../assets.js';
import { burst, particleAt, drawDroplet } from '../morph.js';
import { universe, PATH, hideHeroes } from '../gl/universe.js';
import { sp, sr, INK_ORB, inkOf, wallBetween, bubPrim, quatFromZ, WALL } from '../liquid2d.js';
import { sign, pin, hideSigns } from '../gl/sign.js';

const pt = (v) => v * K;
const S = LAYOUT.sheet;
const SHEET = { x: pt(8), y: S.y, w: W - pt(16), h: pt(376) };
const SLOT = [{ x: W / 2 - S.slotDX, name: T.you, colors: YOU_COLORS, seed: 1.3 }, { x: W / 2 + S.slotDX, name: T.otter, colors: OTTER_COLORS, seed: 4.1 }];
// where the two faces end up (foam.js picks them up from here)
export const REVEAL = { y: 840, r: 220, gap: 480 };
const KISS = { y: 820, r: 190 };
let both, almost, friends, U, BOTH;
const confetti = burst(31, 90, { speed: [1000, 2600], spread: TAU, size: [12, 30], colors: Object.values(P).map((p) => p.color) });
const drops = burst(53, 80, { speed: [700, 2000], spread: TAU, size: [8, 18] });

export default {
  init(env) {
    both = new Line(T.both, { s: 118, w: 800, track: -0.03 });
    almost = new Line('almost', { s: 170, w: 640, track: -0.02 });
    friends = new Line('friends', { s: 190, w: 800, track: -0.035 });   // the sentence: almost friends → friends (no .ai here)
    U = universe(env, UNIVERSE_CAST);
    // "You're both in!" stands in the universe as it bursts: the people stream past in front of it and behind it
    BOTH = sign({ w: Math.ceil(both.width) + 120, h: 220 });
  },

  // the universe behind the reveal, bursting toward you when the wall pops
  three: {
    start: UNLOCK.both + 0.37, end: UNLOCK.almost + 0.05,   // (until then the 3D phone, thrown back: howto.js)
    update(t) {
      const z = -205 + 2.5 * (t - UNLOCK.lift);
      const cam = U.camera;
      cam.position.set(PATH.x(z), PATH.y(z), z);
      cam.up.set(0, 1, 0);
      cam.lookAt(PATH.x(z - 8), PATH.y(z - 8), z - 8);
      cam.updateMatrixWorld();
      hideHeroes(U);
      hideSigns(U.scene);
      bothSign(t, cam);
      const u = U.uniforms;
      u.uTime.value = t;
      u.uAlpha.value = seg(t, UNLOCK.both + 0.37, UNLOCK.wallPop) * (1 - seg(t, UNLOCK.faces + 1.2, UNLOCK.faces + 2.1));
      u.uVeil.value = 0;
      u.uScanR.value = -1;
      u.uOne.value = -1;
      u.uBurstAt.value.set(PATH.x(-218), PATH.y(-218), -218);
      u.uBurst.value = t > UNLOCK.wallPop ? 1 - Math.exp(-(t - UNLOCK.wallPop) * 1.3) : 0;   // they stream past for a second
      u.uBurstAmp.value = 11;
      u.uNear.value = 8; u.uFar.value = 50;
      return { scene: U.scene, camera: cam, bloom: { strength: 0.35, threshold: 1.0, radius: 0.6 } };
    },
  },

  liquid: { start: UNLOCK.sheet, end: FOAM.in + 0.4, frame: (t) => (t < UNLOCK.faces + 0.2 ? revealLiquid(t) : sharedBeads(t)) },

  under: [
    { start: UNLOCK.both + 0.6, end: FOAM.in + 0.6, draw(ctx) { drawSky(ctx); } },      // (until then howto.js draws the sky)
    { start: UNLOCK.wallPop, end: FOAM.in + 0.6, draw(ctx, t) { revealUnder(ctx, t); } },
  ],

  layers: [{
    start: UNLOCK.both, end: FOAM.in + 0.6,
    draw(ctx, t) { reveal(ctx, t); },
  }],
  fx(t) {
    // the drop, then the wall: a punch, a big flash and a shake
    const a = t - UNLOCK.both, k = t - UNLOCK.wallPop;
    if (a > 0 && a < 0.4 && k < 0) return { zoom: 1 + 0.05 * Math.exp(-a * 10) };
    if (k > 0 && k < 0.9) {
      const sh = 0.014 * Math.exp(-k * 7);
      return { zoom: 1 + 0.06 * Math.exp(-k * 8), flash: 0.55 * Math.exp(-k * 12), sx: sh * Math.sin(k * 95), sy: sh * Math.cos(k * 77) };
    }
    return null;
  },
};

// The phone's screen in step 4 (design coordinates): the chat dims, the sheet rises, you tap, they keep you waiting.
export function unlockScreen(ctx, t, view) {
  conversation(ctx, t, view);
  const fr = seg(t, UNLOCK.sheet, UNLOCK.sheet + 0.35) * (1 + 0.25 * seg(t, UNLOCK.breath, UNLOCK.breath + 0.4));
  ctx.fillStyle = `rgba(246,248,253,${(0.88 + 0.07 * seg(t, UNLOCK.waiting, UNLOCK.breath)) * clamp(fr)})`;
  ctx.fillRect(0, 0, W, SH);
  const rise = spring(t - UNLOCK.sheet - 0.1, SPRING.settle);
  if (rise <= 0.001) return;
  const yOff = (1 - rise) * pt(460);
  ctx.save();
  ctx.translate(0, yOff);
  const path = squirclePath(SHEET.x, SHEET.y, SHEET.w, SH, pt(44));
  ctx.save();
  ctx.shadowColor = 'rgba(11,27,63,0.18)'; ctx.shadowBlur = 50; ctx.shadowOffsetY = -6;
  ctx.fillStyle = 'rgba(255,255,255,0.97)'; ctx.fill(path);
  ctx.restore();
  ctx.fillStyle = 'rgba(11,27,63,0.16)';
  ctx.fill(squirclePath(W / 2 - pt(18), SHEET.y + pt(8), pt(36), pt(5), pt(2.5)));
  text(ctx, T.sheet.title, W / 2, SHEET.y + pt(52), { f: FONTS.ui, w: 800, size: pt(22), color: UI.ink, align: 'center' });
  text(ctx, T.sheet.ask, W / 2, SHEET.y + pt(78), { f: FONTS.ui, w: 500, size: pt(17), color: UI.ink2, align: 'center' });
  const youOpen = spring(t - UNLOCK.tap - 0.2, SPRING.pop), themOpen = spring(t - UNLOCK.open - 0.3, SPRING.pop);
  SLOT.forEach((s, i) => {
    const open = i === 0 ? youOpen : themOpen;
    const waiting = i === 1 && t >= UNLOCK.waiting && t < UNLOCK.open;
    const breathe = waiting ? 0.5 + 0.5 * Math.sin((t - UNLOCK.waiting) * (t > UNLOCK.breath ? 3 : 5)) : 0;
    const cx = s.x, cy = S.slotY;
    const cw = pt(150), ch = pt(128);
    ctx.save();
    // their slot floods gold from the padlock when it opens (yours went gold when you tapped)
    const flood = i === 1 ? seg(t, UNLOCK.open, UNLOCK.open + 0.25, MOVE.in) : open > 0.5 ? 1 : 0;
    ctx.fillStyle = '#F3F5FA';
    ctx.fill(squirclePath(cx - cw / 2, cy - ch / 2, cw, ch, pt(24)));
    if (flood > 0) {
      ctx.save(); ctx.clip(squirclePath(cx - cw / 2, cy - ch / 2, cw, ch, pt(24)));
      ctx.fillStyle = rgba(C.gold, 0.22 + 0.25 * (1 - flood) * (i === 1 ? 1 : 0));
      ctx.beginPath(); ctx.arc(cx, cy - pt(16), Math.hypot(cw, ch) * flood, 0, TAU); ctx.fill(); ctx.restore();
      if (i === 1) { ctx.lineWidth = pt(2.5); ctx.strokeStyle = rgba(C.gold, flood); ctx.stroke(squirclePath(cx - cw / 2, cy - ch / 2, cw, ch, pt(24))); }
    }
    if (waiting) {
      ctx.setLineDash([pt(6), pt(5)]); ctx.lineDashOffset = -t * 40;
      ctx.lineWidth = pt(2); ctx.strokeStyle = rgba(C.blue, 0.35 + 0.5 * breathe);
      ctx.stroke(squirclePath(cx - cw / 2, cy - ch / 2, cw, ch, pt(24)));
    }
    ctx.restore();
    // (the slot orbs are liquid: revealLiquid)
    text(ctx, s.name, cx, cy + pt(36), { f: FONTS.ui, w: 700, size: pt(15), color: UI.ink, align: 'center' });
    if (waiting) typing(ctx, cx - pt(29) * 0.62, cy + pt(44), t, UNLOCK.waiting + 0.3, UNLOCK.lockUp - 0.15, { fill: '#FFFFFF', dot: UI.ink3, k: K * 0.62 });
    const lx = cx + pt(32), ly = cy - pt(44);
    // their padlock: it rises big over their orb, springs open (the shackle pops up and swings), turns gold and holds
    // there through the last half-second of silence; the drop throws the phone back (scenes/unlock.js reveal)
    if (i === 1 && t >= UNLOCK.lockUp) return;             // the big padlock is drawn over the liquid: lockOver()
    ctx.save();
    ctx.fillStyle = open > 0.5 ? C.gold : '#FFFFFF';
    ctx.shadowColor = 'rgba(11,27,63,0.15)'; ctx.shadowBlur = 8;
    ctx.beginPath(); ctx.arc(lx, ly, pt(15) * (1 + 0.25 * Math.sin(clamp(open) * Math.PI)), 0, TAU); ctx.fill();
    ctx.restore();
    if (open > 0.5) icon(ctx, 'check', lx - pt(9), ly - pt(9), pt(18), C.ink, 3);
    else icon(ctx, 'lock', lx - pt(9), ly - pt(9) - open * pt(3), pt(18), UI.ink, 2.2);
  });
  // the button: Unlock → Waiting for Curious Otter…
  const by = S.button, bh = pt(56), bw = SHEET.w - pt(48), bx = SHEET.x + pt(24);
  const press = 1 - 0.14 * Math.sin(clamp((t - UNLOCK.tap + 0.05) / 0.16) * Math.PI);
  const waitingB = t >= UNLOCK.waiting;
  about(ctx, W / 2, by + bh / 2, press, press, () => {
    ctx.fillStyle = waitingB && t < UNLOCK.open ? '#EEF1F8' : C.gold;
    ctx.fill(squirclePath(bx, by, bw, bh, bh / 2));
    const label = t >= UNLOCK.open ? T.both.replace(/\u200B/g, '') : waitingB ? fill(T.sheet.waiting, { who: T.otter }) : T.sheet.unlock;
    text(ctx, label, W / 2, by + bh / 2 + pt(6), { f: FONTS.ui, w: 750, size: pt(17), color: waitingB && t < UNLOCK.open ? UI.ink2 : C.ink, align: 'center' });
  });
  text(ctx, T.sheet.note, W / 2, by + bh + pt(28), { f: FONTS.ui, w: 500, size: pt(13), color: UI.ink3, align: 'center' });
  const fu = (t - UNLOCK.tap + 0.1) / 0.36;
  if (fu > 0 && fu < 1) {
    ctx.save(); ctx.globalAlpha *= Math.sin(fu * Math.PI) * 0.32;
    ctx.fillStyle = UI.ink; ctx.beginPath(); ctx.arc(W / 2 + pt(40), by + bh * 0.6, pt(22) * (1 - 0.15 * Math.sin(fu * Math.PI)), 0, TAU); ctx.fill();
    ctx.restore();
  }
  ctx.restore();
  // (Bub peeking over the sheet's edge is liquid: bubPeek, in revealLiquid)
  homeIndicator(ctx, 0, 0, W, SH, K, UI.ink);
}

// Their padlock, big: a solid ink body with a keyhole and a thick shackle. At UNLOCK.open the shackle pops up out of the
// body and swings open about its left leg (the right leg clears the body), the body flushes gold, a ring of gold and a
// few sparks burst off it. Centred on (x, y), `s` = the body's width.
function bigLock(ctx, x, y, s, t) {
  const k = t - UNLOCK.open;
  const lift = k > 0 ? spring(k, SPRING.snap) : 0;
  const swing = k > 0.04 ? spring(k - 0.04, SPRING.wobble) : 0;
  const gold = seg(k, 0, 0.12);
  const pulse = k < 0 ? 1 + 0.06 * Math.sin(Math.max(0, t - UNLOCK.lockUp) * 18) * Math.exp(-Math.max(0, t - UNLOCK.lockUp) * 3) : 1 + 0.12 * Math.exp(-k * 9) * Math.sin(k * 30);
  ctx.save();
  ctx.translate(x, y); ctx.scale(pulse, pulse);
  // a soft plate behind it so it reads over the orb
  ctx.fillStyle = rgba('#FFFFFF', 0.92);
  ctx.shadowColor = 'rgba(11,27,63,0.18)'; ctx.shadowBlur = s * 0.4; ctx.shadowOffsetY = s * 0.08;
  ctx.beginPath(); ctx.arc(0, 0, s * 0.86, 0, TAU); ctx.fill();
  ctx.shadowColor = 'transparent';
  if (k > 0 && k < 0.6) {                                                   // the gold ring
    const u = k / 0.6;
    ctx.save(); ctx.globalAlpha *= 1 - u; ctx.strokeStyle = C.gold; ctx.lineWidth = s * 0.16 * (1 - u) + 1;
    ctx.beginPath(); ctx.arc(0, 0, s * (0.95 + 1.1 * MOVE.in(u)), 0, TAU); ctx.stroke(); ctx.restore();
    for (let j = 0; j < 8; j++) {
      const a = j * TAU / 8 + 0.3, rr = s * (1.0 + 0.9 * MOVE.in(u));
      ctx.save(); ctx.globalAlpha *= 1 - u; ctx.fillStyle = j % 2 ? C.gold : '#FFFFFF';
      ctx.beginPath(); ctx.arc(Math.cos(a) * rr, Math.sin(a) * rr, s * 0.06 * (1 - u), 0, TAU); ctx.fill(); ctx.restore();
    }
  }
  const bw = s * 0.82, bh = s * 0.64, by0 = s * 0.02;                       // body: top edge at y = by0
  const ink = UI.ink;
  const bodyCol = gold > 0 ? mixC(ink, C.gold, gold) : ink;
  // the shackle: a U of thick stroke whose legs sit in the body; it rises by `lift` and turns about the left leg
  const sw = s * 0.13, sr = bw * 0.3, legL = -sr, legR = sr, top = by0 - s * 0.36;
  ctx.save();
  ctx.translate(legL, by0); ctx.rotate(-0.55 * swing); ctx.translate(-legL, -by0);
  ctx.translate(0, -s * 0.2 * lift);
  ctx.strokeStyle = gold > 0.5 ? mixC(ink, '#C9971A', gold) : ink; ctx.lineWidth = sw; ctx.lineCap = 'butt';
  ctx.beginPath();
  ctx.moveTo(legL, by0 + s * 0.04); ctx.lineTo(legL, top + sr * 0.02);
  ctx.arc(0, top, sr, Math.PI, 0);
  ctx.lineTo(legR, by0 + s * 0.04 - (lift > 0 ? 0 : 0));
  ctx.stroke();
  ctx.restore();
  // the body over the shackle's legs
  ctx.fillStyle = bodyCol;
  ctx.fill(squirclePath(-bw / 2, by0, bw, bh, s * 0.14));
  // keyhole
  ctx.fillStyle = gold > 0.5 ? C.ink : '#FFFFFF';
  ctx.beginPath(); ctx.arc(0, by0 + bh * 0.42, s * 0.07, 0, TAU); ctx.fill();
  ctx.fillRect(-s * 0.03, by0 + bh * 0.42, s * 0.06, bh * 0.28);
  ctx.restore();
}
function mixC(a, b, u) {
  const [r1, g1, b1] = [1, 3, 5].map((i) => parseInt(a.slice(i, i + 2), 16)), [r2, g2, b2] = [1, 3, 5].map((i) => parseInt(b.slice(i, i + 2), 16));
  return `rgb(${Math.round(lerp(r1, r2, u))},${Math.round(lerp(g1, g2, u))},${Math.round(lerp(b1, b2, u))})`;
}

// The sheet's rise (its y offset in screen design px) and each slot's breath: shared by the screen, the liquid orbs and
// the padlock over them
const sheetOff = (t) => (1 - spring(t - UNLOCK.sheet - 0.1, SPRING.settle)) * pt(460);
function slotBreath(i, t) {
  const waiting = i === 1 && t >= UNLOCK.waiting && t < UNLOCK.open;
  return waiting ? 0.5 + 0.5 * Math.sin((t - UNLOCK.waiting) * (t > UNLOCK.breath ? 3 : 5)) : 0;
}

// The two orbs in frame px across step 4 and the peak: in their slots on the sheet; out of the phone and up into a
// kiss (centres one radius apart); after the wall pops, apart to the faces' places
function revealOrbs(t) {
  if (t < UNLOCK.lift) {
    // on the phone's glass (world): the slots' orbs, domes resting on the glass
    const pose = phonePose(t), yOff = sheetOff(t);
    const at = (i) => toWorld(SLOT[i].x, S.slotY - pt(16) + yOff);
    return { a: at(0), b: at(1), ra: pt(30), rb: pt(30) * (1 + 0.04 * slotBreath(1, t)), pose, world: true };
  }
  // out of the phone (frame px), from where the slots were on the glass at the lift
  const pose0 = phonePose(UNLOCK.lift);
  const [sa, sy0, sc0] = projectScreen(pose0, SLOT[0].x, S.slotY - pt(16)), [sb, syb] = projectScreen(pose0, SLOT[1].x, S.slotY - pt(16));
  const fly = seg(t, UNLOCK.lift, UNLOCK.wallPop - 0.08, MOVE.go);
  const arc = Math.sin(fly * Math.PI) * 140;
  const r = lerp(pt(30) * sc0, KISS.r, fly);
  const apart = spring(t - UNLOCK.wallPop, SPRING.wobble);
  // after the pop they spring apart to the faces' places
  const d = t < UNLOCK.wallPop ? KISS.r : lerp(KISS.r, REVEAL.gap, apart);
  const y = t < UNLOCK.wallPop ? lerp(lerp(sy0, syb, 0.5), KISS.y, fly) - arc : lerp(KISS.y, REVEAL.y, apart);
  const ax = lerp(sa, W / 2 - d / 2, fly), bx = lerp(sb, W / 2 + d / 2, fly);
  const rr = t < UNLOCK.wallPop ? r : lerp(KISS.r, REVEAL.r, apart);
  const v = t < UNLOCK.wallPop ? 0 : springVel(t - UNLOCK.wallPop, SPRING.wobble) * (REVEAL.gap - KISS.r);
  return { a: [ax, y], b: [bx, y], ra: rr, rb: rr, fly, v };
}

// Bub peeks over the sheet's edge while you wait: nervous glances, then he holds his breath; when their lock opens
// he looks over, eyes wide. → { prim, face, clip } in frame px (he hides behind the sheet's top edge), or null
function bubPeek(t) {
  const peek = seg(t, UNLOCK.waiting + 0.6, UNLOCK.waiting + 1.0, MOVE.in) * (1 - seg(t, UNLOCK.both - 0.1, UNLOCK.both + 0.15));
  if (peek <= 0.001) return null;
  const pose = phonePose(t), yOff = sheetOff(t);
  const held = seg(t, UNLOCK.breath, UNLOCK.breath + 0.25) * (1 - seg(t, UNLOCK.open, UNLOCK.open + 0.08));
  const puff = 1 + 0.08 * held + 0.02 * Math.sin(t * 9) * held;
  const glance = Math.sign(Math.sin((t - UNLOCK.waiting) * 2.2));
  const gasp = t >= UNLOCK.open;                                          // it opened! Bub looks over, eyes wide
  // on the glass, resting on it; hidden below the sheet's top edge (frame y there)
  const r = pt(34) * puff, bx = W - pt(70), by = SHEET.y + yOff - pt(18) + (1 - peek) * pt(60);
  const edge = projectScreen(pose, bx, SHEET.y + yOff + pt(4))[1];
  const B = bubPrim({ pos: toWorld(bx, by, r), r: r * worldPerPx, camPos: PHONE_CAM.position.toArray(), wide: gasp ? 1 : 1 - held, look: gasp ? [-0.9, 0.5] : [glance * 0.7 - 0.2, 0.6],
    blink: gasp ? 0 : held > 0.5 ? 0.85 : blinkAt(t, [UNLOCK.waiting + 1.85, UNLOCK.waiting + 2.65]), blush: 0.6 + 0.6 * held, group: 45 });
  return { ...B, clip: [-1e5, -1e5, 1e5, edge] };
}

// → the liquid for step 4 and the peak: the two orbs (your inks, theirs) on the sheet, their flight, the kiss and the
// wall they share; the wall tears on the pop and they spring apart, jelly; each one's film bursts as the face arrives
export function revealLiquid(t) {
  if (t < UNLOCK.sheet || t >= UNLOCK.faces + 0.2) return null;
  const o = revealOrbs(t);
  const tear = seg(t, UNLOCK.faces - 0.02, UNLOCK.faces + 0.16, ease.inQuad);
  const st = clamp(o.v ? o.v * 0.00006 : 0, -0.03, 0.05);              // a hint of stretch as they spring apart (the blur does the rest)
  const scale = [1 + st, 1 - st * 0.5, 1 - st * 0.5];
  const quiver = t > UNLOCK.wallPop - 0.1 && t < UNLOCK.wallPop ? 0.008 * Math.sin(t * 71) : 0;
  const orb = (c, r, ink, seed, g, q) => {
    const p = { ...INK_ORB, ...inkOf(ink), pos: sp(...c), size: [sr(r * (1 + q))], scale, seed, group: g };
    if (tear > 0) Object.assign(p, { type: 'shell', pop: tear, popDir: [0.05, 0.12, 1] });
    return p;
  };
  if (o.world) {
    // step 4: the orbs on the sheet, Bub peeking over its edge — all on the 3D phone
    const prims = [{ ...INK_ORB, ...inkOf(YOU_COLORS), pos: o.a, size: [o.ra * worldPerPx], seed: 1.3, group: 41 },
      { ...INK_ORB, ...inkOf(OTTER_COLORS), pos: o.b, size: [o.rb * worldPerPx], seed: 4.1, group: 42 }];
    // the sheet rises from below the screen's edge: the orbs are not there below it
    const bottom = projectScreen(o.pose, W / 2, SH)[1];
    prims.forEach((p) => { p.clip = [-1e5, -1e5, 1e5, bottom]; });
    const b = bubPeek(t);
    if (b) prims.push({ ...b.prim, clip: b.clip });
    return { prims, face: b?.face, cam: PHONE_CAM, useDepth: true };
  }
  const prims = [orb(o.a, o.ra, YOU_COLORS, 1.3, 41, quiver), orb(o.b, o.rb, OTTER_COLORS, 4.1, 42, -quiver)];
  if (t < UNLOCK.wallPop + 0.12) {
    // the wall: thinning in the held breath, then a hole races open from its middle
    const hole = seg(t, UNLOCK.wallPop, UNLOCK.wallPop + 0.1, MOVE.out);
    const w = wallBetween(o.a, o.b, (o.ra + o.rb) / 2, { group: 43, thick: lerp(360, 90, seg(t, UNLOCK.wallPop - 0.4, UNLOCK.wallPop)) });
    if (w) { w.hole = w.size[0] * 1.05 * hole; prims.push(w); }
  }
  return { prims };
}

// Their big padlock, floating over their liquid orb (a layer above the phone's glass: gl/phone3d.js floater): it rises
// from the slot's corner, springs open, and goes with the phone at the drop. → { x, y, h, size, draw } or null
const LOCK_SPAN = 4.3;                                     // the canvas holds the padlock and its burst (× its width)
export function lockFloat(t) {
  if (t < UNLOCK.lockUp || t >= UNLOCK.both + 0.4) return null;
  const cx = SLOT[1].x, cy = S.slotY, lx = cx + pt(32), ly = cy - pt(44);
  const up = spring(t - UNLOCK.lockUp, SPRING.pop);
  const ps = pt(lerp(17, 46, up));
  return {
    x: lerp(lx, cx, up), y: lerp(ly, cy - pt(24), up) + sheetOff(t), h: lerp(30, 120, up), size: ps * LOCK_SPAN,
    draw: (g) => { const k = g.canvas.width / (ps * LOCK_SPAN); g.translate(g.canvas.width / 2, g.canvas.height / 2); g.scale(k, k); bigLock(g, 0, 0, ps, t); },
  };
}

// The peak.
function reveal(ctx, t) {
  const wallPop = seg(t, UNLOCK.wallPop, UNLOCK.wallPop + 0.1);
  const facesP = seg(t, UNLOCK.faces, UNLOCK.faces + 0.08);
  // the two orbs burst out of the phone (from wherever its slots were) and fly up to kiss: centres one radius apart
  const { a: [ax, y], b: [bx] } = revealOrbs(t);
  const fadeAll = seg(t, FOAM.in - 0.1, FOAM.in + 0.4);
  ctx.save();
  ctx.globalAlpha *= 1 - fadeAll;
  // shockwaves at the pop
  const k = t - UNLOCK.wallPop;
  if (k > 0 && k < 0.7) {
    for (const [delay, w, col] of [[0, 26, '#FFFFFF'], [0.08, 14, P.family.color], [0.16, 10, C.blue]]) {
      const u = clamp((k - delay) / 0.55);
      if (u <= 0 || u >= 1) continue;
      ctx.save(); ctx.globalAlpha *= 1 - u;
      ctx.strokeStyle = col; ctx.lineWidth = w * (1 - u) + 2;
      ctx.beginPath(); ctx.arc(W / 2, KISS.y, KISS.r + 1100 * MOVE.in(u), 0, TAU); ctx.stroke(); ctx.restore();
    }
  }
  // (the orbs, their kiss and the wall are liquid: revealLiquid)
  // the photos, born from the pop (big, with the wobble spring and a little spin)
  if (t >= UNLOCK.faces) {
    const fp = spring(t - UNLOCK.faces, SPRING.wobble);
    const sc = lerp(0.7, 1, fp);
    // (from FOAM.in the foam carries the two of them on: foam.js)
    if (t < FOAM.in) for (const [key, x, dir] of [[LEADS.you, ax, -1], [LEADS.one, bx, 1]]) {
      ctx.save(); ctx.translate(x, y); ctx.rotate(dir * 0.12 * (1 - fp)); ctx.translate(-x, -y);
      ctx.globalAlpha = Math.min(1, ctx.globalAlpha / Math.max(1e-3, 1 - fadeAll));   // the photos hand over whole, unfaded
      drawPhoto(ctx, key, x, y, REVEAL.r * sc, { ring: '#FFFFFF', ringW: 14 });
      ctx.restore();
    }
  }
  // droplets at the wall pop and confetti at the faces
  if (k > 0 && k < 1.4) for (const q of drops) {
    const p = particleAt(q, W / 2, KISS.y, k, 1000, 3);
    if (p.a > 0) drawDroplet(ctx, p.x, p.y, q.size * 0.6, q.vx * Math.exp(-3 * k), q.vy * Math.exp(-3 * k), p.a);
  }
  const dpp = t - (UNLOCK.almost + 0.85);
  if (dpp > 0 && dpp < 1.0) for (const q of drops.slice(0, 40)) {
    const p = particleAt(q, W / 2, 300, dpp, 900, 3.4);
    if (p.a > 0) drawDroplet(ctx, p.x, p.y, q.size * 0.5, q.vx * Math.exp(-3.4 * dpp), q.vy * Math.exp(-3.4 * dpp), p.a);
  }
  const df = t - UNLOCK.faces;
  if (df > 0 && df < 2.4) for (const q of confetti) {
    const p = particleAt(q, W / 2, REVEAL.y, df, 1500, 2.2);
    if (p.a <= 0) continue;
    ctx.save(); ctx.globalAlpha *= p.a; ctx.translate(p.x, p.y); ctx.rotate(p.rot);
    ctx.fillStyle = q.color;
    if (q.shape === 'dot') { ctx.beginPath(); ctx.arc(0, 0, q.size * 0.4, 0, TAU); ctx.fill(); }
    else ctx.fill(squirclePath(-q.size * 0.5, -q.size * 0.18, q.size, q.size * 0.36, q.size * 0.18));
    ctx.restore();
  }
  ctx.restore();
}

// "You're both in!": a sign in the universe, a few units ahead, drifting with the lens (it gains on it a little), drawn
// after the crowd and depth-tested with it — the burst throws people past in front of it and behind it. It slams in
// word by word with the shockwave, and lifts away for the punchline
const BOTH_AT = { y: 532, d: 6, drift: 0.85 };   // its letters' feet just behind the faces' crowns
const _bc = new THREE.PerspectiveCamera();
let bothPin = null;
function bothSign(t, cam) {
  const out = seg(t, UNLOCK.almost - 0.3, UNLOCK.almost, MOVE.out);
  if (t < UNLOCK.wallPop || out >= 1) return;
  if (!bothPin) {
    _bc.copy(cam); const z = -205 + 2.5 * (UNLOCK.wallPop - UNLOCK.lift);
    _bc.position.set(PATH.x(z), PATH.y(z), z); _bc.up.set(0, 1, 0); _bc.lookAt(PATH.x(z - 8), PATH.y(z - 8), z - 8); _bc.updateMatrixWorld();
    bothPin = { ...pin(_bc, W / 2, BOTH_AT.y, BOTH_AT.d), from: _bc.position.clone() };
  }
  BOTH.draw((g) => {
    const slam = (i, gl, wk) => {
      const t0 = UNLOCK.wallPop + 0.02 + Math.max(0, wk) * 0.1;
      if (t < t0) return { a: 0 };
      const p = spring(t - t0, SPRING.snap);
      return { a: clamp(p * 5), sc: lerp(1.8, 1, p) };
    };
    drawLine(g, both, centerX(both, BOTH.w / 2), 110 + both.ascent / 2, { fill: C.ink, each: slam });
  });
  const pos = bothPin.pos.clone().addScaledVector(cam.position.clone().sub(bothPin.from), BOTH_AT.drift);
  pos.y += out * 0.9;
  BOTH.place(U.scene, { pos, quat: bothPin.quat, wpp: bothPin.wpp }, { order: 50, alpha: 1 - out });
}

// What the two of them share, as inks (the film's language for a value: a bead of its colour, as in the value and
// your picks): two beads in a row under the names, each word beside its bead
const SHARED = [['family', `${fill(T.first, { p: P.family.label })}`], ['adventure', P.adventure.label]];
const SHARE = { y: 1250, r: 24, gap: 16, between: 56, size: 40 };
let shareLayout = null;
function shareRow() {
  if (shareLayout) return shareLayout;
  const ws = SHARED.map(([, s]) => measureStr(s, { f: FONTS.ui, w: 750, s: SHARE.size }));
  const unit = (w) => 2 * SHARE.r + SHARE.gap + w;
  const total = ws.reduce((a, w) => a + unit(w), 0) + SHARE.between;
  let x = W / 2 - total / 2;
  shareLayout = ws.map((w, i) => { const o = { bead: x + SHARE.r, text: x + 2 * SHARE.r + SHARE.gap, w }; x += unit(w) + SHARE.between; return o; });
  return shareLayout;
}
const shareIn = (i) => UNLOCK.names + 0.3 + i * 0.12;
function sharedBeads(t) {
  const fade = 1 - seg(t, FOAM.in - 0.1, FOAM.in + 0.4);
  const prims = [];
  shareRow().forEach((o, i) => {
    const p = spring(t - shareIn(i), SPRING.wobble);
    if (p <= 0.002 || fade <= 0.002) return;
    const k = SHARED[i][0];
    prims.push({ ...INK_ORB, ...inkOf([P[k].color]), pos: sp(o.bead, SHARE.y - 14 + 4 * Math.sin(t * 2.4 + i)), size: [sr(SHARE.r * p)], alpha: fade, seed: 6 + i, group: 90 + i });
  });
  return { prims };
}

// A soap film's colour by its thickness (1 thick, as a new bubble; 0 the black film it thins to just before it pops):
// the interference sequence a draining film runs through
const FILM_STOPS = [[0, '#20263A'], [0.12, '#B9BFD0'], [0.24, '#FFFFFF'], [0.38, '#FFE18C'], [0.52, '#FF8FC8'], [0.66, '#8E9BFF'], [0.8, '#7FE0E6'], [1, '#C9F2B8']];
function filmAt(d) {
  d = clamp(d);
  for (let i = 1; i < FILM_STOPS.length; i++) {
    const [d1, c1] = FILM_STOPS[i];
    if (d <= d1) { const [d0, c0] = FILM_STOPS[i - 1]; return mixC(c0, c1, (d - d0) / (d1 - d0)); }
  }
  return FILM_STOPS[FILM_STOPS.length - 1][1];
}

// The reveal's words in the sky: the names hang under the faces; what they share sits under the names; then the
// punchline: "almost" is a soap film — it swells, its colours run as it drains, it goes black, and it pops — and
// what is left is "friends"
function revealUnder(ctx, t) {
  const { a: [ax, y], b: [bx] } = revealOrbs(t);
  ctx.save();
  ctx.globalAlpha *= 1 - seg(t, FOAM.in - 0.1, FOAM.in + 0.4);
  if (t >= UNLOCK.faces) {
    const na = spring(t - UNLOCK.names, SPRING.pop);
    if (na > 0.001) {
      ctx.save(); ctx.globalAlpha *= clamp(na * 3);
      const ny = y + REVEAL.r + 82 + (1 - na) * 30;
      text(ctx, NAMES[LEADS.you], ax, ny, { f: FONTS.ui, w: 750, size: 52, color: C.ink, align: 'center' });
      text(ctx, NAMES[LEADS.one], bx, ny, { f: FONTS.ui, w: 750, size: 52, color: C.ink, align: 'center' });
      ctx.restore();
    }
    shareRow().forEach((o, i) => {
      const p = spring(t - shareIn(i) - 0.05, SPRING.pop);
      if (p <= 0.001) return;
      ctx.save(); ctx.globalAlpha *= clamp(p * 3);
      text(ctx, SHARED[i][1], o.text, SHARE.y, { f: FONTS.ui, w: 750, size: SHARE.size, color: C.ink, align: 'left' });
      ctx.restore();
    });
  }
  if (t >= UNLOCK.almost) {
    const aIn = spring(t - UNLOCK.almost, SPRING.pop);
    const popT = UNLOCK.almost + 0.85;
    const inflate = seg(t, UNLOCK.almost + 0.3, popT, ease.inQuad);
    if (t < popT) {
      const s = aIn * (1 + 0.2 * inflate + 0.02 * Math.sin(t * 40) * inflate);
      const x0 = centerX(almost, W / 2), base = 330 + almost.ascent / 2;
      // the film: bands of interference colour drifting across the letters, thinning as it swells
      const g = ctx.createLinearGradient(x0 - 40, base - almost.ascent, x0 + almost.width + 40, base);
      const thick = lerp(0.95, 0.0, inflate), drift = (t - UNLOCK.almost) * 0.35;
      for (let k = 0; k <= 8; k++) { const u = k / 8; g.addColorStop(u, filmAt(thick - 0.18 + 0.36 * (0.5 + 0.5 * Math.sin((u + drift) * 5.5)))); }
      about(ctx, W / 2, 330, s, s, () => {
        drawLine(ctx, almost, x0, base, { fill: g, forceFill: true });
        // its edge: the film's rim, a soft line of the brand's grey so it reads against the sky
        ctx.save(); ctx.lineWidth = 3; ctx.strokeStyle = rgba(C.inkSoft, 0.55 * (1 - inflate));
        ctx.font = `${almost.opt.w} ${almost.opt.s}px ${almost.opt.f}`; ctx.letterSpacing = `${(almost.opt.track * almost.opt.s).toFixed(2)}px`;
        ctx.strokeText(almost.text, x0, base); ctx.letterSpacing = '0px'; ctx.restore();
      });
    }
    const slide = spring(t - popT, SPRING.settle);
    const fy = lerp(540, 440, slide);
    drawLine(ctx, friends, centerX(friends, W / 2), fy, { fill: C.ink, each: combine(popEach(friends, t, [UNLOCK.almost + 0.15]), waveEach(friends, t, popT + 0.05, { amp: 0.12 })) });
  }
  ctx.restore();
}
