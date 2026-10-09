// Open the film page headless and print every console message and error for N seconds (boot debugging).
//   node projects/<film>/tools/debug.mjs [seconds] [query]
import { serveFilm, launchChrome } from './chrome.mjs';
const secs = Number(process.argv[2] || 20);
const server = await serveFilm();
const browser = await launchChrome();
const page = await browser.newPage({ viewport: { width: 540, height: 960 } });
page.on('console', (m) => console.log(`[${m.type()}]`, m.text()));
page.on('pageerror', (e) => console.log('[pageerror]', e.message, e.stack?.split('\n').slice(0, 3).join(' | ')));
page.on('requestfailed', (r) => console.log('[requestfailed]', r.url(), r.failure()?.errorText));
page.on('response', (r) => { if (r.status() >= 400) console.log(`[${r.status()}]`, r.url()); });
await page.goto(server.url({ mode: 'render', ...(process.argv[3] ? Object.fromEntries(new URLSearchParams(process.argv[3])) : {}) }));
const t0 = Date.now();
while (Date.now() - t0 < secs * 1000) {
  if (await page.evaluate(() => window.__ready === true)) { console.log(`READY after ${((Date.now() - t0) / 1000).toFixed(1)} s`); break; }
  await new Promise((r) => setTimeout(r, 250));
}
await browser.close();
server.close();
