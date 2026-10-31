import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'node:url';
import {defineConfig, loadEnv} from 'vite';
import { assertPublicEnvironment } from './scripts/public-env';

export default defineConfig(({ mode }) => {
  assertPublicEnvironment(loadEnv(mode, process.cwd(), 'VITE_'));
  return {
    plugins: [react(), tailwindcss()],
    build: { rollupOptions: { input: { main: path.resolve("index.html"), articlePreview: path.resolve("studio-preview.html") } } },
    resolve: {
      alias: {
        '@': path.dirname(fileURLToPath(import.meta.url)),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
