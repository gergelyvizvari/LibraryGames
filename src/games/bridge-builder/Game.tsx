import { useEffect, useRef, useState } from 'react'
import { useTimeouts } from '../../kit/hooks'
import { PaintedScene, type PaintedView } from '../../kit/painted'
import { makeRng } from '../../kit/random'
import { useStage } from '../../kit/SceneShell'
import { sound } from '../../kit/sound'
import type { GameProps } from '../../kit/types'
import foxBlink from './art/fox-blink.webp'
import foxHappy from './art/fox-happy.webp'
import fox from './art/fox.webp'
import plankArt from './art/plank.webp'
import valleyTall from './art/valley-tall.webp'
import valley from './art/valley.webp'
import { DECK_LEFT, DECK_RIGHT, fit, makeTask, STAGE, type Task } from './logic'

/** The deck's top edge, in scene units. */
const DECK_Y = 120
/** Where the first plank lies on the meadow. */
const PLANKS_Y = 210
// Roomy rows and thick planks, so the grass fills the scene on a phone and every plank is easy to see and tap.
const ROW = 70
/** How thick a plank is. */
const THICK = 26

/** Each plank gets a slightly different wood: the painted plank, a little lighter or darker. */
const woods = ['none', 'brightness(1.12) saturate(0.9)', 'brightness(0.86) saturate(1.1)']

/** A painted plank stretched to `length`: the wood grain runs along it, so it stays a plank at any length. */
function Board({ x, y, length, wood, className }: { x: number; y: number; length: number; wood: number; className?: string }) {
  return (
    <g className={className}>
      <image href={plankArt} x={x} y={y} width={length} height={THICK} preserveAspectRatio="none" style={{ filter: woods[wood % woods.length] }} />
    </g>
  )
}

/** The deck from one end to the other: painted boards laid end to end, leaving out the gap. */
function Deck({ from, to }: { from: number; to: number }) {
  const n = Math.max(1, Math.round((to - from) / 70))
  const w = (to - from) / n
  return (
    <g>
      <rect x={from} y={DECK_Y + THICK - 6} width={to - from} height={8} rx={3} fill="#6b4a32" opacity="0.45" />
      {Array.from({ length: n }, (_, i) => (
        <image key={i} href={plankArt} x={from + i * w} y={DECK_Y} width={w + 0.5} height={THICK} preserveAspectRatio="none" style={{ filter: woods[i % woods.length] }} />
      ))}
    </g>
  )
}

type ViewId = 'wide' | 'tall'

/** The forest valley; the bridge spans the stream and the planks lie on the meadow in front. */
const VIEWS: PaintedView<ViewId>[] = [
  { id: 'wide', painting: valley, world: { w: 1280, h: 800 }, focus: { x: 230, y: 120, w: 820, h: 680 }, ground: '#bebd2f', sayAt: { x: 300, y: 200 } },
  { id: 'tall', painting: valleyTall, world: { w: 720, h: 1152 }, focus: { x: 0, y: 160, w: 720, h: 900 }, ground: '#ccc622', sayAt: { x: 60, y: 260 } },
]

/** Where the bridge scene (400 units wide) lies in each painting: its left, the deck's height in the painting, its scale and how tall it may be. */
const BOX: Record<ViewId, { x: number; deck: number; k: number; bottom: number }> = {
  wide: { x: 360, deck: 420, k: 1.4, bottom: 790 },
  tall: { x: 20, deck: 430, k: 1.7, bottom: 1090 },
}

/** The fox blinks now and then while it waits. */
function useBlink(on: boolean) {
  const [shut, setShut] = useState(false)
  useEffect(() => {
    if (!on) return
    let timer = 0
    const next = (open: boolean) => {
      timer = window.setTimeout(
        () => {
          setShut(open)
          next(!open)
        },
        open ? 2600 + Math.random() * 2600 : 150,
      )
    }
    next(true)
    return () => {
      clearTimeout(timer)
      setShut(false)
    }
  }, [on])
  return shut
}

