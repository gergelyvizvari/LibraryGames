import { useEffect, useRef, useState } from 'react'
import { useLatest, usePops, useShake, useTimeouts } from '../../kit/hooks'
import { makeRng } from '../../kit/random'
import { sound, vibrate } from '../../kit/sound'
import type { GameProps } from '../../kit/types'
import { Hud, Pops } from '../../kit/ui'
import { BAR, ROUNDS, beatMs, cellBeats, grade, judge, makePattern } from './logic'

/** Pause before the first count-in tick, in ms. */
const LEAD = 600

/** Plays a drum hit `delay` seconds from now; returns the notes so they can be cut off. */
function drum(accent = false, delay = 0) {
  return [sound.tone(accent ? 160 : 200, 0.18, 'sine', 0.35, delay), sound.tone(accent ? 90 : 110, 0.25, 'triangle', 0.25, delay)]
}

/** The metronome: a soft click on every beat, a brighter one on beat 1. */
function click(down: boolean, delay: number) {
  return sound.tone(down ? 1500 : 1100, 0.03, 'square', down ? 0.07 : 0.04, delay)
}

export default function RhythmCopy({ level, seed, t, onFinish }: GameProps) {
  const rng = useRef(makeRng(seed)).current
  const beat = beatMs(level)
  const [round, setRound] = useState(0)
  const [pattern, setPattern] = useState(() => makePattern(rng, level, 0))
  // Beat counter for the whole pass: count-in, the pattern, count-in, the player's turn.
  const [pos, setPos] = useState(-1)
  const [hit, setHit] = useState(false)
  const [credits, setCredits] = useState<number[] | null>(null)
  const [score, setScore] = useState(0)
  const [combo, setCombo] = useState(0)
  const [total, setTotal] = useState(0)
  const [message, setMessage] = useState('')
  const [pops, addPop] = usePops()
  const [ref, shake] = useShake<HTMLButtonElement>()
  const later = useTimeouts()
  const start = useRef(0)
  const tapTimes = useRef<number[]>([])
  const notes = useRef<(OscillatorNode | undefined)[]>([])

  const B = pattern.beats
  const playFrom = BAR * 2 + B
  const phase = credits ? 'result' : pos < BAR ? 'count' : pos < BAR + B ? 'listen' : pos < playFrom ? 'ready' : 'play'

  const bounce = () => {
    setHit(true)
    later(() => setHit(false), 110)
  }

  const finishRound = useLatest(() => {
    const hits = pattern.hits.map((h) => (playFrom + h) * beat)
    const j = judge(hits, tapTimes.current, beat)
    const g = grade(j.score)
    const nc = g === 'oops' ? 0 : combo + 1
    const gained = Math.round(j.score * pattern.hits.length * 10) + (g === 'perfect' ? 10 + Math.min(nc, 5) * 2 : 0)
    const newScore = score + gained
    const newTotal = total + j.score
    setScore(newScore)
    setTotal(newTotal)
    setCombo(nc)
    setCredits(j.credits)
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

  // Each round is one unbroken pulse, scheduled on the audio clock so it never drifts.
  useEffect(() => {
    setPos(-1)
    setCredits(null)
    setMessage('')
    tapTimes.current = []
    start.current = performance.now() + LEAD
    const beats = playFrom + B
    for (let b = 0; b < beats; b++) {
      notes.current.push(click(b % BAR === 0, (LEAD + b * beat) / 1000))
      later(() => setPos(b), LEAD + b * beat)
    }
    pattern.hits.forEach((h, i) => {
      notes.current.push(...drum(i === 0, (LEAD + (BAR + h) * beat) / 1000))
      later(bounce, LEAD + (BAR + h) * beat)
    })
    // Half a beat of grace after the bar for a late last tap.
    later(() => finishRound.current(), LEAD + (beats + 0.5) * beat)
    // Leaving mid-round must silence the notes already queued up.
    return () =>
      notes.current.splice(0).forEach((n) => {
        try {
          n?.stop()
        } catch {
          // already finished
        }
      })
  }, [pattern])

  const tap = () => {
    const at = performance.now() - start.current
    // Taps count from half a beat before the player's bar, so an eager first tap still lands.
    if (credits || at < (playFrom - 0.5) * beat) return
    drum(tapTimes.current.length === 0)
    bounce()
    vibrate(15)
    tapTimes.current.push(at)
  }

  // Which beat of the pattern is sounding now, to light up its cell.
  const current = phase === 'listen' ? pos - BAR : phase === 'play' ? pos - playFrom : -1
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
      <p className="prompt">
        {phase === 'result' ? message : phase === 'count' || phase === 'listen' ? t('listen') : phase === 'ready' ? t('getReady') : t('yourTurn')}
      </p>
      <div className="rc-count" aria-hidden>
        {Array.from({ length: BAR }, (_, i) => {
          const counting = phase === 'count' ? pos : phase === 'ready' ? pos - BAR - B : -1
          const onBeat = phase === 'listen' || phase === 'play' ? (current % BAR) === i : counting === i
          return (
            <span key={i} className={`rc-num${onBeat ? ' rc-num-on' : ''}${counting >= 0 ? ' rc-num-count' : ''}`}>
              {i + 1}
            </span>
          )
        })}
      </div>
      {/* The rhythm shows while the drum plays it, then hides on the player's turn so it has to be remembered. */}
      <div className="rc-bar">
        {phase === 'count' || phase === 'listen' || phase === 'result'
          ? pattern.cells.map((c, ci) => {
              const from = cellStart
              cellStart += cellBeats[c]
              const dots = c === 'titi' ? 2 : c === 'rest' ? 0 : 1
              const first = hitIndex
              hitIndex += dots
              return (
                <span
                  key={`${round}-${ci}`}
                  className={`rc-cell rc-c-${c}${current >= from && current < from + cellBeats[c] ? ' rc-now' : ''}${from > 0 && from % BAR === 0 ? ' rc-newbar' : ''}`}
                  style={{ flexGrow: cellBeats[c] }}
                >
                  {dots === 0 ? (
                    <span className="rc-rest" />
                  ) : (
                    Array.from({ length: dots }, (_, k) => <span key={k} className={`rc-dot${credits ? (credits[first + k] >= 0.5 ? ' rc-good' : ' rc-miss') : ''}`} />)
                  )}
                </span>
              )
            })
          : Array.from({ length: B }, (_, b) => (
              <span
                key={`${round}-${b}`}
                className={`rc-cell${b === current ? ' rc-now' : ''}${b > 0 && b % BAR === 0 ? ' rc-newbar' : ''}`}
                style={{ flexGrow: 1 }}
              />
            ))}
      </div>
      <button ref={ref} className={`rc-drum${hit ? ' rc-hit' : ''}${phase === 'play' ? ' rc-ready' : ''}`} onPointerDown={tap} aria-label={t('drum')}>
        🥁
      </button>
      <Pops pops={pops} />
    </div>
  )
}
