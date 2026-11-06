import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/react'
import { polyfillCountryFlagEmojis } from 'country-flag-emoji-polyfill'
import flagFont from 'country-flag-emoji-polyfill/dist/TwemojiCountryFlags.woff2?url'
import { applyTheme, loadTheme } from './kit/theme'
import { App } from './shell/App'
import './fonts.css'
import './styles.css'

// Before the first render, so the page never flashes the wrong theme.
applyTheme(loadTheme())
// Windows shows flag emojis as two letters ("HU"); there we load a small flag font from our own server.
polyfillCountryFlagEmojis('Twemoji Country Flags', flagFont)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
    <Analytics />
    <SpeedInsights />
  </StrictMode>,
)
