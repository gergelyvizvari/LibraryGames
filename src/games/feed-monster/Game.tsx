import { useEffect, useRef, useState } from 'react'
import { useTimeouts } from '../../kit/hooks'
import { PaintedScene, worldStyle, type PaintedView } from '../../kit/painted'
import { makeRng } from '../../kit/random'
import { sound, vibrate } from '../../kit/sound'
import type { GameProps } from '../../kit/types'
import cookieArt from './art/cookie.webp'
import kitchenTall from './art/kitchen-tall.webp'
import kitchen from './art/kitchen.webp'
import { STAGE, canFinish, makeMonster, pointsFor } from './logic'

type Mood = 'idle' | 'chomp' | 'yuck' | 'happy'
type Face = Mood | 'blink'

const FACE_LIST: Face[] = ['idle', 'blink', 'chomp', 'yuck', 'happy']

/** The painted monster in every fur colour, each with all its faces: art/monster[-<fur>][-<face>].webp. */
const ART = import.meta.glob<string>('./art/monster*.webp', { eager: true, import: 'default' })
const FURS = ['', 'teal', 'sky', 'leaf']
  .map((fur) => FACE_LIST.map((f) => ART[`./art/monster${fur && `-${fur}`}${f === 'idle' ? '' : `-${f}`}.webp`]))
  .filter((faces) => faces.every(Boolean))

/** The painted monster's shape: width / height, and where its belly and mouth are (fractions of its box). */
const MONSTER = { aspect: 0.859, belly: { x: 0.48, y: 0.61 }, mouth: { x: 0.49, y: 0.29 } }

type ViewId = 'wide' | 'tall'

/** The monster's kitchen; the focus is the rug with the monster on it. The bubble sits beside the head when wide, above it when upright. */
const VIEWS: PaintedView<ViewId>[] = [
  { id: 'wide', painting: kitchen, world: { w: 1280, h: 800 }, focus: { x: 300, y: 150, w: 680, h: 610 }, ground: '#d88a39', sayAt: { x: 790, y: 300 } },
  { id: 'tall', painting: kitchenTall, world: { w: 720, h: 1152 }, focus: { x: 40, y: 300, w: 640, h: 650 }, ground: '#d77e2d', sayAt: { x: 360, y: 372 } },
]

/** Where the monster stands (its feet) and how tall it is in each painting. */
const STAND: Record<ViewId, { x: number; bottom: number; h: number }> = {
  wide: { x: 640, bottom: 668, h: 440 },
  tall: { x: 360, bottom: 900, h: 520 },
}

/** The monster blinks now and then while it waits. */
function useBlink(on: boolean) {
  const [shut, setShut] = useState(false)
  useEffect(() => {
    if (!on) return
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
    return () => {
      clearTimeout(timer)
      setShut(false)
    }
  }, [on])
  return shut
}

