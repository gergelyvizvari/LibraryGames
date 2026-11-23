import { useEffect, useRef, useState } from 'react'
import { useShake, useTimeouts } from '../../kit/hooks'
import { clamp, makeRng } from '../../kit/random'
import { PaintedScene, worldStyle, type PaintedView } from '../../kit/painted'
import { useStage } from '../../kit/SceneShell'
import { sound } from '../../kit/sound'
import type { GameProps } from '../../kit/types'
import frogBlink from './art/frog-blink.webp'
import frogHappy from './art/frog-happy.webp'
import frogSad from './art/frog-sad.webp'
import frog from './art/frog.webp'
import bellBlue from './art/bell-blue.webp'
import bellGreen from './art/bell-green.webp'
import bellRed from './art/bell-red.webp'
import bellYellow from './art/bell-yellow.webp'
import pondTall from './art/pond-tall.webp'
import pond from './art/pond.webp'

const pads = [
  { bell: bellRed, note: 523 },
  { bell: bellBlue, note: 659 },
  { bell: bellGreen, note: 784 },
  { bell: bellYellow, note: 1047 },
]
/** Tunes to echo in one stage; each is one note longer. */
const STAGE = 4
/** Gap after the last tapped note before the success chime. */
const CHEER_GAP_MS = 120

type Face = 'idle' | 'blink' | 'happy' | 'sad'
const FROG: [Face, string][] = [
  ['idle', frog],
  ['blink', frogBlink],
  ['happy', frogHappy],
  ['sad', frogSad],
]

/** The frog blinks now and then while it waits. */
function useBlink() {
  const [shut, setShut] = useState(false)
  useEffect(() => {
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
    return () => clearTimeout(timer)
  }, [])
  return shut
}

type ViewId = 'wide' | 'tall'

/** Evening at the pond; the four bell flowers hang from the branch arch, the frog conducts. */
const VIEWS: PaintedView<ViewId>[] = [
  { id: 'wide', painting: pond, world: { w: 1280, h: 800 }, focus: { x: 40, y: 100, w: 1200, h: 700 }, ground: '#a79a2e', sayAt: { x: 680, y: 160 } },
  { id: 'tall', painting: pondTall, world: { w: 720, h: 1152 }, focus: { x: 0, y: 180, w: 720, h: 960 }, ground: '#9a9647', sayAt: { x: 360, y: 225 } },
]

/** Where each bell hangs from the arch (its string's top and its middle), the bell's height, and the frog. */
const SPOTS: Record<ViewId, { bells: [number, number][]; h: number; frog: { x: number; bottom: number; h: number } }> = {
  wide: { bells: [[420, 330], [575, 262], [785, 262], [940, 330]], h: 190, frog: { x: 160, bottom: 770, h: 260 } },
  tall: { bells: [[115, 330], [275, 262], [445, 262], [605, 335]], h: 145, frog: { x: 590, bottom: 1130, h: 230 } },
}

export function stepMs(level: number) {
  return clamp(700 - level * 45, 260, 700)
}

export default function SequenceEcho({ level, seed, t, onFinish }: GameProps) {
  const rng = useRef(makeRng(seed)).current
  const [sequence, setSequence] = useState(() => [rng.int(0, 3), rng.int(0, 3)])
  const [mode, setMode] = useState<'show' | 'input' | 'done'>('show')
  const [lit, setLit] = useState<number | null>(null)
  const [pos, setPos] = useState(0)
  const stage = useStage(STAGE, onFinish)
  const [boardRef, shake] = useShake<HTMLDivElement>()
  const later = useTimeouts()
  const blink = useBlink()
  const [mood, setMood] = useState<'happy' | 'sad' | null>(null)
  const ms = stepMs(level)
  // Taps play the same note length as the demo, so both sound alike.
  const noteMs = ms * 0.7

  const flash = (i: number, duration: number) => {
    setLit(i)
    sound.tone(pads[i].note, duration / 1000, 'triangle', 0.22)
    later(() => setLit((cur) => (cur === i ? null : cur)), duration)
  }

  // Play the sequence back whenever we enter "show".
  useEffect(() => {
    if (mode !== 'show') return
    sequence.forEach((p, i) => later(() => flash(p, noteMs), 600 + i * ms))
    later(() => {
      setPos(0)
      setMode('input')
    }, 600 + sequence.length * ms)
  }, [mode, sequence])

  const press = (i: number) => {
    if (mode !== 'input') return
    flash(i, noteMs)
    if (i !== sequence[pos]) {
      stage.slip()
      setMood('sad')
      later(() => setMood(null), 900)
      shake()
      setMode('done')
      later(() => setMode('show'), 900)
      return
    }
    if (pos + 1 < sequence.length) {
      setPos(pos + 1)
      return
    }
    // Completed the whole sequence.
    setMode('done')
    setMood('happy')
    later(() => setMood(null), 1100)
    later(() => {
      if (stage.good(sequence.length * 10)) return
      later(() => {
        setSequence((s) => [...s, rng.int(0, 3)])
        setMode('show')
      }, 600)
    }, noteMs + CHEER_GAP_MS)
  }

  const face: Face = mood ?? (blink ? 'blink' : 'idle')
  return (
    <PaintedScene views={VIEWS} say={mode === 'input' ? t('yourTurn') : t('watch')} stage={stage} className="sequence-echo">
      {(view) => {
        const at = SPOTS[view]
        return (
          <>
            <div data-speaker className={`se-char${mood === 'happy' ? ' se-cheer' : ''}`} style={worldStyle(at.frog.x, at.frog.bottom, at.frog.h)}>
              {FROG.map(([f, src]) => (
                <img key={f} src={src} alt="" draggable={false} className={f === face ? '' : 'se-off'} />
              ))}
            </div>
            <div className="se-board" ref={boardRef}>
              {pads.map((p, i) => {
                const [x, top] = at.bells[i]
                return (
                  <button
                    key={i}
                    className={`se-pad${lit === i ? ' se-lit' : ''}`}
                    style={{ left: x - at.h * 0.55, top, width: at.h * 1.1, height: at.h + 40 }}
                    onPointerDown={() => press(i)}
                    aria-label={`pad ${i + 1}`}
                    disabled={mode !== 'input'}
                  >
                    <span className="se-string" />
                    <img src={p.bell} alt="" draggable={false} />
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
