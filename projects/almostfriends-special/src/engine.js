// Frame pipeline, per motion-blur sub-frame:
//   UNDER 2D layer (backgrounds, UI that glass sits in front of)
//   → 3D world (optional; it draws UNDER as its own backdrop so glass and bubbles refract the UI behind them)
//   → the liquid layer (optional, special edition: every bubble a scene asks for, raymarched over that base and
//     refracting it, so bubbles merge, split and share walls: gl/liquid.js) → bloom
//   → OVER 2D layer (type, UI in front) → lens FX → accumulated into a float target (each sub-frame with a sub-pixel
//   camera jitter: free anti-aliasing) → grain + dither → screen.
// Without liquid primitives a frame takes the released film's path unchanged (the fork renders it pixel for pixel).
// Layout lives in a 1080×1920 design space; S (config) scales every buffer, never the layout.
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { W, H, S, FPS } from './config.js';
import { QUAD_VERT, COMPOSITE_FRAG, FINAL_FRAG } from './post.js';
import { halton, hexRgb } from './util.js';
import { liquidLayer } from './gl/liquid.js';
import { SCREEN_CAM } from './liquid2d.js';

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
    // a shader that fails to compile must stop the render, not draw a black layer (the special edition's v5 lesson)
    r.debug.onShaderError = (gl, program, vs, fs) => {
      const log = (sh) => gl.getShaderInfoLog(sh) || '';
      throw new Error(`shader failed to compile: ${(log(fs) || log(vs) || gl.getProgramInfoLog(program) || '').slice(0, 400)}`);
    };

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
    // the liquid path: the base (3D, or UNDER alone) rendered with its depth, the liquid over it, bloom over both
    this.rtBase = new THREE.WebGLRenderTarget(PW, PH, { type: THREE.HalfFloatType, samples: 4, depthTexture: new THREE.DepthTexture(PW, PH, THREE.UnsignedIntType) });
    this.rtLiquid = new THREE.WebGLRenderTarget(PW, PH, { type: THREE.HalfFloatType, depthBuffer: false });
    this.liquid = liquidLayer();
    this.lBloom = new UnrealBloomPass(new THREE.Vector2(PW, PH), 0.3, 0.5, 1.0);
    this.screenCam = new THREE.PerspectiveCamera(SCREEN_CAM.fov, W / H, 0.05, 200);
    this.screenCam.position.set(0, 0, SCREEN_CAM.d);
    this.screenCam.lookAt(0, 0, 0);
    this.screenCam.updateMatrixWorld();
    this._projInv = new THREE.Matrix4();
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
    this.backdropOnly = new THREE.Scene();
    this.backdropOnly.add(this.env.makeBackdrop());
    for (const s of scenes) s.init?.(this.env);
  }

  // every live scene's liquid: { prims, face, env, cam: 'screen' | '3d', useDepth, bloom } merged (prims concatenated)
  liquidAt(t) {
    let out = null;
    for (const s of this.scenes) {
      const L = s.liquid;
      if (!L || t < L.start || t >= L.end) continue;
      const f = L.frame(t, this.env);
      if (!f || !f.prims?.length) continue;
      if (!out) out = { prims: [], face: null, env: null, cam: 'screen', useDepth: false, bloom: null };
      // a scene's clip rect applies to each of its primitives that has none of its own
      out.prims.push(...(f.clip ? f.prims.map((p) => (p.clip ? p : { ...p, clip: f.clip })) : f.prims));
      if (f.face) out.face = f.face;
      if (f.env) out.env = { ...(out.env || {}), ...f.env };
      if (f.cam) out.cam = f.cam;
      if (f.useDepth) out.useDepth = true;
      if (f.bloom) out.bloom = f.bloom;
    }
    return out;
  }

  // the liquid pass: base (rtBase) → rtLiquid, with the camera the primitives live in (projection already jittered)
  renderLiquid(liq, cam, t) {
    const r = this.renderer, L = this.liquid.uniforms, E = liq.env || {};
    const lin = (hex) => { const [a, b, c] = hexRgb(hex); return new THREE.Color(a / 255, b / 255, c / 255).convertSRGBToLinear(); };
    this.liquid.upload(liq.prims);
    L.tBack.value = this.rtBase.texture;
    L.tDepth.value = this.rtBase.depthTexture;
    L.uNear.value = cam.near; L.uFar.value = cam.far;
    L.uUseDepth.value = liq.useDepth ? 1 : 0;
    L.uRes.value.set(PW, PH);
    L.uCamPos.value.copy(cam.position);
    L.uCamWorld.value.copy(cam.matrixWorld);
    L.uProjInv.value.copy(this._projInv.copy(cam.projectionMatrix).invert());
    L.uView.value.copy(cam.matrixWorldInverse);
    L.uTime.value = t;
    L.uPixAng.value = 2 * Math.tan(THREE.MathUtils.degToRad(cam.fov) / 2) / PH;
    L.uSkyTop.value.copy(lin(E.skyTop ?? '#EAF4FF')).multiplyScalar(E.skyGain ?? 1);
    L.uSkyHor.value.copy(lin(E.skyHor ?? '#FFF0E6')).multiplyScalar(E.skyGain ?? 1);
    L.uSkyLow.value.copy(lin(E.skyLow ?? '#B9B3C4')).multiplyScalar(E.skyGain ?? 1);
    L.uKeyDir.value.set(...(E.keyDir ?? [-0.55, 0.6, 0.6]));
    L.uKeyGain.value = E.keyGain ?? 4.5;
    L.uNight.value = 0;
    L.uSSR.value = E.ssr ?? 0.5;
    L.uRimGain.value = 0;
    const fc = liq.face;
    if (fc) {
      L.uFaceDir.value.set(...fc.dir); L.uFaceUp.value.set(...(fc.up ?? [0, 1, 0]));
      L.uEye.value.set(fc.blink ?? 0, fc.happy ?? 0, fc.wide ?? 0, fc.squint ?? 0);
      L.uLook.value.set(...(fc.look ?? [0, 0]));
      L.uBlush.value = fc.blush ?? 0.6; L.uEyeScale.value = fc.eyeScale ?? 1; L.uFaceAlpha.value = fc.alpha ?? 1;
    }
    r.setRenderTarget(this.rtLiquid);
    r.render(this.liquid.scene, this.liquid.cam);
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
    // the 3D shot first (it sets its camera, which liquid placed against the lens reads), then the liquid
    const res = active3d ? active3d.three.update(t, this.env) : null;
    const liq = this.liquidAt(t);
    const jx = samples > 1 ? halton(k + 1, 2) - 0.5 : 0, jy = samples > 1 ? halton(k + 1, 3) - 0.5 : 0;
    if (liq) {
      // the liquid path: the base with its depth (the 3D world, or UNDER alone), the liquid over it, then bloom
      const cam3 = res ? res.camera : null;
      const lcam = liq.cam?.isCamera ? liq.cam : liq.cam === '3d' && cam3 ? cam3 : this.screenCam;
      const undo3 = cam3 && samples > 1 ? jitter(cam3, jx, jy) : null;
      const undoL = lcam !== cam3 && samples > 1 ? jitter(lcam, jx, jy) : null;
      r.setRenderTarget(this.rtBase);
      r.setClearColor(0x000000, 1);
      r.clear(true, true, false);
      if (res) { res.before?.(r); r.render(res.scene, cam3); } else r.render(this.backdropOnly, this.quadCam);
      if (lcam !== cam3) liq.useDepth = false;          // depth belongs to the 3D camera only
      this.renderLiquid(liq, lcam, t);
      undo3?.(); undoL?.();
      const b = liq.bloom || res?.bloom || {};
      this.lBloom.strength = b.strength ?? 0.3;
      this.lBloom.radius = b.radius ?? 0.5;
      this.lBloom.threshold = Math.max(1.0, b.threshold ?? 1.0);
      if (this.lBloom.strength > 0) this.lBloom.render(r, null, this.rtLiquid, 0, false);
      baseOn = 1;
      exposure = res?.exposure ?? 1;
    } else if (active3d) {
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
    U.tBase.value = liq ? this.rtLiquid.texture : this.composer.readBuffer.texture;
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
