import { useRef, useState } from 'react'
import { Critter } from '../../kit/critters'
import { useSize, useTimeouts } from '../../kit/hooks'
import { makeRng } from '../../kit/random'
import { SceneShell, useStage } from '../../kit/SceneShell'
import { sound } from '../../kit/sound'
import type { GameProps } from '../../kit/types'
import { DECK_LEFT, DECK_RIGHT, fit, makeTask, STAGE, type Task } from './logic'

/** The deck's top edge and the grass where the planks lie, in scene units. */
const DECK_Y = 120
const GRASS_Y = 232
// Roomy rows and thick planks, so the grass fills the scene on a phone and every plank is easy to see and tap.
const ROW = 70
/** How thick a plank is. */
const THICK = 26

const woods = [
  { board: '#c98d5a', grain: '#b07444' },
  { board: '#d9a25f', grain: '#c08a4a' },
  { board: '#b9845a', grain: '#9c6a42' },
]

function Board({ x, y, length, wood, className }: { x: number; y: number; length: number; wood: number; className?: string }) {
  const w = woods[wood % woods.length]
  return (
    <g className={className}>
      <rect x={x} y={y} width={length} height={THICK} rx={5} fill={w.board} />
      <path d={`M${x + 10} ${y + THICK * 0.35} h${length * 0.38} M${x + length * 0.5} ${y + THICK * 0.65} h${length * 0.38}`} stroke={w.grain} strokeWidth={2} strokeLinecap="round" />
      <circle cx={x + 6} cy={y + THICK / 2} r={2.4} fill="#6b4a32" />
      <circle cx={x + length - 6} cy={y + THICK / 2} r={2.4} fill="#6b4a32" />
    </g>
  )
}

/** The deck from one end to the other, with boards every 20 units, leaving out the gap. */
function Deck({ from, to }: { from: number; to: number }) {
  const lines = []
  for (let x = from + 20; x < to - 4; x += 20) lines.push(x)
  return (
    <g>
      <rect x={from} y={DECK_Y} width={to - from} height={THICK} fill="#a8703f" />
      {lines.map((x) => (
        <rect key={x} x={x} y={DECK_Y} width={2} height={THICK} fill="#8b5e3c" />
      ))}
    </g>
  )
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
  // The scene grows down to fill a tall phone screen, and the planks spread over the extra grass.
  const [field, size] = useSize<HTMLDivElement>()
  const least = GRASS_Y + task.planks.length * ROW + 16
  const height = Math.round(Math.max(least, Math.min((400 * size.h) / size.w, least * 1.5)))
  const row = task.planks.length > 1 ? (height - GRASS_Y - 22 - THICK - 24) / (task.planks.length - 1) : ROW

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
    <SceneShell place="woods" say={say} stage={stage} bare fill className="bridge-builder">
      <div className="bb-field" ref={field}>
        <svg className="bb-scene" viewBox={`0 0 400 ${height}`} preserveAspectRatio="xMidYMid meet" key={round.id}>
          <rect width="400" height={GRASS_Y} fill="#cfeaf7" />
          <ellipse cx="90" cy="40" rx="40" ry="11" fill="#fff" opacity="0.85" />
          <ellipse cx="300" cy="26" rx="30" ry="9" fill="#fff" opacity="0.85" />
          {[110, 150, 250, 290].map((x, i) => (
            <path key={x} d={`M${x} ${150 - (i % 2) * 18} l22 60 h-44Z`} fill="#4f9f47" />
          ))}
          <path d={`M60 ${DECK_Y + THICK} L120 ${GRASS_Y} H280 L340 ${DECK_Y + THICK}Z`} fill="#7cb85a" />
          <path d={`M110 ${GRASS_Y - 14} Q200 ${GRASS_Y - 26} 290 ${GRASS_Y - 14} V${GRASS_Y} H110Z`} fill="#6fb6e3" />
          <path d={`M0 ${DECK_Y + 4} H62 L84 ${GRASS_Y} H0Z`} fill="#a8784f" />
          <path d={`M400 ${DECK_Y + 4} H338 L316 ${GRASS_Y} H400Z`} fill="#a8784f" />
          <rect x="0" y={DECK_Y - 4} width="64" height="10" rx="4" fill="#7cc552" />
          <rect x="336" y={DECK_Y - 4} width="64" height="10" rx="4" fill="#7cc552" />
          <path d={`M${DECK_LEFT} ${DECK_Y - 26} Q200 ${DECK_Y - 14} ${DECK_RIGHT} ${DECK_Y - 26}`} stroke="#8b5e3c" strokeWidth="3" fill="none" />
          {[DECK_LEFT, task.gapAt, end, DECK_RIGHT].map((x) => (
            <rect key={x} x={x - 3} y={DECK_Y - 28} width="6" height="30" rx="2" fill="#8b5e3c" />
          ))}
          <Deck from={DECK_LEFT} to={task.gapAt} />
          <Deck from={end} to={DECK_RIGHT} />
          {solved && <Board className="bb-drop" x={task.gapAt} y={DECK_Y} length={task.gap} wood={task.planks[task.fits].wood} />}
          {ghost && <Board className={`bb-ghost bb-${tried.how}`} key={tried.n} x={task.gapAt} y={DECK_Y} length={ghost.length} wood={ghost.wood} />}
          <g className={`bb-fox${solved ? ' bb-walk' : ''}`}>
            <g transform="scale(0.9)">
              <Critter kind="fox" body mood={solved ? 'happy' : 'idle'} />
            </g>
          </g>
          <rect y={GRASS_Y} width="400" height={height - GRASS_Y} fill="#9fd47a" />
          {task.planks.map((p, i) => {
            const y = GRASS_Y + 22 + i * row
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
                <Board x={p.x} y={y} length={p.length} wood={p.wood} />
              </g>
            )
          })}
        </svg>
      </div>
    </SceneShell>
  )
}
