import { useRef, useState, type CSSProperties, type PointerEvent, type ReactNode } from 'react'
import { useShake, useTimeouts } from './hooks'
import { DOT_HIT_R, DOT_R, dotChoices, dotCount, dotGapFor, kmBetween, nearestDot, pickRound, placesFor, pointsForKm, showDots, type KmBands, type MapPlace } from './mapHunt'
import { makeRng } from './random'
import { SceneShell, useStage } from './SceneShell'
import { sound } from './sound'
import type { GameProps } from './types'
import { MapStage } from './ui'

/** Places to find in one stage. */
const STAGE = 6

/**
 * A blind map stage: six place names, tap where each one is (or pick a dot on low levels).
 * The game supplies the map; it needs the strings where, spotOn, close, near, miss and off.
 */
export interface MapHuntProps extends GameProps {
  places: MapPlace[]
  width: number
  height: number
  /** [longitude, latitude] to map pixels. */
  toMap: (at: [number, number]) => [number, number]
  /** Map pixels back to [longitude, latitude]. */
  fromMap: (xy: [number, number]) => [number, number] | null
  bands: KmBands
  /** Smallest distance between two dots, in km. */
  dotGapKm: number
  /** Class on the game's root, for its own map styles. */
  className: string
  /** The map itself, drawn under the dots. Gets whether dots are shown. */
  scene: (dots: boolean) => ReactNode
}

interface Result {
  tap: [number, number] | null
  pts: number
  label: string
}

export function MapHunt({ level, seed, t, onFinish, places, width, height, toMap, fromMap, bands, dotGapKm, className, scene }: MapHuntProps) {
  const rng = useRef(makeRng(seed)).current
  const [round] = useState(() => pickRound(rng, places, level))
  const dots = showDots(level)
  const makeDots = (target: MapPlace) => (dots ? dotChoices(rng, placesFor(places, level), target, dotCount(level), dotGapFor(level, dotGapKm)) : [])
  const [index, setIndex] = useState(0)
  const [choices, setChoices] = useState(() => makeDots(round[0]))
  const [result, setResult] = useState<Result | null>(null)
  const stage = useStage(STAGE, onFinish)
  const svgRef = useRef<SVGSVGElement>(null)
  const [wrapRef, shake] = useShake<HTMLDivElement>()
  const later = useTimeouts()
  const target = round[index]
  const [tx, ty] = toMap(target.at)

  const finishTurn = (tap: [number, number] | null, pts: number, label: string) => {
    setResult({ tap, pts, label })
    let last: boolean
    if (pts >= 20) last = stage.good(pts)
    else {
      if (pts > 0) sound.tone(500, 0.12, 'triangle')
      else {
        sound.bad()
        shake()
      }
      last = stage.miss()
    }
    if (last) return
    later(() => {
      const next = index + 1
      setIndex(next)
      setChoices(makeDots(round[next]))
      setResult(null)
    }, 1600)
  }

  const pickDot = (p: MapPlace) => {
    if (p === target) finishTurn(null, 30, t('spotOn'))
    else finishTurn(toMap(p.at), 0, t('miss'))
  }

  // One handler for the whole map: on dot levels the nearest dot wins, so dots close together never steal taps.
  const tapMap = (e: PointerEvent<SVGSVGElement>) => {
    if (result) return
    const m = svgRef.current?.getScreenCTM()
    if (!m) return
    const pt = new DOMPoint(e.clientX, e.clientY).matrixTransform(m.inverse())
    if (dots) {
      const i = nearestDot(choices.map((p) => toMap(p.at)), [pt.x, pt.y], (DOT_HIT_R * width) / 1000)
      if (i >= 0) pickDot(choices[i])
      return
    }
    const lonLat = fromMap([pt.x, pt.y])
    if (!lonLat) return
    const km = Math.round(kmBetween(lonLat, target.at))
    const pts = pointsForKm(km, bands)
    const word = pts >= 30 ? t('spotOn') : pts >= 20 ? t('close') : pts > 0 ? t('near') : t('miss')
    finishTurn([pt.x, pt.y], pts, pts >= 30 ? word : `${word} ${t('off', { km })}`)
  }

  return (
    <SceneShell place="coast" say={result ? result.label : t('where', { place: target.name })} stage={stage} bare fill className={className}>
      <MapStage>
      <div className="mh-wrap map-box" ref={wrapRef} style={{ '--map-ratio': width / height } as CSSProperties}>
        <svg ref={svgRef} viewBox={`0 0 ${width} ${height}`} className="mh-map" onPointerDown={tapMap}>
          {scene(dots)}
          {choices.map((p) => {
            const [x, y] = toMap(p.at)
            return (
              <circle key={`${index}-${p.name}`} cx={x} cy={y} r={DOT_R} className={`mh-dot${result && p === target ? ' mh-dot-right' : ''}`} />
            )
          })}
          {result && (
            <g className="mh-answer">
              {result.tap && <line x1={result.tap[0]} y1={result.tap[1]} x2={tx} y2={ty} className="mh-line" />}
              {result.tap && <circle cx={result.tap[0]} cy={result.tap[1]} r={12} className="mh-tap" />}
              <circle cx={tx} cy={ty} r={20} className="mh-target" />
              <text x={Math.min(Math.max(tx, 130), width - 130)} y={ty < 80 ? ty + 58 : ty - 32} className="mh-name">
                {target.name}
              </text>
            </g>
          )}
        </svg>
      </div>
      </MapStage>
    </SceneShell>
  )
}
