import { useRef, useState } from 'react'
import { useLocale } from '../../i18n'
import { usePops, useShake, useTimeouts } from '../../kit/hooks'
import { makeRng } from '../../kit/random'
import { sound, vibrate } from '../../kit/sound'
import type { GameProps } from '../../kit/types'
import { Hud, Pops } from '../../kit/ui'
import { countries, flag } from './content'
import { makeQuestions } from './logic'

export default function CapitalMatch({ level, seed, t, onFinish }: GameProps) {
  const locale = useLocale()
  const rng = useRef(makeRng(seed)).current
  const questions = useRef(makeQuestions(rng, countries[locale] ?? countries.en, level)).current
  const [index, setIndex] = useState(0)
  const [picked, setPicked] = useState<string | null>(null)
  const [score, setScore] = useState(0)
  const [combo, setCombo] = useState(0)
  const [right, setRight] = useState(0)
  const askedAt = useRef(performance.now())
  const [pops, addPop] = usePops()
  const [ref, shake] = useShake<HTMLDivElement>()
  const later = useTimeouts()
  const q = questions[index]

  const choose = (o: string) => {
    if (picked) return
    setPicked(o)
    const ok = o === q.country.capital
    let s = score
    let r = right
    if (ok) {
      const nc = combo + 1
      const seconds = (performance.now() - askedAt.current) / 1000
      const gained = 10 + Math.max(0, Math.round((6 - seconds) * 2)) + Math.min(nc, 5) * 2
      s += gained
      r++
      setCombo(nc)
      sound.good(nc)
      addPop(`+${gained}`, 50, 30)
    } else {
      setCombo(0)
      sound.bad()
      vibrate(50)
      shake()
    }
    setScore(s)
    setRight(r)
    later(
      () => {
        if (index + 1 >= questions.length) {
          onFinish({ score: s, accuracy: r / questions.length })
          return
        }
        setIndex(index + 1)
        setPicked(null)
        askedAt.current = performance.now()
      },
      ok ? 800 : 1500,
    )
  }

  return (
    <div className="game capital-match">
      <Hud
        items={[
          { label: t('score'), value: score },
          { label: t('question_n'), value: `${index + 1} / ${questions.length}` },
          { label: t('combo'), value: `×${combo}`, highlight: combo >= 3 },
        ]}
      />
      <div className="cm-card" key={index} ref={ref}>
        <span className="cm-flag">{flag(q.country.iso)}</span>
        <h2>{t('question', { country: q.country.name })}</h2>
        <p className="cm-feedback">
          {picked ? (picked === q.country.capital ? t('correct', { capital: q.country.capital }) : t('itIs', { capital: q.country.capital })) : ' '}
        </p>
      </div>
      <div className="choices choices-stacked">
        {q.options.map((o) => (
          <button
            key={`${index}-${o}`}
            className={`choice-btn${picked && o === q.country.capital ? ' cm-right' : ''}${picked === o && o !== q.country.capital ? ' cm-wrong' : ''}`}
            onClick={() => choose(o)}
          >
            {o}
          </button>
        ))}
      </div>
      <Pops pops={pops} />
    </div>
  )
}
