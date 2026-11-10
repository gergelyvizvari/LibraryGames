import { useEffect, useRef, useState } from 'react'
import { useShake, useTimeouts } from '../../kit/hooks'
import { clamp, makeRng } from '../../kit/random'
import { SceneShell, useStage } from '../../kit/SceneShell'
import { sound } from '../../kit/sound'
import type { GameProps } from '../../kit/types'
import { gridFor, pattern, startCount } from './logic'

/** Patterns to remember in one stage. Each one glows one square more; a slip brings an easier one. */
const STAGE = 5

export default function GridGlow({ level, seed, t, onFinish }: GameProps) {
  const rng = useRef(makeRng(seed)).current
  const [count, setCount] = useState(startCount(level))
  const size = gridFor(count)
  const [cells, setCells] = useState(() => pattern(rng, size, count))
  const [mode, setMode] = useState<'show' | 'input' | 'wait'>('show')
  const [picked, setPicked] = useState<number[]>([])
  const [wrongCell, setWrongCell] = useState<number | null>(null)
  const [rounds, setRounds] = useState(0)
  const stage = useStage(STAGE, onFinish)
  const [ref, shake] = useShake<HTMLDivElement>()
  const later = useTimeouts()

  useEffect(() => {
    if (mode !== 'show') return
    sound.tone(700, 0.15, 'triangle', 0.15)
    later(() => setMode('input'), clamp(1700 - level * 80 + count * 140, 1000, 2600))
  }, [mode, cells, level, count, later])

  const newRound = (n: number) => {
    setCount(n)
    setCells(pattern(rng, gridFor(n), n))
    setPicked([])
    setWrongCell(null)
    setRounds((r) => r + 1)
    setMode('show')
  }

  const tap = (i: number) => {
    if (mode !== 'input' || picked.includes(i)) return
    if (!cells.includes(i)) {
      stage.slip()
      shake()
      setWrongCell(i)
      setMode('wait')
      later(() => newRound(Math.max(2, count - 1)), 1300)
      return
    }
    const next = [...picked, i]
    setPicked(next)
    sound.tone(500 + next.length * 60, 0.08, 'triangle', 0.15)
    if (next.length < cells.length) return
    setMode('wait')
    if (!stage.good(count * 10)) later(() => newRound(count + 1), 800)
  }

  return (
    <SceneShell place="lake" say={mode === 'show' ? t('watch') : t('yourTurn')} stage={stage} className="grid-glow">
      <div className="gg-grid" ref={ref} style={{ gridTemplateColumns: `repeat(${size}, 1fr)` }}>
        {Array.from({ length: size * size }, (_, i) => {
          const lit = mode === 'show' || (mode === 'wait' && wrongCell !== null) ? cells.includes(i) : picked.includes(i)
          return (
            <button
              key={`${rounds}-${i}`}
              className={`gg-cell${lit ? ' gg-lit' : ''}${wrongCell === i ? ' gg-wrong' : ''}`}
              onPointerDown={() => tap(i)}
              aria-label={`square ${i + 1}`}
            />
          )
        })}
      </div>
    </SceneShell>
  )
}
