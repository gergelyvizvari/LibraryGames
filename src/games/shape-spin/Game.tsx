import { useRef, useState } from 'react'
import { usePops, useShake } from '../../kit/hooks'
import { makeRng } from '../../kit/random'
import { SceneShell, useStage } from '../../kit/SceneShell'
import type { GameProps } from '../../kit/types'
import { Pops } from '../../kit/ui'
import { makePuzzle, mirror, sameShape, type Cells } from './logic'

/** Shapes to find in one stage. */
const STAGE = 6

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
  const stage = useStage(STAGE, onFinish)
  const [pops, addPop] = usePops()
  const [ref, shake] = useShake<HTMLDivElement>()

  const choose = (i: number) => {
    if (stage.over) return
    if (i !== puzzle.answer) {
      stage.slip()
      shake()
      if (sameShape(mirror(puzzle.target), puzzle.options[i])) addPop(t('flipped'), 50, 60, 'bad')
      return
    }
    if (stage.good()) return
    setSpin((s) => s + 1)
    setPuzzle(makePuzzle(rng, level))
  }

  return (
    <SceneShell place="woods" say={t('which')} stage={stage} className="shape-spin">
      <div className="ss-target" key={spin}>
        <Shape cells={puzzle.target} color="var(--game-color)" size={34} />
      </div>
      <div className="ss-options" ref={ref} style={{ gridTemplateColumns: `repeat(${puzzle.options.length === 4 ? 2 : 3}, 1fr)` }}>
        {puzzle.options.map((o, i) => (
          <button key={`${spin}-${i}`} className="ss-option" onPointerDown={() => choose(i)}>
            <Shape cells={o} color="#54a0ff" size={20} />
          </button>
        ))}
      </div>
      <Pops pops={pops} />
    </SceneShell>
  )
}
