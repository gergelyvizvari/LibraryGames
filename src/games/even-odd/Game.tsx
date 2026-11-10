import { useEffect, useRef, useState } from 'react'
import { useGameLoop, useLatest, useShake, useTimeouts } from '../../kit/hooks'
import { makeRng } from '../../kit/random'
import { SceneShell, useStage } from '../../kit/SceneShell'
import type { GameProps } from '../../kit/types'
import { binFor, explain, fallSeconds, makeDealer, showDots, swipeBin, type Bin } from './logic'

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

  return (
    <SceneShell place="peaks" say={message.text} stage={stage} bare fill className="even-odd">
      <div
        ref={fieldRef}
        className="eo-field"
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
        <span className="eo-arrow eo-arrow-left">⬅</span>
        <span className="eo-arrow eo-arrow-right">➡</span>
      </div>
      <div className="eo-bins">
        <button className={binClass('even')} onPointerDown={() => answer('even')} disabled={over}>
          <span className="eo-bin-dots">●●<br />●●</span>
          {t('even')}
        </button>
        <button className={binClass('odd')} onPointerDown={() => answer('odd')} disabled={over}>
          <span className="eo-bin-dots">●●●<br />●●</span>
          {t('odd')}
        </button>
      </div>
    </SceneShell>
  )
}
