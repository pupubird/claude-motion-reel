// Boot: fonts, textures, voice + score metadata → engine → either expose a frame-exact render API (mode=render)
// or play live with the soundtrack.
import { FPS, DURATION, W, H, S } from './config.js';
import { loadFonts } from './fonts.js';
import { loadAssets } from './assets.js';
import { Engine } from './engine.js';

const params = new URLSearchParams(location.search);
const RENDER = params.get('mode') === 'render';
if (RENDER) document.body.classList.add('render');
document.body.style.setProperty('--pw', `${W * S}px`);
document.body.style.setProperty('--ph', `${H * S}px`);

await Promise.all([loadFonts(), loadAssets()]);
// Scenes import after assets so their init() can measure type and build textures.
const SCENES = (params.get('scenes') || 'world,type,kb,link,room,signal,finale,fx').split(',');
const scenes = [];
for (const n of SCENES) {
  const m = await import(`./scenes/${n}.js`).catch((e) => { console.warn(`scene ${n}: ${e.message}`); return null; });
  if (m) scenes.push(m.default);
}
const audio = await import('./audio.js').catch((e) => { console.warn(`audio: ${e.message}`); return null; });
const engine = new Engine(document.getElementById('out'), scenes);

function toB64(bytes) {
  let s = '';
  for (let i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000));
  return btoa(s);
}

window.renderFrame = (frame, samples = 8) => engine.renderFrame(frame, samples);
window.renderAudioWav = async () => {
  const { bytes, peak } = audio.encodeWav(await audio.renderSoundtrack());
  return { b64: toB64(bytes), peak };
};

if (!RENDER) {
  const hint = document.getElementById('hint');
  let buf = null, actx = null, src = null, startAt = 0, pausedAt = Number(params.get('t') || 0), playing = false;
  engine.renderFrameSync(Math.floor(pausedAt * FPS), 1);
  const stop = () => { src?.stop(); src = null; playing = false; };
  async function play() {
    if (!buf && audio) {
      hint.textContent = 'MIXING SOUNDTRACK…';
      buf = await audio.renderSoundtrack();
    }
    actx ??= new AudioContext();
    startAt = actx.currentTime - pausedAt;
    if (buf) {
      src = actx.createBufferSource();
      src.buffer = buf;
      src.connect(actx.destination);
      src.start(0, pausedAt);
    }
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
      else engine.renderFrameSync(Math.floor(t * FPS), 2);
    }
    requestAnimationFrame(loop);
  };
  loop();
}

window.__ready = true;
