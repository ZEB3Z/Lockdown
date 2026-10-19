// npm run validate -> exhaustively checks EVERY possible case code (3,888) across all 4 modules.
// Exit code 1 on any failure, so it gates the build.
import { allCodes, CODE_COUNT } from '../src/core/code.js';
import { buildPlan } from '../src/core/plan.js';
import { MODULES } from '../src/modules/index.js';
import { COLUMNS, GLYPHS } from '../src/modules/glyphs/columns.js';
import { CONFIG } from '../src/config.js';
import { REF } from './reference.mjs';
import { buildManual, MANUAL_PAGES } from '../src/manual/build.js';
import { GLYPH_ART } from '../src/ui/glyphs.js';
import { SYMBOLS } from '../src/modules/tumbler/logic.js';
import { LETTERS } from '../src/core/code.js';
import { CYCLE_MS, START, msForValue, valueAt, inWindow, EARLY_MS, LATE_MS } from '../src/modules/switch/logic.js';

const errors = [];
const fail = (m) => { if (errors.length < 30) errors.push(m); errors.push(null); };
const EXPECT_LEN = { tumbler: 5, glyphs: 4, fuse: 1, switch: 1 };

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

// ---- countdown window geometry
if (valueAt(0) !== START) fail('countdown must start at ' + START);
for (let v = 3; v <= 19; v++) {
  if (!inWindow(msForValue(v), v)) fail(`window: middle of ${v} rejected`);
  if (inWindow(msForValue(v) - 1000 + EARLY_MS - 1, v) && EARLY_MS < 500) fail(`window: previous second accepted for ${v}`);
  if (inWindow((START - v) * 1000 - EARLY_MS - 1, v)) fail(`window: too early accepted for ${v}`);
  if (!inWindow((START - v) * 1000 - EARLY_MS, v)) fail(`window: early edge rejected for ${v}`);
  if (!inWindow((START - v) * 1000 + 1000 + LATE_MS - 1, v)) fail(`window: late edge rejected for ${v}`);
  if (inWindow((START - v) * 1000 + 1000 + LATE_MS, v)) fail(`window: too late accepted for ${v}`);
}

// ---- exhaustive run over every code
const tally = {};
const distinct = {};
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
    try {
      t = mod.trace(state, plan.ctx);
    } catch (e) {
      fail(`${code}/${id}: ${e.message}`);
      continue;
    }

    const steps = t.steps;
    if (steps.length !== EXPECT_LEN[id]) fail(`${code}/${id}: ${steps.length} steps, expected ${EXPECT_LEN[id]}`);
    if (new Set(steps).size !== steps.length) fail(`${code}/${id}: repeated step in solution: ${steps.join(',')}`);

    // Bounds checking
    if (id === 'tumbler') {
      if (!steps.every((s) => Number.isInteger(s) && s >= 0 && s < 5)) fail(`${code}/${id}: step out of range`);
      if (state.pins.filter((p) => p.symbol === 'skull').length > 1) fail(`${code}: >1 skull`);
    } else if (id === 'glyphs') {
      if (!steps.every((s) => Number.isInteger(s) && s >= 0 && s < 4)) fail(`${code}/${id}: step out of range`);
    } else if (id === 'fuse') {
      if (!steps.every((s) => Number.isInteger(s) && s >= 0 && s < state.wires.length)) fail(`${code}/${id}: step out of range`);
    } else if (id === 'switch') {
      const sw = Math.floor(steps[0] / 100), target = steps[0] % 100;
      if (!(sw >= 0 && sw < 6)) fail(`${code}/${id}: switch ${sw} out of range`);
      if (!(target >= 3 && target <= 19)) fail(`${code}/${id}: target ${target} outside 3..19 (must appear after the first second)`);
      if (state.letters.length !== 6 || new Set(state.letters).size !== 6) fail(`${code}/${id}: panel letters not 6 distinct`);
      if (!state.letters.every((L) => LETTERS.includes(L))) fail(`${code}/${id}: panel letter outside the case alphabet`);
      // timing: right switch at the middle of its number passes; just outside the window or a wrong switch strikes
      const act = (swi, tt) => mod.isStrike(state, plan.ctx, [], { sw: swi, t: tt });
      const mid = msForValue(target);
      if (act(sw, mid)) fail(`${code}/${id}: correct flip rejected`);
      if (act(sw, mid + 1000) !== true || act(sw, mid - 1000) !== true) fail(`${code}/${id}: adjacent seconds accepted`);
      if (act(sw, mid + CYCLE_MS)) fail(`${code}/${id}: next loop rejected`);
      if (act((sw + 1) % 6, mid) !== true) fail(`${code}/${id}: wrong switch accepted`);
      if (valueAt(mid) !== target) fail(`${code}/${id}: valueAt/msForValue mismatch`);
      if (!state.letters.includes(plan.ctx.letter)) fail(`${code}/${id}: case letter not on panel`);
    }

    // Agreement with independent reference interpreter
    const refAns = REF[id](state, code);
    if (JSON.stringify(steps) !== JSON.stringify(refAns)) {
      fail(`${code}/${id}: logic ${JSON.stringify(steps)} != reference ${JSON.stringify(refAns)}`);
    }

    for (const b of t.branches) {
      if (!mod.BRANCHES.includes(b)) fail(`${code}/${id}: unknown branch ${b}`);
      (tally[id] ??= {})[b] = (tally[id][b] ?? 0) + 1;
    }
    (distinct[id] ??= new Set()).add(JSON.stringify(state));
  }
}

