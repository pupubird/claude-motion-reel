// Print a GLB's node tree with world-space sizes (mm): node tools/inspect.mjs jewellery_ring,seal
import { serveFilm, launchChrome } from './chrome.mjs';
const server = await serveFilm();
const browser = await launchChrome();
const page = await browser.newPage();
page.on('pageerror', (e) => console.error('[pageerror]', e.message));
await page.goto(server.url({}).replace('index.html', 'tools/inspect.html').replace(/\?.*$/, '') + '?m=' + encodeURIComponent(process.argv[2]));
await page.waitForFunction(() => window.__ready === true, null, { timeout: 120000 });
const out = await page.evaluate(() => window.__out);
for (const [n, rows] of Object.entries(out)) {
  console.log(`== ${n}`);
  for (const r of rows) {
    const extras = r.extras ? ' extras=' + JSON.stringify(r.extras).slice(0, 160) : '';
    console.log(`${r.type.padEnd(14)} ${String(r.name).padEnd(22)} mat=${r.mat ?? '-'} size=${r.size_mm} c=${r.center_mm} pos=${r.pos} rot=${r.rot} s=${r.scale} v=${r.verts ?? ''}${r.inst ? ' inst=' + r.inst : ''} ${r.attrs ? r.attrs.join('|') : ''}${extras}`);
  }
}
await browser.close(); server.close();
