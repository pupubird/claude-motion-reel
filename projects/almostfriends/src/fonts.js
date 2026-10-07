// Open-licensed fonts from node_modules (Fontsource, SIL OFL). Variable faces load as single files; subset faces
// (Noto Color Emoji: 11 unicode-range files) are registered from their CSS, so every emoji the chat uses
// comes from the OFL font and never from the system's licensed emoji.
const NM = '/node_modules';
const FACES = [
  ['Figtree', `${NM}/@fontsource-variable/figtree/files/figtree-latin-wght-normal.woff2`, { weight: '300 900' }],
  // the "standard" file carries all three axes: opsz 12–96, wght 200–800, wdth 75–100
  ['Bricolage Grotesque', `${NM}/@fontsource-variable/bricolage-grotesque/files/bricolage-grotesque-latin-standard-normal.woff2`, { weight: '200 800', stretch: '75% 100%' }],
];
// Noto Color Emoji, the COLRv1 build Google Fonts serves to Chrome (Fontsource's build is OpenType-SVG, which Chrome
// does not draw: every emoji came out blank). Subsets + CSS fetched once into assets/fonts (SIL OFL 1.1).
const CSS_FACES = [new URL('../assets/fonts/noto-emoji.css', import.meta.url).href];

async function cssFaces(url) {
  const css = await (await fetch(url)).text();
  const dir = url.slice(0, url.lastIndexOf('/') + 1);
  const faces = [];
  for (const block of css.match(/@font-face\s*{[^}]*}/g) || []) {
    const family = /font-family:\s*'([^']+)'/.exec(block)[1];
    const src = /url\(\.\/([^)]+\.woff2)\)/.exec(block)[1];
    const range = /unicode-range:\s*([^;]+);/.exec(block)?.[1];
    const weight = /font-weight:\s*(\d+)/.exec(block)?.[1] || '400';
    faces.push(new FontFace(family, `url(${dir}${src})`, { weight, ...(range ? { unicodeRange: range } : {}) }));
  }
  return faces;
}

export async function loadFonts() {
  const faces = FACES.map(([family, url, desc]) => new FontFace(family, `url(${url})`, desc));
  for (const u of CSS_FACES) faces.push(...await cssFaces(u));
  await Promise.all(faces.map(async (f) => { await f.load(); document.fonts.add(f); }));
  await document.fonts.ready;
}
