import { bind } from '../../ui/dom.js';
import { glyphSvg } from '../../ui/glyphs.js';
// Glyphs are drawn with the shared SVG art (src/ui/glyphs.js), same as the manual.
export function render(state, el, api) {
  el.innerHTML = '<div class="pad">' + state.keys.map((g, i) =>
    `<button class="key" data-i="${i}">${glyphSvg(g, 64)}</button>`).join('') + '</div>';
  bind(el, api);
}
