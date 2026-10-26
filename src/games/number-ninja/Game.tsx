import { useRef, useState } from 'react'
import { useCountdown, useGameLoop, usePops, useShake } from '../../kit/hooks'
import { clamp, makeRng } from '../../kit/random'
import { sound, vibrate } from '../../kit/sound'
import type { GameProps } from '../../kit/types'
import { Hud, Pops, TimerBar } from '../../kit/ui'
import { decoyFor, expressionFor, targetRange, type Expr } from './logic'

const DURATION = 60
const PER_TARGET = 5

interface Bubble extends Expr {
  id: number
  x: number
  y: number
  speed: number
}

export default function NumberNinja({ level, seed, t, onFinish }: GameProps) {
  const rng = useRef(makeRng(seed)).current
  const newTarget = () => rng.int(...targetRange(level))
  const [target, setTarget] = useState(newTarget)
  const [bubbles, setBubbles] = useState<Bubble[]>([])
  const state = useRef({ bubbles: [] as Bubble[], spawnIn: 0, nextId: 0 })
  const [score, setScore] = useState(0)
  const [combo, setCombo] = useState(0)
  const [hits, setHits] = useState(0)
  const [mistakes, setMistakes] = useState(0)
  const [over, setOver] = useState(false)
  const [pops, addPop] = usePops()
  const [ref, shake] = useShake<HTMLDivElement>()

  const left = useCountdown(
    DURATION,
    () => {
      setOver(true)
      onFinish({ score, accuracy: (hits / Math.max(1, hits + mistakes)) * clamp(hits / 15, 0, 1) })
    },
    !over,
  )

  const speed = clamp(14 + level * 2.5, 14, 40) // % of the height per second

  useGameLoop((dt) => {
    const s = state.current
    s.spawnIn -= dt
    if (s.spawnIn <= 0) {
      s.spawnIn = clamp(1.1 - level * 0.06, 0.55, 1.1)
      const good = rng.chance(0.45)
      const e = good ? expressionFor(rng, level, target) : decoyFor(rng, level, target)
      s.bubbles.push({ ...e, id: s.nextId++, x: rng.int(10, 82), y: 105, speed: speed * (0.85 + rng.next() * 0.3) })
    }
    s.bubbles = s.bubbles
      .map((b) => ({ ...b, y: b.y - b.speed * dt }))
      .filter((b) => b.y > -15)
    setBubbles(s.bubbles)
  }, !over)

  const tap = (b: Bubble) => {
    if (over) return
    const s = state.current
    s.bubbles = s.bubbles.filter((q) => q.id !== b.id)
    setBubbles(s.bubbles)
    if (b.value === target) {
      const nc = combo + 1
      const gained = 10 + Math.min(nc, 10) * 2
      setScore((v) => v + gained)
      setCombo(nc)
      sound.good(nc)
      addPop(`+${gained}`, b.x + 6, b.y)
      const h = hits + 1
      setHits(h)
      if (h % PER_TARGET === 0) {
        let n = newTarget()
        while (n === target) n = newTarget()
        setTarget(n)
        s.bubbles = []
        setBubbles([])
        addPop(t('newTarget'), 50, 40, 'info')
      }
    } else {
      setCombo(0)
      setMistakes((m) => m + 1)
      sound.bad()
      vibrate(50)
      shake()
      addPop(`${b.text} = ${b.value}`, b.x + 6, b.y, 'bad')
    }
  }

  return (
    <div className="game number-ninja">
      <TimerBar left={left} total={DURATION} />
      <Hud
        items={[
          { label: t('score'), value: score },
          { label: t('combo'), value: `×${combo}`, highlight: combo >= 5 },
          { label: t('time'), value: Math.ceil(left) },
        ]}
      />
      <div className="nn-target">
        {t('target')} <strong key={target}>{target}</strong>
      </div>
      <div className="nn-field" ref={ref}>
        {bubbles.map((b) => (
          <button key={b.id} className="nn-bubble" style={{ left: `${b.x}%`, top: `${b.y}%` }} onPointerDown={() => tap(b)}>
            {b.text}
          </button>
        ))}
        <Pops pops={pops} />
      </div>
    </div>
  )
}
