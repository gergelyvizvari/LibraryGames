import type { Locale } from '../../i18n'

export type Kind = 'river' | 'mountain' | 'sea' | 'lake'
type P = [number, number]

export interface Feature {
  id: string
  kind: Kind
  /** A point on the feature, [longitude, latitude]: where its dot sits on easy levels. */
  at: P
  /** The river's course, the mountain ridge or the long axis of a sea, [longitude, latitude]. */
  line?: P[]
  minLevel: number
}

// Rivers and ridges are traced through towns and peaks along them, close enough for a map the size of a phone.
export const features: Feature[] = [
  // Level 1: the big ones every school map shows.
  { id: 'danube', kind: 'river', minLevel: 1, at: [19.05, 47.5], line: [[8.5, 47.95], [10, 48.4], [12.1, 49], [13.45, 48.57], [14.3, 48.3], [16.37, 48.2], [17.1, 48.15], [17.6, 47.75], [18.75, 47.8], [19.1, 47.8], [19.05, 47.5], [18.7, 46], [19, 45.35], [19.85, 45.25], [20.45, 44.8], [22.5, 44.6], [22.9, 44], [24.5, 43.7], [25.95, 43.85], [27.3, 44.1], [27.95, 45.25], [28.05, 45.45], [29.6, 45.2]] },
  { id: 'rhine', kind: 'river', minLevel: 1, at: [7.6, 50.36], line: [[8.65, 46.65], [9.5, 46.85], [9.4, 47.6], [7.6, 47.56], [7.8, 48.6], [8.45, 49.5], [8.27, 50], [7.6, 50.36], [7.1, 50.73], [6.96, 50.94], [6.77, 51.23], [6.2, 51.83], [4.1, 51.95]] },
  { id: 'thames', kind: 'river', minLevel: 1, at: [-0.97, 51.46], line: [[-2, 51.7], [-1.25, 51.75], [-0.97, 51.46], [-0.1, 51.5], [0.8, 51.5]] },
  { id: 'seine', kind: 'river', minLevel: 1, at: [2.35, 48.85], line: [[4.7, 47.5], [4.07, 48.3], [3, 48.4], [2.35, 48.85], [1.1, 49.44], [0.1, 49.45]] },
  { id: 'tisza', kind: 'river', minLevel: 1, at: [20.2, 47.18], line: [[24.2, 48.05], [23.3, 48.2], [22.2, 48.15], [21.4, 48.12], [20.75, 47.6], [20.2, 47.18], [20.1, 46.7], [20.15, 46.25], [20.1, 45.6], [20.3, 45.2]] },
  { id: 'alps', kind: 'mountain', minLevel: 1, at: [10.5, 46.6], line: [[7, 44.2], [7, 45.4], [6.86, 45.83], [7.8, 46], [9, 46.4], [10.5, 46.6], [12, 47], [13.5, 47.2], [15.5, 47.6], [16, 48]] },
  { id: 'pyrenees', kind: 'mountain', minLevel: 1, at: [0.8, 42.7], line: [[-1.8, 43.2], [0, 42.75], [1.5, 42.6], [3.1, 42.45]] },
  { id: 'carpathians', kind: 'mountain', minLevel: 1, at: [24, 48.3], line: [[17.2, 48.4], [18.5, 49.1], [20, 49.2], [22, 49.3], [24, 48.3], [25.5, 47.5], [26, 46], [25.3, 45.4], [23, 45.4], [22.3, 44.7]] },
  { id: 'apennines', kind: 'mountain', minLevel: 1, at: [13, 42.7], line: [[8.5, 44.4], [10.5, 44.2], [12.5, 43.2], [13.5, 42.2], [15, 41], [16, 39.5], [16, 38.2]] },
  { id: 'scandes', kind: 'mountain', minLevel: 1, at: [12.5, 64.5], line: [[5.5, 59.5], [7.5, 61], [9.5, 62.5], [12.5, 64.5], [16, 67.5], [19.5, 69]] },
  { id: 'mediterranean', kind: 'sea', minLevel: 1, at: [18, 35], line: [[-4, 36.2], [3, 38.5], [10, 38], [18, 35], [25, 34], [32, 34]] },
  { id: 'northSea', kind: 'sea', minLevel: 1, at: [3.5, 56], line: [[3, 52.8], [3.5, 56], [3, 59]] },
  { id: 'baltic', kind: 'sea', minLevel: 1, at: [19, 57], line: [[13.5, 54.8], [17, 55.5], [19, 57], [20, 59], [21, 62], [23, 65]] },
  { id: 'blackSea', kind: 'sea', minLevel: 1, at: [34, 43.3], line: [[29.5, 43.5], [34, 43.3], [39, 42.5]] },
  { id: 'adriatic', kind: 'sea', minLevel: 1, at: [15, 43.4], line: [[13, 45.3], [15, 43.4], [18.5, 41.5]] },
  { id: 'atlantic', kind: 'sea', minLevel: 1, at: [-10.5, 48], line: [[-10.5, 37], [-10.8, 43], [-10.5, 48], [-10.8, 55]] },
  { id: 'balaton', kind: 'lake', minLevel: 1, at: [17.7, 46.83], line: [[17.3, 46.73], [17.7, 46.83], [18.1, 46.97]] },
  { id: 'etna', kind: 'mountain', minLevel: 1, at: [15, 37.75] },
  // Level 3.
  { id: 'loire', kind: 'river', minLevel: 3, at: [0.7, 47.4], line: [[4.2, 44.85], [4, 46], [3.16, 47], [1.9, 47.9], [0.7, 47.4], [-1.55, 47.2], [-2.2, 47.27]] },
  { id: 'elbe', kind: 'river', minLevel: 3, at: [11.63, 52.13], line: [[15.5, 50.7], [15.8, 50.2], [14.4, 50.35], [13.74, 51.05], [11.63, 52.13], [10, 53.55], [8.7, 53.87]] },
  { id: 'vistula', kind: 'river', minLevel: 3, at: [21, 52.23], line: [[18.95, 49.6], [19.94, 50.06], [21.6, 50.6], [21, 52.23], [18.6, 53], [18.95, 54.35]] },
  { id: 'po', kind: 'river', minLevel: 3, at: [10, 45.13], line: [[7.1, 44.7], [7.7, 45.07], [9.7, 45.05], [10, 45.13], [11.6, 44.9], [12.4, 44.95]] },
  { id: 'dnieper', kind: 'river', minLevel: 3, at: [30.52, 50.45], line: [[32.9, 55.9], [32.05, 54.78], [30.3, 53], [30.52, 50.45], [33.4, 49.07], [35.05, 48.45], [35.15, 47.85], [33.6, 46.75], [32.6, 46.63], [31.9, 46.5]] },
  { id: 'oder', kind: 'river', minLevel: 3, at: [14.6, 52.35], line: [[17.6, 49.65], [18.2, 49.9], [17.9, 50.67], [17.03, 51.1], [16.1, 51.9], [15.0, 52.0], [14.6, 52.35], [14.3, 53.0], [14.55, 53.45], [14.3, 53.8]] },
  { id: 'caucasus', kind: 'mountain', minLevel: 3, at: [41, 43.4], line: [[38, 44.3], [41, 43.4], [42.5, 43.1]] },
  { id: 'balkanMts', kind: 'mountain', minLevel: 3, at: [24.5, 42.8], line: [[22.5, 43.6], [24.5, 42.8], [26.5, 42.7], [27.8, 42.7]] },
  { id: 'montBlanc', kind: 'mountain', minLevel: 1, at: [6.86, 45.83] },
  { id: 'vesuvius', kind: 'mountain', minLevel: 1, at: [14.43, 40.82] },
  { id: 'aegean', kind: 'sea', minLevel: 3, at: [25, 38.5], line: [[24.5, 40.2], [25, 38.5], [25.5, 36.8]] },
  { id: 'channel', kind: 'sea', minLevel: 1, at: [-1.5, 50.2], line: [[-4.5, 49.7], [-1.5, 50.2], [1.3, 50.9]] },
  { id: 'biscay', kind: 'sea', minLevel: 3, at: [-4, 45] },
  { id: 'geneva', kind: 'lake', minLevel: 3, at: [6.55, 46.45] },
  // Level 5.
  { id: 'rhone', kind: 'river', minLevel: 5, at: [4.83, 45.76], line: [[8.37, 46.57], [7.36, 46.23], [6.6, 46.45], [6.15, 46.2], [4.83, 45.76], [4.9, 44.93], [4.8, 43.95], [4.63, 43.68], [4.6, 43.35]] },
  { id: 'ebro', kind: 'river', minLevel: 5, at: [-0.88, 41.65], line: [[-4.1, 43], [-2.45, 42.47], [-0.88, 41.65], [0.52, 40.8], [0.87, 40.7]] },
  { id: 'tagus', kind: 'river', minLevel: 5, at: [-6.9, 39.72], line: [[-1.7, 40.3], [-4.02, 39.86], [-6.9, 39.72], [-8.68, 39.23], [-9.15, 38.7]] },
  { id: 'dinaric', kind: 'mountain', minLevel: 5, at: [16.5, 44], line: [[14.5, 45.6], [16.5, 44], [18.5, 42.9], [19.8, 42]] },
  { id: 'kekes', kind: 'mountain', minLevel: 5, at: [20.01, 47.87] },
  { id: 'norwegianSea', kind: 'sea', minLevel: 5, at: [5, 68], line: [[1, 64], [5, 68], [11, 71]] },
  { id: 'irishSea', kind: 'sea', minLevel: 5, at: [-5, 53.8] },
  { id: 'tyrrhenian', kind: 'sea', minLevel: 5, at: [11.5, 40] },
  { id: 'ladoga', kind: 'lake', minLevel: 5, at: [31.5, 60.9] },
]

