import { useRef, useState } from 'react'
import { useCountdown, usePops, useShake } from '../../kit/hooks'
import { clamp, makeRng } from '../../kit/random'
import { sound, vibrate } from '../../kit/sound'
import type { GameProps } from '../../kit/types'
import { Hud, Pops, TimerBar } from '../../kit/ui'
import { makePuzzle, mirror, sameShape, type Cells } from './logic'

const DURATION = 60

function Shape({ cells, color, size = 26 }: { cells: Cells; color: string; size?: number }) {
  const w = Math.max(...cells.map((c) => c[0])) + 1
  const h = Math.max(...cells.map((c) => c[1])) + 1
  return (
    <svg viewBox={`0 0 ${w * size} ${h * size}`} width={w * size} height={h * size} aria-hidden>
      {cells.map(([x, y]) => (
        <rect key={`${x},${y}`} x={x * size + 1.5} y={y * size + 1.5} width={size - 3} height={size - 3} rx={6} fill={color} />
      ))}
    </svg>
  )
}

export default function ShapeSpin({ level, seed, t, onFinish }: GameProps) {
  const rng = useRef(makeRng(seed)).current
  const [puzzle, setPuzzle] = useState(() => makePuzzle(rng, level))
  const [spin, setSpin] = useState(0)
  const [score, setScore] = useState(0)
  const [combo, setCombo] = useState(0)
  const [right, setRight] = useState(0)
  const [wrong, setWrong] = useState(0)
  const [over, setOver] = useState(false)
  const [pops, addPop] = usePops()
  const [ref, shake] = useShake<HTMLDivElement>()

  const left = useCountdown(
    DURATION,
    () => {
      setOver(true)
      onFinish({ score, accuracy: (right / Math.max(1, right + wrong)) * clamp(right / 12, 0, 1) })
    },
    !over,
  )

  const choose = (i: number) => {
    if (over) return
    if (i === puzzle.answer) {
      const nc = combo + 1
      const gained = 10 + Math.min(nc, 10) * 2
      setScore((s) => s + gained)
      setCombo(nc)
      setRight((r) => r + 1)
      sound.good(nc)
      addPop(`+${gained}`, 50, 30)
      setSpin((s) => s + 1)
      setPuzzle(makePuzzle(rng, level))
    } else {
      setCombo(0)
      setWrong((w) => w + 1)
      sound.bad()
      vibrate(50)
      shake()
      const isMirror = sameShape(mirror(puzzle.target), puzzle.options[i])
      addPop(isMirror ? t('flipped') : '✗', 50, 60, 'bad')
    }
  }

  return (
    <div className="game shape-spin">
      <TimerBar left={left} total={DURATION} />
      <Hud
        items={[
          { label: t('score'), value: score },
          { label: t('combo'), value: `×${combo}`, highlight: combo >= 5 },
          { label: t('time'), value: Math.ceil(left) },
        ]}
      />
      <div className="ss-target" key={spin}>
        <Shape cells={puzzle.target} color="var(--game-color)" size={34} />
      </div>
      <p className="prompt">{t('which')}</p>
      <div className="ss-options" ref={ref}>
        {puzzle.options.map((o, i) => (
          <button key={`${spin}-${i}`} className="ss-option" onPointerDown={() => choose(i)}>
            <Shape cells={o} color="#54a0ff" size={20} />
          </button>
        ))}
      </div>
      <Pops pops={pops} />
    </div>
  )
}
