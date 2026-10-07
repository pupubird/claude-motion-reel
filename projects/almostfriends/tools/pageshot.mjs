// Screenshot an HTML page at desktop (1280) and phone (400) widths, full page, and report horizontal overflow.
//   node projects/<film>/tools/pageshot.mjs /abs/page.html /abs/out-prefix
import { chromium } from 'playwright-core';
const [file, out] = process.argv.slice(2);
const b = await chromium.launch({ channel: 'chrome', headless: true });
for (const [w, name] of [[1280, 'desk'], [400, 'phone']]) {
  const p = await b.newPage({ viewport: { width: w, height: 900 }, deviceScaleFactor: 1 });
  await p.goto('file://' + file);
  await p.waitForTimeout(2500);
  const sw = await p.evaluate(() => [document.documentElement.scrollWidth, innerWidth]);
  console.log(name, 'scrollWidth', sw);
  await p.screenshot({ path: `${out}-${name}.png`, fullPage: true });
}
await b.close();
