// Frame-exact renderer: serves the repo root, drives headless Chrome (GPU) frame by frame,
// pipes PNGs + the mixed WAV into ffmpeg.
//   node projects/novapitch/render.mjs                         full render → projects/novapitch/out/novapitch-film-2026.mp4
//   node projects/novapitch/render.mjs --stills=0,300,600      review stills → projects/novapitch/out/stills/
//   node projects/novapitch/render.mjs --samples=2 --from=0 --to=240 --out=projects/novapitch/out/test.mp4
//   node projects/novapitch/render.mjs --workers=3             split the frame range across 3 Chrome pages
//   node projects/novapitch/render.mjs --scale=2               3840×2160 master (layout is resolution-independent)
//   node projects/novapitch/render.mjs --gpu                   print the WebGL renderer string and exit
//   node projects/novapitch/render.mjs --audio                 mix the soundtrack only → projects/novapitch/out/soundtrack.wav
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { fileURLToPath } from 'node:url';
import { FPS, FRAMES } from './src/config.js';
import { ROOT, serveFilm, launchChrome } from './tools/chrome.mjs';

const args = Object.fromEntries(process.argv.slice(2).map((a) => { const [k, v] = a.replace(/^--/, '').split('='); return [k, v ?? true]; }));
const HERE = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(HERE, 'out');
const SCALE = Number(args.scale ?? 1);
const SAMPLES = Number(args.samples ?? 8);
const from = Number(args.from ?? 0), to = Number(args.to ?? FRAMES);
if (!(from >= 0 && to <= FRAMES && from < to)) throw new Error(`bad frame range --from=${args.from} --to=${args.to} (film is ${FRAMES} frames)`);
const stills = args.stills ? String(args.stills).split(',').map(Number) : null;
const WORKERS = Math.max(1, Number(args.workers ?? 1));
const outFile = path.resolve(ROOT, args.out ?? `projects/novapitch/out/novapitch-film-2026${SCALE > 1 ? `-${1080 * SCALE}p` : ''}.mp4`);

const server = await serveFilm();
const q = { mode: 'render', scale: String(SCALE) };
if (args.scenes) q.scenes = args.scenes;
if (args.stem) q.stem = args.stem;
const url = server.url(q);

const browser = await launchChrome();
let pageErrors = 0;

async function openPage() {
  const page = await browser.newPage({ viewport: { width: 1920 * SCALE, height: 1080 * SCALE }, deviceScaleFactor: 1 });
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
  const dir = path.join(OUT, args.dir ?? 'stills');
  fs.mkdirSync(dir, { recursive: true });
  const { grab, renderAt } = await openPage();
  for (const f of stills) {
    await renderAt(f);
    fs.writeFileSync(path.join(dir, `f${String(f).padStart(4, '0')}.png`), await grab());
  }
  console.log(`wrote ${stills.length} stills → ${path.relative(ROOT, dir)}`);
  await finish();
}

const wavPath = path.join(OUT, 'soundtrack.wav');
if (!args['no-audio']) {
  const { page: first } = await openPage();
  const wav = await first.evaluate(() => window.renderAudioWav());
  const rawPath = path.join(OUT, args.stem ? `stem-${args.stem}.wav` : 'soundtrack-raw.wav');
  fs.writeFileSync(rawPath, Buffer.from(wav.b64, 'base64'));
  if (args.stem) { console.log(`stem → ${path.relative(ROOT, rawPath)}`); await finish(); }
  // two-pass loudness normalisation to −14 LUFS / −1.5 dBTP (linear gain when possible)
  const LN = 'loudnorm=I=-14:TP=-1.5:LRA=11';
  const p1 = spawn('ffmpeg', ['-hide_banner', '-nostats', '-i', rawPath, '-af', `${LN}:print_format=json`, '-f', 'null', '-'], { stdio: ['ignore', 'ignore', 'pipe'] });
  let err = ''; p1.stderr.on('data', (d) => { err += d; });
  await once(p1, 'close');
  const m = JSON.parse(err.slice(err.lastIndexOf('{'), err.lastIndexOf('}') + 1));
  const p2 = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-i', rawPath, '-af',
    `${LN}:measured_I=${m.input_i}:measured_TP=${m.input_tp}:measured_LRA=${m.input_lra}:measured_thresh=${m.input_thresh}:offset=${m.target_offset}:linear=true`,
    '-ar', '48000', '-c:a', 'pcm_s16le', wavPath], { stdio: 'inherit' });
  await once(p2, 'close');
  console.log(`soundtrack → ${path.relative(ROOT, wavPath)} (mix ${m.input_i} LUFS, ${m.input_tp} dBTP → −14 LUFS)`);
  await first.close();
  if (args.audio) await finish();
}

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
    '-c:v', 'ffv1', '-level', '3', '-slices', '16', '-pix_fmt', 'bgr0', s.file], { stdio: ['pipe', 'inherit', 'inherit'] });
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
const withAudio = fs.existsSync(wavPath) && !args['no-audio'];
const enc = spawn('ffmpeg', [
  '-y', '-loglevel', 'error',
  '-f', 'concat', '-safe', '0', '-i', list,
  ...(withAudio ? ['-ss', String(from / FPS), '-i', wavPath, '-map', '0:v', '-map', '1:a'] : []),
  // setparams: ffmpeg 8 takes colour tags from frame metadata, so the output flags alone leave primaries/trc unknown
  '-vf', 'scale=out_color_matrix=bt709:out_range=tv,format=yuv420p,setparams=color_primaries=bt709:color_trc=bt709:colorspace=bt709:range=tv',
  '-c:v', 'libx264', '-preset', 'slow', '-crf', String(args.crf ?? 16), '-profile:v', 'high', '-r', String(FPS),
  '-colorspace', 'bt709', '-color_primaries', 'bt709', '-color_trc', 'bt709', '-color_range', 'tv',
  ...(withAudio ? ['-c:a', 'aac', '-b:a', '320k', '-shortest'] : []), '-movflags', '+faststart', outFile,
], { stdio: ['ignore', 'inherit', 'inherit'] });
const [code] = await once(enc, 'close');
for (const s of slices) fs.rmSync(s.file, { force: true });
fs.rmSync(list, { force: true });
console.log(code === 0 ? `video → ${path.relative(ROOT, outFile)} in ${((Date.now() - t0) / 1000).toFixed(0)}s` : `ffmpeg exited ${code}`);
await finish(code);
