import { defineConfig } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/Switch-Wizard-2.0/',
  plugins: [
    // The React and Tailwind plugins are both required for Make, even if
    // Tailwind is not being actively used – do not remove them
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      // Alias @ to the src directory
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    rollupOptions: {
      output: {
        entryFileNames: 'assets/app.js',
        chunkFileNames: 'assets/[name].js',
        assetFileNames: 'assets/[name][extname]',
        manualChunks: {
          'vendor-motion': ['motion'],
          // Only the Radix packages the wizard itself loads eagerly.
          // Admin-only packages (e.g. react-select) must NOT be listed:
          // the object form of manualChunks pulls listed modules into an
          // eagerly-preloaded chunk even when their only importer is a
          // lazy route. Same reason jspdf is absent — listing it forced
          // 382KB into the static graph despite its dynamic import.
          'vendor-radix': [
            '@radix-ui/react-dialog',
            '@radix-ui/react-dropdown-menu',
          ],
        },
      },
    },
  },
})
