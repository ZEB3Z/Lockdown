// Tune after playtests. Everything the game/killer/clock reads lives here.
const BASE = {
  timeLimitSec: 240,      // total clock (4 minutes on normal)
  maxStrikes: 3,          // this many strikes = caught
  strikePenaltySec: 15,   // each strike removes this from the clock (killer jumps closer)
  killerSpeed: 1.0,       // clock drain multiplier (1.2 = 20% faster killer)
  difficulty: 'normal',   // 'easy' | 'normal' | 'hard'. Presets below override the numbers above. URL: ?difficulty=easy
  doors: ['tumbler', 'glyphs', 'fuse', 'switch', 'dial'], // v2 run; all five doors, order shuffled per case code
};
export const PRESETS = {
  easy: { timeLimitSec: 300, strikePenaltySec: 10, killerSpeed: 0.9 },
  normal: {},
  hard: { timeLimitSec: 200, strikePenaltySec: 20, killerSpeed: 1.1 },
};
const asked = typeof location !== 'undefined' ? new URLSearchParams(location.search).get('difficulty') : null;
const level = PRESETS[asked] ? asked : BASE.difficulty;
export const CONFIG = { ...BASE, ...PRESETS[level], difficulty: level };
