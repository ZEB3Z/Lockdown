// Atmosphere overlay (#fx) and Scare Catalogue.
// Safety: all flashes pass through flash-limiter.js (max 3/sec, none in gentle mode).
// All visual layers: pointer-events: none; gameplay text and controls are never blocked.
import { requestFlash, isGentleMode, setGentleMode as setLimiterGentle } from './flash-limiter.js';

const KILLER = (mask) => `
  <svg viewBox="0 0 100 200" preserveAspectRatio="xMidYMax meet">
    <path d="M18 200L24 84Q50 62 76 84L82 200z" fill="#020202" stroke="rgba(223,233,242,.28)" stroke-width="1.5"/>
    <circle cx="50" cy="40" r="15" fill="#020202" stroke="rgba(223,233,242,.28)" stroke-width="1.5"/>
    ${mask ? '<ellipse cx="50" cy="40" rx="11" ry="13" fill="#d8dde0"/><rect x="42" y="34" width="6" height="3" fill="#050505"/><rect x="52" y="34" width="6" height="3" fill="#050505"/>' : '<circle cx="45" cy="38" r="1.5" fill="#b3121a"/><circle cx="55" cy="38" r="1.5" fill="#b3121a"/>'}
  </svg>`;

const SCRATCH = `
  <svg class="scr" viewBox="0 0 100 160" preserveAspectRatio="none" fill="none" stroke="#8c0f15" stroke-width="1.6" stroke-linecap="round">
    <g><path d="M6 14L34 70M12 10L40 66M18 8L44 60"/></g>
    <g fill="#8c0f15" stroke="none">
      <ellipse cx="78" cy="104" rx="9" ry="11"/>
      <ellipse cx="68" cy="90" rx="2.2" ry="7" transform="rotate(-15 68 90)"/>
      <ellipse cx="75" cy="86" rx="2.2" ry="8"/>
      <ellipse cx="82" cy="87" rx="2.2" ry="8"/>
      <ellipse cx="88" cy="92" rx="2.2" ry="7" transform="rotate(15 88 92)"/>
      <ellipse cx="66" cy="106" rx="2.4" ry="6" transform="rotate(-60 66 106)"/>
    </g>
    <g><path d="M60 120L92 150M54 124L86 154M66 116L96 144"/></g>
  </svg>`;

const GLASS_CRACKS = `
  <svg class="glass-cracks" viewBox="0 0 300 300" preserveAspectRatio="none">
    <path d="M150,150 L120,80 L90,40 M150,150 L210,90 L260,60 M150,150 L190,210 L240,270 M150,150 L100,220 L60,260 M150,150 L70,160 L20,170 M150,150 L230,140 L280,135" stroke="rgba(255,255,255,0.7)" stroke-width="1.5" fill="none"/>
    <circle cx="150" cy="150" r="18" fill="none" stroke="rgba(255,255,255,0.85)" stroke-width="2"/>
    <circle cx="150" cy="150" r="32" fill="none" stroke="rgba(255,255,255,0.4)" stroke-width="1" stroke-dasharray="4 3"/>
  </svg>`;

const FACE_IN_GLASS = `
  <svg class="face-glass-svg" viewBox="0 0 200 240">
    <ellipse cx="100" cy="110" rx="45" ry="60" fill="#080808" stroke="#3b434f" stroke-width="2"/>
    <ellipse cx="85" cy="100" rx="8" ry="12" fill="#000"/>
    <ellipse cx="115" cy="100" rx="8" ry="12" fill="#000"/>
    <circle cx="85" cy="102" r="2" fill="#b3121a"/>
    <circle cx="115" cy="102" r="2" fill="#b3121a"/>
    <path d="M85,135 Q100,150 115,135" stroke="#b3121a" stroke-width="2" fill="none"/>
    <ellipse cx="100" cy="115" rx="52" ry="68" fill="none" stroke="rgba(255,255,255,0.25)" stroke-width="3"/>
  </svg>`;

let root = null;
let reduced = false;
let flickerTimer = null;
let currentLevel = 0;
let lastBucket = -1;
let qualityLow = false;

