import type { Locale } from '../../i18n'

export interface Country {
  name: string
  iso: string
  capital: string
  minLevel: number
}

export const countries: { en: Country[] } & Partial<Record<Locale, Country[]>> = {
  en: [
    { name: 'France', iso: 'FR', capital: 'Paris', minLevel: 1 },
    { name: 'the United Kingdom', iso: 'GB', capital: 'London', minLevel: 1 },
    { name: 'Italy', iso: 'IT', capital: 'Rome', minLevel: 1 },
    { name: 'Spain', iso: 'ES', capital: 'Madrid', minLevel: 1 },
    { name: 'Germany', iso: 'DE', capital: 'Berlin', minLevel: 1 },
    { name: 'Japan', iso: 'JP', capital: 'Tokyo', minLevel: 1 },
    { name: 'Hungary', iso: 'HU', capital: 'Budapest', minLevel: 1 },
    { name: 'the USA', iso: 'US', capital: 'Washington', minLevel: 1 },
    { name: 'Egypt', iso: 'EG', capital: 'Cairo', minLevel: 1 },
    { name: 'Russia', iso: 'RU', capital: 'Moscow', minLevel: 1 },
    { name: 'China', iso: 'CN', capital: 'Beijing', minLevel: 2 },
    { name: 'Greece', iso: 'GR', capital: 'Athens', minLevel: 2 },
    { name: 'Austria', iso: 'AT', capital: 'Vienna', minLevel: 2 },
    { name: 'Portugal', iso: 'PT', capital: 'Lisbon', minLevel: 2 },
    { name: 'Ireland', iso: 'IE', capital: 'Dublin', minLevel: 3 },
    { name: 'the Netherlands', iso: 'NL', capital: 'Amsterdam', minLevel: 3 },
    { name: 'Poland', iso: 'PL', capital: 'Warsaw', minLevel: 3 },
    { name: 'Mexico', iso: 'MX', capital: 'Mexico City', minLevel: 3 },
    { name: 'India', iso: 'IN', capital: 'New Delhi', minLevel: 3 },
    { name: 'Norway', iso: 'NO', capital: 'Oslo', minLevel: 4 },
    { name: 'Sweden', iso: 'SE', capital: 'Stockholm', minLevel: 4 },
    { name: 'Czechia', iso: 'CZ', capital: 'Prague', minLevel: 4 },
    { name: 'Argentina', iso: 'AR', capital: 'Buenos Aires', minLevel: 4 },
    { name: 'Kenya', iso: 'KE', capital: 'Nairobi', minLevel: 5 },
    { name: 'Canada', iso: 'CA', capital: 'Ottawa', minLevel: 5 },
    { name: 'Australia', iso: 'AU', capital: 'Canberra', minLevel: 5 },
    { name: 'Brazil', iso: 'BR', capital: 'Brasília', minLevel: 6 },
    { name: 'Turkey', iso: 'TR', capital: 'Ankara', minLevel: 6 },
    { name: 'Switzerland', iso: 'CH', capital: 'Bern', minLevel: 6 },
    { name: 'Finland', iso: 'FI', capital: 'Helsinki', minLevel: 6 },
    { name: 'Croatia', iso: 'HR', capital: 'Zagreb', minLevel: 7 },
    { name: 'Romania', iso: 'RO', capital: 'Bucharest', minLevel: 7 },
    { name: 'South Korea', iso: 'KR', capital: 'Seoul', minLevel: 7 },
    { name: 'Thailand', iso: 'TH', capital: 'Bangkok', minLevel: 7 },
    { name: 'Morocco', iso: 'MA', capital: 'Rabat', minLevel: 8 },
    { name: 'Peru', iso: 'PE', capital: 'Lima', minLevel: 8 },
  ],
}

export function flag(iso: string) {
  return String.fromCodePoint(...[...iso].map((c) => 0x1f1e6 + c.charCodeAt(0) - 65))
}
