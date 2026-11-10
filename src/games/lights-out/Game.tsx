import { useRef, useState } from 'react'
import { useShake, useTimeouts } from '../../kit/hooks'
import { makeRng } from '../../kit/random'
import { SceneShell, useStage } from '../../kit/SceneShell'
import { sound } from '../../kit/sound'
import type { GameProps } from '../../kit/types'
import { ROUNDS, animalKey, holdRange, pointsFor } from './logic'

type State = 'ready' | 'lighting' | 'holding' | 'go' | 'result' | 'done'

export default function LightsOut({ level, seed, t, onFinish }: GameProps) {
  const rng = useRef(makeRng(seed)).current
  const [state, setState] = useState<State>('ready')
  const [lit, setLit] = useState(0)
  const [message, setMessage] = useState('')
  const stage = useStage(ROUNDS, onFinish)
  const [ref, shake] = useShake<HTMLButtonElement>()
  const later = useTimeouts()
  const outAt = useRef(0)
  const run = useRef(0)

  const startLights = () => {
    const id = ++run.current
    setMessage('')
    setLit(0)
    setState('lighting')
    for (let i = 1; i <= 5; i++) {
      later(() => {
        if (run.current !== id) return
        setLit(i)
        sound.tone(440, 0.12, 'square', 0.08)
        if (i === 5) {
          setState('holding')
          const [min, max] = holdRange(level)
          later(() => {
            if (run.current !== id) return
            setLit(0)
            setState('go')
            outAt.current = performance.now()
          }, rng.int(min, max))
        }
      }, i * 450)
    }
  }

  const tap = () => {
    if (state === 'ready' || state === 'result') {
      startLights()
      return
    }
    if (state === 'lighting' || state === 'holding') {
      run.current++
      stage.slip()
      shake()
      setLit(0)
      setMessage(t('tooSoon'))
      setState('result')
      return
    }
    if (state !== 'go') return
    const ms = Math.round(performance.now() - outAt.current)
    setMessage(`${t('ms', { ms })} · ${t(animalKey(ms))}`)
    setState(stage.good(pointsFor(ms)) ? 'done' : 'result')
  }

  const label =
    state === 'go' ? t('tapNow') : state === 'lighting' || state === 'holding' ? t('waitForIt') : state === 'done' ? '' : t('tapToStart')

  return (
    <SceneShell place="meadow" say={message || label || t('tapToStart')} stage={stage} bare fill className="lights-out">
      <button ref={ref} className={`lo-area lo-${state}`} onPointerDown={tap}>
        <div className="lo-lights">
          {[1, 2, 3, 4, 5].map((i) => (
            <span key={i} className={`lo-light${i <= lit ? ' lo-on' : ''}`} />
          ))}
        </div>
        <div className="lo-label">{label}</div>
      </button>
    </SceneShell>
  )
}
