import { useEffect, useRef, useState } from 'react'
import { useLatest, usePops, useShake, useTimeouts } from '../../kit/hooks'
import { makeRng } from '../../kit/random'
import { sound, vibrate } from '../../kit/sound'
import type { GameProps } from '../../kit/types'
import { Hud, Pops } from '../../kit/ui'
import { BAR, ROUNDS, beatMs, cellBeats, grade, judge, makePattern, showWhilePlaying } from './logic'

/** Pause before the drum starts, in ms. */
const LEAD = 700
/** With no tap for this long the player's turn is over. */
const FIRST_TAP_WAIT = 8000

/** Plays a drum hit `delay` seconds from now; returns the notes so they can be cut off. */
function drum(delay = 0) {
  return [sound.tone(180, 0.18, 'sine', 0.35, delay), sound.tone(100, 0.25, 'triangle', 0.25, delay)]
}

export default function RhythmCopy({ level, seed, t, onFinish }: GameProps) {
  const rng = useRef(makeRng(seed)).current
  const beat = beatMs(level)
  const [round, setRound] = useState(0)
  const [pattern, setPattern] = useState(() => makePattern(rng, level, 0))
  const [phase, setPhase] = useState<'listen' | 'play' | 'result'>('listen')
  // The drum hit sounding now, to light up its note while the rhythm plays.
  const [lit, setLit] = useState(-1)
  const [hit, setHit] = useState(false)
  const [credits, setCredits] = useState<number[] | null>(null)
  const [score, setScore] = useState(0)
  const [combo, setCombo] = useState(0)
  const [total, setTotal] = useState(0)
  const [message, setMessage] = useState('')
  const [pops, addPop] = usePops()
  const [ref, shake] = useShake<HTMLButtonElement>()
  const later = useTimeouts()
  const tapTimes = useRef<number[]>([])
  const notes = useRef<(OscillatorNode | undefined)[]>([])
  const idle = useRef<number | undefined>(undefined)

  const bounce = () => {
    setHit(true)
    later(() => setHit(false), 110)
  }

  const finishRound = useLatest(() => {
    clearTimeout(idle.current)
    const j = judge(pattern.hits, tapTimes.current, beat, level)
    const g = grade(j.score)
    const nc = g === 'oops' ? 0 : combo + 1
    const gained = Math.round(j.score * pattern.hits.length * 10) + (g === 'perfect' ? 10 + Math.min(nc, 5) * 2 : 0)
    const newScore = score + gained
    const newTotal = total + j.score
    setScore(newScore)
    setTotal(newTotal)
    setCombo(nc)
    setCredits(j.credits)
    setPhase('result')
    setMessage(t(g))
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
    }, 2200)
  })

  const waitForTaps = (ms: number) => {
    clearTimeout(idle.current)
    idle.current = window.setTimeout(() => finishRound.current(), ms)
  }

  // The drum plays the rhythm at an even tempo, scheduled on the audio clock so it never drifts.
  // No click and no count-in: like a teacher clapping, the pulse lives inside the rhythm.
  useEffect(() => {
    setPhase('listen')
    setLit(-1)
    setCredits(null)
    setMessage('')
    tapTimes.current = []
    pattern.hits.forEach((h, i) => {
      notes.current.push(...drum((LEAD + h * beat) / 1000))
      later(() => {
        setLit(i)
        bounce()
      }, LEAD + h * beat)
    })
    later(() => {
      setLit(-1)
      setPhase('play')
      waitForTaps(FIRST_TAP_WAIT)
    }, LEAD + pattern.beats * beat)
    // Leaving mid-round must silence the notes already queued up.
    return () => {
      clearTimeout(idle.current)
      notes.current.splice(0).forEach((n) => {
        try {
          n?.stop()
        } catch {
          // already finished
        }
      })
    }
  }, [pattern])

  const tap = () => {
    if (phase !== 'play') return
    drum()
    bounce()
    vibrate(15)
    tapTimes.current.push(performance.now())
    if (tapTimes.current.length >= pattern.hits.length) finishRound.current()
    // A pause of a bar and a half means the player has finished (or given up on) the rhythm.
    else waitForTaps(beat * BAR * 1.5)
  }

  const shown = phase !== 'play' || showWhilePlaying(level)
  let hitIndex = 0
  let cellStart = 0

  return (
    <div className="game rhythm-copy">
      <Hud
        items={[
          { label: t('score'), value: score },
          { label: t('beat'), value: `${round + 1} / ${ROUNDS}` },
          { label: t('combo'), value: `×${combo}`, highlight: combo >= 3 },
        ]}
      />
      <p className="prompt">{phase === 'result' ? message : phase === 'listen' ? t('listen') : t('yourTurn')}</p>
      {/* The rhythm shows while the drum plays it, then hides on the player's turn so it has to be remembered. */}
      <div className="rc-bar">
        {shown
          ? pattern.cells.map((c, ci) => {
              const from = cellStart
              cellStart += cellBeats[c]
              const dots = c === 'titi' ? 2 : c === 'rest' ? 0 : 1
              const first = hitIndex
              hitIndex += dots
              return (
                <span
                  key={`${round}-${ci}`}
                  className={`rc-cell rc-c-${c}${phase === 'play' ? ' rc-faded' : ''}${lit >= first && lit < first + dots ? ' rc-now' : ''}${from > 0 && from % BAR === 0 ? ' rc-newbar' : ''}`}
                  style={{ flexGrow: cellBeats[c] }}
                >
                  {dots === 0 ? (
                    <span className="rc-rest" />
                  ) : (
                    Array.from({ length: dots }, (_, k) => (
                      <span key={k} className={`rc-dot${credits ? (credits[first + k] >= 0.5 ? ' rc-good' : ' rc-miss') : ''}`} />
                    ))
                  )}
                </span>
              )
            })
          : Array.from({ length: pattern.beats }, (_, b) => (
              <span key={`${round}-${b}`} className={`rc-cell${b > 0 && b % BAR === 0 ? ' rc-newbar' : ''}`} style={{ flexGrow: 1 }} />
            ))}
      </div>
      <button ref={ref} className={`rc-drum${hit ? ' rc-hit' : ''}${phase === 'play' ? ' rc-ready' : ''}`} onPointerDown={tap} aria-label={t('drum')}>
        🥁
      </button>
      <Pops pops={pops} />
    </div>
  )
}
