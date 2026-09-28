// Frame pipeline: 3D scene → bloom → composite with 2D layer + FX → accumulate
// N motion-blur sub-frames → HUD + grain → screen.
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { W, H, FPS } from './config.js';
import { QUAD_VERT, COMPOSITE_FRAG, FINAL_FRAG } from './post.js';
import { drawHud, hudAlpha } from './hud.js';

function canvas2d() {
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
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

export class Engine {
  constructor(canvas, scenes) {
    const r = (this.renderer = new THREE.WebGLRenderer({
      canvas, antialias: false, alpha: false, preserveDrawingBuffer: true, powerPreference: 'high-performance',
    }));
    r.setPixelRatio(1);
    r.setSize(W, H, false);
    r.autoClear = false;

    this.over = canvas2d();
    this.hud = canvas2d();

    const rt = new THREE.WebGLRenderTarget(W, H, { type: THREE.HalfFloatType, samples: 4 });
    this.composer = new EffectComposer(r, rt);
    this.composer.renderToScreen = false;
    this.renderPass = new RenderPass(new THREE.Scene(), new THREE.PerspectiveCamera());
    this.bloom = new UnrealBloomPass(new THREE.Vector2(W, H), 0.6, 0.5, 0.85);
    this.composer.addPass(this.renderPass);
    this.composer.addPass(this.bloom);

    this.accum = new THREE.WebGLRenderTarget(W, H, { type: THREE.HalfFloatType, depthBuffer: false });
    this.quadCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    const u = (v) => ({ value: v });
    this.compMat = new THREE.ShaderMaterial({
      vertexShader: QUAD_VERT,
      fragmentShader: COMPOSITE_FRAG,
      uniforms: {
        tBase: u(null), tOver: u(this.over.tex), uBaseOn: u(0), uExposure: u(1), uWeight: u(1), uTime: u(0),
        uCA: u(0), uGlitch: u(0), uFlash: u(0), uInvert: u(0), uZoom: u(1), uLetterbox: u(0),
        uVignette: u(0.3), uFade: u(0), uShake: u(new THREE.Vector2()),
      },
      blending: THREE.AdditiveBlending,
      depthTest: false,
      depthWrite: false,
    });
    this.finalMat = new THREE.ShaderMaterial({
      vertexShader: QUAD_VERT,
      fragmentShader: FINAL_FRAG,
      uniforms: { tAccum: u(this.accum.texture), tHud: u(this.hud.tex), uFrame: u(0), uGrain: u(0.05), uHudAlpha: u(1) },
      depthTest: false,
      depthWrite: false,
    });
    this.compScene = quad(this.compMat);
    this.finalScene = quad(this.finalMat);

    this.scenes = scenes;
    this.env = { THREE, renderer: r, W, H };
    for (const s of scenes) s.init?.(this.env);
  }

  fxAt(t) {
    const fx = { ca: 0, glitch: 0, flash: 0, invert: 0, zoom: 1, sx: 0, sy: 0, letterbox: 0, vignette: 0.32, fade: 0 };
    for (const s of this.scenes) {
      const f = s.fx?.(t);
      if (!f) continue;
      fx.ca += f.ca || 0;
      fx.sx += f.sx || 0;
      fx.sy += f.sy || 0;
      fx.zoom *= f.zoom || 1;
      for (const k of ['glitch', 'flash', 'invert', 'letterbox', 'fade']) fx[k] = Math.max(fx[k], f[k] || 0);
    }
    return fx;
  }

  renderSub(t, weight) {
    const r = this.renderer;
    let baseOn = 0, exposure = 1;
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
      this.composer.render(0);
      baseOn = 1;
      exposure = res.exposure ?? 1;
    }

    const ctx = this.over.ctx;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, W, H);
    for (const s of this.scenes) {
      for (const L of s.layers || []) {
        if (t < L.start || t >= L.end) continue;
        ctx.save();
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
    U.uWeight.value = weight;
    U.uTime.value = t;
    U.uCA.value = fx.ca;
    U.uGlitch.value = fx.glitch;
    U.uFlash.value = fx.flash;
    U.uInvert.value = fx.invert;
    U.uZoom.value = fx.zoom * shakeZoom;
    U.uLetterbox.value = fx.letterbox;
    U.uVignette.value = fx.vignette;
    U.uFade.value = fx.fade;
    U.uShake.value.set(fx.sx, fx.sy);

    r.setRenderTarget(this.accum);
    r.render(this.compScene, this.quadCam);
  }

  // Render output frame `frame` as the average of `samples` sub-frames across a 180° shutter.
  renderFrame(frame, samples = 1, shutter = 0.5) {
    const r = this.renderer;
    const t0 = frame / FPS;
    r.setRenderTarget(this.accum);
    r.setClearColor(0x000000, 1);
    r.clear(true, false, false);
    for (let k = 0; k < samples; k++) {
      const t = samples > 1 ? Math.max(0, t0 - (shutter / FPS) * ((k + 0.5) / samples)) : t0;
      this.renderSub(t, 1 / samples);
    }

    const h = this.hud.ctx;
    h.setTransform(1, 0, 0, 1, 0, 0);
    h.clearRect(0, 0, W, H);
    drawHud(h, t0, frame);
    this.hud.tex.needsUpdate = true;

    const F = this.finalMat.uniforms;
    F.uFrame.value = frame;
    F.uHudAlpha.value = hudAlpha(t0);
    r.setRenderTarget(null);
    r.render(this.finalScene, this.quadCam);
  }
}
