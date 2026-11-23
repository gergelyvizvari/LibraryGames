import { useEffect, useRef, useState } from 'react'
import { useGameLoop, useShake } from '../../kit/hooks'
import { PaintedScene, worldStyle, type PaintedView } from '../../kit/painted'
import { useStage } from '../../kit/SceneShell'
import { sound } from '../../kit/sound'
import type { GameProps } from '../../kit/types'
import { drop, speedFor, type Block } from './logic'

const ART = import.meta.glob<string>('./art/*.webp', { eager: true, import: 'default' })
const art = (name: string) => ART[`./art/${name}.webp`]

type ViewId = 'wide' | 'tall'
type Face = 'idle' | 'blink' | 'happy' | 'sad'
const FACES: Face[] = ['idle', 'blink', 'happy', 'sad']

/** The meadow building site; the tower rises from the stone foundation into the open sky. */
const VIEWS: PaintedView<ViewId>[] = [
  { id: 'wide', painting: art('site'), world: { w: 1280, h: 800 }, focus: { x: 180, y: 20, w: 920, h: 780 }, ground: '#b7b145', sayAt: { x: 980, y: 260 } },
  { id: 'tall', painting: art('site-tall'), world: { w: 720, h: 1152 }, focus: { x: 0, y: 60, w: 720, h: 1060 }, ground: '#b3b14e', sayAt: { x: 360, y: 150 } },
]

/** The box the blocks move in (its bottom on the foundation's top), and the beaver. */
const SPOTS: Record<ViewId, { field: { x: number; y: number; w: number; h: number }; beaver: { x: number; bottom: number; h: number } }> = {
  wide: { field: { x: 320, y: 40, w: 600, h: 665 }, beaver: { x: 290, bottom: 775, h: 230 } },
  tall: { field: { x: 60, y: 160, w: 600, h: 850 }, beaver: { x: 610, bottom: 1120, h: 190 } },
}

/** The beaver blinks now and then while it waits. */
function useBlink() {
  const [shut, setShut] = useState(false)
  useEffect(() => {
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
    return () => clearTimeout(timer)
  }, [])
  return shut
}

/** Floors to build in one stage. */
const STAGE = 18
const START: Block = { x: 30, w: 40 }
/** Floors on screen: the tower grows to about 70% of the sky, then slides down as it climbs on. */
const VISIBLE = 7
// Soft painted-wood tints, multiplied over the painted grain.
const colors = ['#ffb3b3', '#ffe48f', '#aaf0cc', '#ace0ff', '#d6ccff', '#ffcaee', '#ffcf98']

export default function TowerStack({ level, t, onFinish }: GameProps) {
  const [tower, setTower] = useState<Block[]>([START])
  const moving = useRef({ x: 0, dir: 1 })
  const [movingX, setMovingX] = useState(0)
  const stage = useStage(STAGE, onFinish)
  const over = stage.over
  const [falling, setFalling] = useState<{ id: number; x: number; w: number; floor: number }[]>([])
  const fallId = useRef(0)
  const [ref, shake] = useShake<HTMLDivElement>()
  const blink = useBlink()
  const [mood, setMood] = useState<'happy' | 'sad' | null>(null)
  const moodRun = useRef(0)
  const feel = (m: 'happy' | 'sad') => {
    const run = ++moodRun.current
    setMood(m)
    setTimeout(() => moodRun.current === run && setMood(null), 700)
  }

  const top = tower[tower.length - 1]
  const floors = tower.length - 1
  const speed = speedFor(level, floors)

  useGameLoop((dt) => {
    const m = moving.current
    m.x += m.dir * speed * dt
    const max = 100 - top.w
    if (m.x >= max) {
      m.x = max
      m.dir = -1
    } else if (m.x <= 0) {
      m.x = 0
      m.dir = 1
    }
    setMovingX(m.x)
  }, !over)

  const tap = () => {
    if (over) return
    const r = drop({ x: moving.current.x, w: top.w }, top)
    if (!r.placed) {
      // A block that misses the tower just falls: nothing is lost, the next one comes.
      stage.slip()
      feel('sad')
      shake()
      setFalling((f) => [...f, { id: fallId.current++, x: moving.current.x, w: top.w, floor: floors + 1 }])
      return
    }
    setTower([...tower, r.placed])
    if (!r.perfect) {
      sound.tone(300 + floors * 25, 0.12, 'triangle', 0.2)
      if (r.cut > 0) {
        const cutX = moving.current.x < top.x ? moving.current.x : r.placed.x + r.placed.w
        setFalling((f) => [...f, { id: fallId.current++, x: cutX, w: r.cut, floor: floors + 1 }])
      }
    }
    // Start the next block from the side it is furthest from.
    moving.current = { x: moving.current.dir > 0 ? 0 : 100 - r.placed.w, dir: moving.current.dir }
    if (r.perfect) feel('happy')
    stage.good(r.perfect ? 25 : 10)
  }

  const base = Math.max(0, tower.length - VISIBLE)
  const shown = tower.slice(base)
  const rowH = 100 / 11
  const y = (floor: number) => 100 - (floor - base + 1) * rowH

  const face: Face = over ? 'happy' : mood ?? (blink ? 'blink' : 'idle')
  return (
    <PaintedScene views={VIEWS} say={t('tap')} stage={stage} className="tower-stack">
      {(view) => {
        const at = SPOTS[view]
        return (
          <>
      <div data-speaker className={`ts-beaver${mood === 'happy' || over ? ' ts-hop' : ''}`} style={worldStyle(at.beaver.x, at.beaver.bottom, at.beaver.h)}>
        {FACES.map((f) => (
          <img key={f} src={art(f === 'idle' ? 'beaver' : `beaver-${f}`)} alt="" draggable={false} className={f === face ? '' : 'ts-off'} />
        ))}
      </div>
      <div className="ts-sky" ref={ref} onPointerDown={tap} style={{ left: at.field.x, top: at.field.y, width: at.field.w, height: at.field.h, ['--ts-wood' as string]: `url(${art('wood')})` }}>
        {shown.map((b, i) => (
          <div
            key={base + i}
            className="ts-block"
            style={{ left: `${b.x}%`, width: `${b.w}%`, top: `${y(base + i)}%`, height: `${rowH}%`, backgroundColor: colors[(base + i) % colors.length] }}
          />
        ))}
        {!over && (
          <div
            className="ts-block ts-moving"
            style={{ left: `${movingX}%`, width: `${top.w}%`, top: `${y(tower.length)}%`, height: `${rowH}%`, backgroundColor: colors[tower.length % colors.length] }}
          />
        )}
        {falling.map((f) => (
          <div
            key={f.id}
            className="ts-block ts-falling"
            style={{ left: `${f.x}%`, width: `${f.w}%`, top: `${y(f.floor)}%`, height: `${rowH}%` }}
            onAnimationEnd={() => setFalling((all) => all.filter((a) => a.id !== f.id))}
          />
        ))}
      </div>
          </>
        )
      }}
    </PaintedScene>
  )
}
