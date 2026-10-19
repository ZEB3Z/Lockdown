import './manual.css';
import { buildManual } from './build.js';
import { LOGO_URL } from '../assets/logo-url.js';

const color = new URLSearchParams(location.search).has('color');
document.getElementById('root').innerHTML = buildManual({ color });
document.querySelectorAll('img[data-logo]').forEach((img) => { img.src = LOGO_URL; });
document.getElementById('print').onclick = () => print();
document.getElementById('mode').innerHTML = color ? '<a href="?">Black &amp; white version</a>' : '<a href="?color=1">Color version</a>';

// Layout guard: a page whose content spills past the A4 frame is outlined in red on screen.
// (Print shows no outline, but the fix is the same: shorten that page.)
const check = () => document.querySelectorAll('.page').forEach((p) => {
  const c = p.querySelector('.content');
  p.classList.toggle('overflowing', c.scrollHeight > c.clientHeight + 1);
});
check();
document.fonts?.ready.then(check);
