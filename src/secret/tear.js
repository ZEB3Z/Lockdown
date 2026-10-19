// Interactive Tear-Down Easter Egg
// Allows the user to pull/drag down the page from the left side to tear it open and reveal The Maze,
// and vice-versa to tear back to Lockdown.
import { playTearSound, playFullPaperRip } from './audio.js';
import { openTheMaze } from './maze.js';
import { getAudioContext } from '../audio/synth.js';

let isDragging = false;
let startY = 0;
let currentDeltaY = 0;
let maxDeltaY = 0;
let dragStartTime = 0;
let overlayEl = null;
let curtainEl = null;
let lastSoundTime = 0;

/**
 * Mount the tear tab on the Lockdown home screen.
 */
export function mountTearDown(container, onComplete) {
  const old = container.querySelector('#easter-egg-tear');
  if (old) old.remove();

  const tab = document.createElement('div');
  tab.className = 'tear-corner-tab';
  tab.id = 'easter-egg-tear';
  tab.setAttribute('role', 'button');
  tab.setAttribute('aria-label', 'Torn corner');
  tab.setAttribute('title', 'Tear down to reveal...');

  tab.innerHTML = `
    <div class="tear-peek-under">
      <span class="tear-peek-text">MAZE</span>
    </div>
    <div class="tear-flap"></div>
  `;

  container.appendChild(tab);

  function createOverlay() {
    if (overlayEl) return;
    overlayEl = document.createElement('div');
    overlayEl.className = 'tear-overlay';
    curtainEl = document.createElement('div');
    curtainEl.className = 'tear-curtain';
    curtainEl.innerHTML = `
      <div style="text-align:center; transform: scale(1.1);">
        <h1 style="font-family: Arial, Impact, sans-serif; font-size: 64px; color: #000088; margin: 0; text-shadow: 2px 2px #00ffff;">The Maze<span style="font-size:24px; vertical-align:super;">TM</span></h1>
      </div>
    `;
    overlayEl.appendChild(curtainEl);
    document.body.appendChild(overlayEl);
  }

  function removeOverlay() {
    if (overlayEl) {
      overlayEl.remove();
      overlayEl = null;
      curtainEl = null;
    }
  }

  function triggerFullTear() {
    createOverlay();
    playFullPaperRip();
    try {
      navigator.vibrate?.([40, 20, 80]);
    } catch {}

    curtainEl.classList.add('tearing-anim');
    curtainEl.style.clipPath = 'polygon(0 0, 100% 0, 100% 100%, 0 100%)';

    setTimeout(() => {
      removeOverlay();
      openTheMaze(container, () => {
        if (onComplete) onComplete();
      });
    }, 450);
  }

  function onPointerDown(e) {
    const ctx = getAudioContext();
    if (ctx && ctx.state !== 'running') ctx.resume();

    isDragging = true;
    startY = e.clientY;
    currentDeltaY = 0;
    maxDeltaY = 0;
    dragStartTime = performance.now();
    lastSoundTime = performance.now();
    tab.setPointerCapture?.(e.pointerId);
    createOverlay();
    if (curtainEl) curtainEl.style.transition = 'none';
    playTearSound(0.9);
  }

  function onPointerMove(e) {
    if (!isDragging || !curtainEl) return;
    currentDeltaY = Math.max(0, e.clientY - startY);
    maxDeltaY = Math.max(maxDeltaY, currentDeltaY);

    const now = performance.now();
    if (currentDeltaY > 10 && now - lastSoundTime > 90) {
      playTearSound(Math.min(1.0, currentDeltaY / 120));
      lastSoundTime = now;
    }

    const h = window.innerHeight || 800;
    const progress = Math.min(1, currentDeltaY / 160);
    const tearY = progress * h;
    const tearX = Math.min(100, progress * 100);

    curtainEl.style.clipPath = `polygon(0 0, ${tearX}% 0, ${tearX * 0.9}% ${tearY * 0.4}px, 0 ${tearY}px)`;
  }

  function onPointerUp(e) {
    if (!isDragging) return;
    isDragging = false;
    tab.releasePointerCapture?.(e.pointerId);

    const elapsed = performance.now() - dragStartTime;
    const didDrag = maxDeltaY >= 15;

    // If dragged: user MUST pull down past commit threshold (>= 70px) to tear.
    // If user dragged and put it back (currentDeltaY < 70px), cancel and do NOT tear!
    // If user just tapped/clicked quickly without dragging (< 350ms, maxDeltaY < 15px), allow tap to tear.
    const shouldTear = didDrag ? (currentDeltaY >= 70) : (elapsed < 350 && currentDeltaY < 15);

    if (shouldTear) {
      triggerFullTear();
    } else {
      if (curtainEl) {
        curtainEl.style.transition = 'clip-path 0.22s ease-out';
        curtainEl.style.clipPath = 'polygon(0 0, 0 0, 0 0)';
        setTimeout(() => removeOverlay(), 240);
      } else {
        removeOverlay();
      }
    }
  }

  tab.addEventListener('pointerdown', onPointerDown);
  tab.addEventListener('pointermove', onPointerMove);
  tab.addEventListener('pointerup', onPointerUp);
  tab.addEventListener('pointercancel', onPointerUp);
}

/**
 * Perform the animated paper rip tear transition back to Lockdown.
 */
