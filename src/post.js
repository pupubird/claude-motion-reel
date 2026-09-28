// GLSL for the two full-screen passes.
// COMPOSITE runs once per motion-blur sub-frame and accumulates into a float target.
// FINAL runs once per frame: HUD overlay, film grain, dither.
export const QUAD_VERT = /* glsl */ `
varying vec2 vUv;
void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }
`;

export const COMPOSITE_FRAG = /* glsl */ `
precision highp float;
uniform sampler2D tBase;
uniform sampler2D tOver;
uniform float uBaseOn, uExposure, uWeight, uTime;
uniform float uCA, uGlitch, uFlash, uInvert, uZoom, uLetterbox, uVignette, uFade;
uniform vec2 uShake;
varying vec2 vUv;

vec3 aces(vec3 x) { return clamp((x * (2.51 * x + 0.03)) / (x * (2.43 * x + 0.59) + 0.14), 0.0, 1.0); }
vec3 toSRGB(vec3 c) { return mix(c * 12.92, 1.055 * pow(c, vec3(1.0 / 2.4)) - 0.055, step(0.0031308, c)); }
float hash(vec2 p) { return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }

vec3 comp(vec2 uv) {
  vec3 base = vec3(0.0);
  if (uBaseOn > 0.5) base = toSRGB(aces(max(texture2D(tBase, uv).rgb, 0.0) * uExposure));
  vec4 o = texture2D(tOver, uv);              // premultiplied
  return o.rgb + base * (1.0 - o.a);
}

void main() {
  vec2 uv = (vUv - 0.5) / uZoom + 0.5 + uShake;
  if (uGlitch > 0.0) {
    float tt = floor(uTime * 30.0);
    float row = floor(uv.y * 22.0 + hash(vec2(tt, 3.0)) * 4.0);
    float on = step(1.0 - 0.5 * uGlitch, hash(vec2(row, tt)));
    uv.x += on * (hash(vec2(row + 5.3, tt + 1.9)) - 0.5) * 0.16 * uGlitch;
  }
  vec2 d = uv - 0.5;
  vec2 off = d * (0.0022 + dot(d, d) * 0.014) * uCA;
  vec3 col = vec3(comp(uv - off).r, comp(uv).g, comp(uv + off).b);
  col = mix(col, 1.0 - col, uInvert);
  col = mix(col, vec3(1.0), clamp(uFlash, 0.0, 1.0));
  float vig = smoothstep(0.95, 0.25, length(d * vec2(1.0, 0.85)));
  col *= mix(1.0, vig, uVignette);
  float px = 1.0 / 1080.0;
  float lb = smoothstep(uLetterbox - px, uLetterbox, vUv.y) * smoothstep(uLetterbox - px, uLetterbox, 1.0 - vUv.y);
  col *= lb * (1.0 - uFade);
  gl_FragColor = vec4(col * uWeight, 1.0);
}
`;

export const FINAL_FRAG = /* glsl */ `
precision highp float;
uniform sampler2D tAccum;
uniform sampler2D tHud;
uniform float uFrame, uGrain, uHudAlpha;
varying vec2 vUv;

float hash(vec3 p) { p = fract(p * 0.1031); p += dot(p, p.zyx + 31.32); return fract((p.x + p.y) * p.z); }

void main() {
  vec3 col = texture2D(tAccum, vUv).rgb;
  float l = dot(col, vec3(0.2126, 0.7152, 0.0722));
  vec4 h = texture2D(tHud, vUv);
  if (h.a > 0.001) {
    // HUD auto-contrasts against whatever is underneath it.
    vec3 hc = mix(vec3(0.937, 0.918, 0.878), vec3(0.043, 0.043, 0.055), step(0.52, l));
    col = mix(col, hc, h.a * uHudAlpha);
  }
  float g = hash(vec3(gl_FragCoord.xy, mod(uFrame, 997.0) * 1.37)) - 0.5;
  col += g * uGrain * (0.55 + 1.6 * l * (1.0 - l));
  gl_FragColor = vec4(clamp(col, 0.0, 1.0), 1.0);
}
`;
