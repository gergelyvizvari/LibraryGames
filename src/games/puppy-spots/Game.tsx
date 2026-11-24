import { useEffect, useMemo, useRef, useState } from 'react'
import { useTimeouts } from '../../kit/hooks'
import { PaintedScene, worldStyle, type PaintedView } from '../../kit/painted'
import { makeRng } from '../../kit/random'
import { SceneTool } from '../../kit/scene'
import { sound, vibrate } from '../../kit/sound'
import type { GameProps } from '../../kit/types'
import denTall from './art/den-tall.webp'
import den from './art/den.webp'
import mamaBlink from './art/mama-blink.webp'
import mamaHappy from './art/mama-happy.webp'
import mamaSad from './art/mama-sad.webp'
import mama from './art/mama.webp'
import { Basket, COATS, Rug } from './Den'
import {
  accuracyFor,
  clashes,
  giftsFor,
  hintFor,
  isSolved,
  makePuzzle,
  pointsFor,
  puzzlesFor,
  ruleBroken,
  ruleCells,
  showsBlocked,
  sizeFor,
  starved,
  type Cell,
  type Puzzle,
  type Rule,
  type Solved,
} from './logic'

type Tool = 'pup' | 'mark'
type Face = 'idle' | 'blink' | 'happy' | 'sad'
const MAMA: [Face, string][] = [
  ['idle', mama],
  ['blink', mamaBlink],
  ['happy', mamaHappy],
  ['sad', mamaSad],
]

type ViewId = 'wide' | 'tall'

/** The puppies' den; the rug lies in the middle of the floor and is the focus. */
const VIEWS: PaintedView<ViewId>[] = [
  { id: 'wide', painting: den, world: { w: 1280, h: 800 }, focus: { x: 250, y: 90, w: 860, h: 650 }, play: { x: 320, y: 140, w: 520, h: 520 }, ground: '#d7823e', sayAt: { x: 900, y: 330 } },
  { id: 'tall', painting: denTall, world: { w: 720, h: 1152 }, focus: { x: 0, y: 140, w: 720, h: 920 }, ground: '#a66633', sayAt: { x: 262, y: 402 } },
]

/** Where the rug lies (a square, without its fringe) and where the mother dog sits, in each painting. */
const SPOTS: Record<ViewId, { rug: { x: number; y: number; size: number }; mama: { x: number; bottom: number; h: number } }> = {
  wide: { rug: { x: 320, y: 140, size: 520 }, mama: { x: 1010, bottom: 700, h: 320 } },
  tall: { rug: { x: 50, y: 410, size: 620 }, mama: { x: 150, bottom: 392, h: 260 } },
}

/** The mother dog blinks now and then while she waits. */
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
const key = (r: number, c: number) => `${r},${c}`
const keys = (cells: Cell[]) => new Set(cells.map(([r, c]) => key(r, c)))
const without = (cells: Cell[], r: number, c: number) => cells.filter(([cr, cc]) => cr !== r || cc !== c)
const CLASH_KEY: Record<Rule, string> = { row: 'clashRow', col: 'clashCol', rug: 'clashRug', touch: 'clashTouch' }
const STUCK_KEY = { row: 'stuckRow', col: 'stuckCol', rug: 'stuckRug' } as const

/** A pup that broke a rule: both pups shake their heads, the squares that show why light up, then the new pup hops back off. */
interface Clash {
  cell: Cell
  other: Cell
  why: Set<string>
}

