// The soundtrack: the score (ElevenLabs Music, take t6 — measured 120.00 BPM, C major / A minor), the Digital
// Twin's voice (ElevenLabs TTS), and foley synthesised from the same score the visuals read, so every whoosh,
// key, pop and hit lands on its frame. Pitched foley sits in C-major pentatonic so it never fights the music.
// Mixed offline (OfflineAudioContext); render.mjs loudness-normalises the result (two-pass loudnorm, −14 LUFS).
import { BEAT, DURATION } from './config.js';
import { rng } from './util.js';
import * as S from './score.js';
import { VO } from './assets.js';

const SR = 48000;
const B = (b) => b * BEAT;
const mtof = (m) => 440 * Math.pow(2, (m - 69) / 12);
const PENTA = [72, 74, 76, 79, 81, 84, 86, 88, 91, 93, 96];   // C5 D5 E5 G5 A5 C6 D6 E6 G6 A6 C7

async function load(ctx, rel) {
  const buf = await (await fetch(new URL(rel, import.meta.url))).arrayBuffer();
  return ctx.decodeAudioData(buf);
}

export async function renderSoundtrack() {
  const ctx = new OfflineAudioContext(2, Math.ceil(SR * DURATION), SR);
  const R = rng(4096);
  const noise = ctx.createBuffer(2, SR * 4, SR);
  for (let c = 0; c < 2; c++) { const d = noise.getChannelData(c); for (let i = 0; i < d.length; i++) d[i] = R() * 2 - 1; }
  const [music, voice] = await Promise.all([load(ctx, '../assets/music/score.mp3'), load(ctx, '../assets/vo/answer.mp3')]);

  /* ── buses ─────────────────────────────────────────── */
  const glue = ctx.createDynamicsCompressor();
  glue.threshold.value = -14; glue.knee.value = 8; glue.ratio.value = 2.2; glue.attack.value = 0.008; glue.release.value = 0.2;
  const master = ctx.createGain(); master.gain.value = 0.9;
  const out = ctx.createGain();
  master.connect(glue).connect(out).connect(ctx.destination);
  out.gain.setValueAtTime(1, DURATION - 1.2); out.gain.linearRampToValueAtTime(0, DURATION);

  const verb = ctx.createConvolver();
  const ir = ctx.createBuffer(2, SR * 2.8, SR);
  for (let c = 0; c < 2; c++) { const d = ir.getChannelData(c); for (let i = 0; i < d.length; i++) { const x = i / SR; d[i] = (R() * 2 - 1) * Math.exp(-x * 2.1) * Math.min(1, x / 0.006); } }
  verb.buffer = ir;
  const verbRet = ctx.createGain(); verbRet.gain.value = 0.3; verb.connect(verbRet).connect(master);
  const dl = ctx.createDelay(1); dl.delayTime.value = B(0.75);
  const fb = ctx.createGain(); fb.gain.value = 0.3;
  const dlf = ctx.createBiquadFilter(); dlf.type = 'lowpass'; dlf.frequency.value = 4200;
  const dlRet = ctx.createGain(); dlRet.gain.value = 0.2;
  dl.connect(dlf).connect(fb).connect(dl); dlf.connect(dlRet).connect(master);
  const fx = ctx.createGain(); fx.gain.value = 0.85; fx.connect(master);       // all foley
  const stem = typeof location !== 'undefined' ? new URLSearchParams(location.search).get('stem') : null;
  // foley rides over a loud, mastered score: lift it per section (measured with tools/stems: it sat 20–35 dB
  // under the groove), less where the score is sparse or already hits hard
  const FX_BARS = [1.6, 1.6, 1.6, 1.3, 4, 4, 4, 4, 4, 4, 4.5, 4.5, 4.5, 4, 4, 4, 2.2, 2.2, 1.2, 1.6, 1.6];
  FX_BARS.forEach((k, b) => fx.gain.setValueAtTime(stem && stem !== 'sfx' ? 0 : 0.85 * k, b * 2));

  /* ── the score: ducked and mid-scooped under the voice ─ */
  const mus = ctx.createBufferSource(); mus.buffer = music;
  const musG = ctx.createGain(); musG.gain.value = 0.72;
  const scoop = ctx.createBiquadFilter(); scoop.type = 'peaking'; scoop.frequency.value = 2600; scoop.Q.value = 0.8; scoop.gain.value = 0;
  mus.connect(scoop).connect(musG).connect(master);
  if (!stem || stem === 'music') mus.start(0);
  const v0 = B(S.ROOM.vo), v1 = v0 + VO.answer.dur;
  musG.gain.setValueAtTime(0.72, v0 - 0.12); musG.gain.linearRampToValueAtTime(0.4, v0 + 0.05);
  musG.gain.setValueAtTime(0.4, v1 - 0.2); musG.gain.linearRampToValueAtTime(0.72, v1 + 0.35);
  scoop.gain.setValueAtTime(0, v0 - 0.12); scoop.gain.linearRampToValueAtTime(-5, v0 + 0.05);
  scoop.gain.setValueAtTime(-5, v1 - 0.2); scoop.gain.linearRampToValueAtTime(0, v1 + 0.35);
  // "that end in silence.": the score drops out under the word, the N is signed in near-silence, the tile hits
  const s0 = B(S.PAYOFF.w2 + 2.4), s1 = B(S.SIGN.tile);
  musG.gain.setValueAtTime(0.72, s0); musG.gain.linearRampToValueAtTime(0.12, s0 + 0.35);
  musG.gain.setValueAtTime(0.12, s1 - 0.02); musG.gain.linearRampToValueAtTime(0.8, s1 + 0.01);

  /* ── the voice ─────────────────────────────────────── */
  const vo = ctx.createBufferSource(); vo.buffer = voice;
  const voG = ctx.createGain(); voG.gain.value = Math.pow(10, (-15 - VO.answer.lufs) / 20) * 1.9;
  const vHP = ctx.createBiquadFilter(); vHP.type = 'highpass'; vHP.frequency.value = 90;
  const vPres = ctx.createBiquadFilter(); vPres.type = 'peaking'; vPres.frequency.value = 3400; vPres.Q.value = 0.9; vPres.gain.value = 2.5;
  const vComp = ctx.createDynamicsCompressor(); vComp.threshold.value = -20; vComp.ratio.value = 3; vComp.attack.value = 0.003; vComp.release.value = 0.12;
  vo.connect(voG).connect(vHP).connect(vPres).connect(vComp).connect(master);
  const vs = ctx.createGain(); vs.gain.value = 0.1; vComp.connect(vs).connect(verb);
  if (!stem || stem === 'vo') vo.start(v0);

  /* ── primitives ────────────────────────────────────── */
  const send = (node, amt, dest) => { const g = ctx.createGain(); g.gain.value = amt; node.connect(g).connect(dest); };
  const env = (t, peak, a, d) => { const g = ctx.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(peak, t + a); g.gain.exponentialRampToValueAtTime(0.0001, t + a + d); return g; };
  const osc = (type, f, t, dur) => { const o = ctx.createOscillator(); o.type = type; o.frequency.setValueAtTime(f, t); o.start(t); o.stop(t + dur); return o; };
  const nz = (t, dur) => { const s = ctx.createBufferSource(); s.buffer = noise; s.start(t, R() * Math.max(0, 3.9 - dur), dur); return s; };
  const filt = (type, f, q = 0.7) => { const b = ctx.createBiquadFilter(); b.type = type; b.frequency.value = f; b.Q.value = q; return b; };
  const pan = (p) => { const n = ctx.createStereoPanner(); n.pan.value = Math.max(-1, Math.min(1, p)); return n; };

  /* ── foley instruments ─────────────────────────────── */
  const whoosh = (t0, t1, g = 0.25, p0 = -0.6, p1 = 0.6, f0 = 400, fm = 4500, f1 = 700) => {
    const mid = t0 + (t1 - t0) * 0.55, bp = filt('bandpass', f0, 1.1);
    bp.frequency.setValueAtTime(f0, t0); bp.frequency.exponentialRampToValueAtTime(fm, mid); bp.frequency.exponentialRampToValueAtTime(f1, t1);
    const e = ctx.createGain(); e.gain.setValueAtTime(0.0001, t0); e.gain.exponentialRampToValueAtTime(g, mid); e.gain.exponentialRampToValueAtTime(0.0001, t1);
    const pn = ctx.createStereoPanner(); pn.pan.setValueAtTime(p0, t0); pn.pan.linearRampToValueAtTime(p1, t1);
    nz(t0, t1 - t0 + 0.05).connect(bp).connect(e).connect(pn).connect(fx); send(e, 0.25, verb);
  };
  const riser = (t0, t1, g = 0.18, f0 = 300, f1 = 8000) => {
    const bp = filt('bandpass', f0, 1.6);
    bp.frequency.setValueAtTime(f0, t0); bp.frequency.exponentialRampToValueAtTime(f1, t1);
    const e = ctx.createGain(); e.gain.setValueAtTime(0.0001, t0); e.gain.exponentialRampToValueAtTime(g, t1); e.gain.linearRampToValueAtTime(0.0001, t1 + 0.04);
    nz(t0, t1 - t0 + 0.06).connect(bp).connect(e).connect(fx); send(e, 0.35, verb);
  };
  const suck = (t0, t1, g = 0.25) => {                         // a reversed swell: rises and stops dead on t1
    const lp = filt('lowpass', 300, 0.8); lp.frequency.setValueAtTime(300, t0); lp.frequency.exponentialRampToValueAtTime(9000, t1);
    const e = ctx.createGain(); e.gain.setValueAtTime(0.0001, t0); e.gain.exponentialRampToValueAtTime(g, t1 - 0.005); e.gain.linearRampToValueAtTime(0.0001, t1);
    nz(t0, t1 - t0 + 0.02).connect(lp).connect(e).connect(fx);
    const o = osc('sine', 40, t0, t1 - t0); o.frequency.exponentialRampToValueAtTime(110, t1);
    const e2 = ctx.createGain(); e2.gain.setValueAtTime(0.0001, t0); e2.gain.exponentialRampToValueAtTime(g * 1.4, t1 - 0.005); e2.gain.linearRampToValueAtTime(0.0001, t1);
    o.connect(e2).connect(fx);
  };
  const impact = (t, g = 1) => {
    const o = osc('sine', 88, t, 2.4); o.frequency.exponentialRampToValueAtTime(30, t + 1.6);
    o.connect(env(t, 0.85 * g, 0.004, 1.9)).connect(fx);
    const lp = filt('lowpass', 2200); lp.frequency.exponentialRampToValueAtTime(180, t + 0.8);
    const e2 = env(t, 0.45 * g, 0.002, 0.9); nz(t, 1).connect(lp).connect(e2).connect(fx); send(e2, 0.5, verb);
    const e3 = env(t, 0.14 * g, 0.003, 2.2); nz(t, 2.4).connect(filt('highpass', 6000)).connect(e3).connect(fx); send(e3, 0.6, verb);
  };
  const tick = (t, g = 0.05, f = 4200, p = 0) => { nz(t, 0.02).connect(filt('bandpass', f, 4)).connect(env(t, g, 0.0005, 0.012)).connect(pan(p)).connect(fx); };
  const key = (t, g = 0.13, p = 0.3) => {                      // a keyboard key: click + thock
    const f = 2600 + R() * 1400;
    nz(t, 0.03).connect(filt('bandpass', f, 3)).connect(env(t, g, 0.0005, 0.018)).connect(pan(p)).connect(fx);
    const o = osc('sine', 180 + R() * 60, t, 0.05); o.connect(env(t, g * 0.5, 0.001, 0.035)).connect(pan(p)).connect(fx);
  };
  const pop = (t, f = 700, g = 0.12, p = 0) => {
    const o = osc('sine', f * 0.6, t, 0.12); o.frequency.exponentialRampToValueAtTime(f * 1.5, t + 0.025); o.frequency.exponentialRampToValueAtTime(f, t + 0.09);
    o.connect(env(t, g, 0.002, 0.08)).connect(pan(p)).connect(fx);
    tick(t, g * 0.35, 5200, p);
  };
  const click = (t, g = 0.14, p = 0) => {
    nz(t, 0.02).connect(filt('bandpass', 2400, 2)).connect(env(t, g, 0.0005, 0.014)).connect(pan(p)).connect(fx);
    const o = osc('triangle', 2000, t, 0.04); o.frequency.exponentialRampToValueAtTime(1200, t + 0.03); o.connect(env(t, g * 0.3, 0.001, 0.03)).connect(pan(p)).connect(fx);
  };
  const bell = (t, m, g = 0.06, p = 0, dec = 1.4) => {
    for (const [r, a] of [[1, 1], [2.0, 0.28], [3.01, 0.12], [4.2, 0.05]]) {
      const f = mtof(m) * r; if (f > 18000) continue;
      const e = env(t, g * a, 0.002, dec / r); osc('sine', f, t, dec + 0.2).connect(e).connect(pan(p)).connect(fx); send(e, 0.55, verb); send(e, 0.15, dl);
    }
  };
  const glass = (t, m, g = 0.05, p = 0) => {                   // the orb: a glassy resonance
    for (const [r, a, d] of [[1, 1, 0.9], [2.76, 0.4, 0.5], [5.4, 0.15, 0.25]]) {
      const f = mtof(m) * r; if (f > 18000) continue;
      const e = env(t, g * a, 0.004, d); osc('sine', f, t, d + 0.1).connect(e).connect(pan(p)).connect(fx); send(e, 0.6, verb);
    }
  };
  const zing = (t0, t1, f0, f1, g = 0.05, p0 = 0, p1 = 0) => {  // the line of light, audible
    const o = osc('sine', f0, t0, t1 - t0 + 0.2); o.frequency.exponentialRampToValueAtTime(f1, t1);
    const o2 = osc('triangle', f0 * 2, t0, t1 - t0 + 0.2); o2.frequency.exponentialRampToValueAtTime(f1 * 2, t1);
    const e = ctx.createGain(); e.gain.setValueAtTime(0.0001, t0); e.gain.exponentialRampToValueAtTime(g, t0 + 0.03); e.gain.setValueAtTime(g, t1); e.gain.exponentialRampToValueAtTime(0.0001, t1 + 0.18);
    const g2 = ctx.createGain(); g2.gain.value = 0.25;
    const pn = ctx.createStereoPanner(); pn.pan.setValueAtTime(p0, t0); pn.pan.linearRampToValueAtTime(p1, t1);
    o.connect(e); o2.connect(g2).connect(e); e.connect(pn).connect(fx); send(e, 0.4, verb); send(e, 0.2, dl);
  };
  const sparkle = (t, n, spread, g = 0.03) => {
    for (let i = 0; i < n; i++) {
      const tt = t + R() * spread, m = PENTA[4 + Math.floor(R() * 7)];
      const e = env(tt, g * (0.4 + R() * 0.6), 0.001, 0.08 + R() * 0.12);
      osc('sine', mtof(m), tt, 0.3).connect(e).connect(pan(R() * 2 - 1)).connect(fx); send(e, 0.5, dl); send(e, 0.5, verb);
    }
  };
  const thud = (t, g = 0.3, f = 120) => {
    const o = osc('sine', f, t, 0.3); o.frequency.exponentialRampToValueAtTime(45, t + 0.18);
    o.connect(env(t, g, 0.002, 0.22)).connect(fx);
  };

  /* ── act I · silence ─────────────────────────────────── */
  const air = nz(0, 6.2); const airLP = filt('lowpass', 900, 0.5); const airG = ctx.createGain();
  airG.gain.setValueAtTime(0.0001, 0); airG.gain.exponentialRampToValueAtTime(0.03, 1.2); airG.gain.setValueAtTime(0.03, 5.2); airG.gain.exponentialRampToValueAtTime(0.0001, 5.9);
  air.connect(airLP).connect(airG).connect(fx);
  // frame one: our slide catches the light — a glass ping over a low thump
  glass(0.04, 84, 0.05, 0); glass(0.1, 91, 0.025, 0.2);
  { const o = osc('sine', 62, 0.03, 1.2); o.frequency.exponentialRampToValueAtTime(40, 0.9); o.connect(env(0.03, 0.35, 0.006, 0.9)).connect(fx); }
  // powers of ten: a swell that accelerates with the zoom-out and opens into the galaxy
  { const t0 = B(S.SEND.pull0), t1 = B(S.SEND.pull1), mid = t0 + (t1 - t0) * 0.55;
    const bp = filt('bandpass', 180, 1.1); bp.frequency.setValueAtTime(180, t0); bp.frequency.exponentialRampToValueAtTime(5200, mid); bp.frequency.exponentialRampToValueAtTime(900, t1 + 0.4);
    const e = ctx.createGain(); e.gain.setValueAtTime(0.0001, t0); e.gain.exponentialRampToValueAtTime(0.2, mid); e.gain.exponentialRampToValueAtTime(0.0001, t1 + 0.6);
    nz(t0, t1 - t0 + 0.7).connect(bp).connect(e).connect(fx); send(e, 0.35, verb);
    const o = osc('sine', 38, t0, t1 - t0 + 1); o.frequency.exponentialRampToValueAtTime(55, mid); o.frequency.exponentialRampToValueAtTime(34, t1 + 0.8);
    const e2 = ctx.createGain(); e2.gain.setValueAtTime(0.0001, t0); e2.gain.exponentialRampToValueAtTime(0.28, mid); e2.gain.exponentialRampToValueAtTime(0.0001, t1 + 0.9);
    o.connect(e2).connect(fx);
    for (let i = 0; i < 18; i++) { const tt = t0 + 0.2 + (mid - t0) * (i / 18); tick(tt, 0.015 + 0.02 * (i / 18), 5200 - i * 90, (i % 2 ? 0.6 : -0.6) * (1 - i / 18)); }
    // the galaxy reveals: a chord of glass bells
    [72, 76, 79, 84, 88, 91].forEach((m, i) => bell(mid + 0.15 + i * 0.07, m, 0.03, (i - 2.5) * 0.3, 2.4));
    sparkle(mid + 0.1, 20, 1.4, 0.016);
  }
  // closing in on the last light
  whoosh(B(S.SEND.dark0 - 0.4), B(10.6), 0.07, 0.3, -0.1, 200, 900, 150);
  // lights out, closing in: a power-down sweep and a tick for the decks going dark
  { const t0 = B(S.SEND.dark0), t1 = B(S.SEND.dark1);
    const o = osc('sawtooth', 1100, t0, t1 - t0 + 0.2); o.frequency.exponentialRampToValueAtTime(90, t1);
    const lp = filt('lowpass', 3000, 0.9); lp.frequency.setValueAtTime(3000, t0); lp.frequency.exponentialRampToValueAtTime(200, t1);
    const e = ctx.createGain(); e.gain.setValueAtTime(0.0001, t0); e.gain.exponentialRampToValueAtTime(0.04, t0 + 0.25); e.gain.exponentialRampToValueAtTime(0.0001, t1 + 0.1);
    o.connect(lp).connect(e).connect(fx); send(e, 0.4, verb);
    for (let i = 0; i < 16; i++) tick(t0 + (t1 - t0) * (i / 16) * (0.6 + 0.4 * R()), 0.014, 4200 - i * 180, R() * 2 - 1);
  }
  pop(B(S.TITLE1.w1), 300, 0.05); pop(B(S.TITLE1.w2), 280, 0.05);
  for (let k = 0; k < 5; k++) tick(B(S.DOTS.on + 0.5 + k * 0.5), 0.022, 3000 + (k % 3) * 400, 0.3);   // typing…
  tone(B(S.DOTS.stop), 660, 440, 0.6, 0.02);                           // … and nothing
  for (let i = 0; i < 8; i++) tick(B(S.TITLE1.dim0 + i * 0.15), 0.012, 2000 - i * 120, 0);
  suck(B(S.NOVA.hit - 1.2), B(S.NOVA.hit), 0.16);

  /* ── act II · ignition ───────────────────────────────── */
  impact(B(S.NOVA.hit), 1.1);
  sparkle(B(S.NOVA.hit) + 0.05, 24, 1.4, 0.022);
  whoosh(B(S.NOVA.push0), B(S.NOVA.form0) + 0.4, 0.14, 0, 0, 300, 2600, 400);
  [76, 79, 84, 88].forEach((m, i) => glass(B(S.NOVA.form0 + 0.4 + i * 0.35), m, 0.04, (i - 1.5) * 0.3));

  /* ── act III · it reads ──────────────────────────────── */
  for (let k = 0; k < 8; k++) {
    const s0 = B(S.READ.spawn0 + k * S.READ.step), s1 = B(S.absorbAt(k)), side = k % 2 ? 0.7 : -0.7;
    whoosh(s0 - 0.05, s0 + 0.35, 0.09, side * 1.2, side * 0.4, 900, 3800, 700);
    glass(s1, PENTA[k % PENTA.length], 0.045, side * 0.3);
    tick(s1, 0.03, 6000, side * 0.2);
  }
  whoosh(B(S.KB.panel - 0.3), B(S.KB.panel + 0.5), 0.07, -0.3, 0.5, 600, 2600, 500);
  S.KB.rows.forEach((b, i) => { zing(B(b) - B(0.45), B(b), 900, 1800 + i * 300, 0.018, -0.4, 0.4); pop(B(b), 640 + i * 90, 0.06, 0.4); });
  for (let i = 0; i < 6; i++) tick(B(S.KB.rows[0] + i * 0.3), 0.012, 5000, 0.5);
  whoosh(B(S.KB.fold0), B(S.KB.fold1), 0.08, 0.5, -0.1, 3000, 1200, 300);
  riser(B(S.TWIN.riser0), B(S.LINK.fire), 0.12);

  /* ── act IV · one link ───────────────────────────────── */
  suck(B(S.LINK.fire) - 0.03, B(S.LINK.fire) + 0.11, 0.1);
  zing(B(S.LINK.fire + 0.2), B(S.LINK.field0 + 0.25), 700, 2600, 0.035, -0.5, 0.5);
  glass(B(S.LINK.field0 + 0.4), 84, 0.03, 0);
  { const n = 22; for (let i = 0; i < n; i++) key(B(S.LINK.type0) + (B(S.LINK.type1) - B(S.LINK.type0)) * (i / n), 0.05, 0.1); }
  click(B(S.LINK.copy), 0.14, 0.4);
  bell(B(S.LINK.copy + 0.12), 88, 0.04, 0.4, 0.8); bell(B(S.LINK.copy + 0.22), 93, 0.03, 0.4, 0.8);
  suck(B(S.LINK.fold), B(S.LINK.launch), 0.12);
  whoosh(B(S.LINK.launch), B(S.LINK.arrive), 0.24, -0.3, 0.3, 400, 5000, 600);
  zing(B(S.LINK.launch), B(S.LINK.arrive), 500, 1500, 0.03, -0.2, 0.2);
  for (let i = 0; i < 7; i++) { const tt = B(S.LINK.launch + 0.3 + i * 0.45); whoosh(tt, tt + 0.2, 0.05, i % 2 ? 0.9 : -0.9, 0, 1600, 4000, 1000); }
  riser(B(S.LINK.arrive - 0.6), B(S.LINK.arrive), 0.08, 800, 9000);
  glass(B(S.LINK.arrive), 84, 0.05, 0); glass(B(S.LINK.arrive) + 0.06, 91, 0.03, 0.2);

  /* ── act V · conversation ─────────────────────────────── */
  { const q = 'How fast does it pay back?'; for (let i = 0; i < q.length; i++) if (q[i] !== ' ') key(B(S.ROOM.type0) + (B(S.ROOM.type1) - B(S.ROOM.type0)) * (i / q.length), 0.06, 0.45); }
  click(B(S.ROOM.send), 0.12, 0.5); whoosh(B(S.ROOM.send), B(S.ROOM.send) + 0.3, 0.06, 0.5, 0.4, 2500, 5000, 3000);
  for (let i = 0; i < 3; i++) tick(B(S.ROOM.dots + i * 0.16), 0.02, 3600, 0.4);
  pop(B(S.ROOM.pill), 900, 0.07, 0.4);                       // on "slide five"
  click(B(S.ROOM.jump - 0.1), 0.12, 0.2);
  whoosh(B(S.ROOM.jump), B(S.ROOM.jump + 1.1), 0.1, 0.6, -0.4, 700, 3000, 500);
  whoosh(B(S.ROOM.zoom0 + 0.5), B(S.ROOM.zoom1), 0.09, -0.2, 0.2, 300, 1600, 400);
  zing(B(S.ROOM.jump + 1.2), B(S.ROOM.zoom1 - 0.2), 1200, 2400, 0.02, -0.3, 0.1);

  /* ── act VI · signal ─────────────────────────────────── */
  whoosh(B(S.SIGNAL.in), B(S.SIGNAL.in + 0.9), 0.12, 0, 0, 1800, 700, 300);
  for (let i = 0; i < 8; i++) { const tt = B(S.SIGNAL.heat0 + i * 0.12 + 0.3); tick(tt, 0.03, 3000 + i * 250, (i - 3.5) / 5); }
  bell(B(S.SIGNAL.heat0 + 0.5 + 0.9), 88, 0.03, 0);
  for (let i = 0; i < 14; i++) tick(B(S.SIGNAL.heat0 + 0.5 + i * 0.09), 0.01, 5200, 0);        // count-up
  whoosh(B(S.SIGNAL.topics - 0.2), B(S.SIGNAL.topics + 0.5), 0.07, 0.8, 0.4, 900, 2600, 700);
  for (let i = 0; i < 4; i++) pop(B(S.SIGNAL.topics + 0.3 + i * 0.25), 520 + i * 70, 0.04, 0.5);
  whoosh(B(S.SIGNAL.req - 0.1), B(S.SIGNAL.req + 0.5), 0.06, 1, 0.4, 900, 2600, 700);
  click(B(S.SIGNAL.approve - 0.1), 0.13, 0.4);
  bell(B(S.SIGNAL.approve + 0.1), 84, 0.035, 0.4, 0.9); bell(B(S.SIGNAL.approve + 0.2), 88, 0.03, 0.4, 0.9);
  // interest: the one warm, bright notification of the film
  [72, 76, 79, 84].forEach((m, i) => bell(B(S.SIGNAL.interest) + i * 0.06, m + 12, 0.05, (i - 1.5) * 0.25, 1.8));
  sparkle(B(S.SIGNAL.interest) + 0.1, 10, 0.8, 0.018);
  suck(B(S.SIGNAL.home0), B(S.SIGNAL.home1), 0.12);

  /* ── act VII · payoff ─────────────────────────────────── */
  whoosh(B(S.PAYOFF.in), B(S.PAYOFF.w2), 0.2, -0.6, 0.6, 300, 4200, 500);
  zing(B(S.PAYOFF.in), B(S.PAYOFF.w2), 600, 1800, 0.022, -0.5, 0.5);
  sparkle(B(S.PAYOFF.in + 0.4), 60, B(S.PAYOFF.w2 + 1.5) - B(S.PAYOFF.in + 0.4), 0.02);     // every deck lighting
  riser(B(S.PAYOFF.w2), B(S.PAYOFF.collapse0), 0.08, 200, 3000);
  suck(B(S.PAYOFF.collapse0), B(S.PAYOFF.collapse1) + 0.02, 0.22);
  // the N, signed: the pen's pitch follows the stroke — up, down the diagonal, up
  const p0 = B(S.PAYOFF.sign0), p1 = B(S.PAYOFF.sign1), pl = (p1 - p0) / 3;
  zing(p0, p0 + pl, mtof(79), mtof(86), 0.035, -0.3, -0.3);
  zing(p0 + pl, p0 + 2 * pl, mtof(86), mtof(76), 0.035, -0.3, 0.3);
  zing(p0 + 2 * pl, p1, mtof(76), mtof(88), 0.035, 0.3, 0.3);

  /* ── act VIII · signature ─────────────────────────────── */
  impact(B(S.SIGN.tile), 1.25);
  [60, 67, 72, 76, 79, 84].forEach((m, i) => bell(B(S.SIGN.tile) + i * 0.025, m, 0.045, (i - 2.5) * 0.2, 2.8));
  sparkle(B(S.SIGN.tile) + 0.1, 16, 1.2, 0.016);
  whoosh(B(S.SIGN.word - 0.1), B(S.SIGN.word + 0.7), 0.06, -0.4, 0.3, 900, 2400, 600);
  tick(B(S.SIGN.tag), 0.03, 3000, 0.3);
  pop(B(S.SIGN.url), 620, 0.05, 0); tick(B(S.SIGN.cta), 0.025, 4200, 0);
  // a held shimmer carries the end card into silence
  const pad = ctx.createGain(); pad.gain.setValueAtTime(0.0001, B(S.SIGN.tile)); pad.gain.exponentialRampToValueAtTime(0.018, B(S.SIGN.tile) + 1.2);
  pad.gain.setValueAtTime(0.018, DURATION - 3); pad.gain.exponentialRampToValueAtTime(0.0001, DURATION - 0.05);
  const padLP = filt('lowpass', 2400, 0.6); pad.connect(padLP).connect(fx); send(padLP, 0.6, verb);
  for (const m of [60, 64, 67, 72, 76]) for (const det of [-6, 6]) { const o = osc('sawtooth', mtof(m), B(S.SIGN.tile), DURATION - B(S.SIGN.tile)); o.detune.value = det; o.connect(pad); }

  function tone(t, f0, f1, dur, g, type = 'sine', p = 0) {
    const o = osc(type, f0, t, dur + 0.02); o.frequency.exponentialRampToValueAtTime(f1, t + dur);
    const e = env(t, g, 0.004, dur); o.connect(e).connect(pan(p)).connect(fx); send(e, 0.3, verb);
  }

  return ctx.startRendering();
}

