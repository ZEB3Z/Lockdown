// BRASS TUMBLER. Pure logic: no DOM. Imported by game, manual, validator.
export const id = 'tumbler';
export const plate = 'BRASS TUMBLER';
export const PIN_COUNT = 5;
export const PIN_COLORS = ['RED', 'BLUE', 'YELLOW', 'WHITE'];
export const SYMBOLS = ['moon', 'eye', 'key', 'hand']; // cosmetic; 'skull' is the only rule symbol
export const BRANCHES = ['N0', 'N1', 'N2+', 'skull', 'ltr', 'rtl'];

// Manual text. The manual page renders these lines verbatim.
export const RULES = [
  'Pins are numbered 1-5, LEFT to RIGHT. Tap them in the order below.',
  '1. A pin showing the SKULL is set aside. It is picked LAST.',
  '2. Count the OTHER pins whose color = the case code COLOR. Call it N.',
  '3. LAST DIGIT odd: direction is LEFT to RIGHT. LAST DIGIT even: RIGHT to LEFT.',
  '4. N = 0: pick all pins in direction order.',
  '   N = 1: pick the COLOR pin first, then the rest in direction order.',
  '   N = 2 or more: pick all NON-COLOR pins in direction order, then the COLOR pins in direction order.',
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
  const dir = ctx.lastOdd ? rest : rest.slice().reverse();
  const isC = (i) => state.pins[i].color === ctx.color;
  const n = rest.filter(isC).length;
  let order, b;
  if (n === 0) { order = dir; b = 'N0'; }
  else if (n === 1) { order = [...dir.filter(isC), ...dir.filter((i) => !isC(i))]; b = 'N1'; }
  else { order = [...dir.filter((i) => !isC(i)), ...dir.filter(isC)]; b = 'N2+'; }
  const branches = [b, ctx.lastOdd ? 'ltr' : 'rtl'];
  if (skull.length) branches.push('skull');
  return { steps: [...order, ...skull], branches };
}

export const solve = (state, ctx) => trace(state, ctx).steps;
