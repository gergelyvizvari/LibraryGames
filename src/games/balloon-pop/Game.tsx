import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { useLatest, useTimeouts } from '../../kit/hooks'
import { makeRng } from '../../kit/random'
import { PaintedScene, worldStyle, type PaintedView } from '../../kit/painted'
import { useStage } from '../../kit/SceneShell'
import { sound } from '../../kit/sound'
import type { GameProps } from '../../kit/types'
import balloonBlue from './art/balloon-blue.webp'
import balloonLilac from './art/balloon-lilac.webp'
import balloonMint from './art/balloon-mint.webp'
import balloonPink from './art/balloon-pink.webp'
import balloonRed from './art/balloon-red.webp'
import balloonYellow from './art/balloon-yellow.webp'
import lakeTall from './art/lake-tall.webp'
import lake from './art/lake.webp'
import otterBlink from './art/otter-blink.webp'
import otterHappy from './art/otter-happy.webp'
import otterSad from './art/otter-sad.webp'
import otter from './art/otter.webp'
import { dealBoard, nextNumber, specFor, STAGE, type Balloon } from './logic'

/** The painted balloons, one per colour (the colour numbers of the logic). */
const BALLOONS = [balloonRed, balloonYellow, balloonMint, balloonBlue, balloonLilac, balloonPink]

type ViewId = 'wide' | 'tall'
type Face = 'idle' | 'blink' | 'happy' | 'sad'
const OTTER: [Face, string][] = [
  ['idle', otter],
  ['blink', otterBlink],
  ['happy', otterHappy],
  ['sad', otterSad],
]

/** The lake with its jetty; the balloons float over the water, the otter sits on the jetty. */
const VIEWS: PaintedView<ViewId>[] = [
  { id: 'wide', painting: lake, world: { w: 1280, h: 800 }, focus: { x: 40, y: 20, w: 1200, h: 780 }, play: { x: 120, y: 110, w: 1000, h: 560 }, ground: '#d99259', sayAt: { x: 900, y: 150 } },
  { id: 'tall', painting: lakeTall, world: { w: 720, h: 1152 }, focus: { x: 0, y: 220, w: 720, h: 930 }, ground: '#e79955', sayAt: { x: 360, y: 310 } },
]

/** The box the balloons float in (their x and y are fractions of it), a balloon's width, and the otter. */
const SPOTS: Record<ViewId, { field: { x: number; y: number; w: number; h: number }; balloon: number; otter: { x: number; bottom: number; h: number } }> = {
  wide: { field: { x: 120, y: 110, w: 1000, h: 560 }, balloon: 120, otter: { x: 1170, bottom: 790, h: 170 } },
  tall: { field: { x: 30, y: 360, w: 660, h: 660 }, balloon: 120, otter: { x: 620, bottom: 1140, h: 150 } },
}

/** The otter blinks now and then while it waits. */
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

export default function BalloonPop({ level, seed, t, onFinish }: GameProps) {
  const rng = useRef(makeRng(seed)).current
  const spec = specFor(level)
  const nextId = useRef(0)
  const newRound = () => ({ id: nextId.current++, board: dealBoard(rng, level) })
  const [round, setRound] = useState(newRound)
  /** The numbers popped so far, in order. */
  const [popped, setPopped] = useState<number[]>([])
  const [hidden, setHidden] = useState(false)
  const [peek, setPeek] = useState<number | null>(null)
  const stage = useStage(STAGE, onFinish)
  const later = useTimeouts()
  const { board } = round
  const roundRef = useLatest(round)
  const done = popped.length === board.length
  const blink = useBlink()

  // From level 3 the numbers hide by themselves after a little while; before that they stay until the first pop.
  useEffect(() => {
    if (spec.show === null) return
    const id = round.id
    later(() => roundRef.current.id === id && setHidden(true), spec.show * 1000)
  }, [round.id, spec.show, later, roundRef])

  const tap = (b: Balloon) => {
    if (stage.over || done || popped.includes(b.n)) return
    setHidden(true)
    if (b.n !== nextNumber(board, popped.length)) {
      stage.slip()
      setPeek(b.n)
      later(() => setPeek((p) => (p === b.n ? null : p)), 1000)
      return
    }
    const now = [...popped, b.n]
    setPopped(now)
    setPeek(null)
    if (now.length < board.length) {
      sound.pop()
      return
    }
    if (stage.good()) return
    later(() => {
      setPopped([])
      setHidden(false)
      setRound(newRound())
    }, 1300)
  }

  const say = done ? t('yes') : peek !== null ? t('no') : !hidden ? t(spec.show === null ? 'pop' : 'look') : popped.length ? t('next') : t('pop')
  const face: Face = done ? 'happy' : peek !== null ? 'sad' : blink ? 'blink' : 'idle'
  // Fewer balloons may be a little bigger.
  const big = [1.15, 1.15, 1.15, 1.05, 0.95, 0.88, 0.82][Math.min(6, board.length)]
  return (
    <PaintedScene
      views={VIEWS}
      say={say}
      stage={stage}
      className="balloon-pop"
      trayHeight={80}
      tray={
        <div className="bp-tags" aria-hidden>
          {popped.map((n) => (
            <span className="bp-tag" key={n}>
              {n}
            </span>
          ))}
        </div>
      }
    >
      {(view) => {
        const at = SPOTS[view]
        const w = at.balloon * big
        return (
          <>
            <div className={`bp-otter${done ? ' bp-hop' : ''}`} style={worldStyle(at.otter.x, at.otter.bottom, at.otter.h)}>
              {OTTER.map(([f, src]) => (
                <img key={f} src={src} alt="" draggable={false} className={f === face ? '' : 'bp-off'} />
              ))}
            </div>
            <div className="bp-field" key={round.id} style={{ left: at.field.x, top: at.field.y, width: at.field.w, height: at.field.h, ['--bp-w' as string]: `${w}px` }}>
              {board.map((b, i) => {
                const gone = popped.includes(b.n)
                const style: CSSProperties = { left: `${b.x * 100}%`, top: `${b.y * 100}%`, animationDelay: `${i * 80}ms` }
                const label = !hidden || peek === b.n ? b.n : null
                return (
                  <button
                    key={b.n}
                    className={`bp-balloon${gone ? ' bp-gone' : ''}${peek === b.n ? ' bp-no' : ''}`}
                    style={style}
                    onPointerDown={() => tap(b)}
                    disabled={stage.over || gone}
                    aria-label={hidden ? t('balloon') : String(b.n)}
                  >
                    <img src={BALLOONS[b.color % BALLOONS.length]} alt="" draggable={false} />
                    {label !== null && <b className={`bp-num${label > 9 ? ' bp-num-2' : ''}`}>{label}</b>}
                  </button>
                )
              })}
            </div>
          </>
        )
      }}
    </PaintedScene>
  )
}
