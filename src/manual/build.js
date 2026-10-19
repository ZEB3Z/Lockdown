// Builds the printed manual as an HTML string. Pure (no DOM) so the validator can check it.
// Rule text comes straight from each module's RULES export, so manual and code cannot drift.
import { MODULES } from '../modules/index.js';
import { COLUMNS } from '../modules/glyphs/logic.js';
import { TABLES as DIAL_TABLES } from '../modules/dial/logic.js';
import { BASE } from '../modules/switch/logic.js';
import { glyphSvg } from '../ui/glyphs.js';
import { buildPlan } from '../core/plan.js';

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const bold = (s) => s.replace(/\b[A-Z][A-Z-]{2,}(?: [A-Z][A-Z-]{2,})*\b/g, '<b>$&</b>');
const lines = (arr) => '<div class="rules">' + arr.map((l) => `<p class="${/^\s/.test(l) ? 'ind' : ''}">${bold(esc(l.trim()))}</p>`).join('') + '</div>';
const fields = (c) => `LETTER ${c.letter} · SERIAL ${c.serial} · LAST ${c.last} · COLOR ${c.color}`;

const EX = 'K7-3-RED';
const ex = buildPlan(EX);
const exDoor = (id) => ex.doors.find((d) => d.id === id);
const exBox = (inner) => `<div class="example"><h3>WORKED EXAMPLE · case ${EX}<br><small>${fields(ex.ctx)}</small></h3>${inner}</div>`;

const NOTE = {
  tumbler: 'He oiled these himself. They still stick.',
  glyphs: 'The same marks, carved on every door.',
  fuse: 'The wires hum. Cut the wrong one and he hears.',
  switch: 'Six levers hang in the dark. Only one is safe, and only for a second.',
  dial: 'Three tumblers drop inside the heavy door. Listen for the click.',
  iron: 'Cellar door. Rusted shut years ago.',
  numpad: 'The old safe. He never changed the numbers.',
  gas: 'The boiler room. You will not need this.',
  relay: 'The old relays still hum. They are not connected to anything.',
  vault: 'Wine cellar vault. The combination changed when he moved in.',
};

const DECOY = {
  iron: {
    plate: 'IRON TUMBLER',
    rules: [
      'Pins are numbered RIGHT to LEFT.',
      '1. Count pins showing a MOON. Call it M.',
      '2. M = 0: pick pins by color: WHITE, YELLOW, BLUE, RED.',
      '   M = 1 or more: pick the MOON pins first, then the rest left to right.',
      '3. LAST DIGIT 7 or more: reverse the whole order.',
    ],
  },
  numpad: {
    plate: 'NUMBER PAD',
    rules: [
      'The pad shows 4 NUMBERS. Find the column below that holds all 4.',
      'LETTER is a vowel: press smallest to largest.',
      'Any other LETTER: press largest to smallest.',
      '',
      '7 2 9 4 1 8  ·  3 9 5 2 6 7  ·  4 8 1 6 3 9  ·  5 1 7 9 2 4',
    ],
  },
  gas: {
    plate: 'GAS VALVE',
    rules: [
      'Valves are lettered A to D, left to right.',
      '1. LETTER is a vowel: turn A, C, B, D.',
      '   Any other LETTER: turn D, B, C, A.',
      '2. A valve with a RED handle is turned FIRST.',
    ],
  },
  relay: {
    plate: 'RELAY BOARD',
    rules: [
      'Toggles are numbered I to IV from the TOP. One lamp glows above the board.',
      '1. LETTER is a vowel (A, E): flip toggle II when the lamp is lit.',
      '   Any other LETTER: flip toggle III when the lamp is lit.',
      '2. If SERIAL is even, flip toggle I first.',
    ],
  },
  vault: {
    plate: 'VAULT WHEEL',
    rules: [
      'The vault dial has numbers 0 to 50. Turn order is RIGHT, LEFT, RIGHT.',
      '1. Clue order is determined by LETTER:',
      '   Vowel (A, E): RIGHT clue first, then CENTER, then LEFT.',
      '   Consonant: LEFT clue first, then RIGHT, then CENTER.',
      '2. Look up base numbers in the secondary vault index.',
      '3. If SERIAL is even, subtract LAST digit from each number.',
      '4. Spin to each number in order and pull the release lever.',
    ],
  },
};

function realPage(id, extra, example) {
  const m = MODULES[id];
  return `<h2 class="plate">${m.plate}</h2><p class="note">${NOTE[id]}</p>${lines(m.RULES)}${extra}${example}`;
}

function tumblerEx() {
  const d = exDoor('tumbler'), s = MODULES.tumbler.solve(d.state, ex.ctx);
  return exBox(`<p>Pins left to right: ${d.state.pins.map((p, i) => `${i + 1} ${p.color}${p.symbol === 'skull' ? ' SKULL' : ''}`).join(' · ')}</p><p>Tap order: <b>${s.map((i) => i + 1).join(' → ')}</b></p>`);
}

