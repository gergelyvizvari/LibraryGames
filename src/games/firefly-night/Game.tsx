import { useRef, useState } from 'react'
import { useGameLoop, useTimeouts } from '../../kit/hooks'
import { makeRng } from '../../kit/random'
import { SceneShell, useStage } from '../../kit/SceneShell'
import type { GameProps } from '../../kit/types'
import { FireflyArt, JarArt, NightArt } from './Art'
import { drift, glowing, spawn, specFor, STAGE, type Fly } from './logic'

interface Flying extends Fly {
  born: number
}

export default function FireflyNight({ level, seed, t, onFinish }: GameProps) {
  const rng = useRef(makeRng(seed)).current
  const spec = specFor(level)
  const nextId = useRef(0)
  const make = (now: number): Flying => ({ ...spawn(rng, spec, nextId.current++), born: now })
  const world = useRef<{ time: number; flies: Flying[] } | null>(null)
  world.current ??= { time: 0, flies: Array.from({ length: spec.count }, () => make(0)) }
  const [, setFrame] = useState(0)
  const [caught, setCaught] = useState(0)
  const [trail, setTrail] = useState<{ id: number; x: number; y: number }[]>([])
  const [asleep, setAsleep] = useState<number | null>(null)
  const stage = useStage(STAGE, onFinish)
  const later = useTimeouts()

  useGameLoop((dt) => {
    const w = world.current!
    w.time += dt
    w.flies = w.flies.map((f) => ({ ...drift(f, dt), born: f.born }))
    setFrame((n) => n + 1)
  }, !stage.over)

  const w = world.current
  const lit = (f: Flying) => glowing(f, w.time - f.born, spec)

  const tap = (f: Flying) => {
    if (stage.over) return
    if (!lit(f)) {
      stage.slip()
      setAsleep(f.id)
      return
    }
    setAsleep(null)
    // The caught firefly flies to the jar; a new one wakes up somewhere else.
    w.flies = w.flies.map((g) => (g.id === f.id ? make(w.time) : g))
    setTrail((tr) => [...tr, { id: f.id, x: f.x, y: f.y }])
    later(() => setTrail((tr) => tr.filter((x) => x.id !== f.id)), 600)
    setCaught((c) => c + 1)
    stage.good()
  }

  const say = stage.over ? t('done') : asleep !== null ? t('asleep') : caught > 0 ? t('more') : t('say')

  return (
    <SceneShell place="meadow" say={say} stage={stage} bare fill className="firefly-night">
      <div className="ff-field">
        <NightArt />
        {!stage.over &&
          w.flies.map((f) => {
            const on = lit(f)
            return (
              <button
                key={f.id}
                className={`ff-fly${on ? ' ff-lit' : ''}${asleep === f.id ? ' ff-no' : ''}`}
                style={{ left: `${f.x}%`, top: `${f.y}%` }}
                onPointerDown={() => tap(f)}
                onAnimationEnd={() => asleep === f.id && setAsleep(null)}
                aria-label={t(on ? 'lit' : 'dark')}
              >
                <FireflyArt lit={on} />
              </button>
            )
          })}
        {trail.map((tr) => (
          <span key={tr.id} className="ff-trail" style={{ left: `${tr.x}%`, top: `${tr.y}%` }} />
        ))}
        <span className={`ff-jar${stage.over ? ' ff-full' : ''}`}>
          <JarArt caught={caught} total={STAGE} />
        </span>
      </div>
    </SceneShell>
  )
}
