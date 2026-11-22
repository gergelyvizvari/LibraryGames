import { useRef, useState } from 'react'
import { useGameLoop, useShake } from '../../kit/hooks'
import { makeRng } from '../../kit/random'
import { PaintedScene, type PaintedView } from '../../kit/painted'
import { useStage } from '../../kit/SceneShell'
import type { GameProps } from '../../kit/types'
import { HOLES, pickCritter, points, spawnGap, upTime, type Critter } from './logic'

/** Moles to tap in one stage. */
const STAGE = 10

/** Each critter's painted pictures: peeking, and tapped (art/<critter>[-hit].webp). */
const ART = import.meta.glob<string>('./art/*.webp', { eager: true, import: 'default' })
const art = (name: string) => ART[`./art/${name}.webp`]

type ViewId = 'wide' | 'tall'

/** The vegetable garden; the molehills lie on its soil in three rows of three. */
const VIEWS: PaintedView<ViewId>[] = [
  { id: 'wide', painting: art('garden'), world: { w: 1280, h: 800 }, focus: { x: 200, y: 100, w: 880, h: 640 }, ground: '#aaa92b', sayAt: { x: 640, y: 150 } },
  { id: 'tall', painting: art('garden-tall'), world: { w: 720, h: 1152 }, focus: { x: 0, y: 200, w: 720, h: 840 }, ground: '#a29e3d', sayAt: { x: 360, y: 270 } },
]

/** The molehills' columns, the rows (the bottom of each molehill) and a molehill's width. */
const GRID: Record<ViewId, { cols: number[]; rows: number[]; w: number }> = {
  wide: { cols: [370, 630, 890], rows: [400, 560, 720], w: 245 },
  tall: { cols: [130, 360, 590], rows: [510, 740, 970], w: 215 },
}

/** Where the hole is in the molehill picture (364 × 150): its middle, as fractions. */
const HOLE = { x: 0.5, y: 0.27 }

interface Up {
  kind: Critter
  until: number
  hit?: boolean
}

export default function MolePop({ level, seed, t, onFinish }: GameProps) {
  const rng = useRef(makeRng(seed)).current
  const state = useRef({ elapsed: 0, spawnIn: 0.6, holes: Array<Up | null>(HOLES).fill(null) })
  const [holes, setHoles] = useState<(Up | null)[]>(state.current.holes)
  const stage = useStage(STAGE, onFinish)
  const over = stage.over
  const [ref, shake] = useShake<HTMLDivElement>()

  useGameLoop((dt) => {
    const s = state.current
    s.elapsed += dt
    s.spawnIn -= dt
    // A mole that goes back down untapped is not a mistake: another one comes.
    s.holes = s.holes.map((h) => (!h || s.elapsed < h.until ? h : null))
    if (s.spawnIn <= 0) {
      s.spawnIn = spawnGap(level, s.elapsed)
      const free = s.holes.map((h, i) => (h ? -1 : i)).filter((i) => i >= 0)
      if (free.length) s.holes[rng.pick(free)] = { kind: pickCritter(rng, level), until: s.elapsed + upTime(level, s.elapsed) + 0.4 }
    }
    setHoles([...s.holes])
  }, !over)

  const whack = (i: number) => {
    const h = state.current.holes[i]
    if (over || !h || h.hit) return
    state.current.holes[i] = { ...h, hit: true, until: state.current.elapsed + 0.25 }
    if (h.kind === 'bunny') {
      stage.slip()
      shake()
      return
    }
    stage.good(points[h.kind])
  }

  return (
    <PaintedScene views={VIEWS} say={t('say')} stage={stage} className="mole-pop">
      {(view) => {
        const g = GRID[view]
        const mh = (g.w * 150) / 364
        return (
          <div className="mp-field" ref={ref}>
            {holes.map((h, i) => {
              const x = g.cols[i % 3]
              const bottom = g.rows[Math.floor(i / 3)]
              const top = bottom - mh
              return (
                <button key={i} className="mp-hole" onPointerDown={() => whack(i)} aria-label={`hole ${i + 1}`} style={{ left: x - g.w / 2, top: top - g.w * 0.62, width: g.w, height: mh + g.w * 0.62 }}>
                  <img className="mp-mound" src={art('hole')} alt="" draggable={false} />
                  {/* The critter rises out of the hole: cut off at the hole's middle. */}
                  <span className="mp-pit" style={{ bottom: mh * (1 - HOLE.y) }}>
                    <span className={`mp-critter${h ? ' mp-up' : ''}${h?.hit ? ' mp-hit' : ''}`}>
                      {h && <img src={art(h.hit ? `${h.kind}-hit` : h.kind)} alt="" draggable={false} />}
                    </span>
                  </span>
                </button>
              )
            })}
          </div>
        )
      }}
    </PaintedScene>
  )
}
