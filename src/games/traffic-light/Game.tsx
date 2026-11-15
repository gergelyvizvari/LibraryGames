import { useEffect, useRef, useState } from 'react'
import { useTimeouts } from '../../kit/hooks'
import { makeRng } from '../../kit/random'
import { SceneShell, useStage } from '../../kit/SceneShell'
import { Thing } from '../../kit/things'
import { sound } from '../../kit/sound'
import type { GameProps } from '../../kit/types'
import { Hedgehog, LightArt, RoadArt } from './Art'
import { nextLight, progress, specFor, STAGE, tapOn, type Light } from './logic'

/** Where the hedgehog stands, in % from the top: the near kerb and the far kerb. */
const NEAR = 86
const FAR = 14

export default function TrafficLight({ level, seed, t, onFinish }: GameProps) {
  const rng = useRef(makeRng(seed)).current
  const spec = specFor(level)
  const [light, setLight] = useState<Light>('red')
  // Bumped on every change of the light, so the timer for the next one starts over.
  const [cycle, setCycle] = useState(0)
  const lightMs = useRef(rng.int(spec.redMin, spec.redMax))
  const [step, setStep] = useState(0)
  const [crossing, setCrossing] = useState(0)
  const [solved, setSolved] = useState(false)
  const [wrong, setWrong] = useState<Light | null>(null)
  const [hops, setHops] = useState(0)
  const stage = useStage(STAGE, onFinish)
  const later = useTimeouts()

  const change = (now: Light) => {
    const next = nextLight(rng, spec, now)
    lightMs.current = next.ms
    setLight(next.light)
    setCycle((c) => c + 1)
    if (next.light === 'green') sound.tone(990, 0.08, 'sine', 0.08)
  }

  useEffect(() => {
    if (solved || stage.over) return
    const id = window.setTimeout(() => change(light), lightMs.current)
    return () => clearTimeout(id)
    // The light only moves on when the cycle does; `change` reads the latest light itself.
  }, [cycle, solved, stage.over])

  const tap = () => {
    if (solved || stage.over) return
    if (tapOn(light) === 'wait') {
      stage.slip()
      setWrong(light)
      return
    }
    const n = step + 1
    setStep(n)
    setHops((h) => h + 1)
    setWrong(null)
    sound.tone(660, 0.08, 'triangle', 0.15)
    if (n < spec.steps) {
      change('green')
      return
    }
    setSolved(true)
    setLight('red')
    if (stage.good()) return
    later(() => {
      setSolved(false)
      setStep(0)
      setCrossing((c) => c + 1)
      lightMs.current = rng.int(spec.redMin, spec.redMax)
      setLight('red')
      setCycle((c) => c + 1)
    }, 1600)
  }

  const say = solved ? t('yes') : wrong === 'yellow' ? t('yellow') : wrong === 'red' ? t('wait') : t('say')
  const top = NEAR - (NEAR - FAR) * progress(step, spec.steps)

  return (
    <SceneShell place="meadow" say={say} stage={stage} bare fill className="traffic-light">
      <div className={`tl-field tl-${light}`} onPointerDown={tap} role="button" aria-label={t(`light.${light}`)}>
        <RoadArt />
        <span className={`tl-apple${solved ? ' tl-eaten' : ''}`} key={`a${crossing}`}>
          <Thing id="apple" />
        </span>
        <span className="tl-light">
          <LightArt light={light} />
        </span>
        <span className="tl-hog" style={{ top: `${top}%` }}>
          <span className={`tl-hog-art${solved ? ' tl-hop' : wrong ? ' tl-no' : ''}`} key={`h${hops}`} onAnimationEnd={() => setWrong(null)}>
            <Hedgehog happy={solved} />
          </span>
        </span>
      </div>
    </SceneShell>
  )
}
