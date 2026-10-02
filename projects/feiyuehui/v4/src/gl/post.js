// The full-screen passes. Per sub-sample: scene (linear HDR) → optional depth of field → accumulate.
// Once per frame on the accumulated HDR image: bloom (a 6-level energy-conserving pyramid), six-point glints on the
// brightest highlights, then lens (chromatic aberration), exposure, Khronos PBR Neutral, grade, vignette, grain.
export const QUAD_VERT = /* glsl */ `
out vec2 vUv;
void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }
`;

// Single-pass scatter-as-gather bokeh (after D. Gustafsson): a golden-angle spiral whose radius grows as 1/r, so the
// tap density is even over the disc. Background taps cannot blur over a sharper foreground; foreground taps with a
// large circle of confusion spill over the background behind them. uAngle rotates the spiral per sub-sample, so the
// accumulation averages its pattern out.
export const DOF_FRAG = /* glsl */ `
precision highp float;
uniform sampler2D tColor;
uniform sampler2D tDepth;
uniform vec2 uPx;          // 1 / buffer size
uniform float uNear, uFar;
uniform float uFocus;      // focus distance, metres
uniform float uCocScale;   // circle-of-confusion radius in px per (1/m) of |1/focus − 1/z|
uniform float uMaxCoc;     // px
uniform float uRadScale;   // spiral step (px): smaller = smoother, slower
uniform float uAngle;
uniform float uAspectSqueeze; // > 1 = anamorphic (oval) bokeh
in vec2 vUv;
out vec4 fragColor;

float viewDist(float d) { return (uNear * uFar) / (uFar - d * (uFar - uNear)); }
float coc(float z) { return clamp(abs(1.0 / uFocus - 1.0 / z) * uCocScale, 0.0, uMaxCoc); }

void main() {
  float zc = viewDist(texture(tDepth, vUv).r);
  float cc = coc(zc);
  vec3 col = texture(tColor, vUv).rgb;
  if (uMaxCoc < 0.5) { fragColor = vec4(col, 1.0); return; }
  float tot = 1.0;
  float r = uRadScale;
  float ang = uAngle;
  for (int i = 0; i < 2048; i++) {
    if (r >= uMaxCoc) break;
    vec2 o = vec2(cos(ang), sin(ang) * uAspectSqueeze) * r;
    vec2 tc = vUv + o * uPx;
    vec3 sc = texture(tColor, tc).rgb;
    float zs = viewDist(texture(tDepth, tc).r);
    float cs = coc(zs);
    if (zs > zc) cs = min(cs, cc * 2.0);
    float m = smoothstep(r - 0.5, r + 0.5, cs);
    col += mix(col / tot, sc, m);
    tot += 1.0;
    ang += 2.39996323;
    r += uRadScale / r;
  }
  fragColor = vec4(col / tot, 1.0);
}
`;

export const ACCUM_FRAG = /* glsl */ `
precision highp float;
uniform sampler2D tSrc;
uniform float uWeight;
in vec2 vUv;
out vec4 fragColor;
void main() {
  vec3 c = texture(tSrc, vUv).rgb;
  // one NaN (a bad uniform, a degenerate normal) would spread through the bloom pyramid and black out the frame
  if (any(isnan(c)) || any(isinf(c))) c = vec3(0.0);
  fragColor = vec4(max(c, 0.0) * uWeight, uWeight);
}
`;

// Jimenez 2014 (CoD: AW) downsample: 13 taps in 5 overlapping boxes. The first level uses a Karis average so a single
// diamond fire pixel cannot become a flickering blob.
export const DOWN_FRAG = /* glsl */ `
precision highp float;
uniform sampler2D tSrc;
uniform vec2 uPx;      // 1 / source size
uniform float uKaris;
uniform float uClamp;  // max luminance fed into the pyramid
in vec2 vUv;
out vec4 fragColor;
vec3 s(vec2 o) { vec3 c = texture(tSrc, vUv + o * uPx).rgb; float l = dot(c, vec3(0.2126, 0.7152, 0.0722)); return l > uClamp ? c * (uClamp / l) : c; }
float kw(vec3 c) { return 1.0 / (1.0 + dot(c, vec3(0.2126, 0.7152, 0.0722))); }
void main() {
  vec3 a = s(vec2(-2, 2)), b = s(vec2(0, 2)), c = s(vec2(2, 2));
  vec3 d = s(vec2(-2, 0)), e = s(vec2(0, 0)), f = s(vec2(2, 0));
  vec3 g = s(vec2(-2, -2)), h = s(vec2(0, -2)), i = s(vec2(2, -2));
  vec3 j = s(vec2(-1, 1)), k = s(vec2(1, 1)), l = s(vec2(-1, -1)), m = s(vec2(1, -1));
  vec3 col;
  if (uKaris > 0.5) {
    vec3 g0 = (a + b + d + e) * 0.25, g1 = (b + c + e + f) * 0.25, g2 = (d + e + g + h) * 0.25, g3 = (e + f + h + i) * 0.25, g4 = (j + k + l + m) * 0.25;
    float w0 = kw(g0), w1 = kw(g1), w2 = kw(g2), w3 = kw(g3), w4 = kw(g4);
    col = (g0 * w0 * 0.125 + g1 * w1 * 0.125 + g2 * w2 * 0.125 + g3 * w3 * 0.125 + g4 * w4 * 0.5) /
          (w0 * 0.125 + w1 * 0.125 + w2 * 0.125 + w3 * 0.125 + w4 * 0.5);
  } else {
    col = e * 0.125 + (a + c + g + i) * 0.03125 + (b + d + f + h) * 0.0625 + (j + k + l + m) * 0.125;
  }
  fragColor = vec4(col, 1.0);
}
`;

