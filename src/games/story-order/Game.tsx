import { useEffect, useRef, useState } from 'react'
import { useLocale } from '../../i18n'
import { useLatest, useTimeouts } from '../../kit/hooks'
import { makeRng } from '../../kit/random'
import { PaintedScene, worldStyle, type PaintedView } from '../../kit/painted'
import { useStage } from '../../kit/SceneShell'
import { sound } from '../../kit/sound'
import type { GameProps } from '../../kit/types'
import owlBlink from './art/owl-blink.webp'
import owlHappy from './art/owl-happy.webp'
import owlSad from './art/owl-sad.webp'
import owl from './art/owl.webp'
import nookTall from './art/nook-tall.webp'
import nook from './art/nook.webp'
import { stories } from './content'
import { askKey, makeDealer, shuffleCards, showPictures, STAGE, type Card } from './logic'

type Face = 'idle' | 'blink' | 'happy' | 'sad'
const OWL: [Face, string][] = [
  ['idle', owl],
  ['blink', owlBlink],
  ['happy', owlHappy],
  ['sad', owlSad],
]

/** The owl blinks now and then while it waits. */
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

/** The seaside reading nook; the story's pages lie on the big desk. */
const VIEWS: PaintedView<ViewId>[] = [
  { id: 'wide', painting: nook, world: { w: 1280, h: 800 }, focus: { x: 140, y: 40, w: 1140, h: 760 }, ground: '#973d19', sayAt: { x: 1000, y: 230 } },
  { id: 'tall', painting: nookTall, world: { w: 720, h: 1152 }, focus: { x: 0, y: 160, w: 720, h: 980 }, ground: '#983e10', sayAt: { x: 300, y: 260 } },
]

/** The part of the desk the pages lie on, and the owl. */
const SPOTS: Record<ViewId, { desk: { x: number; y: number; w: number; h: number }; owl: { x: number; bottom: number; h: number } }> = {
  wide: { desk: { x: 240, y: 230, w: 640, h: 540 }, owl: { x: 1110, bottom: 780, h: 300 } },
  tall: { desk: { x: 40, y: 480, w: 640, h: 620 }, owl: { x: 600, bottom: 450, h: 200 } },
}

interface Round {
  id: number
  cards: Card[]
  /** How many pages are already in place; the next right page is the one with this step. */
  placed: number
}

export default function StoryOrder({ level, seed, t, onFinish }: GameProps) {
  const locale = useLocale()
  const rng = useRef(makeRng(seed)).current
  const deal = useRef(makeDealer(rng, stories[locale] ?? stories.en, level)).current
  const nextId = useRef(0)
  const newRound = (): Round => ({ id: nextId.current++, cards: shuffleCards(rng, deal()), placed: 0 })
  const [round, setRound] = useState<Round>(newRound)
  const [wrong, setWrong] = useState<number | null>(null)
  const stage = useStage(STAGE, onFinish)
  const later = useTimeouts()
  const blink = useBlink()
  const pictures = showPictures(level)
  const total = round.cards.length
  const done = round.placed === total

  const tap = (card: Card) => {
    if (stage.over || done || card.step < round.placed) return
    if (card.step !== round.placed) {
      stage.slip()
      setWrong(card.step)
      return
    }
    const placed = round.placed + 1
    setRound({ ...round, placed })
    setWrong(null)
    if (placed < total) {
      sound.tone(480 + placed * 60, 0.08, 'triangle', 0.18)
      return
    }
    if (stage.good(total * 10)) return
    later(() => setRound(newRound()), 1700)
  }

  // Number keys 1 to 4 tap a page, for anyone on a computer.
  const tapRef = useLatest(tap)
  const roundRef = useLatest(round)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const c = roundRef.current.cards[Number(e.key) - 1]
      if (c) tapRef.current(c)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [tapRef, roundRef])

  // Once the story is complete, the pages hop into story order (same keys, so they move instead of popping in again).
  const shown = done ? [...round.cards].sort((a, b) => a.step - b.step) : round.cards
  const say = done ? t('theEnd') : wrong !== null ? t('notYet') : t(askKey(round.placed, total))
  const face: Face = done ? 'happy' : wrong !== null ? 'sad' : blink ? 'blink' : 'idle'
  return (
    <PaintedScene views={VIEWS} say={say} stage={stage} className="story-order">
      {(view) => {
        const at = SPOTS[view]
        return (
          <>
            <div className={`so-char${done ? ' so-cheer' : ''}`} style={worldStyle(at.owl.x, at.owl.bottom, at.owl.h)}>
              {OWL.map(([f, src]) => (
                <img key={f} src={src} alt="" draggable={false} className={f === face ? '' : 'so-off'} />
              ))}
            </div>
      <div className={`so-desk so-desk-${total}${done ? ' so-done' : ''}`} key={round.id} style={{ left: at.desk.x, top: at.desk.y, width: at.desk.w, height: at.desk.h }}>
        {shown.map((c, i) => {
          const isPlaced = c.step < round.placed
          const shake = wrong === c.step
          return (
            <button
              key={c.step}
              className={`so-page${isPlaced ? ' so-placed' : ''}${shake ? ' so-wrong' : ''}`}
              style={{ animationDelay: `${i * (done ? 110 : 60)}ms` }}
              onPointerDown={() => tap(c)}
              onAnimationEnd={() => shake && setWrong(null)}
              disabled={stage.over}
            >
              <span className="so-number">{isPlaced ? c.step + 1 : ''}</span>
              {pictures && <span className="so-emoji">{c.emoji}</span>}
              <span className="so-text">{c.text}</span>
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
