import { federation } from '@module-federation/vite';
import { sharedSingletons } from '@goblin/ui-kit/federation';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [
    react(),
    federation({ name: 'host', remotes: {}, shared: sharedSingletons, dts: false }),
  ],
  build: { target: 'esnext' },
});
