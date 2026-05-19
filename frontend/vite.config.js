import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const backendPort = process.env.NEREOHUB_PORT || '8888'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 9999,
    proxy: {
      '/api': {
        target: `http://localhost:${backendPort}`,
        changeOrigin: true
      }
    }
  }
})
