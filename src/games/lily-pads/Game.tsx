import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { useTimeouts } from '../../kit/hooks'
import { PaintedScene, worldStyle, type PaintedView } from '../../kit/painted'
import { makeRng } from '../../kit/random'
import { useStage } from '../../kit/SceneShell'
import type { GameProps } from '../../kit/types'
import frogBlink from './art/frog-blink.webp'
import frogHappy from './art/frog-happy.webp'
import frogSad from './art/frog-sad.webp'
import frog from './art/frog.webp'
import pondTall from './art/pond-tall.webp'
import pond from './art/pond.webp'
import { makeDealer, picKey, STAGE, type Pic, type Task } from './logic'
import { PadArt, PicArt } from './Pond'

type ViewId = 'wide' | 'tall'
type Face = 'idle' | 'blink' | 'happy' | 'sad'
const FROG: [Face, string][] = [
  ['idle', frog],
  ['blink', frogBlink],
  ['happy', frogHappy],
  ['sad', frogSad],
]

/** The pond; the two pads float in the middle, side by side when wide and one above the other when upright. */
const VIEWS: PaintedView<ViewId>[] = [
  { id: 'wide', painting: pond, world: { w: 1280, h: 800 }, focus: { x: 40, y: 90, w: 1200, h: 700 }, play: { x: 205, y: 235, w: 880, h: 430 }, ground: '#37b8a8', sayAt: { x: 640, y: 130 } },
  { id: 'tall', painting: pondTall, world: { w: 720, h: 1152 }, focus: { x: 0, y: 150, w: 720, h: 980 }, ground: '#2fac9c', sayAt: { x: 360, y: 200 } },
]

/** Each pad's middle and size, and where the frog sits on its stone. */
const SPOTS: Record<ViewId, { pads: [number, number][]; size: number; frog: { x: number; bottom: number; h: number } }> = {
  wide: { pads: [[420, 450], [870, 450]], size: 430, frog: { x: 100, bottom: 745, h: 170 } },
  tall: { pads: [[380, 420], [380, 830]], size: 400, frog: { x: 95, bottom: 1085, h: 150 } },
}

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

export default function LilyPads({ level, seed, t, onFinish }: GameProps) {
  const rng = useRef(makeRng(seed)).current
  const deal = useRef(makeDealer(rng, level)).current
  const nextId = useRef(0)
  const newRound = () => ({ id: nextId.current++, task: deal() as Task })
  const [round, setRound] = useState(newRound)
  const [solved, setSolved] = useState(false)
  const [wrong, setWrong] = useState<string | null>(null)
  const stage = useStage(STAGE, onFinish)
  const later = useTimeouts()
  const blink = useBlink()
  const { task } = round
  const sharedKey = picKey(task.shared)

  const pick = (p: Pic, where: string) => {
    if (stage.over || solved) return
    if (p !== task.shared) {
      stage.slip()
      setWrong(where)
      return
    }
    setSolved(true)
    setWrong(null)
    if (stage.good()) return
    later(() => {
      setSolved(false)
      setRound(newRound())
    }, 1400)
  }

  const say = solved ? t('yes') : wrong ? t('no') : t('say')
  const face: Face = solved ? 'happy' : wrong ? 'sad' : blink ? 'blink' : 'idle'
  return (
    <PaintedScene views={VIEWS} say={say} stage={stage} className="lily-pads">
      {(view) => {
        const at = SPOTS[view]
        return (
          <>
            <div className={`lp-frog${solved ? ' lp-frog-hop' : ''}`} style={worldStyle(at.frog.x, at.frog.bottom, at.frog.h)}>
              {FROG.map(([f, src]) => (
                <img key={f} src={src} alt="" draggable={false} className={f === face ? '' : 'lp-off'} />
              ))}
            </div>
            {task.pads.map((pad, p) => {
              const [x, y] = at.pads[p]
              return (
                <div className="lp-pad" key={`${round.id}-${p}`} style={{ left: x - at.size / 2, top: y - at.size / 2, width: at.size, height: at.size, animationDelay: `${p * 90}ms` }}>
                  <PadArt notch={pad.notch} light={p === 1} />
                  {pad.items.map((item) => {
                    const k = picKey(item.pic)
                    const where = `${p}:${k}`
                    const isShared = k === sharedKey
                    const cls = solved ? (isShared ? ' lp-hop' : ' lp-fade') : wrong === where ? ' lp-no' : ''
                    const spot: CSSProperties = {
                      left: `${50 + item.x * 46}%`,
                      top: `${50 + item.y * 46}%`,
                      width: `${item.size * 46}%`,
                      transform: `translate(-50%, -50%) rotate(${item.rotate}deg)`,
                    }
                    return (
                      <span className="lp-spot" style={spot} key={k}>
                        <button
                          className={`lp-pic${cls}`}
                          onPointerDown={() => pick(item.pic, where)}
                          onAnimationEnd={() => wrong === where && setWrong(null)}
                          disabled={stage.over}
                          aria-label={t(`pic.${item.pic.id}`)}
                        >
                          <PicArt pic={item.pic} />
                        </button>
                      </span>
                    )
                  })}
                </div>
              )
            })}
          </>
        )
      }}
    </PaintedScene>
  )
}