// English names carry "the" where English says it, so the question reads "Find the Danube on the map!".
// Hungarian names go without an article: "Keresd meg a térképen: Duna!".
export const names: Record<Locale, Record<string, string>> = {
  en: {
    danube: 'the Danube', rhine: 'the Rhine', thames: 'the Thames', seine: 'the Seine', tisza: 'the Tisza',
    alps: 'the Alps', pyrenees: 'the Pyrenees', carpathians: 'the Carpathians', apennines: 'the Apennines',
    scandes: 'the Scandinavian Mountains', mediterranean: 'the Mediterranean Sea', northSea: 'the North Sea', baltic: 'the Baltic Sea',
    blackSea: 'the Black Sea', adriatic: 'the Adriatic Sea', atlantic: 'the Atlantic Ocean', 
    balaton: 'Lake Balaton', etna: 'Mount Etna',
    loire: 'the Loire', elbe: 'the Elbe', vistula: 'the Vistula', po: 'the Po', oder: 'the Oder', dnieper: 'the Dnieper', caucasus: 'the Caucasus',
    balkanMts: 'the Balkan Mountains', montBlanc: 'Mont Blanc', vesuvius: 'Mount Vesuvius', aegean: 'the Aegean Sea',
    channel: 'the English Channel', biscay: 'the Bay of Biscay', geneva: 'Lake Geneva',
    rhone: 'the Rhône', ebro: 'the Ebro', tagus: 'the Tagus', dinaric: 'the Dinaric Alps', kekes: 'Kékes, the top of Hungary',
    norwegianSea: 'the Norwegian Sea', irishSea: 'the Irish Sea', tyrrhenian: 'the Tyrrhenian Sea', ladoga: 'Lake Ladoga',
  },
  hu: {
    danube: 'Duna', rhine: 'Rajna', thames: 'Temze', seine: 'Szajna', tisza: 'Tisza',
    alps: 'Alpok', pyrenees: 'Pireneusok', carpathians: 'Kárpátok', apennines: 'Appenninek',
    scandes: 'Skandináv-hegység', mediterranean: 'Földközi-tenger', northSea: 'Északi-tenger', baltic: 'Balti-tenger',
    blackSea: 'Fekete-tenger', adriatic: 'Adriai-tenger', atlantic: 'Atlanti-óceán', 
    balaton: 'Balaton', etna: 'Etna',
    loire: 'Loire', elbe: 'Elba', vistula: 'Visztula', po: 'Pó', oder: 'Odera', dnieper: 'Dnyeper', caucasus: 'Kaukázus',
    balkanMts: 'Balkán-hegység', montBlanc: 'Mont Blanc', vesuvius: 'Vezúv', aegean: 'Égei-tenger',
    channel: 'La Manche', biscay: 'Vizcayai-öböl', geneva: 'Genfi-tó',
    rhone: 'Rhône', ebro: 'Ebro', tagus: 'Tajo', dinaric: 'Dinári-hegység', kekes: 'Kékes',
    norwegianSea: 'Norvég-tenger', irishSea: 'Ír-tenger', tyrrhenian: 'Tirrén-tenger', ladoga: 'Ladoga-tó',
  },
}
