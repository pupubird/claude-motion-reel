// Load the Light Table type system from local node_modules (served from the repo root):
// Bricolage Grotesque (display, variable opsz/wght/wdth), Instrument Sans (UI), IBM Plex Mono (data).
// Bricolage also ships as six pinned-width instances (tools/instances.py) because canvas
// font-stretch only accepts keywords, and the VARIANTS card sweeps width continuously.
const FS = '/node_modules/@fontsource';
const FACES = [
  ['Bricolage', `${FS}-variable/bricolage-grotesque/files/bricolage-grotesque-latin-standard-normal.woff2`, { weight: '200 800', stretch: '75% 100%' }],
  ['Instrument Sans', `${FS}-variable/instrument-sans/files/instrument-sans-latin-standard-normal.woff2`, { weight: '400 700', stretch: '75% 100%' }],
  ['IBM Plex Mono', `${FS}/ibm-plex-mono/files/ibm-plex-mono-latin-400-normal.woff2`, { weight: '400' }],
  ['IBM Plex Mono', `${FS}/ibm-plex-mono/files/ibm-plex-mono-latin-500-normal.woff2`, { weight: '500' }],
  ['IBM Plex Mono', `${FS}/ibm-plex-mono/files/ibm-plex-mono-latin-600-normal.woff2`, { weight: '600' }],
  ['IBM Plex Mono', `${FS}/ibm-plex-mono/files/ibm-plex-mono-latin-400-italic.woff2`, { weight: '400', style: 'italic' }],
  ...[75, 80, 85, 90, 95, 100].map((w) => [`BricoW${w}`, `../assets/fonts/brico-w${w}.woff2`, { weight: '200 800' }]),
];

export async function loadFonts() {
  await Promise.all(
    FACES.map(async ([family, url, desc]) => {
      const face = new FontFace(family, `url(${new URL(url, import.meta.url).href})`, desc);
      await face.load();
      document.fonts.add(face);
    }),
  );
  await document.fonts.ready;
}
