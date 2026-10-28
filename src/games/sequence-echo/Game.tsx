import { useEffect, useRef, useState } from 'react'
import { useShake, useTimeouts, usePops } from '../../kit/hooks'
import { clamp, makeRng } from '../../kit/random'
import { sound, vibrate } from '../../kit/sound'
import type { GameProps } from '../../kit/types'
import { Hearts, Hud, Pops } from '../../kit/ui'

const pads = [
  { color: '#ff6b6b', note: 523 },
  { color: '#48dbfb', note: 659 },
  { color: '#1dd1a1', note: 784 },
  { color: '#feca57', note: 1047 },
]
const LIVES = 2
/** Gap after the last tapped note before the success chime. */
const CHEER_GAP_MS = 120

export function stepMs(level: number) {
  return clamp(700 - level * 45, 260, 700)
}

export default function SequenceEcho({ level, seed, t, onFinish }: GameProps) {
  const rng = useRef(makeRng(seed)).current
  const [sequence, setSequence] = useState(() => [rng.int(0, 3), rng.int(0, 3)])
  const [mode, setMode] = useState<'show' | 'input' | 'done'>('show')
  const [lit, setLit] = useState<number | null>(null)
  const [pos, setPos] = useState(0)
  const [lives, setLives] = useState(LIVES)
  const [score, setScore] = useState(0)
  const [longest, setLongest] = useState(0)
  const [pops, addPop] = usePops()
  const [boardRef, shake] = useShake<HTMLDivElement>()
  const later = useTimeouts()
  const ms = stepMs(level)
  // Taps play the same note length as the demo, so both sound alike.
  const noteMs = ms * 0.7

  const flash = (i: number, duration: number) => {
    setLit(i)
    sound.tone(pads[i].note, duration / 1000, 'triangle', 0.22)
    later(() => setLit((cur) => (cur === i ? null : cur)), duration)
  }

  // Play the sequence back whenever we enter "show".
  useEffect(() => {
    if (mode !== 'show') return
    sequence.forEach((p, i) => later(() => flash(p, noteMs), 600 + i * ms))
    later(() => {
      setPos(0)
      setMode('input')
    }, 600 + sequence.length * ms)
  }, [mode, sequence])

  const press = (i: number) => {
    if (mode !== 'input') return
    flash(i, noteMs)
    if (i !== sequence[pos]) {
      sound.bad()
      vibrate(60)
      shake()
      const left = lives - 1
      setLives(left)
      if (left <= 0) {
        setMode('done')
        onFinish({ score, accuracy: clamp(longest / (4 + level), 0, 1) })
      } else {
        addPop(t('oops'), 50, 45, 'bad')
        setMode('show')
      }
      return
    }
    if (pos + 1 < sequence.length) {
      setPos(pos + 1)
      return
    }
    // Completed the whole sequence.
    const gained = sequence.length * 10
    setScore((s) => s + gained)
    setLongest(Math.max(longest, sequence.length))
    setMode('done')
    later(() => {
      sound.good(sequence.length)
      addPop(`+${gained}`, 50, 45)
    }, noteMs + CHEER_GAP_MS)
    later(() => {
      setSequence((s) => [...s, rng.int(0, 3)])
      setMode('show')
    }, noteMs + CHEER_GAP_MS + 500)
  }

  return (
    <div className="game sequence-echo">
      <Hud
        items={[
          { label: t('score'), value: score },
          { label: t('length'), value: sequence.length, highlight: true },
          { label: t('lives'), value: <Hearts left={lives} total={LIVES} /> },
        ]}
      />
      <p className="prompt">{mode === 'input' ? t('yourTurn') : t('watch')}</p>
      <div className="se-board" ref={boardRef}>
        {pads.map((p, i) => (
          <button
            key={i}
            className={`se-pad${lit === i ? ' se-lit' : ''}`}
            style={{ background: p.color }}
            onPointerDown={() => press(i)}
            aria-label={`pad ${i + 1}`}
            disabled={mode !== 'input'}
          />
        ))}
      </div>
      <Pops pops={pops} />
    </div>
  )
}
