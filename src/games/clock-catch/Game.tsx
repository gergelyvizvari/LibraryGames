import { useRef, useState } from 'react'
import { useShake, useTimeouts } from '../../kit/hooks'
import { makeRng } from '../../kit/random'
import { SceneShell, useStage } from '../../kit/SceneShell'
import { sound } from '../../kit/sound'
import type { GameProps } from '../../kit/types'
import { Clock } from './Clock'
import { flipped, label, makeOptions, randomTime, same, stepFor, type Time } from './logic'

/** Clocks to read in one stage. */
const STAGE = 6

export default function ClockCatch({ level, seed, t, onFinish }: GameProps) {
  const rng = useRef(makeRng(seed)).current
  const makeQuestion = (prev?: Time) => {
    let answer = randomTime(rng, stepFor(level))
    while (prev && same(prev, answer)) answer = randomTime(rng, stepFor(level))
    return { answer, options: makeOptions(rng, answer, level) }
  }
  const [q, setQ] = useState(() => makeQuestion())
  const [index, setIndex] = useState(0)
  const [wrong, setWrong] = useState<Time[]>([])
  const [solved, setSolved] = useState(false)
  const [message, setMessage] = useState('')
  const stage = useStage(STAGE, onFinish)
  const [ref, shake] = useShake<HTMLDivElement>()
  const later = useTimeouts()
  const flip = flipped(level, index)

  const pick = (o: Time) => {
    if (stage.over || solved || wrong.some((w) => same(w, o))) return
    if (!same(o, q.answer)) {
      setWrong((w) => [...w, o])
      setMessage(t('no'))
      stage.slip()
      shake()
      return
    }
    setSolved(true)
    setMessage(t('yes', { time: label(q.answer) }))
    // Two soft ticks, like a clock.
    sound.tone(1200, 0.03, 'square', 0.05, 0.18)
    sound.tone(900, 0.03, 'square', 0.05, 0.3)
    if (stage.good(wrong.length ? 5 : 15)) return
    later(() => {
      setQ(makeQuestion(q.answer))
      setIndex((i) => i + 1)
      setWrong([])
      setSolved(false)
      setMessage('')
    }, 1100)
  }

  const optionClass = (o: Time) => `${solved && same(o, q.answer) ? ' cc-right' : ''}${wrong.some((w) => same(w, o)) ? ' cc-wrong' : ''}`

  return (
    <SceneShell place="peaks" say={message || (flip ? t('findClock', { time: label(q.answer) }) : t('whatTime'))} stage={stage} bare className="clock-catch">
      <div className={`cc-stage${flip ? ' cc-stage-flip' : ''}`} key={index}>
        {flip ? <div className="cc-digital">{label(q.answer)}</div> : <Clock time={q.answer} size={200} />}
      </div>
      <div ref={ref} className={flip ? 'cc-clocks' : `cc-options cc-options-${q.options.length}`}>
        {q.options.map((o) => (
          <button
            key={`${index}-${label(o)}`}
            className={`${flip ? 'cc-clock-btn' : 'cc-time-btn'}${optionClass(o)}`}
            onPointerDown={() => pick(o)}
            disabled={stage.over}
            aria-label={label(o)}
          >
            {flip ? <Clock time={o} size={104} /> : label(o)}
          </button>
        ))}
      </div>
    </SceneShell>
  )
}
