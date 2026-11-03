import { createContext, useContext } from 'react';
import en from './en';
import hu from './hu';
// Add a locale: create `xx.ts` with the same keys as `en.ts`, add it to `dictionaries` and to `lang.*` in every
// dictionary, then add an `xx` block to each game's `strings.ts` and `content.ts` (missing keys fall back to English).
export const dictionaries = { en, hu };
export const locales = Object.keys(dictionaries);
const LOCALE_KEY = 'lg.locale';
export function detectLocale() {
    try {
        const saved = localStorage.getItem(LOCALE_KEY);
        if (saved && saved in dictionaries)
            return saved;
    }
    catch {
        // storage unavailable
    }
    const nav = typeof navigator !== 'undefined' ? navigator.language.slice(0, 2) : 'en';
    return (nav in dictionaries ? nav : 'en');
}
/** The next language in the list, for the language button on the home screen. */
export function nextLocale(locale) {
    return locales[(locales.indexOf(locale) + 1) % locales.length];
}
export function saveLocale(locale) {
    try {
        localStorage.setItem(LOCALE_KEY, locale);
    }
    catch {
        // storage unavailable
    }
}
/** Replaces `{name}` placeholders with values. */
export function format(text, vars) {
    if (!vars)
        return text;
    return text.replace(/\{(\w+)\}/g, (m, k) => (k in vars ? String(vars[k]) : m));
}
export function translate(locale, key, vars) {
    const dict = dictionaries[locale];
    return format(dict[key] ?? en[key] ?? key, vars);
}
export function makeGameT(strings, locale) {
    return (key, vars) => format(strings[locale]?.[key] ?? strings.en[key] ?? key, vars);
}
export const LocaleContext = createContext('en');
export function useLocale() {
    return useContext(LocaleContext);
}
export function useT() {
    const locale = useLocale();
    return (key, vars) => translate(locale, key, vars);
}
