import { useEffect, useRef, useState } from 'react'
import { useLocale } from '../../i18n'
import { useTimeouts } from '../../kit/hooks'
import { makeRng } from '../../kit/random'
import { SceneShell, useStage } from '../../kit/SceneShell'
import { sound } from '../../kit/sound'
import type { GameProps } from '../../kit/types'
import { flag, names, type Group } from './content'
import { dealBoard, isPair, nextGroup, peekMs, type Card } from './logic'

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
      stage.good()
      return
    }
    setMissed([a, b])
    // After a look at every card a wrong pair is a slip of memory; without one it is just looking around.
    if (peekMs(level) > 0) stage.slip()
    else sound.tone(220, 0.1, 'triangle', 0.1)
    later(() => {
      setOpen([])
      setMissed([])
    }, 850)
  }

  const cols = cards.length <= 6 ? 3 : 4
  return (
    <SceneShell place="lake" say={peeking ? t('peek') : message || t('find')} stage={stage} className="flag-friends">
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
    </SceneShell>
  )
}
