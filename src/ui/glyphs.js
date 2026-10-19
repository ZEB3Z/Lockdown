// Shared glyph art: game AND manual use glyphSvg() so they always match. Pure strings, Node-safe.
const S = {
  eye: '<path d="M4 24Q24 6 44 24Q24 42 4 24Z"/><circle cx="24" cy="24" r="6" fill="currentColor"/>',
  skull: '<path d="M10 24a14 14 0 0 1 28 0c0 5-3 7-5 9v7H15v-7c-2-2-5-4-5-9z"/><circle cx="18" cy="24" r="3.5" fill="currentColor"/><circle cx="30" cy="24" r="3.5" fill="currentColor"/><path d="M22 34v6M26 34v6"/>',
  claw: '<path d="M13 5Q9 24 17 43M24 5Q20 24 28 43M35 5Q31 24 39 43"/>',
  knife: '<path d="M24 3L31 27H17z"/><path d="M11 27h26M24 27v12"/><circle cx="24" cy="43" r="3" fill="currentColor"/>',
  key: '<circle cx="24" cy="12" r="8"/><path d="M24 20v24M24 34h8M24 42h6"/>',
  moon: '<path d="M32 5A19 19 0 1 0 43 32A15 15 0 0 1 32 5z"/>',
  crow: '<circle cx="34" cy="13" r="6"/><path d="M39 12l7 2-7 2"/><circle cx="35" cy="12" r="1.4" fill="currentColor"/><path d="M30 18Q16 18 10 34L4 44l14-4Q32 38 34 26z"/><path d="M20 40v6M26 38v6"/>',
  hand: '<path d="M12 27V17M19 25V8M26 25V5M33 25V9M40 29V20"/><path d="M10 27Q10 44 26 44Q42 44 42 29z"/>',
  spider: '<circle cx="24" cy="24" r="6" fill="currentColor"/><path d="M24 24L8 10M24 24L4 24M24 24L8 38M24 24L14 45M24 24L40 10M24 24L44 24M24 24L40 38M24 24L34 45"/>',
  candle: '<path d="M18 20h12v24H18z"/><path d="M24 3Q33 13 24 20Q15 13 24 3z" fill="currentColor"/>',
  bat: '<path d="M24 16l-4-8-2 8Q10 8 2 14Q8 18 8 28Q14 24 18 30L24 40l6-10Q34 24 40 28Q40 18 46 14Q38 8 30 16l-2-8z"/>',
  coffin: '<path d="M18 4h12l8 12-8 28H18L10 16z"/><path d="M24 12v18M18 18h12"/>',
  cross: '<path d="M24 5v39M14 32h20"/>',
  bell: '<path d="M12 34Q12 12 24 12Q36 12 36 34zM8 34h32M24 6v6M20 40Q24 46 28 40"/>',
  web: '<path d="M24 3v42M3 24h42M9 9l30 30M39 9L9 39"/><circle cx="24" cy="24" r="8"/><circle cx="24" cy="24" r="16"/>',
  tooth: '<path d="M10 12Q10 4 20 6Q24 8 28 6Q38 4 38 12Q38 24 34 30L32 44Q28 44 27 34L24 30L21 34Q20 44 16 44L14 30Q10 24 10 12z"/>',
  door: '<path d="M12 4h24v40H12z"/><circle cx="30" cy="25" r="2.2" fill="currentColor"/><path d="M6 44h36"/>',
  mask: '<path d="M8 12Q24 4 40 12Q40 36 24 44Q8 36 8 12z"/><path d="M13 20l8 2M35 20l-8 2"/><circle cx="19" cy="31" r="1.6" fill="currentColor"/><circle cx="24" cy="34" r="1.6" fill="currentColor"/><circle cx="29" cy="31" r="1.6" fill="currentColor"/>',
};
export const GLYPH_ART = S;
export const glyphSvg = (id, size = 48) =>
  `<svg class="glyph" viewBox="0 0 48 48" width="${size}" height="${size}" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" role="img" aria-label="${id}">${S[id]}</svg>`;
