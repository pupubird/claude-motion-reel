// GLSL for the two full-screen passes.
// COMPOSITE runs once per motion-blur sub-frame and accumulates into a float target. Back to front:
//   the UNDER 2D layer (or, when a 3D shot is live, the 3D render, which already holds UNDER as its background so
//   glass can refract it), then the OVER 2D layer, then lens FX (zoom, shake, flash, fade).
// FINAL runs once per frame: a light grain and a triangular dither. No tone curve on 2D: brand colours stay exact.
export const QUAD_VERT = /* glsl */ `
varying vec2 vUv;
void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }
`;

export const COMPOSITE_FRAG = /* glsl */ `
precision highp float;
uniform sampler2D tBase;
uniform sampler2D tUnder;
uniform sampler2D tOver;
uniform float uBaseOn, uExposure, uWeight;
uniform float uFlash, uZoom, uFade;
uniform vec2 uShake, uZoomAt;
uniform vec3 uFlashColor, uBg, uFadeColor;
uniform sampler2D tField;
uniform float uFieldOn;
uniform vec2 uWhip;
uniform vec4 uBeam;        // x, y (uv), gain, length
uniform vec3 uBeamCol;
uniform float uBeamAng;
uniform vec4 uShock;       // a shockwave: x, y (uv), radius (frame heights), strength (uv)
uniform float uShockW;     // its ring's width (frame heights)
uniform float uShockDisp;  // its colour split, × its bend (0: a clean bend)
uniform float uChroma;     // the lens's colour split, radial from uChromaAt (uv per uv)
uniform vec2 uChromaAt;
uniform float uDesat;      // the colour drained from the frame (the beat before a hit), lifted toward a cool paper
uniform vec4 uBulge;       // a pane of glass bowing toward the lens: x, y (uv), radius (frame heights), amount
uniform vec4 uRays;        // god rays: light streaming out of a point — x, y (uv), strength, reach (0..1 of the way)
uniform vec3 uRaysCol;
uniform vec4 uTunnel;      // a dive: a radial zoom streak about x, y (uv), its strength, its colour split
varying vec2 vUv;

vec3 toSRGB(vec3 c) { return mix(c * 12.92, 1.055 * pow(c, vec3(1.0 / 2.4)) - 0.055, step(0.0031308, c)); }

vec3 under(vec2 uv) {
  vec4 u = texture2D(tUnder, uv);            // premultiplied sRGB
  vec3 bg = uFieldOn > 0.5 ? texture2D(tField, uv).rgb : uBg;
  return u.rgb + bg * (1.0 - u.a);
}
vec3 base(vec2 uv) {
  if (uBaseOn < 0.5) return under(uv);
  vec3 c = max(texture2D(tBase, uv).rgb, 0.0) * uExposure;
  // no tone curve: a light-theme frame lives near white, and any knee would grey the paper; specular clips to white
  return toSRGB(clamp(c, 0.0, 1.0));
}

// the frame at uv: OVER on the base; past its edge (a whip) the field (or the paper), never a smeared edge
vec3 frameAt(vec2 uv) {
  if (uv.x < 0.0 || uv.x > 1.0 || uv.y < 0.0 || uv.y > 1.0) return uFieldOn > 0.5 ? texture2D(tField, fract(uv)).rgb : uBg;
  vec4 o = texture2D(tOver, uv);              // premultiplied sRGB
  return o.rgb + base(uv) * (1.0 - o.a);
}

void main() {
  vec2 uv = (vUv - uZoomAt) / uZoom + uZoomAt + uShake + uWhip;
  vec2 asp = vec2(1080.0 / 1920.0, 1.0);
  if (uBulge.w != 0.0) {
    // the pane bows toward us round the point he pushes on: what lies behind it is magnified there, most at the middle
    vec2 d = (uv - uBulge.xy) * asp;
    float r = length(d) / max(uBulge.z, 1e-4);
    if (r < 1.0) { float k = 1.0 - r * r; uv = uBulge.xy + (d * (1.0 - uBulge.w * k * k)) / asp; }
  }
  // a shockwave: a ring of air running out from a hit bends the frame (in at its front, out behind it)
  float ring = 0.0; vec2 rdir = vec2(0.0);
  if (uShock.w > 0.0) {
    vec2 d = (vUv - uShock.xy) * asp;
    float r = length(d), x = (r - uShock.z) / max(uShockW, 1e-4);
    ring = exp(-x * x);
    rdir = d / max(r, 1e-5) / asp;
    uv -= rdir * x * ring * uShock.w;
  }
  // the colour split: the lens's own (radial from the hit) and the ring's (it bends each colour its own amount)
  vec2 co = (vUv - uChromaAt) * uChroma + rdir * ring * uShock.w * uShockDisp;
  vec3 col;
  // (the colour split, the shake and the shockwave must not reach past the frame's edge: clamp inside it — only a
  // whip shows what lies beyond)
  vec2 lo = vec2(0.0005), hi = vec2(0.9995);
  if (dot(uWhip, uWhip) < 1e-10) uv = clamp(uv, lo, hi);
  if (uTunnel.z > 0.0) {
    // the dive: every point streaks out from the centre (a zoom smear), each colour scaled its own amount (a prism)
    vec2 d = uv - uTunnel.xy;
    vec3 acc = vec3(0.0);
    for (int i = 0; i < 12; i++) {
      float f = float(i) / 11.0;
      float sc = 1.0 - uTunnel.z * f;
      acc += vec3(frameAt(uTunnel.xy + d * (sc - uTunnel.w * f)).r, frameAt(uTunnel.xy + d * sc).g, frameAt(uTunnel.xy + d * (sc + uTunnel.w * f)).b);
    }
    col = acc / 12.0;
  } else if (dot(co, co) > 1e-9) col = vec3(frameAt(clamp(uv + co, lo, hi)).r, frameAt(uv).g, frameAt(clamp(uv - co, lo, hi)).b);
  else col = frameAt(uv);
  if (uRays.z > 0.0) {
    // god rays: the bright parts of the frame smeared along the line to the light (a light through haze)
    vec2 dir = uRays.xy - uv;
    float acc = 0.0, w = 1.0;
    for (int i = 0; i < 24; i++) {
      vec3 c = frameAt(uv + dir * (float(i) / 24.0) * uRays.w);
      acc += max(dot(c, vec3(0.299, 0.587, 0.114)) - 0.62, 0.0) * w;
      w *= 0.94;
    }
    col += uRaysCol * acc * uRays.z * 0.18;
  }
  if (uDesat > 0.0) {
    float l = dot(col, vec3(0.2126, 0.7152, 0.0722));
    col = mix(col, mix(vec3(l), vec3(0.93, 0.95, 1.0), 0.3), uDesat);
  }
  if (uBeam.z > 0.0) {
    // a light hit: two crossed soft beams and a core, added in light (screen), the lens's own streaks
    vec2 d = (vUv - uBeam.xy) * vec2(1080.0 / 1920.0, 1.0);
    float b = 0.0;
    for (int i = 0; i < 2; i++) {
      float a = (i == 0 ? uBeamAng : -uBeamAng) + 1.5708;
      vec2 ax = vec2(cos(a), sin(a));
      float along = dot(d, ax), perp = dot(d, vec2(-ax.y, ax.x));
      b += exp(-abs(perp) * 160.0) * exp(-abs(along) * 2.2 / uBeam.w) * 0.9 + exp(-abs(perp) * 28.0) * exp(-abs(along) * 3.5 / uBeam.w) * 0.25;
    }
    b += exp(-length(d) * 9.0) * 0.8 + exp(-length(d) * 30.0) * 1.2;
    vec3 add = uBeamCol * b * uBeam.z;
    col = 1.0 - (1.0 - col) * (1.0 - clamp(add, 0.0, 1.0));
  }
  col = mix(col, uFlashColor, clamp(uFlash, 0.0, 1.0));
  col = mix(col, uFadeColor, clamp(uFade, 0.0, 1.0));
  gl_FragColor = vec4(col * uWeight, 1.0);
}
`;