// 3×3 tent upsample, added onto the next finer level (additive blending on the target).
export const UP_FRAG = /* glsl */ `
precision highp float;
uniform sampler2D tSrc;
uniform vec2 uPx;      // 1 / source size
uniform float uRadius;
uniform float uWeight;
in vec2 vUv;
out vec4 fragColor;
void main() {
  vec2 d = uPx * uRadius;
  vec3 c = texture(tSrc, vUv).rgb * 4.0;
  c += (texture(tSrc, vUv + vec2(-d.x, 0)).rgb + texture(tSrc, vUv + vec2(d.x, 0)).rgb + texture(tSrc, vUv + vec2(0, -d.y)).rgb + texture(tSrc, vUv + vec2(0, d.y)).rgb) * 2.0;
  c += texture(tSrc, vUv + vec2(-d.x, -d.y)).rgb + texture(tSrc, vUv + vec2(d.x, -d.y)).rgb + texture(tSrc, vUv + vec2(-d.x, d.y)).rgb + texture(tSrc, vUv + vec2(d.x, d.y)).rgb;
  fragColor = vec4(c / 16.0 * uWeight, 1.0);
}
`;

// Glints: keep only what is far over white (a diamond's fire, a gold edge in the sun), then streak it.
export const BRIGHT_FRAG = /* glsl */ `
precision highp float;
uniform sampler2D tSrc;
uniform vec2 uPx;
uniform float uThreshold, uKnee;
in vec2 vUv;
out vec4 fragColor;
void main() {
  vec3 c = (texture(tSrc, vUv + uPx * vec2(-0.5, -0.5)).rgb + texture(tSrc, vUv + uPx * vec2(0.5, -0.5)).rgb +
            texture(tSrc, vUv + uPx * vec2(-0.5, 0.5)).rgb + texture(tSrc, vUv + uPx * vec2(0.5, 0.5)).rgb) * 0.25;
  float l = max(c.r, max(c.g, c.b));
  float w = smoothstep(uThreshold, uThreshold + uKnee, l);
  fragColor = vec4(min(c * w, vec3(64.0)), 1.0);
}
`;

// Kawase streak: pass n samples 4 taps spaced 4^n texels along the direction, weighted a^(b·s).
export const STREAK_FRAG = /* glsl */ `
precision highp float;
uniform sampler2D tSrc;
uniform vec2 uDir;      // texel step (direction × 1/size)
uniform float uPass;    // 0, 1, 2
uniform float uAtten;
in vec2 vUv;
out vec4 fragColor;
void main() {
  float b = pow(4.0, uPass);
  vec3 c = vec3(0.0);
  for (int s = 0; s < 4; s++) {
    float fs = float(s);
    float w = pow(uAtten, b * fs);
    c += w * texture(tSrc, vUv + uDir * b * fs).rgb;
  }
  fragColor = vec4(c * 0.5, 1.0);
}
`;

// God rays (GPU Gems 3, ch. 13): march from each pixel toward the light's screen position, summing what is brighter
// than a threshold with an exponential decay — light shafts through cloud and past the gold.
export const RAYS_FRAG = /* glsl */ `
precision highp float;
uniform sampler2D tSrc;
uniform vec2 uCentre;      // the light, in uv
uniform float uThreshold, uDensity, uDecay, uWeight;
uniform float uAspect;
in vec2 vUv;
out vec4 fragColor;
float hash(vec2 p) { return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }
void main() {
  vec2 d = (uCentre - vUv) * uDensity / 64.0;
  vec2 uv = vUv + d * hash(gl_FragCoord.xy);
  float w = 1.0;
  vec3 c = vec3(0.0);
  for (int i = 0; i < 64; i++) {
    vec3 s = texture(tSrc, uv).rgb;
    c += max(s - uThreshold, 0.0) * w;
    w *= uDecay;
    uv += d;
  }
  fragColor = vec4(c * uWeight / 64.0, 1.0);
}
`;

