// Act V — the recipient opens the link: "They ask. / It answers. / As you." builds on the dimmed deck while the
// question is typed, sent and answered in the Digital Twin's voice (the bubble streams on the spoken words);
// the Slide 5 citation pops on "slide five", is clicked, and the deck jumps to the cited figure.
import { W, H, C, BEAT, GRAD_TEXT } from '../config.js';
import { ease, clamp, lerp, seg } from '../util.js';
import { B, ROOM, SIGNAL } from '../score.js';
import { VO } from '../assets.js';
import { Line, riseLine } from '../type.js';
import { drawDeckTop, drawStage, drawRail, DECK, SLIDE, RAIL } from '../ui/room.js';
import { stepBadge } from '../ui/kit.js';

const Q = 'How fast does it pay back?';
const GREETING = 'Hi, I’m Luminex Labs’s Digital Twin, briefed by Maya Chen. Ask me anything.';
const ANSWER = 'Median payback is 7.2 months.';
const ANSWER_WORDS = ['Median ', 'payback ', 'is ', '7.2 ', 'months.'];
let T1, T2, T2b, T3;

const voT = (t) => t - B(ROOM.vo);        // seconds into the voice line
export function voiceEnv(t) {
  const m = VO.answer;
  const i = Math.floor(voT(t) * 60);
  return i >= 0 && i < m.env.length ? m.env[i] : 0;
}

export function roomState(t) {
  const gb = t / BEAT;
  const st = { t, slide: 1, slideP: 1 / 8, from: 1, to: 5, swipe: 0, ring: 0, status: 'ready', voice: 0, focus: false, draft: '', caret: false, press: 0, msgs: [], nameUnderline: 0 };
  st.msgs.push({ who: 'agent', full: GREETING, alpha: 1 });
  // typing the question
  if (gb >= ROOM.type0 - 0.5 && gb < ROOM.send) {
    st.focus = true;
    const n = Math.floor(clamp((gb - ROOM.type0) / (ROOM.type1 - ROOM.type0)) * Q.length + 1e-6);
    st.draft = Q.slice(0, gb >= ROOM.type0 ? Math.max(0, n) : 0);
    st.caret = (Math.floor(t * 3.2) % 2 === 0) || (gb >= ROOM.type0 && gb < ROOM.type1);
  }
  if (gb >= ROOM.send - 0.25 && gb < ROOM.send + 0.2) st.press = Math.sin(Math.PI * clamp((gb - ROOM.send + 0.25) / 0.45));
  if (gb >= ROOM.send - 0.02 && gb < ROOM.send) st.draft = Q;
  // the sent question
  if (gb >= ROOM.send) {
    const p = seg(gb, ROOM.send, ROOM.send + 0.7, ease.brand);
    st.msgs.push({ who: 'user', full: Q, alpha: clamp(p * 1.5), enter: p, grow: p });
  }
  // typing dots, then the spoken answer streaming word by word on the voice
  if (gb >= ROOM.dots && gb < ROOM.vo + 0.05) {
    const p = seg(gb, ROOM.dots, ROOM.dots + 0.4, ease.brand);
    st.msgs.push({ who: 'agent', dots: true, dotT: t, alpha: p, enter: p, grow: p });
    st.status = 'typing…';
  }
  if (gb >= ROOM.vo) {
    const words = VO.answer.words;
    const rel = voT(t);
    let shown = 0;
    for (let i = 0; i < ANSWER_WORDS.length; i++) if (rel >= words[i].s - 0.04) shown += ANSWER_WORDS[i].length;
    const citeP = seg(gb, ROOM.pill, ROOM.pill + 0.45, ease.linear);
    const hot = Math.exp(-Math.max(0, (gb - (ROOM.jump - 0.15))) * BEAT / 0.12) * (gb >= ROOM.jump - 0.15 ? 1 : 0);
    st.msgs.push({ who: 'agent', full: ANSWER, shown, alpha: 1, cite: gb >= ROOM.pill ? 'Slide 5' : null, citeP, citeHot: hot });
    const speaking = rel >= 0 && rel < VO.answer.speech[1] + 0.05;
    st.status = speaking ? 'speaking…' : 'ready';
    st.voice = voiceEnv(t);
    st.orbMix = clamp(rel / 0.3) * (1 - clamp((rel - VO.answer.speech[1] - 0.2) / 0.4));
  }
  st.nameUnderline = seg(gb, ROOM.asYou, ROOM.asYou + 0.8, ease.brand) * (1 - seg(gb, ROOM.jump - 0.3, ROOM.jump + 0.2));
  // the jump to slide 5, and the cobalt ring around 7.2 months
  st.swipe = seg(gb, ROOM.jump, ROOM.jump + 1.1);
  if (gb >= ROOM.jump) { st.slide = gb >= ROOM.jump + 0.6 ? 5 : 1; st.slideP = lerp(1 / 8, 5 / 8, seg(gb, ROOM.jump, ROOM.jump + 1, ease.inOutCubic)); }
  st.ring = seg(gb, ROOM.jump + 1.2, ROOM.zoom1 - 0.2, ease.inOutCubic);
  return st;
}

