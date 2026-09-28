import { loadIcons } from './ui/icons.js';

// Images and metadata the scenes need at init: the eight Luminex slides (the product's own fictional showroom
// deck, rasterised at 2560×1440), the demo company mark and founder avatar, and the voice line's timings.
const base = new URL('../assets/', import.meta.url);

export const SLIDES = [];
export const IMG = {};
export const VO = {};
export const MUSIC = { kicks: [] };   // measured low-band hits of the score (tools: kick map), seconds

function img(src) {
  return new Promise((res, rej) => {
    const im = new Image();
    im.onload = () => im.decode().then(() => res(im), () => res(im));
    im.onerror = () => rej(new Error(`image ${src}`));
    im.src = src;
  });
}

export async function loadAssets() {
  const slides = await Promise.all([1, 2, 3, 4, 5, 6, 7, 8].map((i) => img(new URL(`slides/s-${i}.png`, base).href)));
  SLIDES.push(...slides);
  IMG.luminex = await img(new URL('brand/luminex-mark.svg', base).href);
  IMG.maya = await img(new URL('brand/maya-chen.svg', base).href);
  const meta = await (await fetch(new URL('vo/meta.json', base))).json();
  Object.assign(VO, meta);
  MUSIC.kicks = (await (await fetch(new URL('music/score-kicks.json', base))).json()).kicks;
  await loadIcons();
}
