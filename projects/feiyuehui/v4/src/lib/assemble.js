// Assembly: any mesh's connected parts (a claw, a stone, a shank) fly in from their own exploded pose and seat on cue,
// each with a spark as it lands. Parts are found by welding vertices and joining triangles; each vertex then carries its
// part's centre, start offset, start rotation and timing as attributes, and a chained shader patch moves it — after the
// film material's own vertex code, so the jade's veins and the diamonds' traced facets stay locked to the part. The
// shadow pass is patched the same way, so shadows fly in with the parts.
import * as THREE from 'three';

// connected components → { id: Int32Array (per vertex), count, centre: Float32Array(count × 3), size: Float32Array(count) }
export function components(geometry) {
  const pos = geometry.attributes.position, n = pos.count, index = geometry.index;
  const weld = new Int32Array(n), keys = new Map();
  const v = new THREE.Vector3();
  for (let i = 0; i < n; i++) {
    v.fromBufferAttribute(pos, i);
    const k = `${Math.round(v.x * 1e5)},${Math.round(v.y * 1e5)},${Math.round(v.z * 1e5)}`;
    let w = keys.get(k);
    if (w === undefined) { w = keys.size; keys.set(k, w); }
    weld[i] = w;
  }
  const parent = new Int32Array(keys.size).map((_, i) => i);
  const find = (x) => { while (parent[x] !== x) { parent[x] = parent[parent[x]]; x = parent[x]; } return x; };
  const T = (index ? index.count : n) / 3;
  const vi = index ? (t, j) => index.getX(t * 3 + j) : (t, j) => t * 3 + j;
  for (let t = 0; t < T; t++) {
    const a = find(weld[vi(t, 0)]), b = find(weld[vi(t, 1)]), c = find(weld[vi(t, 2)]);
    parent[b] = a; parent[find(c)] = a;
  }
  const map = new Map(), id = new Int32Array(n);
  for (let i = 0; i < n; i++) {
    const r = find(weld[i]);
    let c = map.get(r);
    if (c === undefined) { c = map.size; map.set(r, c); }
    id[i] = c;
  }
  const count = map.size;
  const mn = new Float32Array(count * 3).fill(Infinity), mx = new Float32Array(count * 3).fill(-Infinity);
  for (let i = 0; i < n; i++) {
    v.fromBufferAttribute(pos, i);
    const c = id[i] * 3;
    mn[c] = Math.min(mn[c], v.x); mn[c + 1] = Math.min(mn[c + 1], v.y); mn[c + 2] = Math.min(mn[c + 2], v.z);
    mx[c] = Math.max(mx[c], v.x); mx[c + 1] = Math.max(mx[c + 1], v.y); mx[c + 2] = Math.max(mx[c + 2], v.z);
  }
  const centre = new Float32Array(count * 3), size = new Float32Array(count);
  for (let c = 0; c < count; c++) {
    for (let k = 0; k < 3; k++) centre[c * 3 + k] = (mn[c * 3 + k] + mx[c * 3 + k]) / 2;
    size[c] = Math.hypot(mx[c * 3] - mn[c * 3], mx[c * 3 + 1] - mn[c * 3 + 1], mx[c * 3 + 2] - mn[c * 3 + 2]);
  }
  return { id, count, centre, size };
}

const VPARS = /* glsl */ `
attribute vec3 aAsmCentre;
attribute vec3 aAsmFrom;      // the part's offset at the start (geometry units)
attribute vec4 aAsmRot;       // axis (xyz), angle at the start (w)
attribute vec2 aAsmTime;      // start, duration (s)
uniform float uAsmTime;
uniform float uAsmOvershoot;
uniform vec3 uAsmOrbitC, uAsmOrbitAxis;   // a swirl about a centre (geometry space): parts spiral in as they arrive
uniform float uAsmOrbit;                  // radians of swirl at the start
varying float vAsmLand;       // seconds since the part seated (negative before)
vec3 asmRotate(vec3 p, vec4 r, float k) {
  float a = r.w * k; if (abs(a) < 1e-5) return p;
  vec3 ax = normalize(r.xyz); float c = cos(a), s = sin(a);
  return p * c + cross(ax, p) * s + ax * dot(ax, p) * (1.0 - c);
}
float asmEase(float u) {     // a decisive arrival with a small overshoot: back-out
  u = clamp(u, 0.0, 1.0); float c1 = uAsmOvershoot, c3 = c1 + 1.0;
  return 1.0 + c3 * pow(u - 1.0, 3.0) + c1 * pow(u - 1.0, 2.0);
}
`;
// before <defaultnormal_vertex>: turn the normal with its part
const VNORMAL = /* glsl */ `
{
  float asmU = (uAsmTime - aAsmTime.x) / max(aAsmTime.y, 1e-4);
  float asmK = 1.0 - asmEase(asmU);
  objectNormal = asmRotate(objectNormal, aAsmRot, asmK);
  objectNormal = asmRotate(objectNormal, vec4(uAsmOrbitAxis, uAsmOrbit), asmK);
}
`;
// before <project_vertex>: move the vertex (the film's object-space and gem code already ran on the rest pose)
const VMOVE = /* glsl */ `
{
  float asmU = (uAsmTime - aAsmTime.x) / max(aAsmTime.y, 1e-4);
  float asmK = 1.0 - asmEase(asmU);
  transformed = aAsmCentre + asmRotate(transformed - aAsmCentre, aAsmRot, asmK) + aAsmFrom * asmK;
  transformed = uAsmOrbitC + asmRotate(transformed - uAsmOrbitC, vec4(uAsmOrbitAxis, uAsmOrbit), asmK);
  vAsmLand = uAsmTime - (aAsmTime.x + aAsmTime.y);
}
`;
const FPARS = 'varying float vAsmLand;\nuniform vec3 uAsmSpark;\nuniform float uAsmSparkLife;\n';
const FSPARK = 'outgoingLight += uAsmSpark * step(0.0, vAsmLand) * exp(-max(vAsmLand, 0.0) / uAsmSparkLife);\n';

