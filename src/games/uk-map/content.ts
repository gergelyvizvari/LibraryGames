import type { Locale } from '../../i18n'
import type { MapPlace } from '../../kit/mapHunt'

type Row = [en: string, hu: string, lon: number, lat: number, minLevel?: number]

// Cities, towns, islands and landmarks. Most names are the same in both languages;
// Hungarian names that need an article carry it ("a Ben Nevis"), see ADDING_A_GAME.md.
const rows: Row[] = [
  ['London', 'London', -0.13, 51.51],
  ['Edinburgh', 'Edinburgh', -3.19, 55.95],
  ['Cardiff', 'Cardiff', -3.18, 51.48],
  ['Belfast', 'Belfast', -5.93, 54.6],
  ['Manchester', 'Manchester', -2.24, 53.48],
  ['Birmingham', 'Birmingham', -1.9, 52.48],
  ['Liverpool', 'Liverpool', -2.98, 53.41],
  ['Glasgow', 'Glasgow', -4.25, 55.86],
  ['Leeds', 'Leeds', -1.55, 53.8],
  ['Newcastle', 'Newcastle', -1.61, 54.97],
  ['Bristol', 'Bristol', -2.59, 51.45],
  ['Aberdeen', 'Aberdeen', -2.1, 57.15],
  ['Inverness', 'Inverness', -4.22, 57.48],
  ['Oxford', 'Oxford', -1.26, 51.75],
  ['Cambridge', 'Cambridge', 0.12, 52.21],
  ['Brighton', 'Brighton', -0.14, 50.84],
  ['Plymouth', 'Plymouth', -4.13, 50.39],
  ['York', 'York', -1.08, 53.96],
  ['Swansea', 'Swansea', -3.94, 51.62],
  ['Dover', 'Dover', 1.31, 51.13],
  ['Norwich', 'Norwich', 1.3, 52.63],
  ["Land's End", "a Land's End-fok", -5.68, 50.07],
  ['Loch Ness', 'a Loch Ness', -4.45, 57.3],
  ['Stonehenge', 'a Stonehenge', -1.83, 51.18],
  ['Ben Nevis', 'a Ben Nevis', -5.0, 56.8],
  ['Snowdon', 'a Snowdon', -4.08, 53.07],
  ['Sheffield', 'Sheffield', -1.47, 53.38, 3],
  ['Nottingham', 'Nottingham', -1.15, 52.95, 3],
  ['Southampton', 'Southampton', -1.4, 50.9, 3],
  ['Dundee', 'Dundee', -2.97, 56.46, 3],
  ['Exeter', 'Exeter', -3.53, 50.72, 3],
  ['Leicester', 'Leicester', -1.13, 52.64, 3],
  ['Hull', 'Hull', -0.33, 53.74, 3],
  ['Bath', 'Bath', -2.36, 51.38, 3],
  ['Canterbury', 'Canterbury', 1.08, 51.28, 3],
  ['Stirling', 'Stirling', -3.94, 56.12, 3],
  ["John o' Groats", "John o' Groats", -3.07, 58.64, 3],
  ['the Isle of Wight', 'a Wight-sziget', -1.3, 50.67, 3],
  ["the Giant's Causeway", 'az Óriások útja', -6.51, 55.24, 3],
  ['Carlisle', 'Carlisle', -2.93, 54.89, 5],
  ['Coventry', 'Coventry', -1.51, 52.41, 5],
  ['Portsmouth', 'Portsmouth', -1.09, 50.8, 5],
  ['Blackpool', 'Blackpool', -3.05, 53.82, 5],
  ['Stratford-upon-Avon', 'Stratford-upon-Avon', -1.71, 52.19, 5],
  ['Bangor', 'Bangor', -4.13, 53.23, 5],
  ['Aberystwyth', 'Aberystwyth', -4.08, 52.41, 5],
  ['St Andrews', 'St Andrews', -2.8, 56.34, 5],
  ['Fort William', 'Fort William', -5.11, 56.82, 5],
  ['Armagh', 'Armagh', -6.65, 54.35, 5],
  ['Windermere', 'a Windermere-tó', -2.93, 54.37, 5],
  ['the Isle of Skye', 'a Skye-sziget', -6.2, 57.3, 5],
  ['Lough Neagh', 'a Lough Neagh-tó', -6.42, 54.62, 5],
  ['Orkney', 'az Orkney-szigetek', -2.96, 58.98, 7],
  ['Shetland', 'a Shetland-szigetek', -1.15, 60.25, 7],
  ['Anglesey', 'az Anglesey-sziget', -4.35, 53.28, 7],
  ['Lincoln', 'Lincoln', -0.54, 53.23, 7],
  ['Durham', 'Durham', -1.57, 54.78, 7],
  ['Chester', 'Chester', -2.89, 53.19, 7],
  ['Ipswich', 'Ipswich', 1.16, 52.06, 7],
  ['Penzance', 'Penzance', -5.54, 50.12, 7],
  ['Newry', 'Newry', -6.34, 54.18, 7],
  ['Omagh', 'Omagh', -7.3, 54.6, 7],
  ['Perth', 'Perth', -3.43, 56.4, 7],
  ['Stornoway', 'Stornoway', -6.39, 58.21, 7],
  ["Hadrian's Wall", 'a Hadrianus-fal', -2.33, 55.01, 7],
]

const list = (pick: (r: Row) => string): MapPlace[] =>
  rows.map((r) => ({ name: pick(r), at: [r[2], r[3]], minLevel: r[4] ?? 1 }))

export const places: Record<Locale, MapPlace[]> = { en: list((r) => r[0]), hu: list((r) => r[1]) }

/** Where the nation names sit on the low levels, [longitude, latitude]. */
export const nationLabels = [
  { key: 'england', at: [-1.2, 52.0] },
  { key: 'scotland', at: [-3.9, 56.95] },
  { key: 'wales', at: [-3.7, 52.3] },
  { key: 'northernIreland', at: [-6.75, 54.75] },
] as const
