// The phone in 3D (special edition; owner: "the phone no need to be 2d mah, it can be 3d also"). A real device: a
// titanium band that mirrors a soft studio, black glass round the screen, the side buttons; the app's screens — the
// released 2D screens, unchanged — drawn live into a texture on its glass, under a glass skin that catches the light as
// the phone turns; a soft shadow on the sky behind it. World units: the screen is 1 wide; the phone faces +z with its
// screen centred on the origin. It is never faded to make room for words: the captions stand beside it in its world
// (scenes/steps.js); only its alpha takes it away at the reveal.
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { W, SH } from '../config.js';

const K = W / 402;                                  // design px per pt (the 2D phone's units)
const PX = 1 / W;                                   // one screen design px, in world units
export const SCREEN_W = 1, SCREEN_H = SH / W;            // an iPhone 16 Pro's screen, 402 × 874 pt
const BORDER = 6.5 * K * PX, BAND = 7.5 * K * PX, RADIUS = 55 * K * PX;
const DEPTH = 0.105, BEVEL = 0.016;
export const FACE_Z = DEPTH / 2 + BEVEL;           // the front glass (world z)
// a point of the screen (design px) h design px above the glass → world
export const toWorld = (x, y, h = 0) => [(x - W / 2) * PX, (SH / 2 - y) * PX, FACE_Z + 0.0015 + h * PX];
export const worldPerPx = PX;

function roundRect(w, h, r, s = new THREE.Shape()) {
  const x0 = -w / 2, y0 = -h / 2, x1 = w / 2, y1 = h / 2;
  s.moveTo(x0 + r, y0);
  s.lineTo(x1 - r, y0); s.absarc(x1 - r, y0 + r, r, -Math.PI / 2, 0, false);
  s.lineTo(x1, y1 - r); s.absarc(x1 - r, y1 - r, r, 0, Math.PI / 2, false);
  s.lineTo(x0 + r, y1); s.absarc(x0 + r, y1 - r, r, Math.PI / 2, Math.PI, false);
  s.lineTo(x0, y0 + r); s.absarc(x0 + r, y0 + r, r, Math.PI, Math.PI * 1.5, false);
  return s;
}

// the device's alpha, for any material: premultiplied output × it (the reveal throws the phone away)
const FADE_GLSL = /* glsl */ `
uniform float uAlpha;
float fadeAt() { return uAlpha; }`;
function withFade(mat, U) {
  mat.transparent = true;
  mat.premultipliedAlpha = true;
  mat.onBeforeCompile = (sh) => {
    sh.uniforms.uAlpha = U.uAlpha;
    sh.fragmentShader = sh.fragmentShader.replace('void main() {', `${FADE_GLSL}\nvoid main() {`)
      .replace(/}\s*$/, '  gl_FragColor *= fadeAt();\n}');
  };
  return mat;
}

