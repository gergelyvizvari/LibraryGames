import { useRef, useState } from 'react'
import { useTimeouts } from '../../kit/hooks'
import { PonyGuide, type PonyMood } from '../../kit/ponies'
import { makeRng } from '../../kit/random'
import { SceneTool } from '../../kit/scene'
import { SceneShell, useStage } from '../../kit/SceneShell'
import { sound } from '../../kit/sound'
import type { GameProps } from '../../kit/types'
import { finish, finished, makeSky, moves, refusal, SKIES, stuck, type Cell, type Sky } from './logic'
import { PAD, PostBag, SkyMap, TOP, boardH, boardW } from './Sky'

// A rising scale: every delivered letter sings one note higher.
const notes = [262, 294, 330, 349, 392, 440, 494, 523]

export default function PegasusPost({ level, seed, t, onFinish }: GameProps) {
  const rng = useRef(makeRng(seed)).current
  const [sky, setSky] = useState<Sky>(() => makeSky(rng, level))
  const [route, setRoute] = useState<Cell[]>([sky.start])
  const [mood, setMood] = useState<PonyMood>('idle')
  const [hint, setHint] = useState<Cell | null>(null)
  const [flying, setFlying] = useState(false)
  /** Dead ends in this sky: after the second one the help button appears. */
  const [deadEnds, setDeadEnds] = useState(0)
  const first = (s: Sky) => t(s.home === null ? 'say' : 'sayGate')
  const [say, setSay] = useState(() => first(sky))
  const stage = useStage(SKIES, onFinish)
  const later = useTimeouts()
  const done = finished(sky, route)
  const locked = done || stage.over
  const here = route[route.length - 1]

  /** The wings beat for as long as the flight to the next cloud takes. */
  const takeOff = () => {
    setFlying(true)
    later(() => setFlying(false), 700)
  }

  const frown = () => {
    setMood('sad')
    later(() => setMood((m) => (m === 'sad' ? 'idle' : m)), 800)
  }

  const back = () => {
    if (locked || route.length < 2) return
    sound.tap()
    takeOff()
    setRoute(route.slice(0, -1))
    setHint(null)
    setSay(first(sky))
  }

  const restart = () => {
    if (locked || route.length < 2) return
    sound.tap()
    setRoute([sky.start])
    setHint(null)
    setSay(first(sky))
  }

  const fly = (c: Cell) => {
    if (locked) return
    if (route.length > 1 && c === route[route.length - 2]) return back()
    if (c === here) return
    const no = refusal(sky, route, c)
    if (no) {
      sound.tone(200, 0.06, 'square', 0.05)
      frown()
      setSay(t(no))
      return
    }
    const next = [...route, c]
    takeOff()
    setRoute(next)
    setHint(null)
    if (finished(sky, next)) {
      later(() => setMood('happy'), 720)
      setSay(t('done'))
      if (stage.good()) return
      later(() => {
        const fresh = makeSky(rng, level)
        setSky(fresh)
        setRoute([fresh.start])
        setDeadEnds(0)
        setMood('idle')
        setSay(first(fresh))
      }, 2000)
      return
    }
    sound.tone(notes[(next.length - 2) % notes.length], 0.1, 'triangle', 0.12)
    if (stuck(sky, next)) {
      // Nowhere left to fly: nothing is lost, the way back is always open.
      later(() => {
        stage.slip()
        frown()
        setDeadEnds((n) => n + 1)
        setSay(t('stuck'))
      }, 350)
    } else setSay(first(sky))
  }

  const help = () => {
    if (locked) return
    const rest = finish(sky, route)
    sound.tone(660, 0.08, 'sine', 0.1)
    if (rest) {
      setHint(rest[0])
      setSay(t('hintGo'))
    } else {
      setHint(null)
      setSay(t('hintBack'))
    }
  }

  const label = (c: Cell) => {
    const what = c === sky.start ? t('start') : c === sky.home ? t('home') : t(route.includes(c) ? 'delivered' : 'house')
    return c === here ? `${what}, ${t('here')}` : what
  }

  return (
    <SceneShell
      place="woods"
      say={say}
      stage={stage}
      bare
      className="pegasus-post"
      guide={
        <PonyGuide kind="pegasus" mood={stage.mood === 'happy' ? 'happy' : stage.mood === 'oops' ? 'sad' : 'idle'}>
          <PostBag />
        </PonyGuide>
      }
      tray={
        <div className="pp-tray">
          <SceneTool kind="undo" label={t('undo')} onPress={back} disabled={locked || route.length < 2} />
          <SceneTool kind="restart" label={t('restart')} onPress={restart} disabled={locked || route.length < 2} />
          {deadEnds >= 2 && <SceneTool kind="hint" label={t('hint')} onPress={help} disabled={locked} />}
        </div>
      }
    >
      <div key={stage.done} className="pp-board" role="group" aria-label={t('sky')} style={{ ['--pp-cols' as string]: sky.cols, ['--pp-rows' as string]: sky.rows }}>
        <SkyMap sky={sky} route={route} open={level <= 2 && !locked ? moves(sky, route) : []} hint={hint} mood={mood} flying={flying} />
        <div className="pp-cells" style={{ inset: `${((PAD + TOP) / boardH(sky)) * 100}% ${(PAD / boardW(sky)) * 100}% ${(PAD / boardH(sky)) * 100}%` }}>
          {sky.clouds.map((on, c) => (on ? <button key={c} className="pp-cell" onPointerDown={() => fly(c)} disabled={locked} aria-label={label(c)} /> : <span key={c} />))}
        </div>
      </div>
    </SceneShell>
  )
}
