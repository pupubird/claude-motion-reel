// The soundtrack, synthesised deterministically with OfflineAudioContext from the same score
// the visuals read. 128 BPM, A minor, sidechained bass/pads, foley locked to on-screen events.
import { BEAT, DURATION } from './config.js';
import { rng } from './util.js';
import * as S from './score.js';

const SR = 48000;
const mtof = (m) => 440 * Math.pow(2, (m - 69) / 12);
const B = (b) => b * BEAT;

function tanhCurve(k) {
  const c = new Float32Array(2048);
  for (let i = 0; i < c.length; i++) { const x = (i / (c.length - 1)) * 2 - 1; c[i] = Math.tanh(k * x) / Math.tanh(k); }
  return c;
}

export async function renderSoundtrack() {
  const ctx = new OfflineAudioContext(2, Math.ceil(SR * DURATION), SR);
  const R = rng(2026);
  const noise = ctx.createBuffer(2, SR * 4, SR);
  for (let c = 0; c < 2; c++) { const d = noise.getChannelData(c); for (let i = 0; i < d.length; i++) d[i] = R() * 2 - 1; }

  // ── buses ─────────────────────────────────────────────
  const comp = ctx.createDynamicsCompressor();
  comp.threshold.value = -16; comp.knee.value = 10; comp.ratio.value = 3.5; comp.attack.value = 0.004; comp.release.value = 0.16;
  const out = ctx.createGain();
  const master = ctx.createGain(); master.gain.value = 0.8;
  master.connect(comp).connect(out).connect(ctx.destination);
  out.gain.setValueAtTime(1, DURATION - 0.2); out.gain.linearRampToValueAtTime(0, DURATION);

  const kickBus = ctx.createWaveShaper(); kickBus.curve = tanhCurve(1.8); kickBus.connect(master);
  const verb = ctx.createConvolver();
  const ir = ctx.createBuffer(2, SR * 2.6, SR);
  for (let c = 0; c < 2; c++) { const d = ir.getChannelData(c); for (let i = 0; i < d.length; i++) { const x = i / SR; d[i] = (R() * 2 - 1) * Math.exp(-x * 2.6) * Math.min(1, x / 0.004); } }
  verb.buffer = ir;
  const verbRet = ctx.createGain(); verbRet.gain.value = 0.28; verb.connect(verbRet).connect(master);
  const dl = ctx.createDelay(1); dl.delayTime.value = B(0.75);
  const fb = ctx.createGain(); fb.gain.value = 0.32;
  const dlf = ctx.createBiquadFilter(); dlf.type = 'lowpass'; dlf.frequency.value = 3200;
  const dlRet = ctx.createGain(); dlRet.gain.value = 0.3;
  dl.connect(dlf).connect(fb).connect(dl); dlf.connect(dlRet).connect(master);
  const duck = ctx.createGain(); duck.connect(master);
  duck.gain.setValueAtTime(1, 0);
  for (const k of S.KICKS) { const t = B(k); duck.gain.setValueAtTime(1, t); duck.gain.linearRampToValueAtTime(0.28, t + 0.01); duck.gain.linearRampToValueAtTime(1, t + 0.24); }

  // ── primitives ────────────────────────────────────────
  const send = (node, amt, dest) => { const g = ctx.createGain(); g.gain.value = amt; node.connect(g).connect(dest); };
  const env = (t, peak, a, d) => { const g = ctx.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(peak, t + a); g.gain.exponentialRampToValueAtTime(0.0001, t + a + d); return g; };
  const osc = (type, f, t, dur) => { const o = ctx.createOscillator(); o.type = type; o.frequency.setValueAtTime(f, t); o.start(t); o.stop(t + dur); return o; };
  const nz = (t, dur) => { const s = ctx.createBufferSource(); s.buffer = noise; s.start(t, R() * Math.max(0, 3.9 - dur), dur); return s; };
  const filt = (type, f, q = 0.7) => { const b = ctx.createBiquadFilter(); b.type = type; b.frequency.value = f; b.Q.value = q; return b; };
  const pan = (p) => { const n = ctx.createStereoPanner(); n.pan.value = p; return n; };
  const swell = (t0, t1, g) => { const e = ctx.createGain(); e.gain.setValueAtTime(0.0001, t0); e.gain.exponentialRampToValueAtTime(g, t1); e.gain.linearRampToValueAtTime(0.0001, t1 + 0.03); return e; };

  // ── instruments ───────────────────────────────────────
  const kick = (t, g = 1) => {
    const o = osc('sine', 180, t, 0.5);
    o.frequency.exponentialRampToValueAtTime(52, t + 0.07);
    o.frequency.exponentialRampToValueAtTime(40, t + 0.4);
    o.connect(env(t, g, 0.002, 0.42)).connect(kickBus);
    nz(t, 0.015).connect(filt('highpass', 3000)).connect(env(t, 0.3 * g, 0.0005, 0.01)).connect(kickBus);
  };
  const clap = (t, g = 0.4) => {
    const e = ctx.createGain(); e.gain.setValueAtTime(0.0001, t);
    for (const d of [0, 0.012, 0.024]) { e.gain.setValueAtTime(g, t + d); e.gain.exponentialRampToValueAtTime(g * 0.2, t + d + 0.01); }
    e.gain.setValueAtTime(g * 0.9, t + 0.036); e.gain.exponentialRampToValueAtTime(0.0001, t + 0.26);
    nz(t, 0.3).connect(filt('bandpass', 1300, 1.1)).connect(filt('highpass', 700)).connect(e);
    e.connect(master); send(e, 0.5, verb);
  };
  const hat = (t, g = 0.1, dec = 0.04, p = 0) => {
    nz(t, dec + 0.05).connect(filt('highpass', 8000)).connect(env(t, g, 0.001, dec)).connect(pan(p)).connect(master);
  };
  const bass = (t, m, dur, g = 0.3) => {
    const lp = filt('lowpass', 200, 7);
    lp.frequency.setValueAtTime(180, t); lp.frequency.exponentialRampToValueAtTime(1500, t + 0.012); lp.frequency.exponentialRampToValueAtTime(240, t + dur);
    const e = ctx.createGain(); e.gain.setValueAtTime(0.0001, t); e.gain.exponentialRampToValueAtTime(g, t + 0.005);
    e.gain.setValueAtTime(g, t + dur - 0.03); e.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    osc('sawtooth', mtof(m), t, dur + 0.05).connect(lp).connect(e);
    const sub = ctx.createGain(); sub.gain.value = 0.9;
    osc('sine', mtof(m) / 2, t, dur + 0.05).connect(sub).connect(e);
    e.connect(duck);
  };
  const pad = (t0, t1, notes, g = 0.03, att = 0.25) => {
    const lp = filt('lowpass', 600, 0.8);
    lp.frequency.setValueAtTime(450, t0); lp.frequency.linearRampToValueAtTime(1700, t1);
    const e = ctx.createGain(); e.gain.setValueAtTime(0.0001, t0); e.gain.exponentialRampToValueAtTime(g, t0 + att);
    e.gain.setValueAtTime(g, Math.max(t0 + att + 0.01, t1 - 0.05)); e.gain.exponentialRampToValueAtTime(0.0001, t1 + 0.5);
    for (const n of notes) for (const det of [-9, 0, 9]) { const o = osc('sawtooth', mtof(n), t0, t1 - t0 + 0.6); o.detune.value = det; o.connect(lp); }
    lp.connect(e); e.connect(duck); send(e, 0.8, verb);
  };
  const pluck = (t, m, g = 0.05, p = 0) => {
    const lp = filt('lowpass', 4000, 2);
    lp.frequency.setValueAtTime(5200, t); lp.frequency.exponentialRampToValueAtTime(700, t + 0.16);
    osc('square', mtof(m), t, 0.25).connect(lp);
    const o2g = ctx.createGain(); o2g.gain.value = 0.4;
    osc('triangle', mtof(m) * 2, t, 0.25).connect(o2g).connect(lp);
    const e = env(t, g, 0.002, 0.18);
    lp.connect(e).connect(pan(p)).connect(master); send(e, 0.5, dl); send(e, 0.25, verb);
  };
  const bell = (t, m, g = 0.08) => {
    for (const [r, a] of [[1, 1], [2.76, 0.35], [5.4, 0.12]]) {
      const e = env(t, g * a, 0.002, 1.6 / r);
      osc('sine', mtof(m) * r, t, 2).connect(e).connect(master); send(e, 0.7, verb);
    }
  };
  const riser = (t0, t1, g = 0.25) => {
    const bp = filt('bandpass', 400, 1.8);
    bp.frequency.setValueAtTime(300, t0); bp.frequency.exponentialRampToValueAtTime(9000, t1);
    const e = swell(t0, t1, g); nz(t0, t1 - t0 + 0.05).connect(bp).connect(e).connect(master); send(e, 0.4, verb);
    const o = osc('sawtooth', 110, t0, t1 - t0 + 0.05); o.frequency.exponentialRampToValueAtTime(880, t1);
    o.connect(filt('lowpass', 1400)).connect(swell(t0, t1, g * 0.22)).connect(master);
  };
  const whoosh = (t0, t1, g = 0.3, p0 = -0.7, p1 = 0.7) => {
    const mid = (t0 + t1) / 2, bp = filt('bandpass', 500, 1.2);
    bp.frequency.setValueAtTime(400, t0); bp.frequency.exponentialRampToValueAtTime(4500, mid); bp.frequency.exponentialRampToValueAtTime(700, t1);
    const e = ctx.createGain(); e.gain.setValueAtTime(0.0001, t0); e.gain.exponentialRampToValueAtTime(g, mid); e.gain.exponentialRampToValueAtTime(0.0001, t1);
    const pn = ctx.createStereoPanner(); pn.pan.setValueAtTime(p0, t0); pn.pan.linearRampToValueAtTime(p1, t1);
    nz(t0, t1 - t0 + 0.05).connect(bp).connect(e).connect(pn).connect(master); send(e, 0.3, verb);
  };
  const impact = (t, g = 1) => {
    const o = osc('sine', 95, t, 2); o.frequency.exponentialRampToValueAtTime(32, t + 1.4);
    o.connect(env(t, 0.9 * g, 0.004, 1.7)).connect(kickBus);
    const lp = filt('lowpass', 1400); lp.frequency.exponentialRampToValueAtTime(200, t + 0.6);
    const e2 = env(t, 0.5 * g, 0.002, 0.7); nz(t, 0.8).connect(lp).connect(e2).connect(master); send(e2, 0.6, verb);
    const e3 = env(t, 0.2 * g, 0.003, 2.0); nz(t, 2.2).connect(filt('highpass', 5500)).connect(e3).connect(master); send(e3, 0.5, verb);
  };
  const blip = (t, f = 1760, g = 0.16) => {
    const o = osc('sine', f, t, 0.2); o.frequency.exponentialRampToValueAtTime(f * 0.5, t + 0.08);
    const e = env(t, g, 0.001, 0.14); o.connect(e).connect(master); send(e, 0.6, verb); send(e, 0.3, dl);
  };
  const tick = (t, g = 0.05, f = 4000, p = 0) => {
    nz(t, 0.02).connect(filt('bandpass', f, 4)).connect(env(t, g, 0.0005, 0.01)).connect(pan(p)).connect(master);
  };
  const tone = (t, f0, f1, dur, g, type = 'sine') => {
    const o = osc(type, f0, t, dur + 0.02); o.frequency.exponentialRampToValueAtTime(f1, t + dur);
    const e = env(t, g, 0.002, dur); o.connect(e).connect(master); send(e, 0.25, verb);
  };
  const sparkle = (t, n, spread, g = 0.05) => {
    for (let i = 0; i < n; i++) {
      const tt = t + R() * R() * spread, f = 2200 + R() * 5200;
      const e = env(tt, g * (0.4 + R() * 0.6), 0.001, 0.06 + R() * 0.08);
      osc('sine', f, tt, 0.2).connect(e).connect(pan(R() * 2 - 1)).connect(master); send(e, 0.6, dl); send(e, 0.5, verb);
    }
  };

  // ── arrangement ───────────────────────────────────────
  S.KICKS.forEach((b) => kick(B(b), b === 28 ? 1.1 : 1));
  S.CLAPS.forEach((b) => clap(B(b)));
  S.HATS.forEach((b, i) => hat(B(b), 0.11, 0.09, i % 2 ? 0.3 : -0.3));
  S.HATS16.forEach((b) => hat(B(b), 0.05, 0.03, 0.5));
  S.ROLL.forEach((b, i) => clap(B(b), 0.08 + 0.2 * (i / S.ROLL.length)));
  S.IMPACTS.forEach((b) => impact(B(b)));
  for (let bar = 0; bar < 8; bar++) {
    const t0 = B(bar * 4), end = bar === 6 ? B(27) : bar === 7 ? DURATION - 0.5 : B(bar * 4 + 4);
    pad(t0, end, S.CHORDS[bar], bar === 0 ? 0.04 : bar === 7 ? 0.034 : 0.026, bar === 0 ? 1.2 : 0.2);
    if (bar >= 1 && bar <= 6) {
      for (let e = 0; e < 4; e++) {
        const b = bar * 4 + e + 0.5;
        if (b === 15.5 || b >= 27) continue;
        bass(B(b), S.ROOTS[bar] + 12 + (e === 3 ? 12 : 0), B(0.42));
      }
    }
    if (bar >= 2 && bar <= 5) {
      const ch = S.CHORDS[bar], tones = [ch[0] + 12, ch[1] + 12, ch[2] + 12, ch[0] + 24];
      const pat = [0, 1, 2, 3, 2, 1, 3, 2];
      for (let s = 0; s < 16; s++) {
        const b = bar * 4 + s * 0.25;
        if (b >= 14.75 && b < 16) continue;
        pluck(B(b), tones[pat[s % 8]], s % 4 === 0 ? 0.06 : 0.04, s % 2 ? 0.4 : -0.4);
      }
    }
  }
  // Bar 1: the dot, the stretch, the rails, the slices, the fall.
  blip(B(0), 1760, 0.28);
  whoosh(B(0.75), B(1.45), 0.26, -0.2, 0.2);
  for (let i = 0; i < 7; i++) tick(B(1.5 + Math.abs(i - 3) * 0.05), 0.12, 2500 + i * 300, (i - 3) / 4);
  for (let i = 0; i < 7; i++) whoosh(B(2.0 + i * 0.065), B(2.35 + i * 0.065), 0.09, i % 2 ? 0.8 : -0.8, 0);
  for (let s = 0; s < 8; s++) hat(B(2 + s * 0.25), 0.035 + s * 0.012, 0.025, 0.2);
  pluck(B(3), 76, 0.1);
  riser(B(1.5), B(4), 0.3);
  tone(B(3.7), 1400, 160, B(0.3), 0.08);
  // Bar 2: typing, then the dive through the O.
  const cap = S.TYPE_CAPTION;
  for (let i = 0; i < cap.text.length; i++) if (cap.text[i] !== ' ') tick(B(cap.start + (i / cap.text.length) * (cap.end - cap.start)), 0.06, 3200 + (i % 3) * 700, 0.1);
  riser(B(6.2), B(8), 0.2);
  whoosh(B(7.2), B(8.3), 0.32, -0.3, 0.3);
  // Bars 3–4: knot flip, charge, shatter, singularity.
  whoosh(B(9.85), B(10.8), 0.15, 0.6, -0.6);
  riser(B(11), B(12), 0.16);
  sparkle(B(12), 44, 0.7, 0.05);
  const sb = filt('lowpass', 150, 1.5);
  sb.frequency.setValueAtTime(150, B(15)); sb.frequency.exponentialRampToValueAtTime(8000, B(16));
  nz(B(15), B(1) + 0.02).connect(sb).connect(swell(B(15), B(16), 0.35)).connect(master);
  const so = osc('sine', 50, B(15), B(1)); so.frequency.exponentialRampToValueAtTime(420, B(16));
  so.connect(swell(B(15), B(16), 0.12)).connect(master);
  // Bar 5 → 6: wipe.
  whoosh(B(19.15), B(20.05), 0.32, -0.9, 0.9);
  // Bar 6: foley that follows each easing curve.
  const m0 = S.EASE_MOTION.start, ml = S.EASE_MOTION.len;
  whoosh(B(20 + m0), B(20 + m0 + ml), 0.14, -0.5, 0.5);
  tone(B(21 + m0), 260, 560, 0.09, 0.09, 'triangle');
  tone(B(21 + m0) + 0.09, 560, 440, 0.2, 0.07, 'triangle');
  S.BOUNCE_CONTACTS.forEach((b, i) => { tone(B(b), 900, 480, 0.06, 0.2 * Math.pow(0.62, i)); tick(B(b), 0.05, 1800); });
  const wob = osc('sine', 520, B(23 + m0), 0.5), lfo = osc('sine', 16, B(23 + m0), 0.5), depth = ctx.createGain();
  depth.gain.setValueAtTime(80, B(23 + m0)); depth.gain.exponentialRampToValueAtTime(1, B(23 + m0) + 0.45);
  lfo.connect(depth).connect(wob.frequency); wob.connect(env(B(23 + m0), 0.08, 0.004, 0.42)).connect(master);
  // Bar 7: cuts, stutter, the held breath.
  [24.5, 25.5, 26.5].forEach((b) => tone(B(b), 140, 60, 0.22, 0.35));
  for (let i = 0; i < 8; i++) tone(B(26.5 + i * 0.0625), 300 + R() * 2200, 200 + R() * 300, 0.025, 0.05, 'square');
  riser(B(25), B(27), 0.2);
  const rc = filt('highpass', 4000); const rce = swell(B(27), B(28) - 0.01, 0.38);
  nz(B(27), B(1)).connect(rc).connect(rce).connect(master); send(rce, 0.4, verb);
  // Bar 8: the sting, decode ticks, skill pops, and the closing blip.
  [69, 72, 76, 83].forEach((m, i) => bell(B(28) + i * 0.028, m, 0.07));
  for (let b = S.SCRAMBLE.start; b < S.SCRAMBLE.end; b += 0.125) tick(B(b), 0.035, 5000 + R() * 2000, R() - 0.5);
  S.SKILL_POPS.forEach((b, i) => blip(B(b), mtof([81, 84, 88, 91, 93, 96][i]), 0.05));
  blip(B(S.FINAL_BLIP), 1760, 0.18);

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
  const gain = peak > 0 ? 0.89 / peak : 1;
  let o = 44;
  for (let i = 0; i < len; i++) for (let c = 0; c < ch; c++) {
    const v = Math.max(-1, Math.min(1, chans[c][i] * gain));
    dv.setInt16(o, v < 0 ? v * 0x8000 : v * 0x7fff, true); o += 2;
  }
  return { bytes: new Uint8Array(dv.buffer), peak };
}
