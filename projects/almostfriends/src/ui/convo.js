// The anonymous chat screen (full-bleed design coordinates): Curious Otter's orb (no photo), the handle, the day, three
// day dots; Bub's icebreaker; the conversation. Drawn inside the phone for step 3 and full screen under the unlock
// sheet. Text is set at 19 pt (a step up from iOS's 17 pt body) so it reads inside the phone on a phone.
import { W, H } from '../config.js';
import { C, FONTS, UI, P, SPRING, MOVE } from '../brand.js';
import { CHAT } from '../score.js';
import { T, fill } from '../copy.js';
import { clamp, lerp, seg, spring, rgba } from '../util.js';
import { drawBubble2D, drawBubFace, drawColorOrb } from '../world/bubble2d.js';
import { layoutMsg, drawMsg, typing } from './chat.js';
import { squirclePath, text, about } from './kit.js';
import { homeIndicator } from './ios.js';
import { icon } from './icons.js';
import { K, appSky, topBar, glass } from './app.js';

const pt = (v) => v * K;
export const OTTER_COLORS = ['family', 'adventure', 'health'].map((k) => P[k].color);
export const YOU_COLORS = ['family', 'career', 'adventure'].map((k) => P[k].color);
// the two people Bub checks before it finds the one: Wealth first, then Health first (not your top priority: no)
export const CANDS = [
  { key: 'wealth', colors: ['wealth', 'wealth', 'career'].map((k) => P[k].color) },
  { key: 'health', colors: ['health', 'health', 'learning'].map((k) => P[k].color) },
];
// The bubble universe's cast, the same for every scene that shows it (gl/universe.js is a singleton: first call wins)
const FAM = Object.keys(P).indexOf('family');
export const UNIVERSE_CAST = {
  colors: Object.values(P).map((p) => p.color),
  isMatch: (a) => (a === FAM ? 1 : 0),
  oneColors: OTTER_COLORS,
  candColors: CANDS.map((c) => c.colors),
};

// [side, at] for each line of the thread (copy.js chat.thread) — Day 1 is read; Days 2–3 move fast (the time-lapse),
// the last line settles to be read
const THREAD = [
  ['in', CHAT.otter], ['out', CHAT.same], ['in', CHAT.days0 + 0.5], ['out', CHAT.day2 - 0.6], ['in', CHAT.day2 + 0.2],
  ['out', CHAT.day2 + 0.9], ['in', CHAT.day3 - 0.2], ['out', CHAT.day3 + 0.6], ['in', CHAT.last],
].map(([side, at], i) => [side, T.chat.thread[i], at]);
let M = null;
const [ICE1, ICE2] = T.chat.ice;

export const dayAt = (t) => (t < CHAT.day2 ? 1 : t < CHAT.day3 ? 2 : 3);

export function conversation(ctx, t, { on = 1, viewBottom = pt(560) } = {}) {
  M ??= THREAD.map(([side, s, at]) => ({ side, at, m: layoutMsg(s, K, { maxW: 300, size: 19 }) }));
  ctx.save();
  ctx.globalAlpha *= on;
  appSky(ctx);
  const shown = M.filter((m) => t >= m.at);
  const cardY = pt(150);
  // the thread scrolls up as a message arrives, eased over 0.3 s as iMessage does; adding the whole height at once
  // jumped the thread a bubble's height in one frame (the Chinese master's jump gate caught it at 40.0 s)
  let contentH = pt(104);
  for (const m of shown) contentH += (m.m.H + pt(8)) * MOVE.go(seg(t, m.at, m.at + 0.3));
  const scroll = Math.max(0, cardY + contentH - viewBottom);
  ctx.save();
  ctx.beginPath(); ctx.rect(0, pt(140), W, H); ctx.clip();
  ctx.translate(0, -scroll);
  // Bub's icebreaker card
  const iceP = spring(t - CHAT.ice, SPRING.settle);
  if (iceP > 0.001) {
    about(ctx, W / 2, cardY + pt(44), lerp(0.85, 1, iceP), lerp(0.85, 1, iceP), () => {
      ctx.save(); ctx.globalAlpha *= clamp(iceP * 2);
      ctx.fillStyle = '#FFF6E6';
      ctx.fill(squirclePath(pt(16), cardY, W - pt(32), pt(92), pt(22)));
      drawBubble2D(ctx, pt(46), cardY + pt(46), pt(18), { t, seed: 9 });
      drawBubFace(ctx, pt(46), cardY + pt(46), pt(18), { happy: 1, blush: 0.4 });
      text(ctx, ICE1, pt(76), cardY + pt(38), { f: FONTS.ui, w: 750, size: pt(17.5), color: UI.ink });
      text(ctx, ICE2, pt(76), cardY + pt(66), { f: FONTS.ui, w: 500, size: pt(16.5), color: UI.ink2 });
      ctx.restore();
    });
  }
  let y = cardY + pt(108);
  shown.forEach((m, i) => {
    const prev = shown[i - 1], next = shown[i + 1];
    const x = m.side === 'out' ? W - pt(16) - m.m.W : pt(16);
    drawMsg(ctx, m.m, x, y, m.side, t, m.at, {
      fill: m.side === 'out' ? C.blue : '#FFFFFF', ink: m.side === 'out' ? '#fff' : UI.ink, k: K, lift: 0.6,
      joinTop: prev && prev.side === m.side, joinBottom: next && next.side === m.side,
      emphasis: m.at === CHAT.same ? 0.6 : 0,
    });
    y += m.m.H + pt(8);
  });
  typing(ctx, pt(16), y, t, CHAT.ice + 0.4, CHAT.otter - 0.05, { fill: '#FFFFFF', dot: UI.ink3, k: K });
  ctx.restore();
  // header over the thread
  appSky(ctx, 0, 0, W, pt(160));
  const day = dayAt(t);
  topBar(ctx, t, {
    title: T.otter, sub: fill(T.chat.sub, { d: day }),
    avatar: (c, cx, cy, r) => drawColorOrb(c, cx, cy, r, OTTER_COLORS, [1, 1, 1], { t, seed: 4.1 }),
    right: (c, x, yy) => {
      for (let i = 0; i < 3; i++) {
        c.fillStyle = i < day ? C.blue : rgba(C.ink, 0.15);
        c.beginPath(); c.arc(x + pt(8) + i * pt(12), yy + pt(22), pt(4), 0, Math.PI * 2); c.fill();
      }
    },
  });
  // composer
  const cy = pt(714 - 28 - 40);
  glass(ctx, squirclePath(pt(16), cy, pt(40), pt(40), pt(20)));
  icon(ctx, 'plus', pt(24), cy + pt(8), pt(24), UI.ink, 2);
  glass(ctx, squirclePath(pt(64), cy, W - pt(80), pt(40), pt(20)));
  text(ctx, T.chat.composer, pt(82), cy + pt(26), { f: FONTS.ui, w: 500, size: pt(16), color: UI.ink3, log: false });
  homeIndicator(ctx, 0, 0, W, H, K, UI.ink);
  ctx.restore();
}
