import { useRef, useState, type CSSProperties } from 'react'
import { useSize, useTimeouts } from '../../kit/hooks'
import { makeRng } from '../../kit/random'
import { SceneShell, useStage } from '../../kit/SceneShell'
import type { GameProps } from '../../kit/types'
import { makeDealer, picKey, STAGE, type Pic, type Task } from './logic'
import { Lily, PadArt, PicArt, PondArt } from './Pond'

const GAP = 14
const greens = [
  { light: '#7cc552', dark: '#5a9e3a' },
  { light: '#8fcf5e', dark: '#62ab3e' },
]

/** The biggest two pads that fit the room: side by side when it is wide, one above the other when it is tall. */
function padLayout(w: number, h: number) {
  const row = Math.min((w - GAP * 3) / 2, h - GAP * 2)
  const col = Math.min(w - GAP * 2, (h - GAP * 3) / 2)
  return { side: row >= col, size: Math.max(140, Math.min(420, Math.max(row, col))) }
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
  const [ref, box] = useSize<HTMLDivElement>()
  const { side, size } = padLayout(box.w, box.h)
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
  return (
    <SceneShell place="lake" say={say} stage={stage} bare fill className="lily-pads">
      <div className={`lp-pond${side ? ' lp-side' : ''}`} ref={ref}>
        <PondArt />
        <Lily />
        {task.pads.map((pad, p) => (
          <div className="lp-pad" key={`${round.id}-${p}`} style={{ width: size, height: size, animationDelay: `${p * 90}ms` }}>
            <PadArt notch={pad.notch} {...greens[p]} />
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
        ))}
      </div>
    </SceneShell>
  )
}
