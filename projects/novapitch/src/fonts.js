// The product's type pair, as variable fonts from node_modules (OFL): Plus Jakarta Sans (display) and Inter (UI).
const NM = '/node_modules/@fontsource-variable';
const FACES = [
  ['Plus Jakarta Sans', `${NM}/plus-jakarta-sans/files/plus-jakarta-sans-latin-wght-normal.woff2`, { weight: '200 800' }],
  ['Inter', `${NM}/inter/files/inter-latin-wght-normal.woff2`, { weight: '100 900' }],
  // the share URL is set in a mono, like the product's Links page
  ['JetBrains Mono', '/node_modules/@fontsource/jetbrains-mono/files/jetbrains-mono-latin-500-normal.woff2', { weight: '500' }],
];

export async function loadFonts() {
  await Promise.all(FACES.map(async ([family, url, desc]) => {
    const face = new FontFace(family, `url(${url})`, desc);
    await face.load();
    document.fonts.add(face);
  }));
  await document.fonts.ready;
}
