import { useRef, useState } from 'react'
import { usePops, useShake } from '../../kit/hooks'
import { makeRng } from '../../kit/random'
import { Cast, useMood } from '../../kit/cast'
import { PaintedScene, type PaintedView } from '../../kit/painted'
import { useStage } from '../../kit/SceneShell'
import type { GameProps } from '../../kit/types'
import { Pops } from '../../kit/ui'
import { makePuzzle, mirror, sameShape, type Cells } from './logic'
import bgTall from './art/bg-tall.webp'
import bg from './art/bg.webp'
import charBlink from './art/char-blink.webp'
import charHappy from './art/char-happy.webp'
import charSad from './art/char-sad.webp'
import char from './art/char.webp'

const FACES = { idle: char, blink: charBlink, happy: charHappy, sad: charSad }
/** The character's width / height. */
const ASPECT = 0.49

type ViewId = 'wide' | 'tall'

/** The woodpecker's carpentry workshop; the shapes lie on its workbench. */
const VIEWS: PaintedView<ViewId>[] = [
  { id: 'wide', painting: bg, world: { w: 1280, h: 800 }, focus: { x: 100, y: 60, w: 1180, h: 740 }, ground: '#bf662f', sayAt: { x: 1000, y: 200 } },
  { id: 'tall', painting: bgTall, world: { w: 720, h: 1152 }, focus: { x: 0, y: 180, w: 720, h: 960 }, ground: '#c96d36', sayAt: { x: 360, y: 260 } },
]

/** Where the play sits in each painting (its content zoomed to suit the painting's scale), and the character. */
const SPOTS: Record<ViewId, { box: { x: number; y: number; w: number; h: number }; zoom: number; char: { x: number; bottom: number; h: number } }> = {
  wide: { box: { x: 240, y: 90, w: 760, h: 690 }, zoom: 1.15, char: { x: 1150, bottom: 790, h: 300 } },
  tall: { box: { x: 30, y: 300, w: 660, h: 820 }, zoom: 1.4, char: { x: 620, bottom: 470, h: 200 } },
}

/** Shapes to find in one stage. */
const STAGE = 6

const blocks = { warm: ['#f2c14e', '#f7d572', '#d9a52e'], cool: ['#3fb0a8', '#62c4bc', '#2c9690'] } as const

/** A shape built of wooden toy blocks. */
function Shape({ cells, tone, size = 26 }: { cells: Cells; tone: keyof typeof blocks; size?: number }) {
  const w = Math.max(...cells.map((c) => c[0])) + 1
  const h = Math.max(...cells.map((c) => c[1])) + 1
  const [face, light, dark] = blocks[tone]
  const s = size
  return (
    <svg viewBox={`0 -2 ${w * s} ${h * s + 8}`} width={w * s} height={h * s + 8} aria-hidden>
      {cells.map(([x, y]) => (
        <rect key={`s${x},${y}`} x={x * s + 1} y={y * s + 5} width={s - 2} height={s - 2} rx={s * 0.2} fill="#241a3c" opacity="0.22" />
      ))}
      {cells.map(([x, y]) => (
        <g key={`${x},${y}`}>
          <rect x={x * s + 1} y={y * s + 1} width={s - 2} height={s - 2} rx={s * 0.2} fill={dark} />
          <rect x={x * s + 1} y={y * s + 1} width={s - 2} height={s - 6} rx={s * 0.2} fill={face} />
          <rect x={x * s + s * 0.2} y={y * s + s * 0.16} width={s * 0.6} height={s * 0.2} rx={s * 0.1} fill={light} />
        </g>
      ))}
    </svg>
  )
}

export default function ShapeSpin({ level, seed, t, onFinish }: GameProps) {
  const rng = useRef(makeRng(seed)).current
  const [puzzle, setPuzzle] = useState(() => makePuzzle(rng, level))
  const [spin, setSpin] = useState(0)
  const stage = useStage(STAGE, onFinish)
  const [mood, feel] = useMood()
  const [pops, addPop] = usePops()
  const [ref, shake] = useShake<HTMLDivElement>()

  const choose = (i: number) => {
    if (stage.over) return
    if (i !== puzzle.answer) {
      feel('sad')
      stage.slip()
      shake()
      if (sameShape(mirror(puzzle.target), puzzle.options[i])) addPop(t('flipped'), 50, 60, 'bad')
      return
    }
feel('happy')
        if (stage.good()) return
    setSpin((s) => s + 1)
    setPuzzle(makePuzzle(rng, level))
  }

  return (
    <PaintedScene views={VIEWS} say={t('which')} stage={stage} className="shape-spin">
      {(view) => {
        const at = SPOTS[view]
        return (
          <>
            <Cast faces={FACES} mood={mood} at={at.char} aspect={ASPECT} />
            {/* `zoom` scales the box's own position too, so it is given in zoomed units. */}
            <div className="pb-box" style={{ left: at.box.x / at.zoom, top: at.box.y / at.zoom, width: at.box.w / at.zoom, height: at.box.h / at.zoom, zoom: at.zoom }}>
      <div className="ss-target" key={spin}>
        <Shape cells={puzzle.target} tone="warm" size={36} />
      </div>
      <div className="ss-options" ref={ref} style={{ gridTemplateColumns: `repeat(${puzzle.options.length === 4 ? 2 : 3}, 1fr)` }}>
        {puzzle.options.map((o, i) => (
          <button key={`${spin}-${i}`} className="ss-option" onPointerDown={() => choose(i)}>
            <Shape cells={o} tone="cool" size={21} />
          </button>
        ))}
      </div>
      <Pops pops={pops} />
            </div>
          </>
        )
      }}
    </PaintedScene>
  )
}
