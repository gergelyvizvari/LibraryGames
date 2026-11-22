import { useEffect, useRef, useState } from 'react'
import { useTimeouts } from '../../kit/hooks'
import { makeRng } from '../../kit/random'
import { SceneTool } from '../../kit/scene'
import { PaintedScene, type PaintedView } from '../../kit/painted'
import { useStage } from '../../kit/SceneShell'
import { sound } from '../../kit/sound'
import type { GameProps } from '../../kit/types'
import gardenTall from './art/garden-tall.webp'
import garden from './art/garden.webp'
import { Garden } from './Garden'
import { E, N, S, W, makeMaze, sizeFor, step } from './logic'

type ViewId = 'wide' | 'tall'

/** The garden at the edge of the woods; the hedge maze lies on its lawn. */
const VIEWS: PaintedView<ViewId>[] = [
  { id: 'wide', painting: garden, world: { w: 1280, h: 800 }, focus: { x: 280, y: 150, w: 720, h: 570 }, ground: '#acb42f', sayAt: { x: 1120, y: 300 } },
  { id: 'tall', painting: gardenTall, world: { w: 720, h: 1152 }, focus: { x: 0, y: 220, w: 720, h: 920 }, ground: '#95ab2e', sayAt: { x: 360, y: 320 } },
]

/** The lawn box the maze is fitted into (keeping its shape). */
const LAWN: Record<ViewId, { x: number; y: number; w: number; h: number }> = {
  wide: { x: 300, y: 190, w: 680, h: 460 },
  tall: { x: 50, y: 350, w: 620, h: 780 },
}

/** Mazes in one stage. */
const STAGE = 3
const keys: Record<string, number> = { ArrowUp: N, ArrowRight: E, ArrowDown: S, ArrowLeft: W, w: N, d: E, s: S, a: W }

export default function MazeDash({ level, seed, t, onFinish }: GameProps) {
  const rng = useRef(makeRng(seed)).current
  const newMaze = (solved: number) => {
    const { w, h } = sizeFor(level, solved)
    return makeMaze(rng, w, h)
  }
  const [maze, setMaze] = useState(() => newMaze(0))
  const [pos, setPos] = useState(0)
  const [trail, setTrail] = useState<number[]>([0])
  const [solved, setSolved] = useState(0)
  const [busy, setBusy] = useState(false)
  const touch = useRef<{ x: number; y: number } | null>(null)
  const later = useTimeouts()
  const goal = maze.w * maze.h - 1

  const stage = useStage(STAGE, onFinish)
  const over = stage.over

  const move = (dir: number) => {
    if (over || busy) return
    const next = step(maze, pos, dir)
    if (next === pos) {
      sound.tone(180, 0.05, 'square', 0.06)
      return
    }
    sound.tone(600, 0.03, 'triangle', 0.08)
    setPos(next)
    setTrail((tr) => (tr.includes(next) ? tr : [...tr, next]))
    if (next !== goal) return
    setSolved((n) => n + 1)
    setBusy(true)
    if (stage.good(maze.w * maze.h)) return
    later(() => {
      setMaze(newMaze(solved + 1))
      setPos(0)
      setTrail([0])
      setBusy(false)
    }, 900)
  }
  const moveRef = useRef(move)
  moveRef.current = move

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const d = keys[e.key]
      if (d) {
        e.preventDefault()
        moveRef.current(d)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  return (
    <PaintedScene
      views={VIEWS}
      say={t('say')}
      stage={stage}
      className="maze-dash"
      tray={
        <div className="md-pad">
          <span />
          <SceneTool kind="up" label={t('up')} hideLabel onPress={() => move(N)} />
          <span />
          <SceneTool kind="left" label={t('left')} hideLabel onPress={() => move(W)} />
          <SceneTool kind="down" label={t('down')} hideLabel onPress={() => move(S)} />
          <SceneTool kind="right" label={t('right')} hideLabel onPress={() => move(E)} />
        </div>
      }
      trayHeight={150}
    >
      {(view) => {
        const lawn = LAWN[view]
        // The maze's frame reaches 30 units past each side of its squares (100 units each).
        const k = Math.min(lawn.w / (maze.w * 100 + 60), lawn.h / (maze.h * 100 + 60))
        const w = maze.w * 100 * k
        const h = maze.h * 100 * k
        return (
      <div
        className="md-maze"
        key={solved}
        style={{ left: lawn.x + (lawn.w - w) / 2, top: lawn.y + (lawn.h - h) / 2, width: w, height: h }}
        onPointerDown={(e) => (touch.current = { x: e.clientX, y: e.clientY })}
        onPointerUp={(e) => {
          const start = touch.current
          touch.current = null
          if (!start) return
          const dx = e.clientX - start.x
          const dy = e.clientY - start.y
          if (Math.max(Math.abs(dx), Math.abs(dy)) < 24) return
          move(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? E : W) : dy > 0 ? S : N)
        }}
      >
        <Garden maze={maze} pos={pos} trail={trail} won={busy} />
      </div>
        )
      }}
    </PaintedScene>
  )
}
