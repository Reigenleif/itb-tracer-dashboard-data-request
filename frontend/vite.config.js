import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    cors: {
      origin: ['https://app.tracerstudyitb.biz.id'],
    },
    allowedHosts: ['app.tracerstudyitb.biz.id'],
  },
})
