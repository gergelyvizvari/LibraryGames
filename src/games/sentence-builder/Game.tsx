import { useRef, useState } from 'react'
import { useLocale } from '../../i18n'
import { useShake, useTimeouts } from '../../kit/hooks'
import { makeRng } from '../../kit/random'
import { SceneShell, useStage } from '../../kit/SceneShell'
import { sound } from '../../kit/sound'
import type { GameProps } from '../../kit/types'
import { sentences, sentencesForLevel } from './content'
import { isNext, tilesFor } from './logic'

/** Sentences to build in one stage. */
const STAGE = 4

export default function SentenceBuilder({ level, seed, t, onFinish }: GameProps) {
  const locale = useLocale()
  const rng = useRef(makeRng(seed)).current
  const order = useRef(rng.shuffle(sentencesForLevel(sentences[locale] ?? sentences.en, level))).current
  const [index, setIndex] = useState(0)
  const sentence = order[index % order.length]
  const [tiles, setTiles] = useState(() => tilesFor(rng, sentence.text))
  const [built, setBuilt] = useState<number[]>([])
  const stage = useStage(STAGE, onFinish)
  const [ref, shake] = useShake<HTMLDivElement>()
  const later = useTimeouts()
  const total = sentence.text.split(' ').length

  const tap = (id: number, word: string) => {
    if (stage.over || built.includes(id) || built.length === total) return
    if (!isNext(sentence.text, built.length, word)) {
      stage.slip()
      shake()
      return
    }
    const next = [...built, id]
    setBuilt(next)
    sound.tone(480 + next.length * 50, 0.08, 'triangle', 0.18)
    if (next.length < total) return
    if (stage.good(total * 10)) return
    later(() => {
      const nextSentence = order[(index + 1) % order.length]
      setIndex(index + 1)
      setTiles(tilesFor(rng, nextSentence.text))
      setBuilt([])
    }, 900)
  }

  return (
    <SceneShell place="sea" say={t('say')} stage={stage} bare className="sentence-builder">
      <div className="sb-picture" key={index}>
        {sentence.picture}
      </div>
      <div className={`sb-built${built.length === total ? ' sb-done' : ''}`}>
        {built.map((id) => (
          <span key={id} className="sb-word">
            {tiles.find((x) => x.id === id)!.word}
          </span>
        ))}
        {built.length < total && <span className="sb-cursor" />}
      </div>
      <div className="sb-tiles" ref={ref}>
        {tiles.map((tile) => (
          <button key={`${index}-${tile.id}`} className={`sb-tile${built.includes(tile.id) ? ' sb-used' : ''}`} onPointerDown={() => tap(tile.id, tile.word)}>
            {tile.word}
          </button>
        ))}
      </div>
    </SceneShell>
  )
}
