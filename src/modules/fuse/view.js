import { bind } from '../../ui/dom.js';
export function render(state, el, api) {
  el.innerHTML = '<div class="wires">' + state.wires.map((w, i) =>
    `<button class="wire c-${w.color.toLowerCase()}${w.label ? ' tagged' : ''}" data-i="${i}"><s>${i + 1}</s><u></u><b>${w.color}</b>${w.label ? `<em class="tag"><i></i>${w.label}</em>` : '<em class="plain">NO TAG</em>'}</button>`).join('') + '</div>';
  bind(el, api);
}
