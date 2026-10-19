import { START, CYCLE_MS, valueAt, msForValue } from './logic.js';

/**
 * EXECUTION SWITCH view. Builds a lever panel plus a looping countdown.
 * A flip sends api.act({ sw, t }) where t = ms of active play since this lock appeared.
 * api.clock() is the run's active-time clock (frozen while paused). api.sfx(name) plays a sound.
 */
export function render(state, el, api) {
  const clock = api.clock ? () => api.clock() : () => (typeof performance !== 'undefined' ? performance.now() : 0);
  const base = clock();
  let forced = null; // test hook: pretend the flip happened while the countdown showed a given number
  let lastValue = null;
  const token = Symbol('switch');
  el._swToken = token;

  el.innerHTML = `
    <div class="swpanel">
      <div class="sw-display">
        <small>COUNTDOWN</small>
        <b class="sw-num">${START}</b>
        <div class="sw-bar"><i></i></div>
      </div>
      <div class="sw-rack">
        ${state.letters.map((L, i) => `
          <button type="button" class="sw" data-sw="${i}" aria-label="Switch ${i + 1}, letter ${L}">
            <span class="sw-tag">${L}</span>
            <span class="sw-slot"><i class="sw-lever"></i></span>
            <s>${i + 1}</s>
          </button>`).join('')}
      </div>
      <p class="sw-note">ONE FLIP. THE COUNTDOWN DOES NOT WAIT.</p>
    </div>`;

  const num = el.querySelector('.sw-num');
  const bar = el.querySelector('.sw-bar i');
  const display = el.querySelector('.sw-display');

  function update() {
    const t = clock() - base;
    const v = valueAt(t);
    const frac = (((t % CYCLE_MS) + CYCLE_MS) % 1000) / 1000;
    bar.style.transform = `scaleX(${(1 - frac).toFixed(3)})`;
    if (v !== lastValue) {
      num.textContent = v;
      display.classList.toggle('low', v <= 3);
      api.sfx?.(v <= 3 ? 'switchTickLow' : 'switchTick');
      lastValue = v;
    }
  }

  function loop() {
    if (el._swToken !== token || !el.isConnected) return;
    update();
    requestAnimationFrame(loop);
  }
  update();
  if (typeof requestAnimationFrame === 'function') requestAnimationFrame(loop);

  el.onclick = (e) => {
    const b = e.target.closest('button[data-sw]');
    if (!b || b.classList.contains('done') || b.classList.contains('flipped')) return;
    const sw = +b.dataset.sw;
    const t = forced ?? (clock() - base);
    forced = null;
    b.classList.add('flipped');
    api.sfx?.('switchClunk');
    const r = api.act({ sw, t });
    if (r === 'strike') {
      b.classList.add('bad');
      display.classList.add('fault');
      setTimeout(() => {
        b.classList.remove('flipped', 'bad');
        display.classList.remove('fault');
      }, 650);
    } else if (r === 'ignored') {
      b.classList.remove('flipped');
    } else {
      b.classList.add('done');
    }
  };

  // Helper for automated tests
  el.setCountdown = (v) => { forced = msForValue(v); };
}
