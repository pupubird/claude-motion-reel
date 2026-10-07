// The liquid layer: every soap bubble, droplet and piece of glass UI in the film is one signed-distance scene,
// raymarched per pixel in a single full-screen pass over the background. That is what lets a bubble do what a bubble
// does: shapes in one group are smooth-unioned, so a droplet pulls out of Bub on a neck and pinches off, a chip flies
// back in and merges, a pill splits into six; shapes in different groups touch and stay separate (a double bubble's
// 120° crease), and a sheet (a flat wall, a popping film) can sit inside them. Two materials, blended across a merge:
//   soap  — transparent thin film: Airy reflectance through the CIE observer (a LUT built once from filmglsl.js's
//           maths) times the environment, every wall the ray crosses composited front to back; optional inks inside
//           (a person's priorities) and a tear that races round the sphere when it pops;
//   glass — Liquid Glass: the background refracted through the surface (stronger toward the bevel, split by
//           wavelength), a little frosted, Fresnel reflection, a specular lip, an inner edge light and a tint or fill.
// Bub is a soap sphere with a face painted on its front film (eyes, catchlights, happy arcs, blush), placed by the
// face direction, so the face survives squash, merges and the camera going round it.
// Primitives come from JS each sub-frame as a float texture (FIELDS × MAXP), sorted by group. Per pixel, a bounding
// pass copies only the primitives the ray can touch into registers (at most MAXL), so a frame costs what is on it.
import * as THREE from 'three';
import { FILM_GLSL } from './filmglsl.js';

export const MAXP = 48;
const MAXL = 12;
const FIELDS = 12;

const VERT = /* glsl */ `
varying vec2 vUv;
void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }`;

