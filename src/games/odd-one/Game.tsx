import { useRef, useState } from 'react'
import { useCountdown, usePops, useShake } from '../../kit/hooks'
import { clamp, makeRng } from '../../kit/random'
import { sound, vibrate } from '../../kit/sound'
import type { GameProps } from '../../kit/types'
import { Hud, Pops, TimerBar } from '../../kit/ui'
import { makeBoard } from './logic'

const DURATION = 60

export default function OddOne({ level, seed, t, onFinish }: GameProps) {
  const rng = useRef(makeRng(seed)).current
  const [board, setBoard] = useState(() => makeBoard(rng, level, 0))
  const [found, setFound] = useState(0)
  const [misses, setMisses] = useState(0)
  const [score, setScore] = useState(0)
  const [over, setOver] = useState(false)
  const shownAt = useRef(performance.now())
  const [pops, addPop] = usePops()
  const [ref, shake] = useShake<HTMLDivElement>()

  const left = useCountdown(
    DURATION,
    () => {
      setOver(true)
      onFinish({ score, accuracy: (found / Math.max(1, found + misses)) * clamp(found / 15, 0, 1) })
    },
    !over,
  )

  const tap = (i: number) => {
    if (over) return
    if (i === board.oddIndex) {
      const seconds = (performance.now() - shownAt.current) / 1000
      // Faster finds earn a speed bonus.
      const gained = 10 + Math.max(0, Math.round((3 - seconds) * 5)) + board.size
      const f = found + 1
      setFound(f)
      setScore((s) => s + gained)
      sound.good(Math.min(f, 12))
      const col = i % board.size
      const row = Math.floor(i / board.size)
      addPop(`+${gained}`, ((col + 0.5) / board.size) * 100, ((row + 0.5) / board.size) * 100)
      setBoard(makeBoard(rng, level, f))
      shownAt.current = performance.now()
    } else {
      setMisses((m) => m + 1)
      sound.bad()
      vibrate(40)
      shake()
    }
  }

  return (
    <div className="game odd-one">
      <TimerBar left={left} total={DURATION} />
      <Hud
        items={[
          { label: t('score'), value: score },
          { label: t('found'), value: found, highlight: found > 0 && found % 3 === 0 },
          { label: t('time'), value: Math.ceil(left) },
        ]}
      />
      <p className="prompt">{t('find')}</p>
      <div className="oo-wrap">
        <div
          className="oo-grid"
          ref={ref}
          key={found}
          style={{ gridTemplateColumns: `repeat(${board.size}, 1fr)`, fontSize: `${Math.max(1.4, 4.2 - board.size * 0.45)}rem` }}
        >
          {Array.from({ length: board.size * board.size }, (_, i) => (
            <button key={i} className="oo-cell" onPointerDown={() => tap(i)}>
              {i === board.oddIndex ? board.odd : board.common}
            </button>
          ))}
        </div>
        <Pops pops={pops} />
      </div>
    </div>
  )
}
