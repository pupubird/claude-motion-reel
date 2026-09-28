// The 3D world, one continuous space for the whole film: the dark, the field of ignored decks, our deck, the
// nova, Nova (the orb), the line. One camera, flown on the beat. Units are design pixels at the pixel-exact
// distance D (fov 30°), so anything placed at distance D from the camera draws 1:1 with the 2D layer.
import * as THREE from 'three';
import { W, H, BEAT, DURATION, S } from '../config.js';
import { ease, clamp, lerp, seg, wobble } from '../util.js';
import { B, SEND, NOVA, READ, TITLE1, DOTS, KB, TWIN, LINK, ROOM, PAYOFF, SIGN, absorbAt, hitPulse } from '../score.js';
import { drawRoomFrame } from './room.js';
import { SLIDES } from '../assets.js';
import { Sky } from '../gl/sky.js';
import { DeckField, DECK_W } from '../gl/decks.js';
import { Ribbon, spline } from '../gl/ribbon.js';
import { Flare } from '../gl/flare.js';
import { Orb } from '../gl/orb.js';

export const FOV = 30;
export const D = (H / 2) / Math.tan((FOV / 2) * Math.PI / 180);   // 2015.3
export const PARK = new THREE.Vector3(0, 60, -7000);             // where our deck stops, and Nova is born
const HERO_W = 1040, HERO_H = HERO_W * 9 / 16;

let scene, camera, sky, field, hero, heroMat, flare, orb, ring = [], link, screen, screenMat, payoff, camIV = null, halo;
// the recipient's screen, far out past the field: the live line ends here and the room fills it
export const SC = new THREE.Vector3(1500, 520, -13800);
const V = (x, y, z) => new THREE.Vector3(x, y, z);
const tmp = new THREE.Vector3();

// shared with the 2D layer: screen positions of 3D anchors, refreshed every sub-frame
export const PROBE = { deck: { x: W / 2, y: H / 2, s: 1 }, orb: { x: W / 2, y: H / 2, r: 0 } };

function slideTexture(img) {
  const t = new THREE.Texture(img);
  t.colorSpace = THREE.SRGBColorSpace;
  t.generateMipmaps = true;
  t.minFilter = THREE.LinearMipmapLinearFilter;
  t.anisotropy = 16;
  t.needsUpdate = true;
  return t;
}

// A slide as a physical card: rounded corners, a hairline, light that can sweep across it, and a "heat" that
// burns it to white (the nova starts from our deck).
const CARD_FRAG = /* glsl */ `
precision highp float;
uniform sampler2D tMap;
uniform float uAlpha, uSweep, uHeat, uDim, uScan, uAspect;
varying vec2 vUv;
float sdRound(vec2 p, vec2 b, float r) { vec2 q = abs(p) - b + r; return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r; }
void main() {
  vec3 c = texture2D(tMap, vUv).rgb;          // sRGB textures are decoded to linear by the GPU (SRGB8_ALPHA8)
  vec2 p = (vUv - 0.5) * vec2(1.0, 1.0 / uAspect);
  float sd = sdRound(p, vec2(0.5, 0.5 / uAspect), 0.012);
  float aa = fwidth(sd);
  float a = 1.0 - smoothstep(-aa, aa, sd);
  float edge = exp(-abs(sd) / (aa * 1.5 + 0.0015));
  // a soft light sweeping diagonally across the surface
  float sw = exp(-pow((vUv.x + vUv.y * 0.35 - uSweep) / 0.12, 2.0));
  // a reading scan: a thin bright line with a cobalt wake
  float sl = exp(-pow((vUv.x - uScan) / 0.004, 2.0)) * 2.0 + exp(-max(uScan - vUv.x, 0.0) / 0.08) * step(vUv.x, uScan) * 0.25;
  vec3 col = c * (1.0 - uDim) + vec3(0.9, 0.95, 1.0) * sw * 0.08 + vec3(0.25, 0.45, 1.0) * sl * step(0.001, uScan) * step(uScan, 0.999);
  col += vec3(0.55, 0.68, 0.95) * edge * 0.32;
  col = mix(col, vec3(8.0, 8.5, 9.5), uHeat);
  gl_FragColor = vec4(col * a * uAlpha, a * uAlpha);
}
`;
const CARD_VERT = /* glsl */ `varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`;

