import { useRef, useState } from 'react'
import { useLocale } from '../../i18n'
import { useCountdown, usePops, useShake, useTimeouts } from '../../kit/hooks'
import { makeRng } from '../../kit/random'
import { sound, vibrate } from '../../kit/sound'
import type { GameProps } from '../../kit/types'
import { Hud, Pops, TimerBar } from '../../kit/ui'
import { rhymes, type Word } from './content'
import { DURATION, makeDealer, makeQuestion, optionCount, pointsFor, showPictures } from './logic'

export default function RhymeTime({ level, seed, t, onFinish }: GameProps) {
  const locale = useLocale()
  const groups = rhymes[locale] ?? rhymes.en
  const rng = useRef(makeRng(seed)).current
  const deal = useRef(makeDealer(rng, groups)).current
  const next = () => makeQuestion(rng, groups, deal(), optionCount(level))
  const [q, setQ] = useState(next)
  const [qIndex, setQIndex] = useState(0)
  const [score, setScore] = useState(0)
  const [found, setFound] = useState(0)
  const [combo, setCombo] = useState(0)
  const [message, setMessage] = useState(() => t('ask'))
  const [wrong, setWrong] = useState<Word[]>([])
  const [solved, setSolved] = useState(false)
  const [over, setOver] = useState(false)
  const stats = useRef({ right: 0, misses: 0 })
  const shownAt = useRef(performance.now())
  const [pops, addPop] = usePops()
  const [ref, shake] = useShake<HTMLDivElement>()
  const later = useTimeouts()
  const pictures = showPictures(level)

  const left = useCountdown(
    DURATION,
    () => {
      setOver(true)
      const s = stats.current
      onFinish({ score, accuracy: (s.right / Math.max(1, s.right + s.misses)) * Math.min(1, s.right / 12) })
    },
    !over,
  )

  const pick = (o: Word) => {
    if (over || solved || wrong.includes(o)) return
    if (o !== q.answer) {
      stats.current.misses++
      setWrong((w) => [...w, o])
      setCombo(0)
      setMessage(t('no'))
      sound.bad()
      vibrate(40)
      shake()
      return
    }
    const seconds = (performance.now() - shownAt.current) / 1000
    const c = combo + 1
    const pts = wrong.length ? 5 : pointsFor(seconds, c)
    if (!wrong.length) stats.current.right++
    setCombo(wrong.length ? 0 : c)
    setScore((s) => s + pts)
    setFound((f) => f + 1)
    setSolved(true)
    setMessage(t('yes', { a: q.target.word, b: q.answer.word }))
    sound.good(wrong.length ? 0 : c)
    addPop(`+${pts}`, 82, 30)
    later(() => {
      setQ(next())
      setQIndex((i) => i + 1)
      setWrong([])
      setSolved(false)
      setMessage(t('ask'))
      shownAt.current = performance.now()
    }, 900)
  }

  return (
    <div className="game rhyme-time">
      <TimerBar left={left} total={DURATION} />
      <Hud
        items={[
          { label: t('score'), value: score },
          { label: t('found'), value: found, highlight: combo >= 3 },
          { label: t('time'), value: Math.ceil(left) },
        ]}
      />
      <div className="rt-target" key={qIndex}>
        <span className="rt-emoji">{q.target.emoji}</span>
        <span className="rt-word">{q.target.word}</span>
        <Pops pops={pops} />
      </div>
      <p className={`prompt${solved ? ' rt-yes' : ''}`}>{message}</p>
      <div ref={ref} className={`rt-options rt-options-${q.options.length}`}>
        {q.options.map((o) => (
          <button
            key={`${qIndex}-${o.word}`}
            className={`rt-option${solved && o === q.answer ? ' rt-right' : ''}${wrong.includes(o) ? ' rt-wrong' : ''}`}
            onPointerDown={() => pick(o)}
            disabled={over}
          >
            {pictures && <span className="rt-opt-emoji">{o.emoji}</span>}
            <span className="rt-opt-word">{o.word}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
