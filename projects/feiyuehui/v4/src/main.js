// Boot: shots → engine → either a frame-exact render API (mode=render) or live playback with the mix.
//   ?shots=heavens,craft  only those shots     ?t=12.5   start time     ?samples=2   live sub-samples
import { FPS, DURATION, W, H, S } from './config.js';
import { Engine } from './engine.js';

const params = new URLSearchParams(location.search);
const RENDER = params.get('mode') === 'render';
if (RENDER) document.body.classList.add('render');
document.body.style.setProperty('--pw', `${W * S}px`);
document.body.style.setProperty('--ph', `${H * S}px`);
const hint = document.getElementById('hint');

const ALL = ['heavens', 'craft', 'collection'];
const names = (params.get('shots') || ALL.join(',')).split(',');
const shots = [];
for (const n of names) {
  const m = await import(`./shots/${n}.js`).catch((e) => { console.warn(`shot ${n}: ${e.message}`); return null; });
  if (m) shots.push(...(Array.isArray(m.default) ? m.default : [m.default]));
}
const engine = new Engine(document.getElementById('out'), shots);
engine.matte = params.get('matte') === '1';   // type/logo matte pass (see Engine.matteSwap)
engine.notext = params.get('notext') === '1'; // clean plate: type/logo hidden (see Engine.hideType)
engine.clay = params.get('clay') === '1';     // clay blockout for a generative re-render (see Engine.claySwap)
await engine.init((i, n, id) => { hint.textContent = `LOADING ${i}/${n} · ${id}`; });

window.renderFrame = (frame, samples = 8) => engine.renderFrame(frame, samples);
window.__engine = engine;

if (!RENDER) {
  const samples = Number(params.get('samples') || 1);
  let pausedAt = Number(params.get('t') || 0), playing = false, actx = null, src = null, buf = null, startAt = 0;
  engine.renderFrameSync(Math.floor(pausedAt * FPS), samples);
  hint.textContent = 'CLICK TO PLAY · SPACE TO PAUSE';
  const stop = () => { src?.stop(); src = null; playing = false; };
  async function play() {
    actx ??= new AudioContext();
    if (!buf) {
      const r = await fetch('../audio/mix.wav').catch(() => null);
      if (r?.ok) buf = await actx.decodeAudioData(await r.arrayBuffer());
    }
    startAt = actx.currentTime - pausedAt;
    if (buf) { src = actx.createBufferSource(); src.buffer = buf; src.connect(actx.destination); src.start(0, pausedAt); }
    playing = true;
    hint.style.opacity = 0;
  }
  const toggle = () => {
    if (playing) { pausedAt = actx.currentTime - startAt; stop(); hint.style.opacity = 0.7; hint.textContent = 'PAUSED'; }
    else play();
  };
  addEventListener('click', toggle);
  addEventListener('keydown', (e) => { if (e.code === 'Space') { e.preventDefault(); toggle(); } });
  const loop = () => {
    if (playing) {
      const t = actx.currentTime - startAt;
      if (t >= DURATION) { stop(); pausedAt = 0; hint.style.opacity = 0.7; hint.textContent = 'CLICK TO REPLAY'; }
      else engine.renderFrameSync(Math.floor(t * FPS), samples);
    }
    requestAnimationFrame(loop);
  };
  loop();
}

window.__ready = true;
