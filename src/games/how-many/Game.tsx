import { useEffect, useRef, useState } from 'react'
import { useTimeouts } from '../../kit/hooks'
import { makeRng } from '../../kit/random'
import { SceneShell, useStage } from '../../kit/SceneShell'
import { sound } from '../../kit/sound'
import { Thing, type ThingId } from '../../kit/things'
import type { GameProps } from '../../kit/types'
import { countRange, flashMs, makeDots, options, pointsFor } from './logic'

/** Looks in one stage. */
const STAGE = 6
// Something different to count every round.
const things: ThingId[] = ['apple', 'fish', 'star', 'ladybird', 'balloon', 'mushroom', 'flower', 'cookie', 'acorn', 'berries', 'heart', 'leaf', 'snowball', 'pine']

export default function HowMany({ level, seed, t, onFinish }: GameProps) {
  const rng = useRef(makeRng(seed)).current
  const makeRound = () => {
    const n = rng.int(...countRange(level))
    return { n, dots: makeDots(rng, n), options: options(rng, n), thing: rng.pick(things) }
  }
  const [round, setRound] = useState(makeRound)
  const [index, setIndex] = useState(0)
  const [phase, setPhase] = useState<'show' | 'guess' | 'result'>('show')
  const [message, setMessage] = useState('')
  const stage = useStage(STAGE, onFinish)
  const later = useTimeouts()

  useEffect(() => {
    if (phase !== 'show') return
    sound.pop()
    later(() => setPhase('guess'), flashMs(level))
  }, [phase, index, level, later])

  const guess = (g: number) => {
    if (phase !== 'guess') return
    const pts = pointsFor(g, round.n)
    setMessage(pts === 20 ? t('exact') : pts > 0 ? t('close', { n: round.n }) : t('itWas', { n: round.n }))
    setPhase('result')
    if (pts < 20) sound.tone(pts > 0 ? 500 : 220, 0.12, 'triangle')
    if (pts === 20 ? stage.good(pts) : stage.miss()) return
    later(() => {
      setRound(makeRound())
      setIndex(index + 1)
      setPhase('show')
    }, 1300)
  }

  return (
    <SceneShell place="peaks" say={phase === 'show' ? t('look') : phase === 'guess' ? t('howMany') : message} stage={stage} bare className="how-many">
      <div className="hm-board">
        <span className="hm-chalk" aria-hidden />
        {(phase === 'show' || phase === 'result') &&
          round.dots.map((d, i) => (
            <span key={`${index}-${i}`} className="hm-dot" style={{ left: `${d.x}%`, top: `${d.y}%` }}>
              <Thing id={round.thing} />
            </span>
          ))}
        {phase === 'guess' && <span className="hm-question">?</span>}
      </div>
      <div className="hm-options">
        {round.options.map((o) => (
          <button key={`${index}-${o}`} className="choice-btn" disabled={phase !== 'guess'} onClick={() => guess(o)}>
            {o}
          </button>
        ))}
      </div>
    </SceneShell>
  )
}
