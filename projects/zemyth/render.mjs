// Frame-exact renderer: serves the repo root, drives headless Chrome (GPU) frame by frame,
// pipes PNGs + the synthesised WAV into ffmpeg.
//   node projects/zemyth/render.mjs                          full 1800-frame render → projects/zemyth/out/zemyth-reel-2026.mp4
//   node projects/zemyth/render.mjs --stills=0,300,600       review stills → projects/zemyth/out/stills/
//   node projects/zemyth/render.mjs --samples=2 --from=0 --to=240 --out=projects/zemyth/out/test.mp4
//   node projects/zemyth/render.mjs --workers=3              split the frame range across 3 Chrome pages
//   node projects/zemyth/render.mjs --gpu                    print the WebGL renderer string and exit
//   node projects/zemyth/render.mjs --audio                  synthesise the soundtrack only → projects/zemyth/out/soundtrack.wav
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
const FPS = 60, FRAMES = 1800;
const SAMPLES = Number(args.samples ?? 8);
const from = Number(args.from ?? 0), to = Number(args.to ?? FRAMES);
const stills = args.stills ? String(args.stills).split(',').map(Number) : null;
const WORKERS = Math.max(1, Number(args.workers ?? 1));
const outFile = path.resolve(ROOT, args.out ?? 'projects/zemyth/out/zemyth-reel-2026.mp4');

const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.json': 'application/json', '.woff2': 'font/woff2', '.woff': 'font/woff', '.css': 'text/css', '.jpg': 'image/jpeg', '.png': 'image/png', '.ttf': 'font/ttf', '.mp3': 'audio/mpeg' };
const server = http.createServer((req, res) => {
  const p = path.join(ROOT, decodeURIComponent(new URL(req.url, 'http://x').pathname));
  if (!p.startsWith(ROOT) || !fs.existsSync(p) || fs.statSync(p).isDirectory()) { res.writeHead(404); res.end(); return; }
  res.writeHead(200, { 'Content-Type': TYPES[path.extname(p)] || 'application/octet-stream' });
  fs.createReadStream(p).pipe(res);
});
await new Promise((r) => server.listen(0, '127.0.0.1', r));
const url = `http://127.0.0.1:${server.address().port}/projects/zemyth/index.html?mode=render${args.scenes ? `&scenes=${args.scenes}` : ''}`;

const browser = await chromium.launch({
  channel: 'chrome',
  headless: true,
  args: ['--use-angle=metal', '--enable-gpu', '--ignore-gpu-blocklist', '--disable-background-timer-throttling', '--disable-renderer-backgrounding'],
});
let pageErrors = 0;

async function openPage() {
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
  page.on('console', (m) => { if ((m.type() === 'error' || m.type() === 'warning') && !m.text().startsWith('Failed to load resource')) console.log(`[page:${m.type()}]`, m.text()); });
  page.on('pageerror', (e) => { pageErrors++; console.error('[pageerror]', e.message); });
  page.on('response', (r) => { if (r.status() >= 400 && !r.url().endsWith('favicon.ico')) console.log(`[${r.status()}]`, r.url()); });
  await page.goto(url);
  await page.waitForFunction(() => window.__ready === true, null, { timeout: 180000 });
  const cdp = await page.context().newCDPSession(page);
  // CDP capture with fast (still lossless) PNG encoding is ~5x quicker than page.screenshot.
  const grab = async () => Buffer.from((await cdp.send('Page.captureScreenshot', { format: 'png', optimizeForSpeed: true })).data, 'base64');
  const renderAt = (f) => page.evaluate(([f, s]) => window.renderFrame(f, s), [f, SAMPLES]);
  return { page, grab, renderAt };
}

async function finish(code = 0) {
  await browser.close();
  server.close();
  process.exit(pageErrors ? 1 : code);
}

if (args.gpu) {
  const { page } = await openPage();
  console.log(await page.evaluate(() => {
    const gl = document.createElement('canvas').getContext('webgl2');
    const ext = gl.getExtension('WEBGL_debug_renderer_info');
    return gl.getParameter(ext.UNMASKED_RENDERER_WEBGL);
  }));
  await finish();
}

