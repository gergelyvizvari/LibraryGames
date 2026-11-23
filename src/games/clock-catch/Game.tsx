import { useEffect, useRef, useState } from 'react'
import { useShake, useTimeouts } from '../../kit/hooks'
import { PaintedScene, worldStyle, type PaintedView } from '../../kit/painted'
import { makeRng } from '../../kit/random'
import { useStage } from '../../kit/SceneShell'
import { sound } from '../../kit/sound'
import type { GameProps } from '../../kit/types'
import frame from './art/frame.webp'
import owlBlink from './art/owl-blink.webp'
import owlHappy from './art/owl-happy.webp'
import owlSad from './art/owl-sad.webp'
import owl from './art/owl.webp'
import shopTall from './art/shop-tall.webp'
import shop from './art/shop.webp'
import { Clock } from './Clock'
import { flipped, label, makeOptions, makeTimeDealer, same, type Time } from './logic'

type ViewId = 'wide' | 'tall'
type Face = 'idle' | 'blink' | 'happy' | 'sad'
const OWL: [Face, string][] = [
  ['idle', owl],
  ['blink', owlBlink],
  ['happy', owlHappy],
  ['sad', owlSad],
]

/** The clockmaker's shop; the big clock hangs on the plain middle of its wall. */
const VIEWS: PaintedView<ViewId>[] = [
  { id: 'wide', painting: shop, world: { w: 1280, h: 800 }, focus: { x: 180, y: 40, w: 920, h: 740 }, ground: '#c07435', sayAt: { x: 860, y: 190 } },
  { id: 'tall', painting: shopTall, world: { w: 720, h: 1152 }, focus: { x: 0, y: 120, w: 720, h: 880 }, ground: '#7f3d1f', sayAt: { x: 360, y: 200 } },
]

/** The wooden frame (art/frame.webp, 400 × 463, its round hole centred at 49.6% / 55.2%, 79% of its width) and the owl. */
const HOLE = { x: 0.496, y: 0.552, d: 0.79 }
const SPOTS: Record<ViewId, { frame: { x: number; top: number; w: number }; owl: { x: number; bottom: number; h: number } }> = {
  wide: { frame: { x: 580, top: 90, w: 440 }, owl: { x: 330, bottom: 740, h: 250 } },
  tall: { frame: { x: 360, top: 250, w: 520 }, owl: { x: 600, bottom: 1060, h: 230 } },
}

/** The owl blinks now and then while it waits. */
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

/** Clocks to read in one stage. */
const STAGE = 6

export default function ClockCatch({ level, seed, t, onFinish }: GameProps) {
  const rng = useRef(makeRng(seed)).current
  const nextTime = useRef(makeTimeDealer(rng, level)).current
  const makeQuestion = () => {
    const answer = nextTime()
    return { answer, options: makeOptions(rng, answer, level) }
  }
  const [q, setQ] = useState(() => makeQuestion())
  const [index, setIndex] = useState(0)
  const [wrong, setWrong] = useState<Time[]>([])
  const [solved, setSolved] = useState(false)
  const [message, setMessage] = useState('')
  const stage = useStage(STAGE, onFinish)
  const [ref, shake] = useShake<HTMLDivElement>()
  const later = useTimeouts()
  const flip = flipped(level, index)
  const blink = useBlink()
  const [oops, setOops] = useState(false)

  const pick = (o: Time) => {
    if (stage.over || solved || wrong.some((w) => same(w, o))) return
    if (!same(o, q.answer)) {
      setWrong((w) => [...w, o])
      setMessage(t('no'))
      setOops(true)
      later(() => setOops(false), 900)
      stage.slip()
      shake()
      return
    }
    setSolved(true)
    setMessage(t('yes', { time: label(q.answer) }))
    // Two soft ticks, like a clock.
    sound.tone(1200, 0.03, 'square', 0.05, 0.18)
    sound.tone(900, 0.03, 'square', 0.05, 0.3)
    if (stage.good(wrong.length ? 5 : 15)) return
    later(() => {
      setQ(makeQuestion())
      setIndex((i) => i + 1)
      setWrong([])
      setSolved(false)
      setMessage('')
    }, 1100)
  }

  const optionClass = (o: Time) => `${solved && same(o, q.answer) ? ' cc-right' : ''}${wrong.some((w) => same(w, o)) ? ' cc-wrong' : ''}`

  const face: Face = solved ? 'happy' : oops ? 'sad' : blink ? 'blink' : 'idle'
  return (
    <PaintedScene
      views={VIEWS}
      say={message || (flip ? t('findClock', { time: label(q.answer) }) : t('whatTime'))}
      stage={stage}
      className="clock-catch"
      trayHeight={flip ? 130 : 110}
      tray={
        <div ref={ref} className={flip ? 'cc-clocks' : `cc-options cc-options-${q.options.length}`}>
          {q.options.map((o) => (
            <button
              key={`${index}-${label(o)}`}
              className={`${flip ? 'cc-clock-btn' : 'cc-time-btn'}${optionClass(o)}`}
              onPointerDown={() => pick(o)}
              disabled={stage.over}
              aria-label={label(o)}
            >
              {flip ? <Clock time={o} size={78} /> : label(o)}
            </button>
          ))}
        </div>
      }
    >
      {(view) => {
        const at = SPOTS[view]
        const h = (at.frame.w * 463) / 400
        const d = at.frame.w * HOLE.d
        return (
          <>
            <div className={`cc-owl${solved ? ' cc-hop' : ''}`} style={worldStyle(at.owl.x, at.owl.bottom, at.owl.h)}>
              {OWL.map(([f, src]) => (
                <img key={f} src={src} alt="" draggable={false} className={f === face ? '' : 'cc-off'} />
              ))}
            </div>
            <div className="cc-wall" key={index} style={{ left: at.frame.x - at.frame.w / 2, top: at.frame.top, width: at.frame.w, height: h }}>
              <div className="cc-face-at" style={{ left: at.frame.w * HOLE.x - d / 2, top: h * HOLE.y - d / 2, width: d, height: d }}>
                {flip ? <div className="cc-digital">{label(q.answer)}</div> : <Clock time={q.answer} size={d} />}
              </div>
              <img className="cc-frame" src={frame} alt="" draggable={false} />
            </div>
          </>
        )
      }}
    </PaintedScene>
  )
}
