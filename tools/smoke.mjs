// npm run smoke -> drives the REAL shell/views/run/audio/visuals code in jsdom.
// Part 1: sampled codes across all 5 modules (simulate clicks through the DOM, expect ok.. door/win).
// Part 2: full game flows through the shell: win, strikes->caught, retry, timeout, pause/resume, vibration, themes, flash limiter.
import { JSDOM, VirtualConsole } from 'jsdom';

const errs = [];
const vc = new VirtualConsole();
vc.on('jsdomError', (e) => errs.push(String(e.detail || e.message || e)));

const dom = new JSDOM('<!doctype html><div id="app"></div><div id="fx"></div>', {
  url: 'http://localhost/?case=K7-3-RED&stats',
  pretendToBeVisual: true,
  virtualConsole: vc,
});
const w = dom.window;
let T = 0;
const vib = [];
const def = (k, v) => Object.defineProperty(globalThis, k, { value: v, configurable: true, writable: true });

def('window', w);
def('document', w.document);
def('location', w.location);
def('history', w.history);

let landscape = false;
let rotListener = null;
def('matchMedia', (q) => /orientation/.test(q)
  ? { get matches() { return landscape; }, addEventListener(_, fn) { rotListener = fn; }, removeEventListener() { rotListener = null; } }
  : { matches: false, addEventListener() {} });

def('requestAnimationFrame', w.requestAnimationFrame.bind(w));
def('cancelAnimationFrame', w.cancelAnimationFrame.bind(w));
def('navigator', { vibrate: (p) => { vib.push(p); return true; }, wakeLock: { request: async () => ({ release() {} }) } });
def('performance', { now: () => T, getEntriesByType: () => [] });
w.addEventListener('error', (e) => errs.push(String(e.error || e.message)));

const fakeCanvas = { createImageData: (a, b) => ({ data: new Uint8ClampedArray(a * b * 4) }), putImageData() {} };
w.HTMLCanvasElement.prototype.getContext = () => fakeCanvas;
w.HTMLCanvasElement.prototype.toDataURL = () => 'data:image/png;base64,AA==';

// Fake Web Audio context
const audioCalls = {};
const node = () => new Proxy(function () {}, {
  get: (t, k) => (k === 'then' ? undefined : (audioCalls[k] = (audioCalls[k] || 0) + 1, node())),
  set: () => true,
  apply: () => node(),
});
class FakeCtx {
  constructor() {
    this.currentTime = 0;
    this.state = 'suspended';
    this.sampleRate = 8000;
    this.destination = {};
  }
  resume() { this.state = 'running'; }
  suspend() { this.state = 'suspended'; }
  createBuffer() { return { getChannelData: () => new Float32Array(8000) }; }
  createGain() { return node(); }
  createOscillator() { return node(); }
  createBiquadFilter() { return node(); }
  createBufferSource() { return node(); }
  createDynamicsCompressor() { return node(); }
}
def('AudioContext', FakeCtx);
w.AudioContext = FakeCtx;

const { buildPlan } = await import('../src/core/plan.js');
const { Run } = await import('../src/core/run.js');
const { CONFIG, PRESETS } = await import('../src/config.js');
const { allCodes } = await import('../src/core/code.js');
const { VIEWS } = await import('../src/modules/views.js');
const { MODULES } = await import('../src/modules/index.js');
const { canFlash, requestFlash, setGentleMode, resetFlashLimiter } = await import('../src/ui/flash-limiter.js');

let fails = 0;
const bad = (m) => { fails++; console.error('FAIL', m); };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const $ = (s) => document.querySelector(s);

// ---------- Part 1: sampled codes across all 5 modules through the DOM
// Select a rich representative sample (every letter, serial, last, color, ~150 codes)
const all = [...allCodes()];
const sampled = all.filter((_, idx) => idx % 26 === 0); // 150 codes evenly spanning the 3,888 space
let n = 0;
for (const code of sampled) {
  const plan = buildPlan(code);
  const run = new Run(plan, CONFIG, 0);

  for (const d of plan.doors) {
    const el = document.createElement('div');
    const api = { act: (i) => run.act(i) };
    VIEWS[d.id](d.state, el, api);
    const steps = MODULES[d.id].solve(d.state, plan.ctx);

    if (d.id === 'switch') {
      el.setCountdown(steps[0] % 100);
      el.querySelector(`button[data-sw="${Math.floor(steps[0] / 100)}"]`).click();
    } else if (d.id === 'dial') {
      for (const val of steps) {
        el.setDial(val);
        el.querySelector('.btn-dial-set').click();
      }
    } else {
      for (const s of steps) {
        const b = el.querySelector(`button[data-i="${s}"]`);
        b?.click();
      }
    }
  }

  if (run.over !== 'win' || run.strikes !== 0) {
    bad(`${code}: run not won via views (over=${run.over}, strikes=${run.strikes})`);
  }
  n++;
}
console.log(`part 1: ${n} sampled codes, all 5 views clicked through the DOM`);

