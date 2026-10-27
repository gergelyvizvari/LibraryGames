import { useRef, useState } from 'react'
import { useLocale } from '../../i18n'
import { useCountdown, usePops, useShake, useTimeouts } from '../../kit/hooks'
import { clamp, makeRng } from '../../kit/random'
import { sound, vibrate } from '../../kit/sound'
import type { GameProps } from '../../kit/types'
import { Hud, Pops, TimerBar } from '../../kit/ui'
import { sentences, sentencesForLevel } from './content'
import { isNext, tilesFor } from './logic'

const DURATION = 90

export default function SentenceBuilder({ level, seed, t, onFinish }: GameProps) {
  const locale = useLocale()
  const rng = useRef(makeRng(seed)).current
  const order = useRef(rng.shuffle(sentencesForLevel(sentences[locale] ?? sentences.en, level))).current
  const [index, setIndex] = useState(0)
  const sentence = order[index % order.length]
  const [tiles, setTiles] = useState(() => tilesFor(rng, sentence.text))
  const [built, setBuilt] = useState<number[]>([])
  const [score, setScore] = useState(0)
  const [done, setDone] = useState(0)
  const [slips, setSlips] = useState(0)
  const [over, setOver] = useState(false)
  const [pops, addPop] = usePops()
  const [ref, shake] = useShake<HTMLDivElement>()
  const later = useTimeouts()
  const total = sentence.text.split(' ').length

  const left = useCountdown(
    DURATION,
    () => {
      setOver(true)
      onFinish({ score, accuracy: clamp(done / 6, 0, 1) * (slips > done * 3 ? 0.7 : 1) })
    },
    !over,
  )

  const tap = (id: number, word: string) => {
    if (over || built.includes(id) || built.length === total) return
    if (!isNext(sentence.text, built.length, word)) {
      setSlips((s) => s + 1)
      sound.bad()
      vibrate(40)
      shake()
      return
    }
    const next = [...built, id]
    setBuilt(next)
    sound.tone(480 + next.length * 50, 0.08, 'triangle', 0.18)
    if (next.length < total) return
    const gained = total * 10
    setScore((s) => s + gained)
    setDone((d) => d + 1)
    sound.good(done + 1)
    addPop(`+${gained}`, 50, 30)
    later(() => {
      const nextSentence = order[(index + 1) % order.length]
      setIndex(index + 1)
      setTiles(tilesFor(rng, nextSentence.text))
      setBuilt([])
    }, 900)
  }

  return (
    <div className="game sentence-builder">
      <TimerBar left={left} total={DURATION} />
      <Hud
        items={[
          { label: t('score'), value: score },
          { label: t('sentences'), value: done, highlight: done > 0 },
          { label: t('time'), value: Math.ceil(left) },
        ]}
      />
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
      <Pops pops={pops} />
    </div>
  )
}
