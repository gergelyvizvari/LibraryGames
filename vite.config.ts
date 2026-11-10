import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { offline } from './tools/offline/plugin.js'

export default defineConfig({
  // `offline` writes /sw.js at build time, so the app works without a connection.
  plugins: [react(), offline()],
  test: {
    environment: 'jsdom',
  },
})
