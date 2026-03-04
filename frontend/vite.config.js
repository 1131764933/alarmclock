import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000
  },
  resolve: {
    alias: {
      buffer: 'buffer/',
      events: 'events/',
      stream: 'stream/'
    }
  },
  define: {
    global: 'globalThis',
    process: {
      env: {}
    }
  },
  optimizeDeps: {
    include: ['buffer']
  }
})
