// GLSL for the two full-screen passes.
// COMPOSITE runs once per motion-blur sub-frame and accumulates into a float target:
//   3D (linear HDR) → tone curve → sRGB, the 2D layer on top, then lens FX (CA, zoom, flash, fade).
// FINAL runs once per frame: film grain and a triangular dither (no HUD on this film).
export const QUAD_VERT = /* glsl */ `
varying vec2 vUv;
void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }
`;

export const COMPOSITE_FRAG = /* glsl */ `
precision highp float;
uniform sampler2D tBase;
uniform sampler2D tOver;
uniform float uBaseOn, uExposure, uWeight, uTime, uTonemap, uPx;
uniform float uCA, uFlash, uZoom, uVignette, uFade;
uniform vec2 uShake;
uniform vec3 uFlashColor;
varying vec2 vUv;

vec3 aces(vec3 x) { return clamp((x * (2.51 * x + 0.03)) / (x * (2.43 * x + 0.59) + 0.14), 0.0, 1.0); }
// Identity below the knee, smooth shoulder above: brand colours stay exact, highlights roll off.
vec3 knee(vec3 x) { vec3 k = vec3(0.8); vec3 o = max(x - k, 0.0); return mix(x, k + o / (1.0 + o / 0.25), step(k, x)); }
vec3 toSRGB(vec3 c) { return mix(c * 12.92, 1.055 * pow(c, vec3(1.0 / 2.4)) - 0.055, step(0.0031308, c)); }

vec3 base(vec2 uv) {
  if (uBaseOn < 0.5) return vec3(0.0);
  vec3 c = max(texture2D(tBase, uv).rgb, 0.0) * uExposure;
  c = uTonemap > 1.5 ? knee(c) : uTonemap > 0.5 ? aces(c) : clamp(c, 0.0, 1.0);
  return toSRGB(clamp(c, 0.0, 1.0));
}

vec3 comp(vec2 uv) {
  vec4 o = texture2D(tOver, uv);              // premultiplied sRGB
  return o.rgb + base(uv) * (1.0 - o.a);
}

void main() {
  vec2 uv = (vUv - 0.5) / uZoom + 0.5 + uShake;
  vec2 d = uv - 0.5;
  vec3 col;
  if (uCA > 0.001) {
    vec2 off = d * (0.0022 + dot(d, d) * 0.014) * uCA;
    col = vec3(comp(uv - off).r, comp(uv).g, comp(uv + off).b);
  } else {
    col = comp(uv);
  }
  col = mix(col, uFlashColor, clamp(uFlash, 0.0, 1.0));
  float vig = smoothstep(0.95, 0.25, length(d * vec2(1.0, 0.85)));
  col *= mix(1.0, vig, uVignette);
  col *= 1.0 - uFade;
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
  col += g * uGrain * (0.5 + 1.6 * l * (1.0 - l)) * smoothstep(0.0, 0.04, l);
  // triangular dither: the navy gradients must not band after 8-bit quantisation
  col += (hash(vec3(gl_FragCoord.xy * 1.7, uFrame + 3.1)) - hash(vec3(gl_FragCoord.yx * 0.9, uFrame + 7.7))) / 255.0;
  gl_FragColor = vec4(clamp(col, 0.0, 1.0), 1.0);
}
`;
