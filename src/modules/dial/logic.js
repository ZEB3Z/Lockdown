// DIAL SAFE. Pure logic: no DOM. Imported by game, manual, validator.
export const id = 'dial';
export const plate = 'DIAL SAFE';

export const CLUE_TYPES = ['clock', 'painting', 'candles', 'calendar', 'portrait', 'handprints'];

export const TABLES = {
  clock: {
    1: 5, 2: 11, 3: 17, 4: 23, 5: 29, 6: 35,
    7: 2, 8: 8, 9: 14, 10: 20, 11: 26, 12: 32,
  },
  painting: {
    crow: 7, moth: 15, key: 22, eye: 28, house: 34, dagger: 39,
  },
  candles: {
    1: 3, 2: 9, 3: 18, 4: 24, 5: 31, 6: 37,
  },
  calendar: {
    4: 6, 7: 12, 13: 19, 19: 25, 23: 30, 31: 38,
  },
  portrait: {
    1: 4, 2: 13, 3: 21, 4: 33,
  },
  handprints: {
    1: 1, 2: 10, 3: 16, 4: 27, 5: 36,
  },
};

export const BRANCHES = [
  'order:red', 'order:blue', 'order:yellow', 'order:white',
  'twist:odd-add', 'twist:even-none',
  'clue:clock', 'clue:painting', 'clue:candles', 'clue:calendar', 'clue:portrait', 'clue:handprints',
];

export const RULES = [
  'Three clue objects hang above the safe. Dial numbers are 0 to 39.',
  'Turn order is fixed: TURN 1 = LEFT (CCW) · TURN 2 = RIGHT (CW) · TURN 3 = LEFT (CCW).',
  '1. Match clues to turns using case code COLOR:',
  '   RED: 1st=LEFT clue, 2nd=CENTER clue, 3rd=RIGHT clue.',
  '   BLUE: 1st=RIGHT clue, 2nd=CENTER clue, 3rd=LEFT clue.',
  '   YELLOW: 1st=CENTER clue, 2nd=LEFT clue, 3rd=RIGHT clue.',
  '   WHITE: 1st=RIGHT clue, 2nd=LEFT clue, 3rd=CENTER clue.',
  '2. Look up the base number for each clue in the tables below.',
  '3. If LAST digit is ODD, add SERIAL to each number (if 40 or more, subtract 40).',
  '   If LAST digit is EVEN, use the table numbers unchanged.',
  '4. Turn the dial to each target number in order and press SET.',
];

export function generate(rng, ctx) {
  const types = rng.shuffle(CLUE_TYPES).slice(0, 3);
  const clues = types.map((type) => {
    switch (type) {
      case 'clock':
        return { type, val: 1 + rng.int(12) };
      case 'painting':
        return { type, val: rng.pick(['crow', 'moth', 'key', 'eye', 'house', 'dagger']) };
      case 'candles':
        return { type, val: 1 + rng.int(6) };
      case 'calendar':
        return { type, val: rng.pick([4, 7, 13, 19, 23, 31]) };
      case 'portrait':
        return { type, val: 1 + rng.int(4) };
      case 'handprints':
        return { type, val: 1 + rng.int(5) };
      default:
        throw new Error('Unknown clue type: ' + type);
    }
  });

  const state = { clues, startDial: 0 };
  const { steps } = trace(state, ctx);

  let s = (steps[0] + 13 + rng.int(20)) % 40;
  while (steps.includes(s)) s = (s + 1) % 40;
  state.startDial = s;

  return state;
}

export function trace(state, ctx) {
  const orderIndices = {
    RED: [0, 1, 2],
    BLUE: [2, 1, 0],
    YELLOW: [1, 0, 2],
    WHITE: [2, 0, 1],
  }[ctx.color];

  const orderedClues = orderIndices.map((idx) => state.clues[idx]);
  const baseNumbers = orderedClues.map((clue) => TABLES[clue.type][clue.val]);

  const steps = baseNumbers.map((base) => {
    if (ctx.lastOdd) {
      return (base + ctx.serial) % 40;
    }
    return base % 40;
  });

  const branches = [
    `order:${ctx.color.toLowerCase()}`,
    ctx.lastOdd ? 'twist:odd-add' : 'twist:even-none',
    ...state.clues.map((c) => `clue:${c.type}`),
  ];

  return {
    steps,
    orderedClues,
    baseNumbers,
    branches,
  };
}

export const solve = (state, ctx) => trace(state, ctx).steps;
