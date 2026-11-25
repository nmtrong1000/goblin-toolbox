/*
 * optimizeDeps.entries is limited to index.html: Vite otherwise scans every .html file, including
 * the generated public/contracts/*.html pages, whose inlined Redoc bundle esbuild cannot parse.
 */
import { federation } from '@module-federation/vite';
import { sharedSingletons } from '@goblin/ui-kit/federation';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [
    react(),
    federation({ name: 'host', remotes: {}, shared: sharedSingletons, dts: false }),
  ],
  optimizeDeps: { entries: ['index.html'] },
  build: { target: 'esnext' },
});
