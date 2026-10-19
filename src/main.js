import './style.css';
import { startShell } from './ui/shell.js';
// iOS ignores user-scalable=no: block pinch gestures explicitly.
for (const ev of ['gesturestart', 'gesturechange']) document.addEventListener(ev, (e) => e.preventDefault());
startShell(document.getElementById('app'));

if ('serviceWorker' in navigator && import.meta.env.PROD) addEventListener('load', async () => {
  try {
    await navigator.serviceWorker.register('/sw.js');
    const reg = await navigator.serviceWorker.ready;
    const urls = ['/', ...performance.getEntriesByType('resource').map((r) => r.name).filter((u) => u.startsWith(location.origin))];
    reg.active?.postMessage({ precache: urls }); // cache everything this page loaded -> works offline after one visit
  } catch {}
});
