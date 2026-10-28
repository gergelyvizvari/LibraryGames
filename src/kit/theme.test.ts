import { beforeEach, describe, expect, it } from 'vitest'
import { loadTheme, nextTheme, setTheme, themes, type Theme } from './theme'

describe('theme', () => {
  beforeEach(() => localStorage.clear())

  it('defaults to light and ignores unknown saved values', () => {
    expect(loadTheme()).toBe('light')
    localStorage.setItem('lg.theme', 'neon')
    expect(loadTheme()).toBe('light')
  })

  it('remembers the chosen theme and puts it on <html>', () => {
    setTheme('dark')
    expect(loadTheme()).toBe('dark')
    expect(document.documentElement.dataset.theme).toBe('dark')
  })

  it('cycles through every theme', () => {
    let t: Theme = themes[0]
    const seen = new Set<string>()
    for (let i = 0; i < themes.length; i++) {
      seen.add(t)
      t = nextTheme(t)
    }
    expect(seen.size).toBe(themes.length)
    expect(t).toBe(themes[0])
  })
})
