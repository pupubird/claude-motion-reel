// Frame pipeline: 3D world → bloom → composite with the 2D layer and lens FX → accumulate N motion-blur
// sub-frames (each with a sub-pixel camera jitter) → grain → screen.
// Layout lives in a 1920×1080 design space; S (config) scales every buffer, never the layout.
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { W, H, S, FPS } from './config.js';
import { QUAD_VERT, COMPOSITE_FRAG, FINAL_FRAG } from './post.js';
import { halton } from './util.js';

const PW = W * S, PH = H * S;

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

export class Engine {
  constructor(canvas, scenes) {
    const r = (this.renderer = new THREE.WebGLRenderer({
      canvas, antialias: false, alpha: false, preserveDrawingBuffer: true, powerPreference: 'high-performance',
    }));
    r.setPixelRatio(1);
    r.setSize(PW, PH, false);
    r.autoClear = false;

    this.over = canvas2d();

    const rt = new THREE.WebGLRenderTarget(PW, PH, { type: THREE.HalfFloatType, samples: 4 });
    this.composer = new EffectComposer(r, rt);
    this.composer.renderToScreen = false;
    this.renderPass = new RenderPass(new THREE.Scene(), new THREE.PerspectiveCamera());
    this.bloom = new UnrealBloomPass(new THREE.Vector2(PW, PH), 0.6, 0.5, 0.85);
    this.composer.addPass(this.renderPass);
    this.composer.addPass(this.bloom);

    this.accum = new THREE.WebGLRenderTarget(PW, PH, { type: THREE.HalfFloatType, depthBuffer: false });
    this.quadCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    const u = (v) => ({ value: v });
    this.compMat = new THREE.ShaderMaterial({
      vertexShader: QUAD_VERT,
      fragmentShader: COMPOSITE_FRAG,
      uniforms: {
        tBase: u(null), tOver: u(this.over.tex), uBaseOn: u(0), uExposure: u(1), uWeight: u(1), uTime: u(0), uTonemap: u(2),
        uPx: u(1 / PH), uCA: u(0), uFlash: u(0), uFlashColor: u(new THREE.Color(1, 1, 1)), uZoom: u(1),
        uVignette: u(0), uFade: u(0), uShake: u(new THREE.Vector2()),
      },
      blending: THREE.AdditiveBlending,
      depthTest: false,
      depthWrite: false,
    });
    this.finalMat = new THREE.ShaderMaterial({
      vertexShader: QUAD_VERT,
      fragmentShader: FINAL_FRAG,
      uniforms: { tAccum: u(this.accum.texture), uFrame: u(0), uGrain: u(0.028) },
      depthTest: false,
      depthWrite: false,
    });
    this.compScene = quad(this.compMat);
    this.finalScene = quad(this.finalMat);

    this.scenes = scenes;
    this.env = { THREE, renderer: r, W, H, S, PW, PH, maxAniso: r.capabilities.getMaxAnisotropy() };
    for (const s of scenes) s.init?.(this.env);
  }

  fxAt(t) {
    const fx = { ca: 0, flash: 0, flashColor: null, zoom: 1, sx: 0, sy: 0, vignette: 0, fade: 0, grain: null };
    for (const s of this.scenes) {
      const f = s.fx?.(t);
      if (!f) continue;
      fx.ca += f.ca || 0;
      fx.sx += f.sx || 0;
      fx.sy += f.sy || 0;
      fx.zoom *= f.zoom || 1;
      if ((f.flash || 0) > fx.flash) { fx.flash = f.flash; fx.flashColor = f.flashColor || null; }
      fx.fade = Math.max(fx.fade, f.fade || 0);
      if (f.vignette !== undefined) fx.vignette = Math.max(fx.vignette, f.vignette);
      if (f.grain !== undefined) fx.grain = f.grain;
    }
    return fx;
  }

  renderSub(t, weight, k, samples) {
    const r = this.renderer;
    let baseOn = 0, exposure = 1, tonemap = 2;
    let active3d = null;
    for (const s of this.scenes) if (s.three && t >= s.three.start && t < s.three.end) active3d = s;
    if (active3d) {
      const res = active3d.three.update(t, this.env);
      this.renderPass.scene = res.scene;
      this.renderPass.camera = res.camera;
      const b = res.bloom || {};
      this.bloom.strength = b.strength ?? 0.6;
      this.bloom.radius = b.radius ?? 0.5;
      this.bloom.threshold = b.threshold ?? 0.85;
      this.bloom.enabled = this.bloom.strength > 0;
      const undo = samples > 1 ? jitter(res.camera, halton(k + 1, 2) - 0.5, halton(k + 1, 3) - 0.5) : null;
      res.before?.(r);            // pre-passes (e.g. the backdrop the orb refracts) see the same jittered camera
      this.composer.render(0);
      undo?.();
      baseOn = 1;
      exposure = res.exposure ?? 1;
      tonemap = res.tonemap ?? 2;
    }

    const ctx = this.over.ctx;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, PW, PH);
    for (const s of this.scenes) {
      for (const L of s.layers || []) {
        if (t < L.start || t >= L.end) continue;
        ctx.save();
        ctx.setTransform(S, 0, 0, S, 0, 0);
        L.draw(ctx, t);
        ctx.restore();
      }
    }
    this.over.tex.needsUpdate = true;

    const fx = this.fxAt(t);
    const shakeZoom = 1 + 2.2 * Math.max(Math.abs(fx.sx), Math.abs(fx.sy));
    const U = this.compMat.uniforms;
    U.tBase.value = this.composer.readBuffer.texture;
    U.uBaseOn.value = baseOn;
    U.uExposure.value = exposure;
    U.uTonemap.value = tonemap;
    U.uWeight.value = weight;
    U.uTime.value = t;
    U.uCA.value = fx.ca;
    U.uFlash.value = fx.flash;
    U.uFlashColor.value.set(fx.flashColor || '#ffffff');
    U.uZoom.value = fx.zoom * shakeZoom;
    U.uVignette.value = fx.vignette;
    U.uFade.value = fx.fade;
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
    F.uGrain.value = this.lastGrain ?? 0.028;
    r.setRenderTarget(null);
    r.render(this.finalScene, this.quadCam);
  }
}