export const ADD_FRAG = /* glsl */ `
precision highp float;
uniform sampler2D tA;
uniform sampler2D tB;
uniform float uWa, uWb;
uniform vec3 uTintB;
in vec2 vUv;
out vec4 fragColor;
void main() { fragColor = vec4(texture(tA, vUv).rgb * uWa + texture(tB, vUv).rgb * uWb * uTintB, 1.0); }
`;

export const FINAL_FRAG = /* glsl */ `
precision highp float;
uniform sampler2D tHdr;
uniform sampler2D tBloom;
uniform sampler2D tGlint;
uniform sampler2D tRays;
uniform float uBloom, uGlint, uExposure, uRays;
uniform float uCA, uVignette, uGrain, uFrame;
uniform vec3 uWB;              // white balance multipliers (linear)
uniform float uSat, uContrast;
uniform vec3 uLift, uGain;     // display-space lift / gain
uniform vec3 uShadowTint, uHighTint;
uniform float uFade;           // to uFadeColor
uniform vec3 uFadeColor;
uniform vec2 uRes;
in vec2 vUv;
out vec4 fragColor;

vec3 neutral(vec3 color) {   // Khronos PBR Neutral (three.js NeutralToneMapping)
  const float StartCompression = 0.8 - 0.04;
  const float Desaturation = 0.15;
  float x = min(color.r, min(color.g, color.b));
  float offset = x < 0.08 ? x - 6.25 * x * x : 0.04;
  color -= offset;
  float peak = max(color.r, max(color.g, color.b));
  if (peak < StartCompression) return color;
  float d = 1. - StartCompression;
  float newPeak = 1. - d * d / (peak + d - StartCompression);
  color *= newPeak / peak;
  float g = 1. - 1. / (Desaturation * (peak - newPeak) + 1.);
  return mix(color, vec3(newPeak), g);
}
vec3 toSRGB(vec3 c) { return mix(c * 12.92, 1.055 * pow(max(c, 0.0), vec3(1.0 / 2.4)) - 0.055, step(0.0031308, c)); }
float hash(vec3 p) { p = fract(p * 0.1031); p += dot(p, p.zyx + 31.32); return fract((p.x + p.y) * p.z); }

vec3 hdr(vec2 uv) {
  return mix(texture(tHdr, uv).rgb, texture(tBloom, uv).rgb, uBloom) + texture(tGlint, uv).rgb * uGlint + texture(tRays, uv).rgb * uRays;
}

void main() {
  vec2 d = vUv - 0.5;
  vec3 c;
  if (uCA > 0.0) {
    vec2 o = d * dot(d, d) * uCA * 0.02;
    c = vec3(hdr(vUv - o).r, hdr(vUv).g, hdr(vUv + o).b);
  } else c = hdr(vUv);
  c *= uExposure * uWB;
  float l = dot(c, vec3(0.2126, 0.7152, 0.0722));
  c = max(mix(vec3(l), c, uSat), 0.0);
  c = neutral(c);
  c = clamp(c, 0.0, 1.0);
  // contrast about mid-grey in display-ish space, then split tone and lift/gain
  vec3 v = pow(c, vec3(1.0 / 2.2));
  v = clamp((v - 0.5) * uContrast + 0.5, 0.0, 1.0);
  float lv = dot(v, vec3(0.2126, 0.7152, 0.0722));
  v += uShadowTint * (1.0 - smoothstep(0.0, 0.5, lv)) + uHighTint * smoothstep(0.5, 1.0, lv);
  v = uLift + v * (uGain - uLift);
  c = pow(clamp(v, 0.0, 1.0), vec3(2.2));
  float vig = 1.0 - uVignette * smoothstep(0.35, 1.05, length(d * vec2(1.0, 0.75)) * 1.25);
  c *= vig;
  c = mix(c, uFadeColor, uFade);
  vec3 o = toSRGB(c);
  float lo = dot(o, vec3(0.2126, 0.7152, 0.0722));
  float g = hash(vec3(gl_FragCoord.xy, mod(uFrame, 997.0) * 1.37)) - 0.5;
  o += g * uGrain * (0.35 + 1.4 * lo * (1.0 - lo));
  o += (hash(vec3(gl_FragCoord.xy * 1.7, uFrame + 3.1)) - hash(vec3(gl_FragCoord.yx * 0.9, uFrame + 7.7))) / 255.0;
  fragColor = vec4(clamp(o, 0.0, 1.0), 1.0);
}
`;
