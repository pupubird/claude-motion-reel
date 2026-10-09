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
import { QUAD_VERT, COMPOSITE_FRAG, FINAL_FRAG, FIELD_FRAG } from './post.js';
import { halton, hexRgb } from './util.js';
import { liquidLayer } from './gl/liquid.js';
import { SCREEN_CAM } from './liquid2d.js';
import { liquidEnv } from './v2look.js';

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
uniform sampler2D tUnder, tField;
uniform vec3 uBg;
uniform float uFieldOn;
varying vec2 vUv;
vec3 lin(vec3 c) { return mix(c / 12.92, pow((c + 0.055) / 1.055, vec3(2.4)), step(0.04045, c)); }
void main() {
  vec4 u = texture2D(tUnder, vUv);
  vec3 bg = uFieldOn > 0.5 ? texture2D(tField, vUv).rgb : uBg;
  gl_FragColor = vec4(lin(u.rgb + bg * (1.0 - u.a)), 1.0);
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
    // v2: the silk field (a pastel light-theme shader field) drawn where UNDER is clear, instead of one flat colour
    this.rtField = new THREE.WebGLRenderTarget(PW, PH, { type: THREE.HalfFloatType, depthBuffer: false });
    this.fieldMat = new THREE.ShaderMaterial({
      vertexShader: QUAD_VERT, fragmentShader: FIELD_FRAG, depthTest: false, depthWrite: false,
      uniforms: { uTime: { value: 0 }, uRes: { value: new THREE.Vector2(W, H) }, uA: { value: new THREE.Color() }, uB: { value: new THREE.Color() },
        uC: { value: new THREE.Color() }, uD: { value: new THREE.Color() }, uFlow: { value: 1 }, uSilk: { value: 1 }, uShift: { value: new THREE.Vector2() } },
    });
    this.fieldScene = quad(this.fieldMat);
    this.fieldOn = { value: 0 };
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
        tField: u(this.rtField.texture), uFieldOn: this.fieldOn, uWhip: u(new THREE.Vector2()),
        uBeam: u(new THREE.Vector4()), uBeamCol: u(new THREE.Color(1, 1, 1)), uBeamAng: u(0.5),
        uShock: u(new THREE.Vector4()), uShockW: u(0.04), uShockDisp: u(0.45), uChroma: u(0), uChromaAt: u(new THREE.Vector2(0.5, 0.5)), uDesat: u(0),
        uBulge: u(new THREE.Vector4()), uRays: u(new THREE.Vector4()), uRaysCol: u(new THREE.Color(1, 1, 1)), uTunnel: u(new THREE.Vector4()),
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
          uniforms: { tUnder: u(this.under.tex), uBg: this.compMat.uniforms.uBg, tField: u(this.rtField.texture), uFieldOn: this.fieldOn },
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
      if (f.spot) out.spot = f.spot;
      if (f.sweep) { out.sweep = f.sweep; out.sweepTilt = f.sweepTilt; }
    }
    return out;
  }

  // the liquid pass: base (rtBase) → rtLiquid, with the camera the primitives live in (projection already jittered)
  renderLiquid(liq, cam, t) {
    // v2: the studio follows the film's light (night → day) unless the scene sets its own
    const r = this.renderer, L = this.liquid.uniforms, E = { ...liquidEnv(t), ...(liq.env || {}) };
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
    // v2: a night studio for the films to mirror (E.night 0..1), and a moving rim light (E.rim { pos, col, gain })
    L.uNight.value = E.night ?? 0;
    L.uStudio.value = E.studio ?? 0;
    L.uStars.value = E.stars ?? 1;
    L.uSSR.value = E.ssr ?? 0.5;
    L.uRimGain.value = E.rim?.gain ?? 0;
    if (E.rim) { L.uRimPos.value.set(...E.rim.pos); L.uRimCol.value.set(E.rim.col ?? '#FFFFFF'); }
    L.uProjM.value.copy(cam.projectionMatrix);
    if (liq.spot) L.uSpot.value.set(...liq.spot); else L.uSpot.value.set(0, 0, 0, 0);
    if (liq.sweep) { L.uSweep.value.set(...liq.sweep); L.uSweepTilt.value = liq.sweepTilt ?? 0.3; } else L.uSweep.value.set(0, 0, 0, 1);
    const fc = liq.face;
    if (fc) {
      L.uFaceDir.value.set(...fc.dir); L.uFaceUp.value.set(...(fc.up ?? [0, 1, 0]));
      L.uEye.value.set(fc.blink ?? 0, fc.happy ?? 0, fc.wide ?? 0, fc.squint ?? 0);
      L.uLook.value.set(...(fc.look ?? [0, 0]));
      L.uBlush.value = fc.blush ?? 0.6; L.uEyeScale.value = fc.eyeScale ?? 1; L.uFaceAlpha.value = fc.alpha ?? 1;
      L.uFaceStyle.value = fc.style ?? 0;
    }
    r.setRenderTarget(this.rtLiquid);
    r.render(this.liquid.scene, this.liquid.cam);
  }

  fxAt(t) {
    const fx = { flash: 0, flashColor: null, zoom: 1, zoomAt: null, sx: 0, sy: 0, fade: 0, fadeColor: null, grain: null, bg: null,
      shutter: 0.5, samples: 0, wx: 0, wy: 0, beam: null, field: null, shock: null, chroma: 0, chromaAt: null, desat: 0,
      bulge: null, rays: null, tunnel: null };
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
      // v2: a longer shutter (and more sub-frames) where a scene moves fast; a whole-frame whip; a light hit; the field
      if (f.shutter) fx.shutter = Math.max(fx.shutter, f.shutter);
      if (f.samples) fx.samples = Math.max(fx.samples, f.samples);
      fx.wx += f.wx || 0; fx.wy += f.wy || 0;
      if (f.beam && (!fx.beam || f.beam.gain > fx.beam.gain)) fx.beam = f.beam;
      if (f.field) fx.field = f.field;
      if (f.shock && (!fx.shock || f.shock.k > fx.shock.k)) fx.shock = f.shock;
      if ((f.chroma || 0) > fx.chroma) { fx.chroma = f.chroma; fx.chromaAt = f.chromaAt || null; }
      fx.desat = Math.max(fx.desat, f.desat || 0);
      if (f.bulge) fx.bulge = f.bulge;
      if (f.rays && (!fx.rays || f.rays.k > fx.rays.k)) fx.rays = f.rays;
      if (f.tunnel) fx.tunnel = f.tunnel;
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
    this.fieldOn.value = fx.field ? 1 : 0;
    if (fx.field) {
      const F = this.fieldMat.uniforms, fd = fx.field;
      F.uTime.value = fd.time ?? t;
      const [a, b2, c, d] = fd.colors;
      F.uA.value.set(a); F.uB.value.set(b2); F.uC.value.set(c); F.uD.value.set(d);
      [F.uA, F.uB, F.uC, F.uD].forEach((x) => x.value.convertLinearToSRGB());   // set() decodes hex to linear: the field works in raw sRGB like UNDER
      F.uFlow.value = fd.flow ?? 1; F.uSilk.value = fd.silk ?? 1; F.uShift.value.set(...(fd.shift ?? [0, 0]));
      this.renderer.setRenderTarget(this.rtField);
      this.renderer.render(this.fieldScene, this.quadCam);
    }

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
    U.uWhip.value.set(fx.wx / W, -fx.wy / H);
    if (fx.beam) { const B = fx.beam; U.uBeam.value.set(B.x / W, 1 - B.y / H, B.gain, B.len ?? 1); U.uBeamCol.value.set(B.color ?? '#FFF4E8'); U.uBeamAng.value = B.ang ?? 0.5; }
    else U.uBeam.value.set(0, 0, 0, 1);
    // a shockwave { x, y (frame px), r (px), k (strength, px), w (ring width, px), disp (its colour split, × its bend:
    // 0 bends the frame clean — a day's hit, where the split fringed every edge with a rainbow) }, the colour split, the drain
    if (fx.shock) { const K = fx.shock; U.uShock.value.set(K.x / W, 1 - K.y / H, K.r / H, K.k / H); U.uShockW.value = (K.w ?? 70) / H; U.uShockDisp.value = K.disp ?? 0.45; }
    else U.uShock.value.set(0, 0, 0, 0);
    U.uChroma.value = fx.chroma;
    U.uChromaAt.value.set(fx.chromaAt ? fx.chromaAt[0] / W : 0.5, fx.chromaAt ? 1 - fx.chromaAt[1] / H : 0.5);
    U.uDesat.value = fx.desat;
    // the pane's bow { x, y (frame px), r (px), k }, god rays { x, y, k, reach, color }, the dive { x, y, k, prism }
    if (fx.bulge) { const B2 = fx.bulge; U.uBulge.value.set(B2.x / W, 1 - B2.y / H, B2.r / H, B2.k); } else U.uBulge.value.set(0, 0, 0, 0);
    if (fx.rays) { const R2 = fx.rays; U.uRays.value.set(R2.x / W, 1 - R2.y / H, R2.k, R2.reach ?? 0.6); U.uRaysCol.value.set(R2.color ?? '#FFFFFF'); } else U.uRays.value.set(0, 0, 0, 0);
    if (fx.tunnel) { const T2 = fx.tunnel; U.uTunnel.value.set((T2.x ?? W / 2) / W, 1 - (T2.y ?? H / 2) / H, T2.k, T2.prism ?? 0.04); } else U.uTunnel.value.set(0, 0, 0, 0);
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
    // a scene that moves fast asks for a longer shutter and more sub-frames (a whip reads as one streak, not ghosts)
    const f0 = samples > 1 ? this.fxAt(frame / FPS) : null;
    const n = f0 ? Math.max(samples, f0.samples) : samples;
    this.subTimes(frame, n, f0 ? f0.shutter : 0.5).forEach((t, k) => this.renderSub(t, 1 / n, k, n));
    const F = this.finalMat.uniforms;
    F.uFrame.value = frame;
    F.uGrain.value = this.lastGrain ?? 0.012;
    r.setRenderTarget(null);
    r.render(this.finalScene, this.quadCam);
  }
}
