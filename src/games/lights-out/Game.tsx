import { useRef, useState } from 'react'
import { useShake, useTimeouts } from '../../kit/hooks'
import { makeRng } from '../../kit/random'
import { Cast, useMood } from '../../kit/cast'
import { PaintedScene, type PaintedView } from '../../kit/painted'
import { useStage } from '../../kit/SceneShell'
import { sound } from '../../kit/sound'
import { Emoji } from '../../kit/stickers'
import type { GameProps } from '../../kit/types'
import { ROUNDS, animalKey, holdRange, pointsFor } from './logic'
import bgTall from './art/bg-tall.webp'
import bg from './art/bg.webp'
import charBlink from './art/char-blink.webp'
import charHappy from './art/char-happy.webp'
import charSad from './art/char-sad.webp'
import char from './art/char.webp'

const FACES = { idle: char, blink: charBlink, happy: charHappy, sad: charSad }
/** The character's width / height. */
const ASPECT = 0.38

type ViewId = 'wide' | 'tall'

/** The meadow race track; the five start lights hang on the wooden gantry. */
const VIEWS: PaintedView<ViewId>[] = [
  { id: 'wide', painting: bg, world: { w: 1280, h: 800 }, focus: { x: 60, y: 60, w: 1220, h: 740 }, play: { x: 180, y: 168, w: 930, h: 620 }, ground: '#b1a72c', sayAt: { x: 1000, y: 330 } },
  { id: 'tall', painting: bgTall, world: { w: 720, h: 1152 }, focus: { x: 0, y: 180, w: 720, h: 960 }, ground: '#9fa824', sayAt: { x: 360, y: 560 } },
]

/** Where the play sits in each painting (its content zoomed to suit the painting's scale), and the character. */
const SPOTS: Record<ViewId, { box: { x: number; y: number; w: number; h: number }; zoom: number; char: { x: number; bottom: number; h: number } }> = {
  wide: { box: { x: 180, y: 168, w: 930, h: 620 }, zoom: 1, char: { x: 1180, bottom: 790, h: 300 } },
  tall: { box: { x: 40, y: 222, w: 640, h: 900 }, zoom: 1, char: { x: 600, bottom: 1140, h: 260 } },
}

type State = 'ready' | 'lighting' | 'holding' | 'go' | 'result' | 'done'

export default function LightsOut({ level, seed, t, onFinish }: GameProps) {
  const rng = useRef(makeRng(seed)).current
  const [state, setState] = useState<State>('ready')
  const [lit, setLit] = useState(0)
  const [message, setMessage] = useState('')
  const stage = useStage(ROUNDS, onFinish)
  const [mood, feel] = useMood()
  const [ref, shake] = useShake<HTMLButtonElement>()
  const later = useTimeouts()
  const outAt = useRef(0)
  const run = useRef(0)

  const startLights = () => {
    const id = ++run.current
    setMessage('')
    setLit(0)
    setState('lighting')
    for (let i = 1; i <= 5; i++) {
      later(() => {
        if (run.current !== id) return
        setLit(i)
        sound.tone(440, 0.12, 'square', 0.08)
        if (i === 5) {
          setState('holding')
          const [min, max] = holdRange(level)
          later(() => {
            if (run.current !== id) return
            setLit(0)
            setState('go')
            outAt.current = performance.now()
          }, rng.int(min, max))
        }
      }, i * 450)
    }
  }

  const tap = () => {
    if (state === 'ready' || state === 'result') {
      startLights()
      return
    }
    if (state === 'lighting' || state === 'holding') {
      run.current++
      feel('sad')
      stage.slip()
      shake()
      setLit(0)
      setMessage(t('tooSoon'))
      setState('result')
      return
    }
    if (state !== 'go') return
    const ms = Math.round(performance.now() - outAt.current)
    setMessage(`${t('ms', { ms })} · ${t(animalKey(ms))}`)
    feel('happy')
    setState(stage.good(pointsFor(ms)) ? 'done' : 'result')
  }

  const label =
    state === 'go' ? t('tapNow') : state === 'lighting' || state === 'holding' ? t('waitForIt') : state === 'done' ? '' : t('tapToStart')

  return (
    <PaintedScene views={VIEWS} say={<Emoji e={message || label || t('tapToStart')} />} stage={stage} className="lights-out">
      {(view) => {
        const at = SPOTS[view]
        return (
          <>
            <Cast faces={FACES} mood={mood} at={at.char} aspect={ASPECT} />
            {/* `zoom` scales the box's own position too, so it is given in zoomed units. */}
            <div className="pb-box" style={{ left: at.box.x / at.zoom, top: at.box.y / at.zoom, width: at.box.w / at.zoom, height: at.box.h / at.zoom, zoom: at.zoom }}>
      <button ref={ref} className={`lo-area lo-${state}`} onPointerDown={tap}>
        <div className="lo-lights">
          {[1, 2, 3, 4, 5].map((i) => (
            <span key={i} className={`lo-light${i <= lit ? ' lo-on' : ''}`} />
          ))}
        </div>
        <div className="lo-label">
          <Emoji e={message || label || t('tapToStart')} />
        </div>
      </button>
            </div>
          </>
        )
      }}
    </PaintedScene>
  )
}
