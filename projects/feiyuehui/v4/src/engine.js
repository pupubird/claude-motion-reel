// Frame pipeline. Each output frame accumulates N sub-samples; each sub-sample is the scene at its own instant inside
// a 180° shutter (motion blur), its own sub-pixel offset (anti-aliasing), its own spiral rotation for the bokeh, and its
// own position on each area light (soft shadows, handled by the shots through `sub`). The sum is linear HDR; bloom,
// glints, lens and grade run once on it. Layout lives in a 1920×1080 design space; S scales every buffer.
import * as THREE from 'three';
const WARNED = new Set();   // lenses already warned about (dof)
import { W, H, S, FPS } from './config.js';
import { QUAD_VERT, DOF_FRAG, ACCUM_FRAG, DOWN_FRAG, UP_FRAG, BRIGHT_FRAG, STREAK_FRAG, ADD_FRAG, FINAL_FRAG, RAYS_FRAG } from './gl/post.js';
import { halton } from './lib/util.js';

const PW = Math.round(W * S), PH = Math.round(H * S);
const u = (v) => ({ value: v });

function pass(frag, uniforms, blending = THREE.NoBlending) {
  const material = new THREE.ShaderMaterial({
    glslVersion: THREE.GLSL3, vertexShader: QUAD_VERT, fragmentShader: frag, uniforms,
    depthTest: false, depthWrite: false, blending,
  });
  if (blending === THREE.CustomBlending) {
    material.blendSrc = THREE.OneFactor; material.blendDst = THREE.OneFactor; material.blendEquation = THREE.AddEquation;
    material.blendSrcAlpha = THREE.OneFactor; material.blendDstAlpha = THREE.OneFactor;
  }
  const scene = new THREE.Scene();
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material);
  mesh.frustumCulled = false;
  scene.add(mesh);
  return { material, scene, u: material.uniforms };
}

const rt = (w, h, o = {}) => new THREE.WebGLRenderTarget(w, h, {
  type: THREE.HalfFloatType, format: THREE.RGBAFormat, depthBuffer: false,
  minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, generateMipmaps: false, ...o,
});

// The post look every shot starts from; a shot's frame overrides any key.
export const LOOK = {
  exposure: 1, bloom: 0.045, bloomRadius: 1.0, bloomClamp: 60,
  glint: 0.0, glintThreshold: 6, glintKnee: 6, glintAngle: 0.26, glintPoints: 6, glintAtten: 0.93, glintTint: [1, 0.97, 0.9],
  ca: 0.35, vignette: 0.22, grain: 0.022,
  wb: [1, 1, 1], sat: 1, contrast: 1, lift: [0, 0, 0], gain: [1, 1, 1], shadowTint: [0, 0, 0], highTint: [0, 0, 0],
  fade: 0, fadeColor: [1, 1, 1],
  rays: 0, raysAt: [0.5, 0.5], raysThreshold: 1.2, raysDensity: 0.9, raysDecay: 0.955,
};

