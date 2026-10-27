import type { Locale } from '../../i18n'

export type Region = 'americas' | 'europe' | 'africa' | 'asia'

export interface Country {
  /** Name exactly as in the world-atlas data. */
  atlas: string
  /** ISO 3166 alpha-2 code, used for the flag. */
  iso: string
  region: Region
  /** Lowest level at which it appears. */
  minLevel: number
}

export const countries: Country[] = [
  { atlas: 'Russia', iso: 'RU', region: 'asia', minLevel: 1 },
  { atlas: 'Canada', iso: 'CA', region: 'americas', minLevel: 1 },
  { atlas: 'United States of America', iso: 'US', region: 'americas', minLevel: 1 },
  { atlas: 'Brazil', iso: 'BR', region: 'americas', minLevel: 1 },
  { atlas: 'Australia', iso: 'AU', region: 'asia', minLevel: 1 },
  { atlas: 'China', iso: 'CN', region: 'asia', minLevel: 1 },
  { atlas: 'India', iso: 'IN', region: 'asia', minLevel: 1 },
  { atlas: 'Greenland', iso: 'GL', region: 'americas', minLevel: 1 },
  { atlas: 'Argentina', iso: 'AR', region: 'americas', minLevel: 1 },
  { atlas: 'Mexico', iso: 'MX', region: 'americas', minLevel: 1 },
  { atlas: 'Egypt', iso: 'EG', region: 'africa', minLevel: 1 },
  { atlas: 'South Africa', iso: 'ZA', region: 'africa', minLevel: 1 },
  { atlas: 'Saudi Arabia', iso: 'SA', region: 'africa', minLevel: 3 },
  { atlas: 'Indonesia', iso: 'ID', region: 'asia', minLevel: 3 },
  { atlas: 'Japan', iso: 'JP', region: 'asia', minLevel: 3 },
  { atlas: 'Mongolia', iso: 'MN', region: 'asia', minLevel: 3 },
  { atlas: 'Dem. Rep. Congo', iso: 'CD', region: 'africa', minLevel: 3 },
  { atlas: 'Peru', iso: 'PE', region: 'americas', minLevel: 3 },
  { atlas: 'Iran', iso: 'IR', region: 'africa', minLevel: 3 },
  { atlas: 'Madagascar', iso: 'MG', region: 'africa', minLevel: 3 },
  { atlas: 'Chile', iso: 'CL', region: 'americas', minLevel: 3 },
  { atlas: 'Nigeria', iso: 'NG', region: 'africa', minLevel: 4 },
  { atlas: 'Turkey', iso: 'TR', region: 'europe', minLevel: 4 },
  { atlas: 'New Zealand', iso: 'NZ', region: 'asia', minLevel: 4 },
  { atlas: 'Kenya', iso: 'KE', region: 'africa', minLevel: 5 },
  { atlas: 'Colombia', iso: 'CO', region: 'americas', minLevel: 5 },
  { atlas: 'Thailand', iso: 'TH', region: 'asia', minLevel: 6 },
  { atlas: 'Morocco', iso: 'MA', region: 'africa', minLevel: 6 },
  { atlas: 'France', iso: 'FR', region: 'europe', minLevel: 4 },
  { atlas: 'Germany', iso: 'DE', region: 'europe', minLevel: 4 },
  { atlas: 'Spain', iso: 'ES', region: 'europe', minLevel: 4 },
  { atlas: 'Italy', iso: 'IT', region: 'europe', minLevel: 4 },
  { atlas: 'United Kingdom', iso: 'GB', region: 'europe', minLevel: 4 },
  { atlas: 'Poland', iso: 'PL', region: 'europe', minLevel: 5 },
  { atlas: 'Ukraine', iso: 'UA', region: 'europe', minLevel: 5 },
  { atlas: 'Sweden', iso: 'SE', region: 'europe', minLevel: 5 },
  { atlas: 'Norway', iso: 'NO', region: 'europe', minLevel: 5 },
  { atlas: 'Finland', iso: 'FI', region: 'europe', minLevel: 5 },
  { atlas: 'Portugal', iso: 'PT', region: 'europe', minLevel: 5 },
  { atlas: 'Greece', iso: 'GR', region: 'europe', minLevel: 5 },
  { atlas: 'Iceland', iso: 'IS', region: 'europe', minLevel: 5 },
  { atlas: 'Ireland', iso: 'IE', region: 'europe', minLevel: 6 },
  { atlas: 'Hungary', iso: 'HU', region: 'europe', minLevel: 6 },
  { atlas: 'Romania', iso: 'RO', region: 'europe', minLevel: 6 },
  { atlas: 'Netherlands', iso: 'NL', region: 'europe', minLevel: 7 },
  { atlas: 'Belgium', iso: 'BE', region: 'europe', minLevel: 7 },
  { atlas: 'Switzerland', iso: 'CH', region: 'europe', minLevel: 7 },
  { atlas: 'Austria', iso: 'AT', region: 'europe', minLevel: 7 },
  { atlas: 'Czechia', iso: 'CZ', region: 'europe', minLevel: 7 },
  { atlas: 'Denmark', iso: 'DK', region: 'europe', minLevel: 7 },
  { atlas: 'Croatia', iso: 'HR', region: 'europe', minLevel: 8 },
  { atlas: 'Serbia', iso: 'RS', region: 'europe', minLevel: 8 },
  { atlas: 'Bulgaria', iso: 'BG', region: 'europe', minLevel: 8 },
  { atlas: 'Slovakia', iso: 'SK', region: 'europe', minLevel: 8 },
]

/** Display names. Missing ones fall back to English. */
export const names: { en: Record<string, string> } & Partial<Record<Locale, Record<string, string>>> = {
  en: {
    'United States of America': 'the USA',
    'United Kingdom': 'the United Kingdom',
    'Dem. Rep. Congo': 'DR Congo',
    Netherlands: 'the Netherlands',
  },
}

export function displayName(atlas: string, locale: Locale) {
  return names[locale]?.[atlas] ?? names.en[atlas] ?? atlas
}

export function flag(iso: string) {
  return String.fromCodePoint(...[...iso].map((c) => 0x1f1e6 + c.charCodeAt(0) - 65))
}
