// The director: one take, 44 s. For a time t it asks each act that is live for its part of the frame (liquid
// primitives, the 2D ground and type, the lens) and adds the two things that run through every act: the camera (the
// live act's keys, operated, with every landing's shake) and Bub (one character, handed from act to act).
import { TL } from './timeline.js';
import { C } from './brand.js';
import { W } from './config.js';
import { shake } from './camera.js';
import { daySky, rays } from './sky.js';
import { project } from './proj.js';
import { shadowsFor } from './ui/shadow.js';
import { hookFrame, hookCam, HOOK_HITS, bubHook } from './acts/hook.js';
import { valuesFrame, valuesCam, VALUES_HITS, bubValues } from './acts/values.js';
import { crowdInit, crowdHide, crowdFrame, crowdCam, CROWD_HITS, bubCrowd } from './acts/crowd.js';
import { chatFrame, chatCam, CHAT_HITS, bubWait } from './acts/chat.js';
import { friendsFrame, friendsCam, FRIENDS_HITS, bubEnd } from './acts/friends.js';

// the daylight ground for acts that stand in the day: the sky pans with the camera (far layers less)
function dayGround(t, st, env, opt = {}) {
  st.under.push((g) => {
    const [x, y] = project(env, [0, 0, -40]);
    daySky(g, t, { shift: [(x - 540) * 0.6, (y - 960) * 0.6], ...opt });
    rays(g, t, { a: opt.rays ?? 0.55, x: W * 0.12 + (x - 540) * 0.3 });
  });
}

const ACTS = [
  { name: 'hook', t0: 0, t1: 6.25, frame: hookFrame, cam: hookCam, hits: HOOK_HITS, camUntil: 6.0 },
  { name: 'values', t0: 6.0, t1: 10.0, frame: (t, st, env) => { dayGround(t, st, env); valuesFrame(t, st, env); }, cam: valuesCam, hits: VALUES_HITS },
  { name: 'crowd', t0: 10.0, t1: TL.crowd.switch, frame: crowdFrame, cam: crowdCam, hits: CROWD_HITS },
  { name: 'chat', t0: TL.crowd.switch, t1: TL.unlock.pop + 0.55, frame: chatFrame, cam: chatCam, hits: CHAT_HITS, camUntil: TL.unlock.pop },
  { name: 'friends', t0: TL.unlock.pop, t1: TL.end + 1, frame: friendsFrame, cam: friendsCam, hits: FRIENDS_HITS },
];

// Bub across the film: → { pos, r, squash, face… } or null when Bub is not in the frame
function bubAt(t) {
  if (t >= TL.day.bubIn && t < TL.day.drop) return bubHook(t);
  if (t >= TL.values.hi && t < 10.0) return bubValues(t);
  if (t >= 10.0 && t < TL.crowd.switch) return bubCrowd(t);
  if (t >= TL.crowd.switch && t < 30) return bubWait(t);
  if (t >= 39) return bubEnd(t);
  return null;
}

function bubPrim(b, cam) {
  const s = b.squash ?? 0;
  const sy = 1 + s, sx = 1 / Math.sqrt(Math.max(0.2, sy));
  const to = cam.pos.map((v, k) => v - b.pos[k]);
  const L = Math.hypot(...to);
  const dir = to.map((v) => v / L);
  const look = b.look ?? [0, 0];
  return {
    prim: { type: 'sphere', pos: b.pos, size: [b.r], scale: [sx, sy, sx], face: true, group: 1, k: b.k ?? 0.35, thick: 430,
      haze: 0.22, rim: 2.2, edge: 0.85, env: 1.35, wobble: b.wobble ?? 0.012, seed: 9, fill: b.fill ?? 0, tint: b.c1, c2: b.c2, c3: b.c3, glow: b.glow ?? 0.3 },
    face: { dir: [dir[0] + (b.gaze?.[0] ?? 0), dir[1] + (b.gaze?.[1] ?? 0), dir[2]], up: [0, 1, 0], blink: b.asleep ? 1 : (b.blink ?? 0),
      happy: b.happy ?? 0, wide: b.wide ?? 0, squint: b.squint ?? 0, look, blush: b.blush ?? 0.6, eyeScale: b.eyeScale ?? 1, alpha: b.faceAlpha ?? 1 },
  };
}

export const film = {
  init(env) { crowdInit(env); },
  frame(t, env) {
    const st = {
      cam: null, bg: C.sky,
      env: { night: 0, keyGain: 4.5, ssr: 0.5 },
      prims: [], under: [], over: [], face: null, update3d: [], useDepth: false,
      fx: { flash: 0, ca: 0, bloom: { strength: 0.28, radius: 0.55, threshold: 0.95 }, vignette: 0.12 },
    };
    const live = ACTS.filter((a) => t >= a.t0 && t < a.t1);
    const camAct = ACTS.find((a) => t >= a.t0 && t < (a.camUntil ?? a.t1)) ?? live[live.length - 1] ?? ACTS[ACTS.length - 1];
    const cam = camAct.cam(t);
    const sh = shake(t, camAct.hits ?? []);
    cam.roll = (cam.roll ?? 0) + sh.rot;
    st.cam = cam;
    st.fx.shake = [sh.x, sh.y];
    for (const a of live) a.frame(t, st, env);
    const b = bubAt(t);
    if (b) { const { prim, face } = bubPrim(b, cam); st.prims.push(prim); st.face = face; }
    // the ground first, then the shadows of floating glass, then everything else in UNDER
    const under = st.under, over = st.over, shadows = shadowsFor(st.prims, env), u3 = st.update3d;
    return { ...st, update3d: () => { crowdHide(); u3.forEach((f) => f()); }, under: (g) => under.forEach((f, i) => { f(g); if (i === 0) shadows(g); }), over: (g) => over.forEach((f) => f(g)) };
  },
  // the shutter's sub-frames per frame, as a share of the render's base: the fast moves get more (no stepping in
  // the streaks), the dead-still holds fewer
  samplesAt(t) {
    const fast = [[-1, 0.6], [1.95, 2.5], [5.95, 6.3], [9.95, 10.8], [14.9, 15.95], [27.95, 28.6], [35.6, 38.3]];
    const slow = [[2.85, 3.85], [24.4, 26.35], [40.6, 44.1]];
    if (fast.some(([a, b]) => t >= a && t < b)) return 2;
    if (slow.some(([a, b]) => t >= a && t < b)) return 0.5;
    return 1;
  },
};
