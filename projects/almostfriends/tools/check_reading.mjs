// Reading-time check, measured from the renderer: every string drawn on every other frame is logged with how visible
// it was (src/type.js drawLine, src/ui/kit.js text). A string counts as readable while it is ≥ 90 % opaque and still
// (≤ 2 px of motion). The guide is
//     0.5 s to find it (a saccade ≈ 0.2 s + a first fixation ≈ 0.25 s; Rayner 1998)
//   + 0.375 s a word (160 wpm, the slow end of the BBC's 160–180 wpm for text over moving pictures).
// The owner's rule (reel 05): reading time is flexible — a known line, a label, or a phrase that completes one already
// on screen can be quicker. So this is advisory: it flags strings held for under 80 % of the guide.
//   node projects/<film>/tools/check_reading.mjs [--from=0 --to=3600]
import { FPS, FRAMES, W, H } from '../src/config.js';
import { serveFilm, launchChrome } from './chrome.mjs';

const args = Object.fromEntries(process.argv.slice(2).map((a) => { const s = a.replace(/^--/, ''); const i = s.indexOf('='); return i < 0 ? [s, true] : [s.slice(0, i), s.slice(i + 1)]; }));
const FIND = 0.5, PER_WORD = 0.375, STEP = 2, FLAG = 0.8;
const from = Number(args.from ?? 0), to = Number(args.to ?? FRAMES);
const server = await serveFilm();
const browser = await launchChrome();
const page = await browser.newPage({ viewport: { width: W, height: H } });
page.on('pageerror', (e) => { console.error('[pageerror]', e.message); process.exitCode = 1; });
await page.goto(server.url({ mode: 'render', textlog: '1' }));
await page.waitForFunction(() => window.__ready === true, null, { timeout: 300000 });

const seen = new Map();                                 // string → { first, frames }
for (let f = from; f < to; f += STEP) {
  const log = await page.evaluate((f) => window.textLogFrame(f), f);
  for (const { s, a, dy } of log) {
    const k = s.trim();
    if (!k || !/[\p{L}\p{N}]/u.test(k)) continue;
    if (!seen.has(k)) seen.set(k, { first: f, frames: new Set() });
    if (a >= 0.9 && dy <= 2) seen.get(k).frames.add(f);
  }
}
await browser.close();
server.close();

const longestRun = (set) => {
  const fr = [...set].sort((x, y) => x - y);
  if (!fr.length) return 0;
  let best = 0, start = fr[0], prev = fr[0];
  for (const f of fr.slice(1).concat([Infinity])) {
    if (f - prev > STEP * 2) { best = Math.max(best, prev - start + STEP); start = f; }
    prev = f;
  }
  return best / FPS;
};
// typing draws every intermediate string: drop the ones a longer string replaced (a prefix of it that is gone once
// it appears). A prefix that stays on screen beside the longer string is its own text and is checked ("Day 3" next
// to "Day 3 of 3 · anonymous" used to be dropped).
const keys = [...seen.keys()];
const last = (k) => Math.max(...seen.get(k).frames);
const replaced = (k) => keys.some((o) => o !== k && o.startsWith(k) && seen.get(o).first >= seen.get(k).first && last(k) <= seen.get(o).first + STEP * 2);
const rows = keys
  .filter((k) => !replaced(k))
  .map((k) => {
    const words = k.split(/\s+/).filter((w) => /[\p{L}\p{N}]/u.test(w)).length;
    return { k, first: seen.get(k).first / FPS, hold: longestRun(seen.get(k).frames), words, need: FIND + PER_WORD * words };
  })
  .sort((a, b) => a.first - b.first);

let flags = 0;
console.log('   at     hold    guide  ratio  text');
for (const r of rows) {
  const ratio = r.hold / r.need;
  const low = ratio < FLAG;
  if (low) flags++;
  console.log(`${r.first.toFixed(2).padStart(6)}s  ${r.hold.toFixed(2).padStart(5)}s  ${r.need.toFixed(2).padStart(5)}s  ${ratio.toFixed(2).padStart(5)}  ${low ? '⚑ ' : '  '}${r.k.length > 64 ? r.k.slice(0, 61) + '…' : r.k}`);
}
console.log(`READING (advisory): ${rows.length} strings · ${flags} under ${Math.round(FLAG * 100)} % of the guide`);
