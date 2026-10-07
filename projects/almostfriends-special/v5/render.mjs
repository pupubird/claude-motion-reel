// Frame-exact renderer: serves the repo root, drives headless Chrome (GPU) frame by frame, pipes PNGs into ffmpeg.
//   node projects/almostfriends-special/render.mjs                                  full render → out/film.mp4
//   node projects/almostfriends-special/render.mjs --stills=0,300,12.5s             review stills (frames, or s) → out/stills/
//   node projects/almostfriends-special/render.mjs --stills=… --dir=x --samples=16 --film=lookdev
//   node projects/almostfriends-special/render.mjs --from=0 --to=480 --samples=2 --scale=0.5 --out=…
//   node projects/almostfriends-special/render.mjs --workers=3 --wav=projects/almostfriends-special/audio/mix.wav
//   node projects/almostfriends-special/render.mjs --scale=2                        2160×3840 master
// --samples is the base sub-frame count; the film scales it per frame (film.samplesAt: holds take fewer, whips more).
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { fileURLToPath } from 'node:url';
import { FPS, FRAMES, W, H } from './src/config.js';
import { ROOT, serveFilm, launchChrome } from './tools/chrome.mjs';

const args = Object.fromEntries(process.argv.slice(2).map((a) => { const s = a.replace(/^--/, ''); const i = s.indexOf('='); return i < 0 ? [s, true] : [s.slice(0, i), s.slice(i + 1)]; }));
const HERE = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(HERE, 'out');
const SCALE = Number(args.scale ?? 1);
const SAMPLES = Number(args.samples ?? 8);
const toFrame = (s) => (String(s).endsWith('s') ? Math.round(parseFloat(s) * FPS) : Number(s));
const from = toFrame(args.from ?? 0), to = toFrame(args.to ?? FRAMES);
if (!(from >= 0 && to <= FRAMES && from < to)) throw new Error(`bad frame range --from=${args.from} --to=${args.to} (film is ${FRAMES} frames)`);
const stills = args.stills ? String(args.stills).split(',').map(toFrame) : null;
if (stills?.some((f) => !(f >= 0 && f < FRAMES))) throw new Error(`bad --stills=${args.stills}`);
const WORKERS = Math.max(1, Number(args.workers ?? 1));
const outFile = path.resolve(ROOT, args.out ?? path.join(path.relative(ROOT, OUT), `film${SCALE > 1 ? `-${Math.round(W * SCALE)}w` : ''}.mp4`));

const server = await serveFilm();
const q = { mode: 'render', scale: String(SCALE) };
if (args.film) q.film = args.film;
const url = server.url(q) + (args.q ? `&${args.q}` : '');
const browser = await launchChrome();
let pageErrors = 0;

async function openPage() {
  const pw = Math.round(W * SCALE), ph = Math.round(H * SCALE);
  const page = await browser.newPage({ viewport: { width: pw, height: ph }, deviceScaleFactor: 1 });
  page.on('console', (m) => { if ((m.type() === 'error' || m.type() === 'warning') && !m.text().startsWith('Failed to load resource')) console.log(`[page:${m.type()}]`, m.text()); });
  page.on('pageerror', (e) => { pageErrors++; console.error('[pageerror]', e.message); });
  page.on('response', (r) => { if (r.status() >= 400 && !r.url().endsWith('favicon.ico')) console.log(`[${r.status()}]`, r.url()); });
  const bootError = new Promise((_, rej) => page.once('pageerror', (e) => rej(new Error(`page failed to boot: ${e.message}`))));
  await page.goto(url);
  await Promise.race([page.waitForFunction(() => window.__ready === true, null, { timeout: 300000, polling: 250 }), bootError]);
  const cdp = await page.context().newCDPSession(page);
  const grab = async () => Buffer.from((await cdp.send('Page.captureScreenshot', { format: 'png', optimizeForSpeed: true })).data, 'base64');
  const renderAt = (f) => page.evaluate(([f, s]) => window.renderFrame(f, s), [f, SAMPLES]);
  return { page, grab, renderAt };
}

async function finish(code = 0) {
  await browser.close();
  server.close();
  process.exit(pageErrors ? 1 : code);
}

fs.mkdirSync(OUT, { recursive: true });

