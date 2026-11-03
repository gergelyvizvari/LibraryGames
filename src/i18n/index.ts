import { createContext, useContext } from 'react'
import en from './en'
import hu from './hu'

// Add a locale: create `xx.ts` with the same keys as `en.ts`, add it to `dictionaries` and to `lang.*` in every
// dictionary, then add an `xx` block to each game's `strings.ts` and `content.ts` (missing keys fall back to English).
export const dictionaries = { en, hu } as const
export type AppKey = keyof typeof en
export type Locale = keyof typeof dictionaries
export const locales = Object.keys(dictionaries) as Locale[]

export type Dict = Record<string, string>
/** Per-game strings: English is required, other locales are optional and partial. */
export type GameStrings = { en: Dict } & Partial<Record<Locale, Dict>>

const LOCALE_KEY = 'lg.locale'

/** A `?lang=hu` link (e.g. from the Hungarian Facebook page) picks the language and remembers it. */
function urlLocale(): Locale | null {
  try {
    const lang = new URLSearchParams(window.location.search).get('lang')
    return lang && lang in dictionaries ? (lang as Locale) : null
  } catch {
    return null
  }
}

export function detectLocale(): Locale {
  const fromUrl = urlLocale()
  if (fromUrl) {
    saveLocale(fromUrl)
    return fromUrl
  }
  try {
    const saved = localStorage.getItem(LOCALE_KEY)
    if (saved && saved in dictionaries) return saved as Locale
  } catch {
    // storage unavailable
  }
  const nav = typeof navigator !== 'undefined' ? navigator.language.slice(0, 2) : 'en'
  return (nav in dictionaries ? nav : 'en') as Locale
}

/** The next language in the list, for the language button on the home screen. */
export function nextLocale(locale: Locale): Locale {
  return locales[(locales.indexOf(locale) + 1) % locales.length]
}

export function saveLocale(locale: Locale) {
  try {
    localStorage.setItem(LOCALE_KEY, locale)
  } catch {
    // storage unavailable
  }
}

/** Replaces `{name}` placeholders with values. */
export function format(text: string, vars?: Record<string, string | number>) {
  if (!vars) return text
  return text.replace(/\{(\w+)\}/g, (m, k) => (k in vars ? String(vars[k]) : m))
}

export function translate(locale: Locale, key: AppKey, vars?: Record<string, string | number>) {
  const dict: Dict = dictionaries[locale]
  return format(dict[key] ?? en[key] ?? key, vars)
}

export function makeGameT(strings: GameStrings, locale: Locale) {
  return (key: string, vars?: Record<string, string | number>) =>
    format(strings[locale]?.[key] ?? strings.en[key] ?? key, vars)
}

export type T = ReturnType<typeof makeGameT>

export const LocaleContext = createContext<Locale>('en')

export function useLocale() {
  return useContext(LocaleContext)
}

export function useT() {
  const locale = useLocale()
  return (key: AppKey, vars?: Record<string, string | number>) => translate(locale, key, vars)
}
