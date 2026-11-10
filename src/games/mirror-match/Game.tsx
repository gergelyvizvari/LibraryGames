import { useRef, useState } from 'react'
import { useShake, useTimeouts } from '../../kit/hooks'
import { makeRng } from '../../kit/random'
import { SceneShell, useStage } from '../../kit/SceneShell'
import { sound } from '../../kit/sound'
import type { GameProps } from '../../kit/types'
import { makePuzzle, targets } from './logic'

/** Patterns to mirror in one stage. */
const STAGE = 4

export default function MirrorMatch({ level, seed, t, onFinish }: GameProps) {
  const rng = useRef(makeRng(seed)).current
  const [puzzle, setPuzzle] = useState(() => makePuzzle(rng, level, 0))
  const [filled, setFilled] = useState<number[]>([])
  const [wrongCell, setWrongCell] = useState<number | null>(null)
  const [solved, setSolved] = useState(0)
  const stage = useStage(STAGE, onFinish)
  const [ref, shake] = useShake<HTMLDivElement>()
  const later = useTimeouts()
  const goal = targets(puzzle)

  const tap = (cell: number) => {
    if (stage.over || filled.includes(cell) || filled.length === goal.length) return
    if (!goal.includes(cell)) {
      setWrongCell(cell)
      later(() => setWrongCell(null), 300)
      stage.slip()
      shake()
      return
    }
    const next = [...filled, cell]
    setFilled(next)
    sound.tone(500 + next.length * 60, 0.08, 'triangle', 0.16)
    if (next.length < goal.length) return
    setSolved((n) => n + 1)
    if (stage.good(goal.length * 10)) return
    later(() => {
      setPuzzle(makePuzzle(rng, level, solved + 1))
      setFilled([])
    }, 800)
  }

  const side = (isLeft: boolean) => (
    <div className="mm-side" style={{ gridTemplateColumns: `repeat(${puzzle.half}, 1fr)` }}>
      {Array.from({ length: puzzle.rows * puzzle.half }, (_, i) => {
        const on = isLeft ? puzzle.left.includes(i) : filled.includes(i)
        return isLeft ? (
          <span key={i} className={`mm-cell${on ? ' mm-on' : ''}`} />
        ) : (
          <button key={i} className={`mm-cell mm-tap${on ? ' mm-on' : ''}${wrongCell === i ? ' mm-wrong' : ''}`} onPointerDown={() => tap(i)} />
        )
      })}
    </div>
  )

  return (
    <SceneShell place="woods" say={t('say')} stage={stage} bare className="mirror-match">
      <div className="mm-board" ref={ref} key={solved}>
        {side(true)}
        <div className="mm-mirror" />
        {side(false)}
      </div>
    </SceneShell>
  )
}
