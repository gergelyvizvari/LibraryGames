import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { offline } from './tools/offline/plugin.js'

export default defineConfig({
  // `offline` writes /sw.js at build time, so the app works without a connection.
  plugins: [react(), offline()],
  build: {
    // Paintings stay files, even small ones: the stamps of every game are listed on the home screen's bundle, and
    // inlined they would be downloaded by everyone before the first game opens.
    assetsInlineLimit: (file) => (file.endsWith('.webp') ? false : undefined),
  },
  test: {
    environment: 'jsdom',
  },
})
