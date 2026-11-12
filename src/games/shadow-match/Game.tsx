import { useRef, useState } from 'react'
import { useTimeouts } from '../../kit/hooks'
import { makeRng } from '../../kit/random'
import { SceneShell, useStage } from '../../kit/SceneShell'
import type { GameProps } from '../../kit/types'
import { makeDealer, shapeKey, STAGE, turnCss, type Shape, type Task } from './logic'
import { ShapeArt, TheatreArt } from './Theatre'

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
  return (
    <SceneShell place="woods" say={say} stage={stage} bare fill className="shadow-match">
      <div className="sm-room">
        <div className="sm-theatre">
          <TheatreArt />
          <div className={`sm-shadow${solved ? ' sm-solved' : ''}`} key={round.id} style={{ transform: `translate(-50%, -50%) ${turnCss(task.turn)}` }}>
            <span className="sm-dark">
              <ShapeArt shape={task.target} />
            </span>
            {solved && (
              <span className="sm-real">
                <ShapeArt shape={task.target} />
              </span>
            )}
          </div>
        </div>
        <div className="sm-shelf" key={`s${round.id}`}>
          {task.choices.map((s, i) => {
            const k = shapeKey(s)
            const cls = solved && s === task.target ? ' sm-hop' : wrong === k ? ' sm-no' : solved ? ' sm-fade' : ''
            return (
              <button
                key={k}
                className={`sm-choice${cls}`}
                style={{ animationDelay: solved || wrong === k ? undefined : `${i * 70}ms` }}
                onPointerDown={() => pick(s)}
                onAnimationEnd={() => wrong === k && setWrong(null)}
                disabled={stage.over}
                aria-label={t(`shape.${s.id}`)}
              >
                <ShapeArt shape={s} />
              </button>
            )
          })}
        </div>
      </div>
    </SceneShell>
  )
}