const FRAG = /* glsl */ `
precision highp float;
precision highp int;
uniform sampler2D tBack, tP, tFilm, tDepth;
uniform float uNear, uFar;
uniform int uUseDepth;
uniform int uCount;
uniform vec2 uRes;
uniform vec3 uCamPos;
uniform mat4 uCamWorld, uProjInv, uView;
uniform float uTime;
uniform vec3 uSkyTop, uSkyHor, uSkyLow;
uniform vec3 uKeyDir;
uniform float uKeyGain, uNight, uSSR;
uniform vec3 uRimPos, uRimCol;
uniform float uRimGain;
uniform int uFace;
uniform vec3 uFaceDir, uFaceUp;
uniform vec4 uEye;          // blink, happy, wide, squint
uniform vec2 uLook;
uniform float uBlush, uEyeScale, uFaceAlpha;
uniform int uDebug;
uniform float uPixAng;     // world size of one pixel at distance 1 (2·tan(fov/2) / height in px)
varying vec2 vUv;
${FILM_GLSL.replace(/vec3 filmRGB[\s\S]*$/, '')}

#define MAXP ${MAXP}
#define MAXL ${MAXL}
vec4 F(int f, int i) { return texelFetch(tP, ivec2(f, i), 0); }
// fields: 0 pos.xyz,type · 1 size.xyz,round · 2 quat · 3 scale.xyz,bound · 4 glass,group,k,seed · 5 tint.rgb,fill ·
//         6 c2.rgb,ncol · 7 c3.rgb,thick · 8 alpha,pop,wobble,hole · 9 popDir.xyz,glow · 10 haze,rim,edge,env ·
//         11 frost,refract,tintAmt,spec
vec3 filmRGB(float d, float ci) { return texture2D(tFilm, vec2(clamp(d / 1600.0, 0.0, 1.0), ci)).rgb; }

// the primitives this ray can touch, in registers
vec4 LA[MAXL], LB[MAXL], LC[MAXL], LD[MAXL], LE[MAXL], LI[MAXL], LJ[MAXL];
int LX[MAXL];
int nL = 0;

vec3 qrot(vec4 q, vec3 v) { return v + 2.0 * cross(q.xyz, cross(q.xyz, v) + q.w * v); }
vec3 qinv(vec4 q, vec3 v) { return qrot(vec4(-q.xyz, q.w), v); }
float smin(float a, float b, float k) { float h = clamp(0.5 + 0.5 * (b - a) / k, 0.0, 1.0); return mix(b, a, h) - k * h * (1.0 - h); }
float sdEll(vec3 p, vec3 r) { float k0 = length(p / r); float k1 = length(p / (r * r)); return k0 * (k0 - 1.0) / max(k1, 1e-6); }
float sdRBox(vec3 p, vec3 b, float r) { vec3 q = abs(p) - b + r; return length(max(q, 0.0)) + min(max(q.x, max(q.y, q.z)), 0.0) - r; }
float sdTorus(vec3 p, vec2 t) { vec2 q = vec2(length(p.xz) - t.x, p.y); return length(q) - t.y; }
// a soft-body wobble that costs a few sines, not a noise
float wob(vec3 q, float s) {
  return sin(q.x * 2.1 + uTime * 2.3 + s) * sin(q.y * 1.7 - uTime * 1.9 + s * 1.3) * 0.6 + sin(q.z * 2.6 + q.y * 1.1 + uTime * 2.9 + s * 2.1) * 0.4;
}

// signed distance of local primitive j (solids: 0 sphere/ellipsoid, 1 rounded box, 2 torus; sheets: 3 wall, 4 tearing film)
float primSD(int j, vec3 p) {
  vec3 q = qinv(LC[j], p - LA[j].xyz);
  int type = int(LA[j].w);
  vec4 B = LB[j];
  if (type == 0) {
    float d = sdEll(q, B.x * LD[j].xyz);
    if (LI[j].z > 0.0) d += LI[j].z * B.x * wob(q / B.x, LE[j].w);
    return d;
  }
  if (type == 1) {
    float d = sdRBox(q, B.xyz, B.w);
    if (LI[j].z > 0.0) d += LI[j].z * B.y * wob(q / max(B.y, 1e-3), LE[j].w);
    return d;
  }
  if (type == 2) return sdTorus(q, B.xy);
  if (type == 3) {
    float rr = length(q.xy), hole = LI[j].w;
    float dr = max(hole - rr, rr - B.x);
    return length(vec2(max(dr, 0.0), q.z));
  }
  float R = B.x;
  float L = length(q);
  vec3 pd = normalize(LJ[j].xyz);
  float ang = acos(clamp(dot(q / max(L, 1e-5), pd), -1.0, 1.0)) / 3.14159265;
  vec3 qq = q / R;
  float rag = 0.03 * sin(qq.x * 9.0 + LE[j].w) * sin(qq.y * 7.0 - LE[j].w) + 0.012 * sin(qq.z * 23.0 + qq.x * 17.0);
  float front = LI[j].y * 1.18 + rag;
  if (ang >= front) return abs(L - R);
  float h = clamp(front, 0.0, 1.0) * 3.14159265;
  vec3 c = pd * R * cos(h);
  vec3 w = q - c;
  float along = dot(w, pd);
  float radial = length(w - pd * along) - R * sin(h);
  return length(vec2(radial, along));
}

// dS: signed distance of the union of solids (groups smooth-unioned inside, hard-unioned between); dW: unsigned
// distance to the nearest sheet; jS/jW: local index of the nearest member of each
void scene(vec3 p, out float dS, out int jS, out float dW, out int jW) {
  float dAll = 1e9, dG = 1e9, best = 1e9; float curG = -1e9; int jAll = -1, jG = -1;
  dW = 1e9; jW = -1;
  for (int j = 0; j < MAXL; j++) {
    if (j >= nL) break;
    float d = primSD(j, p);
    if (LA[j].w > 2.5) { if (d < dW) { dW = d; jW = j; } continue; }
    if (LE[j].y != curG) {
      if (dG < dAll) { dAll = dG; jAll = jG; }
      curG = LE[j].y; dG = d; jG = j; best = d;
    } else {
      dG = smin(dG, d, max(LE[j].z, 1e-4));
      if (d < best) { best = d; jG = j; }
    }
  }
  if (dG < dAll) { dAll = dG; jAll = jG; }
  dS = dAll; jS = jAll;
}
float solidOnly(vec3 p) { float a, b; int i, j; scene(p, a, i, b, j); return a; }
vec3 solidNormal(vec3 p, float e) {
  vec2 k = vec2(1.0, -1.0);
  return normalize(k.xyy * solidOnly(p + k.xyy * e) + k.yyx * solidOnly(p + k.yyx * e) + k.yxy * solidOnly(p + k.yxy * e) + k.xxx * solidOnly(p + k.xxx * e));
}

// the material at a surface point: every member of the hit's group weighted by how close it is (a merge blends)
struct Mat { float glass, fill, ncol, thick, alpha, glow, haze, rim, edge, envg, frost, refr, tintAmt, spec, seed; vec3 tint, c2, c3; int dom; float dsc; };
void addMat(inout Mat m, int i, float w) {
  vec4 E = F(4, i), T = F(5, i), C2 = F(6, i), C3 = F(7, i), A = F(8, i), G = F(9, i), H = F(10, i), K = F(11, i);
  m.glass += E.x * w; m.seed += E.w * w; m.tint += T.rgb * w; m.fill += T.a * w; m.c2 += C2.rgb * w; m.ncol += C2.a * w;
  m.c3 += C3.rgb * w; m.thick += C3.a * w; m.alpha += A.x * w; m.glow += G.w * w;
  m.haze += H.x * w; m.rim += H.y * w; m.edge += H.z * w; m.envg += H.w * w;
  m.frost += K.x * w; m.refr += K.y * w; m.tintAmt += K.z * w; m.spec += K.w * w;
}
Mat zeroMat() {
  Mat m;
  m.glass = 0.0; m.fill = 0.0; m.ncol = 0.0; m.thick = 0.0; m.alpha = 0.0; m.glow = 0.0; m.haze = 0.0; m.rim = 0.0;
  m.edge = 0.0; m.envg = 0.0; m.frost = 0.0; m.refr = 0.0; m.tintAmt = 0.0; m.spec = 0.0; m.seed = 0.0;
  m.tint = vec3(0.0); m.c2 = vec3(0.0); m.c3 = vec3(0.0); m.dom = -1; m.dsc = 1.0;
  return m;
}
Mat material(vec3 p, int jHit) {
  Mat m = zeroMat();
  float g = LE[jHit].y;
  float ds[MAXL];
  float dmin = 1e9;
  for (int j = 0; j < MAXL; j++) {
    ds[j] = 1e9;
    if (j >= nL) break;
    if (LA[j].w > 2.5 || LE[j].y != g) continue;
    ds[j] = primSD(j, p);
    dmin = min(dmin, ds[j]);
  }
  float wsum = 0.0, wbest = -1.0;
  for (int j = 0; j < MAXL; j++) {
    if (j >= nL) break;
    if (ds[j] > 1e8) continue;
    float w = exp(-max(ds[j] - dmin, 0.0) / max(LE[j].z, 1e-3) * 2.5);
    if (w > wbest) { wbest = w; m.dom = LX[j]; m.dsc = LB[j].x; }
    addMat(m, LX[j], w);
    wsum += w;
  }
  float iw = 1.0 / max(wsum, 1e-6);
  m.glass *= iw; m.seed *= iw; m.tint *= iw; m.fill *= iw; m.c2 *= iw; m.ncol *= iw; m.c3 *= iw; m.thick *= iw;
  m.alpha *= iw; m.glow *= iw; m.haze *= iw; m.rim *= iw; m.edge *= iw; m.envg *= iw; m.frost *= iw; m.refr *= iw;
  m.tintAmt *= iw; m.spec *= iw;
  return m;
}
Mat sheetMat(int j) { Mat m = zeroMat(); addMat(m, LX[j], 1.0); m.dom = LX[j]; m.dsc = LB[j].x; return m; }

// the world the films reflect: day — a soft sky (bright above, peach at the horizon), a big key softbox and a strip
// light; night — the brand's ink, a few far city lights, and the moving rim light that draws the opening
float softRect(vec2 p, vec2 c, vec2 h, float r) { vec2 q = abs(p - c) - h; return 1.0 - smoothstep(-r, r, length(max(q, 0.0)) + min(max(q.x, q.y), 0.0)); }
vec3 env(vec3 r, vec3 p) {
  vec3 day = mix(uSkyHor, uSkyTop, smoothstep(-0.05, 0.75, r.y));
  day = mix(day, uSkyLow, smoothstep(0.0, -0.6, r.y));
  vec3 k = normalize(uKeyDir);
  vec3 kx = normalize(cross(k, vec3(0.0, 1.0, 0.0))), ky = cross(kx, k);
  float dk = dot(r, k);
  if (dk > 0.0) { vec2 pk = vec2(dot(r, kx), dot(r, ky)) / dk; day += vec3(1.0, 0.98, 0.95) * uKeyGain * softRect(pk, vec2(0.0), vec2(0.38, 0.26), 0.07); }
  vec3 s = normalize(vec3(0.85, 0.15, -0.5));
  vec3 sx = normalize(cross(s, vec3(0.0, 1.0, 0.0))), sy = cross(sx, s);
  float ds = dot(r, s);
  if (ds > 0.0) { vec2 ps = vec2(dot(r, sx), dot(r, sy)) / ds; day += vec3(0.9, 0.95, 1.0) * 2.4 * softRect(ps, vec2(0.0), vec2(0.05, 0.5), 0.03); }
  vec3 col = day;
  if (uNight > 0.0) {
    vec3 night = mix(vec3(0.004, 0.008, 0.03), vec3(0.02, 0.035, 0.09), smoothstep(-0.4, 0.8, r.y));
    vec3 rr = normalize(r);
    vec2 sp = vec2(atan(rr.z, rr.x), rr.y) * vec2(9.0, 7.0);
    vec2 cell = floor(sp), f = fract(sp) - 0.5;
    float hsh = fract(sin(dot(cell, vec2(127.1, 311.7))) * 43758.5453);
    if (hsh > 0.82) night += mix(vec3(1.0, 0.7, 0.4), vec3(0.5, 0.7, 1.0), fract(hsh * 7.3)) * 1.6 * exp(-dot(f, f) * 40.0);
    // the night keeps a dim cool key, so a film still shows its colour
    night += vec3(0.25, 0.32, 0.55) * 0.5 * uKeyGain / 4.5 * smoothstep(0.85, 0.98, dot(normalize(r), normalize(uKeyDir)));
    col = mix(day, night, uNight);
  }
  if (uRimGain > 0.0) {
    vec3 L = normalize(uRimPos - p);
    float a = max(dot(normalize(r), L), 0.0);
    col += uRimCol * uRimGain * (pow(a, 900.0) * 6.0 + pow(a, 60.0) * 0.6 + pow(a, 8.0) * 0.08);
  }
  return col;
}

vec3 back(vec2 uv) { return texture2D(tBack, clamp(uv, vec2(0.0005), vec2(0.9995))).rgb; }

// Bub's face, painted on the front film: → rgb (navy, white, blush) and coverage
vec4 face(vec3 n, float aa0) {
  // aa0: one pixel in face units, computed from the hit distance (screen derivatives are undefined inside the march
  // loop, where neighbouring pixels sit on different steps: they drew dashed rings across Bub)
  vec3 fz = normalize(uFaceDir), fy0 = normalize(uFaceUp);
  vec3 fx = normalize(cross(fy0, fz)), fy = cross(fz, fx);
  float w = dot(n, fz);
  if (w < 0.15) return vec4(0.0);
  vec2 uv = vec2(dot(n, fx), dot(n, fy));
  vec4 o = vec4(0.0);
  float blink = uEye.x, happy = uEye.y, wide = uEye.z, squint = uEye.w;
  vec3 navy = vec3(0.0034, 0.0116, 0.0497);
  for (int s = -1; s <= 1; s += 2) {
    vec2 c = vec2(float(s) * 0.3 * uEyeScale + uLook.x * 0.12, -0.08 - uLook.y * 0.07);
    float ew = (0.15 + 0.03 * wide) * uEyeScale, eh = (0.23 + 0.05 * wide) * uEyeScale * (1.0 - 0.88 * min(1.0, blink)) * (1.0 - 0.55 * squint);
    eh = max(eh, 0.012);
    vec2 d = uv - c;
    if (happy < 0.5) {
      float e = (length(d / vec2(ew, eh)) - 1.0) * min(ew, eh);
      float aa = aa0;
      float m = 1.0 - smoothstep(-aa, aa, e);
      o.rgb = mix(o.rgb, navy, m); o.a = max(o.a, m);
      if (blink < 0.6 && squint < 0.7) {
        vec2 cl = c + vec2(ew * 0.32, eh * 0.38);
        float ec = length(uv - cl) - ew * 0.34;
        float ac = aa0;
        o.rgb = mix(o.rgb, vec3(1.0), (1.0 - smoothstep(-ac, ac, ec)) * m);
      }
    } else {
      vec2 ac = c + vec2(0.0, -0.06);
      float r = ew * 1.05;
      float e = abs(length(uv - ac) - r) - ew * 0.21;
      e = max(e, -(uv.y - ac.y + r * 0.2));
      float aa = aa0;
      float m = 1.0 - smoothstep(-aa, aa, e);
      o.rgb = mix(o.rgb, navy, m); o.a = max(o.a, m);
    }
    vec2 bc = vec2(float(s) * 0.47 * uEyeScale, -0.36 - uLook.y * 0.07);
    float eb = length((uv - bc) / vec2(0.12, 0.06)) - 1.0;
    float mb = (1.0 - smoothstep(-0.6, 0.4, eb)) * 0.3 * uBlush;
    o.rgb = mix(o.rgb, vec3(1.0, 0.19, 0.33), mb * (1.0 - o.a)); o.a = max(o.a, mb);
  }
  o.a *= smoothstep(0.15, 0.35, w) * uFaceAlpha;
  return o;
}

// one surface hit, shaded as glass: premultiplied rgb and coverage
vec4 shadeGlass(Mat m, vec3 N, vec3 V, vec3 Nv, vec3 envc) {
  float ci = clamp(dot(N, V), 0.0, 1.0);
  float Fr = 0.04 + 0.96 * pow(1.0 - ci, 5.0);
  float bev = pow(1.0 - ci, 1.6);
  vec2 off = -Nv.xy * m.refr * (0.15 + 0.85 * bev);
  vec2 px = 1.0 / uRes;
  vec3 refr = vec3(0.0);
  float fr = m.frost * 9.0;
  for (int c = 0; c < 3; c++) {
    vec2 o = off * (1.0 + (float(c) - 1.0) * 0.14);
    vec3 sm = back(vUv + o) * 2.0 + back(vUv + o + vec2(fr, 0.0) * px) + back(vUv + o - vec2(fr, 0.0) * px)
            + back(vUv + o + vec2(0.0, fr) * px) + back(vUv + o - vec2(0.0, fr) * px);
    refr[c] = (sm / 6.0)[c];
  }
  vec3 col = refr * mix(vec3(1.0), m.tint, m.tintAmt);
  if (m.fill > 0.0) {
    float key = 0.5 + 0.5 * dot(N, normalize(uKeyDir));
    vec3 body = m.tint * mix(0.78, 1.12, key);
    body = mix(body, body * 0.72, bev * 0.6);
    col = mix(col, body, m.fill);
  }
  // frosted body: on a pale ground clear glass disappears, so it carries a little milk (haze), lighter at the centre
  if (m.haze > 0.0) col = mix(col, vec3(0.97, 0.985, 1.0), m.haze * (0.75 + 0.25 * ci));
  col = col * (1.0 - Fr) + envc * Fr * m.envg;
  // the silhouette: a thin darker line where the surface turns away, so the shape reads on white
  col *= 1.0 - 0.22 * m.edge * smoothstep(0.32, 0.04, ci);
  vec3 H = normalize(normalize(uKeyDir) + V);
  col += vec3(1.0) * m.spec * pow(max(dot(N, H), 0.0), 160.0) * 2.4;
  col += vec3(1.0) * m.spec * 0.35 * pow(max(dot(N, H), 0.0), 18.0) * (1.0 - m.fill * 0.5);
  col += vec3(1.0) * m.edge * pow(1.0 - ci, 2.6) * smoothstep(0.02, 0.2, ci) * 0.9;
  col += m.tint * m.glow * pow(1.0 - ci, 2.0);
  return vec4(col * m.alpha, m.alpha);
}

// one surface hit, shaded as soap film
vec4 shadeSoap(Mat m, vec3 p, vec3 N, vec3 V, vec3 envc, bool backside, bool first, bool tearing, int jSheet, float tHit) {
  float ci = clamp(dot(N, V), 0.0, 1.0);
  vec3 c0 = F(0, m.dom).xyz;
  vec3 lp = (p - c0) / max(m.dsc, 1e-3);
  vec3 q = lp * 1.6 + vec3(m.seed);
  float sw = fbm(q + vec3(0.0, -uTime * 0.12, 0.0) + vec3(sin(uTime * 0.3), 0.0, cos(uTime * 0.27)));
  float drain = mix(0.45, 1.35, 0.5 - 0.5 * normalize(lp + 1e-5).y);
  float dnm = max(m.thick * drain + 260.0 * sw, 20.0);
  vec3 film = filmRGB(dnm, ci);
  vec3 col = film * envc * m.envg;
  float Ravg = dot(film, vec3(0.2126, 0.7152, 0.0722));
  float a = clamp(Ravg * 0.35 + pow(1.0 - ci, 3.0) * 0.18, 0.0, 1.0);
  if (backside) col *= 0.45;
  if (tearing) {
    vec3 ql = qinv(LC[jSheet], p - LA[jSheet].xyz);
    vec3 pd = normalize(LJ[jSheet].xyz);
    float ang = acos(clamp(dot(normalize(ql), pd), -1.0, 1.0)) / 3.14159265;
    float rim = 1.0 - smoothstep(0.0, 0.03, ang - LI[jSheet].y * 1.18);
    rim *= rim;
    col += rim * (filmRGB(dnm * 1.6 + 120.0, ci) * 1.6 + vec3(0.9, 0.92, 1.0));
    a = max(a, rim * 0.45);
  }
  if (m.fill > 0.0 && !backside) {
    vec3 n = normalize(lp + 1e-5);
    float aa = 0.5 + 0.5 * snoise(n * 0.75 + vec3(m.seed, uTime * 0.18, 0.0));
    float bb = 0.5 + 0.5 * snoise(n * 0.65 + vec3(-m.seed * 1.3, 2.0, uTime * 0.15));
    float grad = 0.5 + 0.5 * dot(n, normalize(vec3(-0.6, 0.8, 0.2)));
    vec3 ink = m.tint;
    if (m.ncol > 1.5) ink = okMix(m.tint, m.c2, smoothstep(0.25, 0.75, mix(aa, 1.0 - grad, 0.55)));
    if (m.ncol > 2.5) ink = okMix(ink, m.c3, smoothstep(0.45, 0.85, mix(bb, grad, 0.35)) * 0.9);
    float rimk = pow(1.0 - ci, 2.0);
    float key = 0.5 + 0.5 * dot(N, normalize(uKeyDir));
    vec3 lit = ink * mix(0.82, 1.08, key) + m.glow * 0.35 * (1.0 - rimk) * mix(ink, vec3(1.0), 0.5);
    vec3 inside = okMix(lit, ink * 0.72, rimk * 0.6);
    col = inside * m.fill + col;
    a = m.fill + (1.0 - m.fill) * a;
  }
  if (m.haze + m.rim + m.edge > 0.0) {
    float rimH = pow(1.0 - ci, 1.7);
    float hz = m.haze * mix(0.12, 1.0, rimH) * (backside ? 0.35 : 1.0);
    col += vec3(1.0) * hz; a += hz * (1.0 - a);
    float rr = m.rim * pow(1.0 - ci, 2.4) * (backside ? 0.3 : 1.0);
    vec3 fr = filmRGB(dnm * 1.25 + 90.0, ci);
    float lum = dot(fr, vec3(0.2126, 0.7152, 0.0722));
    vec3 sat = clamp(lum + (fr - lum) * 2.4, 0.0, 1.6) * 0.62;
    float cover = clamp(rr * 0.42, 0.0, 0.75);
    col = col * (1.0 - cover) + sat * cover; a += cover * (1.0 - a);
    float e = m.edge * smoothstep(0.3, 0.05, ci) * (backside ? 0.0 : 1.0);
    col = col * (1.0 - e) + vec3(0.36, 0.4, 0.7) * 0.5 * e; a = a * (1.0 - e) + e * 0.85;
  }
  if (uFace >= 0 && m.dom == uFace && !backside) {
    float aa0 = tHit * uPixAng / (max(m.dsc, 1e-3) * max(ci, 0.15)) * 0.9;
    vec4 fc = face(normalize(p - c0), aa0);
    col = col * (1.0 - fc.a) + fc.rgb * fc.a;
    a = a * (1.0 - fc.a) + fc.a;
  }
  return vec4(col * m.alpha, a * m.alpha);
}

void main() {
  vec4 ndc = vec4(vUv * 2.0 - 1.0, 1.0, 1.0);
  vec4 vp = uProjInv * ndc; vp /= vp.w;
  vec3 rd = normalize((uCamWorld * vec4(vp.xyz, 0.0)).xyz);
  vec3 ro = uCamPos;
  vec3 bg = back(vUv);

  // the primitives this ray can touch (bounding spheres), copied into registers in group order
  float tmin = 1e9, tmax = -1.0;
  for (int i = 0; i < MAXP; i++) {
    if (i >= uCount || nL >= MAXL) break;
    vec4 A = F(0, i), D = F(3, i);
    vec3 oc = ro - A.xyz;
    float b = dot(oc, rd), cc = dot(oc, oc) - D.w * D.w, h = b * b - cc;
    if (h <= 0.0) continue;
    h = sqrt(h);
    if (-b + h <= 0.0) continue;
    LA[nL] = A; LB[nL] = F(1, i); LC[nL] = F(2, i); LD[nL] = D; LE[nL] = F(4, i); LI[nL] = F(8, i); LJ[nL] = F(9, i); LX[nL] = i;
    nL++;
    tmin = min(tmin, -b - h); tmax = max(tmax, -b + h);
  }
  if (nL == 0) { gl_FragColor = vec4(bg, 1.0); return; }
  // something rasterised (a crowd orb) in front: the ray stops there
  if (uUseDepth == 1) {
    float zb = texture2D(tDepth, vUv).x;
    if (zb < 0.99999) {
      float ndcZ = zb * 2.0 - 1.0;
      float viewZ = 2.0 * uNear * uFar / (uFar + uNear - ndcZ * (uFar - uNear));
      vec3 fwd = normalize((uCamWorld * vec4(0.0, 0.0, -1.0, 0.0)).xyz);
      tmax = min(tmax, viewZ / max(dot(rd, fwd), 1e-4));
      if (tmax <= max(tmin, 0.0)) { gl_FragColor = vec4(bg, 1.0); return; }
    }
  }

  vec4 acc = vec4(0.0);
  float t = max(tmin, 0.0);
  int hits = 0;
  bool first = true;
  bool armed = true;          // a hit is only taken after the ray has left the last surface (no double hits)
  for (int s = 0; s < 220; s++) {
    if (t > tmax || hits >= 6 || acc.a > 0.995) break;
    vec3 p = ro + rd * t;
    float dS, dW; int jS, jW;
    scene(p, dS, jS, dW, jW);
    float d = min(abs(dS), dW);
    float eps = max(0.0006 * t, 0.0004);
    if (d > eps) { armed = armed || d > 2.5 * eps; t += d * 0.85; continue; }
    if (!armed) { t += max(eps * 1.5, 0.0012); continue; }
    armed = false;
    bool sheet = dW < abs(dS);
    int j = sheet ? jW : jS;
    int type = int(LA[j].w);
    vec3 N;
    if (!sheet) N = solidNormal(p, max(eps * 0.5, 0.0003));
    else if (type == 3) N = qrot(LC[j], vec3(0.0, 0.0, 1.0));
    else N = normalize(p - LA[j].xyz);
    bool backside = dot(N, rd) > 0.0;
    if (backside) N = -N;
    vec3 V = -rd;
    float ci = clamp(dot(N, V), 0.0, 1.0);
    Mat m;
    if (sheet) m = sheetMat(j); else m = material(p, j);
    vec3 R = reflect(rd, N);
    vec3 Nv = (uView * vec4(N, 0.0)).xyz;
    vec3 envc = env(R, p);
    if (uSSR > 0.0 && m.glass > 0.5) {
      vec2 so = Nv.xy * 0.16;
      vec3 sr = (back(vUv + so) + back(vUv + so * 1.25) + back(vUv + so * 0.8)) / 3.0;
      envc = mix(envc, sr * 1.1, uSSR * (1.0 - ci) * 0.5);
    }
    vec4 c;
    if (m.glass >= 0.98 && !backside) c = shadeGlass(m, N, V, Nv, envc);
    else if (m.glass <= 0.02 || backside) c = shadeSoap(m, p, N, V, envc, backside, first, sheet && type == 4, j, t);
    else c = mix(shadeSoap(m, p, N, V, envc, backside, first, false, j, t), shadeGlass(m, N, V, Nv, envc), smoothstep(0.0, 1.0, m.glass));
    if (!backside) first = false;
    acc.rgb += (1.0 - acc.a) * c.rgb;
    acc.a += (1.0 - acc.a) * c.a;
    hits++;
    // glass is solid: once it covers the pixel nothing behind it is marched (its refraction already brought it in)
    if (m.glass > 0.5 && !backside && c.a > 0.97) break;
    t += max(eps * 4.0, 0.002);
  }
  if (uDebug == 1) { gl_FragColor = vec4(float(hits == 1), float(hits == 2), float(hits >= 3), 1.0); return; }
  gl_FragColor = vec4(acc.rgb + bg * (1.0 - acc.a), 1.0);
}`;