export function init() {
  root = document.getElementById('fx');
  if (!root) return;

  // Generate procedural noise canvases for grain and eroded text
  try {
    const c = document.createElement('canvas');
    c.width = c.height = 96;
    const x = c.getContext('2d');
    const im = x.createImageData(96, 96);
    for (let i = 0; i < im.data.length; i += 4) {
      const v = Math.random() * 255;
      im.data[i] = im.data[i + 1] = im.data[i + 2] = v;
      im.data[i + 3] = 255;
    }
    x.putImageData(im, 0, 0);

    const e = document.createElement('canvas');
    e.width = e.height = 128;
    const ex = e.getContext('2d');
    const ei = ex.createImageData(128, 128);
    for (let i = 3; i < ei.data.length; i += 4) ei.data[i] = 255;
    for (let n = 0; n < 260; n++) {
      const px = (Math.random() * 126) | 0;
      const py = (Math.random() * 126) | 0;
      const w = 1 + ((Math.random() * 3) | 0);
      const h = 1 + ((Math.random() * 5) | 0);
      for (let dy = 0; dy < h; dy++) {
        for (let dx = 0; dx < w; dx++) {
          ei.data[(Math.min(127, py + dy) * 128 + Math.min(127, px + dx)) * 4 + 3] = 0;
        }
      }
    }
    ex.putImageData(ei, 0, 0);

    document.documentElement.style.setProperty('--erode', `url(${e.toDataURL()})`);
    root.style.setProperty('--grain', `url(${c.toDataURL()})`);
  } catch {}

  root.innerHTML = `
    <div class="grain"></div>
    <div class="killer">${KILLER(false)}</div>
    <div class="lunge">${KILLER(true)}</div>
    ${SCRATCH}
    <div class="dip"></div>
    <div class="glass-slam">${GLASS_CRACKS}</div>
    <div class="face-glass">${FACE_IN_GLASS}</div>
    <div class="shadow-sweep"></div>
    <div class="corner-lurker">${KILLER(false)}</div>
    <div class="blood-drip"></div>
    <div class="blackout-cone"></div>
    <div class="door-coat-fakeout">
      <div class="coat-rack"></div>
    </div>
  `;

  flicker();
}

function flicker() {
  clearTimeout(flickerTimer);
  if (reduced || !root) return;

  const gap = Math.max(800, 4200 - 3200 * (currentLevel / 100) + Math.random() * 2500);
  flickerTimer = setTimeout(() => {
    // Only flicker if flash limiter permits
    requestFlash(() => {
      root.classList.add('dipping');
      setTimeout(() => {
        root.classList.remove('dipping');
        flicker();
      }, 105);
    });
  }, gap);
}

export function setReduced(r) {
  reduced = Boolean(r);
  setLimiterGentle(reduced);
  root?.classList.toggle('reduced', reduced);
  if (reduced) {
    clearTimeout(flickerTimer);
  } else {
    flicker();
  }
}

export function setQuality(isLow) {
  qualityLow = Boolean(isLow);
  root?.classList.toggle('low-quality', qualityLow);
}

export function setLevel(p) {
  currentLevel = p;
  const b = Math.round(p / 5);
  if (b === lastBucket || !root) return;
  lastBucket = b;

  root.style.setProperty('--ko', Math.max(0, Math.min(0.88, (p - 50) / 50)).toFixed(2));
  document.documentElement.style.setProperty('--vig', (36 - p * 0.2).toFixed(0) + '%');

  // Blood drips appear above 70% proximity
  const bloodEl = root.querySelector('.blood-drip');
  if (bloodEl) {
    bloodEl.style.opacity = p > 70 ? String(Math.min(1, (p - 70) / 25)) : '0';
  }
}

export function strike(n) {
  root?.querySelectorAll('.scr g')[n - 1]?.classList.add('on');
}

export function scare() {
  if (!root || reduced) return;
  requestFlash(() => {
    root.classList.add('lunging');
    setTimeout(() => root?.classList.remove('lunging'), 1100);
  });
}

export function slamGlass() {
  if (!root || reduced) return;
  requestFlash(() => {
    const el = root.querySelector('.glass-slam');
    if (!el) return;
    el.classList.add('active');
    setTimeout(() => el.classList.remove('active'), 900);
  });
}

export function faceOnGlass() {
  if (!root || reduced) return;
  const el = root.querySelector('.face-glass');
  if (!el) return;
  el.classList.add('active');
  setTimeout(() => el.classList.remove('active'), 1200);
}

export function lightsCutout() {
  if (!root || reduced) return;
  const el = root.querySelector('.blackout-cone');
  if (!el) return;
  el.classList.add('active');
  // Maximum 1.2s blackout duration as per safety specification
  setTimeout(() => el.classList.remove('active'), 1200);
}

export function textGlitch() {
  const plateEl = document.querySelector('.plate');
  if (!plateEl) return;
  plateEl.classList.add('glitch');
  setTimeout(() => plateEl.classList.remove('glitch'), 350);
}

export function doorCoatFakeout() {
  if (!root || reduced) return;
  const el = root.querySelector('.door-coat-fakeout');
  if (!el) return;
  el.classList.add('active');
  setTimeout(() => el.classList.remove('active'), 1800);
}

export function triggerMinorEffect(type) {
  if (!root) return;
  if (type === 'shadow') {
    const el = root.querySelector('.shadow-sweep');
    if (el) {
      el.classList.add('active');
      setTimeout(() => el.classList.remove('active'), 1600);
    }
  } else if (type === 'corner_lurker') {
    const el = root.querySelector('.corner-lurker');
    if (el) {
      el.classList.add('active');
      setTimeout(() => el.classList.remove('active'), 3500);
    }
  }
}

export function reset() {
  lastBucket = -1;
  currentLevel = 0;
  clearTimeout(flickerTimer);
  root?.querySelectorAll('.scr g').forEach((g) => g.classList.remove('on'));
  root?.classList.remove('lunging', 'dipping');
  root?.querySelectorAll('.active').forEach((el) => el.classList.remove('active'));
  setLevel(0);
  if (!reduced) flicker();
}
