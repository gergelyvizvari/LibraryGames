import { useRef, useState } from 'react'
import { useLocale } from '../../i18n'
import { useShake, useTimeouts } from '../../kit/hooks'
import { makeRng } from '../../kit/random'
import { SceneShell, useStage } from '../../kit/SceneShell'
import type { GameProps } from '../../kit/types'
import { rhymes, type Word } from './content'
import { makeDealer, makeQuestion, optionCount, showPictures } from './logic'

/** Rhymes to find in one stage. */
const STAGE = 6

export default function RhymeTime({ level, seed, t, onFinish }: GameProps) {
  const locale = useLocale()
  const groups = rhymes[locale] ?? rhymes.en
  const rng = useRef(makeRng(seed)).current
  const deal = useRef(makeDealer(rng, groups)).current
  const next = () => makeQuestion(rng, groups, deal(), optionCount(level))
  const [q, setQ] = useState(next)
  const [qIndex, setQIndex] = useState(0)
  const [message, setMessage] = useState(() => t('ask'))
  const [wrong, setWrong] = useState<Word[]>([])
  const [solved, setSolved] = useState(false)
  const stage = useStage(STAGE, onFinish)
  const over = stage.over
  const [ref, shake] = useShake<HTMLDivElement>()
  const later = useTimeouts()
  const pictures = showPictures(level)

  const pick = (o: Word) => {
    if (over || solved || wrong.includes(o)) return
    if (o !== q.answer) {
      setWrong((w) => [...w, o])
      setMessage(t('no'))
      stage.slip()
      shake()
      return
    }
    setSolved(true)
    setMessage(t('yes', { a: q.target.word, b: q.answer.word }))
    if (stage.good(wrong.length ? 5 : 15)) return
    later(() => {
      setQ(next())
      setQIndex((i) => i + 1)
      setWrong([])
      setSolved(false)
      setMessage(t('ask'))
    }, 1200)
  }

  return (
    <SceneShell place="village" say={message} stage={stage} className="rhyme-time">
      <div className="rt-target" key={qIndex}>
        <span className="rt-emoji">{q.target.emoji}</span>
        <span className="rt-word">{q.target.word}</span>
      </div>
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
    </SceneShell>
  )
}
