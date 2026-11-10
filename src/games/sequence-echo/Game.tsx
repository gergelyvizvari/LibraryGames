import { useEffect, useRef, useState } from 'react'
import { useShake, useTimeouts } from '../../kit/hooks'
import { clamp, makeRng } from '../../kit/random'
import { SceneShell, useStage } from '../../kit/SceneShell'
import { sound } from '../../kit/sound'
import type { GameProps } from '../../kit/types'

const pads = [
  { color: '#ff6b6b', note: 523 },
  { color: '#48dbfb', note: 659 },
  { color: '#1dd1a1', note: 784 },
  { color: '#feca57', note: 1047 },
]
/** Tunes to echo in one stage; each is one note longer. */
const STAGE = 4
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
  const stage = useStage(STAGE, onFinish)
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
      stage.slip()
      shake()
      setMode('done')
      later(() => setMode('show'), 900)
      return
    }
    if (pos + 1 < sequence.length) {
      setPos(pos + 1)
      return
    }
    // Completed the whole sequence.
    setMode('done')
    later(() => {
      if (stage.good(sequence.length * 10)) return
      later(() => {
        setSequence((s) => [...s, rng.int(0, 3)])
        setMode('show')
      }, 600)
    }, noteMs + CHEER_GAP_MS)
  }

  return (
    <SceneShell place="lake" say={mode === 'input' ? t('yourTurn') : t('watch')} stage={stage} bare className="sequence-echo">
      <div className="se-board" ref={boardRef}>
        {pads.map((p, i) => (
          <button
            key={i}
            className={`se-pad${lit === i ? ' se-lit' : ''}`}
            style={{ ['--pad' as string]: p.color }}
            onPointerDown={() => press(i)}
            aria-label={`pad ${i + 1}`}
            disabled={mode !== 'input'}
          />
        ))}
      </div>
    </SceneShell>
  )
}