if (stills) {
  const dir = path.join(OUT, args.dir ?? 'stills');
  fs.mkdirSync(dir, { recursive: true });
  const { grab, renderAt } = await openPage();
  const t0 = Date.now();
  let subs = 0;
  for (const f of stills) {
    subs += await renderAt(f);
    fs.writeFileSync(path.join(dir, `f${String(f).padStart(4, '0')}.png`), await grab());
  }
  console.log(`wrote ${stills.length} stills → ${path.relative(ROOT, dir)} (${((Date.now() - t0) / stills.length / 1000).toFixed(2)} s/frame, ${(subs / stills.length).toFixed(1)} sub-frames)`);
  await finish();
}

const slices = [];
const per = Math.ceil((to - from) / WORKERS);
for (let w = 0; w < WORKERS; w++) {
  const a = from + w * per, b = Math.min(to, a + per);
  if (a < b) slices.push({ a, b, file: path.join(OUT, `slice-${process.pid}-${w}.mkv`) });
}
const t0 = Date.now();
let done = 0, subs = 0;
const cleanup = () => { for (const s of slices) fs.rmSync(s.file, { force: true }); };
process.on('uncaughtException', (e) => { cleanup(); console.error(e); process.exit(1); });
process.on('unhandledRejection', (e) => { cleanup(); console.error(e); process.exit(1); });
await Promise.all(slices.map(async (s) => {
  const { grab, renderAt } = await openPage();
  const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(FPS), '-i', '-',
    '-c:v', 'ffv1', '-level', '3', '-slices', '16', '-pix_fmt', 'bgr0', s.file], { stdio: ['pipe', 'inherit', 'inherit'] });
  for (let f = s.a; f < s.b; f++) {
    subs += await renderAt(f);
    const png = await grab();
    if (!ff.stdin.write(png)) await once(ff.stdin, 'drain');
    if (++done % 120 === 0) {
      const rate = done / ((Date.now() - t0) / 1000);
      console.log(`${done}/${to - from} frames · ${rate.toFixed(1)} fps · ${(subs / done).toFixed(1)} sub-frames · eta ${((to - from - done) / rate).toFixed(0)}s`);
    }
  }
  ff.stdin.end();
  const [code] = await once(ff, 'close');
  if (code !== 0) throw new Error(`slice ${s.a}-${s.b} ffmpeg exited ${code}`);
}));

const list = path.join(OUT, `slices-${process.pid}.txt`);
fs.writeFileSync(list, slices.map((s) => `file '${s.file}'`).join('\n'));
const wav = args.wav ? path.resolve(ROOT, args.wav) : null;
if (wav && !fs.existsSync(wav)) throw new Error(`--wav not found: ${wav}`);
fs.mkdirSync(path.dirname(outFile), { recursive: true });
const enc = spawn('ffmpeg', [
  '-y', '-loglevel', 'error',
  '-f', 'concat', '-safe', '0', '-i', list,
  ...(wav ? ['-ss', String(from / FPS), '-i', wav, '-map', '0:v', '-map', '1:a'] : []),
  '-vf', 'scale=out_color_matrix=bt709:out_range=tv,format=yuv420p,setparams=color_primaries=bt709:color_trc=bt709:colorspace=bt709:range=tv',
  '-c:v', 'libx264', '-preset', args.fast ? 'veryfast' : 'slow', '-crf', String(args.crf ?? 16), '-profile:v', 'high', '-r', String(FPS),
  '-colorspace', 'bt709', '-color_primaries', 'bt709', '-color_trc', 'bt709', '-color_range', 'tv',
  ...(wav ? ['-c:a', 'aac', '-b:a', '320k', '-shortest'] : []), '-movflags', '+faststart', outFile,
], { stdio: ['ignore', 'inherit', 'inherit'] });
const [code] = await once(enc, 'close');
for (const s of slices) fs.rmSync(s.file, { force: true });
fs.rmSync(list, { force: true });
console.log(code === 0 ? `video → ${path.relative(ROOT, outFile)} in ${((Date.now() - t0) / 1000).toFixed(0)}s (${(subs / (to - from)).toFixed(1)} sub-frames a frame)` : `ffmpeg exited ${code}`);
await finish(code);
