import { useRef, useState } from 'react'
import { useLocale } from '../../i18n'
import { useShake, useTimeouts } from '../../kit/hooks'
import { makeRng } from '../../kit/random'
import { Cast, useMood } from '../../kit/cast'
import { PaintedScene, type PaintedView } from '../../kit/painted'
import { useStage } from '../../kit/SceneShell'
import type { GameProps } from '../../kit/types'
import { rhymes, type Word } from './content'
import { makeDealer, makeQuestion, optionCount, showPictures } from './logic'
import bgTall from './art/bg-tall.webp'
import bg from './art/bg.webp'
import charBlink from './art/char-blink.webp'
import charHappy from './art/char-happy.webp'
import charSad from './art/char-sad.webp'
import char from './art/char.webp'

const FACES = { idle: char, blink: charBlink, happy: charHappy, sad: charSad }
/** The character's width / height. */
const ASPECT = 0.88

type ViewId = 'wide' | 'tall'

/** The village green with its bandstand; the picture and the rhyme choices stand on the lawn. */
const VIEWS: PaintedView<ViewId>[] = [
  { id: 'wide', painting: bg, world: { w: 1280, h: 800 }, focus: { x: 100, y: 60, w: 1180, h: 740 }, ground: '#9ea238', sayAt: { x: 1000, y: 180 } },
  { id: 'tall', painting: bgTall, world: { w: 720, h: 1152 }, focus: { x: 0, y: 180, w: 720, h: 960 }, ground: '#8d983d', sayAt: { x: 360, y: 260 } },
]

/** Where the play sits in each painting (its content zoomed to suit the painting's scale), and the character. */
const SPOTS: Record<ViewId, { box: { x: number; y: number; w: number; h: number }; zoom: number; char: { x: number; bottom: number; h: number } }> = {
  wide: { box: { x: 260, y: 180, w: 720, h: 600 }, zoom: 1.3, char: { x: 1140, bottom: 790, h: 240 } },
  tall: { box: { x: 30, y: 330, w: 660, h: 760 }, zoom: 1.55, char: { x: 620, bottom: 1150, h: 165 } },
}

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
  const [mood, feel] = useMood()
  const over = stage.over
  const [ref, shake] = useShake<HTMLDivElement>()
  const later = useTimeouts()
  const pictures = showPictures(level)

  const pick = (o: Word) => {
    if (over || solved || wrong.includes(o)) return
    if (o !== q.answer) {
      setWrong((w) => [...w, o])
      setMessage(t('no'))
      feel('sad')
      stage.slip()
      shake()
      return
    }
    setSolved(true)
    setMessage(t('yes', { a: q.target.word, b: q.answer.word }))
    feel('happy')
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
    <PaintedScene views={VIEWS} say={message} stage={stage} className="rhyme-time">
      {(view) => {
        const at = SPOTS[view]
        return (
          <>
            <Cast faces={FACES} mood={mood} at={at.char} aspect={ASPECT} />
            {/* `zoom` scales the box's own position too, so it is given in zoomed units. */}
            <div className="pb-box" style={{ left: at.box.x / at.zoom, top: at.box.y / at.zoom, width: at.box.w / at.zoom, height: at.box.h / at.zoom, zoom: at.zoom }}>
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
            </div>
          </>
        )
      }}
    </PaintedScene>
  )
}