// ---------- Part 1b: Execution Switch timing (right switch wrong time, wrong switch right time, edges)
{
  const SW = MODULES.switch;
  let m = 0;
  for (const code of sampled) {
    const plan = buildPlan(code);
    const d = plan.doors.find((x) => x.id === 'switch');
    const sol = SW.trace(d.state, plan.ctx);
    const tryFlip = (swIdx, setup) => {
      const run = new Run(plan, CONFIG, 0);
      run.door = plan.doors.findIndex((x) => x.id === 'switch');
      run.steps = SW.solve(d.state, plan.ctx);
      const el = document.createElement('div');
      VIEWS.switch(d.state, el, { act: (a) => run.act(a) });
      setup(el);
      el.querySelector(`button[data-sw="${swIdx}"]`).click();
      return run;
    };
    const wrongSw = (sol.sw + 1) % 6;
    const r1 = tryFlip(sol.sw, (el) => el.setCountdown(sol.target + 1)); // one second too early
    const r2 = tryFlip(sol.sw, (el) => el.setCountdown(sol.target - 1)); // one second too late
    const r3 = tryFlip(wrongSw, (el) => el.setCountdown(sol.target));     // right time, wrong switch
    const r4 = tryFlip(sol.sw, (el) => el.setCountdown(sol.target));      // correct
    if (r1.strikes !== 1 || r2.strikes !== 1 || r3.strikes !== 1) bad(`${code}: switch strikes ${r1.strikes}/${r2.strikes}/${r3.strikes}`);
    if (r4.strikes !== 0 || r4.door !== plan.doors.findIndex((x) => x.id === 'switch') + 1 && r4.over !== 'win') bad(`${code}: correct switch flip not accepted`);
    m++;
  }
  console.log(`part 1b: ${m} codes, switch timing (early/late/wrong switch/correct) behaves`);
}

// ---------- Part 2: shell flows (fixed case K7-3-RED via URL)
await import('../src/ui/shell.js').then((m) => m.startShell($('#app')));
const text = () => $('#app').textContent;
const frame = async (ms = 60) => { await sleep(ms); };

const planNow = buildPlan('K7-3-RED');
const clickDoor = (idx) => {
  const d = planNow.doors[idx];
  const steps = MODULES[d.id].solve(d.state, planNow.ctx);
  const el = $('.lock');
  if (d.id === 'switch') {
    el.setCountdown?.(steps[0] % 100);
    el.querySelector(`button[data-sw="${Math.floor(steps[0] / 100)}"]`)?.click();
  } else if (d.id === 'dial') {
    for (const val of steps) {
      el.setDial?.(val);
      el.querySelector('.btn-dial-set')?.click();
    }
  } else {
    for (const s of steps) {
      $(`button[data-i="${s}"]`)?.click();
    }
  }
};

// Check start screen UI
if (!/WARNING/.test(text()) || !/jump scares/.test(text())) bad('start screen lacks warning');
if (!$('#gentle') || !$('#snd')) bad('start screen lacks gentle mode / sound-off toggles');
if (!$('#start-theme')) bad('start screen lacks theme toggle button');

// Theme toggle test on start screen
$('#start-theme').click();
if (document.documentElement.getAttribute('data-theme') !== 'light') bad('theme did not switch to light on start screen');
$('#start-theme').click();
if (document.documentElement.getAttribute('data-theme') !== 'dark') bad('theme did not switch to dark on start screen');

// Start play
$('#go').click();
await frame();

if (!$('.hud') || !/K/.test($('.case').textContent) || !/RED/.test($('.case').textContent)) bad('play screen / case code missing');
if ($('.plate').textContent !== MODULES[planNow.doors[0].id].plate) bad('door 1 plate mismatch');
if ($('.clock').textContent !== '4:00') bad('clock should start 4:00, got ' + $('.clock').textContent);
if ($('.door').textContent !== 'DOOR 1/5') bad('door counter should be DOOR 1/5, got ' + $('.door').textContent);
if (!audioCalls.connect || !audioCalls.start) bad('audio engine did not start');

// Strike test on Door 0: wrong tap costs 15s penalty
const door0 = planNow.doors[0];
const good0 = MODULES[door0.id].solve(door0.state, planNow.ctx);
if (door0.id === 'switch') {
  $('.lock').setCountdown?.(good0[0] % 100);
  $(`button[data-sw="${(Math.floor(good0[0] / 100) + 1) % 6}"]`).click(); // right moment, wrong switch
} else if (door0.id === 'dial') {
  const badDial = (good0[0] + 5) % 40;
  $('.lock').setDial?.(badDial);
  $('.btn-dial-set').click();
} else {
  const wrong = [...document.querySelectorAll('button[data-i]')].find((b) => +b.dataset.i !== good0[0]);
  wrong?.click();
}

T += 100;
await frame();
if ($('.clock').textContent !== '3:45') bad('strike should cost 15s, clock=' + $('.clock').textContent);
if (!vib.length) bad('no vibration on strike');
if ($('.strikes .on') === null) bad('strike pip not lit');

