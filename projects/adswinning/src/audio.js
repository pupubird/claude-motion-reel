// The soundtrack, synthesised deterministically with OfflineAudioContext from the same score the
// visuals read. 128 BPM, D minor, sidechained bass/pads, and foley locked to on-screen events:
// the table's ignition, the loupe's glass, keystrokes, receipts, landings, the lock, the sting.
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
  out.gain.setValueAtTime(1, DURATION - 0.1); out.gain.linearRampToValueAtTime(0, DURATION);

  const kickBus = ctx.createWaveShaper(); kickBus.curve = tanhCurve(1.8); kickBus.connect(master);
  const verb = ctx.createConvolver();
  const ir = ctx.createBuffer(2, SR * 2.8, SR);
  for (let c = 0; c < 2; c++) { const d = ir.getChannelData(c); for (let i = 0; i < d.length; i++) { const x = i / SR; d[i] = (R() * 2 - 1) * Math.exp(-x * 2.4) * Math.min(1, x / 0.004); } }
  verb.buffer = ir;
  const verbRet = ctx.createGain(); verbRet.gain.value = 0.3; verb.connect(verbRet).connect(master);
  const dl = ctx.createDelay(1); dl.delayTime.value = B(0.75);
  const fb = ctx.createGain(); fb.gain.value = 0.3;
  const dlf = ctx.createBiquadFilter(); dlf.type = 'lowpass'; dlf.frequency.value = 3400;
  const dlRet = ctx.createGain(); dlRet.gain.value = 0.28;
  dl.connect(dlf).connect(fb).connect(dl); dlf.connect(dlRet).connect(master);
  const duck = ctx.createGain(); duck.connect(master);
  duck.gain.setValueAtTime(1, 0);
  for (const k of S.KICKS) { const t = B(k); duck.gain.setValueAtTime(1, t); duck.gain.linearRampToValueAtTime(0.3, t + 0.01); duck.gain.linearRampToValueAtTime(1, t + 0.24); }

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
    const o = osc('sine', 190, t, 0.5);
    o.frequency.exponentialRampToValueAtTime(54, t + 0.07);
    o.frequency.exponentialRampToValueAtTime(41, t + 0.4);
    o.connect(env(t, g, 0.002, 0.42)).connect(kickBus);
    nz(t, 0.015).connect(filt('highpass', 3200)).connect(env(t, 0.3 * g, 0.0005, 0.01)).connect(kickBus);
  };
  const clap = (t, g = 0.36) => {
    const e = ctx.createGain(); e.gain.setValueAtTime(0.0001, t);
    for (const d of [0, 0.012, 0.024]) { e.gain.setValueAtTime(g, t + d); e.gain.exponentialRampToValueAtTime(g * 0.2, t + d + 0.01); }
    e.gain.setValueAtTime(g * 0.9, t + 0.036); e.gain.exponentialRampToValueAtTime(0.0001, t + 0.26);
    nz(t, 0.3).connect(filt('bandpass', 1350, 1.1)).connect(filt('highpass', 700)).connect(e);
    e.connect(master); send(e, 0.45, verb);
  };
  const hat = (t, g = 0.1, dec = 0.04, p = 0) => {
    nz(t, dec + 0.05).connect(filt('highpass', 8200)).connect(env(t, g, 0.001, dec)).connect(pan(p)).connect(master);
  };
  const bass = (t, m, dur, g = 0.3) => {
    const lp = filt('lowpass', 200, 6);
    lp.frequency.setValueAtTime(170, t); lp.frequency.exponentialRampToValueAtTime(1300, t + 0.012); lp.frequency.exponentialRampToValueAtTime(230, t + dur);
    const e = ctx.createGain(); e.gain.setValueAtTime(0.0001, t); e.gain.exponentialRampToValueAtTime(g, t + 0.005);
    e.gain.setValueAtTime(g, t + dur - 0.03); e.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    osc('sawtooth', mtof(m), t, dur + 0.05).connect(lp).connect(e);
    const sub = ctx.createGain(); sub.gain.value = 0.9;
    osc('sine', mtof(m) / 2, t, dur + 0.05).connect(sub).connect(e);
    e.connect(duck);
  };
  const pad = (t0, t1, notes, g = 0.03, att = 0.25) => {
    const lp = filt('lowpass', 600, 0.8);
    lp.frequency.setValueAtTime(420, t0); lp.frequency.linearRampToValueAtTime(1800, t1);
    const e = ctx.createGain(); e.gain.setValueAtTime(0.0001, t0); e.gain.exponentialRampToValueAtTime(g, t0 + att);
    e.gain.setValueAtTime(g, Math.max(t0 + att + 0.01, t1 - 0.05)); e.gain.exponentialRampToValueAtTime(0.0001, t1 + 0.5);
    for (const n of notes) for (const det of [-9, 0, 9]) { const o = osc('sawtooth', mtof(n), t0, t1 - t0 + 0.6); o.detune.value = det; o.connect(lp); }
    lp.connect(e); e.connect(duck); send(e, 0.8, verb);
  };
  const pluck = (t, m, g = 0.05, p = 0) => {
    const lp = filt('lowpass', 4000, 2);
    lp.frequency.setValueAtTime(5400, t); lp.frequency.exponentialRampToValueAtTime(700, t + 0.16);
    osc('square', mtof(m), t, 0.25).connect(lp);
    const o2g = ctx.createGain(); o2g.gain.value = 0.4;
    osc('triangle', mtof(m) * 2, t, 0.25).connect(o2g).connect(lp);
    const e = env(t, g, 0.002, 0.18);
    lp.connect(e).connect(pan(p)).connect(master); send(e, 0.5, dl); send(e, 0.25, verb);
  };
  const bell = (t, m, g = 0.08, p = 0) => {
    for (const [r, a] of [[1, 1], [2.76, 0.35], [5.4, 0.12]]) {
      const e = env(t, g * a, 0.002, 1.6 / r);
      osc('sine', mtof(m) * r, t, 2).connect(e).connect(pan(p)).connect(master); send(e, 0.7, verb);
    }
  };
  const riser = (t0, t1, g = 0.25) => {
    const bp = filt('bandpass', 400, 1.8);
    bp.frequency.setValueAtTime(300, t0); bp.frequency.exponentialRampToValueAtTime(9000, t1);
    const e = swell(t0, t1, g); nz(t0, t1 - t0 + 0.05).connect(bp).connect(e).connect(master); send(e, 0.4, verb);
    const o = osc('sawtooth', 110, t0, t1 - t0 + 0.05); o.frequency.exponentialRampToValueAtTime(880, t1);
    o.connect(filt('lowpass', 1400)).connect(swell(t0, t1, g * 0.2)).connect(master);
  };
  const whoosh = (t0, t1, g = 0.3, p0 = -0.7, p1 = 0.7, f0 = 400, fm = 4500) => {
    const mid = (t0 + t1) / 2, bp = filt('bandpass', f0, 1.2);
    bp.frequency.setValueAtTime(f0, t0); bp.frequency.exponentialRampToValueAtTime(fm, mid); bp.frequency.exponentialRampToValueAtTime(700, t1);
    const e = ctx.createGain(); e.gain.setValueAtTime(0.0001, t0); e.gain.exponentialRampToValueAtTime(g, mid); e.gain.exponentialRampToValueAtTime(0.0001, t1);
    const pn = ctx.createStereoPanner(); pn.pan.setValueAtTime(p0, t0); pn.pan.linearRampToValueAtTime(p1, t1);
    nz(t0, t1 - t0 + 0.05).connect(bp).connect(e).connect(pn).connect(master); send(e, 0.3, verb);
  };
  const impact = (t, g = 1) => {
    const o = osc('sine', 96, t, 2); o.frequency.exponentialRampToValueAtTime(32, t + 1.4);
    o.connect(env(t, 0.9 * g, 0.004, 1.7)).connect(kickBus);
    const lp = filt('lowpass', 1400); lp.frequency.exponentialRampToValueAtTime(200, t + 0.6);
    const e2 = env(t, 0.5 * g, 0.002, 0.7); nz(t, 0.8).connect(lp).connect(e2).connect(master); send(e2, 0.6, verb);
    const e3 = env(t, 0.18 * g, 0.003, 2.0); nz(t, 2.2).connect(filt('highpass', 5500)).connect(e3).connect(master); send(e3, 0.5, verb);
  };
  const blip = (t, f = 1760, g = 0.14, p = 0) => {
    const o = osc('sine', f, t, 0.2); o.frequency.exponentialRampToValueAtTime(f * 0.5, t + 0.08);
    const e = env(t, g, 0.001, 0.14); o.connect(e).connect(pan(p)).connect(master); send(e, 0.6, verb); send(e, 0.25, dl);
  };
  const tick = (t, g = 0.05, f = 4000, p = 0) => {
    nz(t, 0.02).connect(filt('bandpass', f, 4)).connect(env(t, g, 0.0005, 0.01)).connect(pan(p)).connect(master);
  };
  const tone = (t, f0, f1, dur, g, type = 'sine', p = 0) => {
    const o = osc(type, f0, t, dur + 0.02); o.frequency.exponentialRampToValueAtTime(f1, t + dur);
    const e = env(t, g, 0.002, dur); o.connect(e).connect(pan(p)).connect(master); send(e, 0.25, verb);
  };
  const thud = (t, g = 0.4, f = 130) => {
    const o = osc('sine', f, t, 0.3); o.frequency.exponentialRampToValueAtTime(48, t + 0.16);
    o.connect(env(t, g, 0.002, 0.2)).connect(kickBus);
    nz(t, 0.03).connect(filt('lowpass', 1600)).connect(env(t, g * 0.4, 0.001, 0.025)).connect(master);
  };
  const glass = (t, f = 3400, g = 0.12, p = 0) => {
    for (const [r, a] of [[1, 1], [2.32, 0.5], [4.1, 0.25]]) {
      const e = env(t, g * a, 0.001, 0.35 / r);
      osc('sine', f * r, t, 0.5).connect(e).connect(pan(p)).connect(master); send(e, 0.5, verb);
    }
    tick(t, g * 0.8, 6000, p);
  };
  const click = (t, g = 0.16) => {
    nz(t, 0.02).connect(filt('bandpass', 2600, 2)).connect(env(t, g, 0.0005, 0.012)).connect(master);
    tone(t, 2100, 1300, 0.03, g * 0.35, 'triangle');
  };
  const key = (t, g = 0.06, p = 0) => {
    // keyboard keystroke: a dull plastic knock + a bright contact tick
    nz(t, 0.03).connect(filt('bandpass', 1900 + R() * 900, 3)).connect(env(t, g, 0.0006, 0.02)).connect(pan(p)).connect(master);
    tick(t + 0.004, g * 0.6, 5200, p);
  };
  const stab = (t, notes, g = 0.05, dur = 0.2) => {
    const lp = filt('lowpass', 3000, 1.2);
    lp.frequency.setValueAtTime(4200, t); lp.frequency.exponentialRampToValueAtTime(600, t + dur);
    for (const n of notes) for (const det of [-7, 7]) { const o = osc('sawtooth', mtof(n), t, dur + 0.05); o.detune.value = det; o.connect(lp); }
    const e = env(t, g, 0.003, dur); lp.connect(e).connect(master); send(e, 0.4, verb); send(e, 0.2, dl);
  };
  const fall = (t0, t1, g = 0.2) => {
    const bp = filt('bandpass', 5000, 1.6);
    bp.frequency.setValueAtTime(5000, t0); bp.frequency.exponentialRampToValueAtTime(250, t1);
    const e = ctx.createGain(); e.gain.setValueAtTime(g, t0); e.gain.exponentialRampToValueAtTime(0.0001, t1);
    nz(t0, t1 - t0 + 0.05).connect(bp).connect(e).connect(master); send(e, 0.35, verb);
  };
  const buzz = (t, dur, g = 0.12) => {
    const lp = filt('lowpass', 900, 1);
    for (const f of [55, 55.8]) osc('square', f, t, dur).connect(lp);
    const e = env(t, g, 0.004, dur); lp.connect(e).connect(master);
  };
  const sparkle = (t, n, spread, g = 0.04) => {
    for (let i = 0; i < n; i++) {
      const tt = t + R() * spread, f = 2400 + R() * 5200;
      const e = env(tt, g * (0.4 + R() * 0.6), 0.001, 0.05 + R() * 0.08);
      osc('sine', f, tt, 0.2).connect(e).connect(pan(R() * 2 - 1)).connect(master); send(e, 0.5, dl); send(e, 0.5, verb);
    }
  };
  const hum = (t0, t1, g = 0.03) => {
    // fluorescent tube: 100 Hz buzz with harmonics, flickering in at the ignition
    const lp = filt('lowpass', 1200, 0.8);
    for (const [f, a] of [[100, 1], [200, 0.5], [300, 0.3], [500, 0.15]]) { const gg = ctx.createGain(); gg.gain.value = a; osc('sawtooth', f, t0, t1 - t0 + 0.1).connect(gg).connect(lp); }
    const e = ctx.createGain();
    e.gain.setValueAtTime(0.0001, t0);
    const fl = [[0, 0.8], [0.035, 0.08], [0.07, 1], [0.1, 0.3], [0.14, 1]];
    for (const [dt, a] of fl) e.gain.setValueAtTime(g * a, t0 + dt);
    e.gain.setValueAtTime(g, t1 - 0.3); e.gain.exponentialRampToValueAtTime(0.0001, t1);
    lp.connect(e).connect(master); send(e, 0.3, verb);
  };

  // ── arrangement: harmony and grooves ─────────────────
  S.KICKS.forEach((b) => kick(B(b), S.IMPACTS.includes(b) ? 1.1 : b < 16 ? 0.85 : 1));
  S.CLAPS.forEach((b) => clap(B(b)));
  S.HATS.forEach((b, i) => hat(B(b), b < 16 ? 0.07 : 0.1, 0.07, i % 2 ? 0.3 : -0.3));
  S.HATS16.forEach((b) => hat(B(b), 0.045, 0.03, 0.5));
  S.ROLL.forEach((b, i) => clap(B(b), 0.06 + 0.22 * (i / S.ROLL.length)));
  S.IMPACTS.forEach((b) => impact(B(b), b === 56 ? 1.15 : 1));
  const groove = (bar) => (bar >= 2 && bar <= 3) || (bar >= 4 && bar <= 11) || bar >= 14;
  for (let bar = 0; bar < 16; bar++) {
    const t0 = B(bar * 4), t1 = B(bar * 4 + 4);
    const g = bar < 2 ? 0.036 : bar >= 12 && bar <= 13 ? 0.04 : 0.024;
    pad(t0, bar === 3 ? B(15.5) : bar === 13 ? B(55.25) : bar === 15 ? DURATION - 0.4 : t1, S.CHORDS[bar], g, bar === 0 ? 1.0 : 0.2);
    if (groove(bar) && bar !== 15) {
      for (let e = 0; e < 4; e++) {
        const b = bar * 4 + e + 0.5;
        if (S.SILENCES.some((s) => b >= s && b < s + 1) || b >= 62) continue;
        bass(B(b), S.ROOTS[bar] + 12 + (e === 3 ? 12 : 0), B(0.42), bar < 4 ? 0.22 : 0.3);
      }
    }
    // arpeggio through the two drops
    if ((bar >= 4 && bar <= 7) || (bar >= 8 && bar <= 11)) {
      const ch = S.CHORDS[bar], tones = [ch[0] + 12, ch[1] + 12, ch[2] + 12, ch[0] + 24];
      const pat = [0, 1, 2, 3, 2, 1, 3, 2];
      for (let s = 0; s < 16; s++) {
        const b = bar * 4 + s * 0.25;
        if (S.SILENCES.some((x) => b >= x && b < x + 0.75)) continue;
        pluck(B(b), tones[pat[s % 8]], s % 4 === 0 ? 0.05 : 0.032, s % 2 ? 0.4 : -0.4);
      }
    }
  }

  // ── bars 1–4: the light table and the loupe ──────────
  hum(B(S.TABLE.ignite0), B(8), 0.022);
  click(B(S.TABLE.ignite0), 0.2);
  tone(B(S.TABLE.ignite0), 180, 90, 0.25, 0.12, 'triangle');
  for (let i = 0; i < 60; i++) {           // the ignition wave: ticks spreading out, denser, then gone
    const b = S.TABLE.wave0 + Math.pow(R(), 1.6) * 3.2;
    tick(B(b), 0.05 * (1 - (b - 1) / 4), 2500 + R() * 4000, R() * 1.6 - 0.8);
  }
  sparkle(B(1.0), 24, B(3), 0.025);
  riser(B(2), B(8), 0.18);
  whoosh(B(1.6), B(7.2), 0.16, -0.4, 0.4, 250, 1600);
  thud(B(4.0), 0.5); thud(B(4.5), 0.45);
  thud(B(8.5), 0.45); thud(B(9.0), 0.42);
  whoosh(B(S.LOUPE_HOPS[0].at - 0.9), B(S.LOUPE_HOPS[0].at + 0.05), 0.2, 0.8, 0.2);
  S.LOUPE_HOPS.forEach((h, i) => {
    if (i > 0) whoosh(B(h.at - 0.02), B(h.at + 0.3), 0.1, (i % 2 ? -0.3 : 0.3), (i % 2 ? 0.3 : -0.3), 900, 5200);
    glass(B(h.at + 0.06), 2600 + i * 320, 0.1, 0.35);
    blip(B(h.at + 0.14), mtof(81 + [0, 3, 5, 7, 10][i]), 0.05, 0.4);
  });
  whoosh(B(S.TABLE.lensCentre), B(S.TABLE.portal + 0.2), 0.18, 0.3, 0);
  riser(B(S.TABLE.portal - 0.5), B(16), 0.3);
  whoosh(B(15.55), B(16.15), 0.3, -0.2, 0.2, 300, 6000);

  // ── bars 5–6: the agent ──────────────────────────────
  S.typeTimes().forEach((b, i) => key(B(b), 0.075, (i % 3 - 1) * 0.15));
  click(B(S.QUERY.press), 0.22);
  thud(B(S.QUERY.press), 0.3, 160);
  whoosh(B(S.QUERY.press + 0.2), B(S.QUERY.press + 1.0), 0.12, 0.2, -0.4);
  S.RECEIPTS.forEach((r, i) => {
    blip(B(r.at), mtof(74 + [0, 2, 3, 5, 7][i]), 0.06, -0.3);
    bell(B(r.done), 86 + [0, 2, 3, 5, 7][i], 0.035, -0.2);
    tick(B(r.done), 0.07, 5200, -0.2);
  });
  whoosh(B(20.8), B(21.4), 0.12, -0.1, 0.5);
  sparkle(B(21.5), 36, B(0.55), 0.03);
  sparkle(B(22.0), 28, B(0.5), 0.03);
  fall(B(22.5), B(23.2), 0.2);
  for (let i = 0; i < 16; i++) pluck(B(22.75 + i * 0.018 + 0.2), 86 + [0, 2, 3, 5, 7, 9, 10, 12][i % 8] + (i >= 8 ? 12 : 0) - 12, 0.03, (i % 2 ? 0.5 : -0.5));
  whoosh(B(23.25), B(24.05), 0.24, 0.6, -0.2, 300, 3800);

  // ── bars 7–8: evidence on the grid, the fly-in, the lock ──
  for (let i = 0; i < 16; i++) tick(B(S.GRID_T.marks) + Math.min(i, 12) * 0.04, 0.05, 3000 + i * 150, (i % 6) / 3 - 0.8);
  whoosh(B(S.GRID_T.tilt), B(26.6), 0.14, -0.5, 0.5, 200, 1400);
  thud(B(25.5), 0.4); thud(B(25.85), 0.38);
  whoosh(B(S.GRID_T.fly), B(29.9), 0.18, 0.5, -0.4, 250, 2600);
  click(B(S.GRID_T.lock), 0.24);
  tone(B(S.GRID_T.lock), 900, 1200, 0.05, 0.08, 'triangle');
  [74, 81, 86].forEach((m, i) => bell(B(S.GRID_T.lock + 0.1) + i * 0.03, m, 0.05));
  riser(B(30.2), B(31.5), 0.22);

  // ── bars 9–10: the readout, the signal cards ─────────
  for (let i = 0; i < 5; i++) {
    const at = S.DETAIL_T.rows + i * S.DETAIL_T.rowStep;
    tick(B(at), 0.06, 4200, 0.3);
    if (i >= 1 && i <= 3) for (let k = 0; k < 10; k++) tick(B(at) + k * 0.035, 0.022, 6000 + k * 200, 0.4);
  }
  whoosh(B(S.DETAIL_T.open), B(S.DETAIL_T.end + 0.05), 0.24, 0.5, -0.3, 400, 5200);
  S.SIGNAL_CUTS.forEach((b, i) => {
    stab(B(b), S.CHORDS[9].map((n) => n + [0, 2, 3, 5, 7][i]), 0.045, 0.22);
    thud(B(b), 0.32, 140 + i * 10);
  });

  // ── bar 11: missing is never zero ────────────────────
  thud(B(S.ZERO_T.slam), 0.62, 110);
  buzz(B(S.ZERO_T.slam) + 0.02, 0.32, 0.1);
  for (let i = 0; i < 7; i++) tone(B(S.ZERO_T.reject) + i * 0.028, 300 + R() * 1800, 200, 0.02, 0.05, 'square');
  tone(B(S.ZERO_T.reject + 0.08), 420, 90, 0.4, 0.08, 'triangle');
  whoosh(B(S.ZERO_T.morph), B(S.ZERO_T.morph + 0.55), 0.14, 0.2, -0.3, 1200, 3000);
  S.typeTimesZero().forEach((b, i) => key(B(b), 0.05, 0.1 - (i % 2) * 0.2));
  thud(B(S.ZERO_T.head), 0.45); thud(B(S.ZERO_T.head + 0.25), 0.42);
  whoosh(B(S.ZERO_T.mark), B(S.ZERO_T.mark + 0.4), 0.1, -0.5, 0.5, 2000, 6500);

  // ── bar 12: the board ────────────────────────────────
  thud(B(S.BOARD_T.title), 0.4);
  for (let i = 0; i < 6; i++) blip(B(S.BOARD_T.thumbs + i * 0.085), mtof(79 + [0, 2, 5, 7, 9, 12][i]), 0.045, -0.4);
  for (let i = 0; i < 3; i++) tick(B(S.BOARD_T.cards + i * 0.12), 0.06, 3600, 0.4);
  for (let i = 0; i < 6; i++) tone(B(S.BOARD_T.lines + i * 0.09), 500 + i * 90, 1200 + i * 140, B(0.5), 0.022, 'sine', 0.2);
  whoosh(B(S.BOARD_T.converge), B(S.BOARD_T.end), 0.26, 0.6, 0, 3000, 400);
  riser(B(46.5), B(48), 0.18);

  // ── bars 13–14: the aperture assembles, then silence ──
  bell(B(48), 62, 0.06); bell(B(48) + 0.03, 69, 0.05);
  whoosh(B(48), B(S.AP_T.spin), 0.14, -0.3, 0.3, 300, 2000);
  tone(B(S.AP_T.plate), 70, 110, 0.6, 0.1, 'sine');
  for (let i = 0; i < 4; i++) {
    const t = B(S.AP_T.frame + i * 0.1 + 0.55);
    tick(t, 0.09, 2400 + i * 300, (i % 2 ? 0.5 : -0.5));
    tone(t, 1600 + i * 120, 900, 0.05, 0.06, 'triangle', (i % 2 ? 0.5 : -0.5));
  }
  thud(B(S.AP_T.recess + 0.4), 0.25, 90);
  whoosh(B(50.5), B(54.8), 0.12, -0.6, 0.6, 180, 1100);
  riser(B(52), B(S.AP_T.settle), 0.28);
  click(B(S.AP_T.settle), 0.3);
  tone(B(S.AP_T.settle), 1200, 1800, 0.06, 0.08, 'triangle');

  // ── bars 15–16: the signature ────────────────────────
  [62, 69, 74, 77, 81].forEach((m, i) => bell(B(S.FIN_T.word) + i * 0.022, m, 0.06, (i - 2) * 0.2));
  whoosh(B(S.FIN_T.word), B(S.FIN_T.word + 0.6), 0.14, -0.4, 0.6, 600, 3000);
  for (let i = 0; i < 6; i++) tick(B(S.FIN_T.tag + i * S.FIN_T.tagStep), 0.05, 3000 + i * 250, (i - 2.5) * 0.15);
  whoosh(B(S.FIN_T.high), B(S.FIN_T.high + 0.45), 0.1, -0.5, 0.5, 2000, 6500);
  click(B(S.FIN_T.cta), 0.16);
  whoosh(B(S.FIN_T.collapse), B(S.FIN_T.blink), 0.24, 0.5, 0, 4000, 300);
  blip(B(S.FIN_T.blink + 0.05), 1760, 0.2);
  bell(B(S.FIN_T.blink + 0.05), 86, 0.05);

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
  const gain = peak > 0 ? 0.8 / peak : 1;   // ≈ −1.9 dBFS sample peak; lands the mix near −12.3 LUFS
  let o = 44;
  for (let i = 0; i < len; i++) for (let c = 0; c < ch; c++) {
    const v = Math.max(-1, Math.min(1, chans[c][i] * gain));
    dv.setInt16(o, v < 0 ? v * 0x8000 : v * 0x7fff, true); o += 2;
  }
  return { bytes: new Uint8Array(dv.buffer), peak };
}
