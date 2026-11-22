import { useEffect, useRef, useState, type CSSProperties, type PointerEvent } from 'react'
import { createPortal } from 'react-dom'
import { useLocale } from '../../i18n'
import { useShake, useTimeouts } from '../../kit/hooks'
import { makeRng } from '../../kit/random'
import { Cast, useMood } from '../../kit/cast'
import { PaintedScene, type PaintedView } from '../../kit/painted'
import { sound, vibrate } from '../../kit/sound'
import type { GameProps } from '../../kit/types'
import { MapStage } from '../../kit/ui'
import { continentNames, names, type Item } from './content'
import { CONTINENTS, type Continent } from './continents'
import { coloured, pickItems, pointsFor, showLabels } from './logic'
import { WIDTH, loadWorld, type WorldMap } from './map'
import bgTall from './art/bg-tall.webp'
import bg from './art/bg.webp'
import charBlink from './art/char-blink.webp'
import charHappy from './art/char-happy.webp'
import charSad from './art/char-sad.webp'
import char from './art/char.webp'

const FACES = { idle: char, blink: charBlink, happy: charHappy, sad: charSad }
/** The character's width / height. */
const ASPECT = 0.806

type ViewId = 'wide' | 'tall'

/** The explorer study: the world map lies on the big desk, with the koala explorer beside it. */
const VIEWS: PaintedView<ViewId>[] = [
  { id: 'wide', painting: bg, world: { w: 1280, h: 800 }, focus: { x: 0, y: 100, w: 1280, h: 700 }, ground: '#a44716', sayAt: { x: 30, y: 350 } },
  { id: 'tall', painting: bgTall, world: { w: 720, h: 1152 }, focus: { x: 0, y: 240, w: 720, h: 912 }, ground: '#7d3723', sayAt: { x: 40, y: 1110 } },
]

/** Where the play sits in each painting (its content zoomed to suit the painting's scale), and the character. */
const SPOTS: Record<ViewId, { box: { x: number; y: number; w: number; h: number }; zoom: number; char: { x: number; bottom: number; h: number } }> = {
  wide: { box: { x: 270, y: 250, w: 880, h: 540 }, zoom: 1.3, char: { x: 130, bottom: 640, h: 290 } },
  tall: { box: { x: 20, y: 380, w: 680, h: 560 }, zoom: 1.3, char: { x: 600, bottom: 1135, h: 300 } },
}

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
const STICKER_SPOTS: [number, number][] = [[0, 0], [-34, -22], [34, -22], [-34, 22], [34, 22], [0, -40], [0, 40], [-60, 0], [60, 0]]

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
  const [mood, feel] = useMood()
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
      feel('happy')
    setSolved('yes')
      setPlaced((p) => [...p, q])
      sound.good(nc)
      next(score + gained)
      return
    }
    feel('sad')
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
    <>
    <PaintedScene views={VIEWS} say={q ? hint() : ' '} stage={{ done: Math.min(index + (solved ? 1 : 0), questions.length), total: questions.length, over: !q }} className="continent-sort">
      {(view) => {
        const at = SPOTS[view]
        return (
          <>
            <Cast faces={FACES} mood={mood} at={at.char} aspect={ASPECT} />
            {/* `zoom` scales the box's own position too, so it is given in zoomed units. */}
            <div className="pb-box" style={{ left: at.box.x / at.zoom, top: at.box.y / at.zoom, width: at.box.w / at.zoom, height: at.box.h / at.zoom, zoom: at.zoom }}>
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
              const [dx, dy] = STICKER_SPOTS[i % STICKER_SPOTS.length]
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
            </div>
          </>
        )
      }}
      </PaintedScene>
      {drag &&
        q &&
        createPortal(
          <div className="cs2-ghost" style={{ left: drag.x, top: drag.y }}>
            {q.emoji}
          </div>,
          document.body,
        )}
    </>
  )
}
