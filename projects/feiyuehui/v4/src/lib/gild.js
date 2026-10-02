// 描金 — gold laid into fresh carving, the way the Qing court's jade albums (玉册) were finished: once a stroke is cut,
// gold fills it. A chained onBeforeCompile on top of the film's carve-playback jade (FILM_CARVE): wherever the cut is
// (the carve texture's frost), above a moving front in world height, the surface turns to gold leaf — metallic,
// satin, opaque (no transmission, no jade glow) — and the front itself burns like molten metal as it runs down.
import * as THREE from 'three';

const PARS_V = /* glsl */ `
varying float vGildY;
`;
const PARS_F = /* glsl */ `
varying float vGildY;
uniform vec3 uGildColor;
uniform float uGildY, uGildSoft, uGildRough, uGildHot, uGildOn, uGildEnv, uStoneEnv, uGildMatte;
`;
// after the jade colour chunk's last line
const COLOR = /* glsl */ `
// the cut's frost runs well under 1 on a groove floor: threshold it, or the leaf comes out half jade (khaki)
float gildCut = smoothstep( 0.06, 0.26, carveFrost() );
float gildK = gildCut * smoothstep( uGildY - uGildSoft, uGildY + uGildSoft, vGildY ) * uGildOn;
diffuseColor.rgb = mix( diffuseColor.rgb, uGildColor, gildK );
#define JADE_GLOW_MASK gildK
`;

// env / stoneEnv: how much of the room's reflection the leaf and the stone take (a gilder lights the leaf to glow; the
// polished jade around it should only hold a sheen)
export function addCarveGild(materials, { color = '#d8b066', rough = 0.26, soft = 0.0025, env = 2.5, stoneEnv = 1 } = {}) {
  const U = {
    uGildColor: { value: new THREE.Color(color) }, uGildY: { value: 10 }, uGildSoft: { value: soft },
    uGildRough: { value: rough }, uGildHot: { value: 0 }, uGildOn: { value: 0 }, uGildEnv: { value: env }, uStoneEnv: { value: stoneEnv },
    uGildMatte: { value: 0 },   // 1 = draw the carving's coverage (white) for the engine's matte pass; 2 = only the gold laid so far
  };
  for (const m of materials) {
    const prev = m.onBeforeCompile, prevKey = m.customProgramCacheKey;
    m.onBeforeCompile = function (shader, renderer) {
      prev.call(this, shader, renderer);
      Object.assign(shader.uniforms, U);
      const need = (src, s) => { if (!src.includes(s)) throw new Error(`gild: no "${s}" in the jade shader`); return src; };
      shader.vertexShader = need(shader.vertexShader, '#include <project_vertex>')
        .replace('#include <clipping_planes_pars_vertex>', `#include <clipping_planes_pars_vertex>\n${PARS_V}`)
        .replace('#include <project_vertex>', '#include <project_vertex>\nvGildY = ( modelMatrix * vec4( transformed, 1.0 ) ).y;');
      let f = shader.fragmentShader;
      for (const s of ['diffuseColor.rgb = jade.col * uJadeAlbedoGain;', 'roughnessFactor = jade.rough;', '#include <metalnessmap_fragment>',
        'material.transmissionAlpha = 1.0;', '#include <emissivemap_fragment>', '#include <lights_fragment_maps>', '#include <dithering_fragment>']) need(f, s);
      f = f.replace('#include <clipping_planes_pars_fragment>', `#include <clipping_planes_pars_fragment>\n${PARS_F}`)
        .replace('diffuseColor.rgb = jade.col * uJadeAlbedoGain;', `diffuseColor.rgb = jade.col * uJadeAlbedoGain;\n${COLOR}`)
        .replace('roughnessFactor = jade.rough;', 'roughnessFactor = jade.rough;\nroughnessFactor = mix( roughnessFactor, uGildRough, gildK );')
        .replace('#include <metalnessmap_fragment>', '#include <metalnessmap_fragment>\nmetalnessFactor = mix( metalnessFactor, 1.0, gildK );')
        .replace('material.transmissionAlpha = 1.0;', 'material.transmissionAlpha = 1.0;\n\tmaterial.transmission *= 1.0 - gildK;')
        .replace('#include <lights_fragment_maps>', '#include <lights_fragment_maps>\nradiance *= mix( uStoneEnv, uGildEnv, gildK );')
        .replace('#include <dithering_fragment>', '#include <dithering_fragment>\nif ( uGildMatte > 0.5 ) gl_FragColor = vec4( vec3( uGildMatte > 1.5 ? gildK : gildCut ), 1.0 );')
        .replace('#include <emissivemap_fragment>', `#include <emissivemap_fragment>
{ float gd = ( vGildY - uGildY ) / ( uGildSoft * 2.5 );   // (not pow(): a negative base is NaN on Metal)
  totalEmissiveRadiance += uGildColor * uGildHot * gildCut * uGildOn * exp( - gd * gd ); }`);
      shader.fragmentShader = f;
    };
    m.customProgramCacheKey = function () { return `${prevKey.call(this)}:gild`; };
    m.needsUpdate = true;
  }
  return U;
}
