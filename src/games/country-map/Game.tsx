import { useLocale } from '../../i18n'
import { MapHunt, type PaintedMap } from '../../kit/MapHuntGame'
import type { GameProps } from '../../kit/types'
import paper from './art/paper.webp'
import storkHappy from './art/stork-happy.webp'
import stork from './art/stork.webp'
import studyTall from './art/study-tall.webp'
import study from './art/study.webp'
import { balaton, danube, places, tisza } from './content'
import { BANDS, DOT_GAP_KM, fromMap, toMap } from './logic'
import { HEIGHT, WIDTH, outline } from './outline'

const line = (pts: [number, number][]) => 'M' + pts.map((p) => toMap(p).map((v) => v.toFixed(1)).join(',')).join('L')
const rivers = [line(danube), line(tisza)]
const lake = line(balaton)

/** A traveller's attic: the map is pinned on the wall, the stork explorer asks the questions. */
const PAINTED: PaintedMap<'wide' | 'tall'> = {
  views: [
    { id: 'wide', painting: study, world: { w: 1280, h: 800 }, focus: { x: 0, y: 70, w: 1280, h: 640 }, ground: '#984825', sayAt: { x: 150, y: 300 } },
    { id: 'tall', painting: studyTall, world: { w: 720, h: 1280 }, focus: { x: 12, y: 380, w: 696, h: 870 }, ground: '#db833b', sayAt: { x: 360, y: 968 } },
  ],
  paper,
  margin: { x: 0.035, y: 0.045 },
  board: { wide: { x: 290, y: 85, w: 800, h: 508 }, tall: { x: 12, y: 410, w: 696, h: 442 } },
  guide: { idle: stork, happy: storkHappy, at: { wide: { x: 150, bottom: 690, h: 380 }, tall: { x: 360, bottom: 1272, h: 300 } } },
}

const scene = () => (
  <>
    <path d={outline} className="cm2-land" />
    {rivers.map((d, i) => (
      <path key={i} d={d} className="cm2-river" />
    ))}
    <path d={lake} className="cm2-lake" />
  </>
)

export default function CountryMap(props: GameProps) {
  const locale = useLocale()
  return (
    <MapHunt
      {...props}
      places={places[locale] ?? places.en}
      width={WIDTH}
      height={HEIGHT}
      toMap={toMap}
      fromMap={fromMap}
      bands={BANDS}
      dotGapKm={DOT_GAP_KM}
      className="country-map"
      scene={scene}
      painted={PAINTED}
    />
  )
}