const SCREEN_VERT = /* glsl */ `
varying vec2 vUv; varying vec3 vW, vN;
void main() { vUv = uv; vec4 w = modelMatrix * vec4(position, 1.0); vW = w.xyz; vN = normalize(mat3(modelMatrix) * normal); gl_Position = projectionMatrix * viewMatrix * w; }`;
// the glass: the screen's light, and over it a Fresnel reflection of a soft studio (a bright sky, a softbox, a strip)
const SCREEN_FRAG = /* glsl */ `
uniform sampler2D map;
uniform vec3 uKey;
varying vec2 vUv; varying vec3 vW, vN;
${FADE_GLSL}
float softRect(vec2 p, vec2 c, vec2 h, float r) { vec2 q = abs(p - c) - h; return 1.0 - smoothstep(-r, r, length(max(q, 0.0)) + min(max(q.x, q.y), 0.0)); }
vec3 studio(vec3 r) {
  vec3 c = mix(vec3(0.92, 0.9, 0.93), vec3(0.86, 0.92, 1.0), smoothstep(-0.2, 0.8, r.y));
  vec3 k = normalize(uKey), kx = normalize(cross(k, vec3(0.0, 1.0, 0.0))), ky = cross(kx, k);
  float dk = dot(r, k);
  if (dk > 0.0) c += vec3(1.0, 0.98, 0.95) * 6.0 * softRect(vec2(dot(r, kx), dot(r, ky)) / dk, vec2(0.0), vec2(0.42, 0.22), 0.08);
  vec3 s = normalize(vec3(0.85, 0.2, 0.5)), sx = normalize(cross(s, vec3(0.0, 1.0, 0.0))), sy = cross(sx, s);
  float ds = dot(r, s);
  if (ds > 0.0) c += vec3(0.9, 0.95, 1.0) * 3.0 * softRect(vec2(dot(r, sx), dot(r, sy)) / ds, vec2(0.0), vec2(0.04, 0.6), 0.03);
  return c;
}
void main() {
  vec3 c = texture2D(map, vUv).rgb;
  vec3 V = normalize(cameraPosition - vW), N = normalize(vN);
  float ci = clamp(dot(N, V), 0.0, 1.0);
  float Fr = 0.03 + 0.97 * pow(1.0 - ci, 5.0);
  c = c * (1.0 - Fr) + studio(reflect(-V, N)) * Fr;
  gl_FragColor = vec4(c, 1.0) * fadeAt();
}`;

