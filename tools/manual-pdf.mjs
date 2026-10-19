// node tools/manual-pdf.mjs  ->  docs/print/LOCKDOWN-Handlers-Manual-BW.pdf and -Color.pdf  (A4, 5 pages)
// Renders the same manual the game ships (src/manual/build.js + manual.css + the logo) in headless Chromium.
// Needs Playwright, which is NOT a project dependency:  npm i -D playwright && npx playwright install chromium
// (If Playwright is installed globally, set PLAYWRIGHT_PATH to its folder.)
// Fails loudly if any page spills past the A4 frame or the page count is wrong, so a bad PDF never ships.
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createRequire } from 'node:module';
import { buildManual, MANUAL_PAGES } from '../src/manual/build.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
let chromium;
try {
  ({ chromium } = await import('playwright'));
} catch {
  try {
    ({ chromium } = createRequire(import.meta.url)(process.env.PLAYWRIGHT_PATH || 'playwright'));
  } catch {
    console.error('Playwright not found. Run: npm i -D playwright && npx playwright install chromium');
    process.exit(1);
  }
}

const MIME = { png: 'image/png', svg: 'image/svg+xml', webp: 'image/webp', jpg: 'image/jpeg', jpeg: 'image/jpeg' };
const ext = ['png', 'svg', 'webp', 'jpg', 'jpeg'].find((e) => fs.existsSync(path.join(root, 'src/assets/logo.' + e)));
if (!ext) { console.error('No logo found in src/assets/'); process.exit(1); }
const logoUri = `data:${MIME[ext]};base64,` + fs.readFileSync(path.join(root, 'src/assets/logo.' + ext)).toString('base64');
const css = fs.readFileSync(path.join(root, 'src/manual/manual.css'), 'utf8');
const outDir = path.join(root, 'docs/print');
fs.mkdirSync(outDir, { recursive: true });

const browser = await chromium.launch();
let bad = 0;
for (const color of [false, true]) {
  const body = buildManual({ color }).replace(/(<img class="logo [a-z]+" data-logo alt="[^"]*") src="">/g, `$1 src="${logoUri}">`);
  const file = path.join(os.tmpdir(), `lockdown-manual-${color ? 'color' : 'bw'}.html`);
  fs.writeFileSync(file, `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>LOCKDOWN · Handler's Manual · D'SAITECH</title><style>${css}</style></head><body><div id="root">${body}</div></body></html>`);
  const page = await browser.newPage();
  await page.goto(pathToFileURL(file).href);
  await page.evaluate(() => document.fonts.ready);
  const spill = await page.evaluate(() => [...document.querySelectorAll('.page')].map((p, i) => { const c = p.querySelector('.content'); return c.scrollHeight > c.clientHeight + 1 ? i + 1 : 0; }).filter(Boolean));
  const pdf = await page.pdf({ format: 'A4', printBackground: color, preferCSSPageSize: true });
  await page.close();
  const pages = (pdf.toString('latin1').match(/\/Type\s*\/Page[^s]/g) || []).length;
  const name = `LOCKDOWN-Handlers-Manual-${color ? 'Color' : 'BW'}.pdf`;
  if (spill.length) { console.error(`${name}: page(s) ${spill.join(', ')} overflow the A4 frame`); bad++; continue; }
  if (pages !== MANUAL_PAGES) { console.error(`${name}: ${pages} PDF pages, expected ${MANUAL_PAGES}`); bad++; continue; }
  fs.writeFileSync(path.join(outDir, name), pdf);
  console.log(`wrote docs/print/${name} (${pages} pages, A4)`);
}
await browser.close();
process.exit(bad ? 1 : 0);
