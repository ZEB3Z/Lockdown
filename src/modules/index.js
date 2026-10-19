import * as tumbler from './tumbler/logic.js';
import * as glyphs from './glyphs/logic.js';
import * as fuse from './fuse/logic.js';
import * as switchLock from './switch/logic.js';
import * as dial from './dial/logic.js';

export const MODULES = { tumbler, glyphs, fuse, switch: switchLock, dial };
