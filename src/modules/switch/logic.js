// EXECUTION SWITCH. Pure logic: no DOM. Imported by game, manual, validator.
// The Escapee sees a panel of lettered switches and a looping countdown. The Handler works out
// WHICH switch (case LETTER) and WHICH countdown value (COLOR + SERIAL).
// One action only: flip the right switch while the countdown shows the right number.
import { LETTERS } from '../../core/code.js';

export const id = 'switch';
export const plate = 'EXECUTION SWITCH';
export const strikeEffect = 'switchFault'; // extra sound the shell plays on a strike here

export const SWITCH_COUNT = 6;
export const START = 20;                 // countdown runs START..0 then loops
export const CYCLE_MS = (START + 1) * 1000;
export const EARLY_MS = 100;             // tolerance before the number appears
export const LATE_MS = 250;              // tolerance after it changes (human reaction)
export const BASE = { RED: 2, BLUE: 4, YELLOW: 7, WHITE: 10 };

export const BRANCHES = ['color:red', 'color:blue', 'color:yellow', 'color:white'];

export const RULES = [
  'The panel has 6 lettered switches. A countdown runs from 20 down to 0, then starts over.',
  '1. Find the switch with the case code LETTER on it. That is your switch.',
  '2. Start with the COLOR number: RED 2, BLUE 4, YELLOW 7, WHITE 10.',
  '3. Add SERIAL. That is your countdown number.',
  '4. Flip your switch while the countdown shows that number. The window is about one second. Wrong switch, too early or too late is a strike.',
];

/** state = { letters: [6 distinct letters, index 0 = leftmost switch] }. The case LETTER is always on it. */
export function generate(rng, ctx) {
  const others = rng.shuffle(LETTERS.filter((L) => L !== ctx.letter)).slice(0, SWITCH_COUNT - 1);
  return { letters: rng.shuffle([...others, ctx.letter]) };
}

/** -> { steps: [switchIndex * 100 + targetNumber], ... } One action, so one step. */
export function trace(state, ctx) {
  const sw = state.letters.indexOf(ctx.letter);
  if (sw < 0) throw new Error('switch: case letter missing from panel: ' + ctx.letter);
  const base = BASE[ctx.color];
  const target = base + ctx.serial;
  return {
    steps: [sw * 100 + target],
    sw, target, base, add: ctx.serial,
    branches: [`color:${ctx.color.toLowerCase()}`],
  };
}

export const solve = (state, ctx) => trace(state, ctx).steps;

// ---- countdown timing (ms since the lock appeared, active play time only)
const cyc = (ms) => ((ms % CYCLE_MS) + CYCLE_MS) % CYCLE_MS;
export const valueAt = (ms) => START - Math.floor(cyc(ms) / 1000);
export const msForValue = (v) => (START - v) * 1000 + 500; // middle of that number's second
export const inWindow = (ms, target) => {
  const c = cyc(ms), start = (START - target) * 1000;
  return c >= start - EARLY_MS && c < start + 1000 + LATE_MS;
};

/** action = { sw, t }  (switch index, ms since the lock appeared) */
export function isStrike(state, ctx, progress, action) {
  const s = trace(state, ctx);
  return !(action && action.sw === s.sw && inWindow(action.t, s.target));
}

export const answerText = (steps) =>
  `FLIP SWITCH ${Math.floor(steps[0] / 100) + 1} (from left) AT COUNTDOWN ${steps[0] % 100}`;
