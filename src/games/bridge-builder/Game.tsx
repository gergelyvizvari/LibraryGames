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
/** Room between two planks lying on the meadow, at most. */
const ROW = 70
/** How thick a plank is. */
const THICK = 22
/** The painted plank texture (art/plank.webp) is this many times longer than thick; a plank shows a piece of it, never stretched. */
const GRAIN = 1650 / 80

/** Each plank gets a slightly different wood: the painted plank, a little lighter or darker, and another piece of its grain. */
const woods = [
  { filter: 'none', from: 0 },
  { filter: 'brightness(1.1) saturate(0.9)', from: 0.3 },
  { filter: 'brightness(0.88) saturate(1.1)', from: 0.55 },
]

/** A plank `length` long: a piece of the painted grain at its own size, with rounded ends and a nail at each. */
function Board({ x, y, length, wood, className }: { x: number; y: number; length: number; wood: number; className?: string }) {
  const w = woods[wood % woods.length]
  const id = `bb-board-${Math.round(x)}-${Math.round(y)}-${Math.round(length)}`
  const texture = THICK * GRAIN
  return (
    <g className={className}>
      <clipPath id={id}>
        <rect x={x} y={y} width={length} height={THICK} rx={4} />
      </clipPath>
      <image href={plankArt} x={x - w.from * (texture - length)} y={y} width={texture} height={THICK} preserveAspectRatio="none" clipPath={`url(#${id})`} style={{ filter: w.filter }} />
      <rect x={x} y={y} width={length} height={THICK} rx={4} fill="none" stroke="#6b4429" strokeOpacity="0.35" strokeWidth="1.2" />
      <circle cx={x + 6} cy={y + THICK / 2} r={1.9} fill="#4d3424" />
      <circle cx={x + length - 6} cy={y + THICK / 2} r={1.9} fill="#4d3424" />
    </g>
  )
}

/** The deck from one end to the other: planks laid end to end, about 56 units each, leaving out the gap. */
function Deck({ from, to, seed }: { from: number; to: number; seed: number }) {
  const n = Math.max(1, Math.round((to - from) / 56))
  const w = (to - from) / n
  return (
    <g>
      {Array.from({ length: n }, (_, i) => (
        <Board key={i} x={from + i * w} y={DECK_Y} length={w} wood={i + seed} />
      ))}
    </g>
  )
}

type ViewId = 'wide' | 'tall'

/** The river valley: the bridge spans the river between two piles of stones, and the planks lie on the near meadow. */
const VIEWS: PaintedView<ViewId>[] = [
  { id: 'wide', painting: valley, world: { w: 1280, h: 800 }, focus: { x: 60, y: 120, w: 1000, h: 680 }, ground: '#b9be27', sayAt: { x: 560, y: 200 } },
  { id: 'tall', painting: valleyTall, world: { w: 720, h: 1440 }, focus: { x: 60, y: 420, w: 600, h: 1000 }, ground: '#c9cb1a', sayAt: { x: 150, y: 520 } },
]

/**
 * Where the scene (400 units wide) lies in each painting, `k` painting units per scene unit: the bridge's origin (so
 * the deck's ends rest on the painted stones), and the meadow box the planks lie in. Both use the same `k`, so the
 * planks and the gap compare truly.
 */
const BOX: Record<ViewId, { k: number; bridge: { x: number; y: number }; meadow: { x: number; top: number; bottom: number } }> = {
  wide: { k: 1.68, bridge: { x: 249, y: 375 - (DECK_Y + THICK) * 1.68 }, meadow: { x: 80, top: 590, bottom: 790 } },
  // The upright painting is extra tall (1:2), so the bridge sits lower on a phone.
  tall: { k: 1.336, bridge: { x: 90, y: 648 - (DECK_Y + THICK) * 1.336 }, meadow: { x: 100, top: 980, bottom: 1400 } },
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
        const { k, bridge, meadow } = BOX[view]
        // The planks share the meadow's height: as roomy as it allows, never further apart than ROW.
        const n = task.planks.length
        const room = (meadow.bottom - meadow.top) / k - THICK - 12
        const row = n > 1 ? Math.min(ROW, room / (n - 1)) : 0
        const height = DECK_Y + THICK + 10
        return (
          <div key={round.id} className="bb-place">
            <svg className="bb-scene" viewBox={`0 0 400 ${height}`} style={{ left: bridge.x, top: bridge.y, width: 400 * k, height: height * k }}>
              <path d={`M${DECK_LEFT} ${DECK_Y - 24} Q200 ${DECK_Y - 12} ${DECK_RIGHT} ${DECK_Y - 24}`} stroke="#7a5234" strokeWidth="2.4" fill="none" />
              {[DECK_LEFT + 4, task.gapAt, end, DECK_RIGHT - 4].map((x) => (
                <rect key={x} x={x - 2.5} y={DECK_Y - 26} width="5" height="28" rx="2" fill="#7a5234" />
              ))}
              <Deck from={DECK_LEFT} to={task.gapAt} seed={0} />
              <Deck from={end} to={DECK_RIGHT} seed={1} />
              {solved && <Board className="bb-drop" x={task.gapAt} y={DECK_Y} length={task.gap} wood={task.planks[task.fits].wood} />}
              {ghost && <Board className={`bb-ghost bb-${tried.how}`} key={tried.n} x={task.gapAt} y={DECK_Y} length={ghost.length} wood={ghost.wood} />}
              <g data-speaker className={`bb-fox${solved ? ' bb-walk' : ''}`}>
                {[
                  [fox, !solved && !blink],
                  [foxBlink, !solved && blink],
                  [foxHappy, solved],
                ].map(([src, on]) => (
                  <image key={src as string} href={src as string} x="-20" y="-68" width="40" height="70" preserveAspectRatio="xMidYMax meet" visibility={on ? 'visible' : 'hidden'} />
                ))}
              </g>
            </svg>
            <svg
              className="bb-scene"
              viewBox={`0 0 400 ${(meadow.bottom - meadow.top) / k}`}
              style={{ left: meadow.x - 30 * k, top: meadow.top, width: 400 * k, height: meadow.bottom - meadow.top }}
            >
              {task.planks.map((p, i) => {
                const y = 6 + i * row
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
                    <rect x={p.x - 8} y={y - 10} width={p.length + 16} height={THICK + 20} fill="transparent" />
                    <ellipse cx={cx} cy={y + THICK + 2} rx={p.length / 2} ry={4} fill="#4a5a1a" opacity="0.28" />
                    <Board x={p.x} y={y} length={p.length} wood={p.wood} />
                  </g>
                )
              })}
            </svg>
          </div>
        )
      }}
    </PaintedScene>
  )
}
