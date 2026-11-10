import { useEffect, useRef, useState } from 'react'
import { useLocale } from '../../i18n'
import { useLatest, useTimeouts } from '../../kit/hooks'
import { makeRng } from '../../kit/random'
import { SceneShell, useStage } from '../../kit/SceneShell'
import { sound } from '../../kit/sound'
import type { GameProps } from '../../kit/types'
import { stories } from './content'
import { askKey, makeDealer, shuffleCards, showPictures, STAGE, type Card } from './logic'

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
  return (
    <SceneShell place="sea" say={say} stage={stage} bare fill className="story-order">
      <div className={`so-desk so-desk-${total}${done ? ' so-done' : ''}`} key={round.id}>
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
    </SceneShell>
  )
}
