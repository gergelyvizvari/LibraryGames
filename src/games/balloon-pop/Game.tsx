import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { useLatest, useTimeouts } from '../../kit/hooks'
import { makeRng } from '../../kit/random'
import { SceneShell, useStage } from '../../kit/SceneShell'
import { sound } from '../../kit/sound'
import type { GameProps } from '../../kit/types'
import { BalloonArt, LakeArt } from './Art'
import { dealBoard, nextNumber, specFor, STAGE, type Balloon } from './logic'

export default function BalloonPop({ level, seed, t, onFinish }: GameProps) {
  const rng = useRef(makeRng(seed)).current
  const spec = specFor(level)
  const nextId = useRef(0)
  const newRound = () => ({ id: nextId.current++, board: dealBoard(rng, level) })
  const [round, setRound] = useState(newRound)
  /** The numbers popped so far, in order. */
  const [popped, setPopped] = useState<number[]>([])
  const [hidden, setHidden] = useState(false)
  const [peek, setPeek] = useState<number | null>(null)
  const stage = useStage(STAGE, onFinish)
  const later = useTimeouts()
  const { board } = round
  const roundRef = useLatest(round)
  const done = popped.length === board.length

  // From level 3 the numbers hide by themselves after a little while; before that they stay until the first pop.
  useEffect(() => {
    if (spec.show === null) return
    const id = round.id
    later(() => roundRef.current.id === id && setHidden(true), spec.show * 1000)
  }, [round.id, spec.show, later, roundRef])

  const tap = (b: Balloon) => {
    if (stage.over || done || popped.includes(b.n)) return
    setHidden(true)
    if (b.n !== nextNumber(board, popped.length)) {
      stage.slip()
      setPeek(b.n)
      later(() => setPeek((p) => (p === b.n ? null : p)), 1000)
      return
    }
    const now = [...popped, b.n]
    setPopped(now)
    setPeek(null)
    if (now.length < board.length) {
      sound.pop()
      return
    }
    if (stage.good()) return
    later(() => {
      setPopped([])
      setHidden(false)
      setRound(newRound())
    }, 1300)
  }

  const say = done ? t('yes') : peek !== null ? t('no') : !hidden ? t(spec.show === null ? 'pop' : 'look') : popped.length ? t('next') : t('pop')
  return (
    <SceneShell place="lake" say={say} stage={stage} bare fill className="balloon-pop">
      <div className={`bp-field bp-n${board.length}`} key={round.id}>
        <LakeArt />
        {board.map((b, i) => {
          const gone = popped.includes(b.n)
          const style: CSSProperties = { left: `${b.x * 100}%`, top: `${b.y * 100}%`, animationDelay: `${i * 80}ms` }
          return (
            <button
              key={b.n}
              className={`bp-balloon${gone ? ' bp-gone' : ''}${peek === b.n ? ' bp-no' : ''}`}
              style={style}
              onPointerDown={() => tap(b)}
              disabled={stage.over || gone}
              aria-label={hidden ? t('balloon') : String(b.n)}
            >
              <BalloonArt color={b.color} label={!hidden || peek === b.n ? b.n : null} />
            </button>
          )
        })}
        <div className="bp-tags" aria-hidden>
          {popped.map((n) => (
            <span className="bp-tag" key={n}>
              {n}
            </span>
          ))}
        </div>
      </div>
    </SceneShell>
  )
}
