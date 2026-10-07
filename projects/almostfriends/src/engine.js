// Frame pipeline, per motion-blur sub-frame:
//   UNDER 2D layer (backgrounds, UI that glass sits in front of)
//   → 3D world (optional; it draws UNDER as its own backdrop so glass and bubbles refract the UI behind them) → bloom
//   → OVER 2D layer (type, UI in front) → lens FX → accumulated into a float target (each sub-frame with a sub-pixel
//   camera jitter: free anti-aliasing) → grain + dither → screen.
// Layout lives in a 1080×1920 design space; S (config) scales every buffer, never the layout.
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { W, H, S, FPS } from './config.js';
import { QUAD_VERT, COMPOSITE_FRAG, FINAL_FRAG } from './post.js';
import { halton, hexRgb } from './util.js';

const PW = Math.round(W * S), PH = Math.round(H * S);

function canvas2d() {
  const canvas = document.createElement('canvas');
  canvas.width = PW;
  canvas.height = PH;
  const ctx = canvas.getContext('2d');
  const tex = new THREE.CanvasTexture(canvas);
  tex.premultiplyAlpha = true;
  tex.generateMipmaps = false;
  tex.minFilter = THREE.LinearFilter;
  tex.magFilter = THREE.LinearFilter;
  tex.colorSpace = THREE.NoColorSpace;   // raw sRGB values: the composite reads them as-is (a GPU decode would darken them)
  return { canvas, ctx, tex };
}

function quad(material) {
  const scene = new THREE.Scene();
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material);
  mesh.frustumCulled = false;
  scene.add(mesh);
  return scene;
}

// Shift the projection by a sub-pixel amount (TAA-style jitter); returns an undo function.
function jitter(camera, jx, jy) {
  const e = camera.projectionMatrix.elements;
  const ortho = camera.isOrthographicCamera;
  const ix = ortho ? 12 : 8, iy = ortho ? 13 : 9;
  const dx = (2 * jx) / PW, dy = (2 * jy) / PH;
  e[ix] += dx; e[iy] += dy;
  return () => { e[ix] -= dx; e[iy] -= dy; };
}

// A screen-filling backdrop for 3D scenes that samples the UNDER layer (raw sRGB → linear by hand), drawn first and
// as an opaque object, so three's transmission pass sees it and glass refracts it.
const BACKDROP_FRAG = /* glsl */ `
uniform sampler2D tUnder;
uniform vec3 uBg;
varying vec2 vUv;
vec3 lin(vec3 c) { return mix(c / 12.92, pow((c + 0.055) / 1.055, vec3(2.4)), step(0.04045, c)); }
void main() {
  vec4 u = texture2D(tUnder, vUv);
  gl_FragColor = vec4(lin(u.rgb + uBg * (1.0 - u.a)), 1.0);
}`;
const BACKDROP_VERT = /* glsl */ `
varying vec2 vUv;
void main() { vUv = uv; gl_Position = vec4(position.xy, 0.9999, 1.0); }`;

