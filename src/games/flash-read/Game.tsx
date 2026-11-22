import { useEffect, useMemo, useRef, useState } from 'react'
import { useLocale } from '../../i18n'
import { useTimeouts } from '../../kit/hooks'
import { clamp, makeRng } from '../../kit/random'
import { Cast, useMood } from '../../kit/cast'
import { PaintedScene, type PaintedView } from '../../kit/painted'
import { useStage } from '../../kit/SceneShell'
import type { GameProps } from '../../kit/types'
import { stories, storiesForLevel } from './content'
import bgTall from './art/bg-tall.webp'
import bg from './art/bg.webp'
import charBlink from './art/char-blink.webp'
import charHappy from './art/char-happy.webp'
import charSad from './art/char-sad.webp'
import char from './art/char.webp'

const FACES = { idle: char, blink: charBlink, happy: charHappy, sad: charSad }
/** The character's width / height. */
const ASPECT = 0.96

type ViewId = 'wide' | 'tall'

/** The seaside pier; the words flash on its big signboard. */
const VIEWS: PaintedView<ViewId>[] = [
  { id: 'wide', painting: bg, world: { w: 1280, h: 800 }, focus: { x: 120, y: 40, w: 1160, h: 760 }, ground: '#cd9e59', sayAt: { x: 1050, y: 330 } },
  { id: 'tall', painting: bgTall, world: { w: 720, h: 1152 }, focus: { x: 0, y: 100, w: 720, h: 1040 }, ground: '#d39c52', sayAt: { x: 360, y: 505 } },
]

/** Where the play sits in each painting (its content zoomed to suit the painting's scale), and the character. */
const SPOTS: Record<ViewId, { box: { x: number; y: number; w: number; h: number }; zoom: number; char: { x: number; bottom: number; h: number } }> = {
  wide: { box: { x: 320, y: 165, w: 640, h: 610 }, zoom: 1, char: { x: 1140, bottom: 790, h: 220 } },
  tall: { box: { x: 60, y: 150, w: 600, h: 960 }, zoom: 1.5, char: { x: 620, bottom: 1148, h: 150 } },
}

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
  const [mood, feel] = useMood()
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
      feel('happy')
    last = stage.good(wpm)
    } else {
      setFeedback(t('notQuite', { answer: story.options[0] }))
      setWpm((w) => Math.max(60, w - 15))
      feel('sad')
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
    <PaintedScene views={VIEWS} say={phase === 'reading' ? t('read') : phase === 'question' ? t('ask') : feedback} stage={stage} className="flash-read">
      {(view) => {
        const at = SPOTS[view]
        return (
          <>
            <Cast faces={FACES} mood={mood} at={at.char} aspect={ASPECT} />
            {/* `zoom` scales the box's own position too, so it is given in zoomed units. */}
            <div className="pb-box" style={{ left: at.box.x / at.zoom, top: at.box.y / at.zoom, width: at.box.w / at.zoom, height: at.box.h / at.zoom, zoom: at.zoom }}>
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
            </div>
          </>
        )
      }}
    </PaintedScene>
  )
}
