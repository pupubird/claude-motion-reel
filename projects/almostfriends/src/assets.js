// Images the scenes need at init: the people's profile photos (Higgsfield GPT Image 2, casual iPhone snapshots of
// ordinary people — the owner's rule), plus the icon set. A missing photo logs and draws a placeholder instead of
// hanging the render (the cast is generated separately).
import { loadIcons } from './ui/icons.js';
import { S as S_DPR } from './config.js';
import { T, fill } from './copy.js';
const base = new URL('../assets/', import.meta.url);
export const IMG = {};

export function img(src) {
  return new Promise((res, rej) => {
    const im = new Image();
    im.onload = () => im.decode().then(() => res(im), () => res(im));
    im.onerror = () => rej(new Error(`image ${src}`));
    im.src = src;
  });
}

// key → [file, focus x, focus y, crop size] (focus and crop as fractions of the image: where the face is), all measured
// by tools/face_crops.py into assets/people/crops.json. v6 recast to the owner's brief (young, middle- to high-income,
// international): two leads and 30 friends, prompts in assets/people/prompts-v6.tsv.
export const PEOPLE = {};
// the two of you, by role (unlock.js's reveal, foam.js's double bubble): "you" and "the one" (Curious Otter)
export const LEADS = { you: 'hana', one: 'sofia' };
export const NAMES = { hana: fill(T.nameAge, { name: 'Hana', age: 26 }), sofia: fill(T.nameAge, { name: 'Sofia', age: 28 }) };
// everyone else who becomes your friend (foam.js), in crops.json order: the first six take the inner ring
export const CROWD = [];

// Each photo is also cut once into square face tiles at three sizes, so a 50 px foam cell never samples a 1 k photo
// (cheaper, and no shimmer when the foam zooms)
const TILE_SIZES = [512, 192, 72].map((n) => Math.round(n * S_DPR));   // device px (S = 2 for the 4K master)
const TILES = {};
function tiles(key) {
  const im = IMG[key];
  const [, fx, fy, cs] = PEOPLE[key];
  const s = Math.min(im.width, im.height) * cs;
  let src = im, sx = im.width * fx - s / 2, sy = im.height * fy - s / 2, ss = s;
  TILES[key] = TILE_SIZES.map((n) => {
    const c = document.createElement('canvas');
    c.width = c.height = n;
    const g = c.getContext('2d');
    g.imageSmoothingQuality = 'high';
    g.drawImage(src, sx, sy, ss, ss, 0, 0, n, n);
    src = c; sx = 0; sy = 0; ss = n;               // each smaller tile from the one above it: a box-filtered mip chain
    return c;
  });
}

// The world's land (tools/land_mask.py: Natural Earth 1:50m via world-atlas, equirectangular, white = land), for the
// hook's planet of people. landAt(lat, lon) → 0…1 (degrees).
let LAND = null;
export function landAt(lat, lon) {
  if (!LAND) return 0;
  const x = Math.floor((((lon + 180) % 360 + 360) % 360) / 360 * LAND.w), y = Math.min(LAND.h - 1, Math.max(0, Math.floor((90 - lat) / 180 * LAND.h)));
  return LAND.d[(y * LAND.w + x) * 4] / 255;
}

export async function loadAssets() {
  const land = await img(new URL('world/land.png', base).href).catch(() => null);
  if (land) {
    const c = document.createElement('canvas'); c.width = land.width; c.height = land.height;
    const g = c.getContext('2d'); g.drawImage(land, 0, 0);
    LAND = { w: c.width, h: c.height, d: g.getImageData(0, 0, c.width, c.height).data };
  }
  const crops = await fetch(new URL('people/crops.json', base).href).then((r) => r.json()).catch(() => ({}));
  const leads = Object.values(LEADS);
  for (const [k, v] of Object.entries(crops)) { PEOPLE[k] = v; if (!leads.includes(k)) CROWD.push(k); }
  for (const k of leads) if (!PEOPLE[k]) throw new Error(`assets: lead "${k}" has no face crop (run tools/face_crops.py)`);
  await Promise.all([
    ...Object.entries(PEOPLE).map(async ([k, [p]]) => {
      IMG[k] = await img(new URL(p, base).href).catch((e) => { console.warn(`photo ${k} missing (${e.message})`); return null; });
      if (IMG[k]) tiles(k);
    }),
    loadIcons(),
  ]);
}

// Draw person `key` as a circular profile photo centred at (cx, cy), radius r, cropped around the face (`clip: false`
// when the caller has already clipped, e.g. a foam cell).
export function drawPhoto(ctx, key, cx, cy, r, { alpha = 1, ring = null, ringW = 0, clip = true } = {}) {
  if (r < 1 || alpha <= 0.002) return;
  const im = IMG[key];
  const [, fx, fy, cs] = PEOPLE[key];
  ctx.save();
  ctx.globalAlpha *= alpha;
  if (clip) { ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.clip(); }
  if (im) {
    const ts = TILES[key];
    const tile = ts ? (ts.slice().reverse().find((c) => c.width >= 2 * r * S_DPR) || ts[0]) : null;   // smallest tile that covers it
    if (tile) ctx.drawImage(tile, cx - r, cy - r, 2 * r, 2 * r);
    else {
      const s = Math.min(im.width, im.height) * cs;
      ctx.drawImage(im, im.width * fx - s / 2, im.height * fy - s / 2, s, s, cx - r, cy - r, 2 * r, 2 * r);
    }
  } else {
    ctx.fillStyle = '#C9CEDA'; ctx.fillRect(cx - r, cy - r, 2 * r, 2 * r);
  }
  ctx.restore();
  if (ring && ringW > 0) {
    ctx.save();
    ctx.globalAlpha *= alpha;
    ctx.lineWidth = ringW; ctx.strokeStyle = ring;
    ctx.beginPath(); ctx.arc(cx, cy, r + ringW / 2, 0, Math.PI * 2); ctx.stroke();
    ctx.restore();
  }
}
