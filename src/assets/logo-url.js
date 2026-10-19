// Browser-only: resolves the built URL of the D'SAITECH logo.
// To use your real logo, overwrite src/assets/logo.png (or drop in logo.svg / logo.webp / logo.jpg
// and delete logo.png). Nothing else needs to change.
const found = import.meta.glob('./logo.{png,svg,webp,jpg,jpeg}', { eager: true, query: '?url', import: 'default' });
const order = ['png', 'svg', 'webp', 'jpg', 'jpeg'];
const key = order.map((e) => './logo.' + e).find((k) => found[k]);
export const LOGO_URL = key ? found[key] : '';