export class Engine {
  constructor(canvas, shots) {
    const r = (this.renderer = new THREE.WebGLRenderer({
      canvas, antialias: false, alpha: false, preserveDrawingBuffer: true, powerPreference: 'high-performance', stencil: false,
    }));
    r.setPixelRatio(1);
    r.setSize(PW, PH, false);
    r.autoClear = false;
    r.outputColorSpace = THREE.SRGBColorSpace;
    r.toneMapping = THREE.NoToneMapping;          // tone mapping happens once, in FINAL_FRAG
    r.shadowMap.enabled = true;
    r.shadowMap.type = THREE.PCFShadowMap;
    const gl = r.getContext();
    this.floatBlend = !!gl.getExtension('EXT_float_blend');

    // scene target: MSAA colour + a resolved float depth texture for the bokeh
    this.depthTex = new THREE.DepthTexture(PW, PH, THREE.FloatType);
    this.sceneRT = new THREE.WebGLRenderTarget(PW, PH, {
      type: THREE.HalfFloatType, samples: 4, depthBuffer: true, depthTexture: this.depthTex,
      minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter,
    });
    this.dofRT = rt(PW, PH);
    this.volRT = rt(PW, PH);   // the scene after a shot's composite (clouds) — what the bokeh then blurs
    this.accumRT = rt(PW, PH, { type: this.floatBlend ? THREE.FloatType : THREE.HalfFloatType });
    // portal targets: other shots rendered into a texture this shot samples in screen space
    this.portalRT = new THREE.WebGLRenderTarget(PW, PH, {
      type: THREE.HalfFloatType, samples: 4, depthBuffer: true, minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter,
    });

    this.dof = pass(DOF_FRAG, {
      tColor: u(this.sceneRT.texture), tDepth: u(this.depthTex), uPx: u(new THREE.Vector2(1 / PW, 1 / PH)),
      uNear: u(0.01), uFar: u(100), uFocus: u(1), uCocScale: u(0), uMaxCoc: u(0), uRadScale: u(0.9), uAngle: u(0), uAspectSqueeze: u(1),
    });
    this.accum = pass(ACCUM_FRAG, { tSrc: u(null), uWeight: u(1) }, THREE.CustomBlending);

    // bloom pyramid
    this.levels = [];
    let w = PW, h = PH;
    for (let i = 0; i < 7; i++) { w = Math.max(1, w >> 1); h = Math.max(1, h >> 1); this.levels.push(rt(w, h)); }
    this.down = pass(DOWN_FRAG, { tSrc: u(null), uPx: u(new THREE.Vector2()), uKaris: u(0), uClamp: u(60) });
    this.up = pass(UP_FRAG, { tSrc: u(null), uPx: u(new THREE.Vector2()), uRadius: u(1), uWeight: u(1) }, THREE.CustomBlending);
    // glints at half resolution
    const gw = PW >> 1, gh = PH >> 1;
    this.gBright = rt(gw, gh); this.gA = rt(gw, gh); this.gB = rt(gw, gh); this.gSum = rt(gw, gh);
    this.bright = pass(BRIGHT_FRAG, { tSrc: u(null), uPx: u(new THREE.Vector2(1 / PW, 1 / PH)), uThreshold: u(6), uKnee: u(6) });
    this.streak = pass(STREAK_FRAG, { tSrc: u(null), uDir: u(new THREE.Vector2()), uPass: u(0), uAtten: u(0.93) });
    this.raysRT = rt(gw, gh);
    this.rays = pass(RAYS_FRAG, { tSrc: u(null), uCentre: u(new THREE.Vector2(0.5, 0.5)), uThreshold: u(1.2), uDensity: u(0.9), uDecay: u(0.955), uWeight: u(1), uAspect: u(PW / PH) });
    this.add = pass(ADD_FRAG, { tA: u(null), tB: u(null), uWa: u(1), uWb: u(1), uTintB: u(new THREE.Vector3(1, 1, 1)) }, THREE.CustomBlending);
    // a plain copy (no blending) for the matte pass's output: `add` blends One+One and the canvas keeps its pixels
    this.copy = pass(ADD_FRAG, { tA: u(null), tB: u(null), uWa: u(1), uWb: u(0), uTintB: u(new THREE.Vector3(1, 1, 1)) });
    this.final = pass(FINAL_FRAG, {
      tHdr: u(this.accumRT.texture), tBloom: u(this.levels[0].texture), tGlint: u(this.gSum.texture), tRays: u(this.raysRT.texture),
      uBloom: u(0), uGlint: u(0), uExposure: u(1), uRays: u(0), uCA: u(0), uVignette: u(0), uGrain: u(0), uFrame: u(0),
      uWB: u(new THREE.Vector3(1, 1, 1)), uSat: u(1), uContrast: u(1), uLift: u(new THREE.Vector3()), uGain: u(new THREE.Vector3(1, 1, 1)),
      uShadowTint: u(new THREE.Vector3()), uHighTint: u(new THREE.Vector3()), uFade: u(0), uFadeColor: u(new THREE.Vector3(1, 1, 1)),
      uRes: u(new THREE.Vector2(PW, PH)),
    });
    this.quadCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    this.shots = shots;
    this.ctx = { THREE, renderer: r, W, H, S, PW, PH, engine: this, maxAniso: r.capabilities.getMaxAnisotropy() };
  }

