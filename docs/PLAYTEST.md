# Playtest plan (v2 · 5 Locks · 4 Minutes)

The validator proves the rules are consistent. Only people prove they are fast and clear.

## Schedule
**Day 1: verify, scare audit, and hardware baseline**
- Deploy v2. Run checklists on low-end Android and iPhone (audio, vibration, wake lock, grain smoothness, layout, offline reload).
- **Scare audit pass:** A team member plays through on a cheap Android using speaker audio and wired/wireless headphones. Listen at 80% volume: log anything piercing, painful, unfair, or disorienting. Verify no scare covers puzzle controls for >0.6s.
- Print the 13-page manual, read every page aloud, check diagram keys and dial tables in dim booth light.
- Team runs 6+ pairs (swap roles). Check mistimed-flip and wrong-switch rates on Execution Switch and wrong SET rate on Dial Safe.

**Day 2: naive pairs + tuning**
- 12 to 15 pairs who have never seen the game. Use `/?stats` (per-door times on the end screen, **no answers**). Staff fill `docs/playtest-log.csv`.
- Staff logs: `theme`, `gentle_mode`, per-module seconds, wrong-switch and mistimed-flip rates, wrong SET rate, ambiguous clue descriptions.
- After each batch of 5 pairs change **one** knob or rule, redeploy, continue.

**Day 3: freeze and rehearse**
- Morning: final parameter tuning, then **code freeze**. Tag commit `v2.0-final`.
- Print final manuals (13 pages), QR codes, facilitator sheets. Preload loaners.
- Full booth rehearsal (booth lighting and crowd ambient noise): 3 pairs start to finish.
- Brief staff on the facilitator sheet; review tap-out / guest distress procedures.

## Measure per pair
| Field | How |
|---|---|
| Outcome, strikes, seconds left | end screen with `?stats` |
| Seconds per lock (all 5 doors) | end screen with `?stats` |
| Execution Switch errors | wrong switch vs mistimed flip (did the Handler pick the wrong switch or number, or did the Escapee miss the window?) |
| Dial Safe errors | wrong SET rate (did they misidentify clue or botch mental math?) |
| Ambiguous clue descriptions | which clue (clock, painting, candles, calendar, portrait, handprints) took >5s to name? |
| Theme & Gentle mode | recorded in log |
| Scare comfort & complaints | any ear fatigue, startle distress, or unreadable screens? |

## Targets for first-time pairs
- Win rate **50 to 65%** on normal (240s); median time left on wins **20 to 50s**.
- Per-module time targets:
  - Brass Tumbler: 30–40s
  - Glyph Pad: 25–35s
  - Fuse Box: 20–30s
  - Execution Switch: 30–50s (the countdown loops every 21s, so a missed window costs up to 21s)
  - Dial Safe: 45–60s
  - Transitions (4 × 0.7s): ~3s
- Total run: ~165–210s.

## Tuning (`src/config.js`): one change at a time
| Symptom | Fix |
|---|---|
| Win rate under 40%, time running out across the board | `timeLimitSec` +30 (270s) or killerSpeed 0.95 |
| Pairs failing on Dial Safe arithmetic | Ensure table numbers are immediately recognizable; do not change code without re-running `npm run validate` |
| Many mistimed flips on Execution Switch | Widen `LATE_MS` / `EARLY_MS` in `src/modules/switch/logic.js`, or brief the Escapee to say "ready" while watching the number |
| Many wrong-switch flips | Escapee misread a switch letter aloud (B/D, M/N); have them spell it with a word |
| High wrong SET rate on Dial Safe | Clarify clue order rule in manual |
| Win rate over 85% with 60s+ left | `timeLimitSec` -20 (220s) |
| Strikes too punishing | `strikePenaltySec` reduced from 15 to 10 |
| Quick preset swap | `?difficulty=easy` (300s, -10s/strike) or `hard` (200s, -20s/strike) |
| Loudness complaints | Adjust master compressor threshold or gain peak in `src/audio/synth.js` |

## Team split
| Role | Owns |
|---|---|
| Builder A: game & visuals | shell, scare director, visuals, PWA, themes, deploy, performance guard |
| Builder B: rules & manual | module logic, manual layout, worked examples, decoy pages, print tests |
| Reviewer (not Builder B) | `tools/reference.mjs`: independently re-derives answers from printed text |
| Playtest lead & Scare auditor | runs playtest log, performs headphone/speaker audio audit, tracks metrics |
| Booth / logistics | QR signs, loaner phones, laminated manuals, backup batteries, facilitator sheets |
