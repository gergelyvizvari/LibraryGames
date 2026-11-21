import { useEffect, useRef, useState } from 'react'
import { useTimeouts } from '../../kit/hooks'
import { PaintedScene, type PaintedView } from '../../kit/painted'
import { makeRng } from '../../kit/random'
import { SceneTool } from '../../kit/scene'
import { useStage } from '../../kit/SceneShell'
import { sound } from '../../kit/sound'
import type { GameProps } from '../../kit/types'
import { finish, finished, makeSky, moves, refusal, SKIES, stuck, type Cell, type Sky } from './logic'
import skyTall from './art/sky-tall.webp'
import skyWide from './art/sky.webp'
import { PAD, SkyMap, TOP, boardH, boardW, type Face } from './Sky'

type Mood = 'idle' | 'happy' | 'sad'
type ViewId = 'wide' | 'tall'

/** The cloud-top post office in the sky; the open sky in the middle holds the grid of clouds. */
const VIEWS: PaintedView<ViewId>[] = [
  { id: 'wide', painting: skyWide, world: { w: 1280, h: 800 }, focus: { x: 250, y: 40, w: 780, h: 640 }, ground: '#e6ced6', sayAt: { x: 960, y: 140 } },
  { id: 'tall', painting: skyTall, world: { w: 720, h: 1152 }, focus: { x: 10, y: 250, w: 700, h: 760 }, ground: '#e5cccf', sayAt: { x: 300, y: 300 } },
]

/** The box in each painting the cloud grid is fitted into. */
const BOX: Record<ViewId, { x: number; y: number; w: number; h: number }> = {
  wide: { x: 300, y: 70, w: 680, h: 600 },
  tall: { x: 30, y: 320, w: 660, h: 680 },
}

/** The pegasus blinks now and then while it waits. */
function useBlink(on: boolean) {
  const [shut, setShut] = useState(false)
  useEffect(() => {
    if (!on) return
    let timer = 0
    const next = (open: boolean) => {
      timer = window.setTimeout(
        () => {
          setShut(open)
          next(!open)
        },
        open ? 2600 + Math.random() * 2600 : 150,
      )
    }
    next(true)
    return () => {
      clearTimeout(timer)
      setShut(false)
    }
  }, [on])
  return shut
}

// A rising scale: every delivered letter sings one note higher.
const notes = [262, 294, 330, 349, 392, 440, 494, 523]

export default function PegasusPost({ level, seed, t, onFinish }: GameProps) {
  const rng = useRef(makeRng(seed)).current
  const [sky, setSky] = useState<Sky>(() => makeSky(rng, level))
  const [route, setRoute] = useState<Cell[]>([sky.start])
  const [mood, setMood] = useState<Mood>('idle')
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

  const blink = useBlink(mood === 'idle' && !flying)
  const face: Face = mood !== 'idle' ? mood : blink ? 'blink' : 'idle'
  return (
    <PaintedScene
      views={VIEWS}
      say={say}
      stage={stage}
      className="pegasus-post"
      trayHeight={110}
      tray={
        <div className="pp-tray">
          <SceneTool kind="undo" label={t('undo')} onPress={back} disabled={locked || route.length < 2} />
          <SceneTool kind="restart" label={t('restart')} onPress={restart} disabled={locked || route.length < 2} />
          {deadEnds >= 2 && <SceneTool kind="hint" label={t('hint')} onPress={help} disabled={locked} />}
        </div>
      }
    >
      {(view) => {
        // The grid as big as its box allows, centred in it.
        const box = BOX[view]
        const W = boardW(sky)
        const H = boardH(sky)
        const k = Math.min(box.w / W, box.h / H)
        return (
          <div
            key={stage.done}
            className="pp-board"
            role="group"
            aria-label={t('sky')}
            style={{ left: box.x + (box.w - W * k) / 2, top: box.y + (box.h - H * k) / 2, width: W * k, height: H * k, ['--pp-cols' as string]: sky.cols, ['--pp-rows' as string]: sky.rows }}
          >
            <SkyMap sky={sky} route={route} open={level <= 2 && !locked ? moves(sky, route) : []} hint={hint} face={face} flying={flying} />
            <div className="pp-cells" style={{ inset: `${((PAD + TOP) / H) * 100}% ${(PAD / W) * 100}% ${(PAD / H) * 100}%` }}>
              {sky.clouds.map((on, c) => (on ? <button key={c} className="pp-cell" onPointerDown={() => fly(c)} disabled={locked} aria-label={label(c)} /> : <span key={c} />))}
            </div>
          </div>
        )
      }}
    </PaintedScene>
  )
}
