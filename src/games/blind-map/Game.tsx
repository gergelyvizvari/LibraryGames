import { useEffect, useRef, useState, type CSSProperties, type PointerEvent } from 'react'
import { useLocale } from '../../i18n'
import { useShake, useTimeouts } from '../../kit/hooks'
import { makeRng } from '../../kit/random'
import { Cast, useMood } from '../../kit/cast'
import { PaintedScene, type PaintedView } from '../../kit/painted'
import { sound, vibrate } from '../../kit/sound'
import type { GameProps } from '../../kit/types'
import { MapStage } from '../../kit/ui'
import { displayName, flag } from './content'
import { pickQuestions, pointsFor } from './logic'
import { WIDTH, loadMap, nearEnough, type RegionMap } from './map'
import bgTall from './art/bg-tall.webp'
import bg from './art/bg.webp'
import charBlink from './art/char-blink.webp'
import charHappy from './art/char-happy.webp'
import charSad from './art/char-sad.webp'
import char from './art/char.webp'

const FACES = { idle: char, blink: charBlink, happy: charHappy, sad: charSad }
/** The character's width / height. */
const ASPECT = 0.562

type ViewId = 'wide' | 'tall'

/** The ship cabin: the blank map lies on the captain table, with the polar bear captain beside it. */
const VIEWS: PaintedView<ViewId>[] = [
  { id: 'wide', painting: bg, world: { w: 1280, h: 800 }, focus: { x: 0, y: 40, w: 1280, h: 760 }, ground: '#7a3826', sayAt: { x: 1060, y: 780 } },
  { id: 'tall', painting: bgTall, world: { w: 720, h: 1152 }, focus: { x: 0, y: 180, w: 720, h: 972 }, ground: '#863c18', sayAt: { x: 40, y: 1130 } },
]

/** Where the play sits in each painting (its content zoomed to suit the painting's scale), and the character. */
const SPOTS: Record<ViewId, { box: { x: number; y: number; w: number; h: number }; zoom: number; char: { x: number; bottom: number; h: number } }> = {
  wide: { box: { x: 270, y: 160, w: 780, h: 550 }, zoom: 1.2, char: { x: 150, bottom: 790, h: 330 } },
  tall: { box: { x: 20, y: 370, w: 680, h: 500 }, zoom: 1.2, char: { x: 600, bottom: 1140, h: 260 } },
}

export default function BlindMap({ level, seed, t, onFinish }: GameProps) {
  const locale = useLocale()
  const rng = useRef(makeRng(seed)).current
  const questions = useRef(pickQuestions(rng, level).slice(0, 6)).current
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
  const [shakeRef, shake] = useShake<HTMLDivElement>()
  const later = useTimeouts()
  const [mood, feel] = useMood()

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
      feel('happy')
    sound.good(nc)
      next(tries === 0, score + gained)
      return
    }
    feel('sad')
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
    <PaintedScene views={VIEWS} say={
        found && reveal ? (
          t('hereItIs')
        ) : wrongName && !found ? (
          t('thatIs', { name: displayName(wrongName, locale) })
        ) : (
          <>
            <span className="bm-flag">{flag(q.iso)}</span> {t('find', { name: displayName(q.atlas, locale) })}
          </>
        )
      } stage={{ done: index + (found ? 1 : 0), total: questions.length, over: done }} className="blind-map">
      {(view) => {
        const at = SPOTS[view]
        return (
          <>
            <Cast faces={FACES} mood={mood} at={at.char} aspect={ASPECT} />
            {/* `zoom` scales the box's own position too, so it is given in zoomed units. */}
            <div className="pb-box" style={{ left: at.box.x / at.zoom, top: at.box.y / at.zoom, width: at.box.w / at.zoom, height: at.box.h / at.zoom, zoom: at.zoom }}>
      <MapStage>
      <div className="bm-sea map-box" ref={shakeRef} style={{ '--map-ratio': map ? WIDTH / map.height : 1 } as CSSProperties}>
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
      </div>
      </MapStage>
            </div>
          </>
        )
      }}
    </PaintedScene>
  )
}
