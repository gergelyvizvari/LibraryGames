import { useRef, useState } from 'react'
import { useCountdown, usePops, useShake, useTimeouts } from '../../kit/hooks'
import { makeRng } from '../../kit/random'
import { sound, vibrate } from '../../kit/sound'
import type { GameProps } from '../../kit/types'
import { Hud, Pops, TimerBar } from '../../kit/ui'
import { Clock } from './Clock'
import { DURATION, flipped, label, makeOptions, pointsFor, randomTime, same, stepFor, type Time } from './logic'

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
  const [score, setScore] = useState(0)
  const [caught, setCaught] = useState(0)
  const [combo, setCombo] = useState(0)
  const [message, setMessage] = useState('')
  const [over, setOver] = useState(false)
  const stats = useRef({ right: 0, misses: 0 })
  const shownAt = useRef(performance.now())
  const [pops, addPop] = usePops()
  const [ref, shake] = useShake<HTMLDivElement>()
  const later = useTimeouts()
  const flip = flipped(level, index)

  const left = useCountdown(
    DURATION,
    () => {
      setOver(true)
      const s = stats.current
      onFinish({ score, accuracy: (s.right / Math.max(1, s.right + s.misses)) * Math.min(1, s.right / 10) })
    },
    !over,
  )

  const pick = (o: Time) => {
    if (over || solved || wrong.some((w) => same(w, o))) return
    if (!same(o, q.answer)) {
      stats.current.misses++
      setWrong((w) => [...w, o])
      setCombo(0)
      setMessage(t('no'))
      sound.bad()
      vibrate(40)
      shake()
      return
    }
    const firstTry = wrong.length === 0
    const c = firstTry ? combo + 1 : 0
    const pts = firstTry ? pointsFor((performance.now() - shownAt.current) / 1000, c) : 5
    if (firstTry) stats.current.right++
    setCombo(c)
    setScore((s) => s + pts)
    setCaught((n) => n + 1)
    setSolved(true)
    setMessage(t('yes', { time: label(q.answer) }))
    sound.good(c)
    // Two soft ticks, like a clock.
    sound.tone(1200, 0.03, 'square', 0.05, 0.18)
    sound.tone(900, 0.03, 'square', 0.05, 0.3)
    addPop(`+${pts}`, 50, 20)
    later(() => {
      setQ(makeQuestion(q.answer))
      setIndex((i) => i + 1)
      setWrong([])
      setSolved(false)
      setMessage('')
      shownAt.current = performance.now()
    }, 900)
  }

  const optionClass = (o: Time) =>
    `${solved && same(o, q.answer) ? ' cc-right' : ''}${wrong.some((w) => same(w, o)) ? ' cc-wrong' : ''}`

  return (
    <div className="game clock-catch">
      <TimerBar left={left} total={DURATION} />
      <Hud
        items={[
          { label: t('score'), value: score },
          { label: t('caught'), value: caught, highlight: combo >= 3 },
          { label: t('time'), value: Math.ceil(left) },
        ]}
      />
      <p className={`prompt${solved ? ' cc-yes' : ''}`}>
        {message || (flip ? t('findClock', { time: label(q.answer) }) : t('whatTime'))}
      </p>
      <div className={`cc-stage${flip ? ' cc-stage-flip' : ''}`} key={index}>
        {flip ? <div className="cc-digital">{label(q.answer)}</div> : <Clock time={q.answer} size={210} />}
        <Pops pops={pops} />
      </div>
      <div ref={ref} className={flip ? 'cc-clocks' : `cc-options cc-options-${q.options.length}`}>
        {q.options.map((o) => (
          <button
            key={`${index}-${label(o)}`}
            className={`${flip ? 'cc-clock-btn' : 'cc-time-btn'}${optionClass(o)}`}
            onPointerDown={() => pick(o)}
            disabled={over}
            aria-label={label(o)}
          >
            {flip ? <Clock time={o} size={104} /> : label(o)}
          </button>
        ))}
      </div>
    </div>
  )
}
