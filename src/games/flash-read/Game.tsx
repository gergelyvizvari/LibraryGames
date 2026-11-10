import { useEffect, useMemo, useRef, useState } from 'react'
import { useLocale } from '../../i18n'
import { useTimeouts } from '../../kit/hooks'
import { clamp, makeRng } from '../../kit/random'
import { SceneShell, useStage } from '../../kit/SceneShell'
import type { GameProps } from '../../kit/types'
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
  const stage = useStage(picked.length, onFinish)
  const [feedback, setFeedback] = useState('')
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
    let last: boolean
    if (right) {
      setFeedback(t('correct'))
      setWpm((w) => w + 20)
      last = stage.good(wpm)
    } else {
      setFeedback(t('notQuite', { answer: story.options[0] }))
      setWpm((w) => Math.max(60, w - 15))
      last = stage.miss()
    }
    setPhase('feedback')
    if (last) return
    later(
      () => {
        setIndex(index + 1)
        setWord(0)
        setPhase('reading')
      },
      right ? 900 : 1800,
    )
  }

  return (
    <SceneShell place="sea" say={phase === 'reading' ? t('read') : phase === 'question' ? t('ask') : feedback} stage={stage} className="flash-read">
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
          {phase === 'question' && (
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
    </SceneShell>
  )
}
