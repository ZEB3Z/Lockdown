import { bind } from '../../ui/dom.js';
import { glyphSvg } from '../../ui/glyphs.js';
export function render(state, el, api) {
  el.innerHTML = '<div class="pins">' + state.pins.map((p, i) =>
    `<button class="pin c-${p.color.toLowerCase()}" data-i="${i}"><s>${i + 1}</s><i></i><b>${p.color}</b><small>${glyphSvg(p.symbol, 22)}${p.symbol.toUpperCase()}</small></button>`).join('') + '</div>';
  bind(el, api);
}