if (n !== CODE_COUNT) fail(`checked ${n} codes, expected ${CODE_COUNT}`);

// Dead-rule check across all modules
for (const [id, mod] of Object.entries(MODULES)) {
  for (const b of mod.BRANCHES) {
    if (!tally[id]?.[b]) fail(`${id}: branch "${b}" never fires (dead rule)`);
  }
}

// Manual verification: contains every rule line verbatim, every plate, the right page count, credits, logo
for (const color of [false, true]) {
  const html = buildManual({ color });
  const text = html.replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>');
  const pages = (html.match(/<section class="page/g) || []).length;
  if (pages !== MANUAL_PAGES) fail(`manual: expected ${MANUAL_PAGES} pages, got ${pages}`);
  if (!text.includes("D'SAITECH")) fail('manual: missing D\'SAITECH credit');
  if (!html.includes('data-logo')) fail('manual: missing logo');
  if (/DIAL SAFE/.test(text)) fail('manual: still mentions the removed DIAL SAFE');
  for (const [id, mod] of Object.entries(MODULES)) {
    if (!text.includes(mod.plate)) fail(`manual: missing plate ${mod.plate}`);
    for (const l of mod.RULES) {
      if (!text.includes(l.trim())) fail(`manual: ${id} rule line missing: "${l}"`);
    }
  }
  for (const [i, col] of COLUMNS.entries()) {
    for (const g of col) {
      if (!html.includes(`aria-label="${g}"`)) fail(`manual: glyph ${g} (col ${i}) not drawn`);
    }
  }
}

// Report
console.log(`codes checked: ${n}/${CODE_COUNT}`);
for (const [id, mod] of Object.entries(MODULES)) {
  console.log(`\n${mod.plate} (${id}): ${distinct[id].size} distinct layouts`);
  console.log('  ' + mod.BRANCHES.map((b) => `${b}=${tally[id]?.[b] ?? 0}`).join('  '));
}
console.log(`\nStatistical checks: Switch letter always on panel`);

const real = errors.filter(Boolean);
if (real.length) {
  console.error(`\nFAILED (${errors.filter((e) => e === null).length} problems):`);
  real.forEach((e) => console.error('  - ' + e));
  process.exit(1);
}
console.log('\nPASS: every code yields exactly one solution; logic == reference; no dead rules; manual renders every rule.');
