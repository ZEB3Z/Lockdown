import { CONFIG } from '../config.js';
import { randomCode, parseCode } from '../core/code.js';
import { buildPlan } from '../core/plan.js';
import { Run } from '../core/run.js';
import { MODULES } from '../modules/index.js';
import { VIEWS } from '../modules/views.js';
import * as audio from '../audio/engine.js';
import * as V from './visuals.js';
import * as H from './haptics.js';

const qs = new URLSearchParams(location.search);
const FIXED = parseCode(qs.get('case') || '')?.code || null; // ?case=K7-3-RED
const DEBUG = qs.has('debug');
const STATS = DEBUG || qs.has('stats'); // ?stats = per-door timings on the end screen, no answers shown                               // shows answer (1-based) in HUD
const fx = { reduced: matchMedia('(prefers-reduced-motion: reduce)').matches };

let wake = null, muted = false;
const lockScreen = async () => { try { wake = await navigator.wakeLock?.request('screen'); } catch {} };
const buzz = (p) => { try { navigator.vibrate?.(p); } catch {} };
const mmss = (s) => { s = Math.ceil(s); return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`; };

export function startShell(app) { V.init(); start(app); }

function start(app) {
  app.innerHTML = `<section class="screen start">
    <h1>LOCK<br>DOWN</h1>
    <p class="warn"><b>WARNING</b> This game contains jump scares, sudden loud sounds and flickering light. Reduced effects tones down flashing and motion.</p>
    <label class="opt"><input type="checkbox" id="red" ${fx.reduced ? 'checked' : ''}> Reduced effects</label>
    <label class="opt"><input type="checkbox" id="snd"> Sound off (staff testing)</label>
    <button class="big" id="go">ENTER THE HOUSE</button></section>`;
  app.querySelector('#go').onclick = () => { fx.reduced = app.querySelector('#red').checked; muted = app.querySelector('#snd').checked;
    audio.setMuted(muted); audio.setReduced(fx.reduced); V.setReduced(fx.reduced); audio.unlock(); play(app); };
}

function play(app) {
  const plan = buildPlan(FIXED || randomCode());
  const run = new Run(plan, CONFIG, performance.now());
  const c = plan.ctx;
  app.className = fx.reduced ? 'reduced' : '';
  app.innerHTML = `<section class="screen play">
    <header class="hud"><div class="clock"></div><div class="strikes"></div><div class="prox"><i></i></div></header>
    <div class="case">${[['LETTER', c.letter], ['SERIAL', c.serial], ['LAST', c.last], ['COLOR', c.color]]
      .map(([k, v]) => `<div><small>${k}</small><b>${v}</b></div>`).join('')}</div>
    <div class="plateRow"><span class="door"></span><h2 class="plate"></h2><button class="mute">${muted ? 'UNMUTE' : 'MUTE'}</button></div>
    <main class="lock"></main><div class="dbg"></div></section>`;
  const q = (s) => app.querySelector(s);
  const play_ = q('.play');
  q('.mute').onclick = (e) => { muted = !muted; audio.setMuted(muted); e.target.textContent = muted ? 'UNMUTE' : 'MUTE'; };
  let raf, timer, ended = false, last = {};
  lockScreen(); audio.startRun(); V.reset(); H.reset(); let scared = false;

  const api = { act(i) { const r = run.act(i); handle(r); return r; } };

  function hud() {
    const t = mmss(run.remaining());
    if (last.t !== t) { q('.clock').textContent = t; last.t = t; }
    const p = run.proximity();
    q('.prox i').style.transform = `scaleX(${p / 100})`;
    play_.dataset.danger = p > 75 ? '2' : p > 50 ? '1' : '0';
    audio.update(p); V.setLevel(p);
    if (!run.paused) H.update(p, performance.now());
    if (!scared && p >= 80) { scared = true; audio.scare(); V.scare(); }
    if (last.s !== run.strikes) {
      q('.strikes').innerHTML = Array.from({ length: CONFIG.maxStrikes }, (_, i) => `<i class="${i < run.strikes ? 'on' : ''}"></i>`).join('');
      last.s = run.strikes;
    }
  }
  function showDoor() {
    const d = plan.doors[run.door];
    q('.door').textContent = `DOOR ${run.door + 1}/${plan.doors.length}`;
    q('.plate').textContent = MODULES[d.id].plate;
    q('.lock').classList.remove('trans');
    VIEWS[d.id](d.state, q('.lock'), api);
    if (DEBUG) q('.dbg').textContent = 'ANSWER (1-based): ' + run.steps.map((s) => s + 1).join(' ');
  }
  function handle(r) {
    if (r === 'strike') { buzz(250); audio.strike(); V.strike(run.strikes); if (run.strikes === 2) V.scare(); play_.classList.add('hit'); setTimeout(() => play_.classList.remove('hit'), 450); }
    else if (r === 'door') { buzz([40, 60, 40]); audio.creak(); q('.lock').classList.add('trans'); timer = setTimeout(showDoor, 700); }
    else if (r === 'win' || r === 'caught') end(r);
    if (!ended) hud(); // fix: hud() threw after the end screen replaced the DOM
  }
  function frame() {
    if (ended) return;
    run.tick(performance.now()); hud();
    if (run.over) return end(run.over);
    raf = requestAnimationFrame(frame);
  }
  // Pauses stack: tab hidden and landscape each hold the clock; it resumes only when all holds are released.
  let holds = 0, hideO = null, rotO = null;
  const overlay = (txt) => { const o = document.createElement('div'); o.className = 'pause'; o.textContent = txt; app.appendChild(o); return o; };
  function hold(on) {
    holds += on ? 1 : -1;
    if (on && holds === 1) { run.pause(performance.now()); audio.setPaused(true); }
    else if (!on && holds === 0) { run.resume(performance.now()); audio.setPaused(false); }
  }
  function onVis() {
    if (document.hidden && !run.over && !hideO) {
      hold(true); hideO = overlay('PAUSED. TAP TO CONTINUE');
      hideO.onclick = () => { hideO.remove(); hideO = null; hold(false); };
    } else if (!document.hidden) lockScreen();
  }
  const land = matchMedia('(orientation: landscape) and (max-height: 520px)'); // phone held sideways
  function onRot() {
    if (run.over) return;
    if (land.matches && !rotO) { hold(true); rotO = overlay('ROTATE YOUR PHONE UPRIGHT'); }
    else if (!land.matches && rotO) { rotO.remove(); rotO = null; hold(false); }
  }
  function end(kind) {
    if (ended) return; ended = true;
    cancelAnimationFrame(raf); clearTimeout(timer);
    document.removeEventListener('visibilitychange', onVis);
    land.removeEventListener?.('change', onRot);
    try { wake?.release(); } catch {}
    const rem = run.remaining();
    audio.stopRun(); H.stop(); V.setLevel(kind === 'win' ? 0 : 100);
    if (kind === 'win') audio.win(); else { audio.caught(); V.scare(); }
    buzz(kind === 'win' ? [60, 40, 60] : [500]);
    app.innerHTML = kind === 'win'
      ? `<section class="screen end win"><h1>ESCAPED</h1><div class="big-time">${mmss(rem)}</div><p>TIME REMAINING</p><button class="big" id="again">PLAY AGAIN</button></section>`
      : `<section class="screen end lose"><h1>HE FOUND YOU</h1><p>${run.strikes >= CONFIG.maxStrikes ? 'Too much noise.' : 'Time ran out.'}</p><button class="big" id="again">TRY AGAIN</button></section>`;
    if (STATS) {
      const per = run.marks.map((m, i) => `${plan.doors[i].id} ${m - (run.marks[i - 1] || 0)}s`).join(' | ');
      app.querySelector('.screen').insertAdjacentHTML('beforeend', `<pre class="dbg">${plan.ctx.code} | ${kind} | strikes ${run.strikes} | left ${Math.round(rem)}s\n${per || 'no door cleared'}</pre>`);
    }
    app.querySelector('#again').onclick = () => play(app);
  }

  document.addEventListener('visibilitychange', onVis);
  land.addEventListener ? land.addEventListener('change', onRot) : land.addListener?.(onRot);
  onRot();
  showDoor(); hud(); raf = requestAnimationFrame(frame);
}