function card(img, w, h) {
  const m = new THREE.ShaderMaterial({
    vertexShader: CARD_VERT, fragmentShader: CARD_FRAG, transparent: true, depthWrite: true,
    premultipliedAlpha: true, blending: THREE.CustomBlending, blendSrc: THREE.OneFactor, blendDst: THREE.OneMinusSrcAlphaFactor,
    uniforms: { tMap: { value: slideTexture(img) }, uAlpha: { value: 1 }, uSweep: { value: -1 }, uHeat: { value: 0 }, uDim: { value: 0 },
      uScan: { value: -1 }, uAspect: { value: w / h } },
  });
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(w, h), m);
  mesh.frustumCulled = false;
  mesh.renderOrder = -2;
  return { mesh, m };
}

// The opening galaxy: the field's own two-armed spiral, centred so that our deck (PARK) lies on arm 0 at r = 3000.
const GAL_TH = Math.log(3000 / 250) * 1.9;
export const GC = PARK.clone().sub(V(Math.cos(GAL_TH) * 3000, 0, Math.sin(GAL_TH) * 3000));
const GAL_VIEW = GC.clone().add(V(-1500, 15500, 16500));        // the whole spiral, seen from above and in front
const OUT = GAL_VIEW.clone().sub(PARK).normalize();
const FAR = GAL_VIEW.distanceTo(PARK);
// powers of ten: distance interpolated in log space (constant zoom speed), with an orbit swinging round
function camOpen(gb) {
  const p = ease.inOutCubic(seg(gb, SEND.pull0, SEND.pull1));
  // then, as the lights go out along the arms, close in on the last light (log space again), and hold for the silence
  const close = ease.inOutSine(seg(gb, SEND.dark0 - 0.4, 10.6));
  const dist = Math.exp(lerp(Math.log(166), Math.log(FAR), p) + Math.log(0.2) * close);
  const dir = OUT.clone().applyAxisAngle(V(0, 1, 0), lerp(-0.55, 0.12, p) + 0.1 * close);
  // the macro start looks straight at the slide; the far end frames the spiral with our deck still in it
  if (p < 1e-6) dir.set(0, 0, 1);
  else dir.lerp(V(0, 0, 1), Math.pow(1 - p, 6)).normalize();
  const pos = PARK.clone().addScaledVector(dir, dist);
  const look = PARK.clone().lerp(GC.clone().lerp(PARK, 0.35), seg(gb, SEND.pull0 + 1.2, SEND.pull1, ease.inOutSine) * (1 - close));
  return { pos, look, roll: 0.06 * Math.sin(Math.PI * seg(gb, SEND.pull0, SEND.pull1)) };
}

const linkU = (gb) => ease.inOutCubic(clamp((gb - LINK.launch) / (LINK.arrive - LINK.launch)));

// Act VII–VIII: observe the payoff line light the field, rise over the galaxy, fall onto its collapsed centre
const C7 = { p0: PARK.clone().add(V(-900, 1300, 4800)), l0: PARK.clone().add(V(300, -200, -1500)) };
function camPayoff(gb) {
  const a = seg(gb, PAYOFF.in, PAYOFF.w2, ease.inOutSine);
  const b = seg(gb, PAYOFF.w2 - 0.5, PAYOFF.collapse0, ease.inOutCubic);
  const c = seg(gb, PAYOFF.collapse0, PAYOFF.sign0, ease.inOutCubic);
  const pos = C7.p0.clone().lerp(PARK.clone().add(V(1800, 3000, 6600)), a);
  pos.lerp(PARK.clone().add(V(0, 9400, 8800)), b);
  pos.lerp(PARK.clone().add(V(0, 7000, 6400)), c);
  const look = C7.l0.clone().lerp(PARK, Math.max(a * 0.8, b));
  // hold the field and the galaxy high in frame for the title; re-centre as it collapses (the N is drawn at centre)
  const hi = seg(gb, PAYOFF.in, PAYOFF.in + 1, ease.inOutSine) * (1 - seg(gb, PAYOFF.collapse0 - 0.3, PAYOFF.collapse1, ease.inOutCubic));
  look.y -= 1500 * hi * lerp(0.35, 1, b);
  pos.x += wobble(gb * 0.5, 1) * 10;
  return { pos, look, roll: -0.03 * Math.sin(a * Math.PI) };
}