// ── the thin-film LUT: Airy reflectance through the CIE 1931 observer (Wyman–Sloan–Shirley fits), 0–1600 nm × cosθ ──
function filmLUT(nw = 1024, nh = 64) {
  const g = (x, mu, s1, s2) => { const t = (x - mu) / (x < mu ? s1 : s2); return Math.exp(-0.5 * t * t); };
  const cie = (l) => [1.056 * g(l, 599.8, 37.9, 31.0) + 0.362 * g(l, 442.0, 16.0, 26.7) - 0.065 * g(l, 501.1, 20.4, 26.2),
    0.821 * g(l, 568.8, 46.9, 40.5) + 0.286 * g(l, 530.9, 16.3, 31.1), 1.217 * g(l, 437.0, 11.8, 36.0) + 0.681 * g(l, 459.0, 26.0, 13.8)];
  const toRGB = ([X, Y, Z]) => [3.2406 * X - 1.5372 * Y - 0.4986 * Z, -0.9689 * X + 1.8758 * Y + 0.0415 * Z, 0.0557 * X - 0.2040 * Y + 1.0570 * Z];
  const NL = 40, n = 1.33;
  const L = Array.from({ length: NL }, (_, i) => 400 + 300 * (i + 0.5) / NL), CS = L.map(cie);
  const wsum = CS.reduce((a, c) => [a[0] + c[0], a[1] + c[1], a[2] + c[2]], [0, 0, 0]);
  const white = toRGB(wsum.map((v) => v / wsum[1]));
  const data = new Uint16Array(nw * nh * 4);
  for (let y = 0; y < nh; y++) {
    const ci = y / (nh - 1);
    const si2 = 1 - ci * ci, ct = Math.sqrt(Math.max(0, 1 - si2 / (n * n)));
    const r2 = 0.02 + 0.98 * Math.pow(1 - ci, 5);
    for (let x = 0; x < nw; x++) {
      const d = (x / (nw - 1)) * 1600;
      const xyz = [0, 0, 0];
      for (let i = 0; i < NL; i++) {
        const s = Math.sin(0.5 * (4 * Math.PI * n * d * ct / L[i])), Fv = 4 * r2 * s * s;
        const R = Fv / ((1 - r2) * (1 - r2) + Fv);
        xyz[0] += CS[i][0] * R; xyz[1] += CS[i][1] * R; xyz[2] += CS[i][2] * R;
      }
      const rgb = toRGB(xyz.map((v) => v / wsum[1]));
      const o = (y * nw + x) * 4;
      for (let c = 0; c < 3; c++) data[o + c] = THREE.DataUtils.toHalfFloat(Math.max(0, rgb[c] / white[c]));
      data[o + 3] = THREE.DataUtils.toHalfFloat(1);
    }
  }
  const tex = new THREE.DataTexture(data, nw, nh, THREE.RGBAFormat, THREE.HalfFloatType);
  tex.minFilter = tex.magFilter = THREE.LinearFilter;
  tex.wrapS = tex.wrapT = THREE.ClampToEdgeWrapping;
  tex.needsUpdate = true;
  return tex;
}

