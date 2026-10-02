// Fill control: the environment map lights a surface twice — a diffuse fill (irradiance) and its reflections (radiance).
// A photographer flags the fill down to get shape and shadow and still gives the metal something bright to mirror.
// This scales only the indirect DIFFUSE light (environment irradiance + hemisphere/ambient) by a shared uniform, on
// every material under a root. Reflections are untouched.
export function createFill(value = 1) {
  const U = { uFill: { value } };
  const patched = new WeakSet();
  function patch(material) {
    if (!material || patched.has(material) || !material.isMeshStandardMaterial) return;
    patched.add(material);
    const prev = material.onBeforeCompile, prevKey = material.customProgramCacheKey?.bind(material);
    material.onBeforeCompile = function (shader, r) {
      prev?.call(this, shader, r);
      Object.assign(shader.uniforms, U);
      shader.fragmentShader = shader.fragmentShader.replace('#include <common>', '#include <common>\nuniform float uFill;')
        .replace('#include <lights_fragment_maps>', '#include <lights_fragment_maps>\niblIrradiance *= uFill;\nirradiance *= uFill;');
    };
    material.customProgramCacheKey = () => `${prevKey ? prevKey() : ''}:fill`;
    material.needsUpdate = true;
  }
  return {
    uniforms: U,
    set value(v) { U.uFill.value = v; },
    get value() { return U.uFill.value; },
    apply(root) { root.traverse((o) => { if (o.isMesh) for (const m of [].concat(o.material)) patch(m); }); },
  };
}
