import { useEffect, useRef, useState } from 'react'
import { usePops, useShake, useTimeouts } from '../../kit/hooks'
import { makeRng } from '../../kit/random'
import { sound, vibrate } from '../../kit/sound'
import type { GameProps } from '../../kit/types'
import { Hud, Pops } from '../../kit/ui'
import { ROUNDS, grade, makePattern, rhythmScore } from './logic'

function drum(accent = false) {
  sound.tone(accent ? 160 : 200, 0.18, 'sine', 0.35)
  sound.tone(accent ? 90 : 110, 0.25, 'triangle', 0.25)
}

export default function RhythmCopy({ level, seed, t, onFinish }: GameProps) {
  const rng = useRef(makeRng(seed)).current
  const [round, setRound] = useState(0)
  const [pattern, setPattern] = useState(() => makePattern(rng, level, 0))
  const [mode, setMode] = useState<'listen' | 'play' | 'result'>('listen')
  const [hit, setHit] = useState(false)
  const [taps, setTaps] = useState<number[]>([])
  const [score, setScore] = useState(0)
  const [combo, setCombo] = useState(0)
  const [total, setTotal] = useState(0)
  const [message, setMessage] = useState('')
  const [pops, addPop] = usePops()
  const [ref, shake] = useShake<HTMLButtonElement>()
  const later = useTimeouts()
  const idle = useRef<number | null>(null)

  const bounce = () => {
    setHit(true)
    later(() => setHit(false), 110)
  }

  // Play the pattern back whenever a round starts.
  useEffect(() => {
    if (mode !== 'listen') return
    pattern.forEach((ms, i) =>
      later(() => {
        drum(i === 0)
        bounce()
      }, 700 + ms),
    )
    later(() => {
      setTaps([])
      setMode('play')
    }, 700 + pattern[pattern.length - 1] + 500)
  }, [mode, pattern])

  const finishRound = (got: number[]) => {
    if (idle.current) clearTimeout(idle.current)
    const s = rhythmScore(pattern, got)
    const g = grade(s)
    const nc = g === 'oops' ? 0 : combo + 1
    const gained = Math.round(s * pattern.length * 10) + (g === 'perfect' ? 10 + Math.min(nc, 5) * 2 : 0)
    const newScore = score + gained
    const newTotal = total + s
    setScore(newScore)
    setTotal(newTotal)
    setCombo(nc)
    setMessage(t(g))
    setMode('result')
    if (g === 'oops') {
      sound.bad()
      shake()
    } else {
      sound.good(nc * 2)
      addPop(`+${gained}`, 50, 30)
    }
    later(() => {
      if (round + 1 >= ROUNDS) {
        onFinish({ score: newScore, accuracy: newTotal / ROUNDS })
        return
      }
      setRound(round + 1)
      setPattern(makePattern(rng, level, round + 1))
      setMessage('')
      setMode('listen')
    }, 1300)
  }

  const tap = () => {
    if (mode !== 'play') return
    drum(taps.length === 0)
    bounce()
    vibrate(15)
    const now = performance.now()
    const next = [...taps, now]
    setTaps(next)
    if (idle.current) clearTimeout(idle.current)
    if (next.length >= pattern.length) {
      finishRound(next)
      return
    }
    // If the player stops tapping, judge what they have.
    idle.current = window.setTimeout(() => finishRound(next), 2500)
  }

  useEffect(() => () => {
    if (idle.current) clearTimeout(idle.current)
  }, [])

  return (
    <div className="game rhythm-copy">
      <Hud
        items={[
          { label: t('score'), value: score },
          { label: t('beat'), value: `${round + 1} / ${ROUNDS}` },
          { label: t('combo'), value: `×${combo}`, highlight: combo >= 3 },
        ]}
      />
      <p className="prompt">{mode === 'listen' ? t('listen') : mode === 'play' ? t('yourTurn', { n: pattern.length }) : message}</p>
      <div className="rc-dots">
        {pattern.map((_, i) => (
          <span key={`${round}-${i}`} className={`rc-dot${mode !== 'listen' && i < taps.length ? ' rc-on' : ''}`} />
        ))}
      </div>
      <button ref={ref} className={`rc-drum${hit ? ' rc-hit' : ''}${mode === 'play' ? ' rc-ready' : ''}`} onPointerDown={tap} aria-label="drum">
        🥁
      </button>
      <Pops pops={pops} />
    </div>
  )
}
