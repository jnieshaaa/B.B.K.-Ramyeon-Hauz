import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            // Split Supabase into its own chunk
            if (id.includes('@supabase')) {
              return 'supabase';
            }
            // All other node_modules go to vendor chunk
            return 'vendor';
          }
        }
      }
    }
  }
})
