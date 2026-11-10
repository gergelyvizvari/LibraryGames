import { useEffect, useRef, useState } from 'react'
import { usePops, useShake, useTimeouts } from '../../kit/hooks'
import { makeRng } from '../../kit/random'
import { SceneShell, useStage } from '../../kit/SceneShell'
import type { GameProps } from '../../kit/types'
import { Pops } from '../../kit/ui'
import { judge, makeOrders, pickAnimals, windowMs, type Outcome } from './logic'

/** Orders in one stage. */
const STAGE = 8
const messages: Record<Exclude<Outcome, 'right'>, string> = {
  wrongAnimal: 'wrong',
  noSimon: 'gotcha',
  tooSlow: 'tooSlow',
  waited: 'wellWaited',
}

export default function SimonSays({ level, seed, t, onFinish }: GameProps) {
  const rng = useRef(makeRng(seed)).current
  const animals = useRef(pickAnimals(rng, level)).current
  const orders = useRef(makeOrders(rng, level, animals.length).slice(0, STAGE)).current
  const [index, setIndex] = useState(0)
  const [active, setActive] = useState(false)
  const [progress, setProgress] = useState(1)
  const stage = useStage(orders.length, onFinish)
  const [pops, addPop] = usePops()
  const [ref, shake] = useShake<HTMLDivElement>()
  const later = useTimeouts()
  const started = useRef(0)
  const ms = windowMs(level) + 600

  const resolve = (tapped: number | null) => {
    if (!active) return
    setActive(false)
    const outcome = judge(orders[index], tapped)
    let last: boolean
    if (outcome === 'right' || outcome === 'waited') {
      last = stage.good()
      if (outcome === 'waited') addPop(t('wellWaited'), 50, 25)
    } else {
      last = stage.miss()
      shake()
      addPop(t(messages[outcome]), 50, 25, 'bad')
    }
    if (!last) later(() => setIndex(index + 1), 900)
  }
  const resolveRef = useRef(resolve)
  resolveRef.current = resolve

  // Each order opens a window; if it closes without a tap, that counts as waiting.
  useEffect(() => {
    started.current = performance.now()
    setActive(true)
    setProgress(1)
    const tick = setInterval(() => setProgress(Math.max(0, 1 - (performance.now() - started.current) / ms)), 50)
    const timeout = setTimeout(() => resolveRef.current(null), ms)
    return () => {
      clearInterval(tick)
      clearTimeout(timeout)
    }
  }, [index, ms])

  const order = orders[index]
  const key = animals[order.animal].key
  // Some languages change the word after "tap" (Hungarian: kutya → kutyára), so `<animal>.tap` wins when a language has it.
  const animal = t(`${key}.tap`) === `${key}.tap` ? t(key) : t(`${key}.tap`)

  return (
    <SceneShell place="lake" say={order.simon ? t('simonSays', { animal }) : t('plain', { animal })} stage={stage} bare className="simon-says">
      <div className="sim-timer">
        <div style={{ width: `${(active ? progress : 0) * 100}%` }} />
      </div>
      <div className={`sim-animals${animals.length > 4 ? ' sim-six' : ''}`} ref={ref}>
        {animals.map((a, i) => (
          <button key={a.key} className="sim-animal" onPointerDown={() => resolve(i)} aria-label={t(a.key)}>
            {a.emoji}
          </button>
        ))}
      </div>
      <Pops pops={pops} />
    </SceneShell>
  )
}
