import { useEffect, useRef, useState, type PointerEvent } from 'react'
import { useShake, useTimeouts } from '../../kit/hooks'
import { PaintedScene, type PaintedView } from '../../kit/painted'
import { makeRng } from '../../kit/random'
import { useStage } from '../../kit/SceneShell'
import { tone } from '../../kit/sound'
import type { GameProps } from '../../kit/types'
import frogBlink from './art/frog-blink.webp'
import frogHappy from './art/frog-happy.webp'
import frogSad from './art/frog-sad.webp'
import frog from './art/frog.webp'
import stone from './art/stone.webp'
import streamTall from './art/stream-tall.webp'
import stream from './art/stream.webp'
import { jumpText, makeQuestion, pathOf, showsLabel, specFor, WINDOW, type Question } from './logic'

/** Landings to find in one stage. */
const STAGE = 6

/** Where a number sits across the line, in % of its width. */
const xOf = (n: number, lo: number) => 5 + ((n - lo) / WINDOW) * 90

/** Every single hop the frog makes, one number at a time. */
function hopsOf(q: Question) {
  const path = pathOf(q)
  const out: number[] = []
  for (let k = 1; k < path.length; k++) {
    const dir = Math.sign(path[k] - path[k - 1])
    for (let n = path[k - 1] + dir; n !== path[k] + dir; n += dir) out.push(n)
  }
  return out
}

type ViewId = 'wide' | 'tall'
type Face = 'idle' | 'blink' | 'happy' | 'sad'
const FROG: [Face, string][] = [
  ['idle', frog],
  ['blink', frogBlink],
  ['happy', frogHappy],
  ['sad', frogSad],
]

/** The stream with its stepping stones across the middle; the jump cards sit on the far bank above it. */
const VIEWS: PaintedView<ViewId>[] = [
  { id: 'wide', painting: stream, world: { w: 1280, h: 800 }, focus: { x: 0, y: 120, w: 1280, h: 680 }, play: { x: 20, y: 380, w: 1240, h: 410 }, ground: '#a2b832', sayAt: { x: 640, y: 210 } },
  { id: 'tall', painting: streamTall, world: { w: 720, h: 1152 }, focus: { x: 0, y: 260, w: 720, h: 800 }, ground: '#aeb731', sayAt: { x: 360, y: 380 } },
]

/**
 * The tap area (a box reaching from the stones down over the near bank, so a finger anywhere in a stone's column
 * picks it), where in it the stones sit (`row`, a fraction of its height), how big stones, numbers and frog are
 * (`k`; bigger on a phone, whose painting is shown smaller), and where the jump cards sit.
 */
const SPOTS: Record<ViewId, { line: { x: number; y: number; w: number; h: number }; row: number; k: number; jumps: number }> = {
  wide: { line: { x: 20, y: 380, w: 1240, h: 410 }, row: 0.46, k: 1, jumps: 300 },
  tall: { line: { x: 0, y: 590, w: 720, h: 540 }, row: 0.19, k: 1.25, jumps: 455 },
}

/** The frog blinks now and then while it waits. */
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

