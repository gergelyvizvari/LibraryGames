import { useLocale } from '../../i18n'
import { MapHunt } from '../../kit/MapHuntGame'
import type { GameProps } from '../../kit/types'
import { nationLabels, places } from './content'
import { BANDS, DOT_GAP_KM, fromMap, toMap } from './logic'
import { HEIGHT, INSET, WIDTH, england, neighbours, northernIreland, scotland, shetland, wales } from './outline'

const [ix, iy, iw, ih] = INSET

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
    />
  )
}
