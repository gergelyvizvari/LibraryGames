import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/react'
import { polyfillCountryFlagEmojis } from 'country-flag-emoji-polyfill'
import flagFont from 'country-flag-emoji-polyfill/dist/TwemojiCountryFlags.woff2?url'
import { lockZoom } from './kit/zoom'
import { App } from './shell/App'
import './fonts.css'
import './styles.css'

// Windows shows flag emojis as two letters ("HU"); there we load a small flag font from our own server.
polyfillCountryFlagEmojis('Twemoji Country Flags', flagFont)
// No zooming anywhere: kids pinch by accident, and a zoomed game screen jumps around.
lockZoom()

// Saves the app on the device so it opens without a connection (see tools/offline/sw.js). Not in development.
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => navigator.serviceWorker.register('/sw.js').catch(() => {}))
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
    <Analytics />
    <SpeedInsights />
  </StrictMode>,
)
