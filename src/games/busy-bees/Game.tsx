import { useEffect, useRef, useState } from 'react'
import { useGameLoop, usePops, useShake, useTimeouts } from '../../kit/hooks'
import { makeRng } from '../../kit/random'
import { sound, vibrate } from '../../kit/sound'
import type { GameProps } from '../../kit/types'
import { Hud, Pops } from '../../kit/ui'
import { Bee } from './Bee'
import { makeTurn, pointsFor, positionAt, SHOW_MS, TURNS } from './logic'

type Phase = 'show' | 'fly' | 'pick' | 'done'

// Flowers that decorate the meadow, as [emoji, x %, y %].
const FLOWERS: [string, number, number][] = [
  ['🌼', 8, 10], ['🌸', 88, 6], ['🌷', 50, 92], ['🌼', 92, 60], ['🌸', 4, 70], ['🌻', 34, 4], ['🌷', 70, 34], ['🌼', 26, 48],
]

export default function BusyBees({ level, seed, t, onFinish }: GameProps) {
  const rng = useRef(makeRng(seed)).current
  const [turn, setTurn] = useState(() => makeTurn(rng, level))
  const [index, setIndex] = useState(0)
  const [phase, setPhase] = useState<Phase>('show')
  const [ms, setMs] = useState(0)
  const [found, setFound] = useState<number[]>([])
  const [wrong, setWrong] = useState<number | null>(null)
  const [result, setResult] = useState<'yes' | 'no' | null>(null)
  const [score, setScore] = useState(0)
  const [combo, setCombo] = useState(0)
  const stats = useRef({ right: 0 })
  const [pops, addPop] = usePops()
  const [ref, shake] = useShake<HTMLDivElement>()
  const later = useTimeouts()
  const flight = (turn.paths[0].length - 1) * turn.legMs

  // Show the bee(s) to follow, then let everyone fly.
  useEffect(() => {
    if (phase !== 'show') return
    later(() => setPhase('fly'), SHOW_MS)
  }, [phase, index, later])

  useGameLoop((dt) => {
    const next = ms + dt * 1000
    if (next >= flight) {
      setMs(flight)
      setPhase('pick')
      sound.tick()
    } else setMs(next)
  }, phase === 'fly')

  const nextTurn = (delay: number) => {
    later(() => {
      if (index + 1 >= TURNS) {
        setPhase('done')
        sound.win()
        onFinish({ score: scoreRef.current, accuracy: stats.current.right / TURNS })
        return
      }
      setTurn(makeTurn(rng, level))
      setIndex((i) => i + 1)
      setMs(0)
      setFound([])
      setWrong(null)
      setResult(null)
      setPhase('show')
    }, delay)
  }
  const scoreRef = useRef(0)
  scoreRef.current = score

  const tap = (bee: number, x: number, y: number) => {
    if (phase !== 'pick' || result || found.includes(bee)) return
    if (turn.targets.includes(bee)) {
      const now = [...found, bee]
      setFound(now)
      if (now.length < turn.targets.length) {
        sound.pop()
        addPop('🐝', x, y, 'info')
        return
      }
      const c = combo + 1
      const pts = pointsFor(level, c)
      stats.current.right++
      setCombo(c)
      setScore((s) => s + pts)
      setResult('yes')
      sound.good(c)
      // A happy little buzz.
      sound.tone(220, 0.12, 'sawtooth', 0.04, 0.12)
      addPop(`+${pts}`, x, y)
      nextTurn(1000)
      return
    }
    setWrong(bee)
    setCombo(0)
    setResult('no')
    sound.bad()
    vibrate(40)
    shake()
    nextTurn(1600)
  }

  const prompt = () => {
    if (result === 'no' && turn.targets.length > 1) return t('noTwo')
    if (result) return t(result)
    if (phase === 'show') return t(turn.targets.length > 1 ? 'watchTwo' : 'watchOne')
    if (phase === 'fly') return t('follow')
    if (found.length > 0) return t('oneMore')
    return t(turn.targets.length > 1 ? 'findTwo' : 'findOne')
  }

  const reveal = phase === 'show' || result === 'no'

  return (
    <div className="game busy-bees">
      <Hud
        items={[
          { label: t('score'), value: score },
          { label: t('turn'), value: `${Math.min(index + 1, TURNS)}/${TURNS}` },
          { label: t('streak'), value: combo, highlight: combo >= 3 },
        ]}
      />
      <p className={`prompt${result === 'yes' ? ' bb-yes' : ''}`}>{prompt()}</p>
      <div ref={ref} className={`bb-meadow${phase === 'pick' && !result ? ' bb-picking' : ''}`}>
        {FLOWERS.map(([f, x, y], i) => (
          <span key={i} className="bb-flower" style={{ left: `${x}%`, top: `${y}%` }}>
            {f}
          </span>
        ))}
        {turn.paths.map((path, b) => {
          const p = positionAt(path, ms, turn.legMs)
          // A little buzzing wobble while flying.
          const wob = phase === 'fly' ? Math.sin(ms / 70 + b * 2) * 0.012 : 0
          const x = (p.x + wob) * 100
          const y = (p.y + Math.cos(ms / 90 + b) * wob) * 100
          const cls = [
            'bb-bee',
            reveal && turn.targets.includes(b) ? 'bb-target' : '',
            found.includes(b) ? 'bb-found' : '',
            wrong === b ? 'bb-wrong' : '',
            phase === 'fly' ? 'bb-flying' : '',
          ].join(' ')
          return (
            <button
              key={`${index}-${b}`}
              className={cls}
              style={{ left: `${x}%`, top: `${y}%` }}
              onPointerDown={() => tap(b, x, y)}
              aria-label={`bee ${b + 1}`}
              disabled={phase === 'done'}
            >
              <span className="bb-face" style={{ transform: `scaleX(${p.dir})` }}>
                <Bee />
              </span>
            </button>
          )
        })}
        <Pops pops={pops} />
      </div>
    </div>
  )
}
