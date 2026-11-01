import { useRef, useState, type PointerEvent } from 'react'
import { useLocale } from '../../i18n'
import { usePops, useShake, useTimeouts } from '../../kit/hooks'
import { makeRng } from '../../kit/random'
import { sound, vibrate } from '../../kit/sound'
import type { GameProps } from '../../kit/types'
import { Hud, Pops } from '../../kit/ui'
import { balaton, danube, places, tisza, type Place } from './content'
import { ROUNDS, dotChoices, dotCount, kmBetween, pickRound, placesFor, pointsForKm, projection, showDots, toMap } from './logic'
import { HEIGHT, WIDTH, outline } from './outline'

const line = (pts: [number, number][]) => 'M' + pts.map((p) => toMap(p).map((v) => v.toFixed(1)).join(',')).join('L')
const rivers = [line(danube), line(tisza)]
const lake = line(balaton)

interface Result {
  tap: [number, number] | null
  pts: number
  label: string
}

export default function CountryMap({ level, seed, t, onFinish }: GameProps) {
  const locale = useLocale()
  const all = places[locale] ?? places.en
  const rng = useRef(makeRng(seed)).current
  const [round] = useState(() => pickRound(rng, all, level))
  const dots = showDots(level)
  const makeDots = (target: Place) => (dots ? dotChoices(rng, placesFor(all, level), target, dotCount(level)) : [])
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
    if (gained) addPop(`+${gained}`, (tx / WIDTH) * 100, Math.max(6, (ty / HEIGHT) * 100 - 24))
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

  const pickDot = (p: Place) => {
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
    const lonLat = projection.invert?.([pt.x, pt.y])
    if (!lonLat) return
    const km = Math.round(kmBetween(lonLat as [number, number], target.at))
    const pts = pointsForKm(km)
    const word = pts >= 30 ? t('spotOn') : pts >= 20 ? t('close') : pts > 0 ? t('near') : t('miss')
    finishTurn([pt.x, pt.y], pts, pts >= 30 ? word : `${word} ${t('off', { km })}`)
  }

  return (
    <div className="game country-map">
      <Hud
        items={[
          { label: t('score'), value: score },
          { label: t('round'), value: `${index + 1} / ${ROUNDS}`, highlight: combo >= 3 },
        ]}
      />
      <p className="prompt cm2-ask" key={index}>
        {result ? result.label : t('where', { place: target.name })}
      </p>
      <div className="cm2-wrap" ref={wrapRef}>
        <svg ref={svgRef} viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="cm2-map" onPointerDown={tapMap}>
          <path d={outline} className="cm2-land" />
          {rivers.map((d, i) => (
            <path key={i} d={d} className="cm2-river" />
          ))}
          <path d={lake} className="cm2-lake" />
          {choices.map((p) => {
            const [x, y] = toMap(p.at)
            return (
              <g key={`${index}-${p.name}`} className="cm2-dot" onPointerDown={() => pickDot(p)}>
                <circle cx={x} cy={y} r={42} className="cm2-hit" />
                <circle cx={x} cy={y} r={15} className={result && p === target ? 'cm2-dot-right' : ''} />
              </g>
            )
          })}
          {result && (
            <g className="cm2-answer">
              {result.tap && <line x1={result.tap[0]} y1={result.tap[1]} x2={tx} y2={ty} className="cm2-line" />}
              {result.tap && <circle cx={result.tap[0]} cy={result.tap[1]} r={12} className="cm2-tap" />}
              <circle cx={tx} cy={ty} r={20} className="cm2-target" />
              <text x={Math.min(Math.max(tx, 130), WIDTH - 130)} y={ty < 80 ? ty + 58 : ty - 32} className="cm2-name">
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
