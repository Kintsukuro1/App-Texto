/**
 * Script de build para el proceso principal de Electron.
 * Compila electron/main.ts y electron/preload.ts a CommonJS (dist-electron/).
 *
 * Usado en: npm run electron:build-main
 */
import * as esbuild from 'esbuild';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');

const isWatch = process.argv.includes('--watch');

const baseConfig = {
  bundle: true,
  platform: 'node',
  target: 'node20',
  format: 'cjs',
  external: [
    'electron',
    // Módulos nativos — no se pueden bundlear
    'better-sqlite3',
    'bcrypt',
  ],
  // Polyfill para import.meta.url: algunos paquetes ESM (crossws, hocuspocus)
  // usan createRequire(import.meta.url) que queda undefined en CJS.
  // Inyectamos un equivalente basado en __filename (disponible en CJS).
  define: {
    'import.meta.url': '__esm_import_meta_url__',
    'import.meta.dirname': '__dirname',
    'import.meta.filename': '__filename',
  },
  banner: {
    js: "const __esm_import_meta_url__ = require('url').pathToFileURL(__filename).href;",
  },
  sourcemap: isWatch ? 'inline' : false,
  minify: !isWatch,
};


async function build() {
  const contexts = await Promise.all([
    esbuild.context({
      ...baseConfig,
      entryPoints: [path.join(root, 'electron/main.ts')],
      outfile: path.join(root, 'dist-electron/main.cjs'),
    }),
    esbuild.context({
      ...baseConfig,
      entryPoints: [path.join(root, 'electron/preload.ts')],
      outfile: path.join(root, 'dist-electron/preload.cjs'),
    }),
  ]);

  if (isWatch) {
    await Promise.all(contexts.map((ctx) => ctx.watch()));
    console.log('[electron-build] Watching for changes...');
  } else {
    await Promise.all(contexts.map((ctx) => ctx.rebuild().then(() => ctx.dispose())));
    console.log('[electron-build] Build completado → dist-electron/');
  }
}

build().catch((err) => {
  console.error(err);
  process.exit(1);
});
