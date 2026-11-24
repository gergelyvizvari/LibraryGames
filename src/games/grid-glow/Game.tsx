import { useEffect, useRef, useState } from 'react'
import { useShake, useTimeouts } from '../../kit/hooks'
import { clamp, makeRng } from '../../kit/random'
import { Cast, useMood } from '../../kit/cast'
import { PaintedScene, type PaintedView } from '../../kit/painted'
import { useStage } from '../../kit/SceneShell'
import { sound } from '../../kit/sound'
import type { GameProps } from '../../kit/types'
import { gridFor, pattern, startCount } from './logic'
import bgTall from './art/bg-tall.webp'
import pad from './art/pad.webp'
import bg from './art/bg.webp'
import charBlink from './art/char-blink.webp'
import charHappy from './art/char-happy.webp'
import charSad from './art/char-sad.webp'
import char from './art/char.webp'

const FACES = { idle: char, blink: charBlink, happy: charHappy, sad: charSad }
/** The character's width / height. */
const ASPECT = 0.56

type ViewId = 'wide' | 'tall'

/** The twilight pond; the lily pads to remember float on its water. */
const VIEWS: PaintedView<ViewId>[] = [
  { id: 'wide', painting: bg, world: { w: 1280, h: 800 }, focus: { x: 120, y: 60, w: 1160, h: 740 }, play: { x: 340, y: 120, w: 600, h: 620 }, ground: '#a59c51', sayAt: { x: 1000, y: 180 } },
  { id: 'tall', painting: bgTall, world: { w: 720, h: 1152 }, focus: { x: 0, y: 180, w: 720, h: 960 }, ground: '#74817a', sayAt: { x: 360, y: 260 } },
]

/** Where the play sits in each painting (its content zoomed to suit the painting's scale), and the character. */
const SPOTS: Record<ViewId, { box: { x: number; y: number; w: number; h: number }; zoom: number; char: { x: number; bottom: number; h: number } }> = {
  wide: { box: { x: 360, y: 150, w: 560, h: 560 }, zoom: 1.3, char: { x: 180, bottom: 770, h: 260 } },
  tall: { box: { x: 70, y: 320, w: 580, h: 580 }, zoom: 1.5, char: { x: 610, bottom: 1140, h: 200 } },
}

/** Patterns to remember in one stage. Each one glows one square more; a slip brings an easier one. */
const STAGE = 5

export default function GridGlow({ level, seed, t, onFinish }: GameProps) {
  const rng = useRef(makeRng(seed)).current
  const [count, setCount] = useState(startCount(level))
  const size = gridFor(count)
  const [cells, setCells] = useState(() => pattern(rng, size, count))
  const [mode, setMode] = useState<'show' | 'input' | 'wait'>('show')
  const [picked, setPicked] = useState<number[]>([])
  const [wrongCell, setWrongCell] = useState<number | null>(null)
  const [rounds, setRounds] = useState(0)
  const stage = useStage(STAGE, onFinish)
  const [mood, feel] = useMood()
  const [ref, shake] = useShake<HTMLDivElement>()
  const later = useTimeouts()

  useEffect(() => {
    if (mode !== 'show') return
    sound.tone(700, 0.15, 'triangle', 0.15)
    later(() => setMode('input'), clamp(1700 - level * 80 + count * 140, 1000, 2600))
  }, [mode, cells, level, count, later])

  const newRound = (n: number) => {
    setCount(n)
    setCells(pattern(rng, gridFor(n), n))
    setPicked([])
    setWrongCell(null)
    setRounds((r) => r + 1)
    setMode('show')
  }

  const tap = (i: number) => {
    if (mode !== 'input' || picked.includes(i)) return
    if (!cells.includes(i)) {
      feel('sad')
      stage.slip()
      shake()
      setWrongCell(i)
      setMode('wait')
      later(() => newRound(Math.max(2, count - 1)), 1300)
      return
    }
    const next = [...picked, i]
    setPicked(next)
    sound.tone(500 + next.length * 60, 0.08, 'triangle', 0.15)
    if (next.length < cells.length) return
    setMode('wait')
    feel('happy')
    if (!stage.good(count * 10)) later(() => newRound(count + 1), 800)
  }

  return (
    <PaintedScene views={VIEWS} say={mode === 'show' ? t('watch') : t('yourTurn')} stage={stage} className="grid-glow">
      {(view) => {
        const at = SPOTS[view]
        return (
          <>
            <Cast faces={FACES} mood={mood} at={at.char} aspect={ASPECT} />
            {/* `zoom` scales the box's own position too, so it is given in zoomed units. */}
            <div className="pb-box" style={{ left: at.box.x / at.zoom, top: at.box.y / at.zoom, width: at.box.w / at.zoom, height: at.box.h / at.zoom, zoom: at.zoom }}>
      <div className="gg-grid" ref={ref} style={{ gridTemplateColumns: `repeat(${size}, 1fr)`, ['--gg-pad' as string]: `url(${pad})` }}>
        {Array.from({ length: size * size }, (_, i) => {
          const lit = mode === 'show' || (mode === 'wait' && wrongCell !== null) ? cells.includes(i) : picked.includes(i)
          return (
            <button
              key={`${rounds}-${i}`}
              className={`gg-cell${lit ? ' gg-lit' : ''}${wrongCell === i ? ' gg-wrong' : ''}`}
              onPointerDown={() => tap(i)}
              aria-label={`square ${i + 1}`}
            />
          )
        })}
      </div>
            </div>
          </>
        )
      }}
    </PaintedScene>
  )
}
