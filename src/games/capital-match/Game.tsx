import { useRef, useState } from 'react'
import { useLocale } from '../../i18n'
import { useShake, useTimeouts } from '../../kit/hooks'
import { makeRng } from '../../kit/random'
import { Cast, useMood } from '../../kit/cast'
import { PaintedScene, type PaintedView } from '../../kit/painted'
import { sound, vibrate } from '../../kit/sound'
import type { GameProps } from '../../kit/types'
import { countries, flag } from './content'
import { makeQuestions } from './logic'
import bgTall from './art/bg-tall.webp'
import bg from './art/bg.webp'
import charBlink from './art/char-blink.webp'
import charHappy from './art/char-happy.webp'
import charSad from './art/char-sad.webp'
import char from './art/char.webp'

const FACES = { idle: char, blink: charBlink, happy: charHappy, sad: charSad }
/** The character's width / height. */
const ASPECT = 0.5

type ViewId = 'wide' | 'tall'

/** The little railway station; the country card hangs on its noticeboard, the capitals below. */
const VIEWS: PaintedView<ViewId>[] = [
  { id: 'wide', painting: bg, world: { w: 1280, h: 800 }, focus: { x: 100, y: 40, w: 1180, h: 760 }, play: { x: 440, y: 220, w: 460, h: 560 }, ground: '#a6a03c', sayAt: { x: 1050, y: 200 } },
  { id: 'tall', painting: bgTall, world: { w: 720, h: 1152 }, focus: { x: 0, y: 180, w: 720, h: 960 }, ground: '#865138', sayAt: { x: 360, y: 300 } },
]

/** Where the play sits in each painting (its content zoomed to suit the painting's scale), and the character. */
const SPOTS: Record<ViewId, { box: { x: number; y: number; w: number; h: number }; zoom: number; char: { x: number; bottom: number; h: number } }> = {
  wide: { box: { x: 440, y: 220, w: 460, h: 560 }, zoom: 1.1, char: { x: 1140, bottom: 790, h: 300 } },
  tall: { box: { x: 70, y: 390, w: 580, h: 720 }, zoom: 1.5, char: { x: 615, bottom: 1145, h: 250 } },
}

export default function CapitalMatch({ level, seed, t, onFinish }: GameProps) {
  const locale = useLocale()
  const rng = useRef(makeRng(seed)).current
  const questions = useRef(makeQuestions(rng, countries[locale] ?? countries.en, level).slice(0, 6)).current
  const [index, setIndex] = useState(0)
  const [picked, setPicked] = useState<string | null>(null)
  const [score, setScore] = useState(0)
  const [combo, setCombo] = useState(0)
  const [right, setRight] = useState(0)
  const askedAt = useRef(performance.now())
  const [ref, shake] = useShake<HTMLDivElement>()
  const [mood, feel] = useMood()
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
feel('happy')
          sound.good(nc)
    } else {
      setCombo(0)
feel('sad')
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
    <PaintedScene views={VIEWS} say={picked ? (picked === q.country.capital ? t('correct', { capital: q.country.capital }) : t('itIs', { capital: q.country.capital })) : t('question', { country: q.country.name })} stage={{ done: index + (picked ? 1 : 0), total: questions.length, over: false }} className="capital-match">
      {(view) => {
        const at = SPOTS[view]
        return (
          <>
            <Cast faces={FACES} mood={mood} at={at.char} aspect={ASPECT} />
            {/* `zoom` scales the box's own position too, so it is given in zoomed units. */}
            <div className="pb-box" style={{ left: at.box.x / at.zoom, top: at.box.y / at.zoom, width: at.box.w / at.zoom, height: at.box.h / at.zoom, zoom: at.zoom }}>
      <div className="cm-card" key={index} ref={ref}>
        <span className="cm-flag">{flag(q.country.iso)}</span>
        <span className="cm-country">{q.country.name}</span>
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
            </div>
          </>
        )
      }}
    </PaintedScene>
  )
}
