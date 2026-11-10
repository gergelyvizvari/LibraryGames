import { useRef, useState } from 'react'
import { useLocale } from '../../i18n'
import { useShake, useTimeouts } from '../../kit/hooks'
import { makeRng } from '../../kit/random'
import { SceneShell, useStage } from '../../kit/SceneShell'
import { sound } from '../../kit/sound'
import type { GameProps } from '../../kit/types'
import { words, wordsForLevel, type Word } from './content'
import { scramble } from './logic'

/** Words to spell in one stage. */
const STAGE = 5

export default function AnagramRace({ level, seed, t, onFinish }: GameProps) {
  const locale = useLocale()
  const rng = useRef(makeRng(seed)).current
  const pool = wordsForLevel(words[locale] ?? words.en, level)
  const order = useRef(rng.shuffle(pool)).current
  const [index, setIndex] = useState(0)
  const word: Word = order[index % order.length]
  const [tiles, setTiles] = useState(() => scramble(rng, word.word))
  const [used, setUsed] = useState<number[]>([])
  const stage = useStage(STAGE, onFinish)
  const [ref, shake] = useShake<HTMLDivElement>()
  const later = useTimeouts()

  const typed = used.map((id) => tiles.find((x) => x.id === id)!.letter).join('')

  const tap = (id: number, letter: string) => {
    if (stage.over || used.includes(id) || typed === word.word) return
    if (letter !== word.word[typed.length]) {
      stage.slip()
      shake()
      return
    }
    const next = [...used, id]
    setUsed(next)
    sound.tone(520 + next.length * 70, 0.08, 'triangle', 0.18)
    if (next.length < word.word.length) return
    if (stage.good(word.word.length * 10)) return
    later(() => {
      const nextWord = order[(index + 1) % order.length]
      setIndex(index + 1)
      setTiles(scramble(rng, nextWord.word))
      setUsed([])
    }, 900)
  }

  return (
    <SceneShell place="village" say={t('say')} stage={stage} bare className="anagram-race">
      <div className="ar-picture" key={index}>
        {word.emoji}
      </div>
      <div className="ar-slots">
        {[...word.word].map((_, i) => (
          <span key={i} className={`ar-slot${i < typed.length ? ' ar-filled' : ''}${i === typed.length ? ' ar-next' : ''}`}>
            {typed[i] ?? ''}
          </span>
        ))}
      </div>
      <div className="ar-tiles" ref={ref}>
        {tiles.map((tile) => (
          <button key={`${index}-${tile.id}`} className={`ar-tile${used.includes(tile.id) ? ' ar-used' : ''}`} onPointerDown={() => tap(tile.id, tile.letter)}>
            {tile.letter}
          </button>
        ))}
      </div>
    </SceneShell>
  )
}
