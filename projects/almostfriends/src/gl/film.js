// A macro soap film filling the frame: interference colour from a thickness field that drains and swirls, with a word
// written into it (the word's distance field changes the film's thickness, so the film's own colours draw the letters).
// Lit as the hero bubble is: the film reflects a soft sky and a key window; what's behind it shows through (1 − R).
import * as THREE from 'three';
import { FILM_GLSL } from './filmglsl.js';

const VERT = /* glsl */ `
varying vec2 vUv;
void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`;

const FRAG = /* glsl */ `
uniform float uTime, uBase, uText, uGain, uFlow, uLetterD, uLetterMix, uAspect, uBand, uSwirlAmt, uZoom, uMaskR, uAlpha;
uniform vec2 uMaskC;
uniform sampler2D tText;
uniform vec3 uBgTop, uBgBot, uEnv;
varying vec2 vUv;
${FILM_GLSL}
void main() {
  // the pull-back: the film's pattern shrinks about the centre (uZoom > 1) inside a circle that closes to the bubble
  vec2 sp = vec2((vUv.x - 0.5) * uAspect, vUv.y - 0.5);
  float mask = 1.0 - smoothstep(uMaskR - 0.004, uMaskR + 0.004, length(sp - uMaskC));
  if (mask <= 0.0) discard;
  vec2 uv = (vUv - 0.5) * uZoom + 0.5;
  vec2 p = vec2((uv.x - 0.5) * uAspect, uv.y - 0.5);
  // flow: the film swirls and drains downward; the letters ride the same flow a little so they belong to the film
  vec3 q = vec3(p * 2.2, uTime * 0.07);
  vec2 warp = vec2(fbm(q + vec3(0.0, uTime * 0.05, 1.7)), fbm(q + vec3(4.1, -uTime * 0.04, 0.0))) * 0.06 * uFlow;
  // marbled bands: a domain-warped field (two octaves of warp) gives the fine filaments of a real draining film
  vec2 w1 = vec2(fbm(vec3(p * 2.6, uTime * 0.08)), fbm(vec3(p * 2.6 + 9.2, uTime * 0.08)));
  vec2 w2 = vec2(fbm(vec3(p * 3.4 + w1 * 1.8 + 3.0, uTime * 0.1)), fbm(vec3(p * 3.4 + w1 * 1.8 - 5.0, uTime * 0.1)));
  float swirl = fbm(vec3(p * 2.2 + w2 * uSwirlAmt, uTime * 0.12));
  float drain = mix(0.45, 1.3, smoothstep(0.6, -0.6, p.y));
  float d = uBase * drain + uBand * swirl;
  // the word: its mask (soft distance field) pulls the film toward a set thickness (a distinct interference order)
  float m = texture2D(tText, uv + warp * 0.35).r;
  d = mix(d, uLetterD + 40.0 * swirl, m * uLetterMix);
  d = max(d, 8.0);
  vec3 film = filmRGB(d, 0.96);
  vec3 bg = mix(uBgBot, uBgTop, uv.y);
  // reflection gain is stylised (a real film reflects ≤ 8 %; at macro the eye reads colour, not physics)
  // The film transmits what's behind it (1 − R) and reflects the room in front of it (R). Against a bright window,
  // reflecting a darker room, the film shows its colours as tints and the thinnest film (black film: R → 0) shows
  // the window itself — so letters of black film read as light letters.
  vec3 R = clamp(film * uGain, 0.0, 0.95);
  vec3 env = mix(uEnv, uEnv * 1.6 + 0.05, smoothstep(-0.3, 0.6, p.y));
  vec3 col = bg * (1.0 - R) + env * R;
  gl_FragColor = vec4(col * mask * uAlpha, mask * uAlpha);
}`;

// → { mesh, setText(canvas) }: a plane that fills a perspective camera's view at distance `dist`
export function macroFilm({ camera, dist = 5, word = null } = {}) {
  const h = 2 * dist * Math.tan((camera.fov * Math.PI) / 360);
  const w = h * camera.aspect;
  const tex = new THREE.CanvasTexture(word ?? document.createElement('canvas'));
  tex.colorSpace = THREE.NoColorSpace;
  const mat = new THREE.ShaderMaterial({
    vertexShader: VERT, fragmentShader: FRAG,
    uniforms: {
      uTime: { value: 0 }, uBase: { value: 420 }, uText: { value: 1 }, uGain: { value: 5.5 }, uFlow: { value: 1 },
      uLetterD: { value: 120 }, uLetterMix: { value: 1 }, uAspect: { value: camera.aspect }, tText: { value: tex },
      uBand: { value: 380 }, uSwirlAmt: { value: 1.6 }, uZoom: { value: 1 }, uMaskR: { value: 10 }, uMaskC: { value: new THREE.Vector2() }, uAlpha: { value: 1 },
      uBgTop: { value: new THREE.Color('#DCEFFF').convertSRGBToLinear() }, uBgBot: { value: new THREE.Color('#FFE8DA').convertSRGBToLinear() },
      uEnv: { value: new THREE.Color(1.0, 0.98, 0.96) },
    },
    depthWrite: false, transparent: true,
    blending: THREE.CustomBlending, blendSrc: THREE.OneFactor, blendDst: THREE.OneMinusSrcAlphaFactor,
  });
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat);
  mesh.position.set(0, 0, -dist);
  return { mesh, uniforms: mat.uniforms, tex };
}

// A word as a soft mask: white glyphs on black, blurred so the film's thickness ramps into the letters.
export function wordMask(text, { w = 1080, h = 1920, size = 360, font = '"Bricolage Grotesque"', weight = 800, blur = 18, y = 0.5 } = {}) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#000'; ctx.fillRect(0, 0, w, h);
  ctx.filter = `blur(${blur}px)`;
  ctx.fillStyle = '#fff';
  ctx.font = `${weight} ${size}px ${font}`;
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(text, w / 2, h * y);
  ctx.filter = 'none';
  return c;
}
