// Load the three type families from local node_modules (served by the dev/render server).
const FS = '/node_modules/@fontsource';
const FACES = [
  ['Inter Tight', `${FS}-variable/inter-tight/files/inter-tight-latin-wght-normal.woff2`, { weight: '100 900', style: 'normal' }],
  ['Inter Tight', `${FS}-variable/inter-tight/files/inter-tight-latin-wght-italic.woff2`, { weight: '100 900', style: 'italic' }],
  ['Instrument Serif', `${FS}/instrument-serif/files/instrument-serif-latin-400-normal.woff2`, { weight: '400', style: 'normal' }],
  ['Instrument Serif', `${FS}/instrument-serif/files/instrument-serif-latin-400-italic.woff2`, { weight: '400', style: 'italic' }],
  ['JetBrains Mono', `${FS}/jetbrains-mono/files/jetbrains-mono-latin-400-normal.woff2`, { weight: '400', style: 'normal' }],
  ['JetBrains Mono', `${FS}/jetbrains-mono/files/jetbrains-mono-latin-700-normal.woff2`, { weight: '700', style: 'normal' }],
];

export async function loadFonts() {
  await Promise.all(
    FACES.map(async ([family, url, desc]) => {
      const face = new FontFace(family, `url(${url})`, desc);
      await face.load();
      document.fonts.add(face);
    }),
  );
  await document.fonts.ready;
}
