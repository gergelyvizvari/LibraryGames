// Visual themes. Each theme is a set of CSS variables in `styles.css` under `[data-theme='<id>']`;
// this module only picks one, remembers it and puts it on <html>.

export const themes = ['light', 'dark', 'contrast'] as const
export type Theme = (typeof themes)[number]

export const themeIcons: Record<Theme, string> = { light: '☀️', dark: '🌙', contrast: '🔳' }
// Browser bar colour on phones, per theme.
const barColors: Record<Theme, string> = { light: '#7c5cff', dark: '#1b1e2b', contrast: '#000000' }

const THEME_KEY = 'lg.theme'

export function loadTheme(): Theme {
  try {
    const saved = localStorage.getItem(THEME_KEY)
    if (saved && (themes as readonly string[]).includes(saved)) return saved as Theme
  } catch {
    // storage unavailable
  }
  return 'light'
}

export function applyTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', barColors[theme])
}

export function setTheme(theme: Theme) {
  applyTheme(theme)
  try {
    localStorage.setItem(THEME_KEY, theme)
  } catch {
    // storage unavailable
  }
}

export function nextTheme(theme: Theme): Theme {
  return themes[(themes.indexOf(theme) + 1) % themes.length]
}

function luminance(hex: string) {
  const n = parseInt(hex.replace('#', '').padEnd(6, '0').slice(0, 6), 16)
  const ch = (v: number) => {
    const c = v / 255
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
  }
  return 0.2126 * ch((n >> 16) & 255) + 0.7152 * ch((n >> 8) & 255) + 0.0722 * ch(n & 255)
}

const DARK_TEXT = '#2d3142'

/** White or dark text, whichever reads better on a game's colour. */
export function textOn(color: string) {
  const l = luminance(color)
  return 1.05 / (l + 0.05) >= (l + 0.05) / (luminance(DARK_TEXT) + 0.05) ? '#fff' : DARK_TEXT
}

/** The CSS variables a game-coloured surface needs: its colour and the text colour on it. */
export function gameColorVars(color: string) {
  return { ['--game-color' as string]: color, ['--game-on' as string]: textOn(color) }
}
