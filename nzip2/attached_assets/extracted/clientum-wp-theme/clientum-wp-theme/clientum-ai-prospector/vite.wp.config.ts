/**
 * vite.wp.config.ts
 *
 * Configuración de Vite para compilar la app React como bundle
 * listo para WordPress. Genera:
 *   dist-wp/clientum-prospector.js
 *   dist-wp/clientum-prospector.css
 *
 * Uso:
 *   npx vite build --config clientum-wp-theme/clientum-ai-prospector/vite.wp.config.ts
 *
 * O via script:
 *   npm run build:wp
 */
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],

  root: path.resolve(__dirname, '../../'),   // raíz del proyecto (donde está src/)

  build: {
    outDir:   path.resolve(__dirname, 'dist-wp'),
    emptyOutDir: true,

    lib: {
      // Entry: el adaptador WP en lugar del main.tsx normal
      entry:   path.resolve(__dirname, 'src-wp/wp-adapter.ts'),
      name:    'ClientumProspector',
      formats: ['iife'],           // IIFE para que funcione como script de WP
      fileName: () => 'clientum-prospector.js',
    },

    rollupOptions: {
      // NO externalizar React — queremos un bundle auto-contenido
      output: {
        assetFileNames: 'clientum-prospector.[ext]',
        // Deshabilitar el hash en los nombres de archivo (WP maneja versioning)
        entryFileNames: 'clientum-prospector.js',
        chunkFileNames: 'clientum-prospector-[name].js',
      },
    },

    // Optimizaciones
    minify:        'esbuild',
    sourcemap:     false,
    cssCodeSplit:  false,   // Un solo CSS
    target:        'es2018',
    chunkSizeWarningLimit: 3000,
  },

  resolve: {
    alias: {
      // Debe reflejar el alias del proyecto principal (vite.config.ts): "@" = raíz del repo
      '@': path.resolve(__dirname, '../../'),
    },
  },

  define: {
    'process.env.NODE_ENV': '"production"',
  },
});
