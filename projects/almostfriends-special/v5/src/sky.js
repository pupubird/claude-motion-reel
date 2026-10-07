// The ground every act stands on, drawn into UNDER: the brand's daylight sky (soft cloud light, a sun glow, far soap
// bubbles out of focus drifting at three depths), the night (the brand's ink, far city lights out of focus) and the
// colours between (dusk, the inside of someone's bubble). Sprites are drawn once and stamped, so a frame is cheap.
import { C } from './brand.js';
import { W, H, S } from './config.js';
import { rng, clamp, lerp, mixHex, hexRgb } from './util.js';

function sprite(n, paint) {
  const c = document.createElement('canvas');
  c.width = c.height = Math.round(n * S);
  const g = c.getContext('2d');
  g.scale(S, S);
  paint(g, n);
  return c;
}
let BOKEH, RINGB, CLOUD, LIGHT;
function init() {
  if (BOKEH) return;
  // a far light out of focus: a disc with a slightly brighter rim (a lens's bokeh)
  BOKEH = sprite(128, (g, n) => {
    const r = n / 2;
    const gr = g.createRadialGradient(r, r, 0, r, r, r);
    gr.addColorStop(0, 'rgba(255,255,255,0.55)'); gr.addColorStop(0.78, 'rgba(255,255,255,0.7)'); gr.addColorStop(0.92, 'rgba(255,255,255,0.95)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = gr; g.beginPath(); g.arc(r, r, r, 0, Math.PI * 2); g.fill();
  });
  // a far soap bubble out of focus: a pale disc whose rim carries film colour
  RINGB = sprite(256, (g, n) => {
    const r = n / 2;
    const body = g.createRadialGradient(r * 0.8, r * 0.75, 0, r, r, r);
    body.addColorStop(0, 'rgba(255,255,255,0.18)'); body.addColorStop(0.8, 'rgba(255,255,255,0.08)'); body.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = body; g.beginPath(); g.arc(r, r, r, 0, Math.PI * 2); g.fill();
    const cols = ['rgba(255,111,174,0.55)', 'rgba(255,201,60,0.5)', 'rgba(62,224,197,0.5)', 'rgba(110,140,255,0.55)'];
    g.filter = `blur(${Math.round(n * 0.02 * S)}px)`;
    for (let i = 0; i < 4; i++) {
      g.strokeStyle = cols[i]; g.lineWidth = n * 0.085;
      g.beginPath(); g.arc(r, r, r * 0.88, (i / 4) * Math.PI * 2 + 0.3, ((i + 1) / 4) * Math.PI * 2 + 0.3); g.stroke();
    }
    g.globalCompositeOperation = 'destination-in';
    const fade = g.createRadialGradient(r, r, r * 0.6, r, r, r);
    fade.addColorStop(0, 'rgba(0,0,0,1)'); fade.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = fade; g.fillRect(0, 0, n, n);
  });
  CLOUD = sprite(256, (g, n) => {
    const r = n / 2;
    const gr = g.createRadialGradient(r, r, 0, r, r, r);
    gr.addColorStop(0, 'rgba(255,255,255,0.65)'); gr.addColorStop(0.5, 'rgba(255,255,255,0.28)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = gr; g.fillRect(0, 0, n, n);
  });
  LIGHT = sprite(256, (g, n) => {
    const r = n / 2;
    const gr = g.createRadialGradient(r, r, 0, r, r, r);
    gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.2, 'rgba(255,255,255,0.45)'); gr.addColorStop(0.55, 'rgba(255,255,255,0.1)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = gr; g.fillRect(0, 0, n, n);
  });
}

const R0 = rng(41);
const FAR = Array.from({ length: 13 }, () => ({ x: R0(), y: R0(), r: 40 + R0() * 120, z: 0.15 + R0() * 0.85, ph: R0() * 6.28, sp: 0.2 + R0() * 0.6 }));
const CLOUDS = Array.from({ length: 9 }, () => ({ x: R0(), y: 0.15 + R0() * 0.7, w: 500 + R0() * 700, h: 160 + R0() * 220, z: 0.2 + R0() * 0.5 }));
const LIGHTS = Array.from({ length: 13 }, () => ({ x: R0(), y: R0(), r: 50 + R0() * 120, z: 0.2 + R0() * 0.8, c: R0() }));

// shift: the camera's pan in pixels for a layer at depth 1 (far layers move less)
export function daySky(g, t, { shift = [0, 0], top = C.sky, bottom = C.peach, bubbles = 1, sun = 1, clouds = 1 } = {}) {
  init();
  const gr = g.createLinearGradient(0, 0, 0, H);
  gr.addColorStop(0, top); gr.addColorStop(0.62, mixHex(top, bottom, 0.55)); gr.addColorStop(1, bottom);
  g.fillStyle = gr; g.fillRect(0, 0, W, H);
  if (sun > 0) {
    g.save(); g.globalAlpha = 0.85 * sun; g.globalCompositeOperation = 'lighter';
    const sx = W * 0.18 + shift[0] * 0.1, sy = H * 0.08 + shift[1] * 0.1;
    g.drawImage(LIGHT, sx - 700, sy - 700, 1400, 1400);
    g.restore();
  }
  if (clouds > 0) {
    g.save(); g.globalAlpha = 0.55 * clouds;
    for (const c of CLOUDS) {
      const x = ((c.x * (W + 900) + t * 14 * c.z + shift[0] * c.z) % (W + 900)) - 450;
      const y = c.y * H + shift[1] * c.z;
      g.drawImage(CLOUD, x - c.w / 2, y - c.h / 2, c.w, c.h);
    }
    g.restore();
  }
  if (bubbles > 0) {
    g.save();
    for (const b of FAR) {
      const x = ((b.x * (W + 400) + Math.sin(t * b.sp + b.ph) * 30 + shift[0] * b.z) % (W + 400) + W + 400) % (W + 400) - 200;
      const y = ((b.y * (H + 400) - t * 22 * b.sp * b.z + shift[1] * b.z) % (H + 400) + H + 400) % (H + 400) - 200;
      const r = b.r * (0.5 + b.z);
      g.globalAlpha = bubbles * (0.18 + 0.32 * b.z);
      g.drawImage(RINGB, x - r, y - r, 2 * r, 2 * r);
    }
    g.restore();
  }
}

export function nightSky(g, t, { shift = [0, 0], glow = 1, lights = 1, center = [W / 2, H * 0.48] } = {}) {
  init();
  const gr = g.createRadialGradient(center[0], center[1], 0, center[0], center[1], H * 0.75);
  gr.addColorStop(0, C.nightHi); gr.addColorStop(0.55, '#0A1534'); gr.addColorStop(1, C.night);
  g.fillStyle = gr; g.fillRect(0, 0, W, H);
  if (lights > 0) {
    g.save(); g.globalCompositeOperation = 'lighter';
    for (const l of LIGHTS) {
      const x = l.x * W + shift[0] * l.z + Math.sin(t * 0.3 + l.c * 6) * 6;
      const y = l.y * H + shift[1] * l.z;
      const col = l.c < 0.45 ? [255, 190, 120] : l.c < 0.8 ? [140, 170, 255] : [255, 140, 200];
      g.globalAlpha = lights * (0.05 + 0.12 * l.z) * glow;
      g.filter = 'none';
      g.drawImage(tinted(col), x - l.r, y - l.r, 2 * l.r, 2 * l.r);
    }
    g.restore();
  }
}
const TINTS = new Map();
function tinted([r, g, b]) {
  const k = `${r},${g},${b}`;
  if (TINTS.has(k)) return TINTS.get(k);
  const c = sprite(128, (x, n) => { x.drawImage(BOKEH, 0, 0, n, n); x.globalCompositeOperation = 'source-in'; x.fillStyle = `rgb(${r},${g},${b})`; x.fillRect(0, 0, n, n); });
  TINTS.set(k, c);
  return c;
}

// a soft light stamp (glows, flares) — additive
export function glow(g, x, y, r, color = '#ffffff', a = 1) {
  init();
  g.save();
  g.globalCompositeOperation = 'lighter';
  g.globalAlpha = clamp(a);
  g.drawImage(color === '#ffffff' ? LIGHT : tintedLight(color), x - r, y - r, 2 * r, 2 * r);
  g.restore();
}
const TL_ = new Map();
function tintedLight(hex) {
  if (TL_.has(hex)) return TL_.get(hex);
  const [r, gg, b] = hexRgb(hex);
  const c = sprite(256, (x, n) => { x.drawImage(LIGHT, 0, 0, n, n); x.globalCompositeOperation = 'source-in'; x.fillStyle = `rgb(${r},${gg},${b})`; x.fillRect(0, 0, n, n); });
  TL_.set(hex, c);
  return c;
}

// sunbeams: long soft wedges of light from a source off the top of the frame, slowly turning (additive)
let BEAM = null;
function beamSprite() {
  if (BEAM) return BEAM;
  const w = Math.round(64 * S), h = Math.round(1024 * S);
  BEAM = document.createElement('canvas'); BEAM.width = w; BEAM.height = h;
  const g = BEAM.getContext('2d');
  const along = g.createLinearGradient(0, 0, 0, h);
  along.addColorStop(0, 'rgba(255,255,255,0.9)'); along.addColorStop(0.35, 'rgba(255,255,255,0.45)'); along.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = along; g.fillRect(0, 0, w, h);
  g.globalCompositeOperation = 'destination-in';
  const across = g.createLinearGradient(0, 0, w, 0);
  across.addColorStop(0, 'rgba(0,0,0,0)'); across.addColorStop(0.5, 'rgba(0,0,0,1)'); across.addColorStop(1, 'rgba(0,0,0,0)');
  g.fillStyle = across; g.fillRect(0, 0, w, h);
  return BEAM;
}
export function rays(g, t, { x = W * 0.12, y = -260, a = 1, tint = '#FFF4E0' } = {}) {
  if (a <= 0.005) return;
  const spr = beamSprite();
  const R1 = [[0.62, 0.11, 260, 2600], [0.78, 0.08, 180, 2900], [0.93, 0.12, 320, 2500], [1.06, 0.07, 140, 3000], [1.2, 0.1, 240, 2700], [1.36, 0.06, 160, 2400]];
  g.save(); g.globalCompositeOperation = 'lighter';
  for (const [ang0, al, wd, len] of R1) {
    const ang = ang0 + 0.035 * Math.sin(t * 0.35 + ang0 * 7);
    g.save(); g.translate(x, y); g.rotate(-Math.PI / 2 + ang); g.globalAlpha = al * a * (0.75 + 0.25 * Math.sin(t * 0.8 + ang0 * 5));
    g.drawImage(spr, -wd / 2, 0, wd, len);
    g.restore();
  }
  g.restore();
  void tint;
}

// a wash between two colours over the frame (dusk, the inside of a bubble)
export function wash(g, top, bottom, a = 1) {
  const gr = g.createLinearGradient(0, 0, 0, H);
  gr.addColorStop(0, top); gr.addColorStop(1, bottom);
  g.save(); g.globalAlpha = a; g.fillStyle = gr; g.fillRect(0, 0, W, H); g.restore();
}

export { lerp };