export default function NumberLine({ level, seed, t, onFinish }: GameProps) {
  const spec = specFor(level)
  const rng = useRef(makeRng(seed)).current
  const [q, setQ] = useState(() => makeQuestion(rng, level, rng.int(0, Math.min(4, spec.max - WINDOW + 4))))
  const [frog, setFrog] = useState(q.start)
  const [hop, setHop] = useState(0)
  const [busy, setBusy] = useState(false)
  const [picked, setPicked] = useState<number | null>(null)
  const [count, setCount] = useState<number | null>(null)
  // The stone a finger rests on. A finger can slide to the right stone; the answer counts when it lifts.
  const [aim, setAimState] = useState<number | null>(null)
  const aimRef = useRef<number | null>(null)
  const setAim = (n: number | null) => {
    aimRef.current = n
    setAimState(n)
  }
  const [message, setMessage] = useState<{ text: string; kind: '' | 'yes' | 'no' }>(() => ({ text: t('ask'), kind: '' }))
  const stage = useStage(STAGE, onFinish)
  const over = stage.over
  const [lineRef, shake] = useShake<HTMLDivElement>()
  const later = useTimeouts()
  const blink = useBlink()

  const sum = `${q.start} ${q.jumps.map(jumpText).join(' ')} = ${q.end}`

  const tap = (n: number) => {
    if (over || busy) return
    const right = n === q.end
    setBusy(true)
    setPicked(n)
    let last = false
    if (right) {
      setMessage({ text: sum, kind: 'yes' })
      last = stage.good()
    } else {
      setMessage({ text: t('no', { start: q.start, jumps: q.jumps.map(jumpText).join(' '), end: q.end }), kind: 'no' })
      stage.slip()
      shake()
    }
    // The frog hops the way, one number at a time. After a miss it hops slower and counts out loud.
    const hops = hopsOf(q)
    const step = right ? 150 : 330
    hops.forEach((n, i) => {
      later(() => {
        setFrog(n)
        setHop((h) => h + 1)
        if (!right) setCount(i + 1)
        tone(420 + i * 40, 0.07, 'triangle', 0.1)
      }, (right ? 150 : 600) + i * step)
    })
    if (last) return
    later(() => {
      const nq = makeQuestion(rng, level, q.end)
      setQ(nq)
      setFrog(nq.start)
      setPicked(null)
      setCount(null)
      setBusy(false)
      setMessage({ text: t('ask'), kind: '' })
    }, (right ? 150 : 600) + hops.length * step + (right ? 450 : 900))
  }

  /** The stone under the finger, from the stage's left edge: a tap counts when the finger lifts. */
  const tickAt = (e: PointerEvent<HTMLDivElement>) => {
    const box = e.currentTarget.getBoundingClientRect()
    const pct = ((e.clientX - box.left) / box.width) * 100
    return Math.min(q.lo + WINDOW, Math.max(q.lo, q.lo + Math.round(((pct - 5) / 90) * WINDOW)))
  }

  const ticks = Array.from({ length: WINDOW + 1 }, (_, i) => q.lo + i)
  const face: Face = message.kind === 'yes' ? 'happy' : message.kind === 'no' ? 'sad' : blink ? 'blink' : 'idle'
  return (
    <PaintedScene views={VIEWS} say={message.text} stage={stage} className="number-line">
      {(view) => {
        const at = SPOTS[view]
        return (
          <>
      <div className="nl-jumps" key={`${q.start}-${q.jumps.join()}-${q.lo}`} style={{ top: at.jumps }}>
        {q.jumps.map((j, i) => (
          <span key={i} className={`nl-jump ${j > 0 ? 'nl-fwd' : 'nl-back'}`}>
            <svg viewBox="-14 -12 28 24" aria-hidden focusable="false" style={{ transform: j > 0 ? undefined : 'scaleX(-1)' }}>
              <path d="M-11 0 H7 M2 -8 L11 0 L2 8" fill="none" stroke="currentColor" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {jumpText(j)}
          </span>
        ))}
      </div>
      <div
        className="nl-stage"
        ref={lineRef}
        style={{ left: at.line.x, top: at.line.y, width: at.line.w, height: at.line.h, ['--nl-row' as string]: `${at.row * 100}%`, ['--nl-k' as string]: at.k }}
        onPointerDown={(e) => {
          if (over || busy) return
          e.currentTarget.setPointerCapture?.(e.pointerId)
          setAim(tickAt(e))
        }}
        onPointerMove={(e) => aimRef.current !== null && setAim(tickAt(e))}
        onPointerUp={() => {
          const n = aimRef.current
          setAim(null)
          if (n !== null) tap(n)
        }}
        onPointerCancel={() => setAim(null)}
      >
        <span key={hop} className="nl-frog" style={{ left: `${xOf(frog, q.lo)}%` }}>
          {FROG.map(([f, src]) => (
            <img key={f} src={src} alt="" draggable={false} className={f === face ? '' : 'nl-off'} />
          ))}
          {count !== null && <span className="nl-count">{count}</span>}
        </span>
        <div className="nl-line" />
        {ticks.map((n) => {
          const state = picked === n ? (n === q.end ? ' nl-right' : ' nl-wrong') : busy && n === q.end && picked !== null ? ' nl-right' : ''
          return (
            <button
              key={n}
              className={`nl-tick${n === q.start ? ' nl-start' : ''}${state}${aim === n ? ' nl-aim' : ''}`}
              style={{ left: `${xOf(n, q.lo)}%` }}
              // Taps and drags are handled by the stage; this is for the keyboard (Enter or Space).
              onClick={(e) => e.detail === 0 && tap(n)}
              disabled={over}
              aria-label={String(n)}
            >
              <img className="nl-mark" src={stone} alt="" draggable={false} />
              <span className="nl-num">{showsLabel(n, q, spec.labels) || (busy && n === q.end) ? n : ''}</span>
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
