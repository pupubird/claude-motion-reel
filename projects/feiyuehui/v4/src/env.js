// Designed light for image-based lighting: each look is a small studio built from a gradient dome, soft boxes and an
// optional sun, prefiltered once into a PMREM. This is what the jade, gold, platinum and diamonds reflect, so it is
// lit like a jewellery set: broad warm sources for the body, thin strips for the edges, black cards for contrast.
import * as THREE from 'three';

const DOME_VERT = /* glsl */ `
varying vec3 vDir;
void main() { vDir = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }
`;
const DOME_FRAG = /* glsl */ `
uniform vec3 uZenith, uHorizon, uGround;
uniform float uSharp;
varying vec3 vDir;
void main() {
  float y = vDir.y;
  vec3 c = y > 0.0 ? mix(uHorizon, uZenith, pow(clamp(y, 0.0, 1.0), uSharp)) : mix(uHorizon, uGround, pow(clamp(-y * 3.0, 0.0, 1.0), 0.6));
  gl_FragColor = vec4(c, 1.0);
}
`;

// A soft box: its edges fall off over `soft` (fraction of the box, u and v) and its brightness runs from grad[0] at
// the bottom to grad[1] at the top, so a polished surface mirrors a gradient, not a hard-edged flat slab. Soft boxes
// add light (additive, no depth), so overlapping ones blend instead of cutting each other off.
const SOFT_VERT = /* glsl */ `
varying vec2 vUv;
void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }
`;
const SOFT_FRAG = /* glsl */ `
uniform vec3 uColor;
uniform vec2 uSoft, uGrad;
uniform float uDisc;
varying vec2 vUv;
void main() {
  vec2 e = min(vUv, 1.0 - vUv);
  float a = uDisc > 0.5 ? smoothstep(0.0, uSoft.x, 0.5 - length(vUv - 0.5))
                        : smoothstep(0.0, uSoft.x, e.x) * smoothstep(0.0, uSoft.y, e.y);
  gl_FragColor = vec4(uColor * a * mix(uGrad.x, uGrad.y, vUv.y), 1.0);
}
`;

const lin = (c, k = 1) => {
  const col = Array.isArray(c) ? new THREE.Color().setRGB(c[0], c[1], c[2], THREE.SRGBColorSpace) : new THREE.Color(c);
  return col.multiplyScalar(k);
};

// spec: { zenith, horizon, ground, sharp, intensity, boxes: [{ dir:[x,y,z], dist, size:[w,h], color, power, shape }],
//         cards: [{ dir, dist, size }] (black flags), sun: { dir, color, power, size } }
export function buildEnvScene(spec) {
  const scene = new THREE.Scene();
  const k = spec.intensity ?? 1;
  const dome = new THREE.Mesh(new THREE.SphereGeometry(50, 64, 32), new THREE.ShaderMaterial({
    vertexShader: DOME_VERT, fragmentShader: DOME_FRAG, side: THREE.BackSide, depthWrite: false,
    uniforms: {
      uZenith: { value: lin(spec.zenith ?? '#ffffff', k) }, uHorizon: { value: lin(spec.horizon ?? '#ffffff', k) },
      uGround: { value: lin(spec.ground ?? '#808080', k) }, uSharp: { value: spec.sharp ?? 0.6 },
    },
  }));
  scene.add(dome);
  const place = (mesh, dir, dist) => {
    const d = new THREE.Vector3(...dir).normalize();
    mesh.position.copy(d.multiplyScalar(dist));
    mesh.lookAt(0, 0, 0);
    scene.add(mesh);
  };
  for (const b of spec.boxes ?? []) {
    const disc = b.shape === 'disc';
    const soft = b.soft || b.grad;
    const geo = disc && !soft ? new THREE.CircleGeometry(b.size[0] / 2, 64) : new THREE.PlaneGeometry(b.size[0], b.size[1]);
    const mat = soft
      // additive: a soft box's dark margin must not occlude what lies behind it (overlapping boxes would cut hard edges)
      ? new THREE.ShaderMaterial({ vertexShader: SOFT_VERT, fragmentShader: SOFT_FRAG, side: THREE.DoubleSide,
          transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, depthTest: false, uniforms: {
          uColor: { value: lin(b.color ?? '#ffffff', b.power ?? 4) }, uSoft: { value: new THREE.Vector2(...(b.soft ?? [0.001, 0.001])) },
          uGrad: { value: new THREE.Vector2(...(b.grad ?? [1, 1])) }, uDisc: { value: disc ? 1 : 0 } } })
      : new THREE.MeshBasicMaterial({ color: lin(b.color ?? '#ffffff', b.power ?? 4), side: THREE.DoubleSide });
    const m = new THREE.Mesh(geo, mat);
    place(m, b.dir, b.dist ?? 10);
    if (b.roll) m.rotateZ(b.roll);
  }
  for (const c of spec.cards ?? []) {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(c.size[0], c.size[1]), new THREE.MeshBasicMaterial({ color: lin(c.color ?? '#000000', c.power ?? 1), side: THREE.DoubleSide }));
    place(m, c.dir, c.dist ?? 9);
    if (c.roll) m.rotateZ(c.roll);
  }
  if (spec.sun) {
    const s = spec.sun;
    const m = new THREE.Mesh(new THREE.SphereGeometry(s.size ?? 0.6, 32, 16), new THREE.MeshBasicMaterial({ color: lin(s.color ?? '#fff3e0', s.power ?? 200) }));
    place(m, s.dir, 30);
  }
  return scene;
}

