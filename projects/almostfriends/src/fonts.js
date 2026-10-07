// Open-licensed fonts from node_modules (Fontsource, SIL OFL). Variable faces load as single files; subset faces
// (Noto Color Emoji: 11 unicode-range files) are registered from their CSS, so every emoji the chat uses
// comes from the OFL font and never from the system's licensed emoji.
import { LANG, allText } from './copy.js';

const NM = '/node_modules';
const FACES = [
  ['Figtree', `${NM}/@fontsource-variable/figtree/files/figtree-latin-wght-normal.woff2`, { weight: '300 900' }],
  // the "standard" file carries all three axes: opsz 12–96, wght 200–800, wdth 75–100
  ['Bricolage Grotesque', `${NM}/@fontsource-variable/bricolage-grotesque/files/bricolage-grotesque-latin-standard-normal.woff2`, { weight: '200 800', stretch: '75% 100%' }],
];
// Noto Color Emoji, the COLRv1 build Google Fonts serves to Chrome (Fontsource's build is OpenType-SVG, which Chrome
// does not draw: every emoji came out blank). Subsets + CSS fetched once into assets/fonts (SIL OFL 1.1).
const CSS_FACES = [new URL('../assets/fonts/noto-emoji.css', import.meta.url).href];
// Chinese (the zh cut): Noto Sans SC as Fontsource's 101 unicode-range slices. All are registered; only the slices
// holding the cut's own characters (copy.js allText) are fetched, and before the first frame, because a canvas draws
// with whatever is loaded at that moment. A Chinese character no slice covers throws: it would quietly fall back to
// a system font.
const HAN_CSS = `${NM}/@fontsource-variable/noto-sans-sc/index.css`;
const HAN_FAMILY = 'Noto Sans SC Variable';
const HAN_RE = /[\u2E80-\u9FFF\uF900-\uFAFF\uFE30-\uFE4F\uFF00-\uFFEF]/u;

async function cssFaces(url) {
  const css = await (await fetch(url)).text();
  const dir = url.slice(0, url.lastIndexOf('/') + 1);
  const faces = [];
  for (const block of css.match(/@font-face\s*{[^}]*}/g) || []) {
    const family = /font-family:\s*'([^']+)'/.exec(block)[1];
    const src = /url\(\.\/([^)]+\.woff2)\)/.exec(block)[1];
    const range = /unicode-range:\s*([^;]+);/.exec(block)?.[1];
    const weight = /font-weight:\s*([\d ]+);/.exec(block)?.[1].trim() || '400';
    faces.push(new FontFace(family, `url(${dir}${src})`, { weight, ...(range ? { unicodeRange: range } : {}) }));
  }
  return faces;
}

const inRanges = (cp, ranges) => ranges.some(([a, b]) => cp >= a && cp <= b);
const parseRange = (s) => s.split(',').map((r) => r.trim().replace(/^U\+/i, '').split('-').map((h) => parseInt(h, 16))).map(([a, b]) => [a, b ?? a]);

async function loadHan() {
  const faces = await cssFaces(HAN_CSS);
  faces.forEach((f) => document.fonts.add(f));
  const text = allText(LANG);
  const ranges = faces.flatMap((f) => parseRange(f.unicodeRange));
  const missing = [...text].filter((ch) => HAN_RE.test(ch) && !inRanges(ch.codePointAt(0), ranges));
  if (missing.length) throw new Error(`fonts: Noto Sans SC has no glyph for ${missing.join(' ')}`);
  await document.fonts.load(`400 100px "${HAN_FAMILY}"`, text);
  if (!document.fonts.check(`400 100px "${HAN_FAMILY}"`, text)) throw new Error('fonts: Noto Sans SC slices did not load');
}

export async function loadFonts() {
  const faces = FACES.map(([family, url, desc]) => new FontFace(family, `url(${url})`, desc));
  for (const u of CSS_FACES) faces.push(...await cssFaces(u));
  await Promise.all(faces.map(async (f) => { await f.load(); document.fonts.add(f); }));
  if (LANG !== 'en') await loadHan();
  await document.fonts.ready;
}
