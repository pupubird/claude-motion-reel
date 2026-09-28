// The soundtrack, synthesised deterministically with OfflineAudioContext from the same score the
// visuals read: 128 BPM in F major (F – C – Dm – B♭), sidechained bass and stabs, a chirpy "Zembit"
// lead, and foley locked to every on-screen event. The only recorded sound is the Zembit's voice
// (ElevenLabs), loudness-matched, given a slight digital sheen, and ducked under by the music.
import { BEAT, DURATION } from './config.js';
import { rng } from './util.js';
import * as S from './score.js';
import { VO } from './assets.js';
import { COINS, coinRest } from './scenes/coins.js';

const SR = 48000;
const mtof = (m) => 440 * Math.pow(2, (m - 69) / 12);
const B = (b) => b * BEAT;

function tanhCurve(k) {
  const c = new Float32Array(2048);
  for (let i = 0; i < c.length; i++) { const x = (i / (c.length - 1)) * 2 - 1; c[i] = Math.tanh(k * x) / Math.tanh(k); }
  return c;
}
function crushCurve(steps) {
  const c = new Float32Array(4096);
  for (let i = 0; i < c.length; i++) { const x = (i / (c.length - 1)) * 2 - 1; c[i] = Math.round(x * steps) / steps; }
  return c;
}

async function loadVoice(ctx) {
  const out = {};
  await Promise.all(Object.keys(S.VO_AT).map(async (k) => {
    const buf = await (await fetch(new URL(`../assets/vo/${k}.mp3`, import.meta.url))).arrayBuffer();
    out[k] = await ctx.decodeAudioData(buf);
  }));
  return out;
}

