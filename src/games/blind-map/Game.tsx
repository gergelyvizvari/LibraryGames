import { useEffect, useRef, useState, type PointerEvent } from 'react'
import { useLocale } from '../../i18n'
import { usePops, useShake, useTimeouts } from '../../kit/hooks'
import { makeRng } from '../../kit/random'
import { sound, vibrate } from '../../kit/sound'
import type { GameProps } from '../../kit/types'
import { Hud, Pops } from '../../kit/ui'
import { displayName, flag } from './content'
import { pickQuestions, pointsFor } from './logic'
import { WIDTH, loadMap, nearEnough, type RegionMap } from './map'

export default function BlindMap({ level, seed, t, onFinish }: GameProps) {
  const locale = useLocale()
  const rng = useRef(makeRng(seed)).current
  const questions = useRef(pickQuestions(rng, level)).current
  const [index, setIndex] = useState(0)
  const [map, setMap] = useState<RegionMap | null>(null)
  const shapes = map?.shapes
  const [tries, setTries] = useState(0)
  const [wrongName, setWrongName] = useState<string | null>(null)
  const [found, setFound] = useState<string | null>(null)
  const [reveal, setReveal] = useState(false)
  const [score, setScore] = useState(0)
  const [combo, setCombo] = useState(0)
  const [firstTry, setFirstTry] = useState(0)
  const [done, setDone] = useState(false)
  const askedAt = useRef(0)
  const svg = useRef<SVGSVGElement>(null)
  const [pops, addPop] = usePops()
  const [shakeRef, shake] = useShake<HTMLDivElement>()
  const later = useTimeouts()

  const q = questions[index]
  const region = q.region

  useEffect(() => {
    let live = true
    void loadMap(region).then((m) => {
      if (!live) return
      setMap(m)
      askedAt.current = performance.now()
    })
    return () => {
      live = false
    }
  }, [region])

  const next = (gainedFirstTry: boolean, finalScore: number) => {
    const nextFirst = firstTry + (gainedFirstTry ? 1 : 0)
    setFirstTry(nextFirst)
    later(() => {
      if (index + 1 >= questions.length) {
        setDone(true)
        onFinish({ score: finalScore, accuracy: nextFirst / questions.length })
        return
      }
      setIndex(index + 1)
      setTries(0)
      setFound(null)
      setWrongName(null)
      setReveal(false)
      askedAt.current = performance.now()
    }, 1100)
  }

  const onTap = (e: PointerEvent<SVGSVGElement>) => {
    if (!shapes || found || done || !svg.current) return
    const pt = new DOMPoint(e.clientX, e.clientY).matrixTransform(svg.current.getScreenCTM()!.inverse())
    const tapped = (e.target as Element).getAttribute('data-name')
    const target = shapes.find((s) => s.name === q.atlas)!
    if (tapped === q.atlas || nearEnough(target, pt.x, pt.y)) {
      const seconds = (performance.now() - askedAt.current) / 1000
      const gained = pointsFor(tries, seconds) + (tries === 0 ? Math.min(combo, 5) * 2 : 0)
      const nc = tries === 0 ? combo + 1 : 0
      setCombo(nc)
      setScore(score + gained)
      setFound(q.atlas)
      sound.good(nc)
      addPop(gained ? `+${gained}` : t('hereItIs'), (pt.x / WIDTH) * 100, (pt.y / (map?.height ?? 1)) * 100)
      next(tries === 0, score + gained)
      return
    }
    sound.bad()
    vibrate(40)
    shake()
    setCombo(0)
    setWrongName(tapped)
    const n = tries + 1
    setTries(n)
    if (n >= 3) {
      // After three misses, show where it is and move on.
      setReveal(true)
      setFound(q.atlas)
      next(false, score)
    }
  }

  return (
    <div className="game blind-map">
      <Hud
        items={[
          { label: t('score'), value: score },
          { label: t('country'), value: `${index + 1} / ${questions.length}` },
          { label: t('combo'), value: `×${combo}`, highlight: combo >= 3 },
        ]}
      />
      <p className="prompt bm-prompt" key={index}>
        <span className="bm-flag">{flag(q.iso)}</span> {t('find', { name: displayName(q.atlas, locale) })}
      </p>
      <p className="bm-hint">
        {found ? (reveal ? t('hereItIs') : '') : wrongName ? t('thatIs', { name: displayName(wrongName, locale) }) : ' '}
      </p>
      <div className="bm-sea" ref={shakeRef}>
        {map && shapes ? (
          <svg ref={svg} viewBox={`0 0 ${WIDTH} ${map.height}`} onPointerDown={onTap} className="bm-svg">
            {shapes.map((s) => (
              <path
                key={s.name}
                d={s.d}
                data-name={s.name}
                className={`bm-land${s.name === found ? (reveal ? ' bm-reveal' : ' bm-found') : ''}${s.name === wrongName && !found ? ' bm-wrong' : ''}`}
              />
            ))}
          </svg>
        ) : (
          <div className="bm-loading">{t('loading')}</div>
        )}
        <Pops pops={pops} />
      </div>
    </div>
  )
}
