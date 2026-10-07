// The special edition's frame pipeline, per motion-blur sub-frame:
//   the film's state at t (camera, environment, liquid primitives, 2D layers, lens)
//   → UNDER 2D layer (sky, light, type in the scene, faces) → 3D raster (UNDER as the backdrop, the crowd, the wall
//     of your bubble) → the liquid layer (every bubble and piece of glass, raymarched over it, refracting it) → bloom
//   → OVER 2D layer (UI type on glass, touches) → lens (chromatic aberration, vignette, flash, fade, shake)
//   → accumulated in LINEAR light into a float target (each sub-frame with a sub-pixel jitter) → sRGB + grain + dither.
// Averaging in linear light is what a shutter does: a bright streak keeps its energy instead of greying out.
import * as THREE from 'three';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { W, H, S, FPS } from './config.js';
import { halton, hexRgb } from './util.js';
import { liquidLayer } from './gl/liquid.js';

const PW = Math.round(W * S), PH = Math.round(H * S);

const QUAD_VERT = /* glsl */ `
varying vec2 vUv;
void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }`;

const lin3 = /* glsl */ `vec3 lin(vec3 c) { return mix(c / 12.92, pow((c + 0.055) / 1.055, vec3(2.4)), step(0.04045, c)); }`;

// UNDER as an opaque backdrop in the 3D pass (sRGB canvas → linear by hand), drawn first
const BACKDROP_FRAG = /* glsl */ `
uniform sampler2D tUnder;
uniform vec3 uBg;
varying vec2 vUv;
${lin3}
void main() {
  vec4 u = texture2D(tUnder, vUv);                     // premultiplied sRGB
  vec3 c = u.a > 0.0 ? u.rgb / u.a : vec3(0.0);
  gl_FragColor = vec4(lin(c) * u.a + uBg * (1.0 - u.a), 1.0);
}`;
const BACKDROP_VERT = /* glsl */ `
varying vec2 vUv;
void main() { vUv = uv; gl_Position = vec4(position.xy, 0.9999, 1.0); }`;

const COMPOSITE_FRAG = /* glsl */ `
precision highp float;
uniform sampler2D tBase, tOver;
uniform float uWeight, uExposure, uFlash, uFade, uZoom, uCA, uVig, uKnee;
uniform vec2 uZoomAt, uShake;
uniform vec3 uFlashColor, uFadeColor;
varying vec2 vUv;
${lin3}
vec3 roll(vec3 c) {                                      // highlights roll off above the knee; below it, untouched
  vec3 k = vec3(uKnee);
  return mix(c, k + (1.0 - k) * tanh((c - k) / (1.0 - k)), step(k, c));
}
vec3 baseAt(vec2 uv) { return texture2D(tBase, clamp(uv, vec2(0.0), vec2(1.0))).rgb; }
void main() {
  vec2 uv = (vUv - uZoomAt) / uZoom + uZoomAt + uShake;
  // chromatic aberration: radial, growing to the corners (the lens is pushed on fast moves and hits)
  vec2 dc = uv - 0.5;
  float r2 = dot(dc * vec2(0.5625, 1.0), dc * vec2(0.5625, 1.0));
  vec2 ca = dc * uCA * (0.4 + 2.2 * r2);
  vec3 b = vec3(baseAt(uv - ca).r, baseAt(uv).g, baseAt(uv + ca).b) * uExposure;
  b = roll(max(b, 0.0));
  vec4 o = texture2D(tOver, uv);
  vec3 oc = o.a > 0.0 ? lin(o.rgb / o.a) : vec3(0.0);
  vec3 col = oc * o.a + b * (1.0 - o.a);
  // vignette, in light: the corners lose a little
  float v = 1.0 - uVig * smoothstep(0.15, 0.85, r2 * 2.2);
  col *= v;
  col = mix(col, uFlashColor, clamp(uFlash, 0.0, 1.0));
  col = mix(col, uFadeColor, clamp(uFade, 0.0, 1.0));
  gl_FragColor = vec4(col * uWeight, 1.0);
}`;