/** A copy of the tapped cookie flies to the monster's mouth. Purely for show: skipped where it cannot run. */
function flyCookie(from: Element, to: Element | null) {
  if (!to || typeof from.animate !== 'function' || window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return
  const a = from.getBoundingClientRect()
  const b = to.getBoundingClientRect()
  const ghost = from.cloneNode(true) as HTMLElement
  ghost.className = 'fm-cookie fm-ghost'
  Object.assign(ghost.style, { left: `${a.left}px`, top: `${a.top}px`, width: `${a.width}px`, height: `${a.height}px` })
  document.body.append(ghost)
  const dx = b.left + b.width / 2 - (a.left + a.width / 2)
  const dy = b.top + b.height / 2 - (a.top + a.height / 2)
  const flight = ghost.animate(
    [{ transform: 'translate(0, 0) scale(1)' }, { transform: `translate(${dx}px, ${dy}px) scale(0.3)`, opacity: 0.9 }],
    { duration: 300, easing: 'cubic-bezier(0.4, 0, 0.7, 1)' },
  )
  flight.onfinish = flight.oncancel = () => ghost.remove()
}

/** A painted number cookie: as many chocolate chips round its rim as it is worth. */
function Cookie({ n }: { n: number }) {
  return (
    <span className="fm-cookie-art" aria-hidden>
      <img src={cookieArt} alt="" draggable={false} />
      <svg viewBox="-50 -50 100 100" focusable="false">
        {Array.from({ length: n }, (_, i) => {
          const a = -1.27 + (i / n) * 6.283
          const r = n > 6 ? 5.6 : 6.6
          return (
            <g key={i} transform={`translate(${Math.cos(a) * 38} ${Math.sin(a) * 38})`}>
              <ellipse rx={r} ry={r * 0.86} fill="#5b3424" />
              <ellipse cx={-r * 0.3} cy={-r * 0.32} rx={r * 0.38} ry={r * 0.26} fill="#8a5a40" />
            </g>
          )
        })}
      </svg>
      <b>{n}</b>
    </span>
  )
}

export default function FeedMonster({ level, seed, t, onFinish }: GameProps) {
  const rng = useRef(makeRng(seed)).current
  const [monster, setMonster] = useState(() => makeMonster(rng, level))
  /** Counts every monster that came in, so each one gets the next fur colour and walks in anew. */
  const [arrival, setArrival] = useState(0)
  const [eaten, setEaten] = useState<number[]>([])
  const [mood, setMood] = useState<Mood>('idle')
  const [message, setMessage] = useState(() => t('feed', { n: monster.target }))
  const [fed, setFed] = useState(0)
  const [over, setOver] = useState(false)
  const stats = useRef({ score: 0, clean: 0, tries: 0, combo: 0 })
  const busy = useRef(false)
  const mouth = useRef<HTMLSpanElement>(null)
  const later = useTimeouts()
  const blink = useBlink(mood === 'idle')

  const nextMonster = () => {
    const m = makeMonster(rng, level)
    setMonster(m)
    setArrival((n) => n + 1)
    setEaten([])
    setMood('idle')
    setMessage(t('feed', { n: m.target }))
    busy.current = false
  }

  const feed = (b: number, cookie: Element) => {
    if (over || busy.current) return
    const s = stats.current
    const need = monster.target - eaten.reduce((a, c) => a + c, 0)
    if (b > need) {
      s.tries++
      s.combo = 0
      setMood('yuck')
      setMessage(t('tooMuch', { n: need }))
      sound.bad()
      vibrate(40)
      later(() => setMood((m) => (m === 'yuck' ? 'idle' : m)), 900)
      return
    }
    flyCookie(cookie, mouth.current)
    const now = [...eaten, b]
    setEaten(now)
    const rest = need - b
    if (rest > 0) {
      sound.tone(300 + now.length * 80, 0.08, 'square', 0.15)
      setMood('chomp')
      later(() => setMood((m) => (m === 'chomp' ? 'idle' : m)), 420)
      if (canFinish(rest, monster.blocks)) {
        setMessage(t('more', { n: rest }))
      } else {
        // Can't be filled any more (only on harder levels without a 1): a fresh monster comes instead.
        busy.current = true
        s.tries++
        s.combo = 0
        setMessage(t('stuck'))
        sound.bad()
        later(nextMonster, 1300)
      }
      return
    }
    busy.current = true
    s.tries++
    s.combo++
    const smart = now.length <= monster.best
    if (smart) s.clean++
    s.score += pointsFor(monster, now.length, s.combo)
    const count = fed + 1
    setFed(count)
    setMood('happy')
    sound.good(s.combo)
    if (count < STAGE) {
      setMessage(smart ? t('smart') : t('yum'))
      later(nextMonster, 1500)
      return
    }
    setOver(true)
    setMessage(t('allFed'))
    onFinish({ score: s.score, accuracy: s.clean / Math.max(1, s.tries) })
  }

  const need = monster.target - eaten.reduce((a, c) => a + c, 0)
  const face: Face = mood === 'idle' && blink ? 'blink' : mood
  // A phone held sideways has little height: a slimmer plate.
  const short = window.innerHeight < 500
  const fur = FURS[arrival % FURS.length]
  return (
    <PaintedScene
      views={VIEWS}
      say={message}
      stage={{ done: fed, total: STAGE, over }}
      className="fm"
      trayHeight={short ? 112 : 130}
      tray={
        <div className="fm-plate">
          {monster.blocks.map((b) => (
            <button key={`${arrival}-${b}`} className="fm-cookie" disabled={over} aria-label={t('cookie', { n: b })} onClick={(e) => feed(b, e.currentTarget)}>
              <Cookie n={b} />
            </button>
          ))}
        </div>
      }
    >
      {(view) => {
        const at = STAND[view]
        return (
          <div key={arrival} className="fm-stand" style={{ ...worldStyle(at.x, at.bottom, at.h), aspectRatio: MONSTER.aspect }}>
            <div className={`fm-monster fm-${mood}`}>
              <div className="fm-fur">
                {FACE_LIST.map((f, i) => (
                  <img key={f} src={fur[i]} alt="" draggable={false} className={f === face ? '' : 'fm-off'} />
                ))}
              </div>
              <span className="fm-belly" style={{ left: `${MONSTER.belly.x * 100}%`, top: `${MONSTER.belly.y * 100}%`, fontSize: at.h * 0.2 }}>
                {need === 0 ? (
                  <svg className="fm-heart" viewBox="-40 -40 80 72" aria-hidden focusable="false">
                    <path d="M0 26 C-44 -4 -28 -38 0 -16 C28 -38 44 -4 0 26Z" fill="#e2607e" />
                  </svg>
                ) : (
                  <b key={need} className="fm-need">
                    {need}
                  </b>
                )}
              </span>
              {/* Where a cookie flies to. */}
              <span ref={mouth} className="fm-mouth" style={{ left: `${MONSTER.mouth.x * 100}%`, top: `${MONSTER.mouth.y * 100}%` }} />
            </div>
          </div>
        )
      }}
    </PaintedScene>
  )
}
