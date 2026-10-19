import { render as tumbler } from './tumbler/view.js';
import { render as glyphs } from './glyphs/view.js';
import { render as fuse } from './fuse/view.js';
// Register new module renderers here: render(state, el, api) where api.act(i) -> result string.
export const VIEWS = { tumbler, glyphs, fuse };
