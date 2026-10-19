// FUSE BOX. Pure logic.
export const id = 'fuse';
export const plate = 'FUSE BOX';
export const WIRE_COLORS = ['RED', 'BLUE', 'YELLOW', 'WHITE'];
export const LABELS = ['GAS', 'EXIT', 'ATTIC', 'CELLAR', 'HALL', 'CRYPT'];
export const BRANCHES = ['3:tagged', '3:plain', '4:odd', '4:even:color', '4:even:none',
  '5:one-tag', '5:vowel', '5:consonant', '6:two-color', '6:else'];

export const RULES = [
  'Wires are numbered 1-N from the TOP. A wire is LABELED if it has a word tag on it.',
  '3 wires: any labeled wire -> cut the TOPMOST labeled wire. None -> cut wire 2.',
  '4 wires: LAST DIGIT odd -> cut wire 4. Even -> cut the TOPMOST wire of the case COLOR; if none, cut wire 1.',
  '5 wires: exactly ONE labeled wire -> cut it. Otherwise: LETTER is A or E -> cut wire 2; any other letter -> cut wire 5.',
  '6 wires: TWO or more wires of the case COLOR -> cut the SECOND one from the top. Otherwise cut wire 3.',
];

/** state = { wires: [{ color, label|null }] }  (index 0 = top) */
export function generate(rng) {
  const n = 3 + rng.int(4); // 3..6
  const wires = [];
  for (let i = 0; i < n; i++)
    wires.push({ color: rng.pick(WIRE_COLORS), label: rng.next() < 0.35 ? rng.pick(LABELS) : null });
  return { wires };
}

export function trace(state, ctx) {
  const w = state.wires, n = w.length;
  const tagged = w.map((x, i) => (x.label ? i : -1)).filter((i) => i >= 0);
  const ofColor = w.map((x, i) => (x.color === ctx.color ? i : -1)).filter((i) => i >= 0);
  const out = (cut, b) => ({ steps: [cut], branches: [b] });
  if (n === 3) return tagged.length ? out(tagged[0], '3:tagged') : out(1, '3:plain');
  if (n === 4) {
    if (ctx.lastOdd) return out(3, '4:odd');
    return ofColor.length ? out(ofColor[0], '4:even:color') : out(0, '4:even:none');
  }
  if (n === 5) {
    if (tagged.length === 1) return out(tagged[0], '5:one-tag');
    return ctx.vowel ? out(1, '5:vowel') : out(4, '5:consonant');
  }
  if (n === 6) return ofColor.length >= 2 ? out(ofColor[1], '6:two-color') : out(2, '6:else');
  throw new Error('fuse: bad wire count ' + n);
}

export const solve = (state, ctx) => trace(state, ctx).steps;
