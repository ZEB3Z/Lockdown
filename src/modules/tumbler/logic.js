// BRASS TUMBLER. Pure logic: no DOM. Imported by game, manual, validator.
export const id = 'tumbler';
export const plate = 'BRASS TUMBLER';
export const PIN_COUNT = 5;
export const PIN_COLORS = ['RED', 'BLUE', 'YELLOW', 'WHITE'];
export const SYMBOLS = ['moon', 'eye', 'key', 'hand']; // cosmetic; 'skull' is the only rule symbol
export const BRANCHES = ['color', 'nocolor', 'skull', 'ltr', 'rtl'];

// Manual text. The manual page renders these lines verbatim.
// Three decisions only: where the SKULL goes, which DIRECTION to read, which pins go first by COLOR.
export const RULES = [
  'Pins are numbered 1-5, LEFT to RIGHT. Tap all 5 pins in the order below.',
  '1. SKULL: a pin showing the SKULL is tapped at the very END. Set it aside for now.',
  '2. DIRECTION: ROOM odd: read the other pins LEFT to RIGHT. ROOM even: read them RIGHT to LEFT.',
  '3. COLOR: in that reading order, tap the pins matching the case COLOR first. Then tap the rest. Then tap the SKULL pin.',
];

/** state = { pins: [{ color, symbol }] }  (index 0 = leftmost) */
export function generate(rng) {
  const skullAt = rng.next() < 0.5 ? rng.int(PIN_COUNT) : -1; // at most one skull
  const pins = [];
  for (let i = 0; i < PIN_COUNT; i++)
    pins.push({ color: rng.pick(PIN_COLORS), symbol: i === skullAt ? 'skull' : rng.pick(SYMBOLS) });
  return { pins };
}

/** -> { steps: pin indices in correct tap order, branches: [...] } */
export function trace(state, ctx) {
  const all = state.pins.map((_, i) => i);
  const skull = all.filter((i) => state.pins[i].symbol === 'skull');
  const rest = all.filter((i) => !skull.includes(i));
  const dir = ctx.roomOdd ? rest : rest.slice().reverse();
  const isC = (i) => state.pins[i].color === ctx.color;
  const colored = dir.filter(isC);
  const plain = dir.filter((i) => !isC(i));
  const branches = [colored.length ? 'color' : 'nocolor', ctx.roomOdd ? 'ltr' : 'rtl'];
  if (skull.length) branches.push('skull');
  return { steps: [...colored, ...plain, ...skull], branches };
}

export const solve = (state, ctx) => trace(state, ctx).steps;
