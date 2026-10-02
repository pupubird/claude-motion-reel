// Frame-exact renderer: serves the repo root, drives headless Chrome (GPU) frame by frame, pipes PNGs into ffmpeg and
// muxes the mix (audio/mix.wav, built by tools/mix.py).
//   node projects/feiyuehui/v4/render.mjs                           full render → out/feiyuehui-v4.mp4
//   node projects/feiyuehui/v4/render.mjs --stills=0,300,600        review stills → out/stills/
//   node projects/feiyuehui/v4/render.mjs --stills=... --shots=moon --dir=lookdev --samples=16
//   node projects/feiyuehui/v4/render.mjs --from=0 --to=480 --samples=4 --scale=0.5 --out=projects/feiyuehui/v4/out/a.mp4
//   node projects/feiyuehui/v4/render.mjs --workers=2               split the range across Chrome pages
//   node projects/feiyuehui/v4/render.mjs --scale=2                 3840×2160 master
//   node projects/feiyuehui/v4/render.mjs --gpu                     print the WebGL renderer string and exit
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { fileURLToPath } from 'node:url';
import { FPS, FRAMES } from './src/config.js';
import { ROOT, serveFilm, launchChrome } from './tools/chrome.mjs';

const args = Object.fromEntries(process.argv.slice(2).map((a) => { const s = a.replace(/^--/, ''); const i = s.indexOf('='); return i < 0 ? [s, true] : [s.slice(0, i), s.slice(i + 1)]; }));
const HERE = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(HERE, 'out');
const SCALE = Number(args.scale ?? 1);
const SAMPLES = Number(args.samples ?? 16);
const from = Number(args.from ?? 0), to = Number(args.to ?? FRAMES);
if (!(from >= 0 && to <= FRAMES && from < to)) throw new Error(`bad frame range --from=${args.from} --to=${args.to} (film is ${FRAMES} frames)`);
const stills = args.stills ? String(args.stills).split(',').map((s) => (s.endsWith('s') ? Math.round(parseFloat(s) * FPS) : Number(s))) : null;
const WORKERS = Math.max(1, Number(args.workers ?? 1));
const outFile = path.resolve(ROOT, args.out ?? `projects/feiyuehui/v4/out/feiyuehui-v4${SCALE > 1 ? `-${1080 * SCALE}p` : ''}.mp4`);

const server = await serveFilm();
const q = { mode: 'render', scale: String(SCALE) };
if (args.shots) q.shots = args.shots;
// --q='lab=jewellery_buddha&bg=black' passes raw query parameters through (look-dev knobs)
const url = server.url(q) + (args.q ? `&${args.q}` : '');
const browser = await launchChrome();
let pageErrors = 0;

async function openPage() {
  const W = Math.round(1920 * SCALE), H = Math.round(1080 * SCALE);
  const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
  page.on('console', (m) => { if ((m.type() === 'error' || m.type() === 'warning') && !m.text().startsWith('Failed to load resource')) console.log(`[page:${m.type()}]`, m.text()); });
  page.on('pageerror', (e) => { pageErrors++; console.error('[pageerror]', e.message); });
  page.on('response', (r) => { if (r.status() >= 400 && !r.url().endsWith('favicon.ico')) console.log(`[${r.status()}]`, r.url()); });
  await page.goto(url);
  await page.waitForFunction(() => window.__ready === true, null, { timeout: 600000, polling: 500 });
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

if (args.gpu) {
  const { page } = await openPage();
  console.log(await page.evaluate(() => {
    const gl = document.createElement('canvas').getContext('webgl2');
    const ext = gl.getExtension('WEBGL_debug_renderer_info');
    return [gl.getParameter(ext.UNMASKED_RENDERER_WEBGL), 'EXT_float_blend:' + !!gl.getExtension('EXT_float_blend'), 'maxSamples:' + gl.getParameter(gl.MAX_SAMPLES)].join(' · ');
  }));
  await finish();
}

fs.mkdirSync(OUT, { recursive: true });

if (stills) {
  const dir = path.join(OUT, args.dir ?? 'stills');
  fs.mkdirSync(dir, { recursive: true });
  const { grab, renderAt } = await openPage();
  const t0 = Date.now();
  for (const f of stills) {
    const t1 = Date.now();
    await renderAt(f);
    fs.writeFileSync(path.join(dir, `f${String(f).padStart(4, '0')}.png`), await grab());
    if (args.verbose) console.log(`f${f} ${(Date.now() - t1)} ms`);
  }
  console.log(`wrote ${stills.length} stills → ${path.relative(ROOT, dir)} (${((Date.now() - t0) / stills.length / 1000).toFixed(2)} s/frame at ${SAMPLES} samples)`);
  await finish();
}

// Each worker renders a contiguous slice to a lossless intermediate; slices are then concatenated and muxed with
// the mix in one final encode.
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
    '-c:v', 'ffv1', '-level', '3', '-slices', '16', '-pix_fmt', 'bgr0', s.file], { stdio: ['pipe', 'inherit', 'inherit'] });
  for (let f = s.a; f < s.b; f++) {
    await renderAt(f);
    const png = await grab();
    if (!ff.stdin.write(png)) await once(ff.stdin, 'drain');
    if (++done % 30 === 0) {
      const rate = done / ((Date.now() - t0) / 1000);
      console.log(`${done}/${to - from} frames · ${rate.toFixed(2)} fps · eta ${((to - from - done) / rate / 60).toFixed(1)} min`);
    }
  }
  ff.stdin.end();
  const [code] = await once(ff, 'close');
  if (code !== 0) throw new Error(`slice ${s.a}-${s.b} ffmpeg exited ${code}`);
}));

const list = path.join(OUT, 'slices.txt');
fs.writeFileSync(list, slices.map((s) => `file '${s.file}'`).join('\n'));
const wavPath = path.join(HERE, 'audio', 'mix.wav');
const withAudio = fs.existsSync(wavPath) && !args['no-audio'];
const enc = spawn('ffmpeg', [
  '-y', '-loglevel', 'error',
  '-f', 'concat', '-safe', '0', '-i', list,
  ...(withAudio ? ['-ss', String(from / FPS), '-i', wavPath, '-map', '0:v', '-map', '1:a'] : []),
  '-vf', 'scale=out_color_matrix=bt709:out_range=tv,format=yuv420p,setparams=color_primaries=bt709:color_trc=bt709:colorspace=bt709:range=tv',
  '-c:v', 'libx264', '-preset', 'slow', '-crf', String(args.crf ?? 14), '-profile:v', 'high', '-r', String(FPS),
  '-colorspace', 'bt709', '-color_primaries', 'bt709', '-color_trc', 'bt709', '-color_range', 'tv',
  ...(withAudio ? ['-c:a', 'aac', '-b:a', '320k', '-shortest'] : []), '-movflags', '+faststart', outFile,
], { stdio: ['ignore', 'inherit', 'inherit'] });
const [code] = await once(enc, 'close');
for (const s of slices) fs.rmSync(s.file, { force: true });
fs.rmSync(list, { force: true });
console.log(code === 0 ? `video → ${path.relative(ROOT, outFile)} in ${((Date.now() - t0) / 1000).toFixed(0)}s` : `ffmpeg exited ${code}`);
await finish(code);
