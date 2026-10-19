// Builds the printed manual as an HTML string. Pure (no DOM) so the validator can check it.
// Rule text comes straight from each module's RULES export, so manual and code cannot drift.
import { MODULES } from '../modules/index.js';
import { COLUMNS } from '../modules/glyphs/logic.js';
import { BASE } from '../modules/switch/logic.js';
import { glyphSvg } from '../ui/glyphs.js';
import { buildPlan } from '../core/plan.js';

const STUDIO = "D'SAITECH";

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const bold = (s) => s.replace(/\b[A-Z][A-Z-]{2,}(?: [A-Z][A-Z-]{2,})*\b/g, '<b>$&</b>');
const lines = (arr) => '<div class="rules">' + arr.map((l) => `<p class="${/^\s/.test(l) ? 'ind' : ''}">${bold(esc(l.trim()))}</p>`).join('') + '</div>';
const fields = (c) => `LETTER ${c.letter} · SERIAL ${c.serial} · LAST ${c.last} · COLOR ${c.color}`;

const EX = 'K7-3-RED';
const ex = buildPlan(EX);
const exDoor = (id) => ex.doors.find((d) => d.id === id);
const exBox = (inner) => `<div class="example"><h3>WORKED EXAMPLE <small>· case ${EX}</small></h3>${inner}</div>`;

