import { CONFIG } from '../config.js';
import { randomCode, parseCode } from '../core/code.js';
import { buildPlan } from '../core/plan.js';
import { Run } from '../core/run.js';
import { MODULES } from '../modules/index.js';
import { VIEWS } from '../modules/views.js';
import * as audio from '../audio/engine.js';
import * as V from './visuals.js';
import * as H from './haptics.js';
import * as director from '../scare/director.js';

// Studio credit used across the game, manual, docs and answer key.
export const STUDIO = "D'SAITECH";

// The logo file lives at src/assets/logo.png (placeholder until replaced). main.js resolves its
// built URL and hands it over here, so this module stays importable from Node (validator, smoke test).
let LOGO = '';
export const setLogo = (url) => { LOGO = url || ''; };
const logoImg = (cls = '') => `<img class="logo ${cls}" data-logo src="${LOGO}" alt="${STUDIO} logo" draggable="false">`;
const brandFooter = () => `<footer class="brand">${logoImg('sm')}<span>A game by <b>${STUDIO}</b></span></footer>`;

const qs = typeof location !== 'undefined' ? new URLSearchParams(location.search) : new URLSearchParams();
const FIXED = parseCode(qs.get('case') || '')?.code || null;
const DEBUG = qs.has('debug');
const STATS = DEBUG || qs.has('stats');

const getInitialTheme = () => {
  const fromUrl = qs.get('theme');
  if (fromUrl === 'light' || fromUrl === 'dark') return fromUrl;
  try {
    const stored = localStorage.getItem('lockdown_theme');
    if (stored === 'light' || stored === 'dark') return stored;
  } catch {}
  return 'dark';
};

let currentTheme = getInitialTheme();

export function applyTheme(theme) {
  currentTheme = theme;
  if (typeof document !== 'undefined') {
    document.documentElement.setAttribute('data-theme', theme);
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) {
      meta.setAttribute('content', theme === 'light' ? '#332d18' : '#050505');
    }
  }
  try {
    localStorage.setItem('lockdown_theme', theme);
  } catch {}
}

const fx = {
  reduced: (typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches) || qs.get('gentle') === '1',
};

let wake = null;
let muted = false;

const lockScreen = async () => {
  try {
    wake = await navigator.wakeLock?.request('screen');
  } catch {}
};

const buzz = (p) => {
  try {
    navigator.vibrate?.(p);
  } catch {}
};

const mmss = (s) => {
  s = Math.ceil(s);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
};

export function startShell(app) {
  applyTheme(currentTheme);
  V.init();
  showMenu(app);
}

// Leaves whatever screen is up and returns to the main menu with a clean slate.
function resetAtmosphere() {
  V.reset();
  V.setLevel(0);
}

function showMenu(app) {
  applyTheme(currentTheme);
  app.className = '';
  app.innerHTML = `
    <section class="screen start menu">
      <h1>LOCK<br>DOWN</h1>
      <p class="tagline">BLACKTHORN MANOR</p>
      <p class="warn"><b>WARNING</b> This game contains jump scares, sudden loud sounds, and flickering light.</p>
      <label class="opt"><input type="checkbox" id="gentle" ${fx.reduced ? 'checked' : ''}> GENTLE MODE (no strobes, no full blackouts, softer audio)</label>
      <label class="opt"><input type="checkbox" id="snd" ${muted ? 'checked' : ''}> Sound off (staff testing)</label>
      <div class="theme-row">
        <button type="button" class="theme-btn" id="start-theme">${currentTheme === 'light' ? 'LIGHTS ON' : 'LIGHTS OUT'}</button>
      </div>
      <div class="menu-btns">
        <button class="big" id="go">ENTER THE HOUSE</button>
        <a class="big alt" id="manual" href="/manual/">THE MANUAL</a>
        <button type="button" class="link-btn" id="credits">CREDITS</button>
      </div>
      ${brandFooter()}
    </section>
  `;

  const themeBtn = app.querySelector('#start-theme');
  themeBtn.onclick = () => {
    const next = currentTheme === 'light' ? 'dark' : 'light';
    applyTheme(next);
    themeBtn.textContent = next === 'light' ? 'LIGHTS ON' : 'LIGHTS OUT';
  };

  app.querySelector('#credits').onclick = () => showCredits(app);

  app.querySelector('#go').onclick = () => {
    fx.reduced = app.querySelector('#gentle').checked;
    muted = app.querySelector('#snd').checked;
    audio.setMuted(muted);
    audio.setReduced(fx.reduced);
    V.setReduced(fx.reduced);
    director.setGentleMode(fx.reduced);
    audio.unlock();
    play(app);
  };
}

