import { useRef, useState } from 'react'
import { useShake, useTimeouts } from '../../kit/hooks'
import { makeRng } from '../../kit/random'
import { Cast, useMood } from '../../kit/cast'
import { PaintedScene, type PaintedView } from '../../kit/painted'
import { useStage } from '../../kit/SceneShell'
import { sound } from '../../kit/sound'
import type { GameProps } from '../../kit/types'
import { makePuzzle, targets } from './logic'
import bgTall from './art/bg-tall.webp'
import bg from './art/bg.webp'
import charBlink from './art/char-blink.webp'
import charHappy from './art/char-happy.webp'
import charSad from './art/char-sad.webp'
import char from './art/char.webp'

const FACES = { idle: char, blink: charBlink, happy: charHappy, sad: charSad }
/** The character's width / height. */
const ASPECT = 0.6

type ViewId = 'wide' | 'tall'

/** The still forest lake; the two halves of the picture mirror each other over the water. */
const VIEWS: PaintedView<ViewId>[] = [
  { id: 'wide', painting: bg, world: { w: 1280, h: 800 }, focus: { x: 120, y: 60, w: 1160, h: 740 }, play: { x: 340, y: 190, w: 600, h: 560 }, ground: '#8d8723', sayAt: { x: 1000, y: 170 } },
  { id: 'tall', painting: bgTall, world: { w: 720, h: 1152 }, focus: { x: 0, y: 180, w: 720, h: 960 }, ground: '#7c7f20', sayAt: { x: 360, y: 260 } },
]

/** Where the play sits in each painting (its content zoomed to suit the painting's scale), and the character. */
const SPOTS: Record<ViewId, { box: { x: number; y: number; w: number; h: number }; zoom: number; char: { x: number; bottom: number; h: number } }> = {
  wide: { box: { x: 340, y: 190, w: 600, h: 560 }, zoom: 1.2, char: { x: 1150, bottom: 780, h: 280 } },
  tall: { box: { x: 40, y: 330, w: 640, h: 640 }, zoom: 1.45, char: { x: 610, bottom: 1140, h: 220 } },
}

/** Patterns to mirror in one stage. */
const STAGE = 4

export default function MirrorMatch({ level, seed, t, onFinish }: GameProps) {
  const rng = useRef(makeRng(seed)).current
  const [puzzle, setPuzzle] = useState(() => makePuzzle(rng, level, 0))
  const [filled, setFilled] = useState<number[]>([])
  const [wrongCell, setWrongCell] = useState<number | null>(null)
  const [solved, setSolved] = useState(0)
  const stage = useStage(STAGE, onFinish)
  const [mood, feel] = useMood()
  const [ref, shake] = useShake<HTMLDivElement>()
  const later = useTimeouts()
  const goal = targets(puzzle)

  const tap = (cell: number) => {
    if (stage.over || filled.includes(cell) || filled.length === goal.length) return
    if (!goal.includes(cell)) {
      setWrongCell(cell)
      later(() => setWrongCell(null), 300)
      feel('sad')
      stage.slip()
      shake()
      return
    }
    const next = [...filled, cell]
    setFilled(next)
    sound.tone(500 + next.length * 60, 0.08, 'triangle', 0.16)
    if (next.length < goal.length) return
    setSolved((n) => n + 1)
    feel('happy')
    if (stage.good(goal.length * 10)) return
    later(() => {
      setPuzzle(makePuzzle(rng, level, solved + 1))
      setFilled([])
    }, 800)
  }

  const side = (isLeft: boolean) => (
    <div className="mm-side" style={{ gridTemplateColumns: `repeat(${puzzle.half}, 1fr)` }}>
      {Array.from({ length: puzzle.rows * puzzle.half }, (_, i) => {
        const on = isLeft ? puzzle.left.includes(i) : filled.includes(i)
        return isLeft ? (
          <span key={i} className={`mm-cell${on ? ' mm-on' : ''}`} />
        ) : (
          <button key={i} className={`mm-cell mm-tap${on ? ' mm-on' : ''}${wrongCell === i ? ' mm-wrong' : ''}`} onPointerDown={() => tap(i)} />
        )
      })}
    </div>
  )

  return (
    <PaintedScene views={VIEWS} say={t('say')} stage={stage} className="mirror-match">
      {(view) => {
        const at = SPOTS[view]
        return (
          <>
            <Cast faces={FACES} mood={mood} at={at.char} aspect={ASPECT} />
            {/* `zoom` scales the box's own position too, so it is given in zoomed units. */}
            <div className="pb-box" style={{ left: at.box.x / at.zoom, top: at.box.y / at.zoom, width: at.box.w / at.zoom, height: at.box.h / at.zoom, zoom: at.zoom }}>
      <div className="mm-board" ref={ref} key={solved}>
        {side(true)}
        <div className="mm-mirror" />
        {side(false)}
      </div>
            </div>
          </>
        )
      }}
    </PaintedScene>
  )
}
