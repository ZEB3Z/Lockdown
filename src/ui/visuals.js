// Atmosphere overlay (#fx). Safety: flicker dips max ~1.3/s (limit is 3), no full-screen white flashes,
// jump-scare silhouette fades in over 150ms (never strobes). Reduced mode removes motion + flicker + lunge.
const KILLER = (mask) => `<svg viewBox="0 0 100 200" preserveAspectRatio="xMidYMax meet"><path d="M18 200L24 84Q50 62 76 84L82 200z" fill="#020202" stroke="rgba(223,233,242,.28)" stroke-width="1.5"/><circle cx="50" cy="40" r="15" fill="#020202" stroke="rgba(223,233,242,.28)" stroke-width="1.5"/>${mask ? '<ellipse cx="50" cy="40" rx="11" ry="13" fill="#d8dde0"/><rect x="42" y="34" width="6" height="3" fill="#050505"/><rect x="52" y="34" width="6" height="3" fill="#050505"/>' : '<circle cx="45" cy="38" r="1.5" fill="#b3121a"/><circle cx="55" cy="38" r="1.5" fill="#b3121a"/>'}</svg>`;
const SCRATCH = `<svg class="scr" viewBox="0 0 100 160" preserveAspectRatio="none" fill="none" stroke="#8c0f15" stroke-width="1.6" stroke-linecap="round">
<g><path d="M6 14L34 70M12 10L40 66M18 8L44 60"/></g>
<g fill="#8c0f15" stroke="none"><ellipse cx="78" cy="104" rx="9" ry="11"/><ellipse cx="68" cy="90" rx="2.2" ry="7" transform="rotate(-15 68 90)"/><ellipse cx="75" cy="86" rx="2.2" ry="8"/><ellipse cx="82" cy="87" rx="2.2" ry="8"/><ellipse cx="88" cy="92" rx="2.2" ry="7" transform="rotate(15 88 92)"/><ellipse cx="66" cy="106" rx="2.4" ry="6" transform="rotate(-60 66 106)"/></g>
<g><path d="M60 120L92 150M54 124L86 154M66 116L96 144"/></g></svg>`;
let root, reduced = false, timer, level = 0, bucket = -1;

export function init() {
  root = document.getElementById('fx'); if (!root) return;
  const c = document.createElement('canvas'); c.width = c.height = 96;
  const x = c.getContext('2d'), im = x.createImageData(96, 96);
  for (let i = 0; i < im.data.length; i += 4) { const v = Math.random() * 255; im.data[i] = im.data[i + 1] = im.data[i + 2] = v; im.data[i + 3] = 255; }
  x.putImageData(im, 0, 0);
  const e = document.createElement('canvas'); e.width = e.height = 128;
  const ex = e.getContext('2d'), ei = ex.createImageData(128, 128);
  for (let i = 3; i < ei.data.length; i += 4) ei.data[i] = 255;
  for (let n = 0; n < 260; n++) { // random transparent specks = worn/eroded lettering
    const x = (Math.random() * 126) | 0, y = (Math.random() * 126) | 0, w = 1 + ((Math.random() * 3) | 0), h = 1 + ((Math.random() * 5) | 0);
    for (let dy = 0; dy < h; dy++) for (let dx = 0; dx < w; dx++) ei.data[(Math.min(127, y + dy) * 128 + Math.min(127, x + dx)) * 4 + 3] = 0;
  }
  ex.putImageData(ei, 0, 0);
  document.documentElement.style.setProperty('--erode', `url(${e.toDataURL()})`);
  root.style.setProperty('--grain', `url(${c.toDataURL()})`);
  root.innerHTML = `<div class="grain"></div><div class="killer">${KILLER(false)}</div><div class="lunge">${KILLER(true)}</div>${SCRATCH}<div class="dip"></div>`;
  flicker();
}
function flicker() {
  clearTimeout(timer);
  if (reduced || !root) return;
  const gap = Math.max(700, 4200 - 3200 * (level / 100) + Math.random() * 2500);
  timer = setTimeout(() => { root.classList.add('dipping'); setTimeout(() => { root.classList.remove('dipping'); flicker(); }, 110); }, gap);
}
export function setReduced(r) { reduced = r; root?.classList.toggle('reduced', r); r ? clearTimeout(timer) : flicker(); }
export function setLevel(p) {
  level = p; const b = Math.round(p / 5); if (b === bucket || !root) return; bucket = b;
  root.style.setProperty('--ko', Math.max(0, Math.min(0.85, (p - 55) / 45)).toFixed(2));
  document.documentElement.style.setProperty('--vig', (35 - p * 0.18).toFixed(0) + '%');
}
export function strike(n) { root?.querySelectorAll('.scr g')[n - 1]?.classList.add('on'); }
export function scare() {
  if (!root || reduced) return;
  root.classList.add('lunging'); setTimeout(() => root.classList.remove('lunging'), 1100);
}
export function reset() { bucket = -1; level = 0; root?.querySelectorAll('.scr g').forEach((g) => g.classList.remove('on')); root?.classList.remove('lunging'); setLevel(0); }
