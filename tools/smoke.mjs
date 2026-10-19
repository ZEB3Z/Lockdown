// npm run smoke -> drives the REAL shell/views/run/audio/visuals code in jsdom (no real browser, no real audio).
// Part 1: every view x every case code (click the solution through the DOM, expect ok.. door/win).
// Part 2: full game flows through the shell: win, strikes->caught, retry, timeout, pause/resume, vibration.
import { JSDOM, VirtualConsole } from 'jsdom';
const errs = [];
const vc = new VirtualConsole(); vc.on('jsdomError', (e) => errs.push(String(e.detail || e.message || e)));
const dom = new JSDOM('<!doctype html><div id="app"></div><div id="fx"></div>', { url: 'http://localhost/?case=K7-3-RED&stats', pretendToBeVisual: true, virtualConsole: vc });
const w = dom.window;
let T = 0; const vib = [];
const def = (k, v) => Object.defineProperty(globalThis, k, { value: v, configurable: true, writable: true });
def('window', w); def('document', w.document); def('location', w.location); def('history', w.history);
let landscape = false, rotListener = null;
def('matchMedia', (q) => /orientation/.test(q)
  ? { get matches() { return landscape; }, addEventListener(_, fn) { rotListener = fn; }, removeEventListener() { rotListener = null; } }
  : { matches: false, addEventListener() {} });
def('requestAnimationFrame', w.requestAnimationFrame.bind(w)); def('cancelAnimationFrame', w.cancelAnimationFrame.bind(w));
def('navigator', { vibrate: (p) => { vib.push(p); return true; }, wakeLock: { request: async () => ({ release() {} }) } });
def('performance', { now: () => T, getEntriesByType: () => [] });
w.addEventListener('error', (e) => errs.push(String(e.error || e.message)));
const fakeCanvas = { createImageData: (a, b) => ({ data: new Uint8ClampedArray(a * b * 4) }), putImageData() {} };
w.HTMLCanvasElement.prototype.getContext = () => fakeCanvas; w.HTMLCanvasElement.prototype.toDataURL = () => 'data:image/png;base64,AA==';
// minimal fake Web Audio: counts calls, validates we only call things that exist
const audioCalls = {};
const node = () => new Proxy(function () {}, { get: (t, k) => (k === 'then' ? undefined : (audioCalls[k] = (audioCalls[k] || 0) + 1, node())), set: () => true, apply: () => node() });
class FakeCtx { constructor() { this.currentTime = 0; this.state = 'suspended'; this.sampleRate = 8000; this.destination = {}; }
  resume() { this.state = 'running'; } suspend() { this.state = 'suspended'; }
  createBuffer() { return { getChannelData: () => new Float32Array(8000) }; }
  createGain() { return node(); } createOscillator() { return node(); } createBiquadFilter() { return node(); }
  createBufferSource() { return node(); } createDynamicsCompressor() { return node(); } }
def('AudioContext', FakeCtx); w.AudioContext = FakeCtx;

const { buildPlan } = await import('../src/core/plan.js');
const { Run } = await import('../src/core/run.js');
const { CONFIG } = await import('../src/config.js');
const { allCodes } = await import('../src/core/code.js');
const { VIEWS } = await import('../src/modules/views.js');
const { MODULES } = await import('../src/modules/index.js');
let fails = 0; const bad = (m) => { fails++; console.error('FAIL', m); };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const $ = (s) => document.querySelector(s);

// ---------- Part 1: all views x all codes
let n = 0;
for (const code of allCodes()) {
  const plan = buildPlan(code), run = new Run(plan, CONFIG, 0);
  let last = '';
  for (const d of plan.doors) {
    const el = document.createElement('div');
    const api = { act: (i) => run.act(i) };
    VIEWS[d.id](d.state, el, api);
    const btns = [...el.querySelectorAll('button[data-i]')];
    const want = { tumbler: 5, glyphs: 4, fuse: d.state.wires?.length }[d.id];
    if (btns.length !== want) bad(`${code}/${d.id}: ${btns.length} buttons, expected ${want}`);
    for (const s of MODULES[d.id].solve(d.state, plan.ctx)) {
      const b = el.querySelector(`button[data-i="${s}"]`);
      b.click(); last = b.classList.contains('done') ? last : 'x';
    }
  }
  if (run.over !== 'win' || run.strikes !== 0) bad(`${code}: run not won via views (over=${run.over}, strikes=${run.strikes})`);
  n++;
}
console.log(`part 1: ${n} codes, all 3 views clicked through the DOM`);

// ---------- Part 2: shell flows (fixed case K7-3-RED via URL)
await import('../src/ui/shell.js').then((m) => m.startShell($('#app')));
const text = () => $('#app').textContent;
import { writeFileSync, readFileSync } from 'node:fs';
const dump = (name) => { if (process.env.DUMP) writeFileSync(`/tmp/audit/screen-${name}.html`, `<!doctype html><meta charset=utf-8><style>${readFileSync('src/style.css', 'utf8')}</style><div id="app" class="${$('#app').className}">${$('#app').innerHTML}</div>`); };
const frame = async (ms = 60) => { await sleep(ms); };
const solveDoor = async () => {
  const dbg = $('.dbg').textContent.match(/ANSWER.*?:\s*(.*)/); // only with ?debug; we use plan instead
};
const planNow = buildPlan('K7-3-RED');
const clickDoor = (idx, wrong = false) => {
  const d = planNow.doors[idx], steps = MODULES[d.id].solve(d.state, planNow.ctx);
  for (const s of steps) $(`button[data-i="${s}"]`).click();
};
const wrongBtn = () => { // a button that is NOT the next correct step
  const run = null; return [...document.querySelectorAll('button[data-i]:not(.done)')];
};
if (!/WARNING/.test(text()) || !/jump scares/.test(text())) bad('start screen lacks warning');
if (!$('#red') || !$('#snd')) bad('start screen lacks reduced-effects / sound-off toggles');
dump('start');
$('#go').click(); await frame(); dump('door1');
if (!$('.hud') || !/K/.test($('.case').textContent) || !/RED/.test($('.case').textContent)) bad('play screen / case code missing');
if ($('.plate').textContent !== MODULES[planNow.doors[0].id].plate) bad('plate mismatch');
if ($('.clock').textContent !== '3:00') bad('clock should start 3:00, got ' + $('.clock').textContent);
if (!audioCalls.connect || !audioCalls.start) bad('audio engine did not start');

