// Builds the printed manual as an HTML string. Pure (no DOM) so the validator can check it.
// Rule text comes straight from each module's RULES export, so manual and code cannot drift.
import { MODULES } from '../modules/index.js';
import { COLUMNS } from '../modules/glyphs/logic.js';
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
  tumbler: 'He oiled these himself. They still stick.', glyphs: 'The same marks, carved on every door.',
  fuse: 'The wires hum. Cut the wrong one and he hears.', iron: 'Cellar door. Rusted shut years ago.',
  numpad: 'The old safe. He never changed the numbers.', gas: 'The boiler room. You will not need this.',
};
const DECOY = {
  iron: { plate: 'IRON TUMBLER', rules: ['Pins are numbered RIGHT to LEFT.', '1. Count pins showing a MOON. Call it M.', '2. M = 0: pick pins by color: WHITE, YELLOW, BLUE, RED.', '   M = 1 or more: pick the MOON pins first, then the rest left to right.', '3. LAST DIGIT 7 or more: reverse the whole order.'] },
  numpad: { plate: 'NUMBER PAD', rules: ['The pad shows 4 NUMBERS. Find the column below that holds all 4.', 'LETTER is a vowel: press smallest to largest.', 'Any other LETTER: press largest to smallest.', '', '7 2 9 4 1 8  ·  3 9 5 2 6 7  ·  4 8 1 6 3 9  ·  5 1 7 9 2 4'] },
  gas: { plate: 'GAS VALVE', rules: ['Valves are lettered A to D, left to right.', '1. LETTER is a vowel: turn A, C, B, D.', '   Any other LETTER: turn D, B, C, A.', '2. A valve with a RED handle is turned FIRST.'] },
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
const colsHtml = () => '<p class="lbl">COLUMNS · read from TOP</p><div class="cols">' + COLUMNS.map((c, i) =>
  `<div class="col"><h4>${i + 1}</h4>${c.map((g) => `<div class="g">${glyphSvg(g, 30)}<span>${g}</span></div>`).join('')}</div>`).join('') + '</div>';
const decoyPage = (k) => `<h2 class="plate">${DECOY[k].plate}</h2><p class="note">${NOTE[k]}</p>${lines(DECOY[k].rules)}`;

export function buildManual({ color = false } = {}) {
  const order = [['iron', null], ['tumbler', null], ['numpad', null], ['glyphs', null], ['gas', null], ['fuse', null]];
  const plateOf = (k) => (DECOY[k] ? DECOY[k].plate : MODULES[k].plate);
  const pages = [
    `<div class="cover"><p class="stamp">HANDLER'S COPY</p><h1>BLACKTHORN<br>MANOR</h1><p class="sub">CASE FILE · DO NOT SHOW YOUR PARTNER</p><p class="note big">You cannot see what they see.<br>Make them tell you.</p></div>`,
    `<h2>HOW TO READ THIS MANUAL</h2>
     <ol class="how"><li>Your partner is locked inside. You cannot see their screen. <b>Do not try.</b></li>
     <li>Ask them to read the <b>CASE CODE</b> aloud, as four fields: <b>LETTER, SERIAL, LAST, COLOR</b>. Write them in the margin.</li>
     <li>Ask for the <b>PLATE NAME</b> on the lock. Find that page in the index. Plate names must match exactly.</li>
     <li>Follow the rules <b>top to bottom</b>. Ask the questions you need. Give one instruction at a time.</li>
     <li>A wrong tap is a <b>strike</b>. Strikes cost time and bring him closer. Three strikes: he finds you. Be fast, but be sure.</li></ol>
     <div class="boxes"><div><small>LETTER</small>K</div><div><small>SERIAL</small>7</div><div><small>LAST</small>3</div><div><small>COLOR</small>RED</div></div>
     <p class="note">Example case code K7-3-RED. Odd/even always refers to the digit named in the rule.</p>`,
    `<h2>QUICK REFERENCE</h2><table class="idx"><tr><th>PLATE NAME</th><th>PAGE</th></tr>${order.map(([k], i) => `<tr><td>${plateOf(k)}</td><td>${4 + i}</td></tr>`).join('')}</table>
     <table class="idx"><tr><th>VOWEL LETTERS</th><td>A E</td></tr><tr><th>ODD DIGITS</th><td>1 3 5 7 9</td></tr><tr><th>EVEN DIGITS</th><td>2 4 6 8</td></tr><tr><th>COLORS</th><td>RED · BLUE · YELLOW · WHITE</td></tr></table>
     <p class="note">Lost? Ask your partner to read the plate name again, slowly.</p>`,
  ];
  for (const [k] of order) {
    if (DECOY[k]) pages.push(decoyPage(k));
    else if (k === 'tumbler') pages.push(realPage('tumbler', '', tumblerEx()));
    else if (k === 'glyphs') pages.push(realPage('glyphs', colsHtml(), glyphEx()));
    else pages.push(realPage('fuse', '', fuseEx()));
  }
  const body = pages.map((p, i) => `<section class="page${i === 0 ? ' coverpage' : ''}">${p}<footer>— ${i + 1} —</footer></section>`).join('');
  return `<div class="manual ${color ? 'color' : 'bw'}">${body}</div>`;
}