// ── JS side ──────────────────────────────────────────────────────────────────────────────────────────────────────
const TYPES = { sphere: 0, box: 1, torus: 2, wall: 3, shell: 4 };
const lin = (hex) => { const c = new THREE.Color(hex).convertSRGBToLinear(); return [c.r, c.g, c.b]; };
export const linHex = lin;

// defaults per material: a soap film that reads on a pale sky, and a clear Liquid Glass
export const SOAP = { glass: 0, thick: 400, alpha: 1, haze: 0.18, rim: 1.8, edge: 0.6, env: 1.25, frost: 0, refr: 0, tintAmt: 0, spec: 0 };
export const GLASS = { glass: 1, thick: 400, alpha: 1, haze: 0.22, rim: 0, edge: 0.55, env: 0.9, frost: 0.35, refr: 0.045, tintAmt: 0.18, spec: 0.9 };

export function liquidLayer() {
  const data = new Float32Array(FIELDS * MAXP * 4);
  const tex = new THREE.DataTexture(data, FIELDS, MAXP, THREE.RGBAFormat, THREE.FloatType);
  tex.minFilter = tex.magFilter = THREE.NearestFilter;
  tex.needsUpdate = true;
  const u = (v) => ({ value: v });
  const mat = new THREE.ShaderMaterial({
    vertexShader: VERT, fragmentShader: FRAG,
    uniforms: {
      tBack: u(null), tP: u(tex), tFilm: u(filmLUT()), tDepth: u(null), uNear: u(0.05), uFar: u(600), uUseDepth: u(0), uCount: u(0), uRes: u(new THREE.Vector2(1080, 1920)), uCamPos: u(new THREE.Vector3()),
      uCamWorld: u(new THREE.Matrix4()), uProjInv: u(new THREE.Matrix4()), uView: u(new THREE.Matrix4()), uTime: u(0),
      uSkyTop: u(new THREE.Color()), uSkyHor: u(new THREE.Color()), uSkyLow: u(new THREE.Color()),
      uKeyDir: u(new THREE.Vector3(-0.55, 0.6, 0.6)), uKeyGain: u(4.5), uNight: u(0), uSSR: u(0.5),
      uRimPos: u(new THREE.Vector3()), uRimCol: u(new THREE.Color(1, 1, 1)), uRimGain: u(0),
      uFace: u(-1), uFaceDir: u(new THREE.Vector3(0, 0, 1)), uFaceUp: u(new THREE.Vector3(0, 1, 0)), uEye: u(new THREE.Vector4()),
      uLook: u(new THREE.Vector2()), uBlush: u(0.6), uEyeScale: u(1), uFaceAlpha: u(1),
      uDebug: u(Number(new URLSearchParams(location.search).get('ldebug') || 0)), uPixAng: u(0.001),
    },
    depthTest: false, depthWrite: false,
  });
  const scene = new THREE.Scene();
  const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), mat);
  quad.frustumCulled = false;
  scene.add(quad);
  const cam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

  // prims: [{ type, pos, size, round, quat, scale, group, k, glass…, face }] → the texture, sorted by group (stable)
  function upload(prims) {
    const list = prims.filter((p) => (p.alpha ?? 1) > 0.001).map((p, i) => ({ p, i }))
      .sort((a, b) => (a.p.group ?? 1e3 + a.i) - (b.p.group ?? 1e3 + b.i) || a.i - b.i);
    if (list.length > MAXP) throw new Error(`liquid: ${list.length} primitives (max ${MAXP})`);
    data.fill(0);
    let face = -1;
    list.forEach(({ p, i: orig }, i) => {
      const b = { ...(p.glass ? GLASS : SOAP), ...p };
      const type = TYPES[b.type ?? 'sphere'];
      if (type === undefined) throw new Error(`liquid: unknown type ${b.type}`);
      const size = b.size ?? [1, 1, 1];
      const sc = b.scale ?? [1, 1, 1];
      const k = b.k ?? 0;
      let bound;
      if (type === 0 || type === 4) bound = size[0] * Math.max(...sc) * (1 + (b.wobble ?? 0) * 1.2);
      else if (type === 1) bound = Math.hypot(size[0], size[1], size[2]) * (1 + (b.wobble ?? 0));
      else if (type === 2) bound = size[0] + size[1];
      else bound = size[0] * 1.02;
      bound += k * 0.5 + 0.002;
      const t = b.tint ? lin(b.tint) : [1, 1, 1];
      const c2 = b.c2 ? lin(b.c2) : t, c3 = b.c3 ? lin(b.c3) : c2;
      const rows = [
        [...b.pos, type], [size[0], size[1] ?? size[0], size[2] ?? size[0], b.round ?? 0], b.quat ?? [0, 0, 0, 1], [...sc, bound],
        [b.glass, b.group ?? 1000 + orig, k, b.seed ?? orig * 1.37], [...t, b.fill ?? 0], [...c2, b.ncol ?? (b.c3 ? 3 : b.c2 ? 2 : 1)],
        [...c3, b.thick], [b.alpha, b.pop ?? 0, b.wobble ?? 0, b.hole ?? 0], [...(b.popDir ?? [0.3, 0.6, 1]), b.glow ?? 0],
        [b.haze, b.rim, b.edge, b.env], [b.frost, b.refr, b.tintAmt, b.spec],
      ];
      rows.forEach((r, f) => data.set(r, ((i * FIELDS) + f) * 4));
      if (b.face) face = i;
    });
    tex.needsUpdate = true;
    mat.uniforms.uCount.value = list.length;
    mat.uniforms.uFace.value = face;
  }

  return { scene, cam, uniforms: mat.uniforms, upload };
}
