// III–VI · HOW IT WORKS (9.5–50.4 s): one phone, four steps, a plain caption above it the whole time, and a camera
// that pushes in on whatever matters (ui/phonecam.js).
//   1 Pick what matters to you (10–15.25)  Bub asks; six tags; three quick taps; your answer; "Let me look around"
//   2 AI finds people who share them (15.25–27.5)  the radar; the camera dives into your orb, which bursts into the
//      bubble universe (3D): Bub flies through it looking around, the scan lights up people who share your values,
//      Bub spots the one, and the one carries you back into the app: the match
//   3 Chat anonymously for 3 days (27.5–41.5)  a push-in on "WAIT. Same!!", SAME!! bursts out as the camera pulls
//      back; three days in the sky
//   4 It takes two yeses (41.5–50.4)  the unlock sheet inside the phone (scenes/unlock.js draws it) and the slow push
//      onto their slot; at the drop unlock.js takes over
import * as THREE from 'three';
import { W, H } from '../config.js';
import { C, FONTS, UI, P, PKEYS, SPRING, MOVE } from '../brand.js';
import { NAME, ONB, MATCH, CHAT, UNLOCK } from '../score.js';
import { T, fill } from '../copy.js';
import { clamp, lerp, seg, ease, spring, smoothstep, TAU, rgba } from '../util.js';
import { drawSky } from '../world/sky.js';
import { drawBubble2D, drawBubFace, drawColorOrb, blinkAt } from '../world/bubble2d.js';
import { APP_ICON } from '../world/mark.js';
import { Line, drawLine, popEach, combine, centerX, waveEach, CJK } from '../type.js';
import { layoutMsg, drawMsg, typing } from '../ui/chat.js';
import { squirclePath, text, measure, about } from '../ui/kit.js';
import { homeIndicator } from '../ui/ios.js';
import { K, appSky, topBar, bubAvatar, aiTag } from '../ui/app.js';
import { drawPhone, drawLaunch, launchU, screenToFrame } from '../ui/phone.js';
import { phonePose, LAYOUT } from '../ui/phonecam.js';
import { conversation, OTTER_COLORS, UNIVERSE_CAST, YOU_COLORS } from '../ui/convo.js';
import { universe, PATH, project } from '../gl/universe.js';
import { unlockScreen } from './unlock.js';
import { burst, particleAt, drawDroplet } from '../morph.js';

const pt = (v) => v * K;
const L = LAYOUT;
const PICKS = ['family', 'career', 'adventure'];
const ORDER = ['family', 'wealth', 'career', 'health', 'learning', 'adventure'];
const CAP_GAP = 0.35;                         // a caption is gone this long before the next one starts
const PHONE_FADE = { y0: 500, y1: 610, k: 1 };
const BADGE = { y: 236, r: 50, size: 74 };
const VIEW = { viewBottom: pt(430) };         // the chat keeps its newest message high in the phone
const FLY0 = MATCH.dive + 0.1;                // the 3D flight: your orb bursts and the universe opens
let caps, mB1, mB2, mYou, mBub, chips, hero1, hero2, same, dayLines, U;
const shards = burst(61, 110, { speed: [1000, 2600], spread: TAU, size: [10, 26] });
const sparks = burst(71, 44, { speed: [700, 1700], spread: TAU, size: [12, 24], colors: [P.family.color, C.gold, '#FFFFFF', P.adventure.color] });

