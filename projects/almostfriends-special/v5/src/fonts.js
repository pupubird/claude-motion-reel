// Open-licensed fonts from node_modules (Fontsource, SIL OFL), as in the released film: Bricolage Grotesque (all three
// axes), Figtree, and Noto Color Emoji (COLRv1 subsets, registered from the released film's CSS so every emoji comes
// from the OFL font and never from the system's).
const NM = '/node_modules';
const FACES = [
  ['Figtree', `${NM}/@fontsource-variable/figtree/files/figtree-latin-wght-normal.woff2`, { weight: '300 900' }],
  ['Bricolage Grotesque', `${NM}/@fontsource-variable/bricolage-grotesque/files/bricolage-grotesque-latin-standard-normal.woff2`, { weight: '200 800', stretch: '75% 100%' }],
];
const EMOJI_CSS = '/projects/almostfriends/assets/fonts/noto-emoji.css';

async function cssFaces(url) {
  const css = await (await fetch(url)).text();
  const dir = url.slice(0, url.lastIndexOf('/') + 1);
  const faces = [];
  for (const block of css.match(/@font-face\s*{[^}]*}/g) || []) {
    const family = /font-family:\s*'([^']+)'/.exec(block)[1];
    const src = /url\(\.\/([^)]+\.woff2)\)/.exec(block)[1];
    const range = /unicode-range:\s*([^;]+);/.exec(block)?.[1];
    faces.push(new FontFace(family, `url(${dir}${src})`, { weight: '400', ...(range ? { unicodeRange: range } : {}) }));
  }
  return faces;
}

export async function loadFonts() {
  const faces = FACES.map(([family, url, desc]) => new FontFace(family, `url(${url})`, desc));
  faces.push(...await cssFaces(EMOJI_CSS));
  await Promise.all(faces.map(async (f) => { await f.load(); document.fonts.add(f); }));
  await document.fonts.ready;
}