function glyphEx() {
  const d = exDoor('glyphs'), s = MODULES.glyphs.solve(d.state, ex.ctx);
  const row = (a) => a.map((g) => glyphSvg(g, 34)).join('');
  return exBox(`<div class="grow">The pad shows: ${row(d.state.keys)}</div><div class="grow">Press in this order: ${row(s.map((i) => d.state.keys[i]))}</div>`);
}

function fuseEx() {
  const d = exDoor('fuse'), s = MODULES.fuse.solve(d.state, ex.ctx);
  return exBox(`<p>Wires from the top: ${d.state.wires.map((w, i) => `${i + 1} ${w.color}${w.label ? ' (' + w.label + ')' : ''}`).join(' · ')}</p><p>Cut: <b>wire ${s[0] + 1}</b></p>`);
}

function switchEx() {
  const d = exDoor('switch'), t = MODULES.switch.trace(d.state, ex.ctx);
  const nth = ['first', 'second', 'third', 'fourth', 'fifth', 'sixth'];
  return exBox(`
    <p>Switch letters, left to right: ${d.state.letters.map((L, i) => `${i + 1} ${L}`).join(' · ')}</p>
    <p>LETTER ${ex.ctx.letter} is on switch <b>${t.sw + 1}</b>.</p>
    <p>COLOR ${ex.ctx.color} starts at <b>${t.base}</b>. Add SERIAL ${ex.ctx.serial} = <b>${t.target}</b>.</p>
    <p>Tell your partner: flip the <b>${nth[t.sw]}</b> switch when the countdown shows <b>${t.target}</b>.</p>
  `);
}

function dialEx() {
  const d = exDoor('dial'), s = MODULES.dial.solve(d.state, ex.ctx);
  const t = MODULES.dial.trace(d.state, ex.ctx);
  return exBox(`
    <p>COLOR is RED → Turn order: <b>LEFT clue, CENTER clue, RIGHT clue</b>.</p>
    <p>Clues shown: ${t.orderedClues.map((c, i) => `Turn ${i + 1}: ${c.type.toUpperCase()} [${c.val}] → Base <b>${t.baseNumbers[i]}</b>`).join(' · ')}.</p>
    <p>LAST digit 3 is ODD → Add SERIAL (7) to each (mod 40).</p>
    <p>Final targets: <b>TURN 1 (LEFT) to ${s[0]} → TURN 2 (RIGHT) to ${s[1]} → TURN 3 (LEFT) to ${s[2]}</b>.</p>
  `);
}

const colsHtml = () => '<p class="lbl">COLUMNS · read from TOP</p><div class="cols">' + COLUMNS.map((c, i) =>
  `<div class="col"><h4>${i + 1}</h4>${c.map((g) => `<div class="g">${glyphSvg(g, 30)}<span>${g}</span></div>`).join('')}</div>`).join('') + '</div>';

const switchTablesHtml = () => `
  <p class="lbl">COLOR START NUMBER</p>
  <div class="sw-tables">
    <table class="dtbl">
      <tr><th>COLOR</th><th>START</th></tr>
      ${Object.entries(BASE).map(([c, n]) => `<tr><td>${c}</td><td><b>${n}</b></td></tr>`).join('')}
    </table>
  </div>
`;

const dialTablesHtml = () => `
  <p class="lbl">CONVERSION TABLES</p>
  <div class="dial-tables-grid">
    <table class="dtbl">
      <tr><th colspan="2">1. CLOCK (Hour)</th></tr>
      <tr><td>1 → <b>5</b></td><td>7 → <b>2</b></td></tr>
      <tr><td>2 → <b>11</b></td><td>8 → <b>8</b></td></tr>
      <tr><td>3 → <b>17</b></td><td>9 → <b>14</b></td></tr>
      <tr><td>4 → <b>23</b></td><td>10 → <b>20</b></td></tr>
      <tr><td>5 → <b>29</b></td><td>11 → <b>26</b></td></tr>
      <tr><td>6 → <b>35</b></td><td>12 → <b>32</b></td></tr>
    </table>
    <table class="dtbl">
      <tr><th colspan="2">2. PAINTING (Subject)</th></tr>
      <tr><td>CROW</td><td><b>7</b></td></tr>
      <tr><td>MOTH</td><td><b>15</b></td></tr>
      <tr><td>KEY</td><td><b>22</b></td></tr>
      <tr><td>EYE</td><td><b>28</b></td></tr>
      <tr><td>HOUSE</td><td><b>34</b></td></tr>
      <tr><td>DAGGER</td><td><b>39</b></td></tr>
    </table>
    <table class="dtbl">
      <tr><th colspan="2">3. CANDLES (Count)</th></tr>
      <tr><td>1 candle</td><td><b>3</b></td></tr>
      <tr><td>2 candles</td><td><b>9</b></td></tr>
      <tr><td>3 candles</td><td><b>18</b></td></tr>
      <tr><td>4 candles</td><td><b>24</b></td></tr>
      <tr><td>5 candles</td><td><b>31</b></td></tr>
      <tr><td>6 candles</td><td><b>37</b></td></tr>
    </table>
    <table class="dtbl">
      <tr><th colspan="2">4. CALENDAR (Day)</th></tr>
      <tr><td>4th</td><td><b>6</b></td></tr>
      <tr><td>7th</td><td><b>12</b></td></tr>
      <tr><td>13th</td><td><b>19</b></td></tr>
      <tr><td>19th</td><td><b>25</b></td></tr>
      <tr><td>23rd</td><td><b>30</b></td></tr>
      <tr><td>31st</td><td><b>38</b></td></tr>
    </table>
    <table class="dtbl">
      <tr><th colspan="2">5. PORTRAIT (Eyes Out)</th></tr>
      <tr><td>1 eye</td><td><b>4</b></td></tr>
      <tr><td>2 eyes</td><td><b>13</b></td></tr>
      <tr><td>3 eyes</td><td><b>21</b></td></tr>
      <tr><td>4 eyes</td><td><b>33</b></td></tr>
    </table>
    <table class="dtbl">
      <tr><th colspan="2">6. HANDPRINTS (Count)</th></tr>
      <tr><td>1 print</td><td><b>1</b></td></tr>
      <tr><td>2 prints</td><td><b>10</b></td></tr>
      <tr><td>3 prints</td><td><b>16</b></td></tr>
      <tr><td>4 prints</td><td><b>27</b></td></tr>
      <tr><td>5 prints</td><td><b>36</b></td></tr>
    </table>
  </div>
`;

