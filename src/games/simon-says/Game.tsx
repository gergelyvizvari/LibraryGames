import { useEffect, useRef, useState } from 'react'
import { usePops, useShake, useTimeouts } from '../../kit/hooks'
import { makeRng } from '../../kit/random'
import { sound, vibrate } from '../../kit/sound'
import type { GameProps } from '../../kit/types'
import { Hud, Pops } from '../../kit/ui'
import { judge, makeOrders, pickAnimals, windowMs, type Outcome } from './logic'

const messages: Record<Exclude<Outcome, 'right'>, string> = {
  wrongAnimal: 'wrong',
  noSimon: 'gotcha',
  tooSlow: 'tooSlow',
  waited: 'wellWaited',
}

export default function SimonSays({ level, seed, t, onFinish }: GameProps) {
  const rng = useRef(makeRng(seed)).current
  const animals = useRef(pickAnimals(rng, level)).current
  const orders = useRef(makeOrders(rng, level, animals.length)).current
  const [index, setIndex] = useState(0)
  const [active, setActive] = useState(false)
  const [score, setScore] = useState(0)
  const [combo, setCombo] = useState(0)
  const [right, setRight] = useState(0)
  const [progress, setProgress] = useState(1)
  const [pops, addPop] = usePops()
  const [ref, shake] = useShake<HTMLDivElement>()
  const later = useTimeouts()
  const started = useRef(0)
  const result = useRef({ score: 0, right: 0, combo: 0 })
  const ms = windowMs(level)

  const resolve = (tapped: number | null) => {
    if (!active) return
    setActive(false)
    const order = orders[index]
    const outcome = judge(order, tapped)
    const r = result.current
    if (outcome === 'right' || outcome === 'waited') {
      r.combo++
      r.right++
      const gained = 10 + Math.min(r.combo, 10) * 2
      r.score += gained
      sound.good(r.combo)
      addPop(outcome === 'waited' ? `${t('wellWaited')} +${gained}` : `+${gained}`, 50, 25)
    } else {
      r.combo = 0
      sound.bad()
      vibrate(60)
      shake()
      addPop(t(messages[outcome]), 50, 25, 'bad')
    }
    setScore(r.score)
    setCombo(r.combo)
    setRight(r.right)
    later(() => {
      if (index + 1 >= orders.length) {
        onFinish({ score: r.score, accuracy: r.right / orders.length })
        return
      }
      setIndex(index + 1)
    }, 800)
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
    <div className="game simon-says">
      <Hud
        items={[
          { label: t('score'), value: score },
          { label: t('order'), value: `${index + 1} / ${orders.length}` },
          { label: t('combo'), value: `×${combo}`, highlight: combo >= 5 },
        ]}
      />
      <div className="sim-order" key={index}>
        <span className="sim-face">🤴</span>
        <span>{order.simon ? t('simonSays', { animal }) : t('plain', { animal })}</span>
        <div className="sim-timer">
          <div style={{ width: `${(active ? progress : 0) * 100}%` }} />
        </div>
      </div>
      <div className={`sim-animals${animals.length > 4 ? ' sim-six' : ''}`} ref={ref}>
        {animals.map((a, i) => (
          <button key={a.key} className="sim-animal" onPointerDown={() => resolve(i)} aria-label={t(a.key)}>
            {a.emoji}
          </button>
        ))}
      </div>
      <p className="muted" style={{ textAlign: 'center' }}>{right} ✓</p>
      <Pops pops={pops} />
    </div>
  )
}
