// A light cookie: leaves outside the window. The mask (black = leaf) is projected along the sun's direction onto every
// receiver and attenuates the DIRECT light only (the room's ambient stays), so the shade is soft and warm, like real
// dappled light. Chained onBeforeCompile; uniforms are shared, so one breeze moves every receiver's dapple together.
import * as THREE from 'three';

export function createCookie(tex, { dir, scale = 0.6, strength = 0.65, blur = 2.5 } = {}) {
  const d = dir.clone().normalize();
  // a basis on the plane perpendicular to the sun: (u, v) = where a point's sun ray crosses it
  const u = new THREE.Vector3().crossVectors(d, new THREE.Vector3(0, 0, 1)).normalize();
  const v = new THREE.Vector3().crossVectors(u, d).normalize();
  const U = {
    uCookie: { value: tex }, uCookieU: { value: u }, uCookieV: { value: v }, uCookieScale: { value: scale },
    uCookieOffset: { value: new THREE.Vector2() }, uCookieStrength: { value: strength }, uCookieBlur: { value: blur },
  };
  const PARS = `uniform sampler2D uCookie;\nuniform vec3 uCookieU, uCookieV;\nuniform float uCookieScale, uCookieStrength, uCookieBlur;\nuniform vec2 uCookieOffset;\n`;
  const TERM = /* glsl */ `
  {
    vec2 cuv = vec2(dot(vCookieWorld, uCookieU), dot(vCookieWorld, uCookieV)) / uCookieScale + 0.5 + uCookieOffset;
    float m = textureLod(uCookie, cuv, uCookieBlur).r;
    reflectedLight.directDiffuse *= mix(1.0, m, uCookieStrength);
    reflectedLight.directSpecular *= mix(1.0, m, uCookieStrength);
  }
  `;
  return {
    uniforms: U,
    apply(material) {
      const prev = material.onBeforeCompile, prevKey = material.customProgramCacheKey?.bind(material);
      material.onBeforeCompile = function (shader, r) {
        prev?.call(this, shader, r);
        Object.assign(shader.uniforms, U);
        shader.vertexShader = shader.vertexShader.replace('#include <common>', '#include <common>\nvarying vec3 vCookieWorld;')
          .replace('#include <worldpos_vertex>', '#include <worldpos_vertex>\nvCookieWorld = (modelMatrix * vec4(transformed, 1.0)).xyz;');
        shader.fragmentShader = shader.fragmentShader.replace('#include <common>', `#include <common>\nvarying vec3 vCookieWorld;\n${PARS}`)
          .replace('#include <lights_fragment_end>', `#include <lights_fragment_end>\n${TERM}`);
      };
      material.customProgramCacheKey = () => `${prevKey ? prevKey() : ''}:cookie`;
      material.needsUpdate = true;
    },
  };
}
