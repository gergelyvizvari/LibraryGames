import { useRef, useState, type PointerEvent, type ReactNode } from 'react'
import { usePops, useShake, useTimeouts } from './hooks'
import { ROUNDS, dotChoices, dotCount, kmBetween, pickRound, placesFor, pointsForKm, showDots, type KmBands, type MapPlace } from './mapHunt'
import { makeRng } from './random'
import { sound, vibrate } from './sound'
import type { GameProps } from './types'
import { Hud, Pops } from './ui'

/**
 * A blind map round: ten place names, tap where each one is (or pick a dot on low levels).
 * The game supplies the map; it needs the strings score, round, where, spotOn, close, near, miss and off.
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
  const makeDots = (target: MapPlace) => (dots ? dotChoices(rng, placesFor(places, level), target, dotCount(level), dotGapKm) : [])
  const [index, setIndex] = useState(0)
  const [choices, setChoices] = useState(() => makeDots(round[0]))
  const [result, setResult] = useState<Result | null>(null)
  const [score, setScore] = useState(0)
  const [combo, setCombo] = useState(0)
  const total = useRef(0)
  const svgRef = useRef<SVGSVGElement>(null)
  const [pops, addPop] = usePops()
  const [wrapRef, shake] = useShake<HTMLDivElement>()
  const later = useTimeouts()
  const target = round[index]
  const [tx, ty] = toMap(target.at)

  const finishTurn = (tap: [number, number] | null, pts: number, label: string) => {
    const c = pts >= 20 ? combo + 1 : 0
    const gained = pts + (pts > 0 ? Math.min(c, 5) * 2 : 0)
    total.current += pts / 30
    setCombo(c)
    setScore((s) => s + gained)
    setResult({ tap, pts: gained, label })
    if (pts >= 20) sound.good(c)
    else if (pts > 0) sound.tone(500, 0.12, 'triangle')
    else {
      sound.bad()
      vibrate(40)
      shake()
    }
    if (gained) addPop(`+${gained}`, (tx / width) * 100, Math.max(6, (ty / height) * 100 - 24))
    later(() => {
      const next = index + 1
      if (next >= ROUNDS) {
        onFinish({ score: score + gained, accuracy: total.current / ROUNDS })
        return
      }
      setIndex(next)
      setChoices(makeDots(round[next]))
      setResult(null)
    }, 1600)
  }

  const pickDot = (p: MapPlace) => {
    if (result) return
    if (p === target) finishTurn(null, 30, t('spotOn'))
    else finishTurn(toMap(p.at), 0, t('miss'))
  }

  const tapMap = (e: PointerEvent<SVGSVGElement>) => {
    if (result || dots) return
    const svg = svgRef.current
    const m = svg?.getScreenCTM()
    if (!svg || !m) return
    const pt = new DOMPoint(e.clientX, e.clientY).matrixTransform(m.inverse())
    const lonLat = fromMap([pt.x, pt.y])
    if (!lonLat) return
    const km = Math.round(kmBetween(lonLat, target.at))
    const pts = pointsForKm(km, bands)
    const word = pts >= 30 ? t('spotOn') : pts >= 20 ? t('close') : pts > 0 ? t('near') : t('miss')
    finishTurn([pt.x, pt.y], pts, pts >= 30 ? word : `${word} ${t('off', { km })}`)
  }

  return (
    <div className={`game ${className}`}>
      <Hud
        items={[
          { label: t('score'), value: score },
          { label: t('round'), value: `${index + 1} / ${ROUNDS}`, highlight: combo >= 3 },
        ]}
      />
      <p className="prompt mh-ask" key={index}>
        {result ? result.label : t('where', { place: target.name })}
      </p>
      <div className="mh-wrap" ref={wrapRef}>
        <svg ref={svgRef} viewBox={`0 0 ${width} ${height}`} className="mh-map" onPointerDown={tapMap}>
          {scene(dots)}
          {choices.map((p) => {
            const [x, y] = toMap(p.at)
            return (
              <g key={`${index}-${p.name}`} className="mh-dot" onPointerDown={() => pickDot(p)}>
                <circle cx={x} cy={y} r={42} className="mh-hit" />
                <circle cx={x} cy={y} r={15} className={result && p === target ? 'mh-dot-right' : ''} />
              </g>
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
        <Pops pops={pops} />
      </div>
    </div>
  )
}
