import { useEffect, useRef, useState } from 'react'
import { useGameLoop, useShake, useTimeouts } from '../../kit/hooks'
import { makeRng } from '../../kit/random'
import { PaintedScene, worldStyle, type PaintedView } from '../../kit/painted'
import { useStage } from '../../kit/SceneShell'
import { sound } from '../../kit/sound'
import type { GameProps } from '../../kit/types'
import bearBlink from './art/bear-blink.webp'
import bearHappy from './art/bear-happy.webp'
import bearSad from './art/bear-sad.webp'
import bear from './art/bear.webp'
import beeHappy from './art/bee-happy.webp'
import bee from './art/bee.webp'
import meadowTall from './art/meadow-tall.webp'
import meadow from './art/meadow.webp'
import { makeTurn, pointsFor, positionAt, SHOW_MS } from './logic'

/** Flights to follow in one stage. */
const STAGE = 5

type Phase = 'show' | 'fly' | 'pick' | 'done'

type ViewId = 'wide' | 'tall'
type Face = 'idle' | 'blink' | 'happy' | 'sad'
const BEAR: [Face, string][] = [
  ['idle', bear],
  ['blink', bearBlink],
  ['happy', bearHappy],
  ['sad', bearSad],
]

/** The flower meadow by the pond; the focus is the open air where the bees fly, and the honey bear beside it. */
const VIEWS: PaintedView<ViewId>[] = [
  { id: 'wide', painting: meadow, world: { w: 1280, h: 800 }, focus: { x: 40, y: 90, w: 1000, h: 690 }, play: { x: 360, y: 110, w: 620, h: 620 }, ground: '#8e9d35', sayAt: { x: 60, y: 300 } },
  { id: 'tall', painting: meadowTall, world: { w: 720, h: 1152 }, focus: { x: 0, y: 200, w: 720, h: 930 }, ground: '#859432', sayAt: { x: 40, y: 290 } },
]

/** Where the bees fly (a square of the painting) and where the bear sits. */
const SPOTS: Record<ViewId, { air: { x: number; y: number; size: number }; bear: { x: number; bottom: number; h: number } }> = {
  wide: { air: { x: 360, y: 110, size: 620 }, bear: { x: 190, bottom: 760, h: 300 } },
  tall: { air: { x: 40, y: 300, size: 640 }, bear: { x: 120, bottom: 1120, h: 200 } },
}

/** The bear blinks now and then while it waits. */
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

export default function BusyBees({ level, seed, t, onFinish }: GameProps) {
  const rng = useRef(makeRng(seed)).current
  const [turn, setTurn] = useState(() => makeTurn(rng, level))
  const [index, setIndex] = useState(0)
  const [phase, setPhase] = useState<Phase>('show')
  const [ms, setMs] = useState(0)
  const [found, setFound] = useState<number[]>([])
  const [wrong, setWrong] = useState<number | null>(null)
  const [result, setResult] = useState<'yes' | 'no' | null>(null)
  const stage = useStage(STAGE, onFinish)
  const [ref, shake] = useShake<HTMLDivElement>()
  const later = useTimeouts()
  const flight = (turn.paths[0].length - 1) * turn.legMs

  // Show the bee(s) to follow, then let everyone fly.
  useEffect(() => {
    if (phase !== 'show') return
    later(() => setPhase('fly'), SHOW_MS)
  }, [phase, index, later])

  useGameLoop((dt) => {
    const next = ms + dt * 1000
    if (next >= flight) {
      setMs(flight)
      setPhase('pick')
      sound.tick()
    } else setMs(next)
  }, phase === 'fly')

  const nextTurn = (delay: number) => {
    later(() => {
      setTurn(makeTurn(rng, level))
      setIndex((i) => i + 1)
      setMs(0)
      setFound([])
      setWrong(null)
      setResult(null)
      setPhase('show')
    }, delay)
  }
  const tap = (bee: number) => {
    if (phase !== 'pick' || result || found.includes(bee)) return
    if (turn.targets.includes(bee)) {
      const now = [...found, bee]
      setFound(now)
      if (now.length < turn.targets.length) {
        sound.pop()
        return
      }
      setResult('yes')
      // A happy little buzz.
      sound.tone(220, 0.12, 'sawtooth', 0.04, 0.12)
      if (!stage.good(pointsFor(level, 1))) nextTurn(1100)
      return
    }
    setWrong(bee)
    setResult('no')
    shake()
    if (!stage.miss()) nextTurn(1800)
  }

  const prompt = () => {
    if (result === 'no' && turn.targets.length > 1) return t('noTwo')
    if (result) return t(result)
    if (phase === 'show') return t(turn.targets.length > 1 ? 'watchTwo' : 'watchOne')
    if (phase === 'fly') return t('follow')
    if (found.length > 0) return t('oneMore')
    return t(turn.targets.length > 1 ? 'findTwo' : 'findOne')
  }

  const reveal = phase === 'show' || result === 'no'

  const blink = useBlink(!result)
  const face: Face = result === 'yes' ? 'happy' : result === 'no' ? 'sad' : blink ? 'blink' : 'idle'
  return (
    <PaintedScene views={VIEWS} say={prompt()} stage={stage} className="busy-bees">
      {(view) => {
        const { air, bear: b } = SPOTS[view]
        return (
          <>
            <div className={`bb-bear bb-${result ?? 'idle'}`} style={worldStyle(b.x, b.bottom, b.h)}>
              {BEAR.map(([f, src]) => (
                <img key={f} src={src} alt="" draggable={false} className={f === face ? '' : 'bb-off'} />
              ))}
            </div>
            <div ref={ref} className={`bb-meadow${phase === 'pick' && !result ? ' bb-picking' : ''}`} style={{ left: air.x, top: air.y, width: air.size, height: air.size, ['--bb-bee' as string]: `${air.size * 0.19}px` }}>
              {turn.paths.map((path, i) => {
                const p = positionAt(path, ms, turn.legMs)
                // A little buzzing wobble while flying.
                const wob = phase === 'fly' ? Math.sin(ms / 70 + i * 2) * 0.012 : 0
                const x = (p.x + wob) * 100
                const y = (p.y + Math.cos(ms / 90 + i) * wob) * 100
                const cls = [
                  'bb-bee',
                  reveal && turn.targets.includes(i) ? 'bb-target' : '',
                  found.includes(i) ? 'bb-found' : '',
                  wrong === i ? 'bb-wrong' : '',
                  phase === 'fly' ? 'bb-flying' : '',
                ].join(' ')
                const happy = found.includes(i)
                return (
                  <button
                    key={`${index}-${i}`}
                    className={cls}
                    style={{ left: `${x}%`, top: `${y}%` }}
                    onPointerDown={() => tap(i)}
                    aria-label={`bee ${i + 1}`}
                    disabled={phase === 'done'}
                  >
                    <span className="bb-face" style={{ transform: `scaleX(${p.dir})` }}>
                      <img src={happy ? beeHappy : bee} alt="" draggable={false} className="bb-bee-art" />
                    </span>
                  </button>
                )
              })}
            </div>
          </>
        )
      }}
    </PaintedScene>
  )
}