// → { group, screen: { canvas, ctx, tex, q }, uniforms, draw(fn, q) }. env: the engine's (renderer, maxAniso)
export function phone3d(env) {
  const r = env.renderer;
  const U = { uAlpha: { value: 1 }, uKey: { value: new THREE.Vector3(-0.5, 0.65, 0.6) } };
  const pm = new THREE.PMREMGenerator(r);
  const envMap = pm.fromScene(new RoomEnvironment(), 0.04).texture;
  pm.dispose();

  const group = new THREE.Group();
  const bw = 1 + 2 * (BORDER + BAND), bh = SCREEN_H + 2 * (BORDER + BAND), br = RADIUS + BORDER + BAND;
  // the titanium band: an extruded rounded slab, its bevels part of the band (the caps write depth only: the front is
  // the bezel ring and the screen, drawn separately so nothing under the glass shows through when the phone fades)
  const bodyGeo = new THREE.ExtrudeGeometry(roundRect(bw - 2 * BEVEL, bh - 2 * BEVEL, br - BEVEL), { depth: DEPTH, bevelEnabled: true, bevelThickness: BEVEL, bevelSize: BEVEL, bevelSegments: 6, curveSegments: 48 });
  bodyGeo.translate(0, 0, -DEPTH / 2);
  const capMat = new THREE.MeshBasicMaterial({ colorWrite: false });     // depth only
  const bandMat = withFade(new THREE.MeshPhysicalMaterial({ color: new THREE.Color('#C9CCD3'), metalness: 1, roughness: 0.26, envMap, envMapIntensity: 1.25, clearcoat: 0.3, clearcoatRoughness: 0.2 }), U);
  const body = new THREE.Mesh(bodyGeo, [capMat, bandMat]);
  group.add(body);
  // the bezel: black glass between the band and the screen
  const ring = roundRect(1 + 2 * BORDER, SCREEN_H + 2 * BORDER, RADIUS + BORDER);
  ring.holes.push(roundRect(1, SCREEN_H, RADIUS, new THREE.Path()));
  const bezel = new THREE.Mesh(new THREE.ShapeGeometry(ring, 48), withFade(new THREE.MeshPhysicalMaterial({ color: 0x050608, roughness: 0.08, metalness: 0, clearcoat: 1, envMap, envMapIntensity: 0.6 }), U));
  bezel.position.z = FACE_Z + 0.0008;
  group.add(bezel);
  // the side buttons (action, volume up/down on the left; side button, camera control on the right), as on the 2D phone
  for (const [side, y0, len] of [[-1, 112, 30], [-1, 168, 58], [-1, 238, 58], [1, 196, 92], [1, 560, 44]]) {
    const L = len * K * PX, b = new THREE.Mesh(new THREE.CapsuleGeometry(0.0065, L, 6, 12), bandMat);
    b.position.set(side * (bw / 2 + 0.002), SCREEN_H / 2 - (y0 * K * PX + L / 2), 0);
    group.add(b);
  }
  // the screen: the app, drawn into a canvas each frame
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = env.maxAniso;
  tex.minFilter = THREE.LinearMipmapLinearFilter;
  const sg = new THREE.ShapeGeometry(roundRect(1, SCREEN_H, RADIUS), 48);
  const pos = sg.attributes.position, uv = sg.attributes.uv;
  for (let i = 0; i < pos.count; i++) uv.setXY(i, pos.getX(i) + 0.5, pos.getY(i) / SCREEN_H + 0.5);
  const screenMat = new THREE.ShaderMaterial({ vertexShader: SCREEN_VERT, fragmentShader: SCREEN_FRAG, uniforms: { map: { value: tex }, ...U }, transparent: true, premultipliedAlpha: true,
    blending: THREE.CustomBlending, blendSrc: THREE.OneFactor, blendDst: THREE.OneMinusSrcAlphaFactor });
  const screen = new THREE.Mesh(sg, screenMat);
  screen.position.z = FACE_Z + 0.0015;
  group.add(screen);
  // a soft shadow on the sky, behind and below (it parallaxes as the camera turns)
  const sc = document.createElement('canvas'); sc.width = 256; sc.height = 448;
  const g = sc.getContext('2d');
  g.filter = 'blur(26px)'; g.fillStyle = 'rgba(11,27,63,0.5)';
  g.beginPath(); g.roundRect(48, 48, 160, 352, 30); g.fill();
  const stex = new THREE.CanvasTexture(sc);
  const shadow = new THREE.Mesh(new THREE.PlaneGeometry(bw * 1.6, bh * 1.27), withFade(new THREE.MeshBasicMaterial({ map: stex, transparent: true, depthWrite: false, opacity: 0.55 }), U));
  shadow.position.set(0, -0.1, -0.55);
  shadow.renderOrder = -10;
  group.add(shadow);

  let q = 0;
  return {
    group, uniforms: U, screen: { canvas, ctx, tex },
    // draw the app at q × design resolution (fn draws in full-bleed design px) and upload it
    draw(fn, scale = 1) {
      const nq = Math.max(0.5, Math.min(2.2, scale));
      if (nq !== q) { q = nq; canvas.width = Math.round(W * q); canvas.height = Math.round(SH * q); tex.dispose(); }
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.setTransform(q, 0, 0, q, 0, 0);
      fn(ctx);
      tex.needsUpdate = true;
    },
    // the device's alpha
    setAlpha(alpha = 1) { U.uAlpha.value = alpha; },
    // a small canvas layer floating h design px above the glass (it tilts with the phone and hides what is behind it)
    floater(wpx, hpx) {
      const c = document.createElement('canvas'); c.width = wpx; c.height = hpx;
      const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
      const m = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), withFade(new THREE.MeshBasicMaterial({ map: t, transparent: true, alphaTest: 0.02 }), U));
      m.visible = false;
      group.add(m);
      return {
        mesh: m, ctx: c.getContext('2d'),
        // draw(ctx) in the canvas's own px; place its centre at screen (x, y), h px above the glass, sizePx design px wide
        show(x, y, h, sizePx, draw) {
          const g = c.getContext('2d'); g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, c.width, c.height);
          draw(g); t.needsUpdate = true;
          m.position.set(...toWorld(x, y, h)); m.scale.set(sizePx * PX, sizePx * PX * (c.height / c.width), 1); m.visible = true;
        },
        hide() { m.visible = false; },
      };
    },
  };
}
