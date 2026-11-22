import { useRef, useState } from 'react'
import { useLocale } from '../../i18n'
import { useTimeouts } from '../../kit/hooks'
import { makeRng } from '../../kit/random'
import { Cast, useMood } from '../../kit/cast'
import { PaintedScene, type PaintedView } from '../../kit/painted'
import { useStage } from '../../kit/SceneShell'
import { sound } from '../../kit/sound'
import type { GameProps } from '../../kit/types'
import { pairs } from './content'
import { dealBoard, isMatch, makeDealer, showPictures, type Card } from './logic'
import bgTall from './art/bg-tall.webp'
import bg from './art/bg.webp'
import charBlink from './art/char-blink.webp'
import charHappy from './art/char-happy.webp'
import charSad from './art/char-sad.webp'
import char from './art/char.webp'

const FACES = { idle: char, blink: charBlink, happy: charHappy, sad: charSad }
/** The character's width / height. */
const ASPECT = 0.66

type ViewId = 'wide' | 'tall'

/** The village schoolroom; the word cards are pinned to the cork board. */
const VIEWS: PaintedView<ViewId>[] = [
  { id: 'wide', painting: bg, world: { w: 1280, h: 800 }, focus: { x: 200, y: 40, w: 1080, h: 760 }, ground: '#e0893f', sayAt: { x: 640, y: 650 } },
  { id: 'tall', painting: bgTall, world: { w: 720, h: 1152 }, focus: { x: 0, y: 180, w: 720, h: 960 }, ground: '#d1792e', sayAt: { x: 260, y: 1000 } },
]

/** Where the play sits in each painting (its content zoomed to suit the painting's scale), and the character. */
const SPOTS: Record<ViewId, { box: { x: number; y: number; w: number; h: number }; zoom: number; char: { x: number; bottom: number; h: number } }> = {
  wide: { box: { x: 390, y: 95, w: 620, h: 390 }, zoom: 1.2, char: { x: 1180, bottom: 790, h: 300 } },
  tall: { box: { x: 50, y: 305, w: 620, h: 450 }, zoom: 1.6, char: { x: 610, bottom: 1140, h: 230 } },
}

const keyOf = (c: Card) => `${c.side}-${c.pair}`

export default function Opposites({ level, seed, t, onFinish }: GameProps) {
  const locale = useLocale()
  const list = pairs[locale] ?? pairs.en
  const rng = useRef(makeRng(seed)).current
  const deal = useRef(makeDealer(rng, list, level)).current
  // One stage is one board: every pair of opposites is a star.
  const [board] = useState(() => dealBoard(rng, deal()))
  const [selected, setSelected] = useState<Card | null>(null)
  const [matched, setMatched] = useState<number[]>([])
  const [missed, setMissed] = useState<string[]>([])
  const [message, setMessage] = useState<{ text: string; kind: '' | 'yes' | 'no' }>(() => ({ text: t('pick'), kind: '' }))
  const stage = useStage(board.pairs.length, onFinish)
  const [mood, feel] = useMood()
  const over = stage.over
  const later = useTimeouts()
  const pictures = showPictures(level)

  const tap = (c: Card) => {
    if (over || matched.includes(c.pair) || matched.length === board.pairs.length) return
    if (!selected || selected.side === c.side) {
      // First pick, or a change of mind in the same column.
      const again = selected && keyOf(selected) === keyOf(c)
      setSelected(again ? null : c)
      setMissed([])
      setMessage({ text: again ? t('pick') : t('picked', { word: c.word }), kind: '' })
      sound.tap()
      return
    }
    if (!isMatch(selected, c)) {
      setMissed([keyOf(selected), keyOf(c)])
      setSelected(null)
      setMessage({ text: t('no'), kind: 'no' })
      feel('sad')
      stage.slip()
      later(() => setMissed([]), 500)
      return
    }
    const [a, b] = selected.side === 'left' ? [selected, c] : [c, selected]
    setMatched([...matched, c.pair])
    setSelected(null)
    setMessage({ text: t('yes', { a: a.word, b: b.word }), kind: 'yes' })
feel('happy')
        stage.good()
  }

  const cardClass = (c: Card) =>
    `op-card op-${c.side}` +
    (matched.includes(c.pair) ? ' op-matched' : '') +
    (selected && keyOf(selected) === keyOf(c) ? ' op-selected' : '') +
    (missed.includes(keyOf(c)) ? ' op-miss' : '')

  return (
    <PaintedScene views={VIEWS} say={message.text} stage={stage} className="opposites">
      {(view) => {
        const at = SPOTS[view]
        return (
          <>
            <Cast faces={FACES} mood={mood} at={at.char} aspect={ASPECT} />
            {/* `zoom` scales the box's own position too, so it is given in zoomed units. */}
            <div className="pb-box" style={{ left: at.box.x / at.zoom, top: at.box.y / at.zoom, width: at.box.w / at.zoom, height: at.box.h / at.zoom, zoom: at.zoom }}>
      <div className="op-board">
        {board.left.map((l, row) => {
          const r = board.right[row]
          return [l, r].map((c) => (
            <button key={keyOf(c)} className={cardClass(c)} onPointerDown={() => tap(c)} disabled={over}>
              {pictures && c.emoji && <span className="op-emoji">{c.emoji}</span>}
              <span className="op-word">{c.word}</span>
            </button>
          ))
        })}
      </div>
            </div>
          </>
        )
      }}
    </PaintedScene>
  )
}
