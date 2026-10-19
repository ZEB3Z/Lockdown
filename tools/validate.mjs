// npm run validate  -> exhaustively checks EVERY possible case code (3,888).
// Exit code 1 on any failure, so it can gate the Vercel build.
import { allCodes, CODE_COUNT } from '../src/core/code.js';
import { buildPlan } from '../src/core/plan.js';
import { MODULES } from '../src/modules/index.js';
import { COLUMNS, GLYPHS } from '../src/modules/glyphs/columns.js';
import { CONFIG } from '../src/config.js';
import { REF } from './reference.mjs';
import { buildManual } from '../src/manual/build.js';
import { GLYPH_ART } from '../src/ui/glyphs.js';
import { SYMBOLS } from '../src/modules/tumbler/logic.js';

const errors = [];
const fail = (m) => { if (errors.length < 25) errors.push(m); errors.push(null); };
const EXPECT_LEN = { tumbler: 5, glyphs: 4, fuse: 1 };

// ---- static data checks
if (COLUMNS.length !== 6) fail('need 6 glyph columns');
COLUMNS.forEach((c, i) => {
  if (new Set(c).size !== c.length) fail(`column ${i} has duplicate glyphs`);
  c.forEach((g) => { if (!GLYPHS.includes(g)) fail(`column ${i}: unknown glyph ${g}`); });
});
for (let a = 0; a < COLUMNS.length; a++) for (let b = a + 1; b < COLUMNS.length; b++) {
  const o = COLUMNS[a].filter((g) => COLUMNS[b].includes(g)).length;
  if (o > 3) fail(`columns ${a} and ${b} share ${o} glyphs (max 3)`);
}

for (const g of [...GLYPHS, ...SYMBOLS, 'skull']) if (!GLYPH_ART[g]) fail(`missing glyph art: ${g}`);

// ---- exhaustive run over every code
const tally = {}; const distinct = {};
let n = 0;
for (const code of allCodes()) {
  n++;
  const plan = buildPlan(code);
  if (JSON.stringify(plan) !== JSON.stringify(buildPlan(code))) fail(`${code}: not deterministic`);
  const ids = plan.doors.map((d) => d.id).sort().join();
  if (ids !== [...CONFIG.doors].sort().join()) fail(`${code}: doors ${ids}`);

  for (const { id, state } of plan.doors) {
    const mod = MODULES[id];
    let t;
    try { t = mod.trace(state, plan.ctx); } catch (e) { fail(`${code}/${id}: ${e.message}`); continue; }
    const steps = t.steps;
    if (steps.length !== EXPECT_LEN[id]) fail(`${code}/${id}: ${steps.length} steps`);
    if (new Set(steps).size !== steps.length) fail(`${code}/${id}: repeated step`);
    const max = id === 'tumbler' ? 5 : id === 'glyphs' ? 4 : state.wires.length;
    if (!steps.every((s) => Number.isInteger(s) && s >= 0 && s < max)) fail(`${code}/${id}: step out of range`);
    if (JSON.stringify(steps) !== JSON.stringify(REF[id](state, code)))
      fail(`${code}/${id}: logic ${JSON.stringify(steps)} != reference ${JSON.stringify(REF[id](state, code))}`);
    if (id === 'tumbler' && state.pins.filter((p) => p.symbol === 'skull').length > 1) fail(`${code}: >1 skull`);
    for (const b of t.branches) {
      if (!mod.BRANCHES.includes(b)) fail(`${code}/${id}: unknown branch ${b}`);
      (tally[id] ??= {})[b] = (tally[id][b] ?? 0) + 1;
    }
    (distinct[id] ??= new Set()).add(JSON.stringify(state));
  }
}
if (n !== CODE_COUNT) fail(`checked ${n} codes, expected ${CODE_COUNT}`);

// ---- dead-rule check
for (const [id, mod] of Object.entries(MODULES))
  for (const b of mod.BRANCHES) if (!tally[id]?.[b]) fail(`${id}: branch "${b}" never fires (dead rule)`);

// ---- manual must contain every rule line verbatim, every plate, every glyph column, 9 pages
for (const color of [false, true]) {
  const html = buildManual({ color });
  const text = html.replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>');
  if ((html.match(/<section class="page/g) || []).length !== 9) fail('manual: expected 9 pages');
  for (const [id, mod] of Object.entries(MODULES)) {
    if (!text.includes(mod.plate)) fail(`manual: missing plate ${mod.plate}`);
    for (const l of mod.RULES) if (!text.includes(l.trim())) fail(`manual: ${id} rule line missing: ${l}`);
  }
  for (const [i, col] of COLUMNS.entries()) for (const g of col) if (!html.includes(`aria-label="${g}"`)) fail(`manual: glyph ${g} (col ${i}) not drawn`);
}

// ---- report
console.log(`codes checked: ${n}/${CODE_COUNT}`);
for (const [id, mod] of Object.entries(MODULES)) {
  console.log(`\n${mod.plate} (${id}): ${distinct[id].size} distinct layouts`);
  console.log('  ' + mod.BRANCHES.map((b) => `${b}=${tally[id]?.[b] ?? 0}`).join('  '));
}
const real = errors.filter(Boolean);
if (real.length) {
  console.error(`\nFAILED (${errors.filter((e) => e === null).length} problems):`);
  real.forEach((e) => console.error('  - ' + e));
  process.exit(1);
}
console.log('\nPASS: every code yields exactly one solution; logic == reference; no dead rules; manual renders every rule.');
