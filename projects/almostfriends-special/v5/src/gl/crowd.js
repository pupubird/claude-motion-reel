// The crowd: everyone on the app as a soap-glass orb in their own priorities' colours (from the released film's
// gl/universe.js crowdField: one InstancedMesh, one draw call). A scan front lights the people who share your values
// and lets the others fall back toward the sky; Bub shoulders through them; far orbs fade into the air.
import * as THREE from 'three';
import { rng } from '../util.js';

const VERT = /* glsl */ `
attribute vec3 aC1, aC2;
attribute vec4 aInfo;                 // x seed, y match (0..1), z scan jitter, w index
uniform float uTime, uScanR, uScanW, uBurst, uBurstAmp, uOne, uBubR, uPush, uClearR;
uniform vec3 uScanAt, uBurstAt, uBubAt, uClearAt;
varying vec3 vN, vV, vC1, vC2, vCtr;
varying float vLit, vDim, vDepth, vSy;
void main() {
  vec4 wp = modelMatrix * instanceMatrix * vec4(position, 1.0);
  vec3 c0 = (modelMatrix * instanceMatrix * vec4(0.0, 0.0, 0.0, 1.0)).xyz;
  vec3 c = c0;
  // the burst: every orb is thrown away from uBurstAt, the near ones hardest
  if (uBurst > 0.0) {
    vec3 d = c0 - uBurstAt;
    float L = length(d) + 1e-3;
    float spd = 0.55 + fract(aInfo.x * 0.731) * 1.3;
    c += (d / L) * uBurst * uBurstAmp * spd * (1.0 + 4.0 / (1.0 + 0.4 * L));
  }
  // Bub shoulders through the crowd: orbs near it are pushed aside, and pressed flat where they touch it
  vec3 dB = c - uBubAt;
  float LB = length(dB) + 1e-4;
  float pk = uPush * (1.0 - smoothstep(0.0, uBubR * 3.4, LB));
  pk *= pk;
  vec3 nB = dB / LB;
  c += nB * pk * uBubR * 1.7;
  // a hero standing in the crowd (the one) keeps its own space: orbs inside its sphere are moved to its surface
  if (uClearR > 0.0) {
    vec3 dC = c - uClearAt;
    float LC = length(dC) + 1e-4;
    float rs = length(instanceMatrix[0].xyz);
    c += dC / LC * max(0.0, uClearR + rs * 0.9 + 0.05 - LC);
  }
  // the scan: matches swell and light up as the front passes; the others shrink back
  float dd = length(c - uScanAt) + aInfo.z;
  float passed = smoothstep(uScanR, uScanR - uScanW, dd);
  vLit = passed * aInfo.y;
  vDim = passed * (1.0 - aInfo.y);
  float s = (1.0 + 0.5 * vLit - 0.14 * vDim) * (abs(aInfo.w - uOne) < 0.5 ? 0.0 : 1.0);   // the one is a hero bubble
  vec3 v = (wp.xyz - c0) * s;
  float along = dot(v, nB);
  v += -nB * along * 0.42 * pk + (v - nB * along) * 0.2 * pk;
  wp.xyz = c + v;
  vN = normalize(mat3(modelMatrix) * mat3(instanceMatrix) * normal);
  vV = normalize(cameraPosition - wp.xyz);
  vC1 = aC1; vC2 = aC2; vCtr = c;
  vec4 cp = projectionMatrix * viewMatrix * vec4(c, 1.0);
  vSy = cp.y / cp.w;
  vDepth = -(viewMatrix * vec4(c, 1.0)).z;
  gl_Position = projectionMatrix * viewMatrix * wp;
}`;

const FRAG = /* glsl */ `
uniform vec3 uKey, uBg, uGlobeAt, uSun;
uniform float uVeil, uVeilY, uNear, uFar, uAlpha, uLitGain, uNearFade, uGlobeR, uSat;
varying vec3 vN, vV, vC1, vC2, vCtr;
varying float vLit, vDim, vDepth, vSy;
void main() {
  vec3 N = normalize(vN), V = normalize(vV);
  float ci = clamp(dot(N, V), 0.0, 1.0);
  float rim = pow(1.0 - ci, 2.2);
  float key = 0.5 + 0.5 * dot(N, normalize(uKey));
  // a tinted soap bubble, not a ball: a luminous, partly clear body in the top priority, a rim leaning to the second
  vec3 body = vC1 * mix(0.86, 1.12, key);
  vec3 col = mix(body, vC2 * 1.1 + 0.08, rim * 0.8);
  col = mix(col, vec3(1.0), (1.0 - rim) * 0.16);
  vec3 R = reflect(-V, N);
  float spec = smoothstep(0.86, 0.95, dot(R, normalize(uKey + vec3(0.0, 0.2, 0.4))));
  col += spec * 0.9;
  float a = mix(0.6, 0.95, rim) + spec * 0.3;
  // lit matches glow; the others fall back toward the sky (still people, just not your people this time)
  col = mix(col, col * (1.15 + 0.3 * uLitGain) + vec3(0.12, 0.05, 0.02) * uLitGain + rim * 0.35, vLit);
  a = mix(a, max(a, 0.9 + rim * 0.1), vLit);
  col = mix(col, mix(col, vec3(dot(col, vec3(0.3, 0.55, 0.15))), 0.5), vDim * 0.55);
  a *= mix(1.0, 0.72, vDim);
  // a planet of them (the hook): day and night across the globe, and a pale atmosphere at its limb (0 = off)
  if (uGlobeR > 0.0) {
    vec3 gn = normalize(vCtr - uGlobeAt), gv = normalize(cameraPosition - vCtr);
    float day = smoothstep(-0.45, 0.55, dot(gn, normalize(uSun)));
    col *= mix(0.5, 1.08, day);
    float limb = pow(1.0 - clamp(dot(gn, gv), 0.0, 1.0), 2.5);
    col = mix(col, vec3(0.86, 0.93, 1.0), limb * 0.7);
    a = mix(a, 1.0, limb * 0.3);
  }
  // quiet: the people as a pale, colourless sea (white, sky, peach) until colour floods in (the hook's pop; 1 = full)
  if (uSat < 1.0) {
    float g = dot(col, vec3(0.3, 0.55, 0.15));
    vec3 pale = mix(vec3(0.93, 0.95, 1.0), vec3(1.0, 0.95, 0.92), smoothstep(0.4, 0.9, g)) * (0.86 + 0.18 * g);
    col = mix(pale, col, uSat);
    a *= mix(0.85, 1.0, uSat);
  }
  // aerial perspective: far orbs fade into the sky; a veil keeps the caption band clear when asked
  float far = smoothstep(uNear, uFar, vDepth);
  col = mix(col, uBg, far * 0.75);
  a *= 1.0 - far * 0.6;
  a *= 1.0 - uVeil * smoothstep(uVeilY - 0.1, uVeilY + 0.06, vSy);
  // orbs grazing the lens declutter the frame when the camera is watching something (0 = off)
  if (uNearFade > 0.0) a *= mix(0.25, 1.0, smoothstep(uNearFade * 0.45, uNearFade, vDepth));
  a *= uAlpha;
  gl_FragColor = vec4(col * a, a);
}`;

