import { useEffect, useMemo, useRef, useState } from 'react'
import { useLocale } from '../../i18n'
import { usePops, useTimeouts } from '../../kit/hooks'
import { clamp, makeRng } from '../../kit/random'
import { sound } from '../../kit/sound'
import type { GameProps } from '../../kit/types'
import { Hud, Pops } from '../../kit/ui'
import { stories, storiesForLevel } from './content'

const STORIES_PER_ROUND = 4

export default function FlashRead({ level, seed, t, onFinish }: GameProps) {
  const locale = useLocale()
  const rng = useRef(makeRng(seed)).current
  const picked = useMemo(() => rng.shuffle(storiesForLevel(stories[locale] ?? stories.en, level)).slice(0, STORIES_PER_ROUND), [rng, locale, level])
  const [index, setIndex] = useState(0)
  const [wpm, setWpm] = useState(() => clamp(50 + level * 20, 70, 300))
  const [phase, setPhase] = useState<'reading' | 'question' | 'feedback'>('reading')
  const [word, setWord] = useState(0)
  const [score, setScore] = useState(0)
  const [correct, setCorrect] = useState(0)
  const [feedback, setFeedback] = useState('')
  const [pops, addPop] = usePops()
  const later = useTimeouts()

  const story = picked[index]
  const words = useMemo(() => story.text.split(' '), [story])
  const options = useMemo(() => rng.shuffle(story.options), [rng, story])

  useEffect(() => {
    if (phase !== 'reading') return
    if (word >= words.length) {
      later(() => setPhase('question'), 400)
      return
    }
    // Pause a little longer at the end of a sentence.
    const extra = /[.!?,]$/.test(words[word]) ? 1.6 : 1
    later(() => setWord((w) => w + 1), (60000 / wpm) * extra)
  }, [phase, word, words, wpm, later])

  const answer = (o: string) => {
    if (phase !== 'question') return
    const right = o === story.options[0]
    let nextCorrect = correct
    let nextScore = score
    if (right) {
      nextCorrect++
      nextScore += wpm
      sound.good(nextCorrect * 2)
      addPop(`+${wpm}`, 50, 30)
      setFeedback(t('correct'))
      setWpm((w) => w + 20)
    } else {
      sound.bad()
      setFeedback(t('notQuite', { answer: story.options[0] }))
      setWpm((w) => Math.max(60, w - 15))
    }
    setCorrect(nextCorrect)
    setScore(nextScore)
    setPhase('feedback')
    later(
      () => {
        if (index + 1 >= picked.length) {
          onFinish({ score: nextScore, accuracy: nextCorrect / picked.length })
          return
        }
        setIndex(index + 1)
        setWord(0)
        setPhase('reading')
      },
      right ? 900 : 1800,
    )
  }

  return (
    <div className="game flash-read">
      <Hud
        items={[
          { label: t('score'), value: score },
          { label: t('story'), value: `${index + 1} / ${picked.length}` },
          { label: t('speed'), value: t('wpm', { wpm }), highlight: true },
        ]}
      />
      {phase === 'reading' && (
        <div className="fr-stage">
          <div className="fr-word" key={word}>
            {words[Math.min(word, words.length - 1)]}
          </div>
          <div className="fr-progress">
            <div style={{ width: `${(word / words.length) * 100}%` }} />
          </div>
        </div>
      )}
      {phase !== 'reading' && (
        <div className="fr-question">
          <h2>{story.question}</h2>
          {phase === 'feedback' ? (
            <p className="fr-feedback">{feedback}</p>
          ) : (
            <div className="choices choices-stacked">
              {options.map((o) => (
                <button key={o} className="choice-btn" onClick={() => answer(o)}>
                  {o}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
      <Pops pops={pops} />
    </div>
  )
}
