// The field of ignored decks: thousands of sent slides adrift in the dark, each trailing the line it came in on —
// a line that stops at the deck and never comes back. Instanced cards + instanced trails, one draw call each.
// Light comes from three places, all uniforms/attributes on the timeline:
//   · the nova's ignition wave (a shell expanding from our deck),
//   · a scheduled chain ignition (aIgnite: seconds; the payoff line lights each deck it passes),
//   · uLit, a global floor.
// uGalaxy morphs every deck from its drift position to a two-armed spiral (the site's hero galaxy).
import * as THREE from 'three';
import { rng } from '../util.js';
import { buildAtlas, OURS } from './atlas.js';

export const DECK_W = 160;

const COMMON = /* glsl */ `
uniform float uTime, uGalaxy, uGalSpin, uCollapse;
uniform vec3 uGalC, uGalN;
attribute vec3 aPos, aGal, aDir;
attribute float aCell, aSeed, aIgnite;
vec3 rotAxis(vec3 p, vec3 ax, float a) { return p * cos(a) + cross(ax, p) * sin(a) + ax * dot(ax, p) * (1.0 - cos(a)); }
vec3 deckPos() {
  // spiral positions rotate differentially (inner arms faster) once the galaxy forms
  vec3 g = aGal;
  float r = length(g);
  g = rotAxis(g, uGalN, uGalSpin * (1.4 / (0.35 + r / 4000.0)));
  vec3 drift = aPos + vec3(sin(uTime * 0.21 + aSeed * 6.3), cos(uTime * 0.17 + aSeed * 4.1), 0.0) * 18.0;
  vec3 p = mix(drift, uGalC + g, smoothstep(0.0, 1.0, clamp(uGalaxy * 1.25 - aSeed * 0.25, 0.0, 1.0)));
  float c = clamp(uCollapse * 1.3 - (1.0 - smoothstep(0.0, 6000.0, length(g))) * 0.3, 0.0, 1.0);
  return mix(p, uGalC, c * c * (3.0 - 2.0 * c));
}
`;

const DECK_VERT = /* glsl */ `
${COMMON}
uniform vec2 uRes;
uniform float uSize, uFocus, uAperture, uFogNear, uFogFar;
attribute float aScale;
attribute vec2 aRot;
varying vec2 vUv;
varying float vCell, vLight, vCoc, vSpeck, vFade, vSeed, vDist;
uniform vec3 uWaveC;
uniform float uWaveR, uWaveW, uWaveAmp, uLit;
uniform vec3 uHeadP;
uniform float uHeadR, uHeadAmp, uOpenLit, uDarkR;
void main() {
  vec3 P = deckPos();
  vec4 mv = viewMatrix * vec4(P, 1.0);
  float dist = -mv.z;
  vDist = dist;
  // projected width in pixels; below ~2.2 px the card becomes a soft speck of the same average light
  float size = uSize * aScale * (1.0 - 0.85 * uCollapse);
  float px = size * projectionMatrix[0][0] * 0.5 * uRes.x / max(dist, 1.0);
  float grow = max(1.0, 2.2 / max(px, 1e-3));
  vSpeck = smoothstep(4.0, 2.2, px);
  float roll = (aSeed - 0.5) * 0.5;
  vec2 c = position.xy;
  vec2 q = vec2(c.x * cos(roll) - c.y * sin(roll), c.x * sin(roll) + c.y * cos(roll));
  vec3 corner = vec3(q * vec2(size, size * 0.5625) * grow, 0.0);
  float cy = cos(aRot.x), sy = sin(aRot.x), cp = cos(aRot.y), sp2 = sin(aRot.y);
  corner = vec3(corner.x * cy, corner.y, -corner.x * sy);
  corner = vec3(corner.x, corner.y * cp - corner.z * sp2, corner.y * sp2 + corner.z * cp);
  mv.xyz += corner * (1.0 - vSpeck) + vec3(q * vec2(size, size * 0.5625) * grow, 0.0) * vSpeck;
  gl_Position = projectionMatrix * mv;
  vUv = uv;
  vCell = aCell;
  vSeed = aSeed;
  // light: the ignition wave shell + a scheduled ignition + the global floor
  float d = length(P - uWaveC);
  float shell = exp(-pow((d - uWaveR) / uWaveW, 2.0)) * uWaveAmp;
  float chain = smoothstep(aIgnite, aIgnite + 0.35, uTime);
  float near = exp(-length(P - uHeadP) / uHeadR) * uHeadAmp;
  float open = uOpenLit * (1.0 - smoothstep(uDarkR - 1800.0, uDarkR, d));
  vLight = clamp(max(max(max(max(shell, chain), uLit), near), open), 0.0, 1.0);
  vCoc = clamp(uAperture * abs(dist - uFocus) / max(uFocus, 1.0), 0.0, 1.0);
  float fog = 1.0 - smoothstep(uFogNear, uFogFar, dist);
  vFade = smoothstep(180.0, 700.0, dist) * (1.0 - smoothstep(26000.0, 40000.0, dist)) / (grow * grow * 0.6 + 0.4);
  vFade *= mix(max(fog, vSpeck * 0.6), 1.0, vLight);
}
`;

