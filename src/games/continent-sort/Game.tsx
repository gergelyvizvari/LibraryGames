import { useEffect, useRef, useState, type CSSProperties, type PointerEvent } from 'react'
import { useLocale } from '../../i18n'
import { useShake, useTimeouts } from '../../kit/hooks'
import { makeRng } from '../../kit/random'
import { SceneShell } from '../../kit/SceneShell'
import { sound, vibrate } from '../../kit/sound'
import type { GameProps } from '../../kit/types'
import { MapStage } from '../../kit/ui'
import { continentNames, names, type Item } from './content'
import { CONTINENTS, type Continent } from './continents'
import { coloured, pickItems, pointsFor, showLabels } from './logic'
import { WIDTH, loadWorld, type WorldMap } from './map'

const COLOURS: Record<Continent, string> = {
  northAmerica: '#ff9f43',
  southAmerica: '#1dd1a1',
  europe: '#a29bfe',
  africa: '#feca57',
  asia: '#ff6b6b',
  oceania: '#fd79a8',
  antarctica: '#ffffff',
}

// Stickers on one continent spread out around its anchor, in map units.
const SPOTS: [number, number][] = [[0, 0], [-34, -22], [34, -22], [-34, 22], [34, 22], [0, -40], [0, 40], [-60, 0], [60, 0]]

