import { useEffect, useRef, useState } from 'react'
import { useTimeouts } from '../../kit/hooks'
import { makeRng } from '../../kit/random'
import { SceneShell, useStage } from '../../kit/SceneShell'
import { sound } from '../../kit/sound'
import type { GameProps } from '../../kit/types'
import { E, N, S, W, makeMaze, sizeFor, step } from './logic'

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

  const cell = (i: number) => {
    const o = maze.open[i]
    const wall = '3px solid var(--ink)'
    return {
      borderTop: o & N ? undefined : wall,
      borderRight: o & E ? undefined : wall,
      borderBottom: o & S ? undefined : wall,
      borderLeft: o & W ? undefined : wall,
    }
  }

  return (
    <SceneShell
      place="woods"
      say={t('say')}
      stage={stage}
      className="maze-dash"
      tray={
        <div className="md-pad">
          <span />
          <button className="md-btn" onPointerDown={() => move(N)} aria-label="up">⬆️</button>
          <span />
          <button className="md-btn" onPointerDown={() => move(W)} aria-label="left">⬅️</button>
          <button className="md-btn" onPointerDown={() => move(S)} aria-label="down">⬇️</button>
          <button className="md-btn" onPointerDown={() => move(E)} aria-label="right">➡️</button>
        </div>
      }
    >
      <div
        className="md-maze"
        key={solved}
        style={{ gridTemplateColumns: `repeat(${maze.w}, 1fr)`, aspectRatio: `${maze.w} / ${maze.h}` }}
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
        {maze.open.map((_, i) => (
          <div key={i} className={`md-cell${trail.includes(i) ? ' md-trail' : ''}`} style={cell(i)}>
            {i === pos ? '🐭' : i === goal ? '🧀' : ''}
          </div>
        ))}
      </div>
    </SceneShell>
  )
}
