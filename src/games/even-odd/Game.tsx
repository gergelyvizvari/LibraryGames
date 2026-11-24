import { useEffect, useRef, useState } from 'react'
import { useGameLoop, useLatest, useShake, useTimeouts } from '../../kit/hooks'
import { makeRng } from '../../kit/random'
import { PaintedScene, worldStyle, type PaintedView } from '../../kit/painted'
import { useStage } from '../../kit/SceneShell'
import type { GameProps } from '../../kit/types'
import hedgehogBlink from './art/hedgehog-blink.webp'
import hedgehogHappy from './art/hedgehog-happy.webp'
import hedgehogSad from './art/hedgehog-sad.webp'
import hedgehog from './art/hedgehog.webp'
import basket from './art/basket.webp'
import orchardTall from './art/orchard-tall.webp'
import orchard from './art/orchard.webp'
import { binFor, explain, fallSeconds, makeDealer, showDots, swipeBin, type Bin } from './logic'

type Face = 'idle' | 'blink' | 'happy' | 'sad'
const HEDGEHOG: [Face, string][] = [
  ['idle', hedgehog],
  ['blink', hedgehogBlink],
  ['happy', hedgehogHappy],
  ['sad', hedgehogSad],
]

/** The hedgehog blinks now and then while it waits. */
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

type ViewId = 'wide' | 'tall'

/** The orchard; the numbers fall from the apple tree into the baskets below. */
const VIEWS: PaintedView<ViewId>[] = [
  { id: 'wide', painting: orchard, world: { w: 1280, h: 800 }, focus: { x: 140, y: 60, w: 1000, h: 740 }, play: { x: 380, y: 150, w: 520, h: 480 }, ground: '#a0a52f', sayAt: { x: 900, y: 260 } },
  { id: 'tall', painting: orchardTall, world: { w: 720, h: 1152 }, focus: { x: 0, y: 160, w: 720, h: 960 }, ground: '#8ca023', sayAt: { x: 360, y: 250 } },
]

/** The air the numbers fall through, and the hedgehog. */
const SPOTS: Record<ViewId, { field: { x: number; y: number; w: number; h: number }; hedgehog: { x: number; bottom: number; h: number } }> = {
  wide: { field: { x: 380, y: 150, w: 520, h: 640 }, hedgehog: { x: 1080, bottom: 780, h: 260 } },
  tall: { field: { x: 110, y: 270, w: 500, h: 860 }, hedgehog: { x: 620, bottom: 1130, h: 220 } },
}

/** Numbers to sort in one stage. */
const STAGE = 10

interface Drop {
  id: number
  n: number
  /** 0 at the top of the field, 100 at the baskets. */
  y: number
  /** Set once answered: the basket it flies into, and whether that was right. */
  gone?: { bin: Bin; right: boolean }
}

/** Dots in pairs, two rows, so an odd number has one dot left over. */
function Dots({ n }: { n: number }) {
  const cols = Math.ceil(n / 2)
  return (
    <span className="eo-dots" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
      {Array.from({ length: cols * 2 }, (_, i) => {
        const col = i % cols
        const row = Math.floor(i / cols)
        const filled = col * 2 + row < n
        const lone = n % 2 === 1 && col === cols - 1 && row === 0
        return <span key={i} className={`eo-dot${filled ? '' : ' eo-dot-empty'}${lone ? ' eo-dot-lone' : ''}`} />
      })}
    </span>
  )
}