const NOTE = {
  tumbler: 'He oiled these himself. They still stick.',
  glyphs: 'The same marks, carved on every door.',
  fuse: 'The wires hum. Cut the wrong one and he hears.',
  switch: 'Six levers hang in the dark. Only one is safe, and only for a second.',
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


// ---- Door sections. Real doors and decoys use the SAME markup so the plate name is the only tell.
const plateOf = (k) => (DECOY[k] ? DECOY[k].plate : MODULES[k].plate);
const rulesOf = (k) => (DECOY[k] ? DECOY[k].rules : MODULES[k].RULES);
const EXTRA = {
  tumbler: tumblerEx,
  glyphs: () => colsHtml() + glyphEx(),
  fuse: fuseEx,
  switch: () => switchTablesHtml() + switchEx(),
};
const door = (k, cls = '') => `<article class="door ${cls}"><div class="plate-row"><h2 class="plate">${plateOf(k)}</h2><p class="note">${NOTE[k]}</p></div>${lines(rulesOf(k))}${EXTRA[k] ? EXTRA[k]() : ''}</article>`;
const duo = (a, b) => `<div class="duo">${door(a, 'half')}${door(b, 'half')}</div>`;

// Which door sections share a page. Real doors and look-alikes are mixed on purpose.
// Page numbers in the index are derived from this, so they cannot drift.
const FIRST_DOOR_PAGE = 3;
const LAYOUT = [
  ['tumbler', 'iron', 'fuse'],
  ['glyphs', ['numpad', 'vault']],
  ['switch', ['gas', 'relay']],
];
export const MANUAL_PAGES = FIRST_DOOR_PAGE - 1 + LAYOUT.length;

const logo = (cls = '') => `<img class="logo ${cls}" data-logo alt="${STUDIO} logo" src="">`;

const index = () => {
  const rows = [];
  LAYOUT.forEach((p, i) => p.flat().forEach((k) => rows.push([plateOf(k), FIRST_DOOR_PAGE + i])));
  rows.sort((a, b) => a[0].localeCompare(b[0]));
  return `<table class="idx"><tr><th>PLATE NAME</th><th>PAGE</th></tr>${rows.map(([n, p]) => `<tr><td>${n}</td><td>${p}</td></tr>`).join('')}</table>`;
};

const cover = () => `
  <div class="cover-top">${logo('xl')}<div><p class="studio">${STUDIO}</p><p class="presents">PRESENTS</p></div></div>
  <div class="titleblock">
    <h1 class="title">LOCKDOWN</h1>
    <p class="sub">BLACKTHORN MANOR</p>
    <p class="stamp">HANDLER'S MANUAL</p>
  </div>
  <blockquote class="quote">One of you is locked inside.<br>The other holds the only manual.<br><b>He is already in the house.</b></blockquote>
  <h2 class="sec">THE GAME</h2>
  <p class="lead"><b>LOCKDOWN</b> is a two-player escape game played entirely by talking. Your partner, the <b>ESCAPEE</b>, is locked inside Blackthorn Manor and holds a phone. You are the <b>HANDLER</b>. You hold this manual. The phone shows the locked doors one at a time; this manual holds the rules that open them. You cannot see their screen and they cannot see your pages, so every answer has to travel through your voices.</p>
  <div class="roles">
    <div class="role"><h3>THE ESCAPEE</h3><ul><li>Holds the phone</li><li>Sees the case code, the clock and the locks</li><li>Describes exactly what is on screen</li><li>Taps, cuts and flips on your instruction</li></ul></div>
    <div class="role"><h3>THE HANDLER · YOU</h3><ul><li>Holds this manual</li><li>Never looks at the screen</li><li>Asks questions, finds the rules</li><li>Gives one clear instruction at a time</li></ul></div>
  </div>
  <div class="stats">
    <div><b>4</b><small>LOCKED DOORS</small></div>
    <div><b>4:00</b><small>ON THE CLOCK</small></div>
    <div><b>3</b><small>STRIKES AND HE FINDS YOU</small></div>
  </div>
  <p class="lead small">Every wrong move is a <b>STRIKE</b>: <b>15 seconds</b> off the clock and he steps closer. Open all four doors before time or strikes run out and you escape.</p>`;

const howto = () => `
  <h2 class="sec first">HOW TO PLAY AS THE HANDLER</h2>
  <ol class="how">
    <li>Ask your partner to read the <b>CASE CODE</b> aloud, as four fields. Write them in the margin.</li>
    <li>Ask for the <b>PLATE NAME</b> on the lock in front of them. Find that page. The name must match exactly.</li>
    <li>Follow the rules <b>top to bottom</b>. Ask the questions you need to answer them.</li>
    <li>Give <b>one instruction at a time</b> and wait for them to say it is done.</li>
    <li>When a door opens they read you a new plate name. Repeat until all four are open.</li>
  </ol>
  <h2 class="sec">THE CASE CODE</h2>
  <div class="boxes"><div><small>LETTER</small>K</div><div><small>SERIAL</small>7</div><div><small>LAST</small>3</div><div><small>COLOR</small>RED</div></div>
  <p class="note">Example: <b>K7-3-RED</b>. Rules always name the field they mean, so "SERIAL odd" is about the 7 and "LAST DIGIT odd" is about the 3. The worked examples in this manual all use this code. A new code is dealt every run, so never reuse an old answer.</p>
  <div class="split">
    <div>
      <h2 class="sec">FIND YOUR PAGE</h2>
      ${index()}
    </div>
    <div>
      <h2 class="sec">AT A GLANCE</h2>
      <table class="idx"><tr><th>VOWEL LETTERS</th><td>A E</td></tr><tr><th>ODD DIGITS</th><td>1 3 5 7 9</td></tr><tr><th>EVEN DIGITS</th><td>2 4 6 8</td></tr><tr><th>COLORS</th><td>RED · BLUE<br>YELLOW · WHITE</td></tr></table>
      <h2 class="sec">TALK LIKE A PRO</h2>
      <ul class="tips">
        <li>Spell letters with a word: "B as in Bravo". B and D, M and N sound alike.</li>
        <li>Lost? Ask them to read the plate name again, slowly.</li>
        <li>Calm beats fast. A strike costs more time than a pause.</li>
      </ul>
    </div>
  </div>`;

const thanks = () => `
  <div class="thanks">
    ${logo('lg')}
    <div>
      <h2>THANK YOU FOR PLAYING</h2>
      <p><b>LOCKDOWN · BLACKTHORN MANOR</b> is a game by <b>${STUDIO}</b>.</p>
      <p>Game design, code, sound, scares and this manual: ${STUDIO}.</p>
      <p class="fine">© ${STUDIO}. All rights reserved.</p>
    </div>
  </div>`;

export function buildManual({ color = false } = {}) {
  const pages = [
    { cls: 'coverpage', html: cover() },
    { cls: '', html: howto() },
    ...LAYOUT.map((p, i) => ({
      cls: '',
      html: p.map((k) => (Array.isArray(k) ? duo(...k) : door(k))).join('') + (i === LAYOUT.length - 1 ? thanks() : ''),
    })),
  ];
  const n = pages.length;
  const body = pages.map((p, i) => `
    <section class="page ${p.cls}">
      ${i === 0 ? '' : `<header class="run">${logo('sm')}<span>BLACKTHORN MANOR · HANDLER'S MANUAL</span><span>${i + 1} / ${n}</span></header>`}
      <div class="content">${p.html}</div>
      <footer><span>LOCKDOWN</span><span>— ${i + 1} —</span><span>${STUDIO}</span></footer>
    </section>`).join('');
  return `<div class="manual ${color ? 'color' : 'bw'}">${body}</div>`;
}
