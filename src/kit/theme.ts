// Visual themes. Each theme is a set of CSS variables in `styles.css` under `[data-theme='<id>']`;
// this module only picks one, remembers it and puts it on <html>.

export const themes = ['light', 'dark', 'contrast'] as const
export type Theme = (typeof themes)[number]

export const themeIcons: Record<Theme, string> = { light: '☀️', dark: '🌙', contrast: '🔳' }
// Browser bar colour on phones, per theme.
const barColors: Record<Theme, string> = { light: '#6c5ce7', dark: '#1b1e2b', contrast: '#000000' }

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
