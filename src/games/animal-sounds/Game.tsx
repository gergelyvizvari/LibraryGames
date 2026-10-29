import { useEffect, useRef, useState } from 'react'
import { usePops, useShake, useTimeouts } from '../../kit/hooks'
import { makeRng } from '../../kit/random'
import { sound, vibrate } from '../../kit/sound'
import type { GameProps } from '../../kit/types'
import { Hearts, Hud, Pops } from '../../kit/ui'
import { ANIMALS, LIVES, ROUNDS, animalCount, makeSequence, roundPoints, seqLength, showLights, stepMs } from './logic'
import { preloadVoices, voices } from './voices'

const faces = { cat: '🐱', dog: '🐶', cow: '🐮', duck: '🦆', bird: '🐦', frog: '🐸' }

type Phase = 'listen' | 'input' | 'between' | 'done'

export default function AnimalSounds({ level, seed, t, onFinish }: GameProps) {
  const rng = useRef(makeRng(seed)).current
  const count = animalCount(level)
  // Shuffle which animals live on the farm, so the board isn't always the same.
  const farm = useRef(rng.shuffle([...ANIMALS]).slice(0, count)).current
  const lights = showLights(level)
  const ms = stepMs(level)
  const [round, setRound] = useState(0)
  const [seq, setSeq] = useState(() => makeSequence(rng, seqLength(level, 0), count))
  const [phase, setPhase] = useState<Phase>('listen')
  const [playKey, setPlayKey] = useState(0)
  const [pos, setPos] = useState(0)
  const [lit, setLit] = useState<number | null>(null)
  const [calling, setCalling] = useState(false)
  const [lives, setLives] = useState(LIVES)
  const [score, setScore] = useState(0)
  const [combo, setCombo] = useState(0)
  const [replayed, setReplayed] = useState(false)
  const [message, setMessage] = useState('')
  const perfect = useRef(0)
  const [pops, addPop] = usePops()
  const [boardRef, shake] = useShake<HTMLDivElement>()
  const later = useTimeouts()

  useEffect(() => preloadVoices(farm), [])

  const call = (i: number, glow: boolean) => {
    voices[farm[i]]()
    if (glow) setLit(i)
    else setCalling(true)
    later(() => {
      setLit((c) => (c === i ? null : c))
      setCalling(false)
    }, ms * 0.7)
  }

  // Play the calls whenever we enter "listen".
  useEffect(() => {
    if (phase !== 'listen') return
    setMessage(t('listen'))
    seq.forEach((a, i) => later(() => call(a, lights), 700 + i * ms))
    later(() => {
      setPos(0)
      setPhase('input')
      setMessage(t('yourTurn'))
    }, 700 + seq.length * ms)
  }, [phase, playKey])

  const finish = (s: number) => {
    setPhase('done')
    onFinish({ score: s, accuracy: perfect.current / ROUNDS })
  }

  const nextRound = (s: number, livesLeft: number) => {
    const r = round + 1
    if (r >= ROUNDS || livesLeft <= 0) {
      later(() => finish(s), 900)
      return
    }
    later(() => {
      setRound(r)
      setSeq(makeSequence(rng, seqLength(level, r), count))
      setReplayed(false)
      setPhase('listen')
      setPlayKey((k) => k + 1)
    }, 1200)
  }

  const tap = (i: number) => {
    if (phase !== 'input') return
    if (i !== seq[pos]) {
      sound.bad()
      vibrate(50)
      shake()
      setLit(seq[pos])
      later(() => setLit(null), 700)
      const left = lives - 1
      setLives(left)
      setCombo(0)
      setMessage(t('oops', { animal: faces[farm[seq[pos]]] }))
      setPhase('between')
      nextRound(score, left)
      return
    }
    voices[farm[i]]()
    setLit(i)
    later(() => setLit((c) => (c === i ? null : c)), 300)
    if (pos + 1 < seq.length) {
      setPos(pos + 1)
      return
    }
    const c = combo + 1
    const pts = roundPoints(seq.length, replayed, c)
    const s = score + pts
    if (!replayed) perfect.current++
    setCombo(c)
    setScore(s)
    setMessage(t('great'))
    setPhase('between')
    later(() => {
      sound.good(c * 2)
      addPop(`+${pts}`, 50, 40)
    }, 450)
    nextRound(s, lives)
  }

  const replay = () => {
    if (phase !== 'input' || pos > 0 || replayed) return
    setReplayed(true)
    setPhase('listen')
    setPlayKey((k) => k + 1)
  }

  return (
    <div className="game animal-sounds">
      <Hud
        items={[
          { label: t('score'), value: score },
          { label: t('round'), value: `${Math.min(round + 1, ROUNDS)} / ${ROUNDS}` },
          { label: t('lives'), value: <Hearts left={lives} total={LIVES} /> },
        ]}
      />
      <p className="prompt">{message}</p>
      <div className={`as-ear${calling ? ' as-calling' : ''}`} aria-hidden>
        {phase === 'listen' ? '👂' : phase === 'input' ? `${pos} / ${seq.length}` : ''}
      </div>
      <div ref={boardRef} className={`as-farm as-farm-${count}`}>
        {farm.map((a, i) => (
          <button
            key={a}
            className={`as-animal${lit === i ? ' as-lit' : ''}`}
            onPointerDown={() => tap(i)}
            disabled={phase !== 'input'}
            aria-label={t(a)}
          >
            <span className="as-face">{faces[a]}</span>
          </button>
        ))}
        <Pops pops={pops} />
      </div>
      <button className="as-again" onClick={replay} disabled={phase !== 'input' || pos > 0 || replayed}>
        🔁 {t('again')}
      </button>
    </div>
  )
}
