// ms per sub-frame at chosen times (GPU synced), e.g. node projects/almostfriends-special/tools/bench.mjs 0s,10s,30s [--film=lookdev]
import { serveFilm, launchChrome } from './chrome.mjs';
import { FPS } from '../src/config.js';
const args = process.argv.slice(2);
const film = args.find((a) => a.startsWith('--film='))?.slice(7);
const times = (args.find((a) => !a.startsWith('--')) || '0s').split(',').map((s) => Math.round(parseFloat(s) * (s.endsWith('s') ? FPS : 1)));
const server = await serveFilm();
const browser = await launchChrome();
const page = await browser.newPage({ viewport: { width: 1080, height: 1920 } });
page.on('pageerror', (e) => console.error('[pageerror]', e.message));
await page.goto(server.url({ mode: 'render', scale: '1', ...(film ? { film } : {}) }));
await page.waitForFunction(() => window.__ready === true, null, { timeout: 300000 });
await page.evaluate(() => window.bench(0, 2, 1));
for (const f of times) console.log(`${(f / FPS).toFixed(2)} s: ${(await page.evaluate(([f]) => window.bench(f, 8, 4), [f])).toFixed(1)} ms per sub-frame`);
await browser.close(); server.close();
