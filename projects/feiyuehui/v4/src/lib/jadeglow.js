// 起光 — the light imperial jade gives off. The package's jade is screen-space transmission + a wrap term; under a
// key light a real cabochon also glows from inside: light enters on the lit side, scatters, and comes out on the far
// side and through the body (the client's own photographs read lit from within). This adds that as a radiance term
// after transmission, without touching the shared package: a chained onBeforeCompile on top of the film's own.
import * as THREE from 'three';

const PARS = /* glsl */ `
uniform vec3 uJadeGlowColor;
uniform float uJadeGlowBase, uJadeGlowBack, uJadeGlowRim;
`;
// JADE_GLOW_MASK: a shot may #define it (in main, before this term) to mask the glow where the stone is covered —
// e.g. gold leaf laid into the carving is opaque and gives off no jade light
const TERM = /* glsl */ `
#ifndef JADE_GLOW_MASK
#define JADE_GLOW_MASK 0.0
#endif
{
	vec3 jt = jade.col / max( max( jade.col.r, max( jade.col.g, jade.col.b ) ), 1e-4 );
	float ndv = saturate( dot( normal, geometryViewDir ) );
	float front = 0.0, back = 0.0;
	#if NUM_DIR_LIGHTS > 0
		for ( int i = 0; i < NUM_DIR_LIGHTS; i ++ ) {
			float nl = dot( normal, directionalLights[ i ].direction );
			float L = dot( directionalLights[ i ].color, vec3( 0.2126, 0.7152, 0.0722 ) );
			front += L * saturate( nl );                              // light entering the face we see
			back += L * smoothstep( 0.15, -0.75, nl );                // light arriving from behind the stone
		}
	#endif
	#if NUM_SPOT_LIGHTS > 0
		for ( int i = 0; i < NUM_SPOT_LIGHTS; i ++ ) {               // a shaft of sun is a spot: same terms, inside its cone
			vec3 sl = normalize( spotLights[ i ].position - geometryPosition );
			float cone = smoothstep( spotLights[ i ].coneCos, spotLights[ i ].penumbraCos, dot( sl, spotLights[ i ].direction ) );
			float nl = dot( normal, sl );
			float L = dot( spotLights[ i ].color, vec3( 0.2126, 0.7152, 0.0722 ) ) * cone;
			front += L * saturate( nl );
			back += L * smoothstep( 0.15, -0.75, nl );
		}
	#endif
	// front light scatters and comes back out through the thick of the stone (centre-weighted); light from behind
	// only gets through where the stone is thin — its rims and edges (thick imperial jade stays deep in the middle)
	float glow = ( uJadeGlowBase + front * uJadeGlowBack * 0.35 ) * pow( ndv, 1.6 )
	           + back * uJadeGlowBack * ( 0.12 + 0.88 * pow( 1.0 - ndv, 1.5 ) )
	           + pow( 1.0 - ndv, 2.0 ) * uJadeGlowRim;
	// the glow's hue is its own (the photographed stones are a softer green than the field's pure primaries); the field
	// only modulates it a little, so veins and cotton still read
	outgoingLight += uJadeGlowColor * mix( vec3( 1.0 ), jt, 0.3 ) * glow * ( 1.0 - 0.6 * saturate( jade.cotton ) ) * ( 1.0 - JADE_GLOW_MASK );
}
`;

export function addJadeGlow(root, { color = '#3dff6a', base = 0.25, back = 0.6, rim = 0.15 } = {}) {
  const mats = new Set();
  root.traverse((o) => {
    if (!o.isMesh) return;
    for (const m of Array.isArray(o.material) ? o.material : [o.material]) if (m?.userData?.filmRecipe?.key === 'jade') mats.add(m);
  });
  for (const m of mats) {
    if (m.userData.glow) { Object.assign(m.userData.glow, glowUniforms(color, base, back, rim)); continue; }
    const U = glowUniforms(color, base, back, rim);
    m.userData.glow = U;
    const prev = m.onBeforeCompile, prevKey = m.customProgramCacheKey;
    m.onBeforeCompile = function (shader, renderer) {
      prev.call(this, shader, renderer);
      Object.assign(shader.uniforms, this.userData.glow);
      shader.fragmentShader = shader.fragmentShader
        .replace('#include <clipping_planes_pars_fragment>', `#include <clipping_planes_pars_fragment>\n${PARS}`)
        .replace('#include <opaque_fragment>', `${TERM}\n#include <opaque_fragment>`);
    };
    m.customProgramCacheKey = function () { return `${prevKey.call(this)}:glow`; };
    m.needsUpdate = true;
  }
  return [...mats];
}

function glowUniforms(color, base, back, rim) {
  return {
    uJadeGlowColor: { value: new THREE.Color(color) }, uJadeGlowBase: { value: base },
    uJadeGlowBack: { value: back }, uJadeGlowRim: { value: rim },
  };
}

// live control from a shot: setGlow(mats, { base, back, rim, color })
export function setGlow(mats, o) {
  for (const m of mats) {
    const U = m.userData.glow;
    if (o.base !== undefined) U.uJadeGlowBase.value = o.base;
    if (o.back !== undefined) U.uJadeGlowBack.value = o.back;
    if (o.rim !== undefined) U.uJadeGlowRim.value = o.rim;
    if (o.color !== undefined) U.uJadeGlowColor.value.set(o.color);
  }
}
