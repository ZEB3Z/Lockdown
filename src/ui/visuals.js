// Atmosphere overlay (#fx) and Scare Catalogue.
// Safety: all flashes pass through flash-limiter.js (max 3/sec, none in gentle mode).
// All visual layers: pointer-events: none; gameplay text and controls are never blocked.
import { requestFlash, isGentleMode, setGentleMode as setLimiterGentle } from './flash-limiter.js';

// Original killer design: a stooped figure in a torn hood, a stitched-grin sack mask, a long blade. Drawn in code, no image files.
const KILLER = (mask) => `
  <svg viewBox="0 0 100 200" preserveAspectRatio="xMidYMax meet">
    <defs>
      <radialGradient id="kg${mask ? 'm' : 's'}" cx="50%" cy="38%" r="60%"><stop offset="0" stop-color="#e9e2cf"/><stop offset=".7" stop-color="#a99f86"/><stop offset="1" stop-color="#4a4334"/></radialGradient>
    </defs>
    <path d="M10 200L16 108Q22 78 40 70L60 70Q80 78 86 108L92 200z" fill="#020202" stroke="rgba(223,233,242,.22)" stroke-width="1.2"/>
    <path d="M30 70Q50 58 70 70L66 84Q50 76 34 84z" fill="#050505"/>
    <path d="M82 96L90 60L93 22L96 60L94 100z" fill="#c9d0d4" stroke="#000" stroke-width=".6"/>
    <path d="M93 22L96 60L94 100L92 100z" fill="#7b0b10" opacity=".8"/>
    <path d="M80 98Q86 110 92 100L96 100Q92 118 82 114z" fill="#050505"/>
    <path d="M34 36Q34 14 50 14Q66 14 66 36L68 56Q50 48 32 56z" fill="#030303" stroke="rgba(223,233,242,.2)" stroke-width="1"/>
    ${mask ? `
    <path d="M38 24Q50 16 62 24Q66 44 58 58Q50 62 42 58Q34 44 38 24z" fill="url(#kg${mask ? 'm' : 's'})" stroke="#1a160e" stroke-width=".8"/>
    <path d="M47 18L45 30L49 38M58 26L55 34M41 40L46 44" stroke="#2a2418" stroke-width=".6" fill="none"/>
    <ellipse cx="44.5" cy="33" rx="4.2" ry="5.2" fill="#000" transform="rotate(-14 44.5 33)"/>
    <ellipse cx="56" cy="33" rx="3.6" ry="4.6" fill="#000" transform="rotate(12 56 33)"/>
    <circle cx="44.5" cy="34" r="1.2" fill="#e01820"/><circle cx="56" cy="34" r="1.2" fill="#e01820"/>
    <path d="M42 50Q50 54 59 49" stroke="#120d06" stroke-width="1.6" fill="none"/>
    <path d="M43 48.5L43.6 51.5M45.5 50L46 53M48.5 51L48.8 54M51.5 51.2L51.6 54M54.5 50.6L54.4 53.6M57 49.6L56.6 52.4" stroke="#120d06" stroke-width=".8"/>
    <path d="M52 46Q52 58 50 70" stroke="#7b0b10" stroke-width="1.3" fill="none" opacity=".8"/>` : `
    <circle cx="44" cy="38" r="1.8" fill="#e01820"/><circle cx="56" cy="38" r="1.8" fill="#e01820"/>
    <circle cx="44" cy="38" r="4" fill="#e01820" opacity=".18"/><circle cx="56" cy="38" r="4" fill="#e01820" opacity=".18"/>`}
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

// One blood splatter per strike, drawn at the screen edges so gameplay stays readable.
const SPLAT = `
  <svg class="splat" viewBox="0 0 100 160" preserveAspectRatio="none" fill="#7a0a10">
    <g><circle cx="97" cy="66" r="4.6"/><circle cx="91" cy="60" r="1.6"/><circle cx="98" cy="80" r="1.4"/><path d="M95 70L97 100L99 70z"/><path d="M93 64L93.7 80L94.4 64z"/></g>
    <g><circle cx="2" cy="112" r="5"/><circle cx="8" cy="106" r="1.7"/><circle cx="1" cy="126" r="1.5"/><path d="M0 116L2 146L4 116z"/><path d="M6 110L6.8 128L7.6 110z"/></g>
    <g><circle cx="46" cy="158" r="6"/><circle cx="34" cy="156" r="2"/><circle cx="58" cy="155" r="1.8"/><path d="M43 152L46 134L49 152z"/><path d="M56 154L57 142L58 154z"/></g>
  </svg>`;

const GLASS_CRACKS = `
  <svg class="glass-cracks" viewBox="0 0 300 300" preserveAspectRatio="none">
    <path d="M150,150 L120,80 L90,40 M150,150 L210,90 L260,60 M150,150 L190,210 L240,270 M150,150 L100,220 L60,260 M150,150 L70,160 L20,170 M150,150 L230,140 L280,135" stroke="rgba(255,255,255,0.7)" stroke-width="1.5" fill="none"/>
    <path d="M120,80 L104,84 M210,90 L216,72 M190,210 L174,214 M100,220 L112,236 M70,160 L74,146 M230,140 L240,154" stroke="rgba(255,255,255,0.5)" stroke-width="1" fill="none"/>
    <circle cx="150" cy="150" r="18" fill="none" stroke="rgba(255,255,255,0.85)" stroke-width="2"/>
    <circle cx="150" cy="150" r="32" fill="none" stroke="rgba(255,255,255,0.4)" stroke-width="1" stroke-dasharray="4 3"/>
    <g fill="#7a0a10" opacity=".85"><circle cx="150" cy="150" r="9"/><path d="M146 156L150 200L154 156z"/><circle cx="168" cy="140" r="3"/></g>
  </svg>`;

// A pale, gaunt face pressed to the glass with a stitched grin and a smeared hand.
const FACE_IN_GLASS = `
  <svg class="face-glass-svg" viewBox="0 0 200 260">
    <defs><radialGradient id="fgl" cx="50%" cy="40%" r="62%"><stop offset="0" stop-color="#d9d4c3"/><stop offset=".65" stop-color="#8e8873"/><stop offset="1" stop-color="#2a2620"/></radialGradient></defs>
    <path d="M52 120Q46 40 100 34Q154 40 148 120Q146 178 100 206Q54 178 52 120z" fill="url(#fgl)" stroke="#000" stroke-width="2"/>
    <path d="M56 98Q100 70 144 98" stroke="#1b1810" stroke-width="3" fill="none" opacity=".5"/>
    <ellipse cx="78" cy="108" rx="15" ry="19" fill="#000" transform="rotate(-10 78 108)"/>
    <ellipse cx="124" cy="108" rx="13" ry="17" fill="#000" transform="rotate(10 124 108)"/>
    <circle cx="78" cy="110" r="3" fill="#e01820"/><circle cx="124" cy="110" r="3" fill="#e01820"/>
    <path d="M92 130L96 150Q100 154 104 150L108 130" stroke="#2a2620" stroke-width="2.4" fill="none"/>
    <path d="M70 168Q100 196 132 166" stroke="#0a0804" stroke-width="5" fill="none"/>
    <path d="M76 168L77 182M84 173L85 188M92 177L92.6 192M100 178L100.4 193M108 177L108 192M116 173L115.6 188M124 168L123 182" stroke="#0a0804" stroke-width="2"/>
    <path d="M88 202Q86 236 90 258M104 204Q106 232 102 256" stroke="#7a0a10" stroke-width="3" fill="none" opacity=".85"/>
    <path d="M10 200Q30 150 52 150L56 214Q30 230 10 230z" fill="#9c957e" opacity=".5"/>
    <path d="M18 170L20 150M28 164L30 142M38 162L40 140M48 164L50 144" stroke="#9c957e" stroke-width="6" stroke-linecap="round" opacity=".55"/>
    <ellipse cx="100" cy="125" rx="62" ry="86" fill="none" stroke="rgba(255,255,255,0.25)" stroke-width="3"/>
  </svg>`;

// Full-bleed face for the HE FOUND YOU screen.
const FACE_END = `
  <svg class="end-face" viewBox="0 0 200 260" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
    <defs><radialGradient id="fge" cx="50%" cy="40%" r="62%"><stop offset="0" stop-color="#cfc9b6"/><stop offset=".65" stop-color="#7d7763"/><stop offset="1" stop-color="#14110c"/></radialGradient></defs>
    <path d="M40 120Q32 24 100 16Q168 24 160 120Q158 190 100 226Q42 190 40 120z" fill="url(#fge)"/>
    <ellipse cx="72" cy="104" rx="19" ry="24" fill="#000" transform="rotate(-10 72 104)"/>
    <ellipse cx="130" cy="104" rx="17" ry="22" fill="#000" transform="rotate(10 130 104)"/>
    <circle cx="72" cy="107" r="4" fill="#e01820"/><circle cx="130" cy="107" r="4" fill="#e01820"/>
    <path d="M62 170Q100 206 140 168" stroke="#050403" stroke-width="7" fill="none"/>
    <path d="M68 170L69 188M78 177L79 196M88 182L88.6 202M100 184L100.4 204M112 182L112 202M122 177L121.6 196M132 170L131 188" stroke="#050403" stroke-width="2.6"/>
    <path d="M84 214Q80 250 86 260M106 216Q110 246 104 260" stroke="#7a0a10" stroke-width="4" fill="none"/>
  </svg>`;

export const faceSvg = () => FACE_END;

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
    <div class="vhs"><i class="scan"></i><i class="track"></i><i class="bars"></i><i class="bars b2"></i></div>
    <div class="rec"><i></i><span>REC</span><span class="tc">00:00:00</span></div>
    <div class="killer">${KILLER(false)}</div>
    <div class="lunge">${FACE_END}</div>
    ${SCRATCH}
    ${SPLAT}
    <div class="redwash"></div>
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

  startTimecode();
  flicker();
}

// Found-footage camcorder timecode, bottom corner. Counts real seconds since the page loaded.
let tcTimer = null;
function startTimecode() {
  clearInterval(tcTimer);
  const el = root?.querySelector('.tc');
  if (!el || typeof setInterval === 'undefined') return;
  const t0 = Date.now();
  const pad = (n) => String(n).padStart(2, '0');
  const tick = () => {
    const s = Math.floor((Date.now() - t0) / 1000);
    el.textContent = `${pad(Math.floor(s / 3600))}:${pad(Math.floor(s / 60) % 60)}:${pad(s % 60)}`;
  };
  tcTimer = setInterval(tick, 1000);
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
  document.documentElement.style.setProperty('--vig', (36 - p * 0.08).toFixed(0) + '%');

  // Blood drips appear above 70% proximity
  const bloodEl = root.querySelector('.blood-drip');
  if (bloodEl) {
    bloodEl.style.opacity = p > 70 ? String(Math.min(1, (p - 70) / 25)) : '0';
  }
}

export function strike(n) {
  root?.querySelectorAll('.scr g')[n - 1]?.classList.add('on');
  root?.querySelectorAll('.splat g')[n - 1]?.classList.add('on');
  glitchBurst();
}

// Short VHS tracking tear: torn bars plus a jittering screen. Counts as a flash, so it obeys the limiter and gentle mode.
export function glitchBurst() {
  if (!root || reduced) return;
  requestFlash(() => {
    root.classList.add('glitching');
    const app = document.getElementById('app');
    app?.classList.add('jit');
    setTimeout(() => {
      root?.classList.remove('glitching');
      app?.classList.remove('jit');
    }, 240);
  });
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
  glitchBurst();
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
  root?.querySelectorAll('.scr g, .splat g').forEach((g) => g.classList.remove('on'));
  root?.classList.remove('lunging', 'dipping', 'glitching');
  root?.querySelectorAll('.active').forEach((el) => el.classList.remove('active'));
  setLevel(0);
  if (!reduced) flicker();
}