function patch(material, U, spark) {
  const prev = material.onBeforeCompile, prevKey = material.customProgramCacheKey?.bind(material);
  material.onBeforeCompile = function (shader, r) {
    prev?.call(this, shader, r);
    Object.assign(shader.uniforms, U);
    let vs = shader.vertexShader.replace('#include <common>', `#include <common>\n${VPARS}`)
      .replace('#include <project_vertex>', `${VMOVE}\n#include <project_vertex>`);
    if (vs.includes('#include <defaultnormal_vertex>')) vs = vs.replace('#include <defaultnormal_vertex>', `${VNORMAL}\n#include <defaultnormal_vertex>`);
    shader.vertexShader = vs;
    let fs = shader.fragmentShader.replace('#include <common>', `#include <common>\n${FPARS}`);
    if (spark && fs.includes('#include <opaque_fragment>')) fs = fs.replace('#include <opaque_fragment>', `${FSPARK}#include <opaque_fragment>`);
    shader.fragmentShader = fs;
  };
  material.customProgramCacheKey = () => `${prevKey ? prevKey() : ''}:asm${spark ? 's' : ''}`;
  material.needsUpdate = true;
}

// mesh: any mesh (its geometry is given per-vertex attributes); plan(part) → { from: Vector3 (world metres), axis, angle,
// start, dur } with part = { i, centre (world), size (m), count }. Returns { uniforms, parts }.
export function prepareAssembly(mesh, plan, { spark = '#fff2d8', sparkPower = 6, sparkLife = 0.12, overshoot = 1.2,
  orbitCentre = null, orbitAxis = new THREE.Vector3(0, 1, 0), orbit = 0 } = {}) {
  const g = mesh.geometry;
  const C = components(g);
  mesh.updateWorldMatrix(true, false);
  const toWorld = mesh.matrixWorld.clone(), toGeo = toWorld.clone().invert();
  const n3 = new THREE.Matrix3().setFromMatrix4(toGeo);   // world vectors → geometry space (linear part)
  const n = g.attributes.position.count;
  const centreA = new Float32Array(n * 3), fromA = new Float32Array(n * 3), rotA = new Float32Array(n * 4), timeA = new Float32Array(n * 2);
  const parts = [];
  const scale = new THREE.Vector3().setFromMatrixScale(toWorld).x;
  for (let i = 0; i < C.count; i++) {
    const cg = new THREE.Vector3(C.centre[i * 3], C.centre[i * 3 + 1], C.centre[i * 3 + 2]);
    const cw = cg.clone().applyMatrix4(toWorld);
    const p = plan({ i, centre: cw, size: C.size[i] * scale, count: C.count });
    const fromG = p.from.clone().applyMatrix3(n3);
    const axG = (p.axis ?? new THREE.Vector3(0, 1, 0)).clone().applyMatrix3(n3).normalize();
    parts.push({ ...p, centreG: cg, fromG, axG });
  }
  for (let v = 0; v < n; v++) {
    const P = parts[C.id[v]];
    centreA.set([P.centreG.x, P.centreG.y, P.centreG.z], v * 3);
    fromA.set([P.fromG.x, P.fromG.y, P.fromG.z], v * 3);
    rotA.set([P.axG.x, P.axG.y, P.axG.z, P.angle ?? 0], v * 4);
    timeA.set([P.start, P.dur], v * 2);
  }
  g.setAttribute('aAsmCentre', new THREE.BufferAttribute(centreA, 3));
  g.setAttribute('aAsmFrom', new THREE.BufferAttribute(fromA, 3));
  g.setAttribute('aAsmRot', new THREE.BufferAttribute(rotA, 4));
  g.setAttribute('aAsmTime', new THREE.BufferAttribute(timeA, 2));
  const oc = orbitCentre ? orbitCentre.clone().applyMatrix4(toGeo) : new THREE.Vector3();
  const oa = orbitAxis.clone().applyMatrix3(n3).normalize();
  const U = {
    uAsmTime: { value: 0 }, uAsmOvershoot: { value: overshoot },
    uAsmOrbitC: { value: oc }, uAsmOrbitAxis: { value: oa }, uAsmOrbit: { value: orbit },
    uAsmSpark: { value: new THREE.Color(spark).multiplyScalar(sparkPower) }, uAsmSparkLife: { value: sparkLife },
  };
  for (const m of [].concat(mesh.material)) patch(m, U, true);
  const depth = new THREE.MeshDepthMaterial({ depthPacking: THREE.RGBADepthPacking });
  patch(depth, U, false);
  mesh.customDepthMaterial = depth;
  mesh.frustumCulled = false;
  return { uniforms: U, parts, count: C.count };
}