const DECK_FRAG = /* glsl */ `
precision highp float;
uniform sampler2D tAtlas;
uniform float uDead, uPulse;
varying vec2 vUv;
varying float vCell, vLight, vCoc, vSpeck, vFade, vSeed, vDist;
float sdRound(vec2 p, vec2 b, float r) { vec2 q = abs(p) - b + r; return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r; }
void main() {
  vec2 cell = vec2(mod(vCell, 8.0), floor(vCell / 8.0));
  vec2 uv = (cell + vec2(vUv.x, 1.0 - vUv.y) * vec2(0.996, 0.993) + 0.002) / 8.0;
  vec3 tex = texture2D(tAtlas, uv, vCoc * 4.0).rgb;
  vec3 texLin = pow(tex, vec3(2.2));
  float lum = dot(texLin, vec3(0.2126, 0.7152, 0.0722));
  // dead: drained of colour, dim, cold. lit: the slide itself, lit from the front, with a cobalt/cyan edge.
  vec3 dead = mix(vec3(lum), texLin, 0.2) * vec3(0.5, 0.6, 0.9) * 0.075 * (1.0 - uDead * 0.6);
  // lit: the slide glows through a cobalt wash (white decks must not turn into blank paper)
  vec3 lit = mix(texLin, vec3(lum) * vec3(0.45, 0.62, 1.0), 0.45) * 0.72 + vec3(0.02, 0.05, 0.14);
  vec3 col = mix(dead, lit * (1.0 + 0.3 * uPulse), vLight);
  vec2 p = (vUv - 0.5) * vec2(1.0, 0.5625);
  float sd = sdRound(p, vec2(0.5, 0.28125), 0.03);
  float aa = fwidth(sd) + vCoc * 0.06;
  float a = 1.0 - smoothstep(-aa, aa, sd);
  float edge = exp(-abs(sd) / (0.01 + aa));
  vec3 rimC = mix(vec3(0.20, 0.30, 0.55) * 0.18, mix(vec3(0.36, 0.55, 1.0), vec3(0.2, 0.8, 0.92), vSeed) * 2.2, vLight);
  col += rimC * edge * 0.6;
  // speck: far decks collapse to a soft point of the same light
  float spk = exp(-dot(p * 2.2, p * 2.2) * 6.0);
  vec3 speckCol = mix(vec3(0.42, 0.5, 0.75) * 0.28, vec3(0.6, 0.8, 1.2) * 1.8, vLight);
  col = mix(col, speckCol * spk, vSpeck);
  a = mix(a, spk, vSpeck);
  a *= vFade * (1.0 - vCoc * 0.8);
  if (a < 0.003) discard;
  gl_FragColor = vec4(col * a, a);
}
`;

const TRAIL_VERT = /* glsl */ `
${COMMON}
uniform vec2 uRes;
uniform float uTrail, uWidth, uFogNear, uFogFar, uOpenLit, uDarkR;
varying float vU, vLight, vFade;
uniform vec3 uWaveC;
uniform float uWaveR, uWaveW, uWaveAmp, uLit;
void main() {
  vec3 P = deckPos();
  vec3 tdir = normalize(aDir);
  float len = (500.0 + aSeed * 1700.0) * uTrail;
  vec3 A = P - tdir * len * position.x;       // position.x ∈ [0,1]: 0 at the deck, 1 at the tail
  vec3 Bp = P - tdir * len * (position.x + 0.01);
  vec4 ca = projectionMatrix * viewMatrix * vec4(A, 1.0);
  vec4 cb = projectionMatrix * viewMatrix * vec4(Bp, 1.0);
  vec2 sa = ca.xy / ca.w, sb = cb.xy / cb.w;
  vec2 dir = normalize((sb - sa) * uRes + 1e-6);
  vec2 nrm = vec2(-dir.y, dir.x);
  ca.xy += nrm * position.y * uWidth / uRes * 2.0 * ca.w;
  gl_Position = ca;
  vU = position.x;
  float d = length(P - uWaveC);
  float shell = exp(-pow((d - uWaveR) / uWaveW, 2.0)) * uWaveAmp;
  float chain = smoothstep(aIgnite, aIgnite + 0.35, uTime);
  float open = uOpenLit * (1.0 - smoothstep(uDarkR - 1800.0, uDarkR, d));
  vLight = clamp(max(max(max(shell, chain), uLit), open), 0.0, 1.0);
  float dist = -(viewMatrix * vec4(P, 1.0)).z;
  vFade = smoothstep(300.0, 900.0, dist) * (1.0 - smoothstep(18000.0, 30000.0, dist));
  vFade *= mix(1.0 - smoothstep(uFogNear, uFogFar, dist), 1.0, vLight);
}
`;

