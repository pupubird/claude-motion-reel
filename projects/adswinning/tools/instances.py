# Bricolage Grotesque width instances for canvas (fontStretch only accepts keywords).
# Pins wdth (and opsz=96) into six faces while keeping the wght axis variable.
#   python3 adswinning/tools/instances.py   (run from the repo root)
from fontTools.ttLib import TTFont
from fontTools.varLib import instancer
src = 'node_modules/@fontsource-variable/bricolage-grotesque/files/bricolage-grotesque-latin-standard-normal.woff2'
for w in (75, 80, 85, 90, 95, 100):
    inst = instancer.instantiateVariableFont(TTFont(src), {'wdth': w, 'opsz': 96})
    inst.flavor = 'woff2'
    inst.save(f'adswinning/assets/fonts/brico-w{w}.woff2')
    print('wdth', w)
