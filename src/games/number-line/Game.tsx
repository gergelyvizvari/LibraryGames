import { useRef, useState } from 'react'
import { useCountdown, useLatest, usePops, useShake, useTimeouts } from '../../kit/hooks'
import { makeRng } from '../../kit/random'
import { sound, tone, vibrate } from '../../kit/sound'
import type { GameProps } from '../../kit/types'
import { Hud, Pops, TimerBar } from '../../kit/ui'
import { accuracyFor, DURATION, jumpText, makeQuestion, pathOf, pointsFor, showsLabel, specFor, WINDOW, type Question } from './logic'

/** Where a number sits across the line, in % of its width. */
const xOf = (n: number, lo: number) => 8 + ((n - lo) / WINDOW) * 84

/** Every single hop the frog makes, one number at a time. */
function hopsOf(q: Question) {
  const path = pathOf(q)
  const out: number[] = []
  for (let k = 1; k < path.length; k++) {
    const dir = Math.sign(path[k] - path[k - 1])
    for (let n = path[k - 1] + dir; n !== path[k] + dir; n += dir) out.push(n)
  }
  return out
}

export default function NumberLine({ level, seed, t, onFinish }: GameProps) {
  const spec = specFor(level)
  const rng = useRef(makeRng(seed)).current
  const [q, setQ] = useState(() => makeQuestion(rng, level, rng.int(0, Math.min(4, spec.max - WINDOW + 4))))
  const [frog, setFrog] = useState(q.start)
  const [hop, setHop] = useState(0)
  const [busy, setBusy] = useState(false)
  const [picked, setPicked] = useState<number | null>(null)
  const [count, setCount] = useState<number | null>(null)
  const [message, setMessage] = useState<{ text: string; kind: '' | 'yes' | 'no' }>(() => ({ text: t('ask'), kind: '' }))
  const [score, setScore] = useState(0)
  const [combo, setCombo] = useState(0)
  const [over, setOver] = useState(false)
  const stats = useRef({ right: 0, wrong: 0 })
  const shownAt = useRef(performance.now())
  const scoreRef = useLatest(score)
  const [pops, addPop] = usePops()
  const [lineRef, shake] = useShake<HTMLDivElement>()
  const later = useTimeouts()

  const left = useCountdown(
    DURATION,
    () => {
      setOver(true)
      onFinish({ score: scoreRef.current, accuracy: accuracyFor(stats.current.right, stats.current.wrong) })
    },
    !over,
  )

  const sum = `${q.start} ${q.jumps.map(jumpText).join(' ')} = ${q.end}`

  const tap = (n: number) => {
    if (over || busy) return
    const right = n === q.end
    const seconds = (performance.now() - shownAt.current) / 1000
    setBusy(true)
    setPicked(n)
    if (right) {
      const nc = combo + 1
      const gained = pointsFor(nc, seconds)
      stats.current.right++
      setCombo(nc)
      setScore((s) => s + gained)
      setMessage({ text: sum, kind: 'yes' })
      sound.good(nc)
      addPop(`+${gained}`, xOf(q.end, q.lo), 20)
    } else {
      stats.current.wrong++
      setCombo(0)
      setMessage({ text: t('no', { start: q.start, jumps: q.jumps.map(jumpText).join(' '), end: q.end }), kind: 'no' })
      sound.bad()
      vibrate(40)
      shake()
    }
    // The frog hops the way, one number at a time. After a miss it hops slower and counts out loud.
    const hops = hopsOf(q)
    const step = right ? 150 : 330
    hops.forEach((n, i) => {
      later(() => {
        setFrog(n)
        setHop((h) => h + 1)
        if (!right) setCount(i + 1)
        tone(420 + i * 40, 0.07, 'triangle', 0.1)
      }, (right ? 150 : 600) + i * step)
    })
    later(() => {
      const nq = makeQuestion(rng, level, q.end)
      setQ(nq)
      setFrog(nq.start)
      setPicked(null)
      setCount(null)
      setBusy(false)
      setMessage({ text: t('ask'), kind: '' })
      shownAt.current = performance.now()
    }, (right ? 150 : 600) + hops.length * step + (right ? 450 : 900))
  }

  const ticks = Array.from({ length: WINDOW + 1 }, (_, i) => q.lo + i)
  return (
    <div className="game number-line">
      <TimerBar left={left} total={DURATION} />
      <Hud
        items={[
          { label: t('score'), value: score },
          { label: t('combo'), value: `×${combo}`, highlight: combo >= 5 },
          { label: t('time'), value: Math.ceil(left) },
        ]}
      />
      <div className="nl-jumps" key={`${q.start}-${q.jumps.join()}-${q.lo}`}>
        {q.jumps.map((j, i) => (
          <span key={i} className={`nl-jump ${j > 0 ? 'nl-fwd' : 'nl-back'}`}>
            {j > 0 ? '➡' : '⬅'} {jumpText(j)}
          </span>
        ))}
      </div>
      <p className={`prompt nl-msg${message.kind ? ` nl-${message.kind}` : ''}`}>{message.text}</p>
      <div className="nl-stage" ref={lineRef}>
        <span key={hop} className="nl-frog" style={{ left: `${xOf(frog, q.lo)}%` }}>
          🐸{count !== null && <span className="nl-count">{count}</span>}
        </span>
        <div className="nl-line" />
        {ticks.map((n) => {
          const state = picked === n ? (n === q.end ? ' nl-right' : ' nl-wrong') : busy && n === q.end && picked !== null ? ' nl-right' : ''
          return (
            <button
              key={n}
              className={`nl-tick${n === q.start ? ' nl-start' : ''}${state}`}
              style={{ left: `${xOf(n, q.lo)}%` }}
              onPointerDown={() => tap(n)}
              disabled={over}
              aria-label={String(n)}
            >
              <span className="nl-mark" />
              <span className="nl-num">{showsLabel(n, q, spec.labels) || (busy && n === q.end) ? n : ''}</span>
            </button>
          )
        })}
        <Pops pops={pops} />
      </div>
    </div>
  )
}
