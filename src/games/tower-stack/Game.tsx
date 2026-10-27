import { useRef, useState } from 'react'
import { useGameLoop, usePops, useShake } from '../../kit/hooks'
import { clamp } from '../../kit/random'
import { sound, vibrate } from '../../kit/sound'
import type { GameProps } from '../../kit/types'
import { Hearts, Hud, Pops } from '../../kit/ui'
import { drop, speedFor, type Block } from './logic'

const LIVES = 3
const START: Block = { x: 30, w: 40 }
const VISIBLE = 9
const colors = ['#ff6b6b', '#feca57', '#1dd1a1', '#48dbfb', '#a29bfe', '#ff9ff3', '#ff9f43']

export default function TowerStack({ level, t, onFinish }: GameProps) {
  const [tower, setTower] = useState<Block[]>([START])
  const moving = useRef({ x: 0, dir: 1 })
  const [movingX, setMovingX] = useState(0)
  const [lives, setLives] = useState(LIVES)
  const [score, setScore] = useState(0)
  const [perfects, setPerfects] = useState(0)
  const [over, setOver] = useState(false)
  const [falling, setFalling] = useState<{ id: number; x: number; w: number; floor: number }[]>([])
  const fallId = useRef(0)
  const [pops, addPop] = usePops()
  const [ref, shake] = useShake<HTMLDivElement>()

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

  const finish = (finalScore: number, finalFloors: number) => {
    setOver(true)
    onFinish({ score: finalScore, accuracy: clamp(finalFloors / (8 + level * 2), 0, 1) })
  }

  const tap = () => {
    if (over) return
    const r = drop({ x: moving.current.x, w: top.w }, top)
    if (!r.placed) {
      sound.bad()
      vibrate(80)
      shake()
      const left = lives - 1
      setLives(left)
      setFalling((f) => [...f, { id: fallId.current++, x: moving.current.x, w: top.w, floor: floors + 1 }])
      if (left <= 0) finish(score, floors)
      return
    }
    const gained = 10 + (r.perfect ? 15 : 0) + Math.floor(floors / 5) * 5
    const next = [...tower, r.placed]
    setTower(next)
    setScore(score + gained)
    if (r.perfect) {
      setPerfects((p) => p + 1)
      sound.good(perfects + 1)
      addPop(t('perfect'), 50, 30, 'info')
    } else {
      sound.tone(300 + floors * 25, 0.12, 'triangle', 0.2)
      if (r.cut > 0) {
        const cutX = moving.current.x < top.x ? moving.current.x : r.placed.x + r.placed.w
        setFalling((f) => [...f, { id: fallId.current++, x: cutX, w: r.cut, floor: floors + 1 }])
      }
    }
    // Start the next block from the side it is furthest from.
    moving.current = { x: moving.current.dir > 0 ? 0 : 100 - r.placed.w, dir: moving.current.dir }
    if (next.length > 40) finish(score + gained, next.length - 1)
  }

  const base = Math.max(0, tower.length - VISIBLE)
  const shown = tower.slice(base)
  const rowH = 100 / (VISIBLE + 2)
  const y = (floor: number) => 100 - (floor - base + 1) * rowH

  return (
    <div className="game tower-stack">
      <Hud
        items={[
          { label: t('score'), value: score },
          { label: t('floors'), value: floors, highlight: floors > 0 && floors % 5 === 0 },
          { label: t('lives'), value: <Hearts left={lives} total={LIVES} /> },
        ]}
      />
      <div className="ts-sky" ref={ref} onPointerDown={tap}>
        {shown.map((b, i) => (
          <div
            key={base + i}
            className="ts-block"
            style={{ left: `${b.x}%`, width: `${b.w}%`, top: `${y(base + i)}%`, height: `${rowH}%`, background: colors[(base + i) % colors.length] }}
          />
        ))}
        {!over && (
          <div
            className="ts-block ts-moving"
            style={{ left: `${movingX}%`, width: `${top.w}%`, top: `${y(tower.length)}%`, height: `${rowH}%`, background: colors[tower.length % colors.length] }}
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
        {floors === 0 && <div className="ts-tap">{t('tap')}</div>}
        <Pops pops={pops} />
      </div>
    </div>
  )
}
