// GLYPH PAD. Pure logic.
import { COLUMNS } from './columns.js';
export { GLYPHS, COLUMNS } from './columns.js';

export const id = 'glyphs';
export const plate = 'GLYPH PAD';
export const KEY_COUNT = 4;
export const BRANCHES = ['serial-odd', 'serial-even', 'col0', 'col1', 'col2', 'col3', 'col4', 'col5'];

export const RULES = [
  'The pad shows 4 glyphs. Find the ONE column below that contains all 4.',
  'SERIAL DIGIT odd: press them in that column\'s order, TOP to BOTTOM.',
  'SERIAL DIGIT even: press them in that column\'s order, BOTTOM to TOP.',
  'Ignore glyphs of the column that are not on the pad.',
];

/** state = { keys: [glyphId x4] }  (keypad positions 0..3, row-major) */
export function generate(rng) {
  const col = COLUMNS[rng.int(COLUMNS.length)];
  return { keys: rng.shuffle(col).slice(0, KEY_COUNT) };
}

export function trace(state, ctx) {
  const hits = COLUMNS.map((c, i) => (state.keys.every((k) => c.includes(k)) ? i : -1)).filter((i) => i >= 0);
  if (hits.length !== 1) throw new Error(`glyphs: ${hits.length} matching columns for ${state.keys}`);
  const col = COLUMNS[hits[0]];
  const pos = state.keys.map((k) => col.indexOf(k));
  const idx = state.keys.map((_, i) => i).sort((a, b) => (ctx.serialOdd ? pos[a] - pos[b] : pos[b] - pos[a]));
  return { steps: idx, branches: [ctx.serialOdd ? 'serial-odd' : 'serial-even', 'col' + hits[0]] };
}

export const solve = (state, ctx) => trace(state, ctx).steps;