export default function ContinentSort({ level, seed, t, onFinish }: GameProps) {
  const locale = useLocale()
  const rng = useRef(makeRng(seed)).current
  const questions = useRef(pickItems(rng, level).slice(0, 6)).current
  const itemNames = names[locale] ?? names.en
  const cNames = continentNames[locale] ?? continentNames.en
  const [world, setWorld] = useState<WorldMap | null>(null)
  const [index, setIndex] = useState(0)
  const [tries, setTries] = useState(0)
  const [wrong, setWrong] = useState<Continent | null>(null)
  const [solved, setSolved] = useState<'yes' | 'reveal' | null>(null)
  const [placed, setPlaced] = useState<Item[]>([])
  const [score, setScore] = useState(0)
  const [combo, setCombo] = useState(0)
  const [drag, setDrag] = useState<{ x: number; y: number } | null>(null)
  const stats = useRef({ firstTry: 0 })
  const askedAt = useRef(0)
  const [shakeRef, shake] = useShake<HTMLDivElement>()
  const later = useTimeouts()
  const q = questions[index]
  const done = index >= questions.length

  useEffect(() => {
    let live = true
    void loadWorld().then((w) => {
      if (!live) return
      setWorld(w)
      askedAt.current = performance.now()
    })
    return () => {
      live = false
    }
  }, [])

  const next = (finalScore: number) => {
    later(() => {
      if (index + 1 >= questions.length) {
        setIndex(index + 1)
        onFinish({ score: finalScore, accuracy: stats.current.firstTry / questions.length })
        return
      }
      setIndex(index + 1)
      setTries(0)
      setWrong(null)
      setSolved(null)
      askedAt.current = performance.now()
    }, 1100)
  }

  const answer = (c: Continent) => {
    if (!world || done || solved) return
    if (c === q.continent) {
      const seconds = (performance.now() - askedAt.current) / 1000
      const nc = tries === 0 ? combo + 1 : 0
      const gained = pointsFor(tries, seconds, nc)
      if (tries === 0) stats.current.firstTry++
      setCombo(nc)
      setScore(score + gained)
      setSolved('yes')
      setPlaced((p) => [...p, q])
      sound.good(nc)
      next(score + gained)
      return
    }
    sound.bad()
    vibrate(40)
    shake()
    setCombo(0)
    setWrong(c)
    const n = tries + 1
    setTries(n)
    if (n >= 2) {
      // After two misses, show where it lives and move on.
      setSolved('reveal')
      setPlaced((p) => [...p, q])
      next(score)
    }
  }

  const continentAt = (clientX: number, clientY: number) => {
    const el = document.elementFromPoint(clientX, clientY)
    return (el?.closest('[data-cont]')?.getAttribute('data-cont') as Continent | null) ?? null
  }

  const onMapTap = (e: PointerEvent<SVGSVGElement>) => {
    const c = (e.target as Element).closest('[data-cont]')?.getAttribute('data-cont') as Continent | null
    if (c) answer(c)
  }

  const onCardDown = (e: PointerEvent<HTMLDivElement>) => {
    if (!world || solved || done) return
    ;(e.target as Element).releasePointerCapture?.(e.pointerId)
    setDrag({ x: e.clientX, y: e.clientY })
    sound.tap()
  }
  useEffect(() => {
    if (!drag) return
    const move = (e: globalThis.PointerEvent) => setDrag({ x: e.clientX, y: e.clientY })
    const up = (e: globalThis.PointerEvent) => {
      setDrag(null)
      const c = continentAt(e.clientX, e.clientY)
      if (c) answer(c)
    }
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', up)
    return () => {
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', up)
    }
  })

  const hint = () => {
    if (solved === 'yes') return t('yes', { continent: cNames[q.continent] })
    if (solved === 'reveal') return t('reveal', { continent: cNames[q.continent] })
    if (wrong) return t('no', { continent: cNames[wrong] })
    return t('where')
  }

  const fill = (c: Continent) => (coloured(level) || c === 'antarctica' ? COLOURS[c] : '#f3e9c6')
  const cls = (c: Continent) =>
    `cs2-land${solved && c === q?.continent ? (solved === 'yes' ? ' cs2-found' : ' cs2-reveal') : ''}${c === wrong && !solved ? ' cs2-wrong' : ''}`

  const stickers = CONTINENTS.flatMap((c) => placed.filter((p) => p.continent === c).map((p, i) => ({ p, c, i })))

  return (
    <SceneShell
      place="coast"
      say={q ? hint() : ' '}
      stage={{ done: Math.min(index + (solved ? 1 : 0), questions.length), total: questions.length, over: !q, mood: solved === 'yes' ? 'happy' : wrong ? 'oops' : 'idle' }}
      bare
      fill
      className="continent-sort"
    >
      {q && (
        <div className={`cs2-card${solved ? ' cs2-card-done' : ''}${drag ? ' cs2-card-lifted' : ''}`} key={index} onPointerDown={onCardDown}>
          <span className="cs2-emoji">{q.emoji}</span>
          <span className="cs2-name">{itemNames[q.id]}</span>
        </div>
      )}
      <MapStage>
      <div className="cs2-sea map-box" ref={shakeRef} style={{ '--map-ratio': world ? WIDTH / world.height : 2 } as CSSProperties}>
        {world ? (
          <svg viewBox={`0 0 ${WIDTH} ${world.height}`} onPointerDown={onMapTap} className="cs2-svg">
            <defs>
              <clipPath id="cs2-west"><path d={world.west} /></clipPath>
              <clipPath id="cs2-east"><path d={world.east} /></clipPath>
            </defs>
            {CONTINENTS.map((c) => (
              <g key={c} data-cont={c} className={cls(c)} style={{ fill: fill(c) }}>
                <path d={world.land[c]} />
                {c === 'europe' && <path d={world.russia} clipPath="url(#cs2-west)" />}
                {c === 'asia' && <path d={world.russia} clipPath="url(#cs2-east)" />}
              </g>
            ))}
            {showLabels(level) &&
              CONTINENTS.map((c) => (
                <text key={c} x={world.anchors[c][0]} y={world.anchors[c][1] + (c === 'europe' ? -34 : -22)} className="cs2-label">
                  {cNames[c]}
                </text>
              ))}
            {stickers.map(({ p, c, i }) => {
              const [dx, dy] = SPOTS[i % SPOTS.length]
              return (
                <text key={p.id} x={world.anchors[c][0] + dx} y={world.anchors[c][1] + dy + 24} className="cs2-sticker">
                  {p.emoji}
                </text>
              )
            })}
          </svg>
        ) : (
          <div className="cs2-loading">{t('loading')}</div>
        )}
      </div>
      </MapStage>
      {drag && q && (
        <div className="cs2-ghost" style={{ left: drag.x, top: drag.y }}>
          {q.emoji}
        </div>
      )}
    </SceneShell>
  )
}
