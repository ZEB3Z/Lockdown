// Tune after playtests. Everything the game/killer/clock reads lives here.
const BASE = {
  timeLimitSec: 180,      // total clock
  maxStrikes: 3,          // this many strikes = caught
  strikePenaltySec: 15,   // each strike removes this from the clock (killer jumps closer)
  killerSpeed: 1.0,       // clock drain multiplier (1.2 = 20% faster killer)
  difficulty: 'normal',   // 'easy' | 'normal' | 'hard'. Presets below override the numbers above. URL: ?difficulty=easy
  doors: ['tumbler', 'glyphs', 'fuse'], // v1 run; order is shuffled per case code
};
export const PRESETS = {
  easy: { timeLimitSec: 240, strikePenaltySec: 10, killerSpeed: 0.9 },
  normal: {},
  hard: { timeLimitSec: 150, strikePenaltySec: 20, killerSpeed: 1.1 },
};
const asked = typeof location !== 'undefined' ? new URLSearchParams(location.search).get('difficulty') : null;
const level = PRESETS[asked] ? asked : BASE.difficulty;
export const CONFIG = { ...BASE, ...PRESETS[level], difficulty: level };