const FINAL_FRAG = /* glsl */ `
precision highp float;
uniform sampler2D tAccum;
uniform float uFrame, uGrain;
varying vec2 vUv;
float hash(vec3 p) { p = fract(p * 0.1031); p += dot(p, p.zyx + 31.32); return fract((p.x + p.y) * p.z); }
vec3 srgb(vec3 c) { return mix(c * 12.92, 1.055 * pow(c, vec3(1.0 / 2.4)) - 0.055, step(0.0031308, c)); }
void main() {
  vec3 col = srgb(clamp(texture2D(tAccum, vUv).rgb, 0.0, 1.0));
  float l = dot(col, vec3(0.2126, 0.7152, 0.0722));
  float g = hash(vec3(gl_FragCoord.xy, mod(uFrame, 997.0) * 1.37)) - 0.5;
  col += g * uGrain * (0.35 + 1.6 * l * (1.0 - l));
  col += (hash(vec3(gl_FragCoord.xy * 1.7, uFrame + 3.1)) - hash(vec3(gl_FragCoord.yx * 0.9, uFrame + 7.7))) / 255.0;
  gl_FragColor = vec4(clamp(col, 0.0, 1.0), 1.0);
}`;

function canvas2d() {
  const canvas = document.createElement('canvas');
  canvas.width = PW; canvas.height = PH;
  const ctx = canvas.getContext('2d');
  const tex = new THREE.CanvasTexture(canvas);
  tex.premultiplyAlpha = true;
  tex.generateMipmaps = false;
  tex.minFilter = tex.magFilter = THREE.LinearFilter;
  tex.colorSpace = THREE.NoColorSpace;
  return { canvas, ctx, tex };
}
function quadScene(material) {
  const scene = new THREE.Scene();
  const m = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material);
  m.frustumCulled = false;
  scene.add(m);
  return scene;
}
const u = (v) => ({ value: v });
const linColor = (hex) => { const [r, g, b] = hexRgb(hex); return new THREE.Color(r / 255, g / 255, b / 255).convertSRGBToLinear(); };

