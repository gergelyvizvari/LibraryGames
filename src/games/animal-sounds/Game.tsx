import { useEffect, useRef, useState } from 'react'
import { useShake, useTimeouts } from '../../kit/hooks'
import { makeRng } from '../../kit/random'
import { SceneTool } from '../../kit/scene'
import { useStage } from '../../kit/SceneShell'
import { sound } from '../../kit/sound'
import { Emoji } from '../../kit/stickers'
import type { GameProps } from '../../kit/types'
import { ANIMALS, animalCount, makeSequence, roundPoints, seqLength, showLights, stepMs } from './logic'
import { preloadVoices, voices } from './voices'

import { PaintedScene, worldStyle, type PaintedView } from '../../kit/painted'
import farmTall from './art/farm-tall.webp'
import farm from './art/farm.webp'
const faces = { cat: '🐱', dog: '🐶', cow: '🐮', duck: '🦆', bird: '🐦', frog: '🐸', sheep: '🐑', pig: '🐷', rooster: '🐓', horse: '🐴' }

/** Each animal's painted pictures: calm, and calling with its mouth open (art/<animal>[-call].webp). */
const ART = import.meta.glob<string>('./art/*.webp', { eager: true, import: 'default' })
const art = (name: string) => ART[`./art/${name}.webp`]

type ViewId = 'wide' | 'tall'

/** The farmyard; the animals stand in rows in the open yard. */
const VIEWS: PaintedView<ViewId>[] = [
  { id: 'wide', painting: farm, world: { w: 1280, h: 800 }, focus: { x: 140, y: 60, w: 1000, h: 740 }, ground: '#b7ac25', sayAt: { x: 640, y: 300 } },
  { id: 'tall', painting: farmTall, world: { w: 720, h: 1152 }, focus: { x: 0, y: 330, w: 720, h: 780 }, ground: '#c0b224', sayAt: { x: 360, y: 400 } },
]

/** The yard the animals stand in (their feet from `top` to `bottom`) and the front row's animal height. */
const YARD: Record<ViewId, { left: number; right: number; top: number; bottom: number; h: number }> = {
  wide: { left: 250, right: 1030, top: 520, bottom: 775, h: 210 },
  tall: { left: 40, right: 680, top: 640, bottom: 1060, h: 230 },
}

/** Big animals stand taller than small ones, so they look right next to each other. */
const SIZE: Record<string, number> = { cow: 1.12, horse: 1.15, sheep: 0.98, pig: 0.9, dog: 0.92, cat: 0.92, rooster: 1, duck: 0.82, bird: 0.78, frog: 0.75 }

/** Where each animal stands: rows of 2 or 3, the back rows a little smaller. */
function spots(count: number, y: (typeof YARD)[ViewId]) {
  const perRow = count <= 4 ? 2 : 3
  const rows = Math.ceil(count / perRow)
  return Array.from({ length: count }, (_, i) => {
    const r = Math.floor(i / perRow)
    const c = i % perRow
    const k = rows > 1 ? r / (rows - 1) : 1
    const w = (y.right - y.left) * (0.86 + 0.14 * k)
    const cx = (y.left + y.right) / 2
    return { x: cx - w / 2 + (w / perRow) * (c + 0.5), bottom: y.top + (y.bottom - y.top) * (rows > 1 ? k : 1), h: y.h * (0.8 + 0.2 * k) }
  })
}

/** Calls to repeat in one stage. */
const STAGE = 5

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
  const stage = useStage(STAGE, onFinish)
  const [replayed, setReplayed] = useState(false)
  const [message, setMessage] = useState('')
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

  const nextRound = () => {
    const r = round + 1
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
      shake()
      sound.bad()
      setLit(seq[pos])
      later(() => setLit(null), 700)
      setMessage(t('oops', { animal: faces[farm[seq[pos]]] }))
      setPhase('between')
      if (!stage.miss()) nextRound()
      return
    }
    // A soft tick, not the call again: hearing every sequence twice gets tiring fast.
    sound.tap()
    setLit(i)
    later(() => setLit((c) => (c === i ? null : c)), 300)
    if (pos + 1 < seq.length) {
      setPos(pos + 1)
      return
    }
    setMessage(t('great'))
    setPhase('between')
    if (!stage.good(roundPoints(seq.length, replayed, 1))) nextRound()
  }

  const replay = () => {
    if (phase !== 'input' || pos > 0 || replayed) return
    setReplayed(true)
    setPhase('listen')
    setPlayKey((k) => k + 1)
  }

  return (
    <PaintedScene
      views={VIEWS}
      say={<Emoji e={message} />}
      stage={stage}
      className="animal-sounds"
      trayHeight={110}
      tray={
        <div className="an-tray">
          <span className={`an-ear${calling ? ' an-calling' : ''}`} aria-hidden>
            {phase === 'listen' ? '♪' : phase === 'input' ? `${pos} / ${seq.length}` : ''}
          </span>
          <SceneTool kind="listen" label={t('again')} onPress={replay} disabled={phase !== 'input' || pos > 0 || replayed} />
        </div>
      }
    >
      {(view) => {
        const at = spots(count, YARD[view])
        return (
          <div ref={boardRef} className="an-yard">
            {farm.map((a, i) => (
              <button
                key={a}
                className={`an-animal${lit === i ? ' an-lit' : ''}`}
                style={worldStyle(at[i].x, at[i].bottom, at[i].h * SIZE[a])}
                onPointerDown={() => tap(i)}
                disabled={phase !== 'input'}
                aria-label={t(a)}
              >
                <span className="an-glow" />
                <img src={art(a)} alt="" draggable={false} className={lit === i ? 'an-off' : ''} />
                <img src={art(`${a}-call`)} alt="" draggable={false} className={lit === i ? '' : 'an-off'} />
              </button>
            ))}
          </div>
        )
      }}
    </PaintedScene>
  )
}
