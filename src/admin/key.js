import { parseCode, randomCode } from '../core/code.js';
import { buildPlan } from '../core/plan.js';
import { MODULES } from '../modules/index.js';
import { glyphSvg } from '../ui/glyphs.js';

const $ = (s) => document.querySelector(s);
const n = (a) => a.map((i) => i + 1).join(' → ');

function describe(id, st, t) {
  if (id === 'tumbler') {
    return `<div>${st.pins.map((p, i) => `<span class="k">${i + 1}: ${p.color}${p.symbol === 'skull' ? ' SKULL' : ''}</span>`).join('')}</div>
      <div class="ans">PICK PINS: ${n(t.steps)}</div>`;
  }
  if (id === 'glyphs') {
    return `<div>${st.keys.map((g, i) => `<span class="k">#${i + 1} ${glyphSvg(g, 28)} ${g}</span>`).join('')}</div>
      <div class="dim">Pad positions: 1 2 / 3 4</div>
      <div class="ans">PRESS: ${t.steps.map((i) => `#${i + 1} ${st.keys[i]}`).join(' → ')}</div>`;
  }
  if (id === 'fuse') {
    return `<div>${st.wires.map((w, i) => `<span class="k">${i + 1}: ${w.color}${w.label ? ' [' + w.label + ']' : ''}</span>`).join('')}</div>
      <div class="ans">CUT WIRE: ${t.steps[0] + 1}</div>`;
  }
  if (id === 'switch') {
    return `<div>Panel (left to right): ${st.letters.map((L, i) => `<span class="k">${i + 1}: ${L}</span>`).join('')}</div>
      <div class="dim">Switch = case LETTER · Start (COLOR): <b>${t.base}</b> + SERIAL <b>${t.add}</b></div>
      <div class="ans">FLIP SWITCH ${t.sw + 1} (letter ${st.letters[t.sw]}) WHEN COUNTDOWN SHOWS ${t.target}</div>`;
  }
  return '';
}

function show(str) {
  const ctx = parseCode(str);
  if (!ctx) {
    $('#out').innerHTML = '<p>Invalid code. Format: K7-3-RED (letters A-H J K M N; digits 1-9; RED BLUE YELLOW WHITE)</p>';
    return;
  }
  const plan = buildPlan(ctx.code);
  history.replaceState(null, '', '?case=' + ctx.code);
  $('#c').value = ctx.code;
  $('#out').innerHTML = `
    <h2>${ctx.code}</h2>
    <div class="dim">LETTER ${ctx.letter} · SERIAL ${ctx.serial} · LAST ${ctx.last} · COLOR ${ctx.color}</div>
    <p><a href="../?case=${ctx.code}&debug">Open game with this case (debug mode)</a></p>
    ${plan.doors.map((d, i) => {
      const m = MODULES[d.id];
      const t = m.trace(d.state, ctx);
      return `
        <div class="door">
          <b>DOOR ${i + 1}: ${m.plate}</b>
          ${describe(d.id, d.state, t)}
          <small>rule branch: ${t.branches.join(', ')}</small>
        </div>`;
    }).join('')}
  `;
}

$('#show').onclick = () => show($('#c').value);
$('#rnd').onclick = () => show(randomCode());
$('#c').onkeydown = (e) => {
  if (e.key === 'Enter') show($('#c').value);
};

const q = new URLSearchParams(location.search).get('case');
if (q) show(q);
