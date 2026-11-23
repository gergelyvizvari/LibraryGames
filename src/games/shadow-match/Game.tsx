import { useEffect, useRef, useState } from 'react'
import { useTimeouts } from '../../kit/hooks'
import { PaintedScene, worldStyle, type PaintedView } from '../../kit/painted'
import { makeRng } from '../../kit/random'
import { useStage } from '../../kit/SceneShell'
import type { GameProps } from '../../kit/types'
import raccoonBlink from './art/raccoon-blink.webp'
import raccoonHappy from './art/raccoon-happy.webp'
import raccoonSad from './art/raccoon-sad.webp'
import raccoon from './art/raccoon.webp'
import theatreTall from './art/theatre-tall.webp'
import theatre from './art/theatre.webp'
import { makeDealer, shapeKey, STAGE, turnCss, type Shape, type Task } from './logic'
import { ShapeArt } from './Theatre'

type ViewId = 'wide' | 'tall'
type Face = 'idle' | 'blink' | 'happy' | 'sad'
const RACCOON: [Face, string][] = [
  ['idle', raccoon],
  ['blink', raccoonBlink],
  ['happy', raccoonHappy],
  ['sad', raccoonSad],
]

/** The shadow theatre in the cabin: the lit screen up top, the things on the shelf below it. */
const VIEWS: PaintedView<ViewId>[] = [
  { id: 'wide', painting: theatre, world: { w: 1280, h: 800 }, focus: { x: 120, y: 40, w: 1160, h: 720 }, ground: '#8b3610', sayAt: { x: 640, y: 175 } },
  { id: 'tall', painting: theatreTall, world: { w: 720, h: 1152 }, focus: { x: 0, y: 120, w: 720, h: 1000 }, ground: '#be5b1e', sayAt: { x: 360, y: 255 } },
]

/** The shadow's middle and size on the screen, the shelf the things stand on, and the raccoon. */
const SPOTS: Record<ViewId, { shadow: { x: number; y: number; size: number }; shelf: { left: number; right: number; bottom: number; size: number }; raccoon: { x: number; bottom: number; h: number } }> = {
  wide: { shadow: { x: 640, y: 410, size: 300 }, shelf: { left: 230, right: 1050, bottom: 700, size: 160 }, raccoon: { x: 1222, bottom: 640, h: 150 } },
  tall: { shadow: { x: 360, y: 470, size: 330 }, shelf: { left: 40, right: 680, bottom: 775, size: 150 }, raccoon: { x: 130, bottom: 1110, h: 200 } },
}

/** The raccoon blinks now and then while it waits. */
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

export default function ShadowMatch({ level, seed, t, onFinish }: GameProps) {
  const rng = useRef(makeRng(seed)).current
  const deal = useRef(makeDealer(rng, level)).current
  const nextId = useRef(0)
  const newRound = () => ({ id: nextId.current++, task: deal() as Task })
  const [round, setRound] = useState(newRound)
  const [solved, setSolved] = useState(false)
  const [wrong, setWrong] = useState<string | null>(null)
  const stage = useStage(STAGE, onFinish)
  const later = useTimeouts()
  const { task } = round
  const turned = task.turn.rotate !== 0 || task.turn.flip
  const blink = useBlink()

  const pick = (s: Shape) => {
    if (stage.over || solved) return
    if (s !== task.target) {
      stage.slip()
      setWrong(shapeKey(s))
      return
    }
    setSolved(true)
    setWrong(null)
    if (stage.good()) return
    later(() => {
      setSolved(false)
      setRound(newRound())
    }, 1300)
  }

  const say = solved ? t('yes') : wrong ? t('no') : turned ? t('turned') : t('say')
  const face: Face = solved ? 'happy' : wrong ? 'sad' : blink ? 'blink' : 'idle'
  return (
    <PaintedScene views={VIEWS} say={say} stage={stage} className="shadow-match">
      {(view) => {
        const at = SPOTS[view]
        const n = task.choices.length
        const step = (at.shelf.right - at.shelf.left) / n
        const size = Math.min(at.shelf.size, step * 0.92)
        return (
          <>
            <div data-speaker className={`sm-raccoon${solved ? ' sm-cheer' : ''}`} style={worldStyle(at.raccoon.x, at.raccoon.bottom, at.raccoon.h)}>
              {RACCOON.map(([f, src]) => (
                <img key={f} src={src} alt="" draggable={false} className={f === face ? '' : 'sm-off'} />
              ))}
            </div>
            <div
              className={`sm-shadow${solved ? ' sm-solved' : ''}`}
              key={round.id}
              style={{ left: at.shadow.x, top: at.shadow.y, width: at.shadow.size, transform: `translate(-50%, -50%) ${turnCss(task.turn)}` }}
            >
              <span className="sm-dark">
                <ShapeArt shape={task.target} />
              </span>
              {solved && (
                <span className="sm-real">
                  <ShapeArt shape={task.target} />
                </span>
              )}
            </div>
            {task.choices.map((s, i) => {
              const k = shapeKey(s)
              const cls = solved && s === task.target ? ' sm-hop' : wrong === k ? ' sm-no' : solved ? ' sm-fade' : ''
              return (
                <button
                  key={`${round.id}-${k}`}
                  className={`sm-choice${cls}`}
                  style={{ ...worldStyle(at.shelf.left + step * (i + 0.5), at.shelf.bottom, size), width: size, animationDelay: solved || wrong === k ? undefined : `${i * 70}ms` }}
                  onPointerDown={() => pick(s)}
                  onAnimationEnd={() => wrong === k && setWrong(null)}
                  disabled={stage.over}
                  aria-label={t(`shape.${s.id}`)}
                >
                  <ShapeArt shape={s} />
                </button>
              )
            })}
          </>
        )
      }}
    </PaintedScene>
  )
}
