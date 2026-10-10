// The film's static words (the tags, the days, the messages, the names), set by Chrome (HarfBuzz shaping, GPOS kerning) in Inter Display and
// written as textures for Blender, with their metrics in metres.
//
//   node projects/almostfriends-apple/film/tools/type_film.mjs
//
// One face, sentence case. Each entry: text, weight (Medium 500 / SemiBold 600), size in metres
// (the em), tracking (em), colour, and the texture density. Multi-line entries use '\n' and a
// line pitch. Output: film/type/<key>.png (+ alpha) and film/type/type.json.
import { chromium } from 'playwright-core';
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { tmpdir } from 'node:os';

const here = dirname(fileURLToPath(import.meta.url));
const film = resolve(here, '..');
const out = join(film, 'type');
const fonts = resolve(film, '../assets/fonts');
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
mkdirSync(out, { recursive: true });

const INK = '#1d1d1f', GREY = '#6e6e73', WHITE = '#ffffff';
// size: em in metres; px: texture pixels per metre
const T = (text, o = {}) => ({ text, weight: 600, size: 0.06, track: -0.022, colour: WHITE, px: 6000, lead: 1.12, align: 'center', ...o });
const SPEC = {
  // act B: the tags on the dial
  pill_family: T('Family', { size: 0.034, colour: INK }),
  pill_career: T('Career', { size: 0.034, colour: INK }),
  pill_health: T('Health', { size: 0.034, colour: INK }),
  pill_adventure: T('Adventure', { size: 0.034, colour: INK }),
  pill_learning: T('Learning', { size: 0.034, colour: INK }),
  pill_money: T('Money', { size: 0.034, colour: INK }),
  // act D: three days
  day1: T('Day 1', { size: 0.05, colour: WHITE, weight: 600 }),
  day2: T('Day 2', { size: 0.05, colour: WHITE, weight: 600 }),
  day3: T('Day 3', { size: 0.05, colour: WHITE, weight: 600 }),
  msg1: T('Sunday lunch with my\nfamily is sacred.', { size: 0.034, colour: INK, weight: 500, align: 'left', lead: 1.18 }),
  msg2: T('Same. Mine starts\nwith a long walk.', { size: 0.034, colour: INK, weight: 500, align: 'left', lead: 1.18 }),
  msg3: T('Feels like I’ve known\nyou for years.', { size: 0.034, colour: INK, weight: 500, align: 'left', lead: 1.18 }),
  // act F: the names
  sofia: T('Sofia, 28', { size: 0.042, colour: WHITE, weight: 600 }),
  hana: T('Hana, 26', { size: 0.042, colour: WHITE, weight: 600 })
};

const face = `
@font-face{font-family:ID;src:url('${pathToFileURL(join(fonts, 'InterDisplay-Medium.ttf')).href}') format('truetype');font-weight:500;}
@font-face{font-family:ID;src:url('${pathToFileURL(join(fonts, 'InterDisplay-SemiBold.ttf')).href}') format('truetype');font-weight:600;}`;

const browser = await chromium.launch({ executablePath: CHROME, headless: true });
const meta = {};
for (const [key, s] of Object.entries(SPEC)) {
  const em = s.size * s.px;
  const lines = s.text.split('\n').map(l => l.replace(/&/g, '&amp;').replace(/</g, '&lt;')).join('<br>');
  const html = `<!doctype html><html><head><style>${face}
    html,body{margin:0;background:transparent;}
    #t{display:inline-block;padding:${em * 0.22}px ${em * 0.26}px;font-family:ID;font-weight:${s.weight};
      font-size:${em}px;line-height:${s.lead};letter-spacing:${s.track}em;color:${s.colour};text-align:${s.align};
      white-space:nowrap;font-kerning:normal;font-feature-settings:"kern" 1;text-rendering:geometricPrecision;
      -webkit-font-smoothing:antialiased;}
  </style></head><body><span id="t">${lines}</span></body></html>`;
  const file = join(tmpdir(), `af_type_${key}.html`);
  writeFileSync(file, html);
  const page = await browser.newPage({ viewport: { width: 8000, height: 3000 }, deviceScaleFactor: 1 });
  await page.goto(pathToFileURL(file).href);
  await page.evaluate(() => document.fonts.ready);
  const el = await page.$('#t');
  const box = await el.boundingBox();
  await el.screenshot({ path: join(out, `${key}.png`), omitBackground: true });
  await page.close();
  meta[key] = { text: s.text, wM: box.width / s.px, hM: box.height / s.px, px: s.px, colour: s.colour, lines: s.text.split('\n').length };
}
await browser.close();
writeFileSync(join(out, 'type.json'), JSON.stringify(meta, null, 1));
for (const [k, v] of Object.entries(meta)) console.log(k.padEnd(14), `${v.wM.toFixed(3)} x ${v.hM.toFixed(3)} m`);
