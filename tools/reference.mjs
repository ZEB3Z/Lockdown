// INDEPENDENT reference interpreter of the printed manual (see each module's RULES text).
// Written separately from src/modules/*/logic.js on purpose: different structure, own code parsing.
// If logic.js and this file disagree, the manual text is ambiguous.
import { COLUMNS } from '../src/modules/glyphs/columns.js';

const parse = (code) => {
  const [head, last, color] = code.split('-');
  return { letter: head[0], serial: Number(head[1]), last: Number(last), color };
};

export function refTumbler(state, code) {
  const { last, color } = parse(code);
  const ltr = last % 2 === 1;
  const pins = state.pins;
  const normal = pins.map((p, i) => i).filter((i) => pins[i].symbol !== 'skull');
  const N = normal.filter((i) => pins[i].color === color).length;
  const group = (i) => {
    if (pins[i].symbol === 'skull') return 9;
    const c = pins[i].color === color;
    if (N === 0) return 0;
    if (N === 1) return c ? 0 : 1;
    return c ? 1 : 0;
  };
  return pins.map((_, i) => i).sort((a, b) => group(a) - group(b) || (ltr ? a - b : b - a));
}

export function refGlyphs(state, code) {
  const { serial } = parse(code);
  const matching = COLUMNS.filter((col) => state.keys.every((k) => col.indexOf(k) !== -1));
  if (matching.length !== 1) throw new Error('ref: ambiguous column');
  const col = matching[0];
  const sign = serial % 2 === 1 ? 1 : -1;
  return [0, 1, 2, 3].sort((a, b) => sign * (col.indexOf(state.keys[a]) - col.indexOf(state.keys[b])));
}

export function refFuse(state, code) {
  const { letter, last, color } = parse(code);
  const wires = state.wires;
  const labeled = [], colored = [];
  wires.forEach((w, i) => { if (w.label) labeled.push(i); if (w.color === color) colored.push(i); });
  switch (wires.length) {
    case 3: return [labeled.length > 0 ? labeled[0] : 1];
    case 4:
      if (last % 2 === 1) return [3];
      return [colored.length > 0 ? colored[0] : 0];
    case 5:
      if (labeled.length === 1) return [labeled[0]];
      return ['A', 'E'].includes(letter) ? [1] : [4];
    case 6: return [colored.length >= 2 ? colored[1] : 2];
    default: throw new Error('ref: wires ' + wires.length);
  }
}

// Written from the printed rule text, not from logic.js.
export function refSwitch(state, code) {
  const { letter, serial, color } = parse(code);
  const pos = state.letters.filter((L) => L === letter).length === 1 ? state.letters.indexOf(letter) + 1 : -1;
  if (pos < 0) throw new Error('refSwitch: letter not on panel exactly once');
  const start = { RED: 2, BLUE: 4, YELLOW: 7, WHITE: 10 }[color];
  return [(pos - 1) * 100 + start + serial];
}

export const REF = {
  tumbler: refTumbler,
  glyphs: refGlyphs,
  fuse: refFuse,
  switch: refSwitch,
};