export default {
  init(env) {
    const cap = (s, size) => new Line(s, { s: size, w: 790, track: -0.03 });
    const steps = [['1', ONB.cap, MATCH.cap - CAP_GAP], ['2', MATCH.cap, CHAT.cap - CAP_GAP], ['3', CHAT.cap, CHAT.noNames - CAP_GAP],
      ['3', CHAT.noNames, UNLOCK.step - CAP_GAP], ['4', UNLOCK.step, UNLOCK.both - 0.3]];
    caps = T.caps.map((c, i) => ({ n: steps[i][0], at: steps[i][1], out: steps[i][2], lines: c.lines.map((l) => cap(l, c.s)), ...(c.blue !== undefined ? { blue: c.blue } : {}) }));
    const lm = (s, maxW = 300) => layoutMsg(s, K, { maxW, size: 19 });
    mB1 = lm(T.bub.hi);
    mB2 = lm(T.bub.ask);
    mYou = lm(PICKS.map((k) => P[k].label).join(T.list));
    mBub = lm(T.bub.got);
    hero1 = new Line(T.hero[0], { s: pt(30), w: 780, track: -0.02 });
    hero2 = new Line(T.hero[1], { s: pt(30), w: 780, track: -0.02 });
    same = new Line(T.same.text, { s: T.same.s, w: 800, track: -0.04 });
    dayLines = [1, 2, 3].map((d) => new Line(fill(T.day, { d }), { s: 120, w: 800, track: -0.03 }));
    // the tags, two per row, centred rows
    const mctx = document.createElement('canvas').getContext('2d');
    chips = ORDER.map((key) => ({ key, label: `${P[key].emoji}  ${P[key].label}` }));
    for (let r = 0; r < 3; r++) {
      const pair = chips.slice(r * 2, r * 2 + 2);
      const ws = pair.map((c) => measure(mctx, c.label, { f: FONTS.ui, w: 650, size: pt(17.5) }) + pt(34));
      let x = W / 2 - (ws[0] + ws[1] + pt(10)) / 2;
      pair.forEach((c, i) => { c.x = x; c.y = L.onb.chips + r * L.onb.row; c.w = ws[i]; c.h = L.onb.chipH; x += ws[i] + pt(10); });
    }
    U = universe(env, UNIVERSE_CAST);
  },

  // step 2's flight through the universe: Bub is a 3D character in it (gl/bub3d.js), depth-tested with the crowd
  three: {
    start: FLY0, end: MATCH.back,
    update(t) {
      const rig = flightRig(t);
      const cam = U.camera;
      cam.position.copy(rig.cam);
      cam.up.set(0, 1, 0);
      cam.lookAt(rig.look);
      cam.rotateZ(rig.roll);
      cam.updateMatrixWorld();
      // the heroes, far to near in render order (transparent films blend back to front)
      const heroes = [[U.bub.root, rig.bub], [U.one, rig.one], [U.cands[0], rig.cand[0].pos], [U.cands[1], rig.cand[1].pos]]
        .sort((p, q) => q[1].distanceTo(rig.cam) - p[1].distanceTo(rig.cam));
      heroes.forEach(([o], i) => { if (o !== U.bub.root) { o.children[0].renderOrder = 10 + i * 10; o.children[1].renderOrder = 13 + i * 10; } });
      const bubOrder = 10 + heroes.findIndex(([o]) => o === U.bub.root) * 10;
      U.bub.root.visible = true;
      _toCam.copy(rig.cam).sub(rig.bub).normalize();
      U.bub.set({ ...rig.face, pos: rig.bub, r: rig.bubR, toCam: _toCam, t, order: bubOrder });
      U.one.visible = true;
      U.one.position.copy(rig.one); U.one.scale.setScalar(rig.oneR);
      const ou = U.one.uniforms;
      ou.uTime.value = t; ou.uGlow.value = 0.5 + 0.9 * rig.glow;
      ou.uSquash.value = rig.oneSquash; ou.uSquashDir.value.copy(rig.oneSquashDir); ou.uWobble.value = 0.02 + 0.05 * rig.oneWob;
      U.cands.forEach((m, i) => {
        const c = rig.cand[i];
        m.visible = c.vis > 0.001;
        m.position.copy(c.pos); m.scale.setScalar(c.r);
        const cu = m.uniforms;
        cu.uTime.value = t; cu.uAlpha.value = c.vis; cu.uGlow.value = 0.4;
        cu.uSquash.value = c.squash; cu.uSquashDir.value.copy(c.squashDir); cu.uWobble.value = 0.02 + 0.06 * c.wob;
      });
      const u = U.uniforms;
      u.uTime.value = t;
      u.uAlpha.value = seg(t, FLY0, FLY0 + 0.15);
      u.uVeil.value = 1; u.uVeilY.value = 0.44;           // keep the caption band clear
      u.uBurst.value = 0; u.uOne.value = -1;
      u.uBubAt.value.copy(rig.bub); u.uBubR.value = rig.bubR; u.uPush.value = 1;
      u.uClearAt.value.copy(rig.one); u.uClearR.value = rig.oneR;
      u.uScanAt.value.copy(rig.scanAt);
      u.uScanR.value = lerp(-1, 110, seg(t, MATCH.scan, MATCH.scan + 1.8, ease.outCubic));
      u.uLitGain.value = 1 + 0.6 * Math.exp(-Math.max(0, t - MATCH.scan) * 1.5);
      u.uNear.value = 10; u.uFar.value = 70;
      u.uNearFade.value = 2.6 * seg(t, MATCH.fly, MATCH.fly + 0.6) * (1 - seg(t, MATCH.rush, MATCH.rush + 0.3));
      return { scene: U.scene, camera: cam, bloom: { strength: 0.32, threshold: 1.05, radius: 0.55 } };
    },
  },

  under: [{
    start: NAME.open - 0.2, end: UNLOCK.sheet + 0.2,
    draw(ctx, t) {
      // the sky; in step 3 it runs through three days (dawn → noon → golden → dusk, never night), with a sun
      const days = seg(t, CHAT.days0 - 0.2, CHAT.days0 + 0.2) * (1 - seg(t, CHAT.last - 0.2, CHAT.last + 0.3));
      let tod = 0.5;
      if (days > 0) {
        const u = clamp((t - CHAT.days0) / 2, 0, 3), f = u - Math.floor(u);
        tod = lerp(0.5, lerp(0.0, 1.5, Math.min(f * 1.15, 1)), days);
      }
      drawSky(ctx, { tod });
      if (days > 0) {
        const u = clamp(((t - CHAT.days0) / 2) % 1), sx = lerp(80, 1000, u), sy = 900 - Math.sin(u * Math.PI) * 420;
        const g = ctx.createRadialGradient(sx, sy, 0, sx, sy, 170);
        g.addColorStop(0, '#FFF6D8'); g.addColorStop(0.3, rgba('#FFD86E', 0.95)); g.addColorStop(1, rgba('#FFD86E', 0));
        ctx.save(); ctx.globalAlpha *= days; ctx.fillStyle = g; ctx.beginPath(); ctx.arc(sx, sy, 170, 0, TAU); ctx.fill(); ctx.restore();
      }
    },
  }],

  layers: [{
    start: NAME.open, end: UNLOCK.both + 0.6,
    draw(ctx, t) {
      if (t < NAME.phone) {
        // the app opens out of its icon (Bub's landing on it in the hook is the tap)
        drawLaunch(ctx, launchU(t - NAME.open, NAME.phone - NAME.open), APP_ICON, (c) => screen(c, t), { t });
      } else if (t >= FLY0 && t < MATCH.back) {
        flightOverlay(ctx, t);
      } else {
        const pose = phonePose(t);
        // deep in the screen (the dive, the cut back from the one) the orb must fill the whole frame: the fade lets go
        const fade = { ...PHONE_FADE, k: 1 - smoothstep(2.6, 4, pose.s) };
        drawPhone(ctx, pose, (c) => screen(c, t), { fade, alpha: 1 - seg(t, UNLOCK.both + 0.12, UNLOCK.both + 0.4) });
        overlays(ctx, t, pose);
      }
      if (t < UNLOCK.both) captions(ctx, t);
    },
  }],
  fx(t) {
    // the burst out of your orb into the universe, and the cut back out of the one's bubble: a flash and a shove
    const k = t - FLY0, k2 = t - MATCH.back;
    if (k > 0 && k < 0.5) return { flash: 0.22 * Math.exp(-k * 14), zoom: 1 + 0.04 * Math.exp(-k * 7) };
    if (k2 > -0.16 && k2 < 0.45) return { flash: 0.82 * (k2 < 0 ? smoothstep(-0.16, 0, k2) : Math.exp(-k2 * 10)) };   // a bloom to near white: the cut happens inside it
    return null;
  },
};

