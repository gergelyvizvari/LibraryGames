import { useRef, useState } from 'react'
import { useLocale } from '../../i18n'
import { useGameLoop, useShake } from '../../kit/hooks'
import { clamp, makeRng } from '../../kit/random'
import { SceneShell, useStage } from '../../kit/SceneShell'
import type { GameProps } from '../../kit/types'
import { words, wordsForLevel, type Word } from './content'

/** Pictures to name in one stage. */
const STAGE = 8

interface Drop {
  answer: Word
  options: string[]
  x: number
  y: number
}

export default function WordCatch({ level, seed, t, onFinish }: GameProps) {
  const locale = useLocale()
  const rng = useRef(makeRng(seed)).current
  const pool = wordsForLevel(words[locale] ?? words.en, level)
  // Deal words from a shuffled deck so none repeats until the whole pool has been seen.
  const deck = useRef<Word[]>([])
  const makeDrop = (prev?: Word): Drop => {
    if (deck.current.length === 0) deck.current = rng.shuffle(pool.filter((w) => w !== prev))
    const answer = deck.current.pop()!
    const others = rng.shuffle(pool.filter((w) => w !== answer))
    // From level 5, prefer distractors that start with the same letter, so kids must really read.
    const similar = level >= 5 ? others.filter((w) => w.word[0] === answer.word[0]) : []
    const distractors = [...similar, ...others].slice(0, 2).map((w) => w.word)
    return { answer, options: rng.shuffle([answer.word, ...distractors]), x: rng.int(15, 85), y: -10 }
  }

  const [drop, setDropState] = useState<Drop>(() => makeDrop())
  const dropRef = useRef(drop)
  const setDrop = (d: Drop) => {
    dropRef.current = d
    setDropState(d)
  }
  const stage = useStage(STAGE, onFinish)
  const over = stage.over
  const [ref, shake] = useShake<HTMLDivElement>()

  const fallSeconds = clamp(7.5 - level * 0.45, 3, 7.5)

  const miss = () => {
    stage.slip()
    shake()
  }

  useGameLoop((dt) => {
    const d = dropRef.current
    const y = d.y + (dt / fallSeconds) * 100
    if (y < 92) {
      setDrop({ ...d, y })
      return
    }
    miss()
    setDrop(makeDrop(d.answer))
  }, !over)

  const choose = (option: string) => {
    if (over) return
    if (option !== drop.answer.word) return miss()
    if (!stage.good()) setDrop(makeDrop(drop.answer))
  }

  return (
    <SceneShell
      place="village"
      say={t('say')}
      stage={stage}
      bare
      fill
      className="word-catch"
      tray={
        <div className="choices">
          {drop.options.map((o) => (
            <button key={o} className="choice-btn" onPointerDown={() => choose(o)}>
              {o}
            </button>
          ))}
        </div>
      }
    >
      <div className="wc-sky" ref={ref}>
        <div className="wc-drop" style={{ left: `${drop.x}%`, top: `${drop.y}%` }}>
          {drop.answer.emoji}
        </div>
        <div className="wc-ground" />
      </div>
    </SceneShell>
  )
}