  async init(onProgress) {
    for (const [i, s] of this.shots.entries()) {
      await s.init?.(this.ctx);
      onProgress?.(i + 1, this.shots.length, s.id);
    }
  }

  shotAt(t) {
    let best = null;
    for (const s of this.shots) if (t >= s.start && t < s.end && (!best || (s.layer ?? 0) >= (best.layer ?? 0))) best = s;
    return best ?? this.shots[this.shots.length - 1];
  }

  // Shift the projection by a sub-pixel amount (TAA-style). Returns an undo.
  jitter(camera, jx, jy) {
    const e = camera.projectionMatrix.elements;
    const ortho = camera.isOrthographicCamera;
    const ix = ortho ? 12 : 8, iy = ortho ? 13 : 9;
    const dx = (2 * jx) / PW, dy = (2 * jy) / PH;
    e[ix] += dx; e[iy] += dy;
    camera.projectionMatrixInverse.copy(camera.projectionMatrix).invert();
    return () => { e[ix] -= dx; e[iy] -= dy; camera.projectionMatrixInverse.copy(camera.projectionMatrix).invert(); };
  }

  // Render one shot at time t into `target` (with its sub-sample state). Returns the shot's frame description.
  renderShot(shot, t, sub, target, depth = 0) {
    const r = this.renderer;
    const f = shot.update(t, sub, this.ctx);
    f.camera.updateMatrixWorld();
    if (f.camera.isPerspectiveCamera || f.camera.isOrthographicCamera) f.camera.updateProjectionMatrix();
    const undo = this.jitter(f.camera, sub.jx, sub.jy);
    // portals first: another shot drawn into portalRT, which the shot's portal material samples in screen space
    if (f.portal && depth === 0) {
      const inner = this.shots.find((s) => s.id === f.portal.shot);
      this.renderShot(inner, f.portal.t ?? t, sub, this.portalRT, depth + 1);
      f.portal.uniform.value = this.portalRT.texture;
    }
    r.setRenderTarget(target);
    r.setClearColor(this.matte ? 0x000000 : (f.clear ?? 0x000000), 1);
    r.clear(true, true, false);
    let unmatte = this.matte && depth === 0 ? this.matteSwap(f.scene) : this.notext && depth === 0 ? this.hideType(f.scene) : null;
    if (this.clay && depth === 0) { const a = unmatte, b = this.claySwap(f.scene); unmatte = () => { b(); a?.(); }; }
    if (!unmatte) f.before?.(r, target);
    r.render(f.scene, f.camera);
    if (!unmatte) f.after?.(r, target);
    unmatte?.();
    undo();
    return f;
  }

  // Clay blockout (?clay=1, usually with notext=1): every lit object in one neutral grey, so a generative re-render
  // (Seedance's fine-blockout lane) has to supply the materials itself instead of copying the CG surfaces. Shader-
  // drawn things (sky, clouds, glow, beams, light trails, sparks, dust) keep their look — they are part of the film,
  // and the post's filter glints are switched off instead (renderFrameSync).
  claySwap(scene) {
    const grey = (this.clayMat ??= new THREE.MeshStandardMaterial({ color: new THREE.Color(0.62, 0.62, 0.6), roughness: 0.55, metalness: 0 }));
    const undo = [];
    scene.traverse((o) => {
      if (!o.isMesh || !o.material || Array.isArray(o.material) || o.material.isLineMaterial || o.userData.clayKeep) return;
      if (!(o.material.isMeshStandardMaterial || o.material.isMeshPhysicalMaterial)) return;
      const prev = o.material;
      o.material = grey;
      undo.push(() => { o.material = prev; });
    });
    return () => undo.forEach((u) => u());
  }

