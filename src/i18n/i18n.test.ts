import { describe, expect, it } from 'vitest'
import { games } from '../games/registry'
import { detectLocale, dictionaries, locales, makeGameT, nextLocale } from '.'

describe('translations', () => {
  it('every language has every app key', () => {
    locales.forEach((locale) => expect(Object.keys(dictionaries[locale]).sort()).toEqual(Object.keys(dictionaries.en).sort()))
  })

  it('a ?lang= link picks the language and remembers it', () => {
    localStorage.clear()
    window.history.replaceState({}, '', '/?lang=hu')
    expect(detectLocale()).toBe('hu')
    window.history.replaceState({}, '', '/')
    expect(detectLocale()).toBe('hu')
    localStorage.clear()
  })

  it('ignores an unknown ?lang= value', () => {
    localStorage.setItem('lg.locale', 'en')
    window.history.replaceState({}, '', '/?lang=xx')
    expect(detectLocale()).toBe('en')
    window.history.replaceState({}, '', '/')
    localStorage.clear()
  })

  it('the language button cycles through every language', () => {
    expect(locales.map(nextLocale)).toEqual([...locales.slice(1), locales[0]])
  })

  // Every game must be fully translated: a missing key would silently show English in the middle of a Hungarian game.
  it.each(games.flatMap((g) => locales.map((locale) => [g.meta.id, locale, g] as const)))('%s is translated to %s', (_, locale, g) => {
    const dict = g.strings[locale]
    expect(dict).toBeDefined()
    Object.keys(g.strings.en).forEach((key) => expect(dict?.[key], key).toBeTruthy())
    // Placeholders like {score} must survive translation.
    Object.entries(g.strings.en).forEach(([key, text]) => {
      const vars = (s: string) => [...s.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort()
      expect(vars(dict![key]), key).toEqual(vars(text))
    })
    expect(makeGameT(g.strings, locale)('title')).toBe(dict!.title)
  })
})
