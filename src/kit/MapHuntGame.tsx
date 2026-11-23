import { useRef, useState, type CSSProperties, type PointerEvent, type ReactNode } from 'react'
import { useShake, useTimeouts } from './hooks'
import { DOT_HIT_R, DOT_R, dotChoices, dotCount, dotGapFor, kmBetween, nearestDot, pickRound, placesFor, pointsForKm, showDots, type KmBands, type MapPlace } from './mapHunt'
import { PaintedScene, worldStyle, type Box, type PaintedView } from './painted'
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
  /** A painted room instead of the drawn one: the map lies on a painted sheet of paper pinned in it. */
  painted?: PaintedMap
}

/** Where things are in a painted map room, per view of the room. */
export interface PaintedMap<Id extends string = string> {
  views: PaintedView<Id>[]
  /** The painted sheet of paper the map is drawn on, and the share of its width and height left as margin. */
  paper: string
  margin: { x: number; y: number }
  /** Where the sheet hangs in each view, in world units. */
  board: Record<Id, Box>
  /** The character who asks: its calm and its happy picture, and where it stands in each view. */
  guide: { idle: string; happy: string; at: Record<Id, { x: number; bottom: number; h: number }> }
}

interface Result {
  tap: [number, number] | null
  pts: number
  label: string
}

export function MapHunt({ level, seed, t, onFinish, places, width, height, toMap, fromMap, bands, dotGapKm, className, scene, painted }: MapHuntProps) {
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

  const say = result ? result.label : t('where', { place: target.name })
  const map = (
    <svg ref={svgRef} viewBox={`0 0 ${width} ${height}`} className="mh-map" onPointerDown={tapMap}>
      {scene(dots)}
      {choices.map((p) => {
        const [x, y] = toMap(p.at)
        return <circle key={`${index}-${p.name}`} cx={x} cy={y} r={DOT_R} className={`mh-dot${result && p === target ? ' mh-dot-right' : ''}`} />
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
  )

  if (painted) {
    const happy = !!result && result.pts >= 20
    return (
      <PaintedScene views={painted.views} say={say} stage={stage} className={`mh-painted ${className}`}>
        {(view) => {
          const b = painted.board[view]
          const g = painted.guide.at[view]
          return (
            <>
              <div className="mh-board" ref={wrapRef} style={{ left: b.x, top: b.y, width: b.w, height: b.h }}>
                <img className="mh-paper" src={painted.paper} alt="" draggable={false} />
                <div className="mh-sheet" style={{ inset: `${painted.margin.y * 100}% ${painted.margin.x * 100}%` }}>
                  {map}
                </div>
              </div>
              {/* The guide stands in front of the map's edge. */}
              <div className={`mh-guide${happy ? ' mh-happy' : ''}`} style={worldStyle(g.x, g.bottom, g.h)}>
                <img src={painted.guide.idle} alt="" draggable={false} className={happy ? 'mh-off' : ''} />
                <img src={painted.guide.happy} alt="" draggable={false} className={happy ? '' : 'mh-off'} />
              </div>
            </>
          )
        }}
      </PaintedScene>
    )
  }

  return (
    <SceneShell place="coast" say={say} stage={stage} bare fill className={className}>
      <MapStage>
        <div className="mh-wrap map-box" ref={wrapRef} style={{ '--map-ratio': width / height } as CSSProperties}>
          {map}
        </div>
      </MapStage>
    </SceneShell>
  )
}
