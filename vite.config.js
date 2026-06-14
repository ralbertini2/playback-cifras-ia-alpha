import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/playback-cifras-ia-alpha/',
  build: {
    outDir: 'dist',
    emptyOutDir: true
  }
});
