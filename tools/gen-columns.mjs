// One-off: search for 6 columns x 6 glyphs from the pool with pairwise overlap <= 3.
// Run: node tools/gen-columns.mjs  -> paste output into src/modules/glyphs/columns.js
import { makeRng } from '../src/core/rng.js';
import { GLYPHS } from '../src/modules/glyphs/columns.js';
for (let attempt = 0; attempt < 100000; attempt++) {
  const rng = makeRng('columns:' + attempt);
  const cols = Array.from({ length: 6 }, () => rng.shuffle(GLYPHS).slice(0, 6));
  let ok = true;
  for (let a = 0; a < 6 && ok; a++) for (let b = a + 1; b < 6 && ok; b++)
    if (cols[a].filter(g => cols[b].includes(g)).length > 3) ok = false;
  if (ok) { console.log('// attempt', attempt); console.log(JSON.stringify(cols)); process.exit(0); }
}
console.error('no solution'); process.exit(1);