function camAt(gb) {
  if (gb >= PAYOFF.in) return camPayoff(gb);
  const pos = V(0, 0, D), look = V(0, 0, 0);
  let roll = 0;
  // Act I — powers of ten out to the galaxy; a lean toward our deck while someone seems to type
  const co = camOpen(gb);
  pos.copy(co.pos); look.copy(co.look); roll = co.roll;
  const hope = seg(gb, DOTS.on - 0.4, DOTS.stop, ease.inOutSine) * (1 - seg(gb, DOTS.stop + 0.1, TITLE1.dim1 + 0.4, ease.inOutSine));
  pos.lerp(PARK, 0.12 * hope);
  // Act II — the nova knocks the camera back a little, then we push in as the light becomes Nova
  const knock = seg(gb, NOVA.hit, NOVA.hit + 1.5, ease.outCubic) * (1 - seg(gb, NOVA.hit + 1.5, NOVA.push0, ease.inOutSine));
  pos.addScaledVector(OUT, knock * 900);
  const push = seg(gb, NOVA.push0, NOVA.form1, ease.inOutQuart);
  pos.lerp(PARK.clone().add(V(0, 0, 980)), push);
  look.lerp(PARK, seg(gb, NOVA.push0, NOVA.push0 + 1.6, ease.inOutSine));
  // Act III — hold the hero framing and creep in while the pages stream past the lens into the orb
  const creep3 = seg(gb, READ.spawn0, 30, ease.inOutSine);
  if (gb > NOVA.form1) {
    const gather = seg(gb, TWIN.title - 0.5, LINK.fire, ease.inOutSine);
    const a = lerp(0, -0.22, creep3) - 0.5 * gather, r = lerp(980, 900, creep3) - 150 * gather;
    pos.set(PARK.x + Math.sin(a) * r, PARK.y + lerp(0, 70, creep3) + 110 * gather, PARK.z + Math.cos(a) * r);
    look.copy(PARK);
    // bar 7: pan so Nova sits in the left third and its Knowledge Base can build on the right
    const pan = seg(gb, KB.panel - 0.5, KB.panel + 0.5, ease.inOutCubic) * (1 - seg(gb, KB.fold0, KB.fold1 + 0.5, ease.inOutCubic));
    const side = V(Math.cos(a), 0, -Math.sin(a));
    look.addScaledVector(side, 185 * pan);
  }
  // Act IV — ride the live line out through the dead decks and arrive square on the recipient's screen
  if (gb >= LINK.launch && link) {
    if (gb >= ROOM.in - 1e-6) return { pos: SC.clone().add(V(0, 0, D)), look: SC.clone(), roll: 0 };   // hidden under the 2D room until the payoff
    // its own smooth spline: from exactly where Act III's camera is, behind the line, to the pixel-exact landing
    if (!camIV) {
      const c0 = camAt(LINK.launch - 1e-4).pos;
      camIV = new THREE.CatmullRomCurve3([c0, PARK.clone().add(V(150, 220, -500)), PARK.clone().add(V(820, 380, -2900)),
        SC.clone().add(V(0, 30, D + 1400)), SC.clone().add(V(0, 0, D))], false, 'centripetal');
    }
    const p = ease.inOutCubic(seg(gb, LINK.launch + 0.1, ROOM.in));
    pos.copy(camIV.getPoint(p));
    // look at the head (averaged along the path, so the aim never twitches), then settle on the screen's centre
    const u = linkU(gb);
    const head = V(0, 0, 0);
    for (let k = -2; k <= 2; k++) head.add(link.pointAt(clamp(u + k * 0.012)));
    head.multiplyScalar(0.2);
    const from = camAt(LINK.launch - 1e-4).look;
    look.copy(from).lerp(head, seg(gb, LINK.launch, LINK.launch + 0.7, ease.inOutCubic));
    look.lerp(SC, seg(gb, LINK.arrive - 0.8, ROOM.in, ease.inOutSine));
    roll = -0.04 * Math.sin(Math.PI * seg(gb, LINK.launch, LINK.arrive));
    return { pos, look, roll };
  }
  // a breathing drift everywhere, so nothing is ever perfectly still — except the landing on the screen,
  // which must be exact for the cut to the 2D room
  const still = 1 - seg(gb, LINK.arrive - 1.2, LINK.arrive - 0.2, ease.inOutSine);
  pos.x += wobble(gb * 0.5, 1) * 14 * still;
  pos.y += wobble(gb * 0.5, 2) * 10 * still;
  return { pos, look, roll };
}