export function encodeWav(buf) {
  const ch = buf.numberOfChannels, len = buf.length, sr = buf.sampleRate;
  const dv = new DataView(new ArrayBuffer(44 + len * ch * 2));
  const w = (o, s) => { for (let i = 0; i < s.length; i++) dv.setUint8(o + i, s.charCodeAt(i)); };
  w(0, 'RIFF'); dv.setUint32(4, 36 + len * ch * 2, true); w(8, 'WAVE'); w(12, 'fmt ');
  dv.setUint32(16, 16, true); dv.setUint16(20, 1, true); dv.setUint16(22, ch, true); dv.setUint32(24, sr, true);
  dv.setUint32(28, sr * ch * 2, true); dv.setUint16(32, ch * 2, true); dv.setUint16(34, 16, true);
  w(36, 'data'); dv.setUint32(40, len * ch * 2, true);
  const chans = Array.from({ length: ch }, (_, c) => buf.getChannelData(c));
  let peak = 0;
  for (const d of chans) for (let i = 0; i < len; i++) peak = Math.max(peak, Math.abs(d[i]));
  const raw = typeof location !== 'undefined' && new URLSearchParams(location.search).get('stem');
  const gain = raw ? 1 : peak > 0 ? 0.891 / peak : 1;   // −1 dBFS sample peak; render.mjs then loudness-normalises
  let o = 44;
  for (let i = 0; i < len; i++) for (let c = 0; c < ch; c++) {
    const v = Math.max(-1, Math.min(1, chans[c][i] * gain));
    dv.setInt16(o, v < 0 ? v * 0x8000 : v * 0x7fff, true); o += 2;
  }
  return { bytes: new Uint8Array(dv.buffer), peak };
}
