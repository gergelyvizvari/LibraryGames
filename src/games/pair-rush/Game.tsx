import { useEffect, useRef, useState } from 'react'
import { useTimeouts } from '../../kit/hooks'
import { PaintedScene, worldStyle, type PaintedView } from '../../kit/painted'
import { makeRng } from '../../kit/random'
import { useStage } from '../../kit/SceneShell'
import { sound } from '../../kit/sound'
import type { GameProps } from '../../kit/types'
import mouseBlink from './art/mouse-blink.webp'
import mouseHappy from './art/mouse-happy.webp'
import mouseSad from './art/mouse-sad.webp'
import mouse from './art/mouse.webp'
import cardback from './art/cardback.webp'
import libraryTall from './art/library-tall.webp'
import library from './art/library.webp'
import { boardSizes, columnsFor, deal, startBoard } from './logic'

type Face = 'idle' | 'blink' | 'happy' | 'sad'
const MOUSE: [Face, string][] = [
  ['idle', mouse],
  ['blink', mouseBlink],
  ['happy', mouseHappy],
  ['sad', mouseSad],
]

/** The mouse blinks now and then while it waits. */
function useBlink() {
  const [shut, setShut] = useState(false)
  useEffect(() => {
    let timer = 0
    const next = (open: boolean) => {
      timer = window.setTimeout(
        () => {
          setShut(open)
          next(!open)
        },
        open ? 2600 + Math.random() * 2600 : 150,
      )
    }
    next(true)
    return () => clearTimeout(timer)
  }, [])
  return shut
}

type ViewId = 'wide' | 'tall'

/** The woodland library; the cards lie on its big reading table. */
const VIEWS: PaintedView<ViewId>[] = [
  { id: 'wide', painting: library, world: { w: 1280, h: 800 }, focus: { x: 120, y: 20, w: 1100, h: 780 }, ground: '#b96839', sayAt: { x: 980, y: 200 } },
  { id: 'tall', painting: libraryTall, world: { w: 720, h: 1152 }, focus: { x: 0, y: 160, w: 720, h: 980 }, ground: '#9f4d22', sayAt: { x: 360, y: 250 } },
]

/** The box the cards are laid out in (on and above the table), and the mouse. */
const SPOTS: Record<ViewId, { box: { x: number; y: number; w: number; h: number }; mouse: { x: number; bottom: number; h: number } }> = {
  wide: { box: { x: 290, y: 190, w: 700, h: 580 }, mouse: { x: 1110, bottom: 780, h: 290 } },
  tall: { box: { x: 30, y: 400, w: 660, h: 700 }, mouse: { x: 600, bottom: 390, h: 200 } },
}

export default function PairRush({ level, seed, t, onFinish }: GameProps) {
  const rng = useRef(makeRng(seed)).current
  // One stage is one board: every pair found is a star.
  const [cards, setCards] = useState(() => deal(rng, boardSizes[startBoard(level)]))
  const [open, setOpen] = useState<number[]>([])
  const seen = useRef(new Set<number>())
  const stage = useStage(cards.length / 2, onFinish)
  const later = useTimeouts()
  const blink = useBlink()
  const [mood, setMood] = useState<'happy' | 'sad' | null>(null)

  const flip = (i: number) => {
    if (stage.over || open.length === 2 || open.includes(i) || cards[i].matched) return
    sound.pop()
    const now = [...open, i]
    setOpen(now)
    if (now.length < 2) return
    const [a, b] = now
    if (cards[a].face === cards[b].face) {
      setCards(cards.map((c, k) => (k === a || k === b ? { ...c, matched: true } : c)))
      setOpen([])
      setMood('happy')
      later(() => setMood(null), 700)
      stage.good()
      return
    }
    // Turning over a card whose pair was already seen is a slip of memory; a first look never is.
    const known = (k: number, other: number) => cards.some((c, j) => j !== k && j !== other && c.face === cards[k].face && seen.current.has(j))
    if (known(a, b) || (seen.current.has(b) && seen.current.has(a))) stage.slip()
    seen.current.add(a).add(b)
    later(() => setOpen([]), 900)
  }

  const cols = columnsFor(cards.length)
  const rows = Math.ceil(cards.length / cols)
  const face: Face = mood ?? (blink ? 'blink' : 'idle')
  return (
    <PaintedScene views={VIEWS} say={t('say')} stage={stage} className="pair-rush">
      {(view) => {
        const at = SPOTS[view]
        // As big as the box allows, cards 3 : 4, with a gap of a tenth of a card.
        const cw = Math.min(at.box.w / (cols + (cols - 1) * 0.1), (at.box.h / (rows + (rows - 1) * 0.1)) * 0.75, 170)
        const ch = cw / 0.75
        const w = cols * cw + (cols - 1) * cw * 0.1
        const h = rows * ch + (rows - 1) * cw * 0.1
        return (
          <>
            <div className={`pr-char${mood === 'happy' ? ' pr-cheer' : ''}`} style={worldStyle(at.mouse.x, at.mouse.bottom, at.mouse.h)}>
              {MOUSE.map(([f, src]) => (
                <img key={f} src={src} alt="" draggable={false} className={f === face ? '' : 'pr-off'} />
              ))}
            </div>
            <div
              className="pr-grid"
              style={{ left: at.box.x + (at.box.w - w) / 2, top: at.box.y + (at.box.h - h) / 2, width: w, height: h, gap: cw * 0.1, gridTemplateColumns: `repeat(${cols}, 1fr)`, fontSize: cw * 0.55 }}
            >
              {cards.map((c, i) => {
                const up = c.matched || open.includes(i)
                return (
                  <button key={c.id} className={`pr-card${up ? ' pr-up' : ''}${c.matched ? ' pr-matched' : ''}`} onClick={() => flip(i)}>
                    <span className="pr-inner">
                      <span className="pr-front">{c.face}</span>
                      <img className="pr-back" src={cardback} alt="" draggable={false} />
                    </span>
                  </button>
                )
              })}
            </div>
          </>
        )
      }}
    </PaintedScene>
  )
}
