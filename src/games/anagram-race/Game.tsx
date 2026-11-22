import { useRef, useState } from 'react'
import { useLocale } from '../../i18n'
import { useShake, useTimeouts } from '../../kit/hooks'
import { makeRng } from '../../kit/random'
import { Cast, useMood } from '../../kit/cast'
import { PaintedScene, type PaintedView } from '../../kit/painted'
import { useStage } from '../../kit/SceneShell'
import { sound } from '../../kit/sound'
import type { GameProps } from '../../kit/types'
import { words, wordsForLevel, type Word } from './content'
import { scramble } from './logic'
import bgTall from './art/bg-tall.webp'
import bg from './art/bg.webp'
import charBlink from './art/char-blink.webp'
import charHappy from './art/char-happy.webp'
import charSad from './art/char-sad.webp'
import char from './art/char.webp'

const FACES = { idle: char, blink: charBlink, happy: charHappy, sad: charSad }
/** The character's width / height. */
const ASPECT = 0.46

type ViewId = 'wide' | 'tall'

/** The village toy workshop; the letters lie on its workbench. */
const VIEWS: PaintedView<ViewId>[] = [
  { id: 'wide', painting: bg, world: { w: 1280, h: 800 }, focus: { x: 100, y: 60, w: 1180, h: 740 }, ground: '#b15421', sayAt: { x: 1000, y: 210 } },
  { id: 'tall', painting: bgTall, world: { w: 720, h: 1152 }, focus: { x: 0, y: 200, w: 720, h: 940 }, ground: '#6d5b37', sayAt: { x: 360, y: 260 } },
]

/** Where the play sits in each painting (its content zoomed to suit the painting's scale), and the character. */
const SPOTS: Record<ViewId, { box: { x: number; y: number; w: number; h: number }; zoom: number; char: { x: number; bottom: number; h: number } }> = {
  wide: { box: { x: 180, y: 250, w: 860, h: 520 }, zoom: 1.25, char: { x: 1150, bottom: 790, h: 320 } },
  tall: { box: { x: 20, y: 460, w: 680, h: 620 }, zoom: 1.9, char: { x: 610, bottom: 440, h: 210 } },
}

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
  const [mood, feel] = useMood()
  const [ref, shake] = useShake<HTMLDivElement>()
  const later = useTimeouts()

  const typed = used.map((id) => tiles.find((x) => x.id === id)!.letter).join('')

  const tap = (id: number, letter: string) => {
    if (stage.over || used.includes(id) || typed === word.word) return
    if (letter !== word.word[typed.length]) {
      feel('sad')
      stage.slip()
      shake()
      return
    }
    const next = [...used, id]
    setUsed(next)
    sound.tone(520 + next.length * 70, 0.08, 'triangle', 0.18)
    if (next.length < word.word.length) return
    feel('happy')
    if (stage.good(word.word.length * 10)) return
    later(() => {
      const nextWord = order[(index + 1) % order.length]
      setIndex(index + 1)
      setTiles(scramble(rng, nextWord.word))
      setUsed([])
    }, 900)
  }

  return (
    <PaintedScene views={VIEWS} say={t('say')} stage={stage} className="anagram-race">
      {(view) => {
        const at = SPOTS[view]
        return (
          <>
            <Cast faces={FACES} mood={mood} at={at.char} aspect={ASPECT} />
            <div className="pb-box" style={{ left: at.box.x / at.zoom, top: at.box.y / at.zoom, width: at.box.w / at.zoom, height: at.box.h / at.zoom, zoom: at.zoom }}>
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
            </div>
          </>
        )
      }}
    </PaintedScene>
  )
}
