import { bind } from '../../ui/dom.js';

function clueSvg(clue, slotLabel) {
  let content = '';
  let labelText = '';

  switch (clue.type) {
    case 'clock': {
      const h = clue.val;
      const angle = (h % 12) * 30; // 30 deg per hour
      labelText = `CLOCK ${h}:00`;
      content = `
        <circle cx="45" cy="38" r="28" fill="#181c22" stroke="#dfe9f2" stroke-width="2"/>
        <circle cx="45" cy="38" r="2" fill="#d8b61a"/>
        <line x1="45" y1="38" x2="${45 + 16 * Math.sin(angle * Math.PI / 180)}" y2="${38 - 16 * Math.cos(angle * Math.PI / 180)}" stroke="#dfe9f2" stroke-width="2.5" stroke-linecap="round"/>
        <line x1="45" y1="38" x2="45" y2="16" stroke="#b3121a" stroke-width="1.2" stroke-linecap="round"/>
        <!-- 12 hour pips -->
        ${Array.from({ length: 12 }, (_, i) => {
          const a = i * 30 * Math.PI / 180;
          return `<circle cx="${45 + 23 * Math.sin(a)}" cy="${38 - 23 * Math.cos(a)}" r="1" fill="#8a95a0"/>`;
        }).join('')}
      `;
      break;
    }
    case 'painting': {
      const s = clue.val;
      labelText = `${s.toUpperCase()} PAINTING`;
      let icon = '';
      if (s === 'crow') {
        icon = '<path d="M36,44 Q42,28 54,32 Q62,34 66,28 Q60,38 52,42 Q48,50 36,44 Z M60,33 L67,34" fill="#dfe9f2" stroke="#dfe9f2" stroke-width="0.8"/>';
      } else if (s === 'moth') {
        icon = '<path d="M45,28 Q30,18 25,32 Q35,42 45,36 Q55,42 65,32 Q60,18 45,28 Z" fill="#dfe9f2"/><line x1="45" y1="26" x2="45" y2="44" stroke="#050505" stroke-width="1.5"/>';
      } else if (s === 'key') {
        icon = '<circle cx="37" cy="35" r="7" fill="none" stroke="#dfe9f2" stroke-width="2"/><line x1="44" y1="35" x2="58" y2="35" stroke="#dfe9f2" stroke-width="2"/><line x1="53" y1="35" x2="53" y2="40" stroke="#dfe9f2" stroke-width="2"/><line x1="57" y1="35" x2="57" y2="40" stroke="#dfe9f2" stroke-width="2"/>';
      } else if (s === 'eye') {
        icon = '<path d="M28,38 Q45,22 62,38 Q45,54 28,38 Z" fill="none" stroke="#dfe9f2" stroke-width="2"/><circle cx="45" cy="38" r="6" fill="#b3121a"/><circle cx="45" cy="38" r="2.5" fill="#050505"/>';
      } else if (s === 'house') {
        icon = '<polygon points="45,22 28,35 62,35" fill="#dfe9f2"/><rect x="33" y="35" width="24" height="18" fill="#dfe9f2"/><rect x="42" y="42" width="6" height="11" fill="#050505"/>';
      } else { // dagger
        icon = '<polygon points="45,20 42,42 45,54 48,42" fill="#dfe9f2"/><line x1="36" y1="42" x2="54" y2="42" stroke="#dfe9f2" stroke-width="2.5"/><circle cx="45" cy="56" r="2" fill="#d8b61a"/>';
      }
      content = `
        <rect x="20" y="16" width="50" height="44" rx="2" fill="#14181d" stroke="#d8b61a" stroke-width="2"/>
        <rect x="24" y="20" width="42" height="36" fill="#080a0c" stroke="#8a95a0" stroke-width="0.8"/>
        ${icon}
      `;
      break;
    }
    case 'candles': {
      const c = clue.val;
      labelText = `${c} CANDLE${c > 1 ? 'S' : ''}`;
      const spacing = 48 / (c + 1);
      const startX = 45 - 24;
      const candlesMarkup = Array.from({ length: c }, (_, i) => {
        const x = startX + (i + 1) * spacing;
        const h = 14 + ((i * 7) % 10);
        const y = 52 - h;
        return `
          <rect x="${x - 2}" y="${y}" width="4" height="${h}" fill="#e8e8e8" rx="1"/>
          <!-- flame -->
          <ellipse cx="${x}" cy="${y - 4}" rx="2" ry="4" fill="#d8b61a"/>
          <ellipse cx="${x}" cy="${y - 3}" rx="1" ry="2" fill="#b3121a"/>
        `;
      }).join('');
      content = `
        <line x1="16" y1="52" x2="74" y2="52" stroke="#dfe9f2" stroke-width="2"/>
        <rect x="38" y="52" width="14" height="6" fill="#3b434f"/>
        ${candlesMarkup}
      `;
      break;
    }
    case 'calendar': {
      const day = clue.val;
      labelText = `CALENDAR ${day}TH`;
      content = `
        <rect x="22" y="16" width="46" height="46" rx="2" fill="#f0ede1" stroke="#222" stroke-width="1.5"/>
        <rect x="22" y="16" width="46" height="12" fill="#8c0f15"/>
        <text x="45" y="25" text-anchor="middle" font-size="7" font-weight="bold" fill="#fff" font-family="monospace">OCT</text>
        <!-- grid of days -->
        <text x="45" y="44" text-anchor="middle" font-size="16" font-weight="900" fill="#111" font-family="monospace">${day}</text>
        <circle cx="45" cy="40" r="13" fill="none" stroke="#b3121a" stroke-width="2" stroke-dasharray="3 1.5"/>
      `;
      break;
    }
    case 'portrait': {
      const eyes = clue.val;
      labelText = `${eyes} SCRATCHED EYE${eyes > 1 ? 'S' : ''}`;
      content = `
        <rect x="24" y="15" width="42" height="48" rx="2" fill="#1b1c20" stroke="#8a95a0" stroke-width="1.5"/>
        <circle cx="45" cy="34" r="11" fill="#32363e"/>
        <path d="M32,54 C32,44 58,44 58,54 Z" fill="#24272e"/>
        <!-- eyes -->
        <circle cx="41" cy="33" r="2.5" fill="#dfe9f2"/>
        <circle cx="49" cy="33" r="2.5" fill="#dfe9f2"/>
        <!-- scratch marks -->
        ${Array.from({ length: eyes }, (_, i) => {
          const sx = 38 + (i * 4);
          return `<line x1="${sx - 2}" y1="28" x2="${sx + 2}" y2="38" stroke="#b3121a" stroke-width="2" stroke-linecap="round"/>
                  <line x1="${sx + 2}" y1="28" x2="${sx - 2}" y2="38" stroke="#b3121a" stroke-width="1.5" stroke-linecap="round"/>`;
        }).join('')}
      `;
      break;
    }
    case 'handprints': {
      const count = clue.val;
      labelText = `${count} HANDPRINT${count > 1 ? 'S' : ''}`;
      const handPoints = 'M-5,6 C-6,2 -4,-4 0,-4 C4,-4 6,2 5,6 L4,10 L-4,10 Z M-3,-4 L-3,-9 M-1,-4 L-1,-11 M1,-4 L1,-10 M3,-4 L3,-8';
      const spacing = 50 / (count + 1);
      const startX = 45 - 25;
      const handsMarkup = Array.from({ length: count }, (_, i) => {
        const x = startX + (i + 1) * spacing;
        const y = 35 + ((i % 2 === 0) ? -4 : 4);
        return `<g transform="translate(${x}, ${y}) scale(0.9)">
          <path d="M-4,3 Q-5,-1 -2,-1 Q1,-1 0,3 Z" fill="#8c0f15"/>
          <ellipse cx="0" cy="4" rx="4" ry="5" fill="#8c0f15"/>
          <line x1="-3" y1="2" x2="-3" y2="-4" stroke="#8c0f15" stroke-width="1.4" stroke-linecap="round"/>
          <line x1="-1" y1="1" x2="-1" y2="-6" stroke="#8c0f15" stroke-width="1.4" stroke-linecap="round"/>
          <line x1="1" y1="1" x2="1" y2="-5" stroke="#8c0f15" stroke-width="1.4" stroke-linecap="round"/>
          <line x1="3" y1="2" x2="3" y2="-3" stroke="#8c0f15" stroke-width="1.2" stroke-linecap="round"/>
        </g>`;
      }).join('');
      content = `
        <rect x="18" y="16" width="54" height="46" fill="#211a14" stroke="#3d3023" stroke-width="1"/>
        <line x1="18" y1="31" x2="72" y2="31" stroke="#14100c" stroke-width="1"/>
        <line x1="18" y1="46" x2="72" y2="46" stroke="#14100c" stroke-width="1"/>
        ${handsMarkup}
      `;
      break;
    }
  }

  return `
    <div class="clue-panel">
      <div class="clue-slot-title">${slotLabel}</div>
      <svg class="clue-svg" viewBox="0 0 90 70">${content}</svg>
      <div class="clue-caption">${labelText}</div>
    </div>
  `;
}