export default {
  id: 'world',
  init(env) {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(FOV, W / H, 5, 120000);
    sky = new Sky();
    scene.add(sky.group);
    // the live line's path, monotonic in depth: every control point is further out than the last (a U-turn here whips the camera)
    const linkPts = spline([PARK.clone(), PARK.clone().add(V(380, -200, -1200)), PARK.clone().add(V(1100, 270, -2600)),
      SC.clone().add(V(-120, -40, 2400)), SC.clone().add(V(0, 0, 1100)), SC.clone()], 60);
    // keep the camera's paths clear of decks
    const avoid = (x, y, z) => {
      if (z > 2600) return true;
      // a tube along the z axis through our deck: the opening starts on it and Acts II–III frame the orb down it
      if (Math.abs(x - 90) < 470 && Math.abs(y - 40) < 360 && z > PARK.z - 900) return true;
      if (Math.abs(x - 90) < 380 && Math.abs(y - 40) < 300) return true;
      // the screen's viewing volume and the live line's corridor
      if (Math.abs(x - SC.x) < 1500 && Math.abs(y - SC.y) < 900 && z > SC.z - 200 && z < SC.z + D + 600) return true;
      for (let i = 0; i < linkPts.length; i += 6) if (linkPts[i].distanceTo(tmp.set(x, y, z)) < 380) return true;
      return false;
    };
    field = new DeckField({ count: 4800, park: PARK, avoid });
    scene.add(field.group);
    ({ mesh: hero, m: heroMat } = card(SLIDES[0], HERO_W, HERO_H));
    scene.add(hero);
    flare = new Flare();
    scene.add(flare.mesh);
    halo = new Flare();
    scene.add(halo.mesh);
    orb = new Orb();
    scene.add(orb.group);
    // the deck's pages for "It reads"
    for (let k = 0; k < 8; k++) { const c = card(SLIDES[k], 320, 180); ring.push(c); scene.add(c.mesh); }
    link = new Ribbon(700);
    link.setPath(linkPts);
    // the payoff line: from the frame centre (where Act VI's lime point sits) through the field, lighting every deck
    const f0 = C7.l0.clone().sub(C7.p0).normalize();
    const P0 = C7.p0.clone().addScaledVector(f0, D);
    payoff = new Ribbon(800);
    payoff.setPath(spline([P0, PARK.clone().add(V(-1700, 500, 1600)), PARK.clone().add(V(-2600, -300, -1400)), PARK.clone().add(V(-300, 250, -3400)),
      PARK.clone().add(V(2500, -250, -1600)), PARK.clone().add(V(2300, 350, 1700)), PARK.clone().add(V(-200, 0, 700)), PARK.clone()], 70));
    scene.add(payoff.mesh);
    const pts = payoff.points, times = pts.map((_, i) => B(PAYOFF.in) + (i / (pts.length - 1)) * (B(PAYOFF.w2) - B(PAYOFF.in)));
    field.scheduleIgnition(pts, times, 1500);
    scene.add(link.mesh);
    // the recipient's screen: the room, rendered by the same function as the 2D shot, so the cut is invisible
    const cv = document.createElement('canvas'); cv.width = W; cv.height = H;
    drawRoomFrame(cv.getContext('2d'), B(ROOM.in));
    const tex = new THREE.CanvasTexture(cv); tex.colorSpace = THREE.SRGBColorSpace; tex.generateMipmaps = true;
    tex.minFilter = THREE.LinearMipmapLinearFilter; tex.anisotropy = 16;
    screenMat = new THREE.ShaderMaterial({
      uniforms: { tMap: { value: tex }, uOn: { value: 0 }, uAlpha: { value: 0 } },
      vertexShader: CARD_VERT,
      fragmentShader: `precision highp float; uniform sampler2D tMap; uniform float uOn, uAlpha; varying vec2 vUv;
        void main() {
          vec3 c = texture2D(tMap, vUv).rgb;          // sRGB textures are decoded to linear by the GPU (SRGB8_ALPHA8)
          float r = length((vUv - 0.5) * vec2(1.7778, 1.0));
          float R = uOn * 2.2;
          float lit = smoothstep(R, R - 0.08, r);
          float edge = exp(-pow((r - R) / 0.03, 2.0)) * step(0.001, uOn) * (1.0 - smoothstep(0.85, 1.0, uOn));
          vec2 q = abs(vUv - 0.5) * 2.0;
          float rim = exp(-(1.0 - max(q.x, q.y)) / 0.004);
          vec3 dark = vec3(0.006, 0.01, 0.03) + vec3(0.25, 0.5, 1.2) * rim * 1.4;
          vec3 col = mix(dark, c, lit) + vec3(0.6, 0.85, 1.4) * edge * 2.0;
          gl_FragColor = vec4(col * uAlpha, uAlpha);
        }`,
      transparent: true, depthWrite: true,
    });
    screen = new THREE.Mesh(new THREE.PlaneGeometry(W, H), screenMat);
    screen.position.copy(SC);
    screen.frustumCulled = false;
    scene.add(screen);
    for (const o of [field.uniforms, flare.uniforms, orb.uniforms, link.uniforms, payoff.uniforms, halo.uniforms]) o.uRes.value.set(W * S, H * S);
  },
  three: {
    start: 0, end: DURATION,
    update(t) {
      const gb = t / BEAT;
      const cam = camAt(gb);
      camera.position.copy(cam.pos);
      camera.up.set(Math.sin(cam.roll), Math.cos(cam.roll), 0);
      camera.lookAt(cam.look);
      camera.updateMatrixWorld();
      sky.follow(camera);
      sky.uniforms.uTime.value = t;
      sky.uniforms.uNebula.value = lerp(lerp(0.55, 0.25, seg(gb, SEND.dark0, SEND.dark1)), 0.8, seg(gb, NOVA.hit, NOVA.hit + 2, ease.outCubic));
      sky.uniforms.uStars.value = lerp(0.55, 1, seg(gb, NOVA.hit, NOVA.hit + 2));

      /* ── the field ─────────────────────────────────── */
      const F = field.uniforms;
      F.uTime.value = t;
      F.uFocus.value = camera.position.distanceTo(PARK);
      F.uAperture.value = lerp(0.12, 0.6, seg(gb, NOVA.push0, NOVA.form1, ease.inOutSine));
      F.uDead.value = seg(gb, TITLE1.dim0, 11.8, ease.inOutSine) * (1 - seg(gb, NOVA.hit, NOVA.hit + 0.2));
      F.uWaveC.value.copy(PARK);
      const wv = seg(gb, NOVA.wave0, NOVA.wave1, ease.outCubic);
      F.uWaveR.value = gb < NOVA.wave0 ? -1e5 : lerp(0, 16000, wv);
      F.uWaveW.value = lerp(350, 1600, wv);
      F.uWaveAmp.value = gb < NOVA.wave0 ? 0 : 1 - seg(gb, NOVA.wave0 + 2.5, NOVA.wave1 + 1.5);
      F.uTrail.value = 1;
      // the opening galaxy: lit, then darkness closes in along the arms toward our deck (the last light);
      // during the dive into the nova it unfolds into the local field around the orb
      if (gb < PAYOFF.in) {
        F.uGalaxy.value = 1 - seg(gb, NOVA.push0, NOVA.form1, ease.inOutCubic);
        F.uGalC.value.copy(GC);
        F.uGalSpin.value = 0;
        F.uCollapse.value = 0;
        F.uTrail.value = lerp(0.18, 1, 1 - F.uGalaxy.value);
      }
      F.uOpenLit.value = 1 - seg(gb, SEND.dark1, SEND.dark1 + 0.4);
      F.uDarkR.value = gb < SEND.dark0 ? 1e6 : lerp(30000, 300, ease.inOutSine(seg(gb, SEND.dark0, SEND.dark1)));

      /* ── our deck: one card on one arm of the galaxy → the last light → dims → burns ── */
      hero.position.copy(PARK);
      hero.scale.setScalar(DECK_W / HERO_W);
      hero.quaternion.copy(camera.quaternion);
      heroMat.uniforms.uAlpha.value = seg(gb, 0, 0.12) * (1 - seg(gb, NOVA.hit, NOVA.hit + 0.35));
      heroMat.uniforms.uSweep.value = lerp(-0.6, 1.7, seg(gb, 0.05, 1.3, ease.inOutSine));
      heroMat.uniforms.uDim.value = lerp(0, 0.55, seg(gb, DOTS.stop, DOTS.stop + 1.4, ease.inOutSine)) * (1 - seg(gb, 11.4, NOVA.hit));
      heroMat.uniforms.uHeat.value = seg(gb, 11.6, NOVA.hit, ease.inExpo);
      hero.visible = gb < NOVA.hit + 0.4;
      const last = seg(gb, SEND.dark0 + 1.5, SEND.dark1, ease.inOutSine) * (1 - seg(gb, DOTS.stop, DOTS.stop + 1.2, ease.inOutSine));
      halo.set({ pos: PARK, size: 500, coreR: 12, core: 0.22 * last, streak: 0.12 * last, rays: 0, ring: 0 });

      /* ── the nova ─────────────────────────────────── */
      const ht = (gb - NOVA.hit) * BEAT;   // seconds since the hit
      if (ht >= 0 && ht < 6) {
        // a hard white burst that collapses to a steady point of light, which the orb then grows out of
        const star = 0.22 * (1 - seg(gb, NOVA.form0, NOVA.form0 + 1.5));
        flare.set({ pos: PARK, size: 1500, coreR: lerp(20, 34, clamp(ht / 0.25)), core: Math.exp(-ht / 0.28) * 1.6 + star + (ht < 0.05 ? 1.2 : 0),
          streak: Math.exp(-ht / 0.45) * 0.7 + star * 0.35, rays: Math.exp(-ht / 0.35) * 0.4, ring: 0,
          ringR: 1700 * (1 - Math.exp(-ht / 0.5)), ringW: 30 + ht * 70 });
      } else flare.set({ pos: PARK, core: 0, streak: 0, rays: 0, ring: 0 });

      /* ── Nova, the orb ─────────────────────────────── */
      const form = seg(gb, NOVA.form0 - 0.5, NOVA.form1, ease.outCubic);
      const born = gb >= NOVA.form0 - 0.5;
      const breathe = 1 + 0.015 * Math.sin(t * 2.2);
      orb.set({ camera, pos: PARK, r: 120 * lerp(0.2, 1, form) * breathe, time: t, visible: born,
        normal: V(Math.sin(t * 0.45) * 0.35, 1, Math.cos(t * 0.31) * 0.3), level: -0.08 + 0.05 * Math.sin(t * 0.7), wave: 0.035,
        heat: 1 - seg(gb, NOVA.form0 - 0.3, NOVA.form0 + 0.9, ease.outCubic), glow: lerp(0, 0.9, form), bright: 1, speak: 0,
        wave: 0.035 + 0.05 * seg(gb, TWIN.title, LINK.fire, ease.inCubic) });

      /* ── Act IV: Nova collapses to the point that becomes the link; the live line; the screen ── */
      const col = seg(gb, LINK.fire, LINK.fire + 0.22, ease.inExpo);
      if (col > 0) {
        orb.uniforms.uR.value *= 1 - col;
        orb.uniforms.uHeat.value = Math.max(orb.uniforms.uHeat.value, col);
        orb.group.visible = col < 1;
      }
      const lu = linkU(gb);
      link.set({ head: Math.max(1e-4, lu), tail: Math.max(0, lu - 0.3), width: 24, core: 1.9, bright: 1.35, fadeLen: 0.12,
        visible: gb >= LINK.launch && gb < LINK.arrive + 0.15 });
      const hp = link.pointAt(lu);
      F.uHeadP.value.copy(hp);
      F.uHeadAmp.value = gb >= LINK.launch && gb < LINK.arrive ? 0.85 : 0;
      F.uHeadR.value = 460;
      screen.visible = gb >= LINK.launch - 0.5 && gb < ROOM.in + 1;
      screenMat.uniforms.uAlpha.value = seg(gb, LINK.launch - 0.5, LINK.launch + 0.8);
      screenMat.uniforms.uOn.value = seg(gb, LINK.arrive - 0.05, ROOM.in - 0.1, ease.outCubic);
      if (gb >= LINK.fire && gb < LINK.launch) {
        // the point burns only while it is a point: gone while the field is open, back for the fold and launch
        const pt = (1 - seg(gb, LINK.fire + 0.25, LINK.field0 + 0.2)) + seg(gb, LINK.fold + 0.2, LINK.launch);
        flare.set({ pos: PARK, size: 600, coreR: 16, core: 0.5 * pt, streak: 0.3 * pt, rays: 0, ring: 0 });
      }
      else if (gb >= LINK.launch && gb < LINK.arrive + 0.2) flare.set({ pos: hp, size: 700, coreR: 14, core: 0.45, streak: 0.15, rays: 0, ring: 0 });

      /* ── Act VII: the line lights every ignored deck; the field becomes a galaxy; the galaxy collapses ── */
      const pu = ease.inOutSine(seg(gb, PAYOFF.in, PAYOFF.w2));
      payoff.set({ head: Math.max(1e-4, pu), tail: Math.max(0, pu - 0.35), width: 24, core: 1.9, bright: 1.15, fadeLen: 0.15,
        visible: gb >= PAYOFF.in && gb < PAYOFF.w2 + 0.4 });
      if (gb >= PAYOFF.in) {
        const gx = seg(gb, PAYOFF.w2, PAYOFF.collapse0, ease.inOutCubic);
        F.uLit.value = seg(gb, PAYOFF.w2 - 0.5, PAYOFF.w2 + 1.5, ease.inOutSine);
        F.uGalaxy.value = gx;
        F.uGalC.value.copy(PARK);
        F.uGalN.value.set(0, 1, 0);
        F.uGalSpin.value = 0.9 * Math.pow(seg(gb, PAYOFF.w2, PAYOFF.sign0), 1.6) + 1.6 * Math.pow(seg(gb, PAYOFF.collapse0, PAYOFF.sign0), 2);
        F.uCollapse.value = seg(gb, PAYOFF.collapse0, PAYOFF.collapse1, ease.inCubic);
        F.uFogNear.value = 2600 + 20000 * seg(gb, PAYOFF.in, PAYOFF.w2);
        F.uFogFar.value = 6500 + 30000 * seg(gb, PAYOFF.in, PAYOFF.w2);
        F.uAperture.value = 0.25;
        F.uWaveAmp.value = 0;
        field.group.visible = gb < PAYOFF.collapse1 + 0.1;
        const cp = seg(gb, PAYOFF.collapse0, PAYOFF.collapse1, ease.inCubic), gone = seg(gb, PAYOFF.sign0, PAYOFF.sign0 + 0.35);
        if (!(gb >= NOVA.hit && gb < NOVA.hit + 12)) flare.set({ pos: PARK, size: 900, coreR: 20, core: (0.3 + 1.3 * cp) * (1 - gone), streak: 0.5 * cp * (1 - gone), rays: 0.3 * cp * (1 - gone), ring: 0 });
        sky.uniforms.uNebula.value = lerp(0.8, 1.15, seg(gb, PAYOFF.w2, PAYOFF.collapse0)) * (1 - 0.35 * seg(gb, PAYOFF.collapse0, SIGN.tile));
      }

      /* ── Act III: the pages stream in from beside the lens and the orb swallows them ── */
      const fwd = V(0, 0, -1).applyQuaternion(camera.quaternion), rgt = V(1, 0, 0).applyQuaternion(camera.quaternion), upv = V(0, 1, 0).applyQuaternion(camera.quaternion);
      let gulp = 0;
      ring.forEach((c, k) => {
        // three phases: rush in from beside the lens → hang readable for a moment → swallowed by the orb
        const s0 = READ.spawn0 + k * READ.step, sR = s0 + 0.55, s1 = absorbAt(k);
        const side = k % 2 ? 1 : -1;
        const from = camera.position.clone().addScaledVector(fwd, 160).addScaledVector(rgt, side * 520).addScaledVector(upv, -120);
        const hang = camera.position.clone().addScaledVector(fwd, 820).addScaledVector(rgt, side * (225 + (k % 3) * 25)).addScaledVector(upv, [-110, -40, -85, -140][k % 4]);
        const pa = seg(gb, s0, sR, ease.outCubic), pb = seg(gb, sR, s1, ease.inCubic);
        const pos = from.clone().lerp(hang, pa);
        const mid = hang.clone().lerp(PARK, 0.5).addScaledVector(upv, 90);
        const q1 = hang.clone().lerp(mid, pb), q2 = mid.clone().lerp(PARK, pb);
        if (pb > 0) pos.copy(q1.lerp(q2, pb));
        c.mesh.position.copy(pos);
        c.mesh.quaternion.copy(camera.quaternion);
        c.mesh.rotateZ(side * (0.1 * (1 - pa) + 0.45 * pb));
        c.mesh.rotateY(-side * 0.25 * (1 - pa));
        c.mesh.scale.setScalar(Math.max(0.001, lerp(1, 0.3, pb)));
        c.mesh.visible = gb >= s0 && gb < s1;
        c.m.uniforms.uAlpha.value = 1;
        c.m.uniforms.uScan.value = seg(gb, sR - 0.25, s1 - 0.1, ease.inOutSine) * 1.02;
        c.m.uniforms.uSweep.value = lerp(-0.4, 1.4, pa);
        c.m.uniforms.uDim.value = 0;
        const dt = (gb - s1) * BEAT;
        if (dt >= 0) gulp += Math.exp(-dt / 0.14);
      });
      orb.uniforms.uSpeak.value = Math.min(1, gulp * 0.9);
      const hp2 = hitPulse(t);
      orb.uniforms.uBright.value = 1 + Math.min(0.12, gulp * 0.1) + 0.07 * hp2;
      orb.uniforms.uGlow.value *= 1 + 0.35 * hp2;
      F.uPulse.value = gb >= PAYOFF.in ? hp2 : 0;

      // probes for the 2D layer
      tmp.copy(PARK).project(camera);
      PROBE.deck.x = (tmp.x * 0.5 + 0.5) * W; PROBE.deck.y = (-tmp.y * 0.5 + 0.5) * H;
      PROBE.deck.s = DECK_W * (H / 2) / Math.tan((FOV / 2) * Math.PI / 180) / camera.position.distanceTo(PARK);
      PROBE.orb.x = PROBE.deck.x; PROBE.orb.y = PROBE.deck.y; PROBE.orb.r = orb.uniforms.uR.value * D / camera.position.distanceTo(PARK);

      const bloomS = lerp(0.55, 0.32, seg(gb, NOVA.form0, NOVA.form1)) * (1 - seg(gb, LINK.arrive, ROOM.in - 0.1));
      // the last beat of the arrival renders the screen untouched (no tone curve), so it cuts 1:1 to the 2D room
      const exact = gb >= LINK.arrive + 0.1;
      return { scene, camera, bloom: { strength: bloomS, radius: 0.5, threshold: 0.93 }, tonemap: exact ? 0 : 1, exposure: 1.0 };
    },
  },
};
