import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss()
  ],
  server: {
    port: 5173,
    proxy: {
      // Optional convenience proxy if needed, though direct API gateway http://localhost:8080 is used
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true
      }
    }
  }
})
