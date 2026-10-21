import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify — file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
    build: {
      // Remove console.log in production for cleaner output
      minify: 'esbuild',
      esbuildOptions: { drop: ['console', 'debugger'] },
      target: 'es2020',
      rollupOptions: {
        output: {
          // Intelligent manual chunking to prevent large initial bundles
          manualChunks: (id) => {
            // Firebase — large SDK, only needed after app boot
            if (id.includes('node_modules/firebase') || id.includes('node_modules/@firebase')) {
              return 'firebase';
            }
            // Motion — animation library, lazy-loadable
            if (id.includes('node_modules/motion') || id.includes('node_modules/framer-motion')) {
              return 'motion';
            }
            // TipTap editor — admin only, never on public pages
            if (
              id.includes('node_modules/@tiptap') ||
              id.includes('node_modules/lowlight') ||
              id.includes('node_modules/highlight.js')
            ) {
              return 'editor';
            }
            // Recharts — admin dashboard only
            if (id.includes('node_modules/recharts') || id.includes('node_modules/d3')) {
              return 'charts';
            }
            // Lucide icons — tree-shaken but still sizeable
            if (id.includes('node_modules/lucide-react')) {
              return 'icons';
            }
            // React ecosystem core
            if (id.includes('node_modules/react') || id.includes('node_modules/react-dom') || id.includes('node_modules/react-router')) {
              return 'react-vendor';
            }
          },
        },
      },
    },
  };
});

