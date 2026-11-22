import { useEffect, useRef, useState } from 'react'
import { useGameLoop, useShake } from '../../kit/hooks'
import { makeRng } from '../../kit/random'
import { Cast, useMood } from '../../kit/cast'
import { PaintedScene, type PaintedView } from '../../kit/painted'
import { useStage } from '../../kit/SceneShell'
import type { GameProps } from '../../kit/types'
import { lettersForLevel, riseSpeed, spawnGap } from './logic'
import bgTall from './art/bg-tall.webp'
import bg from './art/bg.webp'
import charBlink from './art/char-blink.webp'
import charHappy from './art/char-happy.webp'
import charSad from './art/char-sad.webp'
import char from './art/char.webp'

const FACES = { idle: char, blink: charBlink, happy: charHappy, sad: charSad }
/** The character's width / height. */
const ASPECT = 1.04

type ViewId = 'wide' | 'tall'

/** Under the sea; the letter bubbles rise through the open water. */
const VIEWS: PaintedView<ViewId>[] = [
  { id: 'wide', painting: bg, world: { w: 1280, h: 800 }, focus: { x: 100, y: 40, w: 1180, h: 760 }, ground: '#eec57c', sayAt: { x: 640, y: 120 } },
  { id: 'tall', painting: bgTall, world: { w: 720, h: 1152 }, focus: { x: 0, y: 140, w: 720, h: 1000 }, ground: '#e0c771', sayAt: { x: 360, y: 220 } },
]

/** Where the play sits in each painting (its content zoomed to suit the painting's scale), and the character. */
const SPOTS: Record<ViewId, { box: { x: number; y: number; w: number; h: number }; zoom: number; char: { x: number; bottom: number; h: number } }> = {
  wide: { box: { x: 160, y: 60, w: 840, h: 720 }, zoom: 1, char: { x: 1140, bottom: 770, h: 230 } },
  tall: { box: { x: 20, y: 220, w: 680, h: 900 }, zoom: 1, char: { x: 600, bottom: 1140, h: 170 } },
}

/** Bubbles to pop in one stage. */
const STAGE = 10
const colors = ['#ff9ff3', '#feca57', '#48dbfb', '#1dd1a1', '#ff6b6b', '#a29bfe']

interface Bubble {
  id: number
  letter: string
  x: number
  y: number
  color: string
}

export default function LetterPop({ level, seed, t, onFinish }: GameProps) {
  const rng = useRef(makeRng(seed)).current
  const letters = lettersForLevel(level)
  const state = useRef({ bubbles: [] as Bubble[], elapsed: 0, spawnIn: 0.2, nextId: 0 })
  const [bubbles, setBubbles] = useState<Bubble[]>([])
  const stage = useStage(STAGE, onFinish)
  const [mood, feel] = useMood()
  const over = stage.over
  const [ref, shake] = useShake<HTMLDivElement>()
  const input = useRef<HTMLInputElement>(null)

  useEffect(() => input.current?.focus(), [])

  useGameLoop((dt) => {
    const s = state.current
    s.elapsed += dt
    s.spawnIn -= dt
    if (s.spawnIn <= 0) {
      s.spawnIn = spawnGap(level, s.elapsed)
      s.bubbles.push({ id: s.nextId++, letter: rng.pick([...letters]), x: rng.int(4, 76), y: 105, color: rng.pick(colors) })
    }
    const speed = riseSpeed(level, s.elapsed)
    // A bubble that floats away is not a mistake: another one comes.
    s.bubbles = s.bubbles.map((b) => ({ ...b, y: b.y - speed * dt })).filter((b) => b.y >= -12)
    setBubbles(s.bubbles)
  }, !over)

  const press = (key: string) => {
    if (over || key.length !== 1) return
    const k = key.toLowerCase()
    const s = state.current
    // Pop the highest bubble with that letter: it is the closest to escaping.
    const target = s.bubbles.filter((b) => b.letter === k).sort((a, b) => a.y - b.y)[0]
    if (!target) {
      feel('sad')
      stage.slip()
      shake()
      return
    }
    s.bubbles = s.bubbles.filter((b) => b.id !== target.id)
    setBubbles(s.bubbles)
    feel('happy')
    stage.good()
  }

  return (
    <PaintedScene views={VIEWS} say={t('say')} stage={stage} className="letter-pop" trayHeight={90} tray={
      <input
        ref={input}
        className="td-input"
        value=""
        placeholder={t('typeHere')}
        onChange={(e) => {
          const v = e.target.value
          if (v) press(v[v.length - 1])
        }}
        autoCapitalize="none"
        autoCorrect="off"
        autoComplete="off"
        spellCheck={false}
      />
      }>
      {(view) => {
        const at = SPOTS[view]
        return (
          <>
            <Cast faces={FACES} mood={mood} at={at.char} aspect={ASPECT} />
            {/* `zoom` scales the box's own position too, so it is given in zoomed units. */}
            <div className="pb-box" style={{ left: at.box.x / at.zoom, top: at.box.y / at.zoom, width: at.box.w / at.zoom, height: at.box.h / at.zoom, zoom: at.zoom }}>
      <div className="lp-water" ref={ref} onPointerDown={() => input.current?.focus()}>
        {bubbles.map((b) => (
          <span key={b.id} className="lp-bubble" style={{ left: `${b.x}%`, top: `${b.y}%`, borderColor: b.color, color: b.color }}>
            {b.letter}
          </span>
        ))}
      </div>
            </div>
          </>
        )
      }}
    </PaintedScene>
  )
}
