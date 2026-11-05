import { useEffect, useRef, useState, type PointerEvent } from 'react'
import { useLocale } from '../../i18n'
import { usePops, useShake, useTimeouts } from '../../kit/hooks'
import { ROUNDS, dotChoices, dotCount, pickRound, placesFor as poolFor, pointsForKm, showDots } from '../../kit/mapHunt'
import { makeRng } from '../../kit/random'
import { sound, vibrate } from '../../kit/sound'
import type { GameProps } from '../../kit/types'
import { Hud, Pops } from '../../kit/ui'
import { features, type Feature } from './content'
import { BANDS, DOT_GAP_KM, kmToFeature, placesFor, type FeaturePlace } from './logic'
import { HEIGHT, WIDTH, fromMap, linePath, loadLand, toMap } from './map'

const KIND_ICON: Record<Feature['kind'], string> = { river: '〰️', mountain: '⛰️', sea: '🌊', lake: '💧' }

interface Result {
  tap: [number, number] | null
  pts: number
  label: string
}

/** One river, ridge, peak or lake as it is always drawn on the blind map. */
function Mark({ f, className = '' }: { f: Feature; className?: string }) {
  if (f.kind === 'sea') return null
  if (f.line) return <path d={linePath(f.line)} className={`rm-${f.kind} ${className}`} />
  const [x, y] = toMap(f.at)
  if (f.kind === 'lake') return <circle cx={x} cy={y} r={9} className={`rm-lake-dot ${className}`} />
  return <path d={`M${x - 13},${y + 10} L${x},${y - 13} L${x + 13},${y + 10} Z`} className={`rm-peak ${className}`} />
}

export default function RiverMountain({ level, seed, t, onFinish }: GameProps) {
  const locale = useLocale()
  const places = useRef(placesFor(locale)).current
  const rng = useRef(makeRng(seed)).current
  const [round] = useState(() => pickRound(rng, places, level))
  const dots = showDots(level)
  const makeDots = (target: FeaturePlace) => (dots ? dotChoices(rng, poolFor(places, level), target, dotCount(level), DOT_GAP_KM) : [])
  const [land, setLand] = useState<string[] | null>(null)
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

  useEffect(() => {
    let live = true
    void loadLand().then((l) => live && setLand(l))
    return () => {
      live = false
    }
  }, [])

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
    if (gained) addPop(`+${gained}`, (tx / WIDTH) * 100, Math.max(6, (ty / HEIGHT) * 100 - 16))
    later(() => {
      const next = index + 1
      if (next >= ROUNDS) {
        onFinish({ score: score + gained, accuracy: total.current / ROUNDS })
        return
      }
      setIndex(next)
      setChoices(makeDots(round[next]))
      setResult(null)
    }, 1800)
  }

  const pickDot = (p: FeaturePlace) => {
    if (result) return
    if (p === target) finishTurn(null, 30, t('spotOn'))
    else finishTurn(toMap(p.at), 0, t('miss'))
  }

  const tapMap = (e: PointerEvent<SVGSVGElement>) => {
    if (result || dots || !land) return
    const m = svgRef.current?.getScreenCTM()
    if (!m) return
    const pt = new DOMPoint(e.clientX, e.clientY).matrixTransform(m.inverse())
    const lonLat = fromMap([pt.x, pt.y])
    if (!lonLat) return
    const km = Math.round(kmToFeature(target.feature, lonLat))
    const pts = pointsForKm(km, BANDS)
    const word = pts >= 30 ? t('spotOn') : pts >= 20 ? t('close') : pts > 0 ? t('near') : t('miss')
    finishTurn([pt.x, pt.y], pts, pts >= 30 ? word : `${word} ${t('off', { km })}`)
  }

  // The name sits above the feature, kept inside the map.
  const label = target.name.replace(/^the /, '')
  const lx = Math.min(Math.max(tx, 150), WIDTH - 150)
  const ly = ty < 90 ? ty + 64 : ty - 36

  return (
    <div className="game river-mountain">
      <Hud
        items={[
          { label: t('score'), value: score },
          { label: t('round'), value: `${index + 1} / ${ROUNDS}`, highlight: combo >= 3 },
        ]}
      />
      <p className="prompt rm-ask" key={index}>
        {result ? (
          result.label
        ) : (
          <>
            <span className="rm-kind">
              {KIND_ICON[target.feature.kind]} {t(`kind.${target.feature.kind}`)}
            </span>{' '}
            {t('where', { place: target.name })}
          </>
        )}
      </p>
      <div className="rm-wrap" ref={wrapRef}>
        {land ? (
          <svg ref={svgRef} viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="rm-map" onPointerDown={tapMap}>
            {land.map((d, i) => (
              <path key={i} d={d} className="rm-land" />
            ))}
            {features.map((f) => (
              <Mark key={f.id} f={f} />
            ))}
            {choices.map((p) => {
              const [x, y] = toMap(p.at)
              return (
                <g key={`${index}-${p.name}`} className="mh-dot" onPointerDown={() => pickDot(p)}>
                  <circle cx={x} cy={y} r={44} className="mh-hit" />
                  <circle cx={x} cy={y} r={15} className={result && p === target ? 'mh-dot-right' : ''} />
                </g>
              )
            })}
            {result && (
              <g className="mh-answer">
                {target.feature.kind === 'sea' && target.feature.line ? (
                  <path d={linePath(target.feature.line)} className="rm-found rm-found-sea" />
                ) : (
                  <Mark f={target.feature} className="rm-found" />
                )}
                {result.tap && <circle cx={result.tap[0]} cy={result.tap[1]} r={12} className="mh-tap" />}
                <circle cx={tx} cy={ty} r={18} className="mh-target" />
                <text x={lx} y={ly} className="mh-name rm-name">
                  {label}
                </text>
              </g>
            )}
          </svg>
        ) : (
          <div className="rm-loading">{t('loading')}</div>
        )}
        <Pops pops={pops} />
      </div>
    </div>
  )
}
