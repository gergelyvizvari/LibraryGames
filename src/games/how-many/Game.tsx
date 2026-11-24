import { useEffect, useRef, useState } from 'react'
import { useTimeouts } from '../../kit/hooks'
import { makeRng } from '../../kit/random'
import { PaintedScene, worldStyle, type PaintedView } from '../../kit/painted'
import { useStage } from '../../kit/SceneShell'
import { sound } from '../../kit/sound'
import { Thing, type ThingId } from '../../kit/things'
import type { GameProps } from '../../kit/types'
import badgerBlink from './art/badger-blink.webp'
import badgerHappy from './art/badger-happy.webp'
import badgerSad from './art/badger-sad.webp'
import badger from './art/badger.webp'
import roomTall from './art/room-tall.webp'
import room from './art/room.webp'
import { countRange, flashMs, makeDots, options, pointsFor } from './logic'

type Face = 'idle' | 'blink' | 'happy' | 'sad'
const BADGER: [Face, string][] = [
  ['idle', badger],
  ['blink', badgerBlink],
  ['happy', badgerHappy],
  ['sad', badgerSad],
]

/** The badger blinks now and then while it waits. */
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

/** The woodland schoolroom; the things flash on its painted chalkboard. */
const VIEWS: PaintedView<ViewId>[] = [
  { id: 'wide', painting: room, world: { w: 1280, h: 800 }, focus: { x: 300, y: 0, w: 960, h: 800 }, play: { x: 410, y: 106, w: 476, h: 400 }, ground: '#d67e35', sayAt: { x: 1000, y: 330 } },
  { id: 'tall', painting: roomTall, world: { w: 720, h: 1152 }, focus: { x: 0, y: 180, w: 720, h: 940 }, ground: '#d97d36', sayAt: { x: 360, y: 250 } },
]

/** The chalkboard's green (where the things show) and the badger. */
const SPOTS: Record<ViewId, { board: { x: number; y: number; w: number; h: number }; badger: { x: number; bottom: number; h: number } }> = {
  wide: { board: { x: 410, y: 106, w: 476, h: 400 }, badger: { x: 1120, bottom: 790, h: 300 } },
  tall: { board: { x: 134, y: 286, w: 452, h: 380 }, badger: { x: 590, bottom: 1110, h: 270 } },
}

/** Looks in one stage. */
const STAGE = 6
// Something different to count every round.
const things: ThingId[] = ['apple', 'fish', 'star', 'ladybird', 'balloon', 'mushroom', 'flower', 'cookie', 'acorn', 'berries', 'heart', 'leaf', 'snowball', 'pine']

export default function HowMany({ level, seed, t, onFinish }: GameProps) {
  const rng = useRef(makeRng(seed)).current
  const makeRound = () => {
    const n = rng.int(...countRange(level))
    return { n, dots: makeDots(rng, n), options: options(rng, n), thing: rng.pick(things) }
  }
  const [round, setRound] = useState(makeRound)
  const [index, setIndex] = useState(0)
  const [phase, setPhase] = useState<'show' | 'guess' | 'result'>('show')
  const [message, setMessage] = useState('')
  const stage = useStage(STAGE, onFinish)
  const later = useTimeouts()
  const blink = useBlink()
  const [result, setResult] = useState<'happy' | 'sad' | null>(null)

  useEffect(() => {
    if (phase !== 'show') return
    sound.pop()
    later(() => setPhase('guess'), flashMs(level))
  }, [phase, index, level, later])

  const guess = (g: number) => {
    if (phase !== 'guess') return
    const pts = pointsFor(g, round.n)
    setMessage(pts === 20 ? t('exact') : pts > 0 ? t('close', { n: round.n }) : t('itWas', { n: round.n }))
    setPhase('result')
    setResult(pts === 20 ? 'happy' : 'sad')
    if (pts < 20) sound.tone(pts > 0 ? 500 : 220, 0.12, 'triangle')
    if (pts === 20 ? stage.good(pts) : stage.miss()) return
    later(() => {
      setRound(makeRound())
      setIndex(index + 1)
      setPhase('show')
      setResult(null)
    }, 1300)
  }

  const face: Face = result ?? (blink ? 'blink' : 'idle')
  return (
    <PaintedScene
      views={VIEWS}
      say={phase === 'show' ? t('look') : phase === 'guess' ? t('howMany') : message}
      stage={stage}
      className="how-many"
      trayHeight={100}
      tray={
        <div className="hm-options">
          {round.options.map((o) => (
            <button key={`${index}-${o}`} className="choice-btn" disabled={phase !== 'guess'} onClick={() => guess(o)}>
              {o}
            </button>
          ))}
        </div>
      }
    >
      {(view) => {
        const at = SPOTS[view]
        return (
          <>
            <div className={`hm-char${result === 'happy' ? ' hm-cheer' : ''}`} style={worldStyle(at.badger.x, at.badger.bottom, at.badger.h)}>
              {BADGER.map(([f, src]) => (
                <img key={f} src={src} alt="" draggable={false} className={f === face ? '' : 'hm-off'} />
              ))}
            </div>
            <div className="hm-board" style={{ left: at.board.x, top: at.board.y, width: at.board.w, height: at.board.h }}>
              {/* After the answer the things come back faint, with how many there were on top: an answer, not a new question. */}
              {(phase === 'show' || phase === 'result') &&
                round.dots.map((d, i) => (
                  <span key={`${index}-${i}`} className={`hm-dot${phase === 'result' ? ' hm-faint' : ''}`} style={{ left: `${d.x}%`, top: `${d.y}%` }}>
                    <Thing id={round.thing} />
                  </span>
                ))}
              {phase === 'guess' && <span className="hm-question">?</span>}
              {phase === 'result' && <span className={`hm-answer${result === 'happy' ? ' hm-right' : ''}`}>{round.n}</span>}
            </div>
          </>
        )
      }}
    </PaintedScene>
  )
}
