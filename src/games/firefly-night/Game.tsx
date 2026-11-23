import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { useGameLoop, useTimeouts } from '../../kit/hooks'
import { PaintedScene, worldStyle, type PaintedView } from '../../kit/painted'
import { makeRng } from '../../kit/random'
import { useStage } from '../../kit/SceneShell'
import type { GameProps } from '../../kit/types'
import bunnyBlink from './art/bunny-blink.webp'
import bunnyHappy from './art/bunny-happy.webp'
import bunnySad from './art/bunny-sad.webp'
import bunny from './art/bunny.webp'
import flyDark from './art/fly-dark.webp'
import flyLit from './art/fly-lit.webp'
import jar from './art/jar.webp'
import nightTall from './art/night-tall.webp'
import night from './art/night.webp'
import { drift, glowing, spawn, specFor, STAGE, type Fly } from './logic'

interface Flying extends Fly {
  born: number
}

type ViewId = 'wide' | 'tall'
type Face = 'idle' | 'blink' | 'happy' | 'sad'
const BUNNY: [Face, string][] = [
  ['idle', bunny],
  ['blink', bunnyBlink],
  ['happy', bunnyHappy],
  ['sad', bunnySad],
]

/** The night meadow; the fireflies fly in the open air above the grass, the jar stands on the stump. */
const VIEWS: PaintedView<ViewId>[] = [
  { id: 'wide', painting: night, world: { w: 1280, h: 800 }, focus: { x: 140, y: 120, w: 1000, h: 680 }, ground: '#2d656f', sayAt: { x: 380, y: 150 } },
  { id: 'tall', painting: nightTall, world: { w: 720, h: 1152 }, focus: { x: 0, y: 220, w: 720, h: 920 }, ground: '#34717f', sayAt: { x: 200, y: 270 } },
]

/** The box the fireflies fly in (their x and y are percentages of it), the jar on the stump, the bunny, and a firefly's size. */
const SPOTS: Record<ViewId, { field: { x: number; y: number; w: number; h: number }; jar: { x: number; bottom: number; h: number }; bunny: { x: number; bottom: number; h: number }; fly: number }> = {
  wide: { field: { x: 150, y: 120, w: 990, h: 530 }, jar: { x: 645, bottom: 692, h: 170 }, bunny: { x: 420, bottom: 790, h: 210 }, fly: 92 },
  tall: { field: { x: 40, y: 250, w: 700, h: 690 }, jar: { x: 390, bottom: 1012, h: 150 }, bunny: { x: 140, bottom: 1135, h: 170 }, fly: 96 },
}

/** Spots in the jar where caught fireflies sit, in the jar picture's pixels (183 × 252). */
const IN_JAR = [
  [66, 214], [116, 210], [92, 186], [130, 168], [56, 164], [94, 146], [62, 120], [124, 118],
]

/** The bunny blinks now and then while it waits. */
function useBlink() {
  const [shut, setShut] = useState(false)
  useEffect(() => {
    let timer = 0
    const next = (open: boolean) => {
      timer = window.setTimeout(
        () => {
          setShut(open)
          next(!open)
        },
        open ? 2600 + Math.random() * 2600 : 150,
      )
    }
    next(true)
    return () => clearTimeout(timer)
  }, [])
  return shut
}

