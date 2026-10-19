import './manual.css';
import { buildManual } from './build.js';
const color = new URLSearchParams(location.search).has('color');
document.getElementById('root').innerHTML = buildManual({ color });
document.getElementById('print').onclick = () => print();
document.getElementById('mode').innerHTML = color ? '<a href="?">Black &amp; white version</a>' : '<a href="?color=1">Color version</a>';
