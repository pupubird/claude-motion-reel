// Open the film in headless Chrome and print every console message / page error for N seconds:
//   node tools/debug.mjs heavens [seconds]
import { serveFilm, launchChrome } from './chrome.mjs';
const server = await serveFilm();
const browser = await launchChrome();
const page = await browser.newPage({ viewport: { width: 960, height: 540 } });
page.on('console', (m) => console.log(`[${m.type()}]`, m.text().slice(0, 400)));
page.on('pageerror', (e) => console.log('[pageerror]', e.message, e.stack?.split('\n').slice(0, 4).join(' | ')));
page.on('requestfailed', (r) => console.log('[requestfailed]', r.url()));
page.on('response', (r) => { if (r.status() >= 400) console.log(`[${r.status()}]`, r.url()); });
await page.goto(server.url({ mode: 'render', shots: process.argv[2] || 'heavens' }));
const secs = Number(process.argv[3] || 40);
const t0 = Date.now();
while (Date.now() - t0 < secs * 1000) {
  const ready = await page.evaluate(() => window.__ready === true).catch(() => false);
  if (ready) { console.log('READY after', ((Date.now() - t0) / 1000).toFixed(1), 's'); break; }
  await new Promise((r) => setTimeout(r, 500));
}
console.log('hint:', await page.evaluate(() => document.getElementById('hint')?.textContent));
await browser.close(); server.close();
