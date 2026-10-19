// npm run qr -- https://your-project.vercel.app/   -> qr/lockdown-qr.png + .svg (error correction Q, 4-module quiet zone)
import QRCode from 'qrcode';
import { mkdirSync, writeFileSync } from 'node:fs';
const url = process.argv[2];
if (!url || !/^https:\/\//.test(url)) { console.error('Usage: npm run qr -- https://your-site.vercel.app/'); process.exit(1); }
mkdirSync('qr', { recursive: true });
const opt = { errorCorrectionLevel: 'Q', margin: 4 };
await QRCode.toFile('qr/lockdown-qr.png', url, { ...opt, width: 1200, color: { dark: '#000000', light: '#ffffff' } });
writeFileSync('qr/lockdown-qr.svg', await QRCode.toString(url, { ...opt, type: 'svg' }));
console.log('wrote qr/lockdown-qr.png and qr/lockdown-qr.svg for', url);
