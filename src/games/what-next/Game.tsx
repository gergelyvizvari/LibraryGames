import { useRef, useState } from 'react'
import { useShake, useTimeouts } from '../../kit/hooks'
import { makeRng } from '../../kit/random'
import { SceneShell, useStage } from '../../kit/SceneShell'
import type { GameProps } from '../../kit/types'
import { makePuzzle } from './logic'
import { Piece } from './pieces'

/** Rows to finish in one stage. */
const STAGE = 6

export default function WhatNext({ level, seed, t, onFinish }: GameProps) {
  const rng = useRef(makeRng(seed)).current
  const [puzzle, setPuzzle] = useState(() => makePuzzle(rng, level))
  const [round, setRound] = useState(0)
  const [solved, setSolved] = useState(false)
  const stage = useStage(STAGE, onFinish)
  const [ref, shake] = useShake<HTMLDivElement>()
  const later = useTimeouts()

  const choose = (o: string) => {
    if (stage.over || solved) return
    if (o !== puzzle.answer) {
      stage.slip()
      shake()
      return
    }
    setSolved(true)
    if (stage.good()) return
    later(() => {
      setPuzzle(makePuzzle(rng, level))
      setRound((r) => r + 1)
      setSolved(false)
    }, 700)
  }

  return (
    <SceneShell place="woods" say={t('say')} stage={stage} bare className="what-next">
      <div className="wn-shelf" ref={ref} key={round}>
        <div className="wn-row">
          {puzzle.shown.map((s, i) => (
            <span key={i} className="wn-item" style={{ animationDelay: `${i * 0.04}s` }}>
              <Piece symbol={s} />
            </span>
          ))}
          <span className={`wn-item wn-slot${solved ? ' wn-solved' : ''}`}>{solved ? <Piece symbol={puzzle.answer} /> : '?'}</span>
        </div>
      </div>
      <div className="wn-choices">
        {puzzle.options.map((o, i) => (
          <button key={`${round}-${o}`} className="wn-choice" onPointerDown={() => choose(o)} aria-label={t('option', { n: i + 1 })}>
            <Piece symbol={o} />
          </button>
        ))}
      </div>
    </SceneShell>
  )
}
