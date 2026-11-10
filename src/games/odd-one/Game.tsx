import { useRef, useState } from 'react'
import { useShake } from '../../kit/hooks'
import { makeRng } from '../../kit/random'
import { SceneShell, useStage } from '../../kit/SceneShell'
import type { GameProps } from '../../kit/types'
import { STAGE, makeBoard } from './logic'

export default function OddOne({ level, seed, t, onFinish }: GameProps) {
  const rng = useRef(makeRng(seed)).current
  const [board, setBoard] = useState(() => makeBoard(rng, level, 0))
  const stage = useStage(STAGE, onFinish)
  const [ref, shake] = useShake<HTMLDivElement>()

  const tap = (i: number) => {
    if (stage.over) return
    if (i !== board.oddIndex) {
      stage.slip()
      shake()
      return
    }
    if (!stage.good(10 + board.size)) setBoard(makeBoard(rng, level, stage.done + 1))
  }

  return (
    <SceneShell place="lake" say={t('find')} stage={stage} bare className="odd-one">
      <div
        className="oo-grid"
        ref={ref}
        key={stage.done}
        style={{ gridTemplateColumns: `repeat(${board.size}, 1fr)`, fontSize: `${Math.max(1.4, 4.2 - board.size * 0.45)}rem` }}
      >
        {Array.from({ length: board.size * board.size }, (_, i) => (
          <button key={i} className="oo-cell" onPointerDown={() => tap(i)}>
            {i === board.oddIndex ? board.odd : board.common}
          </button>
        ))}
      </div>
    </SceneShell>
  )
}