  // Clean plate (?notext=1): the film with its type and logo hidden — what a generative pass is given, so no model
  // ever redraws a glyph; the originals go back over it with the matte (tools/v2v_comp.py). Objects that carry type in
  // their surface (the carving) hide it through userData.notextFn(on); userData.notextKeep keeps a type object in the
  // plate (the 镶嵌 diamonds: a generative pass should render them as real stones).
  hideType(scene) {
    const undo = [];
    scene.traverse((o) => {
      if (o.userData.notextFn) { o.userData.notextFn(true); undo.push(() => o.userData.notextFn(false)); }
      if ((o.userData.matte || o.userData.matteSelf) && !o.userData.notextKeep && o.visible) { o.visible = false; undo.push(() => { o.visible = true; }); }
    });
    return () => undo.forEach((u) => u());
  }

  // Matte pass (?matte=1): the film's type and logo in white, everything else black, with the same camera, motion blur
  // and lens blur — the key for compositing the original glyphs back over a generative (video-to-video) pass.
  // Objects opt in with userData.matte (on them or an ancestor) or userData.matteSelf (that object only); a material
  // that draws its own matte (the gilded
  // carving) sets userData.matteFn(on). Lines, points and sprites are hidden; occluders render black.
  matteSwap(scene) {
    const white = (this.matteWhite ??= new THREE.MeshBasicMaterial({ color: 0xffffff }));
    const black = (this.matteBlack ??= new THREE.MeshBasicMaterial({ color: 0x000000 }));
    const undo = [];
    scene.traverse((o) => {
      if (o.userData.matteFn) { o.userData.matteFn(true); undo.push(() => o.userData.matteFn(false)); return; }
      if (o.isLine || o.isPoints || o.isSprite || o.material?.isLineMaterial) {
        if (o.visible) { o.visible = false; undo.push(() => { o.visible = true; }); }
        return;
      }
      if (!o.isMesh) return;
      let on = !!o.userData.matteSelf;   // matteSelf: this object only (the pavé's plate is parented to its stones)
      for (let p = o; p && !on; p = p.parent) if (p.userData.matte) on = true;
      const prev = o.material;
      o.material = on ? white : black;
      undo.push(() => { o.material = prev; });
    });
    const bg = scene.background;
    scene.background = null;
    undo.push(() => { scene.background = bg; });
    return () => undo.forEach((u) => u());
  }

