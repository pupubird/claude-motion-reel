// The phone: an iPhone at a real phone's proportions, whole and in frame at rest (owner, v2: "the phone doesn't look
// like a phone, very weird size"). Screens are drawn in full-bleed design coordinates (1080 wide, K = 2.687 px/pt) and
// scaled into it, so every UI component works unchanged at any size; the device (titanium frame, black border, side
// buttons) and the system UI (status bar, Dynamic Island) are drawn here, on top of whatever screen is showing.
// A pose { cx, top, s } places it: s = 1 → the resting phone (560 px screen, top at y 600); the camera
// (ui/phonecam.js) zooms by raising s and moving cx/top so the part that matters sits in the clear band.
import { W, H } from '../config.js';
import { squirclePath } from './kit.js';
import { statusBar, dynamicIsland } from './ios.js';
import { FONTS, UI } from '../brand.js';
import { drawMark, ICON_RADIUS } from '../world/mark.js';
import { lerp, clamp, smoothstep } from '../util.js';

export const PHONE_W = 560;                       // resting screen width (px)
export const PHONE_TOP = 600;                     // resting screen top (px)
export const SCREEN_SCALE = PHONE_W / W;          // 0.5185: full-bleed design → resting screen
const K = W / 402;                                // design px per pt
const RADIUS = 55 * K;                            // the screen's corner radius (55 pt)
const BORDER = 6.5 * K;                           // the black border around the glass
const FRAME = 7.5 * K;                            // the titanium band outside it

export const REST = { cx: W / 2, top: PHONE_TOP, s: 1 };
export const lerpPose = (a, b, u) => ({ cx: a.cx + (b.cx - a.cx) * u, top: a.top + (b.top - a.top) * u, s: a.s + (b.s - a.s) * u });

// The device around a screen rect (design coordinates, the caller has scaled the canvas): the side buttons, the
// titanium band with its light falloff, the black border. `grow` 0..1 builds it outward from the glass (the launch).
function device(ctx, x, y, w, h, r, { grow = 1, shadow = 1 } = {}) {
  const b = BORDER * grow, f = FRAME * grow;
  const outer = squirclePath(x - b - f, y - b - f, w + 2 * (b + f), h + 2 * (b + f), r + b + f);
  ctx.save();
  // the buttons: action, volume up/down on the left; side button and camera control on the right
  if (grow > 0.6) {
    ctx.fillStyle = '#A9ADB6';
    const bw = 4.5 * K * grow, ox = b + f;
    for (const [side, y0, len] of [[-1, 112, 30], [-1, 168, 58], [-1, 238, 58], [1, 196, 92], [1, 560, 44]]) {
      const bx = side < 0 ? x - ox - bw + 1.2 * K : x + w + ox - 1.2 * K;
      ctx.fill(squirclePath(bx, y + y0 * K, bw, len * K, bw / 2));
    }
  }
  // the band, lit from the top left, with a soft shadow on the sky
  if (shadow > 0) { ctx.shadowColor = `rgba(11,27,63,${0.26 * shadow})`; ctx.shadowBlur = 80; ctx.shadowOffsetY = 34; }
  const g = ctx.createLinearGradient(x - f, y - f, x + w + f, y + h + f);
  g.addColorStop(0, '#E9EBEF'); g.addColorStop(0.35, '#BFC3CA'); g.addColorStop(0.7, '#9EA3AC'); g.addColorStop(1, '#C9CCD3');
  ctx.fillStyle = g;
  ctx.fill(outer);
  ctx.shadowColor = 'transparent';
  ctx.lineWidth = 1.6 * K; ctx.strokeStyle = 'rgba(70,74,84,0.55)'; ctx.stroke(outer);
  ctx.lineWidth = 1.1 * K; ctx.strokeStyle = 'rgba(255,255,255,0.7)';
  ctx.stroke(squirclePath(x - b - f + 2 * K, y - b - f + 2 * K, w + 2 * (b + f) - 4 * K, h + 2 * (b + f) - 4 * K, r + b + f - 2 * K));
  // the black border
  ctx.fillStyle = '#0B0C10';
  ctx.fill(squirclePath(x - b, y - b, w + 2 * b, h + 2 * b, r + b));
  ctx.restore();
}

// The system UI over any app: status bar and Dynamic Island; a faint sheen on the glass.
function system(ctx, a = 1) {
  ctx.save();
  ctx.globalAlpha *= a;
  statusBar(ctx, 0, 0, W, K, { ink: UI.ink, font: FONTS.ui });
  dynamicIsland(ctx, 0, 0, W, K);
  const g = ctx.createLinearGradient(0, 0, W, H);
  g.addColorStop(0, 'rgba(255,255,255,0.10)'); g.addColorStop(0.32, 'rgba(255,255,255,0)'); g.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  ctx.restore();
}

