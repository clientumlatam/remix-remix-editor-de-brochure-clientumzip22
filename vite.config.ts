import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    define: {
      'process.env.GOOGLE_MAPS_PLATFORM_KEY': JSON.stringify(process.env.GOOGLE_MAPS_PLATFORM_KEY || '')
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {
        // nzip2 is a huge, separate WordPress/PHP repo copied for reference only —
        // it is not part of this app and watching its ~29k files exhausts the
        // OS file-watcher limit (ENOSPC), crashing the dev server.
        ignored: ['**/nzip2/**', '**/clientum-exports/**'],
      },
      // Allow Replit's proxied preview domain
      allowedHosts: true as true,
    },
  };
});
