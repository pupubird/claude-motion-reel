// Bars 13–14 · THE MARK (3D).
// The finished 2D mark becomes solid: an orthographic camera at 1 world unit = 1 px means the extruded
// pieces' front faces land exactly on the 2D pixels, and the bevel is inset (bevelOffset = −size) so
// the silhouette never grows. Lighting fades in (flat → glossy lime), the mark spins once with its two
// pieces drawn apart in depth — the chart-line gap opening in 3D — shrinks to its lockup size, faces
// front, goes flat again and locks on the beat: exactly the mark the Zembit's visor will show next.
import * as THREE from 'three';
import { W, H, BEAT, C } from '../config.js';
import { ease, seg, lerp } from '../util.js';
import { B, MARK as T } from '../score.js';
import { markPolys } from '../brand.js';
import { CHART } from './coins.js';
import { studioEnv } from '../zembit/stage.js';

let scene, camera, group, top, bot, mat, black;
const DEPTH = 96, BEV = 7;

function shape(poly) {
  const s = new THREE.Shape();
  poly.forEach(([mx, my], i) => {
    const x = (mx - CHART.cx) * CHART.px, y = -(my - CHART.cy) * CHART.px;
    if (i === 0) s.moveTo(x, y); else s.lineTo(x, y);
  });
  s.closePath();
  return s;
}

function piece(poly) {
  const geo = new THREE.ExtrudeGeometry(shape(poly), {
    depth: DEPTH, bevelEnabled: true, bevelThickness: BEV, bevelSize: BEV, bevelOffset: -BEV, bevelSegments: 5, curveSegments: 24,
  });
  geo.translate(0, 0, -DEPTH - BEV);          // front face (incl. bevel) at z = 0
  return new THREE.Mesh(geo, mat);
}

function init(env) {
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0);
  scene.environment = studioEnv(env.renderer);
  scene.environmentIntensity = 0.7;
  const key = new THREE.DirectionalLight(0xffffff, 1.3); key.position.set(-400, 700, 900);
  const rim = new THREE.DirectionalLight(0xffffff, 1.1); rim.position.set(700, 200, -600);
  scene.add(key, rim);
  black = new THREE.Color(0);
  mat = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color('#C6D52B'), roughness: 0.22, clearcoat: 1, clearcoatRoughness: 0.06,
    emissive: new THREE.Color(C.lime), emissiveIntensity: 1,
  });
  const { top: pt, bot: pb } = markPolys(24);
  group = new THREE.Group();
  top = piece(pt);
  bot = piece(pb);
  group.add(top, bot);
  scene.add(group);
  camera = new THREE.OrthographicCamera(-W / 2, W / 2, H / 2, -H / 2, -4000, 4000);
  camera.position.set(0, 0, 2000);
  camera.lookAt(0, 0, 0);
}

function update(t) {
  const gb = t / BEAT;
  const spin = ease.inOutCubic(seg(gb, T.spin0 + 0.2, T.spin1));
  const lit = ease.inOutCubic(seg(gb, T.spin0, T.spin0 + 0.6)) * (1 - ease.inOutCubic(seg(gb, T.spin1 - 0.45, T.spin1)));
  const s = lerp(1, T.size / (30 * CHART.px), ease.inOutCubic(seg(gb, T.spin0 + 0.8, T.spin1)));
  const lock = t - B(T.lock);
  const click = lock > 0 ? 1 + 0.035 * Math.exp(-lock / 0.06) : 1;
  const open = Math.sin(Math.PI * spin);
  group.rotation.set(0.3 * open, Math.PI * 2 * spin, 0);
  group.scale.setScalar(s * click);
  // explode: the roof forward, the base back, and the gap between them widens a touch
  top.position.set(0, 26 * open, 70 * open);
  bot.position.set(0, -10 * open, -70 * open);
  const f = 1 - lit;                                  // 1 = flat brand lime (hand-off states)
  mat.color.set('#C6D52B').lerp(black, f);
  mat.emissiveIntensity = f;
  mat.envMapIntensity = 1 - f;
  mat.clearcoat = 1 - f;
  mat.specularIntensity = 1 - f;
  camera.updateMatrixWorld(true);
  return { scene, camera, bloom: { strength: 0.2 * lit, radius: 0.35, threshold: 1.2 }, tonemap: 0 };
}

export default { id: 'mark3d', init, three: { start: B(T.spin0), end: B(56), update } };
