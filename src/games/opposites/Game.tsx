import { useRef, useState } from 'react'
import { useLocale } from '../../i18n'
import { useCountdown, usePops, useTimeouts } from '../../kit/hooks'
import { makeRng } from '../../kit/random'
import { sound, vibrate } from '../../kit/sound'
import type { GameProps } from '../../kit/types'
import { Hud, Pops, TimerBar } from '../../kit/ui'
import { pairs } from './content'
import { accuracyFor, boardBonus, dealBoard, DURATION, isMatch, makeDealer, pairPoints, showPictures, type Card } from './logic'

const keyOf = (c: Card) => `${c.side}-${c.pair}`

export default function Opposites({ level, seed, t, onFinish }: GameProps) {
  const locale = useLocale()
  const list = pairs[locale] ?? pairs.en
  const rng = useRef(makeRng(seed)).current
  const deal = useRef(makeDealer(rng, list, level)).current
  const [board, setBoard] = useState(() => dealBoard(rng, deal()))
  const [boardNo, setBoardNo] = useState(0)
  const [selected, setSelected] = useState<Card | null>(null)
  const [matched, setMatched] = useState<number[]>([])
  const [missed, setMissed] = useState<string[]>([])
  const [message, setMessage] = useState<{ text: string; kind: '' | 'yes' | 'no' }>(() => ({ text: t('pick'), kind: '' }))
  const [score, setScore] = useState(0)
  const [found, setFound] = useState(0)
  const [combo, setCombo] = useState(0)
  const [over, setOver] = useState(false)
  const stats = useRef({ matched: 0, misses: 0 })
  const scoreRef = useRef(0)
  scoreRef.current = score
  const [pops, addPop] = usePops()
  const later = useTimeouts()
  const pictures = showPictures(level)

  const left = useCountdown(
    DURATION,
    () => {
      setOver(true)
      onFinish({ score: scoreRef.current, accuracy: accuracyFor(stats.current.matched, stats.current.misses) })
    },
    !over,
  )

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
      stats.current.misses++
      setCombo(0)
      setMissed([keyOf(selected), keyOf(c)])
      setSelected(null)
      setMessage({ text: t('no'), kind: 'no' })
      sound.bad()
      vibrate(30)
      later(() => setMissed([]), 500)
      return
    }
    const nc = combo + 1
    const gained = pairPoints(nc)
    const done = [...matched, c.pair]
    const [a, b] = selected.side === 'left' ? [selected, c] : [c, selected]
    stats.current.matched++
    setMatched(done)
    setSelected(null)
    setCombo(nc)
    setFound((f) => f + 1)
    setScore((s) => s + gained)
    setMessage({ text: t('yes', { a: a.word, b: b.word }), kind: 'yes' })
    sound.good(nc)
    addPop(`+${gained}`, 50, 45)
    if (done.length < board.pairs.length) return
    const bonus = boardBonus(done.length)
    setScore((s) => s + bonus)
    later(() => {
      sound.win()
      addPop(`${t('cleared')} +${bonus}`, 50, 35, 'info')
    }, 250)
    later(() => {
      setBoard(dealBoard(rng, deal()))
      setBoardNo((n) => n + 1)
      setMatched([])
      setMessage({ text: t('pick'), kind: '' })
    }, 1200)
  }

  const cardClass = (c: Card) =>
    `op-card op-${c.side}` +
    (matched.includes(c.pair) ? ' op-matched' : '') +
    (selected && keyOf(selected) === keyOf(c) ? ' op-selected' : '') +
    (missed.includes(keyOf(c)) ? ' op-miss' : '')

  return (
    <div className="game opposites">
      <TimerBar left={left} total={DURATION} />
      <Hud
        items={[
          { label: t('score'), value: score },
          { label: t('pairs'), value: found, highlight: combo >= 3 },
          { label: t('time'), value: Math.ceil(left) },
        ]}
      />
      <p className={`prompt op-msg${message.kind ? ` op-${message.kind}` : ''}`}>{message.text}</p>
      <div className="op-board" key={boardNo}>
        {board.left.map((l, row) => {
          const r = board.right[row]
          return [l, r].map((c) => (
            <button key={keyOf(c)} className={cardClass(c)} onPointerDown={() => tap(c)} disabled={over}>
              {pictures && c.emoji && <span className="op-emoji">{c.emoji}</span>}
              <span className="op-word">{c.word}</span>
            </button>
          ))
        })}
        <Pops pops={pops} />
      </div>
    </div>
  )
}