// A field of people as soap-glass orbs: one InstancedMesh with its own copy of the crowd material (the shaders above,
// its own uniforms). `place(R, i)` → { x, y, z, s } puts person i (R: the field's seeded random). The universe's tunnel
// is one field; the hook's planet of people (gl/planet.js) is another.
export function crowdField({ count, seed, colors, isMatch, place, paint = null, segs = [22, 16] }) {
  const R = rng(seed);
  const geo = new THREE.InstancedBufferGeometry().copy(new THREE.SphereGeometry(1, segs[0], segs[1]));
  const lin = colors.map((h) => new THREE.Color(h).convertSRGBToLinear());
  const c1 = new Float32Array(count * 3), c2 = new Float32Array(count * 3), info = new Float32Array(count * 4);
  const mesh = new THREE.InstancedMesh(geo, null, count);
  const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), sc = new THREE.Vector3(), pos = new THREE.Vector3();
  const people = [];
  for (let i = 0; i < count; i++) {
    let a, b, x, y, z, s;
    if (paint) {                     // colours from the position (the planet's land and sea)
      ({ x, y, z, s } = place(R, i));
      [a, b] = paint(R, i, x, y, z);
    } else {                         // (this order keeps the universe's people where v3 had them)
      a = Math.floor(R() * colors.length);
      b = Math.floor(R() * (colors.length - 1)); if (b >= a) b++;
      ({ x, y, z, s } = place(R, i));
    }
    lin[a].toArray(c1, i * 3); lin[b].toArray(c2, i * 3);
    pos.set(x, y, z); sc.setScalar(s);
    m4.compose(pos, q, sc);
    mesh.setMatrixAt(i, m4);
    const m = isMatch ? isMatch(a, b) : 0;
    info.set([R() * 100, m, (R() - 0.5) * 0.8, i], i * 4);
    people.push({ x, y, z, s, a, b, m, i });
  }
  geo.setAttribute('aC1', new THREE.InstancedBufferAttribute(c1, 3));
  geo.setAttribute('aC2', new THREE.InstancedBufferAttribute(c2, 3));
  geo.setAttribute('aInfo', new THREE.InstancedBufferAttribute(info, 4));
  mesh.material = new THREE.ShaderMaterial({
    vertexShader: VERT, fragmentShader: FRAG,
    uniforms: {
      uTime: { value: 0 }, uScanR: { value: -1 }, uScanW: { value: 2.4 }, uScanAt: { value: new THREE.Vector3() },
      uBurst: { value: 0 }, uBurstAmp: { value: 10 }, uBurstAt: { value: new THREE.Vector3() }, uOne: { value: -1 },
      uBubAt: { value: new THREE.Vector3(0, 0, 1e4) }, uBubR: { value: 0.5 }, uPush: { value: 0 },
      uClearAt: { value: new THREE.Vector3() }, uClearR: { value: 0 },
      uGlobeAt: { value: new THREE.Vector3() }, uGlobeR: { value: 0 }, uSun: { value: new THREE.Vector3(-0.6, 0.5, 0.65) }, uSat: { value: 1 },
      uKey: { value: new THREE.Vector3(-0.5, 0.7, 0.6) }, uBg: { value: new THREE.Color('#EEF2FB').convertSRGBToLinear() },
      uVeil: { value: 0 }, uVeilY: { value: 0.42 }, uNear: { value: 14 }, uFar: { value: 60 }, uAlpha: { value: 1 }, uLitGain: { value: 1 }, uNearFade: { value: 0 },
    },
    transparent: true, depthWrite: true,
    blending: THREE.CustomBlending, blendSrc: THREE.OneFactor, blendDst: THREE.OneMinusSrcAlphaFactor,
  });
  mesh.frustumCulled = false;
  return { mesh, people, uniforms: mesh.material.uniforms };
}