export default function BridgeBuilder({ level, seed, t, onFinish }: GameProps) {
  const rng = useRef(makeRng(seed)).current
  const nextId = useRef(0)
  const lastGap = useRef(0)
  const newRound = () => {
    const task: Task = makeTask(rng, level, lastGap.current)
    lastGap.current = task.gap
    return { id: nextId.current++, task }
  }
  const [round, setRound] = useState(newRound)
  const [solved, setSolved] = useState(false)
  const [tried, setTried] = useState<{ plank: number; how: 'short' | 'long'; n: number } | null>(null)
  const stage = useStage(STAGE, onFinish)
  const later = useTimeouts()
  const tries = useRef(0)
  const { task } = round
  const blink = useBlink(!solved)

  const pick = (i: number) => {
    if (solved || stage.over) return
    const how = fit(task.planks[i].length, task.gap)
    if (how !== 'exact') {
      stage.slip()
      setTried({ plank: i, how, n: tries.current++ })
      return
    }
    setTried(null)
    setSolved(true)
    sound.tone(392, 0.1, 'triangle', 0.15)
    if (stage.good()) return
    later(() => {
      setSolved(false)
      setRound(newRound())
    }, 2300)
  }

  const say = solved ? t('yes') : tried ? t(tried.how) : t('say')
  const end = task.gapAt + task.gap
  const ghost = tried && task.planks[tried.plank]

  return (
    <PaintedScene views={VIEWS} say={say} stage={stage} className="bridge-builder">
      {(view) => {
        const box = BOX[view]
        // The scene reaches down to the meadow's front edge, and the planks spread over the grass below the bridge.
        const height = DECK_Y + (box.bottom - box.deck) / box.k
        const n = task.planks.length
        const row = n > 1 ? Math.min(ROW * 1.7, (height - PLANKS_Y - THICK - 12) / (n - 1)) : ROW
        return (
          <svg
            key={round.id}
            className="bb-scene"
            viewBox={`0 0 400 ${height}`}
            style={{ left: box.x, top: box.deck - DECK_Y * box.k, width: 400 * box.k, height: height * box.k }}
          >
            <path d={`M${DECK_LEFT} ${DECK_Y - 26} Q200 ${DECK_Y - 14} ${DECK_RIGHT} ${DECK_Y - 26}`} stroke="#8b5e3c" strokeWidth="3" fill="none" />
            {[DECK_LEFT, task.gapAt, end, DECK_RIGHT].map((x) => (
              <rect key={x} x={x - 3} y={DECK_Y - 28} width="6" height="34" rx="2" fill="#7a5234" />
            ))}
            {[DECK_LEFT, DECK_RIGHT].map((x) => (
              <rect key={`p${x}`} x={x - 5} y={DECK_Y + THICK - 4} width="10" height="44" rx="3" fill="#7a5234" opacity="0.9" />
            ))}
            <Deck from={DECK_LEFT} to={task.gapAt} />
            <Deck from={end} to={DECK_RIGHT} />
            {solved && <Board className="bb-drop" x={task.gapAt} y={DECK_Y} length={task.gap} wood={task.planks[task.fits].wood} />}
            {ghost && <Board className={`bb-ghost bb-${tried.how}`} key={tried.n} x={task.gapAt} y={DECK_Y} length={ghost.length} wood={ghost.wood} />}
            <g className={`bb-fox${solved ? ' bb-walk' : ''}`}>
              {[
                [fox, !solved && !blink],
                [foxBlink, !solved && blink],
                [foxHappy, solved],
              ].map(([src, on]) => (
                <image key={src as string} href={src as string} x="-22" y="-74" width="44" height="76" preserveAspectRatio="xMidYMax meet" visibility={on ? 'visible' : 'hidden'} />
              ))}
            </g>
            {task.planks.map((p, i) => {
              const y = PLANKS_Y + i * row
              const cx = p.x + p.length / 2
              const gone = solved && i === task.fits
              return (
                <g
                  key={i}
                  role="button"
                  aria-label={t('plank', { n: i + 1 })}
                  className={`bb-plank${gone ? ' bb-gone' : ''}${tried?.plank === i ? ' bb-no' : ''}`}
                  transform={`rotate(${p.tilt} ${cx} ${y + THICK / 2})`}
                  onPointerDown={() => pick(i)}
                >
                  <rect x={p.x - 8} y={y - 14} width={p.length + 16} height={THICK + 28} fill="transparent" />
                  <ellipse cx={cx} cy={y + THICK + 3} rx={p.length / 2} ry={5} fill="#4a5a1a" opacity="0.25" />
                  <Board x={p.x} y={y} length={p.length} wood={p.wood} />
                </g>
              )
            })}
          </svg>
        )
      }}
    </PaintedScene>
  )
}
