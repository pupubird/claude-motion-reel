// The cast, shared with the released film (projects/almostfriends/assets/people: casual phone snapshots of ordinary
// people, GPT Image 2 via Higgsfield; face crops measured by its tools/face_crops.py). Nothing is copied: the special
// edition reads the same files. Each photo is cut once into square face tiles (a box-filtered mip chain) so a small
// bubble never samples a 2k photo.
import { S } from './config.js';
const base = '/projects/almostfriends/assets/';
export const IMG = {};
export const PEOPLE = {};
export const LEADS = { you: 'hana', one: 'sofia' };
export const NAMES = { hana: 'Hana, 26', sofia: 'Sofia, 28' };
export const CROWD = [];

export function img(src) {
  return new Promise((res, rej) => {
    const im = new Image();
    im.onload = () => im.decode().then(() => res(im), () => res(im));
    im.onerror = () => rej(new Error(`image ${src}`));
    im.src = src;
  });
}

const TILE_SIZES = [768, 256, 96].map((n) => Math.round(n * S));
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
    src = c; sx = 0; sy = 0; ss = n;
    return c;
  });
}

export async function loadAssets() {
  const crops = await fetch(`${base}people/crops.json`).then((r) => r.json());
  const leads = Object.values(LEADS);
  for (const [k, v] of Object.entries(crops)) { PEOPLE[k] = v; if (!leads.includes(k)) CROWD.push(k); }
  for (const k of leads) if (!PEOPLE[k]) throw new Error(`assets: lead "${k}" has no face crop`);
  await Promise.all(Object.entries(PEOPLE).map(async ([k, [p]]) => {
    IMG[k] = await img(`${base}${p}`);
    tiles(k);
  }));
}

// Person `key` as a circular photo centred at (cx, cy), radius r, cropped round the face
export function drawPhoto(ctx, key, cx, cy, r, { alpha = 1, clip = true } = {}) {
  if (r < 1 || alpha <= 0.002) return;
  const ts = TILES[key];
  const tile = ts.slice().reverse().find((c) => c.width >= 2 * r * S) || ts[0];
  ctx.save();
  ctx.globalAlpha *= alpha;
  if (clip) { ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.clip(); }
  ctx.drawImage(tile, cx - r, cy - r, 2 * r, 2 * r);
  ctx.restore();
}
