// Shared GLSL: simplex noise + fbm, OKLab mixing, the CIE 1931 observer and Airy thin-film reflectance.
// Used by the bubble (gl/bubble.js), the macro film (gl/film.js) and anything else made of soap film.
export const FILM_GLSL = /* glsl */ `
vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 permute(vec4 x) { return mod289(((x * 34.0) + 10.0) * x); }
vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
float snoise(vec3 v) {
  const vec2 C = vec2(1.0 / 6.0, 1.0 / 3.0);
  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
  vec3 i = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);
  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);
  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy;
  vec3 x3 = x0 - D.yyy;
  i = mod289(i);
  vec4 p = permute(permute(permute(i.z + vec4(0.0, i1.z, i2.z, 1.0)) + i.y + vec4(0.0, i1.y, i2.y, 1.0)) + i.x + vec4(0.0, i1.x, i2.x, 1.0));
  float n_ = 0.142857142857;
  vec3 ns = n_ * D.wyz - D.xzx;
  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_);
  vec4 x = x_ * ns.x + ns.yyyy;
  vec4 y = y_ * ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);
  vec4 b0 = vec4(x.xy, y.xy);
  vec4 b1 = vec4(x.zw, y.zw);
  vec4 s0 = floor(b0) * 2.0 + 1.0;
  vec4 s1 = floor(b1) * 2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));
  vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;
  vec3 p0 = vec3(a0.xy, h.x);
  vec3 p1 = vec3(a0.zw, h.y);
  vec3 p2 = vec3(a1.xy, h.z);
  vec3 p3 = vec3(a1.zw, h.w);
  vec4 norm = taylorInvSqrt(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));
  p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
  vec4 m = max(0.5 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0);
  m = m * m;
  return 105.0 * dot(m * m, vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)));
}
float fbm(vec3 p) { return 0.55 * snoise(p) + 0.28 * snoise(p * 2.03 + 7.1) + 0.14 * snoise(p * 4.1 - 3.3); }

// OKLab (Björn Ottosson 2020): mixing inks here keeps coral + green from passing through mud
vec3 toOk(vec3 c) {
  float l = 0.4122214708 * c.r + 0.5363325363 * c.g + 0.0514459929 * c.b;
  float m = 0.2119034982 * c.r + 0.6806995451 * c.g + 0.1073969566 * c.b;
  float s = 0.0883024619 * c.r + 0.2817188376 * c.g + 0.6299787005 * c.b;
  l = pow(max(l, 0.0), 1.0 / 3.0); m = pow(max(m, 0.0), 1.0 / 3.0); s = pow(max(s, 0.0), 1.0 / 3.0);
  return vec3(0.2104542553 * l + 0.7936177850 * m - 0.0040720468 * s,
              1.9779984951 * l - 2.4285922050 * m + 0.4505937099 * s,
              0.0259040371 * l + 0.7827717662 * m - 0.8086757660 * s);
}
vec3 fromOk(vec3 c) {
  float l = c.x + 0.3963377774 * c.y + 0.2158037573 * c.z;
  float m = c.x - 0.1055613458 * c.y - 0.0638541728 * c.z;
  float s = c.x - 0.0894841775 * c.y - 1.2914855480 * c.z;
  l = l * l * l; m = m * m * m; s = s * s * s;
  return vec3(4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
             -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
             -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s);
}
vec3 okMix(vec3 a, vec3 b, float t) { return max(fromOk(mix(toOk(a), toOk(b), t)), 0.0); }

// CIE 1931 2° observer, analytic multi-lobe fits (Wyman, Sloan & Shirley 2013)
float g(float x, float mu, float s1, float s2) { float t = (x - mu) / (x < mu ? s1 : s2); return exp(-0.5 * t * t); }
vec3 cie(float l) {
  return vec3(
    1.056 * g(l, 599.8, 37.9, 31.0) + 0.362 * g(l, 442.0, 16.0, 26.7) - 0.065 * g(l, 501.1, 20.4, 26.2),
    0.821 * g(l, 568.8, 46.9, 40.5) + 0.286 * g(l, 530.9, 16.3, 31.1),
    1.217 * g(l, 437.0, 11.8, 36.0) + 0.681 * g(l, 459.0, 26.0, 13.8));
}
const mat3 XYZ2RGB = mat3(3.2406, -0.9689, 0.0557, -1.5372, 1.8758, -0.2040, -0.4986, 0.0415, 1.0570);

// Airy reflectance of a film of thickness d (nm), index n, in air, at incidence cosine ci, wavelength l (nm)
float airy(float d, float ci, float l) {
  const float n = 1.33;
  float si2 = 1.0 - ci * ci;
  float ct = sqrt(max(0.0, 1.0 - si2 / (n * n)));
  float R0 = 0.02;
  float r2 = R0 + (1.0 - R0) * pow(1.0 - ci, 5.0);            // Schlick estimate of |r|² at this angle
  float delta = 12.566370614 * n * d * ct / l;               // 4π n d cosθt / λ
  float s = sin(0.5 * delta);
  float F = 4.0 * r2 * s * s;
  return F / ((1.0 - r2) * (1.0 - r2) + F);
}
vec3 filmRGB(float d, float ci) {
  vec3 xyz = vec3(0.0), wsum = vec3(0.0);
  for (int i = 0; i < 16; i++) {
    float l = 400.0 + 300.0 * (float(i) + 0.5) / 16.0;
    vec3 c = cie(l);
    xyz += c * airy(d, ci, l);
    wsum += c;
  }
  vec3 rgb = XYZ2RGB * (xyz / wsum.y);
  vec3 white = XYZ2RGB * (wsum / wsum.y);
  return max(rgb / white, 0.0);
}

`;