export class Engine {
  constructor(canvas, film) {
    const r = (this.renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: false, preserveDrawingBuffer: true, powerPreference: 'high-performance' }));
    r.setPixelRatio(1);
    r.setSize(PW, PH, false);
    r.autoClear = false;
    r.outputColorSpace = THREE.LinearSRGBColorSpace;
    r.toneMapping = THREE.NoToneMapping;
    // a shader that fails to compile must stop the render, not draw a black layer (a struct ternary did, silently)
    r.debug.onShaderError = (gl, program, vs, fs) => {
      const log = (sh) => gl.getShaderInfoLog(sh) || '';
      throw new Error(`shader failed to compile: ${(log(fs) || log(vs) || gl.getProgramInfoLog(program) || '').slice(0, 400)}`);
    };
    this.film = film;
    this.under = canvas2d();
    this.over = canvas2d();

    const HF = { type: THREE.HalfFloatType, depthBuffer: true };
    // the raster pass keeps its depth, so the liquid pass can stop a ray where a crowd orb stands in front of it
    this.rtBase = new THREE.WebGLRenderTarget(PW, PH, { ...HF, samples: 4, depthTexture: new THREE.DepthTexture(PW, PH, THREE.UnsignedIntType) });
    this.rtLiquid = new THREE.WebGLRenderTarget(PW, PH, { type: THREE.HalfFloatType, depthBuffer: false });
    this.accum = new THREE.WebGLRenderTarget(PW, PH, { type: THREE.HalfFloatType, depthBuffer: false });
    this.quadCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    this.camera = new THREE.PerspectiveCamera(40, W / H, 0.05, 600);
    this.scene3d = new THREE.Scene();
    this.bgUniform = u(new THREE.Color(1, 1, 1));
    const backdrop = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), new THREE.ShaderMaterial({
      vertexShader: BACKDROP_VERT, fragmentShader: BACKDROP_FRAG, depthWrite: false, depthTest: false,
      uniforms: { tUnder: u(this.under.tex), uBg: this.bgUniform },
    }));
    backdrop.frustumCulled = false;
    backdrop.renderOrder = -1000;
    this.scene3d.add(backdrop);

    this.liquid = liquidLayer();
    this.bloom = new UnrealBloomPass(new THREE.Vector2(PW, PH), 0.3, 0.5, 1.0);

    this.compMat = new THREE.ShaderMaterial({
      vertexShader: QUAD_VERT, fragmentShader: COMPOSITE_FRAG,
      uniforms: {
        tBase: u(this.rtLiquid.texture), tOver: u(this.over.tex), uWeight: u(1), uExposure: u(1), uFlash: u(0), uFade: u(0),
        uZoom: u(1), uCA: u(0), uVig: u(0), uKnee: u(0.86), uZoomAt: u(new THREE.Vector2(0.5, 0.5)), uShake: u(new THREE.Vector2()),
        uFlashColor: u(new THREE.Color(1, 1, 1)), uFadeColor: u(new THREE.Color(1, 1, 1)),
      },
      blending: THREE.AdditiveBlending, depthTest: false, depthWrite: false,
    });
    this.finalMat = new THREE.ShaderMaterial({
      vertexShader: QUAD_VERT, fragmentShader: FINAL_FRAG,
      uniforms: { tAccum: u(this.accum.texture), uFrame: u(0), uGrain: u(0.014) },
      depthTest: false, depthWrite: false,
    });
    this.compScene = quadScene(this.compMat);
    this.finalScene = quadScene(this.finalMat);
    this.env = { THREE, renderer: r, W, H, S, PW, PH, scene3d: this.scene3d, camera: this.camera, engine: this };
    film.init?.(this.env);
  }

  setCamera(c, jx = 0, jy = 0) {
    const cam = this.camera;
    cam.fov = c.fov ?? 40;
    cam.near = c.near ?? 0.05; cam.far = c.far ?? 600;
    cam.position.set(...c.pos);
    cam.up.set(...(c.up ?? [0, 1, 0]));
    cam.lookAt(...c.target);
    if (c.roll) cam.rotateZ(c.roll);
    cam.updateProjectionMatrix();
    cam.updateMatrixWorld();
    const e = cam.projectionMatrix.elements;
    e[8] += (2 * jx) / PW; e[9] += (2 * jy) / PH;
    cam.projectionMatrixInverse.copy(cam.projectionMatrix).invert();
  }

  renderSub(t, weight, k, samples) {
    const r = this.renderer;
    const jx = samples > 1 ? halton(k + 1, 2) - 0.5 : 0, jy = samples > 1 ? halton(k + 1, 3) - 0.5 : 0;
    const st = this.film.frame(t, this.env);
    this.setCamera(st.cam, jx, jy);
    st.update3d?.(this.env);                         // after the camera: things placed relative to the lens

    // UNDER
    const g = this.under.ctx;
    g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, PW, PH);
    g.save(); g.setTransform(S, 0, 0, S, 0, 0); st.under?.(g); g.restore();
    this.under.tex.needsUpdate = true;
    this.bgUniform.value.copy(linColor(st.bg ?? '#000000'));

    // 3D raster → base
    r.setRenderTarget(this.rtBase);
    r.setClearColor(0x000000, 1);
    r.clear(true, true, false);
    r.render(this.scene3d, this.camera);

    // liquid → rtLiquid
    const L = this.liquid.uniforms, E = st.env ?? {};
    this.liquid.upload(st.prims ?? []);
    L.tBack.value = this.rtBase.texture;
    L.tDepth.value = this.rtBase.depthTexture;
    L.uNear.value = this.camera.near; L.uFar.value = this.camera.far;
    L.uUseDepth.value = st.useDepth ? 1 : 0;
    L.uRes.value.set(PW, PH);
    L.uCamPos.value.copy(this.camera.position);
    L.uCamWorld.value.copy(this.camera.matrixWorld);
    L.uProjInv.value.copy(this.camera.projectionMatrixInverse);
    L.uView.value.copy(this.camera.matrixWorldInverse);
    L.uTime.value = t;
    L.uPixAng.value = 2 * Math.tan(THREE.MathUtils.degToRad(this.camera.fov) / 2) / PH;
    L.uSkyTop.value.copy(linColor(E.skyTop ?? '#EAF4FF')).multiplyScalar(E.skyGain ?? 1);
    L.uSkyHor.value.copy(linColor(E.skyHor ?? '#FFF0E6')).multiplyScalar(E.skyGain ?? 1);
    L.uSkyLow.value.copy(linColor(E.skyLow ?? '#B9B3C4')).multiplyScalar(E.skyGain ?? 1);
    if (E.keyDir) L.uKeyDir.value.set(...E.keyDir);
    L.uKeyGain.value = E.keyGain ?? 4.5;
    L.uNight.value = E.night ?? 0;
    L.uSSR.value = E.ssr ?? 0.5;
    L.uRimGain.value = E.rimGain ?? 0;
    if (E.rimPos) L.uRimPos.value.set(...E.rimPos);
    if (E.rimCol) L.uRimCol.value.copy(linColor(E.rimCol));
    const fc = st.face;
    if (fc) {
      L.uFaceDir.value.set(...fc.dir); L.uFaceUp.value.set(...(fc.up ?? [0, 1, 0]));
      L.uEye.value.set(fc.blink ?? 0, fc.happy ?? 0, fc.wide ?? 0, fc.squint ?? 0);
      L.uLook.value.set(...(fc.look ?? [0, 0]));
      L.uBlush.value = fc.blush ?? 0.6; L.uEyeScale.value = fc.eyeScale ?? 1; L.uFaceAlpha.value = fc.alpha ?? 1;
    }
    r.setRenderTarget(this.rtLiquid);
    r.render(this.liquid.scene, this.liquid.cam);

    // bloom, added onto the liquid target
    const B = st.fx?.bloom ?? {};
    this.bloom.strength = B.strength ?? 0.3;
    this.bloom.radius = B.radius ?? 0.5;
    this.bloom.threshold = B.threshold ?? 1.0;
    if (this.bloom.strength > 0) this.bloom.render(r, null, this.rtLiquid, 0, false);

    // OVER
    const o = this.over.ctx;
    o.setTransform(1, 0, 0, 1, 0, 0); o.clearRect(0, 0, PW, PH);
    o.save(); o.setTransform(S, 0, 0, S, 0, 0); st.over?.(o); o.restore();
    this.over.tex.needsUpdate = true;

    // composite, weighted, into the linear accumulator
    const fx = st.fx ?? {};
    const U = this.compMat.uniforms;
    U.uWeight.value = weight;
    U.uExposure.value = fx.exposure ?? 1;
    U.uFlash.value = fx.flash ?? 0;
    U.uFlashColor.value.copy(linColor(fx.flashColor ?? '#ffffff'));
    U.uFade.value = fx.fade ?? 0;
    U.uFadeColor.value.copy(linColor(fx.fadeColor ?? '#ffffff'));
    U.uZoom.value = fx.zoom ?? 1;
    U.uZoomAt.value.set((fx.zoomAt?.[0] ?? W / 2) / W, 1 - (fx.zoomAt?.[1] ?? H / 2) / H);
    U.uShake.value.set((fx.shake?.[0] ?? 0) / W, -(fx.shake?.[1] ?? 0) / H);
    U.uCA.value = fx.ca ?? 0;
    U.uVig.value = fx.vignette ?? 0.12;
    U.uKnee.value = fx.knee ?? 0.86;
    this.lastGrain = fx.grain ?? 0.014;
    r.setRenderTarget(this.accum);
    r.render(this.compScene, this.quadCam);
  }

  // Sub-frame times across a 180° shutter trailing the frame time, so a cut on a frame boundary stays crisp.
  subTimes(frame, samples, shutter = 0.5) {
    const t0 = frame / FPS, ts = [];
    for (let k = 0; k < samples; k++) ts.push(samples > 1 ? Math.max(0, t0 - (shutter / FPS) * ((k + 0.5) / samples)) : t0);
    return ts;
  }

  renderFrameSync(frame, samples = 1) {
    const r = this.renderer;
    const n = Math.max(1, Math.round(samples * (this.film.samplesAt?.(frame / FPS) ?? 1)));
    r.setRenderTarget(this.accum);
    r.setClearColor(0x000000, 1);
    r.clear(true, false, false);
    this.subTimes(frame, n).forEach((t, k) => this.renderSub(t, 1 / n, k, n));
    this.finalMat.uniforms.uFrame.value = frame;
    this.finalMat.uniforms.uGrain.value = this.lastGrain ?? 0.014;
    r.setRenderTarget(null);
    r.render(this.finalScene, this.quadCam);
    return n;
  }
  async renderFrame(frame, samples = 1) { return this.renderFrameSync(frame, samples); }
}