// Captions: a step badge and up to two lines above the phone. The badge arrives with step 1 and stays to the reveal;
// when the step changes its digit rolls over (the old one up and out, the new one up from below) with a small pulse.
// A caption's words pop in one by one; on its way out each word fades with a short lift, staggered, and is gone
// before the next caption's first word.
function captions(ctx, t) {
  const first = caps[0], last = caps[caps.length - 1];
  const bs = spring(t - first.at, SPRING.pop) * (1 - seg(t, last.out, last.out + 0.3, MOVE.out));
  if (bs > 0.001) {
    let cur = 0, roll = 1, prev = null;
    for (let i = 0; i < caps.length; i++) {
      if (t < caps[i].at - 0.25) break;
      if (caps[i].n !== caps[cur].n) { prev = caps[cur].n; roll = MOVE.go(seg(t, caps[i].at - 0.25, caps[i].at + 0.1)); }
      cur = i;
    }
    const pulse = 1 + 0.16 * Math.sin(Math.PI * (prev ? roll : 1));
    about(ctx, W / 2, BADGE.y, bs * pulse, bs * pulse, () => {
      ctx.fillStyle = C.blue; ctx.beginPath(); ctx.arc(W / 2, BADGE.y, BADGE.r, 0, TAU); ctx.fill();
      ctx.save();
      ctx.beginPath(); ctx.arc(W / 2, BADGE.y, BADGE.r - 2, 0, TAU); ctx.clip();
      const digit = (n, dy) => text(ctx, n, W / 2, BADGE.y + 26 + dy, { f: FONTS.display, w: 800, size: BADGE.size, color: '#FFFFFF', align: 'center', log: false });
      if (prev && roll < 1) { digit(prev, -roll * 96); digit(caps[cur].n, (1 - roll) * 96); } else digit(caps[cur].n, 0);
      ctx.restore();
    });
  }
  for (const c of caps) {
    if (t < c.at - 0.05 || t > c.out + 0.6) continue;
    // Chinese fills the em box: its first line hangs from the badge by its ink, and its lines are led at 1.14 (Han
    // has no ascenders or descenders to share the gap), so the block ends where the English one does (~500)
    const han = CJK.test(c.lines[0].text);
    let k = 0, y = han ? BADGE.y + BADGE.r + 10 + c.lines[0].ascent : 372;
    c.lines.forEach((line, i) => {
      const at = line.words.map((_, w) => c.at + 0.08 + (k + w) * 0.075);
      const k0 = k;
      const exit = (gi, g, wk) => {
        const t0 = c.out + (k0 + Math.max(0, wk)) * 0.03;
        const o = seg(t, t0, t0 + 0.2, MOVE.out);
        return o > 0 ? { a: 1 - o, dy: -o * 34 } : null;
      };
      k += line.words.length;
      drawLine(ctx, line, centerX(line, W / 2), y, { fill: c.blue === i ? C.blue : C.ink, each: combine(popEach(line, t, at), exit) });
      y += Math.max(line.opt.s, c.lines[Math.min(i + 1, c.lines.length - 1)].opt.s) * (han ? 1.14 : 1.02);
    });
  }
}

// What the phone's screen shows (design coordinates), joined by iOS pushes.
function screen(ctx, t) {
  const slide = (t0) => MOVE.go(seg(t, t0, t0 + 0.42));
  const push = (fnOut, fnIn, u) => {
    if (u <= 0) return fnOut();
    if (u >= 1) return fnIn();
    ctx.save(); ctx.translate(-W * 0.3 * u, 0); fnOut(); ctx.restore();
    ctx.save(); ctx.translate(W * (1 - u), 0); ctx.shadowColor = 'rgba(11,27,63,0.2)'; ctx.shadowBlur = 40; fnIn(); ctx.restore();
  };
  if (t < ONB.next + 0.45) push(() => onboarding(ctx, t), () => matching(ctx, t), slide(ONB.next));
  else if (t < MATCH.back) matching(ctx, t);
  else if (t < MATCH.next + 0.45) push(() => matched(ctx, t), () => conversation(ctx, t, VIEW), slide(MATCH.next));
  else if (t < UNLOCK.sheet) conversation(ctx, t, VIEW);
  else unlockScreen(ctx, t, VIEW);
}

function onboarding(ctx, t) {
  appSky(ctx);
  topBar(ctx, t, { title: 'Bub', sub: T.bub.sub, avatar: bubAvatar(t, { blink: blinkAt(t, [ONB.cap + 1.45, ONB.cap + 4.3]) }), right: (c, x, y) => aiTag(c, x + 8 * K, y + 12 * K) });
  drawMsg(ctx, mB1, pt(16), L.onb.m1, 'in', t, ONB.m1, { fill: '#FFFFFF', ink: UI.ink, k: K, lift: 0.6, joinBottom: true });
  drawMsg(ctx, mB2, pt(16), L.onb.m1 + mB1.H + pt(4), 'in', t, ONB.m2, { fill: '#FFFFFF', ink: UI.ink, k: K, lift: 0.6, joinTop: true });
  // the tag dock, in the thread
  const dockOut = seg(t, ONB.sent - 0.12, ONB.sent + 0.18, MOVE.out);
  const picked = PICKS.filter((_, i) => t >= ONB.taps[i]).length;
  if (dockOut < 1) {
    ctx.save();
    ctx.globalAlpha *= 1 - dockOut;
    if (t >= ONB.chips) text(ctx, fill(T.pick, { n: picked }), W / 2, L.onb.pick, { f: FONTS.ui, w: 700, size: pt(15), color: UI.ink2, align: 'center' });
    chips.forEach((c, i) => {
      const inP = spring(t - (ONB.chips + i * 0.045), SPRING.pop);
      if (inP <= 0.001) return;
      const rank = PICKS.indexOf(c.key);
      const tapT = rank >= 0 ? ONB.taps[rank] : Infinity;
      const st = rank >= 0 ? seg(t, tapT, tapT + 0.12, MOVE.in) : 0;
      const press = rank >= 0 ? 1 - 0.12 * Math.sin(clamp((t - tapT + 0.05) / 0.14) * Math.PI) : 1;
      const lift = rank >= 0 ? seg(t, ONB.sent - 0.12, ONB.sent + 0.15, MOVE.out) : 0;
      const s = inP * press * (1 + 0.18 * lift);
      about(ctx, c.x + c.w / 2, c.y + c.h / 2, s, s, () => chipView(ctx, c, st, rank, t, tapT));
    });
    ctx.restore();
  }
  // one finger, three quick taps: it lands on each tag on the 8th and glides to the next
  const fA = seg(t, ONB.taps[0] - 0.22, ONB.taps[0] - 0.08) * (1 - seg(t, ONB.taps[2] + 0.1, ONB.taps[2] + 0.28));
  if (fA > 0) {
    const at = PICKS.map((k) => chips.find((q) => q.key === k)).map((c) => [c.x + c.w * 0.62, c.y + c.h * 0.6]);
    let [fx, fy] = at[0];
    for (let i = 1; i < 3; i++) {
      const u = MOVE.go(seg(t, ONB.taps[i] - 0.14, ONB.taps[i] - 0.02));
      fx = lerp(fx, at[i][0], u); fy = lerp(fy, at[i][1], u);
    }
    const press = ONB.taps.reduce((m, tt) => Math.max(m, Math.exp(-Math.abs(t - tt) * 30)), 0);
    ctx.save(); ctx.globalAlpha *= fA * 0.32; ctx.fillStyle = UI.ink;
    ctx.beginPath(); ctx.arc(fx, fy, pt(21) * (1 - 0.18 * press), 0, TAU); ctx.fill(); ctx.restore();
  }
  // your answer and Bub's
  let y2 = L.onb.sent;
  if (t >= ONB.sent) { drawMsg(ctx, mYou, W - pt(16) - mYou.W, y2, 'out', t, ONB.sent, { fill: C.blue, ink: '#fff', k: K, lift: 0.8 }); y2 += mYou.H + pt(10); }
  typing(ctx, pt(16), y2, t, ONB.typing, ONB.reply - 0.05, { fill: '#FFFFFF', dot: UI.ink3, k: K });
  if (t >= ONB.reply) drawMsg(ctx, mBub, pt(16), y2, 'in', t, ONB.reply, { fill: '#FFFFFF', ink: UI.ink, k: K, lift: 0.6 });
  homeIndicator(ctx, 0, 0, W, H, K, UI.ink);
}

