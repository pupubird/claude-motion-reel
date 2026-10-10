// Kinetic lines: each line set once by Chrome (HarfBuzz, GPOS kerning) in Inter Display, written as one
// texture, plus the box of every character inside it, so Blender can cut the line into per-letter planes
// that animate one by one while keeping perfect spacing.
//
//   node projects/almostfriends-apple/film/tools/type_kinetic.mjs
//
// Words wrapped in *asterisks* take the accent colour. Output: film/type/kg_<key>_NN.png and film/type/kinetic.json
// (per line: image size in metres, and every glyph's box in metres from the image's top-left, with its word index).
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

const INK = '#16171a', ACCENT = '#ff6a2b', WHITE = '#ffffff', GREY = '#6e6e73';
const PX = 5000;   // texture pixels per metre
const L = (text, o = {}) => ({ text, size: 0.09, weight: 700, track: -0.03, lead: 1.0, colour: INK, accent: ACCENT, ...o });
const LINES = {
  matters: L('What *matters*\nto you?', { size: 0.105 }),
  finds: L('AI finds people who\nput *Family first.*', { size: 0.082 }),
  both: L('You both put\n*Family first.*', { size: 0.1 }),
  nonames: L('No names.\nNo photos.\n*Just talk.*', { size: 0.1 }),
  same: L('*SAME!!*', { size: 0.26, track: -0.02 }),
  twoyes: L('It takes\n*two yeses.*', { size: 0.11 }),
  bothin: L('You’re\n*both in!*', { size: 0.12 }),
  endline: L('Know them\nbefore you\n*see them.*', { size: 0.1 }),
  wm: L('almost\nfriends.ai', { size: 0.105, weight: 600, track: -0.035, colour: INK, lines: [GREY, INK] }),
  almost_big: L('almost', { size: 0.16, weight: 600, track: -0.035, colour: GREY }),
  friends_big: L('friends', { size: 0.16, weight: 600, track: -0.035, colour: INK }),
};

const face = `
@font-face{font-family:ID;src:url('${pathToFileURL(join(fonts, 'InterDisplay-SemiBold.ttf')).href}') format('truetype');font-weight:600;}
@font-face{font-family:ID;src:url('${pathToFileURL(join(fonts, 'InterDisplay-Bold.ttf')).href}') format('truetype');font-weight:700;}`;

function lineHtml(s) {
  const em = s.size * PX;
  let wordIdx = 0;
  const rows = s.text.split('\n').map((row, r) => {
    const colour = s.lines ? s.lines[r] : s.colour;
    const parts = row.split(/(\*[^*]+\*)/).filter(Boolean).map(part => {
      const acc = part.startsWith('*');
      const t = acc ? part.slice(1, -1) : part;
      // one span per character so Chrome measures each glyph inside the shaped line
      return [...t].map(ch => {
        if (ch === ' ') { wordIdx++; return `<span class="c" data-w="-1"> </span>`; }
        return `<span class="c" data-w="${wordIdx}" style="color:${acc ? s.accent : colour}">${ch.replace('&', '&amp;').replace('<', '&lt;')}</span>`;
      }).join('');
    }).join('');
    wordIdx++;
    return `<div class="row">${parts}</div>`;
  }).join('');
  return `<!doctype html><html><head><style>${face}
    html,body{margin:0;background:transparent;}
    #t{display:inline-block;padding:${em * 0.24}px ${em * 0.3}px;font-family:ID;font-weight:${s.weight};font-size:${em}px;
      line-height:${s.lead};letter-spacing:${s.track}em;text-align:center;white-space:nowrap;font-kerning:normal;
      font-feature-settings:"kern" 1;text-rendering:geometricPrecision;-webkit-font-smoothing:antialiased;}
    .c{display:inline;}
  </style></head><body><div id="t">${rows}</div></body></html>`;
}

const browser = await chromium.launch({ executablePath: CHROME, headless: true });
const meta = {};
for (const [key, s] of Object.entries(LINES)) {
  const page = await browser.newPage({ viewport: { width: 8000, height: 4000 }, deviceScaleFactor: 1 });
  const file = join(tmpdir(), `af_kinetic_${key}.html`);
  writeFileSync(file, lineHtml(s));
  await page.goto(pathToFileURL(file).href);
  await page.evaluate(() => document.fonts.ready);
  const box = await (await page.$('#t')).boundingBox();
  const glyphs = await page.evaluate(() => {
    const t = document.getElementById('t').getBoundingClientRect();
    return [...document.querySelectorAll('.c')].map((el, i) => {
      const r = el.getBoundingClientRect();
      return { i, ch: el.textContent, w: +el.dataset.w, x: r.left - t.left, y: r.top - t.top, bw: r.width, bh: r.height,
               ax: r.left, ay: r.top };
    }).filter(g => g.ch.trim() !== '');
  });
  // every glyph alone: hide the others, clip a padded box around it (no neighbour can bleed in)
  const em = s.size * PX, pad = em * 0.16;
  const gl = [];
  for (const [n, g] of glyphs.entries()) {
    await page.evaluate((idx) => {
      document.querySelectorAll('.c').forEach((el, j) => { el.style.visibility = (j === idx) ? 'visible' : 'hidden'; });
    }, g.i);
    const clip = { x: g.ax - pad, y: g.ay - pad * 0.4, width: g.bw + 2 * pad, height: g.bh + pad * 0.8 };
    const path = join(out, `kg_${key}_${String(n).padStart(2, '0')}.png`);
    await page.screenshot({ path, clip, omitBackground: true });
    gl.push({ ch: g.ch, word: g.w, file: `kg_${key}_${String(n).padStart(2, '0')}.png`,
              cx: (g.x + g.bw / 2) / PX, cy: (g.y + g.bh / 2) / PX, w: clip.width / PX, h: clip.height / PX });
  }
  await page.close();
  meta[key] = { text: s.text, wM: box.width / PX, hM: box.height / PX, size: s.size, glyphs: gl };
}
await browser.close();
writeFileSync(join(out, 'kinetic.json'), JSON.stringify(meta, null, 1));
for (const [k, v] of Object.entries(meta)) console.log(k.padEnd(12), `${v.wM.toFixed(3)} x ${v.hM.toFixed(3)} m, ${v.glyphs.length} glyphs`);