function showCredits(app) {
  app.innerHTML = `
    <section class="screen start credits">
      ${logoImg('lg')}
      <h2 class="thanks-title">THANK YOU FOR PLAYING</h2>
      <p class="tagline">LOCKDOWN · BLACKTHORN MANOR</p>
      <dl class="credit-list">
        <div><dt>A game by</dt><dd>${STUDIO}</dd></div>
        <div><dt>Game design, code, sound and scares</dt><dd>${STUDIO}</dd></div>
        <div><dt>Puzzle rules and Handler's manual</dt><dd>${STUDIO}</dd></div>
        <div><dt>Built with</dt><dd>Vite · vanilla JavaScript · Web Audio</dd></div>
      </dl>
      <p class="warn">No servers. No accounts. Every sound you heard was synthesized live in your browser.</p>
      <button class="big" id="back">BACK TO MAIN MENU</button>
      <p class="copy">© ${STUDIO}. All rights reserved.</p>
    </section>
  `;
  app.querySelector('#back').onclick = () => showMenu(app);
}

function play(app) {
  const plan = buildPlan(FIXED || randomCode());
  const run = new Run(plan, CONFIG, performance.now());
  const c = plan.ctx;

  app.className = fx.reduced ? 'reduced' : '';
  app.innerHTML = `
    <section class="screen play">
      <header class="hud">
        <div class="clock"></div>
        <div class="strikes"></div>
        <div class="prox"><i></i></div>
      </header>
      <div class="case">
        ${[['LETTER', c.letter], ['SERIAL', c.serial], ['LAST', c.last], ['COLOR', c.color]]
          .map(([k, v]) => `<div><small>${k}</small><b>${v}</b></div>`).join('')}
      </div>
      <div class="plateRow">
        <span class="door"></span>
        <h2 class="plate"></h2>
        <div class="hud-controls">
          <button type="button" class="theme-btn" id="hud-theme">${currentTheme === 'light' ? 'LIGHTS ON' : 'LIGHTS OUT'}</button>
          <button type="button" class="mute">${muted ? 'UNMUTE' : 'MUTE'}</button>
          <button type="button" class="mute" id="hud-exit">MENU</button>
        </div>
      </div>
      <main class="lock"></main>
      <div class="dbg"></div>
    </section>
  `;

  const q = (s) => app.querySelector(s);
  const play_ = q('.play');

  q('.mute').onclick = (e) => {
    muted = !muted;
    audio.setMuted(muted);
    e.target.textContent = muted ? 'UNMUTE' : 'MUTE';
  };

  q('#hud-theme').onclick = (e) => {
    const next = currentTheme === 'light' ? 'dark' : 'light';
    applyTheme(next);
    e.target.textContent = next === 'light' ? 'LIGHTS ON' : 'LIGHTS OUT';
  };

  let raf;
  let timer;
  let ended = false;
  let leaveO = null;
  let last = {};

  // Adaptive quality tracking
  const frameTimes = [];
  let highFrameStreak = 0;
  let qualityDegraded = false;
  let lastFrameTime = performance.now();

  lockScreen();
  audio.startRun();
  V.reset();
  H.reset();
  director.initScareDirector(c.code, V, audio, H, fx.reduced);

  const api = {
    clock: () => run.activeMs + (run.paused || run.over ? 0 : performance.now() - run.last),
    sfx: (name) => audio.playEffect(name),
    act(i) {
      const r = run.act(i);
      handle(r);
      return r;
    },
  };

  function hud() {
    const rem = run.remaining();
    const t = mmss(rem);
    if (last.t !== t) {
      q('.clock').textContent = t;
      last.t = t;
    }

    const p = run.proximity();
    q('.prox i').style.transform = `scaleX(${p / 100})`;
    play_.dataset.danger = p > 75 ? '2' : p > 50 ? '1' : '0';

    audio.update(p, rem, run.strikes);
    V.setLevel(p);

    if (!run.paused) {
      H.update(p, performance.now());
    }

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
    if (DEBUG) {
      q('.dbg').textContent = MODULES[d.id].answerText
        ? 'ANSWER: ' + MODULES[d.id].answerText(run.steps)
        : 'ANSWER (1-based): ' + run.steps.map((s) => s + 1).join(' ');
    }
  }

  function handle(r) {
    if (r === 'strike') {
      H.pulseStrike();
      audio.strike();
      const struck = MODULES[plan.doors[run.door].id];
      if (struck.strikeEffect) audio.playEffect(struck.strikeEffect);
      director.onStrike(run.strikes);
      play_.classList.add('hit');
      setTimeout(() => play_.classList.remove('hit'), 450);
    } else if (r === 'door') {
      buzz([40, 60, 40]);
      audio.creak();
      director.onDoorTransition(run.door);
      q('.lock').classList.add('trans');
      timer = setTimeout(showDoor, 700);
    } else if (r === 'win' || r === 'caught') {
      end(r);
    }
    if (!ended) hud();
  }

  function frame() {
    if (ended) return;
    const nowMs = performance.now();
    const delta = nowMs - lastFrameTime;
    lastFrameTime = nowMs;

    // Quality guard monitoring
    frameTimes.push(delta);
    if (frameTimes.length > 60) frameTimes.shift();
    if (frameTimes.length >= 30) {
      const sorted = [...frameTimes].sort((a, b) => a - b);
      const p95 = sorted[Math.floor(sorted.length * 0.95)];
      if (p95 > 24) {
        highFrameStreak += delta;
        if (highFrameStreak > 3000 && !qualityDegraded) {
          qualityDegraded = true;
          V.setQuality(true);
        }
      } else {
        highFrameStreak = 0;
      }
    }

    run.tick(nowMs);
    hud();
    director.updateScareDirector(nowMs, run);

    if (run.over) return end(run.over);
    raf = requestAnimationFrame(frame);
  }

  // Pauses stack: tab hidden and landscape each hold the clock
  let holds = 0;
  let hideO = null;
  let rotO = null;

  const overlay = (txt) => {
    const o = document.createElement('div');
    o.className = 'pause';
    o.textContent = txt;
    app.appendChild(o);
    return o;
  };

  function hold(on) {
    holds += on ? 1 : -1;
    if (on && holds === 1) {
      run.pause(performance.now());
      audio.setPaused(true);
    } else if (!on && holds === 0) {
      run.resume(performance.now());
      audio.setPaused(false);
    }
  }

  function onVis() {
    if (document.hidden && !run.over && !hideO) {
      hold(true);
      hideO = overlay('PAUSED. TAP TO CONTINUE');
      hideO.onclick = () => {
        hideO.remove();
        hideO = null;
        hold(false);
      };
    } else if (!document.hidden) {
      lockScreen();
    }
  }

  const land = typeof matchMedia !== 'undefined' ? matchMedia('(orientation: landscape) and (max-height: 520px)') : { matches: false };

  function onRot() {
    if (run.over) return;
    if (land.matches && !rotO) {
      hold(true);
      rotO = overlay('ROTATE YOUR PHONE UPRIGHT');
    } else if (!land.matches && rotO) {
      rotO.remove();
      rotO = null;
      hold(false);
    }
  }

  function teardown() {
    ended = true;
    cancelAnimationFrame(raf);
    clearTimeout(timer);
    document.removeEventListener('visibilitychange', onVis);
    land.removeEventListener?.('change', onRot);
    try {
      wake?.release();
    } catch {}
    audio.stopRun();
    H.stop();
  }

  // Quit mid-run (confirmed by the player). The clock is held while the question is on screen.
  function askLeave() {
    if (ended || leaveO) return;
    hold(true);
    leaveO = document.createElement('div');
    leaveO.className = 'pause confirm';
    leaveO.innerHTML = `<div><p>LEAVE THE HOUSE?</p><small>This run will be lost.</small>
      <div class="confirm-btns"><button type="button" class="big" id="stay">STAY</button><button type="button" class="big alt" id="leave">MAIN MENU</button></div></div>`;
    app.appendChild(leaveO);
    leaveO.querySelector('#stay').onclick = () => {
      leaveO.remove();
      leaveO = null;
      hold(false);
    };
    leaveO.querySelector('#leave').onclick = () => {
      leaveO = null;
      teardown();
      audio.setPaused(false); // hold(true) paused the audio; do not carry that into the next run
      resetAtmosphere();
      showMenu(app);
    };
  }
  q('#hud-exit').onclick = askLeave;

  function end(kind) {
    if (ended) return;
    teardown();

    const rem = run.remaining();
    V.setLevel(kind === 'win' ? 0 : 100);

    if (kind === 'win') {
      audio.win();
    } else {
      audio.caught();
      V.scare();
    }

    buzz(kind === 'win' ? [60, 40, 60] : [500]);

    app.innerHTML = kind === 'win'
      ? `<section class="screen end win"><h1>ESCAPED</h1><div class="big-time">${mmss(rem)}</div><p>TIME REMAINING</p>
          <div class="end-btns"><button class="big" id="again">PLAY AGAIN</button><button class="big alt" id="menu">MAIN MENU</button></div>
          <p class="thanks">Thank you for playing LOCKDOWN.</p>${brandFooter()}</section>`
      : `<section class="screen end lose"><h1>HE FOUND YOU</h1><p>${run.strikes >= CONFIG.maxStrikes ? 'Too much noise.' : 'Time ran out.'}</p>
          <div class="end-btns"><button class="big" id="again">TRY AGAIN</button><button class="big alt" id="menu">MAIN MENU</button></div>
          <p class="thanks">Thank you for playing LOCKDOWN.</p>${brandFooter()}</section>`;

    if (STATS) {
      const per = run.marks.map((m, i) => `${plan.doors[i].id} ${m - (run.marks[i - 1] || 0)}s`).join(' | ');
      const qStr = qualityDegraded ? 'low (frame time fallback)' : 'normal';
      app.querySelector('.screen').insertAdjacentHTML(
        'beforeend',
        `<pre class="dbg">${plan.ctx.code} | ${kind} | strikes ${run.strikes} | left ${Math.round(rem)}s | theme ${currentTheme} | gentle ${fx.reduced ? 'yes' : 'no'} | quality ${qStr}\n${per || 'no door cleared'}</pre>`
      );
    }

    app.querySelector('#again').onclick = () => play(app);
    app.querySelector('#menu').onclick = () => {
      resetAtmosphere();
      showMenu(app);
    };
  }

  document.addEventListener('visibilitychange', onVis);
  land.addEventListener ? land.addEventListener('change', onRot) : land.addListener?.(onRot);
  onRot();

  showDoor();
  hud();
  raf = requestAnimationFrame(frame);
}