export function render(state, el, api) {
  let dialNumber = state.startDial;
  let currentTurn = 0; // 0, 1, 2

  const slotLabels = ['[LEFT CLUE]', '[CENTER CLUE]', '[RIGHT CLUE]'];
  const cluesMarkup = state.clues.map((c, i) => clueSvg(c, slotLabels[i])).join('');

  const TURN_DIRECTIONS = [
    'TURN 1: ↶ LEFT (CCW)',
    'TURN 2: ↷ RIGHT (CW)',
    'TURN 3: ↶ LEFT (CCW)',
  ];

  // SVG Dial Face: 40 ticks, numbers every 5 units
  const ticksMarkup = Array.from({ length: 40 }, (_, i) => {
    const angle = i * 9;
    const isMajor = i % 5 === 0;
    const r1 = isMajor ? 62 : 68;
    const r2 = 76;
    const rad = angle * Math.PI / 180;
    const x1 = 100 + r1 * Math.sin(rad);
    const y1 = 100 - r1 * Math.cos(rad);
    const x2 = 100 + r2 * Math.sin(rad);
    const y2 = 100 - r2 * Math.cos(rad);

    let textTag = '';
    if (isMajor) {
      const tr = 52;
      const tx = 100 + tr * Math.sin(rad);
      const ty = 100 - tr * Math.cos(rad);
      textTag = `<text x="${tx}" y="${ty + 3.5}" text-anchor="middle" font-size="9" font-weight="bold" fill="#dfe9f2" font-family="monospace">${i}</text>`;
    }

    return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${isMajor ? '#dfe9f2' : '#8a95a0'}" stroke-width="${isMajor ? 1.6 : 0.8}"/>${textTag}`;
  }).join('');

  el.innerHTML = `
    <div class="dial-container">
      <div class="clues-row">
        ${cluesMarkup}
      </div>

      <div class="dial-status-bar">
        <span class="turn-label">${TURN_DIRECTIONS[currentTurn]}</span>
        <span class="turn-pips">
          <i class="pip" id="pip-0"></i>
          <i class="pip" id="pip-1"></i>
          <i class="pip" id="pip-2"></i>
        </span>
      </div>

      <div class="dial-stage">
        <!-- Top index mark pointing down at selected number -->
        <div class="dial-index-marker">▼</div>

        <svg class="dial-svg" viewBox="0 0 200 200" style="transform: rotate(${-dialNumber * 9}deg)">
          <!-- Outer steel casing -->
          <circle cx="100" cy="100" r="94" fill="#12151a" stroke="#dfe9f2" stroke-width="3"/>
          <circle cx="100" cy="100" r="88" fill="#1c2129" stroke="#3b434f" stroke-width="1.5"/>
          <!-- Ticks & numbers -->
          ${ticksMarkup}
          <!-- Center dial knob -->
          <circle cx="100" cy="100" r="38" fill="#0d0f12" stroke="#dfe9f2" stroke-width="2"/>
          <circle cx="100" cy="100" r="30" fill="#242b35" stroke="#d8b61a" stroke-width="1"/>
          <circle cx="100" cy="100" r="10" fill="#12151a" stroke="#dfe9f2" stroke-width="1"/>
          <!-- Notch line at 0 -->
          <line x1="100" y1="62" x2="100" y2="70" stroke="#b3121a" stroke-width="2.5"/>
        </svg>
      </div>

      <div class="dial-readout-row">
        <span class="dial-val-display">NUMBER: <b id="dial-num">${dialNumber}</b></span>
      </div>

      <div class="dial-controls">
        <button type="button" class="nudge-btn" id="dial-sub" aria-label="Decrease dial">-1</button>
        <button type="button" class="btn-dial-set" id="dial-set" data-reusable="true" data-i="${dialNumber}">SET ${dialNumber}</button>
        <button type="button" class="nudge-btn" id="dial-add" aria-label="Increase dial">+1</button>
      </div>
    </div>
  `;

  const svg = el.querySelector('.dial-svg');
  const numDisplay = el.querySelector('#dial-num');
  const setBtn = el.querySelector('#dial-set');
  const turnLabel = el.querySelector('.turn-label');

  const updateDial = (next) => {
    dialNumber = (next + 40) % 40;
    svg.style.transform = `rotate(${-dialNumber * 9}deg)`;
    numDisplay.textContent = dialNumber;
    setBtn.dataset.i = String(dialNumber);
    setBtn.textContent = `SET ${dialNumber}`;
    try { navigator.vibrate?.(10); } catch {}
  };

  el.querySelector('#dial-sub').onclick = () => updateDial(dialNumber - 1);
  el.querySelector('#dial-add').onclick = () => updateDial(dialNumber + 1);

  // Drag interaction around dial center
  let dragging = false;
  let lastAngle = 0;

  const onPointerDown = (e) => {
    dragging = true;
    svg.setPointerCapture?.(e.pointerId);
    handlePointer(e);
  };

  const handlePointer = (e) => {
    if (!dragging) return;
    const rect = svg.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = e.clientX - cx;
    const dy = e.clientY - cy;
    // Calculate angle in degrees from top (0 deg at top)
    let deg = Math.atan2(dx, -dy) * 180 / Math.PI;
    if (deg < 0) deg += 360;
    const n = Math.round(deg / 9) % 40;
    if (n !== dialNumber) {
      updateDial(n);
    }
  };

  const onPointerUp = (e) => {
    if (dragging) {
      dragging = false;
      try { svg.releasePointerCapture?.(e.pointerId); } catch {}
    }
  };

  svg.addEventListener('pointerdown', onPointerDown);
  window.addEventListener('pointermove', handlePointer);
  window.addEventListener('pointerup', onPointerUp);

  // Intercept api.act from SET button
  const originalAct = api.act;
  const wrappedApi = {
    act(n) {
      const res = originalAct(n);
      if (res === 'ok') {
        const pip = el.querySelector(`#pip-${currentTurn}`);
        if (pip) pip.classList.add('on');
        currentTurn = Math.min(2, currentTurn + 1);
        if (turnLabel) turnLabel.textContent = TURN_DIRECTIONS[currentTurn];
      }
      return res;
    },
  };

  // Helper for test scripts
  el.setDial = (val) => updateDial(val);

  bind(el, wrappedApi);
}