const TRAIL_FRAG = /* glsl */ `
precision highp float;
varying float vU, vLight, vFade;
void main() {
  float a = pow(1.0 - vU, 1.6) * vFade;
  vec3 dead = vec3(0.25, 0.35, 0.7) * 0.10;
  vec3 lit = vec3(0.4, 0.75, 1.2) * 0.9;
  vec3 col = mix(dead, lit, vLight) * a;
  gl_FragColor = vec4(col, 1.0);
}
`;

export class DeckField {
  constructor({ count = 4800, park, avoid } = {}) {
    const R = rng(90210);
    const pos = new Float32Array(count * 3), gal = new Float32Array(count * 3), dir = new Float32Array(count * 3);
    const cell = new Float32Array(count), seed = new Float32Array(count), ign = new Float32Array(count).fill(1e6);
    const n = { x: 0, y: 0, z: 0 };
    const scl = new Float32Array(count), rot = new Float32Array(count * 2);
    for (let i = 0; i < count; i++) {
      // three shells around the park point: a loose near cluster, a mid field, and far specks like stars;
      // avoid() keeps the camera's paths clear
      let x, y, z;
      const shell = i < count * 0.07 ? 0 : i < count * 0.37 ? 1 : 2;
      for (;;) {
        const sp = [[2600, 1500, 2600], [9000, 5200, 12000], [34000, 20000, 40000]][shell];
        x = park.x + (R() - 0.5) * sp[0];
        y = park.y + (R() - 0.5) * sp[1];
        z = park.z + (R() - 0.55) * sp[2];
        if (!avoid || !avoid(x, y, z)) break;
      }
      pos.set([x, y, z], i * 3);
      // two-armed logarithmic spiral in the galaxy's own plane (x–z), with scatter and a thin bulge
      const arm = i % 2, tt = Math.pow(R(), 0.8);
      const r = 250 + tt * 6200;
      const th = arm * Math.PI + Math.log(r / 250) * 1.9 + (R() - 0.5) * (0.5 + 0.9 * (1 - tt));
      const sc = (R() - 0.5) * 420 * (1 - tt * 0.5);
      gal.set([Math.cos(th) * r + sc, (R() - 0.5) * 160 * (1 - tt) , Math.sin(th) * r + sc], i * 3);
      // the line each deck came in on: roughly from the viewer's side, outward
      n.x = x - park.x * 0.2; n.y = y - park.y * 0.2 - 900; n.z = z - 3000;
      const l = Math.hypot(n.x, n.y, n.z) || 1;
      dir.set([n.x / l, n.y / l, n.z / l], i * 3);
      cell[i] = Math.floor(R() * OURS);
      seed[i] = R();
      scl[i] = 0.7 + Math.pow(R(), 2) * 0.9;
      R(); R();   // two draws that fed a retired fly-in, kept so the seeded layout stays exactly as rendered
      rot.set([(R() - 0.5) * 1.1, (R() - 0.5) * 0.7], i * 2);
    }
    this.count = count;
    this.pos = pos;
    this.ign = ign;

    const atlas = new THREE.CanvasTexture(buildAtlas());
    atlas.colorSpace = THREE.NoColorSpace;
    atlas.generateMipmaps = true;
    atlas.minFilter = THREE.LinearMipmapLinearFilter;
    atlas.anisotropy = 8;
    const u = (v) => ({ value: v });
    this.uniforms = {
      tAtlas: u(atlas), uTime: u(0), uRes: u(new THREE.Vector2(1920, 1080)), uSize: u(DECK_W), uFocus: u(1500), uAperture: u(0.6), uFogNear: u(2600), uFogFar: u(6500),
      uDead: u(0), uPulse: u(0), uWaveC: u(new THREE.Vector3()), uWaveR: u(-1e5), uWaveW: u(500), uWaveAmp: u(0), uLit: u(0),
      uHeadP: u(new THREE.Vector3(0, 0, 1e7)), uHeadR: u(600), uHeadAmp: u(0), uOpenLit: u(0), uDarkR: u(1e6),
      uGalaxy: u(0), uGalSpin: u(0), uCollapse: u(0), uGalC: u(new THREE.Vector3()), uGalN: u(new THREE.Vector3(0, 1, 0)),
      uTrail: u(1), uWidth: u(1.2),
    };

    const quad = new THREE.PlaneGeometry(1, 1);
    const g = new THREE.InstancedBufferGeometry();
    g.index = quad.index;
    g.setAttribute('position', quad.getAttribute('position'));
    g.setAttribute('uv', quad.getAttribute('uv'));
    const inst = (a, k) => new THREE.InstancedBufferAttribute(a, k);
    this.ignAttr = inst(ign, 1);
    g.setAttribute('aPos', inst(pos, 3)); g.setAttribute('aGal', inst(gal, 3)); g.setAttribute('aDir', inst(dir, 3));
    g.setAttribute('aCell', inst(cell, 1)); g.setAttribute('aSeed', inst(seed, 1)); g.setAttribute('aIgnite', this.ignAttr);
    g.setAttribute('aScale', inst(scl, 1)); g.setAttribute('aRot', inst(rot, 2));
    g.instanceCount = count;
    this.cards = new THREE.Mesh(g, new THREE.ShaderMaterial({
      vertexShader: DECK_VERT, fragmentShader: DECK_FRAG, uniforms: this.uniforms,
      transparent: true, depthWrite: false, premultipliedAlpha: true, blending: THREE.CustomBlending,
      blendSrc: THREE.OneFactor, blendDst: THREE.OneMinusSrcAlphaFactor,
    }));

    // trails: a 2-vertex-wide strip per deck, 16 segments long
    const SEG = 16, tp = [], ti = [];
    for (let k = 0; k <= SEG; k++) { tp.push(k / SEG, -0.5, 0, k / SEG, 0.5, 0); if (k < SEG) { const a = k * 2; ti.push(a, a + 1, a + 2, a + 1, a + 3, a + 2); } }
    const tg = new THREE.InstancedBufferGeometry();
    tg.setIndex(ti);
    tg.setAttribute('position', new THREE.Float32BufferAttribute(tp, 3));
    tg.setAttribute('aPos', inst(pos, 3)); tg.setAttribute('aGal', inst(gal, 3)); tg.setAttribute('aDir', inst(dir, 3));
    tg.setAttribute('aCell', inst(cell, 1)); tg.setAttribute('aSeed', inst(seed, 1)); tg.setAttribute('aIgnite', this.ignAttr);
    tg.instanceCount = count;
    this.trails = new THREE.Mesh(tg, new THREE.ShaderMaterial({
      vertexShader: TRAIL_VERT, fragmentShader: TRAIL_FRAG, uniforms: this.uniforms,
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    }));
    this.cards.frustumCulled = this.trails.frustumCulled = false;
    this.cards.renderOrder = 0;
    this.trails.renderOrder = -1;
    this.group = new THREE.Group();
    this.group.add(this.trails, this.cards);
  }

  // Schedule the chain ignition: each deck lights when the payoff line passes within `radius` of it.
  scheduleIgnition(pathPoints, pathTimes, radius, jitter = 0.25) {
    const R = rng(777);
    for (let i = 0; i < this.count; i++) {
      const x = this.pos[i * 3], y = this.pos[i * 3 + 1], z = this.pos[i * 3 + 2];
      let best = 1e9, bt = 1e6;
      for (let k = 0; k < pathPoints.length; k++) {
        const p = pathPoints[k];
        const d = Math.hypot(p.x - x, p.y - y, p.z - z);
        if (d < best) { best = d; bt = pathTimes[k]; }
      }
      // decks near the line light first; the rest catch as the light spreads outward
      this.ign[i] = best < radius ? bt + (best / radius) * 0.9 + R() * jitter : bt + 0.9 + (best - radius) / 2400 + R() * jitter * 2;
    }
    this.ignAttr.needsUpdate = true;
  }
}