function chipView(ctx, c, st, rank, t, tapT) {
  const path = squirclePath(c.x, c.y, c.w, c.h, c.h / 2);
  ctx.save(); ctx.shadowColor = 'rgba(11,27,63,0.08)'; ctx.shadowBlur = 8 * K; ctx.shadowOffsetY = 2 * K;
  ctx.fillStyle = '#fff'; ctx.fill(path); ctx.restore();
  if (st > 0) {
    ctx.save(); ctx.clip(path); ctx.fillStyle = P[c.key].color;
    ctx.beginPath(); ctx.arc(c.x + c.w * 0.62, c.y + c.h * 0.58, (c.w * 0.8) * st, 0, TAU); ctx.fill(); ctx.restore();
  } else { ctx.lineWidth = 1.5 * K; ctx.strokeStyle = UI.chipStroke; ctx.stroke(path); }
  text(ctx, c.label, c.x + 17 * K, c.y + c.h / 2 + 17.5 * K * 0.36, { f: FONTS.ui, w: 650, size: 17.5 * K, color: st > 0.5 ? P[c.key].text : UI.ink });
  if (rank >= 0) {
    const bp = spring(t - tapT - 0.03, SPRING.pop);
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

// Step 2's screen: you as an orb in your three colours, a radar pulsing out of you while Bub looks around.
function matching(ctx, t) {
  appSky(ctx);
  topBar(ctx, t, { title: 'Bub', sub: T.bub.looking, avatar: bubAvatar(t, { look: [Math.sin(t * 6) * 0.8, 0], happy: 0, wide: 0.5 }), right: (c, x, y) => aiTag(c, x + 8 * K, y + 12 * K) });
  const R = L.radar;
  const born = seg(t, ONB.next + 0.15, ONB.next + 0.6, MOVE.in);
  if (t >= MATCH.radar) {
    for (let i = 0; i < 3; i++) {
      const ph = ((t - MATCH.radar) / 0.9 + i / 3) % 1;
      ctx.save(); ctx.globalAlpha *= (1 - ph) * 0.7;
      ctx.strokeStyle = P.family.color; ctx.lineWidth = pt(2.2);
      ctx.beginPath(); ctx.arc(W / 2, R.orb, pt(46) + ph * pt(150), 0, TAU); ctx.stroke(); ctx.restore();
    }
  }
  drawColorOrb(ctx, W / 2, R.orb, pt(46), YOU_COLORS, [born, born, born], { t, seed: 1.3 });
  text(ctx, T.you, W / 2, R.you, { f: FONTS.ui, w: 750, size: pt(17), color: UI.ink, align: 'center' });
  text(ctx, PICKS.map((k) => P[k].label).join(' · '), W / 2, R.you + pt(24), { f: FONTS.ui, w: 600, size: pt(15), color: UI.ink2, align: 'center' });
  homeIndicator(ctx, 0, 0, W, H, K, UI.ink);
}

// The match: the one arrives (the camera pulls out of their orb), your two bubbles fly together and kiss into a
// double bubble, and the app says why.
function matched(ctx, t) {
  appSky(ctx);
  const M = L.matched, r = M.r, cy = M.cy;
  const come = seg(t, MATCH.back + 0.55, MATCH.kiss, MOVE.go);
  const kissS = spring(t - MATCH.kiss, SPRING.wobble);
  const d = t < MATCH.kiss ? lerp(2 * M.apart, 2 * r + pt(10), come) : lerp(2 * r + pt(10), r, kissS);
  const ax = W / 2 - d / 2, bx = W / 2 + d / 2;
  const touching = d < 2 * r - 0.5;
  ctx.save(); if (touching) { ctx.beginPath(); ctx.rect(0, 0, W / 2, H); ctx.clip(); }
  drawColorOrb(ctx, ax, cy, r, YOU_COLORS, [1, 1, 1], { t, seed: 1.3 });
  ctx.restore();
  ctx.save(); if (touching) { ctx.beginPath(); ctx.rect(W / 2, 0, W / 2, H); ctx.clip(); }
  drawColorOrb(ctx, bx, cy, r, OTTER_COLORS, [1, 1, 1], { t, seed: 4.1 });
  ctx.restore();
  if (touching) {
    const half = Math.sqrt(Math.max(0, r * r - (d / 2) ** 2));
    ctx.fillStyle = 'rgba(255,255,255,0.45)'; ctx.beginPath(); ctx.ellipse(W / 2, cy, half * 0.16, half, 0, 0, TAU); ctx.fill();
    ctx.lineWidth = pt(1.6); ctx.strokeStyle = rgba('#9B8CFF', 0.8); ctx.stroke();
  }
  const lab = seg(t, MATCH.kiss + 0.15, MATCH.kiss + 0.4);
  ctx.save(); ctx.globalAlpha *= lab;
  text(ctx, T.you, W / 2 - r * 1.05, M.labels, { f: FONTS.ui, w: 700, size: pt(16), color: UI.ink2, align: 'center' });
  text(ctx, T.otter, W / 2 + r * 1.05, M.labels, { f: FONTS.ui, w: 700, size: pt(16), color: UI.ink2, align: 'center' });
  ctx.restore();
  drawLine(ctx, hero1, centerX(hero1, W / 2), M.hero1, { fill: UI.ink, each: popEach(hero1, t, [MATCH.line, MATCH.line + 0.1]) });
  drawLine(ctx, hero2, centerX(hero2, W / 2), M.hero2, { fill: C.blue, each: popEach(hero2, t, [MATCH.line + 0.35, MATCH.line + 0.45, MATCH.line + 0.55]) });
  const bp = spring(t - (MATCH.sayhi - 0.55), SPRING.pop);
  if (bp > 0.001) {
    const press = 1 - 0.12 * Math.sin(clamp((t - MATCH.sayhi + 0.05) / 0.16) * Math.PI);
    const cyB = M.sayhi + M.sayhiH / 2;
    about(ctx, W / 2, cyB, bp * press, bp * press, () => {
      ctx.fillStyle = C.blue; ctx.fill(squirclePath(W / 2 - pt(105), M.sayhi, pt(210), M.sayhiH, M.sayhiH / 2));
      text(ctx, T.sayHi, W / 2, cyB + pt(7), { f: FONTS.ui, w: 750, size: pt(19), color: '#FFFFFF', align: 'center' });
    });
    const u = (t - MATCH.sayhi + 0.1) / 0.36;
    if (u > 0 && u < 1) { ctx.save(); ctx.globalAlpha *= Math.sin(u * Math.PI) * 0.32; ctx.fillStyle = UI.ink; ctx.beginPath(); ctx.arc(W / 2 + pt(30), cyB + pt(4), pt(22) * (1 - 0.15 * Math.sin(u * Math.PI)), 0, TAU); ctx.fill(); ctx.restore(); }
  }
  homeIndicator(ctx, 0, 0, W, H, K, UI.ink);
}

// Over the phone: SAME!! bursting out of the chat; the day counter.
function overlays(ctx, t, pose) {
  const sb = t - CHAT.sameBurst;
  if (sb > -0.05 && t < CHAT.sameBack + 0.35) {
    const grow = ease.outBack(clamp((sb + 0.05) / 0.32), 2.2), shrink = seg(t, CHAT.sameBack, CHAT.sameBack + 0.35, MOVE.out);
    const [mx, my] = screenToFrame(pose, L.chat.same[0], L.chat.same[1]);
    const cx = lerp(mx, W / 2, grow * (1 - shrink)), cy = lerp(my, 1000, grow * (1 - shrink));
    const s = lerp(0.2, 1, grow) * (1 - 0.8 * shrink);
    about(ctx, cx, cy, s, s, () => {
      ctx.save(); ctx.globalAlpha *= 1 - shrink * 0.8;
      for (let i = 0; i < 14; i++) {
        const ang = (i / 14) * TAU + 0.2 + sb * 0.8, rr = 330 + (i % 2) * 70 + sb * 60;
        drawBubble2D(ctx, cx + Math.cos(ang) * rr, cy + Math.sin(ang) * rr * 0.8, 26 + (i % 3) * 13, { t, seed: i, tint: i % 2 ? P.family.color : C.blue, fill: 0.85 });
      }
      ctx.shadowColor = 'rgba(11,27,63,0.25)'; ctx.shadowBlur = 50; ctx.shadowOffsetY = 18;
      ctx.fillStyle = C.blue;
      ctx.fill(squirclePath(cx - same.width / 2 - 60, cy - same.ascent / 2 - 70, same.width + 120, same.ascent + 140, 120));
      ctx.shadowColor = 'transparent';
      drawLine(ctx, same, centerX(same, cx), cy + same.ascent / 2, { fill: '#fff', each: waveEach(same, t, CHAT.sameBurst + 0.08, { amp: 0.14 }) });
      ctx.restore();
    });
  }
  // the days: Day 1 · 2 · 3 between the caption and the phone, three dots filling
  const dA = seg(t, CHAT.days0 - 0.1, CHAT.days0 + 0.2) * (1 - seg(t, CHAT.last - 0.65, CHAT.last - 0.35));
  if (dA > 0) {
    const di = t < CHAT.day2 ? 0 : t < CHAT.day3 ? 1 : 2;
    const t0 = [CHAT.days0, CHAT.day2, CHAT.day3][di];
    const dl = dayLines[di];
    const p = spring(t - t0, SPRING.pop);
    about(ctx, W / 2 - 60, 650, p, p, () => drawLine(ctx, dl, centerX(dl, W / 2 - 60), 650 + dl.ascent / 2, { fill: C.ink, alpha: dA }));
    for (let i = 0; i < 3; i++) {
      const f = seg(t, [CHAT.days0, CHAT.day2, CHAT.day3][i], [CHAT.days0, CHAT.day2, CHAT.day3][i] + 0.25, MOVE.in);
      const x = W / 2 + dl.width / 2 - 10 + i * 40, y = 650;
      ctx.save(); ctx.globalAlpha *= dA;
      ctx.fillStyle = rgba(C.ink, 0.15); ctx.beginPath(); ctx.arc(x, y, 13, 0, TAU); ctx.fill();
      ctx.fillStyle = C.blue; ctx.beginPath(); ctx.arc(x, y, 13 * f, 0, TAU); ctx.fill();
      ctx.restore();
    }
  }
}

// ── The flight (3D) ──────────────────────────────────────────────────────────────────────────────────────────────
// The camera bursts out of your orb into the universe and Bub swoops past it into the crowd, shouldering bubbles
// aside (the crowd's shader is pushed by Bub's position). It looks around; checks someone ("💰 Wealth first"): no, not
// this one (a head shake); someone else ("💪 Health first"): no; it takes a breath and sends out a scan — everyone who
// puts family first lights up — spots the one, dashes over and bumps them: yes! ("👨‍👩‍👧 Family first"). Then the
// camera rushes into their bubble, which is their orb in the app when the phone comes back.
const Z_START = -18;
// the camera's speed along the path (units/s), eased between keys: it races in, slows to watch each check, darts
// after Bub to the one, then drifts while they celebrate
const V_KEYS = [
  [FLY0, 26], [FLY0 + 0.45, 11], [MATCH.fly + 0.75, 5], [MATCH.cand1 - 0.1, 1.5], [MATCH.nope1 + 0.45, 1.5],
  [MATCH.nope1 + 0.65, 4.5], [MATCH.cand2 - 0.1, 1.5], [MATCH.nope2 + 0.35, 1.3], [MATCH.spot, 1.1],
  [MATCH.spot + 0.3, 7], [MATCH.found - 0.2, 3], [MATCH.found + 0.15, 0.35], [MATCH.back, 0.35],
];
const vAt = (t) => {
  if (t <= V_KEYS[0][0]) return V_KEYS[0][1];
  for (let i = 1; i < V_KEYS.length; i++) {
    const [t1, v1] = V_KEYS[i];
    if (t <= t1) { const [t0, v0] = V_KEYS[i - 1]; return lerp(v0, v1, smoothstep(t0, t1, t)); }
  }
  return V_KEYS[V_KEYS.length - 1][1];
};
const DT = 1 / 480, ZT = [];
for (let t = FLY0, z = Z_START; t <= MATCH.back + 0.5; t += DT) { ZT.push(z); z -= vAt(t) * DT; }
function camZ(t) {
  const f = (Math.max(t, FLY0) - FLY0) / DT, i = Math.min(ZT.length - 2, Math.floor(f));
  return lerp(ZT[i], ZT[i + 1], Math.min(1, f - i));
}
const P3 = (z, dx = 0, dy = 0) => new THREE.Vector3(PATH.x(z) + dx, PATH.y(z) + dy, z);

// the cast of the search, placed in the world where the camera will be watching when Bub gets to them
const CAND = [
  { at: MATCH.cand1, nope: MATCH.nope1, base: P3(camZ(MATCH.cand1) - 4.2, 1.3, -0.2), r: 0.62, key: 'wealth', side: 1 },
  { at: MATCH.cand2, nope: MATCH.nope2, base: P3(camZ(MATCH.cand2) - 4.4, -1.25, 0.45), r: 0.58, key: 'health', side: -1 },
];
const ONE = { base: P3(camZ(MATCH.found) - 5.0, 0.95, 0.25), r: 0.78 };
const BUB_R = 0.55;
const _toCam = new THREE.Vector3();
const UP = new THREE.Vector3(0, 1, 0);

// the path's own frame at the camera's depth (forward, right, up): Bub's chase position hangs off it
function pathFrame(t) {
  const z = camZ(t);
  const pos = P3(z), fwd = P3(z - 7).sub(pos).normalize();
  const right = new THREE.Vector3().crossVectors(fwd, UP).normalize(), up = new THREE.Vector3().crossVectors(right, fwd);
  return { z, pos, fwd, right, up };
}
// a short damped bump: 0 → 1 at contact (~0.1 s) and back, ringing once
const bumpAt = (k) => (k > 0 && k < 0.7 ? Math.sin(Math.PI * clamp(k / 0.2)) * Math.exp(-k * 3.5) + (k > 0.2 ? -0.25 * Math.sin((k - 0.2) * 18) * Math.exp(-(k - 0.2) * 7) : 0) : 0);

// where Bub hovers to look at someone: between them and the camera, on the path side, touching when `gap` < 0
function besideOf(c, cr, gap) {
  const inward = P3(c.z).sub(c); inward.z = 0; inward.normalize();
  const dir = inward.multiplyScalar(0.8).add(new THREE.Vector3(0, -0.1, 0.62)).normalize();
  return { pos: c.clone().addScaledVector(dir, cr + BUB_R + gap), dir };
}

function candState(i, t) {
  const c = CAND[i];
  const bump = bumpAt(t - c.at);
  const { dir } = besideOf(c.base, c.r, 0);
  // after the no it drifts back into the crowd
  const away = MOVE.go(seg(t, c.nope + 0.3, c.nope + 1.3));
  const pos = c.base.clone().addScaledVector(dir, -0.14 * bump);
  pos.x += c.side * 0.9 * away; pos.z -= 0.8 * away; pos.y += 0.25 * away;
  return { pos, r: c.r * (1 - 0.06 * away), vis: 1 - 0.35 * away, squash: -0.16 * bump, squashDir: dir, wob: Math.abs(bump), dir };
}

function oneState(t) {
  const bump = bumpAt(t - MATCH.found);
  const { dir } = besideOf(ONE.base, ONE.r, 0);
  const hop = Math.sin(Math.PI * seg(t, MATCH.found + 0.55, MATCH.found + 0.9)) * 0.12;   // a little "hi!" bounce
  const pos = ONE.base.clone().addScaledVector(dir, -0.16 * bump);
  pos.y += hop;
  return { pos, r: ONE.r * (1 + 0.06 * Math.max(0, bump) + 0.03 * Math.sin(t * 7) * seg(t, MATCH.spot, MATCH.spot + 0.4)), squash: -0.14 * bump, squashDir: dir, wob: Math.abs(bump) };
}

// Bub's position, a chain of poses blended in time (each later pose takes over from whatever came before)
function bubPos(t) {
  const F = pathFrame(t);
  const camP = F.pos;
  const chase = camP.clone().addScaledVector(F.fwd, 3.1).addScaledVector(F.right, -0.12).addScaledVector(F.up, -0.6 + 0.05 * Math.sin(t * 4.3));
  // enter: from beside and behind the camera (off frame), swooping past it into the chase spot
  const behind = camP.clone().addScaledVector(F.right, 1.1).addScaledVector(F.up, -0.8).addScaledVector(F.fwd, -0.4);
  const en = MOVE.in(seg(t, MATCH.fly, MATCH.fly + 0.5));
  let p = behind.lerp(chase, en);
  p.addScaledVector(F.up, Math.sin(Math.PI * en) * 0.35);
  // the two checks: fly over (arcing up), bump them, hover, leave after the no
  for (let i = 0; i < 2; i++) {
    const c = CAND[i];
    const go = MOVE.go(seg(t, c.at - 0.42, c.at));
    const leave = MOVE.go(seg(t, c.nope + 0.3, c.nope + 0.62));
    const w = go * (1 - leave);
    if (w <= 0) continue;
    const gap = lerp(0.35, 0.06, go) - 0.13 * Math.max(0, bumpAt(t - c.at));
    const cs = candState(i, t);
    const b = besideOf(cs.pos, cs.r, gap).pos;
    b.y += Math.sin(Math.PI * go) * 0.3 * (1 - leave) + Math.sin(Math.PI * leave) * 0.2;
    p.lerp(b, w);
  }
  // the scan: it rises a little into the middle of the frame and takes a breath
  const sc = MOVE.go(seg(t, MATCH.scan - 0.35, MATCH.scan));
  p.addScaledVector(F.up, 0.28 * sc * (1 - seg(t, MATCH.spot, MATCH.spot + 0.3)));
  // the dash: a beat to aim, then a whip over to the one, bumping them on the downbeat
  const dash = MOVE.whip(seg(t, MATCH.spot + 0.12, MATCH.found));
  if (dash > 0) {
    const os = oneState(t);
    const gap = 0.05 - 0.16 * Math.max(0, bumpAt(t - MATCH.found));
    const b = besideOf(os.pos, os.r, gap).pos;
    b.y += Math.sin(Math.PI * dash) * 0.45;
    // celebrate: a hop off them, then it settles beside them
    const hop = spring(t - MATCH.found - 0.35, SPRING.wobble);
    b.y += Math.sin(Math.PI * clamp((t - MATCH.found - 0.35) / 0.45)) * 0.4;
    b.addScaledVector(F.right, -0.18 * hop);
    p.lerp(b, dash);
  }
  // never let the camera catch it up (once it is in front): at least 2.3 units ahead along the path
  if (t > MATCH.fly + 0.5) {
    const ahead = p.clone().sub(camP).dot(F.fwd);
    if (ahead < 2.3) p.addScaledVector(F.fwd, 2.3 - ahead);
  }
  // the rush: it steps aside, out of the camera's way
  const ru = MOVE.go(seg(t, MATCH.rush - 0.2, MATCH.rush + 0.4));
  p.addScaledVector(F.right, -2.6 * ru).addScaledVector(F.up, 0.5 * ru);
  return p;
}

// the face: where it looks (key directions, quick head turns between them) and its expression
function bubFace(t, bub, cam, one, cs) {
  const F = pathFrame(t);
  const toCam = cam.clone().sub(bub).normalize();
  const at = (v) => v.clone().sub(bub).normalize();
  const keys = [
    [MATCH.fly - 1, toCam, 0.1],
    [MATCH.fly + 0.5, F.fwd.clone().addScaledVector(F.right, -1.1).addScaledVector(F.up, 0.15), 0.12],   // looks left
    [MATCH.fly + 0.78, F.fwd.clone().addScaledVector(F.right, 1.1).addScaledVector(F.up, 0.35), 0.12],   // …right
    [MATCH.cand1 - 0.45, at(cs[0].pos), 0.14],                                                              // oh — them?
    [MATCH.nope1 + 0.5, F.fwd.clone().addScaledVector(F.right, -0.8).addScaledVector(F.up, 0.4), 0.14],
    [MATCH.cand2 - 0.45, at(cs[1].pos), 0.14],
    [MATCH.nope2 + 0.45, toCam, 0.16],                                                                       // hmm.
    [MATCH.scan - 0.1, F.fwd.clone().addScaledVector(F.up, 0.3), 0.14],
    [MATCH.spot, at(one), 0.1],                                                                              // THERE
    [MATCH.found + 0.95, toCam, 0.18],                                                                       // found them!
    [MATCH.rush, at(one), 0.2],
  ];
  let g = keys[0][1].clone();
  for (let i = 1; i < keys.length; i++) {
    const [t0, dir, dur] = keys[i];
    if (t < t0) break;
    g.lerp(dir.clone().normalize(), MOVE.go(seg(t, t0, t0 + dur))).normalize();
  }
  const shakeOf = (t0) => { const k = t - t0; return k > 0 && k < 0.5 ? 0.45 * Math.sin(k * TAU * 5) * (1 - k / 0.5) : 0; };
  const inspect = (i) => seg(t, CAND[i].at + 0.1, CAND[i].at + 0.25) * (1 - seg(t, CAND[i].nope + 0.45, CAND[i].nope + 0.6));
  const nope = (i) => seg(t, CAND[i].nope - 0.05, CAND[i].nope + 0.05) * (1 - seg(t, CAND[i].nope + 0.45, CAND[i].nope + 0.6));
  const happy = t > MATCH.found + 0.06 && t < MATCH.rush + 0.4 ? 1 : 0;
  return {
    gaze: g,
    shake: shakeOf(MATCH.nope1) + shakeOf(MATCH.nope2),
    squint: Math.max(0.35 * Math.max(inspect(0), inspect(1)), 0.75 * Math.max(nope(0), nope(1))),
    wide: t >= MATCH.spot && t < MATCH.found + 0.06 ? 1 : t >= MATCH.fly && t < MATCH.fly + 0.45 ? 0.7 : 0.3,
    happy,
    blush: 0.5 + 0.6 * happy,
    blink: blinkAt(t, [MATCH.fly + 0.95, MATCH.nope2 + 0.6, MATCH.found + 1.5]),
    look: [0, 0.15 * Math.max(inspect(0), inspect(1))],
  };
}

function flightRig(t) {
  const F = pathFrame(t);
  const cand = [candState(0, t), candState(1, t)];
  const os = oneState(t);
  const bub = bubPos(t);
  // velocity → stretch along the motion; contact → squash along the contact
  const h = 1 / 240, vel = bubPos(t + h).sub(bubPos(t - h)).divideScalar(2 * h);
  const speed = vel.length();
  let squashDir = speed > 1e-3 ? vel.clone().normalize() : UP.clone(), squashK = clamp(speed * 0.045, 0, 0.32);
  for (const [k, dir] of [[t - CAND[0].at, cand[0].dir], [t - CAND[1].at, cand[1].dir], [t - MATCH.found, os.squashDir]]) {
    const b = bumpAt(k);
    if (Math.abs(b) > 0.02) { squashDir = dir; squashK = -0.22 * b; }
  }
  // the camera: on the path, a little bob; it looks at whatever Bub is busy with
  let cam = F.pos.clone().addScaledVector(F.up, 0.04 * Math.sin(t * 2.7));
  const ahead = P3(F.z - 7);
  let look = ahead.clone().lerp(bub, 0.3);
  for (let i = 0; i < 2; i++) {
    const w = MOVE.go(seg(t, CAND[i].at - 0.5, CAND[i].at - 0.05)) * (1 - MOVE.go(seg(t, CAND[i].nope + 0.45, CAND[i].nope + 0.85)));
    look.lerp(bub.clone().lerp(cand[i].pos, 0.5), w);
  }
  look.lerp(bub.clone().addScaledVector(F.fwd, 2), MOVE.go(seg(t, MATCH.scan - 0.4, MATCH.scan)));
  const turn = MOVE.go(seg(t, MATCH.spot, MATCH.spot + 0.5));
  look.lerp(bub.clone().lerp(os.pos, 0.5), turn);
  // the rush into the one
  const rush = ease.inExpo(seg(t, MATCH.rush, MATCH.back));
  if (rush > 0) {
    cam.lerp(os.pos.clone().add(cam.clone().sub(os.pos).normalize().multiplyScalar(0.9 * os.r)), rush);
    look.lerp(os.pos, Math.min(1, rush * 3));
  }
  const curv = PATH.x(F.z - 7) - 2 * PATH.x(F.z - 3.5) + PATH.x(F.z);
  const face = bubFace(t, bub, cam, os.pos, cand);
  const breath = Math.sin(Math.PI * seg(t, MATCH.scan - 0.3, MATCH.scan + 0.15)) * 0.12;
  const sigh = Math.sin(Math.PI * seg(t, MATCH.nope2 + 0.1, MATCH.nope2 + 0.5)) * 0.06;
  return {
    cam, look, roll: curv * 0.35 * (1 - turn) + 0.05 * Math.sin(Math.PI * seg(t, MATCH.spot + 0.12, MATCH.found)),
    bub, bubR: BUB_R * (1 + breath - sigh) * lerp(0.6, 1, MOVE.in(seg(t, MATCH.fly, MATCH.fly + 0.3))),
    face: { ...face, squashDir, squashK },
    cand, one: os.pos, oneR: os.r, oneSquash: os.squash, oneSquashDir: os.squashDir, oneWob: os.wob,
    glow: seg(t, MATCH.spot, MATCH.spot + 0.4) + 0.6 * Math.exp(-Math.max(0, t - MATCH.found) * 3) * (t > MATCH.found ? 1 : 0),
    scanAt: t < MATCH.scan ? bub : bubPos(MATCH.scan),
  };
}

// a white pill with an emoji and a label, popping in under/over a bubble: the callouts of the search
function callout(ctx, label, x, y, p, { alpha = 1, shake = 0 } = {}) {
  if (p <= 0.001 || alpha <= 0.002) return;
  const w = measure(ctx, label, { f: FONTS.ui, w: 700, size: 50 }) + 72, h = 96;
  ctx.save();
  ctx.globalAlpha *= alpha;
  ctx.translate(shake * 14, 0);
  about(ctx, x, y, p, p, () => {
    ctx.save(); ctx.shadowColor = 'rgba(11,27,63,0.18)'; ctx.shadowBlur = 24; ctx.shadowOffsetY = 8;
    ctx.fillStyle = '#FFFFFF'; ctx.fill(squirclePath(x - w / 2, y - h / 2, w, h, h / 2)); ctx.restore();
    text(ctx, label, x, y + 18, { f: FONTS.ui, w: 700, size: 50, color: C.ink, align: 'center' });
  });
  ctx.restore();
}

function flightOverlay(ctx, t) {
  const rig = flightRig(t);
  const cam = U.camera;
  // your orb bursts: the camera came in through it
  const k = t - FLY0;
  if (k < 0.5) {
    const a = 1 - seg(k, 0, 0.07);
    if (a > 0) drawColorOrb(ctx, W / 2, 960, 641 * (1 + 0.3 * k), YOU_COLORS, [1, 1, 1], { t, seed: 1.3, alpha: a });
    for (const q of shards) {
      const ang = Math.atan2(q.vy, q.vx);
      const p = particleAt(q, W / 2 + Math.cos(ang) * 600, 960 + Math.sin(ang) * 600, k, 600, 2.4);
      if (p.a > 0) drawDroplet(ctx, p.x, p.y, q.size * 0.7, q.vx, q.vy, p.a * (1 - seg(k, 0.2, 0.5)));
    }
    ctx.save(); ctx.globalAlpha *= 1 - seg(k, 0, 0.45);
    ctx.strokeStyle = '#FFFFFF'; ctx.lineWidth = Math.max(1, 18 * (1 - k * 2));
    ctx.beginPath(); ctx.arc(W / 2, 960, 640 + 900 * MOVE.in(seg(k, 0, 0.45)), 0, TAU); ctx.stroke(); ctx.restore();
  }
  // the checks: who they are (their top priority), popping in when Bub reaches them; a shake and gone after the no
  CAND.forEach((c, i) => {
    const cs = rig.cand[i];
    const [cx, cy, cr, cz] = project(cam, cs.pos, cs.r);
    if (cz >= 1) return;
    const p = spring(t - c.at - 0.08, SPRING.pop);
    const out = seg(t, c.nope + 0.5, c.nope + 0.7, MOVE.out);
    const shake = t > c.nope && t < c.nope + 0.4 ? Math.sin((t - c.nope) * 50) * (1 - (t - c.nope) / 0.4) : 0;
    callout(ctx, `${P[c.key].emoji}  ${fill(T.first, { p: P[c.key].label })}`, cx, clamp(cy - cr - 80, 680, 1500), p, { alpha: 1 - out, shake });
  });
  // the scan: rings out of Bub
  const sk = t - MATCH.scan;
  if (sk > 0 && sk < 1.3) {
    const [sx, sy] = project(cam, rig.scanAt);
    for (const [d, col, w] of [[0, P.family.color, 14], [0.14, '#FFFFFF', 8]]) {
      const u = clamp((sk - d) / 1.1);
      if (u <= 0 || u >= 1) continue;
      ctx.save(); ctx.globalAlpha *= (1 - u) * 0.85;
      ctx.strokeStyle = col; ctx.lineWidth = w * (1 - u) + 2;
      ctx.beginPath(); ctx.arc(sx, sy, 60 + 1600 * MOVE.in(u), 0, TAU); ctx.stroke(); ctx.restore();
    }
  }
  // the one: a glint when Bub spots them; a ping, sparkles and their callout when it reaches them
  const [ox, oy, orr, oz] = project(cam, rig.one, rig.oneR);
  if (oz < 1) {
    const gk = t - MATCH.spot;
    if (gk > 0 && gk < 0.6) {
      const s = Math.sin(Math.PI * gk / 0.6);
      ctx.save(); ctx.globalAlpha *= s; ctx.fillStyle = '#FFFFFF';
      const gx = ox - orr * 0.45, gy = oy - orr * 0.5, L = 70 * s;
      ctx.beginPath();
      for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4 + gk * 2, rr = i % 2 ? L * 0.16 : L; ctx[i ? 'lineTo' : 'moveTo'](gx + Math.cos(a) * rr, gy + Math.sin(a) * rr); }
      ctx.closePath(); ctx.fill(); ctx.restore();
    }
    const fk = t - MATCH.found;
    if (fk > 0 && fk < 0.8) {
      ctx.save(); ctx.globalAlpha *= 1 - fk / 0.8;
      ctx.strokeStyle = '#FFFFFF'; ctx.lineWidth = 10;
      ctx.beginPath(); ctx.arc(ox, oy, orr * (1.05 + 1.5 * MOVE.in(fk / 0.8)), 0, TAU); ctx.stroke(); ctx.restore();
      for (const q of sparks) {
        const p = particleAt(q, ox, oy, fk, 900, 2.6);
        if (p.a <= 0) continue;
        ctx.save(); ctx.globalAlpha *= p.a * (1 - fk / 0.8); ctx.translate(p.x, p.y); ctx.rotate(p.rot); ctx.fillStyle = q.color;
        ctx.fill(squirclePath(-q.size * 0.5, -q.size * 0.18, q.size, q.size * 0.36, q.size * 0.18)); ctx.restore();
      }
    }
  }
  const lp = spring(t - MATCH.found - 0.05, SPRING.pop) * (1 - seg(t, MATCH.back - 0.2, MATCH.back - 0.08));
  if (lp > 0.001) callout(ctx, `${P.family.emoji}  ${fill(T.first, { p: P.family.label })}`, clamp(ox, 300, 780), clamp(oy + orr + 80, 700, 1290), lp);   // under the one, held to the rush
}
