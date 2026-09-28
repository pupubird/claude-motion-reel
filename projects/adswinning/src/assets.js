// Ad creative: AI-generated stills for fictional brands (assets/ads, see README), with the
// evidence the product would attach to each. Nothing here describes a real advertiser.
import { clamp } from './util.js';

// Keyword searched on screen: "cold brew coffee". Ranked order = strength (longevity-led, like the product).
// spend/reach are ranges or null ("Not disclosed"); days, variants numbers or null; ranked = TikTok Top Ad.
export const ADS = [
  { id: 'northpour-lake', brand: 'Northpour', platform: 'meta', ar: 4 / 5, days: 94, reach: [1.2e6, 1.4e6], spend: null, variants: 6, ranked: false, domain: 'northpour.co', copy: 'Fuel for the early ones. 140mg natural caffeine, nothing else.' },
  { id: 'brewbird-car', brand: 'Brewbird', platform: 'tiktok', ar: 9 / 16, days: 71, reach: [3.1e6, 3.6e6], spend: [8e3, 1e4], variants: 4, ranked: true, domain: 'brewbird.com', copy: 'POV: the cold brew that doesn’t crash you.' },
  { id: 'loopday-splash', brand: 'Loopday', platform: 'meta', ar: 4 / 5, days: 63, reach: [4.2e5, 5e5], spend: null, variants: 9, ranked: false, domain: 'loopday.co', copy: 'Oat. Cold. Brewed. Smooth energy, real ingredients.' },
  { id: 'kiln-pour', brand: 'Kiln & Co.', platform: 'meta', ar: 4 / 5, days: 58, reach: [2.6e5, 3e5], spend: null, variants: 3, ranked: false, domain: 'kilnandco.com', copy: 'Steeped 20 hours. Worth every one.' },
  { id: 'northpour-camp', brand: 'Northpour', platform: 'tiktok', ar: 9 / 16, days: 52, reach: [1.9e6, 2.2e6], spend: null, variants: 5, ranked: true, domain: 'northpour.co', copy: '3 reasons I switched from energy drinks.' },
  { id: 'brewbird-hero', brand: 'Brewbird', platform: 'meta', ar: 4 / 5, days: 47, reach: [6.5e5, 8e5], spend: null, variants: 7, ranked: false, domain: 'brewbird.com', copy: 'Zero sugar. All the buzz. Shop the 12-pack.' },
  { id: 'loopday-quote', brand: 'Loopday', platform: 'meta', ar: 4 / 5, days: 41, reach: null, spend: null, variants: 2, ranked: false, domain: 'loopday.co', copy: '“Better than my café order.” — Maya R.' },
  { id: 'kiln-founder', brand: 'Kiln & Co.', platform: 'meta', ar: 4 / 5, days: 38, reach: [1.1e5, 1.3e5], spend: null, variants: 2, ranked: false, domain: 'kilnandco.com', copy: 'We brewed 400 batches to get this right.' },
  { id: 'northpour-vs', brand: 'Northpour', platform: 'meta', ar: 4 / 5, days: 33, reach: [2.1e5, 2.5e5], spend: null, variants: 4, ranked: false, domain: 'northpour.co', copy: 'Northpour vs. energy drinks.' },
  { id: 'brewbird-desk', brand: 'Brewbird', platform: 'tiktok', ar: 9 / 16, days: 29, reach: [9e5, 1.1e6], spend: null, variants: 3, ranked: false, domain: 'brewbird.com', copy: 'day 30 of replacing my latte' },
  { id: 'loopday-gym', brand: 'Loopday', platform: 'tiktok', ar: 9 / 16, days: 24, reach: [4e5, 5e5], spend: null, variants: 2, ranked: false, domain: 'loopday.co', copy: 'my 6am non-negotiable' },
  { id: 'brewbird-unbox', brand: 'Brewbird', platform: 'meta', ar: 4 / 5, days: 19, reach: null, spend: null, variants: 1, ranked: false, domain: 'brewbird.com', copy: 'Your first 12-pack ships free.' },
  { id: 'kiln-tower', brand: 'Kiln & Co.', platform: 'meta', ar: 4 / 5, days: 16, reach: [4e4, 5e4], spend: null, variants: 1, ranked: false, domain: 'kilnandco.com', copy: 'Slow is the secret.' },
  { id: 'brewbird-vanilla', brand: 'Brewbird', platform: 'meta', ar: 4 / 5, days: 11, reach: null, spend: null, variants: 2, ranked: false, domain: 'brewbird.com', copy: 'NEW: Vanilla Oat. Limited drop.' },
  { id: 'kiln-offer', brand: 'Kiln & Co.', platform: 'meta', ar: 1, days: 8, reach: null, spend: null, variants: 1, ranked: false, domain: 'kilnandco.com', copy: '30% off your first box.' },
  { id: 'loopday-minimal', brand: 'Loopday', platform: 'meta', ar: 1, days: 5, reach: null, spend: null, variants: 1, ranked: false, domain: 'loopday.co', copy: 'Morning, sorted.' },
];
export const AD = Object.fromEntries(ADS.map((a) => [a.id, a]));