export async function renderSoundtrack() {
  const ctx = new OfflineAudioContext(2, Math.ceil(SR * DURATION), SR);
  const R = rng(2029);
  const noise = ctx.createBuffer(2, SR * 4, SR);
  for (let c = 0; c < 2; c++) { const d = noise.getChannelData(c); for (let i = 0; i < d.length; i++) d[i] = R() * 2 - 1; }
  const voice = await loadVoice(ctx);

  /* ── buses ─────────────────────────────────────────── */
  const comp = ctx.createDynamicsCompressor();
  comp.threshold.value = -15; comp.knee.value = 10; comp.ratio.value = 3.2; comp.attack.value = 0.004; comp.release.value = 0.16;
  const out = ctx.createGain();
  const master = ctx.createGain(); master.gain.value = 0.8;
  master.connect(comp).connect(out).connect(ctx.destination);
  out.gain.setValueAtTime(1, DURATION - 0.08); out.gain.linearRampToValueAtTime(0, DURATION);

  // music bus: ducks under the voice and closes its filter before the breakdown
  const music = ctx.createGain();
  const musicLP = ctx.createBiquadFilter(); musicLP.type = 'lowpass'; musicLP.frequency.value = 20000; musicLP.Q.value = 0.5;
  music.connect(musicLP).connect(master);
  // the build (bars 3–4) opens the filter; the coins' flatten closes it into the breakdown; outro fades
  musicLP.frequency.setValueAtTime(900, B(8)); musicLP.frequency.exponentialRampToValueAtTime(20000, B(15.5));
  musicLP.frequency.setValueAtTime(20000, B(46.6)); musicLP.frequency.exponentialRampToValueAtTime(700, B(47.95));
  musicLP.frequency.setValueAtTime(1600, B(48)); musicLP.frequency.exponentialRampToValueAtTime(20000, B(55.2));
  musicLP.frequency.setValueAtTime(20000, B(62.6)); musicLP.frequency.exponentialRampToValueAtTime(500, B(63.5));

  const kickBus = ctx.createWaveShaper(); kickBus.curve = tanhCurve(1.8); kickBus.connect(music);
  const verb = ctx.createConvolver();
  const ir = ctx.createBuffer(2, SR * 2.4, SR);
  for (let c = 0; c < 2; c++) { const d = ir.getChannelData(c); for (let i = 0; i < d.length; i++) { const x = i / SR; d[i] = (R() * 2 - 1) * Math.exp(-x * 2.6) * Math.min(1, x / 0.004); } }
  verb.buffer = ir;
  const verbRet = ctx.createGain(); verbRet.gain.value = 0.26; verb.connect(verbRet).connect(master);
  const dl = ctx.createDelay(1); dl.delayTime.value = B(0.75);
  const fb = ctx.createGain(); fb.gain.value = 0.28;
  const dlf = ctx.createBiquadFilter(); dlf.type = 'lowpass'; dlf.frequency.value = 3600;
  const dlRet = ctx.createGain(); dlRet.gain.value = 0.24;
  dl.connect(dlf).connect(fb).connect(dl); dlf.connect(dlRet).connect(master);
  // sidechain pump on bass and chords
  const duck = ctx.createGain(); duck.connect(music);
  duck.gain.setValueAtTime(1, 0);
  for (const k of S.KICKS) { const t = B(k); duck.gain.setValueAtTime(1, t); duck.gain.linearRampToValueAtTime(0.3, t + 0.01); duck.gain.linearRampToValueAtTime(1, t + 0.24); }

  /* ── primitives ────────────────────────────────────── */
  const send = (node, amt, dest) => { const g = ctx.createGain(); g.gain.value = amt; node.connect(g).connect(dest); };
  const env = (t, peak, a, d) => { const g = ctx.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(peak, t + a); g.gain.exponentialRampToValueAtTime(0.0001, t + a + d); return g; };
  const osc = (type, f, t, dur) => { const o = ctx.createOscillator(); o.type = type; o.frequency.setValueAtTime(f, t); o.start(t); o.stop(t + dur); return o; };
  const nz = (t, dur) => { const s = ctx.createBufferSource(); s.buffer = noise; s.start(t, R() * Math.max(0, 3.9 - dur), dur); return s; };
  const filt = (type, f, q = 0.7) => { const b = ctx.createBiquadFilter(); b.type = type; b.frequency.value = f; b.Q.value = q; return b; };
  const pan = (p) => { const n = ctx.createStereoPanner(); n.pan.value = Math.max(-1, Math.min(1, p)); return n; };
  const swell = (t0, t1, g) => { const e = ctx.createGain(); e.gain.setValueAtTime(0.0001, t0); e.gain.exponentialRampToValueAtTime(g, t1); e.gain.linearRampToValueAtTime(0.0001, t1 + 0.03); return e; };

  /* ── instruments (music) ───────────────────────────── */
  const kick = (t, g = 1) => {
    const o = osc('sine', 180, t, 0.5);
    o.frequency.exponentialRampToValueAtTime(55, t + 0.06);
    o.frequency.exponentialRampToValueAtTime(42, t + 0.38);
    o.connect(env(t, g, 0.002, 0.4)).connect(kickBus);
    nz(t, 0.015).connect(filt('highpass', 3500)).connect(env(t, 0.26 * g, 0.0005, 0.01)).connect(kickBus);
  };
  const clap = (t, g = 0.34) => {
    const e = ctx.createGain(); e.gain.setValueAtTime(0.0001, t);
    for (const d of [0, 0.011, 0.022]) { e.gain.setValueAtTime(g, t + d); e.gain.exponentialRampToValueAtTime(g * 0.2, t + d + 0.01); }
    e.gain.setValueAtTime(g * 0.9, t + 0.033); e.gain.exponentialRampToValueAtTime(0.0001, t + 0.24);
    nz(t, 0.28).connect(filt('bandpass', 1500, 1.1)).connect(filt('highpass', 750)).connect(e);
    e.connect(music); send(e, 0.4, verb);
  };
  const hat = (t, g = 0.09, dec = 0.04, p = 0) => {
    nz(t, dec + 0.05).connect(filt('highpass', 8600)).connect(env(t, g, 0.001, dec)).connect(pan(p)).connect(music);
  };
  const bass = (t, m, dur, g = 0.28) => {
    const lp = filt('lowpass', 200, 7);
    lp.frequency.setValueAtTime(190, t); lp.frequency.exponentialRampToValueAtTime(1500, t + 0.012); lp.frequency.exponentialRampToValueAtTime(240, t + dur);
    const e = ctx.createGain(); e.gain.setValueAtTime(0.0001, t); e.gain.exponentialRampToValueAtTime(g, t + 0.005);
    e.gain.setValueAtTime(g, t + dur - 0.03); e.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    osc('sawtooth', mtof(m), t, dur + 0.05).connect(lp).connect(e);
    const sub = ctx.createGain(); sub.gain.value = 0.9;
    osc('sine', mtof(m) / 2, t, dur + 0.05).connect(sub).connect(e);
    e.connect(duck);
  };
  const pad = (t0, t1, notes, g = 0.03, att = 0.25) => {
    const lp = filt('lowpass', 700, 0.8);
    lp.frequency.setValueAtTime(500, t0); lp.frequency.linearRampToValueAtTime(2000, t1);
    const e = ctx.createGain(); e.gain.setValueAtTime(0.0001, t0); e.gain.exponentialRampToValueAtTime(g, t0 + att);
    e.gain.setValueAtTime(g, Math.max(t0 + att + 0.01, t1 - 0.05)); e.gain.exponentialRampToValueAtTime(0.0001, t1 + 0.5);
    for (const n of notes) for (const det of [-9, 0, 9]) { const o = osc('sawtooth', mtof(n), t0, t1 - t0 + 0.6); o.detune.value = det; o.connect(lp); }
    lp.connect(e); e.connect(duck); send(e, 0.8, verb);
  };
  const pluck = (t, m, g = 0.05, p = 0) => {
    const lp = filt('lowpass', 4200, 2);
    lp.frequency.setValueAtTime(5600, t); lp.frequency.exponentialRampToValueAtTime(800, t + 0.15);
    osc('square', mtof(m), t, 0.24).connect(lp);
    const o2g = ctx.createGain(); o2g.gain.value = 0.4;
    osc('triangle', mtof(m) * 2, t, 0.24).connect(o2g).connect(lp);
    const e = env(t, g, 0.002, 0.17);
    lp.connect(e).connect(pan(p)).connect(music); send(e, 0.45, dl); send(e, 0.22, verb);
  };
  const stab = (t, notes, g = 0.05, dur = 0.2) => {
    const lp = filt('lowpass', 3200, 1.2);
    lp.frequency.setValueAtTime(4600, t); lp.frequency.exponentialRampToValueAtTime(700, t + dur);
    for (const n of notes) for (const det of [-7, 7]) { const o = osc('sawtooth', mtof(n), t, dur + 0.05); o.detune.value = det; o.connect(lp); }
    const e = env(t, g, 0.003, dur); lp.connect(e).connect(duck); send(e, 0.35, verb); send(e, 0.18, dl);
  };
  // the Zembit's chirp: a square blip with a pitch scoop and a quick vibrato, through a "tiny speaker"
  const chirp = (t, m, dur = 0.16, g = 0.05, p = 0, scoop = -3) => {
    const o = osc('square', mtof(m + scoop), t, dur + 0.05);
    o.frequency.exponentialRampToValueAtTime(mtof(m), t + 0.035);
    const lfo = osc('sine', 18, t, dur + 0.05); const lg = ctx.createGain(); lg.gain.value = mtof(m) * 0.012; lfo.connect(lg).connect(o.frequency);
    const bp = filt('bandpass', 1900, 0.9);
    const e = env(t, g, 0.004, dur);
    o.connect(bp).connect(e).connect(pan(p)).connect(music); send(e, 0.3, dl); send(e, 0.2, verb);
  };
  const bell = (t, m, g = 0.07, p = 0) => {
    for (const [r, a] of [[1, 1], [2.76, 0.35], [5.4, 0.12]]) {
      const e = env(t, g * a, 0.002, 1.5 / r);
      osc('sine', mtof(m) * r, t, 2).connect(e).connect(pan(p)).connect(master); send(e, 0.6, verb);
    }
  };

  /* ── instruments (foley) ───────────────────────────── */
  const riser = (t0, t1, g = 0.22) => {
    const bp = filt('bandpass', 400, 1.8);
    bp.frequency.setValueAtTime(300, t0); bp.frequency.exponentialRampToValueAtTime(9000, t1);
    const e = swell(t0, t1, g); nz(t0, t1 - t0 + 0.05).connect(bp).connect(e).connect(master); send(e, 0.4, verb);
    const o = osc('sawtooth', 110, t0, t1 - t0 + 0.05); o.frequency.exponentialRampToValueAtTime(880, t1);
    o.connect(filt('lowpass', 1400)).connect(swell(t0, t1, g * 0.18)).connect(master);
  };
  const whoosh = (t0, t1, g = 0.25, p0 = -0.7, p1 = 0.7, f0 = 400, fm = 4500) => {
    const mid = (t0 + t1) / 2, bp = filt('bandpass', f0, 1.2);
    bp.frequency.setValueAtTime(f0, t0); bp.frequency.exponentialRampToValueAtTime(fm, mid); bp.frequency.exponentialRampToValueAtTime(700, t1);
    const e = ctx.createGain(); e.gain.setValueAtTime(0.0001, t0); e.gain.exponentialRampToValueAtTime(g, mid); e.gain.exponentialRampToValueAtTime(0.0001, t1);
    const pn = ctx.createStereoPanner(); pn.pan.setValueAtTime(p0, t0); pn.pan.linearRampToValueAtTime(p1, t1);
    nz(t0, t1 - t0 + 0.05).connect(bp).connect(e).connect(pn).connect(master); send(e, 0.3, verb);
  };
  const impact = (t, g = 1) => {
    const o = osc('sine', 92, t, 2); o.frequency.exponentialRampToValueAtTime(32, t + 1.4);
    o.connect(env(t, 0.9 * g, 0.004, 1.6)).connect(kickBus);
    const lp = filt('lowpass', 1500); lp.frequency.exponentialRampToValueAtTime(200, t + 0.6);
    const e2 = env(t, 0.5 * g, 0.002, 0.7); nz(t, 0.8).connect(lp).connect(e2).connect(master); send(e2, 0.6, verb);
    const e3 = env(t, 0.16 * g, 0.003, 1.9); nz(t, 2.1).connect(filt('highpass', 5500)).connect(e3).connect(master); send(e3, 0.5, verb);
  };
  const blip = (t, f = 1760, g = 0.12, p = 0) => {
    const o = osc('sine', f, t, 0.2); o.frequency.exponentialRampToValueAtTime(f * 0.5, t + 0.08);
    const e = env(t, g, 0.001, 0.13); o.connect(e).connect(pan(p)).connect(master); send(e, 0.5, verb); send(e, 0.2, dl);
  };
  const tick = (t, g = 0.05, f = 4000, p = 0) => {
    nz(t, 0.02).connect(filt('bandpass', f, 4)).connect(env(t, g, 0.0005, 0.01)).connect(pan(p)).connect(master);
  };
  const tone = (t, f0, f1, dur, g, type = 'sine', p = 0) => {
    const o = osc(type, f0, t, dur + 0.02); o.frequency.exponentialRampToValueAtTime(f1, t + dur);
    const e = env(t, g, 0.002, dur); o.connect(e).connect(pan(p)).connect(master); send(e, 0.22, verb);
  };
  const thud = (t, g = 0.4, f = 130) => {
    const o = osc('sine', f, t, 0.3); o.frequency.exponentialRampToValueAtTime(48, t + 0.16);
    o.connect(env(t, g, 0.002, 0.2)).connect(kickBus);
    nz(t, 0.03).connect(filt('lowpass', 1600)).connect(env(t, g * 0.4, 0.001, 0.025)).connect(master);
  };
  const click = (t, g = 0.15, p = 0) => {
    nz(t, 0.02).connect(filt('bandpass', 2600, 2)).connect(env(t, g, 0.0005, 0.012)).connect(pan(p)).connect(master);
    tone(t, 2100, 1300, 0.03, g * 0.35, 'triangle', p);
  };
  const zip = (t0, t1, g = 0.12, p0 = 0, p1 = 0, f0 = 800, f1 = 7000) => {
    const bp = filt('bandpass', f0, 3);
    bp.frequency.setValueAtTime(f0, t0); bp.frequency.exponentialRampToValueAtTime(f1, t1);
    const e = ctx.createGain(); e.gain.setValueAtTime(0.0001, t0); e.gain.exponentialRampToValueAtTime(g, t1 - 0.01); e.gain.exponentialRampToValueAtTime(0.0001, t1 + 0.03);
    const pn = ctx.createStereoPanner(); pn.pan.setValueAtTime(p0, t0); pn.pan.linearRampToValueAtTime(p1, t1);
    nz(t0, t1 - t0 + 0.06).connect(bp).connect(e).connect(pn).connect(master);
  };
  const flap = (t, g = 0.1, p = 0, f = 1800) => {        // card flip / paper flick
    const bp = filt('bandpass', f, 1.4); bp.frequency.setValueAtTime(f * 1.6, t); bp.frequency.exponentialRampToValueAtTime(f * 0.6, t + 0.06);
    nz(t, 0.08).connect(bp).connect(env(t, g, 0.002, 0.06)).connect(pan(p)).connect(master);
    tick(t + 0.045, g * 0.5, 3000, p);
  };
  const pop = (t, f = 700, g = 0.12, p = 0) => {           // sticker / pill pop
    const o = osc('sine', f * 0.6, t, 0.1); o.frequency.exponentialRampToValueAtTime(f * 1.5, t + 0.025); o.frequency.exponentialRampToValueAtTime(f, t + 0.08);
    o.connect(env(t, g, 0.002, 0.07)).connect(pan(p)).connect(master);
    tick(t, g * 0.4, 5000, p);
  };
  const shutter = (t, g = 0.1, p = 0) => {
    for (const d of [0, 0.022]) nz(t + d, 0.03).connect(filt('bandpass', 3200 - d * 20000, 2.5)).connect(env(t + d, g, 0.0005, 0.02)).connect(pan(p)).connect(master);
    nz(t, 0.06).connect(filt('highpass', 6000)).connect(env(t, g * 0.3, 0.001, 0.05)).connect(master);
  };
  const clink = (t, g = 0.06, p = 0, pitch = 1) => {       // lime glass coin
    const f = 2350 * pitch;
    for (const [r, a, d] of [[1, 1, 0.22], [2.72, 0.55, 0.12], [5.1, 0.3, 0.07], [8.3, 0.16, 0.04]]) {
      if (f * r > 19000) continue;                      // keep every partial below Nyquist
      const e = env(t, g * a, 0.0006, d);
      osc('sine', f * r, t, d + 0.05).connect(e).connect(pan(p)).connect(master); send(e, 0.18, verb);
    }
    nz(t, 0.012).connect(filt('highpass', 7000)).connect(env(t, g * 0.5, 0.0003, 0.008)).connect(pan(p)).connect(master);
  };
  const stamp = (t, g = 0.5, p = 0) => {
    thud(t, g, 110);
    nz(t, 0.09).connect(filt('bandpass', 900, 0.8)).connect(env(t, g * 0.55, 0.001, 0.08)).connect(pan(p)).connect(master);
    const o = osc('sine', 60, t, 0.5); o.frequency.exponentialRampToValueAtTime(38, t + 0.4);
    o.connect(env(t, g * 0.6, 0.003, 0.45)).connect(kickBus);
  };
  const power = (t, up = true, g = 0.12) => {
    const o = osc('sawtooth', up ? 220 : 1400, t, 0.4); o.frequency.exponentialRampToValueAtTime(up ? 1500 : 160, t + (up ? 0.16 : 0.3));
    o.connect(filt('lowpass', 3000)).connect(env(t, g, 0.003, up ? 0.18 : 0.3)).connect(master);
    const e = env(t, g * 0.5, 0.001, 0.05); nz(t, 0.08).connect(filt('bandpass', 5000, 1.5)).connect(e).connect(master);
  };
  const squeak = (t0, t1, g = 0.05, p = 0) => {           // marker on a page
    const bp = filt('bandpass', 2400, 6);
    for (let x = t0; x < t1; x += 0.04) bp.frequency.setValueAtTime(2100 + R() * 900, x);
    const e = ctx.createGain(); e.gain.setValueAtTime(0.0001, t0); e.gain.exponentialRampToValueAtTime(g, t0 + 0.03); e.gain.setValueAtTime(g, t1 - 0.04); e.gain.exponentialRampToValueAtTime(0.0001, t1);
    nz(t0, t1 - t0 + 0.05).connect(bp).connect(e).connect(pan(p)).connect(master);
  };
  const sparkle = (t, n, spread, g = 0.035) => {
    for (let i = 0; i < n; i++) {
      const tt = t + R() * spread, f = 2600 + R() * 5000;
      const e = env(tt, g * (0.4 + R() * 0.6), 0.001, 0.05 + R() * 0.08);
      osc('sine', f, tt, 0.2).connect(e).connect(pan(R() * 2 - 1)).connect(master); send(e, 0.5, dl); send(e, 0.5, verb);
    }
  };

  /* ── the voice ─────────────────────────────────────── */
  // each line normalised to −16 LUFS, high-passed, lightly compressed; a parallel crushed layer and a
  // 90 Hz ring-mod whisper give it the Zembit's digital sheen without costing intelligibility
  const voBus = ctx.createGain(); voBus.gain.value = 1.0;
  const vHP = filt('highpass', 95, 0.7), vPres = filt('peaking', 3200, 0.9); vPres.gain.value = 2.5;
  const vComp = ctx.createDynamicsCompressor(); vComp.threshold.value = -22; vComp.ratio.value = 3; vComp.attack.value = 0.003; vComp.release.value = 0.12;
  voBus.connect(vHP).connect(vPres).connect(vComp).connect(master);
  send(vComp, 0.12, verb);
  const crush = ctx.createWaveShaper(); crush.curve = crushCurve(24);
  const crushG = ctx.createGain(); crushG.gain.value = 0.1;
  vComp.connect(crush).connect(filt('bandpass', 2500, 0.8)).connect(crushG).connect(master);
  const ring = ctx.createGain(); ring.gain.value = 0;
  const carrier = osc('sine', 90, 0, DURATION); carrier.connect(ring.gain);
  const ringOut = ctx.createGain(); ringOut.gain.value = 0.07;
  vComp.connect(ring).connect(ringOut).connect(master);
  for (const [k, at] of Object.entries(S.VO_AT)) {
    const src = ctx.createBufferSource(); src.buffer = voice[k];
    const g = ctx.createGain(); g.gain.value = Math.pow(10, (-16 - VO[k].lufs) / 20);
    src.connect(g).connect(voBus);
    src.start(B(at));
    // duck the music under the line
    const t0 = B(at), t1 = t0 + VO[k].dur;
    music.gain.setValueAtTime(1, t0 - 0.04); music.gain.linearRampToValueAtTime(0.62, t0 + 0.04);
    music.gain.setValueAtTime(0.62, t1 - 0.1); music.gain.linearRampToValueAtTime(1, t1 + 0.15);
  }

  /* ── arrangement: harmony and grooves ─────────────── */
  S.KICKS.forEach((b) => kick(B(b), S.IMPACTS.includes(b) ? 1.1 : b < 16 ? 0.8 : 1));
  S.CLAPS.forEach((b) => clap(B(b)));
  S.HATS.forEach((b, i) => hat(B(b), b < 16 ? 0.06 : 0.09, 0.07, i % 2 ? 0.3 : -0.3));
  S.HATS16.forEach((b) => hat(B(b), 0.04, 0.03, 0.5));
  S.ROLL.forEach((b, i) => clap(B(b), 0.05 + 0.22 * (i / S.ROLL.length)));
  S.IMPACTS.forEach((b) => impact(B(b), b === 56 ? 1.15 : 1));
  for (let bar = 0; bar < 16; bar++) {
    const t0 = B(bar * 4), t1 = B(bar * 4 + 4);
    const g = bar < 2 ? 0.034 : bar >= 12 && bar <= 13 ? 0.042 : 0.022;
    const end = bar === 3 ? B(15.5) : bar === 7 ? B(31.5) : bar === 13 ? B(55.25) : bar === 15 ? B(62.8) : t1;
    pad(t0, end, S.CHORDS[bar], g, bar === 0 ? 1.4 : 0.2);
    // bass: pulsing 8ths from the build, bouncy octaves in the drops
    const drop = (bar >= 4 && bar <= 11) || bar >= 14;
    if (bar >= 2 && bar !== 12 && bar !== 13) {
      for (let e = 0; e < 8; e++) {
        const b = bar * 4 + e * 0.5 + (drop ? 0 : 0);
        if (S.SILENCES.some((s) => b >= s && b < s + 0.5) || b >= 62.5) continue;
        if (!drop && e % 2 === 0 && bar < 3) continue;
        const oct = drop && e % 2 === 1 ? 12 : 0;
        bass(B(b), S.ROOTS[bar] + 12 + oct, B(0.42), bar < 4 ? 0.2 : 0.27);
      }
    }
    // chord stabs on the offbeats in the drops
    if (drop && bar < 15) for (const e of [0.5, 1.5, 2.5, 3.5]) {
      const b = bar * 4 + e;
      if (S.SILENCES.some((s) => b >= s && b < s + 0.75)) continue;
      stab(B(b), S.CHORDS[bar].map((n) => n + 12), 0.03, 0.14);
    }
    // the Zembit's chirp hook through drop B
    if (bar >= 8 && bar <= 11) {
      const hook = [[0, 72, 0.2], [0.5, 69, 0.14], [0.75, 72, 0.14], [1.5, 77, 0.3], [2.5, 76, 0.14], [3, 72, 0.3]];
      for (const [o, m, d] of hook) {
        const b = bar * 4 + o;
        if (S.SILENCES.some((s) => b >= s && b < s + 0.75)) continue;
        chirp(B(b), m + (bar === 11 && o >= 2.5 ? -2 : 0), d, 0.038, o < 2 ? -0.25 : 0.25);
      }
    }
  }
  // arpeggio sparkle through the build and drop A
  for (let bar = 2; bar <= 7; bar++) {
    const ch = S.CHORDS[bar], tones = [ch[0] + 12, ch[1] + 12, ch[2] + 12, ch[3] + 12];
    const pat = [0, 1, 2, 3, 2, 1, 3, 2];
    for (let s = 0; s < 16; s++) {
      const b = bar * 4 + s * 0.25;
      if (S.SILENCES.some((x) => b >= x && b < x + 0.75)) continue;
      pluck(B(b), tones[pat[s % 8]], (s % 4 === 0 ? 0.045 : 0.028) * (bar < 4 ? 0.7 : 1), s % 2 ? 0.4 : -0.4);
    }
  }

  /* ── bars 1–2: the Zembit wakes ───────────────────── */
  const H = S.HELLO;
  const sub = osc('sine', mtof(29), 0, B(8));
  const subG = ctx.createGain();
  subG.gain.setValueAtTime(0.0001, 0); subG.gain.exponentialRampToValueAtTime(0.1, B(1.5));
  subG.gain.setValueAtTime(0.1, B(6.8)); subG.gain.exponentialRampToValueAtTime(0.0001, B(7.9));
  sub.connect(subG).connect(master);
  power(B(H.power), true, 0.1);
  for (const d of [0, 0.08, 0.15]) tick(B(H.power + d), 0.07, 3000 + d * 8000, 0);   // the flicker's state changes
  chirp(B(H.lookL), 79, 0.1, 0.06, -0.5, 4);
  chirp(B(H.lookR), 83, 0.1, 0.06, 0.5, 4);
  chirp(B(H.lookC), 81, 0.08, 0.045, 0, -2);
  blip(B(H.blink), 2200, 0.05);
  whoosh(B(H.dolly0), B(H.dolly1), 0.14, 0.2, -0.2, 200, 1400);
  riser(B(H.lights0), B(H.lights1), 0.12);
  sparkle(B(H.lights1 - 0.3), 14, B(0.8), 0.025);
  thud(B(4.8), 0.3, 150); thud(B(4.97), 0.22, 180);
  pop(B(H.pill), 900, 0.12, 0.4);
  pop(B(VO_WORD('hello', 1)), 1100, 0.08, 0.4);
  H.sparkles.forEach((b, i) => bell(B(b), [88, 91, 96][i], 0.03, [0.2, 0.6, -0.3][i]));
  for (let k = 0; k < 3; k++) whoosh(B(H.wave0 + k * 0.5), B(H.wave0 + k * 0.5 + 0.35), 0.05, 0.5, 0.3, 1200, 3200);
  riser(B(H.push0), B(H.push1), 0.2);
  whoosh(B(H.push0), B(H.push1 + 0.05), 0.2, 0, 0, 300, 5000);
  blip(B(H.close1), 1320, 0.08);

  /* ── bars 3–4: four days ──────────────────────────── */
  const F = S.FOUR;
  zip(B(8.0), B(F.merge), 0.1, -0.7, 0, 900, 4000); zip(B(8.0), B(F.merge), 0.1, 0.7, 0, 900, 4000);
  click(B(F.merge), 0.22); thud(B(F.merge), 0.28, 170);
  tone(B(F.merge), 1200, 3800, 0.12, 0.05, 'sine');
  whoosh(B(F.open0), B(F.open1 + 0.2), 0.16, 0, 0, 300, 2600);
  F.days.forEach((b, i) => { shutter(B(b), 0.12, (i % 2 ? 0.3 : -0.3)); pluck(B(b), [77, 81, 84, 89][i], 0.06, 0); });
  riser(B(12), B(15.5), 0.22);
  for (let i = 0; i < 8; i++) hat(B(14 + i * 0.125), 0.03 + i * 0.006, 0.03, (i % 2 ? 0.4 : -0.4));
  whoosh(B(15.6), B(16.05), 0.22, -0.3, 0.3, 300, 6000);

  /* ── bars 5–6: ten builders, one house ────────────── */
  const G = S.GRID;
  for (let i = 0; i < 10; i++) pop(B(G.in0 + 0.12 + i * G.stagger), 520 + i * 45, 0.07, (i % 5 - 2) * 0.25);
  zip(B(G.in0 + 1.0), B(G.in0 + 1.5), 0.05, 0.6, 0.8, 2000, 6000);
  for (let c = 0; c < 5; c++) for (let r = 0; r < 2; r++) flap(B(G.flip0 + c * G.flipCol + r * G.flipRow + G.flipDur * 0.5), 0.07, (c - 2) * 0.3, 1500 + c * 150);
  zip(B(G.close0), B(G.close1), 0.08, 0, 0, 600, 3000);
  whoosh(B(G.full0), B(G.full1 + 0.1), 0.16, 0, 0, 200, 1800);

  /* ── bars 7–10: ship it, funded ───────────────────── */
  const K = S.COHORT;
  for (let i = 0; i < 6; i++) { const t = B(K.deal0 + i * K.dealStep); whoosh(t - 0.05, t + 0.16, 0.05, 0.6, 0.2, 1400, 5000); flap(t + 0.2, 0.09, (i % 3 - 1) * 0.35, 1300); }
  const scan = osc('sine', 600, B(K.scan0), B(K.scan1 - K.scan0) + 0.05); scan.frequency.exponentialRampToValueAtTime(2400, B(K.scan1));
  const trem = osc('square', 16, B(K.scan0), B(K.scan1 - K.scan0) + 0.05); const tg = ctx.createGain(); tg.gain.value = 0.022;   // tremolo depth around the 0.04 level
  const sg = ctx.createGain(); sg.gain.setValueAtTime(0.0001, B(K.scan0)); sg.gain.exponentialRampToValueAtTime(0.04, B(K.scan0 + 0.3)); sg.gain.setValueAtTime(0.04, B(K.scan1 - 0.1)); sg.gain.exponentialRampToValueAtTime(0.0001, B(K.scan1));
  trem.connect(tg).connect(sg.gain);
  scan.connect(filt('lowpass', 3000)).connect(sg).connect(pan(0)).connect(master);
  for (let c = 0; c < 3; c++) tick(B(K.scan0 + (c + 0.5) / 3 * (K.scan1 - K.scan0)), 0.07, 5200, (c - 1) * 0.5);
  K.stamps.forEach((b, i) => { stamp(B(b) + 0.07, 0.55, i ? 0.35 : -0.35); });
  whoosh(B(K.reflow0), B(K.reflow1), 0.12, 0.4, -0.2, 300, 2400);
  for (let i = 0; i < 8; i++) tick(B(K.caption + i * 0.05), 0.03, 4200 + i * 200, 0);
  for (let k = 0; k < 2; k++) { const t = B(K.coin0 + k * 0.1); zip(t, t + 0.25, 0.06, 0, 0, 3000, 9000); clink(t + 0.26, 0.05, k ? 0.3 : -0.3, 1.2); }
  for (let k = 0; k < 2; k++) whoosh(B(K.toss0 + k * 0.12), B(K.toss1 + k * 0.12), 0.12, k ? 0.3 : -0.3, k ? 0.6 : -0.6, 500, 6000);

  /* ── bars 11–12: the coin rain ────────────────────── */
  // every coin that lands in the film gets its tick, pitched by stack and height (thinned where dense)
  // the exact landing schedule the visuals use (coins.js), so every clink is on its coin's frame
  const lands = coinRest().filter((c) => !c.lead).map((c) => ({ b: c.land, s: c.s.i, k: c.k, n: c.s.n })).sort((a, b) => a.b - b.b);
  let lastT = -1;
  for (const c of lands) {
    const t = B(c.b);
    if (t - lastT < 0.012) continue;           // thinned where the rain is densest
    lastT = t;
    clink(t, 0.022 + 0.018 * R(), (c.s - 5.5) / 6, 0.85 + 0.35 * (c.k / c.n) + R() * 0.1);
  }
  COINS.lead.forEach((b, i) => clink(B(b), 0.1, i ? -0.2 : 0.2, 1.0));
  whoosh(B(44.6), B(46.3), 0.16, 0, 0, 1800, 300);
  tone(B(44.6), 300, 60, B(1.6), 0.08, 'sine');
  zip(B(COINS.line0), B(COINS.line1), 0.07, -0.6, 0.6, 1400, 6000);
  blip(B(COINS.line1), 1760, 0.08, 0.6);

  /* ── bars 13–14: the mark ─────────────────────────── */
  const Mk = S.MARK;
  tone(B(Mk.melt0), 900, 220, B(0.7), 0.06, 'sine');
  tone(B(Mk.drop0), 2400, 500, B(Mk.drop1 - Mk.drop0), 0.04, 'sine');
  thud(B(Mk.drop1), 0.5, 120); click(B(Mk.drop1), 0.2);
  sparkle(B(Mk.lineOut), 10, B(0.4), 0.02);
  zip(B(Mk.build0), B(Mk.build0 + 0.45), 0.04, -0.5, 0.5, 2000, 5000);
  for (let i = 0; i < 16; i++) tick(B(Mk.build0 + 0.2 + i * 0.045), 0.035, 3800 + (i % 4) * 400, (i % 2 ? 0.3 : -0.3));
  tick(B(Mk.build0 + 0.8), 0.06, 6000); tick(B(Mk.build0 + 0.86), 0.06, 6400);
  whoosh(B(Mk.spin0), B(Mk.spin1), 0.14, -0.8, 0.8, 250, 2200);
  riser(B(52), B(Mk.lock), 0.24);
  click(B(Mk.lock), 0.3); thud(B(Mk.lock), 0.35, 200); tone(B(Mk.lock), 1300, 1900, 0.05, 0.07, 'triangle');

  /* ── bars 15–16: signature ────────────────────────── */
  const Sg = S.SIGN;
  whoosh(B(Sg.pull0), B(Sg.pull1), 0.2, 0, 0.4, 5000, 300);
  [65, 72, 77, 81, 84].forEach((m, i) => bell(B(56) + i * 0.02, m, 0.05, (i - 2) * 0.2));
  whoosh(B(Sg.fly0), B(Sg.fly1), 0.12, 0.6, -0.6, 900, 4000);
  thud(B(Sg.fly1), 0.3, 170); click(B(Sg.fly1), 0.14, -0.5);
  power(B(Sg.eyesOn), true, 0.07);
  zip(B(Sg.word0), B(Sg.word1), 0.06, -0.6, -0.2, 1500, 5000);
  Sg.sparkles.forEach((b, i) => bell(B(b), [91, 93, 96, 98][i], 0.028, [-0.5, 0.6, 0.1, 0.4][i]));
  squeak(B(Sg.arrow0), B(Sg.arrow1), 0.035, -0.4);
  for (let k = 0; k < 3; k++) whoosh(B(Sg.wave0 + 0.2 + k * 0.5), B(Sg.wave0 + 0.2 + k * 0.5 + 0.35), 0.045, 0.5, 0.4, 1200, 3200);
  chirp(B(Sg.wink), 84, 0.1, 0.05, 0.3, 5); bell(B(Sg.wink) + 0.03, 96, 0.04, 0.3);
  power(B(Sg.off0 + 0.05), false, 0.08);
  blip(B(Sg.off1), 880, 0.06);

  return ctx.startRendering();
}

// Beat of the i-th spoken word of a voice line (for foley that must land on a syllable).
function VO_WORD(line, i) { return S.VO_AT[line] + VO[line].words[i].s / BEAT; }

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
  const gain = peak > 0 ? 0.8 / peak : 1;   // ≈ −1.9 dBFS sample peak
  let o = 44;
  for (let i = 0; i < len; i++) for (let c = 0; c < ch; c++) {
    const v = Math.max(-1, Math.min(1, chans[c][i] * gain));
    dv.setInt16(o, v < 0 ? v * 0x8000 : v * 0x7fff, true); o += 2;
  }
  return { bytes: new Uint8Array(dv.buffer), peak };
}
