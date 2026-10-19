import './style.css';
import { startShell, setLogo } from './ui/shell.js';
import { LOGO_URL } from './assets/logo-url.js';
// iOS ignores user-scalable=no: block pinch gestures explicitly.
for (const ev of ['gesturestart', 'gesturechange']) document.addEventListener(ev, (e) => e.preventDefault());
setLogo(LOGO_URL);
startShell(document.getElementById('app'));

if ('serviceWorker' in navigator && import.meta.env.PROD) addEventListener('load', async () => {
  try {
    await navigator.serviceWorker.register('/sw.js');
    const reg = await navigator.serviceWorker.ready;
    const urls = ['/', ...performance.getEntriesByType('resource').map((r) => r.name).filter((u) => u.startsWith(location.origin))];
    reg.active?.postMessage({ precache: urls }); // cache everything this page loaded -> works offline after one visit
    // The main menu links to the manual: cache its page and assets too, so it opens offline as well.
    try {
      const html = await (await fetch('/manual/')).text();
      const assets = [...html.matchAll(/(?:src|href)="(\/assets\/[^"]+)"/g)].map((m) => m[1]);
      reg.active?.postMessage({ precache: ['/manual/', ...assets] });
    } catch {}
  } catch {}
});
