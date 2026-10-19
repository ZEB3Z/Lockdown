import { render as tumbler } from './tumbler/view.js';
import { render as glyphs } from './glyphs/view.js';
import { render as fuse } from './fuse/view.js';
import { render as switchLock } from './switch/view.js';

// Register module renderers: render(state, el, api) where api.act(i) -> result string.
export const VIEWS = { tumbler, glyphs, fuse, switch: switchLock };