// Pause on hidden tab: time must not drain
const beforeClock = $('.clock').textContent;
Object.defineProperty(document, 'hidden', { value: true, configurable: true });
document.dispatchEvent(new w.Event('visibilitychange'));
if (!$('.pause')) bad('no pause overlay when hidden');
T += 90000;
await frame();
Object.defineProperty(document, 'hidden', { value: false, configurable: true });
document.dispatchEvent(new w.Event('visibilitychange'));
$('.pause').click();
T += 1000;
await frame();
const afterClock = $('.clock').textContent;
if (beforeClock !== '3:45' || afterClock !== '3:44') bad(`pause drained clock: ${beforeClock} -> ${afterClock}`);

// Mid-run theme toggle: does not alter timer or strikes
$('#hud-theme').click();
if (document.documentElement.getAttribute('data-theme') !== 'light') bad('HUD theme button did not switch to light');
if ($('.clock').textContent !== '3:44') bad('HUD theme toggle altered the clock');
$('#hud-theme').click();
if (document.documentElement.getAttribute('data-theme') !== 'dark') bad('HUD theme button did not switch back to dark');

// Solve all 5 doors to win
clickDoor(0); await sleep(800);
clickDoor(1); await sleep(800);
clickDoor(2); await sleep(800);
clickDoor(3); await sleep(800);
clickDoor(4); await frame();

if (!/ESCAPED/.test(text()) || !$('.big-time')) bad('no win screen after clearing 5 doors');
const winTime = $('.big-time').textContent;
if (winTime !== '3:44') bad('win time unexpected: ' + winTime);
if (!/strikes 1/.test($('.dbg')?.textContent || '')) bad('?stats line missing on end screen');
console.log('win screen:', winTime, '|', $('.dbg').textContent.replace(/\n/g, ' / '));

// Retry -> 3 strikes -> caught
$('#again').click();
await frame();
if ($('.clock').textContent !== '4:00') bad('retry did not reset clock to 4:00');
for (let i = 0; i < 3; i++) {
  const g = MODULES[planNow.doors[0].id].solve(planNow.doors[0].state, planNow.ctx)[0];
  if (planNow.doors[0].id === 'switch') {
    $('.lock').setCountdown?.(g % 100);
    $(`button[data-sw="${(Math.floor(g / 100) + 1) % 6}"]:not(.flipped)`)?.click();
  } else if (planNow.doors[0].id === 'dial') {
    $('.lock').setDial?.((g + 7) % 40);
    $('.btn-dial-set')?.click();
  } else {
    [...document.querySelectorAll('button[data-i]')].find((b) => +b.dataset.i !== g && !b.classList.contains('bad'))?.click();
  }
  T += 50;
  await frame(20);
}
if (!/HE FOUND YOU/.test(text()) || !/Too much noise/.test(text())) bad('no caught screen after 3 strikes');

// Retry -> timeout
$('#again').click();
await frame();
T += 241000;
await frame(80);
if (!/HE FOUND YOU/.test(text()) || !/Time ran out/.test(text())) bad('no caught screen on timeout');

// Landscape orientation holds the clock
$('#again').click();
await frame();
const clkA = $('.clock').textContent;
landscape = true;
rotListener();
T += 8000;
await frame();
if (!/ROTATE/.test($('.pause')?.textContent || '')) bad('no rotate overlay in landscape');
landscape = false;
rotListener();
T += 100;
await frame();
if ($('.pause')) bad('rotate overlay stuck after returning upright');
if ($('.clock').textContent !== clkA) bad(`landscape drained clock: ${clkA} -> ${$('.clock').textContent}`);

// Flash limiter unit tests
resetFlashLimiter();
setGentleMode(false);
let executedFlashes = 0;
const flashAction = () => { executedFlashes++; };
if (!canFlash(1000)) bad('flash limiter should allow 1st flash');
requestFlash(flashAction, 1000);
requestFlash(flashAction, 1200);
requestFlash(flashAction, 1400);
if (executedFlashes !== 3) bad(`expected 3 flashes, got ${executedFlashes}`);
if (canFlash(1500)) bad('flash limiter should reject 4th flash within 1 second');
if (requestFlash(flashAction, 1500)) bad('flash limiter should block 4th flash request');
if (!canFlash(2100)) bad('flash limiter should allow flash after 1 second has elapsed');
setGentleMode(true);
if (canFlash(3000)) bad('gentle mode should reject all flashes');
setGentleMode(false);

// Config presets verification
if (PRESETS.easy.timeLimitSec !== 300 || PRESETS.hard.timeLimitSec !== 200 || CONFIG.timeLimitSec !== 240) {
  bad('difficulty presets mismatch');
}

if (errs.length) {
  bad('runtime errors: ' + errs.slice(0, 5).join(' | '));
}

console.log('audio calls seen:', Object.keys(audioCalls).length, '| vibrations:', vib.length, '| errors:', errs.length);
console.log(fails ? `\nSMOKE FAILED (${fails})` : '\nSMOKE PASS');
process.exit(fails ? 1 : 0);