// The room with no overlays, used for the 3D screen it arrives on and for the 2D shot.
export function drawRoomFrame(ctx, t, { dim = 0, blur = 0 } = {}) {
  const st = roomState(t);
  st.blur = blur;
  ctx.fillStyle = C.page;
  ctx.fillRect(0, 0, W, H);
  // .cm-deck: a soft top-left sheen over the card lift
  const g = ctx.createRadialGradient(DECK.w * 0.3, -H * 0.1, 0, DECK.w * 0.3, -H * 0.1, 700);
  g.addColorStop(0, 'rgba(255,255,255,0.04)'); g.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = 'rgba(255,255,255,0.05)'; ctx.fillRect(0, 0, DECK.w, H);
  ctx.fillStyle = g; ctx.fillRect(0, 0, DECK.w, H);
  drawDeckTop(ctx, st);
  drawStage(ctx, st);
  if (dim > 0) { ctx.fillStyle = `rgba(1,2,8,${dim})`; ctx.fillRect(0, 0, DECK.w, H); }
  drawRail(ctx, st);
  return st;
}

function cursor(ctx, x, y, s = 1, a = 1) {
  ctx.save();
  ctx.globalAlpha *= a;
  ctx.translate(x, y); ctx.scale(s * 1.6, s * 1.6);
  ctx.beginPath();
  ctx.moveTo(0, 0); ctx.lineTo(0, 17); ctx.lineTo(4.2, 13.2); ctx.lineTo(7.2, 20); ctx.lineTo(9.8, 18.9); ctx.lineTo(6.9, 12.3); ctx.lineTo(12.4, 12.3); ctx.closePath();
  ctx.fillStyle = '#fff'; ctx.fill();
  ctx.lineWidth = 1.2; ctx.strokeStyle = '#0B0C10'; ctx.stroke();
  ctx.restore();
}

function draw(ctx, t) {
  const gb = t / BEAT;
  const out = seg(gb, SIGNAL.in - 0.01, SIGNAL.in, ease.linear);
  if (out >= 1) return;
  // the push into the cited figure (a 2D camera on the room)
  const z = seg(gb, ROOM.zoom0 + 0.5, ROOM.zoom1, ease.inOutQuart);
  const fx = SLIDE.x + SLIDE.w * 0.16, fy = SLIDE.y + SLIDE.h * 0.65;
  const drift = 1 + 0.04 * seg(gb, ROOM.in + 0.5, ROOM.jump, ease.inOutSine);   // the room is never dead-still
  const zoom = lerp(drift, 2.35, z);
  ctx.save();
  const ax = RAIL.x + RAIL.w * 0.5, ay = H * 0.72;          // drift toward the conversation
  ctx.translate(lerp(ax - ax * zoom, W / 2 - fx * zoom, z), lerp(ay - ay * zoom, H / 2 - fy * zoom, z));
  ctx.scale(zoom, zoom);
  // the room is seen first, undimmed; the deck dims only as the first title arrives
  const dim = 0.8 * seg(gb, ROOM.ask - 0.5, ROOM.ask + 0.5, ease.inOutSine) * (1 - seg(gb, ROOM.jump - 0.05, ROOM.jump + 0.5, ease.inOutSine));
  const st = drawRoomFrame(ctx, t, { dim, blur: dim * 16 });
  // the cursor that clicks the citation
  const ans = st.msgs[st.msgs.length - 1];
  if (ans.citeBox && gb > ROOM.pill + 0.1 && gb < ROOM.jump + 0.8) {
    const cb = ans.citeBox;
    const mv = seg(gb, ROOM.pill + 0.1, ROOM.jump - 0.2, ease.brand);
    const px = lerp(cb.x + cb.w + 120, cb.x + cb.w * 0.55, mv), py = lerp(cb.y + 170, cb.y + cb.h * 0.55, mv);
    const click = gb >= ROOM.jump - 0.2 ? Math.sin(Math.PI * clamp((gb - ROOM.jump + 0.2) / 0.3)) : 0;
    cursor(ctx, px, py, 1 - 0.12 * click, seg(gb, ROOM.pill + 0.1, ROOM.pill + 0.3) * (1 - seg(gb, ROOM.jump + 0.4, ROOM.jump + 0.8)));
  }
  ctx.restore();
  // "4 · They ask. / Your Digital Twin / answers. / In your voice." on the dimmed deck
  const x = 104, y0 = 372, lh = 104;
  const fade = 1 - seg(gb, ROOM.jump - 0.45, ROOM.jump - 0.05, ease.inCubic);
  if (fade > 0) {
    ctx.save();
    ctx.globalAlpha = fade;
    ctx.translate(0, -(1 - fade) * 36);
    const BS = 84, gap = 26;
    stepBadge(ctx, x, y0 - T1.ascent / 2 - BS / 2, BS, '4', { scale: ease.outBack(clamp((t - B(ROOM.ask - 0.15)) / 0.45), 1.8) });
    riseLine(ctx, T1, x + BS + gap, y0, t, [B(ROOM.ask), B(ROOM.ask + 0.25)], { fill: C.white });
    riseLine(ctx, T2, x, y0 + lh, t, [B(ROOM.answers), B(ROOM.answers + 0.2), B(ROOM.answers + 0.4)], { fill: C.white });
    riseLine(ctx, T2b, x, y0 + lh * 2, t, [B(ROOM.answers + 0.6)], { fill: C.white });
    riseLine(ctx, T3, x, y0 + lh * 3, t, [B(ROOM.asYou), B(ROOM.asYou + 0.2), B(ROOM.asYou + 0.4)], { gradient: GRAD_TEXT });
    ctx.restore();
  }
}

export default {
  id: 'room',
  init() {
    const o = { s: 92, w: 700 };
    T1 = new Line('They ask.', o);
    T2 = new Line('Your Digital Twin', o);
    T2b = new Line('answers.', o);
    T3 = new Line('In your voice.', o);
  },
  layers: [{ start: B(ROOM.in), end: B(SIGNAL.in), draw }],
};
