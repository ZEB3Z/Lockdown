# Playtest plan (3 days)

The validator proves the rules are consistent. Only people prove they are fast and clear. Spend Day 2 on people.

## Schedule
**Day 1: verify and fix**
- Deploy. Run the phone checklists on your lowest-end Android and an iPhone (audio, vibration, wake lock, grain smoothness, layout, offline reload).
- Print the manual (9 pages?), read every page aloud, fix wording.
- Team runs 6+ pairs (swap roles). Fix crashes, overflow, unreadable bits. No new features.

**Day 2: naive pairs + tuning**
- 12 to 15 pairs who have never seen the game. Use `/?stats` (per-door times on the end screen, **no answers**). Staff fill `docs/playtest-log.csv`. Don't coach; use the stuck ladder from the facilitator sheet.
- After each batch of 5 pairs change **one** knob or **one** rule, redeploy, continue.
- Mid-day: Morse and dial safe **only if** v1 has no known blockers, win rate is 40 to 70%, and no lock has a median over 60s. Otherwise skip them.

**Day 3: freeze and rehearse**
- Morning: last fixes, then **code freeze**. Tag the commit.
- Print final manuals, QR, facilitator sheets. Preload loaners.
- Full rehearsal at the booth (lighting, noise): 3 pairs start to finish.
- Brief staff on the facilitator sheet; agree who handles stuck pairs.

## Measure per pair
| Field | How |
|---|---|
| Outcome, strikes, seconds left | end screen with `?stats` |
| Seconds per lock | end screen with `?stats` |
| Where they got stuck | staff note: lock + what they said/did |
| Ambiguous rule | exact rule line misread, and how |
| Plate-name confusion (BRASS vs IRON etc.) | tally |
| Scare comfort / volume | anyone uncomfortable? |

## Targets for first-time pairs
- Win rate **50 to 65%**; median time left on wins **20 to 50s** (tense but fair).
- No lock with median over **60s**; strikes spread, not piled on one lock.

## Tuning (`src/config.js`): one change at a time
| Symptom | Fix |
|---|---|
| Win rate under 40%, time is the killer | `timeLimitSec` +30 (210, then 240) |
| Win rate under 40%, strikes are the killer | **Not config.** Find the ambiguous rule in the log, reword or simplify it |
| Win rate over 85% with 60s+ left | `timeLimitSec` -20, or `killerSpeed` 1.15 |
| Strikes too harsh / soft | `strikePenaltySec` 10 to 20 |
| Quick preset swap | `?difficulty=easy` (240s, -10s/strike) or `hard` (150s, -20s/strike, faster killer); presets live in `src/config.js` |
| One lock averages over 60s | simplify that module's rule (`trace()` + `RULES` + `tools/reference.mjs`, then `npm run validate`) |
| Pairs lose time finding the page | bigger plate text in game; fewer decoys |
| Scares too much / too little | stinger peaks in `audio/engine.js`, thresholds in `visuals.js`; keep Reduced effects usable |

## Team split (adapt to headcount)
| Role | Owns |
|---|---|
| Builder A: game | shell, audio, visuals, PWA, deploy, bug fixes |
| Builder B: rules + manual | `logic.js` rules, `RULES` text, manual pages, print tests |
| Reviewer (not Builder B) | `tools/reference.mjs`: re-derives answers from the printed text. Disagreement = ambiguous manual |
| Playtest lead | recruits pairs, runs the log, owns the numbers |
| Booth/logistics | QR print, loaner phones, manuals, power, signage |

Whoever writes a module's `logic.js` must not write its reference interpreter.
