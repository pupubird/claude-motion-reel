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
varying vec2 vUv;

vec3 toSRGB(vec3 c) { return mix(c * 12.92, 1.055 * pow(c, vec3(1.0 / 2.4)) - 0.055, step(0.0031308, c)); }

vec3 under(vec2 uv) {
  vec4 u = texture2D(tUnder, uv);            // premultiplied sRGB
  return u.rgb + uBg * (1.0 - u.a);
}
vec3 base(vec2 uv) {
  if (uBaseOn < 0.5) return under(uv);
  vec3 c = max(texture2D(tBase, uv).rgb, 0.0) * uExposure;
  // no tone curve: a light-theme frame lives near white, and any knee would grey the paper; specular clips to white
  return toSRGB(clamp(c, 0.0, 1.0));
}

void main() {
  vec2 uv = (vUv - uZoomAt) / uZoom + uZoomAt + uShake;
  vec4 o = texture2D(tOver, uv);              // premultiplied sRGB
  vec3 col = o.rgb + base(uv) * (1.0 - o.a);
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
