import { useEffect, useRef, useState } from 'react'
import { useLocale } from '../../i18n'
import { useTimeouts } from '../../kit/hooks'
import { makeRng } from '../../kit/random'
import { Cast, useMood } from '../../kit/cast'
import { PaintedScene, type PaintedView } from '../../kit/painted'
import { useStage } from '../../kit/SceneShell'
import { sound } from '../../kit/sound'
import type { GameProps } from '../../kit/types'
import { flag, names, type Group } from './content'
import { dealBoard, isPair, nextGroup, peekMs, type Card } from './logic'
import bgTall from './art/bg-tall.webp'
import bg from './art/bg.webp'
import charBlink from './art/char-blink.webp'
import charHappy from './art/char-happy.webp'
import charSad from './art/char-sad.webp'
import char from './art/char.webp'

const FACES = { idle: char, blink: charBlink, happy: charHappy, sad: charSad }
/** The character's width / height. */
const ASPECT = 0.65

type ViewId = 'wide' | 'tall'

/** The festival meadow; the cards lie on the picnic blanket. */
const VIEWS: PaintedView<ViewId>[] = [
  { id: 'wide', painting: bg, world: { w: 1280, h: 800 }, focus: { x: 100, y: 60, w: 1180, h: 740 }, play: { x: 330, y: 250, w: 620, h: 540 }, ground: '#a19d39', sayAt: { x: 1030, y: 240 } },
  { id: 'tall', painting: bgTall, world: { w: 720, h: 1152 }, focus: { x: 0, y: 180, w: 720, h: 960 }, ground: '#9d9f2b', sayAt: { x: 360, y: 300 } },
]

/** Where the play sits in each painting (its content zoomed to suit the painting's scale), and the character. */
const SPOTS: Record<ViewId, { box: { x: number; y: number; w: number; h: number }; zoom: number; char: { x: number; bottom: number; h: number } }> = {
  wide: { box: { x: 330, y: 250, w: 620, h: 540 }, zoom: 1, char: { x: 1150, bottom: 790, h: 280 } },
  tall: { box: { x: 30, y: 360, w: 600, h: 760 }, zoom: 1.3, char: { x: 620, bottom: 1140, h: 200 } },
}

export default function FlagFriends({ level, seed, t, onFinish }: GameProps) {
  const locale = useLocale()
  const countryNames = names[locale] ?? names.en
  const rng = useRef(makeRng(seed)).current
  const played = useRef<Group[]>([])
  const newBoard = () => {
    const g = nextGroup(rng, level, played.current)
    played.current.push(g)
    return { group: g, cards: dealBoard(rng, level, g) }
  }
  // One stage is one board: every pair found is a star.
  const [board, setBoard] = useState(newBoard)
  const boardNo = 0
  const [open, setOpen] = useState<number[]>([])
  const [peeking, setPeeking] = useState(peekMs(level) > 0)
  const [missed, setMissed] = useState<number[]>([])
  const [message, setMessage] = useState('')
  const stage = useStage(board.cards.length / 2, onFinish)
  const [mood, feel] = useMood()
  const later = useTimeouts()
  const cards = board.cards

  // Every board starts with a short look at all the cards (fewer seconds at higher levels).
  useEffect(() => {
    const ms = peekMs(level)
    if (!ms) return
    setPeeking(true)
    later(() => setPeeking(false), ms)
  }, [boardNo, level, later])

  const flip = (i: number) => {
    if (stage.over || peeking || open.length === 2 || open.includes(i) || cards[i].matched) return
    sound.pop()
    const now = [...open, i]
    setOpen(now)
    if (now.length < 2) return
    const [a, b] = now
    if (isPair(cards[a], cards[b])) {
      setBoard({ ...board, cards: cards.map((c, k) => (k === a || k === b ? { ...c, matched: true } : c)) })
      setOpen([])
      setMessage(t('yes', { name: countryNames[cards[a].iso] }))
feel('happy')
          stage.good()
      return
    }
    setMissed([a, b])
    // After a look at every card a wrong pair is a slip of memory; without one it is just looking around.
    feel('sad')
      if (peekMs(level) > 0) stage.slip()
    else sound.tone(220, 0.1, 'triangle', 0.1)
    later(() => {
      setOpen([])
      setMissed([])
    }, 850)
  }

  const cols = cards.length <= 6 ? 3 : 4
  return (
    <PaintedScene views={VIEWS} say={peeking ? t('peek') : message || t('find')} stage={stage} className="flag-friends">
      {(view) => {
        const at = SPOTS[view]
        return (
          <>
            <Cast faces={FACES} mood={mood} at={at.char} aspect={ASPECT} />
            {/* `zoom` scales the box's own position too, so it is given in zoomed units. */}
            <div className="pb-box" style={{ left: at.box.x / at.zoom, top: at.box.y / at.zoom, width: at.box.w / at.zoom, height: at.box.h / at.zoom, zoom: at.zoom }}>
      <span className="ff-group">{t(`group.${board.group}`)}</span>
      <div className="ff-grid" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
        {cards.map((c: Card, i) => {
          const up = peeking || c.matched || open.includes(i)
          return (
            <button
              key={`${boardNo}-${c.id}`}
              className={`ff-card${up ? ' ff-up' : ''}${c.matched ? ' ff-matched' : ''}${missed.includes(i) ? ' ff-miss' : ''}`}
              onPointerDown={() => flip(i)}
              aria-label={up ? (c.kind === 'flag' ? `flag ${c.iso}` : countryNames[c.iso]) : `card ${i + 1}`}
            >
              <span className="ff-inner">
                <span className={`ff-front ff-${c.kind}`}>{c.kind === 'flag' ? flag(c.iso) : countryNames[c.iso]}</span>
                <span className="ff-back">?</span>
              </span>
            </button>
          )
        })}
      </div>
            </div>
          </>
        )
      }}
    </PaintedScene>
  )
}
