// Boot: fonts → engine → either expose a frame-exact render API (mode=render) or play live.
import { FPS, DURATION } from './config.js';
import { loadFonts } from './fonts.js';
import { Engine } from './engine.js';
import world from './scenes/world.js';
import liquid from './scenes/liquid.js';
import type from './scenes/type.js';
import easing from './scenes/easing.js';
import montage from './scenes/montage.js';
import signature from './scenes/signature.js';
import fx from './fx.js';
import { renderSoundtrack, encodeWav } from './audio.js';

const RENDER = new URLSearchParams(location.search).get('mode') === 'render';
if (RENDER) document.body.classList.add('render');

await loadFonts();
const engine = new Engine(document.getElementById('out'), [world, liquid, type, easing, montage, signature, fx]);

function toB64(bytes) {
  let s = '';
  for (let i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000));
  return btoa(s);
}

window.renderFrame = (frame, samples = 8) => engine.renderFrame(frame, samples);
window.renderAudioWav = async () => {
  const { bytes, peak } = encodeWav(await renderSoundtrack());
  return { b64: toB64(bytes), peak };
};

if (!RENDER) {
  const hint = document.getElementById('hint');
  let buf = null, actx = null, src = null, startAt = 0, pausedAt = 0, playing = false;
  engine.renderFrame(0, 1);
  const stop = () => { src?.stop(); src = null; playing = false; };
  async function play() {
    if (!buf) {
      hint.textContent = 'SYNTHESISING SOUNDTRACK…';
      buf = await renderSoundtrack();
    }
    actx ??= new AudioContext();
    let peak = 0;
    for (let c = 0; c < buf.numberOfChannels; c++) for (const v of buf.getChannelData(c)) peak = Math.max(peak, Math.abs(v));
    const g = actx.createGain();
    g.gain.value = 0.89 / (peak || 1);
    src = actx.createBufferSource();
    src.buffer = buf;
    src.connect(g).connect(actx.destination);
    startAt = actx.currentTime - pausedAt;
    src.start(0, pausedAt);
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
