// The client's documentary footage as frame sequences (tools/prep_assets.sh). Scenes declare which
// clip frames a time needs (`needs(t)`); the engine awaits `prefetch` before rendering, so every
// motion-blur sub-frame samples its exact source frame and renders are identical run to run.
const SRC_FPS = 30000 / 1001;
export const CLIPS = {
  day1: { n: 90 },     // breakfast
  day2: { n: 90 },     // everyone building
  day3: { n: 90 },     // dinner
  day4: { n: 90 },     // demo day
  house: { n: 195 },   // the house, wide
};

const cache = new Map();   // key → ImageBitmap
const order = [];          // LRU
const MAX = 260;

const key = (clip, i) => `${clip}/${i}`;
export const frameIndex = (clip, localT) => Math.max(0, Math.min(CLIPS[clip].n - 1, Math.floor(localT * SRC_FPS)));

async function load(clip, i) {
  const k = key(clip, i);
  if (cache.has(k)) return;
  const url = new URL(`../assets/footage/${clip}/${String(i).padStart(4, '0')}.jpg`, import.meta.url);
  const bmp = await createImageBitmap(await (await fetch(url)).blob());
  cache.set(k, bmp);
  order.push(k);
  while (order.length > MAX) { const old = order.shift(); cache.get(old)?.close?.(); cache.delete(old); }
}

// needs: [[clip, localSeconds], …] — both neighbouring source frames, since drawClip blends them
export async function prefetch(needs) {
  const want = new Set();
  for (const [c, lt] of needs) { const i = frameIndex(c, lt); want.add(key(c, i)); want.add(key(c, Math.min(CLIPS[c].n - 1, i + 1))); }
  await Promise.all([...want].filter((k) => !cache.has(k)).map((k) => { const [c, i] = k.split('/'); return load(c, Number(i)); }));
}

// Best available frame (exact when prefetched; nearest loaded one in live preview).
export function frame(clip, localT) {
  const i = frameIndex(clip, localT);
  const b = cache.get(key(clip, i));
  if (b) return b;
  load(clip, i);   // live preview: fetch in the background
  for (let d = 1; d < 30; d++) {
    const a = cache.get(key(clip, i - d)) || cache.get(key(clip, i + d));
    if (a) return a;
  }
  return null;
}

// Draw a clip frame with object-fit: cover into a rect (optionally zoomed about a focus point).
// The timelapse source is 29.97 fps inside a 60 fps film: neighbouring frames are cross-blended by the
// sub-frame position, so big timelapse jumps read as soft motion instead of a stroboscopic judder.
export function drawClip(ctx, clip, localT, x, y, w, h, zoom = 1, fx = 0.5, fy = 0.5) {
  const b = frame(clip, localT);
  if (!b) { ctx.fillStyle = '#111414'; ctx.fillRect(x, y, w, h); return; }
  const s = Math.max(w / b.width, h / b.height) * zoom;
  const dw = b.width * s, dh = b.height * s, ox = x + (w - dw) * fx, oy = y + (h - dh) * fy;
  ctx.drawImage(b, ox, oy, dw, dh);
  const f = Math.max(0, localT) * SRC_FPS;
  const frac = f - Math.floor(f);
  const i1 = Math.min(CLIPS[clip].n - 1, Math.floor(f) + 1);
  const b1 = cache.get(key(clip, i1));
  if (b1 && b1 !== b && frac > 0.02) {
    const a = ctx.globalAlpha;
    ctx.globalAlpha = a * frac;
    ctx.drawImage(b1, ox, oy, dw, dh);
    ctx.globalAlpha = a;
  }
}
