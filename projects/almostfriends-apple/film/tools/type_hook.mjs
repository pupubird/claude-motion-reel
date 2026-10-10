// Sets the film's words with real typography (Chrome: HarfBuzz shaping, GPOS kerning)
// and writes them as textures for Blender, plus their metric boxes in metres.
//
//   node projects/almostfriends-apple/film/tools/type_hook.mjs
//
// hook_mask.png  RGB mask of the hook on the frosted pane: R = "How to", G = "make more",
//                B = "friends". It covers HOOK_REGION (metres, pane-local x/z), so the shader
//                maps object coordinates straight onto it.
// type.json      every box in metres, for the camera and the reveal timing.
import { chromium } from 'playwright-core';
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { tmpdir } from 'node:os';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '..');
const out = join(root, 'type', 'hook');
const font = pathToFileURL(resolve(root, '../assets/fonts/InterDisplay-SemiBold.ttf')).href;
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

// The hook sits in a 1.0 m × 0.5 m window of the pane, 6000 px per metre.
const PX_PER_M = 6000;
const HOOK_REGION = { x0: -0.5, x1: 0.5, z0: -0.25, z1: 0.25 };
const HOOK = {
  lines: ['How to', 'make more', 'friends'],
  sizeM: 0.12,        // font size in metres (em)
  leadM: 0.124,       // line pitch in metres
  trackEm: -0.025,    // apple.com-style tightening at display size
  leftM: -0.31        // left edge of the block, pane-local x
};

mkdirSync(out, { recursive: true });

const face = `@font-face{font-family:IDS;src:url('${font}') format('truetype');font-weight:600;}`;

function hookHtml() {
  const W = Math.round((HOOK_REGION.x1 - HOOK_REGION.x0) * PX_PER_M);
  const H = Math.round((HOOK_REGION.z1 - HOOK_REGION.z0) * PX_PER_M);
  const size = HOOK.sizeM * PX_PER_M;
  const lead = HOOK.leadM * PX_PER_M;
  const left = (HOOK.leftM - HOOK_REGION.x0) * PX_PER_M;
  const top = (H - lead * HOOK.lines.length) / 2;
  const colours = ['#ff0000', '#00ff00', '#0000ff'];
  const spans = HOOK.lines.map((t, i) =>
    `<div id="l${i}" style="position:absolute;left:${left}px;top:${top + i * lead}px;height:${lead}px;line-height:${lead}px;color:${colours[i]};white-space:pre">${t}</div>`
  ).join('');
  return { W, H, html: `<!doctype html><html><head><style>${face}
    html,body{margin:0;background:#000;}
    body{width:${W}px;height:${H}px;position:relative;overflow:hidden;
      font-family:IDS;font-weight:600;font-size:${size}px;letter-spacing:${HOOK.trackEm}em;
      font-kerning:normal;text-rendering:geometricPrecision;-webkit-font-smoothing:antialiased;}
    </style></head><body>${spans}</body></html>` };
}

const browser = await chromium.launch({ executablePath: CHROME, headless: true });
const meta = { hookRegion: HOOK_REGION, pxPerM: PX_PER_M, hook: HOOK, lines: [] };

{
  const { W, H, html } = hookHtml();
  const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
  const file = join(tmpdir(), 'af_hook.html');
  writeFileSync(file, html);
  await page.goto(pathToFileURL(file).href);
  await page.evaluate(() => document.fonts.ready);
  for (let i = 0; i < HOOK.lines.length; i++) {
    // Ink box of each line: measure the text run with a Range, in px, then metres.
    const r = await page.evaluate((id) => {
      const el = document.getElementById(id);
      const range = document.createRange();
      range.selectNodeContents(el);
      const b = range.getBoundingClientRect();
      return { x: b.left, y: b.top, w: b.width, h: b.height };
    }, `l${i}`);
    meta.lines.push({
      text: HOOK.lines[i],
      // pane-local metres; z grows upward, so flip y
      x0: HOOK_REGION.x0 + r.x / PX_PER_M,
      x1: HOOK_REGION.x0 + (r.x + r.w) / PX_PER_M,
      z0: HOOK_REGION.z1 - (r.y + r.h) / PX_PER_M,
      z1: HOOK_REGION.z1 - r.y / PX_PER_M
    });
  }
  await page.screenshot({ path: join(out, 'hook_mask.png'), omitBackground: false });
  await page.close();
}

await browser.close();
writeFileSync(join(out, 'type.json'), JSON.stringify(meta, null, 2));
console.log(JSON.stringify(meta, null, 2));