// strike: wrong tap costs penalty
const door0 = planNow.doors[0], good0 = MODULES[door0.id].solve(door0.state, planNow.ctx);
const wrong = [...document.querySelectorAll('button[data-i]')].find((b) => +b.dataset.i !== good0[0]);
wrong.click(); T += 100; await frame();
if ($('.clock').textContent !== '2:45') bad('strike should cost 15s, clock=' + $('.clock').textContent);
if (!vib.length) bad('no vibration on strike');
if ($('.strikes .on') === null) bad('strike pip not lit');
// pause on background: time must not drain
const before = $('.clock').textContent;
Object.defineProperty(document, 'hidden', { value: true, configurable: true });
document.dispatchEvent(new w.Event('visibilitychange'));
if (!$('.pause')) bad('no pause overlay when hidden');
T += 90000; await frame();
Object.defineProperty(document, 'hidden', { value: false, configurable: true });
document.dispatchEvent(new w.Event('visibilitychange'));
$('.pause').click(); T += 1000; await frame();
const after = $('.clock').textContent;
if (before !== '2:45' || after !== '2:44') bad(`pause drained clock: ${before} -> ${after}`);
// finish door 0, wait transition, door 1, door 2 -> win
clickDoor(0); await sleep(800); dump('door2');
if ($('.plate').textContent !== MODULES[planNow.doors[1].id].plate) bad('door 2 plate wrong');
clickDoor(1); await sleep(800); dump('door3'); clickDoor(2); await frame(); dump('win');
if (!/ESCAPED/.test(text()) || !$('.big-time')) bad('no win screen');
const t = $('.big-time').textContent; if (t !== '2:44') bad('win time remaining unexpected: ' + t);
if (!/strikes 1/.test($('.dbg')?.textContent || '')) bad('?stats line missing on end screen');
console.log('win screen:', t, '|', $('.dbg').textContent.replace(/\n/g, ' / '));

// retry -> 3 strikes -> caught
$('#again').click(); await frame();
if ($('.clock').textContent !== '3:00') bad('retry did not reset clock');
for (let i = 0; i < 3; i++) {
  const g = MODULES[planNow.doors[0].id].solve(planNow.doors[0].state, planNow.ctx)[0];
  [...document.querySelectorAll('button[data-i]')].find((b) => +b.dataset.i !== g && !b.classList.contains('bad')).click();
  T += 50; await frame(20);
}
if (!/HE FOUND YOU/.test(text()) || !/Too much noise/.test(text())) bad('no caught screen after 3 strikes');
dump('lose');
// retry -> timeout
$('#again').click(); await frame(); T += 181000; await frame(80);
if (!/HE FOUND YOU/.test(text()) || !/Time ran out/.test(text())) bad('no caught screen on timeout');
$('#again').click(); await frame();
if (!$('.hud')) bad('second retry failed');
// proximity vibration pulses + big scare near the end
const v0 = vib.length; T += 100000; await frame(80);
if (vib.length <= v0) bad('no proximity vibration pulses at ~55% proximity');
const v1 = vib.length; T += 50000; await frame(80); // ~83% proximity
if (!document.getElementById('fx').classList.contains('lunging')) bad('no lunge scare near the end');
if (vib.length <= v1) bad('vibration did not continue');
await sleep(1200);
// landscape holds the clock, upright releases it
$('#again')?.click();
const clockA = $('.clock').textContent;
landscape = true; rotListener(); T += 8000; await frame();
if (!/ROTATE/.test($('.pause')?.textContent || '')) bad('no rotate overlay in landscape');
landscape = false; rotListener(); T += 100; await frame();
if ($('.pause')) bad('rotate overlay stuck after returning upright');
if ($('.clock').textContent !== clockA) bad(`landscape drained the clock ${clockA} -> ${$('.clock').textContent}`);
// hidden + landscape together: clock must stay held until BOTH released
Object.defineProperty(document, 'hidden', { value: true, configurable: true }); document.dispatchEvent(new w.Event('visibilitychange'));
landscape = true; rotListener(); landscape = false; rotListener();
T += 20000; await frame();
if (!$('.pause')) bad('hide overlay lost when rotation released');
Object.defineProperty(document, 'hidden', { value: false, configurable: true }); $('.pause').click(); await frame();
if ($('.clock').textContent !== clockA) bad('stacked holds drained the clock');
await sleep(100);
const { PRESETS, CONFIG: C2 } = await import('../src/config.js');
if (!(PRESETS.easy.timeLimitSec > C2.timeLimitSec && PRESETS.hard.timeLimitSec < C2.timeLimitSec) || C2.difficulty !== 'normal') bad('difficulty presets');
if (errs.length) { bad('runtime errors: ' + errs.slice(0, 5).join(' | ')); }
console.log('audio calls seen:', Object.keys(audioCalls).length, '| vibrations:', vib.length, '| errors:', errs.length);
console.log(fails ? `\nSMOKE FAILED (${fails})` : '\nSMOKE PASS');
process.exit(fails ? 1 : 0);
