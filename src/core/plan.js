// Case code -> full run plan. Deterministic: same code, same plan, every device.
import { parseCode } from './code.js';
import { makeRng } from './rng.js';
import { MODULES } from '../modules/index.js';
import { CONFIG } from '../config.js';

export function buildPlan(codeStr, doorIds = CONFIG.doors) {
  const ctx = parseCode(codeStr);
  if (!ctx) throw new Error('bad case code: ' + codeStr);
  const order = makeRng(ctx.code + ':order').shuffle(doorIds);
  const doors = order.map((id) => ({ id, state: MODULES[id].generate(makeRng(ctx.code + ':' + id), ctx) }));
  return { ctx, doors };
}
