import { useLocale } from '../../i18n'
import { MapHunt } from '../../kit/MapHuntGame'
import type { GameProps } from '../../kit/types'
import { balaton, danube, places, tisza } from './content'
import { BANDS, DOT_GAP_KM, fromMap, toMap } from './logic'
import { HEIGHT, WIDTH, outline } from './outline'

const line = (pts: [number, number][]) => 'M' + pts.map((p) => toMap(p).map((v) => v.toFixed(1)).join(',')).join('L')
const rivers = [line(danube), line(tisza)]
const lake = line(balaton)

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
    />
  )
}
