// The Zemyth type system, loaded from assets/fonts (copied from the client's ZEMITH_Font_Family
// and the Inter variable font): Refinery 95 Bold (display), Blender Pro (labels), Inter (secondary).
const FACES = [
  ['Refinery 95', '../assets/fonts/refinery-95-bold.ttf', { weight: '700' }],
  ['Blender Pro', '../assets/fonts/BlenderPro-Bold.ttf', { weight: '700' }],
  ['Blender Pro', '../assets/fonts/BlenderPro-Book.ttf', { weight: '400' }],
  ['Inter', '../assets/fonts/inter-opsz.woff2', { weight: '100 900' }],
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