// Unrelated advertisers for the wall of public ads (assets/ads/wall-*.jpg).
export const WALL = [
  'dewlab', 'strideform', 'hushwave', 'vitapeak', 'barkly', 'cloudrest', 'solstice', 'emberly', 'crunchfuel',
  'tideflask', 'formline', 'lustra', 'knifecraft', 'voya', 'pulseband', 'chompeas', 'freshcrate', 'lingoleap',
  'stackwise', 'brightbrush', 'potted', 'rivetco', 'stillleaf', 'nestling', 'voltride', 'aurelle', 'driftmask',
  'tiletycoon', 'cleanpit', 'snapmini', 'vinera', 'postura', 'sunveil', 'barebar', 'beatloop', 'sugolina',
].map((b) => `wall-${b}`);

/* ----------------------------------------------------------------- signals */
// Fill 0–1 per slot, mirroring server/src/contracts/adStrength.ts (log-scaled ranges, longevity-led).
const norm = (x, a, b) => clamp((x - a) / (b - a));
const mid = (r) => (r[0] + r[1]) / 2;
export const SLOTS = ['SPEND', 'REACH', 'DAYS', 'VARIANTS', 'RANKED'];
export function slots(ad) {
  return [
    ad.spend ? { present: true, fill: norm(Math.log10(mid(ad.spend)), 2, 6) } : { present: false },
    ad.reach ? { present: true, fill: norm(Math.log10(mid(ad.reach)), 3, 7) } : { present: false },
    ad.days != null ? { present: true, fill: norm(Math.log(1 + ad.days), 0, Math.log(1 + 120)) } : { present: false },
    ad.variants != null ? { present: true, fill: norm(ad.variants, 1, 12) } : { present: false },
    ad.ranked ? { present: true, fill: 1 } : { present: false },
  ];
}
export const strength = (ad) => (ad.days == null ? 0.25 : norm(Math.log(1 + ad.days), 0, Math.log(1 + 120)));

const compact = (n) => (n >= 1e6 ? `${(n / 1e6).toFixed(1).replace(/\.0$/, '')}M` : n >= 1e3 ? `${Math.round(n / 1e3)}K` : String(n));
export function readout(ad) {
  return [
    ['SPEND', ad.spend ? `$${compact(ad.spend[0])}–$${compact(ad.spend[1])}` : null],
    [ad.platform === 'meta' ? 'EU REACH' : 'REACH', ad.reach ? `${compact(ad.reach[0])}–${compact(ad.reach[1])}` : null],
    ['DAYS', ad.days != null ? `${ad.days}` : null],
    ['VARIANTS', ad.variants != null ? `${ad.variants}` : null],
    ['RANKED', ad.ranked ? 'Top Ad' : null],
  ];
}

/* ------------------------------------------------------------------ images */
const IMG = {};

async function loadOne(id) {
  const blob = await (await fetch(new URL(`../assets/ads/${id}.jpg`, import.meta.url))).blob();
  const full = await createImageBitmap(blob);
  // A small mip ladder so thumbnails are downsampled with a proper filter, not bilinear from 1800 px.
  const ladder = [full];
  for (let w = full.width / 2; w >= 96; w /= 2) {
    ladder.push(await createImageBitmap(blob, { resizeWidth: Math.round(w), resizeHeight: Math.round((w * full.height) / full.width), resizeQuality: 'high' }));
  }
  IMG[id] = ladder;
}

export async function loadAssets() {
  const ids = [...ADS.map((a) => a.id), ...WALL];
  await Promise.all(ids.map((id) => loadOne(id).catch(() => { IMG[id] = null; })));
  const missing = ids.filter((id) => !IMG[id]);
  if (missing.length) console.warn(`missing creative: ${missing.join(', ')}`);
}

export const hasImg = (id) => !!IMG[id];

// Best bitmap for a target on-screen width (smallest ladder rung that is still ≥ 1.3× the target).
export function img(id, targetW = 1e9) {
  const L = IMG[id];
  if (!L) return null;
  let pick = L[0];
  for (const b of L) if (b.width >= targetW * 1.3) pick = b;
  return pick;
}

// Draw `id` into a rect with object-fit: cover (optionally zoomed about its centre).
export function drawCover(ctx, id, x, y, w, h, zoom = 1, fx = 0.5, fy = 0.5) {
  const b = img(id, w * zoom);
  if (!b) { ctx.fillStyle = '#142428'; ctx.fillRect(x, y, w, h); return; }
  const s = Math.max(w / b.width, h / b.height) * zoom;
  const dw = b.width * s, dh = b.height * s;
  ctx.drawImage(b, x + (w - dw) * fx, y + (h - dh) * fy, dw, dh);
}

// Texture atlas of creatives cropped to one aspect, with edge padding against mip bleed.
export function buildAtlas(ids, { cellW = 384, cellH = 480, pad = 8, cols = 10 } = {}) {
  const rows = Math.ceil(ids.length / cols);
  const canvas = document.createElement('canvas');
  canvas.width = cols * cellW;
  canvas.height = rows * cellH;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#142428';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  const rects = [];
  ids.forEach((id, i) => {
    const cx = (i % cols) * cellW, cy = Math.floor(i / cols) * cellH;
    // bleed: draw slightly larger into the padding, then the exact cell inside it
    ctx.save();
    ctx.beginPath();
    ctx.rect(cx, cy, cellW, cellH);
    ctx.clip();
    drawCover(ctx, id, cx, cy, cellW, cellH);
    ctx.restore();
    const u0 = (cx + pad) / canvas.width, u1 = (cx + cellW - pad) / canvas.width;
    const v0 = 1 - (cy + cellH - pad) / canvas.height, v1 = 1 - (cy + pad) / canvas.height;
    rects.push([u0, v0, u1, v1]);
  });
  return { canvas, rects };
}
