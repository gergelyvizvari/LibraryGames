import { useMemo, useRef, useState } from 'react'
import { usePops, useTimeouts } from '../../kit/hooks'
import { makeRng } from '../../kit/random'
import { sound, vibrate } from '../../kit/sound'
import type { GameProps } from '../../kit/types'
import { Hud, Pops } from '../../kit/ui'
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

export default function SleepyPups({ level, seed, t, onFinish }: GameProps) {
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
  const [pops, addPop] = usePops()
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

  const popAt = (r: number, c: number, text: string, kind: 'good' | 'bad' | 'info' = 'good') =>
    addPop(text, ((c + 0.5) / n) * 100, ((r + 0.5) / n) * 100, kind)

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
    // A quiet ending: the pups fall asleep.
    sound.win()
    addPop(`+${gained}`, 50, 45)
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
      popAt(r, c, '💡', 'info')
      setPups(without(pups, r, c))
      setMessage(t('hintTook'))
      return
    }
    const [r, c] = h.add
    const next: Cell[] = [...pups, [r, c]]
    const m = new Set(marks)
    m.delete(key(r, c))
    setMarks(m)
    popAt(r, c, '💡', 'info')
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

  // Thick lines where two rugs meet, so the room reads without telling colours apart.
  const edges = (r: number, c: number) => {
    const rug = regions[r][c]
    const cls = []
    if (r > 0 && regions[r - 1][c] !== rug) cls.push('sl-et')
    if (c > 0 && regions[r][c - 1] !== rug) cls.push('sl-el')
    if (r < n - 1 && regions[r + 1][c] !== rug) cls.push('sl-eb')
    if (c < n - 1 && regions[r][c + 1] !== rug) cls.push('sl-er')
    return cls.join(' ')
  }

  const grid = `repeat(${n}, minmax(0, 1fr))`
  return (
    <div className="game sleepy-pups">
      <Hud
        items={[
          { label: t('score'), value: score },
          { label: t('room'), value: `${Math.min(done.length + (over ? 0 : 1), total)} / ${total}` },
          { label: t('pups'), value: `${pups.length} / ${n}`, highlight: streak > 0 },
        ]}
      />
      <p className={`sl-message${clash || stuck ? ' sl-warn' : ''}`}>{message}</p>
      <div className="sl-wrap">
        <div
          key={done.length}
          className={`sl-board${busy ? ' sl-solved' : ''}`}
          style={{ gridTemplateColumns: grid, gridTemplateRows: grid, ['--sl-n' as string]: n }}
        >
          {regions.map((row, r) =>
            row.map((rug, c) => {
              const k = key(r, c)
              const hopping = clash !== null && clash.cell[0] === r && clash.cell[1] === c
              const other = clash !== null && clash.other[0] === r && clash.other[1] === c
              const cls = [
                `sl-cell sl-r${rug}`,
                edges(r, c),
                clash?.why.has(k) ? 'sl-why' : '',
                hopping || other ? 'sl-bad' : '',
                !clash && stuckAt.has(k) ? 'sl-stuck' : '',
                blocked.has(k) ? 'sl-blocked' : '',
                giftAt.has(k) ? 'sl-gift' : '',
              ]
              return (
                <button key={k} className={cls.filter(Boolean).join(' ')} onPointerDown={() => tap(r, c)} aria-label={t('cell', { row: r + 1, col: c + 1 })}>
                  {hopping || pupAt.has(k) ? (
                    <span className="sl-pup">
                      🐶{busy && <i className="sl-zz" style={{ animationDelay: `${(r + c) * 90}ms` }}>💤</i>}
                    </span>
                  ) : marks.has(k) ? (
                    <span className="sl-mark">✖</span>
                  ) : null}
                </button>
              )
            }),
          )}
        </div>
        <Pops pops={pops} />
      </div>
      <div className="sl-tools">
        <button className={`sl-tool${tool === 'pup' ? ' sl-on' : ''}`} onPointerDown={() => pickTool('pup')} aria-pressed={tool === 'pup'}>
          <span>🐶</span>
          {t('toolPup')}
        </button>
        <button className={`sl-tool${tool === 'mark' ? ' sl-on' : ''}`} onPointerDown={() => pickTool('mark')} aria-pressed={tool === 'mark'}>
          <span>✖</span>
          {t('toolMark')}
        </button>
        <button className="sl-tool" onPointerDown={hint}>
          <span>💡</span>
          {t('hint')}
        </button>
        <button className="sl-tool" onPointerDown={clear} disabled={!canClear}>
          <span>🔄</span>
          {t('clear')}
        </button>
      </div>
    </div>
  )
}
