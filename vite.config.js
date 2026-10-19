import { defineConfig } from 'vite';
import { fileURLToPath } from 'node:url';
const p = (f) => fileURLToPath(new URL(f, import.meta.url));
// Multi-page: game (/), printed manual (/manual/), answer key (/admin/), facilitator sheet (/facilitator/)
export default defineConfig({
  esbuild: { target: 'es2018' }, // older cheap-phone WebViews: transpile ?. and ??
  build: { target: 'es2018', rollupOptions: { input: { main: p('index.html'), manual: p('manual/index.html'), admin: p('admin/index.html'), facilitator: p('facilitator/index.html') } } },
});