fs.mkdirSync(OUT, { recursive: true });

if (stills) {
  const dir = path.join(OUT, 'stills');
  fs.mkdirSync(dir, { recursive: true });
  const { grab, renderAt } = await openPage();
  for (const f of stills) {
    await renderAt(f);
    fs.writeFileSync(path.join(dir, `f${String(f).padStart(4, '0')}.png`), await grab());
  }
  console.log(`wrote ${stills.length} stills → ${path.relative(ROOT, dir)}`);
  await finish();
}

const { page: first } = await openPage();
const wav = await first.evaluate(() => window.renderAudioWav());
const wavPath = path.join(OUT, 'soundtrack.wav');
fs.writeFileSync(wavPath, Buffer.from(wav.b64, 'base64'));
console.log(`soundtrack → ${path.relative(ROOT, wavPath)} (raw peak ${wav.peak.toFixed(3)}, normalised to −1.9 dBFS sample peak)`);
await first.close();
if (args.audio) await finish();

// Each worker renders a contiguous slice to a lossless intermediate; slices are then concatenated
// and muxed with the soundtrack in one final encode.
const slices = [];
const per = Math.ceil((to - from) / WORKERS);
for (let w = 0; w < WORKERS; w++) {
  const a = from + w * per, b = Math.min(to, a + per);
  if (a < b) slices.push({ a, b, file: path.join(OUT, `slice-${w}.mkv`) });
}
const t0 = Date.now();
let done = 0;
await Promise.all(slices.map(async (s) => {
  const { grab, renderAt } = await openPage();
  const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(FPS), '-i', '-',
    '-c:v', 'ffv1', '-level', '3', '-pix_fmt', 'bgr0', s.file], { stdio: ['pipe', 'inherit', 'inherit'] });
  for (let f = s.a; f < s.b; f++) {
    await renderAt(f);
    const png = await grab();
    if (!ff.stdin.write(png)) await once(ff.stdin, 'drain');
    if (++done % 60 === 0) {
      const rate = done / ((Date.now() - t0) / 1000);
      console.log(`${done}/${to - from} frames · ${rate.toFixed(1)} fps · eta ${((to - from - done) / rate).toFixed(0)}s`);
    }
  }
  ff.stdin.end();
  const [code] = await once(ff, 'close');
  if (code !== 0) throw new Error(`slice ${s.a}-${s.b} ffmpeg exited ${code}`);
}));

const list = path.join(OUT, 'slices.txt');
fs.writeFileSync(list, slices.map((s) => `file '${s.file}'`).join('\n'));
const enc = spawn('ffmpeg', [
  '-y', '-loglevel', 'error',
  '-f', 'concat', '-safe', '0', '-i', list,
  '-ss', String(from / FPS), '-i', wavPath,
  '-map', '0:v', '-map', '1:a',
  // setparams: ffmpeg 8 takes colour tags from frame metadata, so the output flags alone leave primaries/trc unknown
  '-vf', 'scale=out_color_matrix=bt709:out_range=tv,format=yuv420p,setparams=color_primaries=bt709:color_trc=bt709:colorspace=bt709:range=tv',
  '-c:v', 'libx264', '-preset', 'slow', '-crf', '16', '-profile:v', 'high', '-r', String(FPS),
  '-colorspace', 'bt709', '-color_primaries', 'bt709', '-color_trc', 'bt709', '-color_range', 'tv',
  '-c:a', 'aac', '-b:a', '320k', '-shortest', '-movflags', '+faststart', outFile,
], { stdio: ['ignore', 'inherit', 'inherit'] });
const [code] = await once(enc, 'close');
for (const s of slices) fs.rmSync(s.file, { force: true });
fs.rmSync(list, { force: true });
console.log(code === 0 ? `video → ${path.relative(ROOT, outFile)} in ${((Date.now() - t0) / 1000).toFixed(0)}s` : `ffmpeg exited ${code}`);
await finish(code);
