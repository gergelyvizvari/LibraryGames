import type { Locale } from '../../i18n'

export const GROUPS = ['europe', 'asia', 'africa', 'northAmerica', 'southAmerica', 'oceania'] as const
export type Group = (typeof GROUPS)[number]

export interface Country {
  /** ISO 3166 alpha-2 code, used for the flag. */
  iso: string
  group: Group
  /** Lowest level at which it appears. */
  minLevel: number
}

const add = (group: Group, minLevel: number, codes: string) =>
  codes.split(' ').map((iso) => ({ iso, group, minLevel }))

// Level 1 has the flags kids see most; levels 3 and 5 bring in less familiar ones.
export const countries: Country[] = [
  ...add('europe', 1, 'HU FR DE IT GB ES'),
  ...add('europe', 3, 'PL AT NL GR SE PT CH'),
  ...add('europe', 5, 'NO FI IE CZ HR RO BE DK'),
  ...add('asia', 1, 'CN JP IN KR TR'),
  ...add('asia', 3, 'TH VN ID SA PH PK'),
  ...add('asia', 5, 'MN NP MY SG IR KZ'),
  ...add('africa', 1, 'EG ZA KE NG MA'),
  ...add('africa', 3, 'GH ET SN TZ DZ'),
  ...add('africa', 5, 'CM MG TN UG CI'),
  ...add('northAmerica', 1, 'US CA MX JM'),
  ...add('northAmerica', 3, 'CU PA CR GT'),
  ...add('northAmerica', 5, 'HN HT BS SV'),
  ...add('southAmerica', 1, 'BR AR CL CO'),
  ...add('southAmerica', 3, 'PE VE UY EC'),
  ...add('southAmerica', 5, 'BO PY'),
  ...add('oceania', 1, 'AU NZ FJ'),
  ...add('oceania', 3, 'PG WS'),
  ...add('oceania', 5, 'TO VU SB'),
]

export function flag(iso: string) {
  return String.fromCodePoint(...[...iso].map((c) => 0x1f1e6 + c.charCodeAt(0) - 65))
}

// Short, child-friendly names that fit on a card.
export const names: Record<Locale, Record<string, string>> = {
  en: {
    HU: 'Hungary', FR: 'France', DE: 'Germany', IT: 'Italy', GB: 'United Kingdom', ES: 'Spain',
    PL: 'Poland', AT: 'Austria', NL: 'Netherlands', GR: 'Greece', SE: 'Sweden', PT: 'Portugal', CH: 'Switzerland',
    NO: 'Norway', FI: 'Finland', IE: 'Ireland', CZ: 'Czechia', HR: 'Croatia', RO: 'Romania', BE: 'Belgium', DK: 'Denmark',
    CN: 'China', JP: 'Japan', IN: 'India', KR: 'South Korea', TR: 'Turkey',
    TH: 'Thailand', VN: 'Vietnam', ID: 'Indonesia', SA: 'Saudi Arabia', PH: 'Philippines', PK: 'Pakistan',
    MN: 'Mongolia', NP: 'Nepal', MY: 'Malaysia', SG: 'Singapore', IR: 'Iran', KZ: 'Kazakhstan',
    EG: 'Egypt', ZA: 'South Africa', KE: 'Kenya', NG: 'Nigeria', MA: 'Morocco',
    GH: 'Ghana', ET: 'Ethiopia', SN: 'Senegal', TZ: 'Tanzania', DZ: 'Algeria',
    CM: 'Cameroon', MG: 'Madagascar', TN: 'Tunisia', UG: 'Uganda', CI: 'Ivory Coast',
    US: 'USA', CA: 'Canada', MX: 'Mexico', JM: 'Jamaica',
    CU: 'Cuba', PA: 'Panama', CR: 'Costa Rica', GT: 'Guatemala',
    HN: 'Honduras', HT: 'Haiti', BS: 'Bahamas', SV: 'El Salvador',
    BR: 'Brazil', AR: 'Argentina', CL: 'Chile', CO: 'Colombia',
    PE: 'Peru', VE: 'Venezuela', UY: 'Uruguay', EC: 'Ecuador',
    BO: 'Bolivia', PY: 'Paraguay',
    AU: 'Australia', NZ: 'New Zealand', FJ: 'Fiji',
    PG: 'Papua New Guinea', WS: 'Samoa',
    TO: 'Tonga', VU: 'Vanuatu', SB: 'Solomon Islands',
  },
  hu: {
    HU: 'Magyarország', FR: 'Franciaország', DE: 'Németország', IT: 'Olaszország', GB: 'Egyesült Királyság', ES: 'Spanyolország',
    PL: 'Lengyelország', AT: 'Ausztria', NL: 'Hollandia', GR: 'Görögország', SE: 'Svédország', PT: 'Portugália', CH: 'Svájc',
    NO: 'Norvégia', FI: 'Finnország', IE: 'Írország', CZ: 'Csehország', HR: 'Horvátország', RO: 'Románia', BE: 'Belgium', DK: 'Dánia',
    CN: 'Kína', JP: 'Japán', IN: 'India', KR: 'Dél-Korea', TR: 'Törökország',
    TH: 'Thaiföld', VN: 'Vietnám', ID: 'Indonézia', SA: 'Szaúd-Arábia', PH: 'Fülöp-szigetek', PK: 'Pakisztán',
    MN: 'Mongólia', NP: 'Nepál', MY: 'Malajzia', SG: 'Szingapúr', IR: 'Irán', KZ: 'Kazahsztán',
    EG: 'Egyiptom', ZA: 'Dél-Afrika', KE: 'Kenya', NG: 'Nigéria', MA: 'Marokkó',
    GH: 'Ghána', ET: 'Etiópia', SN: 'Szenegál', TZ: 'Tanzánia', DZ: 'Algéria',
    CM: 'Kamerun', MG: 'Madagaszkár', TN: 'Tunézia', UG: 'Uganda', CI: 'Elefántcsontpart',
    US: 'Egyesült Államok', CA: 'Kanada', MX: 'Mexikó', JM: 'Jamaica',
    CU: 'Kuba', PA: 'Panama', CR: 'Costa Rica', GT: 'Guatemala',
    HN: 'Honduras', HT: 'Haiti', BS: 'Bahama-szigetek', SV: 'Salvador',
    BR: 'Brazília', AR: 'Argentína', CL: 'Chile', CO: 'Kolumbia',
    PE: 'Peru', VE: 'Venezuela', UY: 'Uruguay', EC: 'Ecuador',
    BO: 'Bolívia', PY: 'Paraguay',
    AU: 'Ausztrália', NZ: 'Új-Zéland', FJ: 'Fidzsi-szigetek',
    PG: 'Pápua Új-Guinea', WS: 'Szamoa',
    TO: 'Tonga', VU: 'Vanuatu', SB: 'Salamon-szigetek',
  },
}
