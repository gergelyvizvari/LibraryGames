import { useEffect, useRef, useState } from 'react'
import { usePops, useShake, useTimeouts } from '../../kit/hooks'
import { makeRng } from '../../kit/random'
import { PaintedScene, worldStyle, type PaintedView } from '../../kit/painted'
import { useStage } from '../../kit/SceneShell'
import type { GameProps } from '../../kit/types'
import { Pops } from '../../kit/ui'
import bearBlink from './art/bear-blink.webp'
import bearHappy from './art/bear-happy.webp'
import bearSad from './art/bear-sad.webp'
import bear from './art/bear.webp'
import disc from './art/disc.webp'
import gladeTall from './art/glade-tall.webp'
import glade from './art/glade.webp'
import { judge, makeOrders, pickAnimals, windowMs, type Outcome } from './logic'

/** Orders in one stage. */
const STAGE = 8
const messages: Record<Exclude<Outcome, 'right'>, string> = {
  wrongAnimal: 'wrong',
  noSimon: 'gotcha',
  tooSlow: 'tooSlow',
  waited: 'wellWaited',
}

type Face = 'idle' | 'blink' | 'happy' | 'sad'
const BEAR: [Face, string][] = [
  ['idle', bear],
  ['blink', bearBlink],
  ['happy', bearHappy],
  ['sad', bearSad],
]

/** The bear blinks now and then while it waits. */
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

/** Every animal's painted picture: art/<key>.webp. */
const ART = import.meta.glob<string>('./art/*.webp', { eager: true, import: 'default' })

type ViewId = 'wide' | 'tall'

/** The forest glade; the animals stand on log slices in the clearing, the bear gives the orders. */
const VIEWS: PaintedView<ViewId>[] = [
  { id: 'wide', painting: glade, world: { w: 1280, h: 800 }, focus: { x: 60, y: 60, w: 1160, h: 740 }, ground: '#9ba538', sayAt: { x: 300, y: 250 } },
  { id: 'tall', painting: gladeTall, world: { w: 720, h: 1152 }, focus: { x: 0, y: 260, w: 720, h: 892 }, ground: '#9cad2c', sayAt: { x: 300, y: 320 } },
]

/** The clearing the animals stand in (their feet rows), the timer above it, and the bear. */
const SPOTS: Record<ViewId, { left: number; right: number; rows: number[]; h: number; timer: number; bear: { x: number; bottom: number; h: number } }> = {
  wide: { left: 380, right: 1180, rows: [520, 760], h: 190, timer: 330, bear: { x: 170, bottom: 760, h: 330 } },
  tall: { left: 40, right: 680, rows: [820, 1090], h: 210, timer: 580, bear: { x: 590, bottom: 520, h: 230 } },
}

export default function SimonSays({ level, seed, t, onFinish }: GameProps) {
  const rng = useRef(makeRng(seed)).current
  const animals = useRef(pickAnimals(rng, level)).current
  const orders = useRef(makeOrders(rng, level, animals.length).slice(0, STAGE)).current
  const [index, setIndex] = useState(0)
  const [active, setActive] = useState(false)
  const [progress, setProgress] = useState(1)
  const stage = useStage(orders.length, onFinish)
  const [pops, addPop] = usePops()
  const [ref, shake] = useShake<HTMLDivElement>()
  const later = useTimeouts()
  const blink = useBlink()
  const [mood, setMood] = useState<'happy' | 'sad' | null>(null)
  const started = useRef(0)
  const ms = windowMs(level) + 600

  const resolve = (tapped: number | null) => {
    if (!active) return
    setActive(false)
    const outcome = judge(orders[index], tapped)
    let last: boolean
    setMood(outcome === 'right' || outcome === 'waited' ? 'happy' : 'sad')
    later(() => setMood(null), 800)
    if (outcome === 'right' || outcome === 'waited') {
      last = stage.good()
      if (outcome === 'waited') addPop(t('wellWaited'), 50, 25)
    } else {
      last = stage.miss()
      shake()
      addPop(t(messages[outcome]), 50, 25, 'bad')
    }
    if (!last) later(() => setIndex(index + 1), 900)
  }
  const resolveRef = useRef(resolve)
  resolveRef.current = resolve

  // Each order opens a window; if it closes without a tap, that counts as waiting.
  useEffect(() => {
    started.current = performance.now()
    setActive(true)
    setProgress(1)
    const tick = setInterval(() => setProgress(Math.max(0, 1 - (performance.now() - started.current) / ms)), 50)
    const timeout = setTimeout(() => resolveRef.current(null), ms)
    return () => {
      clearInterval(tick)
      clearTimeout(timeout)
    }
  }, [index, ms])

  const order = orders[index]
  const key = animals[order.animal].key
  // Some languages change the word after "tap" (Hungarian: kutya → kutyára), so `<animal>.tap` wins when a language has it.
  const animal = t(`${key}.tap`) === `${key}.tap` ? t(key) : t(`${key}.tap`)

  const face: Face = mood ?? (blink ? 'blink' : 'idle')
  const cols = animals.length > 4 ? 3 : 2
  return (
    <PaintedScene views={VIEWS} say={order.simon ? t('simonSays', { animal }) : t('plain', { animal })} stage={stage} className="simon-says">
      {(view) => {
        const at = SPOTS[view]
        const step = (at.right - at.left) / cols
        const h = Math.min(at.h, step * 0.95)
        return (
          <>
            <div className={`sim-char${mood === 'happy' ? ' sim-cheer' : ''}`} style={worldStyle(at.bear.x, at.bear.bottom, at.bear.h)}>
              {BEAR.map(([f, src]) => (
                <img key={f} src={src} alt="" draggable={false} className={f === face ? '' : 'sim-off'} />
              ))}
            </div>
            <div className="sim-timer" style={{ left: at.left + step * 0.25, width: at.right - at.left - step * 0.5, top: at.timer }}>
              <div style={{ width: `${(active ? progress : 0) * 100}%` }} />
            </div>
            <div className="sim-animals" ref={ref}>
              {animals.map((a, i) => (
                <button
                  key={a.key}
                  className="sim-animal"
                  style={{ ...worldStyle(at.left + step * ((i % cols) + 0.5), at.rows[Math.floor(i / cols)], h * 1.15), width: step * 0.9 }}
                  onPointerDown={() => resolve(i)}
                  aria-label={t(a.key)}
                >
                  <img className="sim-disc" src={disc} alt="" draggable={false} />
                  <img className="sim-pic" src={ART[`./art/${a.key}.webp`]} alt="" draggable={false} />
                </button>
              ))}
            </div>
            <Pops pops={pops} />
          </>
        )
      }}
    </PaintedScene>
  )
}
