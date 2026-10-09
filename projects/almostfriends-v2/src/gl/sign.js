// Type as a thing in the shot (special edition, second pass; owner: "the text feel like slap on top of it … we cannot
// just put text on top area with background color and dropshadow etc, it *must* merge and design well seamlessly into
// the scene"). A sign is a line or a block of type on a plane that stands in the world of its shot, like the phone and
// the bubbles do:
//   · pinned where its key shot should see it (pin()), then left there: the camera's moves carry it through the frame
//     (perspective, parallax, motion blur), and it leaves the frame when the shot moves on;
//   · depth-tested: the phone, the crowd and Bub pass in front of it; the liquid, drawn after, bends it;
//   · seen through the same lens: out of focus by its distance from what the lens is focused on (blur);
//   · in the same light: a soft light can sit behind it (the sun: a glow round the letters, their edges lit), and far
//     signs take on a little of the sky (haze).
// No shadow, no plate, no badge.
import * as THREE from 'three';
import { W, H } from '../config.js';

const VERT = /* glsl */ `
varying vec2 vUv;
void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`;
const FRAG = /* glsl */ `
uniform sampler2D map;
uniform vec2 uTexel;
uniform float uAlpha, uBlur, uHaze;
uniform vec3 uHazeCol;
uniform vec4 uLight;        // a light behind the sign: x, y (sign uv), radius (uv of its width), strength
uniform vec3 uLightCol;
varying vec2 vUv;
vec4 tap(vec2 uv, float bias) { return texture2D(map, uv, bias); }
void main() {
  vec4 c;
  if (uBlur < 0.35) c = tap(vUv, 0.0);
  else {
    // the lens's blur: a disc of taps on a pre-filtered level (a defocused letter has a soft, round edge)
    float bias = max(0.0, log2(uBlur / 3.0));
    c = tap(vUv, bias) * 0.2;
    for (int i = 0; i < 16; i++) {
      float f = float(i) + 0.5, r = sqrt(f / 16.0) * uBlur, th = f * 2.39996;
      c += tap(vUv + vec2(cos(th), sin(th)) * r * uTexel, bias) * 0.05;
    }
  }
  // a light behind it (the sun crossing the sky): the letters stay dark against it, as anything backlit does; the
  // edges that face it catch a thin rim, and a little of it glows round them
  if (uLight.w > 0.0) {
    vec2 d = (vUv - uLight.xy) * vec2(1.0, uTexel.x / uTexel.y);
    float L = uLight.w * exp(-dot(d, d) / (uLight.z * uLight.z));
    vec2 toward = normalize((uLight.xy - vUv) / uTexel + 1e-4);    // toward the light, in texels
    float behind = texture2D(map, vUv + toward * 5.0 * uTexel, 0.5).a;
    float rim = clamp(c.a - behind, 0.0, 1.0);                      // ink here, none toward the light: a lit edge
    float halo = 0.0;
    for (int i = 0; i < 8; i++) {
      float th = float(i) * 0.785398;
      halo += texture2D(map, vUv + vec2(cos(th), sin(th)) * 9.0 * uTexel, 2.0).a;
    }
    halo = clamp(halo / 8.0 - c.a, 0.0, 1.0);
    c.rgb = c.rgb * (1.0 - 0.25 * L * c.a) + uLightCol * rim * L * 1.1;
    c.rgb += uLightCol * halo * L * 0.22;
    c.a = max(c.a, halo * L * 0.22);
  }
  c.rgb = mix(c.rgb, uHazeCol * c.a, uHaze);
  gl_FragColor = c * uAlpha;
}`;

