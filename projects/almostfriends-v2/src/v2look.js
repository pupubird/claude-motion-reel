// The crazy version's look, shared by every scene (CRAZY.md): one light ramp from night to day across the film, one
// gradient of light, the glass orb with light inside (Bub, everyone's orb, the mark), the liquid layer's two studios.
import { clamp, lerp, seg, ease } from './util.js';
import { CHAT, UNLOCK, NAME } from './score.js';

// the gradient of a friendship (blue → violet → pink → coral → amber)
export const GRAD = ['#1E5BFF', '#5A3DFF', '#A230FF', '#FF2E8A', '#FF3D4F', '#FF6A2B', '#FF8A1F'];
export const BUB_LIGHT = { tint: GRAD[0], c2: GRAD[3], c3: GRAD[5] };

// how light the world is at film time t (0 night, 1 full day): night through the app's first two steps and the
// match; the light rises with the three days (dawn, day, golden); dusk-blue for the wait at the unlock; full day
// from the reveal
export function lightAt(t) {
  if (t < CHAT.noNames) return 0.06 * seg(t, CHAT.cap, CHAT.noNames);
  if (t < CHAT.last + 0.4) return lerp(0.12, 0.62, seg(t, CHAT.noNames, CHAT.last, ease.inOutSine));
  if (t < UNLOCK.both) return lerp(0.62, 0.3, seg(t, CHAT.last + 0.4, UNLOCK.sheet + 1.0, ease.inOutSine));
  return lerp(0.3, 1, seg(t, UNLOCK.both, UNLOCK.both + 0.35, ease.outCubic));
}

// the glass orb with light inside (gl/liquid.js: core + absorb): on the night it reads as light, on the day as
// coloured glass. Spread over a prim with its three light colours (tint, c2, c3).
export const LIGHT_ORB = { glass: 1, refr: 0.035, frost: 0, haze: 0, tintAmt: 0, edge: 0.55, env: 0.75, spec: 0, core: 0.9, absorb: 0.9, dense: 1.6, fill: 0, ncol: 3 };

// the liquid layer's studio at film time t: the night (dark, a cool rim light) easing into the day (a bright room,
// black cards for the glass's edges)
export function liquidEnv(t) {
  const L = lightAt(t);
  return {
    skyTop: L > 0.5 ? '#FFFFFF' : '#0B1230', skyHor: L > 0.5 ? '#F5F5F7' : '#04060E', skyLow: L > 0.5 ? '#B8B8C0' : '#000000',
    night: clamp(1 - L * 1.6), stars: 0, keyGain: lerp(4, 6.5, L), keyDir: [-0.5, 0.65, 0.57], ssr: 0, studio: clamp((L - 0.5) * 2),
    rim: { pos: [6, 4, -2], col: '#9DB6FF', gain: lerp(2.4, 0, clamp(L * 1.5)) },
  };
}
export { NAME };
