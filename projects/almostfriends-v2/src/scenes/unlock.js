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
import { clamp, lerp, seg, ease, spring, springVel, TAU, rgba, mixHex } from '../util.js';
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
import { LIGHT_ORB } from '../v2look.js';
import { text3d, lightGlass, studioEnv, LIGHT } from '../gl/text3d.js';

const pt = (v) => v * K;
const S = LAYOUT.sheet;
const SHEET = { x: pt(8), y: S.y, w: W - pt(16), h: pt(376) };
const SLOT = [{ x: W / 2 - S.slotDX, name: T.you, colors: YOU_COLORS, seed: 1.3 }, { x: W / 2 + S.slotDX, name: T.otter, colors: OTTER_COLORS, seed: 4.1 }];
// where the two faces end up (foam.js picks them up from here)
export const REVEAL = { y: 840, r: 220, gap: 480 };
const KISS = { y: 820, r: 190 };
let both, almost, friends, U, BOTH, BOTH3D;
const drops = burst(53, 80, { speed: [700, 2000], spread: TAU, size: [8, 18] });

export default {
  init(env) {
    both = new Line(T.both, { s: 118, w: 800, track: -0.03 });
    almost = new Line('almost', { s: 170, w: 640, track: -0.02 });
    friends = new Line('friends', { s: 190, w: 800, track: -0.035 });   // the sentence: almost friends → friends (no .ai here)
    U = universe(env, UNIVERSE_CAST);
    // "You're both in!" stands in the universe as it bursts: the people stream past in front of it and behind it
    BOTH = sign({ w: Math.ceil(both.width) + 120, h: 220 });
    // v2: "You're both in!" is three words of coloured light (the crazy version). (The Apple pass took out the pane of
    // glass that shattered at the lens here: on the white it read as a milky veil, and the hook's pane already opens
    // the film — the burst of clear glass people is this hit)
    const envN = studioEnv(env.renderer, 'night');
    // (v2, the Apple pass: one gradient across the line, split between its words)
    const bw = T.both.replace(/\u200B/g, '').split(' '), total = bw.join(' ').length, lg = lightGlass(envN, { glow: 0.8 });
    const at = (u) => { const f = Math.min(0.9999, Math.max(0, u)) * (LIGHT.length - 1), j = Math.floor(f); return mixHex(LIGHT[j], LIGHT[j + 1], f - j); };
    let ofs = 0;
    BOTH3D = bw.map((wd) => { const u0 = ofs / total, u1 = (ofs + wd.length) / total; ofs += wd.length + 1;
      return text3d(wd, { size: 1, material: lg, gradient: [at(u0), at((u0 + u1) / 2), at(u1)], seenPx: 120 }); });
    for (const w of BOTH3D) { w.group.visible = false; U.scene.add(w.group); }
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
      bothWords(t, cam);
      const u = U.uniforms;
      u.uTime.value = t;
      u.uAlpha.value = seg(t, UNLOCK.both + 0.37, UNLOCK.wallPop) * (1 - seg(t, UNLOCK.faces + 0.05, UNLOCK.faces + 0.6));   // (v2: gone as the faces arrive — its people had drifted over the photos)
      u.uVeil.value = 0;
      u.uScanR.value = -1;
      u.uOne.value = -1;
      u.uBurstAt.value.set(PATH.x(-218), PATH.y(-218), -218);
      u.uBurst.value = t > UNLOCK.wallPop ? 1 - Math.exp(-(t - UNLOCK.wallPop) * 1.3) : 0;   // they stream past for a second
      u.uBurstAmp.value = 11;
      u.uNear.value = 8; u.uFar.value = 50;
      u.uGlow.value = 0; u.uBg.value.set('#EEF2FB').convertSRGBToLinear();     // (the day: glass people again)
      u.uGlass.value = 1;                                   // (v2, the Apple pass: clear glass people — the two of them are the colour)
      return { scene: U.scene, camera: cam, bloom: { strength: 0.35, threshold: 1.0, radius: 0.6 } };
    },
  },

  liquid: { start: UNLOCK.sheet, end: FOAM.in + 0.4, frame: (t) => (t < FOAM.in ? revealLiquid(t) : sharedBeads(t)) },

  under: [
    { start: UNLOCK.both + 0.6, end: FOAM.in + 0.6, draw(ctx, t) { drawSky(ctx, { t }); } },      // (until then howto.js draws the sky)
    { start: UNLOCK.wallPop, end: FOAM.in + 0.6, draw(ctx, t) { revealUnder(ctx, t); } },
  ],

  layers: [{
    start: UNLOCK.both, end: FOAM.in + 0.6,
    draw(ctx, t) { reveal(ctx, t); },
  }],
  fx(t) {
    const lf = lockFx(t);
    if (lf) return lf;
    // the drop, then the wall: a punch, a big flash and a shake
    const a = t - UNLOCK.both, k = t - UNLOCK.wallPop;
    if (a > 0 && a < 0.4 && k < 0) return { zoom: 1 + 0.05 * Math.exp(-a * 10) };
    if (k > 0 && k < 0.9) {
      const sh = 0.014 * Math.exp(-k * 7);
      // v2, the Apple pass: the day's hit is a punch, a shake and a ring of air through the burst — no added light
      // (rays, beams and a flash on the white left the reveal a pale haze)
      return { zoom: 1 + 0.06 * Math.exp(-k * 8), sx: sh * Math.sin(k * 95), sy: sh * Math.cos(k * 77),
        shock: { x: W / 2, y: KISS.y, r: 100 + 2600 * ease.outCubic(clamp(k / 0.8)), k: 40 * (1 - clamp(k / 0.8)), w: 150, disp: 0.12 },
        shutter: 1.0, samples: 24 };
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
    if (i === 1) return;                                   // v2: their lock is the 3D rig over the sheet (lockRig)
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
  if (t < UNLOCK.sheet || t >= FOAM.in) return null;
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
    prims.push(...lockRig(t));
    // v2: the sheet's own light — a bright studio for the gold and the glass over the white app (a dusk mirrored in
    // polished gold reads black)
    const env = t >= UNLOCK.waiting - 0.2 ? { skyTop: '#FFF8EC', skyHor: '#FFFFFF', skyLow: '#8C8A96', night: 0, keyGain: 7, studio: 1, rim: { pos: [6, 4, -2], col: '#FFFFFF', gain: 0 } } : undefined;
    return { prims, face: b?.face, cam: PHONE_CAM, useDepth: true, env };
  }
  // v2: the light in them goes as the faces arrive: they clear into glass over the photos (revealUnder)
  const clear = seg(t, UNLOCK.faces - 0.12, UNLOCK.faces + 0.2, ease.inOutCubic);
  const prims = [orb(o.a, o.ra, YOU_COLORS, 1.3, 41, quiver), orb(o.b, o.rb, OTTER_COLORS, 4.1, 42, -quiver)].map((p) => ({
    ...p, type: 'sphere', pop: 0, core: lerp(0.9, 0, clear), absorb: lerp(0.9, 0, clear), coat: 0.5 * clear, edge: 0.6, env: lerp(0.75, 1.0, clear) }));
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
  return null;                                             // v2: the padlock is the 3D rig (lockRig)
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
  const k = t - UNLOCK.wallPop;
  // (the orbs, their kiss and the wall are liquid: revealLiquid; v2: the photos are under the liquid, revealUnder,
  // so the glass orbs over them refract them)
  // droplets at the wall pop (v2, the Apple pass: no drawn rings, no confetti, no glints — the white stays clean)
  if (k > 0 && k < 0.9) for (const q of drops.slice(0, 18)) {      // (v2: a few, quickly gone — no dust on the white)
    const p = particleAt(q, W / 2, KISS.y, k, 1000, 3);
    if (p.a > 0) drawDroplet(ctx, p.x, p.y, q.size * 0.6, q.vx * Math.exp(-3 * k), q.vy * Math.exp(-3 * k), p.a);
  }
  const dpp = t - (UNLOCK.almost + 0.85);
  if (dpp > 0 && dpp < 1.0) for (const q of drops.slice(0, 40)) {
    const p = particleAt(q, W / 2, 300, dpp, 900, 3.4);
    if (p.a > 0) drawDroplet(ctx, p.x, p.y, q.size * 0.5, q.vx * Math.exp(-3.4 * dpp), q.vy * Math.exp(-3.4 * dpp), p.a);
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
  // v2: the photos, under the glass orbs that carried them (revealLiquid), clearing as the light in them goes
  if (t >= UNLOCK.faces - 0.1 && t < FOAM.in) {
    const fp = spring(t - UNLOCK.faces + 0.1, SPRING.wobble);
    const sc = lerp(0.85, 1, fp);
    for (const [key, x] of [[LEADS.you, ax], [LEADS.one, bx]]) drawPhoto(ctx, key, x, y, REVEAL.r * sc * 0.96);
  }
  ctx.save();
  ctx.globalAlpha *= 1 - seg(t, FOAM.in - 0.1, FOAM.in + 0.4);
  if (t >= UNLOCK.faces) {
    const na = spring(t - UNLOCK.names, SPRING.pop);
    if (na > 0.001) {
      ctx.save(); ctx.globalAlpha *= clamp(na * 3);
      const ny = y + REVEAL.r + 82 + (1 - na) * 30;
      text(ctx, NAMES[LEADS.you], ax, ny, { f: FONTS.display, w: 600, size: 52, color: '#1D1D1F', align: 'center', track: -0.004 * 52 });
      text(ctx, NAMES[LEADS.one], bx, ny, { f: FONTS.display, w: 600, size: 52, color: '#1D1D1F', align: 'center', track: -0.004 * 52 });
      ctx.restore();
    }
    shareRow().forEach((o, i) => {
      const p = spring(t - shareIn(i) - 0.05, SPRING.pop);
      if (p <= 0.001) return;
      ctx.save(); ctx.globalAlpha *= clamp(p * 3);
      text(ctx, SHARED[i][1], o.text, SHARE.y, { f: FONTS.display, w: 600, size: SHARE.size, color: '#6E6E73', align: 'left' });
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
      // (v2, the Apple pass: almost in the secondary grey, as the name sets it; it still swells and pops)
      const g = '#8E919A';
      about(ctx, W / 2, 330, s, s, () => {
        drawLine(ctx, almost, x0, base, { fill: g, forceFill: true });
        // its edge: the film's rim, a soft line of the brand's grey so it reads against the sky
        ctx.save(); ctx.lineWidth = 0; ctx.strokeStyle = 'rgba(0,0,0,0)';
        ctx.font = `${almost.opt.w} ${almost.opt.s}px ${almost.opt.f}`; ctx.letterSpacing = `${(almost.opt.track * almost.opt.s).toFixed(2)}px`;
        ctx.strokeText(almost.text, x0, base); ctx.letterSpacing = '0px'; ctx.restore();
      });
    }
    const slide = spring(t - popT, SPRING.settle);
    const fy = lerp(540, 440, slide);
    drawLine(ctx, friends, centerX(friends, W / 2), fy, { fill: '#1D1D1F', each: combine(popEach(friends, t, [UNLOCK.almost + 0.15]), waveEach(friends, t, popT + 0.05, { amp: 0.12 })) });
  }
  ctx.restore();
}


// ── v2: the lock (the crazy version; research/refs/05, 06) ──────────────────────────────────────────────────────────
// A padlock of polished gold rises out of the sheet between your slot and theirs, inside two crystal dial rings — one
// yours (blue light), one theirs (coral) — each with a bead of light on it and chrome ticks round it, a gold notch at
// twelve. Your ring clicks home as you tap; theirs spins on through the wait, slowing; on the open it clicks home, the
// shackle springs up and swings, the lock blooms gold, the rings fly apart, and the drop takes over.
const LOCK = { x: W / 2, y: () => S.slotY - pt(14) };      // (v2, the Apple pass: level with the slot orbs, clear of the names under them)
const PXW = 1 / W;
const RIG = { body: [96, 74, 40], corner: 26, shackle: [56, 15, 64], ringYou: 104, ringThem: 130,   // (v2, the Apple pass: clear of the sheet's words)
  tube: 9, bead: 24, tick: 4.6, lift: 150 };
const CLICK_YOU = UNLOCK.waiting + 0.2;
const at = (dx, dy, dz, t) => toWorld(LOCK.x + dx, LOCK.y() + sheetOff(t) + dy, RIG.lift + dz);
const RING_Q = [Math.SQRT1_2, 0, 0, Math.SQRT1_2];          // a torus turned to lie in the glass's plane
function ringAngle(you, t) {
  const tc = you ? CLICK_YOU : UNLOCK.open, top = Math.PI / 2;
  if (t >= tc) { const d = t - tc; return top + 0.24 * Math.exp(-d * 9) * Math.sin(d * 34); }
  const x = tc - t;
  return you ? top - 14 * x : top - (2.8 * x + 0.9 * x * x);
}
function lockRig(t) {
  const a = spring(t - UNLOCK.waiting, { stiffness: 600, damping: 0.62 });
  if (a <= 0.002 || t >= UNLOCK.both + 0.05) return [];
  const k = t - UNLOCK.open;
  const fly = seg(t, UNLOCK.open + 0.05, UNLOCK.both, ease.outCubic);          // the rings fly apart after the open
  const gone = 1 - seg(t, UNLOCK.both - 0.2, UNLOCK.both - 0.04, ease.inCubic);  // the lock goes into the light before the drop
  const s = a * gone;
  const prims = [];
  const P = (dx, dy, dz) => at(dx * s, dy * s, dz * s, t);
  // the body: polished gold
  prims.push({ type: 'slab', pos: P(0, 0, 0), size: RIG.body.map((v) => v * PXW * s), round: RIG.corner * PXW * s, glass: 1, metal: 1, rough: 0.14,
    tint: '#FFD27A', edge: 0.4, group: 90 });
  // the keyhole: a dark inlay on its face
  prims.push({ type: 'sphere', pos: P(0, -8, RIG.body[2] + 1), size: [11 * PXW * s], scale: [1, 1, 0.25], glass: 1, metal: 1, rough: 0.35, tint: '#141826', group: 91 });
  prims.push({ type: 'slab', pos: P(0, 8, RIG.body[2] + 1), size: [5 * PXW * s, 14 * PXW * s, 2.5 * PXW * s], round: 2 * PXW * s, glass: 1, metal: 1, rough: 0.35, tint: '#141826', group: 91 });
  // the shackle: chrome; it springs up and swings about its left leg on the open
  const lift = k > 0 ? spring(k, { stiffness: 1800, damping: 0.62 }) * 34 : 0;
  const swing = k > 0.04 ? spring(k - 0.04, { stiffness: 240, damping: 0.38 }) * 0.85 : 0;
  const [R, tube, legs] = RIG.shackle;
  const cx = -R + R * Math.cos(swing), cz = R * Math.sin(swing);              // its centre swung round its left leg
  const q = [0, Math.sin(-swing / 2), 0, Math.cos(-swing / 2)];
  prims.push({ type: 'shackle', pos: P(cx, -(RIG.body[1] - 4) - lift, cz), size: [R * PXW * s, tube * PXW * s, legs * PXW * s], quat: q, glass: 1, metal: 1, rough: 0.08,
    tint: '#E9ECF2', edge: 0.4, group: 90, k: 0.002 });
  // the dial: two rings of clear glass, a bead of light on each, chrome ticks, a gold notch at twelve
  const ringsS = s * (1 + 1.6 * fly), ringA = 1 - fly;
  if (ringA > 0.01) {
    for (const [you, Rr, cols, g] of [[true, RIG.ringYou, ['#2F6BFF', '#6E9BFF', '#1C3FD8'], 92], [false, RIG.ringThem, ['#FF6B5A', '#FFA06B', '#FF4F7A'], 93]]) {
      const unfold = spring(t - UNLOCK.waiting - (you ? 0 : 0.08), { stiffness: 420, damping: 0.7 });
      const rr = Rr * ringsS * unfold;
      if (rr < 2) continue;
      prims.push({ type: 'torus', pos: at(0, 0, 0, t), size: [rr * PXW, RIG.tube * PXW * s], quat: RING_Q, glass: 1, refr: 0.06, frost: 0, haze: 0.04,
        tint: cols[0], tintAmt: 0.35, edge: 0.6, env: 1.1, spec: 1.2, alpha: ringA, group: g });
      const ph = ringAngle(you, t);
      prims.push({ type: 'sphere', pos: at(Math.cos(ph) * rr, -Math.sin(ph) * rr, 0, t), size: [RIG.bead * PXW * s], ...LIGHT_ORB, tint: cols[0], c2: cols[1], c3: cols[2],
        core: 1.3, coreSeed: you ? 1 : 4, alpha: ringA, group: g + 10 });
      for (let i = 1; i < 12; i++) {
        const th = ph + (i / 12) * TAU;
        prims.push({ type: 'sphere', pos: at(Math.cos(th) * rr, -Math.sin(th) * rr, 0, t), size: [RIG.tick * PXW * s], glass: 1, metal: 1, rough: 0.1, tint: '#DDE3EE',
          alpha: ringA, group: g + 20 + i });
      }
    }
    prims.push({ type: 'sphere', pos: at(0, -(RIG.ringThem + 16) * ringsS, 0, t), size: [8 * PXW * s], glass: 1, metal: 1, rough: 0.12, tint: '#FFD27A', alpha: ringA, group: 120 });
  }
  return prims;
}
// the clicks (a small blue one for yours, a gold one for theirs) and the bloom of the open, where the lens sees them
function lockFx(t) {
  const pose = phonePose(t);
  const [lx, ly] = projectScreen(pose, LOCK.x, LOCK.y() + sheetOff(t), RIG.lift);
  const c1 = t - CLICK_YOU, k = t - UNLOCK.open;
  if (c1 >= 0 && c1 < 0.3) return { shock: { x: lx, y: ly, r: 80 + 700 * (c1 / 0.3), k: 12 * (1 - c1 / 0.3), w: 60, disp: 0 } };
  if (k >= 0 && k < 0.5) {
    return {
      // (v2, the Apple pass: on the white sheet the gold is the light — the open is a punch and a ring of air, no added
      // light: rays, beams and a flash washed the app out, and the colour split fringed the phone's edge with a rainbow)
      zoom: 1 + 0.03 * Math.exp(-k * 10),
      shock: { x: lx, y: ly, r: 80 + 1400 * ease.outCubic(k / 0.5), k: 20 * (1 - k / 0.5), w: 100, disp: 0 },
      shutter: 0.9,
    };
  }
  return null;
}

// ── v2: "You're both in!" in coloured light ──────────────────────────────────────────────────────────────────────
// pinned where the lens is at the pop (as bothSign pinned its sign), and left there
function popPin(cam, x, y, D) {
  _bc.copy(cam); const z = -205 + 2.5 * (UNLOCK.wallPop - UNLOCK.lift);
  _bc.position.set(PATH.x(z), PATH.y(z), z); _bc.up.set(0, 1, 0); _bc.lookAt(PATH.x(z - 8), PATH.y(z - 8), z - 8); _bc.updateMatrixWorld();
  return { ...pin(_bc, x, y, D), from: _bc.position.clone() };
}
let wordsPin = null;
function bothWords(t, cam) {
  const out = seg(t, UNLOCK.almost - 0.3, UNLOCK.almost, MOVE.out);
  const on = t >= UNLOCK.wallPop && out < 1;
  for (const w of BOTH3D) w.group.visible = on;
  if (!on) return;
  wordsPin ??= popPin(cam, W / 2, 470, 6);
  const total = BOTH3D.reduce((a, w) => a + w.width, 0) + 0.3 * (BOTH3D.length - 1);
  const scale = (900 * wordsPin.wpp) / total;
  const drift = cam.position.clone().sub(wordsPin.from).multiplyScalar(0.85);
  const right = new THREE.Vector3(1, 0, 0).applyQuaternion(wordsPin.quat), up = new THREE.Vector3(0, 1, 0).applyQuaternion(wordsPin.quat);
  let x = -total / 2;
  BOTH3D.forEach((w, i) => {
    const t0 = UNLOCK.wallPop + 0.02 + i * 0.1;
    const p = spring(t - t0, { stiffness: 1000, damping: 0.6 });
    const cx = (x + w.width / 2) * scale;
    x += w.width + 0.3;
    w.group.visible = on && p > 0.01;
    w.group.position.copy(wordsPin.pos).add(drift).addScaledVector(right, cx).addScaledVector(up, out * 0.9);
    w.group.quaternion.copy(wordsPin.quat);
    w.group.scale.setScalar(scale * lerp(1.8, 1, p) * (1 - out));
  });
}