export const FINAL_FRAG = /* glsl */ `
precision highp float;
uniform sampler2D tAccum;
uniform float uFrame, uGrain;
varying vec2 vUv;

float hash(vec3 p) { p = fract(p * 0.1031); p += dot(p, p.zyx + 31.32); return fract((p.x + p.y) * p.z); }

void main() {
  vec3 col = texture2D(tAccum, vUv).rgb;
  float l = dot(col, vec3(0.2126, 0.7152, 0.0722));
  float g = hash(vec3(gl_FragCoord.xy, mod(uFrame, 997.0) * 1.37)) - 0.5;
  col += g * uGrain * (0.35 + 1.6 * l * (1.0 - l));
  // triangular dither: soft pastel gradients must not band after 8-bit quantisation
  col += (hash(vec3(gl_FragCoord.xy * 1.7, uFrame + 3.1)) - hash(vec3(gl_FragCoord.yx * 0.9, uFrame + 7.7))) / 255.0;
  gl_FragColor = vec4(clamp(col, 0.0, 1.0), 1.0);
}
`;

// v2: the silk field. A light-theme shader field instead of one flat colour: four pastel inks domain-warped into slow
// silk folds, a soft sheen running along each fold (the light caught in the cloth), lifted toward white so it stays
// paper. Raw sRGB out, as UNDER is (the composite and the 3D backdrop read it as UNDER's background).
export const FIELD_FRAG = /* glsl */ `
precision highp float;
uniform float uTime, uFlow, uSilk;
uniform vec2 uRes, uShift;
uniform vec3 uA, uB, uC, uD;
varying vec2 vUv;
vec3 hash3(vec2 p) { vec3 q = vec3(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)), dot(p, vec2(419.2, 371.9))); return fract(sin(q) * 43758.5453); }
float vnoise(vec2 p) {
  vec2 i = floor(p), f = fract(p); vec2 u = f * f * (3.0 - 2.0 * f);
  float a = hash3(i).x, b = hash3(i + vec2(1, 0)).x, c = hash3(i + vec2(0, 1)).x, d = hash3(i + vec2(1, 1)).x;
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}
float fbm2(vec2 p) { float s = 0.0, a = 0.5; for (int i = 0; i < 3; i++) { s += a * vnoise(p); p = p * 2.03 + 17.1; a *= 0.5; } return s; }
void main() {
  vec2 p = (vUv - 0.5) * vec2(uRes.x / uRes.y, 1.0) * 0.75 + uShift;
  float t = uTime * 0.07 * uFlow;
  vec2 q = vec2(fbm2(p + vec2(0.0, t)), fbm2(p + vec2(5.2, 1.3 - t)));
  vec2 r = vec2(fbm2(p + 1.6 * q + vec2(1.7, 9.2) + t * 0.6), fbm2(p + 1.6 * q + vec2(8.3, 2.8) - t * 0.4));
  float f = fbm2(p + 1.4 * r);
  vec3 col = mix(uA, uB, smoothstep(0.15, 0.85, vUv.y + (f - 0.5) * 0.6));
  col = mix(col, uC, smoothstep(0.45, 0.9, r.x) * 0.55 * uSilk);
  col = mix(col, uD, smoothstep(0.5, 0.95, q.y) * 0.45 * uSilk);
  // the sheen on each fold: the field's gradient lit from the upper left
  float e = 0.004;
  float fx = fbm2(p + 1.4 * r + vec2(e, 0.0)) - f, fy = fbm2(p + 1.4 * r + vec2(0.0, e)) - f;
  float sheen = clamp(dot(normalize(vec3(fx, fy, e * 0.6)), normalize(vec3(-0.5, 0.6, 0.6))), 0.0, 1.0);
  col += vec3(1.0) * pow(sheen, 4.0) * 0.16 * uSilk;
  col = mix(col, vec3(1.0), 0.12);
  gl_FragColor = vec4(clamp(col, 0.0, 1.0), 1.0);
}`;
