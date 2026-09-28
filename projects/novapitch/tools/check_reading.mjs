// Reading-time gate, measured from the renderer itself: every string drawn on every other frame is logged with how
// visible it was (src/type.js drawLine, src/ui/kit.js text). A string counts as readable while it is ≥ 90 % opaque
// and still (≤ 2 px of motion). Each one needs
//     0.5 s to find it (a saccade ≈ 0.2 s + a first fixation ≈ 0.25 s; Rayner 1998)
//   + 0.375 s a word (160 wpm, the slow end of the BBC's 160–180 wpm for text over moving pictures).
//   node projects/novapitch/tools/check_reading.mjs            → one row per finished string + READING GATE PASS/FAIL
import { FPS, FRAMES, BEAT } from '../src/config.js';
import { serveFilm, launchChrome } from './chrome.mjs';

const FIND = 0.5, PER_WORD = 0.375, STEP = 2;
// UI state labels change with the state they report; they are not copy to be read
const STATES = new Set(['ready', 'typing…', 'speaking…']);
const server = await serveFilm();
const browser = await launchChrome();
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
page.on('pageerror', (e) => { console.error('[pageerror]', e.message); process.exitCode = 1; });
await page.goto(server.url({ mode: 'render', textlog: '1' }));
await page.waitForFunction(() => window.__ready === true, null, { timeout: 180000 });
const fade0 = await page.evaluate(async () => (await import('./src/score.js')).SIGN.fade0);
const endF = Math.round(fade0 * BEAT * FPS);            // the end fade takes everything; stop counting there

const seen = new Map();                                 // string → { first, frames: [] }
for (let f = 0; f < FRAMES; f += STEP) {
  const log = await page.evaluate((f) => window.textLogFrame(f), f);
  for (const { s, a, dy } of log) {
    const k = s.trim();
    if (!k || !/[A-Za-z0-9]/.test(k)) continue;
    if (!seen.has(k)) seen.set(k, { first: f, frames: new Set() });
    if (a >= 0.9 && dy <= 2 && f < endF) seen.get(k).frames.add(f);
  }
}
await browser.close();
server.close();

const longestRun = (set) => {
  const fr = [...set].sort((x, y) => x - y);
  let best = 0, start = fr[0], prev = fr[0];
  for (const f of fr.slice(1).concat([Infinity])) {
    if (f - prev > STEP * 2) { best = Math.max(best, prev - start + STEP); start = f; }
    prev = f;
  }
  return best / FPS;
};
// typing and count-ups draw every intermediate string: keep only finished ones (not a prefix of a longer string,
// and for numbers, the longest-lived value of each shape)
const keys = [...seen.keys()];
const shape = (k) => k.replace(/\d+/g, '#');
const rows = keys
  .filter((k) => !keys.some((o) => o !== k && o.startsWith(k)))
  .map((k) => ({ k, first: seen.get(k).first / FPS, hold: seen.get(k).frames.size ? longestRun(seen.get(k).frames) : 0 }))
  .filter((r) => !STATES.has(r.k))
  .filter((r) => !/\d/.test(r.k) || r.hold >= 0.25)            // a count-up's passing values are animation, not text
  .filter((r, _, all) => !/\d/.test(r.k) || r.hold >= Math.max(...all.filter((o) => shape(o.k) === shape(r.k)).map((o) => o.hold)))
  .map((r) => {
    const words = r.k.split(/\s+/).filter((w) => /[A-Za-z0-9]/.test(w)).length;
    return { ...r, words, need: FIND + PER_WORD * words };
  })
  .sort((a, b) => a.first - b.first);

let fails = 0;
console.log('   at     hold    need   words   text');
for (const r of rows) {
  const ok = r.hold + 1e-6 >= r.need;
  if (!ok) fails++;
  console.log(`${r.first.toFixed(2).padStart(6)}s  ${r.hold.toFixed(2).padStart(5)}s  ${r.need.toFixed(2).padStart(5)}s  ${String(r.words).padStart(4)}   ${ok ? '  ' : '✗ '}${r.k.length > 70 ? r.k.slice(0, 67) + '…' : r.k}`);
}
console.log(`READING GATE ${fails ? `FAIL (${fails} of ${rows.length} strings under 0.5 s + 0.375 s/word)` : `PASS (${rows.length} strings)`}`);
