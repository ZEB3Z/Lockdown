// Pure run state machine (no DOM). One source of truth: remaining().
import { MODULES } from '../modules/index.js';

export class Run {
  constructor(plan, cfg, now) {
    Object.assign(this, { plan, cfg, door: 0, progress: [], strikes: 0, activeMs: 0, last: now, paused: false, over: null, marks: [] });
    this.steps = this._steps();
  }
  _steps() { const d = this.plan.doors[this.door]; return MODULES[d.id].solve(d.state, this.plan.ctx); }
  tick(now) {
    if (!this.paused && !this.over) this.activeMs += now - this.last;
    this.last = now;
    if (!this.over && this.remaining() <= 0) this.over = 'caught';
    return this.over;
  }
  pause(now) { this.tick(now); this.paused = true; }
  resume(now) { this.last = now; this.paused = false; }
  remaining() {
    const c = this.cfg;
    return Math.max(0, c.timeLimitSec - (this.activeMs / 1000) * c.killerSpeed - this.strikes * c.strikePenaltySec);
  }
  proximity() { return Math.min(100, 100 * (1 - this.remaining() / this.cfg.timeLimitSec)); }
  /** -> 'ok' | 'strike' | 'door' | 'win' | 'caught' | 'ignored' */
  act(i) {
    if (this.over || this.paused) return 'ignored';
    const d = this.plan.doors[this.door], mod = MODULES[d.id];
    const wrong = mod.isStrike ? mod.isStrike(d.state, this.plan.ctx, this.progress, i) : i !== this.steps[this.progress.length];
    if (wrong) { // modules may export isStrike(state, ctx, progress, action); default = not the next step of solve()
      this.strikes++;
      if (this.strikes >= this.cfg.maxStrikes || this.remaining() <= 0) { this.over = 'caught'; return 'caught'; }
      return 'strike';
    }
    this.progress.push(i);
    if (this.progress.length < this.steps.length) return 'ok';
    this.marks.push(Math.round(this.activeMs / 1000)); // cumulative seconds at each door cleared
    this.door++; this.progress = [];
    if (this.door >= this.plan.doors.length) { this.over = 'win'; return 'win'; }
    this.steps = this._steps();
    return 'door';
  }
}