export function tearBackToLockdown(onDone) {
  const overlay = document.createElement('div');
  overlay.className = 'tear-overlay';
  overlay.style.zIndex = '3000000';

  const curtain = document.createElement('div');
  curtain.className = 'tear-curtain lockdown-tear';
  curtain.innerHTML = `
    <div style="text-align:center; transform: scale(1.1);">
      <h1 style="font-family: Impact, 'Arial Narrow Bold', Arial, sans-serif; font-size: clamp(48px, 12vw, 76px); color: #b3121a; text-shadow: 0 0 20px #4a0509; margin: 0; transform: rotate(-2deg); font-weight: 900;">LOCK<br>DOWN</h1>
      <p style="font-family: 'Courier New', monospace; font-size: 13px; color: #8a95a0; letter-spacing: 4px; margin: 8px 0 0 0;">BLACKTHORN MANOR</p>
    </div>
  `;
  overlay.appendChild(curtain);
  document.body.appendChild(overlay);

  playFullPaperRip();
  try {
    navigator.vibrate?.([40, 20, 80]);
  } catch {}

  // Trigger rip animation downwards
  requestAnimationFrame(() => {
    curtain.classList.add('tearing-anim');
    curtain.style.clipPath = 'polygon(0 0, 100% 0, 100% 100%, 0 100%)';
  });

  setTimeout(() => {
    if (onDone) onDone();
    setTimeout(() => overlay.remove(), 250);
  }, 450);
}

/**
 * Mount an interactive tear-down tab on The Maze screen to drag back to Lockdown.
 */
export function mountTearDownToLockdown(container, onComplete) {
  const old = container.querySelector('#maze-corner-tear');
  if (old) old.remove();

  const tab = document.createElement('div');
  tab.className = 'tear-corner-tab maze-corner-tab';
  tab.id = 'maze-corner-tear';
  tab.setAttribute('role', 'button');
  tab.setAttribute('aria-label', 'Torn corner');
  tab.setAttribute('title', 'Tear down to return to Lockdown...');

  tab.innerHTML = `
    <div class="tear-peek-under">
      <span class="tear-peek-text">MANOR</span>
    </div>
    <div class="tear-flap"></div>
  `;

  container.appendChild(tab);

  let tabDragging = false;
  let tabStartY = 0;
  let tabDeltaY = 0;
  let tabMaxDeltaY = 0;
  let tabStartTime = 0;
  let backOverlay = null;
  let backCurtain = null;
  let tabLastSound = 0;

  function createBackOverlay() {
    if (backOverlay) return;
    backOverlay = document.createElement('div');
    backOverlay.className = 'tear-overlay';
    backOverlay.style.zIndex = '3000000';
    backCurtain = document.createElement('div');
    backCurtain.className = 'tear-curtain lockdown-tear';
    backCurtain.innerHTML = `
      <div style="text-align:center; transform: scale(1.1);">
        <h1 style="font-family: Impact, Arial, sans-serif; font-size: 64px; color: #b3121a; text-shadow: 0 0 18px #4a0509; margin: 0; transform: rotate(-2deg);">LOCK<br>DOWN</h1>
      </div>
    `;
    backOverlay.appendChild(backCurtain);
    document.body.appendChild(backOverlay);
  }

  function removeBackOverlay() {
    if (backOverlay) {
      backOverlay.remove();
      backOverlay = null;
      backCurtain = null;
    }
  }

  function triggerTabFullTear() {
    createBackOverlay();
    playFullPaperRip();
    try {
      navigator.vibrate?.([40, 20, 80]);
    } catch {}

    backCurtain.classList.add('tearing-anim');
    backCurtain.style.clipPath = 'polygon(0 0, 100% 0, 100% 100%, 0 100%)';

    setTimeout(() => {
      removeBackOverlay();
      if (onComplete) onComplete();
    }, 450);
  }

  function onDown(e) {
    const ctx = getAudioContext();
    if (ctx && ctx.state !== 'running') ctx.resume();

    tabDragging = true;
    tabStartY = e.clientY;
    tabDeltaY = 0;
    tabMaxDeltaY = 0;
    tabStartTime = performance.now();
    tabLastSound = performance.now();
    tab.setPointerCapture?.(e.pointerId);
    createBackOverlay();
    if (backCurtain) backCurtain.style.transition = 'none';
    playTearSound(0.9);
  }

  function onMove(e) {
    if (!tabDragging || !backCurtain) return;
    tabDeltaY = Math.max(0, e.clientY - tabStartY);
    tabMaxDeltaY = Math.max(tabMaxDeltaY, tabDeltaY);

    const now = performance.now();
    if (tabDeltaY > 10 && now - tabLastSound > 90) {
      playTearSound(Math.min(1.0, tabDeltaY / 120));
      tabLastSound = now;
    }

    const h = window.innerHeight || 800;
    const progress = Math.min(1, tabDeltaY / 160);
    const tearY = progress * h;
    const tearX = Math.min(100, progress * 100);

    backCurtain.style.clipPath = `polygon(0 0, ${tearX}% 0, ${tearX * 0.9}% ${tearY * 0.4}px, 0 ${tearY}px)`;
  }

  function onUp(e) {
    if (!tabDragging) return;
    tabDragging = false;
    tab.releasePointerCapture?.(e.pointerId);

    const elapsed = performance.now() - tabStartTime;
    const didDrag = tabMaxDeltaY >= 15;
    const shouldTear = didDrag ? (tabDeltaY >= 70) : (elapsed < 350 && tabDeltaY < 15);

    if (shouldTear) {
      triggerTabFullTear();
    } else {
      if (backCurtain) {
        backCurtain.style.transition = 'clip-path 0.22s ease-out';
        backCurtain.style.clipPath = 'polygon(0 0, 0 0, 0 0)';
        setTimeout(() => removeBackOverlay(), 240);
      } else {
        removeBackOverlay();
      }
    }
  }

  tab.addEventListener('pointerdown', onDown);
  tab.addEventListener('pointermove', onMove);
  tab.addEventListener('pointerup', onUp);
  tab.addEventListener('pointercancel', onUp);
}
