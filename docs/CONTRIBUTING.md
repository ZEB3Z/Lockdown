# Contributor guide

## Folders
```
src/config.js            clock, strikes, penalty, killer speed (tune here)
src/core/                rng.js · code.js (case code) · plan.js (code -> run) · run.js (state machine, no DOM)
src/modules/<id>/        logic.js (pure) · view.js (DOM)
src/modules/index.js     logic registry        src/modules/views.js  view registry
src/ui/                  shell.js · visuals.js · glyphs.js (shared SVG art) · dom.js
src/audio/engine.js      Web Audio synth
src/manual/ src/admin/   printed manual builder · answer key page
tools/validate.mjs       exhaustive validator (also runs in the Vercel build)
tools/smoke.mjs          jsdom test: every view x every code, full shell flows (win, strikes, timeout, pause, rotate)
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
`view.js`: `export function render(state, el, api)`. Build markup with `<button data-i="n">` and call `bind(el, api)` from `ui/dom.js`. `api.act(i)` returns `'ok'|'strike'|'door'|'win'|'caught'`. A wrong index is a strike; progress is kept.

## Add a module
1. `logic.js` + `view.js` in `src/modules/<id>/`.
2. Register in `modules/index.js` and `modules/views.js`; add the id to `CONFIG.doors`.
3. Add its expected step count in `tools/validate.mjs` and a reference in `tools/reference.mjs` (by someone else).
4. Add its page in `src/manual/build.js` (and a decoy if wanted).
5. `npm test` (validate + smoke) must pass. Playtest before it ships.

## Changing a rule
Edit `trace()` and `RULES` together, update the reference, run `npm run validate`, reprint the manual. The validator fails if the manual lacks a rule line or a branch never fires.

## Conventions
- Rules short, unambiguous, readable under pressure. Clarity beats atmosphere.
- Seed per module: `makeRng(code + ':' + id)`. Never share a stream.
- Small bundle: no frameworks, no asset files, no SVG filters or animated blur.
- Test on a real phone before merging anything visual.
