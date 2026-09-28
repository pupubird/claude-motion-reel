// Documentary photos from the Zemyth website (tools/prep_assets.sh) and the voice lines' metadata.
// Everyone shown is a real participant, photographed in the house; nothing here is generated.
export const PHOTOS = {
  // builders at work (Ch 03), portrait crops; fx/fy = focus point for object-fit: cover
  b1: { id: 'focused-coder-with-tshirt-tee', fx: 0.45, fy: 0.5 },
  b2: { id: 'hijabi-listening-to-dream-computer-shirt', fx: 0.72, fy: 0.3 },
  b3: { id: 'two-developers-coding-side-by-side', fx: 0.5, fy: 0.42 },
  b4: { id: 'hands-up-explaining-at-laptop', fx: 0.3, fy: 0.45 },
  b5: { id: 'glasses-guy-working-by-zemyth-banner', fx: 0.5, fy: 0.5 },
  b6: { id: 'three-guys-looking-at-phone', fx: 0.55, fy: 0.4 },
  b7: { id: 'thinking-coder-at-laptop', fx: 0.6, fy: 0.4 },
  b8: { id: 'hoodie-girl-with-juicebox-talking', fx: 0.3, fy: 0.35 },
  b9: { id: 'laptop-chat-by-zemyth-banner', fx: 0.55, fy: 0.45 },
  // cohort portraits (Ch 04–05)
  abel: { id: 'abel-profile', fx: 0.52, fy: 0.35 },
  bede: { id: 'bede-profile', fx: 0.5, fy: 0.3 },
  faris: { id: 'faris-profile', fx: 0.5, fy: 0.35 },
  haniya: { id: 'haniya-profile', fx: 0.55, fy: 0.3 },
  hiro: { id: 'hiro-profile', fx: 0.5, fy: 0.3 },
  sky: { id: 'sky-profile', fx: 0.6, fy: 0.3 },
};

// Hackerhouse 1.0 (KL, May 8–11 2026): six founders, six products, two funded — from the site's copy.
export const COHORT = [
  { key: 'abel', name: 'Abel', project: 'Kira', line: 'Agentic compliance for e-invoicing.', market: 'REGTECH', funded: false },
  { key: 'bede', name: 'Bede', project: 'ThinkOrca', line: 'Predict audience resonance before you publish.', market: 'CONTENT / AI', funded: false },
  { key: 'faris', name: 'Faris', project: 'Afferens', line: 'A sensory perception API for AI agents.', market: 'AGENT INFRA', funded: true },
  { key: 'haniya', name: 'Haniya', project: 'AERA', line: 'Aerial emergency response and alerting.', market: 'EMERGENCY TECH', funded: false },
  { key: 'hiro', name: 'Hiromasa', project: 'Schism', line: 'A Bloomberg terminal in your pocket.', market: 'FINTECH', funded: true },
  { key: 'sky', name: 'Sky', project: 'HiggsPay', line: 'Payment infrastructure for AI agents.', market: 'PAYMENTS', funded: false },
];

const IMG = {};
export let VO = null;   // assets/vo/meta.json: per line { dur, lufs, words: [{w, s, e}], env: [60 Hz] }

async function loadPhoto(k, id) {
  const blob = await (await fetch(new URL(`../assets/img/${id}.jpg`, import.meta.url))).blob();
  const full = await createImageBitmap(blob);
  const ladder = [full];
  for (let w = full.width / 2; w >= 120; w /= 2) {
    ladder.push(await createImageBitmap(blob, { resizeWidth: Math.round(w), resizeHeight: Math.round((w * full.height) / full.width), resizeQuality: 'high' }));
  }
  IMG[k] = ladder;
}

export async function loadAssets() {
  await Promise.all(Object.entries(PHOTOS).map(([k, p]) => loadPhoto(k, p.id)));
  VO = await (await fetch(new URL('../assets/vo/meta.json', import.meta.url))).json();
}

// Smallest ladder rung that is still ≥ 1.25× the target width.
function pick(k, targetW) {
  const L = IMG[k];
  if (!L) return null;
  let b = L[0];
  for (const r of L) if (r.width >= targetW * 1.25) b = r;
  return b;
}

// object-fit: cover around the photo's focus point, with an optional zoom (Ken Burns).
export function drawPhoto(ctx, k, x, y, w, h, zoom = 1, dx = 0, dy = 0) {
  const p = PHOTOS[k];
  const b = pick(k, w * zoom);
  if (!b) { ctx.fillStyle = '#111414'; ctx.fillRect(x, y, w, h); return; }
  const s = Math.max(w / b.width, h / b.height) * zoom;
  const dw = b.width * s, dh = b.height * s;
  // keep the focus point in frame: place it at the rect's matching fraction, clamped to cover
  let ox = x + w * p.fx - dw * p.fx + dx, oy = y + h * p.fy - dh * p.fy + dy;
  ox = Math.min(x, Math.max(x + w - dw, ox));
  oy = Math.min(y, Math.max(y + h - dh, oy));
  ctx.drawImage(b, ox, oy, dw, dh);
}

// Onset (seconds, relative to the line's start) of the i-th spoken word of a voice line.
export const wordAt = (line, i) => VO[line].words[Math.min(i, VO[line].words.length - 1)].s;
export const wordEnd = (line, i) => VO[line].words[Math.min(i, VO[line].words.length - 1)].e;
// 60 Hz loudness envelope of a line at local time lt (0 outside the line).
export function voEnv(line, lt) {
  const e = VO[line].env;
  const f = lt * 60;
  if (f < 0 || f >= e.length - 1) return 0;
  const i = Math.floor(f);
  return e[i] + (e[i + 1] - e[i]) * (f - i);
}
