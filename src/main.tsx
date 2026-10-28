import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Analytics } from '@vercel/analytics/react'
import { applyTheme, loadTheme } from './kit/theme'
import { App } from './shell/App'
import './styles.css'

// Before the first render, so the page never flashes the wrong theme.
applyTheme(loadTheme())

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
    <Analytics />
  </StrictMode>,
)
