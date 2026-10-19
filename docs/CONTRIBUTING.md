# Contributor guide

## Folders
```
src/config.js            clock, strikes, penalty, killer speed (tune here)
src/core/                rng.js · code.js (case code) · plan.js (code -> run) · run.js (state machine, no DOM)
src/modules/<id>/        logic.js (pure) · view.js (DOM)
src/modules/index.js     logic registry        src/modules/views.js  view registry
src/ui/                  shell.js · visuals.js · glyphs.js (shared SVG art) · dom.js · flash-limiter.js
src/audio/               engine.js (facade) · synth.js (core/limiter) · ambience.js · effects.js · stingers.js
src/scare/               director.js (scheduler, intensity curve, catalogue)
src/manual/ src/admin/   printed manual builder · answer key page
tools/validate.mjs       exhaustive validator (runs in the Vercel build)
tools/smoke.mjs          jsdom test: sampled codes x 5 doors, full shell flows, flash limiter, themes
tools/reference.mjs      independent interpreter of the manual text
```

## Module contract
`logic.js` is pure (no DOM, no `Math.random`, no `window`): the validator imports it in Node.
```js
export const id, plate, BRANCHES, RULES      // RULES = manual lines, rendered verbatim
export function generate(rng, ctx)           // per-module seeded rng, ctx = parsed case code
export function trace(state, ctx)            // -> { steps: [indexes in correct order], branches: [..] }
export const solve = (s, c) => trace(s, c).steps
export function isStrike(state, ctx, progress, action) // OPTIONAL. Default: action != solve()[progress.length]
```
`view.js`: `export function render(state, el, api)`. Build markup with `<button data-i="n">` (add `data-reusable="true"` for multi-step buttons) and call `bind(el, api)` from `ui/dom.js`. `api.act(i)` returns `'ok'|'strike'|'door'|'win'|'caught'`.

Reference implementations:
- See `src/modules/switch/` for a single-action, time-sensitive lock. Its view sends `api.act({ sw, t })` and its logic exports `isStrike`, `strikeEffect` and `answerText`. Views can use `api.clock()` (active play time, frozen while paused) and `api.sfx(name)`.
- See `src/modules/dial/` for multi-step draggable safe dial with clue tables.

## Adding a scare to the Scare Director
1. Add visual markup / CSS in `src/ui/visuals.js` and `src/style.css`. Always use `pointer-events: none` and route flashes through `requestFlash()` in `src/ui/flash-limiter.js`.
2. Add audio synthesis in `src/audio/effects.js` or `src/audio/stingers.js`.
3. Register the event in `src/scare/director.js` with intensity triggers and cooldown checks (`canFireMajorScare()`). Never fire during the first 3 seconds of a door.

## Conventions
- Rules short, unambiguous, readable under pressure. Clarity beats atmosphere.
- Seed per module: `makeRng(code + ':' + id)`. Never share a stream.
- Small bundle: no frameworks, no asset files, transforms and opacity only.
- Test on a real phone before merging anything visual.
