import { useRef, useState } from 'react'
import { useGameLoop, usePops, useShake } from '../../kit/hooks'
import { clamp, makeRng } from '../../kit/random'
import { Cast, useMood } from '../../kit/cast'
import { PaintedScene, type PaintedView } from '../../kit/painted'
import { useStage } from '../../kit/SceneShell'
import type { GameProps } from '../../kit/types'
import { Pops } from '../../kit/ui'
import { decoyFor, expressionFor, targetRange, type Expr } from './logic'
import bgTall from './art/bg-tall.webp'
import bg from './art/bg.webp'
import charBlink from './art/char-blink.webp'
import charHappy from './art/char-happy.webp'
import charSad from './art/char-sad.webp'
import char from './art/char.webp'

const FACES = { idle: char, blink: charBlink, happy: charHappy, sad: charSad }
/** The character's width / height. */
const ASPECT = 0.64

type ViewId = 'wide' | 'tall'

/** The mountain meadow; the sum bubbles rise into the open sky. */
const VIEWS: PaintedView<ViewId>[] = [
  { id: 'wide', painting: bg, world: { w: 1280, h: 800 }, focus: { x: 60, y: 40, w: 1220, h: 760 }, play: { x: 200, y: 40, w: 820, h: 740 }, ground: '#9fa635', sayAt: { x: 1000, y: 150 } },
  { id: 'tall', painting: bgTall, world: { w: 720, h: 1152 }, focus: { x: 0, y: 120, w: 720, h: 1030 }, ground: '#9a9634', sayAt: { x: 360, y: 200 } },
]

/** Where the play sits in each painting (its content zoomed to suit the painting's scale), and the character. */
const SPOTS: Record<ViewId, { box: { x: number; y: number; w: number; h: number }; zoom: number; char: { x: number; bottom: number; h: number } }> = {
  wide: { box: { x: 200, y: 40, w: 820, h: 740 }, zoom: 1, char: { x: 1140, bottom: 790, h: 260 } },
  tall: { box: { x: 20, y: 180, w: 680, h: 960 }, zoom: 1, char: { x: 610, bottom: 1150, h: 200 } },
}

/** Right bubbles to pop in one stage, and how many of them before the number changes. */
const STAGE = 8
const PER_TARGET = 4

interface Bubble extends Expr {
  id: number
  x: number
  y: number
  speed: number
}

export default function NumberNinja({ level, seed, t, onFinish }: GameProps) {
  const rng = useRef(makeRng(seed)).current
  const newTarget = () => rng.int(...targetRange(level))
  const [target, setTarget] = useState(newTarget)
  const [bubbles, setBubbles] = useState<Bubble[]>([])
  const state = useRef({ bubbles: [] as Bubble[], spawnIn: 0, nextId: 0 })
  const stage = useStage(STAGE, onFinish)
  const [mood, feel] = useMood()
  const [pops, addPop] = usePops()
  const [ref, shake] = useShake<HTMLDivElement>()

  const speed = clamp(12 + level * 2.2, 12, 34) // % of the height per second

  useGameLoop((dt) => {
    const s = state.current
    s.spawnIn -= dt
    if (s.spawnIn <= 0) {
      s.spawnIn = clamp(1.2 - level * 0.06, 0.6, 1.2)
      const good = rng.chance(0.45)
      const e = good ? expressionFor(rng, level, target) : decoyFor(rng, level, target)
      s.bubbles.push({ ...e, id: s.nextId++, x: rng.int(10, 82), y: 105, speed: speed * (0.85 + rng.next() * 0.3) })
    }
    s.bubbles = s.bubbles.map((b) => ({ ...b, y: b.y - b.speed * dt })).filter((b) => b.y > -15)
    setBubbles(s.bubbles)
  }, !stage.over)

  const tap = (b: Bubble) => {
    if (stage.over) return
    const s = state.current
    s.bubbles = s.bubbles.filter((q) => q.id !== b.id)
    setBubbles(s.bubbles)
    if (b.value !== target) {
      feel('sad')
      stage.slip()
      shake()
      addPop(`${b.text} = ${b.value}`, b.x + 6, b.y, 'bad')
      return
    }
    const hits = stage.done + 1
    feel('happy')
    if (stage.good() || hits % PER_TARGET !== 0) return
    let n = newTarget()
    while (n === target) n = newTarget()
    setTarget(n)
    s.bubbles = []
    setBubbles([])
  }

  return (
    <PaintedScene views={VIEWS} say={t('say', { n: target })} stage={stage} className="number-ninja">
      {(view) => {
        const at = SPOTS[view]
        return (
          <>
            <Cast faces={FACES} mood={mood} at={at.char} aspect={ASPECT} />
            {/* `zoom` scales the box's own position too, so it is given in zoomed units. */}
            <div className="pb-box" style={{ left: at.box.x / at.zoom, top: at.box.y / at.zoom, width: at.box.w / at.zoom, height: at.box.h / at.zoom, zoom: at.zoom }}>
      <div className="nn-field" ref={ref}>
        <span className="nn-target" key={target}>
          {target}
        </span>
        {bubbles.map((b) => (
          <button key={b.id} className="nn-bubble" style={{ left: `${b.x}%`, top: `${b.y}%` }} onPointerDown={() => tap(b)}>
            {b.text}
          </button>
        ))}
        <Pops pops={pops} />
      </div>
            </div>
          </>
        )
      }}
    </PaintedScene>
  )
}
