// Frame-exact renderer: serves the project, drives headless Chrome (GPU) frame by frame,
// pipes PNGs + the synthesised WAV into ffmpeg.
//   node projects/claude-reel/render.mjs                         full 900-frame render → projects/claude-reel/out/claude-motion-reel-2026.mp4
//   node projects/claude-reel/render.mjs --stills=0,300,600      review stills → projects/claude-reel/out/stills/
//   node projects/claude-reel/render.mjs --samples=2 --from=0 --to=240 --out=out/test.mp4
import { chromium } from 'playwright-core';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { fileURLToPath } from 'node:url';

const args = Object.fromEntries(process.argv.slice(2).map((a) => { const [k, v] = a.replace(/^--/, '').split('='); return [k, v ?? true]; }));
const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '../..');              // repo root: node_modules is shared
const OUT = path.join(HERE, 'out');
const FPS = 60, FRAMES = 900;
const SAMPLES = Number(args.samples ?? 8);
const from = Number(args.from ?? 0), to = Number(args.to ?? FRAMES);
const stills = args.stills ? String(args.stills).split(',').map(Number) : null;
const outFile = path.resolve(ROOT, args.out ?? 'projects/claude-reel/out/claude-motion-reel-2026.mp4');

const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.json': 'application/json', '.woff2': 'font/woff2', '.woff': 'font/woff', '.css': 'text/css' };
const server = http.createServer((req, res) => {
  const p = path.join(ROOT, decodeURIComponent(new URL(req.url, 'http://x').pathname));
  if (!p.startsWith(ROOT) || !fs.existsSync(p) || fs.statSync(p).isDirectory()) { res.writeHead(404); res.end(); return; }
  res.writeHead(200, { 'Content-Type': TYPES[path.extname(p)] || 'application/octet-stream' });
  fs.createReadStream(p).pipe(res);
});
await new Promise((r) => server.listen(0, '127.0.0.1', r));
const url = `http://127.0.0.1:${server.address().port}/projects/claude-reel/index.html?mode=render`;

const browser = await chromium.launch({
  channel: 'chrome',
  headless: true,
  args: ['--use-angle=metal', '--enable-gpu', '--ignore-gpu-blocklist', '--disable-background-timer-throttling', '--disable-renderer-backgrounding'],
});
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
let pageErrors = 0;
page.on('console', (m) => { if (m.type() === 'error' || m.type() === 'warning') console.log(`[page:${m.type()}]`, m.text()); });
page.on('pageerror', (e) => { pageErrors++; console.error('[pageerror]', e.message); });
await page.goto(url);
await page.waitForFunction(() => window.__ready === true, null, { timeout: 120000 });
const renderAt = (f) => page.evaluate(([f, s]) => window.renderFrame(f, s), [f, SAMPLES]);
// CDP capture with fast (still lossless) PNG encoding is ~5x quicker than page.screenshot.
const cdp = await page.context().newCDPSession(page);
const grab = async () => Buffer.from((await cdp.send('Page.captureScreenshot', { format: 'png', optimizeForSpeed: true })).data, 'base64');
fs.mkdirSync(OUT, { recursive: true });

async function finish(code = 0) {
  await browser.close();
  server.close();
  process.exit(pageErrors ? 1 : code);
}

if (stills) {
  const dir = path.join(OUT, 'stills');
  fs.mkdirSync(dir, { recursive: true });
  for (const f of stills) {
    await renderAt(f);
    fs.writeFileSync(path.join(dir, `f${String(f).padStart(4, '0')}.png`), await grab());
  }
  console.log(`wrote ${stills.length} stills → ${path.relative(ROOT, dir)}`);
  await finish();
}

const wav = await page.evaluate(() => window.renderAudioWav());
const wavPath = path.join(OUT, 'soundtrack.wav');
fs.writeFileSync(wavPath, Buffer.from(wav.b64, 'base64'));
console.log(`soundtrack → ${path.relative(ROOT, wavPath)} (raw peak ${wav.peak.toFixed(3)}, normalised to -1 dBFS)`);

const ff = spawn('ffmpeg', [
  '-y', '-loglevel', 'error',
  '-f', 'image2pipe', '-framerate', String(FPS), '-i', '-',
  '-ss', String(from / FPS), '-i', wavPath,
  '-map', '0:v', '-map', '1:a',
  '-vf', 'scale=out_color_matrix=bt709:out_range=tv,format=yuv420p',
  '-c:v', 'libx264', '-preset', 'slow', '-crf', '17', '-profile:v', 'high',
  '-colorspace', 'bt709', '-color_primaries', 'bt709', '-color_trc', 'bt709', '-color_range', 'tv',
  '-c:a', 'aac', '-b:a', '320k', '-shortest', '-movflags', '+faststart', outFile,
], { stdio: ['pipe', 'inherit', 'inherit'] });

const t0 = Date.now();
for (let f = from; f < to; f++) {
  await renderAt(f);
  const png = await grab();
  if (!ff.stdin.write(png)) await once(ff.stdin, 'drain');
  if ((f - from) % 60 === 0) {
    const done = f - from + 1, rate = done / ((Date.now() - t0) / 1000);
    console.log(`frame ${f}/${to - 1} · ${rate.toFixed(1)} fps · eta ${((to - f) / rate).toFixed(0)}s`);
  }
}
ff.stdin.end();
const [code] = await once(ff, 'close');
console.log(code === 0 ? `video → ${path.relative(ROOT, outFile)}` : `ffmpeg exited ${code}`);
await finish(code);