const _d = new THREE.Vector3(), _f = new THREE.Vector3();
// The world placement that shows a sign's centre at frame pixel (x, y), D units ahead of `cam` along its axis, facing
// it, one sign pixel to one frame pixel → { pos, quat, wpp }. A sign pinned this way stays where it was put.
export function pin(cam, x, y, D) {
  cam.updateMatrixWorld();
  _d.set((x / W) * 2 - 1, 1 - (y / H) * 2, 0.5).unproject(cam).sub(cam.position).normalize();
  _f.set(0, 0, -1).applyQuaternion(cam.quaternion);
  const pos = cam.position.clone().addScaledVector(_d, D / Math.max(1e-4, _d.dot(_f)));
  const wpp = (2 * D * Math.tan((cam.fov * Math.PI) / 360)) / (H / (cam.view?.enabled ? cam.view.height / cam.view.fullHeight : 1));
  return { pos, quat: cam.quaternion.clone(), wpp };
}
// how far a world point lies ahead of `cam` (along its axis)
export const depthOf = (cam, p) => { _f.set(0, 0, -1).applyQuaternion(cam.quaternion); return _d.copy(p).sub(cam.position).dot(_f); };

// → { canvas, ctx, w, h, draw(fn), meshFor(scene), place(scene, at, opts), hide(scene), uniforms }
//   w × h: the sign's canvas in design px (drawn at q × that)
export function sign({ w, h, q = 1.5 } = {}) {
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(w * q); canvas.height = Math.round(h * q);
  const ctx = canvas.getContext('2d');
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.minFilter = THREE.LinearMipmapLinearFilter; tex.generateMipmaps = true; tex.anisotropy = 8;
  const U = {
    map: { value: tex }, uTexel: { value: new THREE.Vector2(1 / canvas.width, 1 / canvas.height) }, uAlpha: { value: 1 }, uBlur: { value: 0 },
    uHaze: { value: 0 }, uHazeCol: { value: new THREE.Color('#E4F0FF') }, uLight: { value: new THREE.Vector4(0.5, 0.5, 0.3, 0) }, uLightCol: { value: new THREE.Color('#FFE7A8') },
  };
  const mat = new THREE.ShaderMaterial({ vertexShader: VERT, fragmentShader: FRAG, uniforms: U, transparent: true, depthWrite: false, depthTest: true,
    blending: THREE.CustomBlending, blendSrc: THREE.OneFactor, blendDst: THREE.OneMinusSrcAlphaFactor });
  const geo = new THREE.PlaneGeometry(1, 1);
  const meshes = new Map();
  return {
    canvas, ctx, w, h, uniforms: U,
    draw(fn) {
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.setTransform(q, 0, 0, q, 0, 0);
      fn(ctx);
      tex.needsUpdate = true;
    },
    meshFor(scene) {
      if (!meshes.has(scene)) {
        const m = new THREE.Mesh(geo, mat);
        m.frustumCulled = false;
        m.userData.sign = true;                       // (hideSigns: a shot clears the signs other shots left in a shared world)
        scene.add(m);
        meshes.set(scene, m);
      }
      return meshes.get(scene);
    },
    // at: { pos, quat, wpp } (pin()); the sign's centre at pos. order: its render order (behind the phone: before it)
    place(scene, at, { order = -5, alpha = 1, blur = 0, haze = 0, light = null } = {}) {
      const m = this.meshFor(scene);
      m.visible = alpha > 0.002;
      if (!m.visible) return;
      m.renderOrder = order;
      m.position.copy(at.pos); m.quaternion.copy(at.quat); m.scale.set(w * at.wpp, h * at.wpp, 1);
      U.uAlpha.value = alpha; U.uBlur.value = blur * q; U.uHaze.value = haze;
      if (light) { U.uLight.value.set(light.x, light.y, light.r, light.k); if (light.col) U.uLightCol.value.set(light.col); } else U.uLight.value.w = 0;
    },
    hide(scene) { const m = meshes.get(scene); if (m) m.visible = false; },
  };
}

// hide every sign in a scene (a shared world, like the universe, starts each frame clean; its shot shows its own)
export function hideSigns(scene) { for (const o of scene.children) if (o.userData.sign) o.visible = false; }