const decoyPage = (k) => `<h2 class="plate">${DECOY[k].plate}</h2><p class="note">${NOTE[k]}</p>${lines(DECOY[k].rules)}`;

export function buildManual({ color = false } = {}) {
  const order = [
    ['iron', null],
    ['tumbler', null],
    ['numpad', null],
    ['glyphs', null],
    ['gas', null],
    ['fuse', null],
    ['relay', null],
    ['switch', null],
    ['vault', null],
    ['dial', null],
  ];

  const plateOf = (k) => (DECOY[k] ? DECOY[k].plate : MODULES[k].plate);
  const pages = [
    `<div class="cover"><p class="stamp">HANDLER'S COPY</p><h1>BLACKTHORN<br>MANOR</h1><p class="sub">CASE FILE · DO NOT SHOW YOUR PARTNER</p><p class="note big">You cannot see what they see.<br>Make them tell you.</p></div>`,
    `<h2>HOW TO READ THIS MANUAL</h2>
     <ol class="how">
       <li>Your partner is locked inside. You cannot see their screen. <b>Do not try.</b></li>
       <li>Ask them to read the <b>CASE CODE</b> aloud, as four fields: <b>LETTER, SERIAL, LAST, COLOR</b>. Write them in the margin.</li>
       <li>Ask for the <b>PLATE NAME</b> on the lock. Find that page in the index. Plate names must match exactly.</li>
       <li>Follow the rules <b>top to bottom</b>. Ask the questions you need. Give one instruction at a time.</li>
       <li>A wrong tap is a <b>strike</b>. Strikes cost time and bring him closer. Three strikes: he finds you. Be fast, but be sure.</li>
     </ol>
     <div class="boxes"><div><small>LETTER</small>K</div><div><small>SERIAL</small>7</div><div><small>LAST</small>3</div><div><small>COLOR</small>RED</div></div>
     <p class="note">Example case code K7-3-RED. Odd/even always refers to the digit named in the rule.</p>`,
    `<h2>QUICK REFERENCE</h2>
     <table class="idx"><tr><th>PLATE NAME</th><th>PAGE</th></tr>${order.map(([k], i) => `<tr><td>${plateOf(k)}</td><td>${4 + i}</td></tr>`).join('')}</table>
     <table class="idx"><tr><th>VOWEL LETTERS</th><td>A E</td></tr><tr><th>ODD DIGITS</th><td>1 3 5 7 9</td></tr><tr><th>EVEN DIGITS</th><td>2 4 6 8</td></tr><tr><th>COLORS</th><td>RED · BLUE · YELLOW · WHITE</td></tr></table>
     <p class="note">Lost? Ask your partner to read the plate name again, slowly.</p>`,
  ];

  for (const [k] of order) {
    if (DECOY[k]) {
      pages.push(decoyPage(k));
    } else if (k === 'tumbler') {
      pages.push(realPage('tumbler', '', tumblerEx()));
    } else if (k === 'glyphs') {
      pages.push(realPage('glyphs', colsHtml(), glyphEx()));
    } else if (k === 'fuse') {
      pages.push(realPage('fuse', '', fuseEx()));
    } else if (k === 'switch') {
      pages.push(realPage('switch', switchTablesHtml(), switchEx()));
    } else if (k === 'dial') {
      pages.push(realPage('dial', dialTablesHtml(), dialEx()));
    }
  }

  const body = pages.map((p, i) => `<section class="page${i === 0 ? ' coverpage' : ''}">${p}<footer>— ${i + 1} —</footer></section>`).join('');
  return `<div class="manual ${color ? 'color' : 'bw'}">${body}</div>`;
}
