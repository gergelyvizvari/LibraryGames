import { useRef, useState } from 'react'
import { useLocale } from '../../i18n'
import { useShake, useTimeouts } from '../../kit/hooks'
import { makeRng } from '../../kit/random'
import { Cast, useMood } from '../../kit/cast'
import { PaintedScene, type PaintedView } from '../../kit/painted'
import { useStage } from '../../kit/SceneShell'
import { sound } from '../../kit/sound'
import { Emoji } from '../../kit/stickers'
import type { GameProps } from '../../kit/types'
import { sentences, sentencesForLevel } from './content'
import { isNext, tilesFor } from './logic'
import bgTall from './art/bg-tall.webp'
import bg from './art/bg.webp'
import charBlink from './art/char-blink.webp'
import charHappy from './art/char-happy.webp'
import charSad from './art/char-sad.webp'
import char from './art/char.webp'

const FACES = { idle: char, blink: charBlink, happy: charHappy, sad: charSad }
/** The character's width / height. */
const ASPECT = 1.4

type ViewId = 'wide' | 'tall'

/** The sunny beach; the words are laid out on the smooth sand. */
const VIEWS: PaintedView<ViewId>[] = [
  { id: 'wide', painting: bg, world: { w: 1280, h: 800 }, focus: { x: 100, y: 60, w: 1180, h: 740 }, play: { x: 180, y: 230, w: 820, h: 540 }, ground: '#f8bd6d', sayAt: { x: 1000, y: 200 } },
  { id: 'tall', painting: bgTall, world: { w: 720, h: 1152 }, focus: { x: 0, y: 180, w: 720, h: 960 }, ground: '#fccc74', sayAt: { x: 360, y: 260 } },
]

/** Where the play sits in each painting (its content zoomed to suit the painting's scale), and the character. */
const SPOTS: Record<ViewId, { box: { x: number; y: number; w: number; h: number }; zoom: number; char: { x: number; bottom: number; h: number } }> = {
  wide: { box: { x: 180, y: 230, w: 820, h: 540 }, zoom: 1.25, char: { x: 1110, bottom: 790, h: 170 } },
  tall: { box: { x: 30, y: 340, w: 660, h: 700 }, zoom: 1.5, char: { x: 590, bottom: 1140, h: 140 } },
}

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
  const [mood, feel] = useMood()
  const [ref, shake] = useShake<HTMLDivElement>()
  const later = useTimeouts()
  const total = sentence.text.split(' ').length

  const tap = (id: number, word: string) => {
    if (stage.over || built.includes(id) || built.length === total) return
    if (!isNext(sentence.text, built.length, word)) {
      feel('sad')
      stage.slip()
      shake()
      return
    }
    const next = [...built, id]
    setBuilt(next)
    sound.tone(480 + next.length * 50, 0.08, 'triangle', 0.18)
    if (next.length < total) return
    feel('happy')
    if (stage.good(total * 10)) return
    later(() => {
      const nextSentence = order[(index + 1) % order.length]
      setIndex(index + 1)
      setTiles(tilesFor(rng, nextSentence.text))
      setBuilt([])
    }, 900)
  }

  return (
    <PaintedScene views={VIEWS} say={t('say')} stage={stage} className="sentence-builder">
      {(view) => {
        const at = SPOTS[view]
        return (
          <>
            <Cast faces={FACES} mood={mood} at={at.char} aspect={ASPECT} />
            {/* `zoom` scales the box's own position too, so it is given in zoomed units. */}
            <div className="pb-box" style={{ left: at.box.x / at.zoom, top: at.box.y / at.zoom, width: at.box.w / at.zoom, height: at.box.h / at.zoom, zoom: at.zoom }}>
      <div className="sb-picture" key={index}>
        <Emoji e={sentence.picture} />
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
            </div>
          </>
        )
      }}
    </PaintedScene>
  )
}
