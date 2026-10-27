import { useEffect, useRef, useState } from 'react'
import { usePops, useTimeouts } from '../../kit/hooks'
import { makeRng } from '../../kit/random'
import { sound } from '../../kit/sound'
import type { GameProps } from '../../kit/types'
import { Hud, Pops } from '../../kit/ui'
import { ROUNDS, countRange, flashMs, makeDots, options, pointsFor } from './logic'

const dotColors = ['#ff6b6b', '#feca57', '#1dd1a1', '#48dbfb', '#a29bfe']

export default function HowMany({ level, seed, t, onFinish }: GameProps) {
  const rng = useRef(makeRng(seed)).current
  const makeRound = () => {
    const n = rng.int(...countRange(level))
    return { n, dots: makeDots(rng, n), options: options(rng, n), color: rng.pick(dotColors) }
  }
  const [round, setRound] = useState(makeRound)
  const [index, setIndex] = useState(0)
  const [phase, setPhase] = useState<'show' | 'guess' | 'result'>('show')
  const [message, setMessage] = useState('')
  const [score, setScore] = useState(0)
  const [exact, setExact] = useState(0)
  const [pops, addPop] = usePops()
  const later = useTimeouts()

  useEffect(() => {
    if (phase !== 'show') return
    sound.pop()
    later(() => setPhase('guess'), flashMs(level))
  }, [phase, index, level, later])

  const guess = (g: number) => {
    if (phase !== 'guess') return
    const pts = pointsFor(g, round.n)
    const s = score + pts
    const e = exact + (pts === 20 ? 1 : 0)
    setScore(s)
    setExact(e)
    if (pts === 20) {
      sound.good(e)
      setMessage(t('exact'))
      addPop(`+${pts}`, 50, 40)
    } else if (pts > 0) {
      sound.tone(500, 0.12, 'triangle')
      setMessage(t('close', { n: round.n }))
      addPop(`+${pts}`, 50, 40, 'info')
    } else {
      sound.bad()
      setMessage(t('itWas', { n: round.n }))
    }
    setPhase('result')
    later(() => {
      if (index + 1 >= ROUNDS) {
        onFinish({ score: s, accuracy: e / ROUNDS })
        return
      }
      setRound(makeRound())
      setIndex(index + 1)
      setPhase('show')
    }, 1300)
  }

  return (
    <div className="game how-many">
      <Hud
        items={[
          { label: t('score'), value: score },
          { label: t('round'), value: `${index + 1} / ${ROUNDS}` },
        ]}
      />
      <p className="prompt">{phase === 'show' ? t('look') : phase === 'guess' ? t('howMany') : message}</p>
      <div className="hm-board">
        {(phase === 'show' || phase === 'result') &&
          round.dots.map((d, i) => <span key={`${index}-${i}`} className="hm-dot" style={{ left: `${d.x}%`, top: `${d.y}%`, background: round.color }} />)}
        {phase === 'guess' && <span className="hm-question">?</span>}
        <Pops pops={pops} />
      </div>
      <div className="hm-options">
        {round.options.map((o) => (
          <button key={`${index}-${o}`} className="choice-btn" disabled={phase !== 'guess'} onClick={() => guess(o)}>
            {o}
          </button>
        ))}
      </div>
    </div>
  )
}
