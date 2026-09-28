// Boot: fonts, icons, creative → engine → either expose a frame-exact render API (mode=render) or play live.
import { FPS, DURATION } from './config.js';
import { loadFonts } from './fonts.js';
import { loadIcons } from './icons.js';
import { loadAssets } from './assets.js';
import { Engine } from './engine.js';
import fx from './fx.js';

const RENDER = new URLSearchParams(location.search).get('mode') === 'render';
if (RENDER) document.body.classList.add('render');

await Promise.all([loadFonts(), loadIcons(), loadAssets()]);
// Scenes import after assets so their init() can build atlases from loaded creative.
const SCENES = ['table', 'query', 'grid', 'detail', 'signals', 'zero', 'board', 'aperture', 'finale'];
const scenes = await Promise.all(SCENES.map(async (n) => (await import(`./scenes/${n}.js`)).default));
const audio = await import('./audio.js').catch(() => null);
const engine = new Engine(document.getElementById('out'), [...scenes, fx]);

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
  let buf = null, actx = null, src = null, startAt = 0, pausedAt = 0, playing = false;
  engine.renderFrame(0, 1);
  const stop = () => { src?.stop(); src = null; playing = false; };
  async function play() {
    if (!buf && audio) {
      hint.textContent = 'SYNTHESISING SOUNDTRACK…';
      buf = await audio.renderSoundtrack();
    }
    actx ??= new AudioContext();
    startAt = actx.currentTime - pausedAt;
    if (buf) {
      let peak = 0;
      for (let c = 0; c < buf.numberOfChannels; c++) for (const v of buf.getChannelData(c)) peak = Math.max(peak, Math.abs(v));
      const g = actx.createGain();
      g.gain.value = 0.8 / (peak || 1);
      src = actx.createBufferSource();
      src.buffer = buf;
      src.connect(g).connect(actx.destination);
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
      else engine.renderFrame(Math.floor(t * FPS), 2);
    }
    requestAnimationFrame(loop);
  };
  loop();
}

window.__ready = true;