export default function PuppySpots({ level, seed, t, onFinish }: GameProps) {
  const rng = useRef(makeRng(seed)).current
  const n = sizeFor(level)
  const total = puzzlesFor(level)
  // A room, with the pups planted for the player (beginners only) taken from its answer.
  const newRoom = () => {
    const puzzle = makePuzzle(rng, n)
    const rows = rng.shuffle([...Array(n).keys()]).slice(0, giftsFor(level))
    return { puzzle, gifts: rows.map((r): Cell => [r, puzzle.solution[r]]) }
  }
  const [room, setRoom] = useState<{ puzzle: Puzzle; gifts: Cell[] }>(newRoom)
  const [pups, setPups] = useState<Cell[]>(room.gifts)
  const [marks, setMarks] = useState<Set<string>>(() => new Set())
  const [tool, setTool] = useState<Tool>('pup')
  const [clash, setClash] = useState<Clash | null>(null)
  const [mistakes, setMistakes] = useState(0)
  const [hints, setHints] = useState(0)
  const [done, setDone] = useState<Solved[]>([])
  const [streak, setStreak] = useState(0)
  const [score, setScore] = useState(0)
  const [message, setMessage] = useState(t('place'))
  const [busy, setBusy] = useState(false)
  const [over, setOver] = useState(false)
  const [tip, setTip] = useState<string | null>(null)
  const later = useTimeouts()
  const clashRun = useRef(0)
  const { puzzle, gifts } = room
  const { regions } = puzzle

  const pupAt = useMemo(() => keys(pups), [pups])
  const giftAt = useMemo(() => keys(gifts), [gifts])
  const blocked = useMemo(() => {
    const out = new Set<string>()
    if (busy || !showsBlocked(level)) return out
    for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) if (!pupAt.has(key(r, c)) && clashes(regions, pups, r, c)) out.add(key(r, c))
    return out
  }, [busy, level, n, regions, pups, pupAt])
  // A row, column or rug with no room left for its pup blinks, so a dead end is never a mystery.
  const stuck = useMemo(() => (busy ? null : starved(regions, pups)), [busy, regions, pups])
  const stuckAt = useMemo(() => keys(stuck?.cells ?? []), [stuck])

  /** The square a hint points at glows for a moment. */
  const popAt = (r: number, c: number) => {
    const k = key(r, c)
    setTip(k)
    later(() => setTip((now) => (now === k ? null : now)), 1200)
  }

  /** After a change that broke no rule: warn about a dead end, or go back to the plain prompt. */
  const settle = (next: Cell[], fallback: string) => {
    const dead = starved(regions, next)
    if (dead) sound.tone(220, 0.18, 'triangle', 0.1)
    setMessage(dead ? t(STUCK_KEY[dead.kind]) : fallback)
  }

  const finishRoom = (next: Cell[], m: number, h: number) => {
    const solved = { n, mistakes: m, hints: h }
    const clean = m === 0 && h === 0
    const run = clean ? streak + 1 : 0
    const gained = pointsFor(solved, run)
    const all = [...done, solved]
    const sum = score + gained
    setPups(next)
    setClash(null)
    setStreak(run)
    setDone(all)
    setScore(sum)
    setBusy(true)
    setMessage(t(clean ? 'perfect' : 'solved'))
    // A quiet ending: the pups give one happy hop.
    sound.win()
    if (all.length >= total) {
      setOver(true)
      later(() => onFinish({ score: sum, accuracy: accuracyFor(all) }), 1400)
      return
    }
    later(() => {
      const g = newRoom()
      setRoom(g)
      setPups(g.gifts)
      setMarks(new Set())
      setMistakes(0)
      setHints(0)
      setTool('pup')
      setMessage(t('place'))
      setBusy(false)
    }, 1600)
  }

  const tap = (r: number, c: number) => {
    if (over || busy) return
    const k = key(r, c)
    if (giftAt.has(k)) {
      sound.tap()
      setMessage(t('gift'))
      return
    }
    if (pupAt.has(k)) {
      // Tapping a pup always takes it away, whichever tool is picked.
      const next = without(pups, r, c)
      sound.tap()
      setPups(next)
      settle(next, t('place'))
      return
    }
    if (tool === 'mark') {
      sound.tap()
      const next = new Set(marks)
      if (next.has(k)) next.delete(k)
      else next.add(k)
      setMarks(next)
      return
    }
    const broken = ruleBroken(regions, pups, r, c)
    if (broken) {
      // The pups shake their heads, the row, column, rug or pair that shows why lights up, then the pup hops back.
      const run = ++clashRun.current
      sound.bad()
      vibrate(60)
      setMistakes((x) => x + 1)
      setStreak(0)
      setMessage(t(CLASH_KEY[broken.rule]))
      setClash({ cell: [r, c], other: broken.other, why: keys(ruleCells(regions, broken.rule, [r, c], broken.other)) })
      later(() => {
        if (clashRun.current === run) setClash(null)
      }, 1100)
      return
    }
    const next: Cell[] = [...pups, [r, c]]
    setClash(null)
    if (marks.has(k)) {
      const m = new Set(marks)
      m.delete(k)
      setMarks(m)
    }
    if (isSolved(regions, next)) {
      finishRoom(next, mistakes, hints)
      return
    }
    sound.tone(440 + next.length * 70, 0.1, 'triangle', 0.12)
    setPups(next)
    settle(next, t('place'))
  }

  const hint = () => {
    if (over || busy) return
    const h = hintFor(puzzle, pups)
    if (!h) return
    setHints(hints + 1)
    setStreak(0)
    setClash(null)
    if ('remove' in h) {
      const [r, c] = h.remove
      sound.pop()
      popAt(r, c)
      setPups(without(pups, r, c))
      setMessage(t('hintTook'))
      return
    }
    const [r, c] = h.add
    const next: Cell[] = [...pups, [r, c]]
    const m = new Set(marks)
    m.delete(key(r, c))
    setMarks(m)
    popAt(r, c)
    if (isSolved(regions, next)) {
      finishRoom(next, mistakes, hints + 1)
      return
    }
    sound.pop()
    setPups(next)
    setMessage(t('hintPut'))
  }

  const canClear = pups.length > gifts.length || marks.size > 0
  const clear = () => {
    if (over || busy || !canClear) return
    sound.tap()
    setPups(gifts)
    setMarks(new Set())
    setClash(null)
    setMessage(t('place'))
  }

  const pickTool = (next: Tool) => {
    if (over || busy) return
    sound.tap()
    setTool(next)
    setMessage(t(next === 'pup' ? 'place' : 'mark'))
  }

  const mood = clash ? 'oops' : busy ? 'happy' : 'idle'
  const blink = useBlink(mood === 'idle')
  const face: Face = mood === 'oops' ? 'sad' : mood === 'happy' ? 'happy' : blink ? 'blink' : 'idle'
  const marking = tool === 'mark'
  // The pups still in the basket: one of each coat that has no spot on the rug yet.
  const seated = new Set(pups.map(([r, c]) => regions[r][c]))
  const waiting = [...Array(n).keys()].filter((rug) => !seated.has(rug))
  const grid = `repeat(${n}, minmax(0, 1fr))`
  // A phone held sideways has little height: a slimmer tray.
  const short = window.innerHeight < 500
  return (
    <PaintedScene
      views={VIEWS}
      say={message}
      stage={{ done: done.length, total, over }}
      className="pk"
      trayHeight={short ? 96 : 140}
      tray={
        <div className="pk-tray">
          <div className="pk-basket">
            <Basket waiting={waiting.length} coats={waiting.map((rug) => rug % COATS)} />
          </div>
          <div className="pk-tools">
            <SceneTool kind="mark" label={t('toolMark')} on={marking} onPress={() => pickTool(marking ? 'pup' : 'mark')} />
            <SceneTool kind="hint" label={t('hint')} onPress={hint} />
            <SceneTool kind="restart" label={t('clear')} onPress={clear} disabled={!canClear} />
          </div>
        </div>
      }
    >
      {(view) => {
        const { rug, mama: m } = SPOTS[view]
        return (
          <>
            <div className={`pk-mama pk-${mood}`} style={worldStyle(m.x, m.bottom, m.h)}>
              {MAMA.map(([f, src]) => (
                <img key={f} src={src} alt="" draggable={false} className={f === face ? '' : 'pk-off'} />
              ))}
            </div>
            <div key={done.length} className="pk-rug" style={{ left: rug.x, top: rug.y, width: rug.size, height: rug.size }}>
              <Rug
                regions={regions}
                pups={pups}
                gifts={giftAt}
                marks={marks}
                blocked={blocked}
                why={clash?.why}
                bad={clash ? [clash.cell, clash.other] : []}
                stuck={stuckAt}
                tip={tip}
                happy={busy}
              />
              <div className="pk-cells" style={{ gridTemplateColumns: grid, gridTemplateRows: grid }}>
                {regions.map((row, r) =>
                  row.map((_, c) => (
                    <button key={key(r, c)} className="pk-cell" onPointerDown={() => tap(r, c)} aria-label={t('cell', { row: r + 1, col: c + 1 })} aria-pressed={pupAt.has(key(r, c))} />
                  )),
                )}
              </div>
            </div>
          </>
        )
      }}
    </PaintedScene>
  )
}