export class Engine {
  constructor(canvas, scenes, { bg = '#ffffff' } = {}) {
    const r = (this.renderer = new THREE.WebGLRenderer({
      canvas, antialias: false, alpha: false, preserveDrawingBuffer: true, powerPreference: 'high-performance',
    }));
    r.setPixelRatio(1);
    r.setSize(PW, PH, false);
    r.autoClear = false;
    r.outputColorSpace = THREE.LinearSRGBColorSpace;   // the composite encodes to sRGB itself
    r.toneMapping = THREE.NoToneMapping;

    this.under = canvas2d();
    this.over = canvas2d();
    this.bg = bg;

    const rt = new THREE.WebGLRenderTarget(PW, PH, { type: THREE.HalfFloatType, samples: 4 });
    this.composer = new EffectComposer(r, rt);
    this.composer.renderToScreen = false;
    this.renderPass = new RenderPass(new THREE.Scene(), new THREE.PerspectiveCamera());
    this.bloom = new UnrealBloomPass(new THREE.Vector2(PW, PH), 0.4, 0.5, 1.2);
    this.composer.addPass(this.renderPass);
    this.composer.addPass(this.bloom);

    this.accum = new THREE.WebGLRenderTarget(PW, PH, { type: THREE.HalfFloatType, depthBuffer: false });
    this.quadCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    const u = (v) => ({ value: v });
    this.compMat = new THREE.ShaderMaterial({
      vertexShader: QUAD_VERT,
      fragmentShader: COMPOSITE_FRAG,
      uniforms: {
        tBase: u(null), tUnder: u(this.under.tex), tOver: u(this.over.tex), uBaseOn: u(0), uExposure: u(1), uWeight: u(1),
        uFlash: u(0), uFlashColor: u(new THREE.Color(1, 1, 1)), uZoom: u(1), uZoomAt: u(new THREE.Vector2(0.5, 0.5)),
        uFade: u(0), uFadeColor: u(new THREE.Color(1, 1, 1)), uShake: u(new THREE.Vector2()), uBg: u(new THREE.Color(1, 1, 1)),
      },
      blending: THREE.AdditiveBlending,
      depthTest: false,
      depthWrite: false,
    });
    this.finalMat = new THREE.ShaderMaterial({
      vertexShader: QUAD_VERT,
      fragmentShader: FINAL_FRAG,
      uniforms: { tAccum: u(this.accum.texture), uFrame: u(0), uGrain: u(0.012) },
      depthTest: false,
      depthWrite: false,
    });
    this.compScene = quad(this.compMat);
    this.finalScene = quad(this.finalMat);

    this.scenes = scenes;
    this.env = {
      THREE, renderer: r, W, H, S, PW, PH, engine: this, maxAniso: r.capabilities.getMaxAnisotropy(),
      underTex: this.under.tex,
      // → a mesh to add to a 3D scene: the UNDER layer as its backdrop (glass refracts it). Every 3D scene that should
      // show UNDER (the sky, UI behind glass) must add it: without it the 3D pass paints black over UNDER.
      makeBackdrop: () => {
        const m = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), new THREE.ShaderMaterial({
          vertexShader: BACKDROP_VERT, fragmentShader: BACKDROP_FRAG, depthWrite: false, depthTest: false,
          uniforms: { tUnder: u(this.under.tex), uBg: this.compMat.uniforms.uBg },
        }));
        m.frustumCulled = false;
        m.renderOrder = -1000;
        return m;
      },
    };
    for (const s of scenes) s.init?.(this.env);
  }

  fxAt(t) {
    const fx = { flash: 0, flashColor: null, zoom: 1, zoomAt: null, sx: 0, sy: 0, fade: 0, fadeColor: null, grain: null, bg: null };
    for (const s of this.scenes) {
      const f = s.fx?.(t);
      if (!f) continue;
      fx.sx += f.sx || 0;
      fx.sy += f.sy || 0;
      fx.zoom *= f.zoom || 1;
      if (f.zoomAt) fx.zoomAt = f.zoomAt;
      if ((f.flash || 0) > fx.flash) { fx.flash = f.flash; fx.flashColor = f.flashColor || null; }
      if ((f.fade || 0) > fx.fade) { fx.fade = f.fade; fx.fadeColor = f.fadeColor || null; }
      if (f.grain !== undefined) fx.grain = f.grain;
      if (f.bg) fx.bg = f.bg;
    }
    return fx;
  }

  drawLayers(which, ctx, t) {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, PW, PH);
    for (const s of this.scenes) {
      for (const L of s[which] || []) {
        if (t < L.start || t >= L.end) continue;
        ctx.save();
        ctx.setTransform(S, 0, 0, S, 0, 0);
        L.draw(ctx, t);
        ctx.restore();
      }
    }
  }

  renderSub(t, weight, k, samples) {
    const r = this.renderer;
    const fx = this.fxAt(t);
    const [br, bgc, bb] = hexRgb(fx.bg || this.bg);
    const U = this.compMat.uniforms;
    U.uBg.value.setRGB(br / 255, bgc / 255, bb / 255);

    this.drawLayers('under', this.under.ctx, t);
    this.under.tex.needsUpdate = true;

    let baseOn = 0, exposure = 1;
    let active3d = null;
    for (const s of this.scenes) if (s.three && t >= s.three.start && t < s.three.end) active3d = s;
    if (active3d) {
      const res = active3d.three.update(t, this.env);
      this.renderPass.scene = res.scene;
      this.renderPass.camera = res.camera;
      const b = res.bloom || {};
      this.bloom.strength = b.strength ?? 0.4;
      this.bloom.radius = b.radius ?? 0.5;
      this.bloom.threshold = b.threshold ?? 1.2;
      this.bloom.enabled = this.bloom.strength > 0;
      const undo = samples > 1 ? jitter(res.camera, halton(k + 1, 2) - 0.5, halton(k + 1, 3) - 0.5) : null;
      res.before?.(r);
      this.composer.render(0);
      undo?.();
      baseOn = 1;
      exposure = res.exposure ?? 1;
    }

    this.drawLayers('layers', this.over.ctx, t);
    this.over.tex.needsUpdate = true;

    const shakeZoom = 1 + 2.2 * Math.max(Math.abs(fx.sx), Math.abs(fx.sy));
    U.tBase.value = this.composer.readBuffer.texture;
    U.uBaseOn.value = baseOn;
    U.uExposure.value = exposure;
    U.uWeight.value = weight;
    U.uFlash.value = fx.flash;
    U.uFlashColor.value.set(fx.flashColor || '#ffffff');
    U.uFade.value = fx.fade;
    U.uFadeColor.value.set(fx.fadeColor || '#ffffff');
    U.uZoom.value = fx.zoom * shakeZoom;
    U.uZoomAt.value.set(fx.zoomAt ? fx.zoomAt[0] / W : 0.5, fx.zoomAt ? 1 - fx.zoomAt[1] / H : 0.5);
    U.uShake.value.set(fx.sx, fx.sy);
    this.lastGrain = fx.grain;

    r.setRenderTarget(this.accum);
    r.render(this.compScene, this.quadCam);
  }

  // Sub-frame times across a 180° shutter. The window trails the frame time (t − shutter, t]
  // so a cut on a frame boundary stays crisp.
  subTimes(frame, samples, shutter = 0.5) {
    const t0 = frame / FPS;
    const ts = [];
    for (let k = 0; k < samples; k++) ts.push(samples > 1 ? Math.max(0, t0 - (shutter / FPS) * ((k + 0.5) / samples)) : t0);
    return ts;
  }

  async renderFrame(frame, samples = 1) {
    this.renderFrameSync(frame, samples);
  }

  renderFrameSync(frame, samples = 1) {
    const r = this.renderer;
    r.setRenderTarget(this.accum);
    r.setClearColor(0x000000, 1);
    r.clear(true, false, false);
    this.subTimes(frame, samples).forEach((t, k) => this.renderSub(t, 1 / samples, k, samples));
    const F = this.finalMat.uniforms;
    F.uFrame.value = frame;
    F.uGrain.value = this.lastGrain ?? 0.012;
    r.setRenderTarget(null);
    r.render(this.finalScene, this.quadCam);
  }
}