export default function FireflyNight({ level, seed, t, onFinish }: GameProps) {
  const rng = useRef(makeRng(seed)).current
  const spec = specFor(level)
  const nextId = useRef(0)
  const make = (now: number): Flying => ({ ...spawn(rng, spec, nextId.current++), born: now })
  const world = useRef<{ time: number; flies: Flying[] } | null>(null)
  world.current ??= { time: 0, flies: Array.from({ length: spec.count }, () => make(0)) }
  const [, setFrame] = useState(0)
  const [caught, setCaught] = useState(0)
  const [trail, setTrail] = useState<{ id: number; x: number; y: number }[]>([])
  const [asleep, setAsleep] = useState<number | null>(null)
  const stage = useStage(STAGE, onFinish)
  const later = useTimeouts()
  const blink = useBlink()
  const [cheer, setCheer] = useState(0)

  useGameLoop((dt) => {
    const w = world.current!
    w.time += dt
    w.flies = w.flies.map((f) => ({ ...drift(f, dt), born: f.born }))
    setFrame((n) => n + 1)
  }, !stage.over)

  const w = world.current
  const lit = (f: Flying) => glowing(f, w.time - f.born, spec)

  const tap = (f: Flying) => {
    if (stage.over) return
    if (!lit(f)) {
      stage.slip()
      setAsleep(f.id)
      return
    }
    setAsleep(null)
    // The caught firefly flies to the jar; a new one wakes up somewhere else.
    w.flies = w.flies.map((g) => (g.id === f.id ? make(w.time) : g))
    setTrail((tr) => [...tr, { id: f.id, x: f.x, y: f.y }])
    later(() => setTrail((tr) => tr.filter((x) => x.id !== f.id)), 600)
    setCaught((c) => c + 1)
    setCheer((n) => n + 1)
    later(() => setCheer((n) => n - 1), 700)
    stage.good()
  }

  const say = stage.over ? t('done') : asleep !== null ? t('asleep') : caught > 0 ? t('more') : t('say')

  const face: Face = stage.over || cheer > 0 ? 'happy' : asleep !== null ? 'sad' : blink ? 'blink' : 'idle'
  return (
    <PaintedScene views={VIEWS} say={say} stage={stage} className="firefly-night">
      {(view) => {
        const at = SPOTS[view]
        const jarW = (at.jar.h * 183) / 252
        // The jar's middle, as a percentage of the flying box: where a caught firefly flies to.
        const toJar = {
          ['--ff-jx' as string]: `${((at.jar.x - at.field.x) / at.field.w) * 100}%`,
          ['--ff-jy' as string]: `${((at.jar.bottom - at.jar.h * 0.45 - at.field.y) / at.field.h) * 100}%`,
          ['--ff-size' as string]: `${at.fly}px`,
        } as CSSProperties
        return (
          <>
            <div className={`ff-bunny${cheer > 0 || stage.over ? ' ff-hop' : ''}`} style={worldStyle(at.bunny.x, at.bunny.bottom, at.bunny.h)}>
              {BUNNY.map(([f, src]) => (
                <img key={f} src={src} alt="" draggable={false} className={f === face ? '' : 'ff-off'} />
              ))}
            </div>
            <div className={`ff-jar${stage.over ? ' ff-full' : ''}`} style={{ ...worldStyle(at.jar.x, at.jar.bottom, at.jar.h), width: jarW }}>
              <span className="ff-jar-glow" style={{ opacity: (caught / STAGE) * 0.9 }} />
              <img src={jar} alt="" draggable={false} />
              <svg viewBox="0 0 183 252" aria-hidden focusable="false">
                {IN_JAR.slice(0, caught).map(([x, y], i) => (
                  <g key={i} className="ff-in">
                    <circle cx={x} cy={y} r="18" fill="#f6ff9c" opacity="0.55" />
                    <circle cx={x} cy={y} r="9" fill="#fffbb0" />
                  </g>
                ))}
              </svg>
            </div>
            <div className="ff-field" style={{ left: at.field.x, top: at.field.y, width: at.field.w, height: at.field.h, ...toJar }}>
              {!stage.over &&
                w.flies.map((f) => {
                  const on = lit(f)
                  return (
                    <button
                      key={f.id}
                      className={`ff-fly${on ? ' ff-lit' : ''}${asleep === f.id ? ' ff-no' : ''}`}
                      style={{ left: `${f.x}%`, top: `${f.y}%` }}
                      onPointerDown={() => tap(f)}
                      onAnimationEnd={() => asleep === f.id && setAsleep(null)}
                      aria-label={t(on ? 'lit' : 'dark')}
                    >
                      <img src={flyDark} alt="" draggable={false} />
                      <img src={flyLit} alt="" draggable={false} className="ff-glow" />
                    </button>
                  )
                })}
              {trail.map((tr) => (
                <span key={tr.id} className="ff-trail" style={{ left: `${tr.x}%`, top: `${tr.y}%` }} />
              ))}
            </div>
          </>
        )
      }}
    </PaintedScene>
  )
}
