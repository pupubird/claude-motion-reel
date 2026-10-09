// The liquid layer's colours must be the brand's: a hex decoded to linear light exactly once. (three's Color already
// decodes a hex into the linear working space; a second convertSRGBToLinear() rendered gold #FFB224 as salmon.)
//   node projects/almostfriends-special/tools/check_liquid.mjs
import { linHex } from '../src/gl/liquid.js';
import { C, P } from '../src/brand.js';

const dec = (c) => { c /= 255; return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; };
const want = (hex) => [1, 3, 5].map((i) => dec(parseInt(hex.slice(i, i + 2), 16)));
let bad = 0;
for (const hex of [C.blue, C.gold, C.ink, ...Object.values(P).map((p) => p.color)]) {
  const got = linHex(hex), exp = want(hex);
  const err = Math.max(...got.map((v, i) => Math.abs(v - exp[i])));
  if (err > 1e-3) { bad++; console.log(`FAIL ${hex}: linear ${got.map((v) => v.toFixed(4))} ≠ ${exp.map((v) => v.toFixed(4))}`); }
}
console.log(bad ? `${bad} colours decoded wrong` : 'PASS: every brand colour reaches the liquid layer in linear light, decoded once');
process.exit(bad ? 1 : 0);
