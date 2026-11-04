import { useEffect, useRef, useState } from 'react'
import { useLocale } from '../../i18n'
import { useCountdown, usePops, useTimeouts } from '../../kit/hooks'
import { makeRng } from '../../kit/random'
import { sound, vibrate } from '../../kit/sound'
import type { GameProps } from '../../kit/types'
import { Hud, Pops, TimerBar } from '../../kit/ui'
import { flag, names, type Group } from './content'
import { accuracyFor, boardBonus, dealBoard, DURATION, isPair, nextGroup, pairPoints, peekMs, type Card } from './logic'

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
  const [board, setBoard] = useState(newBoard)
  const [boardNo, setBoardNo] = useState(0)
  const [open, setOpen] = useState<number[]>([])
  const [peeking, setPeeking] = useState(peekMs(level) > 0)
  const [missed, setMissed] = useState<number[]>([])
  const [message, setMessage] = useState('')
  const [score, setScore] = useState(0)
  const [combo, setCombo] = useState(0)
  const [over, setOver] = useState(false)
  const stats = useRef({ pairs: 0, tries: 0 })
  const [pops, addPop] = usePops()
  const later = useTimeouts()
  const cards = board.cards

  // Every board starts with a short look at all the cards (fewer seconds at higher levels).
  useEffect(() => {
    const ms = peekMs(level)
    if (!ms) return
    setPeeking(true)
    later(() => setPeeking(false), ms)
  }, [boardNo, level, later])

  const left = useCountdown(
    DURATION,
    () => {
      setOver(true)
      onFinish({ score: scoreRef.current, accuracy: accuracyFor(stats.current.pairs, stats.current.tries) })
    },
    !over,
  )
  const scoreRef = useRef(0)
  scoreRef.current = score

  const flip = (i: number) => {
    if (over || peeking || open.length === 2 || open.includes(i) || cards[i].matched) return
    sound.pop()
    const now = [...open, i]
    setOpen(now)
    if (now.length < 2) return
    stats.current.tries++
    const [a, b] = now
    if (isPair(cards[a], cards[b])) {
      const nc = combo + 1
      const gained = pairPoints(nc)
      const next = cards.map((c, k) => (k === a || k === b ? { ...c, matched: true } : c))
      stats.current.pairs++
      setBoard({ ...board, cards: next })
      setOpen([])
      setCombo(nc)
      setScore((s) => s + gained)
      setMessage(t('yes', { name: countryNames[cards[a].iso] }))
      sound.good(nc)
      addPop(`+${gained}`, 50, 40)
      if (next.every((c) => c.matched)) {
        const bonus = boardBonus(next.length / 2)
        setScore((s) => s + bonus)
        sound.win()
        addPop(`${t('cleared')} +${bonus}`, 50, 30, 'info')
        later(() => {
          setBoard(newBoard())
          setBoardNo((n) => n + 1)
          setMessage('')
        }, 1000)
      }
      return
    }
    setCombo(0)
    setMissed([a, b])
    sound.bad()
    vibrate(30)
    later(() => {
      setOpen([])
      setMissed([])
    }, 850)
  }

  const cols = cards.length <= 6 ? 3 : 4
  return (
    <div className="game flag-friends">
      <TimerBar left={left} total={DURATION} />
      <Hud
        items={[
          { label: t('score'), value: score },
          { label: t('combo'), value: `×${combo}`, highlight: combo >= 3 },
          { label: t('time'), value: Math.ceil(left) },
        ]}
      />
      <div className="ff-head" key={boardNo}>
        <span className="ff-group">{t(`group.${board.group}`)}</span>
        <span className={`ff-msg${message ? ' ff-yes' : ''}`}>{peeking ? t('peek') : message || t('find')}</span>
      </div>
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
      <Pops pops={pops} />
    </div>
  )
}