  renderSub(t, k, N, weight) {
    const r = this.renderer;
    const shot = this.shotAt(t);
    const sub = {
      k, N,
      jx: N > 1 ? halton(k + 1, 2) - 0.5 : 0, jy: N > 1 ? halton(k + 1, 3) - 0.5 : 0,
      // a second, decorrelated sequence for area lights and lens: (u, v) ∈ [0,1)²
      lu: N > 1 ? halton(k + 1, 5) : 0.5, lv: N > 1 ? halton(k + 1, 7) : 0.5,
    };
    const f = this.renderShot(shot, t, sub, this.sceneRT);
    let src = this.sceneRT.texture;
    // a composite (cloud) normally sits in the scene before the lens blur; `compositeAfterDof` lays it over the blurred
    // plate instead, as its own layer with its own softness (a macro lens would wash a cloud sea out to a flat tone)
    if (f.composite && !f.compositeAfterDof && !this.matte) src = f.composite(r, src, this.depthTex, f.camera, this.volRT, sub);
    const D = f.dof;
    if (D && D.fstop > 0) {
      const cam = f.camera;
      const fmm = (20.25 / 2) / Math.tan((cam.fov * Math.PI) / 360);   // focal length from the 16:9 sensor height
      const fl = fmm / 1000, A = fl / D.fstop, zf = Math.max(D.focus, fl * 1.01);
      // focused inside ~1.3 f the thin-lens CoC explodes (a 75 mm at 8 cm blurred a whole macro): say so, once per lens
      if (zf < fl * 1.3 && !WARNED.has(fmm.toFixed(0))) { WARNED.add(fmm.toFixed(0)); console.warn(`dof: focus ${(zf * 100).toFixed(1)} cm is inside 1.3 × the ${fmm.toFixed(0)} mm focal length — CoC will be extreme; scale it down (dof.scale) or pull the camera back`); }
      const cocSensor = (A * fl * zf) / (zf - fl);                       // diameter (m) per unit |1/zf − 1/z|
      const U = this.dof.u;
      U.tColor.value = src;
      U.uNear.value = cam.near; U.uFar.value = cam.far; U.uFocus.value = zf;
      U.uCocScale.value = 0.5 * (cocSensor / 0.02025) * PH * (D.scale ?? 1); // radius in px (scale: artistic depth)
      U.uMaxCoc.value = (D.maxCoc ?? 22) * S;
      U.uRadScale.value = (D.radScale ?? 0.85) * Math.sqrt(S);
      U.uAngle.value = N > 1 ? (k / N) * 2.39996323 : 0;
      U.uAspectSqueeze.value = D.squeeze ?? 1;
      r.setRenderTarget(this.dofRT);
      r.render(this.dof.scene, this.quadCam);
      src = this.dofRT.texture;
    }
    if (f.composite && f.compositeAfterDof && !this.matte) src = f.composite(r, src, this.depthTex, f.camera, src === this.dofRT.texture ? this.volRT : this.dofRT, sub);
    this.accum.u.tSrc.value = src;
    this.accum.u.uWeight.value = weight;
    r.setRenderTarget(this.accumRT);
    r.render(this.accum.scene, this.quadCam);
    return f;
  }

  // Sub-frame times across a 180° shutter, trailing the frame time (t − shutter, t] so a cut on a frame boundary
  // stays crisp. A shot may shorten the shutter (f.shutter) for a crisp beat.
  subTimes(frame, N, shutter = 0.5) {
    const t0 = frame / FPS;
    return Array.from({ length: N }, (_, k) => (N > 1 ? Math.max(0, t0 - (shutter / FPS) * ((k + 0.5) / N)) : t0));
  }

  async renderFrame(frame, samples = 1) { this.renderFrameSync(frame, samples); }

  renderFrameSync(frame, samples = 1) {
    const r = this.renderer;
    r.setRenderTarget(this.accumRT);
    r.setClearColor(0x000000, 0);
    r.clear(true, false, false);
    const shot = this.shotAt(frame / FPS);
    const N = Math.max(1, Math.round(samples * (shot.samples ?? 1)));
    let last = null;
    this.subTimes(frame, N, shot.shutter ?? 0.5).forEach((t, k) => { last = this.renderSub(t, k, N, 1 / N); });
    if (this.matte) {   // coverage straight out: no bloom, glints, rays, tonemap or grain
      const Cp = this.copy.u;
      Cp.tA.value = this.accumRT.texture; Cp.tB.value = this.accumRT.texture;
      r.setRenderTarget(null);
      r.render(this.copy.scene, this.quadCam);
      return;
    }
    const look = { ...LOOK, ...(last.look || {}) };
    if (this.clay) Object.assign(look, { glint: 0, rays: 0, bloom: Math.min(look.bloom, 0.03) });   // no filter effects on a blockout
    this.post(look, frame);
  }