export function buildEnv(renderer, spec) {
  const pm = new THREE.PMREMGenerator(renderer);
  const scene = buildEnvScene(spec);
  const rt = pm.fromScene(scene, spec.blur ?? 0, 0.1, 100, { size: spec.size ?? 256 });
  pm.dispose();
  scene.traverse((o) => { o.geometry?.dispose?.(); o.material?.dispose?.(); });
  return rt.texture;
}

// A gold studio for a polished plate seen from the front and above: its mirror looks up and back, so the studio is a
// dark room with one broad soft panel behind — bright at its foot, fading upward — which the plate holds as a light
// sweep running from its far edge into deep gold at the near edge; two thin strips catch the channel walls.
const GOLDS = new Map();
export function goldStudio(renderer, { power = 2.4, azimuth = 0 } = {}) {
  const key = `${power}|${azimuth}`;
  if (GOLDS.has(key)) return GOLDS.get(key);
  const az = (d) => { const c = Math.cos(azimuth), s = Math.sin(azimuth); return [d[0] * c + d[2] * s, d[1], -d[0] * s + d[2] * c]; };
  const env = buildEnv(renderer, {
    zenith: '#0c0907', horizon: '#160f0b', ground: '#0a0705', sharp: 0.8, size: 512,
    boxes: [
      // one long soft band across the mirror angle, rolled, so the plate holds a diagonal sweep of light into deep gold
      { dir: az([0, 0.56, -0.83]), dist: 10, size: [16, 2.2], color: '#ffe6c4', power, soft: [0.3, 0.5], roll: 0.42 },
      { dir: az([0.2, 0.75, -0.63]), dist: 10, size: [12, 1.2], color: '#ffeedc', power: power * 0.35, soft: [0.3, 0.5], roll: 0.42 },
      { dir: az([0.9, 0.3, -0.3]), dist: 10, size: [0.3, 7], color: '#fff4e4', power: 7, soft: [0.4, 0.2] },
      { dir: az([-0.85, 0.5, 0.15]), dist: 10, size: [0.25, 6], color: '#fff4e4', power: 4, soft: [0.4, 0.2] },
      { dir: [0, -0.9, 0.3], dist: 10, size: [8, 8], color: '#5a3e28', power: 0.35 },
    ],
  });
  GOLDS.set(key, env);
  return env;
}

// A jade studio for an upright polished face seen from the front: its mirror looks back toward the lens, so a broad
// soft panel low in front (brightest at its top) lays a sheen over the upper face that fades down into the stone, and
// a thin strip catches the left bevel; gold leaf in the carving (satin) holds the panel as a warm glow.
let JADE_STUDIO = null;
export function jadeStudio(renderer) {
  if (JADE_STUDIO) return JADE_STUDIO;
  JADE_STUDIO = buildEnv(renderer, {
    zenith: '#0d0a08', horizon: '#18110c', ground: '#0a0806', sharp: 0.8, size: 512,
    boxes: [
      { dir: [-0.18, 0.05, 0.98], dist: 10, size: [9, 7], color: '#fff0dc', power: 1.3, soft: [0.35, 0.4], grad: [0.45, 1.0] },
      { dir: [-0.62, 0.12, 0.77], dist: 10, size: [0.35, 6], color: '#fff4e6', power: 5, soft: [0.45, 0.25] },
      { dir: [0.75, 0.35, 0.56], dist: 10, size: [4, 3], color: '#ffe2c0', power: 0.8, soft: [0.4, 0.4] },
    ],
  });
  return JADE_STUDIO;
}

// A diamond studio: black, with a constellation of small intense sources and two strips — what a diamond photographer
// surrounds a stone with so it scintillates (white fire against dark facets). Given to gem materials as their own
// envMap, so stones sparkle in any room without changing what the gold and jade see.
let GEM = null;
export function gemStudio(renderer) {
  if (GEM) return GEM;
  const boxes = [];
  const dirs = [[0.3, 0.9, 0.3], [-0.5, 0.8, 0.2], [0.7, 0.6, -0.3], [-0.2, 0.7, -0.7], [0.1, 0.5, 0.86], [-0.8, 0.4, -0.4],
    [0.85, 0.35, 0.4], [-0.45, 0.3, 0.84], [0.05, 0.98, -0.15], [0.55, 0.75, 0.35], [-0.65, 0.65, 0.4], [0.35, 0.45, -0.82]];
  dirs.forEach((d, i) => boxes.push({ dir: d, dist: 10, size: [0.35 + (i % 3) * 0.12, 0.35 + (i % 3) * 0.12], color: i % 4 === 0 ? '#fff3e0' : '#ffffff', power: 70 + (i % 5) * 25, shape: 'disc' }));
  boxes.push({ dir: [-0.9, 0.35, 0.1], dist: 10, size: [0.25, 6], color: '#ffffff', power: 18 });
  boxes.push({ dir: [0.92, 0.3, -0.1], dist: 10, size: [0.25, 6], color: '#ffffff', power: 14 });
  GEM = buildEnv(renderer, { zenith: '#0a0a0a', horizon: '#060606', ground: '#020202', sharp: 0.7, boxes });
  return GEM;
}
