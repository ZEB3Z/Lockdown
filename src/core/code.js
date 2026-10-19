// Case code: K7-3-RED  = LETTER + SERIAL digit - LAST digit - COLOR
export const LETTERS = 'ABCDEFGHJKMN'.split('');      // no I L O Q (misread aloud)
export const VOWELS = ['A', 'E'];
export const COLORS = ['RED', 'BLUE', 'YELLOW', 'WHITE'];
export const DIGITS = [1, 2, 3, 4, 5, 6, 7, 8, 9];     // no 0

export const CODE_COUNT = LETTERS.length * DIGITS.length * DIGITS.length * COLORS.length; // 3888

const RE = /^([ABCDEFGHJKMN])([1-9])-([1-9])-(RED|BLUE|YELLOW|WHITE)$/;

export function formatCode(letter, serial, last, color) {
  return `${letter}${serial}-${last}-${color}`;
}

/** Returns the case context used by every module, or null if the code is invalid. */
export function parseCode(str) {
  const m = RE.exec(String(str).trim().toUpperCase());
  if (!m) return null;
  const [, letter, s, l, color] = m;
  const serial = +s, last = +l;
  return {
    code: formatCode(letter, serial, last, color),
    letter, serial, last, color,
    vowel: VOWELS.includes(letter),
    serialOdd: serial % 2 === 1,
    lastOdd: last % 2 === 1,
  };
}

export function randomCode(rand = Math.random) {
  const p = (a) => a[Math.floor(rand() * a.length)];
  return formatCode(p(LETTERS), p(DIGITS), p(DIGITS), p(COLORS));
}

export function* allCodes() {
  for (const L of LETTERS) for (const s of DIGITS) for (const l of DIGITS) for (const c of COLORS)
    yield formatCode(L, s, l, c);
}