export default function EvenOdd({ level, seed, t, onFinish }: GameProps) {
  const rng = useRef(makeRng(seed)).current
  const deal = useRef(makeDealer(rng, level)).current
  const nextId = useRef(0)
  // The falling number lives in a ref (the game loop and taps both change it) and is copied to state to draw it.
  const cur = useRef<Drop | null>(null)
  if (!cur.current) cur.current = { id: nextId.current++, n: deal(), y: 0 }
  const [drop, setDrop] = useState<Drop>(cur.current)
  const show = (d: Drop) => {
    cur.current = d
    setDrop(d)
  }
  const [message, setMessage] = useState<{ text: string; kind: '' | 'yes' | 'no' }>(() => ({ text: t('hint'), kind: '' }))
  const [glow, setGlow] = useState<{ bin: Bin; right: boolean } | null>(null)
  const stage = useStage(STAGE, onFinish)
  const over = stage.over
  const [fieldRef, shake] = useShake<HTMLDivElement>()
  const later = useTimeouts()
  const blink = useBlink()
  const swipeFrom = useRef<{ x: number; y: number } | null>(null)
  const dots = showDots(level)
  const fall = fallSeconds(level)

  const nextDrop = () => {
    later(() => show({ id: nextId.current++, n: deal(), y: 0 }), 380)
  }

  const missed = (n: number) => {
    const why = explain(n)
    setMessage({ text: t(why.key, why.vars), kind: 'no' })
    stage.slip()
    shake()
  }

  useGameLoop((dt) => {
    const d = cur.current!
    if (d.gone) return
    const y = d.y + (100 / fall) * dt
    if (y < 100) return show({ ...d, y })
    // It reached the bottom without an answer: show where it belonged.
    const bin = binFor(d.n)
    show({ ...d, y: 100, gone: { bin, right: false } })
    setGlow({ bin, right: false })
    later(() => setGlow(null), 500)
    missed(d.n)
    nextDrop()
  }, !over)

  const answer = (bin: Bin) => {
    const drop = cur.current!
    if (over || drop.gone) return
    const right = binFor(drop.n) === bin
    show({ ...drop, gone: { bin, right } })
    setGlow({ bin, right })
    later(() => setGlow(null), 450)
    if (!right) {
      nextDrop()
      missed(drop.n)
      return
    }
    setMessage({ text: `${drop.n}: ${t(bin)}!`, kind: 'yes' })
    if (!stage.good()) nextDrop()
  }

  // Arrow keys work too, for anyone on a computer.
  const answerRef = useLatest(answer)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') answerRef.current('even')
      if (e.key === 'ArrowRight') answerRef.current('odd')
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [answerRef])

  const binClass = (bin: Bin) =>
    `eo-bin eo-bin-${bin}${glow?.bin === bin ? (glow.right ? ' eo-bin-right' : ' eo-bin-wrong') : ''}`

  const face: Face = message.kind === 'yes' ? 'happy' : message.kind === 'no' ? 'sad' : blink ? 'blink' : 'idle'
  return (
    <PaintedScene
      views={VIEWS}
      say={message.text}
      stage={stage}
      className="even-odd"
      trayHeight={130}
      tray={
        <div className="eo-bins">
          <button className={binClass('even')} onPointerDown={() => answer('even')} disabled={over}>
            <img src={basket} alt="" draggable={false} />
            <span className="eo-bin-label">
              <span className="eo-bin-dots">●●<br />●●</span>
              {t('even')}
            </span>
          </button>
          <button className={binClass('odd')} onPointerDown={() => answer('odd')} disabled={over}>
            <img src={basket} alt="" draggable={false} />
            <span className="eo-bin-label">
              <span className="eo-bin-dots">●●●<br />●●</span>
              {t('odd')}
            </span>
          </button>
        </div>
      }
    >
      {(view) => {
        const at = SPOTS[view]
        return (
          <>
            <div className={`eo-char${message.kind === 'yes' ? ' eo-cheer' : ''}`} style={worldStyle(at.hedgehog.x, at.hedgehog.bottom, at.hedgehog.h)}>
              {HEDGEHOG.map(([f, src]) => (
                <img key={f} src={src} alt="" draggable={false} className={f === face ? '' : 'eo-off'} />
              ))}
            </div>
            <div
              ref={fieldRef}
              className="eo-field"
              style={{ left: at.field.x, top: at.field.y, width: at.field.w, height: at.field.h }}
              onPointerDown={(e) => (swipeFrom.current = { x: e.clientX, y: e.clientY })}
              onPointerUp={(e) => {
                const from = swipeFrom.current
                swipeFrom.current = null
                if (!from) return
                const bin = swipeBin(e.clientX - from.x, e.clientY - from.y)
                if (bin) answer(bin)
              }}
              onPointerCancel={() => (swipeFrom.current = null)}
            >
              <div
                key={drop.id}
                className={`eo-drop${dots ? ' eo-drop-dots' : ''}${drop.gone ? ` eo-gone-${drop.gone.bin}` : ''}${drop.gone && !drop.gone.right ? ' eo-drop-wrong' : ''}`}
                style={{ top: `${drop.y * 0.78}%` }}
              >
                <span className="eo-num">{drop.n}</span>
                {dots && <Dots n={drop.n} />}
              </div>
            </div>
          </>
        )
      }}
    </PaintedScene>
  )
}
