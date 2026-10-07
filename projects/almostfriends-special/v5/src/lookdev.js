// Look-dev: one still of every material the film is built from, to judge them before any act is built.
//   node projects/almostfriends-special/render.mjs --film=lookdev --stills=0,1s,2s --dir=lookdev
import { C, FONTS } from './brand.js';
import { W, H } from './config.js';
import * as THREE from 'three';

const v = new THREE.Vector3();
function project(cam, p) { v.set(...p).project(cam); return [(v.x + 1) / 2 * W, (1 - v.y) / 2 * H]; }

export const film = {
  frame(t, env) {
    const cam = { pos: [0, 0.1, 7.2], target: [0, -0.1, 0], fov: 40 };
    const night = Number(new URLSearchParams(location.search).get('night') || 0);
    return {
      cam,
      bg: C.sky,
      env: { night, ssr: 0.5, keyGain: 4.5 },
      under(g) {
        const gr = g.createLinearGradient(0, 0, 0, H);
        gr.addColorStop(0, night ? '#050B1E' : C.sky); gr.addColorStop(1, night ? '#16264F' : C.peach);
        g.fillStyle = gr; g.fillRect(0, 0, W, H);
        g.fillStyle = night ? '#FFFFFF' : C.ink;
        g.font = `800 260px ${FONTS.display}`;
        g.textAlign = 'center';
        g.fillText('friends', W / 2, 760);
        g.font = `800 140px ${FONTS.display}`;
        g.fillStyle = C.blue;
        g.fillText('outside', W / 2, 1500);
      },
      prims: (() => { const qs = new URLSearchParams(location.search); const all = [
        { type: 'sphere', pos: [0, -0.35, 0], size: [1.0], face: true, group: 1, k: 0.45, thick: 430, haze: 0.22, rim: 2.2, edge: 0.85, env: 1.35, wobble: 0.01 },
        { type: 'sphere', pos: [1.18 + 0.2 * Math.sin(t * 2), -0.15, 0.1], size: [0.34], group: 1, k: 0.45, glass: 1, tint: P(), fill: 0 },
        { type: 'box', pos: [0, 1.55, 0.4], size: [1.25, 0.26, 0.1], round: 0.26, glass: 1, tintAmt: 0.1 },
        { type: 'box', pos: [-1.35, -1.95, 0.4], size: [0.62, 0.2, 0.08], round: 0.2, glass: 1, tint: '#FF7A59', fill: 0.85, glow: 0.4 },
        { type: 'box', pos: [1.25, -2.05, 0.3], size: [0.7, 0.2, 0.08], round: 0.2, glass: 1, tint: '#FFB224', fill: 0.85, glow: 0.4 },
        { type: 'sphere', pos: [-1.3, 1.0, -1.0], size: [0.45], thick: 380, fill: 0.9, tint: '#FF7A59', c2: '#3B6CFF', c3: '#17B890', glow: 0.6 },
        { type: 'torus', pos: [0, -0.35, 0], size: [1.55, 0.035], quat: [0.2588, 0, 0, 0.9659], glass: 1, tint: '#FFFFFF', edge: 0.8 },
        { type: 'sphere', pos: [1.6, 0.9, -2.5], size: [0.7], thick: 360 },
      ];
      if (qs.get('only') === 'bub') return [{ ...all[0], wobble: Number(qs.get('wob') ?? 0.01) }];
      return all; })(),
      face: { dir: [0.1, 0.05, 1], up: [0, 1, 0], blink: 0, happy: 0, wide: 0.2, look: [0.2, 0.1], blush: 0.7 },
      over(g) {
        const [x, y] = project(env.camera, [0, 1.55, 0.5]);
        g.fillStyle = C.ink; g.font = `600 44px ${FONTS.ui}`; g.textAlign = 'center'; g.textBaseline = 'middle';
        g.fillText('What matters to you?', x, y);
      },
      fx: { bloom: { strength: 0.25, radius: 0.5, threshold: 0.95 }, vignette: 0.1 },
    };
  },
};
function P() { return '#9FC4FF'; }
