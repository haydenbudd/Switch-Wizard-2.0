import { defineConfig } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

/**
 * WordPress-specific Vite build configuration.
 *
 * Key differences from the default config:
 *  - base is './' (relative) so assets resolve from the plugin directory
 *  - __LM_EMBED_MODE__ flag enables hash-based routing and scoped dark-mode
 *  - outputs to dist-wordpress/ to keep it separate from the GH Pages build
 */
export default defineConfig({
  base: './',
  plugins: [react(), tailwindcss()],
  define: {
    '__LM_EMBED_MODE__': JSON.stringify(true),
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    outDir: 'dist-wordpress',
    rollupOptions: {
      output: {
        entryFileNames: 'assets/app.js',
        chunkFileNames: 'assets/[name].js',
        assetFileNames: 'assets/[name][extname]',
        manualChunks: {
          'vendor-motion': ['motion'],
          'vendor-radix': [
            '@radix-ui/react-dialog',
            '@radix-ui/react-dropdown-menu',
            '@radix-ui/react-select',
            '@radix-ui/react-tabs',
            '@radix-ui/react-tooltip',
            '@radix-ui/react-popover',
          ],
          'vendor-jspdf': ['jspdf'],
        },
      },
    },
  },
})
