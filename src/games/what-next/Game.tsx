import { useRef, useState } from 'react'
import { useCountdown, usePops, useShake, useTimeouts } from '../../kit/hooks'
import { clamp, makeRng } from '../../kit/random'
import { sound, vibrate } from '../../kit/sound'
import type { GameProps } from '../../kit/types'
import { Hud, Pops, TimerBar } from '../../kit/ui'
import { makePuzzle } from './logic'

const DURATION = 60

export default function WhatNext({ level, seed, t, onFinish }: GameProps) {
  const rng = useRef(makeRng(seed)).current
  const [puzzle, setPuzzle] = useState(() => makePuzzle(rng, level))
  const [round, setRound] = useState(0)
  const [solved, setSolved] = useState(false)
  const [score, setScore] = useState(0)
  const [combo, setCombo] = useState(0)
  const [right, setRight] = useState(0)
  const [wrong, setWrong] = useState(0)
  const [over, setOver] = useState(false)
  const [pops, addPop] = usePops()
  const [ref, shake] = useShake<HTMLDivElement>()
  const later = useTimeouts()

  const left = useCountdown(
    DURATION,
    () => {
      setOver(true)
      onFinish({ score, accuracy: (right / Math.max(1, right + wrong)) * clamp(right / 12, 0, 1) })
    },
    !over,
  )

  const choose = (o: string) => {
    if (over || solved) return
    if (o === puzzle.answer) {
      const nc = combo + 1
      const gained = 10 + Math.min(nc, 10) * 2
      setScore((s) => s + gained)
      setCombo(nc)
      setRight((r) => r + 1)
      setSolved(true)
      sound.good(nc)
      addPop(`+${gained}`, 50, 35)
      later(() => {
        setPuzzle(makePuzzle(rng, level))
        setRound((r) => r + 1)
        setSolved(false)
      }, 450)
    } else {
      setCombo(0)
      setWrong((w) => w + 1)
      sound.bad()
      vibrate(50)
      shake()
    }
  }

  return (
    <div className="game what-next">
      <TimerBar left={left} total={DURATION} />
      <Hud
        items={[
          { label: t('score'), value: score },
          { label: t('combo'), value: `×${combo}`, highlight: combo >= 5 },
          { label: t('time'), value: Math.ceil(left) },
        ]}
      />
      <div className="wn-row" ref={ref} key={round}>
        {puzzle.shown.map((s, i) => (
          <span key={i} className="wn-item" style={{ animationDelay: `${i * 0.04}s` }}>
            {s}
          </span>
        ))}
        <span className={`wn-item wn-slot${solved ? ' wn-solved' : ''}`}>{solved ? puzzle.answer : '?'}</span>
      </div>
      <div className="choices">
        {puzzle.options.map((o) => (
          <button key={`${round}-${o}`} className="choice-btn wn-choice" onPointerDown={() => choose(o)}>
            {o}
          </button>
        ))}
      </div>
      <Pops pops={pops} />
    </div>
  )
}
