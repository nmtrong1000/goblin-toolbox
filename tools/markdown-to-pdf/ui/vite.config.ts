import { federation } from '@module-federation/vite';
import { federationName, sharedSingletons } from '@goblin/ui-kit/federation';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

const slug = 'markdown-to-pdf';

export default defineConfig({
  base: `/remotes/${slug}/`,
  plugins: [
    react(),
    federation({
      name: federationName(slug),
      filename: 'remoteEntry.js',
      exposes: { './Tool': './src/Tool.tsx' },
      shared: sharedSingletons,
      dts: false,
    }),
  ],
  build: { target: 'esnext', outDir: `dist/remotes/${slug}`, emptyOutDir: true },
});
