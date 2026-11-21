import { useLocale } from '../../i18n'
import { MapHunt, type PaintedMap } from '../../kit/MapHuntGame'
import type { GameProps } from '../../kit/types'
import cottageTall from './art/cottage-tall.webp'
import cottage from './art/cottage.webp'
import hedgehogHappy from './art/hedgehog-happy.webp'
import hedgehog from './art/hedgehog.webp'
import paper from './art/paper.webp'
import { nationLabels, places } from './content'
import { BANDS, DOT_GAP_KM, fromMap, toMap } from './logic'
import { HEIGHT, INSET, WIDTH, england, neighbours, northernIreland, scotland, shetland, wales } from './outline'

const [ix, iy, iw, ih] = INSET

/** A study in an English country cottage: the map is pinned on the panelled wall, a hedgehog traveller asks. */
const PAINTED: PaintedMap<'wide' | 'tall'> = {
  views: [
    { id: 'wide', painting: cottage, world: { w: 1280, h: 800 }, focus: { x: 0, y: 30, w: 1280, h: 680 }, ground: '#ad6422', sayAt: { x: 150, y: 385 } },
    { id: 'tall', painting: cottageTall, world: { w: 720, h: 1280 }, focus: { x: 15, y: 40, w: 690, h: 1240 }, ground: '#c8803b', sayAt: { x: 430, y: 175 } },
  ],
  paper,
  margin: { x: 0.035, y: 0.025 },
  board: { wide: { x: 500, y: 40, w: 369, h: 580 }, tall: { x: 15, y: 175, w: 690, h: 1085 } },
  guide: { idle: hedgehog, happy: hedgehogHappy, at: { wide: { x: 320, bottom: 700, h: 300 }, tall: { x: 95, bottom: 1272, h: 230 } } },
}

export default function UkMap(props: GameProps) {
  const locale = useLocale()
  const { t } = props
  const scene = (dots: boolean) => (
    <>
      <path d={neighbours} className="ukm-neighbour" />
      <rect x={ix} y={iy} width={iw} height={ih} rx={18} className="ukm-inset" />
      <path d={england} className="ukm-land ukm-england" />
      <path d={wales} className="ukm-land ukm-wales" />
      <path d={scotland} className="ukm-land ukm-scotland" />
      <path d={shetland} className="ukm-land ukm-scotland" />
      <path d={northernIreland} className="ukm-land ukm-ni" />
      {dots &&
        nationLabels.map(({ key, at }) => {
          const [x, y] = toMap([at[0], at[1]])
          // Long names go on two lines: "Northern / Ireland", "Észak- / Írország".
          const lines = t(key).split(/(?<=-)|\s+/)
          return (
            <text key={key} x={x} y={y - (lines.length - 1) * 19} className="ukm-nation">
              {lines.map((l, i) => (
                <tspan key={i} x={x} dy={i ? 38 : 0}>
                  {l}
                </tspan>
              ))}
            </text>
          )
        })}
    </>
  )
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
      className="uk-map"
      scene={scene}
      painted={PAINTED}
    />
  )
}