// Draw the phone at `pose`; `screen(ctx)` draws in full-bleed design coordinates (0..W × 0..H), clipped to the glass.
// fade { y0, y1, k }: the whole device fades out above y1 (fully at y0, by k), so a raised phone slips under the
// caption band instead of colliding with it. `alpha` fades the whole device (the reveal drops it away).
export function drawPhone(ctx, pose, screen, { shadow = 1, tilt = 0, fade = null, alpha = 1 } = {}) {
  if (alpha <= 0.002) return;
  if (fade && fade.k > 0.001 && pose.top < fade.y1) return faded(ctx, fade, (c) => drawPhone(c, pose, screen, { shadow, tilt, alpha }));
  const sc = SCREEN_SCALE * pose.s;
  const x0 = pose.cx - (W * sc) / 2, y0 = pose.top;
  ctx.save();
  ctx.globalAlpha *= alpha;
  ctx.translate(x0, y0);
  if (tilt) { ctx.translate((W * sc) / 2, (H * sc) / 2); ctx.rotate(tilt); ctx.translate(-(W * sc) / 2, -(H * sc) / 2); }
  ctx.scale(sc, sc);
  device(ctx, 0, 0, W, H, RADIUS, { shadow });
  ctx.save();
  ctx.clip(squirclePath(0, 0, W, H, RADIUS));
  screen(ctx);
  system(ctx);
  ctx.restore();
  ctx.restore();
}

// Where a point of the screen (full-bleed design coordinates) lands on the frame for a pose.
export function screenToFrame(pose, x, y) {
  const sc = SCREEN_SCALE * pose.s;
  return [pose.cx - (W * sc) / 2 + x * sc, pose.top + y * sc];
}

// Draw through a vertical alpha ramp (frame coordinates): transparent·(1 − k) above y0, opaque below y1. Renders into
// one reused offscreen canvas the size of the target, with the target's transform, then composites it back.
let scratch = null;
function faded(ctx, { y0, y1, k }, draw) {
  const cv = ctx.canvas;
  if (!scratch || scratch.width !== cv.width || scratch.height !== cv.height) {
    scratch = document.createElement('canvas'); scratch.width = cv.width; scratch.height = cv.height;
  }
  const o = scratch.getContext('2d');
  o.setTransform(1, 0, 0, 1, 0, 0); o.globalCompositeOperation = 'source-over'; o.globalAlpha = 1;
  o.clearRect(0, 0, cv.width, cv.height);
  o.setTransform(ctx.getTransform());
  draw(o);
  o.globalCompositeOperation = 'destination-in';
  const g = o.createLinearGradient(0, y0, 0, y1);
  g.addColorStop(0, `rgba(0,0,0,${1 - k})`); g.addColorStop(1, 'rgba(0,0,0,1)');
  o.fillStyle = g; o.fillRect(-W, -H, 3 * W, 3 * H);
  o.globalCompositeOperation = 'source-over';
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.drawImage(scratch, 0, 0); ctx.restore();
}

// The app launching from its icon, the way iOS opens an app: a squircle window grows from the icon's rect to the
// resting screen, the app running inside it (aspect-filled, centred); the icon's white face and mark fade off it as it
// opens, and the device grows out of the glass's edge over the last stretch. u 0..1 (from launchU); at u = 0 it is
// the icon (drawAppIcon), at u = 1 it is drawPhone(REST).
export function drawLaunch(ctx, u, icon, screen, { t = 0 } = {}) {
  const sc1 = SCREEN_SCALE;
  const x0 = lerp(icon.x - icon.size / 2, REST.cx - (W * sc1) / 2, u), y0 = lerp(icon.y - icon.size / 2, REST.top, u);
  const w = lerp(icon.size, W * sc1, u), h = lerp(icon.size, H * sc1, u);
  const r = lerp(icon.size * ICON_RADIUS, RADIUS * sc1, u);
  const grow = smoothstep(0.5, 1, u);
  ctx.save();
  // the icon's shadow growing into the phone's, then the device around the window (drawn at the resting scale)
  ctx.save();
  ctx.shadowColor = `rgba(11,27,63,${lerp(0.18, 0.26, u)})`;
  ctx.shadowBlur = lerp(icon.size * 0.18, 80, u); ctx.shadowOffsetY = lerp(icon.size * 0.06, 34, u);
  ctx.fillStyle = '#FFFFFF';
  ctx.fill(squirclePath(x0, y0, w, h, r));
  ctx.restore();
  if (grow > 0.001) {
    ctx.save();
    ctx.translate(x0, y0); ctx.scale(sc1, sc1);
    device(ctx, 0, 0, w / sc1, h / sc1, r / sc1, { grow, shadow: 0 });
    ctx.restore();
  }
  // the app
  const win = squirclePath(x0, y0, w, h, r);
  ctx.save();
  ctx.clip(win);
  const k = Math.max(w / W, h / H);
  ctx.translate(x0 + w / 2 - (W * k) / 2, y0 + h / 2 - (H * k) / 2);
  ctx.scale(k, k);
  screen(ctx);
  system(ctx, smoothstep(0.3, 0.8, u));
  ctx.restore();
  // the icon's face fading off it
  const face = 1 - smoothstep(0, 0.4, u);
  if (face > 0.002) {
    ctx.save();
    ctx.clip(win);
    ctx.globalAlpha *= face; ctx.fillStyle = '#FFFFFF'; ctx.fillRect(x0, y0, w, h);
    ctx.restore();
    drawMark(ctx, x0 + w / 2, y0 + h / 2, Math.min(w, h) * 0.27, { t, alpha: face });
  }
  ctx.restore();
}

// The launch's progress: a critically damped spring (no overshoot, so the hand-off to the resting phone is exact),
// normalised to land at 1 after `dur` seconds.
export function launchU(dt, dur, omega = 16) {
  const f = (x) => 1 - (1 + omega * x) * Math.exp(-omega * x);
  return dt <= 0 ? 0 : dt >= dur ? 1 : clamp(f(dt) / f(dur));
}
