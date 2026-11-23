import { useEffect, useRef, useState } from 'react'
import { useShake, useTimeouts } from '../../kit/hooks'
import { PaintedScene, worldStyle, type PaintedView } from '../../kit/painted'
import { makeRng } from '../../kit/random'
import { useStage } from '../../kit/SceneShell'
import { Emoji } from '../../kit/stickers'
import type { GameProps } from '../../kit/types'
import magpieBlink from './art/magpie-blink.webp'
import magpieHappy from './art/magpie-happy.webp'
import magpieSad from './art/magpie-sad.webp'
import magpie from './art/magpie.webp'
import deskTall from './art/desk-tall.webp'
import desk from './art/desk.webp'
import { STAGE, makeBoard } from './logic'

type Face = 'idle' | 'blink' | 'happy' | 'sad'
const MAGPIE: [Face, string][] = [
  ['idle', magpie],
  ['blink', magpieBlink],
  ['happy', magpieHappy],
  ['sad', magpieSad],
]

/** The magpie blinks now and then while it waits. */
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

/** The detective's attic; the cards lie on the big table. */
const VIEWS: PaintedView<ViewId>[] = [
  { id: 'wide', painting: desk, world: { w: 1280, h: 800 }, focus: { x: 120, y: 40, w: 1100, h: 760 }, ground: '#873314', sayAt: { x: 950, y: 200 } },
  { id: 'tall', painting: deskTall, world: { w: 720, h: 1152 }, focus: { x: 0, y: 180, w: 720, h: 960 }, ground: '#783219', sayAt: { x: 360, y: 250 } },
]

/** The square of table the cards lie on, and the magpie. */
const SPOTS: Record<ViewId, { grid: { x: number; y: number; size: number }; magpie: { x: number; bottom: number; h: number } }> = {
  wide: { grid: { x: 380, y: 210, size: 540 }, magpie: { x: 1100, bottom: 760, h: 300 } },
  tall: { grid: { x: 40, y: 420, size: 640 }, magpie: { x: 590, bottom: 400, h: 220 } },
}

export default function OddOne({ level, seed, t, onFinish }: GameProps) {
  const rng = useRef(makeRng(seed)).current
  const [board, setBoard] = useState(() => makeBoard(rng, level, 0))
  /** Counts the boards, so only a new board pops in (the last one stays put when the stage ends). */
  const [boardId, setBoardId] = useState(0)
  const stage = useStage(STAGE, onFinish)
  const [ref, shake] = useShake<HTMLDivElement>()
  const later = useTimeouts()
  const blink = useBlink()
  const [mood, setMood] = useState<'happy' | 'sad' | null>(null)
  const feel = (m: 'happy' | 'sad') => {
    setMood(m)
    later(() => setMood((now) => (now === m ? null : now)), 700)
  }

  const tap = (i: number) => {
    if (stage.over) return
    if (i !== board.oddIndex) {
      stage.slip()
      feel('sad')
      shake()
      return
    }
    feel('happy')
    if (stage.good(10 + board.size)) return
    setBoard(makeBoard(rng, level, stage.done + 1))
    setBoardId((n) => n + 1)
  }

  const face: Face = mood ?? (blink ? 'blink' : 'idle')
  return (
    <PaintedScene views={VIEWS} say={t('find')} stage={stage} className="odd-one">
      {(view) => {
        const at = SPOTS[view]
        return (
          <>
            <div className={`oo-char${mood === 'happy' ? ' oo-cheer' : ''}`} style={worldStyle(at.magpie.x, at.magpie.bottom, at.magpie.h)}>
              {MAGPIE.map(([f, src]) => (
                <img key={f} src={src} alt="" draggable={false} className={f === face ? '' : 'oo-off'} />
              ))}
            </div>
            <div
              className="oo-grid"
              ref={ref}
              key={boardId}
              style={{ left: at.grid.x, top: at.grid.y, width: at.grid.size, height: at.grid.size, gridTemplateColumns: `repeat(${board.size}, 1fr)`, fontSize: (at.grid.size / board.size) * 0.62 }}
            >
              {Array.from({ length: board.size * board.size }, (_, i) => (
                <button key={i} className="oo-cell" onPointerDown={() => tap(i)}>
                  <Emoji e={i === board.oddIndex ? board.odd : board.common} />
                </button>
              ))}
            </div>
          </>
        )
      }}
    </PaintedScene>
  )
}