  post(L, frame) {
    const r = this.renderer;
    // bloom pyramid
    let src = this.accumRT.texture, sw = PW, sh = PH;
    for (let i = 0; i < this.levels.length; i++) {
      const D = this.down.u;
      D.tSrc.value = src; D.uPx.value.set(1 / sw, 1 / sh); D.uKaris.value = i === 0 ? 1 : 0; D.uClamp.value = L.bloomClamp;
      r.setRenderTarget(this.levels[i]);
      r.render(this.down.scene, this.quadCam);
      src = this.levels[i].texture; sw = this.levels[i].width; sh = this.levels[i].height;
    }
    for (let i = this.levels.length - 1; i > 0; i--) {
      const Uu = this.up.u, s = this.levels[i];
      Uu.tSrc.value = s.texture; Uu.uPx.value.set(1 / s.width, 1 / s.height); Uu.uRadius.value = L.bloomRadius; Uu.uWeight.value = 1;
      r.setRenderTarget(this.levels[i - 1]);
      r.render(this.up.scene, this.quadCam);
    }
    // glints
    const glintOn = L.glint > 0;
    r.setRenderTarget(this.gSum);
    r.setClearColor(0x000000, 1);
    r.clear(true, false, false);
    if (glintOn) {
      const B = this.bright.u;
      B.tSrc.value = this.accumRT.texture; B.uThreshold.value = L.glintThreshold; B.uKnee.value = L.glintKnee;
      r.setRenderTarget(this.gBright);
      r.render(this.bright.scene, this.quadCam);
      const gw = this.gBright.width, gh = this.gBright.height;
      for (let p = 0; p < L.glintPoints; p++) {
        const a = L.glintAngle + (p / L.glintPoints) * Math.PI * 2;
        let read = this.gBright, write = this.gA;
        for (let n = 0; n < 3; n++) {
          const St = this.streak.u;
          St.tSrc.value = read.texture; St.uDir.value.set(Math.cos(a) / gw, Math.sin(a) / gh); St.uPass.value = n; St.uAtten.value = L.glintAtten;
          r.setRenderTarget(write);
          r.render(this.streak.scene, this.quadCam);
          read = write; write = write === this.gA ? this.gB : this.gA;
        }
        const Ad = this.add.u;
        Ad.tA.value = read.texture; Ad.tB.value = read.texture; Ad.uWa.value = 1 / L.glintPoints; Ad.uWb.value = 0;
        r.setRenderTarget(this.gSum);
        r.render(this.add.scene, this.quadCam);
      }
    }
    // god rays: from the light's screen position, at half resolution
    r.setRenderTarget(this.raysRT);
    r.setClearColor(0x000000, 1);
    r.clear(true, false, false);
    if (L.rays > 0) {
      const R = this.rays.u;
      R.tSrc.value = this.accumRT.texture;
      R.uCentre.value.set(L.raysAt[0], L.raysAt[1]); R.uThreshold.value = L.raysThreshold; R.uDensity.value = L.raysDensity;
      R.uDecay.value = L.raysDecay; R.uWeight.value = 1;
      r.render(this.rays.scene, this.quadCam);
    }
    const F = this.final.u;
    F.uRays.value = L.rays;
    F.uBloom.value = L.bloom; F.uGlint.value = glintOn ? L.glint : 0; F.uExposure.value = L.exposure;
    F.uCA.value = L.ca; F.uVignette.value = L.vignette; F.uGrain.value = L.grain; F.uFrame.value = frame;
    F.uWB.value.set(...L.wb); F.uSat.value = L.sat; F.uContrast.value = L.contrast;
    F.uLift.value.set(...L.lift); F.uGain.value.set(...L.gain);
    F.uShadowTint.value.set(...L.shadowTint); F.uHighTint.value.set(...L.highTint);
    F.uFade.value = L.fade; F.uFadeColor.value.set(...L.fadeColor);
    r.setRenderTarget(null);
    r.render(this.final.scene, this.quadCam);
  }
}
