import { useEffect, useRef, useState } from 'react'
import { useLocale } from '../../i18n'
import { useCountdown, useLatest, usePops, useTimeouts } from '../../kit/hooks'
import { makeRng } from '../../kit/random'
import { sound, vibrate } from '../../kit/sound'
import type { GameProps } from '../../kit/types'
import { Hud, Pops, TimerBar } from '../../kit/ui'
import { stories } from './content'
import { accuracyFor, askKey, DURATION, makeDealer, PERFECT_BONUS, shuffleCards, showPictures, stepPoints, type Card } from './logic'

interface Round {
  id: number
  cards: Card[]
  /** How many cards are already in place; the next right card is the one with this step. */
  placed: number
  mistakes: number
}

export default function StoryOrder({ level, seed, t, onFinish }: GameProps) {
  const locale = useLocale()
  const rng = useRef(makeRng(seed)).current
  const deal = useRef(makeDealer(rng, stories[locale] ?? stories.en, level)).current
  const nextId = useRef(0)
  const newRound = (): Round => ({ id: nextId.current++, cards: shuffleCards(rng, deal()), placed: 0, mistakes: 0 })
  const [round, setRound] = useState<Round>(newRound)
  const [score, setScore] = useState(0)
  const [combo, setCombo] = useState(0)
  const [message, setMessage] = useState<{ text: string; kind: '' | 'yes' | 'no' }>({ text: '', kind: '' })
  const [shaking, setShaking] = useState<number | null>(null)
  const [over, setOver] = useState(false)
  const stats = useRef({ right: 0, wrong: 0, stories: 0 })
  const scoreRef = useLatest(score)
  const [pops, addPop] = usePops()
  const later = useTimeouts()
  const pictures = showPictures(level)
  const total = round.cards.length
  const done = round.placed === total

  const left = useCountdown(
    DURATION,
    () => {
      setOver(true)
      const s = stats.current
      onFinish({ score: scoreRef.current, accuracy: accuracyFor(s.right, s.wrong, s.stories) })
    },
    !over,
  )

  const tap = (card: Card, index: number) => {
    if (over || done || card.step < round.placed) return
    if (card.step !== round.placed) {
      stats.current.wrong++
      setCombo(0)
      setRound({ ...round, mistakes: round.mistakes + 1 })
      setShaking(card.step)
      setMessage({ text: t('notYet'), kind: 'no' })
      sound.bad()
      vibrate(40)
      return
    }
    const nc = combo + 1
    let gained = stepPoints(nc)
    const placed = round.placed + 1
    const finished = placed === total
    const perfect = finished && round.mistakes === 0
    if (perfect) gained += PERFECT_BONUS
    stats.current.right++
    setCombo(nc)
    setScore((s) => s + gained)
    setRound({ ...round, placed })
    setShaking(null)
    const y = 32 + ((index + 0.5) / total) * 56
    addPop(`+${gained}`, 80, y)
    if (!finished) {
      setMessage({ text: '', kind: '' })
      sound.good(nc)
      return
    }
    stats.current.stories++
    setMessage({ text: perfect ? `${t('theEnd')} ${t('perfect')}` : t('theEnd'), kind: 'yes' })
    sound.win()
    later(() => {
      setMessage({ text: '', kind: '' })
      setRound(newRound())
    }, 1700)
  }

  // Number keys 1 to 4 tap a card, for anyone on a computer.
  const tapRef = useLatest(tap)
  const roundRef = useLatest(round)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const i = Number(e.key) - 1
      const c = roundRef.current.cards[i]
      if (c) tapRef.current(c, i)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [tapRef, roundRef])

  // Once the story is complete, the cards hop into story order (same keys, so they move instead of popping in again).
  const shown = done ? [...round.cards].sort((a, b) => a.step - b.step) : round.cards
  const ask = message.text || t(askKey(round.placed, total))
  return (
    <div className="game story-order">
      <TimerBar left={left} total={DURATION} />
      <Hud
        items={[
          { label: t('score'), value: score },
          { label: t('combo'), value: `×${combo}`, highlight: combo >= 5 },
          { label: t('time'), value: Math.ceil(left) },
        ]}
      />
      <p className={`prompt so-msg${message.kind ? ` so-${message.kind}` : ''}`}>{ask}</p>
      <div className={`so-cards so-cards-${total}${done ? ' so-done' : ''}`} key={round.id}>
        {shown.map((c, i) => {
          const isPlaced = c.step < round.placed
          const shake = shaking === c.step
          return (
            <button
              key={c.step}
              className={`so-card${isPlaced ? ' so-placed' : ''}${shake ? ' so-wrong' : ''}`}
              style={{ animationDelay: `${i * (done ? 110 : 60)}ms` }}
              onPointerDown={() => tap(c, i)}
              onAnimationEnd={() => shake && setShaking(null)}
              disabled={over}
            >
              <span className="so-badge">{isPlaced ? c.step + 1 : ''}</span>
              {pictures && <span className="so-emoji">{c.emoji}</span>}
              <span className="so-text">{c.text}</span>
            </button>
          )
        })}
      </div>
      <Pops pops={pops} />
    </div>
  )
}
