// GLSL for the two full-screen passes.
// COMPOSITE runs once per motion-blur sub-frame and accumulates into a float target:
//   3D (linear HDR) → tone curve → sRGB, a physical loupe that refracts the 3D layer,
//   the 2D layer on top, then lens FX (CA, zoom, flash, letterbox).
// FINAL runs once per frame: HUD overlay with auto-contrast, film grain, dither.
export const QUAD_VERT = /* glsl */ `
varying vec2 vUv;
void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }
`;

export const COMPOSITE_FRAG = /* glsl */ `
precision highp float;
uniform sampler2D tBase;
uniform sampler2D tOver;
uniform float uBaseOn, uExposure, uWeight, uTime, uTonemap;
uniform float uCA, uFlash, uZoom, uLetterbox, uVignette, uFade;
uniform vec2 uShake;
uniform vec4 uLoupe;      // center.xy (px, y down), radius (px), magnification
uniform float uLoupeOn;   // 0..1 presence (also scales the rim + shadow)
uniform vec3 uFlashColor;
varying vec2 vUv;

const vec2 RES = vec2(1920.0, 1080.0);

vec3 aces(vec3 x) { return clamp((x * (2.51 * x + 0.03)) / (x * (2.43 * x + 0.59) + 0.14), 0.0, 1.0); }
// Identity below the knee, smooth shoulder above: keeps ad creative and brand colours exact.
vec3 knee(vec3 x) { vec3 k = vec3(0.8); vec3 o = x - k; return mix(x, k + o / (1.0 + o / 0.2), step(k, x)); }
vec3 toSRGB(vec3 c) { return mix(c * 12.92, 1.055 * pow(c, vec3(1.0 / 2.4)) - 0.055, step(0.0031308, c)); }

vec3 base(vec2 uv) {
  vec3 c = max(texture2D(tBase, uv).rgb, 0.0) * uExposure;
  c = uTonemap > 1.5 ? knee(c) : uTonemap > 0.5 ? aces(c) : clamp(c, 0.0, 1.0);
  return toSRGB(c);
}

// The loupe: magnifies the 3D layer inside a circle, compresses toward the rim like real glass,
// splits colour at the edge, and casts a soft shadow onto the table outside it.
vec3 loupeBase(vec2 uv, out float rim, out float shade) {
  rim = 0.0; shade = 1.0;
  if (uLoupeOn <= 0.0 || uBaseOn < 0.5) return uBaseOn > 0.5 ? base(uv) : vec3(0.0);
  vec2 p = vec2(uv.x, 1.0 - uv.y) * RES;           // px, y down (matches canvas coords)
  vec2 d = p - uLoupe.xy;
  float R = uLoupe.z, r = length(d), k = r / R;
  // outside: soft drop shadow offset down-right
  vec2 ds = d - vec2(0.05, 0.11) * R;
  float sh = smoothstep(R * 1.25, R * 0.85, length(ds));
  if (r > R) { shade = 1.0 - 0.42 * sh * uLoupeOn; return base(uv); }
  float m = uLoupe.w;
  // effective magnification falls off toward the rim (barrel), continuous-ish at the edge
  float fall = 1.0 + (m - 1.0) * (1.0 - pow(k, 3.2) * 0.55);
  vec3 col;
  for (int i = 0; i < 3; i++) {
    float disp = (float(i) - 1.0) * 0.018 * pow(k, 4.0);
    vec2 sp = uLoupe.xy + d / (fall * (1.0 + disp));
    vec2 suv = vec2(sp.x / RES.x, 1.0 - sp.y / RES.y);
    col[i] = base(suv)[i];
  }
  // glass: faint inner vignette, cool tint, specular window reflection upper-left
  col *= 1.0 - 0.22 * pow(k, 6.0);
  vec2 sq = (d / R - vec2(-0.38, -0.42)) * vec2(1.0, 1.6);
  col += vec3(0.9, 0.95, 1.0) * 0.07 * smoothstep(0.34, 0.0, length(sq));
  rim = smoothstep(0.93, 0.985, k) * (1.0 - smoothstep(0.995, 1.0, k));
  return col;
}

vec3 comp(vec2 uv) {
  float rim, shade;
  vec3 b = loupeBase(uv, rim, shade);
  b *= shade;
  // bevelled rim: bright where it faces the upper-left light, darker on the far side
  if (rim > 0.0) {
    vec2 p = vec2(uv.x, 1.0 - uv.y) * RES;
    vec2 n = normalize(p - uLoupe.xy);
    float lit = 0.5 + 0.5 * dot(n, normalize(vec2(-0.6, -0.8)));
    b = mix(b, mix(vec3(0.05, 0.08, 0.09), vec3(0.92, 0.96, 0.95), lit), rim * uLoupeOn * 0.85);
  }
  vec4 o = texture2D(tOver, uv);              // premultiplied
  return o.rgb + b * (1.0 - o.a);
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
    // HUD auto-contrasts against whatever sits under it: ground on dark, ink on light.
    vec3 hc = mix(vec3(0.929, 0.941, 0.937), vec3(0.043, 0.086, 0.094), step(0.55, l));
    col = mix(col, hc, h.a * uHudAlpha);
  }
  float g = hash(vec3(gl_FragCoord.xy, mod(uFrame, 997.0) * 1.37)) - 0.5;
  col += g * uGrain * (0.5 + 1.6 * l * (1.0 - l));
  // triangular dither so dark gradients do not band after 8-bit quantisation
  col += (hash(vec3(gl_FragCoord.xy * 1.7, uFrame + 3.1)) - hash(vec3(gl_FragCoord.yx * 0.9, uFrame + 7.7))) / 255.0;
  gl_FragColor = vec4(clamp(col, 0.0, 1.0), 1.0);
}
`;
