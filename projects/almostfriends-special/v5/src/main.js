// Boot: fonts and the cast → the film → the engine → a frame-exact render API (mode=render) or live playback.
import { FPS, DURATION, W, H, S, BEAT } from './config.js';
import { loadFonts } from './fonts.js';
import { loadAssets } from './assets.js';
import { Engine } from './engine.js';
import { loadIcons } from './ui/icons.js';

const params = new URLSearchParams(location.search);
const RENDER = params.get('mode') === 'render';
if (RENDER) document.body.classList.add('render');
document.body.style.setProperty('--pw', `${Math.round(W * S)}px`);
document.body.style.setProperty('--ph', `${Math.round(H * S)}px`);

await Promise.all([loadFonts(), loadAssets(), loadIcons()]);
const { film } = await import(params.get('film') === 'lookdev' ? './lookdev.js' : './film.js');
const engine = new Engine(document.getElementById('out'), film);

window.renderFrame = (frame, samples = 8) => engine.renderFrame(frame, samples);
window.filmEvents = () => film.events?.() ?? [];
// reading-time audit: every string drawn on a frame, with how visible it was (tools/check_reading.mjs)
if (params.has('textlog')) {
  window.textLogFrame = (frame) => { globalThis.__textlog = []; engine.renderFrameSync(frame, 1); const log = globalThis.__textlog; globalThis.__textlog = null; return log; };
}
// ms per sub-frame over n frames from `from` (GPU synced), for tuning
window.bench = (from = 0, n = 10, samples = 4) => {
  const gl = engine.renderer.getContext();
  const px = new Uint8Array(4);
  const sync = () => gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, px);   // a readback waits for the GPU
  sync();
  const t0 = performance.now(); let subs = 0;
  for (let f = from; f < from + n; f++) { subs += engine.renderFrameSync(f, samples); sync(); }
  return (performance.now() - t0) / subs;
};

if (!RENDER) {
  const hint = document.getElementById('hint');
  const audioUrl = params.get('wav');
  let buf = null, actx = null, src = null, startAt = 0, pausedAt = Number(params.get('t') || 0), playing = false;
  const show = (t) => engine.renderFrameSync(Math.min(Math.floor(t * FPS), Math.round(DURATION * FPS) - 1), Number(params.get('samples') || 1));
  show(pausedAt);
  const stop = () => { src?.stop(); src = null; playing = false; };
  async function play() {
    actx ??= new AudioContext();
    if (audioUrl && !buf) buf = await actx.decodeAudioData(await (await fetch(audioUrl)).arrayBuffer());
    startAt = actx.currentTime - pausedAt;
    if (buf) { src = actx.createBufferSource(); src.buffer = buf; src.connect(actx.destination); src.start(0, pausedAt); }
    playing = true; hint.style.opacity = 0;
  }
  const toggle = () => {
    if (playing) { pausedAt = actx.currentTime - startAt; stop(); hint.style.opacity = 0.7; hint.textContent = `PAUSED ${pausedAt.toFixed(2)} s`; }
    else play();
  };
  addEventListener('click', toggle);
  addEventListener('keydown', (e) => {
    if (e.code === 'Space') { e.preventDefault(); toggle(); }
    if (!playing && (e.code === 'ArrowRight' || e.code === 'ArrowLeft')) {
      pausedAt = Math.max(0, Math.min(DURATION - 1 / FPS, pausedAt + (e.code === 'ArrowRight' ? 1 : -1) * (e.shiftKey ? 1 / FPS : BEAT)));
      show(pausedAt); hint.style.opacity = 0.7; hint.textContent = `${pausedAt.toFixed(3)} s`;
    }
  });
  const loop = () => {
    if (playing) {
      const t = actx.currentTime - startAt;
      if (t >= DURATION) { stop(); pausedAt = 0; hint.style.opacity = 0.7; hint.textContent = 'CLICK TO REPLAY'; } else show(t);
    }
    requestAnimationFrame(loop);
  };
  loop();
}
window.__ready = true;
