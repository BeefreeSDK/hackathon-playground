import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        // Keep '/api' prefix so frontend requests '/api/...' map to server '/...'
        rewrite: (path) => path.replace(/^\/api/, '')
      },
      '/proxy': {
        target: 'http://localhost:3001',
        changeOrigin: true
      },
      '/v1': {
        target: 'http://localhost:3001',
        changeOrigin: true
      }
    }
  }
})
