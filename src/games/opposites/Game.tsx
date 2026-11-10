import { useRef, useState } from 'react'
import { useLocale } from '../../i18n'
import { useTimeouts } from '../../kit/hooks'
import { makeRng } from '../../kit/random'
import { SceneShell, useStage } from '../../kit/SceneShell'
import { sound } from '../../kit/sound'
import type { GameProps } from '../../kit/types'
import { pairs } from './content'
import { dealBoard, isMatch, makeDealer, showPictures, type Card } from './logic'

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
      stage.slip()
      later(() => setMissed([]), 500)
      return
    }
    const [a, b] = selected.side === 'left' ? [selected, c] : [c, selected]
    setMatched([...matched, c.pair])
    setSelected(null)
    setMessage({ text: t('yes', { a: a.word, b: b.word }), kind: 'yes' })
    stage.good()
  }

  const cardClass = (c: Card) =>
    `op-card op-${c.side}` +
    (matched.includes(c.pair) ? ' op-matched' : '') +
    (selected && keyOf(selected) === keyOf(c) ? ' op-selected' : '') +
    (missed.includes(keyOf(c)) ? ' op-miss' : '')

  return (
    <SceneShell place="village" say={message.text} stage={stage} bare className="opposites">
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
    </SceneShell>
  )
}
